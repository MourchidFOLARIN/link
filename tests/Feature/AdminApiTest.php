<?php

namespace Tests\Feature;

use App\Models\User;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Laravel\Sanctum\Sanctum;
use Tests\TestCase;

class AdminApiTest extends TestCase
{
    use RefreshDatabase;

    public function test_regular_user_cannot_access_admin_stats(): void
    {
        $user = User::factory()->create(['is_admin' => false]);
        Sanctum::actingAs($user);

        $this->getJson('/api/admin/stats')
            ->assertStatus(403);
    }

    public function test_unauthenticated_user_cannot_access_admin_stats(): void
    {
        $this->getJson('/api/admin/stats')
            ->assertStatus(401);
    }

    public function test_admin_user_can_access_stats(): void
    {
        $admin = User::factory()->create(['is_admin' => true]);
        Sanctum::actingAs($admin);

        // Créer quelques utilisateurs et liens pour les stats
        User::factory()->count(3)->create();

        $response = $this->getJson('/api/admin/stats');

        $response->assertStatus(200)
            ->assertJsonStructure([
                'status',
                'data' => [
                    'metrics' => [
                        'users_count',
                        'categories_count',
                        'links_total',
                        'links_active',
                        'links_trashed',
                    ],
                    'ai_status' => [
                        'pending',
                        'completed',
                        'failed',
                    ],
                    'recent_users',
                    'recent_links',
                ],
            ]);

        // 4 utilisateurs au total (1 admin + 3 créés)
        $this->assertEquals(4, $response->json('data.metrics.users_count'));
    }
}
