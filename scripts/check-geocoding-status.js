#!/usr/bin/env node

/**
 * Script pour vérifier l'état du géocodage dans la base de données
 * Usage: node scripts/check-geocoding-status.js
 */

import { neon, neonConfig } from "@neondatabase/serverless";
import { drizzle } from "drizzle-orm/neon-http";
import { isNull, isNotNull, and } from "drizzle-orm";
import ws from "ws";

// Les variables d'environnement doivent être définies avant d'exécuter le script

// Configuration de la base de données
let connectionString =
  process.env.NETLIFY_DATABASE_URL || process.env.DATABASE_URL;

if (!connectionString) {
  console.error("❌ Erreur: DATABASE_URL non définie");
  process.exit(1);
}

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

// Schéma simplifié
import { pgTable, serial, text, decimal } from "drizzle-orm/pg-core";

const familyMember = pgTable("family_member", {
  id: serial("id").primaryKey(),
  firstName: text("first_name").notNull(),
  lastName: text("last_name"),
  address: text("address"),
  latitude: decimal("latitude", { precision: 10, scale: 8 }),
  longitude: decimal("longitude", { precision: 11, scale: 8 }),
});

async function main() {
  console.log("📊 ÉTAT DU GÉOCODAGE DE LA BASE DE DONNÉES");
  console.log("=".repeat(50));

  try {
    // Statistiques générales
    const totalMembers =
      await sqlClient`SELECT COUNT(*) as count FROM family_member`;
    const membersWithAddress =
      await sqlClient`SELECT COUNT(*) as count FROM family_member WHERE address IS NOT NULL`;
    const membersWithCoordinates =
      await sqlClient`SELECT COUNT(*) as count FROM family_member WHERE latitude IS NOT NULL AND longitude IS NOT NULL`;
    const membersNeedingGeocode =
      await sqlClient`SELECT COUNT(*) as count FROM family_member WHERE address IS NOT NULL AND latitude IS NULL AND longitude IS NULL`;

    console.log(`👥 Total des membres: ${totalMembers[0].count}`);
    console.log(`📍 Membres avec adresse: ${membersWithAddress[0].count}`);
    console.log(`🗺️  Membres géocodés: ${membersWithCoordinates[0].count}`);
    console.log(`⏳ À géocoder: ${membersNeedingGeocode[0].count}`);

    if (membersWithAddress[0].count > 0) {
      const percentage = Math.round(
        (membersWithCoordinates[0].count / membersWithAddress[0].count) * 100
      );
      console.log(`📈 Progression: ${percentage}%`);
    }

    // Détail des membres à géocoder
    if (membersNeedingGeocode[0].count > 0) {
      console.log("\n🔍 MEMBRES À GÉOCODER:");
      console.log("-".repeat(50));

      const needingGeocode = await sqlClient`
        SELECT id, first_name, last_name, address 
        FROM family_member 
        WHERE address IS NOT NULL AND latitude IS NULL AND longitude IS NULL 
        LIMIT 10
      `;

      needingGeocode.forEach((member, index) => {
        const displayName =
          `${member.first_name || ""} ${member.last_name || ""}`.trim() ||
          `ID ${member.id}`;
        console.log(`${index + 1}. ${displayName}`);
        console.log(`   📍 ${member.address}`);
      });

      if (membersNeedingGeocode[0].count > 10) {
        console.log(
          `   ... et ${membersNeedingGeocode[0].count - 10} autre(s)`
        );
      }
    }

    // Détail des membres géocodés (échantillon)
    if (membersWithCoordinates[0].count > 0) {
      console.log("\n✅ ÉCHANTILLON DES MEMBRES GÉOCODÉS:");
      console.log("-".repeat(50));

      const geocoded = await sqlClient`
        SELECT first_name, last_name, address, latitude, longitude 
        FROM family_member 
        WHERE latitude IS NOT NULL AND longitude IS NOT NULL 
        LIMIT 5
      `;

      geocoded.forEach((member, index) => {
        const displayName = `${member.first_name || ""} ${
          member.last_name || ""
        }`.trim();
        console.log(`${index + 1}. ${displayName}`);
        console.log(`   📍 ${member.address}`);
        console.log(`   🌍 [${member.latitude}, ${member.longitude}]`);
      });

      if (membersWithCoordinates[0].count > 5) {
        console.log(
          `   ... et ${membersWithCoordinates[0].count - 5} autre(s)`
        );
      }
    }

    console.log("\n" + "=".repeat(50));

    if (membersNeedingGeocode[0].count > 0) {
      console.log("💡 Pour géocoder automatiquement: yarn db:geocode");
    } else {
      console.log("🎉 Tous les membres avec adresse sont géocodés !");
    }
  } catch (error) {
    console.error("💥 Erreur:", error);
    process.exit(1);
  }
}

main().catch(console.error);
