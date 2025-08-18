#!/bin/bash

# Production Startup Script for AIForecast Hub
echo "🚀 Starting AIForecast Hub Production Server"
echo "⚡ Environment: $NODE_ENV"

# Start the application
NODE_ENV=production node dist/index.js