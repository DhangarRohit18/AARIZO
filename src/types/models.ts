export interface BaseEntity {
  id: string;
  createdAt: string;
  updatedAt?: string;
}

export interface VisitorPass extends BaseEntity {
  visitorName: string;
  visitorPhone: string;
  visitorType: 'guest' | 'cab' | 'delivery' | 'service' | 'frequent';
  purpose?: string;
  residentId: string;
  residentName: string;
  flatCode: string;
  tower: string;
  passCode: string;
  qrCodeUrl?: string;
  validFrom: string;
  validUntil: string;
  status: 'expected' | 'at_gate' | 'approval_required' | 'approved' | 'checked_in' | 'checked_out' | 'rejected' | 'expired';
  gateName?: string;
  vehicleNumber?: string;
  photoUrl?: string;
  checkedInAt?: string;
  checkedOutAt?: string;
  rejectionReason?: string;
}

export interface MaintenanceBill extends BaseEntity {
  billNumber: string;
  accountReference: string;
  title: string;
  category: 'Maintenance' | 'Water' | 'Parking' | 'Clubhouse' | 'Penalty' | 'Other';
  flatNumber: string;
  residentName: string;
  totalAmount: number;
  amountPaid: number;
  outstandingAmount: number;
  dueDate: string;
  billingCycle: string;
  status: 'DUE' | 'PAID' | 'PARTIAL' | 'OVERDUE';
  description?: string;
}

export interface SupportTicket extends BaseEntity {
  ticketNumber: string;
  title: string;
  category: 'Plumbing' | 'Electrical' | 'Elevator' | 'Security' | 'Cleanliness' | 'Other';
  priority: 'low' | 'medium' | 'high' | 'urgent';
  status: 'open' | 'in_progress' | 'resolved' | 'closed';
  residentId: string;
  residentName: string;
  flatNumber: string;
  description: string;
  assignedTo?: string;
  resolvedAt?: string;
}

export interface SafetyAlert extends BaseEntity {
  alertType: 'PANIC' | 'FIRE' | 'MEDICAL' | 'BURGLARY' | 'GATE_SECURITY';
  severity: 'high' | 'critical';
  flatNumber: string;
  residentName: string;
  phone: string;
  status: 'ACTIVE' | 'ACKNOWLEDGED' | 'RESOLVED';
  triggeredAt: string;
  acknowledgedBy?: string;
  notes?: string;
}

export interface NoticeItem extends BaseEntity {
  title: string;
  content: string;
  category: 'General' | 'Maintenance Alert' | 'Security Alert' | 'Event / Celebration';
  priority: 'Normal' | 'Important' | 'Urgent';
  targetAudience: string;
  authorName: string;
  authorRole: string;
  acknowledgedCount: number;
}
