# Guide d'Hébergement et Déploiement en Production 🌐

Ce guide vous accompagne pas à pas pour déployer et configurer **ExellenceLink** sur votre serveur de production.

---

## 📋 1. Configuration des variables d'environnement (`.env`)

Créez un fichier `.env` sur votre serveur à partir de [.env.example](file:///c:/xampp/htdocs/link/.env.example) et configurez les valeurs de production :

```env
APP_NAME=ExellenceLink
APP_ENV=production
APP_DEBUG=false
APP_URL=https://votre-domaine.com

# Base de données de production
DB_CONNECTION=mysql
DB_HOST=127.0.0.1
DB_PORT=3306
DB_DATABASE=nom_de_votre_base
DB_USERNAME=utilisateur_base
DB_PASSWORD=mot_de_passe_base

# Mode de gestion de la file d'attente (recommandé: database)
QUEUE_CONNECTION=database

# Identifiants Google OAuth (récupérés depuis Google Cloud Console)
GOOGLE_CLIENT_ID=votre_client_id_google.apps.googleusercontent.com
GOOGLE_CLIENT_SECRET=votre_secret_google
GOOGLE_REDIRECT_URI=https://votre-domaine.com/api/auth/google/callback
```

---

## 🔑 2. Permissions des dossiers (Serveurs VPS/Linux)

Le serveur web (généralement `www-data` ou `nginx`) doit avoir les droits d'écriture sur les dossiers `storage` et `bootstrap/cache` :

```bash
sudo chown -R www-data:www-data /var/www/link
sudo chmod -R 775 /var/www/link/storage
sudo chmod -R 775 /var/www/link/bootstrap/cache
```

---

## ⚡ 3. Configuration du serveur Web (Nginx)

Voici une configuration type pour **Nginx** (à placer dans `/etc/nginx/sites-available/votre-domaine.com`).
> [!IMPORTANT]
> Le dossier racine (root) doit impérativement pointer vers le sous-dossier `/public` du projet.

```nginx
server {
    listen 80;
    listen [::]:80;
    server_name votre-domaine.com;
    root /var/www/link/public;

    add_header X-Frame-Options "SAMEORIGIN";
    add_header X-Content-Type-Options "nosniff";

    index index.php;

    charset utf-8;

    location / {
        try_files $uri $uri/ /index.php?$query_string;
    }

    location = /favicon.ico { access_log off; log_not_found off; }
    location = /robots.txt  { access_log off; log_not_found off; }

    error_page 404 /index.php;

    location ~ \.php$ {
        fastcgi_pass unix:/var/run/php/php8.2-fpm.sock;
        fastcgi_param SCRIPT_FILENAME $realpath_root$fastcgi_script_name;
        include fastcgi_params;
    }

    location ~ /\.(?!well-known).* {
        deny all;
    }
}
```

---

## ⚙️ 4. File d'attente (Queue Worker) avec Supervisor

Puisque l'application utilise des files d'attente pour analyser les métadonnées des liens (`ProcessLinkMetadata`) en arrière-plan, vous devez configurer un démon comme **Supervisor** pour maintenir le worker actif.

Créez un fichier `/etc/supervisor/conf.d/link-worker.conf` :

```ini
[program:link-worker]
process_name=%(program_name)s_%(process_num)02d
command=php /var/www/link/artisan queue:work --sleep=3 --tries=3 --max-time=3600
autostart=true
autorestart=true
stopasgroup=true
killasgroup=true
user=www-data
numprocs=2
redirect_stderr=true
stdout_logfile=/var/www/link/storage/logs/worker.log
stopwaitsecs=3600
```

Activez-le ensuite :
```bash
sudo supervisorctl reread
sudo supervisorctl update
sudo supervisorctl start link-worker:*
```

---

## ⏰ 5. Planificateur de tâches (Cron Job)

Pour exécuter les tâches planifiées de Laravel (nettoyages, logs, etc.), ajoutez cette tâche Cron sur votre serveur :

```bash
* * * * * cd /var/www/link && php artisan schedule:run >> /dev/null 2>&1
```

---

## 🚀 6. Déploiement facile (VPS)

Pour mettre à jour votre site, vous pouvez lancer le script de déploiement automatique fourni :

```bash
chmod +x deploy.sh
./deploy.sh
```

---

## 📦 7. Cas particulier : Hébergement Mutualisé (cPanel, Hostinger...)

Si vous utilisez un hébergement sans accès terminal Root ou Nginx :

1. **Ajustement de la racine** :
   - Si votre hébergeur ne permet pas de pointer vers le dossier `/public`, déplacez le contenu du dossier `/public` à la racine de votre hébergement (ex: dans `public_html`) ou configurez un fichier `.htaccess` à la racine pour rediriger le trafic vers le dossier public :
     ```apache
     RewriteEngine On
     RewriteRule ^(.*)$ public/$1 [L]
     ```

2. **Génération du lien de stockage** :
   - Puisque vous ne pouvez pas lancer `php artisan storage:link` directement, vous pouvez créer une route temporaire dans `routes/web.php` pour le générer, ou utiliser la commande via un cron job unique :
     ```php
     Route::get('/init-storage', function () {
         Artisan::call('storage:link');
         return 'Storage link created!';
     });
     ```

3. **Traitement synchrone de la file d'attente (Sans Supervisor)** :
   - Si vous ne pouvez pas installer Supervisor, modifiez la variable suivante dans le `.env` pour traiter les jobs instantanément lors de l'ajout des liens :
     ```env
     QUEUE_CONNECTION=sync
     ```
