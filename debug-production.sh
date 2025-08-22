#!/bin/bash
# DEBUG PRODUCTION DEPLOYMENT - Find the real issue
set -e

echo "🔍 PRODUCTION DEBUG - Finding the real backend issue"

# 1. Clean build  
rm -rf dist/ server/public/
export NODE_ENV=production

# 2. Build everything
vite build
mkdir -p server/public
cp -rf dist/public/* server/public/

# 3. Add debug endpoints to verify backend
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

# 4. Create verification endpoints
echo "PORT=$(printenv PORT || echo '5000')" > server/public/port-check.txt
echo "NODE_ENV=$(printenv NODE_ENV || echo 'undefined')" > server/public/env-check.txt
echo "TIMESTAMP=$(date)" > server/public/debug-time.txt

# 5. Build backend with debug logging
esbuild server/index.ts --platform=node --packages=external --bundle --format=esm --outdir=dist

echo "✅ DEBUG BUILD COMPLETE"
echo "🌐 Test production backend: https://your-domain.com/debug.html"
echo "🔧 Check port: https://your-domain.com/port-check.txt"
echo "🔧 Check env: https://your-domain.com/env-check.txt"