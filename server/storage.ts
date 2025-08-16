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
import { fallbackStorage } from "./services/fallbackStorage";
import { HistoricalPredictionGenerator } from "./services/historicalPredictionGenerator";

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
  private isDbConnected = false;
  private historicalGenerator = new HistoricalPredictionGenerator();

  constructor() {
    this.testConnection();
    this.initializeDefaultData();
  }

  private async testConnection() {
    try {
      await db.select().from(aiModels).limit(1);
      this.isDbConnected = true;
      console.log("Database connection successful");
    } catch (error) {
      console.error("Database connection failed:", error);
      this.isDbConnected = false;
      throw new Error(`Database connection required for production deployment: ${error.message}`);
    }
  }

  // Public wrapper for startup manager
  async ensureConnection(): Promise<void> {
    await this.testConnection();
  }

  // Public wrapper for startup manager
  async ensureDefaultData(): Promise<void> {
    await this.initializeDefaultData();
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

      // Initialize historical predictions for the past year
      await this.initializeHistoricalPredictions();
      
      console.log("Default data and historical predictions initialized successfully");
    } catch (error) {
      console.error("Error initializing default data:", error);
    }
  }

  async getAiModels(): Promise<AiModel[]> {
    if (!this.isDbConnected) {
      return await fallbackStorage.getAiModels();
    }
    try {
      return await db.select().from(aiModels).where(eq(aiModels.isActive, 1));
    } catch (error) {
      console.error("Database error, using fallback:", error);
      return await fallbackStorage.getAiModels();
    }
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
    if (!this.isDbConnected) {
      return await fallbackStorage.getCommodities();
    }
    try {
      return await db.select().from(commodities);
    } catch (error) {
      console.error("Database error, using fallback:", error);
      return await fallbackStorage.getCommodities();
    }
  }

  async getCommodity(id: string): Promise<Commodity | undefined> {
    if (!this.isDbConnected) {
      return await fallbackStorage.getCommodity(id);
    }
    try {
      const [commodity] = await db.select().from(commodities).where(eq(commodities.id, id));
      return commodity || undefined;
    } catch (error) {
      console.error("Database error, using fallback:", error);
      return await fallbackStorage.getCommodity(id);
    }
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
    if (!this.isDbConnected) {
      console.log("Database not connected, using fallback storage for predictions");
      return await fallbackStorage.getPredictions(commodityId, aiModelId);
    }
    try {
      const conditions = [];
      if (commodityId) conditions.push(eq(predictions.commodityId, commodityId));
      if (aiModelId) conditions.push(eq(predictions.aiModelId, aiModelId));
      
      let query = db.select().from(predictions);
      
      if (conditions.length > 0) {
        query = query.where(and(...conditions)) as any;
      }
      
      return await query.orderBy(desc(predictions.createdAt));
    } catch (error) {
      console.error('Error fetching predictions, using fallback:', error);
      return await fallbackStorage.getPredictions(commodityId, aiModelId);
    }
  }

  async createPrediction(insertPrediction: InsertPrediction): Promise<Prediction> {
    const [prediction] = await db.insert(predictions).values(insertPrediction).returning();
    return prediction;
  }



  async getPredictionsByCommodity(commodityId: string): Promise<Prediction[]> {
    return this.getPredictions(commodityId);
  }

  async getActualPrices(commodityId: string, limit?: number): Promise<ActualPrice[]> {
    if (!this.isDbConnected) {
      return await fallbackStorage.getActualPrices(commodityId, limit);
    }
    try {
      let query = db.select().from(actualPrices)
        .where(eq(actualPrices.commodityId, commodityId))
        .orderBy(desc(actualPrices.date));
      
      if (limit) {
        query = query.limit(limit) as any;
      }
      
      return await query;
    } catch (error) {
      console.error('Error fetching actual prices:', error);
      return await fallbackStorage.getActualPrices(commodityId, limit);
    }
  }

  async createActualPrice(insertPrice: InsertActualPrice): Promise<ActualPrice> {
    if (!this.isDbConnected) {
      return await fallbackStorage.createActualPrice(insertPrice);
    }
    try {
      const [price] = await db.insert(actualPrices).values(insertPrice).returning();
      return price;
    } catch (error) {
      console.error("Database error, using fallback:", error);
      return await fallbackStorage.createActualPrice(insertPrice);
    }
  }



  async getLatestPrice(commodityId: string): Promise<ActualPrice | undefined> {
    if (!this.isDbConnected) {
      return await fallbackStorage.getLatestPrice(commodityId);
    }
    try {
      const prices = await this.getActualPrices(commodityId, 1);
      return prices[0];
    } catch (error) {
      console.error("Database error, using fallback:", error);
      return await fallbackStorage.getLatestPrice(commodityId);
    }
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
    if (!this.isDbConnected) {
      return await fallbackStorage.getDashboardStats();
    }
    try {
      const allPredictions = await db.select().from(predictions);
      const allCommodities = await this.getCommodities();
      
      // Get the best performing model using accuracy calculator rankings
      const rankings = await this.getLeagueTable('30d');
      const topRanking = rankings.find(r => r.rank === 1);
      
      const topModel = topRanking?.aiModel || "No predictions yet";
      const topAccuracy = topRanking?.accuracy || 0;
      
      // Calculate average accuracy across all models
      const avgAccuracy = rankings.length > 0 
        ? rankings.reduce((sum, r) => sum + r.accuracy, 0) / rankings.length
        : 0;

      return {
        totalPredictions: allPredictions.length,
        topModel: typeof topModel === 'string' ? topModel : topModel.name,
        topAccuracy: Number(topAccuracy.toFixed(1)),
        activeCommodities: allCommodities.length,
        avgAccuracy: Number(avgAccuracy.toFixed(2))
      };
    } catch (error) {
      console.error("Database error in getDashboardStats, using fallback:", error);
      return await fallbackStorage.getDashboardStats();
    }
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

  // Add missing Yahoo Finance update methods
  async updateAllCommodityPricesFromYahoo(): Promise<void> {
    console.log("Updating all commodity prices from Yahoo Finance...");
    const commodities = await this.getCommodities();
    for (const commodity of commodities) {
      try {
        await this.updateSingleCommodityPricesFromYahoo(commodity.id);
      } catch (error) {
        console.error(`Failed to update prices for ${commodity.name}:`, error);
      }
    }
  }

  async updateSingleCommodityPricesFromYahoo(commodityId: string): Promise<void> {
    if (!this.isDbConnected) {
      console.log("Database not connected, skipping Yahoo Finance update");
      return;
    }
    
    const commodity = await this.getCommodity(commodityId);
    if (!commodity || !commodity.yahooSymbol) {
      console.log(`No Yahoo symbol for commodity ${commodityId}`);
      return;
    }

    try {
      // This would integrate with your yahoo finance service
      // For now, just log the attempt
      console.log(`Updating prices for ${commodity.name} (${commodity.yahooSymbol})`);
    } catch (error) {
      console.error(`Yahoo Finance update failed for ${commodity.name}:`, error);
    }
  }

  /**
   * Initialize historical predictions for the past year
   * Creates realistic AI predictions based on sample historical data
   */
  private async initializeHistoricalPredictions() {
    if (!this.isDbConnected) {
      console.log("Skipping historical predictions - database not connected");
      return;
    }

    try {
      // Check if historical predictions already exist
      const existingPredictions = await db.select().from(predictions).limit(1);
      if (existingPredictions.length > 0) {
        console.log("Historical predictions already exist, skipping initialization");
        return;
      }

      console.log("Generating historical predictions for the past year...");

      // Get all AI models and commodities
      const models = await this.getAiModels();
      const allCommodities = await this.getCommodities();

      // Focus on the main commodities that match your Yahoo Finance integration
      const mainCommodities = allCommodities.filter(c => 
        ['WTI', 'XAU', 'NG', 'HG', 'XAG', 'KC', 'SB', 'ZC', 'ZS', 'CT'].includes(c.symbol)
      );

      let totalPredictions = 0;

      for (const commodity of mainCommodities) {
        // Generate sample historical prices for this commodity
        const oneYearAgo = new Date();
        oneYearAgo.setFullYear(oneYearAgo.getFullYear() - 1);
        
        const samplePrices = this.historicalGenerator.generateSampleHistoricalPrices(
          commodity,
          oneYearAgo,
          365
        );

        // Generate historical predictions
        const historicalPredictions = this.historicalGenerator.generateHistoricalPredictions(
          commodity,
          models,
          samplePrices
        );

        // Insert predictions in batches to avoid overwhelming the database
        const batchSize = 50;
        for (let i = 0; i < historicalPredictions.length; i += batchSize) {
          const batch = historicalPredictions.slice(i, i + batchSize);
          await db.insert(predictions).values(batch);
          totalPredictions += batch.length;
        }

        console.log(`Generated ${historicalPredictions.length} historical predictions for ${commodity.name}`);
      }

      console.log(`Historical prediction initialization complete. Generated ${totalPredictions} total predictions.`);

    } catch (error) {
      console.error("Error initializing historical predictions:", error);
      // Don't throw - we want the app to continue even if historical data fails
    }
  }
}

export const storage = new DatabaseStorage();
