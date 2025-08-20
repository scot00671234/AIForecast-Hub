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
  
  // Fix import.meta.dirname issue in bundled code - COMPREHENSIVE FIX
  console.log('🔧 Fixing import.meta.dirname in bundled code...');
  let indexContent = readFileSync(indexPath, 'utf-8');
  
  // Count all import.meta.dirname references
  const dirNameCount = (indexContent.match(/import\.meta\.dirname/g) || []).length;
  console.log(`🔍 Found ${dirNameCount} import.meta.dirname references`);
  
  if (dirNameCount > 0) {
    console.log('🚨 CRITICAL: Applying comprehensive import.meta.dirname fixes...');
    
    // Add only the imports we need (check what's already there)
    let importsToAdd = '';
    
    if (!indexContent.includes('fileURLToPath')) {
      importsToAdd += 'import { fileURLToPath } from "url";\n';
    }
    
    // Check if path is already imported (don't duplicate)
    if (!indexContent.includes('import path from "path"') && !indexContent.includes('import path2 from "path"')) {
      importsToAdd += 'import path from "path";\n';
    }
    
    if (!indexContent.includes('const __dirname')) {
      importsToAdd += 'const __dirname = path.dirname(fileURLToPath(import.meta.url));\n';
    }
    
    if (importsToAdd) {
      indexContent = importsToAdd + indexContent;
      console.log('✅ Added required dirname setup (no duplicates)');
    }
    
    // Replace ALL import.meta.dirname with __dirname
    const beforeCount = (indexContent.match(/import\.meta\.dirname/g) || []).length;
    indexContent = indexContent.replace(/import\.meta\.dirname/g, '__dirname');
    const afterCount = (indexContent.match(/import\.meta\.dirname/g) || []).length;
    
    console.log(`✅ Replaced ${beforeCount - afterCount} import.meta.dirname references`);
    console.log(`⚠️ Remaining references: ${afterCount}`);
    
    writeFileSync(indexPath, indexContent, 'utf-8');
    console.log('✅ COMPREHENSIVE dirname fix applied successfully');
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