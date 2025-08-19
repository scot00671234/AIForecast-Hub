import { sql } from "drizzle-orm";
import { pgTable, text, varchar, decimal, timestamp, jsonb, integer } from "drizzle-orm/pg-core";
import { createInsertSchema } from "drizzle-zod";
import { z } from "zod";

export const aiModels = pgTable("ai_models", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  name: text("name").notNull().unique(),
  provider: text("provider").notNull(),
  color: text("color").notNull(),
  isActive: integer("is_active").default(1).notNull(),
});

export const commodities = pgTable("commodities", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  name: text("name").notNull().unique(),
  symbol: text("symbol").notNull().unique(),
  category: text("category").notNull(), // 'hard' or 'soft'
  yahooSymbol: text("yahoo_symbol"), // Yahoo Finance symbol mapping
  unit: text("unit").default("USD"),
});

export const predictions = pgTable("predictions", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  aiModelId: varchar("ai_model_id").references(() => aiModels.id).notNull(),
  commodityId: varchar("commodity_id").references(() => commodities.id).notNull(),
  predictionDate: timestamp("prediction_date").notNull(),
  targetDate: timestamp("target_date").notNull(),
  predictedPrice: decimal("predicted_price", { precision: 10, scale: 4 }).notNull(),
  confidence: decimal("confidence", { precision: 5, scale: 2 }),
  timeframe: text("timeframe").notNull().default("7d"), // "3mo", "6mo", "9mo", "12mo", "7d"
  metadata: jsonb("metadata"),
  createdAt: timestamp("created_at").default(sql`now()`).notNull(),
});

export const actualPrices = pgTable("actual_prices", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  commodityId: varchar("commodity_id").references(() => commodities.id).notNull(),
  date: timestamp("date").notNull(),
  price: decimal("price", { precision: 10, scale: 4 }).notNull(),
  volume: decimal("volume", { precision: 15, scale: 2 }),
  source: text("source").default("yahoo_finance"),
  createdAt: timestamp("created_at").default(sql`now()`).notNull(),
});

export const accuracyMetrics = pgTable("accuracy_metrics", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  aiModelId: varchar("ai_model_id").references(() => aiModels.id).notNull(),
  commodityId: varchar("commodity_id").references(() => commodities.id).notNull(),
  period: text("period").notNull(), // '7d', '30d', '90d', 'all'
  accuracy: decimal("accuracy", { precision: 5, scale: 2 }).notNull(),
  totalPredictions: integer("total_predictions").notNull(),
  correctPredictions: integer("correct_predictions").notNull(),
  avgError: decimal("avg_error", { precision: 10, scale: 4 }),
  lastUpdated: timestamp("last_updated").default(sql`now()`).notNull(),
});

export const marketAlerts = pgTable("market_alerts", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  type: text("type").notNull(), // 'volatility', 'divergence', 'milestone'
  severity: text("severity").notNull(), // 'info', 'warning', 'error'
  title: text("title").notNull(),
  description: text("description").notNull(),
  commodityId: varchar("commodity_id").references(() => commodities.id),
  aiModelId: varchar("ai_model_id").references(() => aiModels.id),
  isActive: integer("is_active").default(1).notNull(),
  createdAt: timestamp("created_at").default(sql`now()`).notNull(),
});

// Insert Schemas
export const insertAiModelSchema = createInsertSchema(aiModels).omit({
  id: true,
});

export const insertCommoditySchema = createInsertSchema(commodities).omit({
  id: true,
});

export const insertPredictionSchema = createInsertSchema(predictions).omit({
  id: true,
  createdAt: true,
});

export const insertActualPriceSchema = createInsertSchema(actualPrices).omit({
  id: true,
  createdAt: true,
});

export const insertAccuracyMetricSchema = createInsertSchema(accuracyMetrics).omit({
  id: true,
  lastUpdated: true,
});

export const insertMarketAlertSchema = createInsertSchema(marketAlerts).omit({
  id: true,
  createdAt: true,
});

// Types
export type AiModel = typeof aiModels.$inferSelect;
export type InsertAiModel = z.infer<typeof insertAiModelSchema>;

export type Commodity = typeof commodities.$inferSelect;
export type InsertCommodity = z.infer<typeof insertCommoditySchema>;

export type Prediction = typeof predictions.$inferSelect;
export type InsertPrediction = z.infer<typeof insertPredictionSchema>;

export type ActualPrice = typeof actualPrices.$inferSelect;
export type InsertActualPrice = z.infer<typeof insertActualPriceSchema>;

export type AccuracyMetric = typeof accuracyMetrics.$inferSelect;
export type InsertAccuracyMetric = z.infer<typeof insertAccuracyMetricSchema>;

export type MarketAlert = typeof marketAlerts.$inferSelect;
export type InsertMarketAlert = z.infer<typeof insertMarketAlertSchema>;

// Additional types for API responses
export type DashboardStats = {
  totalPredictions: number;
  topModel: string;
  topAccuracy: number;
  activeCommodities: number;
  avgAccuracy: number;
};

export type ChartDataPoint = {
  date: string;
  actualPrice: number;
  predictions: Record<string, number>;
};

export type TimePeriod = "1m" | "5m" | "15m" | "30m" | "1h" | "2h" | "5h" | "1d" | "5d" | "1w" | "1mo" | "3mo" | "6mo" | "1y" | "2y" | "5y" | "10y" | "ytd" | "max";

export type LatestPrice = {
  price: number;
  change?: number;
  changePercent?: number;
  timestamp: string;
};

export type LeagueTableEntry = {
  rank: number;
  aiModel: AiModel;
  accuracy: number;
  totalPredictions: number;
  trend: number;
};


