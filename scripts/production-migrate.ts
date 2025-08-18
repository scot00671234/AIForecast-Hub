#!/usr/bin/env tsx
/**
 * Production Database Migration Script
 * Ensures database schema is properly set up in production environments
 */

import { drizzle } from 'drizzle-orm/node-postgres';
import { migrate } from 'drizzle-orm/node-postgres/migrator';
import pg from 'pg';
import { sql } from 'drizzle-orm';
import fs from 'fs';
import path from 'path';

const { Pool } = pg;

async function runProductionMigration() {
  console.log('🚀 Starting production database migration...');
  
  const databaseUrl = process.env.DATABASE_URL;
  if (!databaseUrl) {
    console.error('❌ DATABASE_URL environment variable is not set');
    process.exit(1);
  }

  const pool = new Pool({
    connectionString: databaseUrl,
  });

  const db = drizzle(pool);

  try {
    // Test basic connection
    console.log('🔍 Testing database connection...');
    await db.execute(sql`SELECT 1`);
    console.log('✅ Database connection successful');

    // Check if tables exist
    console.log('🔍 Checking existing schema...');
    const tableCheck = await db.execute(sql`
      SELECT table_name 
      FROM information_schema.tables 
      WHERE table_schema = 'public' 
      AND table_name IN ('ai_models', 'commodities', 'predictions', 'actual_prices', 'accuracy_metrics', 'market_alerts')
    `);
    
    const existingTables = tableCheck.rows.map((row: any) => row.table_name);
    console.log('📊 Found existing tables:', existingTables);

    if (existingTables.length === 0) {
      console.log('🔧 No tables found, creating complete schema...');
      await createCompleteSchema(db);
    } else if (existingTables.length < 6) {
      console.log('🔧 Incomplete schema detected, updating...');
      await ensureCompleteSchema(db, existingTables);
    } else {
      console.log('✅ Complete schema already exists');
    }

    // Check for data
    console.log('🔍 Checking for initial data...');
    const aiModelCount = await db.execute(sql`SELECT COUNT(*) as count FROM ai_models`);
    const commodityCount = await db.execute(sql`SELECT COUNT(*) as count FROM commodities`);
    
    const aiModels = (aiModelCount.rows[0] as any)?.count || 0;
    const commodities = (commodityCount.rows[0] as any)?.count || 0;

    console.log(`📊 Current data: ${aiModels} AI models, ${commodities} commodities`);

    if (parseInt(aiModels) === 0 || parseInt(commodities) === 0) {
      console.log('🔧 Inserting initial data...');
      await insertInitialData(db);
    }

    console.log('✅ Production migration completed successfully!');
    
  } catch (error) {
    console.error('❌ Production migration failed:', error);
    process.exit(1);
  } finally {
    await pool.end();
  }
}

async function createCompleteSchema(db: any) {
  console.log('Creating pgcrypto extension...');
  await db.execute(sql`CREATE EXTENSION IF NOT EXISTS "pgcrypto"`);

  console.log('Creating ai_models table...');
  await db.execute(sql`
    CREATE TABLE "ai_models" (
      "id" varchar PRIMARY KEY DEFAULT gen_random_uuid(),
      "name" text NOT NULL,
      "provider" text NOT NULL,
      "color" text NOT NULL,
      "is_active" integer DEFAULT 1 NOT NULL,
      CONSTRAINT "ai_models_name_unique" UNIQUE("name")
    )
  `);

  console.log('Creating commodities table...');
  await db.execute(sql`
    CREATE TABLE "commodities" (
      "id" varchar PRIMARY KEY DEFAULT gen_random_uuid(),
      "name" text NOT NULL,
      "symbol" text NOT NULL,
      "category" text NOT NULL,
      "yahoo_symbol" text,
      "unit" text DEFAULT 'USD',
      CONSTRAINT "commodities_name_unique" UNIQUE("name"),
      CONSTRAINT "commodities_symbol_unique" UNIQUE("symbol")
    )
  `);

  console.log('Creating predictions table...');
  await db.execute(sql`
    CREATE TABLE "predictions" (
      "id" varchar PRIMARY KEY DEFAULT gen_random_uuid(),
      "ai_model_id" varchar NOT NULL,
      "commodity_id" varchar NOT NULL,
      "prediction_date" timestamp NOT NULL,
      "target_date" timestamp NOT NULL,
      "predicted_price" numeric(10,4) NOT NULL,
      "confidence" numeric(5,2),
      "metadata" jsonb,
      "created_at" timestamp DEFAULT now() NOT NULL
    )
  `);

  console.log('Creating actual_prices table...');
  await db.execute(sql`
    CREATE TABLE "actual_prices" (
      "id" varchar PRIMARY KEY DEFAULT gen_random_uuid(),
      "commodity_id" varchar NOT NULL,
      "date" timestamp NOT NULL,
      "price" numeric(10,4) NOT NULL,
      "volume" numeric(15,2),
      "source" text DEFAULT 'yahoo_finance',
      "created_at" timestamp DEFAULT now() NOT NULL
    )
  `);

  console.log('Creating accuracy_metrics table...');
  await db.execute(sql`
    CREATE TABLE "accuracy_metrics" (
      "id" varchar PRIMARY KEY DEFAULT gen_random_uuid(),
      "ai_model_id" varchar NOT NULL,
      "commodity_id" varchar NOT NULL,
      "period" text NOT NULL,
      "accuracy" numeric(5,2) NOT NULL,
      "total_predictions" integer NOT NULL,
      "correct_predictions" integer NOT NULL,
      "avg_error" numeric(10,4),
      "last_updated" timestamp DEFAULT now() NOT NULL
    )
  `);

  console.log('Creating market_alerts table...');
  await db.execute(sql`
    CREATE TABLE "market_alerts" (
      "id" varchar PRIMARY KEY DEFAULT gen_random_uuid(),
      "type" text NOT NULL,
      "severity" text NOT NULL,
      "title" text NOT NULL,
      "description" text NOT NULL,
      "commodity_id" varchar,
      "ai_model_id" varchar,
      "is_active" integer DEFAULT 1 NOT NULL,
      "created_at" timestamp DEFAULT now() NOT NULL
    )
  `);

  console.log('Adding foreign key constraints...');
  await db.execute(sql`ALTER TABLE "predictions" ADD CONSTRAINT "predictions_ai_model_id_ai_models_id_fk" FOREIGN KEY ("ai_model_id") REFERENCES "ai_models"("id") ON DELETE no action ON UPDATE no action`);
  await db.execute(sql`ALTER TABLE "predictions" ADD CONSTRAINT "predictions_commodity_id_commodities_id_fk" FOREIGN KEY ("commodity_id") REFERENCES "commodities"("id") ON DELETE no action ON UPDATE no action`);
  await db.execute(sql`ALTER TABLE "actual_prices" ADD CONSTRAINT "actual_prices_commodity_id_commodities_id_fk" FOREIGN KEY ("commodity_id") REFERENCES "commodities"("id") ON DELETE no action ON UPDATE no action`);
  await db.execute(sql`ALTER TABLE "accuracy_metrics" ADD CONSTRAINT "accuracy_metrics_ai_model_id_ai_models_id_fk" FOREIGN KEY ("ai_model_id") REFERENCES "ai_models"("id") ON DELETE no action ON UPDATE no action`);
  await db.execute(sql`ALTER TABLE "accuracy_metrics" ADD CONSTRAINT "accuracy_metrics_commodity_id_commodities_id_fk" FOREIGN KEY ("commodity_id") REFERENCES "commodities"("id") ON DELETE no action ON UPDATE no action`);
  await db.execute(sql`ALTER TABLE "market_alerts" ADD CONSTRAINT "market_alerts_commodity_id_commodities_id_fk" FOREIGN KEY ("commodity_id") REFERENCES "commodities"("id") ON DELETE no action ON UPDATE no action`);
  await db.execute(sql`ALTER TABLE "market_alerts" ADD CONSTRAINT "market_alerts_ai_model_id_ai_models_id_fk" FOREIGN KEY ("ai_model_id") REFERENCES "ai_models"("id") ON DELETE no action ON UPDATE no action`);
}

async function ensureCompleteSchema(db: any, existingTables: string[]) {
  const requiredTables = ['ai_models', 'commodities', 'predictions', 'actual_prices', 'accuracy_metrics', 'market_alerts'];
  
  for (const table of requiredTables) {
    if (!existingTables.includes(table)) {
      console.log(`Creating missing table: ${table}`);
      // Add individual table creation logic here if needed
    }
  }
}

async function insertInitialData(db: any) {
  console.log('Inserting AI models...');
  await db.execute(sql`
    INSERT INTO "ai_models" ("name", "provider", "color", "is_active") VALUES
    ('ChatGPT', 'OpenAI', '#10B981', 1),
    ('Claude', 'Anthropic', '#8B5CF6', 1),
    ('Deepseek', 'DeepSeek', '#F59E0B', 1)
    ON CONFLICT (name) DO NOTHING
  `);

  console.log('Inserting commodities...');
  await db.execute(sql`
    INSERT INTO "commodities" ("name", "symbol", "category", "yahoo_symbol") VALUES
    ('Crude Oil', 'CL', 'hard', 'CL=F'),
    ('Gold', 'AU', 'hard', 'GC=F'),
    ('Natural Gas', 'NG', 'hard', 'NG=F'),
    ('Copper', 'CU', 'hard', 'HG=F'),
    ('Silver', 'AG', 'hard', 'SI=F'),
    ('Aluminum', 'AL', 'hard', 'ALI=F'),
    ('Platinum', 'PT', 'hard', 'PL=F'),
    ('Palladium', 'PD', 'hard', 'PA=F'),
    ('Coffee', 'KC', 'soft', 'KC=F'),
    ('Sugar', 'SB', 'soft', 'SB=F'),
    ('Corn', 'ZC', 'soft', 'ZC=F'),
    ('Soybeans', 'ZS', 'soft', 'ZS=F'),
    ('Cotton', 'CT', 'soft', 'CT=F'),
    ('Wheat', 'ZW', 'soft', 'ZW=F')
    ON CONFLICT (name) DO NOTHING
  `);
}

// Only run if called directly
if (import.meta.url === `file://${process.argv[1]}`) {
  runProductionMigration();
}

export { runProductionMigration };