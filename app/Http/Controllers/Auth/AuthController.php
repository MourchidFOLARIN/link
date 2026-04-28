<?php

namespace App\Http\Controllers\Auth;

use App\Http\Controllers\Controller;
use App\Models\User;
use Illuminate\Http\Request;

use Illuminate\Support\Facades\Hash;

class AuthController extends Controller
{
    
 

    public function store(Request $request)
    {
       $request->validate([
           "name"=>"required",
           "email"=>"required|email|unique:users,email",
           "password"=>"required|min:8|confirmed",
           "profession"=>"nullable",
       ]);

       $User = User::create([
           "name"=>$request->name,
           "email"=>$request->email,
           "password"=>Hash::make($request->password),
           "profession"=>$request->profession ?? null,
       ]);
     
        if($User){
            $token = $User->createToken('auth_token')->plainTextToken;
            return response()->json([
                "status"=>"success",
                "message"=>"Utilisateur crée avec succes",
                "data"=>$User,
                "access_token" => $token,
                "token_type" => "Bearer",
            ]);
        }
        else{
            return response()->json([
                "status"=>"error",
                "message"=>"Utilisateur n'a pas pu etre crée",
                "data"=>null,
            ], 200);
        }
    }

    public function login(Request $request)
    {
        $request->validate([
            'email' => 'required|email',
            'password' => 'required',
        ]);

        $user = User::where('email', $request->email)->first();

        if (!$user || !Hash::check($request->password, $user->password)) {
            return response()->json([
                'status' => 'error',
                'message' => 'Identifiants invalides',
            ], 401);
        }

        $token = $user->createToken('auth_token')->plainTextToken;

        return response()->json([
            'status' => 'success',
            'message' => 'Connexion réussie',
            'data' => $user,
            'access_token' => $token,
            'token_type' => 'Bearer',
        ]);
    }

    public function logout(Request $request)
    {

        $user = $request->user();
        $token = $user->currentAccessToken();
      
        if ($token && method_exists($token, 'delete')) {
            $token->delete();
        }
     
        return response()->json([
            'status' => 'success',
            'message' => 'Déconnexion réussie',
        ]);
    }

    public function show(string $id)
    {
        
    }

    /**
     * Update the specified resource in storage.
     */
    public function update(Request $request, string $id)
    {
        //
    }

    /**
     * Remove the specified resource from storage.
     */
    public function destroy(string $id)
    {
        //
    }
}
