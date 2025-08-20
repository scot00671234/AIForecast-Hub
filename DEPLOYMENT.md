# AIForecast Hub - Replit Deployment

## Overview

The AIForecast Hub is a React + Express application that provides AI-powered commodity price forecasting. It runs seamlessly on Replit with an integrated PostgreSQL database.

## Environment Setup

The application automatically configures itself for Replit with the following environment variables:

```bash
# Automatically provided by Replit
DATABASE_URL=<automatically-configured>
NODE_ENV=development

# Optional API Keys (add in Secrets)
OPENAI_API_KEY=your-openai-api-key
ANTHROPIC_API_KEY=your-claude-api-key
DEEPSEEK_API_KEY=your-deepseek-api-key
```

## Development

1. **Start the application**: The workflow automatically runs `npm run dev`
2. **Database**: PostgreSQL database is automatically created and configured
3. **Frontend**: React app served at `http://localhost:5000`
4. **API**: Express server handles backend requests
3. **Install dependencies**:
   ```bash
   npm install
   ```
4. **Build the application**:
   ```bash
   npm run build
   node fix-build.js
   ```
5. **Set environment variables**:
   ```bash
   export NODE_ENV=production
   export PORT=3000
   export DATABASE_URL="your-database-url"
   export SESSION_SECRET="your-session-secret"
   ```
6. **Start the application**:
   ```bash
   node dist/index.js
   ```

## Troubleshooting

### Issue: Permission Denied on start.sh
**Solution**: The app now uses direct Node.js startup (`node dist/index.js`) instead of shell scripts.

### Issue: Caddy Still Being Detected
**Solution**: Set all the anti-Caddy environment variables listed above.

### Issue: Database Connection Failed
**Solution**: Verify your DATABASE_URL is correct and the database is accessible from your VPS.

## Files Created for Deployment

The following files have been created/updated to force Node.js detection:

- `.buildpacks` - Forces Heroku Node.js buildpack
- `.nixpacks` - Forces nodejs provider
- `Procfile` - Defines web process as Node.js
- `runtime.txt` - Specifies Node.js 18.x
- `.dockerignore` - Blocks all Caddy-related files
- Updated `nixpacks.toml` - Direct Node.js startup

## Success Indicators

When deployment works correctly, you should see:

```
🚀 Starting AIForecast Hub (Professional Edition)
🔧 Initializing critical services...
✅ Database connection verified
⚡ Starting heavy initialization (background)...
✅ Server running on port 3000
🎯 Application ready - all systems operational
```

No Caddy-related logs should appear in the build process.