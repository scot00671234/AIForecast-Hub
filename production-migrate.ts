#!/usr/bin/env tsx

/**
 * Complete Production Migration Script
 * Handles all database schema migrations for production deployment
 */

import { Client } from 'pg';
import { drizzle } from 'drizzle-orm/node-postgres';
import { sql } from 'drizzle-orm';

async function runProductionMigration() {
  const databaseUrl = process.env.DATABASE_URL;
  
  if (!databaseUrl) {
    console.error('❌ DATABASE_URL environment variable is required');
    process.exit(1);
  }

  console.log('🚀 Starting production database migration...');
  
  const client = new Client({
    connectionString: databaseUrl,
    ssl: { rejectUnauthorized: false }
  });
  
  try {
    await client.connect();
    const db = drizzle(client);
    
    console.log('🔗 Connected to production database');
    
    // Step 1: Check if predictions table exists
    const tableExists = await db.execute(sql`
      SELECT EXISTS (
        SELECT FROM information_schema.tables 
        WHERE table_name = 'predictions'
      );
    `);
    
    if (!tableExists[0]?.exists) {
      console.log('❌ Predictions table does not exist. Please run full schema creation first.');
      process.exit(1);
    }
    
    console.log('✅ Predictions table exists');
    
    // Step 2: Check if timeframe column exists
    const columnCheck = await db.execute(sql`
      SELECT column_name, data_type, column_default, is_nullable
      FROM information_schema.columns 
      WHERE table_name = 'predictions' AND column_name = 'timeframe';
    `);
    
    if (columnCheck.length === 0) {
      console.log('⚠️ Timeframe column missing. Adding it now...');
      
      // Add timeframe column with proper constraints
      await db.execute(sql`
        ALTER TABLE predictions 
        ADD COLUMN timeframe text NOT NULL DEFAULT '7d';
      `);
      
      console.log('✅ Added timeframe column');
      
      // Add check constraint for valid timeframes
      await db.execute(sql`
        ALTER TABLE predictions 
        ADD CONSTRAINT predictions_timeframe_check 
        CHECK (timeframe IN ('3mo', '6mo', '9mo', '12mo', '7d'));
      `);
      
      console.log('✅ Added timeframe validation constraint');
      
    } else {
      console.log('✅ Timeframe column already exists');
      console.log('📋 Column details:', columnCheck[0]);
    }
    
    // Step 3: Verify all required columns exist
    const allColumns = await db.execute(sql`
      SELECT column_name, data_type, is_nullable, column_default
      FROM information_schema.columns 
      WHERE table_name = 'predictions'
      ORDER BY ordinal_position;
    `);
    
    console.log('📋 Current predictions table structure:');
    allColumns.forEach(col => {
      console.log(`  - ${col.column_name}: ${col.data_type} (nullable: ${col.is_nullable})`);
    });
    
    // Step 4: Test a simple query to ensure everything works
    console.log('🧪 Testing predictions query...');
    
    const testQuery = await db.execute(sql`
      SELECT COUNT(*) as count FROM predictions WHERE timeframe = '7d' LIMIT 1;
    `);
    
    console.log('✅ Query test successful:', testQuery[0]);
    
    // Step 5: Check other essential tables
    const essentialTables = ['ai_models', 'commodities', 'actual_prices'];
    
    for (const table of essentialTables) {
      const exists = await db.execute(sql`
        SELECT EXISTS (
          SELECT FROM information_schema.tables 
          WHERE table_name = ${table}
        );
      `);
      
      if (exists[0]?.exists) {
        console.log(`✅ Table ${table} exists`);
      } else {
        console.log(`❌ Table ${table} missing - this may cause issues`);
      }
    }
    
    console.log('🎯 Production migration completed successfully!');
    console.log('🔄 Please restart your application to clear any cached schema issues.');
    
  } catch (error) {
    console.error('❌ Migration failed:', error);
    console.error('Full error details:', JSON.stringify(error, null, 2));
    process.exit(1);
  } finally {
    await client.end();
  }
}

// Run migration
runProductionMigration().catch(console.error);