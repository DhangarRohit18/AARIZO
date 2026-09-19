import { aiService } from '../../../repositories/ai/AIService';
import { complaintRepository } from '../../../repositories/complaints/ComplaintRepository';

export class ComplaintIntelligenceService {
  
  /**
   * Called immediately after a Complaint is created.
   * Generates prioritization and classification insights.
   */
  public async analyzeNewComplaint(societyId: string, complaintId: string): Promise<void> {
    const complaint = await complaintRepository.getById(complaintId);
    if (!complaint) return;

    // 1. Triage & Classification
    await aiService.generateInsight({
      societyId,
      entityId: complaintId,
      context: 'COMPLAINT_TRIAGE',
      rawInputData: {
        title: complaint.title,
        description: complaint.description
      }
    });

    // 2. Duplicate Detection
    // In production, we'd query recent complaints and pass them to the LLM or check vector similarity
    await aiService.generateInsight({
      societyId,
      entityId: complaintId,
      context: 'DUPLICATE_DETECTION',
      rawInputData: {
        title: complaint.title,
        description: complaint.description,
        recentComplaints: [] // Mocked for now
      }
    });
  }
}

export const complaintIntelligenceService = new ComplaintIntelligenceService();
