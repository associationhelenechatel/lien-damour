# 🗺️ Guide de Géocodage Automatique

Ce guide explique comment utiliser les scripts de géocodage pour convertir automatiquement les adresses de votre base de données en coordonnées géographiques.

## 📋 Prérequis

1. **Migration de base de données** : Assurez-vous que les colonnes `latitude` et `longitude` existent
   ```bash
   yarn db:push
   ```

2. **Variables d'environnement** : Vérifiez que `DATABASE_URL` est configurée dans `.env.local`

## 🚀 Utilisation

### 1. Vérifier l'état actuel
```bash
yarn db:geocode-status
```
Ce script affiche :
- Nombre total de membres
- Membres avec/sans adresse
- Membres déjà géocodés
- Membres à géocoder
- Échantillons des données

### 2. Lancer le géocodage automatique
```bash
yarn db:geocode
```
Ce script :
- Lit tous les membres avec une adresse mais sans coordonnées
- Géocode chaque adresse via l'API Nominatim d'OpenStreetMap
- Met à jour la base de données avec les coordonnées trouvées
- Respecte les limites de l'API (1.2s entre chaque requête)

## 📊 Exemple de sortie

### État du géocodage
```
📊 ÉTAT DU GÉOCODAGE DE LA BASE DE DONNÉES
==================================================
👥 Total des membres: 25
📍 Membres avec adresse: 15
🗺️  Membres géocodés: 8
⏳ À géocoder: 7
📈 Progression: 53%
```

### Géocodage en cours
```
🗺️  Démarrage du géocodage automatique de la base de données

📋 Recherche des membres à géocoder...
📊 7 membre(s) à géocoder

[1/7] 👤 Jean Dupont
  📍 Adresse: 119 Av. André Morizet, 92100 Boulogne-Billancourt, France
  🔍 Recherche: 119 Av. André Morizet, 92100 Boulogne-Billancourt, France
  ✅ Trouvé: [48.8366156, 2.2407572] - 119, Avenue André Morizet, Boulogne-Billancourt, France
  💾 Coordonnées sauvegardées en base
  ⏳ Attente 1200ms...
```

## ⚙️ Configuration

### Limites de l'API Nominatim
- **Délai entre requêtes** : 1.2 secondes (configurable dans le script)
- **Limite quotidienne** : Pas de limite stricte mais usage raisonnable recommandé
- **User-Agent** : Configuré automatiquement

### Filtres de géocodage
Le script géocode uniquement :
- Les membres ayant une adresse renseignée
- Les membres n'ayant pas encore de coordonnées
- Limite la recherche à la France (`countrycodes=fr`)

## 🛠️ Personnalisation

### Modifier le délai entre requêtes
Dans `scripts/geocode-database.js`, ligne ~95 :
```javascript
const delayBetweenRequests = 1200; // Modifier cette valeur (en millisecondes)
```

### Ajouter des filtres
Vous pouvez modifier les requêtes SQL pour :
- Géocoder seulement certains membres
- Re-géocoder des coordonnées existantes
- Filtrer par ville, région, etc.

## 🚨 Gestion d'erreurs

### Adresses non trouvées
Certaines adresses peuvent ne pas être géocodées :
- Format d'adresse non reconnu
- Adresse incomplète ou erronée
- Lieu trop spécifique ou récent

### Solutions
1. **Vérifier le format** : `Numéro Rue, Code postal Ville, France`
2. **Simplifier l'adresse** : Garder seulement `Ville, France`
3. **Ajouter manuellement** : Utiliser Drizzle Studio pour saisir les coordonnées

## 📍 Coordonnées manuelles

Si le géocodage automatique échoue, vous pouvez :

1. **Utiliser Google Maps** :
   - Rechercher l'adresse
   - Clic droit → "Qu'y a-t-il ici ?"
   - Copier les coordonnées

2. **Mettre à jour via Drizzle Studio** :
   ```bash
   yarn db:studio
   ```

3. **Requête SQL directe** :
   ```sql
   UPDATE family_member 
   SET latitude = 48.8366, longitude = 2.2407 
   WHERE id = 123;
   ```

## 🎯 Résultats

Une fois le géocodage terminé :
- Les pins apparaissent automatiquement sur la carte
- Pas besoin de redémarrer l'application
- Les coordonnées sont stockées définitivement

## 📞 Support

En cas de problème :
1. Vérifier les logs du script
2. Contrôler la connexion à la base de données
3. Tester avec une seule adresse d'abord
4. Vérifier le format des adresses dans la base
