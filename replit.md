# AI Commodity Price Prediction Platform

## Overview
This platform is a full-stack web application for tracking and analyzing AI model predictions of commodity prices. It features a minimalist landing page and a comprehensive dashboard where users can compare the accuracy of various AI models (Claude, ChatGPT, Deepseek) in predicting both hard and soft commodity prices. Key capabilities include real-time price tracking from Yahoo Finance, interactive charts, model performance analytics, and league tables. The project aims to provide a robust, data-driven tool for assessing AI prediction capabilities in financial markets.

## User Preferences
Preferred communication style: Simple, everyday language.

## Recent Changes (August 2025)
- **Real Accuracy System**: Implemented comprehensive accuracy calculation based on actual AI predictions vs real historical prices
- **Production-Ready**: League table and scoreboards now use authentic prediction data instead of mock data
- **Initial Deployment Trigger**: Added automatic AI prediction generation on first deployment
- **Database Migration**: Successfully migrated from Replit Agent environment with PostgreSQL setup
- **API Integration**: Full integration ready for OpenAI, Claude, and Deepseek API keys in production

## System Architecture
### Frontend
- **Framework**: React with TypeScript (Vite)
- **UI**: shadcn/ui (Radix UI), Tailwind CSS with a minimalist design, clean typography, and seamless light/dark theme switching (light mode default)
- **State Management**: TanStack React Query
- **Routing**: Wouter for lightweight client-side routing
- **Charts**: Recharts for interactive data visualization
- **Forms**: React Hook Form with Zod validation
- **Visual Design**: Triangle logo, subtle geometric background patterns, minimal button styles with glass effects.
- **Pages**: Landing page, dashboard, blog, and policy pages with consistent header and navigation.

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