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
  type ChartDataPoint
} from "@shared/schema";
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
  createPrediction(prediction: InsertPrediction): Promise<Prediction>;

  // Actual Prices
  getActualPrices(commodityId: string, limit?: number): Promise<ActualPrice[]>;
  createActualPrice(price: InsertActualPrice): Promise<ActualPrice>;
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
}

export class MemStorage implements IStorage {
  private aiModels: Map<string, AiModel>;
  private commodities: Map<string, Commodity>;
  private predictions: Map<string, Prediction>;
  private actualPrices: Map<string, ActualPrice>;
  private accuracyMetrics: Map<string, AccuracyMetric>;
  private marketAlerts: Map<string, MarketAlert>;

  constructor() {
    this.aiModels = new Map();
    this.commodities = new Map();
    this.predictions = new Map();
    this.actualPrices = new Map();
    this.accuracyMetrics = new Map();
    this.marketAlerts = new Map();

    this.initializeDefaultData();
  }

  private initializeDefaultData() {
    // Initialize AI Models
    const models = [
      { name: "Claude", provider: "Anthropic", color: "#10B981", isActive: 1 },
      { name: "ChatGPT", provider: "OpenAI", color: "#3B82F6", isActive: 1 },
      { name: "Deepseek", provider: "Deepseek AI", color: "#8B5CF6", isActive: 1 }
    ];

    models.forEach(model => {
      const id = randomUUID();
      this.aiModels.set(id, { ...model, id });
    });

    // Initialize Commodities
    const commodities = [
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

    commodities.forEach(commodity => {
      const id = randomUUID();
      this.commodities.set(id, { ...commodity, id });
    });
  }

  async getAiModels(): Promise<AiModel[]> {
    return Array.from(this.aiModels.values()).filter(model => model.isActive === 1);
  }

  async getAiModel(id: string): Promise<AiModel | undefined> {
    return this.aiModels.get(id);
  }

  async createAiModel(insertModel: InsertAiModel): Promise<AiModel> {
    const id = randomUUID();
    const model: AiModel = { ...insertModel, id };
    this.aiModels.set(id, model);
    return model;
  }

  async getCommodities(): Promise<Commodity[]> {
    return Array.from(this.commodities.values());
  }

  async getCommodity(id: string): Promise<Commodity | undefined> {
    return this.commodities.get(id);
  }

  async getCommodityBySymbol(symbol: string): Promise<Commodity | undefined> {
    return Array.from(this.commodities.values()).find(c => c.symbol === symbol || c.yahooSymbol === symbol);
  }

  async createCommodity(insertCommodity: InsertCommodity): Promise<Commodity> {
    const id = randomUUID();
    const commodity: Commodity = { ...insertCommodity, id };
    this.commodities.set(id, commodity);
    return commodity;
  }

  async getPredictions(commodityId?: string, aiModelId?: string): Promise<Prediction[]> {
    let predictions = Array.from(this.predictions.values());
    
    if (commodityId) {
      predictions = predictions.filter(p => p.commodityId === commodityId);
    }
    
    if (aiModelId) {
      predictions = predictions.filter(p => p.aiModelId === aiModelId);
    }
    
    return predictions.sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
  }

  async createPrediction(insertPrediction: InsertPrediction): Promise<Prediction> {
    const id = randomUUID();
    const prediction: Prediction = { 
      ...insertPrediction, 
      id,
      createdAt: new Date()
    };
    this.predictions.set(id, prediction);
    return prediction;
  }

  async getActualPrices(commodityId: string, limit?: number): Promise<ActualPrice[]> {
    let prices = Array.from(this.actualPrices.values())
      .filter(p => p.commodityId === commodityId)
      .sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());
    
    if (limit) {
      prices = prices.slice(0, limit);
    }
    
    return prices;
  }

  async createActualPrice(insertPrice: InsertActualPrice): Promise<ActualPrice> {
    const id = randomUUID();
    const price: ActualPrice = { 
      ...insertPrice, 
      id,
      createdAt: new Date()
    };
    this.actualPrices.set(id, price);
    return price;
  }

  async getLatestPrice(commodityId: string): Promise<ActualPrice | undefined> {
    const prices = await this.getActualPrices(commodityId, 1);
    return prices[0];
  }

  async getAccuracyMetrics(period: string): Promise<AccuracyMetric[]> {
    return Array.from(this.accuracyMetrics.values())
      .filter(m => m.period === period)
      .sort((a, b) => parseFloat(b.accuracy) - parseFloat(a.accuracy));
  }

  async updateAccuracyMetric(insertMetric: InsertAccuracyMetric): Promise<AccuracyMetric> {
    const existing = Array.from(this.accuracyMetrics.values())
      .find(m => m.aiModelId === insertMetric.aiModelId && 
                 m.commodityId === insertMetric.commodityId && 
                 m.period === insertMetric.period);

    if (existing) {
      const updated: AccuracyMetric = { 
        ...existing, 
        ...insertMetric, 
        lastUpdated: new Date() 
      };
      this.accuracyMetrics.set(existing.id, updated);
      return updated;
    } else {
      const id = randomUUID();
      const metric: AccuracyMetric = { 
        ...insertMetric, 
        id, 
        lastUpdated: new Date() 
      };
      this.accuracyMetrics.set(id, metric);
      return metric;
    }
  }

  async getActiveAlerts(): Promise<MarketAlert[]> {
    return Array.from(this.marketAlerts.values())
      .filter(a => a.isActive === 1)
      .sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime())
      .slice(0, 10);
  }

  async createAlert(insertAlert: InsertMarketAlert): Promise<MarketAlert> {
    const id = randomUUID();
    const alert: MarketAlert = { 
      ...insertAlert, 
      id,
      createdAt: new Date()
    };
    this.marketAlerts.set(id, alert);
    return alert;
  }

  async getDashboardStats(): Promise<DashboardStats> {
    const predictions = Array.from(this.predictions.values());
    const accuracyMetrics = Array.from(this.accuracyMetrics.values()).filter(m => m.period === '30d');
    const commodities = Array.from(this.commodities.values());

    const topMetric = accuracyMetrics.sort((a, b) => parseFloat(b.accuracy) - parseFloat(a.accuracy))[0];
    const topModel = topMetric ? await this.getAiModel(topMetric.aiModelId) : null;
    const avgAccuracy = accuracyMetrics.length > 0 
      ? accuracyMetrics.reduce((sum, m) => sum + parseFloat(m.accuracy), 0) / accuracyMetrics.length
      : 0;

    return {
      totalPredictions: predictions.length,
      topModel: topModel?.name || "N/A",
      topAccuracy: topMetric ? parseFloat(topMetric.accuracy) : 0,
      activeCommodities: commodities.length,
      avgAccuracy
    };
  }

  async getLeagueTable(period: string): Promise<LeagueTableEntry[]> {
    const metrics = await this.getAccuracyMetrics(period);
    const entries: LeagueTableEntry[] = [];

    for (const metric of metrics) {
      const aiModel = await this.getAiModel(metric.aiModelId);
      if (aiModel) {
        entries.push({
          rank: entries.length + 1,
          aiModel,
          accuracy: parseFloat(metric.accuracy),
          totalPredictions: metric.totalPredictions,
          trend: Math.random() * 10 - 5 // Mock trend for now
        });
      }
    }

    return entries;
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
}

export const storage = new MemStorage();
