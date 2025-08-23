#!/usr/bin/env node

/**
 * Production Database Cleanup - Remove Fake Historical Predictions
 * 
 * This script removes fake predictions from production database.
 * Run automatically when new code is deployed.
 */

import { db } from "../db";
import { predictions, accuracyMetrics } from "@shared/schema";
import { sql } from "drizzle-orm";

async function cleanupFakeData(): Promise<void> {
  console.log("🧹 Starting production database cleanup...");
  
  try {
    // Method 1: Delete by metadata containing historicalGeneration
    const result1 = await db.execute(sql`
      DELETE FROM predictions 
      WHERE metadata::text LIKE '%historicalGeneration%'
    `);
    
    // Method 2: Delete by the fake historical date (Nov 23, 2024)
    const result2 = await db.execute(sql`
      DELETE FROM predictions 
      WHERE prediction_date = '2024-11-23'::date
    `);
    
    // Method 3: Delete any predictions with target dates in fake future (after Nov 2024)
    const result3 = await db.execute(sql`
      DELETE FROM predictions 
      WHERE target_date > '2024-11-23'::date 
      AND target_date < '2025-12-01'::date
      AND metadata::text LIKE '%generatedFrom%'
    `);
    
    console.log(`✅ Cleanup completed!`);
    console.log(`🗑️ Removed fake historical predictions from production database`);
    
    // Count remaining predictions
    const countResult = await db.execute(sql`SELECT COUNT(*) as count FROM predictions`);
    const remainingCount = countResult.rows[0]?.count || 0;
    console.log(`📊 Remaining predictions: ${remainingCount}`);
    
  } catch (error) {
    console.error("❌ Cleanup failed:", error);
    throw error;
  }
}

async function main() {
  console.log("🚀 Production Cleanup Script - Remove Fake Predictions");
  
  try {
    await cleanupFakeData();
    console.log("✅ Cleanup successful!");
  } catch (error) {
    console.error("❌ Cleanup failed:", error);
    process.exit(1);
  }
}

// Run if called directly
if (process.argv[1] === new URL(import.meta.url).pathname) {
  main();
}

export { cleanupFakeData };