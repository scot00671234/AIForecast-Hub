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
    
    // Add imports at the very beginning
    const requiredImports = `import { fileURLToPath } from "url";
import path from "path";
const __dirname = path.dirname(fileURLToPath(import.meta.url));
`;
    
    // Check if imports are already present
    if (!indexContent.includes('fileURLToPath') || !indexContent.includes('const __dirname')) {
      indexContent = requiredImports + indexContent;
      console.log('✅ Added comprehensive dirname setup');
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