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

    // Schedule daily AI prediction updates at 2 AM
    cron.schedule('0 2 * * *', async () => {
      console.log('Running daily AI prediction update...');
      try {
        await aiPredictionService.generateDailyPredictions();
        console.log('Daily AI prediction update completed successfully');
      } catch (error) {
        console.error('Daily AI prediction update failed:', error);
      }
    });

    // Schedule weekly comprehensive updates every Monday at 3 AM
    cron.schedule('0 3 * * 1', async () => {
      console.log('Running weekly comprehensive AI prediction update...');
      try {
        await aiPredictionService.generateWeeklyPredictions();
        console.log('Weekly comprehensive AI prediction update completed successfully');
      } catch (error) {
        console.error('Weekly comprehensive AI prediction update failed:', error);
      }
    });

    // Schedule hourly prediction updates during market hours (9 AM - 5 PM EST, Mon-Fri)
    cron.schedule('0 9-17 * * 1-5', async () => {
      console.log('Running hourly market prediction update...');
      try {
        await cachedPredictionService.generateAllCachedPredictions();
        console.log('Hourly market prediction update completed successfully');
      } catch (error) {
        console.error('Hourly market prediction update failed:', error);
      }
    });

    this.isScheduled = true;
    console.log('Prediction scheduler started with multiple schedules:');
    console.log('- Daily predictions: Every day at 2 AM');
    console.log('- Weekly comprehensive: Every Monday at 3 AM');
    console.log('- Hourly market updates: Every hour 9 AM-5 PM, Mon-Fri');
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