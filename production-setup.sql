-- PRODUCTION DATABASE SETUP
-- Copy and paste this entire script into your production PostgreSQL database

-- Enable UUID generation extension
CREATE EXTENSION IF NOT EXISTS "pgcrypto";

-- Create all tables based on Drizzle schema
CREATE TABLE "ai_models" (
	"id" varchar PRIMARY KEY DEFAULT gen_random_uuid(),
	"name" text NOT NULL,
	"provider" text NOT NULL,
	"color" text NOT NULL,
	"is_active" integer DEFAULT 1 NOT NULL,
	CONSTRAINT "ai_models_name_unique" UNIQUE("name")
);

CREATE TABLE "commodities" (
	"id" varchar PRIMARY KEY DEFAULT gen_random_uuid(),
	"name" text NOT NULL,
	"symbol" text NOT NULL,
	"category" text NOT NULL,
	"yahoo_symbol" text,
	"unit" text DEFAULT 'USD',
	CONSTRAINT "commodities_name_unique" UNIQUE("name"),
	CONSTRAINT "commodities_symbol_unique" UNIQUE("symbol")
);

CREATE TABLE "predictions" (
	"id" varchar PRIMARY KEY DEFAULT gen_random_uuid(),
	"ai_model_id" varchar NOT NULL,
	"commodity_id" varchar NOT NULL,
	"prediction_date" timestamp NOT NULL,
	"target_date" timestamp NOT NULL,
	"predicted_price" numeric(10,4) NOT NULL,
	"confidence" numeric(5,2),
	"metadata" jsonb,
	"created_at" timestamp DEFAULT now() NOT NULL
);

CREATE TABLE "actual_prices" (
	"id" varchar PRIMARY KEY DEFAULT gen_random_uuid(),
	"commodity_id" varchar NOT NULL,
	"date" timestamp NOT NULL,
	"price" numeric(10,4) NOT NULL,
	"volume" numeric(15,2),
	"source" text DEFAULT 'yahoo_finance',
	"created_at" timestamp DEFAULT now() NOT NULL
);

CREATE TABLE "accuracy_metrics" (
	"id" varchar PRIMARY KEY DEFAULT gen_random_uuid(),
	"ai_model_id" varchar NOT NULL,
	"commodity_id" varchar NOT NULL,
	"period" text NOT NULL,
	"accuracy" numeric(5,2) NOT NULL,
	"total_predictions" integer NOT NULL,
	"correct_predictions" integer NOT NULL,
	"avg_error" numeric(10,4),
	"last_updated" timestamp DEFAULT now() NOT NULL
);

CREATE TABLE "market_alerts" (
	"id" varchar PRIMARY KEY DEFAULT gen_random_uuid(),
	"type" text NOT NULL,
	"severity" text NOT NULL,
	"title" text NOT NULL,
	"description" text NOT NULL,
	"commodity_id" varchar,
	"ai_model_id" varchar,
	"is_active" integer DEFAULT 1 NOT NULL,
	"created_at" timestamp DEFAULT now() NOT NULL
);

-- Add foreign key constraints
ALTER TABLE "predictions" ADD CONSTRAINT "predictions_ai_model_id_ai_models_id_fk" FOREIGN KEY ("ai_model_id") REFERENCES "ai_models"("id") ON DELETE no action ON UPDATE no action;
ALTER TABLE "predictions" ADD CONSTRAINT "predictions_commodity_id_commodities_id_fk" FOREIGN KEY ("commodity_id") REFERENCES "commodities"("id") ON DELETE no action ON UPDATE no action;
ALTER TABLE "actual_prices" ADD CONSTRAINT "actual_prices_commodity_id_commodities_id_fk" FOREIGN KEY ("commodity_id") REFERENCES "commodities"("id") ON DELETE no action ON UPDATE no action;
ALTER TABLE "accuracy_metrics" ADD CONSTRAINT "accuracy_metrics_ai_model_id_ai_models_id_fk" FOREIGN KEY ("ai_model_id") REFERENCES "ai_models"("id") ON DELETE no action ON UPDATE no action;
ALTER TABLE "accuracy_metrics" ADD CONSTRAINT "accuracy_metrics_commodity_id_commodities_id_fk" FOREIGN KEY ("commodity_id") REFERENCES "commodities"("id") ON DELETE no action ON UPDATE no action;
ALTER TABLE "market_alerts" ADD CONSTRAINT "market_alerts_commodity_id_commodities_id_fk" FOREIGN KEY ("commodity_id") REFERENCES "commodities"("id") ON DELETE no action ON UPDATE no action;
ALTER TABLE "market_alerts" ADD CONSTRAINT "market_alerts_ai_model_id_ai_models_id_fk" FOREIGN KEY ("ai_model_id") REFERENCES "ai_models"("id") ON DELETE no action ON UPDATE no action;

-- Insert initial data (AI models and commodities)
INSERT INTO "ai_models" ("name", "provider", "color", "is_active") VALUES
('ChatGPT', 'OpenAI', '#10B981', 1),
('Claude', 'Anthropic', '#8B5CF6', 1),
('Deepseek', 'DeepSeek', '#F59E0B', 1);

INSERT INTO "commodities" ("name", "symbol", "category", "yahoo_symbol") VALUES
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

-- Verify the setup
SELECT 'Setup complete!' as status;
SELECT 'ai_models' as table_name, COUNT(*) as records FROM "ai_models"
UNION ALL
SELECT 'commodities' as table_name, COUNT(*) as records FROM "commodities"
UNION ALL
SELECT 'predictions' as table_name, COUNT(*) as records FROM "predictions";