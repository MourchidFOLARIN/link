<?php

namespace Tests\Feature;

use App\Models\User;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Laravel\Socialite\Facades\Socialite;
use Laravel\Socialite\Two\User as SocialiteUser;
use Tests\TestCase;

class GoogleAuthTest extends TestCase
{
    use RefreshDatabase;

    public function test_google_redirect_returns_redirect(): void
    {
        // Mock Socialite redirect
        $provider = $this->getMockBuilder(\Laravel\Socialite\Two\GoogleProvider::class)
            ->disableOriginalConstructor()
            ->getMock();

        $provider->method('stateless')->willReturn($provider);
        $provider->method('redirect')->willReturn(redirect('https://accounts.google.com/o/oauth2/auth'));

        Socialite::shouldReceive('driver')->with('google')->andReturn($provider);

        $response = $this->get('/api/auth/google/redirect');

        $response->assertRedirect('https://accounts.google.com/o/oauth2/auth');
    }

    public function test_google_callback_creates_user_with_name_and_avatar_when_not_exists(): void
    {
        // Mock Socialite User details
        $googleUser = $this->getMockBuilder(SocialiteUser::class)
            ->disableOriginalConstructor()
            ->getMock();

        $googleUser->method('getId')->willReturn('google-123456');
        $googleUser->method('getName')->willReturn('Jean Dupont');
        $googleUser->method('getEmail')->willReturn('jean.dupont@gmail.com');
        $googleUser->method('getAvatar')->willReturn('https://lh3.googleusercontent.com/jean-avatar');

        $provider = $this->getMockBuilder(\Laravel\Socialite\Two\GoogleProvider::class)
            ->disableOriginalConstructor()
            ->getMock();

        $provider->method('stateless')->willReturn($provider);
        $provider->method('user')->willReturn($googleUser);

        Socialite::shouldReceive('driver')->with('google')->andReturn($provider);

        // Envoyer la requête callback
        $response = $this->get('/api/auth/google/callback');

        // Vérifier la création de l'utilisateur avec photo et nom Google
        $this->assertDatabaseHas('users', [
            'email' => 'jean.dupont@gmail.com',
            'name' => 'Jean Dupont',
            'google_id' => 'google-123456',
            'avatar' => 'https://lh3.googleusercontent.com/jean-avatar',
        ]);

        $user = User::where('email', 'jean.dupont@gmail.com')->first();
        $this->assertNull($user->password); // Le mot de passe doit être null (non requis pour OAuth)

        // Vérifier la redirection avec le token Sanctum
        $response->assertRedirectContains('/login?token=');
    }

    public function test_google_callback_authenticates_existing_user(): void
    {
        // Créer un utilisateur existant (sans ID Google)
        $user = User::factory()->create([
            'email' => 'jean.dupont@gmail.com',
            'name' => 'Jean Ancien',
            'google_id' => null,
            'avatar' => null,
        ]);

        // Mock Socialite User
        $googleUser = $this->getMockBuilder(SocialiteUser::class)
            ->disableOriginalConstructor()
            ->getMock();

        $googleUser->method('getId')->willReturn('google-123456');
        $googleUser->method('getName')->willReturn('Jean Dupont');
        $googleUser->method('getEmail')->willReturn('jean.dupont@gmail.com');
        $googleUser->method('getAvatar')->willReturn('https://lh3.googleusercontent.com/jean-avatar');

        $provider = $this->getMockBuilder(\Laravel\Socialite\Two\GoogleProvider::class)
            ->disableOriginalConstructor()
            ->getMock();

        $provider->method('stateless')->willReturn($provider);
        $provider->method('user')->willReturn($googleUser);

        Socialite::shouldReceive('driver')->with('google')->andReturn($provider);

        // Requête callback
        $response = $this->get('/api/auth/google/callback');

        // L'utilisateur existant doit être mis à jour avec son google_id et son avatar
        $user->refresh();
        $this->assertEquals('google-123456', $user->google_id);
        $this->assertEquals('https://lh3.googleusercontent.com/jean-avatar', $user->avatar);

        // Vérifier redirection avec jeton
        $response->assertRedirectContains('/login?token=');
    }
}
