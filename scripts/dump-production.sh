#!/bin/bash

# Script pour créer un dump de la base de données de production (Neon)
# Usage: export NETLIFY_DATABASE_URL='postgresql://...' && ./scripts/dump-production.sh
# N'utilise que NETLIFY_DATABASE_URL ou PRODUCTION_DATABASE_URL (jamais DATABASE_URL = locale)

set -e

# Aller à la racine du projet
SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
PROJECT_ROOT="$(cd "$SCRIPT_DIR/.." && pwd)"
cd "$PROJECT_ROOT"

# Charger uniquement .env.prod (pas de repli sur .env.local)
ENV_PROD="$PROJECT_ROOT/.env.prod"
if [ ! -f "$ENV_PROD" ]; then
  echo "❌ Erreur: Fichier .env.prod introuvable (vérifié: $ENV_PROD)"
  echo "   Créez .env.prod avec NETLIFY_DATABASE_URL (URL Neon unpooled)."
  exit 1
fi
set -a
# shellcheck source=.env.prod
. "$ENV_PROD"
set +a

# Vérifier que l'URL de prod est bien définie
if [ -z "$NETLIFY_DATABASE_URL" ] && [ -z "$PRODUCTION_DATABASE_URL" ]; then
  echo "❌ Erreur: NETLIFY_DATABASE_URL absent dans .env.prod"
  echo "   Vérifiez que .env.prod contient une ligne: NETLIFY_DATABASE_URL=postgresql://..."
  exit 1
fi

DB_URL="${NETLIFY_DATABASE_URL:-$PRODUCTION_DATABASE_URL}"

# Refuser explicitement si l'URL pointe vers du local (éviter de dumper la mauvaise base)
if echo "$DB_URL" | grep -qE 'localhost|127\.0\.0\.1|host\.docker\.internal'; then
  echo "❌ Erreur: L'URL utilisée pointe vers une base locale (localhost / Docker)."
  echo "   Pour dumper la PRODUCTION, définissez NETLIFY_DATABASE_URL avec l'URL Neon (dashboard Neon ou Netlify)."
  exit 1
fi

# Nom du fichier de dump avec timestamp
TIMESTAMP=$(date +"%Y%m%d_%H%M%S")
DUMP_FILE="dumps/production_${TIMESTAMP}.sql"

mkdir -p dumps

# Test de connexion
echo "🔍 Test de connexion..."
if ! psql "$DB_URL" -c "SELECT version();" > /dev/null; then
  echo "❌ Impossible de se connecter à la base de données"
  echo "💡 Utilisez de préférence l'URL de connexion directe (sans pool) Neon"
  exit 1
fi
echo "✅ Connexion OK"

# Créer le dump
echo "📦 Création du dump..."
pg_dump "$DB_URL" \
  -F p \
  --clean \
  --if-exists \
  --no-owner \
  --no-privileges \
  -f "$DUMP_FILE"

if [ $? -eq 0 ]; then
  echo "✅ Dump créé: $DUMP_FILE"
  SIZE=$(du -h "$DUMP_FILE" | cut -f1)
  LINES=$(wc -l < "$DUMP_FILE")
  echo "📊 Taille: $SIZE | Lignes: $LINES"
  echo ""
  echo "🎉 Terminé. Pour restaurer en local :"
  echo "   ./scripts/restore-local-db.sh $DUMP_FILE"
else
  echo "❌ Erreur lors du dump"
  exit 1
fi
