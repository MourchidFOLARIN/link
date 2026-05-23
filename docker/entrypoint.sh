#!/bin/sh
set -e

# Configurer le port de Nginx dynamiquement en utilisant $PORT de Render (ou 80 par défaut)
PORT=${PORT:-80}
echo "Configuration de Nginx pour écouter sur le port: $PORT"
sed -i "s/PORT_PLACEHOLDER/$PORT/g" /etc/nginx/http.d/default.conf

# Préparer les caches d'optimisation Laravel
echo "Optimisation des caches Laravel..."
php artisan config:cache
php artisan route:cache
php artisan view:cache
php artisan event:cache

# Exécuter les migrations de base de données (si configuré)
if [ "$RUN_MIGRATIONS" = "true" ]; then
    echo "Exécution des migrations de base de données..."
    php artisan migrate --force
fi

# Créer le lien symbolique du stockage si inexistant
echo "Lien du stockage public..."
php artisan storage:link --force || true

# Démarrer PHP-FPM en arrière-plan
echo "Démarrage de PHP-FPM..."
php-fpm -D

# Démarrer Nginx au premier plan
echo "Démarrage de Nginx..."
exec nginx -g "daemon off;"
