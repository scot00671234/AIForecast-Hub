#!/bin/bash
# ULTIMATE DEPLOYMENT FIX - Docker-compatible fresh frontend deployment
set -e

echo "🚀 ULTIMATE DEPLOYMENT FIX - Docker-compatible approach"
echo "📅 Deployment timestamp: $(date)"

# 1. Clean build artifacts (Docker-compatible)
echo "🧹 Cleaning build artifacts..."
rm -rf dist/
rm -rf server/public/
rm -rf .vite/ 2>/dev/null || true
rm -rf .next/ 2>/dev/null || true
rm -rf build/ 2>/dev/null || true
rm -rf out/ 2>/dev/null || true

# Clean node_modules cache only if not mounted by Docker
if [ ! -d "node_modules/.cache" ] || [ -w "node_modules/.cache" ]; then
    rm -rf node_modules/.cache/ 2>/dev/null || true
fi

# 2. Generate unique build identifier  
BUILD_ID=$(date +%Y%m%d_%H%M%S)_$$
echo "🔢 Unique build ID: $BUILD_ID"

# 3. Skip npm operations that conflict with Docker cache mounts
echo "📦 Using existing dependencies..."

# 4. Set production environment variables
export NODE_ENV=production
export BUILD_ID="$BUILD_ID"
echo "🌍 Environment: NODE_ENV=$NODE_ENV"

# 5. Force fresh Vite build with unique identifiers
echo "🏗️ Building frontend with unique identifiers..."
VITE_BUILD_ID="$BUILD_ID" vite build 2>&1 | tee build.log

# 6. Verify frontend build
if [ ! -d "dist/public" ]; then
    echo "❌ FATAL: Frontend build failed - no dist/public"
    cat build.log
    exit 1
fi

FRONTEND_FILES=$(find dist/public -name "*.js" -o -name "*.css" | wc -l)
echo "✅ Frontend build: $FRONTEND_FILES assets created"

# 7. Copy with forced overwrite
echo "📋 Copying frontend files to server/public..."
mkdir -p server/public
cp -rf dist/public/* server/public/

# 8. Create deployment verification files
echo "$BUILD_ID" > server/public/build-id.txt
echo "$(date)" > server/public/deployment-time.txt
echo "NODE_ENV=$NODE_ENV" > server/public/environment.txt

# 9. Verify production files
echo "🔍 Final verification..."
ls -la server/public/ | head -10
echo "📝 Build ID file: $(cat server/public/build-id.txt)"
echo "📅 Deployment time: $(cat server/public/deployment-time.txt)"

# 10. Build backend
echo "🏗️ Building backend..."
esbuild server/index.ts --platform=node --packages=external --bundle --format=esm --outdir=dist

echo "✅ ULTIMATE DEPLOYMENT FIX COMPLETE"
echo "🎯 Build ID: $BUILD_ID"
echo "🌐 Verification URL: https://your-domain.com/build-id.txt"
echo "📋 Your production server WILL serve fresh frontend files now"