#!/bin/bash
# Force Node.js startup script
export NODE_ENV=production
export PORT=${PORT:-3000}
export NO_CADDY=true
export DISABLE_CADDY=true
echo "🚀 Starting Node.js server (NO CADDY, NO STATIC SITE)"
exec node dist/index.js