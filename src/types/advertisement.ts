export type AdTargetAudience = 'ALL' | 'RESIDENT' | 'VENDOR' | 'STAFF' | 'SECURITY' | 'ADMIN';

export type AdStatus = 'DRAFT' | 'SCHEDULED' | 'ACTIVE' | 'PAUSED' | 'EXPIRED';

export type AdFrequency = 'ONCE_PER_SESSION' | 'ONCE_PER_DAY' | 'ONCE_PER_CAMPAIGN' | 'ALWAYS';

export interface Advertisement {
  id: string;
  societyId: string;
  title: string;
  tagline?: string;
  description: string;
  imageUrl: string;
  targetRole?: string;
  targetAudience: AdTargetAudience;
  actionLabel: string;
  actionUrl: string;
  discountCode?: string;
  startAt: string; // ISO date string or YYYY-MM-DD
  endAt: string;   // ISO date string or YYYY-MM-DD
  priority: number; // 1-10 (higher means shown first)
  frequency: AdFrequency;
  status: AdStatus;
  createdBy: string;
  createdAt?: any;
  updatedAt?: any;
  impressionsCount: number;
  clicksCount: number;
  vendorId?: string;
  vendorName?: string;
}
