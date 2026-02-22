import { drizzle } from "drizzle-orm/neon-http";
import dotenv from "dotenv";
import { reset } from "drizzle-seed";
import { neon, neonConfig } from "@neondatabase/serverless";
import ws from "ws";
import {
  familyMembers,
  familyRelations,
  partnerships,
} from "../data/mock-family-data.js";
import * as schema from "../db/schema.js";

dotenv.config({
  path: ".env.local",
});

// Configuration de la base de données
let connectionString = process.env.DATABASE_URL;

if (!connectionString) {
  console.error(
    "❌ Erreur: DATABASE_URL non définie dans les variables d'environnement"
  );
  process.exit(1);
}

if (process.env.NODE_ENV !== "development") {
  console.error(
    "❌ Erreur: Interdit de seed dans un environnement de production"
  );
  process.exit(1);
}

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

neonConfig.webSocketConstructor = ws;

const sqlClient = neon(connectionString);
const db = drizzle(sqlClient as any);

async function main() {
  console.log("🗑️  Nettoyage de la base de données existante...");
  // Supprimer les données existantes (dans l'ordre inverse des dépendances)
  await reset(db, schema);

  console.log("👥 Insertion des membres de la famille...");
  const idMapping: Record<number, number> = {};

  for (const member of familyMembers) {
    // retire l'id JSON pour laisser la DB générer le vrai
    const { id: jsonId, ...memberData } = member;
    const result = await db
      .insert(schema.familyMember)
      .values(memberData)
      .returning({ id: schema.familyMember.id });
    idMapping[jsonId!] = result[0].id;
  }

  console.log("🔗 Insertion des relations familiales...");
  for (const rel of familyRelations) {
    await db.insert(schema.familyRelation).values({
      parentId: idMapping[rel.parentId],
      childId: idMapping[rel.childId],
      relationType: rel.relationType,
    });
  }

  console.log("💑 Insertion des partenariats...");
  for (const part of partnerships) {
    await db.insert(schema.partnership).values({
      partner1Id: idMapping[part.partner1Id],
      partner2Id: idMapping[part.partner2Id],
      startDate: part.startDate,
      endDate: part.endDate,
    });
  }

  console.log("✅ Seed terminé !");
}
main();
