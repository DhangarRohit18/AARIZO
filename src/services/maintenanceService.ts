import type {
  MaintenanceTicket,
  RecurringMaintenanceSchedule,
  MaintenanceCalendarEvent,
  MaintenanceCategory,
  TicketUrgency,
  TicketStatus,
} from '../types/maintenance';
import { logAudit } from './societyService';
import { maintenanceTicketRepository } from '../repositories/maintenance/MaintenanceTicketRepository';

const STORAGE_KEYS = {
  TICKETS: 'communityos_maintenance_tickets_v5',
  RECURRING: 'communityos_maintenance_recurring_v5',
};

const SEED_TICKETS: MaintenanceTicket[] = [
  {
    id: 'maint-101',
    societyId: 'soc-gvs',
    flatId: 'flat-1204',
    flatCode: 'B-1204',
    residentId: 'res-1',
    residentName: 'Rajesh Kumar',
    category: 'PLUMBING',
    urgency: 'HIGH',
    description: 'Severe water leakage in master bathroom washbasin pipeline.',
    mediaUrls: ['https://images.unsplash.com/photo-1584622650111-993a426fbf0a?auto=format&fit=crop&w=400&q=80'],
    status: 'IN_PROGRESS',
    assignedVendorId: 'ven-plumb-1',
    assignedVendorName: 'Apex Plumbing Solutions',
    assignedTechnicianName: 'Suresh Kumar',
    scheduledVisitDate: '2026-09-13',
    scheduledVisitTime: '02:30 PM',
    slaTargetHours: 12,
    isSlaBreached: false,
    serviceNotes: 'Technician on site replacing broken coupling pipe.',
    beforeImages: ['https://images.unsplash.com/photo-1584622650111-993a426fbf0a?auto=format&fit=crop&w=400&q=80'],
    createdAt: '2026-09-13T09:00:00Z',
    updatedAt: '2026-09-13T11:00:00Z',
  },
  {
    id: 'maint-102',
    societyId: 'soc-gvs',
    flatId: 'flat-301',
    flatCode: 'C-301',
    residentId: 'res-3',
    residentName: 'Siddharth Patel',
    category: 'ELECTRICIAN',
    urgency: 'EMERGENCY',
    description: 'Main circuit breaker tripping repeatedly causing power loss.',
    mediaUrls: [],
    status: 'ASSIGNED',
    assignedVendorId: 'ven-elec-1',
    assignedVendorName: 'VoltTech Electricals',
    assignedTechnicianName: 'Amit Sharma',
    scheduledVisitDate: '2026-09-13',
    scheduledVisitTime: '04:00 PM',
    slaTargetHours: 4,
    isSlaBreached: false,
    createdAt: '2026-09-13T10:30:00Z',
    updatedAt: '2026-09-13T10:45:00Z',
  },
  {
    id: 'maint-103',
    societyId: 'soc-gvs',
    flatId: 'flat-402',
    flatCode: 'A-402',
    residentId: 'res-2',
    residentName: 'Ananya Roy',
    category: 'CARPENTRY',
    urgency: 'LOW',
    description: 'Balcony wooden door lock latch alignment loose.',
    mediaUrls: [],
    status: 'COMPLETED',
    assignedVendorId: 'ven-carp-1',
    assignedVendorName: 'Urban Woodcrafts',
    assignedTechnicianName: 'Ramesh Carpenter',
    scheduledVisitDate: '2026-09-12',
    scheduledVisitTime: '11:00 AM',
    slaTargetHours: 48,
    isSlaBreached: false,
    serviceNotes: 'Replaced screws and re-aligned latch strike plate.',
    afterImages: ['https://images.unsplash.com/photo-1508873696983-2df515122519?auto=format&fit=crop&w=400&q=80'],
    rating: 5,
    reviewNotes: 'Excellent quick service and polite behavior.',
    createdAt: '2026-09-11T14:00:00Z',
    updatedAt: '2026-09-12T12:30:00Z',
  },
];

const SEED_RECURRING: RecurringMaintenanceSchedule[] = [
  {
    id: 'rec-1',
    societyId: 'soc-gvs',
    title: 'Swimming Pool Cleaning & Chemical Balancing',
    category: 'SWIMMING_POOL',
    frequency: 'BI_WEEKLY',
    assignedVendorName: 'AquaClean Services',
    assignedTechnicianName: 'Vikram Pool Tech',
    nextDueDate: '2026-09-15',
    lastCompletedDate: '2026-09-01',
    status: 'ACTIVE',
    description: 'Full vacuum cleaning, filtration backwash, and chlorine level test.',
  },
  {
    id: 'rec-2',
    societyId: 'soc-gvs',
    title: 'Society Door-to-Door Garbage Collection',
    category: 'GARBAGE',
    frequency: 'DAILY',
    assignedVendorName: 'EcoWaste Management',
    assignedTechnicianName: 'Ravi Sanitation',
    nextDueDate: '2026-09-14',
    lastCompletedDate: '2026-09-13',
    status: 'ACTIVE',
    description: 'Daily wet and dry segregated waste collection from all towers.',
  },
  {
    id: 'rec-3',
    societyId: 'soc-gvs',
    title: 'Common Area Deep Cleaning & Sanitation',
    category: 'HOUSEKEEPING',
    frequency: 'WEEKLY',
    assignedVendorName: 'Sparkle Cleaners',
    assignedTechnicianName: 'Geeta Housekeeping',
    nextDueDate: '2026-09-17',
    lastCompletedDate: '2026-09-10',
    status: 'ACTIVE',
    description: 'Lobby floor mopping, elevator glass polishing, and staircase wash.',
  },
  {
    id: 'rec-4',
    societyId: 'soc-gvs',
    title: 'Tower Main Electrical Panel Inspection',
    category: 'ELECTRICAL',
    frequency: 'MONTHLY',
    assignedVendorName: 'VoltTech Electricals',
    assignedTechnicianName: 'Amit Sharma',
    nextDueDate: '2026-09-20',
    lastCompletedDate: '2026-08-20',
    status: 'ACTIVE',
    description: 'Thermal imaging inspection of busbars and breaker torque check.',
  },
  {
    id: 'rec-5',
    societyId: 'soc-gvs',
    title: 'Overhead Tank Plumbing & Valve Inspection',
    category: 'PLUMBING',
    frequency: 'MONTHLY',
    assignedVendorName: 'Apex Plumbing Solutions',
    assignedTechnicianName: 'Suresh Kumar',
    nextDueDate: '2026-09-22',
    lastCompletedDate: '2026-08-22',
    status: 'ACTIVE',
    description: 'Booster pump pressure check and check-valve leakage inspection.',
  },
  {
    id: 'rec-6',
    societyId: 'soc-gvs',
    title: 'Elevator & Lift Safety Audit Service',
    category: 'LIFT',
    frequency: 'MONTHLY',
    assignedVendorName: 'Schindler Elevator Corp',
    assignedTechnicianName: 'Karan Lift Expert',
    nextDueDate: '2026-09-25',
    lastCompletedDate: '2026-08-25',
    status: 'ACTIVE',
    description: 'Governor brake testing, emergency door unlock, and lubrication.',
  },
  {
    id: 'rec-7',
    societyId: 'soc-gvs',
    title: 'Backup Diesel Generator Service Run',
    category: 'GENERATOR',
    frequency: 'BI_WEEKLY',
    assignedVendorName: 'PowerGen Services',
    assignedTechnicianName: 'Manish Diesel Eng',
    nextDueDate: '2026-09-18',
    lastCompletedDate: '2026-09-04',
    status: 'ACTIVE',
    description: 'Engine oil level check, battery voltage test, and 15-min load test.',
  },
  {
    id: 'rec-8',
    societyId: 'soc-gvs',
    title: 'Society Pest Control & Fogging Drive',
    category: 'PEST_CONTROL',
    frequency: 'QUARTERLY',
    assignedVendorName: 'PestFree India',
    assignedTechnicianName: 'Deepak Fumigation',
    nextDueDate: '2026-10-01',
    lastCompletedDate: '2026-07-01',
    status: 'ACTIVE',
    description: 'Basement mosquito fogging, drain treatment, and cockroach gel spray.',
  },
];

function getItem<T>(key: string, defaultValue: T): T {
  try {
    const raw = localStorage.getItem(key);
    if (!raw) {
      localStorage.setItem(key, JSON.stringify(defaultValue));
      return defaultValue;
    }
    return JSON.parse(raw);
  } catch {
    return defaultValue;
  }
}

function setItem<T>(key: string, value: T): void {
  try {
    localStorage.setItem(key, JSON.stringify(value));
  } catch (err) {
    console.error(`Failed to save maintenance data to key ${key}:`, err);
  }
}

export const maintenanceService = {
  getTickets: (societyId: string): MaintenanceTicket[] =>
    getItem(STORAGE_KEYS.TICKETS, SEED_TICKETS).filter((t) => t.societyId === societyId),

  getRecurringSchedules: (societyId: string): RecurringMaintenanceSchedule[] =>
    getItem(STORAGE_KEYS.RECURRING, SEED_RECURRING).filter((s) => s.societyId === societyId),

  createTicket: (
    data: {
      societyId: string;
      flatId: string;
      flatCode: string;
      residentId: string;
      residentName: string;
      category: MaintenanceCategory;
      urgency: TicketUrgency;
      description: string;
      mediaUrls?: string[];
    },
    actor: { id: string; name: string; role: string }
  ): MaintenanceTicket => {
    const tickets = getItem(STORAGE_KEYS.TICKETS, SEED_TICKETS);
    const slaTargetHours =
      data.urgency === 'EMERGENCY' ? 4 : data.urgency === 'HIGH' ? 12 : data.urgency === 'MEDIUM' ? 24 : 48;

    const newTicket: MaintenanceTicket = {
      ...data,
      id: `maint-${Date.now()}`,
      mediaUrls: data.mediaUrls || [],
      status: 'OPEN',
      slaTargetHours,
      isSlaBreached: false,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };

    setItem(STORAGE_KEYS.TICKETS, [newTicket, ...tickets]);
    maintenanceTicketRepository.create(newTicket).catch(() => {});
    logAudit(data.societyId, actor, 'CREATE', 'MaintenanceTicket', newTicket.id, `Created ${data.category} request for ${data.flatCode}`);
    return newTicket;
  },

  assignTicket: (
    ticketId: string,
    data: {
      vendorId?: string;
      vendorName?: string;
      technicianName: string;
      scheduledVisitDate: string;
      scheduledVisitTime: string;
    },
    actor: { id: string; name: string; role: string }
  ): MaintenanceTicket | null => {
    const tickets = getItem(STORAGE_KEYS.TICKETS, SEED_TICKETS);
    const idx = tickets.findIndex((t) => t.id === ticketId);
    if (idx === -1) return null;

    tickets[idx].assignedVendorId = data.vendorId || 'ven-general';
    tickets[idx].assignedVendorName = data.vendorName || 'Society In-House Maintenance';
    tickets[idx].assignedTechnicianName = data.technicianName;
    tickets[idx].scheduledVisitDate = data.scheduledVisitDate;
    tickets[idx].scheduledVisitTime = data.scheduledVisitTime;
    tickets[idx].status = 'ASSIGNED';
    tickets[idx].updatedAt = new Date().toISOString();

    setItem(STORAGE_KEYS.TICKETS, tickets);
    maintenanceTicketRepository.update(ticketId, {
      assignedVendorId: tickets[idx].assignedVendorId,
      assignedVendorName: tickets[idx].assignedVendorName,
      assignedTechnicianName: tickets[idx].assignedTechnicianName,
      scheduledVisitDate: tickets[idx].scheduledVisitDate,
      scheduledVisitTime: tickets[idx].scheduledVisitTime,
      status: 'ASSIGNED',
    }).catch(() => {});
    logAudit(tickets[idx].societyId, actor, 'UPDATE', 'MaintenanceTicket', ticketId, `Assigned ticket to ${data.technicianName}`);
    return tickets[idx];
  },

  updateTicketStatus: (
    ticketId: string,
    status: TicketStatus,
    extra: {
      serviceNotes?: string;
      beforeImages?: string[];
      afterImages?: string[];
    },
    actor: { id: string; name: string; role: string }
  ): MaintenanceTicket | null => {
    const tickets = getItem(STORAGE_KEYS.TICKETS, SEED_TICKETS);
    const idx = tickets.findIndex((t) => t.id === ticketId);
    if (idx === -1) return null;

    tickets[idx].status = status;
    if (extra.serviceNotes) tickets[idx].serviceNotes = extra.serviceNotes;
    if (extra.beforeImages) tickets[idx].beforeImages = extra.beforeImages;
    if (extra.afterImages) tickets[idx].afterImages = extra.afterImages;
    tickets[idx].updatedAt = new Date().toISOString();

    setItem(STORAGE_KEYS.TICKETS, tickets);
    maintenanceTicketRepository.update(ticketId, {
      status,
      serviceNotes: extra.serviceNotes,
      beforeImages: extra.beforeImages,
      afterImages: extra.afterImages,
    }).catch(() => {});
    logAudit(tickets[idx].societyId, actor, 'STATUS_CHANGE', 'MaintenanceTicket', ticketId, `Updated status of ticket ${ticketId} to ${status}`);
    return tickets[idx];
  },

  rateTicket: (
    ticketId: string,
    rating: number,
    reviewNotes: string,
    actor: { id: string; name: string; role: string }
  ): MaintenanceTicket | null => {
    const tickets = getItem(STORAGE_KEYS.TICKETS, SEED_TICKETS);
    const idx = tickets.findIndex((t) => t.id === ticketId);
    if (idx === -1) return null;

    tickets[idx].rating = rating;
    tickets[idx].reviewNotes = reviewNotes;
    tickets[idx].status = 'CLOSED';
    tickets[idx].updatedAt = new Date().toISOString();

    setItem(STORAGE_KEYS.TICKETS, tickets);
    logAudit(tickets[idx].societyId, actor, 'UPDATE', 'MaintenanceTicket', ticketId, `Submitted ${rating}-star review for ticket ${ticketId}`);
    return tickets[idx];
  },

  createRecurringSchedule: (
    data: {
      societyId: string;
      title: string;
      category: MaintenanceCategory;
      frequency: RecurringMaintenanceSchedule['frequency'];
      assignedVendorName: string;
      assignedTechnicianName: string;
      nextDueDate: string;
      description: string;
    },
    actor: { id: string; name: string; role: string }
  ): RecurringMaintenanceSchedule => {
    const recurring = getItem(STORAGE_KEYS.RECURRING, SEED_RECURRING);
    const newSchedule: RecurringMaintenanceSchedule = {
      ...data,
      id: `rec-${Date.now()}`,
      status: 'ACTIVE',
    };

    setItem(STORAGE_KEYS.RECURRING, [newSchedule, ...recurring]);
    logAudit(data.societyId, actor, 'CREATE', 'RecurringMaintenanceSchedule', newSchedule.id, `Created recurring schedule: ${data.title}`);
    return newSchedule;
  },

  getCalendarEvents: (societyId: string): MaintenanceCalendarEvent[] => {
    const tickets = getItem(STORAGE_KEYS.TICKETS, SEED_TICKETS).filter((t) => t.societyId === societyId);
    const recurring = getItem(STORAGE_KEYS.RECURRING, SEED_RECURRING).filter((s) => s.societyId === societyId);

    const events: MaintenanceCalendarEvent[] = [];

    // Map scheduled ticket visits
    tickets.forEach((t) => {
      if (t.scheduledVisitDate) {
        events.push({
          id: `cal-t-${t.id}`,
          societyId: t.societyId,
          title: `[${t.flatCode}] ${t.category}: ${t.description.substring(0, 30)}...`,
          category: t.category,
          eventDate: t.scheduledVisitDate,
          eventTime: t.scheduledVisitTime || '10:00 AM',
          status: t.status,
          type: 'TICKET_VISIT',
          referenceId: t.id,
          flatCode: t.flatCode,
          assignedTo: t.assignedTechnicianName || 'Unassigned',
        });
      }
    });

    // Map recurring schedules
    recurring.forEach((r) => {
      if (r.nextDueDate) {
        events.push({
          id: `cal-r-${r.id}`,
          societyId: r.societyId,
          title: `[RECURRING] ${r.title}`,
          category: r.category,
          eventDate: r.nextDueDate,
          eventTime: '09:00 AM',
          status: r.status,
          type: 'RECURRING_TASK',
          referenceId: r.id,
          assignedTo: r.assignedTechnicianName,
        });
      }
    });

    return events;
  },
};
