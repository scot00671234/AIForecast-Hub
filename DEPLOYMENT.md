# AIForecast Hub - Replit Deployment

## Overview

The AIForecast Hub is a React + Express application that provides AI-powered quarterly commodity price forecasting. The system generates monthly predictions for 3mo, 6mo, 9mo, and 12mo timeframes using Claude, ChatGPT, and DeepSeek models. It runs seamlessly on Replit with an integrated PostgreSQL database.

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
4. **API**: Express server handles backend requests at the same port
5. **Prediction Scheduler**: Automatically generates quarterly predictions monthly on the 1st at 3 AM
6. **AI Services**: Supports OpenAI, Anthropic, and DeepSeek APIs for prediction generation

## Troubleshooting

### Issue: Predictions Not Generating
**Solution**: Ensure AI API keys are properly configured in Replit Secrets.

### Issue: Database Schema Errors
**Solution**: The app automatically initializes the database schema on startup.

### Issue: Database Connection Failed
**Solution**: Verify your DATABASE_URL is correct and the database is accessible from your VPS.

## Key Features

- **Quarterly Forecasting**: Generates 3mo, 6mo, 9mo, and 12mo predictions
- **Monthly Scheduling**: Automatic prediction generation on the 1st of each month
- **Multi-AI Integration**: Uses Claude, ChatGPT, and DeepSeek models
- **Timeframe Filtering**: Frontend supports filtering by prediction timeframe
- **Real-time Data**: Yahoo Finance integration for current commodity prices
- **Accuracy Tracking**: Comprehensive model performance analytics

## Files Created for Deployment

The following files have been created/updated for Replit deployment:

- `nixpacks.toml` - Configures Node.js startup
- `package.json` - Dependencies and scripts
- `tsconfig.json` - TypeScript configuration
- `vite.config.ts` - Frontend build configuration

## Success Indicators

When deployment works correctly, you should see:

```
🚀 Starting AIForecast Hub (Professional Edition)
🔧 Initializing critical services...
✅ Database connection established
✅ Database schema and default data initialized
✅ Critical initialization complete
⚡ Starting heavy initialization (background)...
✅ Server running on port 5000
🎯 Application ready - all systems operational
Prediction scheduler started with schedules:
- Monthly comprehensive: Every 1st of the month at 3 AM (3mo, 6mo, 9mo, 12mo predictions)
- Weekly predictions have been disabled
✅ Background initialization complete
```

The application should start successfully with all services initialized and the prediction scheduler configured for quarterly forecasting.