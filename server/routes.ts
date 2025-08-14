import type { Express } from "express";
import { createServer, type Server } from "http";
import { storage } from "./storage";
import { yahooFinanceService } from "./services/yahooFinance";
import { mockPredictionService } from "./services/mockPredictions";
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

  // League Table
  app.get("/api/league-table", async (req, res) => {
    try {
      const period = req.query.period as string || "30d";
      const leagueTable = await storage.getLeagueTable(period);
      res.json(leagueTable);
    } catch (error) {
      console.error("Error fetching league table:", error);
      res.status(500).json({ message: "Failed to fetch league table" });
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
  app.get("/api/commodities/:id/chart", async (req, res) => {
    try {
      const commodityId = req.params.id;
      const days = parseInt(req.query.days as string) || 7;
      const chartData = await storage.getChartData(commodityId, days);
      res.json(chartData);
    } catch (error) {
      console.error("Error fetching chart data:", error);
      res.status(500).json({ message: "Failed to fetch chart data" });
    }
  });

  // Detailed Chart Data with Real Yahoo Finance Integration
  app.get("/api/commodities/:id/detailed-chart", async (req, res) => {
    try {
      const commodityId = req.params.id;
      const period = req.query.period as string || "1mo";
      
      // Get commodity to access Yahoo symbol
      const commodity = await storage.getCommodity(commodityId);
      if (!commodity) {
        return res.status(404).json({ message: "Commodity not found" });
      }

      if (commodity.yahooSymbol) {
        // Fetch real-time data from Yahoo Finance
        const realTimeData = await yahooFinanceService.fetchDetailedHistoricalData(commodity.yahooSymbol, period);
        
        // Combine with AI predictions
        const chartData = await storage.getChartData(commodityId, period === "1d" ? 1 : period === "5d" ? 5 : 30);
        
        // Map real-time data to chart format
        const enhancedData = realTimeData.map((item: any) => {
          const date = new Date(item.date).toLocaleDateString();
          const prediction = chartData.find(c => new Date(c.date).toLocaleDateString() === date);
          
          return {
            date,
            actualPrice: item.price,
            predictions: prediction?.predictions || {}
          };
        });

        res.json(enhancedData);
      } else {
        // Fallback to stored data
        const chartData = await storage.getChartData(commodityId, 30);
        res.json(chartData);
      }
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
        let predictions = mockPredictionService.getPredictionsForCommodity(commodity.id);
        
        if (!predictions) {
          // Generate predictions if they don't exist
          predictions = mockPredictionService.generatePredictionsForCommodity(commodity.symbol, commodity.id);
        }

        const currentPrice = mockPredictionService.getCurrentPrice(commodity.id) || 0;
        const priceChange = mockPredictionService.getPriceChange(commodity.id);

        allPredictions.push({
          commodity,
          currentPrice,
          priceChange,
          chartData: predictions.predictions.slice(-30) // Last 30 days for charts
        });
      }

      res.json(allPredictions);
    } catch (error) {
      console.error("Error fetching all predictions:", error);
      res.status(500).json({ message: "Failed to fetch predictions" });
    }
  });

  // Initialize prediction data on startup
  const initializePredictions = async () => {
    try {
      const commodities = await storage.getCommodities();
      for (const commodity of commodities) {
        if (!mockPredictionService.getPredictionsForCommodity(commodity.id)) {
          mockPredictionService.generatePredictionsForCommodity(commodity.symbol, commodity.id);
        }
      }
      console.log(`Initialized predictions for ${commodities.length} commodities`);
    } catch (error) {
      console.error("Error initializing predictions:", error);
    }
  };

  // Initialize predictions
  await initializePredictions();

  const httpServer = createServer(app);
  return httpServer;
}
