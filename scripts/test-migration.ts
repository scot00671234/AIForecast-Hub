#!/usr/bin/env tsx
/**
 * Test Migration Script
 * Test database migration without running the full application
 */

import { runProductionMigration } from './production-migrate';

async function testMigration() {
  console.log('🧪 Testing production migration...');
  
  try {
    await runProductionMigration();
    console.log('✅ Test migration completed successfully!');
    process.exit(0);
  } catch (error) {
    console.error('❌ Test migration failed:', error);
    process.exit(1);
  }
}

testMigration();