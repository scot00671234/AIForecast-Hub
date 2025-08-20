#!/bin/bash

# Production deployment script for AIForecast Hub

echo "🚀 Starting production deployment..."

# Step 1: Install dependencies
echo "📦 Installing dependencies..."
npm install

# Step 2: Fix database schema
echo "🔧 Fixing database schema..."
node fix-production-simple.js

# Step 3: Build the application
echo "🏗️ Building application..."
npm run build

# Step 4: Start the application
echo "▶️ Starting application..."
npm start