export type ListingType = 'SELL' | 'BUY' | 'BORROW' | 'FREE_REUSE';
export type ListingStatus = 'AVAILABLE' | 'RESERVED' | 'SOLD';
export type ListingCategory = 'appliances' | 'furniture' | 'services' | 'electronics' | 'books' | 'other';

export interface MarketplaceListing {
  id: string;
  societyId: string;
  sellerId: string;
  sellerName: string;
  sellerFlat: string;
  sellerPhone?: string;
  title: string;
  description: string;
  price: number; // 0 for FREE_REUSE
  type: ListingType;
  category: ListingCategory;
  status: ListingStatus;
  images: string[];
  isModerated: boolean;
  moderationReason?: string;
  createdAt: string;
  updatedAt: string;
}

export interface NeighbourhoodDirectoryEntry {
  id: string;
  name: string;
  flat: string;
  tower: string;
  phone: string;
  profession?: string;
  skills: string[];
  carpoolOptIn: boolean;
  carpoolDetails?: string;
  petOwner: boolean;
  petDetails?: string;
  volunteerOptIn: boolean;
  volunteerInterests?: string[];
}

export interface LostAndFoundItem {
  id: string;
  societyId: string;
  title: string;
  description: string;
  type: 'LOST' | 'FOUND';
  location: string;
  date: string;
  contactName: string;
  contactFlat: string;
  contactPhone: string;
  status: 'OPEN' | 'CLAIMED' | 'RESOLVED';
  imageUrl?: string;
  createdAt: string;
}
