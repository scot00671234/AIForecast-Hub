import pkg from 'pg';
const { Pool } = pkg;
import { drizzle } from 'drizzle-orm/node-postgres';
import * as schema from "@shared/schema";

// For development, use a default DATABASE_URL if not set
const databaseUrl = process.env.DATABASE_URL || "postgresql://runner@localhost/commoditydb?host=/tmp&port=5433";

if (!process.env.DATABASE_URL) {
  console.warn("DATABASE_URL not set, using default development database");
}

export const pool = new Pool({
  user: 'runner',
  host: 'localhost',
  database: 'commoditydb', 
  port: 5433,
  max: 10,
  idleTimeoutMillis: 10000,
  connectionTimeoutMillis: 30000,
});

// Add error handling for pool
pool.on('error', (err) => {
  console.error('Database pool error:', err.message);
});

export const db = drizzle(pool, { schema });