import OpenAI from "openai";
import { db } from "../db";
import { commodities, predictions as predictionsTable, actualPrices, aiModels } from "@shared/schema";
import { eq, desc, and, gte } from "drizzle-orm";
import { claudeService } from "./claudeService";
import { deepseekService } from "./deepseekService";

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
    
    // Check which AI services are available
    const availableServices = {
      openai: !!process.env.OPENAI_API_KEY,
      claude: claudeService.isConfigured(),
      deepseek: deepseekService.isConfigured()
    };
    
    const activeServices = Object.entries(availableServices).filter(([_, active]) => active).map(([name]) => name);
    
    if (activeServices.length === 0) {
      console.log("No AI API keys configured, skipping AI predictions");
      return;
    }
    
    console.log(`Available AI services: ${activeServices.join(', ')}`);
    
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
          // Only generate predictions for models we have API keys for
          const modelName = aiModel.name.toLowerCase();
          if (availableServices.openai && modelName.includes('gpt')) {
            await this.generateCommodityPredictions(commodity, aiModel, 'openai');
          } else if (availableServices.claude && modelName.includes('claude')) {
            await this.generateCommodityPredictions(commodity, aiModel, 'claude');
          } else if (availableServices.deepseek && modelName.includes('deepseek')) {
            await this.generateCommodityPredictions(commodity, aiModel, 'deepseek');
          }
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
  private async generateCommodityPredictions(commodity: any, aiModel: any, service: 'openai' | 'claude' | 'deepseek'): Promise<void> {
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
        .map(p => ({ 
          date: p.date.toISOString().split('T')[0], 
          price: parseFloat(p.price) 
        }));

      const currentPrice = historicalData[historicalData.length - 1]?.price || 100;

      // Get prediction using the specified service
      let predictionResult;
      
      try {
        if (service === 'openai') {
          predictionResult = await this.generateOpenAIPrediction({
            name: commodity.name,
            symbol: commodity.symbol,
            currentPrice,
            historicalPrices: historicalData,
            category: commodity.category,
            unit: commodity.unit
          });
        } else if (service === 'claude') {
          predictionResult = await claudeService.generatePrediction({
            name: commodity.name,
            symbol: commodity.symbol,
            currentPrice,
            historicalPrices: historicalData,
            category: commodity.category,
            unit: commodity.unit
          });
        } else if (service === 'deepseek') {
          predictionResult = await deepseekService.generatePrediction({
            name: commodity.name,
            symbol: commodity.symbol,
            currentPrice,
            historicalPrices: historicalData,
            category: commodity.category,
            unit: commodity.unit
          });
        } else {
          throw new Error(`Unsupported AI service: ${service}`);
        }

        // Generate predictions for next 7 days
        for (let daysAhead = 1; daysAhead <= 7; daysAhead++) {
          const predictionDate = new Date();
          predictionDate.setDate(predictionDate.getDate() + daysAhead);

          await db.insert(predictionsTable).values({
            commodityId: commodity.id,
            aiModelId: aiModel.id,
            predictionDate: predictionDate,
            targetDate: predictionDate,
            predictedPrice: predictionResult.predictedPrice.toString(),
            confidence: predictionResult.confidence.toString(),
            metadata: { reasoning: predictionResult.reasoning }
          }).onConflictDoUpdate({
            target: [predictionsTable.commodityId, predictionsTable.aiModelId, predictionsTable.targetDate],
            set: {
              predictedPrice: predictionResult.predictedPrice.toString(),
              confidence: predictionResult.confidence.toString(),
              metadata: { reasoning: predictionResult.reasoning }
            }
          });
        }

        console.log(`Generated ${service} predictions for ${commodity.name} using ${aiModel.name}`);
      } catch (error) {
        console.error(`Error generating ${service} prediction for ${commodity.name}:`, error);
      }
    } catch (error) {
      console.error(`Error generating predictions for ${commodity.name}:`, error);
    }
  }

  /**
   * Generate OpenAI prediction for a commodity
   */
  private async generateOpenAIPrediction(commodityData: {
    name: string;
    symbol: string;
    currentPrice: number;
    historicalPrices: Array<{ date: string; price: number }>;
    category: string;
    unit: string;
  }): Promise<{
    predictedPrice: number;
    confidence: number;
    reasoning: string;
  }> {
    const openai = getOpenAIClient();
    
    const prompt = `You are a commodity trading expert analyzing ${commodityData.name} (${commodityData.symbol}).

Current market data:
- Current Price: $${commodityData.currentPrice} per ${commodityData.unit}
- Category: ${commodityData.category} commodity
- Recent price trend: ${this.formatHistoricalData(commodityData.historicalPrices)}

Analyze the market conditions and provide a price prediction for one week from now. Consider:
- Technical analysis patterns
- Market sentiment and momentum
- Economic indicators
- Supply/demand fundamentals
- Seasonal factors

Respond in JSON format:
{
  "predictedPrice": number,
  "confidence": number (0-1),
  "reasoning": "Brief explanation of your prediction methodology"
}`;

    try {
      const response = await openai.chat.completions.create({
        model: "gpt-4o",
        messages: [
          {
            role: "system",
            content: "You are an expert commodity trader. Provide accurate, data-driven price predictions in JSON format."
          },
          {
            role: "user",
            content: prompt
          }
        ],
        response_format: { type: "json_object" },
        temperature: 0.7
      });

      const result = JSON.parse(response.choices[0].message.content || '{}');
      
      return {
        predictedPrice: Number(result.predictedPrice),
        confidence: Number(result.confidence),
        reasoning: result.reasoning
      };
    } catch (error) {
      console.error('OpenAI prediction error:', error);
      throw error;
    }
  }

  /**
   * Format historical data for AI analysis
   */
  private formatHistoricalData(prices: Array<{ date: string; price: number }>): string {
    const recent = prices.slice(-7); // Last 7 days
    return recent.map(p => `${p.date}: $${p.price.toFixed(2)}`).join(', ');
  }

  /**
   * Generate manual predictions for testing (when API keys are not available)
   */
  async generateManualPrediction(commodityId: string, aiModelId: string): Promise<void> {
    try {
      const commodity = await db.select().from(commodities).where(eq(commodities.id, commodityId)).limit(1);
      const aiModel = await db.select().from(aiModels).where(eq(aiModels.id, aiModelId)).limit(1);
      
      if (!commodity[0] || !aiModel[0]) {
        throw new Error('Commodity or AI model not found');
      }

      const modelName = aiModel[0].name.toLowerCase();
      let service: 'openai' | 'claude' | 'deepseek' = 'openai';
      
      if (modelName.includes('claude')) service = 'claude';
      else if (modelName.includes('deepseek')) service = 'deepseek';
      
      await this.generateCommodityPredictions(commodity[0], aiModel[0], service);
    } catch (error) {
      console.error('Error generating manual prediction:', error);
      throw error;
    }
  }
}

export const aiPredictionService = new AIPredictionService();