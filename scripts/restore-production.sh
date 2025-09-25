#!/bin/bash

# Script pour restaurer un dump vers la base de données de production Neon
# Usage: ./scripts/restore-production.sh [fichier_dump.sql]

set -e

# Vérifier les arguments
if [ $# -eq 0 ]; then
    echo "❌ Usage: $0 <fichier_dump.sql>"
    echo "💡 Exemple: $0 dumps/family_tree_20241225_120000.sql"
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

# Vérifier les variables d'environnement
if [ -z "$NETLIFY_DATABASE_URL" ] && [ -z "$DATABASE_URL" ]; then
    echo "❌ Erreur: NETLIFY_DATABASE_URL ou DATABASE_URL doit être défini"
    echo "💡 Exemple:"
    echo "   export NETLIFY_DATABASE_URL='postgresql://user:pass@host/db'"
    echo "   $0 $DUMP_FILE"
    exit 1
fi

# Utiliser NETLIFY_DATABASE_URL en priorité
DB_URL="${NETLIFY_DATABASE_URL:-$DATABASE_URL}"

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
