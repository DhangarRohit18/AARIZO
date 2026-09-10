// Society Domain Contracts Placeholder (Phase 1)
export interface Tower {
  id: string;
  name: string;
  code: string;
  totalFloors: number;
  totalFlats: number;
}

export interface Flat {
  id: string;
  flatNumber: string;
  floorNumber: number;
  towerId: string;
  occupancyStatus: 'occupied_owner' | 'occupied_tenant' | 'vacant';
  primaryResidentName?: string;
  primaryResidentPhone?: string;
}

export interface Announcement {
  id: string;
  title: string;
  content: string;
  category: 'urgent' | 'event' | 'maintenance' | 'general';
  publishedAt: string;
  authorName: string;
}
