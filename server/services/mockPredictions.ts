interface PredictionData {
  date: string;
  actualPrice: number | null;
  claudePrediction: number;
  chatgptPrediction: number;
  deepseekPrediction: number;
}

interface CommodityPredictions {
  commodityId: string;
  predictions: PredictionData[];
}

// Advanced prediction algorithms for each AI model
class PredictionGenerator {
  private generateTrend(days: number, basePrice: number, volatility: number, trend: number): number[] {
    const prices: number[] = [];
    let currentPrice = basePrice;
    
    for (let i = 0; i < days; i++) {
      // Add trend component
      const trendComponent = trend * (i / days);
      
      // Add seasonal component (simple sine wave)
      const seasonalComponent = Math.sin((i * 2 * Math.PI) / 365) * (volatility * 0.3);
      
      // Add random volatility
      const randomComponent = (Math.random() - 0.5) * volatility;
      
      currentPrice = basePrice * (1 + trendComponent + seasonalComponent + randomComponent);
      prices.push(Math.max(currentPrice, basePrice * 0.1)); // Prevent negative prices
    }
    
    return prices;
  }

  generateClaudePredictions(basePrice: number, days: number = 365): number[] {
    // Claude tends to be conservative with moderate volatility
    return this.generateTrend(days, basePrice, 0.15, 0.02); // 2% annual trend, 15% volatility
  }

  generateChatGPTPredictions(basePrice: number, days: number = 365): number[] {
    // ChatGPT shows higher volatility but neutral bias
    return this.generateTrend(days, basePrice, 0.25, 0.01); // 1% annual trend, 25% volatility
  }

  generateDeepseekPredictions(basePrice: number, days: number = 365): number[] {
    // Deepseek is most conservative with lowest volatility
    return this.generateTrend(days, basePrice, 0.10, 0.015); // 1.5% annual trend, 10% volatility
  }

  generateHistoricalActualPrices(basePrice: number, historicalDays: number = 90): number[] {
    // Generate more realistic historical price movements
    return this.generateTrend(historicalDays, basePrice, 0.20, 0.0); // No trend bias for actual prices
  }
}

// Base prices for commodities (in appropriate units)
const COMMODITY_BASE_PRICES: Record<string, number> = {
  // Energy
  'WTI': 72.50,        // $/barrel
  'BRENT': 76.20,      // $/barrel  
  'NATGAS': 2.85,      // $/MMBtu
  
  // Precious Metals
  'GOLD': 2010.30,     // $/oz
  'SILVER': 23.45,     // $/oz
  'PLATINUM': 945.80,  // $/oz
  'PALLADIUM': 998.50, // $/oz
  
  // Industrial Metals  
  'COPPER': 8.95,      // $/lb
  'ALUMINUM': 2.15,    // $/lb
  'NICKEL': 18.75,     // $/lb
  'ZINC': 2.85,        // $/lb
  
  // Agricultural - Grains
  'CORN': 4.92,        // $/bushel
  'WHEAT': 5.78,       // $/bushel
  'SOYBEAN': 12.85,    // $/bushel
  'RICE': 16.20,       // $/cwt
  
  // Agricultural - Soft
  'SUGAR': 0.22,       // $/lb
  'COFFEE': 1.72,      // $/lb
  'COCOA': 3150.00,    // $/metric ton
  'COTTON': 0.78,      // $/lb
};

export class MockPredictionService {
  private generator = new PredictionGenerator();
  private predictions: Map<string, CommodityPredictions> = new Map();

  generatePredictionsForCommodity(commoditySymbol: string, commodityId: string): CommodityPredictions {
    const basePrice = COMMODITY_BASE_PRICES[commoditySymbol] || 100;
    
    // Generate historical actual prices (last 90 days)
    const historicalActual = this.generator.generateHistoricalActualPrices(basePrice, 90);
    
    // Generate future predictions (next 365 days)
    const claudePredictions = this.generator.generateClaudePredictions(basePrice, 365);
    const chatgptPredictions = this.generator.generateChatGPTPredictions(basePrice, 365);
    const deepseekPredictions = this.generator.generateDeepseekPredictions(basePrice, 365);

    const predictions: PredictionData[] = [];
    const today = new Date();

    // Add historical data (actual prices available)
    for (let i = 89; i >= 0; i--) {
      const date = new Date(today);
      date.setDate(date.getDate() - i);
      
      predictions.push({
        date: date.toISOString().split('T')[0],
        actualPrice: Number(historicalActual[89 - i].toFixed(2)),
        claudePrediction: Number(claudePredictions[0].toFixed(2)),
        chatgptPrediction: Number(chatgptPredictions[0].toFixed(2)),
        deepseekPrediction: Number(deepseekPredictions[0].toFixed(2)),
      });
    }

    // Add future predictions (no actual prices)
    for (let i = 1; i <= 365; i++) {
      const date = new Date(today);
      date.setDate(date.getDate() + i);
      
      predictions.push({
        date: date.toISOString().split('T')[0],
        actualPrice: null, // Future prices unknown
        claudePrediction: Number(claudePredictions[i - 1].toFixed(2)),
        chatgptPrediction: Number(chatgptPredictions[i - 1].toFixed(2)),
        deepseekPrediction: Number(deepseekPredictions[i - 1].toFixed(2)),
      });
    }

    const commodityPredictions: CommodityPredictions = {
      commodityId,
      predictions,
    };

    this.predictions.set(commodityId, commodityPredictions);
    return commodityPredictions;
  }

  getPredictionsForCommodity(commodityId: string): CommodityPredictions | null {
    return this.predictions.get(commodityId) || null;
  }

  getAllPredictions(): CommodityPredictions[] {
    return Array.from(this.predictions.values());
  }

  // Get current price (most recent actual or first prediction)
  getCurrentPrice(commodityId: string): number | null {
    const predictions = this.getPredictionsForCommodity(commodityId);
    if (!predictions) return null;

    // Find the most recent actual price
    const recentActual = predictions.predictions
      .filter(p => p.actualPrice !== null)
      .pop();

    return recentActual?.actualPrice || predictions.predictions[89]?.claudePrediction || null;
  }

  // Get price change percentage
  getPriceChange(commodityId: string): number {
    const predictions = this.getPredictionsForCommodity(commodityId);
    if (!predictions || predictions.predictions.length < 2) return 0;

    const current = this.getCurrentPrice(commodityId);
    const previous = predictions.predictions
      .filter(p => p.actualPrice !== null)
      .slice(-2)[0]?.actualPrice;

    if (!current || !previous) return 0;
    
    return Number((((current - previous) / previous) * 100).toFixed(2));
  }
}

export const mockPredictionService = new MockPredictionService();