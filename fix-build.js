#!/usr/bin/env node

/**
 * Production build optimization script
 * This script ensures the built application is properly configured for production deployment
 * and fixes the import.meta.dirname issue in bundled code
 */

import { fileURLToPath } from 'url';
import { dirname, join } from 'path';
import { readFileSync, writeFileSync, existsSync } from 'fs';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

console.log('🔧 Running production build optimizations...');

try {
  // Ensure dist directory structure is correct
  const distPath = join(__dirname, 'dist');
  const publicPath = join(distPath, 'public');
  
  if (!existsSync(distPath)) {
    console.error('❌ Build failed: dist directory not found');
    process.exit(1);
  }
  
  if (!existsSync(publicPath)) {
    console.error('❌ Build failed: dist/public directory not found');
    process.exit(1);
  }
  
  // Verify and fix index.js
  const indexPath = join(distPath, 'index.js');
  if (!existsSync(indexPath)) {
    console.error('❌ Build failed: dist/index.js not found');
    process.exit(1);
  }
  
  // Fix import.meta.dirname issue in bundled code
  console.log('🔧 Fixing import.meta.dirname in bundled code...');
  let indexContent = readFileSync(indexPath, 'utf-8');
  
  // Check if import.meta.dirname is used
  if (indexContent.includes('import.meta.dirname')) {
    console.log('🔍 Found import.meta.dirname references, applying fixes...');
    
    // Add imports at the top if not present
    if (!indexContent.includes('fileURLToPath')) {
      const importLine = 'import { fileURLToPath } from "url";';
      indexContent = importLine + '\n' + indexContent;
      console.log('✅ Added fileURLToPath import');
    }
    
    if (!indexContent.includes('import path from "path"') && !indexContent.includes('path.dirname')) {
      const pathImportLine = 'import path from "path";';
      // Insert after existing imports or at the top
      if (indexContent.includes('import ')) {
        indexContent = indexContent.replace(/^(import[^;]+;)/m, '$1\n' + pathImportLine);
      } else {
        indexContent = pathImportLine + '\n' + indexContent;
      }
      console.log('✅ Added path import');
    }
    
    // Replace import.meta.dirname with proper ES module equivalent
    indexContent = indexContent.replace(
      /import\.meta\.dirname/g,
      'path.dirname(fileURLToPath(import.meta.url))'
    );
    
    writeFileSync(indexPath, indexContent, 'utf-8');
    console.log('✅ Fixed import.meta.dirname references in bundled code');
  } else {
    console.log('ℹ️ No import.meta.dirname references found');
  }
  
  console.log('✅ Production build verified and optimized successfully');
  console.log(`   - dist/index.js: ${(readFileSync(indexPath).length / 1024).toFixed(1)}KB`);
  console.log(`   - dist/public: ${existsSync(publicPath) ? 'exists' : 'missing'}`);
  
} catch (error) {
  console.error('❌ Build optimization failed:', error.message);
  process.exit(1);
}