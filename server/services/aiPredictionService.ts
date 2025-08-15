import OpenAI from "openai";
import { db } from "../db";
import { commodities, predictions as predictionsTable, actualPrices, aiModels } from "@shared/schema";
import { eq, desc, and, gte } from "drizzle-orm";

// the newest OpenAI model is "gpt-4o" which was released May 13, 2024. do not change this unless explicitly requested by the user
let openai: OpenAI | null = null;

function getOpenAIClient(): OpenAI {
  if (!openai) {
    if (!process.env.OPENAI_API_KEY) {
      throw new Error("OpenAI API key not available");
    }
    openai = new OpenAI({ 
      apiKey: process.env.OPENAI_API_KEY,
    });
  }
  return openai;
}

export class AIPredictionService {
  /**
   * Generate weekly predictions for all commodities using AI models
   */
  async generateWeeklyPredictions(): Promise<void> {
    console.log("Starting weekly AI prediction generation...");
    
    if (!process.env.OPENAI_API_KEY) {
      console.log("OpenAI API key not found, skipping AI predictions");
      return;
    }

    try {
      // Get all active commodities and AI models
      const [allCommodities, allAiModels] = await Promise.all([
        db.select().from(commodities),
        db.select().from(aiModels).where(eq(aiModels.isActive, 1))
      ]);

      console.log(`Generating predictions for ${allCommodities.length} commodities using ${allAiModels.length} AI models`);

      // Generate predictions for each commodity with each AI model
      for (const commodity of allCommodities) {
        for (const aiModel of allAiModels) {
          await this.generateCommodityPredictions(commodity, aiModel);
        }
      }

      console.log("Weekly AI prediction generation completed successfully");
    } catch (error) {
      console.error("Error generating weekly predictions:", error);
    }
  }

  /**
   * Generate 7-day future predictions for a specific commodity and AI model
   */
  private async generateCommodityPredictions(commodity: any, aiModel: any): Promise<void> {
    try {
      // Get recent price history for context
      const recentPrices = await db
        .select()
        .from(actualPrices)
        .where(eq(actualPrices.commodityId, commodity.id))
        .orderBy(desc(actualPrices.date))
        .limit(30);

      if (recentPrices.length === 0) {
        console.log(`No historical data found for ${commodity.name}, skipping predictions`);
        return;
      }

      // Prepare historical data for AI analysis
      const historicalData = recentPrices
        .reverse()
        .map(price => ({
          date: price.date.toISOString().split('T')[0],
          price: parseFloat(price.price),
          volume: price.volume ? parseFloat(price.volume) : null
        }));

      // Generate predictions for the next 7 days
      const aiPredictions = await this.generateAIPredictions(commodity, aiModel, historicalData);

      // Store predictions in database
      const predictionDate = new Date();
      const insertPromises = aiPredictions.map((prediction, index) => {
        const targetDate = new Date();
        targetDate.setDate(targetDate.getDate() + index + 1); // Next 7 days

        return db.insert(predictionsTable).values({
          aiModelId: aiModel.id,
          commodityId: commodity.id,
          predictionDate,
          targetDate,
          predictedPrice: prediction.price.toString(),
          confidence: prediction.confidence.toString(),
          metadata: {
            reasoning: prediction.reasoning,
            marketFactors: prediction.marketFactors,
            generatedAt: new Date().toISOString()
          }
        });
      });

      await Promise.all(insertPromises);
      console.log(`Generated 7-day predictions for ${commodity.name} using ${aiModel.name}`);

    } catch (error) {
      console.error(`Error generating predictions for ${commodity.name} with ${aiModel.name}:`, error);
    }
  }

  /**
   * Use AI to generate price predictions based on historical data
   */
  private async generateAIPredictions(commodity: any, aiModel: any, historicalData: any[]): Promise<any[]> {
    const latestPrice = historicalData[historicalData.length - 1];
    const priceHistory = historicalData.slice(-10).map(d => `${d.date}: $${d.price}`).join('\n');

    const prompt = `You are an expert commodity price analyst. Analyze the following data for ${commodity.name} (${commodity.symbol}) and predict prices for the next 7 days.

Recent Price History:
${priceHistory}

Latest Price: $${latestPrice.price}
Commodity Category: ${commodity.category}
Market Unit: ${commodity.unit}

Please provide predictions for the next 7 days with:
1. Predicted price for each day
2. Confidence level (0-100%)
3. Brief reasoning for each prediction
4. Key market factors considered

Respond in JSON format with this structure:
{
  "predictions": [
    {
      "day": 1,
      "price": number,
      "confidence": number,
      "reasoning": "string",
      "marketFactors": ["factor1", "factor2"]
    }
  ]
}

Consider factors like:
- Recent price trends and volatility
- Seasonal patterns for ${commodity.category} commodities
- Global economic conditions
- Supply chain factors
- Market sentiment
- Technical analysis patterns

Be realistic and base predictions on actual market dynamics.`;

    try {
      const response = await getOpenAIClient().chat.completions.create({
        model: "gpt-4o",
        messages: [
          {
            role: "system",
            content: `You are ${aiModel.name}, an AI model specialized in commodity price prediction. Provide accurate, data-driven predictions based on market analysis.`
          },
          {
            role: "user",
            content: prompt
          }
        ],
        response_format: { type: "json_object" },
        temperature: 0.1, // Low temperature for more consistent predictions
      });

      const content = response.choices[0].message.content;
      if (!content) {
        throw new Error("No content received from OpenAI");
      }
      
      const result = JSON.parse(content);
      return result.predictions.map((pred: any) => ({
        price: pred.price,
        confidence: pred.confidence,
        reasoning: pred.reasoning,
        marketFactors: pred.marketFactors
      }));

    } catch (error) {
      console.error("Error calling OpenAI API:", error);
      // Return fallback predictions based on simple trend analysis
      return this.generateFallbackPredictions(historicalData);
    }
  }

  /**
   * Generate simple trend-based predictions as fallback
   */
  private generateFallbackPredictions(historicalData: any[]): any[] {
    const recentPrices = historicalData.slice(-5).map(d => d.price);
    const avgPrice = recentPrices.reduce((sum, price) => sum + price, 0) / recentPrices.length;
    const trend = (recentPrices[recentPrices.length - 1] - recentPrices[0]) / recentPrices.length;

    return Array.from({ length: 7 }, (_, index) => ({
      price: Math.max(0, avgPrice + (trend * (index + 1))),
      confidence: 60, // Lower confidence for fallback
      reasoning: "Trend-based prediction (API unavailable)",
      marketFactors: ["Recent price trend", "Historical average"]
    }));
  }

  /**
   * Get future predictions for a specific commodity
   */
  async getFuturePredictions(commodityId: string, days: number = 7): Promise<any[]> {
    const futureDate = new Date();
    futureDate.setDate(futureDate.getDate() + days);

    const futurePredictions = await db
      .select({
        prediction: predictionsTable,
        aiModel: aiModels
      })
      .from(predictionsTable)
      .leftJoin(aiModels, eq(predictionsTable.aiModelId, aiModels.id))
      .where(
        and(
          eq(predictionsTable.commodityId, commodityId),
          gte(predictionsTable.targetDate, new Date())
        )
      )
      .orderBy(predictionsTable.targetDate);

    return futurePredictions;
  }

  /**
   * Get chart data including both historical and future predictions
   */
  async getChartDataWithPredictions(commodityId: string, period: string = "1mo"): Promise<any> {
    // Get historical prices
    const daysBack = this.getPeriodDays(period);
    const startDate = new Date();
    startDate.setDate(startDate.getDate() - daysBack);

    const [historicalPrices, futurePredictions] = await Promise.all([
      db
        .select()
        .from(actualPrices)
        .where(
          and(
            eq(actualPrices.commodityId, commodityId),
            gte(actualPrices.date, startDate)
          )
        )
        .orderBy(actualPrices.date),
      this.getFuturePredictions(commodityId)
    ]);

    // Combine historical and prediction data
    const chartData: any[] = [];

    // Add historical data points
    historicalPrices.forEach(price => {
      chartData.push({
        date: price.date.toISOString().split('T')[0],
        actualPrice: parseFloat(price.price),
        type: 'historical'
      });
    });

    // Group predictions by date and AI model
    const predictionsByDate = new Map<string, any>();
    futurePredictions.forEach(({ prediction, aiModel }) => {
      if (!prediction || !aiModel) return;
      
      const dateKey = prediction.targetDate.toISOString().split('T')[0];
      if (!predictionsByDate.has(dateKey)) {
        predictionsByDate.set(dateKey, {
          date: dateKey,
          type: 'prediction',
          predictions: {}
        });
      }
      predictionsByDate.get(dateKey)!.predictions[aiModel.name] = parseFloat(prediction.predictedPrice);
    });

    // Add prediction data points
    predictionsByDate.forEach(predictionData => {
      chartData.push(predictionData);
    });

    return {
      chartData: chartData.sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime()),
      lastUpdate: new Date().toISOString()
    };
  }

  private getPeriodDays(period: string): number {
    const periodMap: Record<string, number> = {
      '1w': 7,
      '1mo': 30,
      '3mo': 90,
      '6mo': 180,
      '1y': 365
    };
    return periodMap[period] || 30;
  }
}

export const aiPredictionService = new AIPredictionService();