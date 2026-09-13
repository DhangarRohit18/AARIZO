export interface AIComplaintClassification {
  category: string;
  priority: 'LOW' | 'MEDIUM' | 'HIGH' | 'CRITICAL';
  suggestedVendorOrStaff: string;
  confidenceScore: number; // e.g. 0.94
  rationale: string;
}

export interface AIMoveConciergePlan {
  query: string;
  liftSlotRequirements: {
    suggestedDate: string;
    suggestedTimeSlot: string;
    paddingRequired: string;
  };
  gatepassChecklist: string[];
  vendorChecklist: string[];
  vehicleDetails: {
    recommendedVehicleType: string;
    maxWeightCapacity: string;
  };
  nocRequirements: string[];
  disclaimer: string;
}

export interface AIDuplicateDetectionResult {
  isLikelySpamOrDuplicate: boolean;
  duplicateConfidence: number; // e.g. 0.88
  matchedExistingId?: string;
  reason: string;
}

export interface AIPredictiveMaintenanceAlert {
  assetId: string;
  assetName: string;
  failureRiskPercentage: number; // e.g. 85%
  riskLevel: 'LOW' | 'MODERATE' | 'HIGH' | 'CRITICAL';
  failureIndicators: string[];
  recommendedAction: string;
}

export interface AIVernacularVoiceParsing {
  spokenLanguage: string;
  rawTranscript: string;
  structuredCategory: 'patrol' | 'cleaning_checkpoint' | 'incident' | 'task_update';
  extractedDetails: {
    location?: string;
    status?: string;
    notes?: string;
    timestamp?: string;
  };
}

export interface AISocietyHealthSummary {
  scoreChangeExplanation: string;
  keyDrivers: string[];
  recommendations: string[];
  disclaimer: string;
}
