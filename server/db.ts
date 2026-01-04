import { drizzle } from 'drizzle-orm/node-postgres';
import pkg from 'pg';
const { Pool } = pkg;
import * as schema from "@shared/schema";

let databaseUrl = process.env.NEON_DATABASE_URL || process.env.DATABASE_URL;

if (!databaseUrl) {
  throw new Error("DATABASE_URL or NEON_DATABASE_URL must be set");
}

// Очистка строки от кавычек и префикса psql, если они есть
databaseUrl = databaseUrl.replace(/^psql\s+/, '').replace(/['"]/g, '').trim();

export const pool = new Pool({
  connectionString: databaseUrl,
  ssl: true,
});

export const db = drizzle(pool, { schema });
