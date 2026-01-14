# Système d'Invitation avec Clerk

## 📋 Vue d'Ensemble

Le système d'invitation utilise les fonctionnalités natives de Clerk pour inviter des membres de la famille à créer un compte. Après la création du compte, un processus d'onboarding permet de lier l'utilisateur Clerk à un membre de la famille existant dans la base de données.

## 🎯 Objectifs

1. **Invitations sécurisées** : Utilisation du système d'invitation natif de Clerk
2. **Onboarding guidé** : L'utilisateur choisit son identité parmi les membres de la famille
3. **Liaison automatique** : Le `familyMemberId` est stocké dans les metadata Clerk
4. **Pas de table supplémentaire** : Tout est géré par Clerk et les metadata

## 🔄 Flux Complet

### 1. Création d'une Invitation (Admin)

**Endpoint** : `POST /api/invitations`

L'admin crée une invitation via l'API Clerk. L'invitation est générique (non liée à un membre spécifique).

```typescript
import { clerkClient } from '@clerk/nextjs/server'

await clerkClient().invitations.createInvitation({
  emailAddress: 'user@example.com',
  redirectUrl: `${process.env.NEXT_PUBLIC_APP_URL}/onboarding`,
})
```

**Avantages Clerk** :
- ✅ Email envoyé automatiquement
- ✅ Lien unique généré automatiquement
- ✅ Expiration après 1 mois (géré par Clerk)
- ✅ Pas besoin de table `invitations` dans notre DB

### 2. Acceptation de l'Invitation

1. L'utilisateur clique sur le lien dans l'email
2. Clerk redirige vers la page de sign-up
3. L'utilisateur crée son compte (email + password)
4. **L'email est automatiquement vérifié** par Clerk
5. Redirection vers `/onboarding` (spécifié dans `redirectUrl`)

### 3. Page d'Onboarding

**Route** : `/onboarding`

L'utilisateur (déjà authentifié) :
1. Voit une liste des membres de la famille dans un select
2. Choisit son identité (`familyMemberId`)
3. Complète ses informations (date de naissance, lieu, etc.)
4. Soumet le formulaire

**Processus backend** :
```typescript
// Mise à jour des metadata Clerk
await clerkClient().users.updateUserMetadata(userId, {
  publicMetadata: {
    familyMemberId: selectedFamilyMemberId,
  }
})

// Mise à jour des infos du family_member dans la DB
await db.update(familyMember)
  .set({
    birthDate: formData.birthDate,
    // ... autres champs
  })
  .where(eq(familyMember.id, selectedFamilyMemberId))
```

### 4. Utilisation dans l'Application

Partout où vous avez accès au user Clerk, vous pouvez récupérer le `familyMemberId` :

```typescript
import { currentUser } from '@clerk/nextjs/server'

const user = await currentUser()
const familyMemberId = user.publicMetadata.familyMemberId as number

// Récupérer les infos complètes depuis votre DB
const familyMember = await db.query.familyMember.findFirst({
  where: eq(familyMember.id, familyMemberId)
})
```

## 🗄️ Architecture de Données

### Pas de Table Supplémentaire Nécessaire

Grâce aux metadata Clerk, **pas besoin de table de liaison** `user_family_member` :

- ✅ Le `familyMemberId` est stocké dans `user.publicMetadata.familyMemberId`
- ✅ Accessible en lecture depuis le frontend
- ✅ Modifiable uniquement depuis le backend (sécurité)
- ✅ Type-safe avec TypeScript

### Tables Existantes

- `family_member` : Les membres de la famille (déjà existant)
- Pas besoin de table `users` : Clerk gère les utilisateurs
- Pas besoin de table `invitations` : Clerk gère les invitations
- Pas besoin de table de liaison : Les metadata Clerk suffisent

## 🔒 Sécurité

### Metadata Clerk

- **`publicMetadata`** : Accessible en lecture frontend/backend, modifiable uniquement backend
- **`privateMetadata`** : Accessible et modifiable uniquement backend
- **`unsafeMetadata`** : Accessible et modifiable frontend/backend

**Choix** : `publicMetadata` pour `familyMemberId` car :
- Accessible depuis le frontend (pour afficher les infos)
- Modifiable uniquement depuis le backend (sécurité)

### Invitations Clerk

- ✅ Lien unique et sécurisé
- ✅ Expiration automatique (1 mois)
- ✅ Usage unique (géré par Clerk)
- ✅ Email automatiquement vérifié

## 📝 Implémentation

### Checklist

- [ ] Installer Clerk (`@clerk/nextjs`)
- [ ] Configurer les variables d'environnement Clerk
- [ ] Créer l'API `POST /api/invitations` (utilise Clerk API)
- [ ] Créer la page `/onboarding`
- [ ] Créer le formulaire de sélection du family_member
- [ ] Implémenter la mise à jour des metadata Clerk
- [ ] Implémenter la mise à jour des infos family_member
- [ ] Adapter les composants existants pour utiliser Clerk
- [ ] Migrer depuis localStorage vers Clerk

### Variables d'Environnement

```env
NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY=pk_test_...
CLERK_SECRET_KEY=sk_test_...
NEXT_PUBLIC_APP_URL=http://localhost:3000
```

## 🎨 Interface Utilisateur

### Page Admin : Création d'Invitation

```
┌─────────────────────────────────────────┐
│  Créer une Invitation                  │
├─────────────────────────────────────────┤
│  Email : [________________]            │
│                                         │
│  [Envoyer l'invitation]                │
│                                         │
│  ✅ Invitation envoyée !               │
│  L'utilisateur recevra un email avec   │
│  un lien pour créer son compte.        │
└─────────────────────────────────────────┘
```

### Page Onboarding

```
┌─────────────────────────────────────────┐
│  Bienvenue !                           │
├─────────────────────────────────────────┤
│  Choisissez votre identité :           │
│  [Select: Jean Dupont ▼]               │
│                                         │
│  Complétez vos informations :          │
│  Date de naissance : [__/__/____]      │
│  Lieu de naissance : [__________]      │
│  ...                                    │
│                                         │
│  [Terminer l'onboarding]               │
└─────────────────────────────────────────┘
```

## 🔗 Ressources

- [Documentation Clerk - Invitations](https://clerk.com/docs/guides/users/inviting)
- [Documentation Clerk - User Metadata](https://clerk.com/docs/users/user-metadata)
- [Clerk Next.js SDK](https://clerk.com/docs/quickstarts/nextjs)

---

**Note** : Ce système est beaucoup plus simple que de gérer les invitations manuellement. Clerk s'occupe de toute la complexité (emails, tokens, expiration, etc.), nous nous concentrons uniquement sur l'onboarding et la liaison avec les membres de la famille.

