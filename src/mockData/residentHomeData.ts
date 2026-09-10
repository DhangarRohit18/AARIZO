// Typed Mock Dataset for Resident App Home (Phase 2A)

export interface ResidentProfileMock {
  name: string;
  greeting: string;
  societyName: string;
  tower: string;
  flatNumber: string;
  role: string;
  avatarUrl?: string;
  unreadNotifications: number;
}

export interface UrgentAlertMock {
  id: string;
  type: 'visitor_waiting' | 'payment_due' | 'water_maintenance' | 'emergency';
  title: string;
  message: string;
  timestamp: string;
  actionLabel?: string;
  severity: 'urgent' | 'warning' | 'info';
}

export interface VisitorStatusMock {
  expectedTodayCount: number;
  activeVisitor?: {
    id: string;
    name: string;
    type: 'guest' | 'cab' | 'delivery' | 'service';
    status: 'expected' | 'waiting_approval' | 'inside' | 'departed';
    expectedTime: string;
    phone?: string;
    vehicleNumber?: string;
    company?: string; // e.g. Uber, Zomato
    passcode: string;
  };
}

export interface AnnouncementMock {
  id: string;
  category: 'Urgent' | 'Maintenance' | 'Event' | 'General';
  title: string;
  summary: string;
  timestamp: string;
  priority?: boolean;
}

export interface UpcomingActivityMock {
  id: string;
  type: 'amenity' | 'visitor' | 'event' | 'maintenance';
  title: string;
  subtitle: string;
  timeSlot: string;
  statusBadge: string;
}

export interface AccountSnapshotMock {
  maintenanceDueAmount: number;
  dueDate: string;
  openTicketsCount: number;
  upcomingBookingsCount: number;
}

export const getDynamicGreeting = (): string => {
  const hour = new Date().getHours();
  if (hour < 12) return 'Good morning';
  if (hour < 17) return 'Good afternoon';
  return 'Good evening';
};

export const mockResidentProfile: ResidentProfileMock = {
  name: 'Sarvesh Kulkarni',
  greeting: getDynamicGreeting(),
  societyName: 'Lakeview Residency',
  tower: 'Tower B',
  flatNumber: 'Flat 1204',
  role: 'Resident Owner',
  unreadNotifications: 3,
};

export const mockUrgentAlert: UrgentAlertMock = {
  id: 'alert-101',
  type: 'visitor_waiting',
  title: 'Gate Entry Approval Required',
  message: 'Security Officer R. Singh is requesting entry approval for Food Delivery Agent at Main Gate.',
  timestamp: 'Just now',
  actionLabel: 'Review Request',
  severity: 'warning',
};

export const mockVisitorStatus: VisitorStatusMock = {
  expectedTodayCount: 2,
  activeVisitor: {
    id: 'vis-302',
    name: 'Rahul Sharma',
    type: 'guest',
    status: 'expected',
    expectedTime: 'Today • 6:30 PM',
    phone: '+91 98765 43210',
    passcode: '8492',
  },
};

export const mockAnnouncements: AnnouncementMock[] = [
  {
    id: 'ann-1',
    category: 'Maintenance',
    title: 'Scheduled Overhead Tank Cleaning',
    summary: 'Water supply to Tower A and Tower B will be suspended between 10:00 AM and 2:00 PM tomorrow.',
    timestamp: 'Today • 09:15 AM',
    priority: true,
  },
  {
    id: 'ann-2',
    category: 'Event',
    title: 'Annual Society General Body Meeting',
    summary: 'Join us at the Clubhouse Main Hall for the Q3 financial audit and RWA election nominations.',
    timestamp: 'Yesterday • 05:00 PM',
  },
  {
    id: 'ann-3',
    category: 'Urgent',
    title: 'EV Charging Station Slot Expansion',
    summary: 'Basement Parking B2 EV charging ports are now operational. Register your vehicle EV tag.',
    timestamp: '2 days ago',
  },
];

export const mockUpcomingActivities: UpcomingActivityMock[] = [
  {
    id: 'act-1',
    type: 'amenity',
    title: 'Tennis Court Booking',
    subtitle: 'Court #1 • Evening Slot',
    timeSlot: 'Today • 7:00 PM - 8:00 PM',
    statusBadge: 'Confirmed',
  },
  {
    id: 'act-2',
    type: 'maintenance',
    title: 'A/C Duct Inspection Ticket',
    subtitle: 'Ticket #TK-4029 • Assigned to Tech Ramesh',
    timeSlot: 'Tomorrow • 11:00 AM',
    statusBadge: 'In Progress',
  },
];

export const mockAccountSnapshot: AccountSnapshotMock = {
  maintenanceDueAmount: 4250,
  dueDate: '15 Sep 2026',
  openTicketsCount: 1,
  upcomingBookingsCount: 1,
};
