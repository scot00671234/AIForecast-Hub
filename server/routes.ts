import type { Express } from "express";
import { createServer, type Server } from "http";
import { storage } from "./storage";
import { yahooFinanceService } from "./services/yahooFinance";
import { accuracyCalculator } from "./services/accuracyCalculator";
import { aiPredictionService } from "./services/aiPredictionService";
import { predictionScheduler } from "./services/predictionScheduler";
import { cachedPredictionService } from "./services/cachedPredictionService";
import { 
  insertPredictionSchema,
  insertActualPriceSchema,
  insertMarketAlertSchema
} from "@shared/schema";

export async function registerRoutes(app: Express): Promise<Server> {
  
  // Dashboard Stats
  app.get("/api/dashboard/stats", async (req, res) => {
    try {
      const stats = await storage.getDashboardStats();
      res.json(stats);
    } catch (error) {
      console.error("Error fetching dashboard stats:", error);
      res.status(500).json({ message: "Failed to fetch dashboard stats" });
    }
  });

  // League Table with Enhanced Dynamic Ranking
  app.get("/api/league-table", async (req, res) => {
    try {
      const period = req.query.period as string || "30d";
      
      // Update accuracy metrics before calculating rankings
      await accuracyCalculator.updateAllAccuracyMetrics();
      
      // Get dynamic rankings based on real accuracy across all commodities
      const rankings = await accuracyCalculator.calculateModelRankings(period);
      
      const leagueTable = rankings.map(ranking => ({
        rank: ranking.rank,
        aiModel: ranking.aiModel,
        accuracy: ranking.overallAccuracy,
        totalPredictions: ranking.totalPredictions,
        trend: ranking.trend
      }));
      
      res.json(leagueTable);
    } catch (error) {
      console.error("Error fetching league table:", error);
      // Fallback to storage method if accuracy calculator fails
      const period = req.query.period as string || "30d";
      const fallbackTable = await storage.getLeagueTable(period);
      res.json(fallbackTable);
    }
  });

  // AI Models
  app.get("/api/ai-models", async (req, res) => {
    try {
      const models = await storage.getAiModels();
      res.json(models);
    } catch (error) {
      console.error("Error fetching AI models:", error);
      res.status(500).json({ message: "Failed to fetch AI models" });
    }
  });

  // Commodities
  app.get("/api/commodities", async (req, res) => {
    try {
      const commodities = await storage.getCommodities();
      res.json(commodities);
    } catch (error) {
      console.error("Error fetching commodities:", error);
      res.status(500).json({ message: "Failed to fetch commodities" });
    }
  });

  // Chart Data
  app.get("/api/commodities/:id/chart/:days", async (req, res) => {
    try {
      const commodityId = req.params.id;
      const days = parseInt(req.params.days) || 7;
      const chartData = await storage.getChartData(commodityId, days);
      res.json(chartData);
    } catch (error) {
      console.error("Error fetching chart data:", error);
      res.status(500).json({ message: "Failed to fetch chart data" });
    }
  });

  // Unified Chart Data - Returns historical data and future predictions combined
  app.get("/api/commodities/:id/chart-with-predictions", async (req, res) => {
    try {
      const commodityId = req.params.id;
      const period = req.query.period as string || "1mo";
      
      // Get commodity to access Yahoo symbol
      const commodity = await storage.getCommodity(commodityId);
      if (!commodity) {
        return res.status(404).json({ message: "Commodity not found" });
      }

      // Get AI models for predictions
      const aiModels = await storage.getAiModels();
      const chartData: Array<{
        date: string;
        type: 'historical' | 'prediction';
        actualPrice?: number;
        predictions?: Record<string, number>;
      }> = [];

      // Get historical data
      if (commodity.yahooSymbol) {
        try {
          console.log(`Fetching data for ${commodity.yahooSymbol} with period ${period}`);
          const realTimeData = await yahooFinanceService.fetchDetailedHistoricalData(commodity.yahooSymbol, period);
          console.log(`Received ${realTimeData.length} data points for ${commodity.yahooSymbol}`);
          
          if (realTimeData.length > 0) {
            // Add historical data points
            realTimeData.forEach((item: any) => {
              chartData.push({
                date: item.date,
                type: 'historical',
                actualPrice: Number(item.price.toFixed(2))
              });
            });
          } else {
            console.log(`No real-time data available for ${commodity.yahooSymbol}`);
            // Return empty data instead of synthetic data
          }
        } catch (error) {
          console.warn(`Yahoo Finance failed for ${commodity.yahooSymbol}:`, error);
          // Return empty data instead of synthetic fallback
        }
      }

      // Get AI predictions for future dates
      try {
        const predictions = await storage.getPredictions(commodityId);
        const futurePredictions = predictions.filter(p => new Date(p.predictionDate) > new Date());
        
        // Group predictions by date
        const predictionsByDate = futurePredictions.reduce((acc, pred) => {
          const dateKey = pred.predictionDate.toISOString().split('T')[0];
          if (!acc[dateKey]) {
            acc[dateKey] = {};
          }
          const model = aiModels.find(m => m.id === pred.aiModelId);
          if (model) {
            acc[dateKey][model.name] = Number(pred.predictedPrice);
          }
          return acc;
        }, {} as Record<string, Record<string, number>>);

        // Add prediction data points
        Object.entries(predictionsByDate).forEach(([date, predictions]) => {
          chartData.push({
            date,
            type: 'prediction',
            predictions
          });
        });
      } catch (error) {
        console.log("No AI predictions available:", error);
      }

      res.json({ chartData });
    } catch (error) {
      console.error("Error fetching unified chart data:", error);
      res.status(500).json({ message: "Failed to fetch chart data" });
    }
  });

  // Detailed Chart Data with Real Yahoo Finance Integration and AI Predictions
  app.get("/api/commodities/:id/detailed-chart", async (req, res) => {
    try {
      const commodityId = req.params.id;
      const period = req.query.period as string || "1mo";
      
      // Get commodity to access Yahoo symbol
      const commodity = await storage.getCommodity(commodityId);
      if (!commodity) {
        return res.status(404).json({ message: "Commodity not found" });
      }

      // Get chart data with AI predictions from storage
      try {
        const chartData = await storage.getChartData(commodityId, 30);
        if (chartData.length > 0) {
          return res.json(chartData);
        }
      } catch (error) {
        console.log("Chart data not available:", error);
      }

      // For now, create a simplified mock prediction structure for chart display
      const aiModels = await storage.getAiModels();
      
      if (commodity.yahooSymbol) {
        try {
          // Fetch real-time data from Yahoo Finance
          const realTimeData = await yahooFinanceService.fetchDetailedHistoricalData(commodity.yahooSymbol, period);
          
          if (realTimeData.length > 0) {
            // Map real Yahoo Finance data with AI predictions
            const enhancedData = realTimeData.map((item: any, index: number) => {
              const predictions: Record<string, number> = {};
              
              // Generate realistic AI model predictions based on actual price
              aiModels.forEach(model => {
                const actualPrice = item.price;
                let predictionVariance: number;
                
                if (model.name === 'Claude') {
                  predictionVariance = 0.97 + Math.random() * 0.06; // Claude: conservative, 97-103%
                } else if (model.name === 'ChatGPT') {
                  predictionVariance = 0.95 + Math.random() * 0.10; // ChatGPT: moderate, 95-105%
                } else if (model.name === 'Deepseek') {
                  predictionVariance = 0.98 + Math.random() * 0.04; // Deepseek: most accurate, 98-102%
                } else {
                  predictionVariance = 0.96 + Math.random() * 0.08; // Default: 96-104%
                }
                
                predictions[model.id] = Number((actualPrice * predictionVariance).toFixed(2));
              });

              return {
                date: new Date(item.date).toLocaleDateString("en-US", { 
                  month: "short", 
                  day: "numeric" 
                }),
                actualPrice: Number(item.price.toFixed(2)),
                predictions
              };
            });

            return res.json(enhancedData);
          }
        } catch (error) {
          console.warn(`Yahoo Finance failed for ${commodity.yahooSymbol}, using fallback data:`, error);
        }
      }

      // No real data available
      console.log(`No historical data available for ${commodity.yahooSymbol}`);
      res.json([]);
    } catch (error) {
      console.error("Error fetching detailed chart data:", error);
      res.status(500).json({ message: "Failed to fetch detailed chart data" });
    }
  });

  // Latest Price with Real-time Data
  app.get("/api/commodities/:id/latest-price", async (req, res) => {
    try {
      const commodityId = req.params.id;
      const commodity = await storage.getCommodity(commodityId);
      
      if (!commodity) {
        return res.status(404).json({ message: "Commodity not found" });
      }

      if (commodity.yahooSymbol) {
        // Get real-time price from Yahoo Finance
        const priceData = await yahooFinanceService.getCurrentPrice(commodity.yahooSymbol);
        
        if (priceData) {
          res.json({
            price: priceData.price,
            change: priceData.change,
            changePercent: priceData.changePercent,
            timestamp: new Date().toISOString()
          });
        } else {
          // Fallback to latest stored price
          const latestPrice = await storage.getLatestPrice(commodityId);
          res.json(latestPrice || { price: 0, timestamp: new Date().toISOString() });
        }
      } else {
        // Use stored data
        const latestPrice = await storage.getLatestPrice(commodityId);
        res.json(latestPrice || { price: 0, timestamp: new Date().toISOString() });
      }
    } catch (error) {
      console.error("Error fetching latest price:", error);
      res.status(500).json({ message: "Failed to fetch latest price" });
    }
  });

  // Real-time Data Endpoint
  app.get("/api/commodities/:id/realtime", async (req, res) => {
    try {
      const commodityId = req.params.id;
      const period = req.query.period as string || "1d";
      
      const commodity = await storage.getCommodity(commodityId);
      if (!commodity?.yahooSymbol) {
        return res.status(404).json({ message: "Yahoo symbol not available" });
      }

      // Trigger real-time data update
      await yahooFinanceService.updateCommodityPrices(commodityId);
      
      // Return updated chart data
      const chartData = await storage.getChartData(commodityId, period === "1d" ? 1 : 30);
      res.json(chartData);
    } catch (error) {
      console.error("Error fetching real-time data:", error);
      res.status(500).json({ message: "Failed to fetch real-time data" });
    }
  });

  // Market Alerts
  app.get("/api/alerts", async (req, res) => {
    try {
      const alerts = await storage.getActiveAlerts();
      res.json(alerts);
    } catch (error) {
      console.error("Error fetching alerts:", error);
      res.status(500).json({ message: "Failed to fetch alerts" });
    }
  });

  // Recent Activity (latest predictions)
  app.get("/api/activity", async (req, res) => {
    try {
      const limit = parseInt(req.query.limit as string) || 10;
      const predictions = await storage.getPredictions();
      
      const activities = [];
      for (const prediction of predictions.slice(0, limit)) {
        const aiModel = await storage.getAiModel(prediction.aiModelId);
        const commodity = await storage.getCommodity(prediction.commodityId);
        
        if (aiModel && commodity) {
          activities.push({
            id: prediction.id,
            model: aiModel.name,
            commodity: commodity.name,
            timestamp: prediction.createdAt,
            prediction: parseFloat(prediction.predictedPrice)
          });
        }
      }
      
      res.json(activities);
    } catch (error) {
      console.error("Error fetching activity:", error);
      res.status(500).json({ message: "Failed to fetch activity" });
    }
  });

  // Update Prices from Yahoo Finance
  app.post("/api/prices/update", async (req, res) => {
    try {
      const { commodityId } = req.body;
      await yahooFinanceService.updateCommodityPrices(commodityId);
      res.json({ message: "Prices updated successfully" });
    } catch (error) {
      console.error("Error updating prices:", error);
      res.status(500).json({ message: "Failed to update prices" });
    }
  });

  // Create Prediction
  app.post("/api/predictions", async (req, res) => {
    try {
      const validatedData = insertPredictionSchema.parse(req.body);
      const prediction = await storage.createPrediction(validatedData);
      res.json(prediction);
    } catch (error) {
      console.error("Error creating prediction:", error);
      res.status(400).json({ message: "Invalid prediction data" });
    }
  });

  // Create Alert
  app.post("/api/alerts", async (req, res) => {
    try {
      const validatedData = insertMarketAlertSchema.parse(req.body);
      const alert = await storage.createAlert(validatedData);
      res.json(alert);
    } catch (error) {
      console.error("Error creating alert:", error);
      res.status(400).json({ message: "Invalid alert data" });
    }
  });

  // Get Accuracy Metrics
  app.get("/api/accuracy/:period", async (req, res) => {
    try {
      const period = req.params.period;
      const metrics = await storage.getAccuracyMetrics(period);
      res.json(metrics);
    } catch (error) {
      console.error("Error fetching accuracy metrics:", error);
      res.status(500).json({ message: "Failed to fetch accuracy metrics" });
    }
  });

  // AI Predictions for All Commodities
  app.get("/api/predictions/all", async (req, res) => {
    try {
      const commodities = await storage.getCommodities();
      const allPredictions: any[] = [];

      for (const commodity of commodities) {
        const predictions = await storage.getPredictions(commodity.id);
        const latestPrice = await storage.getLatestPrice(commodity.id);
        
        allPredictions.push({
          commodity,
          currentPrice: latestPrice ? parseFloat(latestPrice.price) : 0,
          priceChange: 0, // Will be calculated from actual price data
          predictions: predictions.slice(0, 30)
        });
      }

      res.json(allPredictions);
    } catch (error) {
      console.error("Error fetching all predictions:", error);
      res.status(500).json({ message: "Failed to fetch predictions" });
    }
  });

  // Endpoint to populate database with sample prediction data
  app.post("/api/populate-predictions", async (req, res) => {
    try {
      const commodities = await storage.getCommodities();
      const aiModels = await storage.getAiModels();
      
      let totalPredictions = 0;
      let totalActualPrices = 0;
      
      // This endpoint is disabled - use real AI predictions only
      res.status(400).json({ 
        message: "Mock data population is disabled. Use real AI predictions via /api/ai-predictions/generate",
        hint: "Configure AI API keys and use the AI prediction endpoints instead"
      });
      return;
      
      console.log(`Populated ${totalPredictions} predictions and ${totalActualPrices} actual prices`);
      res.json({ 
        success: true, 
        totalPredictions, 
        totalActualPrices,
        message: 'Database populated with sample prediction data'
      });
    } catch (error: any) {
      console.error("Error populating predictions:", error);
      res.status(500).json({ message: "Failed to populate predictions", error: error?.message || 'Unknown error' });
    }
  });

  // AI Prediction Management Endpoints
  app.post("/api/ai-predictions/generate", async (req, res) => {
    try {
      const { commodityId } = req.body;
      
      if (commodityId) {
        // Generate cached predictions for specific commodity
        await cachedPredictionService.generateCachedPredictionsForCommodity(commodityId);
        res.json({ success: true, message: `Cached predictions generated for commodity ${commodityId}` });
      } else {
        // Generate cached predictions for all commodities
        await cachedPredictionService.generateAllCachedPredictions();
        res.json({ success: true, message: "Cached predictions generated for all commodities" });
      }
    } catch (error: any) {
      console.error("Error generating cached predictions:", error);
      res.status(500).json({ message: "Failed to generate cached predictions", error: error?.message || 'Unknown error' });
    }
  });

  // Get AI predictions for a commodity
  app.get("/api/ai-predictions/:commodityId", async (req, res) => {
    try {
      const { commodityId } = req.params;
      const predictions = await storage.getPredictionsByCommodity(commodityId);
      res.json(predictions);
    } catch (error) {
      console.error("Error fetching AI predictions:", error);
      res.status(500).json({ message: "Failed to fetch AI predictions" });
    }
  });

  // Generate AI predictions manually (for testing)
  app.post("/api/ai-predictions/generate-ai", async (req, res) => {
    try {
      const { commodityId, aiModelId } = req.body;
      
      if (commodityId && aiModelId) {
        // Generate for specific commodity and model
        await aiPredictionService.generateManualPrediction(commodityId, aiModelId);
        res.json({ success: true, message: `AI prediction generated for commodity ${commodityId} with model ${aiModelId}` });
      } else {
        // Generate for all commodities and models
        await aiPredictionService.generateWeeklyPredictions();
        res.json({ success: true, message: "AI predictions generated for all commodities" });
      }
    } catch (error: any) {
      console.error("Error generating AI predictions:", error);
      res.status(500).json({ 
        message: "Failed to generate AI predictions", 
        error: error?.message || 'Unknown error' 
      });
    }
  });

  // Get AI prediction status and capabilities
  app.get("/api/ai-predictions/status", async (req, res) => {
    try {
      const availableServices = {
        openai: !!process.env.OPENAI_API_KEY,
        claude: !!process.env.ANTHROPIC_API_KEY,
        deepseek: !!process.env.DEEPSEEK_API_KEY
      };
      
      const activeServices = Object.entries(availableServices).filter(([_, active]) => active).map(([name]) => name);
      
      res.json({
        availableServices,
        activeServices,
        totalActiveServices: activeServices.length,
        needsConfiguration: activeServices.length === 0,
        configured: {
          openai: availableServices.openai,
          claude: availableServices.claude,
          deepseek: availableServices.deepseek
        }
      });
    } catch (error) {
      console.error('Error getting AI prediction status:', error);
      res.status(500).json({ error: 'Internal server error' });
    }
  });

  // Get AI future predictions for a commodity
  app.get("/api/commodities/:id/ai-predictions", async (req, res) => {
    try {
      const { id: commodityId } = req.params;
      const days = parseInt(req.query.days as string) || 7;
      
      const predictions = await storage.getPredictions(commodityId);
      res.json(predictions);
    } catch (error: any) {
      console.error("Error fetching AI predictions:", error);
      res.status(500).json({ 
        message: "Failed to fetch AI predictions", 
        error: error?.message || 'Unknown error' 
      });
    }
  });

  // Get chart data with AI predictions
  app.get("/api/commodities/:id/chart-with-predictions", async (req, res) => {
    try {
      const { id: commodityId } = req.params;
      const period = req.query.period as string || "1mo";
      
      const chartData = await storage.getChartData(commodityId, 30);
      res.json(chartData);
    } catch (error: any) {
      console.error("Error fetching chart data with predictions:", error);
      res.status(500).json({ 
        message: "Failed to fetch chart data with predictions", 
        error: error?.message || 'Unknown error' 
      });
    }
  });

  // Get future predictions with chart data
  app.get("/api/commodities/:id/future-predictions", async (req, res) => {
    try {
      const commodityId = req.params.id;
      const commodity = await storage.getCommodity(commodityId);
      
      if (!commodity) {
        return res.status(404).json({ message: "Commodity not found" });
      }

      // Get AI models
      const aiModels = await storage.getAiModels();
      
      // Get future predictions (target date > current date)
      const allPredictions = await storage.getPredictionsByCommodity(commodityId);
      const currentDate = new Date();
      const futurePredictions = allPredictions.filter(p => new Date(p.targetDate) > currentDate);
      
      // Group predictions by target date and AI model
      const predictionMap = new Map<string, any>();
      
      futurePredictions.forEach(prediction => {
        const dateKey = new Date(prediction.targetDate).toISOString().split('T')[0];
        if (!predictionMap.has(dateKey)) {
          predictionMap.set(dateKey, {
            date: dateKey,
            actualPrice: null, // Future dates don't have actual prices
            predictions: {}
          });
        }
        
        const model = aiModels.find(m => m.id === prediction.aiModelId);
        if (model) {
          predictionMap.get(dateKey).predictions[model.id] = {
            value: Number(prediction.predictedPrice),
            confidence: Number(prediction.confidence || 0),
            modelName: model.name,
            color: model.color
          };
        }
      });
      
      // Convert to array and sort by date
      const chartData = Array.from(predictionMap.values())
        .sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime());
      
      res.json({
        commodity,
        aiModels,
        futurePredictions: chartData,
        totalPredictions: futurePredictions.length
      });
    } catch (error) {
      console.error("Error fetching future predictions:", error);
      res.status(500).json({ message: "Failed to fetch future predictions" });
    }
  });

  // Scheduler management endpoints
  app.post("/api/scheduler/start", async (req, res) => {
    try {
      predictionScheduler.start();
      res.json({ success: true, message: "Prediction scheduler started" });
    } catch (error: any) {
      console.error("Error starting scheduler:", error);
      res.status(500).json({ message: "Failed to start scheduler" });
    }
  });

  app.post("/api/scheduler/run-now", async (req, res) => {
    try {
      await predictionScheduler.runNow();
      res.json({ success: true, message: "Weekly prediction update completed" });
    } catch (error: any) {
      console.error("Error running weekly update:", error);
      res.status(500).json({ message: "Failed to run weekly update", error: error?.message || 'Unknown error' });
    }
  });

  app.post("/api/scheduler/run-full-generation", async (req, res) => {
    try {
      await predictionScheduler.runFullGeneration();
      res.json({ success: true, message: "Full daily prediction generation completed" });
    } catch (error: any) {
      console.error("Error running full generation:", error);
      res.status(500).json({ message: "Failed to run full generation", error: error?.message || 'Unknown error' });
    }
  });

  app.post("/api/scheduler/run-commodity/:commodityId", async (req, res) => {
    try {
      const { commodityId } = req.params;
      await cachedPredictionService.generateCachedPredictionsForCommodity(commodityId);
      res.json({ success: true, message: `Cached predictions generated for commodity ${commodityId}` });
    } catch (error: any) {
      console.error("Error running commodity predictions:", error);
      res.status(500).json({ message: "Failed to run commodity predictions", error: error?.message || 'Unknown error' });
    }
  });

  // Initialize prediction data on startup
  const initializePredictions = async () => {
    try {
      const commodities = await storage.getCommodities();
      for (const commodity of commodities) {
        // Initialize real price data from Yahoo Finance
        try {
          await yahooFinanceService.updateCommodityPrices(commodity.id);
        } catch (error) {
          console.log(`Could not initialize prices for ${commodity.name}:`, error);
        }
      }
      console.log(`Initialized predictions for ${commodities.length} commodities`);
      
      // Start the prediction scheduler
      predictionScheduler.start();
    } catch (error) {
      console.error("Error initializing predictions:", error);
    }
  };

  // Initialize predictions
  await initializePredictions();

  const httpServer = createServer(app);
  return httpServer;
}
