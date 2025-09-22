import { defineConfig } from "drizzle-kit";

const url = process.env.DATABASE_URL;

if (!url)
  throw new Error(
    `Connection string to ${
      process.env.NODE_ENV ? "Neon" : "local"
    } Postgres not found.`
  );

export default defineConfig({
  out: "./drizzle",
  dialect: "postgresql",
  dbCredentials: { url },
  schema: "./db/schema.ts",
});
