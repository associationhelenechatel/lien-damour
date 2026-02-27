# Matricule (code) – place dans l'arbre généalogique

Le champ `code` (matricule) d’un membre de la famille identifie sa **place dans l’arbre généalogique**. Il est dérivé uniquement des relations (parent-enfant) et des partenariats, pas du prénom ou du nom.

## Règles

1. **Ancêtre racine** (l’origine de l’arbre, ex. Hélène Damour)  
   - Code : **`0`**

2. **Enfants directs de la racine**  
   - Numérotés dans l’ordre : **`1`**, **`2`**, **`3`**, …

3. **Enfants d’une personne de code `X`**  
   - Premier enfant : **`X.1`**, deuxième : **`X.2`**, etc.  
   - Ex. : premier enfant de la personne `1` → **`1.1`**, deuxième → **`1.2`**.

4. **Conjoint d’une personne de code `X`**  
   - Code du conjoint : **`X.0`**  
   - Ex. : conjoint de la personne `1.1` → **`1.1.0`**.

## Résumé

| Rôle        | Code   | Exemple                    |
|------------|--------|----------------------------|
| Racine     | `0`    | Hélène                     |
| Enfant     | `X.k`  | 1er enfant de `1` → `1.1`  |
| Conjoint   | `X.0`  | Conjoint de `1.1` → `1.1.0` |

Le matricule reflète donc la **position dans l’arbre** (génération, branche, rang parmi les frères et sœurs, et conjoint).

## Données mock

Les codes des membres dans `data/mock-family-data.ts` respectent cette logique pour l’arbre défini par `familyRelations` et `partnerships` (Hélène = racine, Jean et Paul = enfants de la racine, etc.).

## Tri

Dans `lib/family-tree-service.ts`, les membres sont triés par `code` (`asc(familyMember.code)`) pour afficher l’arbre dans un ordre cohérent (racine, puis branches par préfixe).
