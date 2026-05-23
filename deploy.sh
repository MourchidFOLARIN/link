#!/bin/bash
set -e

echo "=== Début du déploiement en production ==="

# Activer le mode maintenance
echo "Mise en mode maintenance..."
php artisan down || true

# Récupérer les dernières modifications de Git
echo "Mise à jour du code via Git..."
git pull origin master

# Installer les dépendances PHP en mode production
echo "Installation des dépendances PHP (production)..."
composer install --no-dev --optimize-autoloader --no-interaction --prefer-dist

# Lancer les migrations de base de données de façon sécurisée
echo "Exécution des migrations de base de données..."
php artisan migrate --force

# Recréer le lien symbolique pour le stockage public
echo "Génération du lien symbolique du stockage..."
php artisan storage:link --force || true

# Installer les dépendances JS et compiler les assets Vite
echo "Compilation des assets frontend avec Vite..."
npm install
npm run build

# Vider et recréer les caches d'optimisation de Laravel
echo "Optimisation des caches Laravel..."
php artisan config:cache
php artisan route:cache
php artisan view:cache
php artisan event:cache

# Redémarrer la file d'attente (Queue Worker) pour charger le nouveau code
echo "Redémarrage du gestionnaire de tâches (Queue)..."
php artisan queue:restart

# Désactiver le mode maintenance
echo "Désactivation du mode maintenance (mise en ligne)..."
php artisan up

echo "=== Déploiement terminé avec succès ! ==="
