#!/usr/bin/env node

/**
 * Production Database Fix Script
 * Adds missing timeframe column to predictions table
 */

import { Client } from 'pg';
import * as fs from 'fs';

async function fixProductionDatabase() {
  // Get database URL from environment
  const databaseUrl = process.env.DATABASE_URL;
  
  if (!databaseUrl) {
    console.error('❌ DATABASE_URL environment variable is required');
    process.exit(1);
  }

  const client = new Client({
    connectionString: databaseUrl,
    ssl: {
      rejectUnauthorized: false
    }
  });

  try {
    console.log('🔗 Connecting to production database...');
    await client.connect();
    
    // Check if timeframe column exists
    const checkColumnQuery = `
      SELECT column_name 
      FROM information_schema.columns 
      WHERE table_name = 'predictions' AND column_name = 'timeframe';
    `;
    
    const result = await client.query(checkColumnQuery);
    
    if (result.rows.length === 0) {
      console.log('⚠️ Timeframe column missing, adding it now...');
      
      // Add the missing column
      const addColumnQuery = `
        ALTER TABLE predictions 
        ADD COLUMN timeframe text NOT NULL DEFAULT '7d';
      `;
      
      await client.query(addColumnQuery);
      console.log('✅ Successfully added timeframe column to predictions table');
      
      // Verify the column was added
      const verifyResult = await client.query(checkColumnQuery);
      if (verifyResult.rows.length > 0) {
        console.log('✅ Column addition verified');
      }
    } else {
      console.log('✅ Timeframe column already exists, no action needed');
    }
    
    console.log('🎯 Production database fix completed successfully');
    
  } catch (error) {
    console.error('❌ Production fix failed:', error.message);
    process.exit(1);
  } finally {
    await client.end();
  }
}

// Run the fix
fixProductionDatabase().catch(console.error);