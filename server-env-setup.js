#!/usr/bin/env node

/**
 * Server Environment Setup
 * This file patches environment and path issues before loading the main application
 */

import { fileURLToPath } from 'url';
import { dirname, resolve } from 'path';
import { existsSync } from 'fs';

// Setup __dirname equivalent for ES modules globally
const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

// Patch import.meta for bundled code that may have issues
const originalImportMeta = import.meta;

// Set up proper paths for static file serving
const setupPaths = () => {
  const possiblePublicPaths = [
    resolve(__dirname, 'public'),
    resolve(__dirname, 'dist', 'public'),
    resolve(process.cwd(), 'dist', 'public'),
    resolve(process.cwd(), 'public')
  ];

  let publicPath = null;
  for (const path of possiblePublicPaths) {
    if (existsSync(path)) {
      publicPath = path;
      break;
    }
  }

  if (publicPath) {
    process.env.STATIC_FILES_PATH = publicPath;
    console.log(`📁 Static files path set to: ${publicPath}`);
  } else {
    console.warn('⚠️ No static files directory found');
    console.warn('   Searched paths:', possiblePublicPaths);
  }

  // Set build path for reference
  process.env.BUILD_DIR = __dirname;
  console.log(`📁 Build directory: ${__dirname}`);
};

// Setup error handling for unhandled rejections
process.on('unhandledRejection', (reason, promise) => {
  console.error('🚨 Unhandled Rejection at:', promise, 'reason:', reason);
  // Don't exit the process, just log the error
});

// Setup paths
setupPaths();

// Load the main application
console.log('🔄 Loading main application...');
import('./index.js').catch(error => {
  console.error('❌ Failed to load main application:', error);
  process.exit(1);
});