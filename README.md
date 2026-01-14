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

### État Actuel - Authentification Locale
- **Contexte React** : Gestion d'état avec localStorage
- **Identifiants de démo** : `admin@chatel.fr` / `chatel2024`
- **Redirection automatique** : Utilisateurs connectés → `/family`

#### Tables Principales

**`family_member`** : Les membres de la famille (déjà existants)
- `id`, `firstName`, `lastName`, `mail`, `address`, etc.
- Ces membres sont créés par les admins avant l'invitation

**`users`** (à créer) : Les comptes utilisateurs
- `id`, `email`, `passwordHash`, `familyMemberId` (FK vers family_member)
- `role` : 'admin' | 'member'
- `createdAt`, `updatedAt`

**`invitations`** (à créer) : Les invitations envoyées
- `id`, `token` (unique, sécurisé)
- `familyMemberId` (FK vers family_member)
- `email` (email de destination)
- `createdBy` (FK vers users - l'admin qui a créé l'invitation)
- `expiresAt` (date d'expiration)
- `usedAt` (null si non utilisée, timestamp si utilisée)
- `createdAt`

## 🔐 Système d'Invitation

### Principe de Fonctionnement

1. **Création d'une invitation (Admin)**
   - Un admin sélectionne un membre de la famille (`family_member`)
   - L'admin entre l'email de destination
   - Le système génère un token unique et sécurisé
   - Un lien d'invitation est créé : `/invite/[token]`
   - L'invitation est envoyée par email (ou copiée manuellement)

2. **Utilisation de l'invitation (Membre)**
   - Le membre clique sur le lien d'invitation
   - Le système vérifie que le token est valide et non expiré
   - Le membre est redirigé vers une page de création de compte
   - Le membre crée son mot de passe
   - Un compte `user` est créé, lié au `family_member` correspondant
   - L'invitation est marquée comme utilisée (`usedAt`)

3. **Sécurité**
   - Tokens cryptographiquement sécurisés (crypto.randomBytes)
   - Expiration automatique (ex: 7 jours)
   - Une invitation ne peut être utilisée qu'une seule fois
   - Vérification que l'email correspond au membre de la famille

### Flux Technique Détaillé

```
┌─────────────┐
│   Admin     │
└──────┬──────┘
       │
       │ 1. Sélectionne family_member + email
       ▼
┌─────────────────────────────────┐
│ POST /api/invitations           │
│ - Génère token unique           │
│ - Crée invitation en DB          │
│ - Retourne lien d'invitation    │
└──────┬──────────────────────────┘
       │
       │ 2. Envoie lien par email
       ▼
┌─────────────┐
│   Membre    │
└──────┬──────┘
       │
       │ 3. Clique sur /invite/[token]
       ▼
┌─────────────────────────────────┐
│ GET /invite/[token]             │
│ - Vérifie token valide          │
│ - Vérifie non expiré            │
│ - Vérifie non utilisé            │
│ - Affiche formulaire création   │
└──────┬──────────────────────────┘
       │
       │ 4. Soumet formulaire (email + password)
       ▼
┌─────────────────────────────────┐
│ POST /api/invitations/accept    │
│ - Vérifie token à nouveau       │
│ - Hash le mot de passe          │
│ - Crée user lié à family_member │
│ - Marque invitation comme utilisée│
└─────────────────────────────────┘
```

## 📁 Structure du Projet

```
├── app/
│   ├── page.tsx              # Page d'accueil publique
│   ├── family/               # Arbre généalogique (protégé)
│   ├── map/                  # Carte géographique (protégé)
│   ├── admin/                # Administration (admin uniquement)
│   │   └── invitations/      # Gestion des invitations
│   ├── invite/               # Page d'invitation publique
│   │   └── [token]/          # Page de création de compte via invitation
│   └── api/
│       ├── auth/             # Authentification
│       ├── invitations/      # CRUD invitations
│       └── family-tree/      # Arbre généalogique
├── components/
│   ├── ui/                   # Composants shadcn/ui
│   ├── login-dialog.tsx      # Dialogue de connexion
│   └── protected-route.tsx  # HOC de protection
├── db/
│   ├── schema.ts             # Schéma Drizzle ORM
│   └── client.ts             # Client DB
├── lib/
│   └── utils.ts              # Utilitaires
├── docs/                     # Documentation technique
│   └── INVITATION_SYSTEM.md  # Documentation système d'invitation
└── README.md                 # Ce fichier
```

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
NEXT_PUBLIC_APP_URL=http://localhost:3000
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

## 🔄 Workflow de Développement

### Modifier le Schéma

1. Modifier `db/schema.ts`
2. Générer la migration : `yarn db:generate`
3. Appliquer : `yarn db:push` (dev) ou `yarn db:migrate` (prod)
4. Vérifier : `yarn db:studio`

## 📚 Documentation Complémentaire

- **Système d'invitation détaillé** : Voir `docs/INVITATION_SYSTEM.md`
- **API Routes** : Documentation dans chaque route `/app/api/`
- **Composants** : JSDoc dans les fichiers de composants

Toute la documentation technique est disponible dans le dossier `docs/`.

## 🔐 Sécurité

- **Mots de passe** : Hash avec bcrypt
- **Tokens d'invitation** : Cryptographiquement sécurisés
- **Sessions** : JWT tokens avec expiration
- **Validation** : Zod pour la validation des données
- **CSRF** : Protection Next.js intégrée

## 🎯 Roadmap

### Phase 1 : Système d'Invitation ✅ (En cours)
- [x] Schéma de base de données
- [ ] API d'invitation
- [ ] Interface admin pour créer invitations
- [ ] Page publique d'acceptation d'invitation
- [ ] Envoi d'emails (optionnel)

### Phase 2 : Authentification Complète
- [ ] Migration depuis localStorage vers DB
- [ ] Sessions JWT
- [ ] Refresh tokens
- [ ] Gestion des rôles (admin/member)

### Phase 3 : Fonctionnalités Avancées
- [ ] Notifications
- [ ] Historique des modifications
- [ ] Export de données
- [ ] Recherche avancée

---

**Développé avec ❤️ pour préserver les liens familiaux**
