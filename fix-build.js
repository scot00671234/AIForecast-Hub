#!/usr/bin/env node

import fs from 'fs';
import path from 'path';

// Fix the bundled server code to handle missing import.meta.dirname
const distIndexPath = path.resolve('dist', 'index.js');

if (fs.existsSync(distIndexPath)) {
  let content = fs.readFileSync(distIndexPath, 'utf8');
  
  // Replace import.meta.dirname with process.cwd() in the bundled code
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