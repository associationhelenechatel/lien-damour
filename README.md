# Lien d'Amour - Annuaire Familial Partagé

**Lien d'Amour** est une application web moderne permettant à toute la famille de partager et consulter un annuaire familial complet. Chaque membre de la famille peut créer un compte pour accéder à l'arbre généalogique, visualiser les membres sur une carte géographique, et gérer les informations familiales.

## 🎯 Concept et Enjeux

### Vision du Projet
Lien d'Amour est un **annuaire partagé pour toute la famille** où :
- Chaque membre de la famille peut créer un compte (sur invitation uniquement)
- Les membres sont déjà référencés dans la base de données
- Les admins peuvent envoyer des invitations par email
- Le système lie un email à un membre de la famille existant

### Problématique Principale
**Système d'invitation sécurisé** : Comment permettre aux admins d'inviter des membres de la famille à créer un compte, tout en s'assurant que :
1. Seuls les admins peuvent créer des invitations
2. On ne peut créer un compte que via un lien d'invitation valide
3. Le lien relie un email à un membre de la famille déjà référencé
4. Les invitations sont sécurisées et expirent après un certain temps

## 🏗️ Architecture Technique

### Stack Technologique
- **Framework** : Next.js 15 (App Router)
- **React** : Version 19
- **Base de données** : PostgreSQL (NeonDB serverless)
- **ORM** : Drizzle ORM
- **Styling** : Tailwind CSS + shadcn/ui
- **Cartes** : Leaflet (implémentation native)
- **Icons** : Lucide React
- **Fonts** : Geist (Sans & Mono)

## 🚀 Démarrage Rapide

### Prérequis
- Node.js 18+
- Yarn
- PostgreSQL (local avec Docker ou NeonDB)

### Installation

```bash
# Installer les dépendances
yarn install

# Configurer les variables d'environnement
cp .env.example .env
# Éditer .env avec vos credentials DB

# Appliquer les migrations
yarn db:push

# Lancer le serveur de développement
yarn dev
```

### Variables d'Environnement

```env
DATABASE_URL=postgresql://user:pass@host/db
JWT_SECRET=your-secret-key
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
[] Données en DB avec adresses correctes
[] Update le profil des autres via l'admin panel
[x] Gérer les projets de la homepage
[] Gestion du code famille
[] Déploiement clerk en prod
[] Upload de fichiers
[] Utiliser les logos de l'association

---

**Développé avec ❤️ pour préserver les liens familiaux**
