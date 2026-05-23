<?php

namespace App\Http\Controllers;

use App\Models\Link;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;
use Illuminate\Support\Facades\Storage;
use Illuminate\Validation\Rule;

class LinkController extends Controller
{
    /**
     * Liste des liens avec recherche et filtrage.
     */
    public function index(Request $request)
    {
        $query = Link::with(['user', 'categories'])->where('user_id', Auth::id());

        // Recherche par titre ou description
        if ($request->has('search')) {
            $search = $request->search;
            $query->where(function ($q) use ($search) {
                $q->where('title', 'like', "%$search%")
                  ->orWhere('description', 'like', "%$search%")
                  ->orWhere('url', 'like', "%$search%");
            });
        }

        // Filtrage par catégorie
        if ($request->has('category')) {
            $query->whereHas('categories', function ($q) use ($request) {
                $q->where('slug', $request->category)
                  ->orWhere('categories.id', $request->category);
            });
        }

        // Filtrage par statut (par défaut 'active')
        $status = $request->get('status', 'active');
        $query->where('status', $status);

        // Tri (Date, Popularité)
        $sortBy = $request->get('sort_by', 'created_at');
        $order = $request->get('order', 'desc');

        if ($sortBy === 'popularity') {
            $query->orderBy('views_count', $order);
        } else {
            $query->orderBy($sortBy, $order);
        }

        $links = $query->paginate($request->get('per_page', 15));

        return response()->json([
            'status' => 'success',
            'data' => $links
        ]);
    }

    /**
     * Ajout d'un lien (avec upload d'image optionnel).
     */
    public function store(Request $request)
    {
        $request->validate([
            'url' => 'required|url',
            'title' => 'nullable|string|max:255',
            'description' => 'nullable|string',
            'preview_image_file' => 'nullable|image|mimes:jpeg,png,jpg,gif,webp|max:5120',
            'status' => ['nullable', Rule::in(['active', 'inactive', 'archived'])],
            'categories' => 'nullable|array',
            'categories.*' => 'exists:categories,id'
        ]);

        $sourceDomain = parse_url($request->url, PHP_URL_HOST);

        // Gestion de l'image uploadée manuellement
        $previewImage = null;
        if ($request->hasFile('preview_image_file')) {
            $previewImage = $request->file('preview_image_file')->store('links', 'public');
        }

        $link = Link::create([
            'user_id' => Auth::id(),
            'url' => $request->url,
            'title' => $request->title ?? 'Analyse en cours...',
            'description' => $request->description,
            'preview_image' => $previewImage,
            'source_domain' => $sourceDomain,
            'status' => $request->status ?? 'active',
            'processing_status' => $previewImage && $request->title ? 'completed' : 'pending',
        ]);

        if ($request->has('categories')) {
            $link->categories()->sync($request->categories);
        }

        // Si tout n'a pas été rempli manuellement, lancer le job IA
        if ($link->processing_status === 'pending') {
            \App\Jobs\ProcessLinkMetadata::dispatch($link);
        }

        return response()->json([
            'status' => 'success',
            'message' => 'Lien ajouté avec succès',
            'data' => $link->load('categories')
        ], 201);
    }

    /**
     * Consultation détaillée d'un lien (avec tracking historique).
     */
    public function show($id)
    {
        $link = Link::with(['user', 'categories'])->findOrFail($id);

        // Vérification de la visibilité
        if ($link->user_id !== Auth::id()) {
            return response()->json([
                'status' => 'error',
                'message' => 'Accès non autorisé'
            ], 403);
        }

        // Incrémentation des vues + mise à jour de la date de dernière consultation
        $link->increment('views_count');
        $link->update(['last_viewed_at' => now()]);

        return response()->json([
            'status' => 'success',
            'data' => $link
        ]);
    }

    /**
     * Édition d'un lien existant (titre, description, image, catégories...).
     */
    public function update(Request $request, $id)
    {
        $link = Link::findOrFail($id);

        if ($link->user_id !== Auth::id()) {
            return response()->json([
                'status' => 'error',
                'message' => 'Vous n\'êtes pas l\'auteur de ce lien'
            ], 403);
        }

        $request->validate([
            'url' => 'sometimes|url',
            'title' => 'sometimes|string|max:255',
            'description' => 'nullable|string',
            'preview_image_file' => 'nullable|image|mimes:jpeg,png,jpg,gif,webp|max:5120',
            'remove_image' => 'nullable|boolean',
            'status' => ['nullable', Rule::in(['active', 'inactive', 'archived'])],
            'categories' => 'nullable|array',
            'categories.*' => 'exists:categories,id'
        ]);

        // Gestion de l'image
        if ($request->hasFile('preview_image_file')) {
            // Supprimer l'ancienne image
            if ($link->preview_image) {
                Storage::disk('public')->delete($link->preview_image);
            }
            $link->preview_image = $request->file('preview_image_file')->store('links', 'public');
        } elseif ($request->boolean('remove_image')) {
            // Supprimer l'image sans remplacement
            if ($link->preview_image) {
                Storage::disk('public')->delete($link->preview_image);
            }
            $link->preview_image = null;
        }

        // Mise à jour du domaine si l'URL change
        if ($request->has('url')) {
            $link->source_domain = parse_url($request->url, PHP_URL_HOST);
            $link->url = $request->url;
        }

        // Mise à jour des champs texte
        if ($request->has('title')) {
            $link->title = $request->title;
        }
        if ($request->has('description')) {
            $link->description = $request->description;
        }
        if ($request->has('status')) {
            $link->status = $request->status;
        }

        $link->save();

        // Synchro des catégories
        if ($request->has('categories')) {
            $link->categories()->sync($request->categories);
        }

        return response()->json([
            'status' => 'success',
            'message' => 'Lien mis à jour avec succès',
            'data' => $link->load('categories')
        ]);
    }

    /**
     * Historique des liens consultés (triés par dernière consultation).
     */
    public function history(Request $request)
    {
        $links = Link::with('categories')
            ->where('user_id', Auth::id())
            ->where('status', 'active')
            ->whereNotNull('last_viewed_at')
            ->orderBy('last_viewed_at', 'desc')
            ->paginate($request->get('per_page', 20));

        return response()->json([
            'status' => 'success',
            'data' => $links
        ]);
    }

    /**
     * Suppression logique (Soft Delete).
     */
    public function destroy($id)
    {
        $link = Link::findOrFail($id);

        if ($link->user_id !== Auth::id()) {
            return response()->json([
                'status' => 'error',
                'message' => 'Vous n\'êtes pas l\'auteur de ce lien'
            ], 403);
        }

        $link->update(['status' => 'inactive']);

        return response()->json([
            'status' => 'success',
            'message' => 'Lien déplacé dans la corbeille'
        ]);
    }

    /**
     * Liste des liens supprimés (corbeille).
     */
    public function trash(Request $request)
    {
        $links = Link::where('user_id', Auth::id())
            ->where('status', 'inactive')
            ->paginate($request->get('per_page', 15));

        return response()->json([
            'status' => 'success',
            'data' => $links
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
            'data' => $link
        ]);
    }

    /**
     * Suppression définitive d'un lien.
     */
    public function forceDelete($id)
    {
        $link = Link::where('user_id', Auth::id())->findOrFail($id);
        
        // Suppression physique du fichier preview
        if ($link->preview_image) {
            Storage::disk('public')->delete($link->preview_image);
        }

        $link->forceDelete();

        return response()->json([
            'status' => 'success',
            'message' => 'Lien supprimé définitivement'
        ]);
    }
}
