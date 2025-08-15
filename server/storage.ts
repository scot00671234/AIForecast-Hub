import { 
  type AiModel, 
  type InsertAiModel,
  type Commodity,
  type InsertCommodity,
  type Prediction,
  type InsertPrediction,
  type ActualPrice,
  type InsertActualPrice,
  type AccuracyMetric,
  type InsertAccuracyMetric,
  type MarketAlert,
  type InsertMarketAlert,
  type DashboardStats,
  type LeagueTableEntry,
  type ChartDataPoint,
  aiModels,
  commodities,
  predictions,
  actualPrices,
  accuracyMetrics,
  marketAlerts
} from "@shared/schema";
import { db } from "./db";
import { eq, desc, and, sql } from "drizzle-orm";
import { randomUUID } from "crypto";

export interface IStorage {
  // AI Models
  getAiModels(): Promise<AiModel[]>;
  getAiModel(id: string): Promise<AiModel | undefined>;
  createAiModel(model: InsertAiModel): Promise<AiModel>;

  // Commodities
  getCommodities(): Promise<Commodity[]>;
  getCommodity(id: string): Promise<Commodity | undefined>;
  getCommodityBySymbol(symbol: string): Promise<Commodity | undefined>;
  createCommodity(commodity: InsertCommodity): Promise<Commodity>;

  // Predictions
  getPredictions(commodityId?: string, aiModelId?: string): Promise<Prediction[]>;
  getPredictionsByCommodity(commodityId: string): Promise<Prediction[]>;
  createPrediction(prediction: InsertPrediction): Promise<Prediction>;
  insertPrediction(prediction: InsertPrediction): Promise<Prediction>;

  // Actual Prices
  getActualPrices(commodityId: string, limit?: number): Promise<ActualPrice[]>;
  createActualPrice(price: InsertActualPrice): Promise<ActualPrice>;
  insertActualPrice(price: InsertActualPrice): Promise<ActualPrice>;
  getLatestPrice(commodityId: string): Promise<ActualPrice | undefined>;

  // Accuracy Metrics
  getAccuracyMetrics(period: string): Promise<AccuracyMetric[]>;
  updateAccuracyMetric(metric: InsertAccuracyMetric): Promise<AccuracyMetric>;

  // Market Alerts
  getActiveAlerts(): Promise<MarketAlert[]>;
  createAlert(alert: InsertMarketAlert): Promise<MarketAlert>;

  // Dashboard Data
  getDashboardStats(): Promise<DashboardStats>;
  getLeagueTable(period: string): Promise<LeagueTableEntry[]>;
  getChartData(commodityId: string, days: number): Promise<ChartDataPoint[]>;
  
  // Raw SQL queries for complex calculations
  rawQuery(query: string, params?: any[]): Promise<{ rows: any[] }>;
}

export class DatabaseStorage implements IStorage {
  constructor() {
    // Database initialization will be handled by migrations
    this.initializeDefaultData();
  }

  private async initializeDefaultData() {
    try {
      // Check if data already exists
      const existingModels = await db.select().from(aiModels).limit(1);
      if (existingModels.length > 0) {
        return; // Data already initialized
      }

      // Initialize AI Models
      const defaultModels = [
        { name: "Claude", provider: "Anthropic", color: "#10B981", isActive: 1 },
        { name: "ChatGPT", provider: "OpenAI", color: "#3B82F6", isActive: 1 },
        { name: "Deepseek", provider: "Deepseek AI", color: "#8B5CF6", isActive: 1 }
      ];

      await db.insert(aiModels).values(defaultModels);

      // Initialize Commodities
      const defaultCommodities = [
        // Hard Commodities
        { name: "Crude Oil", symbol: "WTI", category: "hard", yahooSymbol: "CL=F", unit: "USD/barrel" },
        { name: "Gold", symbol: "XAU", category: "hard", yahooSymbol: "GC=F", unit: "USD/oz" },
        { name: "Natural Gas", symbol: "NG", category: "hard", yahooSymbol: "NG=F", unit: "USD/MMBtu" },
        { name: "Copper", symbol: "HG", category: "hard", yahooSymbol: "HG=F", unit: "USD/lb" },
        { name: "Silver", symbol: "XAG", category: "hard", yahooSymbol: "SI=F", unit: "USD/oz" },
        { name: "Aluminum", symbol: "ALU", category: "hard", yahooSymbol: "ALI=F", unit: "USD/tonne" },
        { name: "Platinum", symbol: "XPT", category: "hard", yahooSymbol: "PL=F", unit: "USD/oz" },
        { name: "Palladium", symbol: "XPD", category: "hard", yahooSymbol: "PA=F", unit: "USD/oz" },
        // Soft Commodities
        { name: "Coffee", symbol: "KC", category: "soft", yahooSymbol: "KC=F", unit: "USD/lb" },
        { name: "Sugar", symbol: "SB", category: "soft", yahooSymbol: "SB=F", unit: "USD/lb" },
        { name: "Corn", symbol: "ZC", category: "soft", yahooSymbol: "ZC=F", unit: "USD/bushel" },
        { name: "Soybeans", symbol: "ZS", category: "soft", yahooSymbol: "ZS=F", unit: "USD/bushel" },
        { name: "Cotton", symbol: "CT", category: "soft", yahooSymbol: "CT=F", unit: "USD/lb" },
        { name: "Wheat", symbol: "ZW", category: "soft", yahooSymbol: "ZW=F", unit: "USD/bushel" }
      ];

      await db.insert(commodities).values(defaultCommodities);
      
      console.log("Default data initialized successfully");
    } catch (error) {
      console.error("Error initializing default data:", error);
    }
  }

  async getAiModels(): Promise<AiModel[]> {
    return await db.select().from(aiModels).where(eq(aiModels.isActive, 1));
  }

  async getAiModel(id: string): Promise<AiModel | undefined> {
    const [model] = await db.select().from(aiModels).where(eq(aiModels.id, id));
    return model || undefined;
  }

  async createAiModel(insertModel: InsertAiModel): Promise<AiModel> {
    const [model] = await db.insert(aiModels).values(insertModel).returning();
    return model;
  }

  async getCommodities(): Promise<Commodity[]> {
    return await db.select().from(commodities);
  }

  async getCommodity(id: string): Promise<Commodity | undefined> {
    const [commodity] = await db.select().from(commodities).where(eq(commodities.id, id));
    return commodity || undefined;
  }

  async getCommodityBySymbol(symbol: string): Promise<Commodity | undefined> {
    const [commodity] = await db.select().from(commodities).where(
      sql`${commodities.symbol} = ${symbol} OR ${commodities.yahooSymbol} = ${symbol}`
    );
    return commodity || undefined;
  }

  async createCommodity(insertCommodity: InsertCommodity): Promise<Commodity> {
    const [commodity] = await db.insert(commodities).values(insertCommodity).returning();
    return commodity;
  }

  async getPredictions(commodityId?: string, aiModelId?: string): Promise<Prediction[]> {
    try {
      let baseQuery = db.select().from(predictions);
      
      const conditions = [];
      if (commodityId) conditions.push(eq(predictions.commodityId, commodityId));
      if (aiModelId) conditions.push(eq(predictions.aiModelId, aiModelId));
      
      if (conditions.length > 0) {
        baseQuery = baseQuery.where(and(...conditions));
      }
      
      return await baseQuery.orderBy(desc(predictions.createdAt));
    } catch (error) {
      console.error('Error fetching predictions:', error);
      return [];
    }
  }

  async createPrediction(insertPrediction: InsertPrediction): Promise<Prediction> {
    const [prediction] = await db.insert(predictions).values(insertPrediction).returning();
    return prediction;
  }

  async insertPrediction(insertPrediction: InsertPrediction): Promise<Prediction> {
    return this.createPrediction(insertPrediction);
  }

  async getPredictionsByCommodity(commodityId: string): Promise<Prediction[]> {
    return this.getPredictions(commodityId);
  }

  async getActualPrices(commodityId: string, limit?: number): Promise<ActualPrice[]> {
    try {
      let query = db.select().from(actualPrices)
        .where(eq(actualPrices.commodityId, commodityId))
        .orderBy(desc(actualPrices.date));
      
      if (limit) {
        query = query.limit(limit);
      }
      
      return await query;
    } catch (error) {
      console.error('Error fetching actual prices:', error);
      return [];
    }
  }

  async createActualPrice(insertPrice: InsertActualPrice): Promise<ActualPrice> {
    const [price] = await db.insert(actualPrices).values(insertPrice).returning();
    return price;
  }

  async insertActualPrice(insertPrice: InsertActualPrice): Promise<ActualPrice> {
    return this.createActualPrice(insertPrice);
  }

  async getLatestPrice(commodityId: string): Promise<ActualPrice | undefined> {
    const prices = await this.getActualPrices(commodityId, 1);
    return prices[0];
  }

  async getAccuracyMetrics(period: string): Promise<AccuracyMetric[]> {
    return await db.select().from(accuracyMetrics)
      .where(eq(accuracyMetrics.period, period))
      .orderBy(desc(sql`CAST(${accuracyMetrics.accuracy} AS DECIMAL)`));
  }

  async updateAccuracyMetric(insertMetric: InsertAccuracyMetric): Promise<AccuracyMetric> {
    const [existing] = await db.select().from(accuracyMetrics)
      .where(
        and(
          eq(accuracyMetrics.aiModelId, insertMetric.aiModelId),
          eq(accuracyMetrics.commodityId, insertMetric.commodityId),
          eq(accuracyMetrics.period, insertMetric.period)
        )
      )
      .limit(1);

    if (existing) {
      const [updated] = await db.update(accuracyMetrics)
        .set({ ...insertMetric, lastUpdated: new Date() })
        .where(eq(accuracyMetrics.id, existing.id))
        .returning();
      return updated;
    } else {
      const [metric] = await db.insert(accuracyMetrics).values(insertMetric).returning();
      return metric;
    }
  }

  async getActiveAlerts(): Promise<MarketAlert[]> {
    return await db.select().from(marketAlerts)
      .where(eq(marketAlerts.isActive, 1))
      .orderBy(desc(marketAlerts.createdAt))
      .limit(10);
  }

  async createAlert(insertAlert: InsertMarketAlert): Promise<MarketAlert> {
    const [alert] = await db.insert(marketAlerts).values(insertAlert).returning();
    return alert;
  }

  async getDashboardStats(): Promise<DashboardStats> {
    const allPredictions = await db.select().from(predictions);
    const thirtyDayMetrics = await this.getAccuracyMetrics('30d');
    const allCommodities = await this.getCommodities();

    const topMetric = thirtyDayMetrics[0];
    const topModel = topMetric ? await this.getAiModel(topMetric.aiModelId) : null;
    const avgAccuracy = thirtyDayMetrics.length > 0 
      ? thirtyDayMetrics.reduce((sum, m) => sum + parseFloat(m.accuracy), 0) / thirtyDayMetrics.length
      : 0;

    return {
      totalPredictions: allPredictions.length,
      topModel: topModel?.name || "N/A",
      topAccuracy: topMetric ? parseFloat(topMetric.accuracy) : 0,
      activeCommodities: allCommodities.length,
      avgAccuracy
    };
  }

  async getLeagueTable(period: string): Promise<LeagueTableEntry[]> {
    // Calculate comprehensive model rankings across all commodities
    const aiModels = await this.getAiModels();
    const commodities = await this.getCommodities();
    const entries: LeagueTableEntry[] = [];

    for (const model of aiModels) {
      let totalAccuracy = 0;
      let totalPredictions = 0;
      let accuracySum = 0;

      // Calculate accuracy across all commodities for this model
      for (const commodity of commodities) {
        const predictions = await this.getPredictions(commodity.id, model.id);
        const actualPrices = await this.getActualPrices(commodity.id, 100);

        if (predictions.length > 0 && actualPrices.length > 0) {
          // Match predictions with actual prices and calculate accuracy
          const matches = predictions.map(pred => {
            const actualPrice = actualPrices.find(price => {
              const predDate = new Date(pred.targetDate).toDateString();
              const priceDate = new Date(price.date).toDateString();
              return predDate === priceDate;
            });

            if (actualPrice) {
              const predicted = parseFloat(pred.predictedPrice);
              const actual = parseFloat(actualPrice.price);
              const percentageError = Math.abs((actual - predicted) / actual) * 100;
              const accuracy = Math.max(0, 100 - percentageError);
              
              return { accuracy, valid: true };
            }
            return { accuracy: 0, valid: false };
          }).filter(m => m.valid);

          if (matches.length > 0) {
            const avgAccuracy = matches.reduce((sum, m) => sum + m.accuracy, 0) / matches.length;
            accuracySum += avgAccuracy * matches.length;
            totalPredictions += matches.length;
          }
        }
      }

      const overallAccuracy = totalPredictions > 0 ? accuracySum / totalPredictions : 0;

      entries.push({
        rank: 0, // Will be set after sorting
        aiModel: model,
        accuracy: Math.round(overallAccuracy * 100) / 100,
        totalPredictions,
        trend: Math.floor(Math.random() * 3) - 1 // -1, 0, or 1 for trend
      });
    }

    // Sort by accuracy (descending) and assign ranks
    return entries
      .sort((a, b) => b.accuracy - a.accuracy)
      .map((entry, index) => ({ ...entry, rank: index + 1 }));
  }

  async getChartData(commodityId: string, days: number): Promise<ChartDataPoint[]> {
    const prices = await this.getActualPrices(commodityId, days);
    const predictions = await this.getPredictions(commodityId);
    const aiModels = await this.getAiModels();

    const chartData: ChartDataPoint[] = [];

    for (const price of prices.reverse()) {
      const dateStr = price.date.toISOString().split('T')[0];
      const dayPredictions: Record<string, number> = {};

      // Find predictions for this date
      for (const model of aiModels) {
        const modelPredictions = predictions.filter(p => 
          p.aiModelId === model.id && 
          p.targetDate.toDateString() === price.date.toDateString()
        );
        
        if (modelPredictions.length > 0) {
          dayPredictions[model.id] = parseFloat(modelPredictions[0].predictedPrice);
        }
      }

      chartData.push({
        date: dateStr,
        actualPrice: parseFloat(price.price),
        predictions: dayPredictions
      });
    }

    return chartData;
  }

  // Raw SQL query method for complex calculations
  async rawQuery(query: string, params: any[] = []): Promise<{ rows: any[] }> {
    try {
      // For now, return empty results - can be implemented later for optimization
      console.log('Raw query called:', query, params);
      return { rows: [] };
    } catch (error) {
      console.error('Raw query error:', error);
      throw error;
    }
  }

  // Add convenience methods for easier data access
  async insertPrediction(data: InsertPrediction): Promise<Prediction> {
    return this.createPrediction(data);
  }
  
  async insertActualPrice(data: InsertActualPrice): Promise<ActualPrice> {
    return this.createActualPrice(data);
  }
}

export const storage = new DatabaseStorage();
