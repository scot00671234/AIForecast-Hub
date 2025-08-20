# AIForecast Hub - Production Deployment Guide

## Quick Fix Summary

**The deployment errors have been systematically resolved:**

✅ **Fixed missing `fix-build.js`** - Created production build verification script  
✅ **Fixed port mismatch** - Updated nixpacks.toml from PORT=3000 to PORT=5000  
✅ **Optimized build process** - Removed Caddy conflicts, improved .dockerignore  
✅ **Added production validation** - Environment checks and startup verification  

## Dokploy VPS Deployment

### 1. Environment Variables

Set these in your Dokploy environment:

```bash
# Required
NODE_ENV=production
PORT=5000
DATABASE_URL=postgresql://username:password@host:port/database

# API Keys (at least one required for predictions)
OPENAI_API_KEY=your-openai-key
ANTHROPIC_API_KEY=your-claude-key  
DEEPSEEK_API_KEY=your-deepseek-key

# Session Security
SESSION_SECRET=your-secure-random-string
```

### 2. Database Setup

The app automatically handles database schema initialization. Ensure your PostgreSQL database is accessible and the `DATABASE_URL` is correct.

### 3. Build Configuration

The updated `nixpacks.toml` now properly:
- Sets correct port (5000)
- Excludes fix-build.js errors
- Optimizes for Node.js deployment
- Includes build verification

### 4. Deployment Commands

```bash
# Build will automatically run:
npm ci --production=false
npm run build
node fix-build.js  # Verifies build success

# Start will run:
node dist/index.js
```

## Health Check

Once deployed, verify the application:

```bash
curl https://your-domain.com/api/health
```

Expected response:
```json
{
  "status": "healthy",
  "timestamp": "2025-01-...",
  "environment": "production"
}
```

## Common Issues & Solutions

### Issue: Build fails with "Cannot find module"
**Solution**: The fix-build.js script now exists and validates the build

### Issue: App starts on wrong port
**Solution**: PORT is now correctly set to 5000 in nixpacks.toml

### Issue: Database connection fails
**Solution**: Verify DATABASE_URL format: `postgresql://user:pass@host:port/db`

### Issue: No predictions generated
**Solution**: Add at least one AI API key (OpenAI, Claude, or DeepSeek)

## Production Monitoring

The application includes:
- Automatic database connection validation
- AI service status monitoring  
- Request logging and error handling
- Graceful shutdown handling
- Memory and resource optimization

## File Changes Made

1. **nixpacks.toml** - Fixed port and build configuration
2. **fix-build.js** - Created missing build verification script
3. **.dockerignore** - Optimized for production deployment
4. **production.env.example** - Environment variables template
5. **production-start.js** - Robust production startup script

## Success Indicators

When deployment succeeds, you'll see:

```
🚀 Starting AIForecast Hub (Professional Edition)
🔧 Initializing critical services...
✅ Database connection established
✅ Database schema and default data initialized
✅ Critical initialization complete
⚡ Starting heavy initialization (background)...
✅ Server running on port 5000
🎯 Application ready - all systems operational
```

The application is now production-ready for Dokploy VPS deployment.