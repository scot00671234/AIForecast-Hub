#!/usr/bin/env node

/**
 * Simple runner for the historical predictions script
 * This allows easy execution in production without TypeScript compilation issues
 */

const { exec } = require('child_process');
const path = require('path');

console.log('🚀 Starting Historical Prediction Generator...');
console.log('📅 Generating predictions from November 23, 2024 perspective');

// Run the TypeScript script using tsx
const scriptPath = path.join(__dirname, 'generate-historical-predictions.ts');
const command = `npx tsx "${scriptPath}"`;

exec(command, { 
  cwd: path.join(__dirname, '..'), // Set working directory to server/
  maxBuffer: 1024 * 1024 * 10 // 10MB buffer for output
}, (error, stdout, stderr) => {
  if (error) {
    console.error('❌ Script execution failed:', error);
    process.exit(1);
  }

  if (stderr) {
    console.error('⚠️ Warnings/Errors:', stderr);
  }

  console.log(stdout);
  console.log('\n✅ Historical prediction generation completed!');
});