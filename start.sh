#!/bin/bash
set -e

echo "🚀 Starting AIForecast Hub..."

# Wait for database to be ready
echo "📦 Waiting for database connection..."
until npm run db:push 2>/dev/null; do
  echo "⏳ Database not ready yet, waiting 5 seconds..."
  sleep 5
done

echo "✅ Database ready and schema updated!"

# Start the application
echo "🎯 Starting Node.js application..."
exec node dist/index.js