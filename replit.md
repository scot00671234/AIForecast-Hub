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
- **Build**: esbuild for production server bundling
- **API Design**: RESTful endpoints with proper error handling and request logging

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

### Recent Changes (December 2024)
- **Design System Overhaul**: Implemented ultra-minimal design aesthetic with clean typography and subtle geometric patterns
- **Theme System Enhancement**: Set light mode as default theme with seamless dark mode switching
- **Logo Redesign**: Created triangle logo system that adapts to current theme (black triangle in light mode, white in dark mode)
- **Background Patterns**: Added custom SVG geometric patterns for visual depth while maintaining minimalism
- **Consistent UI**: Unified design language between landing page and dashboard with matching headers, footers, and background patterns
- **Migration Completed**: Successfully migrated from Replit Agent to Replit environment with full PostgreSQL database integration
- **AI Prediction System**: Implemented comprehensive AI prediction system using OpenAI GPT-4o for weekly commodity price forecasting
  - **Automated Weekly Predictions**: Scheduled system runs every Monday to generate 7-day future price predictions
  - **Multi-Model Support**: Predictions generated for Claude, ChatGPT, and Deepseek AI models
  - **Database Integration**: All AI predictions stored in PostgreSQL with confidence levels and reasoning metadata
  - **Chart Integration**: Future predictions displayed alongside historical data on detailed charts
  - **API Endpoints**: New endpoints for generating and retrieving AI predictions with fallback mechanisms