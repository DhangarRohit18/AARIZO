// Helpdesk Domain Contracts Placeholder (Phase 1)
export interface HelpdeskTicket {
  id: string;
  ticketNumber: string;
  category: 'plumbing' | 'electrical' | 'elevator' | 'security' | 'other';
  title: string;
  description: string;
  priority: 'low' | 'medium' | 'high' | 'urgent';
  status: 'open' | 'assigned' | 'in_progress' | 'resolved' | 'closed';
  flatCode: string;
  createdAt: string;
  assignedTechnician?: string;
}
