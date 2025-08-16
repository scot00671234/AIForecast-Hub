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

// Ensure dist/public structure exists
const publicDir = path.resolve('dist', 'public');
if (fs.existsSync(publicDir)) {
  console.log('✅ Public directory structure is correct');
} else {
  console.log('❌ Public directory not found');
}