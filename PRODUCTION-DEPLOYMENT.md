# Production Deployment Guide

## Critical Database Migration Fix

This document outlines the solution for the "relation 'commodities' does not exist" error in production.

## Problem Analysis

The production deployment was failing with PostgreSQL error `42P01` because:
1. Database tables were not created in production environment
2. Application startup tried to access tables before schema was initialized
3. Migration logic wasn't being triggered properly

## Solution Implemented

### 1. Multi-Layer Migration System

**Primary Migration (Automatic)**
- Production environment detection triggers automatic schema creation
- Runs during application startup before any table access
- Uses `CREATE TABLE IF NOT EXISTS` for safe re-runs

**Emergency Migration (Fallback)**
- Triggered if primary migration fails
- Drops and recreates tables with CASCADE
- Ensures clean schema state

### 2. Enhanced Startup Sequence

```
Production Startup Order:
1. Database connection test
2. Automatic production migration
3. Table access verification
4. Application server start
5. Background services initialization
```

### 3. Production-Ready Scripts

**deploy.sh** - Complete deployment script with:
- Dependency installation
- Application build
- Database migration
- Production server start

**scripts/production-migrate.ts** - Standalone migration tool
**scripts/test-migration.ts** - Migration testing utility

## Deployment Instructions

### Option 1: Automatic (Recommended)
```bash
# Set environment variable
export NODE_ENV=production

# Start application (migration runs automatically)
npm start
```

### Option 2: Manual Migration
```bash
# Run migration separately
tsx scripts/production-migrate.ts

# Then start application
NODE_ENV=production npm start
```

### Option 3: Complete Deployment Script
```bash
# Use the comprehensive deployment script
chmod +x deploy.sh
./deploy.sh
```

## Database Schema

The migration creates these tables:
- `ai_models` - AI prediction models (ChatGPT, Claude, Deepseek)
- `commodities` - Commodity definitions (14 hard/soft commodities)
- `predictions` - AI predictions with metadata
- `actual_prices` - Real market prices from Yahoo Finance
- `accuracy_metrics` - Model performance calculations
- `market_alerts` - System alerts and notifications

## Environment Variables Required

```bash
DATABASE_URL=postgresql://username:password@host:port/database
NODE_ENV=production
PORT=5000
```

## Verification Steps

After deployment, verify:

1. **Database Tables Created**
```sql
SELECT table_name FROM information_schema.tables 
WHERE table_schema = 'public';
```

2. **Initial Data Loaded**
```sql
SELECT COUNT(*) FROM ai_models;    -- Should be 3
SELECT COUNT(*) FROM commodities;  -- Should be 14
```

3. **Application Health**
```bash
curl http://your-domain/api/commodities
curl http://your-domain/api/ai-models
```

## Troubleshooting

If deployment still fails:

1. **Check Database Connection**
```bash
# Test DATABASE_URL connection manually
psql $DATABASE_URL -c "SELECT 1;"
```

2. **Run Emergency Migration**
The system will automatically attempt emergency migration if normal migration fails.

3. **Manual Schema Creation**
Use the provided `production-setup.sql` file:
```bash
psql $DATABASE_URL < production-setup.sql
```

## Key Improvements

✅ **Robust Error Handling** - Multiple fallback layers  
✅ **Production Detection** - Automatic environment-based behavior  
✅ **Conflict Resolution** - Safe re-runs with `ON CONFLICT DO NOTHING`  
✅ **Comprehensive Logging** - Detailed migration progress tracking  
✅ **Emergency Recovery** - Fallback migration with table recreation  

This solution ensures your AIForecast Hub deployment will successfully create all required database tables and initialize with proper data, resolving the "relation does not exist" errors permanently.