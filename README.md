# Association Châtel - Arbre Généalogique Familial

Une application web moderne présentant l'Association Châtel et ses projets solidaires, avec un espace membre dédié à l'exploration de l'arbre généalogique familial.

## 🎯 Fonctionnalités

### Page Publique
- **Présentation de l'Association Châtel** : 14 projets solidaires soutenus financièrement
- **Design moderne** : Interface responsive avec Tailwind CSS
- **Budget transparent** : Calcul automatique du budget total alloué (295 000€)

### Espace Membre (Authentifié)
- **Arbre généalogique interactif** : Visualisation des liens familiaux
- **Carte géographique** : Localisation des membres de la famille
- **Administration** : Gestion des données familiales (CRUD)
- **Navigation protégée** : Accès sécurisé aux fonctionnalités

## 🏗️ Architecture Technique

### Frontend
- **Framework** : Next.js 14 (App Router)
- **React** : Version 19
- **Styling** : Tailwind CSS + shadcn/ui
- **Cartes** : Leaflet (implémentation native)
- **Icons** : Lucide React
- **Fonts** : Geist (Sans & Mono)

### État Actuel - Authentification Locale
- **Contexte React** : Gestion d'état avec localStorage
- **Identifiants de démo** : `admin@chatel.fr` / `chatel2024`
- **Redirection automatique** : Utilisateurs connectés → `/family`

### Hébergement & Déploiement
- **Plateforme** : Netlify
- **Storage** : Netlify Blobs (pour les assets et données statiques)
- **Build** : Optimisé pour les déploiements Netlify

### Base de Données (Planifiée)
- **Provider** : NeonDB (PostgreSQL serverless)
- **Accès** : Next.js API Routes/Functions
- **ORM** : À définir (Prisma recommandé)

### Authentification Future (Planifiée)
- **Provider** : Auth0
- **Méthode** : Magic Links (connexion par email)
- **Sécurité** : JWT tokens + refresh tokens
- **UX** : Connexion sans mot de passe

## 🚀 Démarrage Rapide

### Prérequis
- Node.js 18+
- Yarn (recommandé)

### Installation
```bash
# Cloner le projet
git clone <repository-url>
cd lien-damour

# Installer les dépendances
yarn install

# Lancer le serveur de développement
yarn dev
```

### Accès à l'application
- **URL locale** : http://localhost:3000
- **Page publique** : Accessible à tous
- **Connexion** : Utiliser les identifiants pré-remplis

## 📁 Structure du Projet

```
├── app/                    # Pages Next.js (App Router)
│   ├── page.tsx           # Page d'accueil (Association Châtel)
│   ├── family/            # Arbre généalogique (protégé)
│   ├── map/               # Carte géographique (protégé)
│   ├── admin/             # Administration (protégé)
│   ├── layout.tsx         # Layout principal
│   ├── globals.css        # Styles globaux
│   └── leaflet.css        # Styles Leaflet
├── components/            # Composants React réutilisables
│   ├── ui/                # Composants shadcn/ui
│   ├── family-tree.tsx    # Arbre généalogique
│   ├── simple-map.tsx     # Carte Leaflet
│   ├── login-dialog.tsx   # Dialogue de connexion
│   ├── shared-header.tsx  # Header adaptatif
│   └── protected-route.tsx # HOC de protection
├── lib/                   # Utilitaires et contextes
│   ├── auth-context.tsx   # Contexte d'authentification
│   └── utils.ts           # Utilitaires généraux
├── data/                  # Données statiques
│   └── family-data.json   # Données familiales (temporaire)
└── public/                # Assets statiques
```

## 🔧 Choix Techniques Détaillés

### Pourquoi Leaflet natif ?
- **Compatibilité** : React 19 + react-leaflet avait des conflits
- **Performance** : Import dynamique évite les problèmes SSR
- **Contrôle** : Implémentation sur mesure plus flexible

### Pourquoi Netlify ?
- **Simplicité** : Déploiement automatique depuis Git
- **Performance** : CDN global intégré
- **Blobs** : Storage simple pour assets et données
- **Functions** : Serverless pour les API futures

### Pourquoi NeonDB ?
- **Serverless** : Scaling automatique
- **PostgreSQL** : Base relationnelle robuste
- **Intégration** : Compatible Next.js API Routes
- **Coût** : Plan gratuit généreux

### Pourquoi Auth0 + Magic Links ?
- **UX** : Connexion sans mot de passe
- **Sécurité** : Gestion professionnelle des tokens
- **Scalabilité** : Support multi-tenant
- **Maintenance** : Moins de code d'auth à maintenir

## 🔄 Migration Planifiée

### Phase 1 : Base de Données
1. Setup NeonDB + Prisma
2. Migration des données JSON → PostgreSQL
3. Création des API Routes Next.js
4. Tests d'intégration

### Phase 2 : Authentification
1. Configuration Auth0
2. Remplacement du contexte local
3. Implémentation Magic Links
4. Tests de sécurité

### Phase 3 : Optimisations
1. Cache avec Netlify Blobs
2. Optimisation des requêtes
3. Monitoring et analytics
4. Tests de performance

## 📝 Scripts Disponibles

```bash
yarn dev          # Serveur de développement
yarn build        # Build de production
yarn start        # Serveur de production
yarn lint         # Linting ESLint
```

## 🔐 Identifiants de Démonstration

- **Email** : `admin@chatel.fr`
- **Mot de passe** : `chatel2024`

## 📚 Documentation Technique

### Composants Clés
- `AuthProvider` : Contexte d'authentification global
- `ProtectedRoute` : HOC pour protéger les routes
- `SimpleMap` : Carte Leaflet avec marqueurs interactifs
- `FamilyTreeApp` : Arbre généalogique avec recherche et filtres

### Données
- Format JSON temporaire dans `/data/family-data.json`
- Structure normalisée pour migration PostgreSQL
- Relations parent-enfant avec IDs

### Styling
- Tailwind CSS avec configuration personnalisée
- Composants shadcn/ui pour la cohérence
- Thème vert émeraude pour l'identité visuelle

---

**Développé avec ❤️ pour préserver l'histoire familiale**