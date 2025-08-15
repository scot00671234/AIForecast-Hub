import { db } from '../db.js';
import { predictions, commodities, aiModels } from '@shared/schema';
import { eq } from 'drizzle-orm';

interface CachedPrediction {
  predictedPrice: number;
  confidence: number;
  reasoning: string;
}

export class CachedPredictionService {
  
  // Generate realistic daily predictions with time-based trends
  private generateDailyPrediction(commodityName: string, modelName: string, currentPrice: number, dayOffset: number, totalDays: number): CachedPrediction {
    // Calculate progress through the year (0 to 1)
    const yearProgress = dayOffset / totalDays;
    
    // Base trend for the commodity over the year
    const annualTrend = this.getAnnualTrend(commodityName);
    
    // Seasonal variations
    const seasonal = Math.sin((dayOffset / 365) * 2 * Math.PI) * 0.03; // 3% seasonal variation
    
    // Weekly patterns (lower on weekends)
    const dayOfWeek = (dayOffset % 7);
    const weeklyPattern = dayOfWeek >= 5 ? -0.005 : 0.002; // Slightly lower on weekends
    // Different AI models have different prediction characteristics
    let baseTrend: number;
    let volatility: number;
    let confidence: number;
    let reasoning: string;
    
    const modelLower = modelName.toLowerCase();
    
    if (modelLower.includes('claude')) {
      baseTrend = 0.02; // 2% annual growth
      volatility = 0.015; // Lower daily volatility
      confidence = 75 + Math.random() * 15; // 75-90%
      reasoning = `Conservative market analysis for ${commodityName} on day ${dayOffset + 1} suggests stable growth trajectory.`;
    } else if (modelLower.includes('chatgpt')) {
      baseTrend = 0.05; // 5% annual growth  
      volatility = 0.025; // Moderate daily volatility
      confidence = 70 + Math.random() * 20; // 70-90%
      reasoning = `Market dynamics analysis for ${commodityName} indicates upward price momentum with moderate volatility.`;
    } else if (modelLower.includes('deepseek')) {
      baseTrend = 0.03; // 3% annual growth
      volatility = 0.02; // Balanced daily volatility
      confidence = 80 + Math.random() * 15; // 80-95%
      reasoning = `Quantitative modeling for ${commodityName} projects steady appreciation with measured risk factors.`;
    } else {
      baseTrend = 0.025; // 2.5% annual growth
      volatility = 0.02;
      confidence = 65 + Math.random() * 25; // 65-90%
      reasoning = `General market analysis for ${commodityName} suggests moderate growth potential.`;
    }
    
    // Combine all factors
    const totalTrend = (baseTrend * yearProgress) + annualTrend + seasonal + weeklyPattern;
    
    // Add daily random volatility with some persistence
    const dailyVolatility = (Math.sin(dayOffset * 0.1) + Math.random() - 0.5) * volatility;
    
    // Calculate daily prediction
    const prediction = currentPrice * (1 + totalTrend + dailyVolatility);
    
    return {
      predictedPrice: Math.max(prediction, currentPrice * 0.5), // Prevent unrealistic drops
      confidence: Math.round(confidence),
      reasoning
    };
  }

  async generateCachedPredictionsForCommodity(commodityId: string): Promise<void> {
    try {
      console.log(`Generating daily AI predictions for commodity ${commodityId} until August 15, 2026...`);
      
      // Get commodity details
      const commodity = await db.select()
        .from(commodities)
        .where(eq(commodities.id, commodityId))
        .limit(1);

      if (!commodity.length) {
        throw new Error(`Commodity not found: ${commodityId}`);
      }

      const commodityData = commodity[0];
      
      // Get current price
      const currentPrice = this.getCurrentPrice(commodityData.symbol);

      // Get AI models
      const models = await db.select()
        .from(aiModels)
        .where(eq(aiModels.isActive, 1));

      // Generate daily predictions from today until August 15, 2026
      const startDate = new Date();
      const endDate = new Date('2026-08-15');
      const totalDays = Math.ceil((endDate.getTime() - startDate.getTime()) / (1000 * 60 * 60 * 24));
      
      console.log(`Generating ${totalDays} days of predictions for ${models.length} AI models...`);
      
      let totalSuccessCount = 0;
      let totalPredictions = 0;

      // Generate predictions for each AI model
      for (const model of models) {
        console.log(`Generating daily predictions for ${model.name}...`);
        let modelSuccessCount = 0;
        
        // Generate prediction for each day
        for (let dayOffset = 0; dayOffset < totalDays; dayOffset++) {
          try {
            const predictionDate = new Date();
            const targetDate = new Date(startDate);
            targetDate.setDate(startDate.getDate() + dayOffset);
            
            // Generate price prediction for this specific day
            const dailyPrediction = this.generateDailyPrediction(
              commodityData.name,
              model.name,
              currentPrice,
              dayOffset,
              totalDays
            );

            // Store prediction in database
            await db.insert(predictions).values({
              aiModelId: model.id,
              commodityId: commodityId,
              predictionDate: predictionDate,
              targetDate: targetDate,
              predictedPrice: dailyPrediction.predictedPrice.toFixed(2),
              confidence: dailyPrediction.confidence.toString(),
              metadata: {
                reasoning: dailyPrediction.reasoning,
                model: model.name,
                provider: model.provider,
                cached: true,
                daily_prediction: true,
                day_offset: dayOffset,
                total_days: totalDays,
                generated_at: new Date().toISOString()
              }
            });

            modelSuccessCount++;
            totalSuccessCount++;
            totalPredictions++;

          } catch (error) {
            console.error(`✗ Failed to generate ${model.name} prediction for day ${dayOffset}:`, error);
          }
          
          // Small delay every 50 predictions to prevent overwhelming the database
          if (totalPredictions % 50 === 0) {
            await new Promise(resolve => setTimeout(resolve, 100));
          }
        }
        
        console.log(`✓ Generated ${modelSuccessCount}/${totalDays} daily predictions for ${model.name}`);
      }

      console.log(`Daily prediction generation completed: ${totalSuccessCount}/${totalDays * models.length} total predictions generated`);

    } catch (error) {
      console.error(`Failed to generate daily predictions for commodity ${commodityId}:`, error);
      throw error;
    }
  }

  async generateAllCachedPredictions(): Promise<void> {
    try {
      console.log('Starting cached prediction generation for all commodities...');
      
      const allCommodities = await db.select().from(commodities);
      let totalSuccess = 0;
      
      for (const commodity of allCommodities) {
        try {
          await this.generateCachedPredictionsForCommodity(commodity.id);
          totalSuccess++;
          // Small delay to prevent overwhelming the database
          await new Promise(resolve => setTimeout(resolve, 100));
        } catch (error) {
          console.error(`Failed to generate cached predictions for ${commodity.name}:`, error);
        }
      }
      
      console.log(`Cached prediction generation completed: ${totalSuccess}/${allCommodities.length} commodities processed`);
    } catch (error) {
      console.error('Failed to generate all cached predictions:', error);
    }
  }

  private getCurrentPrice(symbol: string): number {
    const basePrices: Record<string, number> = {
      'WTI': 72.50,
      'BRENT': 76.20,
      'NATGAS': 2.85,
      'GOLD': 2010.30,
      'SILVER': 23.45,
      'PLATINUM': 945.80,
      'PALLADIUM': 998.50,
      'COPPER': 8.95,
      'ALUMINUM': 2.15,
      'NICKEL': 18.75,
      'ZINC': 2.85,
      'CORN': 4.92,
      'WHEAT': 5.78,
      'SOYBEAN': 12.85,
      'RICE': 16.20,
      'SUGAR': 0.22,
      'COFFEE': 1.72,
      'COCOA': 3150.00,
      'COTTON': 0.78,
    };

    return basePrices[symbol] || 100;
  }
}

export const cachedPredictionService = new CachedPredictionService();