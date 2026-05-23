<?php

namespace Tests\Feature;

use App\Jobs\ProcessLinkMetadata;
use App\Models\Link;
use App\Models\User;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Illuminate\Support\Facades\Http;
use Illuminate\Support\Facades\Queue;
use Laravel\Sanctum\Sanctum;
use Tests\TestCase;

class LinkApiTest extends TestCase
{
    use RefreshDatabase;

    public function test_user_can_create_link_and_it_dispatches_job()
    {
        Queue::fake();
        $user = User::factory()->create();
        Sanctum::actingAs($user);

        $response = $this->postJson('/api/links', [
            'url' => 'https://google.com',
            'title' => 'Google',
        ]);

        $response->assertStatus(201);
        $this->assertDatabaseHas('links', [
            'url' => 'https://google.com',
            'user_id' => $user->id,
            'processing_status' => 'pending',
        ]);

        Queue::assertPushed(ProcessLinkMetadata::class);
    }

    public function test_user_can_only_see_their_own_links()
    {
        $user1 = User::factory()->create();
        $user2 = User::factory()->create();

        Link::create([
            'user_id' => $user1->id,
            'url' => 'https://user1.com',
            'title' => 'User 1 Link',
            'status' => 'active',
        ]);

        Link::create([
            'user_id' => $user2->id,
            'url' => 'https://user2.com',
            'title' => 'User 2 Link',
            'status' => 'active',
        ]);

        Sanctum::actingAs($user1);

        $response = $this->getJson('/api/links');

        $response->assertStatus(200)
            ->assertJsonCount(1, 'data.data')
            ->assertJsonPath('data.data.0.url', 'https://user1.com');
    }

    public function test_link_can_be_moved_to_trash_and_restored()
    {
        $user = User::factory()->create();
        Sanctum::actingAs($user);

        $link = Link::create([
            'user_id' => $user->id,
            'url' => 'https://test.com',
            'title' => 'Test Link',
            'status' => 'active',
        ]);

        // Soft delete (to trash)
        $this->deleteJson("/api/links/{$link->id}")->assertStatus(200);
        $this->assertEquals('inactive', $link->fresh()->status);

        // Check index doesn't show it
        $this->getJson('/api/links')->assertJsonCount(0, 'data.data');

        // Check trash shows it
        $this->getJson('/api/links/trash')->assertJsonCount(1, 'data.data');

        // Restore
        $this->postJson("/api/links/{$link->id}/restore")->assertStatus(200);
        $this->assertEquals('active', $link->fresh()->status);
    }

    public function test_link_index_rejects_unsafe_sort_parameters()
    {
        $user = User::factory()->create();
        Sanctum::actingAs($user);

        $this->getJson('/api/links?sort_by=id;drop table users&order=sideways')
            ->assertStatus(422);
    }

    public function test_link_index_limits_page_size()
    {
        $user = User::factory()->create();
        Sanctum::actingAs($user);

        $this->getJson('/api/links?per_page=500')
            ->assertStatus(422);
    }

    public function test_metadata_job_rejects_private_network_urls()
    {
        Http::fake();

        $user = User::factory()->create();
        $link = Link::create([
            'user_id' => $user->id,
            'url' => 'http://127.0.0.1/internal',
            'title' => 'Internal',
            'status' => 'active',
            'processing_status' => 'pending',
        ]);

        (new ProcessLinkMetadata($link))->handle();

        $this->assertEquals('failed', $link->fresh()->processing_status);
        Http::assertNothingSent();
    }
}
