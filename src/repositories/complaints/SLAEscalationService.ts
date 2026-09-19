import { getDocs, query, where, Timestamp } from 'firebase/firestore';
import { db } from '../../services/firebase/config';
import { complaintRepository } from './ComplaintRepository';
import { slaPolicyRepository } from './SLAPolicyRepository';

export class SLAEscalationService {
  /**
   * SIMULATED CRON JOB
   * In a real Firebase environment, this would be a Pub/Sub Scheduled Function 
   * running every 5-15 minutes.
   */
  public async detectSLABreaches(societyId: string): Promise<number> {
    const now = new Date();
    
    // We query for complaints that are NOT closed and NOT already breached
    // Firestore limitation: we can't do != 'CLOSED', so we might use 'in' array
    // For this simulation, we'll fetch active states and filter locally if complex
    
    const activeComplaints = await complaintRepository.list(societyId);
    
    const breachCandidates = activeComplaints.filter(c => 
      c.status !== 'CLOSED' && 
      c.status !== 'RESOLVED' && 
      c.isBreached === false &&
      c.dueAt !== null
    );

    let breachCount = 0;

    for (const complaint of breachCandidates) {
      const deadline = new Date(complaint.dueAt);
      if (now > deadline) {
        await this.escalateComplaint(complaint.id, complaint.societyId, complaint.category);
        breachCount++;
      }
    }

    return breachCount;
  }

  /**
   * Bumps the escalation level and flags as breached
   */
  private async escalateComplaint(complaintId: string, societyId: string, category: string) {
    const policy = await slaPolicyRepository.getPolicyByCategory(societyId, category);
    
    let newLevel = 'SOCIETY_ADMIN'; // Fallback
    
    if (policy && policy.escalationLevels.length > 0) {
      // Find current level index in policy
      const complaint = await complaintRepository.getById(complaintId);
      if (complaint) {
        const currentIndex = policy.escalationLevels.indexOf(complaint.escalationLevel);
        
        // Bump to next level if available, otherwise stay at max
        if (currentIndex >= 0 && currentIndex < policy.escalationLevels.length - 1) {
          newLevel = policy.escalationLevels[currentIndex + 1];
        } else if (currentIndex === policy.escalationLevels.length - 1) {
          newLevel = policy.escalationLevels[currentIndex]; // already at max
        }
      }
    }

    await complaintRepository.update(complaintId, {
      isBreached: true,
      escalationLevel: newLevel as any
    });

    console.log(`[SLA BREACH DETECTED] Complaint ${complaintId} escalated to ${newLevel}.`);
    // NOTE: In production, trigger Push Notifications here to the Resident and the new Escalation Role.
  }
}

export const slaEscalationService = new SLAEscalationService();
