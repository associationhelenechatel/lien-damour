import { defineConfig } from "drizzle-kit";
import dotenv from "dotenv";

dotenv.config({
  path: ".env.local",
});

// Use Netlify's unpooled connection for migrations (more reliable for schema changes)
const url =
  process.env.NETLIFY_DATABASE_URL_UNPOOLED || process.env.DATABASE_URL;

if (!url) {
  throw new Error(
    "No database URL found. Please set DATABASE_URL or NETLIFY_DATABASE_URL_UNPOOLED"
  );
}

export default defineConfig({
  schema: "./drizzle/schema.ts",
  out: "./drizzle",
  dialect: "postgresql",
  dbCredentials: { url },
});
