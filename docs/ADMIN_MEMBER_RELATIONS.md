# Gestion des membres et des relations – Admin

Document de conception pour l’ajout et la modification de membres dans l’espace admin, avec une gestion cohérente des relations (parent–enfant) et des partenariats (mariage, PACS, etc.).

---

## 1. Modèle de données (rappel)

### Tables

| Table | Rôle |
|-------|------|
| **family_member** | Une personne : identité, dates, contact, adresse, etc. |
| **family_relation** | Lien parent → enfant (parentId, childId, relationType: bio / adoptive / step) |
| **partnership** | Lien entre deux membres (partner1Id, partner2Id, startDate, endDate) |

### Contraintes importantes

- Un **enfant** est lié à **un ou deux parents** via `family_relation` (deux lignes si deux parents connus).
- Un **partenariat** unit deux `family_member` existants ; il n’y a pas de “conjoint” stocké comme texte, uniquement des IDs.

**Suppression** : on ne supprime jamais un `family_member` en production. L’historique familial est conservé. Les actions de “suppression” éventuelles (doublon, erreur) peuvent être traitées hors de l’app (script, admin DB) si besoin ; l’UI n’expose pas cette action.

---

## 2. Cas d’usage à couvrir

| Cas | Description | Tables impactées |
|-----|-------------|-------------------|
| **Naissance** | Créer un nouveau membre et le rattacher à 1 ou 2 parents existants (au moins un parent est toujours connu). | 1 `family_member` + 1 ou 2 `family_relation` |
| **Mariage / PACS** | Créer un nouveau membre (le conjoint) et l’unir à un membre existant. Il n’y a pas de mariage entre deux personnes déjà dans l’arbre : le conjoint est toujours une nouvelle personne. | 1 `family_member` + 1 `partnership` |
| **Adoption / beau-parent** | Lien parent–enfant avec `relationType` = adoptive ou step (même flux naissance, avec type de relation adapté). | 1 `family_member` (l’enfant) + 1 ou 2 `family_relation` |
| **Décès** | Pas un “type d’ajout” : on met à jour `deathDate` d’un membre existant (édition). | `family_member` (update) |

**Contexte** : tous les membres de la famille existants sont déjà créés (arbre déjà en place). Donc tout nouvel ajout est soit une **naissance** (nouveau membre + 1 ou 2 parents, au moins un toujours connu), soit un **mariage/union** (nouveau conjoint + lien avec un membre déjà dans l’arbre ; pas de mariage entre deux personnes déjà présentes).

En pratique, l’UI d’**ajout** se limite à **deux entrées** : **Naissance** et **Mariage (ou union)**.

---

## 3. UI recommandée : entrée par type d’événement

### Principe

Au clic sur “Ajouter un membre”, **ne pas** ouvrir directement un formulaire générique. Ouvrir une **étape 1 : choix du type**, qui détermine le flux et les champs.

### Étape 1 : “Que voulez-vous faire ?”

- **Un enfant naît** → flux “Naissance” (nouveau membre + 1 ou 2 parents).
- **Un mariage / une union** → flux “Mariage” (nouveau conjoint à lier à un membre existant).

Chaque option peut être une carte ou un bouton avec une courte explication (ex. “Un enfant naît – lier à un ou deux parents” ; “Un mariage ou une union – ajouter un conjoint et le lier à une personne de l’arbre”).

### Ensuite : flux dédiés

- **Naissance**  
  - Formulaire “Enfant” : prénom, nom, date de naissance, etc.  
  - Sélection des parents : 1 ou 2 membres existants (liste / recherche).  
  - Optionnel : type de relation (bio / adoptive / step) par parent.  
  - À la soumission : créer le `family_member`, puis 1 ou 2 `family_relation`.

- **Mariage**  
  - Formulaire “Conjoint” (prénom, nom, dates, etc.) + choix du membre existant avec qui il/elle est en couple → créer `family_member` + `partnership` (optionnel : date de mariage → `startDate`).

Cela évite le formulaire “brouillon” actuel (nom complet, “époux/épouse” en texte, “génération”, etc.) et aligne l’UI sur le modèle de données.

---

## 4. Détail des flux par type

### 4.1 Naissance

1. Utilisateur choisit “Un enfant naît”.
2. Formulaire enfant :  
   - Obligatoire : prénom (et nom si vous le souhaitez).  
   - Optionnel : date de naissance, genre, etc. (selon `family_member`).
3. Choix du parent 1 (obligatoire) : liste/search des membres existants.
4. Choix du parent 2 (optionnel) : idem, avec possibilité “Non renseigné”.
5. Optionnel : type de relation par parent (bio / adoptive / step), défaut `bio`.
6. Soumission :  
   - `createFamilyMember` pour l’enfant ;  
   - pour chaque parent choisi (1 ou 2), `addFamilyRelation(parentId, newChildId, relationType)`.

À prévoir côté API : soit une **action composée** “createMemberWithParents(childData, parentIds, relationTypes)” qui fait tout en une transaction, soit garder les appels séparés et les enchaîner côté client (moins idéal pour la cohérence).

### 4.2 Mariage

1. Utilisateur choisit “Mariage / union”.
2. Formulaire “Conjoint” : prénom, nom, date de naissance, etc.
3. Choix du membre existant avec qui ce conjoint est en couple (liste/search).
4. Optionnel : date de mariage / début d’union → `partnership.startDate`.
5. Soumission :  
   - `createFamilyMember` pour le conjoint ;  
   - `addPartnership(existingMemberId, newMemberId, startDate)` (ordre des partenaires sans importance métier).

Idéal : une action “createMemberWithPartnership(memberData, partnerId, startDate?)” en transaction.

---

## 5. Architecture technique recommandée

### 5.1 Actions serveur (Server Actions)

- Garder les opérations DB côté serveur (comme dans `lib/api/family.ts`).
- Pour les cas “création + relation” ou “création + partenariat”, ajouter des **actions composées** qui exécutent tout dans une **transaction** :
  - `createMemberAsChild(childData, parentIdsWithTypes)` : insert membre + N inserts `family_relation`.
  - `createMemberAsPartner(memberData, partnerId, startDate?)` : insert membre + insert `partnership`.

Cela évite des états incohérents (membre créé mais relation échouée).

### 5.2 Validation

- Valider les payloads (ex. Zod) dans les Server Actions : champs requis du membre, IDs de parents/partenaires existants, pas de doublon parent–enfant ou partenariat.
- Vérifier que les IDs de membres sélectionnés existent et appartiennent au bon “arbre” si vous avez une notion de famille/arbre.

### 5.3 UI (composants)

- **Un conteneur “Add member”** : état “step” (choice | birth | marriage) et rendu du sous-formulaire correspondant.
- **Formulaires par flux** : composants dédiés (e.g. `AddMemberBirthForm`, `AddMemberMarriageForm`) qui reçoivent la liste des membres (pour les listes déroulantes / recherche) et appellent la bonne action à la soumission.
- Réutiliser les champs communs (prénom, nom, dates, adresse) dans des sous-composants partagés pour éviter la duplication.

### 5.4 Édition

- **Modification d’un membre** : uniquement les champs de `family_member` (identité, dates, adresse, etc.) → `updateFamilyMember`.
- **Relations parent–enfant** : soit en lecture seule dans l’admin avec une note “Gérer via l’arbre”, soit des actions dédiées “Ajouter un lien parent”, “Retirer un lien”, “Changer le type (bio/step/adoptive)”.
- **Partenariats** : afficher les partenariats existants, permettre d’ajouter une date de fin (divorce/décès) si besoin. Pas de création de partenariat entre deux membres déjà dans l’arbre (hors périmètre).

On peut garder l’édition “membre seul” simple dans un premier temps (comme dans `EditPersonDialog`) et traiter relations/partenariats dans une seconde phase.

---

## 6. Résumé des actions API à avoir

| Action | Rôle |
|--------|------|
| `createFamilyMember` | Déjà présent. |
| `createMemberAsChild(childData, parents)` | Transaction : 1 membre + N `family_relation`. |
| `createMemberAsPartner(memberData, partnerId, startDate?)` | Transaction : 1 membre + 1 `partnership`. |
| `addPartnership(...)` | Utilisé en interne par `createMemberAsPartner` ; peut servir en édition (ex. date de fin). |
| `addFamilyRelation` | Déjà présent. |
| `updateFamilyMember` | Déjà présent. |
| ~~`deleteFamilyMember`~~ | Hors périmètre produit : on ne supprime pas un membre. L’API peut rester en place pour des cas exceptionnels (scripts, admin DB) mais n’est pas exposée dans l’UI. |

---

## 7. Ordre d’implémentation suggéré

1. **Doc et schéma** : valider cette doc et le schéma (notamment `relationType` et éventuellement `endDate` sur `partnership`).
2. **Actions composées** : implémenter `createMemberAsChild` et `createMemberAsPartner` en transaction.
3. **UI “Ajouter un membre”** : étape “Que voulez-vous faire ?” puis formulaires Naissance (1 ou 2 parents), Mariage (1 flux : nouveau conjoint + membre existant).
4. **Liste des membres** pour les sélecteurs : réutiliser la liste déjà chargée en admin (ou endpoint dédié) pour alimenter les listes déroulantes de parents/partenaires.
5. **Édition** : garder l’édition “membre seul” ; ajouter plus tard la gestion explicite des relations/partenariats si besoin.