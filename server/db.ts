import { drizzle } from 'drizzle-orm/node-postgres';
import pkg from 'pg';
const { Pool } = pkg;
import * as schema from "@shared/schema";

let databaseUrl = process.env.DATABASE_URL || process.env.NEON_DATABASE_URL;

if (!databaseUrl) {
  throw new Error("DATABASE_URL or NEON_DATABASE_URL must be set");
}

// Очистка строки от кавычек и префикса psql, если они есть
databaseUrl = databaseUrl.replace(/^psql\s+/, '').replace(/['"]/g, '').trim();

const isProduction = process.env.NODE_ENV === "production";

export const pool = new Pool({
  connectionString: databaseUrl,
  ssl: isProduction ? { rejectUnauthorized: false } : false,
});

export const db = drizzle(pool, { schema });
