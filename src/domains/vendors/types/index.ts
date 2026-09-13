export type VendorStatus = 'APPROVED' | 'SUSPENDED' | 'PREFERRED' | 'BLACKLISTED' | 'PENDING';

export interface VendorPerformanceMetrics {
  vendorId: string;
  vendorName: string;
  category: string;
  hourlyRateOrPrice: number;
  rating: number; // 1-5 scale based on resident & admin feedback history
  slaCompliancePercentage: number; // e.g. 96.5%
  averageResponseTimeMinutes: number; // e.g. 25 mins
  repeatComplaintsCount: number; // count of reopened/repeated complaints
  completedJobsCount: number; // total completed jobs / work orders
  customerSatisfactionPercentage: number; // e.g. 94%
  historicalDataPoints: {
    period: string; // e.g. "Aug 2026"
    jobsCompleted: number;
    avgRating: number;
    slaMetCount: number;
    totalSlaCount: number;
  }[];
}

export interface VendorScorecard {
  vendorId: string;
  vendorName: string;
  category: string;
  contactPerson: string;
  phone: string;
  email?: string;
  status: VendorStatus;
  isPubliclyRanked: boolean; // Controls whether residents can see vendor ratings/ranking
  metrics: VendorPerformanceMetrics;
  recentJobHistory: {
    jobId: string;
    title: string;
    date: string;
    rating: number;
    slaMet: boolean;
    responseTimeMinutes: number;
    residentFeedback?: string;
  }[];
  notes?: string;
}

export interface VendorComparisonResult {
  category: string;
  vendors: VendorScorecard[];
  recommendedVendorId?: string;
}
