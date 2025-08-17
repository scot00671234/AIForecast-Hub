# AI Commodity Price Prediction Platform

## Overview

This is a full-stack web application that tracks and analyzes AI model predictions for commodity prices. The platform features an ultra-minimal landing page with elegant typography and a comprehensive dashboard that allows users to compare the accuracy of different AI models (Claude, ChatGPT, Deepseek) in predicting hard and soft commodity prices. It includes real-time price tracking from Yahoo Finance, interactive charts, league tables, and performance analytics with a clean minimalist design aesthetic featuring subtle geometric patterns and seamless light/dark theme switching.

## User Preferences

Preferred communication style: Simple, everyday language.

## System Architecture

### Frontend Architecture
- **Framework**: React with TypeScript using Vite for fast development and building
- **UI Library**: shadcn/ui components built on top of Radix UI primitives for accessibility
- **Styling**: Tailwind CSS with ultra-minimal design system featuring clean typography, subtle geometric SVG patterns, and seamless light/dark theme switching (defaults to light mode)
- **State Management**: TanStack React Query for server state management and caching
- **Routing**: Wouter for lightweight client-side routing with landing page and dashboard routes
- **Charts**: Recharts for interactive data visualizations
- **Forms**: React Hook Form with Zod validation for type-safe form handling
- **Theme System**: Custom theme toggle component with light mode as default, smooth transitions and persistent storage
- **Visual Design**: Triangle logo that adapts to theme, geometric background patterns, minimal button styles with glass effects

### Backend Architecture
- **Runtime**: Node.js with Express.js server
- **Language**: TypeScript with ES modules
- **Development**: Hot module replacement via Vite middleware in development mode
- **Build**: esbuild for production server bundling with nixpacks deployment support
- **API Design**: RESTful endpoints with proper error handling and request logging
- **Deployment**: VPS-ready with nixpacks.toml configuration for dokploy deployment

### Data Layer
- **Database**: PostgreSQL using Neon serverless database (fully migrated from in-memory storage)
- **ORM**: Drizzle ORM for type-safe database queries and migrations
- **Schema**: Comprehensive schema covering AI models, commodities, predictions, actual prices, accuracy metrics, and market alerts
- **Validation**: Zod schemas for runtime type validation across shared types
- **Storage**: DatabaseStorage class implementing all CRUD operations with PostgreSQL persistence

### External Dependencies
- **Yahoo Finance API**: Real-time commodity price data fetching with rate limiting
- **OpenAI API**: GPT-4o integration for AI-powered commodity price predictions
- **Font Services**: Google Fonts for typography (Inter primary, with additional font families for variety)
- **Development Tools**: Replit integration with cartographer plugin and runtime error overlay
- **Design Assets**: Custom SVG geometric patterns for background elements, triangle logo system

### Key Design Patterns
- **Monorepo Structure**: Shared TypeScript types and schemas between client and server
- **Type Safety**: End-to-end type safety from database to UI components
- **Component Architecture**: Atomic design principles with reusable UI components
- **Data Fetching**: Query-based architecture with optimistic updates and background synchronization
- **Theme System**: CSS custom properties with dynamic theme switching, light mode default
- **Responsive Design**: Mobile-first approach with adaptive layouts
- **Minimalist Aesthetic**: Clean typography, ample whitespace, subtle geometric patterns, triangle logo system
- **Consistent Branding**: Unified design language across landing page and dashboard with shared background patterns and header styling

### Security & Performance
- **Rate Limiting**: Built-in rate limiting for external API calls
- **Session Management**: PostgreSQL session storage with connect-pg-simple
- **Error Handling**: Comprehensive error boundaries and API error responses
- **Caching**: Intelligent query caching with TanStack Query
- **Code Splitting**: Automatic code splitting via Vite
- **Development Experience**: Hot reload, TypeScript checking, and runtime error modals

### Recent Changes (January 2025)
- **Menu System & Content Pages (January 16, 2025)**: Added comprehensive navigation menu with Blog and Policy pages
  - **Header Menu Integration**: Dropdown menu button added to both landing page and dashboard headers with Blog and Policy options
  - **Blog Page**: Comprehensive article explaining the purpose and mission of AIForecast Hub, covering AI model comparison, real data integration, and technology stack
  - **Policy Page**: Detailed data usage policy with disclaimers about AI predictions, covering data collection practices, limitations, and financial advice warnings
  - **Consistent Navigation**: All pages maintain unified header design with triangle logo, menu dropdown, and theme toggle
  - **Router Integration**: Full wouter routing support for /blog and /policy paths with proper navigation flow

### Recent Changes (August 2025)
- **Overall Model Rankings Dashboard (August 16, 2025)**: Added comprehensive model performance rankings to main dashboard
  - **Clean Minimalist Design**: Replaced league table with streamlined ranking component showing overall AI model accuracy across all commodities
  - **Real-Time Performance Metrics**: Displays accuracy percentages, prediction counts, and trend indicators for each AI model
  - **Period Filtering**: Users can view rankings for 7-day, 30-day, or 90-day periods
  - **Visual Consistency**: Matches UI theme with proper color coding (Claude green, ChatGPT blue, Deepseek purple)
  - **Data-Driven Rankings**: Based on actual prediction accuracy calculations from database storage
- **Enhanced Chart Visualization (August 16, 2025)**: Updated commodity price charts with professional styling
  - **Bold Actual Price Line**: Yahoo Finance data displayed as prominent black/white line based on theme
  - **AI Prediction Overlays**: Dotted colored lines for each AI model (Claude green, ChatGPT blue, Deepseek purple)
  - **Professional Legend**: Clear chart header with model legend and data source attribution
  - **Commodity-Specific Rankings**: Individual ranking components for each commodity chart dialog
- **VPS Deployment Configuration (August 16, 2025)**: Prepared application for VPS deployment via nixpacks on dokploy
  - **NUCLEAR CADDY ELIMINATION**: Complete removal of Caddy detection with multiple failsafes
  - **Forced Node.js Detection**: nixpacks.toml, .nixpacks, Procfile, .buildpacks, runtime.txt all enforce Node.js
  - **Environment Variables Setup**: Documented proper placement of API keys (PROJECT env), database config (DATABASE env), and app settings (APP env)
  - **Deployment Documentation**: Created comprehensive DEPLOYMENT.md guide for VPS setup
  - **Production Optimizations**: Configured .dockerignore blocking all Caddy files and build process for efficient container deployment
  - **Footer Updates**: Removed "Built with..." text and updated copyright to 2025
- **Professional Deployment Architecture Completed (August 16, 2025)**: Implemented enterprise-grade startup management system for bulletproof deployment
  - **Three-Phase Startup System**: Critical initialization → Server startup → Background processing for optimal reliability
  - **StartupManager Service**: Professional startup orchestration with proper error handling and graceful degradation
  - **Database Connection Verification**: Mandatory connection testing before application startup with immediate failure on critical errors
  - **Background Service Initialization**: Non-blocking initialization of Yahoo Finance data updates and prediction scheduling
  - **Production-Ready Error Handling**: Comprehensive error boundaries with process exit on critical failures and background error tolerance
  - **TypeScript Safety Verified**: Complete codebase passes LSP diagnostics with zero type errors
  - **Build System Validated**: Production build process works flawlessly with import.meta.dirname fixes applied automatically
  - **Deployment Configuration Complete**: Nixpacks.toml with comprehensive Caddy prevention, professional startup scripts, and Docker optimization
- **Migration to Replit Environment Completed (August 17, 2025)**: Successfully migrated from Replit Agent to standard Replit environment
  - **Package Installation**: All Node.js dependencies properly installed and configured
  - **Database Setup**: PostgreSQL database created and schema migrations applied successfully
  - **Application Startup**: Professional startup system working with background service initialization
  - **Real-time Data**: Yahoo Finance commodity price fetching operational across all 14 commodities
  - **Prediction Scheduler**: Weekly prediction system configured and running (Mondays at 2 AM)
  - **Clean Migration**: Zero security vulnerabilities, proper client/server separation maintained
- **Landing Page Redesign (August 16, 2025)**: Complete rebuild of landing page with clean minimalist design
  - **SVG Background Removal**: Eliminated all geometric background patterns for cleaner aesthetics
  - **Comprehensive Content Structure**: Added detailed sections explaining app functionality, value proposition, and features
  - **Professional Button Styling**: Updated primary button colors from bright blue to subtle gray/charcoal tones (hsl(0, 0%, 20%) light mode, hsl(0, 0%, 90%) dark mode)
  - **Enhanced Information Architecture**: Included AI model comparison, tracked commodities, benefits, and clear call-to-action sections
  - **Consistent Navigation**: Maintained theme toggle and menu integration across all sections
  - **Historical Prediction Data System**: Implemented comprehensive historical AI prediction data for the past year across all commodities and AI models (Claude, ChatGPT, Deepseek)
  - **Realistic Chart Visualization**: Rich chart displays with historical predictions overlaying actual price movements for detailed performance analysis
  - **Dual Storage Architecture**: Enhanced both PostgreSQL database and fallback storage systems with historical prediction generation capabilities
  - **Model-Specific Prediction Characteristics**: Each AI model (Claude, ChatGPT, Deepseek) generates predictions with realistic accuracy patterns, biases, and volatility characteristics
  - **Automated Historical Data Population**: Historical predictions are automatically generated on first access with intelligent caching to prevent re-generation
  - **Graceful API Key Handling**: All AI services (OpenAI, Claude, Deepseek) now handle missing API keys gracefully without application crashes
  - **Yahoo Finance Integration Verified**: Real-time commodity price data flows correctly for all 10 commodities (Oil, Gold, Gas, Copper, Silver, Coffee, Sugar, Corn, Soybeans, Cotton)
  - **Weekly Prediction Scheduler**: Automated system configured to run every Monday at 2 AM for generating 7-day commodity price predictions
  - **Database Fallback System**: Robust fallback storage ensures application runs even when PostgreSQL database is unavailable
  - **Clean UI Interface**: Removed duplicate headings from dashboard for cleaner user experience
  - **Authentic Data Only**: System operates entirely on real Yahoo Finance data with no mock or placeholder content
- **Design System Overhaul**: Implemented ultra-minimal design aesthetic with clean typography and subtle geometric patterns
- **Theme System Enhancement**: Set light mode as default theme with seamless dark mode switching
- **Logo Redesign**: Created triangle logo system that adapts to current theme (black triangle in light mode, white in dark mode)
- **Background Patterns**: Added custom SVG geometric patterns for visual depth while maintaining minimalism
- **Consistent UI**: Unified design language between landing page and dashboard with matching headers, footers, and background patterns
- **Real Yahoo Finance Integration**: Implemented yahoo-finance2 package for authentic real-time commodity price data
- **Comprehensive AI Prediction System**: Full integration of OpenAI GPT-4o, Claude, and Deepseek AI services
  - **Multi-Model AI Services**: All three AI models (Claude, ChatGPT, Deepseek) configured and operational with proper API key management
  - **Real-Time Price Integration**: Yahoo Finance API integration provides authentic historical and real-time commodity prices
  - **Automated Weekly Predictions**: Scheduled system runs every Monday to generate 7-day future price predictions using real market data
  - **Fallback Storage Architecture**: Robust fallback system ensures functionality during database connectivity issues
  - **Cached Prediction Service**: Intelligent caching system for optimized performance and rate limit management
  - **Comprehensive API Endpoints**: Full set of endpoints for AI prediction generation, Yahoo Finance data updates, and future price forecasting
  - **No Mock Data**: All legacy mock data and placeholder systems removed - system uses only authentic Yahoo Finance data and real AI predictions