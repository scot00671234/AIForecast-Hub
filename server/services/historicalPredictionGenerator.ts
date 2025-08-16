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
    
    // Generate realistic price variation based on commodity volatility
    const volatility = this.getCommodityVolatility(commodity.symbol);
    const baseVariation = (Math.random() - 0.5) * volatility * referencePrice;
    
    // Apply model bias and accuracy
    const modelBias = modelCharacteristics.bias;
    const accuracyFactor = modelCharacteristics.accuracy;
    
    // Calculate predicted price with some realistic noise
    const predictedPrice = referencePrice + 
      (baseVariation * accuracyFactor) + 
      (referencePrice * modelBias * (Math.random() - 0.5));
    
    // Ensure price is positive
    const finalPrice = Math.max(predictedPrice, referencePrice * 0.1);
    
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
   * Get commodity-specific volatility factors
   */
  private getCommodityVolatility(symbol: string): number {
    const volatilityMap: Record<string, number> = {
      'WTI': 0.15, // Oil - high volatility
      'GC': 0.08,  // Gold - moderate volatility
      'NG': 0.25,  // Natural Gas - very high volatility
      'HG': 0.12,  // Copper - moderate-high volatility
      'SI': 0.18,  // Silver - high volatility
      'KC': 0.20,  // Coffee - high volatility
      'SB': 0.22,  // Sugar - very high volatility
      'ZC': 0.14,  // Corn - moderate-high volatility
      'ZS': 0.13,  // Soybeans - moderate-high volatility
      'CT': 0.16   // Cotton - high volatility
    };
    
    return volatilityMap[symbol] || 0.15;
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
   * Generate sample historical prices for development (when Yahoo Finance data is unavailable)
   */
  generateSampleHistoricalPrices(
    commodity: Commodity,
    startDate: Date,
    days: number = 365
  ): HistoricalPrice[] {
    const prices: HistoricalPrice[] = [];
    let currentPrice = this.getBasePrice(commodity.symbol);
    
    for (let i = 0; i < days; i++) {
      const date = new Date(startDate);
      date.setDate(date.getDate() + i);
      
      // Generate realistic price movement
      const volatility = this.getCommodityVolatility(commodity.symbol);
      const dailyChange = (Math.random() - 0.5) * volatility * currentPrice * 0.1;
      currentPrice = Math.max(currentPrice + dailyChange, currentPrice * 0.1);
      
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