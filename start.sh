#!/bin/bash
set -e

echo "🚀 Starting AIForecast Hub (Professional Edition)"

# Wait for database and ensure schema
echo "📦 Initializing database..."
max_attempts=12
attempt=0
while [ $attempt -lt $max_attempts ]; do
  if npm run db:push 2>/dev/null; then
    echo "✅ Database schema ready!"
    break
  fi
  attempt=$((attempt + 1))
  echo "⏳ Database not ready (attempt $attempt/$max_attempts), waiting 10 seconds..."
  sleep 10
done

if [ $attempt -eq $max_attempts ]; then
  echo "❌ Database initialization failed after $max_attempts attempts"
  echo "🔄 Starting application anyway with fallback data..."
fi

# Start the application
echo "🎯 Starting Node.js application on port $PORT..."
exec node dist/index.js