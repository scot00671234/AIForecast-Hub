#!/bin/bash
# Deployment Cache Fix Script
# Run this during your Dokploy deployment to ensure fresh builds

echo "🚀 DEPLOYMENT CACHE FIX - Starting aggressive cache clearing..."

# 1. Clear ALL build artifacts
echo "🧹 Clearing all build artifacts..."
rm -rf dist
rm -rf server/public
rm -rf .vite
rm -rf .next
rm -rf node_modules/.cache
echo "✅ Build artifacts cleared"

# 2. Force npm cache clear
echo "🧹 Clearing npm cache..."
npm cache clean --force 2>/dev/null || echo "npm cache already clean"

# 3. Set cache-busting environment
export CACHE_BUST=$(date +%s)
export DEPLOYMENT_ID=$(date +%Y%m%d_%H%M%S)
echo "🔢 Cache bust ID: $CACHE_BUST"
echo "📅 Deployment ID: $DEPLOYMENT_ID"

# 4. Run build with fresh environment
echo "🔨 Running fresh build..."
npm ci --production=false
node fix-build.js

# 5. Verify build output
echo "🔍 Verifying build output..."
if [ -d "dist/public" ]; then
    echo "✅ Frontend build: $(ls dist/public | wc -l) files"
else
    echo "❌ Frontend build failed - no dist/public directory"
    exit 1
fi

if [ -f "dist/index.js" ]; then
    echo "✅ Backend build: $(stat -f%z dist/index.js 2>/dev/null || stat -c%s dist/index.js) bytes"
else
    echo "❌ Backend build failed - no dist/index.js file"
    exit 1
fi

if [ -d "server/public" ]; then
    echo "✅ Production files: $(ls server/public | wc -l) files copied"
    echo "📝 Index.html size: $(stat -f%z server/public/index.html 2>/dev/null || stat -c%s server/public/index.html) bytes"
else
    echo "❌ Production files missing - no server/public directory"
    exit 1
fi

echo "✅ DEPLOYMENT CACHE FIX COMPLETE"
echo "🚀 Your app should now show the latest changes"
echo "🌐 Test by visiting: https://your-domain.com/deploy-timestamp.txt"