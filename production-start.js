#!/usr/bin/env node

/**
 * Production startup script for AIForecast Hub
 * Ensures proper initialization and error handling in production environment
 */

import { spawn } from 'child_process';
import { existsSync, readdirSync } from 'fs';
import { resolve, dirname } from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

console.log('🚀 AIForecast Hub Production Startup');
console.log(`📁 Working directory: ${process.cwd()}`);
console.log(`📁 Script directory: ${__dirname}`);

// Validate production environment and build files
const buildPaths = [
  resolve(process.cwd(), 'dist'),
  resolve(__dirname, 'dist'),
  resolve(process.cwd(), 'app', 'dist'),
];

let validBuildPath = null;
let validIndexPath = null;
let validPublicPath = null;

for (const buildPath of buildPaths) {
  const indexPath = resolve(buildPath, 'index.js');
  const publicPath = resolve(buildPath, 'public');
  
  console.log(`🔍 Checking build path: ${buildPath}`);
  
  if (existsSync(buildPath) && existsSync(indexPath)) {
    validBuildPath = buildPath;
    validIndexPath = indexPath;
    validPublicPath = publicPath;
    console.log(`✅ Found valid build at: ${buildPath}`);
    break;
  }
}

if (!validBuildPath || !validIndexPath) {
  console.error('❌ Production startup failed: No valid build found');
  console.error('   Searched paths:');
  buildPaths.forEach(path => console.error(`   - ${path}`));
  console.error('   Run "npm run build" first');
  process.exit(1);
}

if (!existsSync(validPublicPath)) {
  console.warn(`⚠️ Warning: Static files directory not found: ${validPublicPath}`);
  console.warn('   Frontend may not serve correctly');
}

// List contents for debugging
console.log(`📋 Build directory contents:`);
try {
  const files = readdirSync(validBuildPath);
  files.forEach(file => console.log(`   - ${file}`));
} catch (e) {
  console.error(`   Could not list directory: ${e.message}`);
}

// Validate environment variables
const requiredEnvVars = [
  'NODE_ENV'
];

const missingEnvVars = requiredEnvVars.filter(envVar => !process.env[envVar]);
if (missingEnvVars.length > 0) {
  console.error('❌ Missing required environment variables:');
  missingEnvVars.forEach(envVar => console.error(`   - ${envVar}`));
  process.exit(1);
}

// Check recommended environment variables
const recommendedEnvVars = [
  'DATABASE_URL',
  'OPENAI_API_KEY',
  'ANTHROPIC_API_KEY', 
  'DEEPSEEK_API_KEY'
];

const missingRecommended = recommendedEnvVars.filter(envVar => !process.env[envVar]);
if (missingRecommended.length > 0) {
  console.warn('⚠️ Missing recommended environment variables:');
  missingRecommended.forEach(envVar => console.warn(`   - ${envVar}`));
}

console.log('✅ Production environment validated');
console.log(`   Port: ${process.env.PORT || '3000'}`);
console.log(`   Database: ${process.env.DATABASE_URL ? 'configured' : 'missing'}`);
console.log(`   AI APIs: ${recommendedEnvVars.filter(v => process.env[v]).length}/${recommendedEnvVars.length} configured`);
console.log(`   Index file: ${validIndexPath}`);

// Set environment variables for proper path resolution
process.env.BUILD_PATH = validBuildPath;
process.env.PUBLIC_PATH = validPublicPath;

// Start the application
console.log(`🚀 Starting application: node ${validIndexPath}`);
const child = spawn('node', [validIndexPath], {
  stdio: 'inherit',
  env: process.env,
  cwd: process.cwd()
});

child.on('error', (error) => {
  console.error('❌ Application startup failed:', error.message);
  console.error('   Make sure Node.js is installed and the build is valid');
  process.exit(1);
});

child.on('exit', (code) => {
  if (code === 0) {
    console.log('✅ Application exited normally');
  } else {
    console.error(`❌ Application exited with code ${code}`);
  }
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