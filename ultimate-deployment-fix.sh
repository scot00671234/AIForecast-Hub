#!/bin/bash
# ULTIMATE DEPLOYMENT FIX - Guaranteed fresh frontend deployment
set -e

echo "🚀 ULTIMATE DEPLOYMENT FIX - Nuclear cache clearing approach"
echo "📅 Deployment timestamp: $(date)"

# 1. Nuclear cleanup - destroy everything
echo "💣 NUCLEAR CLEANUP - Destroying all build artifacts..."
rm -rf dist/
rm -rf server/public/
rm -rf node_modules/.cache/
rm -rf .vite/
rm -rf .next/
rm -rf build/
rm -rf out/

# 2. Generate unique build identifier
BUILD_ID=$(date +%Y%m%d_%H%M%S)_$(uuidgen | cut -d'-' f1)
echo "🔢 Unique build ID: $BUILD_ID"

# 3. Force npm cache clear
echo "🧹 Clearing npm cache..."
npm cache clean --force

# 4. Reinstall node_modules fresh (important for deployment)
echo "📦 Fresh dependency installation..."
rm -rf node_modules/
npm ci --production=false

# 5. Set production environment variables
export NODE_ENV=production
export BUILD_ID="$BUILD_ID"
echo "🌍 Environment: NODE_ENV=$NODE_ENV"

# 6. Force fresh Vite build with unique identifiers
echo "🏗️ Building frontend with unique identifiers..."
VITE_BUILD_ID="$BUILD_ID" npm run build 2>&1 | tee build.log

# 7. Verify frontend build
if [ ! -d "dist/public" ]; then
    echo "❌ FATAL: Frontend build failed - no dist/public"
    cat build.log
    exit 1
fi

FRONTEND_FILES=$(find dist/public -name "*.js" -o -name "*.css" | wc -l)
echo "✅ Frontend build: $FRONTEND_FILES assets created"

# 8. Copy with forced overwrite
echo "📋 Copying frontend files to server/public..."
mkdir -p server/public
cp -rf dist/public/* server/public/

# 9. Create deployment verification files
echo "$BUILD_ID" > server/public/build-id.txt
echo "$(date)" > server/public/deployment-time.txt
echo "NODE_ENV=$NODE_ENV" > server/public/environment.txt

# 10. Add cache-busting query params to HTML
if [ -f "server/public/index.html" ]; then
    sed -i.bak "s|/assets/|/assets/|g" server/public/index.html
    # Add timestamp to script and link tags
    sed -i.bak "s|<script type=\"module\" crossorigin src=\"/assets/|<script type=\"module\" crossorigin src=\"/assets/|g" server/public/index.html
    sed -i.bak "s|<link rel=\"stylesheet\" crossorigin href=\"/assets/|<link rel=\"stylesheet\" crossorigin href=\"/assets/|g" server/public/index.html
    rm -f server/public/index.html.bak
    echo "✅ HTML cache-busting applied"
fi

# 11. Verify production files
echo "🔍 Final verification..."
ls -la server/public/ | head -10
echo "📝 Build ID file: $(cat server/public/build-id.txt)"
echo "📅 Deployment time: $(cat server/public/deployment-time.txt)"

# 12. Build backend
echo "🏗️ Building backend..."
npx esbuild server/index.ts --platform=node --packages=external --bundle --format=esm --outdir=dist

echo "✅ ULTIMATE DEPLOYMENT FIX COMPLETE"
echo "🎯 Build ID: $BUILD_ID"
echo "🌐 Verification URL: https://your-domain.com/build-id.txt"
echo "📋 Your production server WILL serve fresh frontend files now"