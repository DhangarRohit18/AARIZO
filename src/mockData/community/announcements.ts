import type { CommunityAnnouncement } from '../../domains/community';

export const mockAnnouncements: CommunityAnnouncement[] = [
  {
    id: 'ANN-201',
    title: 'Scheduled Overhead Tank & Main Sump Cleaning',
    category: 'utility',
    priority: 'urgent',
    publishedDate: '06 Sep 2026',
    authorName: 'Estate Manager V. Verma',
    authorRole: 'Estate Operations Manager',
    summary:
      'Water supply to all towers (Tower A, B & C) will be suspended from 9 AM to 4 PM for bi-annual tank cleaning and chlorination. Please store sufficient water.',
    content:
      'Dear Residents,\n\nPlease be informed that the bi-annual cleaning, flushing, and chlorination of all overhead water tanks and the main underground storage sump is scheduled for Tuesday, 08 September 2026.\n\nWater supply will remain completely shut off between 09:00 AM and 04:00 PM across all towers.\n\nKey instructions for residents:\n1. Store adequate drinking and domestic water in advance.\n2. Ensure all household taps and washing machine inlets are tightly closed before 09:00 AM to prevent air-lock.\n3. Upon restoration at 04:00 PM, run taps for 1-2 minutes to flush out initial discolored water.\n\nWe apologize for the temporary inconvenience.',
    isRead: false,
    effectiveDate: '08 Sep 2026, 09:00 AM - 04:00 PM',
    locationArea: 'All Towers (Tower A, B & C)',
  },
  {
    id: 'ANN-202',
    title: 'EV Charging Station Installation & Slot Booking',
    category: 'rwa',
    priority: 'important',
    publishedDate: '04 Sep 2026',
    authorName: 'RWA President R. K. Sharma',
    authorRole: 'RWA Management Committee',
    summary:
      'RWA has commissioned 6 new 22kW Fast EV Chargers in Basement B2. Slots can be requested via Helpdesk ticket.',
    content:
      'Dear Green Valley Society Residents,\n\nWe are pleased to announce the commissioning of 6 new 22kW AC Type-2 Fast EV Charging Stations in Basement B2 (near Pillar B2-14).\n\nResidents wishing to register their EV for dedicated slot access or monthly billing integration can submit a Helpdesk ticket under "Parking & EV".\n\nCharging Rate: ₹9.50 per kWh (metered per flat unit account).',
    isRead: false,
    locationArea: 'Basement B2 (Pillar B2-14)',
  },
  {
    id: 'ANN-203',
    title: 'Monsoon Drainage System Inspection & Security Protocol',
    category: 'security',
    priority: 'important',
    publishedDate: '01 Sep 2026',
    authorName: 'Chief Security Officer Guard Inspector Subhash',
    authorRole: 'Gate Security Head',
    summary:
      'Guard team instructed to inspect storm drains twice daily during heavy rainfall. High-speed guest vehicles restricted near clubhouse curve.',
    content:
      'Security Advisory for All Residents & Drivers:\n\nIn view of continuous monsoon showers, gate security officers are performing 4-hourly storm drain clearings. Please ensure no flower pots or trash items are left near balcony drainage outlets.\n\nAlso, speed limits inside society premises are strictly capped at 15 km/h. Wet roads near the clubhouse curve require extra caution.',
    isRead: true,
    locationArea: 'Society Internal Roads & Gates',
  },
  {
    id: 'ANN-204',
    title: 'Annual General Body Meeting (AGM 2026) Date Announced',
    category: 'rwa',
    priority: 'normal',
    publishedDate: '28 Aug 2026',
    authorName: 'RWA General Secretary P. Nair',
    authorRole: 'RWA Executive Board',
    summary:
      'RWA Management Committee invites all registered flat owners to the annual GMB meeting in the Main Clubhouse Amphitheatre.',
    content:
      'Notice is hereby given that the Annual General Body Meeting (AGM 2026) of Lakeview Residency Apartment Owners Association will be held on Sunday, 20 September 2026 at 11:00 AM in the Clubhouse Amphitheatre.\n\nAgenda items include financial audit review, sinking fund allocation, security vendor renewal, and sports complex lighting upgrade approval.',
    isRead: true,
    effectiveDate: '20 Sep 2026, 11:00 AM',
    locationArea: 'Main Clubhouse Amphitheatre',
  },
  {
    id: 'ANN-205',
    title: 'Clubhouse Swimming Pool Filtration Maintenance Completed',
    category: 'maintenance',
    priority: 'normal',
    publishedDate: '25 Aug 2026',
    authorName: 'Maintenance Lead Technician Ramesh Kumar',
    authorRole: 'Facility Maintenance Staff',
    summary:
      'Dual sand filter replacement complete. Swimming pool re-opened for resident swimming hours (06:00 AM - 09:00 PM).',
    content:
      'Maintenance Update:\n\nThe scheduled dual sand filter replacement and chemical pH balance calibration for the main swimming pool has been completed successfully.\n\nThe pool is now fully operational during regular resident hours:\n- Morning: 06:00 AM - 10:00 AM\n- Evening: 04:30 PM - 09:00 PM\n\nPlease shower before entering the pool.',
    isRead: true,
    locationArea: 'Clubhouse Swimming Pool',
  },
];
