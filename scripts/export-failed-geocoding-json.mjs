#!/usr/bin/env node

/**
 * Script pour exporter en JSON toutes les adresses qui n'ont pas pu être géocodées
 * Usage: node scripts/export-failed-geocoding-json.mjs
 * Sortie: scripts/failed-geocoding.json
 */

import { neon, neonConfig } from "@neondatabase/serverless";
import { drizzle } from "drizzle-orm/neon-http";
import { writeFileSync } from "fs";
import { join, dirname } from "path";
import { fileURLToPath } from "url";
import ws from "ws";

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

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

async function main() {
  try {
    // Récupérer toutes les adresses non géocodées
    const failedAddresses = await sqlClient`
      SELECT id, first_name, last_name, address 
      FROM family_member 
      WHERE address IS NOT NULL 
      AND address != ''
      AND (latitude IS NULL OR longitude IS NULL)
      ORDER BY address, last_name, first_name
    `;

    if (failedAddresses.length === 0) {
      const result = {
        success: true,
        message: "Toutes les adresses ont été géocodées avec succès",
        total: 0,
        addresses: [],
        timestamp: new Date().toISOString(),
      };

      const outputPath = join(__dirname, "failed-geocoding.json");
      writeFileSync(outputPath, JSON.stringify(result, null, 2), "utf8");
      console.log(`✅ Aucune adresse non géocodée trouvée`);
      console.log(`📄 Fichier créé: ${outputPath}`);
      return;
    }

    // Grouper par adresse pour éviter les doublons
    const addressGroups = {};
    failedAddresses.forEach((member) => {
      const address = member.address.trim();
      if (!addressGroups[address]) {
        addressGroups[address] = {
          address: address,
          members: [],
        };
      }
      addressGroups[address].members.push({
        id: member.id,
        firstName: member.first_name,
        lastName: member.last_name,
        fullName:
          `${member.first_name || ""} ${member.last_name || ""}`.trim() ||
          `ID ${member.id}`,
      });
    });

    // Analyser les types d'adresses problématiques
    const categorizedAddresses = Object.values(addressGroups).map((group) => {
      const lowerAddress = group.address.toLowerCase();
      let category = "other";
      let reason = "Format d'adresse non reconnu";

      if (
        lowerAddress.includes("italie") ||
        lowerAddress.includes("italy") ||
        lowerAddress.includes("royaume-uni") ||
        lowerAddress.includes("uk") ||
        lowerAddress.includes("united kingdom") ||
        lowerAddress.includes("suisse") ||
        lowerAddress.includes("switzerland") ||
        lowerAddress.includes("usa") ||
        lowerAddress.includes("singapoure") ||
        lowerAddress.includes("singapore") ||
        lowerAddress.includes("maroc") ||
        lowerAddress.includes("portugal") ||
        lowerAddress.includes("londres") ||
        lowerAddress.includes("london") ||
        lowerAddress.includes("los angeles") ||
        lowerAddress.includes("casablanca") ||
        lowerAddress.includes("lisboa") ||
        lowerAddress.includes("rotterdam") ||
        lowerAddress.includes("allemagne") ||
        lowerAddress.includes("pologne") ||
        lowerAddress.includes("côte d'ivoire")
      ) {
        category = "international";
        reason =
          "Adresse hors France (API configurée pour la France uniquement)";
      } else if (
        group.address.trim() === "" ||
        group.address.length < 10 ||
        !group.address.includes(" ") ||
        lowerAddress === "paris, france"
      ) {
        category = "incomplete";
        reason = "Adresse incomplète ou trop vague";
      } else if (
        lowerAddress.includes("c/o") ||
        lowerAddress.includes("bat ") ||
        lowerAddress.includes("résidence") ||
        lowerAddress.includes("foyer") ||
        lowerAddress.includes("villa") ||
        lowerAddress.includes('"') ||
        lowerAddress.includes("esat")
      ) {
        category = "complex";
        reason = "Format d'adresse complexe (résidence, bâtiment, institution)";
      }

      return {
        ...group,
        category: category,
        reason: reason,
        memberCount: group.members.length,
      };
    });

    // Statistiques par catégorie
    const stats = {
      international: categorizedAddresses.filter(
        (a) => a.category === "international"
      ).length,
      incomplete: categorizedAddresses.filter(
        (a) => a.category === "incomplete"
      ).length,
      complex: categorizedAddresses.filter((a) => a.category === "complex")
        .length,
      other: categorizedAddresses.filter((a) => a.category === "other").length,
    };

    const totalMembers = categorizedAddresses.reduce(
      (sum, group) => sum + group.memberCount,
      0
    );

    // Résultat final
    const result = {
      success: true,
      timestamp: new Date().toISOString(),
      summary: {
        totalUniqueAddresses: categorizedAddresses.length,
        totalMembersAffected: totalMembers,
        categoriesBreakdown: stats,
      },
      addresses: categorizedAddresses.sort((a, b) => {
        // Trier par catégorie puis par adresse
        if (a.category !== b.category) {
          const order = ["international", "complex", "incomplete", "other"];
          return order.indexOf(a.category) - order.indexOf(b.category);
        }
        return a.address.localeCompare(b.address);
      }),
    };

    // Écrire le fichier JSON
    const outputPath = join(__dirname, "failed-geocoding.json");
    writeFileSync(outputPath, JSON.stringify(result, null, 2), "utf8");

    console.log(`🔍 Analyse terminée !`);
    console.log(
      `📊 ${result.summary.totalUniqueAddresses} adresses uniques non géocodées`
    );
    console.log(`👥 ${result.summary.totalMembersAffected} membres concernés`);
    console.log(`📄 Fichier JSON créé: ${outputPath}`);
    console.log(`\n📋 Répartition par catégorie:`);
    console.log(
      `   🌍 Internationales: ${result.summary.categoriesBreakdown.international}`
    );
    console.log(
      `   🏢 Complexes: ${result.summary.categoriesBreakdown.complex}`
    );
    console.log(
      `   📝 Incomplètes: ${result.summary.categoriesBreakdown.incomplete}`
    );
    console.log(`   ❓ Autres: ${result.summary.categoriesBreakdown.other}`);
  } catch (error) {
    const errorResult = {
      success: false,
      error: error.message,
      timestamp: new Date().toISOString(),
    };

    const outputPath = join(__dirname, "failed-geocoding.json");
    writeFileSync(outputPath, JSON.stringify(errorResult, null, 2), "utf8");

    console.error(`💥 Erreur: ${error.message}`);
    console.error(`📄 Erreur sauvegardée dans: ${outputPath}`);
    process.exit(1);
  }
}

main().catch(console.error);
