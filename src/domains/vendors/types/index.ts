export type VendorStatus = 
  | 'PENDING' 
  | 'APPROVED' 
  | 'SUSPENDED' 
  | 'REJECTED' 
  | 'ACTIVE' 
  | 'PREFERRED' 
  | 'BLACKLISTED';

export type VendorApprovalStatus = 'PENDING' | 'APPROVED' | 'REJECTED';

export interface VendorProfile {
  id: string;
  uid: string;
  societyId: string;
  companyName: string;
  contactPerson: string;
  email: string;
  phone: string;
  category: string;
  address?: string;
  status: VendorStatus;
  approvalStatus: VendorApprovalStatus;
  rating?: number;
  totalReviews?: number;
  totalJobs?: number;
  verifiedDocumentsCount?: number;
  createdAt?: any;
  updatedAt?: any;
}

export type PricingType = 'FIXED' | 'STARTING_AT' | 'HOURLY' | 'PER_UNIT';
export type ServiceAvailability = 'AVAILABLE' | 'UNAVAILABLE' | 'WEEKDAYS_ONLY' | 'WEEKENDS_ONLY';

export interface VendorService {
  id: string;
  vendorId: string;
  vendorName?: string;
  societyId: string;
  title: string;
  description: string;
  category: string;
  price: number;
  pricingType: PricingType;
  images: string[];
  availability: ServiceAvailability;
  status: 'ACTIVE' | 'INACTIVE';
  createdAt?: any;
  updatedAt?: any;
}

export type VendorRequestStatus = 
  | 'PENDING'
  | 'ACCEPTED'
  | 'REJECTED'
  | 'SCHEDULED'
  | 'IN_PROGRESS'
  | 'COMPLETED'
  | 'CANCELLED';

export interface VendorRequest {
  id: string;
  orderNumber: string;
  societyId: string;
  residentId: string;
  residentName: string;
  residentPhone: string;
  flatCode: string;
  vendorId: string;
  vendorName: string;
  serviceId: string;
  serviceTitle: string;
  category: string;
  price: number;
  scheduledDate: string;
  timeSlot?: string;
  notes?: string;
  status: VendorRequestStatus;
  rating?: number;
  reviewNotes?: string;
  paymentStatus: 'UNPAID' | 'PAID' | 'REFUNDED';
  paymentId?: string;
  createdAt?: any;
  updatedAt?: any;
}

export type VendorDocumentType =
  | 'GST_CERTIFICATE'
  | 'BUSINESS_LICENSE'
  | 'INSURANCE'
  | 'AGREEMENT'
  | 'IDENTITY_PROOF'
  | 'CERTIFICATES'
  | 'OTHER';

export type DocumentVerificationStatus = 'PENDING' | 'VERIFIED' | 'REJECTED' | 'EXPIRED';

export interface VendorDocument {
  id: string;
  vendorId: string;
  societyId: string;
  documentType: VendorDocumentType;
  title: string;
  fileUrl: string;
  fileName: string;
  fileSize?: number;
  status: DocumentVerificationStatus;
  expiryDate?: string;
  uploadedAt: any;
  verifiedAt?: any;
  verifiedBy?: string;
  rejectionReason?: string;
}

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
