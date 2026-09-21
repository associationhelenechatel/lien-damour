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
# Éditer .env avec vos credentials DB

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

### Stockage de fichiers en local (LocalStack)

`docker compose up -d` démarre aussi un **LocalStack** (émulateur S3) à côté
de la base Postgres locale, pour que les uploads (photos, logos, documents)
en dev n'écrivent jamais dans le bucket Cloudflare R2 de production.

1. Dans `.env.local`, décommenter le bloc `# LocalStack (dev local...)` de
   `.env.example` (et laisser vide les identifiants R2 juste au-dessus).
2. Depuis mars 2026, LocalStack exige un compte même pour l'usage gratuit :
   créer un compte gratuit (plan Hobby, non-commercial) sur
   https://app.localstack.cloud, récupérer son Auth Token, et créer un
   fichier `.env` **à la racine** (gitignoré, distinct de `.env.local` —
   c'est celui que lit `docker compose`, pas Next.js) contenant :
   ```
   LOCALSTACK_AUTH_TOKEN=<ton token>
   ```
3. `docker compose up -d` crée automatiquement le bucket de dev, son CORS et
   sa lecture publique (voir `docker/localstack-init/init-s3.sh`) — même
   configuration que le bucket R2 de prod.
4. Pour inspecter les fichiers uploadés :
   `docker compose exec localstack awslocal s3 ls s3://lien-damour-dev --recursive`

Les uploads passent par une URL présignée envoyée directement du navigateur
vers ce stockage (voir `lib/api/r2-upload-flow.ts`), exactement comme en
production vers R2.

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
