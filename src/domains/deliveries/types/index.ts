export type ParcelStatus =
  | 'EXPECTED'
  | 'RECEIVED'
  | 'STORED'
  | 'READY_FOR_PICKUP'
  | 'COLLECTED'
  | 'RETURNED'
  | 'EXPIRED';

export interface Courier {
  id: string;
  name: string;
  phone: string;
  company: 'Amazon' | 'Flipkart' | 'Blinkit' | 'Zepto' | 'Swiggy Instamart' | 'DHL' | 'FedEx' | 'Other';
  vehicleNumber?: string;
  photoUrl?: string;
}

export interface Parcel {
  id: string;
  societyId: string;
  residentId: string;
  residentName: string;
  flatCode: string;
  courierCompany: string;
  courierName?: string;
  trackingNumber: string;
  barcodeQr?: string;
  storageLocation: string; // e.g. "Rack A-1", "Locker 102", "Reception Desk"
  status: ParcelStatus;
  arrivalTime: string;
  pickupOtp: string; // 6-digit OTP
  pickupQrCode: string; // QR code string
  pickupTime?: string;
  collectedBy?: string;
  ageHours: number;
  isFlagged24h: boolean;
  isFlagged48h: boolean;
  notes?: string;
}

export interface DeliveryEntry {
  id: string;
  societyId: string;
  courierId: string;
  courierName: string;
  company: string;
  parcelCount: number;
  gateName: string;
  entryTime: string;
  exitTime?: string;
  status: 'IN_SOCIETY' | 'COMPLETED';
}

export interface ParcelPickup {
  id: string;
  parcelId: string;
  residentId: string;
  otpUsed: string;
  pickupTime: string;
  verifiedByGuardId: string;
}

export interface ParcelNotification {
  id: string;
  societyId: string;
  residentId: string;
  parcelId: string;
  type: 'PARCEL_ARRIVED' | 'PARCEL_STORED' | 'UNCOLLECTED_REMINDER_24H' | 'UNCOLLECTED_REMINDER_48H' | 'PARCEL_COLLECTED';
  message: string;
  read: boolean;
  timestamp: string;
}
