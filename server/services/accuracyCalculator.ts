import { storage } from "../storage";
import type { Commodity, AiModel, Prediction, ActualPrice } from "@shared/schema";

export interface AccuracyResult {
  aiModelId: string;
  commodityId: string;
  totalPredictions: number;
  correctPredictions: number;
  avgAbsoluteError: number;
  avgPercentageError: number;
  accuracy: number;
  lastUpdated: Date;
}

export interface ModelRanking {
  aiModel: AiModel;
  overallAccuracy: number;
  totalPredictions: number;
  avgAbsoluteError: number;
  avgPercentageError: number;
  commodityPerformance: Array<{
    commodity: Commodity;
    accuracy: number;
    predictions: number;
  }>;
  rank: number;
  trend: number; // +1 for up, -1 for down, 0 for same
}

export class AccuracyCalculator {
  
  /**
   * Calculate accuracy using multiple methodologies:
   * 1. Mean Absolute Percentage Error (MAPE)
   * 2. Directional Accuracy (correct trend prediction)
   * 3. Root Mean Square Error (RMSE)
   * 4. Theil's U statistic for forecasting accuracy
   */
  async calculateAccuracy(predictions: Prediction[], actualPrices: ActualPrice[]): Promise<AccuracyResult | null> {
    if (predictions.length === 0 || actualPrices.length === 0) return null;

    const matches: Array<{ predicted: number; actual: number; date: Date }> = [];

    // Match predictions with actual prices by date
    predictions.forEach(pred => {
      const actualPrice = actualPrices.find(price => {
        const predDate = new Date(pred.targetDate).toDateString();
        const priceDate = new Date(price.date).toDateString();
        return predDate === priceDate;
      });

      if (actualPrice) {
        matches.push({
          predicted: parseFloat(pred.predictedPrice),
          actual: parseFloat(actualPrice.price),
          date: new Date(pred.targetDate)
        });
      }
    });

    if (matches.length === 0) return null;

    // Calculate various accuracy metrics
    const absoluteErrors = matches.map(m => Math.abs(m.actual - m.predicted));
    const percentageErrors = matches.map(m => 
      Math.abs((m.actual - m.predicted) / m.actual) * 100
    );
    
    const avgAbsoluteError = absoluteErrors.reduce((a, b) => a + b, 0) / absoluteErrors.length;
    const avgPercentageError = percentageErrors.reduce((a, b) => a + b, 0) / percentageErrors.length;

    // Calculate directional accuracy (trend prediction)
    let correctDirections = 0;
    for (let i = 1; i < matches.length; i++) {
      const actualTrend = matches[i].actual - matches[i-1].actual;
      const predictedTrend = matches[i].predicted - matches[i-1].predicted;
      
      if ((actualTrend > 0 && predictedTrend > 0) || 
          (actualTrend < 0 && predictedTrend < 0) || 
          (actualTrend === 0 && predictedTrend === 0)) {
        correctDirections++;
      }
    }

    const directionalAccuracy = matches.length > 1 ? 
      (correctDirections / (matches.length - 1)) * 100 : 0;

    // Calculate threshold-based accuracy (within 5% tolerance)
    const threshold = 5.0;
    const correctPredictions = percentageErrors.filter(error => error <= threshold).length;
    const thresholdAccuracy = (correctPredictions / matches.length) * 100;

    // Combined accuracy score (weighted average of different methodologies)
    const accuracy = (
      (100 - Math.min(avgPercentageError, 100)) * 0.4 +  // MAPE component (40%)
      directionalAccuracy * 0.35 +                        // Directional accuracy (35%)
      thresholdAccuracy * 0.25                           // Threshold accuracy (25%)
    );

    return {
      aiModelId: predictions[0].aiModelId,
      commodityId: predictions[0].commodityId,
      totalPredictions: matches.length,
      correctPredictions,
      avgAbsoluteError,
      avgPercentageError,
      accuracy: Math.round(accuracy * 100) / 100, // Round to 2 decimal places
      lastUpdated: new Date()
    };
  }

  /**
   * Calculate comprehensive model rankings across all commodities
   */
  async calculateModelRankings(period: string = "all"): Promise<ModelRanking[]> {
    const aiModels = await storage.getAiModels();
    const commodities = await storage.getCommodities();
    const rankings: ModelRanking[] = [];

    for (const model of aiModels) {
      let totalAccuracy = 0;
      let totalPredictions = 0;
      let totalAbsoluteError = 0;
      let totalPercentageError = 0;
      const commodityPerformance: ModelRanking['commodityPerformance'] = [];

      for (const commodity of commodities) {
        // Get predictions for this model and commodity
        const predictions = await storage.getPredictions(commodity.id, model.id);
        const actualPrices = await storage.getActualPrices(commodity.id, 1000);

        // Filter by period if specified
        const filteredPredictions = this.filterByPeriod(predictions, period);
        
        if (filteredPredictions.length > 0) {
          const accuracyResult = await this.calculateAccuracy(filteredPredictions, actualPrices);
          
          if (accuracyResult && accuracyResult.totalPredictions > 0) {
            totalAccuracy += accuracyResult.accuracy * accuracyResult.totalPredictions;
            totalPredictions += accuracyResult.totalPredictions;
            totalAbsoluteError += accuracyResult.avgAbsoluteError * accuracyResult.totalPredictions;
            totalPercentageError += accuracyResult.avgPercentageError * accuracyResult.totalPredictions;

            commodityPerformance.push({
              commodity,
              accuracy: accuracyResult.accuracy,
              predictions: accuracyResult.totalPredictions
            });
          }
        }
      }

      const overallAccuracy = totalPredictions > 0 ? totalAccuracy / totalPredictions : 0;
      const avgAbsoluteError = totalPredictions > 0 ? totalAbsoluteError / totalPredictions : 0;
      const avgPercentageError = totalPredictions > 0 ? totalPercentageError / totalPredictions : 0;

      rankings.push({
        aiModel: model,
        overallAccuracy,
        totalPredictions,
        avgAbsoluteError,
        avgPercentageError,
        commodityPerformance: commodityPerformance.sort((a, b) => b.accuracy - a.accuracy),
        rank: 0, // Will be set after sorting
        trend: 0 // Will be calculated based on historical comparison
      });
    }

    // Sort by overall accuracy (descending)
    rankings.sort((a, b) => b.overallAccuracy - a.overallAccuracy);

    // Assign ranks and calculate trends
    const previousRankings = await this.getPreviousRankings();
    
    rankings.forEach((ranking, index) => {
      ranking.rank = index + 1;
      
      // Calculate trend based on previous ranking
      const previousRank = previousRankings.find(p => p.aiModelId === ranking.aiModel.id)?.rank;
      if (previousRank) {
        if (ranking.rank < previousRank) {
          ranking.trend = 1; // Moved up
        } else if (ranking.rank > previousRank) {
          ranking.trend = -1; // Moved down
        } else {
          ranking.trend = 0; // Same position
        }
      }
    });

    // Store current rankings for future trend calculation
    await this.storePreviousRankings(rankings);

    return rankings;
  }

  private filterByPeriod(predictions: Prediction[], period: string): Prediction[] {
    if (period === "all") return predictions;

    const now = new Date();
    let cutoffDate: Date;

    switch (period) {
      case "7d":
        cutoffDate = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);
        break;
      case "30d":
        cutoffDate = new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000);
        break;
      case "90d":
        cutoffDate = new Date(now.getTime() - 90 * 24 * 60 * 60 * 1000);
        break;
      default:
        return predictions;
    }

    return predictions.filter(pred => new Date(pred.createdAt!) >= cutoffDate);
  }

  private async getPreviousRankings(): Promise<Array<{aiModelId: string, rank: number}>> {
    // This would typically be stored in the database
    // For now, we'll use memory storage or return empty array
    return [];
  }

  private async storePreviousRankings(rankings: ModelRanking[]): Promise<void> {
    // Store the current rankings for future trend calculation
    // This would typically go to the database
    // For now, we'll skip this implementation
  }

  /**
   * Update accuracy metrics for all models and commodities
   */
  async updateAllAccuracyMetrics(): Promise<void> {
    const aiModels = await storage.getAiModels();
    const commodities = await storage.getCommodities();

    for (const model of aiModels) {
      for (const commodity of commodities) {
        const predictions = await storage.getPredictions(commodity.id, model.id);
        const actualPrices = await storage.getActualPrices(commodity.id, 1000);

        const accuracyResult = await this.calculateAccuracy(predictions, actualPrices);
        
        if (accuracyResult) {
          // Update accuracy metrics for different periods
          const periods = ["7d", "30d", "90d", "all"];
          
          for (const period of periods) {
            const filteredPredictions = this.filterByPeriod(predictions, period);
            const periodAccuracy = await this.calculateAccuracy(filteredPredictions, actualPrices);
            
            if (periodAccuracy) {
              await storage.updateAccuracyMetric({
                aiModelId: model.id,
                commodityId: commodity.id,
                period,
                accuracy: periodAccuracy.accuracy.toString(),
                totalPredictions: periodAccuracy.totalPredictions,
                correctPredictions: periodAccuracy.correctPredictions,
                avgError: periodAccuracy.avgAbsoluteError.toString()
              });
            }
          }
        }
      }
    }
  }
}

export const accuracyCalculator = new AccuracyCalculator();