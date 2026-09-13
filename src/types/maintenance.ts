export type MaintenanceCategory =
  | 'PLUMBING'
  | 'ELECTRICIAN'
  | 'CIVIL'
  | 'CARPENTRY'
  | 'PAINTING'
  | 'LIFT'
  | 'GENERATOR'
  | 'WATER'
  | 'ELECTRICAL'
  | 'SWIMMING_POOL'
  | 'HOUSEKEEPING'
  | 'GARBAGE'
  | 'PEST_CONTROL'
  | 'GARDENING'
  | 'SECURITY'
  | 'OTHER';

export type TicketUrgency = 'LOW' | 'MEDIUM' | 'HIGH' | 'EMERGENCY';

export type TicketStatus =
  | 'OPEN'
  | 'ASSIGNED'
  | 'ACCEPTED'
  | 'IN_PROGRESS'
  | 'ON_HOLD'
  | 'COMPLETED'
  | 'VERIFIED'
  | 'CLOSED';

export interface MaintenanceTicket {
  id: string;
  societyId: string;
  flatId: string;
  flatCode: string;
  residentId: string;
  residentName: string;
  category: MaintenanceCategory;
  urgency: TicketUrgency;
  description: string;
  mediaUrls: string[];
  status: TicketStatus;
  
  // Assignment & Resolution Details
  assignedVendorId?: string;
  assignedVendorName?: string;
  assignedTechnicianName?: string;
  scheduledVisitDate?: string;
  scheduledVisitTime?: string;
  slaTargetHours: number;
  isSlaBreached: boolean;
  
  // Work Output Details
  serviceNotes?: string;
  beforeImages?: string[];
  afterImages?: string[];
  
  // Rating & Feedback
  rating?: number; // 1 to 5 stars
  reviewNotes?: string;

  createdAt: string;
  updatedAt: string;
}

export type RecurringFrequency = 'DAILY' | 'WEEKLY' | 'BI_WEEKLY' | 'MONTHLY' | 'QUARTERLY';

export interface RecurringMaintenanceSchedule {
  id: string;
  societyId: string;
  title: string;
  category: MaintenanceCategory;
  frequency: RecurringFrequency;
  assignedVendorName: string;
  assignedTechnicianName: string;
  nextDueDate: string;
  lastCompletedDate?: string;
  status: 'ACTIVE' | 'PAUSED';
  description: string;
}

export interface MaintenanceCalendarEvent {
  id: string;
  societyId: string;
  title: string;
  category: MaintenanceCategory;
  eventDate: string; // YYYY-MM-DD
  eventTime: string;
  status: string;
  type: 'TICKET_VISIT' | 'RECURRING_TASK';
  referenceId: string;
  flatCode?: string;
  assignedTo?: string;
}
