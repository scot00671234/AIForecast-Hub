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
            console.log(`⚠️ Could not initialize prices for ${commodity.name}:`, error.message);
          }
        }
        
        // Start prediction scheduler
        const { PredictionScheduler } = await import('./predictionScheduler');
        const scheduler = new PredictionScheduler();
        scheduler.start();
        
        console.log('✅ Background initialization complete');
      } catch (error) {
        console.error('❌ Background initialization failed:', error);
      }
    }, 5000); // 5 second delay to ensure app is fully started
  }
}