#!/bin/bash

# Script pour restaurer la base de données locale depuis un dump SQL
# Usage: ./scripts/restore-local-db.sh [nom-du-fichier.sql]

set -e

# Variables
DB_HOST="localhost"
DB_PORT="5435"
DB_USER="postgres"
DB_PASSWORD="postgres"
DB_NAME="main"

# Fichier de dump (par défaut le plus récent)
DUMP_FILE="${1:-dumps/family_tree_20250925_141357.sql}"

# Vérifier que le fichier existe
if [ ! -f "$DUMP_FILE" ]; then
  echo "❌ Erreur: Le fichier $DUMP_FILE n'existe pas"
  exit 1
fi

echo "📦 Restauration de la base de données depuis $DUMP_FILE..."

# Vérifier que Docker est démarré
if ! docker-compose ps | grep -q "postgres.*Up"; then
  echo "⚠️  Docker n'est pas démarré. Démarrage..."
  docker-compose up -d postgres
  echo "⏳ Attente que PostgreSQL soit prêt..."
  sleep 5
fi

# Restaurer le dump
export PGPASSWORD=$DB_PASSWORD
psql -h $DB_HOST -p $DB_PORT -U $DB_USER -d $DB_NAME -f "$DUMP_FILE"

echo "✅ Restauration terminée !"
echo ""
echo "Vous pouvez maintenant vérifier avec:"
echo "  docker-compose exec postgres psql -U postgres -d main -c 'SELECT COUNT(*) FROM family_member;'"

