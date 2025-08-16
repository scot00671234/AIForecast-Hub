import { type InsertPrediction, type Commodity, type AiModel } from "@shared/schema";
import { randomUUID } from "crypto";

interface HistoricalPrice {
  date: Date;
  price: number;
}

/**
 * Generates realistic historical prediction data for AI models
 * Creates one year of predictions with realistic variations between models
 */
export class HistoricalPredictionGenerator {
  
  /**
   * Generate historical predictions for a commodity over the past year
   * @param commodity The commodity to generate predictions for
   * @param aiModels Array of AI models to generate predictions for
   * @param historicalPrices Actual historical prices for reference
   * @returns Array of historical predictions
   */
  generateHistoricalPredictions(
    commodity: Commodity,
    aiModels: AiModel[],
    historicalPrices: HistoricalPrice[]
  ): InsertPrediction[] {
    const predictions: InsertPrediction[] = [];
    const oneYearAgo = new Date();
    oneYearAgo.setFullYear(oneYearAgo.getFullYear() - 1);
    
    // Generate predictions for each week over the past year
    for (let weekOffset = 0; weekOffset < 52; weekOffset++) {
      const predictionDate = new Date(oneYearAgo);
      predictionDate.setDate(predictionDate.getDate() + (weekOffset * 7));
      
      const targetDate = new Date(predictionDate);
      targetDate.setDate(targetDate.getDate() + 7); // 7-day predictions
      
      // Find the closest historical price for context
      const referencePrice = this.findClosestPrice(historicalPrices, predictionDate);
      if (!referencePrice) continue;
      
      // Generate predictions for each AI model
      for (const aiModel of aiModels) {
        const prediction = this.generateSinglePrediction(
          commodity,
          aiModel,
          predictionDate,
          targetDate,
          referencePrice.price
        );
        predictions.push(prediction);
      }
    }
    
    return predictions;
  }
  
  /**
   * Generate a single prediction with model-specific characteristics
   */
  private generateSinglePrediction(
    commodity: Commodity,
    aiModel: AiModel,
    predictionDate: Date,
    targetDate: Date,
    referencePrice: number
  ): InsertPrediction {
    // Model-specific prediction characteristics
    const modelCharacteristics = this.getModelCharacteristics(aiModel.name);
    
    // Create deterministic seed from commodity, model, and date
    const seed = this.createSeed(commodity.id, aiModel.id, predictionDate);
    const rng = this.seededRandom(seed);
    
    // Generate realistic price variation based on commodity volatility (much smaller range)
    const volatility = this.getCommodityVolatility(commodity.symbol);
    const baseVariation = (rng() - 0.5) * volatility * referencePrice * 0.3; // Reduced from full volatility
    
    // Apply model bias and accuracy
    const modelBias = modelCharacteristics.bias;
    const accuracyFactor = modelCharacteristics.accuracy;
    
    // Calculate predicted price with minimal realistic noise - keep close to actual
    const predictedPrice = referencePrice + 
      (baseVariation * accuracyFactor * 0.5) + 
      (referencePrice * modelBias * (rng() - 0.5) * 0.1); // Much smaller bias impact
    
    // Ensure price stays within reasonable bounds of actual price (±15%)
    const finalPrice = Math.max(
      Math.min(predictedPrice, referencePrice * 1.15), 
      referencePrice * 0.85
    );
    
    return {
      aiModelId: aiModel.id,
      commodityId: commodity.id,
      predictionDate,
      targetDate,
      predictedPrice: finalPrice.toString(),
      confidence: (85 + Math.random() * 10).toString(), // 85-95% confidence
      metadata: {
        generated: true,
        historical: true,
        basePrice: referencePrice,
        modelVersion: this.getModelVersion(aiModel.name, predictionDate)
      }
    };
  }
  
  /**
   * Get model-specific characteristics for realistic predictions
   */
  private getModelCharacteristics(modelName: string): {
    bias: number;
    accuracy: number;
    volatility: number;
  } {
    switch (modelName.toLowerCase()) {
      case 'claude':
        return {
          bias: 0.02, // Slightly optimistic
          accuracy: 0.92, // High accuracy
          volatility: 0.8 // Lower volatility predictions
        };
      case 'chatgpt':
        return {
          bias: -0.01, // Slightly conservative
          accuracy: 0.89, // Good accuracy
          volatility: 1.0 // Moderate volatility predictions
        };
      case 'deepseek':
        return {
          bias: 0.005, // Nearly neutral
          accuracy: 0.86, // Decent accuracy
          volatility: 1.2 // Higher volatility predictions
        };
      default:
        return {
          bias: 0,
          accuracy: 0.85,
          volatility: 1.0
        };
    }
  }
  
  /**
   * Get commodity-specific volatility factors (reduced for more realistic predictions)
   */
  private getCommodityVolatility(symbol: string): number {
    const volatilityMap: Record<string, number> = {
      'WTI': 0.08, // Oil - reduced volatility for predictions
      'GC': 0.04,  // Gold - reduced volatility
      'NG': 0.12,  // Natural Gas - reduced volatility
      'HG': 0.06,  // Copper - reduced volatility
      'SI': 0.09,  // Silver - reduced volatility
      'KC': 0.10,  // Coffee - reduced volatility
      'SB': 0.11,  // Sugar - reduced volatility
      'ZC': 0.07,  // Corn - reduced volatility
      'ZS': 0.065, // Soybeans - reduced volatility
      'CT': 0.08   // Cotton - reduced volatility
    };
    
    return volatilityMap[symbol] || 0.08;
  }
  
  /**
   * Find the closest historical price to a given date
   */
  private findClosestPrice(prices: HistoricalPrice[], targetDate: Date): HistoricalPrice | null {
    if (prices.length === 0) return null;
    
    return prices.reduce((closest, current) => {
      const currentDiff = Math.abs(current.date.getTime() - targetDate.getTime());
      const closestDiff = Math.abs(closest.date.getTime() - targetDate.getTime());
      return currentDiff < closestDiff ? current : closest;
    });
  }
  
  /**
   * Get model version based on date (simulate model improvements over time)
   */
  private getModelVersion(modelName: string, date: Date): string {
    const monthsAgo = Math.floor((Date.now() - date.getTime()) / (1000 * 60 * 60 * 24 * 30));
    
    switch (modelName.toLowerCase()) {
      case 'claude':
        return monthsAgo > 6 ? 'claude-3' : 'claude-3.5';
      case 'chatgpt':
        return monthsAgo > 8 ? 'gpt-4' : 'gpt-4o';
      case 'deepseek':
        return monthsAgo > 4 ? 'deepseek-v2' : 'deepseek-v2.5';
      default:
        return 'v1.0';
    }
  }
  
  /**
   * Create a deterministic seed from commodity, model, and date
   */
  private createSeed(commodityId: string, modelId: string, date: Date): number {
    const str = `${commodityId}-${modelId}-${date.toISOString().split('T')[0]}`;
    let hash = 0;
    for (let i = 0; i < str.length; i++) {
      const char = str.charCodeAt(i);
      hash = ((hash << 5) - hash) + char;
      hash = hash & hash; // Convert to 32bit integer
    }
    return Math.abs(hash);
  }

  /**
   * Seeded random number generator for consistent predictions
   */
  private seededRandom(seed: number): () => number {
    let currentSeed = seed;
    return () => {
      currentSeed = (currentSeed * 9301 + 49297) % 233280;
      return currentSeed / 233280;
    };
  }

  /**
   * Generate sample historical prices for development (when Yahoo Finance data is unavailable)
   */
  generateSampleHistoricalPrices(
    commodity: Commodity,
    startDate: Date,
    days: number = 365
  ): HistoricalPrice[] {
    const prices: HistoricalPrice[] = [];
    let currentPrice = this.getBasePrice(commodity.symbol);
    
    // Use deterministic seed for price generation
    const seed = this.createSeed(commodity.id, 'historical', startDate);
    const rng = this.seededRandom(seed);
    
    for (let i = 0; i < days; i++) {
      const date = new Date(startDate);
      date.setDate(date.getDate() + i);
      
      // Generate realistic price movement with smaller variations
      const volatility = this.getCommodityVolatility(commodity.symbol);
      const dailyChange = (rng() - 0.5) * volatility * currentPrice * 0.05; // Reduced daily variation
      currentPrice = Math.max(currentPrice + dailyChange, currentPrice * 0.5);
      
      prices.push({
        date: new Date(date),
        price: currentPrice
      });
    }
    
    return prices;
  }
  
  /**
   * Get base prices for commodities (current market ranges)
   */
  private getBasePrice(symbol: string): number {
    const basePrices: Record<string, number> = {
      'WTI': 75,    // Oil ~$75/barrel
      'GC': 2000,   // Gold ~$2000/oz
      'NG': 3.5,    // Natural Gas ~$3.50/MMBtu
      'HG': 4.0,    // Copper ~$4.00/lb
      'SI': 25,     // Silver ~$25/oz
      'KC': 150,    // Coffee ~150 cents/lb
      'SB': 20,     // Sugar ~20 cents/lb
      'ZC': 450,    // Corn ~450 cents/bushel
      'ZS': 1100,   // Soybeans ~1100 cents/bushel
      'CT': 70      // Cotton ~70 cents/lb
    };
    
    return basePrices[symbol] || 100;
  }
}