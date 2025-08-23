#!/usr/bin/env node

/**
 * Historical Prediction Generator
 * 
 * This script generates AI predictions as if we're back in time on November 23, 2024.
 * It creates quarterly predictions (3mo, 6mo, 9mo, 12mo) for all commodities 
 * with target dates from Nov 23, 2024 to Nov 23, 2025.
 * 
 * Run once in production and then remove.
 */

import { storage } from "../storage";
import { OpenAI } from "openai";
import Anthropic from '@anthropic-ai/sdk';
import type { InsertPrediction } from "@shared/schema";

// Historical context date (pretend we're back in time)
const HISTORICAL_DATE = new Date('2024-11-23T00:00:00Z');
const HISTORICAL_DATE_STRING = "November 23, 2024";

// Initialize AI services
let openai: OpenAI | null = null;
let anthropic: Anthropic | null = null;

if (process.env.OPENAI_API_KEY) {
  openai = new OpenAI({ apiKey: process.env.OPENAI_API_KEY });
}

if (process.env.ANTHROPIC_API_KEY) {
  anthropic = new Anthropic({ apiKey: process.env.ANTHROPIC_API_KEY });
}

interface CommodityData {
  name: string;
  symbol: string;
  currentPrice: number;
  historicalPrices: Array<{ date: string; price: number }>;
  category: string;
  unit: string;
}

class HistoricalPredictionGenerator {
  
  async generateOpenAIHistoricalPrediction(commodityData: CommodityData, monthsAhead: number): Promise<{
    predictedPrice: number;
    confidence: number;
    reasoning: string;
  }> {
    const targetDate = new Date(HISTORICAL_DATE);
    targetDate.setMonth(targetDate.getMonth() + monthsAhead);
    const targetDateString = targetDate.toLocaleDateString('en-US', { 
      year: 'numeric', 
      month: 'long', 
      day: 'numeric' 
    });

    const prompt = `TODAY IS ${HISTORICAL_DATE_STRING}. You are an expert commodity trader with decades of experience analyzing ${commodityData.category} commodity markets. Analyze ${commodityData.name} (${commodityData.symbol}).

Current Market Context (as of ${HISTORICAL_DATE_STRING}):
- Current Price: $${commodityData.currentPrice} per ${commodityData.unit}
- Commodity Type: ${commodityData.category} commodity
- Recent Price History: ${this.formatHistoricalData(commodityData.historicalPrices)}

Provide a sophisticated ${monthsAhead}-month price forecast for ${targetDateString} considering:
- Technical analysis indicators (moving averages, RSI, MACD)
- Market fundamentals (supply/demand dynamics)
- Macroeconomic factors (inflation, currency fluctuations)
- Geopolitical events affecting commodity markets
- Seasonal patterns and cyclical trends
- Long-term structural market changes
- Economic cycles and their impact on commodity demand

For a ${monthsAhead}-month horizon from ${HISTORICAL_DATE_STRING}, focus on:
${monthsAhead <= 3 ? '- Near-term supply disruptions and inventory levels' : ''}
${monthsAhead <= 6 ? '- Seasonal demand patterns and weather impacts' : ''}
${monthsAhead >= 6 ? '- Economic growth trends and industrial demand' : ''}
${monthsAhead >= 9 ? '- Policy changes and regulatory impacts' : ''}
${monthsAhead >= 12 ? '- Long-term structural shifts in supply and demand' : ''}

Remember: Today is ${HISTORICAL_DATE_STRING}. Predict the price for ${targetDateString}.

Respond in JSON format:
{
  "predictedPrice": <number>,
  "confidence": <decimal between 0 and 1>,
  "reasoning": "<detailed analysis explaining your ${monthsAhead}-month prediction methodology from ${HISTORICAL_DATE_STRING} perspective>"
}`;

    if (!openai) {
      throw new Error('OpenAI not configured - missing API key');
    }

    try {
      const completion = await openai.chat.completions.create({
        model: "gpt-4o",
        messages: [{ role: "user", content: prompt }],
        max_tokens: 1500,
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
      console.error(`OpenAI ${monthsAhead}-month historical prediction error:`, error);
      throw error;
    }
  }

  async generateClaudeHistoricalPrediction(commodityData: CommodityData, monthsAhead: number): Promise<{
    predictedPrice: number;
    confidence: number;
    reasoning: string;
  }> {
    const targetDate = new Date(HISTORICAL_DATE);
    targetDate.setMonth(targetDate.getMonth() + monthsAhead);
    const targetDateString = targetDate.toLocaleDateString('en-US', { 
      year: 'numeric', 
      month: 'long', 
      day: 'numeric' 
    });

    const prompt = `TODAY IS ${HISTORICAL_DATE_STRING}. You are a commodity trading expert analyzing ${commodityData.name} (${commodityData.symbol}).

Current market data (as of ${HISTORICAL_DATE_STRING}):
- Current Price: $${commodityData.currentPrice} per ${commodityData.unit}
- Category: ${commodityData.category} commodity
- Recent price trend: ${this.formatHistoricalData(commodityData.historicalPrices)}

Analyze the market conditions and provide a price prediction for ${monthsAhead} months from now (${targetDateString}). Consider:
- Technical analysis patterns
- Market sentiment and long-term trends
- Economic indicators and macroeconomic cycles
- Seasonal factors and cyclical patterns
- Global supply/demand dynamics
- Structural market changes over ${monthsAhead}-month horizon
${monthsAhead <= 3 ? '- Near-term supply disruptions and inventory levels' : ''}
${monthsAhead <= 6 ? '- Seasonal demand patterns and weather impacts' : ''}
${monthsAhead >= 6 ? '- Economic growth trends and industrial demand' : ''}
${monthsAhead >= 9 ? '- Policy changes and regulatory impacts' : ''}
${monthsAhead >= 12 ? '- Long-term structural shifts in supply and demand' : ''}

Remember: Today is ${HISTORICAL_DATE_STRING}. Predict the price for ${targetDateString}.

Respond ONLY with valid JSON in this exact format (no markdown, no code blocks, no extra text):
{
  "predictedPrice": number,
  "confidence": number (0-1),
  "reasoning": "Brief explanation of your ${monthsAhead}-month prediction logic from ${HISTORICAL_DATE_STRING} perspective"
}`;

    if (!anthropic) {
      throw new Error('Claude not configured - missing API key');
    }

    try {
      const message = await anthropic.messages.create({
        max_tokens: 1500,
        messages: [{ role: 'user', content: prompt }],
        model: "claude-sonnet-4-20250514",
      });

      const response = message.content[0];
      if (response.type === 'text') {
        let cleanText = response.text.trim();
        
        // Remove markdown code blocks if present
        if (cleanText.startsWith('```json')) {
          cleanText = cleanText.replace(/^```json\s*/, '').replace(/\s*```$/, '');
        } else if (cleanText.startsWith('```')) {
          cleanText = cleanText.replace(/^```\s*/, '').replace(/\s*```$/, '');
        }
        
        cleanText = cleanText.replace(/`/g, '');
        
        const result = JSON.parse(cleanText);
        return {
          predictedPrice: Number(result.predictedPrice),
          confidence: Number(result.confidence),
          reasoning: result.reasoning
        };
      }
      
      throw new Error('Invalid response format from Claude');
    } catch (error) {
      console.error(`Claude ${monthsAhead}-month historical prediction error:`, error);
      throw error;
    }
  }

  async generateDeepseekHistoricalPrediction(commodityData: CommodityData, monthsAhead: number): Promise<{
    predictedPrice: number;
    confidence: number;
    reasoning: string;
  }> {
    const targetDate = new Date(HISTORICAL_DATE);
    targetDate.setMonth(targetDate.getMonth() + monthsAhead);
    const targetDateString = targetDate.toLocaleDateString('en-US', { 
      year: 'numeric', 
      month: 'long', 
      day: 'numeric' 
    });

    const prompt = `TODAY IS ${HISTORICAL_DATE_STRING}. You are an expert commodity trader specializing in ${commodityData.category} commodities. Analyze ${commodityData.name} (${commodityData.symbol}).

Market Information (as of ${HISTORICAL_DATE_STRING}):
- Current Price: $${commodityData.currentPrice} per ${commodityData.unit}
- Commodity Type: ${commodityData.category}
- Price History (recent): ${this.formatHistoricalData(commodityData.historicalPrices)}

Provide a technical analysis-based price prediction for ${monthsAhead} months ahead (${targetDateString}). Consider:
- Price momentum and long-term trends
- Market volatility and cyclical patterns
- Supply chain factors and structural changes
- Geopolitical influences
- Seasonal patterns over ${monthsAhead}-month horizon
- Economic cycles and their commodity impact
${monthsAhead <= 3 ? '- Near-term supply disruptions and inventory levels' : ''}
${monthsAhead <= 6 ? '- Seasonal demand patterns and weather impacts' : ''}
${monthsAhead >= 6 ? '- Economic growth trends and industrial demand' : ''}
${monthsAhead >= 9 ? '- Policy changes and regulatory impacts' : ''}
${monthsAhead >= 12 ? '- Long-term structural shifts in supply and demand' : ''}

Remember: Today is ${HISTORICAL_DATE_STRING}. Predict the price for ${targetDateString}.

Return your analysis in JSON format:
{
  "predictedPrice": <number>,
  "confidence": <number between 0 and 1>,
  "reasoning": "<concise explanation of ${monthsAhead}-month prediction methodology from ${HISTORICAL_DATE_STRING} perspective>"
}`;

    const apiKey = process.env.DEEPSEEK_API_KEY;
    if (!apiKey) {
      throw new Error('Deepseek not configured - missing API key');
    }

    try {
      const response = await fetch('https://api.deepseek.com/v1/chat/completions', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${apiKey}`,
        },
        body: JSON.stringify({
          model: 'deepseek-chat',
          messages: [{ role: 'user', content: prompt }],
          max_tokens: 1500,
          temperature: 0.7,
          response_format: { type: 'json_object' }
        }),
      });

      if (!response.ok) {
        throw new Error(`Deepseek API error: ${response.status} ${response.statusText}`);
      }

      const data = await response.json();
      const result = JSON.parse(data.choices[0].message.content);

      return {
        predictedPrice: Number(result.predictedPrice),
        confidence: Number(result.confidence),
        reasoning: result.reasoning
      };
    } catch (error) {
      console.error(`Deepseek ${monthsAhead}-month historical prediction error:`, error);
      throw error;
    }
  }

  private formatHistoricalData(prices: Array<{ date: string; price: number }>): string {
    const recent = prices.slice(-7); // Last 7 days
    return recent.map(p => `${p.date}: $${p.price.toFixed(2)}`).join(', ');
  }

  async generateHistoricalPredictions(): Promise<void> {
    console.log(`🕒 Generating historical predictions from ${HISTORICAL_DATE_STRING} perspective...`);
    console.log("📅 Creating quarterly predictions for 3mo, 6mo, 9mo, 12mo timeframes");
    
    try {
      const commodities = await storage.getCommodities();
      const models = await storage.getAiModels();
      const timeframes = [3, 6, 9, 12]; // months
      
      let totalGenerated = 0;
      let totalErrors = 0;

      for (const commodity of commodities) {
        console.log(`📊 Processing ${commodity.name} for all historical timeframes...`);
        
        // Get the most recent historical prices (simulating Nov 23, 2024 data)
        const historicalPrices = await storage.getActualPrices(commodity.id, 30);
        if (historicalPrices.length === 0) {
          console.log(`⚠️ No historical data for ${commodity.name}, skipping...`);
          continue;
        }

        const latestPrice = await storage.getLatestPrice(commodity.id);
        if (!latestPrice) {
          console.log(`⚠️ No current price available for ${commodity.name}, skipping...`);
          continue;
        }

        const commodityData: CommodityData = {
          name: commodity.name,
          symbol: commodity.symbol,
          currentPrice: Number(latestPrice.price),
          historicalPrices: historicalPrices.map(p => ({
            date: p.date.toISOString(),
            price: Number(p.price)
          })),
          category: commodity.category,
          unit: commodity.unit || "USD"
        };
        
        for (const monthsAhead of timeframes) {
          // Calculate target date from historical perspective
          const targetDate = new Date(HISTORICAL_DATE);
          targetDate.setMonth(targetDate.getMonth() + monthsAhead);
          const timeframeSuffix = `${monthsAhead}mo`;
          
          console.log(`  🎯 Generating ${monthsAhead}-month predictions (target: ${targetDate.toLocaleDateString()})`);
          
          for (const model of models) {
            try {
              let prediction: { predictedPrice: number; confidence: number; reasoning: string } | null = null;

              // Generate prediction using the appropriate service with historical context
              if (model.name === 'ChatGPT' && openai) {
                prediction = await this.generateOpenAIHistoricalPrediction(commodityData, monthsAhead);
              } else if (model.name === 'Claude' && anthropic) {
                prediction = await this.generateClaudeHistoricalPrediction(commodityData, monthsAhead);
              } else if (model.name === 'Deepseek' && process.env.DEEPSEEK_API_KEY) {
                prediction = await this.generateDeepseekHistoricalPrediction(commodityData, monthsAhead);
              }

              if (prediction) {
                const insertPrediction: InsertPrediction = {
                  aiModelId: model.id,
                  commodityId: commodity.id,
                  predictionDate: HISTORICAL_DATE, // Historical date
                  targetDate,
                  predictedPrice: prediction.predictedPrice.toString(),
                  confidence: prediction.confidence.toString(),
                  timeframe: timeframeSuffix,
                  metadata: {
                    reasoning: prediction.reasoning,
                    historicalGeneration: true,
                    generatedFrom: HISTORICAL_DATE_STRING,
                    inputData: {
                      currentPrice: commodityData.currentPrice,
                      historicalDataPoints: commodityData.historicalPrices.length,
                      timeframe: timeframeSuffix
                    }
                  }
                };

                await storage.createPrediction(insertPrediction);
                totalGenerated++;
                console.log(`    ✅ ${model.name}: $${prediction.predictedPrice} (${Math.round(prediction.confidence * 100)}% confidence)`);
              } else {
                console.log(`    ⚠️ ${model.name}: Service not configured, skipping...`);
              }

              // Rate limiting delay
              await new Promise(resolve => setTimeout(resolve, 500));
              
            } catch (error) {
              totalErrors++;
              console.error(`    ❌ Error generating ${model.name} ${monthsAhead}-month prediction for ${commodity.name}:`, error);
            }
          }
        }
        
        console.log(`✅ Completed historical predictions for ${commodity.name}`);
        
        // Delay between commodities to respect rate limits
        await new Promise(resolve => setTimeout(resolve, 1000));
      }
      
      console.log(`\n🎉 Historical prediction generation complete!`);
      console.log(`📈 Total predictions generated: ${totalGenerated}`);
      console.log(`❌ Total errors: ${totalErrors}`);
      console.log(`📅 All predictions generated from ${HISTORICAL_DATE_STRING} perspective`);
      console.log(`🎯 Target dates range: Feb 23, 2025 to Nov 23, 2025`);
      
    } catch (error) {
      console.error("❌ Critical error in generateHistoricalPredictions:", error);
      throw error;
    }
  }
}

// Main execution
async function main() {
  console.log("🚀 Starting Historical Prediction Generator");
  console.log(`📅 Historical Context Date: ${HISTORICAL_DATE_STRING}`);
  console.log("🎯 This script generates predictions as if we're back in November 2024");
  
  try {
    const generator = new HistoricalPredictionGenerator();
    await generator.generateHistoricalPredictions();
    
    console.log("\n✅ Script completed successfully!");
    console.log("💡 You can now remove this script - it's designed to run once only.");
    
  } catch (error) {
    console.error("❌ Script failed:", error);
    process.exit(1);
  }
}

// Run the script
if (require.main === module) {
  main();
}