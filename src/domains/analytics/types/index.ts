export interface HealthScoreComponent {
  name: string;
  score: number; // 0 to 100
  weight: number; // percentage weight e.g. 0.20
  weightedScore: number; // score * weight
  status: 'EXCELLENT' | 'GOOD' | 'FAIR' | 'CRITICAL';
  keyInput: string;
  details: string;
}

export interface SocietyHealthScoreData {
  overallScore: number; // 0 to 100
  grade: 'A+' | 'A' | 'B' | 'C' | 'D';
  status: 'OPTIMAL' | 'STABLE' | 'REQUIRES_ATTENTION' | 'CRITICAL';
  asOfDate: string;
  
  // 6 Core Operational Pillar Scores
  pillars: {
    securityHealth: HealthScoreComponent;
    operationsHealth: HealthScoreComponent;
    financialHealth: HealthScoreComponent;
    complianceHealth: HealthScoreComponent;
    residentExperience: HealthScoreComponent;
    sustainability: HealthScoreComponent;
  };

  // Historical trend points for AGM reporting
  historicalTrends: {
    period: string; // e.g. "Q1 2026", "Q2 2026", "Aug 2026", "Sept 2026"
    overallScore: number;
    security: number;
    operations: number;
    financial: number;
    compliance: number;
    residentExp: number;
    sustainability: number;
  }[];

  // Specific transparent inputs used in formulas
  rawInputs: {
    activeAmcCount: number;
    expiredAmcCount: number;
    complianceCertificateValidityPct: number;
    slaMetPct: number;
    repeatComplaintRatio: number;
    collectionPercentage: number;
    expenseBudgetVariancePct: number;
    solarWaterSensorStatusPct: number;
    wasteSegregationPct: number;
    gateSecurityIncidentCount: number;
  };
}
