#!/usr/bin/env node

import { execSync } from 'child_process';
import { existsSync } from 'fs';
import { cpSync } from 'fs';

console.log('🔨 Simple production build...');

try {
  // Build frontend and backend
  execSync('vite build', { stdio: 'inherit' });
  execSync('esbuild server/index.ts --platform=node --packages=external --bundle --format=esm --outdir=dist', { stdio: 'inherit' });
  
  // Copy static files to server directory
  if (existsSync('dist/public')) {
    cpSync('dist/public', 'server/public', { recursive: true });
    console.log('✅ Static files copied to server/public');
  }
  
  console.log('✅ Build complete!');
} catch (error) {
  console.error('❌ Build failed:', error.message);
  process.exit(1);
}