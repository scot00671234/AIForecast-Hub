# Production Deployment Guide

## Database Migration Issue Fix

The production logs showed a critical issue: **relation 'commodities' does not exist** (Error code 42P01). This guide provides the systematic solution.

## Root Cause
The database tables were not properly created in the production environment, causing all API endpoints to fail.

## Solution Overview

We've implemented a robust, multi-layer database migration system:

### 1. Automatic Production Migration
- **Enhanced Storage Class**: Added `runProductionMigration()` method that automatically creates missing tables
- **Automatic Retry**: If initial connection fails, the system attempts auto-migration in production
- **Resilient Schema Creation**: Uses `CREATE TABLE IF NOT EXISTS` to prevent conflicts
- **Data Insertion**: Automatically inserts required AI models and commodities with conflict handling

### 2. Manual Migration Scripts
- **`scripts/production-migrate.ts`**: Standalone migration script for manual execution
- **`production-setup.sql`**: Complete SQL script for direct database execution
- **`deploy.sh`**: Comprehensive deployment script

### 3. Deployment Process

#### Option A: Automated Deployment (Recommended)
```bash
# Use the deployment script
./deploy.sh
```

#### Option B: Manual Deployment Steps
```bash
# 1. Install dependencies
npm ci --production=false

# 2. Build application
npm run build

# 3. Run migration manually
tsx scripts/production-migrate.ts

# 4. Start production server
NODE_ENV=production npm start
```

#### Option C: Direct SQL Execution
If automated methods fail, run the `production-setup.sql` script directly in your database:

1. Connect to your PostgreSQL database
2. Execute the entire `production-setup.sql` file
3. Verify setup with: `SELECT * FROM commodities LIMIT 5;`

## Environment Requirements

Ensure these environment variables are set:
```
DATABASE_URL=postgresql://username:password@host:port/database
NODE_ENV=production
```

## Verification Steps

After deployment, verify the setup:

1. **Check Tables Exist**:
   ```sql
   SELECT table_name FROM information_schema.tables 
   WHERE table_schema = 'public';
   ```

2. **Check Data Integrity**:
   ```sql
   SELECT COUNT(*) FROM ai_models;
   SELECT COUNT(*) FROM commodities;
   ```

3. **Test API Endpoints**:
   - `GET /api/commodities` - Should return 14 commodities
   - `GET /api/ai-models` - Should return 3 AI models
   - `GET /api/league-table/30d` - Should return rankings

## Enhanced Error Handling

The system now includes:
- **Automatic Migration**: Attempts to fix schema issues on startup
- **Graceful Degradation**: Clear error messages for debugging
- **Conflict Resolution**: Handles existing data gracefully
- **Production-Ready Logging**: Detailed logs for troubleshooting

## Success Indicators

You'll see these logs when deployment is successful:
```
🚀 Starting AIForecast Hub (Professional Edition)
✅ Database connection established
✅ Database connection verified
✅ Critical initialization complete
⚡ Starting background initialization...
✅ Server running on port 5000
🎯 Application ready - all systems operational
```

## Troubleshooting

If you still encounter issues:
1. Check `DATABASE_URL` is correctly set
2. Ensure database accepts connections
3. Run migration script manually: `tsx scripts/production-migrate.ts`
4. Check database permissions for table creation
5. Review application logs for specific error messages

## Support

For additional support:
- Check the enhanced error logs in the application
- Verify database connectivity
- Ensure all environment variables are properly configured