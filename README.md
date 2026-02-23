# Lien d'Amour - Annuaire Familial Partagé

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

1. Modifier `db/schema.ts`
2. Générer la migration : `yarn db:generate`
3. Appliquer : `yarn db:push` (dev) ou `yarn db:migrate` (prod)

## 🎯 Roadmap

- [x] Données en DB avec adresses correctes
- [x] Gérer les projets de la homepage via l'admin
- [x] Update son profil
- [x] Données des membres dans un tableau avec des filtres
- [ ] Update les membres via l'admin panel
- [ ] Gestion du code famille
- [ ] Gestion des admins
- [ ] Déploiement clerk en prod
- [ ] Upload de fichiers
- [ ] Utiliser les logos de l'association
