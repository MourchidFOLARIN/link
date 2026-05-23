<?php

namespace App\Http\Controllers;

use App\Models\User;
use App\Models\Link;
use App\Models\Category;
use Illuminate\Http\Request;

class AdminController extends Controller
{
    /**
     * Récupère les statistiques globales pour le tableau de bord d'administration.
     */
    public function getStats()
    {
        // 1. Métriques globales
        $totalUsers = User::count();
        $totalCategories = Category::count();
        
        $totalLinks = Link::withTrashed()->count();
        $activeLinks = Link::where('status', 'active')->count();
        $trashedLinks = Link::where('status', 'inactive')->count();

        // 2. Traitement IA des liens
        $aiPending = Link::where('processing_status', 'pending')->count();
        $aiCompleted = Link::where('processing_status', 'completed')->count();
        $aiFailed = Link::where('processing_status', 'failed')->count();

        // 3. Utilisateurs récents avec volume de liens
        $recentUsers = User::withCount(['links' => function ($query) {
            $query->where('status', 'active');
        }])
        ->orderBy('created_at', 'desc')
        ->take(10)
        ->get()
        ->map(function ($user) {
            return [
                'id' => $user->id,
                'name' => $user->name,
                'email' => $user->email,
                'profession' => $user->profession,
                'avatar_url' => $user->avatar_url,
                'links_count' => $user->links_count,
                'created_at' => $user->created_at->toISOString(),
            ];
        });

        // 4. Liens récents ajoutés sur la plateforme
        $recentLinks = Link::with('user:id,name')
        ->orderBy('created_at', 'desc')
        ->take(15)
        ->get()
        ->map(function ($link) {
            return [
                'id' => $link->id,
                'url' => $link->url,
                'title' => $link->title,
                'source_domain' => $link->source_domain,
                'status' => $link->status,
                'processing_status' => $link->processing_status,
                'user_name' => $link->user ? $link->user->name : 'Inconnu',
                'created_at' => $link->created_at->toISOString(),
            ];
        });

        return response()->json([
            'status' => 'success',
            'data' => [
                'metrics' => [
                    'users_count' => $totalUsers,
                    'categories_count' => $totalCategories,
                    'links_total' => $totalLinks,
                    'links_active' => $activeLinks,
                    'links_trashed' => $trashedLinks,
                ],
                'ai_status' => [
                    'pending' => $aiPending,
                    'completed' => $aiCompleted,
                    'failed' => $aiFailed,
                ],
                'recent_users' => $recentUsers,
                'recent_links' => $recentLinks,
            ],
        ]);
    }
}
