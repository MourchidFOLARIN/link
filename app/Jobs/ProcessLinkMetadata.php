<?php

namespace App\Jobs;

use App\Models\Link;
use Illuminate\Contracts\Queue\ShouldQueue;
use Illuminate\Foundation\Queue\Queueable;
use Illuminate\Support\Facades\Http;
use Illuminate\Support\Facades\Log;
use Illuminate\Support\Facades\Storage;
use Illuminate\Support\Str;
use Symfony\Component\DomCrawler\Crawler;

class ProcessLinkMetadata implements ShouldQueue
{
    use Queueable;

    private const MAX_IMAGE_BYTES = 5 * 1024 * 1024;

    protected Link $link;

    /**
     * Create a new job instance.
     */
    public function __construct(Link $link)
    {
        $this->link = $link;
    }

    /**
     * Execute the job.
     */
    public function handle(): void
    {
        try {
            if (! $this->isSafePublicUrl($this->link->url)) {
                $this->link->update(['processing_status' => 'failed']);

                return;
            }

            $response = Http::timeout(8)
                ->connectTimeout(5)
                ->withHeaders([
                    'User-Agent' => 'Mozilla/5.0 (compatible; ExellenceLink/1.0)',
                    'Accept' => 'text/html,application/xhtml+xml',
                ])
                ->get($this->link->url);

            if ($response->failed()) {
                $this->link->update(['processing_status' => 'failed']);

                return;
            }

            $html = $response->body();
            $crawler = new Crawler($html);

            $ogTitle = $this->getMetaContent($crawler, 'og:title')
                ?? ($crawler->filter('title')->count() > 0 ? $crawler->filter('title')->first()->text() : 'Sans titre');
            $ogDescription = $this->getMetaContent($crawler, 'og:description')
                ?? $this->getMetaContent($crawler, 'description');
            $ogImage = $this->resolveUrl($this->link->url, $this->getMetaContent($crawler, 'og:image'));

            if ($ogImage && ! $this->link->preview_image) {
                $this->downloadPreviewImage($ogImage);
            }

            $bodyText = $crawler->filter('body')->count() > 0 ? $crawler->filter('body')->text() : '';
            $cleanText = Str::limit(strip_tags($bodyText), 2000);
            $aiData = $this->processWithAI($ogTitle, $cleanText);

            $this->link->update([
                'title' => ($this->link->title === 'Analyse en cours...' || ! $this->link->title)
                    ? ($aiData['title'] ?? $ogTitle)
                    : $this->link->title,
                'description' => $this->link->description ?? ($aiData['description'] ?? $ogDescription),
                'preview_image' => $this->link->preview_image,
                'processing_status' => 'completed',
            ]);
        } catch (\Throwable $e) {
            Log::error('Erreur traitement lien: '.$e->getMessage());
            $this->link->update(['processing_status' => 'failed']);
        }
    }

    private function downloadPreviewImage(string $url): void
    {
        if (! $this->isSafePublicUrl($url)) {
            return;
        }

        try {
            $imageResponse = Http::timeout(8)
                ->connectTimeout(5)
                ->withHeaders(['Accept' => 'image/*'])
                ->get($url);

            if (! $imageResponse->successful()) {
                return;
            }

            $contentType = strtolower((string) $imageResponse->header('Content-Type'));
            if ($contentType && ! str_starts_with($contentType, 'image/')) {
                return;
            }

            $imageContent = $imageResponse->body();
            if (strlen($imageContent) > self::MAX_IMAGE_BYTES) {
                return;
            }

            $extension = strtolower(pathinfo(parse_url($url, PHP_URL_PATH) ?? '', PATHINFO_EXTENSION)) ?: 'jpg';
            if (! in_array($extension, ['jpg', 'jpeg', 'png', 'webp', 'gif'], true)) {
                $extension = 'jpg';
            }

            $filename = 'links/'.Str::random(40).'.'.$extension;
            Storage::disk('public')->put($filename, $imageContent);
            $this->link->preview_image = $filename;
        } catch (\Throwable $e) {
            Log::warning('Erreur téléchargement image: '.$e->getMessage());
        }
    }

    private function getMetaContent(Crawler $crawler, string $property): ?string
    {
        try {
            $filtered = $crawler->filter("meta[property='{$property}'], meta[name='{$property}']");

            return $filtered->count() > 0 ? $filtered->attr('content') : null;
        } catch (\Throwable) {
            return null;
        }
    }

    private function processWithAI(string $currentTitle, string $text): ?array
    {
        $apiKey = config('services.gemini.key');
        if (! $apiKey) {
            return null;
        }

        try {
            $prompt = "Voici le contenu d'une page web.
Titre actuel: {$currentTitle}
Contenu: {$text}

Génère un titre optimisé et une description résumée (2 phrases max).
Réponds exclusivement au format JSON comme ceci:
{
    \"title\": \"Le titre\",
    \"description\": \"La description\"
}";

            $response = Http::timeout(15)->post(
                "https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash:generateContent?key={$apiKey}",
                [
                    'contents' => [
                        ['parts' => [['text' => $prompt]]],
                    ],
                ]
            );

            if (! $response->successful()) {
                return null;
            }

            $data = $response->json();
            $rawJson = $data['candidates'][0]['content']['parts'][0]['text'] ?? '';
            $json = trim(str_replace(['```json', '```'], '', $rawJson));
            $decoded = json_decode($json, true);

            return is_array($decoded) ? $decoded : null;
        } catch (\Throwable $e) {
            Log::warning('IA Error: '.$e->getMessage());
        }

        return null;
    }

    private function resolveUrl(string $baseUrl, ?string $url): ?string
    {
        if (! $url) {
            return null;
        }

        if (parse_url($url, PHP_URL_SCHEME)) {
            return $url;
        }

        $base = parse_url($baseUrl);
        if (empty($base['scheme']) || empty($base['host'])) {
            return null;
        }

        if (str_starts_with($url, '//')) {
            return $base['scheme'].':'.$url;
        }

        if (str_starts_with($url, '/')) {
            return $base['scheme'].'://'.$base['host'].$url;
        }

        $path = $base['path'] ?? '/';
        $directory = rtrim(str_replace('\\', '/', dirname($path)), '/');
        $directory = $directory === '' || $directory === '.' ? '' : '/'.ltrim($directory, '/');

        return $base['scheme'].'://'.$base['host'].$directory.'/'.ltrim($url, '/');
    }

    private function isSafePublicUrl(string $url): bool
    {
        $parts = parse_url($url);
        $scheme = strtolower($parts['scheme'] ?? '');
        $host = trim(strtolower($parts['host'] ?? ''), '[]');

        if (! in_array($scheme, ['http', 'https'], true) || $host === '') {
            return false;
        }

        if ($host === 'localhost' || str_ends_with($host, '.localhost')) {
            return false;
        }

        if (filter_var($host, FILTER_VALIDATE_IP)) {
            return $this->isPublicIp($host);
        }

        $ips = gethostbynamel($host);
        if (! $ips) {
            return false;
        }

        foreach ($ips as $ip) {
            if (! $this->isPublicIp($ip)) {
                return false;
            }
        }

        return true;
    }

    private function isPublicIp(string $ip): bool
    {
        return (bool) filter_var(
            $ip,
            FILTER_VALIDATE_IP,
            FILTER_FLAG_NO_PRIV_RANGE | FILTER_FLAG_NO_RES_RANGE
        );
    }
}
