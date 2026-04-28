# Link Intelligence - API de Gestion de Liens par IA

**Link Intelligence** est une API moderne et performante conçue pour organiser, stocker et analyser vos liens web. Grâce à l'intégration de l'IA Gemini de Google, chaque lien ajouté est automatiquement enrichi de métadonnées pertinentes.

## 🚀 Fonctionnalités Clés

- **Analyse Automatique par IA** : Extraction du titre, de la description et de l'image de couverture (OpenGraph) via un traitement asynchrone.
- **Enrichissement de Contenu** : L'IA Gemini 1.5 Flash résume le contenu de la page pour générer une description personnalisée.
- **Isolation Utilisateur** : Système de confidentialité stricte. Un utilisateur ne peut voir et interagir qu'avec ses propres liens.
- **Gestion de la Corbeille** : Système de suppression "douce" permettant de recycler ou de restaurer des liens.
- **Gestion des Catégories** : Organisation des liens par thématiques avec des compteurs intelligents.
- **API REST Robuste** : Routes protégées par Laravel Sanctum.

## 🛠️ Stack Technique

- **Framework** : Laravel 12
- **IA** : Google Gemini 1.5 Flash
- **Base de données** : MySQL
- **Scraping** : Symfony DomCrawler
- **Queueing** : Database Driver (Asynchrone)

## 📦 Installation

1. **Cloner le projet**
   ```bash
   git clone https://github.com/MourchidFOLARIN/link.git
   cd link
   ```

2. **Installer les dépendances**
   ```bash
   composer install
   ```

3. **Configurer l'environnement**
   ```bash
   cp .env.example .env
   php artisan key:generate
   ```
   *N'oubliez pas de configurer votre base de données et votre clé API Gemini dans le fichier `.env` :*
   ```env
   GEMINI_API_KEY=votre_cle_api
   QUEUE_CONNECTION=database
   ```

4. **Lancer les migrations**
   ```bash
   php artisan migrate
   ```

5. **Lancer le serveur de développement**
   ```bash
   php artisan serve
   ```

6. **Lancer le gestionnaire de tâches (Queues)**
   *Nécessaire pour l'analyse par IA :*
   ```bash
   php artisan queue:work
   ```

## 📖 API Documentation

### Authentification
- `POST /api/auth/register` : Inscription
- `POST /api/auth/login` : Connexion
- `POST /api/auth/logout` : Déconnexion (Protégé)

### Liens (Protégé par Sanctum)
- `GET /api/links` : Lister les liens actifs
- `GET /api/links/{id}` : Détail d'un lien
- `POST /api/links` : Ajouter un lien (Analyse IA déclenchée)
- `PATCH /api/links/{id}` : Modifier un lien
- `DELETE /api/links/{id}` : Déplacer vers la corbeille
- `GET /api/links/trash` : Lister la corbeille
- `POST /api/links/{id}/restore` : Restaurer un lien
- `DELETE /api/links/{id}/force` : Suppression définitive

---
Développé avec ❤️ par [Mourchid FOLARIN](https://github.com/MourchidFOLARIN)
