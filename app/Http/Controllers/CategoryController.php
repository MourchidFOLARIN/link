<?php

namespace App\Http\Controllers;

use App\Models\Category;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;
use Illuminate\Support\Str;

class CategoryController extends Controller
{
    /**
     * Liste des catégories de l'utilisateur connecté.
     */
    public function index()
    {
        $categories = Category::where('user_id', Auth::id())
            ->withCount(['links' => function ($query) {
                $query->where('user_id', Auth::id())
                      ->where('status', 'active');
            }])->get();
        
        return response()->json([
            'status' => 'success',
            'data' => $categories
        ]);
    }

    /**
     * Création d'une catégorie pour l'utilisateur connecté.
     */
    public function store(Request $request)
    {
        $request->validate([
            'name' => 'required|string|max:255'
        ]);

        // Vérifier l'unicité pour cet utilisateur uniquement
        $exists = Category::where('user_id', Auth::id())
            ->where('name', $request->name)
            ->exists();

        if ($exists) {
            return response()->json([
                'status' => 'error',
                'message' => 'Vous avez déjà une catégorie avec ce nom',
                'errors' => ['name' => ['Vous avez déjà une catégorie avec ce nom']]
            ], 422);
        }

        $category = Category::create([
            'name' => $request->name,
            'slug' => Str::slug($request->name),
            'user_id' => Auth::id(),
        ]);

        return response()->json([
            'status' => 'success',
            'message' => 'Catégorie créée avec succès',
            'data' => $category
        ], 201);
    }

    /**
     * Suppression d'une catégorie de l'utilisateur connecté.
     */
    public function destroy($id)
    {
        $category = Category::where('user_id', Auth::id())->findOrFail($id);

        // Détacher tous les liens de cette catégorie avant suppression
        $category->links()->detach();
        $category->delete();

        return response()->json([
            'status' => 'success',
            'message' => 'Catégorie supprimée avec succès',
        ]);
    }
}
