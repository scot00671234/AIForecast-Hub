#!/bin/bash
# FIXED: Ensure HTML references new assets
set -e

echo "🔧 PRODUCTION FIX - Ensuring HTML references new assets"

# 1. Clean everything completely 
rm -rf dist/ server/public/
export NODE_ENV=production

# 2. Build with Vite (this creates new asset names)
echo "🏗️ Building frontend..."
vite build

# 3. Verify build created new assets
if [ ! -d "dist/public" ]; then
    echo "❌ Build failed - no dist/public"
    exit 1
fi

echo "📋 New assets created:"
ls -la dist/public/assets/ || echo "No assets found"

# 4. Copy files ensuring HTML gets the updated asset references
mkdir -p server/public
cp -rf dist/public/* server/public/

echo "📋 Production files copied:"
ls -la server/public/assets/ || echo "No assets copied"

# 5. Verify HTML has correct asset references
echo "🔍 Checking HTML asset references:"
if [ -f "server/public/index.html" ]; then
    echo "Current HTML asset references:"
    grep -o '/assets/[^"]*' server/public/index.html || echo "No asset references found"
else
    echo "❌ No index.html found in server/public"
    exit 1
fi

# 6. Add debug endpoints to verify everything
echo "🔧 Creating debug verification files..."
cat > server/public/debug.html << 'EOF'
<!DOCTYPE html>
<html>
<head><title>Production Debug</title></head>
<body>
<h1>Production Backend Debug</h1>
<script>
// Test all API endpoints
const tests = [
    '/api/health',
    '/api/commodities', 
    '/api/dashboard/stats',
    '/api/ai-models'
];

tests.forEach(async (endpoint) => {
    try {
        const response = await fetch(endpoint);
        const data = await response.json();
        document.body.innerHTML += `<p>✅ ${endpoint}: ${response.status} - ${JSON.stringify(data).slice(0,100)}...</p>`;
    } catch (error) {
        document.body.innerHTML += `<p>❌ ${endpoint}: ERROR - ${error.message}</p>`;
    }
});
</script>
</body>
</html>
EOF

# 7. Create verification endpoints  
echo "PORT=$(printenv PORT || echo '5000')" > server/public/port-check.txt
echo "NODE_ENV=$(printenv NODE_ENV || echo 'undefined')" > server/public/env-check.txt
echo "TIMESTAMP=$(date)" > server/public/debug-time.txt

# 8. Log asset info for debugging
if [ -d "server/public/assets" ]; then
    ls -la server/public/assets/ > server/public/assets-list.txt
    echo "Assets successfully copied to production"
else
    echo "ERROR: No assets directory in server/public" > server/public/assets-list.txt
fi

# 9. Build backend
esbuild server/index.ts --platform=node --packages=external --bundle --format=esm --outdir=dist

echo "✅ PRODUCTION BUILD COMPLETE"
echo "🌐 Test: https://your-domain.com/debug.html"
echo "📋 Assets: https://your-domain.com/assets-list.txt"
echo "🔧 Port: https://your-domain.com/port-check.txt"
echo "📅 Time: https://your-domain.com/debug-time.txt"