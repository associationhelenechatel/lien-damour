#!/bin/bash

# Script pour exécuter les scripts Node.js avec les variables d'environnement
# Usage: ./scripts/run-with-env.sh script-name.js

if [ -f .env.local ]; then
    echo "📋 Chargement des variables d'environnement depuis .env.local"
    export $(cat .env.local | grep -v '^#' | xargs)
fi

if [ -f .env ]; then
    echo "📋 Chargement des variables d'environnement depuis .env"
    export $(cat .env | grep -v '^#' | xargs)
fi

if [ -z "$1" ]; then
    echo "❌ Usage: $0 <script-name.js>"
    exit 1
fi

echo "🚀 Exécution de $1..."
node "$1"
