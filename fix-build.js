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
  
  // CRITICAL: Clean and fix static file serving for production
  console.log('🧹 Cleaning and fixing static file serving for production...');
  const serverPublicPath = join(__dirname, 'server', 'public');
  
  try {
    // Force remove existing server/public directory completely
    if (existsSync(serverPublicPath)) {
      const { rmSync } = await import('fs');
      rmSync(serverPublicPath, { recursive: true, force: true });
      console.log('🗑️ Removed old server/public directory');
    }
    
    // Ensure fresh copy of dist/public to server/public  
    const { cpSync } = await import('fs');
    cpSync(publicPath, serverPublicPath, { recursive: true });
    console.log('✅ Fresh static files copied to server/public');
    
    // CRITICAL: Add multiple cache-busting mechanisms
    const { writeFileSync } = await import('fs');
    const deployTimestamp = new Date().toISOString();
    const cacheBustId = Date.now();
    
    // Create deployment verification file
    writeFileSync(join(serverPublicPath, 'deploy-timestamp.txt'), deployTimestamp);
    writeFileSync(join(serverPublicPath, '.deployment-id'), cacheBustId.toString());
    
    // Update index.html with cache-busting parameters
    const indexPath = join(serverPublicPath, 'index.html');
    if (existsSync(indexPath)) {
      let indexContent = readFileSync(indexPath, 'utf-8');
      
      // Add cache-busting to script and CSS imports
      indexContent = indexContent.replace(
        /(src|href)="([^"]+\.(js|css))"/g, 
        `$1="$2?v=${cacheBustId}"`
      );
      
      // Add deployment meta tag
      indexContent = indexContent.replace(
        '<head>',
        `<head><meta name="deployment" content="${deployTimestamp}" data-cache-bust="${cacheBustId}">`
      );
      
      writeFileSync(indexPath, indexContent);
      console.log(`📋 Updated index.html with cache-busting: v${cacheBustId}`);
    }
    
    console.log(`🕒 Deployment ID: ${cacheBustId} at ${deployTimestamp}`);
    console.log(`📝 Verify deployment at: https://your-domain.com/deploy-timestamp.txt`);
    
  } catch (error) {
    console.warn('⚠️ Could not copy static files:', error.message);
    console.warn('   Frontend serving may not work correctly');
  }
  
  // Fix import.meta.dirname issue in bundled code - COMPREHENSIVE FIX
  console.log('🔧 Fixing import.meta.dirname in bundled code...');
  let indexContent = readFileSync(indexPath, 'utf-8');
  
  // Count all import.meta.dirname references
  const dirNameCount = (indexContent.match(/import\.meta\.dirname/g) || []).length;
  console.log(`🔍 Found ${dirNameCount} import.meta.dirname references`);
  
  console.log('🚨 CRITICAL: Applying comprehensive import.meta.dirname fixes...');
  
  // Force add the required dirname setup at the top (always needed)
  const dirnameSetup = `import { fileURLToPath } from "url";
import path from "path";
const __dirname = path.dirname(fileURLToPath(import.meta.url));

`;
  
  // Remove any existing similar imports to avoid duplication
  indexContent = indexContent.replace(/import \{ fileURLToPath \} from "url";\n?/g, '');
  indexContent = indexContent.replace(/import path from "path";\n?/g, '');
  indexContent = indexContent.replace(/const __dirname = .*?;\n?/g, '');
  
  // Add our setup at the very top
  indexContent = dirnameSetup + indexContent;
  console.log('✅ Added required dirname setup');
  
  // Replace ALL import.meta.dirname with __dirname (force replacement)
  const beforeCount = (indexContent.match(/import\.meta\.dirname/g) || []).length;
  indexContent = indexContent.replace(/import\.meta\.dirname/g, '__dirname');
  const afterCount = (indexContent.match(/import\.meta\.dirname/g) || []).length;
  
  console.log(`✅ Replaced ${beforeCount - afterCount} import.meta.dirname references`);
  console.log(`⚠️ Remaining references: ${afterCount}`);
  
  // Verify the critical paths are fixed
  if (indexContent.includes('path.resolve(__dirname')) {
    console.log('✅ Critical path.resolve calls are now using __dirname');
  } else {
    console.warn('⚠️ No path.resolve(__dirname) calls found - this might indicate an issue');
  }
  
  writeFileSync(indexPath, indexContent, 'utf-8');
  console.log('✅ COMPREHENSIVE dirname fix applied successfully');
  
  // FORCE: Add build validation checks
  const buildValidation = {
    indexExists: existsSync(indexPath),
    publicExists: existsSync(publicPath),
    serverPublicExists: existsSync(join(__dirname, 'server', 'public')),
    buildSize: (readFileSync(indexPath).length / 1024).toFixed(1)
  };
  
  console.log('🔍 Build validation:', buildValidation);
  
  if (!buildValidation.serverPublicExists) {
    console.error('❌ CRITICAL: server/public directory missing - frontend will not serve!');
    process.exit(1);
  }
  
  console.log('✅ Production build verified and optimized successfully');
  console.log(`   - dist/index.js: ${(readFileSync(indexPath).length / 1024).toFixed(1)}KB`);
  console.log(`   - dist/public: ${existsSync(publicPath) ? 'exists' : 'missing'}`);
  
} catch (error) {
  console.error('❌ Build optimization failed:', error.message);
  process.exit(1);
}