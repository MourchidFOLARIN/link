<?php

namespace Tests\Feature;

use App\Models\User;
use App\Models\Link;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Tests\TestCase;
use Laravel\Sanctum\Sanctum;
use Illuminate\Support\Facades\Queue;
use App\Jobs\ProcessLinkMetadata;

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
            'title' => 'Google'
        ]);

        $response->assertStatus(201);
        $this->assertDatabaseHas('links', [
            'url' => 'https://google.com',
            'user_id' => $user->id,
            'processing_status' => 'pending'
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
            'status' => 'active'
        ]);

        Link::create([
            'user_id' => $user2->id,
            'url' => 'https://user2.com',
            'title' => 'User 2 Link',
            'status' => 'active'
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
            'status' => 'active'
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
}
