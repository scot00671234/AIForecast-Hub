# AI Commodity Price Prediction Platform

## Overview

This is a full-stack web application that tracks and analyzes AI model predictions for commodity prices. The platform allows users to compare the accuracy of different AI models (Claude, ChatGPT, Deepseek) in predicting hard and soft commodity prices. It features real-time price tracking from Yahoo Finance, interactive charts, league tables, and performance analytics with a modern glass-morphism UI.

## User Preferences

Preferred communication style: Simple, everyday language.

## System Architecture

### Frontend Architecture
- **Framework**: React with TypeScript using Vite for fast development and building
- **UI Library**: shadcn/ui components built on top of Radix UI primitives for accessibility
- **Styling**: Tailwind CSS with custom design system featuring glass-morphism effects and dark/light themes
- **State Management**: TanStack React Query for server state management and caching
- **Routing**: Wouter for lightweight client-side routing
- **Charts**: Recharts for interactive data visualizations
- **Forms**: React Hook Form with Zod validation for type-safe form handling

### Backend Architecture
- **Runtime**: Node.js with Express.js server
- **Language**: TypeScript with ES modules
- **Development**: Hot module replacement via Vite middleware in development mode
- **Build**: esbuild for production server bundling
- **API Design**: RESTful endpoints with proper error handling and request logging

### Data Layer
- **Database**: PostgreSQL using Neon serverless database
- **ORM**: Drizzle ORM for type-safe database queries and migrations
- **Schema**: Comprehensive schema covering AI models, commodities, predictions, actual prices, accuracy metrics, and market alerts
- **Validation**: Zod schemas for runtime type validation across shared types

### External Dependencies
- **Yahoo Finance API**: Real-time commodity price data fetching with rate limiting
- **Font Services**: Google Fonts for typography (Inter, Architects Daughter, DM Sans, Fira Code, Geist Mono)
- **Development Tools**: Replit integration with cartographer plugin and runtime error overlay

### Key Design Patterns
- **Monorepo Structure**: Shared TypeScript types and schemas between client and server
- **Type Safety**: End-to-end type safety from database to UI components
- **Component Architecture**: Atomic design principles with reusable UI components
- **Data Fetching**: Query-based architecture with optimistic updates and background synchronization
- **Theme System**: CSS custom properties with dynamic theme switching
- **Responsive Design**: Mobile-first approach with adaptive layouts

### Security & Performance
- **Rate Limiting**: Built-in rate limiting for external API calls
- **Session Management**: PostgreSQL session storage with connect-pg-simple
- **Error Handling**: Comprehensive error boundaries and API error responses
- **Caching**: Intelligent query caching with TanStack Query
- **Code Splitting**: Automatic code splitting via Vite
- **Development Experience**: Hot reload, TypeScript checking, and runtime error modals