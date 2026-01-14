#!/usr/bin/env node

/**
 * Script pour initialiser la base de données avec des données mock
 * Usage: node scripts/seed-database.mjs
 *
 * Ce script :
 * 1. Lit le fichier JSON de données mock
 * 2. Insère les membres de la famille
 * 3. Insère les relations familiales
 * 4. Insère les partenariats
 */

import { neon, neonConfig } from "@neondatabase/serverless";
import { drizzle } from "drizzle-orm/neon-http";
import {
  pgTable,
  serial,
  text,
  date,
  timestamp,
  integer,
  decimal,
} from "drizzle-orm/pg-core";
import ws from "ws";
import { readFileSync } from "fs";
import { fileURLToPath } from "url";
import { dirname, join } from "path";

// Définir les tables ici pour éviter les problèmes d'import TypeScript
const familyMember = pgTable("family_member", {
  id: serial("id").primaryKey(),
  firstName: text("first_name").notNull(),
  lastName: text("last_name"),
  maidenName: text("maiden_name"),
  gender: text("gender"),
  birthDate: date("birth_date"),
  deathDate: date("death_date"),
  address: text("address"),
  latitude: decimal("latitude", { precision: 10, scale: 8 }),
  longitude: decimal("longitude", { precision: 11, scale: 8 }),
  phone: text("phone"),
  mail: text("mail"),
  pictureId: text("picture_id"),
  code: text("code"),
  createdAt: timestamp("created_at").defaultNow().notNull(),
  updatedAt: timestamp("updated_at").defaultNow().notNull(),
});

const familyRelation = pgTable("family_relation", {
  id: serial("id").primaryKey(),
  parentId: integer("parent_id").notNull(),
  childId: integer("child_id").notNull(),
  relationType: text("relation_type"),
});

const partnership = pgTable("partnership", {
  id: serial("id").primaryKey(),
  partner1Id: integer("partner1_id").notNull(),
  partner2Id: integer("partner2_id").notNull(),
  startDate: date("start_date"),
  endDate: date("end_date"),
});

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

// Configuration de la base de données
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

async function seedDatabase() {
  try {
    console.log("📦 Chargement des données mock...");
    const dataPath = join(__dirname, "../data/mock-family-data.json");
    const data = JSON.parse(readFileSync(dataPath, "utf-8"));

    console.log("🗑️  Nettoyage de la base de données existante...");
    // Supprimer les données existantes (dans l'ordre inverse des dépendances)
    await db.delete(partnership);
    await db.delete(familyRelation);
    await db.delete(familyMember);

    console.log("👥 Insertion des membres de la famille...");
    // Créer un mapping id JSON -> id DB pour les relations
    const idMapping = {};

    for (const member of data.familyMembers) {
      // Ne pas inclure l'id pour laisser la séquence auto-générer
      const { id: jsonId, ...memberData } = member;
      const result = await db
        .insert(familyMember)
        .values(memberData)
        .returning({ id: familyMember.id });
      const dbId = result[0].id;
      idMapping[jsonId] = dbId;
      console.log(
        `  ✓ ${member.firstName} ${member.lastName || ""} (DB ID: ${dbId})`
      );
    }

    console.log("🔗 Insertion des relations familiales...");
    for (const relation of data.familyRelations) {
      const mappedRelation = {
        parentId: idMapping[relation.parentId],
        childId: idMapping[relation.childId],
        relationType: relation.relationType,
      };
      await db.insert(familyRelation).values(mappedRelation);
      const parent = data.familyMembers.find((m) => m.id === relation.parentId);
      const child = data.familyMembers.find((m) => m.id === relation.childId);
      console.log(
        `  ✓ ${parent?.firstName} → ${child?.firstName} (${relation.relationType})`
      );
    }

    console.log("💑 Insertion des partenariats...");
    for (const part of data.partnerships) {
      const mappedPart = {
        partner1Id: idMapping[part.partner1Id],
        partner2Id: idMapping[part.partner2Id],
        startDate: part.startDate,
        endDate: part.endDate,
      };
      await db.insert(partnership).values(mappedPart);
      const p1 = data.familyMembers.find((m) => m.id === part.partner1Id);
      const p2 = data.familyMembers.find((m) => m.id === part.partner2Id);
      console.log(`  ✓ ${p1?.firstName} & ${p2?.firstName}`);
    }

    console.log("\n✅ Base de données initialisée avec succès !");
    console.log(`   - ${data.familyMembers.length} membres`);
    console.log(`   - ${data.familyRelations.length} relations`);
    console.log(`   - ${data.partnerships.length} partenariats`);
  } catch (error) {
    console.error("❌ Erreur lors de l'initialisation:", error);
    process.exit(1);
  }
}

seedDatabase();
