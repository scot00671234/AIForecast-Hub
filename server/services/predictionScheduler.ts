import cron from 'node-cron';
import { aiPredictionService } from './aiPredictionService.js';

export class PredictionScheduler {
  private isScheduled = false;

  start(): void {
    if (this.isScheduled) {
      console.log('Prediction scheduler is already running');
      return;
    }

    // Schedule weekly predictions every Sunday at 2 AM
    cron.schedule('0 2 * * 0', async () => {
      console.log('Running weekly prediction update...');
      try {
        await aiPredictionService.generateAllPredictions();
        console.log('Weekly prediction update completed successfully');
      } catch (error) {
        console.error('Weekly prediction update failed:', error);
      }
    });

    this.isScheduled = true;
    console.log('Prediction scheduler started - will run every Sunday at 2 AM');
  }

  async runNow(): Promise<void> {
    console.log('Running predictions manually...');
    try {
      await aiPredictionService.generateAllPredictions();
      console.log('Manual prediction run completed successfully');
    } catch (error) {
      console.error('Manual prediction run failed:', error);
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