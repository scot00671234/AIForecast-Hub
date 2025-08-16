# VPS Deployment Guide for AIForecast Hub

## Root Cause of Bad Gateway

The "Bad Gateway" error is caused by **nixpacks incorrectly detecting Caddy** instead of Node.js, despite our prevention measures. The deployment logs show:

```
║ caddy      │ pkgs: caddy                                   ║
║            │ cmds: caddy fmt --overwrite /assets/Caddyfile ║
```

And the startup failure:
```
/bin/bash: line 1: ./start.sh: Permission denied
```

## Solution: Environment Variables Configuration

### Required Environment Variables

Set these in your **Environment Settings** tab in dokploy:

```bash
# Node.js Detection
NODE_ENV=production
PORT=3000

# Force Node.js (Anti-Caddy)
NIXPACKS_NO_CADDY=1
NIXPACKS_NO_STATIC_SITE=1
NIXPACKS_FORCE_NODE=1
FORCE_NODE_ONLY=true

# Database Configuration
DATABASE_URL=postgresql://postgres:<password>@<host>:5432/<dbname>?sslmode=require
DATABASE_SSL=true

# Session Security
SESSION_SECRET=your-super-secure-session-secret-here

# API Keys (Optional - only if you have them)
OPENAI_API_KEY=your-openai-api-key
ANTHROPIC_API_KEY=your-claude-api-key
```

### Manual Deployment Process

If the automated deployment keeps failing:

1. **SSH into your VPS**
2. **Clone the repository manually**:
   ```bash
   git clone https://github.com/scot00671234/AIForecast-Hub.git
   cd AIForecast-Hub
   ```
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