# --- Étape 1 : Build du Frontend (Node.js) ---
FROM node:20-alpine AS node-builder
WORKDIR /app

# Copier les fichiers package.json et lock
COPY package*.json ./

# Installer les dépendances Node
RUN npm ci

# Copier le code de l'application nécessaire pour le build
COPY vite.config.js postcss.config.js tailwind.config.js ./
COPY resources ./resources
COPY public ./public

# Compiler les assets pour la production
RUN npm run build

# --- Étape 2 : Image Finale de Production (PHP + Nginx) ---
FROM php:8.2-fpm-alpine
WORKDIR /var/www/html

# Installer Nginx et les dépendances système nécessaires
RUN apk add --no-cache \
    nginx \
    bash \
    sed \
    libpng-dev \
    libjpeg-turbo-dev \
    libwebp-dev \
    libzip-dev \
    postgresql-dev \
    oniguruma-dev \
    libxml2-dev

# Configurer et installer les extensions PHP requises
RUN docker-php-ext-configure gd --with-jpeg --with-webp \
    && docker-php-ext-install -j$(nproc) \
        pdo_mysql \
        pdo_pgsql \
        zip \
        gd \
        opcache \
        bcmath \
        xml

# Configurer Nginx et PHP-FPM
COPY docker/nginx.conf /etc/nginx/http.d/default.conf

# Configurer Opcache pour de meilleures performances en production
RUN echo -e "opcache.memory_consumption=192\nopcache.interned_strings_buffer=16\nopcache.max_accelerated_files=20000\nopcache.revalidate_freq=2\nopcache.fast_shutdown=1\nopcache.enable_cli=1" > /usr/local/etc/php/conf.d/opcache-recommended.ini

# Copier Composer depuis l'image officielle
COPY --from=composer:latest /usr/bin/composer /usr/bin/composer

# Copier le code backend de l'application
COPY . .

# Copier les assets frontend compilés à partir de la première étape
COPY --from=node-builder /app/public/build ./public/build

# Installer les dépendances PHP de production
ENV COMPOSER_ALLOW_SUPERUSER=1
RUN composer install --no-dev --optimize-autoloader --no-interaction --prefer-dist

# S'assurer que le script d'entrée est exécutable
RUN chmod +x docker/entrypoint.sh

# Configurer les permissions pour le serveur web
RUN chown -R www-data:www-data /var/www/html/storage /var/www/html/bootstrap/cache

# Exposer le port de Render (configuré dynamiquement dans entrypoint.sh)
EXPOSE 80

# Définir le point d'entrée
ENTRYPOINT ["/var/www/html/docker/entrypoint.sh"]
