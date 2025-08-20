# AI Commodity Price Prediction Platform

## Overview
This platform is a full-stack web application for tracking and analyzing AI model predictions of commodity prices. It features a minimalist landing page and a comprehensive dashboard where users can compare the accuracy of various AI models (Claude, ChatGPT, Deepseek) in predicting both hard and soft commodity prices. Key capabilities include real-time price tracking from Yahoo Finance, interactive charts, model performance analytics, and league tables. The project aims to provide a robust, data-driven tool for assessing AI prediction capabilities in financial markets.

## User Preferences
Preferred communication style: Simple, everyday language.

## Recent Changes (August 2025)
- **Platform Enhancement Package August 2025**: Complete platform improvement with educational content and user experience enhancements
- **New Educational Pages**: Added comprehensive About and FAQ pages to improve user understanding and engagement
- **Enhanced Navigation**: Updated site navigation across all pages with consistent menu structure (Landing, Dashboard, About, FAQ, Blog, Policy)
- **Component Optimization August 2025**: Fixed constant loading issue by removing infinite retry loops in CompositeIndexGauge and related dashboard components
- **Minimalist Design Update**: Simplified dashboard cards with cleaner spacing, reduced padding, and subtle loading states using triangle icons
- **Company Information Added**: Added Loremt ApS CVR-nr 41691360 to footer across all pages (landing, dashboard, blog)
- **Monthly Multi-Timeframe Predictions**: Complete architecture overhaul from weekly 7-day predictions to monthly 3mo/6mo/9mo/12mo predictions on 1st of each month
- **Timeframe-Aware Schema**: Added timeframe field to predictions table with production-safe migration for existing deployments
- **Enhanced AI Services**: Updated OpenAI, Claude, and Deepseek services with timeframe-specific prediction logic and prompts
- **Production Migration Safety**: Updated production-migrate.ts script to handle schema changes seamlessly for Dokploy VPS deployments
- **Overlap Management**: Implemented full prediction overlap preservation for rich accuracy analysis and prediction evolution tracking
- **Claude Model Fix**: Fixed critical Claude prediction failures by updating to current model version (claude-sonnet-4-20250514) and added JSON parsing robustness for markdown code blocks
- **Production Migration System**: Created comprehensive database migration system with automatic production deployment
- **Robust Error Handling**: Fixed critical production issue (42P01 - relation 'commodities' does not exist) with multi-layer migration approach
- **Enhanced Deployment**: Added automatic schema creation, conflict resolution, and production-ready scripts (deploy.sh, production-migrate.ts)
- **Replit Migration Complete**: Successfully migrated from Replit Agent to standard Replit environment with PostgreSQL setup
- **Migration Completed August 2025**: Full migration from Replit Agent to Replit environment completed with PostgreSQL database, all dependencies installed, and server running successfully
- **Mobile Compatibility**: Enhanced responsive design across all components for optimal mobile viewing experience
- **Real Accuracy System**: Implemented comprehensive accuracy calculation based on actual AI predictions vs real historical prices
- **Production-Ready**: League table and scoreboards now use authentic prediction data instead of mock data
- **Multi-Service Integration**: Simultaneous prediction generation using OpenAI, Anthropic, and DeepSeek APIs with robust error handling
- **API Management**: Comprehensive manual trigger endpoints for all prediction operations and service status monitoring

## System Architecture
### Frontend
- **Framework**: React with TypeScript (Vite)
- **UI**: shadcn/ui (Radix UI), Tailwind CSS with a minimalist design, clean typography, and seamless light/dark theme switching (light mode default)
- **State Management**: TanStack React Query
- **Routing**: Wouter for lightweight client-side routing
- **Charts**: Recharts for interactive data visualization
- **Forms**: React Hook Form with Zod validation
- **Visual Design**: Triangle logo, subtle geometric background patterns, minimal button styles with glass effects.
- **Pages**: 6 comprehensive pages - Landing page, dashboard, about, FAQ, blog, and policy pages with consistent header and navigation.

### Backend
- **Runtime**: Node.js with Express.js
- **Language**: TypeScript (ES modules)
- **Build**: esbuild for production bundling
- **API**: RESTful endpoints with error handling and request logging.
- **Deployment**: VPS-ready with nixpacks.toml for Dokploy.

### Data Layer
- **Database**: PostgreSQL (Neon serverless database)
- **ORM**: Drizzle ORM for type-safe queries and migrations
- **Schema**: Covers AI models, commodities, predictions, actual prices, accuracy metrics, and market alerts.
- **Validation**: Zod schemas for runtime type validation.
- **Storage**: DatabaseStorage class for CRUD operations.
- **Historical Data**: Comprehensive historical AI prediction data for the past year across all commodities and models, with intelligent caching.

### Key Design Patterns
- **Monorepo**: Shared TypeScript types and schemas.
- **Type Safety**: End-to-end type safety from database to UI.
- **Component Architecture**: Atomic design principles for reusable UI components.
- **Data Fetching**: Query-based architecture with optimistic updates.
- **Theme System**: CSS custom properties with dynamic switching.
- **Responsive Design**: Mobile-first approach.
- **Minimalist Aesthetic**: Clean typography, ample whitespace, subtle geometric patterns, triangle logo system.
- **Consistent Branding**: Unified design language across the application.
- **Deployment Architecture**: Three-phase startup system (initialization, server startup, background processing) with a StartupManager service for robust deployment.
- **Real-time Accuracy**: Comprehensive accuracy calculation using MAPE, directional accuracy, and threshold-based methods.
- **Production Predictions**: Automatic weekly prediction generation with rate limiting and error handling.

## External Dependencies
- **Yahoo Finance API**: Real-time commodity price data.
- **OpenAI API**: GPT-4o integration for AI predictions.
- **Claude API**: Integration for AI predictions.
- **Deepseek API**: Integration for AI predictions.
- **Google Fonts**: For typography.
- **Replit**: Integrated with cartographer plugin and runtime error overlay.