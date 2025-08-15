// Cached prediction service - DISABLED for real AI predictions only

export class CachedPredictionService {
  
  async generateCachedPredictionsForCommodity(commodityId: string): Promise<void> {
    throw new Error("Cached prediction service is disabled. Use real AI predictions via aiPredictionService instead.");
  }

  async generateAllCachedPredictions(): Promise<void> {
    throw new Error("Cached prediction service is disabled. Use real AI predictions via aiPredictionService instead.");
  }

  async updateWeeklyPredictions(): Promise<void> {
    throw new Error("Cached prediction service is disabled. Use real AI predictions via aiPredictionService instead.");
  }
}

export const cachedPredictionService = new CachedPredictionService();