#!/usr/bin/env node

import fs from 'fs';
import path from 'path';

// Fix the bundled server code to handle missing import.meta.dirname
const distIndexPath = path.resolve('dist', 'index.js');

if (fs.existsSync(distIndexPath)) {
  let content = fs.readFileSync(distIndexPath, 'utf8');
  
  // Fix path resolution for production - handle multiple patterns
  
  // First: Fix the serveStatic function specifically - it looks for 'public' directory
  content = content.replace(
    /path\d*\.resolve\(path\.dirname\(new URL\(import\.meta\.url\)\.pathname\),\s*['"]public['"]\)/g,
    'path.resolve(process.cwd(), "dist", "public")'
  );
  
  // Also handle direct import.meta.dirname patterns
  content = content.replace(
    /path\d*\.resolve\(import\.meta\.dirname,\s*['"]public['"]\)/g,
    'path.resolve(process.cwd(), "dist", "public")'
  );
  
  // Replace any remaining import.meta.dirname with process.cwd() for bundled code
  content = content.replace(
    /import\.meta\.dirname/g,
    'process.cwd()'
  );
  
  fs.writeFileSync(distIndexPath, content);
  console.log('✅ Fixed import.meta.dirname in bundled code');
} else {
  console.log('❌ dist/index.js not found');
}

// NUCLEAR CADDY ELIMINATION - Remove all static files and restructure
console.log('🚫 NUCLEAR CADDY ELIMINATION - Removing static files...');
try {
  const publicPath = path.join(process.cwd(), 'dist', 'public');
  const indexPath = path.join(process.cwd(), 'dist', 'index.html');
  const publicIndexPath = path.join(process.cwd(), 'dist', 'public', 'index.html');
  const assetsPath = path.join(process.cwd(), 'dist', 'assets');
  
  // Move assets out of public directory first
  if (fs.existsSync(publicPath)) {
    const publicAssetsPath = path.join(publicPath, 'assets');
    if (fs.existsSync(publicAssetsPath) && !fs.existsSync(assetsPath)) {
      fs.renameSync(publicAssetsPath, assetsPath);
      console.log('✅ Moved assets from public to dist/assets');
    }
  }
  
  // Remove all HTML files
  if (fs.existsSync(indexPath)) {
    fs.unlinkSync(indexPath);
    console.log('✅ Removed dist/index.html');
  }
  
  if (fs.existsSync(publicIndexPath)) {
    fs.unlinkSync(publicIndexPath);
    console.log('✅ Removed dist/public/index.html');
  }
  
  // Remove entire public directory
  if (fs.existsSync(publicPath)) {
    fs.rmSync(publicPath, { recursive: true, force: true });
    console.log('✅ Removed dist/public/ directory');
  }
  
  // Create multiple force markers
  const forceMarker = path.join(process.cwd(), 'dist', '.force-node');
  fs.writeFileSync(forceMarker, 'FORCE NODE.JS ONLY - NO STATIC SITE\nNO CADDY ALLOWED\nNODE.JS BACKEND APPLICATION');
  console.log('✅ Created .force-node marker');
  
  const nixpacksMarker = path.join(process.cwd(), 'dist', '.nixpacks-nodejs');
  fs.writeFileSync(nixpacksMarker, 'nodejs');
  console.log('✅ Created .nixpacks-nodejs marker');
  
  // Create a minimal package.json in dist to force Node.js detection
  const distPackageJson = path.join(process.cwd(), 'dist', 'package.json');
  const minimalPackage = {
    "name": "aiforecast-hub-production",
    "version": "1.0.0",
    "type": "module",
    "main": "index.js",
    "scripts": {
      "start": "node index.js"
    },
    "engines": {
      "node": ">=18.0.0"
    }
  };
  fs.writeFileSync(distPackageJson, JSON.stringify(minimalPackage, null, 2));
  console.log('✅ Created dist/package.json for Node.js detection');
  
} catch (error) {
  console.log('⚠️  Static file cleanup completed with warnings:', error.message);
}