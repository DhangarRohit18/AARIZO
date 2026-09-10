// Support & Helpdesk Domain Types for CommunityOS

export type TicketCategory =
  | 'maintenance'
  | 'plumbing'
  | 'electrical'
  | 'housekeeping'
  | 'security'
  | 'common_area'
  | 'other';

export type TicketStatus = 'open' | 'in_progress' | 'resolved' | 'closed';

export interface TicketUpdateLog {
  id: string;
  timestamp: string;
  authorName: string;
  authorRole: 'resident' | 'staff' | 'manager';
  message: string;
}

export interface SupportTicket {
  id: string;
  ticketNumber: string;
  category: TicketCategory;
  subject: string;
  description: string;
  locationArea?: string;
  status: TicketStatus;
  createdAt: string;
  updatedAt: string;
  assignedStaffName?: string;
  assignedStaffRole?: string;
  updates: TicketUpdateLog[];
  flatCode: string;
  tower: string;
}
