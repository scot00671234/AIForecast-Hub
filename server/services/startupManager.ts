import { DatabaseStorage } from '../storage';

export class StartupManager {
  private storage: DatabaseStorage;
  
  constructor(storage: DatabaseStorage) {
    this.storage = storage;
  }

  // Critical startup - must complete successfully
  async initializeCritical(): Promise<void> {
    console.log('🔧 Initializing critical services...');
    
    // Test database connection
    await this.storage.ensureConnection();
    console.log('✅ Database connection verified');
    
    // Initialize default data (models + commodities)
    await this.storage.ensureDefaultData();
    console.log('✅ Database schema and default data initialized');
  }

  // Heavy operations - can be delayed
  async initializeHeavy(): Promise<void> {
    console.log('⚡ Starting heavy initialization (background)...');
    
    try {
      // Get commodities from verified database
      const commodities = await this.storage.getCommodities();
      console.log(`📊 Found ${commodities.length} commodities in database`);
      
      // Initialize price data in background (don't block startup)
      this.initializePricesInBackground(commodities);
      
    } catch (error) {
      console.error('❌ Heavy initialization failed (non-critical):', error);
      // Don't throw - app can work without historical data
    }
  }

  private initializePricesInBackground(commodities: any[]): void {
    // Run in background without blocking startup
    setTimeout(async () => {
      try {
        console.log('🔄 Starting background price data initialization...');
        
        // Initialize Yahoo Finance data
        const { yahooFinanceService } = await import('./yahooFinance');
        
        for (const commodity of commodities) {
          try {
            await yahooFinanceService.updateCommodityPrices(commodity.id);
          } catch (error) {
            console.log(`⚠️ Could not initialize prices for ${commodity.name}:`, (error as Error).message);
          }
        }
        
        // Start prediction scheduler
        const { predictionScheduler } = await import('./predictionScheduler');
        predictionScheduler.start();
        
        // Run initial AI predictions on first deployment
        await this.runInitialPredictions();
        
        // Check for missing Claude predictions and auto-generate
        await this.checkAndGenerateMissingClaudePredictions();
        
        console.log('✅ Background initialization complete');
      } catch (error) {
        console.error('❌ Background initialization failed:', error);
      }
    }, 5000); // 5 second delay to ensure app is fully started
  }

  // Run initial AI predictions on first deployment
  private async runInitialPredictions(): Promise<void> {
    try {
      console.log('🤖 Checking for initial AI predictions...');
      
      // Check if we already have predictions
      const allPredictions = await this.storage.getPredictions(); // Get all predictions
      const existingPredictions = allPredictions.slice(0, 1); // Take first one
      
      if (existingPredictions.length === 0) {
        console.log('🚀 First deployment detected - generating initial AI predictions...');
        
        // Import AI prediction service
        const { aiPredictionService } = await import('./aiPredictionService');
        
        // Check if any AI service is configured
        const isConfigured = await aiPredictionService.isAnyServiceConfigured();
        
        if (isConfigured) {
          console.log('🔮 Starting initial prediction generation...');
          await aiPredictionService.generateWeeklyPredictions();
          console.log('✅ Initial AI predictions generated successfully');
        } else {
          console.log('⚠️ No AI services configured - skipping initial predictions');
        }
      } else {
        console.log('📊 Existing predictions found - skipping initial generation');
      }
    } catch (error) {
      console.error('❌ Initial prediction generation failed (non-critical):', error);
      // Don't throw - this is non-critical for app startup
    }
  }

  // Check for missing Claude predictions and auto-generate
  private async checkAndGenerateMissingClaudePredictions(): Promise<void> {
    try {
      console.log('🔍 Checking for missing Claude predictions...');
      
      // Import required services
      const { aiPredictionService } = await import('./aiPredictionService');
      const { claudeService } = await import('./claudeService');
      
      // Only proceed if Claude is configured (production has API key)
      if (!claudeService.isConfigured()) {
        console.log('⚠️ Claude not configured - skipping missing prediction check');
        return;
      }
      
      // Get all commodities and Claude model
      const commodities = await this.storage.getCommodities();
      const aiModels = await this.storage.getAiModels();
      const claudeModel = aiModels.find(model => model.name.toLowerCase() === 'claude');
      
      if (!claudeModel) {
        console.log('⚠️ Claude model not found in database - skipping check');
        return;
      }
      
      // Check each commodity for missing Claude predictions
      const commoditiesNeedingPredictions: string[] = [];
      
      for (const commodity of commodities) {
        // Get Claude predictions for this commodity from last 7 days
        const recentPredictions = await this.storage.getPredictions(commodity.id, claudeModel.id);
        const cutoffDate = new Date();
        cutoffDate.setDate(cutoffDate.getDate() - 7);
        
        const recentClaudePredictions = recentPredictions.filter(pred => 
          new Date(pred.createdAt!) > cutoffDate
        );
        
        if (recentClaudePredictions.length === 0) {
          commoditiesNeedingPredictions.push(commodity.id);
          console.log(`📝 Missing Claude predictions for: ${commodity.name}`);
        }
      }
      
      // Auto-generate missing predictions
      if (commoditiesNeedingPredictions.length > 0) {
        console.log(`🚀 Auto-generating Claude predictions for ${commoditiesNeedingPredictions.length} commodities...`);
        
        for (const commodityId of commoditiesNeedingPredictions) {
          try {
            await aiPredictionService.generatePredictionsForCommodity(commodityId);
            console.log(`✅ Generated Claude prediction for commodity ${commodityId}`);
            
            // Add delay to respect rate limits
            await new Promise(resolve => setTimeout(resolve, 2000));
          } catch (error) {
            console.error(`❌ Failed to generate Claude prediction for commodity ${commodityId}:`, error);
          }
        }
        
        console.log('✅ Auto-generation of missing Claude predictions completed');
      } else {
        console.log('✅ All commodities have recent Claude predictions');
      }
      
    } catch (error) {
      console.error('❌ Missing Claude prediction check failed (non-critical):', error);
      // Don't throw - this is non-critical for app startup
    }
  }
}