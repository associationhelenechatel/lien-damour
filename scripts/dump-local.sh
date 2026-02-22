#!/bin/bash

# Script pour créer un dump de la base de données locale
# Usage: ./scripts/dump-local.sh

set -e

echo "🗄️  Création du dump de la base de données locale..."

# Configuration de la base locale (Docker)
DB_HOST="localhost"
DB_PORT="5435"
DB_NAME="main"
DB_USER="postgres"
DB_PASSWORD="postgres"

# Nom du fichier de dump avec timestamp
TIMESTAMP=$(date +"%Y%m%d_%H%M%S")
DUMP_FILE="dumps/local_${TIMESTAMP}.sql"

# Créer le dossier dumps s'il n'existe pas
mkdir -p dumps

echo "📁 Fichier de dump: $DUMP_FILE"

# Vérifier que la base de données est accessible
echo "🔍 Vérification de la connexion à la base de données..."
PGPASSWORD=$DB_PASSWORD psql -h $DB_HOST -p $DB_PORT -U $DB_USER -d $DB_NAME -c "SELECT version();" > /dev/null

if [ $? -eq 0 ]; then
    echo "✅ Connexion à la base de données réussie"
else
    echo "❌ Impossible de se connecter à la base de données"
    echo "💡 Assurez-vous que Docker est démarré: docker-compose up -d"
    exit 1
fi

# Créer le dump
echo "📦 Création du dump..."
PGPASSWORD=$DB_PASSWORD pg_dump \
    -h $DB_HOST \
    -p $DB_PORT \
    -U $DB_USER \
    -d $DB_NAME \
    --clean \
    --if-exists \
    --no-owner \
    --no-privileges \
    --verbose \
    > $DUMP_FILE

if [ $? -eq 0 ]; then
    echo "✅ Dump créé avec succès: $DUMP_FILE"
    
    # Afficher la taille du fichier
    SIZE=$(du -h $DUMP_FILE | cut -f1)
    echo "📊 Taille du dump: $SIZE"
    
    # Compter les lignes pour avoir une idée du contenu
    LINES=$(wc -l < $DUMP_FILE)
    echo "📄 Nombre de lignes: $LINES"
    
    echo ""
    echo "🎉 Dump terminé avec succès !"
    echo "📁 Fichier créé:"
    echo "   - $DUMP_FILE"
    
else
    echo "❌ Erreur lors de la création du dump"
    exit 1
fi
