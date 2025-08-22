#!/usr/bin/env node

import { execSync } from 'child_process';
import { existsSync, writeFileSync } from 'fs';
import { cpSync } from 'fs';

console.log('🔨 Production build with deployment fixes...');

const deploymentTimestamp = new Date().toISOString();

try {
  // Build frontend and backend
  console.log('🏗️ Building frontend...');
  execSync('vite build', { stdio: 'inherit' });
  
  console.log('🏗️ Building backend...');
  execSync('esbuild server/index.ts --platform=node --packages=external --bundle --format=esm --outdir=dist', { stdio: 'inherit' });
  
  // Copy static files to server directory
  if (existsSync('dist/public')) {
    cpSync('dist/public', 'server/public', { recursive: true });
    console.log('✅ Static files copied to server/public');
    
    // Create deployment timestamp file for cache busting verification
    writeFileSync('server/public/deploy-timestamp.txt', deploymentTimestamp);
    console.log('✅ Deployment timestamp created');
  } else {
    throw new Error('Frontend build failed - dist/public directory not found');
  }
  
  console.log('✅ Production build complete!');
  console.log(`📅 Deployment timestamp: ${deploymentTimestamp}`);
} catch (error) {
  console.error('❌ Build failed:', error.message);
  process.exit(1);
}