<?php

namespace App\Jobs;

use App\Models\Link;
use Illuminate\Contracts\Queue\ShouldQueue;
use Illuminate\Foundation\Queue\Queueable;
use Illuminate\Support\Facades\Http;
use Illuminate\Support\Facades\Storage;
use Symfony\Component\DomCrawler\Crawler;
use Illuminate\Support\Str;

class ProcessLinkMetadata implements ShouldQueue
{
    use Queueable;

    protected $link;

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
            $response = Http::withHeaders([
                'User-Agent' => 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/91.0.4472.124 Safari/537.36'
            ])->get($this->link->url);

            if ($response->failed()) {
                $this->link->update(['processing_status' => 'failed']);
                return;
            }

            $html = $response->body();
            $crawler = new Crawler($html);

            // 1. Extraction des Meta Tags Open Graph
            $ogTitle = $this->getMetaContent($crawler, 'og:title') ?? ($crawler->filter('title')->count() > 0 ? $crawler->filter('title')->first()->text() : 'Sans titre');
            $ogDescription = $this->getMetaContent($crawler, 'og:description') ?? $this->getMetaContent($crawler, 'description');
            $ogImage = $this->getMetaContent($crawler, 'og:image');

            // 2. Téléchargement de l'image
            if ($ogImage && !$this->link->preview_image) {
                try {
                    $imageResponse = Http::get($ogImage);
                    if ($imageResponse->successful()) {
                        $imageContent = $imageResponse->body();
                        $extension = pathinfo(parse_url($ogImage, PHP_URL_PATH), PATHINFO_EXTENSION) ?: 'jpg';
                        // Nettoyer l'extension au cas où elle contiendrait des paramètres de requête
                        $extension = explode('?', $extension)[0];
                        if (!in_array($extension, ['jpg', 'jpeg', 'png', 'webp', 'gif'])) {
                            $extension = 'jpg';
                        }
                        
                        $filename = 'links/' . Str::random(40) . '.' . $extension;
                        Storage::disk('public')->put($filename, $imageContent);
                        $this->link->preview_image = $filename;
                    }
                } catch (\Exception $e) {
                    \Log::warning('Erreur téléchargement image: ' . $e->getMessage());
                }
            }

            // 3. Extraction du texte pour l'IA
            $bodyText = $crawler->filter('body')->count() > 0 ? $crawler->filter('body')->text() : '';
            $cleanText = Str::limit(strip_tags($bodyText), 2000);

            // 4. Appel à l'IA (Gemini par défaut)
            $aiData = $this->processWithAI($ogTitle, $cleanText);

            // 5. Mise à jour finale
            $this->link->update([
                'title' => ($this->link->title === 'Analyse en cours...' || !$this->link->title) ? ($aiData['title'] ?? $ogTitle) : $this->link->title,
                'description' => $this->link->description ?? ($aiData['description'] ?? $ogDescription),
                'preview_image' => $this->link->preview_image,
                'processing_status' => 'completed'
            ]);

        } catch (\Exception $e) {
            \Log::error('Erreur traitement lien: ' . $e->getMessage());
            $this->link->update(['processing_status' => 'failed']);
        }
    }

    private function getMetaContent($crawler, $property)
    {
        try {
            $filtered = $crawler->filter("meta[property='{$property}'], meta[name='{$property}']");
            return $filtered->count() > 0 ? $filtered->attr('content') : null;
        } catch (\Exception $e) {
            return null;
        }
    }

    private function processWithAI($currentTitle, $text)
    {
        $apiKey = config('services.gemini.key');
        if (!$apiKey) return null;

        try {
            $prompt = "Voici le contenu d'une page web. 
            Titre actuel: {$currentTitle}
            Contenu: {$text}
            
            Génère un titre optimisé et une description résumée (2 phrases max).
            Réponds EXCLUSIVEMENT au format JSON comme ceci:
            {
                \"title\": \"Le titre\",
                \"description\": \"La description\"
            }";

            $response = Http::post("https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash:generateContent?key={$apiKey}", [
                'contents' => [
                    ['parts' => [['text' => $prompt]]]
                ]
            ]);

            if ($response->successful()) {
                $data = $response->json();
                $rawJson = $data['candidates'][0]['content']['parts'][0]['text'] ?? '';
                $json = trim(str_replace(['```json', '```'], '', $rawJson));
                return json_decode($json, true);
            }
        } catch (\Exception $e) {
            \Log::warning('IA Error: ' . $e->getMessage());
        }

        return null;
    }
}
