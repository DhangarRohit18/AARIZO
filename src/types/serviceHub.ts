export type ServiceHubCategory =
  | 'GROCERY'
  | 'MEDICINE'
  | 'LAUNDRY'
  | 'SALON'
  | 'HOTEL_RESTAURANT'
  | 'TIFFIN'
  | 'HOME_CLEANING'
  | 'ELECTRICIAN'
  | 'PLUMBER'
  | 'AC_SERVICE'
  | 'APPLIANCE_REPAIR'
  | 'COURIER'
  | 'CAR_WASH'
  | 'OTHER';

export type VendorApprovalStatus = 'PENDING_APPROVAL' | 'APPROVED' | 'REJECTED' | 'SUSPENDED';

export type VendorAvailability = 'AVAILABLE' | 'BUSY' | 'OFFLINE';

export type MarketplaceOrderStatus =
  | 'PENDING'
  | 'ACCEPTED'
  | 'DISPATCHED_IN_PROGRESS'
  | 'DELIVERED_COMPLETED'
  | 'CANCELLED';

export interface VendorPartner {
  id: string;
  societyId: string;
  businessName: string;
  contactPerson: string;
  phone: string;
  email: string;
  category: ServiceHubCategory;
  approvalStatus: VendorApprovalStatus;
  availability: VendorAvailability;
  commissionPercentage: number; // e.g. 5%
  rating: number;
  ratingCount: number;
  bannerImage?: string;
  description: string;
  createdAt: string;
}

export interface ServiceCatalogItem {
  id: string;
  vendorId: string;
  societyId: string;
  title: string;
  category: ServiceHubCategory;
  price: number;
  description: string;
  imageUrl?: string;
  isAvailable: boolean;
  unit: string; // e.g. "per kg", "per service", "per session"
}

export interface OrderCartItem {
  itemId: string;
  title: string;
  price: number;
  quantity: number;
}

export interface MarketplaceOrder {
  id: string;
  orderNumber: string; // e.g. "ORD-2026-9912"
  societyId: string;
  vendorId: string;
  vendorName: string;
  flatId: string;
  flatCode: string;
  residentId: string;
  residentName: string;
  residentPhone: string;
  category: ServiceHubCategory;
  items: OrderCartItem[];
  subtotalAmount: number;
  commissionFee: number;
  totalAmount: number;
  status: MarketplaceOrderStatus;
  deliverySlot?: string;
  specialInstructions?: string;
  cancellationReason?: string;
  rating?: number;
  reviewNotes?: string;
  createdAt: string;
  updatedAt: string;
}
