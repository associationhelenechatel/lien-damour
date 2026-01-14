#!/usr/bin/env node

/**
 * Script de test pour vérifier le géocodage avant le lancement complet
 * Usage: node scripts/test-geocoding.js
 */

// Les variables d'environnement doivent être définies avant d'exécuter le script
// Exemple: DATABASE_URL=your_url node scripts/test-geocoding.js

/**
 * Test de l'API Nominatim avec quelques adresses d'exemple
 */
async function testNominatimAPI() {
  console.log("🧪 Test de l'API Nominatim...\n");

  const testAddresses = [
    "119 Av. André Morizet, 92100 Boulogne-Billancourt, France",
    "Paris, France",
    "Lyon, France",
    "Adresse inexistante 123456",
  ];

  for (const address of testAddresses) {
    console.log(`🔍 Test: ${address}`);

    try {
      const encodedAddress = encodeURIComponent(address);
      const url = `https://nominatim.openstreetmap.org/search?format=json&q=${encodedAddress}&limit=1&addressdetails=1&countrycodes=fr`;

      const response = await fetch(url, {
        headers: {
          "User-Agent": "FamilyTreeApp/1.0 (test@familytree.com)",
        },
      });

      if (!response.ok) {
        console.log(`  ❌ Erreur HTTP: ${response.status}`);
        continue;
      }

      const data = await response.json();

      if (data && data.length > 0) {
        console.log(`  ✅ Trouvé: [${data[0].lat}, ${data[0].lon}]`);
        console.log(`  📍 ${data[0].display_name}`);
      } else {
        console.log(`  ⚠️  Aucun résultat`);
      }
    } catch (error) {
      console.log(`  💥 Erreur: ${error.message}`);
    }

    console.log("");

    // Attendre 1 seconde entre les tests
    await new Promise((resolve) => setTimeout(resolve, 1000));
  }
}

/**
 * Test de la connexion à la base de données
 */
async function testDatabaseConnection() {
  console.log("🗄️  Test de la connexion à la base de données...\n");

  try {
    // Vérifier les variables d'environnement
    const connectionString =
      process.env.NETLIFY_DATABASE_URL || process.env.DATABASE_URL;

    if (!connectionString) {
      console.log(
        "❌ DATABASE_URL non définie dans les variables d'environnement"
      );
      console.log("💡 Vérifiez votre fichier .env.local");
      return false;
    }

    console.log("✅ Variable DATABASE_URL trouvée");

    // Test de connexion basique
    const { neon, neonConfig } = await import("@neondatabase/serverless");
    const { drizzle } = await import("drizzle-orm/neon-http");
    const ws = await import("ws");

    // Configuration pour le développement local
    if (process.env.NODE_ENV === "development") {
      neonConfig.fetchEndpoint = (host) => {
        const [protocol, port] =
          host === "db.localtest.me" ? ["http", 4444] : ["https", 443];
        return `${protocol}://${host}:${port}/sql`;
      };
      const connectionStringUrl = new URL(connectionString);
      neonConfig.useSecureWebSocket =
        connectionStringUrl.hostname !== "db.localtest.me";
      neonConfig.wsProxy = (host) =>
        host === "db.localtest.me" ? `${host}:4444/v2` : `${host}/v2`;
    }
    neonConfig.webSocketConstructor = ws.default;

    const sqlClient = neon(connectionString);
    const db = drizzle(sqlClient);

    // Test simple : compter les membres
    const result = await sqlClient`SELECT COUNT(*) as count FROM family_member`;
    console.log(
      `✅ Connexion réussie - ${result[0].count} membre(s) dans la base`
    );

    // Vérifier si les colonnes latitude/longitude existent
    try {
      await sqlClient`SELECT latitude, longitude FROM family_member LIMIT 1`;
      console.log("✅ Colonnes latitude/longitude présentes");
    } catch (error) {
      console.log("❌ Colonnes latitude/longitude manquantes");
      console.log("💡 Exécutez: yarn db:push");
      return false;
    }

    return true;
  } catch (error) {
    console.log(`❌ Erreur de connexion: ${error.message}`);
    return false;
  }
}

/**
 * Fonction principale de test
 */
async function main() {
  console.log("🧪 TESTS DE PRÉPARATION AU GÉOCODAGE");
  console.log("=".repeat(50));
  console.log("");

  // Test 1: Connexion base de données
  const dbOk = await testDatabaseConnection();
  console.log("");

  if (!dbOk) {
    console.log("❌ Les tests de base de données ont échoué");
    console.log("💡 Corrigez les problèmes avant de lancer le géocodage");
    process.exit(1);
  }

  // Test 2: API Nominatim
  await testNominatimAPI();

  // Résumé
  console.log("=".repeat(50));
  console.log("✅ TOUS LES TESTS SONT PASSÉS");
  console.log("");
  console.log("🚀 Vous pouvez maintenant lancer:");
  console.log("   • yarn db:geocode-status  (voir l'état actuel)");
  console.log("   • yarn db:geocode         (lancer le géocodage)");
  console.log("");
}

main().catch((error) => {
  console.error("💥 Erreur lors des tests:", error);
  process.exit(1);
});
