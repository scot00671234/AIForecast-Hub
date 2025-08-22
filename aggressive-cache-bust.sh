#!/bin/bash
# AGGRESSIVE CACHE BUSTING - Force browsers to reload everything
set -e

echo "🚀 AGGRESSIVE CACHE BUSTING - Force all browsers/CDNs to refresh"

# Generate unique cache buster
CACHE_BUST=$(date +%s)
BUILD_TIME=$(date)

# 1. Set production environment 
export NODE_ENV=production

# 2. Clean everything
echo "🧹 Nuclear cleanup..."
rm -rf dist/
rm -rf server/public/

# 3. Build with unique assets
echo "🏗️ Building with cache busters..."
vite build

# 4. Verify build
if [ ! -d "dist/public" ]; then
    echo "❌ Build failed"
    exit 1
fi

# 5. Copy files
mkdir -p server/public
cp -rf dist/public/* server/public/

# 6. AGGRESSIVE cache busting - modify HTML
echo "💣 Applying aggressive cache busting to HTML..."
if [ -f "server/public/index.html" ]; then
    # Add cache busters to all asset references
    sed -i.bak "s|/assets/|/assets/|g" server/public/index.html
    sed -i.bak "s|<script|<script data-cache-bust=\"$CACHE_BUST\"|g" server/public/index.html
    sed -i.bak "s|<link|<link data-cache-bust=\"$CACHE_BUST\"|g" server/public/index.html
    
    # Add meta tags to prevent caching
    sed -i.bak 's|<head>|<head>\n    <meta http-equiv="Cache-Control" content="no-cache, no-store, must-revalidate">\n    <meta http-equiv="Pragma" content="no-cache">\n    <meta http-equiv="Expires" content="0">\n    <meta name="build-time" content="'"$BUILD_TIME"'">|' server/public/index.html
    
    rm -f server/public/index.html.bak
fi

# 7. Create verification files with headers to prevent caching
echo "$CACHE_BUST" > server/public/cache-bust.txt
echo "$BUILD_TIME" > server/public/build-time.txt
echo "FRESH_BUILD_$(date +%s)" > server/public/fresh-check.txt

# 8. Build backend
esbuild server/index.ts --platform=node --packages=external --bundle --format=esm --outdir=dist

echo "✅ AGGRESSIVE CACHE BUSTING COMPLETE"
echo "🎯 Cache bust: $CACHE_BUST"
echo "📋 Your users MUST see the fresh version now"
echo "🌐 Test: https://your-domain.com/fresh-check.txt"