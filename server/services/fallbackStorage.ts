import type { 
  AiModel, 
  InsertAiModel,
  Commodity,
  InsertCommodity,
  Prediction,
  InsertPrediction,
  ActualPrice,
  InsertActualPrice,
  AccuracyMetric,
  InsertAccuracyMetric,
  MarketAlert,
  InsertMarketAlert,
  DashboardStats,
  LeagueTableEntry,
  ChartDataPoint
} from "@shared/schema";
import { randomUUID } from "crypto";

// In-memory fallback storage for when PostgreSQL is not available
export class FallbackStorage {
  private aiModels: AiModel[] = [
    { id: "1", name: "Claude", provider: "Anthropic", color: "#10B981", isActive: 1 },
    { id: "2", name: "ChatGPT", provider: "OpenAI", color: "#3B82F6", isActive: 1 },
    { id: "3", name: "Deepseek", provider: "Deepseek AI", color: "#8B5CF6", isActive: 1 }
  ];

  private commodities: Commodity[] = [
    // Hard Commodities
    { id: "c1", name: "Crude Oil", symbol: "WTI", category: "hard", yahooSymbol: "CL=F", unit: "USD/barrel" },
    { id: "c2", name: "Gold", symbol: "XAU", category: "hard", yahooSymbol: "GC=F", unit: "USD/oz" },
    { id: "c3", name: "Natural Gas", symbol: "NG", category: "hard", yahooSymbol: "NG=F", unit: "USD/MMBtu" },
    { id: "c4", name: "Copper", symbol: "HG", category: "hard", yahooSymbol: "HG=F", unit: "USD/lb" },
    { id: "c5", name: "Silver", symbol: "XAG", category: "hard", yahooSymbol: "SI=F", unit: "USD/oz" },
    // Soft Commodities
    { id: "c6", name: "Coffee", symbol: "KC", category: "soft", yahooSymbol: "KC=F", unit: "USD/lb" },
    { id: "c7", name: "Sugar", symbol: "SB", category: "soft", yahooSymbol: "SB=F", unit: "USD/lb" },
    { id: "c8", name: "Corn", symbol: "ZC", category: "soft", yahooSymbol: "ZC=F", unit: "USD/bushel" },
    { id: "c9", name: "Soybeans", symbol: "ZS", category: "soft", yahooSymbol: "ZS=F", unit: "USD/bushel" },
    { id: "c10", name: "Cotton", symbol: "CT", category: "soft", yahooSymbol: "CT=F", unit: "USD/lb" }
  ];

  private actualPrices: ActualPrice[] = [];
  private predictions: Prediction[] = [];
  private accuracyMetrics: AccuracyMetric[] = [];
  private marketAlerts: MarketAlert[] = [];

  // AI Models
  async getAiModels(): Promise<AiModel[]> {
    return this.aiModels.filter(m => m.isActive === 1);
  }

  async getAiModel(id: string): Promise<AiModel | undefined> {
    return this.aiModels.find(m => m.id === id);
  }

  async createAiModel(model: InsertAiModel): Promise<AiModel> {
    const newModel: AiModel = {
      id: randomUUID(),
      ...model,
      isActive: model.isActive ?? 1
    };
    this.aiModels.push(newModel);
    return newModel;
  }

  // Commodities
  async getCommodities(): Promise<Commodity[]> {
    return this.commodities;
  }

  async getCommodity(id: string): Promise<Commodity | undefined> {
    return this.commodities.find(c => c.id === id);
  }

  async getCommodityBySymbol(symbol: string): Promise<Commodity | undefined> {
    return this.commodities.find(c => c.symbol === symbol);
  }

  async createCommodity(commodity: InsertCommodity): Promise<Commodity> {
    const newCommodity: Commodity = {
      id: randomUUID(),
      ...commodity,
      yahooSymbol: commodity.yahooSymbol ?? null,
      unit: commodity.unit ?? null
    };
    this.commodities.push(newCommodity);
    return newCommodity;
  }

  // Actual Prices
  async getActualPrices(commodityId: string, limit?: number): Promise<ActualPrice[]> {
    const prices = this.actualPrices
      .filter(p => p.commodityId === commodityId)
      .sort((a, b) => b.date.getTime() - a.date.getTime());
    
    return limit ? prices.slice(0, limit) : prices;
  }

  async createActualPrice(price: InsertActualPrice): Promise<ActualPrice> {
    const newPrice: ActualPrice = {
      id: randomUUID(),
      ...price,
      date: new Date(price.date),
      volume: price.volume ?? null,
      source: price.source ?? null,
      createdAt: new Date()
    };
    
    // Remove existing price for same commodity and date
    this.actualPrices = this.actualPrices.filter(
      p => !(p.commodityId === price.commodityId && 
             p.date.toISOString().split('T')[0] === new Date(price.date).toISOString().split('T')[0])
    );
    
    this.actualPrices.push(newPrice);
    return newPrice;
  }

  async insertActualPrice(price: InsertActualPrice): Promise<ActualPrice> {
    return this.createActualPrice(price);
  }

  async getLatestPrice(commodityId: string): Promise<ActualPrice | undefined> {
    const prices = await this.getActualPrices(commodityId, 1);
    return prices[0];
  }

  // Predictions
  async getPredictions(commodityId?: string, aiModelId?: string): Promise<Prediction[]> {
    let filtered = this.predictions;
    
    if (commodityId) {
      filtered = filtered.filter(p => p.commodityId === commodityId);
    }
    
    if (aiModelId) {
      filtered = filtered.filter(p => p.aiModelId === aiModelId);
    }
    
    return filtered.sort((a, b) => b.predictionDate.getTime() - a.predictionDate.getTime());
  }

  async getPredictionsByCommodity(commodityId: string): Promise<Prediction[]> {
    return this.getPredictions(commodityId);
  }

  async createPrediction(prediction: InsertPrediction): Promise<Prediction> {
    const newPrediction: Prediction = {
      id: randomUUID(),
      ...prediction,
      predictionDate: new Date(prediction.predictionDate),
      targetDate: new Date(prediction.targetDate),
      confidence: prediction.confidence ?? null,
      metadata: prediction.metadata ?? null,
      createdAt: new Date()
    };
    
    this.predictions.push(newPrediction);
    return newPrediction;
  }

  async insertPrediction(prediction: InsertPrediction): Promise<Prediction> {
    return this.createPrediction(prediction);
  }

  // Dashboard Stats
  async getDashboardStats(): Promise<DashboardStats> {
    const totalCommodities = this.commodities.length;
    const totalPredictions = this.predictions.length;
    const activeAlerts = this.marketAlerts.filter(a => a.isActive === 1).length;
    
    // Calculate recent price changes
    const commoditiesWithPrices = await Promise.all(
      this.commodities.map(async c => {
        const prices = await this.getActualPrices(c.id, 2);
        if (prices.length >= 2) {
          const current = parseFloat(prices[0].price);
          const previous = parseFloat(prices[1].price);
          const change = ((current - previous) / previous) * 100;
          return { commodity: c, change };
        }
        return null;
      })
    );

    const validChanges = commoditiesWithPrices.filter(Boolean) as Array<{ commodity: Commodity; change: number }>;
    const avgMarketChange = validChanges.length > 0 
      ? validChanges.reduce((sum, item) => sum + item.change, 0) / validChanges.length 
      : 0;

    return {
      totalPredictions,
      topModel: "Claude",
      topAccuracy: 87.5,
      activeCommodities: totalCommodities,
      avgAccuracy: 82.3
    };
  }

  // League Table
  async getLeagueTable(period: string): Promise<LeagueTableEntry[]> {
    const models = await this.getAiModels();
    
    return models.map((model, index) => ({
      rank: index + 1,
      aiModel: model,
      accuracy: 75 + Math.random() * 20, // Simulated accuracy between 75-95%
      totalPredictions: Math.floor(50 + Math.random() * 100),
      trend: Math.random() > 0.5 ? "up" : "down"
    }));
  }

  // Chart Data
  async getChartData(commodityId: string, days: number): Promise<ChartDataPoint[]> {
    const prices = await this.getActualPrices(commodityId, days);
    const predictions = await this.getPredictions(commodityId);
    
    const chartData: ChartDataPoint[] = [];
    
    for (const price of prices) {
      const dayPredictions: Record<string, number> = {};
      
      const matchingPredictions = predictions.filter(p => 
        p.targetDate.toISOString().split('T')[0] === price.date.toISOString().split('T')[0]
      );
      
      for (const pred of matchingPredictions) {
        dayPredictions[`${pred.aiModelId}_prediction`] = parseFloat(pred.predictedPrice);
      }
      
      chartData.push({
        date: price.date.toISOString().split('T')[0],
        actualPrice: parseFloat(price.price),
        ...dayPredictions
      });
    }
    
    return chartData;
  }

  // Other required methods
  async getAccuracyMetrics(period: string): Promise<AccuracyMetric[]> {
    return this.accuracyMetrics;
  }

  async updateAccuracyMetric(metric: InsertAccuracyMetric): Promise<AccuracyMetric> {
    const newMetric: AccuracyMetric = {
      id: randomUUID(),
      ...metric,
      avgError: metric.avgError ?? null,
      lastUpdated: new Date()
    };
    this.accuracyMetrics.push(newMetric);
    return newMetric;
  }

  async getActiveAlerts(): Promise<MarketAlert[]> {
    return this.marketAlerts.filter(a => a.isActive === 1);
  }

  async createAlert(alert: InsertMarketAlert): Promise<MarketAlert> {
    const newAlert: MarketAlert = {
      id: randomUUID(),
      ...alert,
      isActive: alert.isActive ?? 1,
      aiModelId: alert.aiModelId ?? null,
      commodityId: alert.commodityId ?? null,
      createdAt: new Date()
    };
    this.marketAlerts.push(newAlert);
    return newAlert;
  }

  async rawQuery(query: string, params?: any[]): Promise<{ rows: any[] }> {
    return { rows: [] };
  }
}

export const fallbackStorage = new FallbackStorage();