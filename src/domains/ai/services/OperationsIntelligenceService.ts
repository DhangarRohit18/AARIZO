import { aiService } from '../../../repositories/ai/AIService';

export class OperationsIntelligenceService {
  
  /**
   * Called via a Cron Job (e.g., nightly) to analyze the day's operational metrics.
   */
  public async generateDailySummary(societyId: string, dailyMetrics: any): Promise<void> {
    
    await aiService.generateInsight({
      societyId,
      entityId: `daily_summary_${new Date().toISOString().split('T')[0]}`,
      context: 'OPERATIONAL_SUMMARY',
      rawInputData: dailyMetrics
    });
  }
}

export const operationsIntelligenceService = new OperationsIntelligenceService();
