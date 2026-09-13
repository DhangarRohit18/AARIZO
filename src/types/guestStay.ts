export type RoomType =
  | 'STUDIO'
  | 'EXECUTIVE_SUITE'
  | 'DELUXE_ROOM'
  | 'PENTHOUSE_SUITE';

export type ReservationStatus =
  | 'PENDING_APPROVAL'
  | 'CONFIRMED'
  | 'CHECKED_IN'
  | 'CHECKED_OUT'
  | 'CANCELLED'
  | 'REJECTED';

export interface GuestRoom {
  id: string;
  societyId: string;
  roomNumber: string;
  roomName: string;
  type: RoomType;
  description: string;
  pricePerNight: number;
  capacity: number;
  imageUrl?: string;
  amenities: string[];
  rules: string[];
  isAvailable: boolean;
  isActive: boolean;
  createdAt: string;
}

export interface GuestReservation {
  id: string;
  societyId: string;
  reservationNumber: string;
  roomId: string;
  roomName: string;
  roomNumber: string;
  residentId: string;
  residentName: string;
  flatNumber: string;
  primaryGuestName: string;
  primaryGuestPhone: string;
  idProofType: string;
  idProofNumber: string;
  guestCount: number;
  checkInDate: string; // YYYY-MM-DD
  checkOutDate: string; // YYYY-MM-DD
  totalNights: number;
  totalPrice: number;
  status: ReservationStatus;
  qrCode: string;
  checkInTimestamp?: string;
  checkOutTimestamp?: string;
  adminNotes?: string;
  createdAt: string;
}

export interface GuestStaySettings {
  societyId: string;
  isGuestStayEnabled: boolean;
  checkInTimePolicy: string; // e.g. "12:00 PM"
  checkOutTimePolicy: string; // e.g. "10:00 AM"
  maxAdvanceBookingDays: number;
}
