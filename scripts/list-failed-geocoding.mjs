#!/usr/bin/env node

/**
 * Script pour lister toutes les adresses qui n'ont pas pu être géocodées
 * Usage: node scripts/list-failed-geocoding.mjs
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

async function main() {
  console.log("🔍 LISTE DES ADRESSES NON GÉOCODÉES");
  console.log("=".repeat(60));
  console.log("");

  try {
    // Récupérer toutes les adresses non géocodées
    const failedAddresses = await sqlClient`
      SELECT id, first_name, last_name, address 
      FROM family_member 
      WHERE address IS NOT NULL 
      AND address != ''
      AND (latitude IS NULL OR longitude IS NULL)
      ORDER BY address
    `;

    if (failedAddresses.length === 0) {
      console.log("🎉 Toutes les adresses ont été géocodées avec succès !");
      return;
    }

    console.log(`📊 ${failedAddresses.length} adresse(s) non géocodée(s)\n`);

    // Grouper par adresse pour éviter les doublons
    const addressGroups = {};
    failedAddresses.forEach((member) => {
      const address = member.address.trim();
      if (!addressGroups[address]) {
        addressGroups[address] = [];
      }
      addressGroups[address].push({
        id: member.id,
        name:
          `${member.first_name || ""} ${member.last_name || ""}`.trim() ||
          `ID ${member.id}`,
      });
    });

    // Analyser les types d'adresses problématiques
    const categories = {
      international: [],
      incomplete: [],
      complex: [],
      other: [],
    };

    Object.entries(addressGroups).forEach(([address, members]) => {
      const lowerAddress = address.toLowerCase();

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
        lowerAddress.includes("rotterdam")
      ) {
        categories.international.push({ address, members });
      } else if (
        address.trim() === "" ||
        address.length < 10 ||
        !address.includes(" ") ||
        lowerAddress === "paris, france"
      ) {
        categories.incomplete.push({ address, members });
      } else if (
        lowerAddress.includes("c/o") ||
        lowerAddress.includes("bat ") ||
        lowerAddress.includes("résidence") ||
        lowerAddress.includes("foyer") ||
        lowerAddress.includes("villa") ||
        lowerAddress.includes('"')
      ) {
        categories.complex.push({ address, members });
      } else {
        categories.other.push({ address, members });
      }
    });

    // Afficher par catégories
    console.log("📍 ADRESSES INTERNATIONALES (hors France)");
    console.log("-".repeat(50));
    if (categories.international.length === 0) {
      console.log("   Aucune");
    } else {
      categories.international.forEach(({ address, members }, index) => {
        console.log(`${index + 1}. "${address}"`);
        console.log(`   👥 ${members.map((m) => m.name).join(", ")}`);
        console.log("");
      });
    }

    console.log("📍 ADRESSES INCOMPLÈTES OU TROP VAGUES");
    console.log("-".repeat(50));
    if (categories.incomplete.length === 0) {
      console.log("   Aucune");
    } else {
      categories.incomplete.forEach(({ address, members }, index) => {
        console.log(`${index + 1}. "${address}"`);
        console.log(`   👥 ${members.map((m) => m.name).join(", ")}`);
        console.log("");
      });
    }

    console.log("📍 ADRESSES COMPLEXES (Résidences, Bâtiments, etc.)");
    console.log("-".repeat(50));
    if (categories.complex.length === 0) {
      console.log("   Aucune");
    } else {
      categories.complex.forEach(({ address, members }, index) => {
        console.log(`${index + 1}. "${address}"`);
        console.log(`   👥 ${members.map((m) => m.name).join(", ")}`);
        console.log("");
      });
    }

    console.log("📍 AUTRES ADRESSES PROBLÉMATIQUES");
    console.log("-".repeat(50));
    if (categories.other.length === 0) {
      console.log("   Aucune");
    } else {
      categories.other.forEach(({ address, members }, index) => {
        console.log(`${index + 1}. "${address}"`);
        console.log(`   👥 ${members.map((m) => m.name).join(", ")}`);
        console.log("");
      });
    }

    // Résumé
    console.log("=".repeat(60));
    console.log("📊 RÉSUMÉ PAR CATÉGORIE");
    console.log("=".repeat(60));
    console.log(
      `🌍 Adresses internationales: ${categories.international.length}`
    );
    console.log(`📝 Adresses incomplètes: ${categories.incomplete.length}`);
    console.log(`🏢 Adresses complexes: ${categories.complex.length}`);
    console.log(`❓ Autres: ${categories.other.length}`);
    console.log(
      `📍 Total: ${Object.values(categories).reduce(
        (sum, cat) => sum + cat.length,
        0
      )} adresses uniques`
    );

    const totalMembers = Object.values(addressGroups).reduce(
      (sum, members) => sum + members.length,
      0
    );
    console.log(`👥 Total membres concernés: ${totalMembers}`);

    console.log("\n💡 SUGGESTIONS D'AMÉLIORATION:");
    console.log(
      "• Adresses internationales: Configurer l'API pour d'autres pays"
    );
    console.log(
      "• Adresses incomplètes: Compléter manuellement les informations"
    );
    console.log(
      "• Adresses complexes: Simplifier ou ajouter coordonnées manuellement"
    );
    console.log("• Utiliser Google Maps pour obtenir les coordonnées précises");
  } catch (error) {
    console.error("💥 Erreur:", error);
    process.exit(1);
  }
}

main().catch(console.error);
