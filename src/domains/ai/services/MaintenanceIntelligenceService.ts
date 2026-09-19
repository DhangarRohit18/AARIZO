import { aiService } from '../../../repositories/ai/AIService';

export class MaintenanceIntelligenceService {
  
  /**
   * Called via a Cron Job (e.g., weekly) to analyze Asset health.
   */
  public async analyzeAssetHealth(societyId: string, assetId: string, repairHistory: any[]): Promise<void> {
    
    // Skip if not enough data
    if (repairHistory.length < 3) return;

    await aiService.generateInsight({
      societyId,
      entityId: assetId,
      context: 'PREDICTIVE_MAINTENANCE',
      rawInputData: {
        repairHistory,
        currentAgeMonths: 36
      }
    });
  }
}

export const maintenanceIntelligenceService = new MaintenanceIntelligenceService();
