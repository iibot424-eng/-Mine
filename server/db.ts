import { drizzle } from 'drizzle-orm/neon-http';
import { neon, neonConfig } from '@neondatabase/serverless';
import * as schema from "@shared/schema";

// This is required for neon-http to work correctly with some versions of drizzle
neonConfig.fetchConnectionCache = true;

let databaseUrl = process.env.NEON_DATABASE_URL || process.env.DATABASE_URL;

if (!databaseUrl) {
  throw new Error("DATABASE_URL or NEON_DATABASE_URL must be set");
}

// Очистка строки от кавычек и префикса psql, если они есть
databaseUrl = databaseUrl.replace(/^psql\s+/, '').replace(/['"]/g, '').trim();

const sql = neon(databaseUrl);
export const db = drizzle(sql, { schema });
