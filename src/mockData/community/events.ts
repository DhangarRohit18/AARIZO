import type { CommunityEvent } from '../../domains/community';

export const mockEvents: CommunityEvent[] = [
  {
    id: 'EVT-301',
    title: 'Lakeview Independence Day & Cultural Carnival',
    category: 'event',
    date: '15 Sep 2026',
    time: '05:00 PM - 09:00 PM',
    location: 'Central Garden Amphitheatre',
    organizer: 'Lakeview Cultural Committee',
    description:
      'Annual community cultural evening featuring children dance performances, live music, food stalls, and flag hoisting ceremony.',
    attendeesCount: 48,
    userRsvp: 'going',
    maxCapacity: 150,
    contactPerson: 'Mrs. Anjali Deshmukh (Flat 802)',
  },
  {
    id: 'EVT-302',
    title: 'Monsoon Table Tennis Tournament (Doubles & Singles)',
    category: 'event',
    date: '12 Sep 2026',
    time: '10:00 AM - 06:00 PM',
    location: 'Clubhouse Sports Complex (1st Floor)',
    organizer: 'Sports Club RWA',
    description:
      'Inter-tower table tennis championship open for Men, Women & Juniors. Trophies and gift vouchers for winners.',
    attendeesCount: 24,
    userRsvp: 'none',
    maxCapacity: 32,
    contactPerson: 'Mr. Vikram Mehta (Flat 401)',
  },
  {
    id: 'EVT-303',
    title: 'Waste Segregation & Home Composting Workshop',
    category: 'general',
    date: '18 Sep 2026',
    time: '11:00 AM - 12:30 PM',
    location: 'Community Hall B',
    organizer: 'Green Lakeview Eco Club',
    description:
      'Learn wet waste home composting techniques, plastic reduction tips, and eco-friendly household living.',
    attendeesCount: 19,
    userRsvp: 'maybe',
    maxCapacity: 40,
    contactPerson: 'Dr. Sunita Rao (Flat 1103)',
  },
];
