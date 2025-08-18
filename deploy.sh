#!/bin/bash

# AIForecast Hub Production Deployment Script
# This script ensures proper database setup and deployment

echo "🚀 Starting AIForecast Hub deployment..."

# Check if DATABASE_URL is set
if [ -z "$DATABASE_URL" ]; then
    echo "❌ ERROR: DATABASE_URL environment variable is not set"
    exit 1
fi

echo "✅ Database URL configured"

# Install dependencies
echo "📦 Installing dependencies..."
npm ci --production=false

# Build the application
echo "🔨 Building application..."
npm run build

if [ $? -ne 0 ]; then
    echo "❌ Build failed"
    exit 1
fi

echo "✅ Build completed"

# Run database migration
echo "🔧 Running database migration..."
tsx scripts/production-migrate.ts

if [ $? -ne 0 ]; then
    echo "❌ Database migration failed"
    exit 1
fi

echo "✅ Database migration completed"

# Start the application
echo "🎯 Starting production server..."
NODE_ENV=production npm start