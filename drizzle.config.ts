import { defineConfig } from "drizzle-kit"

if (!process.env.DATABASE_URL) {
  throw new Error("DATABASE_URL is not set")
}

// Neon: run migrations over a direct connection, not the PgBouncer pooler.
const url = process.env.DATABASE_URL.replace("-pooler", "")

export default defineConfig({
  schema: "./lib/db/schema.ts",
  out: "./drizzle",
  dialect: "postgresql",
  dbCredentials: { url },
})
