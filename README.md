# Lien d'Amour - Annuaire Familial Partagé

**Lien d'Amour** est une application web moderne permettant à toute la famille de partager et consulter un annuaire familial complet. Chaque membre de la famille peut créer un compte pour accéder à l'arbre généalogique, visualiser les membres sur une carte géographique, et gérer les informations familiales.

## 🏗️ Architecture Technique

### Services et plateformes
- **Netlify** — hébergement et CI/CD
- **Neon** — base de données PostgreSQL serverless
- **Clerk** — authentification et gestion des utilisateurs
- **Cloudflare R2** — stockage de fichiers (file hosting)
- **Mapbox** - Cartographie et adresses

### Stack Technologique
- **Framework** : Next.js 15 (App Router)
- **React** : Version 19
- **Base de données** : PostgreSQL (NeonDB serverless)
- **ORM** : Drizzle
- **Styling** : Tailwind CSS + shadcn/ui
- **Cartes** : Leaflet (implémentation native)

## 🚀 Démarrage Rapide

### Prérequis
- Node.js 18+
- Yarn
- Docker

### Installation

```bash
# Installer les dépendances
yarn install

# Démarrer docker pour la DB postregres
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

## 📝 Scripts Disponibles

```bash
yarn dev          # Serveur de développement
yarn build        # Build de production
yarn start        # Serveur de production
yarn lint         # Linting ESLint
yarn db:generate  # Générer migrations
yarn db:push      # Appliquer migrations (dev)
yarn db:migrate   # Appliquer migrations (prod)
yarn db:studio    # Ouvrir Drizzle Studio
```

### Modifier le Schéma

1. Modifier `db/schema.ts`
2. Générer la migration : `yarn db:generate`
3. Appliquer : `yarn db:push` (dev) ou `yarn db:migrate` (prod)
4. Vérifier : `yarn db:studio`

## 🎯 Roadmap

[x] Update son profil
[] Données des membres dans un tableau avec des filtres
[x] Données en DB avec adresses correctes
[] Update le profil des autres via l'admin panel
[x] Gérer les projets de la homepage
[] Gestion du code famille
[] Déploiement clerk en prod
[] Upload de fichiers
[] Utiliser les logos de l'association

---

**Développé avec ❤️ pour préserver les liens familiaux**
