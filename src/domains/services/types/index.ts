export type ServiceCategory =
  | 'PLUMBER'
  | 'ELECTRICIAN'
  | 'AC_REPAIR'
  | 'APPLIANCE_REPAIR'
  | 'PEST_CONTROL'
  | 'LAUNDRY'
  | 'CAR_WASH'
  | 'DRIVER'
  | 'GARDENER'
  | 'CLEANING'
  | 'GROCERY'
  | 'FOOD'
  | 'HOTEL_RESTAURANT'
  | 'COURIER'
  | 'OTHER';

export type RecurringScheduleType = 'ONE_TIME' | 'WEEKLY' | 'MONTHLY' | 'CUSTOM_SCHEDULE';

export type VendorStatus = 'PENDING_APPROVAL' | 'APPROVED' | 'SUSPENDED' | 'REJECTED';

export type VendorAvailability = 'AVAILABLE' | 'BUSY' | 'OFFLINE';

export type OrderStatus = 'PENDING' | 'ACCEPTED' | 'IN_PROGRESS' | 'COMPLETED' | 'CANCELLED';

export interface VendorPartner {
  id: string;
  societyId: string;
  businessName: string;
  contactPerson: string;
  phone: string;
  email: string;
  category: ServiceCategory;
  approvalStatus: VendorStatus;
  availability: VendorAvailability;
  rating: number;
  ratingCount: number;
  description: string;
  createdAt: string;
}

export interface ServiceItem {
  id: string;
  vendorId: string;
  title: string;
  category: ServiceCategory;
  price: number;
  unit: string; // e.g. "per service", "per session", "per month"
  description: string;
  isAvailable: boolean;
}

export interface ServiceBookingOrder {
  id: string;
  orderNumber: string;
  societyId: string;
  residentId: string;
  residentName: string;
  flatCode: string;
  phone: string;
  
  vendorId: string;
  vendorName: string;
  category: ServiceCategory;
  
  serviceTitle: string;
  price: number;
  recurringSchedule: RecurringScheduleType;
  customScheduleNotes?: string;
  
  scheduledDate: string;
  status: OrderStatus;
  
  rating?: number;
  reviewNotes?: string;
  
  createdAt: string;
  updatedAt: string;
}
