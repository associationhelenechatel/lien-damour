# 🗄️ Guide de Dump et Restauration PostgreSQL

Guide rapide pour sauvegarder votre base locale et la restaurer en production.

## 🚀 Étapes Rapides

### 1. Créer un dump de votre base locale

```bash
# Démarrer Docker si pas encore fait
docker-compose up -d

# Attendre que la DB soit prête, puis créer le dump
yarn db:dump
```

### 2. Restaurer en production

```bash
# Récupérer l'URL Neon depuis Netlify ou Neon Dashboard
export NETLIFY_DATABASE_URL="postgresql://user:pass@host/db"

# Restaurer le dump (remplacez par le nom de votre fichier)
CONFIRM_RESTORE=yes yarn db:restore:prod dumps/family_tree_YYYYMMDD_HHMMSS.sql
```

## 📋 Prérequis

### Outils nécessaires
- `pg_dump` et `psql` (installés avec PostgreSQL)
- Docker (pour la base locale)
- Accès à votre base Neon

### Installation PostgreSQL (si pas installé)

**macOS:**
```bash
brew install postgresql
```

**Ubuntu/Debian:**
```bash
sudo apt-get install postgresql-client
```

**Windows:**
- Télécharger depuis [postgresql.org](https://www.postgresql.org/download/windows/)

## 🔧 Configuration

### Variables d'environnement

```bash
# URL de votre base Neon (récupérez-la depuis Netlify ou Neon Dashboard)
export NETLIFY_DATABASE_URL="postgresql://username:password@host:5432/database"

# Ou utilisez DATABASE_URL si vous préférez
export DATABASE_URL="postgresql://username:password@host:5432/database"
```

### Où trouver l'URL Neon

1. **Netlify Dashboard:**
   - Site Settings → Environment Variables
   - Cherchez `NETLIFY_DATABASE_URL`

2. **Neon Dashboard:**
   - [console.neon.tech](https://console.neon.tech)
   - Votre projet → Connection String

## 📊 Ce que font les scripts

### `dump-production.sh`
- Se connecte à la base Neon de production (via `NETLIFY_DATABASE_URL` ou `PRODUCTION_DATABASE_URL`)
- **N'utilise pas** `DATABASE_URL` (souvent la base locale Docker) pour éviter de dumper la mauvaise base
- Refuse de lancer si l’URL contient localhost / 127.0.0.1
- Charge `.env.local` si présent (où vous pouvez définir `NETLIFY_DATABASE_URL`)
- Crée un dump dans `dumps/production_YYYYMMDD_HHMMSS.sql`
- Usage : `export NETLIFY_DATABASE_URL='postgresql://...' && yarn db:dump:prod`

### `restore-production.sh`
- Vérifie la connexion à Neon
- Demande confirmation obligatoire (`CONFIRM_RESTORE=yes`)
- Restaure le dump complet
- Vérifie que les données ont été importées
- Affiche les statistiques finales

## 🛡️ Sécurités

- **Confirmation obligatoire** : `CONFIRM_RESTORE=yes` requis
- **Test de connexion** avant restauration
- **Vérification des données** après import
- **Messages d'erreur détaillés**

## 🐛 Dépannage

### Erreur "pg_dump: command not found"
```bash
# macOS
brew install postgresql

# Ubuntu/Debian  
sudo apt-get install postgresql-client
```

### Erreur de connexion locale
```bash
# Vérifier que Docker tourne
docker-compose ps

# Redémarrer si nécessaire
docker-compose down && docker-compose up -d
```

### Erreur de connexion Neon
- Vérifiez l'URL dans Netlify/Neon Dashboard
- Testez la connexion : `psql "$NETLIFY_DATABASE_URL" -c "SELECT 1;"`

### Dump trop gros
- Les dumps sont automatiquement compressés (.gz)
- Utilisez la version compressée si nécessaire

## 💡 Conseils

1. **Testez d'abord** avec une base de test
2. **Sauvegardez** avant de restaurer en production  
3. **Vérifiez** les données après restauration
4. **Gardez** plusieurs versions de dumps

## 📞 Commandes utiles

```bash
# Lister les dumps disponibles
ls -la dumps/

# Tester la connexion Neon
psql "$NETLIFY_DATABASE_URL" -c "SELECT version();"

# Voir le contenu d'un dump (premières lignes)
head -50 dumps/family_tree_*.sql

# Compresser manuellement un dump
gzip dumps/family_tree_*.sql
```
