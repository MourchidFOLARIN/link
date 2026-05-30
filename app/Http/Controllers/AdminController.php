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

        // 3. Métriques enrichies pour les cartes
        $uniqueDomains = Link::where('status', 'active')
            ->whereNotNull('source_domain')
            ->distinct('source_domain')
            ->count('source_domain');

        $aiSuccessRate = ($aiCompleted + $aiFailed) > 0
            ? round(($aiCompleted / ($aiCompleted + $aiFailed)) * 100, 1)
            : 0;

        $avgLinksPerUser = $totalUsers > 0
            ? round($activeLinks / $totalUsers, 1)
            : 0;

        return response()->json([
            'status' => 'success',
            'data' => [
                'metrics' => [
                    'users_count'        => $totalUsers,
                    'categories_count'   => $totalCategories,
                    'links_total'        => $totalLinks,
                    'links_active'       => $activeLinks,
                    'links_trashed'      => $trashedLinks,
                    'unique_domains'     => $uniqueDomains,
                    'ai_success_rate'    => $aiSuccessRate,
                    'avg_links_per_user' => $avgLinksPerUser,
                ],
                'ai_status' => [
                    'pending'   => $aiPending,
                    'completed' => $aiCompleted,
                    'failed'    => $aiFailed,
                ],
            ],
        ]);
    }

    /**
     * Liste paginée des utilisateurs pour le backoffice.
     */
    public function getUsers(Request $request)
    {
        $perPage = min((int) $request->input('per_page', 8), 50);

        $users = User::withCount(['links' => function ($q) {
            $q->where('status', 'active');
        }])
        ->orderBy('created_at', 'desc')
        ->paginate($perPage);

        $users->getCollection()->transform(function ($user) {
            return [
                'id'          => $user->id,
                'name'        => $user->name,
                'email'       => $user->email,
                'profession'  => $user->profession,
                'avatar_url'  => $user->avatar_url,
                'links_count' => $user->links_count,
                'is_admin'    => $user->is_admin,
                'created_at'  => $user->created_at->toISOString(),
            ];
        });

        return response()->json([
            'status' => 'success',
            'data'   => $users,
        ]);
    }

    /**
     * Liste paginée des liens pour le backoffice.
     */
    public function getLinks(Request $request)
    {
        $perPage = min((int) $request->input('per_page', 10), 50);

        $links = Link::with('user:id,name')
            ->orderBy('created_at', 'desc')
            ->paginate($perPage);

        $links->getCollection()->transform(function ($link) {
            return [
                'id'                => $link->id,
                'url'               => $link->url,
                'title'             => $link->title,
                'source_domain'     => $link->source_domain,
                'status'            => $link->status,
                'processing_status' => $link->processing_status,
                'user_name'         => $link->user ? $link->user->name : 'Inconnu',
                'created_at'        => $link->created_at->toISOString(),
            ];
        });

        return response()->json([
            'status' => 'success',
            'data'   => $links,
        ]);
    }
}
