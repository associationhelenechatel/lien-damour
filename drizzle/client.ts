import { neon, neonConfig } from "@neondatabase/serverless";
import { drizzle as drizzleHttp } from "drizzle-orm/neon-http";
import ws from "ws";
import * as schema from "./schema";

// Get connection string with fallback priority
let connectionString = (process.env.NETLIFY_DATABASE_URL ||
  process.env.DATABASE_URL) as string;

// Development configuration (local proxy)
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

const sql = neon(connectionString);

export const db = drizzleHttp({ client: sql, schema });
