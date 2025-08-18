-- Production Database Setup Script
-- Run this in your production database to create all required tables and initial data

-- Enable UUID generation
CREATE EXTENSION IF NOT EXISTS "pgcrypto";

-- Create ai_models table
CREATE TABLE IF NOT EXISTS ai_models (
    id varchar PRIMARY KEY DEFAULT gen_random_uuid(),
    name text NOT NULL UNIQUE,
    provider text NOT NULL,
    color text NOT NULL,
    is_active integer DEFAULT 1 NOT NULL
);

-- Create commodities table
CREATE TABLE IF NOT EXISTS commodities (
    id varchar PRIMARY KEY DEFAULT gen_random_uuid(),
    name text NOT NULL UNIQUE,
    symbol text NOT NULL UNIQUE,
    category text NOT NULL,
    yahoo_symbol text,
    unit text DEFAULT 'USD'
);

-- Create predictions table
CREATE TABLE IF NOT EXISTS predictions (
    id varchar PRIMARY KEY DEFAULT gen_random_uuid(),
    ai_model_id varchar NOT NULL REFERENCES ai_models(id),
    commodity_id varchar NOT NULL REFERENCES commodities(id),
    prediction_date timestamp NOT NULL,
    target_date timestamp NOT NULL,
    predicted_price decimal(10,4) NOT NULL,
    confidence decimal(5,2),
    metadata jsonb,
    created_at timestamp DEFAULT now() NOT NULL
);

-- Create actual_prices table
CREATE TABLE IF NOT EXISTS actual_prices (
    id varchar PRIMARY KEY DEFAULT gen_random_uuid(),
    commodity_id varchar NOT NULL REFERENCES commodities(id),
    date timestamp NOT NULL,
    price decimal(10,4) NOT NULL,
    volume decimal(15,2),
    source text DEFAULT 'yahoo_finance',
    created_at timestamp DEFAULT now() NOT NULL
);

-- Create accuracy_metrics table
CREATE TABLE IF NOT EXISTS accuracy_metrics (
    id varchar PRIMARY KEY DEFAULT gen_random_uuid(),
    ai_model_id varchar NOT NULL REFERENCES ai_models(id),
    commodity_id varchar NOT NULL REFERENCES commodities(id),
    period text NOT NULL,
    accuracy decimal(5,2) NOT NULL,
    total_predictions integer NOT NULL,
    correct_predictions integer NOT NULL,
    avg_error decimal(10,4),
    last_updated timestamp DEFAULT now() NOT NULL
);

-- Create market_alerts table
CREATE TABLE IF NOT EXISTS market_alerts (
    id varchar PRIMARY KEY DEFAULT gen_random_uuid(),
    type text NOT NULL,
    severity text NOT NULL,
    title text NOT NULL,
    description text NOT NULL,
    commodity_id varchar REFERENCES commodities(id),
    ai_model_id varchar REFERENCES ai_models(id),
    is_active integer DEFAULT 1 NOT NULL,
    created_at timestamp DEFAULT now() NOT NULL
);

-- Clear existing data to ensure fresh start
DELETE FROM predictions;
DELETE FROM accuracy_metrics;
DELETE FROM market_alerts;
DELETE FROM actual_prices;
DELETE FROM commodities;
DELETE FROM ai_models;

-- Insert AI models
INSERT INTO ai_models (name, provider, color, is_active) VALUES
('ChatGPT', 'OpenAI', '#10B981', 1),
('Claude', 'Anthropic', '#8B5CF6', 1),
('Deepseek', 'DeepSeek', '#F59E0B', 1);

-- Insert commodities
INSERT INTO commodities (name, symbol, category, yahoo_symbol) VALUES
('Crude Oil', 'CL', 'hard', 'CL=F'),
('Gold', 'AU', 'hard', 'GC=F'),
('Natural Gas', 'NG', 'hard', 'NG=F'),
('Copper', 'CU', 'hard', 'HG=F'),
('Silver', 'AG', 'hard', 'SI=F'),
('Aluminum', 'AL', 'hard', 'ALI=F'),
('Platinum', 'PT', 'hard', 'PL=F'),
('Palladium', 'PD', 'hard', 'PA=F'),
('Coffee', 'KC', 'soft', 'KC=F'),
('Sugar', 'SB', 'soft', 'SB=F'),
('Corn', 'ZC', 'soft', 'ZC=F'),
('Soybeans', 'ZS', 'soft', 'ZS=F'),
('Cotton', 'CT', 'soft', 'CT=F'),
('Wheat', 'ZW', 'soft', 'ZW=F');

-- Verify setup
SELECT 
    'ai_models' as table_name, 
    COUNT(*) as records 
FROM ai_models
UNION ALL
SELECT 
    'commodities' as table_name, 
    COUNT(*) as records 
FROM commodities
UNION ALL
SELECT 
    'predictions' as table_name, 
    COUNT(*) as records 
FROM predictions;

-- The system will now automatically detect no predictions exist and trigger:
-- 1. Fresh AI prediction generation for all 14 commodities
-- 2. Using all three AI services (OpenAI, Claude, DeepSeek)
-- 3. Automatic scheduling setup for ongoing predictions