import { storage } from "../storage";
import { claudeService } from "./claudeService";
import { deepseekService } from "./deepseekService";
import { yahooFinanceIntegration } from "./yahooFinanceIntegration";
import { OpenAI } from "openai";
import type { InsertPrediction } from "@shared/schema";

let openai: OpenAI | null = null;

// Initialize OpenAI only if API key is available
if (process.env.OPENAI_API_KEY) {
  openai = new OpenAI({
    apiKey: process.env.OPENAI_API_KEY,
  });
}

interface CommodityData {
  name: string;
  symbol: string;
  currentPrice: number;
  historicalPrices: Array<{ date: string; price: number }>;
  category: string;
  unit: string;
}

export class AIPredictionService {
  
  isOpenAIConfigured(): boolean {
    return !!process.env.OPENAI_API_KEY && !!openai;
  }
  
  async generateOpenAIPrediction(commodityData: CommodityData): Promise<{
    predictedPrice: number;
    confidence: number;
    reasoning: string;
  }> {
    const prompt = `You are an expert commodity trader with decades of experience analyzing ${commodityData.category} commodity markets. Analyze ${commodityData.name} (${commodityData.symbol}).

Current Market Context:
- Current Price: $${commodityData.currentPrice} per ${commodityData.unit}
- Commodity Type: ${commodityData.category} commodity
- Recent Price History: ${this.formatHistoricalData(commodityData.historicalPrices)}

Provide a sophisticated 7-day price forecast considering:
- Technical analysis indicators (moving averages, RSI, MACD)
- Market fundamentals (supply/demand dynamics)
- Macroeconomic factors (inflation, currency fluctuations)
- Geopolitical events affecting commodity markets
- Seasonal patterns and cyclical trends

Respond in JSON format:
{
  "predictedPrice": <number>,
  "confidence": <decimal between 0 and 1>,
  "reasoning": "<detailed analysis explaining your prediction methodology>"
}`;

    if (!openai) {
      throw new Error('OpenAI not configured - missing API key');
    }

    try {
      const completion = await openai.chat.completions.create({
        model: "gpt-4o",
        messages: [
          {
            role: "user",
            content: prompt
          }
        ],
        max_tokens: 1000,
        temperature: 0.7,
        response_format: { type: "json_object" }
      });

      const response = completion.choices[0].message.content;
      if (!response) {
        throw new Error('No response from OpenAI');
      }

      const result = JSON.parse(response);
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

  private formatHistoricalData(prices: Array<{ date: string; price: number }>): string {
    const recent = prices.slice(-7); // Last 7 days
    return recent.map(p => `${p.date}: $${p.price.toFixed(2)}`).join(', ');
  }

  async generatePredictionsForCommodity(commodityId: string): Promise<void> {
    console.log(`Generating AI predictions for commodity ${commodityId}...`);
    
    try {
      const commodity = await storage.getCommodity(commodityId);
      if (!commodity) {
        console.error(`Commodity ${commodityId} not found`);
        return;
      }

      // Get historical prices for context
      const historicalPrices = await storage.getActualPrices(commodityId, 30);
      if (historicalPrices.length === 0) {
        console.log(`No historical data for ${commodity.name}, fetching from Yahoo Finance...`);
        await yahooFinanceIntegration.updateSingleCommodityPrices(commodityId);
        // Try again after fetching
        const newHistoricalPrices = await storage.getActualPrices(commodityId, 30);
        if (newHistoricalPrices.length === 0) {
          console.error(`Still no historical data for ${commodity.name}, skipping predictions`);
          return;
        }
      }

      const latestPrice = await storage.getLatestPrice(commodityId);
      if (!latestPrice) {
        console.error(`No current price available for ${commodity.name}`);
        return;
      }

      const commodityData: CommodityData = {
        name: commodity.name,
        symbol: commodity.symbol,
        currentPrice: parseFloat(latestPrice.price),
        historicalPrices: historicalPrices.map(p => ({
          date: p.date.toISOString().split('T')[0],
          price: parseFloat(p.price)
        })),
        category: commodity.category,
        unit: commodity.unit || "USD"
      };

      // Get AI models
      const aiModels = await storage.getAiModels();
      const targetDate = new Date();
      targetDate.setDate(targetDate.getDate() + 7); // 7 days from now

      // Generate predictions for each AI model
      for (const model of aiModels) {
        try {
          let prediction;
          
          switch (model.name.toLowerCase()) {
            case 'claude':
              if (claudeService.isConfigured()) {
                prediction = await claudeService.generatePrediction(commodityData);
              }
              break;
            case 'chatgpt':
              if (this.isOpenAIConfigured()) {
                prediction = await this.generateOpenAIPrediction(commodityData);
              }
              break;
            case 'deepseek':
              if (deepseekService.isConfigured()) {
                prediction = await deepseekService.generatePrediction(commodityData);
              }
              break;
          }

          if (prediction) {
            const insertPrediction: InsertPrediction = {
              aiModelId: model.id,
              commodityId: commodity.id,
              predictionDate: new Date(),
              targetDate,
              predictedPrice: prediction.predictedPrice.toString(),
              confidence: prediction.confidence.toString(),
              metadata: {
                reasoning: prediction.reasoning,
                inputData: {
                  currentPrice: commodityData.currentPrice,
                  historicalDataPoints: commodityData.historicalPrices.length
                }
              }
            };

            await storage.createPrediction(insertPrediction);
            console.log(`Generated ${model.name} prediction for ${commodity.name}: $${prediction.predictedPrice} (confidence: ${prediction.confidence})`);
          } else {
            console.log(`Skipped ${model.name} prediction for ${commodity.name} - service not configured`);
          }
        } catch (error) {
          console.error(`Error generating ${model.name} prediction for ${commodity.name}:`, error);
        }
      }
      
      console.log(`Completed AI predictions for ${commodity.name}`);
    } catch (error) {
      console.error(`Error in generatePredictionsForCommodity for ${commodityId}:`, error);
    }
  }

  async generateWeeklyPredictions(): Promise<void> {
    console.log("Starting weekly AI prediction generation for all commodities...");
    
    try {
      const commodities = await storage.getCommodities();
      
      for (const commodity of commodities) {
        await this.generatePredictionsForCommodity(commodity.id);
        
        // Add small delay between commodities to respect rate limits
        await new Promise(resolve => setTimeout(resolve, 2000));
      }
      
      console.log("Completed weekly AI prediction generation for all commodities");
    } catch (error) {
      console.error("Error in generateWeeklyPredictions:", error);
    }
  }

  async generateDailyPredictions(): Promise<void> {
    console.log("Starting daily AI prediction generation for all commodities...");
    
    try {
      // First update all commodity prices from Yahoo Finance
      await yahooFinanceIntegration.updateAllCommodityPrices();
      
      // Then generate predictions for all commodities
      await this.generateWeeklyPredictions();
      
      console.log("Completed daily AI prediction generation");
    } catch (error) {
      console.error("Error in generateDailyPredictions:", error);
    }
  }

  async isAnyServiceConfigured(): Promise<boolean> {
    return !!(process.env.OPENAI_API_KEY || process.env.ANTHROPIC_API_KEY || process.env.DEEPSEEK_API_KEY);
  }

  async generateManualPrediction(commodityId: string, aiModelId: string): Promise<void> {
    console.log(`Generating manual prediction for commodity ${commodityId} with model ${aiModelId}...`);
    
    try {
      const commodity = await storage.getCommodity(commodityId);
      const aiModel = await storage.getAiModel(aiModelId);
      
      if (!commodity || !aiModel) {
        throw new Error('Commodity or AI model not found');
      }

      // Get historical prices for context
      const historicalPrices = await storage.getActualPrices(commodityId, 30);
      if (historicalPrices.length === 0) {
        console.log(`No historical data for ${commodity.name}, fetching from Yahoo Finance...`);
        await yahooFinanceIntegration.updateSingleCommodityPrices(commodityId);
      }

      const latestPrice = await storage.getLatestPrice(commodityId);
      if (!latestPrice) {
        throw new Error(`No current price available for ${commodity.name}`);
      }

      const commodityData: CommodityData = {
        name: commodity.name,
        symbol: commodity.symbol,
        currentPrice: parseFloat(latestPrice.price),
        historicalPrices: historicalPrices.map(p => ({
          date: p.date.toISOString().split('T')[0],
          price: parseFloat(p.price)
        })),
        category: commodity.category,
        unit: commodity.unit || "USD"
      };

      const targetDate = new Date();
      targetDate.setDate(targetDate.getDate() + 7);

      let prediction;
      
      switch (aiModel.name.toLowerCase()) {
        case 'claude':
          if (claudeService.isConfigured()) {
            prediction = await claudeService.generatePrediction(commodityData);
          }
          break;
        case 'chatgpt':
          if (this.isOpenAIConfigured()) {
            prediction = await this.generateOpenAIPrediction(commodityData);
          }
          break;
        case 'deepseek':
          if (deepseekService.isConfigured()) {
            prediction = await deepseekService.generatePrediction(commodityData);
          }
          break;
      }

      if (prediction) {
        const insertPrediction: InsertPrediction = {
          aiModelId: aiModel.id,
          commodityId: commodity.id,
          predictionDate: new Date(),
          targetDate,
          predictedPrice: prediction.predictedPrice.toString(),
          confidence: prediction.confidence.toString(),
          metadata: {
            reasoning: prediction.reasoning,
            inputData: {
              currentPrice: commodityData.currentPrice,
              historicalDataPoints: commodityData.historicalPrices.length
            }
          }
        };

        await storage.createPrediction(insertPrediction);
        console.log(`Generated manual ${aiModel.name} prediction for ${commodity.name}: $${prediction.predictedPrice}`);
      } else {
        throw new Error(`${aiModel.name} service not configured or available`);
      }
    } catch (error) {
      console.error(`Error in generateManualPrediction:`, error);
      throw error;
    }
  }

  async getServiceStatus(): Promise<{ openai: boolean; claude: boolean; deepseek: boolean }> {
    return {
      openai: !!process.env.OPENAI_API_KEY,
      claude: claudeService.isConfigured(),
      deepseek: deepseekService.isConfigured()
    };
  }
}

export const aiPredictionService = new AIPredictionService();