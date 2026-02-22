#!/bin/bash

# Script pour restaurer un dump vers la base de données de production Neon
# Usage: ./scripts/restore-production.sh <fichier_dump.sql>
# Charge les variables depuis .env.prod (NETLIFY_DATABASE_URL).

set -e

# Aller à la racine du projet
SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
PROJECT_ROOT="$(cd "$SCRIPT_DIR/.." && pwd)"
cd "$PROJECT_ROOT"

# Charger uniquement .env.prod
ENV_PROD="$PROJECT_ROOT/.env.prod"
if [ ! -f "$ENV_PROD" ]; then
  echo "❌ Erreur: Fichier .env.prod introuvable (vérifié: $ENV_PROD)"
  echo "   Créez .env.prod avec NETLIFY_DATABASE_URL (URL Neon)."
  exit 1
fi
echo "📂 Chargement des variables depuis .env.prod"
set -a
# shellcheck source=.env.prod
. "$ENV_PROD"
set +a

if [ -z "$NETLIFY_DATABASE_URL" ] && [ -z "$PRODUCTION_DATABASE_URL" ]; then
  echo "❌ Erreur: NETLIFY_DATABASE_URL (ou PRODUCTION_DATABASE_URL) absent dans .env.prod"
  exit 1
fi
DB_URL="${NETLIFY_DATABASE_URL:-$PRODUCTION_DATABASE_URL}"

# Vérifier les arguments
if [ $# -eq 0 ]; then
    echo "❌ Usage: $0 <fichier_dump.sql>"
    echo "💡 Exemple: $0 dumps/production_20260222_224855.sql"
    echo ""
    echo "📁 Dumps disponibles:"
    ls -la dumps/*.sql 2>/dev/null || echo "   Aucun dump trouvé dans le dossier dumps/"
    exit 1
fi

DUMP_FILE="$1"

# Vérifier que le fichier existe
if [ ! -f "$DUMP_FILE" ]; then
    echo "❌ Fichier non trouvé: $DUMP_FILE"
    exit 1
fi

echo "🚀 Restauration vers la base de données de production..."
echo "📁 Fichier dump: $DUMP_FILE"
echo "🔗 Base de données: ${DB_URL%%@*}@***" # Masquer les credentials

# Demander confirmation
if [ "$CONFIRM_RESTORE" != "yes" ]; then
    echo ""
    echo "⚠️  ATTENTION: Cette opération va SUPPRIMER toutes les données existantes !"
    echo "⚠️  Pour confirmer, définissez CONFIRM_RESTORE=yes"
    echo ""
    echo "💡 Exemple:"
    echo "   CONFIRM_RESTORE=yes $0 $DUMP_FILE"
    exit 1
fi

echo "✅ Confirmation reçue, début de la restauration..."

# Vérifier la connexion
echo "🔍 Test de connexion..."
psql "$DB_URL" -c "SELECT version();" > /dev/null

if [ $? -eq 0 ]; then
    echo "✅ Connexion à la base de données réussie"
else
    echo "❌ Impossible de se connecter à la base de données"
    echo "💡 Vérifiez l'URL de connexion"
    exit 1
fi

# Afficher des infos sur le dump
echo "📊 Informations sur le dump:"
SIZE=$(du -h "$DUMP_FILE" | cut -f1)
LINES=$(wc -l < "$DUMP_FILE")
echo "   - Taille: $SIZE"
echo "   - Lignes: $LINES"

# Restaurer le dump
echo "📦 Restauration en cours..."
psql "$DB_URL" < "$DUMP_FILE"

if [ $? -eq 0 ]; then
    echo "✅ Restauration terminée avec succès !"
    
    # Vérifier que les données ont été importées
    echo "🔍 Vérification des données importées..."
    MEMBER_COUNT=$(psql "$DB_URL" -t -c "SELECT COUNT(*) FROM family_member;" | tr -d ' ')
    RELATION_COUNT=$(psql "$DB_URL" -t -c "SELECT COUNT(*) FROM family_relation;" | tr -d ' ')
    PARTNERSHIP_COUNT=$(psql "$DB_URL" -t -c "SELECT COUNT(*) FROM partnership;" | tr -d ' ')
    
    echo "📊 Données importées:"
    echo "   - Membres: $MEMBER_COUNT"
    echo "   - Relations: $RELATION_COUNT"
    echo "   - Partenariats: $PARTNERSHIP_COUNT"
    
    echo ""
    echo "🎉 Import terminé avec succès !"
    
else
    echo "❌ Erreur lors de la restauration"
    exit 1
fi
