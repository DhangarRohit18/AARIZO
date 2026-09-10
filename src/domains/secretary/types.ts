export type ResidentStatus = 'Active' | 'Pending Verification' | 'Rejected';
export type OwnershipType = 'Owner' | 'Tenant';

export interface SecretaryResidentRecord {
  id: string;
  name: string;
  flatNumber: string;
  blockWing: 'Block A' | 'Block B' | 'Block C';
  canonicalDisplay: string;
  type: OwnershipType;
  phone: string;
  email: string;
  vehiclesCount: number;
  familyCount: number;
  status: ResidentStatus;
  submittedAt: string;
  kycDocType?: string;
  approvalNote?: string;
  rejectionReason?: string;
}

export type NoticeCategory =
  | 'General Notice'
  | 'Maintenance Alert'
  | 'Event / Celebration'
  | 'Security Alert'
  | 'Emergency Broadcast';

export type NoticePriority = 'Normal' | 'Important' | 'Urgent';

export type NoticeTargetAudience =
  | 'All Blocks'
  | 'Block A'
  | 'Block B'
  | 'Block C'
  | 'Owners Only'
  | 'Tenants Only';

export type NoticeStatus = 'Published' | 'Draft' | 'Archived';

export interface SecretaryNoticeItem {
  id: string;
  title: string;
  category: NoticeCategory;
  priority: NoticePriority;
  targetAudience: NoticeTargetAudience;
  content: string;
  status: NoticeStatus;
  createdAt: string;
  publishedAt?: string;
  authorName: string;
  authorRole: string;
  acknowledgedCount: number;
}

export type PaymentCategory = 'maintenance' | 'parking' | 'amenity' | 'electricity';
export type PaymentStatus = 'DUE' | 'OVERDUE' | 'PAID' | 'FAILED';

export interface CanonicalBillingRecord {
  id: string;
  billNumber: string;
  accountReference: string;
  billingCycle: string;
  category: PaymentCategory;
  title: string;
  residentName: string;
  flatNumber: string;
  blockWing: string;
  canonicalDisplay: string;
  totalAmount: number;
  amountPaid: number;
  outstandingAmount: number;
  dueDate: string;
  status: PaymentStatus;
  paidAt?: string;
  paymentMethod?: 'upi' | 'card' | 'net_banking' | 'cash';
  description: string;
}

export interface CommitteeMemberRecord {
  id: string;
  name: string;
  designation: 'Secretary' | 'Chairman' | 'Treasurer' | 'Joint Secretary';
  flatNumber: string;
  blockWing: string;
  canonicalDisplay: string;
  phone: string;
  email: string;
  avatarUrl: string;
  termDuration: string;
}
