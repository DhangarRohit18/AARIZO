import type {
  MarketplaceListing,
  NeighbourhoodDirectoryEntry,
  LostAndFoundItem,
  ListingStatus,
  ListingType,
  ListingCategory,
} from '../types';
import { realtimeService } from '../../../services/realtimeService';

const MARKETPLACE_STORAGE_KEY = 'aarizo_marketplace_listings_v2';
const DIRECTORY_STORAGE_KEY = 'aarizo_neighbourhood_directory_v2';
const LOST_FOUND_STORAGE_KEY = 'aarizo_lost_found_v2';

const SEED_MARKETPLACE: MarketplaceListing[] = [
  {
    id: 'mkt-001',
    societyId: 'soc-gvs',
    sellerId: 'res-101',
    sellerName: 'Rohit Sharma',
    sellerFlat: 'A-402',
    sellerPhone: '+91 98234 11223',
    title: 'Pre-owned Whirlpool Double Door Refrigerator 340L',
    description: '3-star inverter linear compressor, flawless condition, 2 years old.',
    price: 14500,
    type: 'SELL',
    category: 'appliances',
    status: 'AVAILABLE',
    images: ['https://images.unsplash.com/photo-1571175443880-49e1d25b2bc5?w=600'],
    isModerated: false,
    createdAt: '2026-09-10T10:00:00Z',
    updatedAt: '2026-09-10T10:00:00Z',
  },
  {
    id: 'mkt-002',
    societyId: 'soc-gvs',
    sellerId: 'res-102',
    sellerName: 'Priya Verma',
    sellerFlat: 'B-201',
    sellerPhone: '+91 97123 88990',
    title: 'Wooden Study Table & Ergonomic Mesh Chair - FREE / REUSE',
    description: 'Relocating to another city. Giving away solid teak study desk and office chair for free to any neighbor in need.',
    price: 0,
    type: 'FREE_REUSE',
    category: 'furniture',
    status: 'AVAILABLE',
    images: ['https://images.unsplash.com/photo-1518455027359-f3f8164ba6bd?w=600'],
    isModerated: false,
    createdAt: '2026-09-12T14:30:00Z',
    updatedAt: '2026-09-12T14:30:00Z',
  },
  {
    id: 'mkt-003',
    societyId: 'soc-gvs',
    sellerId: 'res-103',
    sellerName: 'Anil Kulkarni',
    sellerFlat: 'C-704',
    sellerPhone: '+91 99887 66554',
    title: 'Looking to Borrow Power Drill set for weekend DIY',
    description: 'Need a masonry impact drill for 2 hours on Saturday. Will return promptly.',
    price: 0,
    type: 'BORROW',
    category: 'other',
    status: 'RESERVED',
    images: ['https://images.unsplash.com/photo-1504148455328-c376907d081c?w=600'],
    isModerated: false,
    createdAt: '2026-09-13T09:15:00Z',
    updatedAt: '2026-09-13T16:00:00Z',
  },
];

const SEED_DIRECTORY: NeighbourhoodDirectoryEntry[] = [
  {
    id: 'dir-01',
    name: 'Dr. Sameer Joshi',
    flat: 'A-301',
    tower: 'Tower A',
    phone: '+91 98220 55443',
    profession: 'Cardiologist',
    skills: ['Medical Advice', 'First Aid Responder', 'Yoga Instructor'],
    carpoolOptIn: true,
    carpoolDetails: 'Daily commute to Hinjewadi Phase 3 (Leaves at 8:30 AM)',
    petOwner: true,
    petDetails: 'Golden Retriever (Bruno)',
    volunteerOptIn: true,
    volunteerInterests: ['Emergency Medical Team', 'Society Cultural Events'],
  },
  {
    id: 'dir-02',
    name: 'Neha Kulkarni',
    flat: 'B-504',
    tower: 'Tower B',
    phone: '+91 97640 11998',
    profession: 'Software Architect',
    skills: ['Web Development', 'Math Tutoring', 'Guitar'],
    carpoolOptIn: false,
    petOwner: false,
    volunteerOptIn: true,
    volunteerInterests: ['IT & Digital Transformation', 'Green & Recycling Committee'],
  },
];

const SEED_LOST_FOUND: LostAndFoundItem[] = [
  {
    id: 'lf-01',
    societyId: 'soc-gvs',
    title: 'Car Remote Key Found near Clubhouse Fountain',
    description: 'Found a Hyundai 3-button smart key with a blue leather keychain.',
    type: 'FOUND',
    location: 'Clubhouse Garden Pathway',
    date: '2026-09-13',
    contactName: 'Ramesh Guard (Security Gate 1)',
    contactFlat: 'Gate Post 1',
    contactPhone: '+91 98111 00000',
    status: 'OPEN',
    createdAt: '2026-09-13T18:00:00Z',
  },
];

class CommunityMarketplaceEngine {
  private getStoredListings(): MarketplaceListing[] {
    const raw = localStorage.getItem(MARKETPLACE_STORAGE_KEY);
    if (!raw) {
      localStorage.setItem(MARKETPLACE_STORAGE_KEY, JSON.stringify(SEED_MARKETPLACE));
      return SEED_MARKETPLACE;
    }
    try {
      return JSON.parse(raw);
    } catch (e) {
      console.error('Failed to parse marketplace listings', e);
      return SEED_MARKETPLACE;
    }
  }

  private saveListings(listings: MarketplaceListing[]): void {
    localStorage.setItem(MARKETPLACE_STORAGE_KEY, JSON.stringify(listings));
    realtimeService.broadcast('MARKETPLACE_UPDATED', { count: listings.length });
  }

  public getListings(filter?: {
    type?: ListingType | 'ALL';
    category?: ListingCategory | 'ALL';
    status?: ListingStatus | 'ALL';
    searchQuery?: string;
  }): MarketplaceListing[] {
    let list = this.getStoredListings();

    if (filter) {
      if (filter.type && filter.type !== 'ALL') {
        list = list.filter((l) => l.type === filter.type);
      }
      if (filter.category && filter.category !== 'ALL') {
        list = list.filter((l) => l.category === filter.category);
      }
      if (filter.status && filter.status !== 'ALL') {
        list = list.filter((l) => l.status === filter.status);
      }
      if (filter.searchQuery && filter.searchQuery.trim() !== '') {
        const q = filter.searchQuery.toLowerCase();
        list = list.filter(
          (l) =>
            l.title.toLowerCase().includes(q) ||
            l.description.toLowerCase().includes(q) ||
            l.sellerName.toLowerCase().includes(q) ||
            l.sellerFlat.toLowerCase().includes(q)
        );
      }
    }

    return list.sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
  }

  public createListing(
    item: Omit<MarketplaceListing, 'id' | 'createdAt' | 'updatedAt' | 'isModerated'>
  ): MarketplaceListing {
    const listings = this.getStoredListings();
    const now = new Date().toISOString();
    const newListing: MarketplaceListing = {
      ...item,
      id: `mkt-${Date.now()}`,
      isModerated: false,
      createdAt: now,
      updatedAt: now,
    };
    listings.unshift(newListing);
    this.saveListings(listings);
    return newListing;
  }

  public updateListingStatus(id: string, status: ListingStatus): MarketplaceListing | null {
    const listings = this.getStoredListings();
    const index = listings.findIndex((l) => l.id === id);
    if (index === -1) return null;

    listings[index].status = status;
    listings[index].updatedAt = new Date().toISOString();
    this.saveListings(listings);
    return listings[index];
  }

  public moderateListing(id: string, hide: boolean, reason?: string): MarketplaceListing | null {
    const listings = this.getStoredListings();
    const index = listings.findIndex((l) => l.id === id);
    if (index === -1) return null;

    listings[index].isModerated = hide;
    listings[index].moderationReason = reason;
    listings[index].updatedAt = new Date().toISOString();
    this.saveListings(listings);
    return listings[index];
  }

  // --- Directory & Lost Found Methods ---

  public getDirectoryEntries(): NeighbourhoodDirectoryEntry[] {
    const raw = localStorage.getItem(DIRECTORY_STORAGE_KEY);
    if (!raw) {
      localStorage.setItem(DIRECTORY_STORAGE_KEY, JSON.stringify(SEED_DIRECTORY));
      return SEED_DIRECTORY;
    }
    return JSON.parse(raw);
  }

  public getLostAndFoundItems(): LostAndFoundItem[] {
    const raw = localStorage.getItem(LOST_FOUND_STORAGE_KEY);
    if (!raw) {
      localStorage.setItem(LOST_FOUND_STORAGE_KEY, JSON.stringify(SEED_LOST_FOUND));
      return SEED_LOST_FOUND;
    }
    return JSON.parse(raw);
  }

  public createLostAndFoundItem(
    item: Omit<LostAndFoundItem, 'id' | 'createdAt'>
  ): LostAndFoundItem {
    const raw = localStorage.getItem(LOST_FOUND_STORAGE_KEY);
    const items: LostAndFoundItem[] = raw ? JSON.parse(raw) : SEED_LOST_FOUND;
    const newItem: LostAndFoundItem = {
      ...item,
      id: `lf-${Date.now()}`,
      createdAt: new Date().toISOString(),
    };
    items.unshift(newItem);
    localStorage.setItem(LOST_FOUND_STORAGE_KEY, JSON.stringify(items));
    realtimeService.broadcast('LOST_FOUND_UPDATED', { id: newItem.id });
    return newItem;
  }
}

export const communityMarketplaceEngine = new CommunityMarketplaceEngine();
