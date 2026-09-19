import type { ComplaintCategory } from '../../domains/complaints/types';
import { complaintRepository } from './ComplaintRepository';
import { slaPolicyRepository } from './SLAPolicyRepository';

export class ComplaintService {
  /**
   * Creates a new complaint and automatically assigns the correct SLA deadline
   */
  public async createComplaint(
    societyId: string,
    residentId: string,
    residentName: string,
    flatCode: string,
    category: ComplaintCategory,
    title: string,
    description: string,
    urgency: 'LOW' | 'MEDIUM' | 'HIGH' | 'CRITICAL' = 'LOW'
  ): Promise<string> {
    
    // Fetch the specific SLA policy for this category
    const policy = await slaPolicyRepository.getPolicyByCategory(societyId, category);
    
    // Default SLA fallback if not configured (2 hours)
    const slaMinutes = policy ? policy.slaMinutes : 120;
    
    // Calculate precise deadline
    const deadlineDate = new Date();
    deadlineDate.setMinutes(deadlineDate.getMinutes() + slaMinutes);

    const initialEscalationLevel = policy && policy.escalationLevels.length > 0 
      ? policy.escalationLevels[0] 
      : 'STAFF';

    const complaintId = await complaintRepository.create({
      societyId,
      residentId,
      residentName,
      flatCode,
      category,
      title,
      description,
      location: flatCode, // default location
      urgency,
      status: 'OPEN',
      escalationLevel: initialEscalationLevel,
      slaMinutes,
      dueAt: deadlineDate.toISOString(),
      isWarningState: false,
      isBreached: false,
      reopenCount: 0,
      resolutionHistory: []
    } as any);

    return complaintId;
  }

  /**
   * Called by Staff/Manager to mark the work as completed, pausing SLA.
   */
  public async markAsResolved(complaintId: string, staffId: string, notes: string): Promise<void> {
    const complaint = await complaintRepository.getById(complaintId);
    if (!complaint) throw new Error("Complaint not found");

    const resolutionAttempt = {
      attemptIndex: complaint.reopenCount + 1,
      resolvedBy: staffId,
      resolutionNotes: notes,
      timestamp: new Date().toISOString()
    };

    const newHistory = [...(complaint.resolutionHistory || []), resolutionAttempt];

    await complaintRepository.update(complaintId, {
      status: 'RESOLVED', // Note: mapped to VERIFICATION_REQUIRED in UI
      resolvedAt: new Date().toISOString(),
      resolutionHistory: newHistory
    });
  }

  /**
   * Resident verifies that the issue is fully fixed. Closes the ticket.
   */
  public async residentAcceptsResolution(complaintId: string): Promise<void> {
    await complaintRepository.update(complaintId, {
      status: 'CLOSED',
      closedAt: new Date().toISOString()
    });
  }

  /**
   * Resident rejects the resolution. SLA timer resumes and escalation continues.
   */
  public async residentRejectsResolution(complaintId: string, feedback: string): Promise<void> {
    const complaint = await complaintRepository.getById(complaintId);
    if (!complaint) throw new Error("Complaint not found");

    const history = complaint.resolutionHistory || [];
    if (history.length > 0) {
      // Annotate the latest attempt with the resident's feedback
      history[history.length - 1].isVerifiedByResident = false;
      history[history.length - 1].residentFeedbackNotes = feedback;
    }

    // Give a standard SLA grace period extension for re-opened complaints (e.g. + 1 hour)
    const newDeadline = new Date();
    newDeadline.setMinutes(newDeadline.getMinutes() + 60);

    await complaintRepository.update(complaintId, {
      status: 'IN_PROGRESS',
      reopenCount: (complaint.reopenCount || 0) + 1,
      resolutionHistory: history,
      dueAt: newDeadline.toISOString(),
      resolvedAt: null as any // clear the resolved timestamp
    });
  }
}

export const complaintService = new ComplaintService();


