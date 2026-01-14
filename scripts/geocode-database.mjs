#!/usr/bin/env node

/**
 * Script pour géocoder automatiquement toutes les adresses de la base de données
 * Usage: node scripts/geocode-database.js
 *
 * Ce script :
 * 1. Lit tous les membres avec une adresse mais sans coordonnées
 * 2. Géocode chaque adresse via l'API Nominatim
 * 3. Met à jour la base de données avec les coordonnées trouvées
 */

import { neon, neonConfig } from "@neondatabase/serverless";
import { drizzle } from "drizzle-orm/neon-http";
import { eq, and, isNull, isNotNull } from "drizzle-orm";
import ws from "ws";

// Les variables d'environnement doivent être définies avant d'exécuter le script

// Configuration de la base de données (même config que db/client.ts)
let connectionString =
  process.env.NETLIFY_DATABASE_URL || process.env.DATABASE_URL;

if (!connectionString) {
  console.error(
    "❌ Erreur: DATABASE_URL non définie dans les variables d'environnement"
  );
  process.exit(1);
}

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
neonConfig.webSocketConstructor = ws;

const sqlClient = neon(connectionString);
const db = drizzle(sqlClient);

// Schéma de la table (simplifié pour ce script)
import { pgTable, serial, text, decimal, timestamp } from "drizzle-orm/pg-core";

const familyMember = pgTable("family_member", {
  id: serial("id").primaryKey(),
  firstName: text("first_name").notNull(),
  lastName: text("last_name"),
  address: text("address"),
  latitude: decimal("latitude", { precision: 10, scale: 8 }),
  longitude: decimal("longitude", { precision: 11, scale: 8 }),
});

/**
 * Géocode une adresse via l'API Nominatim
 */
async function geocodeAddress(address) {
  try {
    const encodedAddress = encodeURIComponent(address);
    const url = `https://nominatim.openstreetmap.org/search?format=json&q=${encodedAddress}&limit=1&addressdetails=1`;

    console.log(`  🔍 Recherche: ${address}`);

    const response = await fetch(url, {
      headers: {
        "User-Agent": "FamilyTreeApp/1.0 (geocoding@familytree.com)",
      },
    });

    if (!response.ok) {
      throw new Error(`HTTP ${response.status}: ${response.statusText}`);
    }

    const data = await response.json();

    if (data && data.length > 0) {
      const result = {
        latitude: parseFloat(data[0].lat),
        longitude: parseFloat(data[0].lon),
        displayName: data[0].display_name,
        confidence: data[0].importance || 0,
      };

      console.log(
        `  ✅ Trouvé: [${result.latitude}, ${result.longitude}] - ${result.displayName}`
      );
      return result;
    } else {
      console.log(`  ❌ Aucun résultat trouvé`);
      return null;
    }
  } catch (error) {
    console.error(`  💥 Erreur: ${error.message}`);
    return null;
  }
}

/**
 * Met à jour les coordonnées d'un membre dans la base de données
 */
async function updateMemberCoordinates(memberId, latitude, longitude) {
  try {
    await db
      .update(familyMember)
      .set({
        latitude: latitude.toString(),
        longitude: longitude.toString(),
        updatedAt: new Date(),
      })
      .where(eq(familyMember.id, memberId));

    return true;
  } catch (error) {
    console.error(`  💥 Erreur de mise à jour DB: ${error.message}`);
    return false;
  }
}

/**
 * Fonction principale
 */
async function main() {
  console.log("🗺️  Démarrage du géocodage automatique de la base de données\n");

  try {
    // 1. Récupérer tous les membres avec une adresse mais sans coordonnées
    console.log("📋 Recherche des membres à géocoder...");

    const membersToGeocode = await db
      .select({
        id: familyMember.id,
        firstName: familyMember.firstName,
        lastName: familyMember.lastName,
        address: familyMember.address,
      })
      .from(familyMember)
      .where(
        and(
          isNotNull(familyMember.address),
          isNull(familyMember.latitude),
          isNull(familyMember.longitude)
        )
      );

    console.log(`📊 ${membersToGeocode.length} membre(s) à géocoder\n`);

    if (membersToGeocode.length === 0) {
      console.log(
        "✨ Aucun membre à géocoder. Tous les membres avec adresse ont déjà des coordonnées !"
      );
      return;
    }

    // 2. Géocoder chaque membre
    let successCount = 0;
    let errorCount = 0;
    const delayBetweenRequests = 1200; // 1.2 secondes entre les requêtes (respecter les limites de Nominatim)

    for (let i = 0; i < membersToGeocode.length; i++) {
      const member = membersToGeocode[i];
      const displayName =
        `${member.firstName || ""} ${member.lastName || ""}`.trim() ||
        `ID ${member.id}`;

      console.log(`\n[${i + 1}/${membersToGeocode.length}] 👤 ${displayName}`);
      console.log(`  📍 Adresse: ${member.address}`);

      // Géocoder l'adresse
      const geocodeResult = await geocodeAddress(member.address);

      if (geocodeResult) {
        // Mettre à jour la base de données
        const updateSuccess = await updateMemberCoordinates(
          member.id,
          geocodeResult.latitude,
          geocodeResult.longitude
        );

        if (updateSuccess) {
          console.log(`  💾 Coordonnées sauvegardées en base`);
          successCount++;
        } else {
          console.log(`  ❌ Échec de la sauvegarde`);
          errorCount++;
        }
      } else {
        console.log(`  ⚠️  Adresse non géocodable`);
        errorCount++;
      }

      // Attendre entre les requêtes (sauf pour la dernière)
      if (i < membersToGeocode.length - 1) {
        console.log(`  ⏳ Attente ${delayBetweenRequests}ms...`);
        await new Promise((resolve) =>
          setTimeout(resolve, delayBetweenRequests)
        );
      }
    }

    // 3. Résumé final
    console.log("\n" + "=".repeat(60));
    console.log("📊 RÉSUMÉ DU GÉOCODAGE");
    console.log("=".repeat(60));
    console.log(`✅ Succès: ${successCount} membre(s)`);
    console.log(`❌ Échecs: ${errorCount} membre(s)`);
    console.log(`📍 Total traité: ${membersToGeocode.length} membre(s)`);

    if (successCount > 0) {
      console.log("\n🎉 Géocodage terminé avec succès !");
      console.log(
        "💡 Les coordonnées sont maintenant disponibles pour la carte."
      );
    }

    if (errorCount > 0) {
      console.log("\n⚠️  Certaines adresses n'ont pas pu être géocodées.");
      console.log(
        "💡 Vérifiez le format des adresses ou ajoutez manuellement les coordonnées."
      );
    }
  } catch (error) {
    console.error("\n💥 Erreur fatale:", error);
    process.exit(1);
  }
}

// Gestion des signaux pour un arrêt propre
process.on("SIGINT", () => {
  console.log("\n\n⏹️  Arrêt du script demandé...");
  process.exit(0);
});

process.on("SIGTERM", () => {
  console.log("\n\n⏹️  Arrêt du script...");
  process.exit(0);
});

// Exécution du script
main().catch((error) => {
  console.error("💥 Erreur non gérée:", error);
  process.exit(1);
});
