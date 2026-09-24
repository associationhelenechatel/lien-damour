# Lien d'Amour - Annuaire Familial Partagé

[![Netlify Status](https://api.netlify.com/api/v1/badges/e5cdfe7f-e73b-4962-aa5e-a95ac78a6298/deploy-status)](https://app.netlify.com/projects/associationhelenechatel/deploys)

**Lien d'Amour** est une application web moderne permettant à toute la famille de partager et consulter un annuaire familial complet. Chaque membre de la famille peut créer un compte pour accéder à l'arbre généalogique, visualiser les membres sur une carte géographique, et gérer les informations familiales.

## 🏗️ Architecture

### Services et plateformes
- **Netlify** — hébergement et CI/CD
- **Neon** — base de données PostgreSQL serverless
- **Clerk** — authentification et gestion des utilisateurs
- **Cloudflare R2** — stockage de fichiers (file hosting)
- **Mapbox** - Cartographie et adresses

### Stack Technique
- **Framework** : Next.js 15 (App Router)
- **React** : Version 19
- **Base de données** : PostgreSQL (NeonDB serverless)
- **ORM** : Drizzle
- **Styling** : Tailwind CSS + shadcn/ui

### API Keys required

Avant de lancer l'app, récupérer les secrets necessaires. Tous les comptes utilisent le compte google associationhelenechatel@gmail.com.


- **Clerk** — https://dashboard.clerk.com → *API Keys* : `NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY`, `CLERK_SECRET_KEY`. Puis dans *Users*, récupérer l'ID de ton compte admin pour `SEED_ADMIN_CLERK_USER_ID`.
- **Mapbox** — https://account.mapbox.com/access-tokens/ → `NEXT_PUBLIC_MAPBOX_TOKEN`.
- **LocalStack** — https://app.localstack.cloud → *Account* > *Auth Tokens* (plan Hobby gratuit) → `LOCALSTACK_AUTH_TOKEN`. Requis pour émuler le stockage S3 (Cloudflare R2) en local, voir `docker-compose.yml`.

`DATABASE_URL` et les identifiants `R2_*` sont déjà préremplis dans `.env.example` pour l'environnement Docker local (Postgres + LocalStack) — aucun compte à créer pour ceux-ci.

## 🚀 Démarrage Rapide

### Prérequis
- Node.js 20+ (ou nvm)
- Yarn
- Docker

### Installation


```bash
# (Si nvm installé)
nvm use

# Installer les dépendances
yarn install

# Démarrer docker pour la base de données PostGres local
docker compose up -d

# Configurer les variables d'environnement
cp .env.example .env.local
# Éditer .env avec vos credentials récupérés sur plateformes (voir la section API KEYS)

# Appliquer les migrations
yarn db:push

# Seed la DB
yarn db:seed

# Lancer le serveur de développement
yarn dev
```

### Créer une migration

1. Modifier `drizzle/schema.ts`
2. Générer la migration : `yarn db:generate`
3. Appliquer : `yarn db:push` (dev) ou `yarn db:migrate` (prod)

## 🎯 Roadmap

- [x] Données en DB avec adresses correctes
- [x] Gérer les projets de la homepage via l'admin
- [x] Update son profil
- [x] Données des membres dans un tableau avec des filtres
- [x] Update les membres via l'admin panel
- [x] Refaire la navbar
- [x] Utiliser les logos de l'association
- [x] Événement naissance / mariage
- [x] Gestion des admins
- [x] Pouvoir inviter des membres
- [x] Déploiement clerk en prod
- [x] Upload de fichiers
