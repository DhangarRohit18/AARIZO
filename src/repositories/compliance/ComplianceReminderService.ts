import { amcRepository } from './AMCRepository';
import { query, where } from 'firebase/firestore';

export class ComplianceReminderService {
  /**
   * SIMULATED CRON JOB (Runs nightly)
   * Sweeps the amcContracts collection to update statuses and send reminders.
   */
  public async processDailyReminders(societyId: string): Promise<void> {
    const allContracts = await amcRepository.list(societyId);
    
    // Filter for active tracking (ignore already RENEWED documents)
    const activeContracts = allContracts.filter(c => c.status !== 'RENEWED');

    const now = new Date().getTime();
    const MS_PER_DAY = 1000 * 60 * 60 * 24;

    for (const contract of activeContracts) {
      if (!contract.contractEnd) continue;
      
      const endMs = new Date(contract.contractEnd).getTime();
      const daysRemaining = (endMs - now) / MS_PER_DAY;

      let statusUpdates: Partial<typeof contract> = {};
      let needsUpdate = false;

      // 1. Check for Expiration
      if (daysRemaining <= 0) {
        if (contract.status !== 'EXPIRED') {
          statusUpdates.status = 'EXPIRED';
          needsUpdate = true;
        }
        if (!contract.remindersSent.expired) {
          statusUpdates.remindersSent = { ...contract.remindersSent, expired: true };
          needsUpdate = true;
          this.triggerNotification(contract, 'EXPIRED');
        }
      } 
      // 2. Check for 7-Day Warning
      else if (daysRemaining <= 7) {
        if (contract.status !== 'EXPIRING_SOON') {
          statusUpdates.status = 'EXPIRING_SOON';
          needsUpdate = true;
        }
        if (!contract.remindersSent.sevenDay) {
          statusUpdates.remindersSent = { ...contract.remindersSent, sevenDay: true };
          needsUpdate = true;
          this.triggerNotification(contract, '7_DAYS');
        }
      }
      // 3. Check for 15-Day Warning
      else if (daysRemaining <= 15) {
        if (contract.status !== 'EXPIRING_SOON') {
          statusUpdates.status = 'EXPIRING_SOON';
          needsUpdate = true;
        }
        if (!contract.remindersSent.fifteenDay) {
          statusUpdates.remindersSent = { ...contract.remindersSent, fifteenDay: true };
          needsUpdate = true;
          this.triggerNotification(contract, '15_DAYS');
        }
      }
      // 4. Check for 30-Day Warning
      else if (daysRemaining <= 30) {
        if (contract.status !== 'EXPIRING_SOON') {
          statusUpdates.status = 'EXPIRING_SOON';
          needsUpdate = true;
        }
        if (!contract.remindersSent.thirtyDay) {
          statusUpdates.remindersSent = { ...contract.remindersSent, thirtyDay: true };
          needsUpdate = true;
          this.triggerNotification(contract, '30_DAYS');
        }
      }

      // Commit updates if required
      if (needsUpdate) {
        await amcRepository.update(contract.id, statusUpdates);
      }
    }
  }

  private triggerNotification(contract: any, type: string) {
    console.log(`[COMPLIANCE ALERT] Document "${contract.title}" (Type: ${contract.type}) is ${type}. Sending push notification to ${contract.responsiblePerson}.`);
  }
}

export const complianceReminderService = new ComplianceReminderService();
