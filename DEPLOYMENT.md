# VPS Deployment Guide for Dokploy

## Prerequisites
- VPS with Dokploy installed
- PostgreSQL database (can be on the same VPS or external)
- Domain name (optional)

## Environment Variables Configuration

### Where to Place API Keys in Dokploy:

**Use PROJECT Environment Variables for:**
- `OPENAI_API_KEY` - OpenAI GPT-4 API key
- `ANTHROPIC_API_KEY` - Claude API key  
- `DEEPSEEK_API_KEY` - Deepseek AI API key (if using)

**Use APP Environment Variables for:**
- `NODE_ENV=production`
- `PORT=5000` (or your preferred port)

**Use DATABASE Environment Variables for:**
- `DATABASE_URL` - PostgreSQL connection string
  - Format: `postgresql://username:password@host:port/database`
  - Example: `postgresql://user:pass@localhost:5432/commodity_predictions`

## Required Environment Variables

```bash
# AI Service API Keys (PROJECT ENV)
OPENAI_API_KEY=your_openai_api_key_here
ANTHROPIC_API_KEY=your_anthropic_api_key_here

# Database (DATABASE ENV)
DATABASE_URL=postgresql://username:password@host:port/database

# Application (APP ENV)
NODE_ENV=production
PORT=5000
```

## Deployment Configuration

**NUCLEAR MODE: Caddy Elimination Complete**

The app includes these deployment files to FORCE Node.js detection:
- `nixpacks.toml` - Explicit Node.js provider with Caddy disabled
- `.nixpacks` - Additional nixpacks configuration
- `Procfile` - Heroku-style process definition
- `.buildpacks` - Explicit Node.js buildpack specification  
- `runtime.txt` - Runtime version specification
- `package.json.nixpacks` - Minimal package.json for deployment
- `.dockerignore` - Blocks all Caddy-related files and configs

**Anti-Caddy Measures Deployed:**
- Explicitly disabled Caddy provider in nixpacks.toml
- Blocked all Caddy files in .dockerignore
- Added multiple Node.js detection triggers
- Disabled auto-detection for all non-Node.js providers

## Build Process

1. **Install**: `npm ci` (uses package-lock.json for consistent builds)
2. **Build**: `npm run build` (builds both frontend and backend)
3. **Start**: `npm start` (runs production server)

## Database Setup

1. Ensure PostgreSQL is running on your VPS or accessible externally
2. Create a database for the application
3. Set the `DATABASE_URL` environment variable
4. The app will automatically create tables on first run using Drizzle ORM

## Application Features

- **Graceful Fallback**: Works without database connection using in-memory storage
- **Real-time Data**: Fetches commodity prices from Yahoo Finance API
- **AI Predictions**: Generates weekly predictions using configured AI models
- **Responsive Design**: Works on desktop and mobile devices

## Port Configuration

The application serves both API and frontend on a single port (default: 5000):
- API routes: `/api/*`
- Frontend: All other routes serve the React application
- Static assets: Served from `/dist/public`

## Health Check

The application exposes several endpoints for monitoring:
- `GET /api/commodities` - Lists all tracked commodities
- `GET /api/dashboard/stats` - Application health and metrics

## Troubleshooting

### Database Connection Issues
- Verify `DATABASE_URL` format and credentials
- Check if PostgreSQL is running and accessible
- Application will use fallback storage if database is unavailable

### AI API Issues  
- Verify API keys are correctly set in PROJECT environment
- Application handles missing API keys gracefully
- Check API quotas and rate limits

### Build Issues
- Ensure Node.js 20.x is available
- Check that all dependencies install correctly
- Verify build output in `dist/` directory