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
    
    // CRITICAL: Run migrations FIRST before any other database operations
    await this.storage.runAutomaticMigrations();
    console.log('✅ Database migrations completed');
    
    // Initialize default data (models + commodities)
    await this.storage.ensureDefaultData();
    console.log('✅ Database schema and default data initialized');
  }

  // Heavy operations - can be delayed
  async initializeHeavy(): Promise<void> {
    console.log('⚡ Starting heavy initialization (background)...');
    
    try {
      // PRODUCTION: Clean up fake historical data on startup
      if (process.env.NODE_ENV === 'production') {
        try {
          console.log('🧹 Running production database cleanup...');
          const { cleanupFakeData } = await import('../scripts/production-cleanup');
          await cleanupFakeData();
          console.log('✅ Production database cleanup completed');
        } catch (error) {
          console.error('⚠️ Production cleanup failed (non-critical):', error);
        }
      }
      
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
      
      // Check if we already have quarterly predictions specifically
      const allPredictions = await this.storage.getPredictions();
      const quarterlyPredictions = allPredictions.filter(p => 
        p.timeframe && ['3mo', '6mo', '9mo', '12mo'].includes(p.timeframe)
      );
      
      if (quarterlyPredictions.length === 0) {
        console.log('🚀 No quarterly predictions found - triggering automatic quarterly prediction generation...');
        
        // ONLY generate predictions if we have API keys configured (no fake data)
        const hasApiKeys = process.env.OPENAI_API_KEY || process.env.ANTHROPIC_API_KEY || process.env.DEEPSEEK_API_KEY;
        
        if (hasApiKeys) {
          // Import AI prediction service
          const { aiPredictionService } = await import('./aiPredictionService');
          
          console.log('🔮 Starting automatic quarterly prediction generation for all commodities...');
          console.log('📅 This will generate REAL 3mo, 6mo, 9mo, and 12mo predictions');
          
          try {
            await aiPredictionService.generateMonthlyPredictions();
            console.log('✅ Automatic quarterly prediction generation completed successfully');
          } catch (error) {
            console.log('⚠️ Quarterly prediction generation encountered issues:', (error as Error).message);
          }
        } else {
          console.log('⚠️ No AI API keys configured - skipping prediction generation (prevents fake data)');
        }
      } else {
        console.log(`📊 Found ${quarterlyPredictions.length} existing quarterly predictions - skipping automatic generation`);
      }
    } catch (error) {
      console.error('❌ Initial prediction check failed (non-critical):', error);
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
        
        console.log('⚠️ Weekly prediction generation has been disabled. Only monthly predictions are available.');
        // Weekly predictions have been removed from the system
        
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