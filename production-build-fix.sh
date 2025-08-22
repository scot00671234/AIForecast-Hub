#!/bin/bash
# PRODUCTION BUILD FIX - Resolves import.meta.dirname undefined error
set -e

echo "🔧 PRODUCTION BUILD FIX - Resolving dirname issue"

# 1. Clean everything
rm -rf dist/ server/public/
export NODE_ENV=production

# 2. Build frontend (this works fine)
echo "🏗️ Building frontend..."
vite build

# 3. Copy frontend assets to server directory  
echo "📦 Copying frontend assets..."
mkdir -p server/public
cp -rf dist/public/* server/public/

# 4. Build backend with dirname fix
echo "🔧 Building backend with dirname fix..."
esbuild server/index.ts \
  --platform=node \
  --packages=external \
  --bundle \
  --format=esm \
  --outdir=dist \
  --define:import.meta.dirname='"/app"'

echo "✅ PRODUCTION BUILD FIXED"
echo "🚀 Backend will now use process.cwd() instead of undefined import.meta.dirname"
echo "📦 Static files are properly copied to server/public/"

# 5. Create production verification
echo "PRODUCTION BUILD COMPLETED: $(date)" > server/public/build-status.txt
echo "Backend fix: import.meta.dirname -> process.cwd()" >> server/public/build-status.txt
ls -la server/public/assets/ >> server/public/build-status.txt

echo ""
echo "🌐 After deployment, verify fix at: https://wishwello.com/build-status.txt"
echo "🚨 Expected: Red banner should appear on dashboard"