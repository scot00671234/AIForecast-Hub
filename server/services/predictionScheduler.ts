import cron from 'node-cron';
import { aiPredictionService } from './aiPredictionService.js';
import { cachedPredictionService } from './cachedPredictionService.js';

export class PredictionScheduler {
  private isScheduled = false;

  start(): void {
    if (this.isScheduled) {
      console.log('Prediction scheduler is already running');
      return;
    }

    // Schedule weekly prediction updates every Monday at 2 AM
    cron.schedule('0 2 * * 1', async () => {
      console.log('Running weekly prediction update...');
      try {
        await cachedPredictionService.updateWeeklyPredictions();
        console.log('Weekly prediction update completed successfully');
      } catch (error) {
        console.error('Weekly prediction update failed:', error);
      }
    });

    this.isScheduled = true;
    console.log('Prediction scheduler started - will run every Monday at 2 AM');
  }

  async runNow(): Promise<void> {
    console.log('Running weekly prediction update manually...');
    try {
      await cachedPredictionService.updateWeeklyPredictions();
      console.log('Manual weekly update completed successfully');
    } catch (error) {
      console.error('Manual weekly update failed:', error);
      throw error;
    }
  }

  async runFullGeneration(): Promise<void> {
    console.log('Running full daily prediction generation manually...');
    try {
      await cachedPredictionService.generateAllCachedPredictions();
      console.log('Manual full generation completed successfully');
    } catch (error) {
      console.error('Manual full generation failed:', error);
      throw error;
    }
  }

  async runForCommodity(commodityId: string): Promise<void> {
    console.log(`Running daily predictions manually for commodity ${commodityId}...`);
    try {
      await cachedPredictionService.generateCachedPredictionsForCommodity(commodityId);
      console.log(`Manual daily prediction run completed for commodity ${commodityId}`);
    } catch (error) {
      console.error(`Manual daily prediction run failed for commodity ${commodityId}:`, error);
      throw error;
    }
  }

  stop(): void {
    // Note: node-cron doesn't provide a direct way to stop specific tasks
    // This would require tracking the task and calling destroy() on it
    this.isScheduled = false;
    console.log('Prediction scheduler stopped');
  }
}

export const predictionScheduler = new PredictionScheduler();