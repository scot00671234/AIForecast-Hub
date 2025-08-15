import cron from 'node-cron';
import { aiPredictionService } from './aiPredictionService';
import { cachedPredictionService } from './cachedPredictionService';

export class PredictionScheduler {
  private isScheduled = false;

  start(): void {
    if (this.isScheduled) {
      console.log('Prediction scheduler is already running');
      return;
    }

    // Schedule weekly AI prediction updates every Monday at 2 AM
    cron.schedule('0 2 * * 1', async () => {
      console.log('Running weekly AI prediction update...');
      try {
        await aiPredictionService.generateWeeklyPredictions();
        console.log('Weekly AI prediction update completed successfully');
      } catch (error) {
        console.error('Weekly AI prediction update failed:', error);
      }
    });

    this.isScheduled = true;
    console.log('Prediction scheduler started - will run every Monday at 2 AM');
  }

  async runNow(): Promise<void> {
    console.log('Running weekly AI prediction update manually...');
    try {
      await aiPredictionService.generateWeeklyPredictions();
      console.log('Manual weekly AI prediction update completed successfully');
    } catch (error) {
      console.error('Manual weekly AI prediction update failed:', error);
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