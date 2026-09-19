export type InsightContext = 
  | 'COMPLAINT_TRIAGE' 
  | 'DUPLICATE_DETECTION' 
  | 'PREDICTIVE_MAINTENANCE' 
  | 'VENDOR_PERFORMANCE' 
  | 'OPERATIONAL_SUMMARY';

export type InsightStatus = 'PENDING_REVIEW' | 'ACCEPTED' | 'REJECTED';

export interface AIInsight {
  id: string;
  societyId: string;
  entityId: string; // The ID of the Complaint, AMC, Vendor, etc.
  context: InsightContext;
  
  // Standardized AI Output payload
  recommendation: string; 
  reason: string;
  confidence: number; // 0.0 to 1.0
  supportingData: Record<string, any>;
  
  // Operational Resolution Status
  status: InsightStatus;
  reviewedBy?: string; // UID of the Admin/Secretary who approved/rejected it
  
  timestamp: string; // Creation ISO
  resolvedAt?: string; // Resolution ISO
}

// Payload for sending to the backend AI Service wrapper
export interface AIPromptPayload {
  societyId: string;
  entityId: string;
  context: InsightContext;
  rawInputData: Record<string, any>;
}
