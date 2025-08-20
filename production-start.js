#!/usr/bin/env node

/**
 * Production startup script for AIForecast Hub
 * Ensures proper initialization and error handling in production environment
 */

import { spawn } from 'child_process';
import { existsSync } from 'fs';

console.log('🚀 AIForecast Hub Production Startup');

// Validate production environment
const requiredFiles = [
  'dist/index.js',
  'dist/public/index.html'
];

for (const file of requiredFiles) {
  if (!existsSync(file)) {
    console.error(`❌ Production startup failed: ${file} not found`);
    console.error('   Run "npm run build" first');
    process.exit(1);
  }
}

// Validate environment variables
const requiredEnvVars = [
  'DATABASE_URL',
  'NODE_ENV'
];

const missingEnvVars = requiredEnvVars.filter(envVar => !process.env[envVar]);
if (missingEnvVars.length > 0) {
  console.error('❌ Missing required environment variables:');
  missingEnvVars.forEach(envVar => console.error(`   - ${envVar}`));
  process.exit(1);
}

// Check optional but recommended environment variables
const recommendedEnvVars = [
  'OPENAI_API_KEY',
  'ANTHROPIC_API_KEY', 
  'DEEPSEEK_API_KEY'
];

const missingRecommended = recommendedEnvVars.filter(envVar => !process.env[envVar]);
if (missingRecommended.length > 0) {
  console.warn('⚠️ Missing recommended API keys (prediction features will be limited):');
  missingRecommended.forEach(envVar => console.warn(`   - ${envVar}`));
}

console.log('✅ Production environment validated');
console.log(`   Port: ${process.env.PORT || '5000'}`);
console.log(`   Database: ${process.env.DATABASE_URL ? 'configured' : 'missing'}`);
console.log(`   AI APIs: ${recommendedEnvVars.filter(v => process.env[v]).length}/${recommendedEnvVars.length} configured`);

// Start the application
const child = spawn('node', ['dist/index.js'], {
  stdio: 'inherit',
  env: process.env
});

child.on('error', (error) => {
  console.error('❌ Application startup failed:', error.message);
  process.exit(1);
});

child.on('exit', (code) => {
  console.log(`Application exited with code ${code}`);
  process.exit(code);
});

// Handle graceful shutdown
process.on('SIGINT', () => {
  console.log('🛑 Graceful shutdown initiated...');
  child.kill('SIGINT');
});

process.on('SIGTERM', () => {
  console.log('🛑 Graceful shutdown initiated...');
  child.kill('SIGTERM');
});