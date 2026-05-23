<?php

namespace App\Http\Controllers;

use App\Jobs\ProcessLinkMetadata;
use App\Models\Link;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;
use Illuminate\Support\Facades\Storage;
use Illuminate\Validation\Rule;

class LinkController extends Controller
{
    private const ALLOWED_STATUSES = ['active', 'inactive', 'archived'];

    private const SORT_COLUMNS = [
        'created_at' => 'created_at',
        'updated_at' => 'updated_at',
        'title' => 'title',
        'views_count' => 'views_count',
        'last_viewed_at' => 'last_viewed_at',
        'popularity' => 'views_count',
    ];

    /**
     * Liste des liens avec recherche et filtrage.
     */
    public function index(Request $request)
    {
        $validated = $request->validate([
            'search' => 'nullable|string|max:255',
            'category' => 'nullable|string|max:255',
            'status' => ['nullable', Rule::in(self::ALLOWED_STATUSES)],
            'sort_by' => ['nullable', Rule::in(array_keys(self::SORT_COLUMNS))],
            'order' => ['nullable', Rule::in(['asc', 'desc'])],
            'per_page' => 'nullable|integer|min:1|max:50',
            'page' => 'nullable|integer|min:1',
        ]);

        $query = Link::with(['user', 'categories'])->where('user_id', Auth::id());

        if (! empty($validated['search'])) {
            $search = $validated['search'];
            $query->where(function ($q) use ($search) {
                $q->where('title', 'like', "%{$search}%")
                    ->orWhere('description', 'like', "%{$search}%")
                    ->orWhere('url', 'like', "%{$search}%");
            });
        }

        if (! empty($validated['category'])) {
            $category = $validated['category'];
            $query->whereHas('categories', function ($q) use ($category) {
                $q->where('slug', $category);

                if (ctype_digit($category)) {
                    $q->orWhere('categories.id', (int) $category);
                }
            });
        }

        $query->where('status', $validated['status'] ?? 'active');

        $sortBy = $validated['sort_by'] ?? 'created_at';
        $order = $validated['order'] ?? 'desc';
        $query->orderBy(self::SORT_COLUMNS[$sortBy], $order);

        $links = $query->paginate($validated['per_page'] ?? 15);

        return response()->json([
            'status' => 'success',
            'data' => $links,
        ]);
    }

    /**
     * Ajout d'un lien (avec upload d'image optionnel).
     */
    public function store(Request $request)
    {
        $validated = $request->validate([
            'url' => 'required|url:http,https|max:2048',
            'title' => 'nullable|string|max:255',
            'description' => 'nullable|string',
            'preview_image_file' => 'nullable|image|mimes:jpeg,png,jpg,gif,webp|max:5120',
            'status' => ['nullable', Rule::in(self::ALLOWED_STATUSES)],
            'categories' => 'nullable|array',
            'categories.*' => 'integer|exists:categories,id',
        ]);

        $sourceDomain = parse_url($validated['url'], PHP_URL_HOST);

        $previewImage = null;
        if ($request->hasFile('preview_image_file')) {
            $previewImage = $request->file('preview_image_file')->store('links', 'public');
        }

        $link = Link::create([
            'user_id' => Auth::id(),
            'url' => $validated['url'],
            'title' => $validated['title'] ?? 'Analyse en cours...',
            'description' => $validated['description'] ?? null,
            'preview_image' => $previewImage,
            'source_domain' => $sourceDomain,
            'status' => $validated['status'] ?? 'active',
            'processing_status' => $previewImage && ! empty($validated['title']) ? 'completed' : 'pending',
        ]);

        if (array_key_exists('categories', $validated)) {
            $link->categories()->sync($validated['categories'] ?? []);
        }

        if ($link->processing_status === 'pending') {
            ProcessLinkMetadata::dispatch($link);
        }

        return response()->json([
            'status' => 'success',
            'message' => 'Lien ajouté avec succès',
            'data' => $link->load('categories'),
        ], 201);
    }

    /**
     * Consultation détaillée d'un lien (avec tracking historique).
     */
    public function show($id)
    {
        $link = Link::with(['user', 'categories'])->findOrFail($id);

        if ($link->user_id !== Auth::id()) {
            return response()->json([
                'status' => 'error',
                'message' => 'Accès non autorisé',
            ], 403);
        }

        $link->increment('views_count');
        $link->update(['last_viewed_at' => now()]);

        return response()->json([
            'status' => 'success',
            'data' => $link,
        ]);
    }

    /**
     * Edition d'un lien existant (titre, description, image, catégories...).
     */
    public function update(Request $request, $id)
    {
        $link = Link::findOrFail($id);

        if ($link->user_id !== Auth::id()) {
            return response()->json([
                'status' => 'error',
                'message' => "Vous n'êtes pas l'auteur de ce lien",
            ], 403);
        }

        $validated = $request->validate([
            'url' => 'sometimes|url:http,https|max:2048',
            'title' => 'sometimes|string|max:255',
            'description' => 'nullable|string',
            'preview_image_file' => 'nullable|image|mimes:jpeg,png,jpg,gif,webp|max:5120',
            'remove_image' => 'nullable|boolean',
            'status' => ['nullable', Rule::in(self::ALLOWED_STATUSES)],
            'categories' => 'nullable|array',
            'categories.*' => 'integer|exists:categories,id',
        ]);

        if ($request->hasFile('preview_image_file')) {
            if ($link->preview_image) {
                Storage::disk('public')->delete($link->preview_image);
            }

            $link->preview_image = $request->file('preview_image_file')->store('links', 'public');
        } elseif ($request->boolean('remove_image')) {
            if ($link->preview_image) {
                Storage::disk('public')->delete($link->preview_image);
            }

            $link->preview_image = null;
        }

        if (array_key_exists('url', $validated)) {
            $link->source_domain = parse_url($validated['url'], PHP_URL_HOST);
            $link->url = $validated['url'];
        }

        foreach (['title', 'description', 'status'] as $field) {
            if (array_key_exists($field, $validated)) {
                $link->{$field} = $validated[$field];
            }
        }

        $link->save();

        if (array_key_exists('categories', $validated)) {
            $link->categories()->sync($validated['categories'] ?? []);
        }

        return response()->json([
            'status' => 'success',
            'message' => 'Lien mis à jour avec succès',
            'data' => $link->load('categories'),
        ]);
    }

    /**
     * Historique des liens consultés (triés par dernière consultation).
     */
    public function history(Request $request)
    {
        $validated = $request->validate([
            'per_page' => 'nullable|integer|min:1|max:50',
            'page' => 'nullable|integer|min:1',
        ]);

        $links = Link::with('categories')
            ->where('user_id', Auth::id())
            ->where('status', 'active')
            ->whereNotNull('last_viewed_at')
            ->orderBy('last_viewed_at', 'desc')
            ->paginate($validated['per_page'] ?? 20);

        return response()->json([
            'status' => 'success',
            'data' => $links,
        ]);
    }

    /**
     * Suppression logique.
     */
    public function destroy($id)
    {
        $link = Link::findOrFail($id);

        if ($link->user_id !== Auth::id()) {
            return response()->json([
                'status' => 'error',
                'message' => "Vous n'êtes pas l'auteur de ce lien",
            ], 403);
        }

        $link->update(['status' => 'inactive']);

        return response()->json([
            'status' => 'success',
            'message' => 'Lien déplacé dans la corbeille',
        ]);
    }

    /**
     * Liste des liens supprimés (corbeille).
     */
    public function trash(Request $request)
    {
        $validated = $request->validate([
            'per_page' => 'nullable|integer|min:1|max:50',
            'page' => 'nullable|integer|min:1',
        ]);

        $links = Link::where('user_id', Auth::id())
            ->where('status', 'inactive')
            ->paginate($validated['per_page'] ?? 15);

        return response()->json([
            'status' => 'success',
            'data' => $links,
        ]);
    }

    /**
     * Restaurer un lien depuis la corbeille.
     */
    public function restore($id)
    {
        $link = Link::where('user_id', Auth::id())->where('status', 'inactive')->findOrFail($id);
        $link->update(['status' => 'active']);

        return response()->json([
            'status' => 'success',
            'message' => 'Lien restauré avec succès',
            'data' => $link,
        ]);
    }

    /**
     * Suppression définitive d'un lien.
     */
    public function forceDelete($id)
    {
        $link = Link::where('user_id', Auth::id())->findOrFail($id);

        if ($link->preview_image) {
            Storage::disk('public')->delete($link->preview_image);
        }

        $link->forceDelete();

        return response()->json([
            'status' => 'success',
            'message' => 'Lien supprimé définitivement',
        ]);
    }
}
