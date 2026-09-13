import type {
  GuestRoom,
  GuestReservation,
  GuestStaySettings,
  ReservationStatus,
  RoomType
} from '../types/guestStay';

const ROOMS_STORAGE_KEY = 'communityos_guest_rooms';
const RESERVATIONS_STORAGE_KEY = 'communityos_guest_reservations';
const SETTINGS_STORAGE_KEY = 'communityos_guest_stay_settings';

const SEED_ROOMS: Omit<GuestRoom, 'societyId'>[] = [
  {
    id: 'room-101',
    roomNumber: '101',
    roomName: 'Royal Executive Guest Suite 101',
    type: 'EXECUTIVE_SUITE',
    description: 'Air-conditioned luxury suite with king bed, attached balcony, mini fridge, and high-speed WiFi.',
    pricePerNight: 2500,
    capacity: 2,
    imageUrl: 'https://images.unsplash.com/photo-1590490360182-c33d57733427?auto=format&fit=crop&w=800&q=80',
    amenities: ['King Size Bed', 'AC', 'Smart TV', 'WiFi', 'Attached Bathroom', 'Tea/Coffee Maker'],
    rules: ['Government ID Proof mandatory at gate', 'No smoking inside suite', 'Check-in: 12:00 PM / Check-out: 10:00 AM'],
    isAvailable: true,
    isActive: true,
    createdAt: new Date().toISOString()
  },
  {
    id: 'room-102',
    roomNumber: '102',
    roomName: 'Deluxe Garden View Room 102',
    type: 'DELUXE_ROOM',
    description: 'Comfortable guest bedroom overlooking central garden lawns with twin beds.',
    pricePerNight: 1800,
    capacity: 2,
    imageUrl: 'https://images.unsplash.com/photo-1566665797739-1674de7a421a?auto=format&fit=crop&w=800&q=80',
    amenities: ['Twin Beds', 'AC', 'WiFi', 'Attached Bathroom', 'Garden View Balcony'],
    rules: ['Government ID Proof mandatory', 'Check-out: 10:00 AM'],
    isAvailable: true,
    isActive: true,
    createdAt: new Date().toISOString()
  },
  {
    id: 'room-103',
    roomNumber: '103',
    roomName: 'Studio Guest Room 103',
    type: 'STUDIO',
    description: 'Compact studio room with queen bed and work desk, ideal for visiting relatives or single guests.',
    pricePerNight: 1400,
    capacity: 2,
    imageUrl: 'https://images.unsplash.com/photo-1582719478250-c89cae4dc85b?auto=format&fit=crop&w=800&q=80',
    amenities: ['Queen Bed', 'AC', 'Work Desk', 'WiFi', 'Attached Bathroom'],
    rules: ['Government ID Proof mandatory'],
    isAvailable: true,
    isActive: true,
    createdAt: new Date().toISOString()
  }
];

const SEED_RESERVATIONS: Omit<GuestReservation, 'societyId'>[] = [
  {
    id: 'resv-101',
    reservationNumber: 'GST-2026-8801',
    roomId: 'room-101',
    roomName: 'Royal Executive Guest Suite 101',
    roomNumber: '101',
    residentId: 'res-1',
    residentName: 'Anita Sharma',
    flatNumber: 'A-101',
    primaryGuestName: 'Vikram Sharma (Uncle)',
    primaryGuestPhone: '+91 98990 44332',
    idProofType: 'Aadhaar Card',
    idProofNumber: 'XXXX-XXXX-9912',
    guestCount: 2,
    checkInDate: new Date().toISOString().substring(0, 10),
    checkOutDate: new Date(Date.now() + 2 * 24 * 60 * 60 * 1000).toISOString().substring(0, 10),
    totalNights: 2,
    totalPrice: 5000,
    status: 'CONFIRMED',
    qrCode: 'GUEST-QR-8801-ROYAL',
    adminNotes: 'Approved by Society Admin. Payment recorded.',
    createdAt: new Date().toISOString()
  }
];

class GuestStayService {
  // --- SETTINGS & TOGGLE ---
  getSettings(societyId: string): GuestStaySettings {
    const raw = localStorage.getItem(SETTINGS_STORAGE_KEY);
    let allSettings: GuestStaySettings[] = raw ? JSON.parse(raw) : [];

    const target = allSettings.find(s => s.societyId === societyId);
    if (!target) {
      const defaultSettings: GuestStaySettings = {
        societyId,
        isGuestStayEnabled: true,
        checkInTimePolicy: '12:00 PM',
        checkOutTimePolicy: '10:00 AM',
        maxAdvanceBookingDays: 30
      };
      allSettings.push(defaultSettings);
      localStorage.setItem(SETTINGS_STORAGE_KEY, JSON.stringify(allSettings));
      return defaultSettings;
    }
    return target;
  }

  saveSettings(settings: GuestStaySettings): GuestStaySettings {
    const raw = localStorage.getItem(SETTINGS_STORAGE_KEY);
    let allSettings: GuestStaySettings[] = raw ? JSON.parse(raw) : [];

    const index = allSettings.findIndex(s => s.societyId === settings.societyId);
    if (index >= 0) {
      allSettings[index] = settings;
    } else {
      allSettings.push(settings);
    }

    localStorage.setItem(SETTINGS_STORAGE_KEY, JSON.stringify(allSettings));
    return settings;
  }

  // --- ROOMS MANAGEMENT ---
  getRooms(societyId: string): GuestRoom[] {
    const raw = localStorage.getItem(ROOMS_STORAGE_KEY);
    let items: GuestRoom[] = raw ? JSON.parse(raw) : [];

    const societyItems = items.filter(r => r.societyId === societyId);
    if (societyItems.length === 0) {
      const seeded = SEED_ROOMS.map(r => ({ ...r, societyId }));
      items = [...items, ...seeded];
      localStorage.setItem(ROOMS_STORAGE_KEY, JSON.stringify(items));
      return seeded;
    }
    return societyItems;
  }

  saveRoom(room: GuestRoom): GuestRoom {
    const raw = localStorage.getItem(ROOMS_STORAGE_KEY);
    let items: GuestRoom[] = raw ? JSON.parse(raw) : [];

    const index = items.findIndex(r => r.id === room.id);
    if (index >= 0) {
      items[index] = room;
    } else {
      items.unshift(room);
    }

    localStorage.setItem(ROOMS_STORAGE_KEY, JSON.stringify(items));
    return room;
  }

  createRoom(
    societyId: string,
    roomNumber: string,
    roomName: string,
    type: RoomType,
    description: string,
    pricePerNight: number,
    capacity: number,
    amenities: string[],
    rules: string[],
    imageUrl?: string
  ): GuestRoom {
    const newRoom: GuestRoom = {
      id: `room-${Date.now()}`,
      societyId,
      roomNumber,
      roomName,
      type,
      description,
      pricePerNight,
      capacity,
      imageUrl,
      amenities,
      rules,
      isAvailable: true,
      isActive: true,
      createdAt: new Date().toISOString()
    };

    return this.saveRoom(newRoom);
  }

  // --- RESERVATIONS MANAGEMENT ---
  getReservations(societyId: string): GuestReservation[] {
    const raw = localStorage.getItem(RESERVATIONS_STORAGE_KEY);
    let items: GuestReservation[] = raw ? JSON.parse(raw) : [];

    const societyItems = items.filter(r => r.societyId === societyId);
    if (societyItems.length === 0) {
      const seeded = SEED_RESERVATIONS.map(r => ({ ...r, societyId }));
      items = [...items, ...seeded];
      localStorage.setItem(RESERVATIONS_STORAGE_KEY, JSON.stringify(items));
      return seeded;
    }
    return societyItems;
  }

  requestReservation(
    societyId: string,
    roomId: string,
    residentId: string,
    residentName: string,
    flatNumber: string,
    primaryGuestName: string,
    primaryGuestPhone: string,
    idProofType: string,
    idProofNumber: string,
    guestCount: number,
    checkInDate: string,
    checkOutDate: string
  ): GuestReservation {
    const rooms = this.getRooms(societyId);
    const room = rooms.find(r => r.id === roomId);
    if (!room) throw new Error('Guest room not found');

    if (!room.isAvailable || !room.isActive) {
      throw new Error('Room is currently unavailable for stay requests');
    }

    // Calculate total nights
    const start = new Date(checkInDate);
    const end = new Date(checkOutDate);
    const diffTime = Math.abs(end.getTime() - start.getTime());
    const totalNights = Math.max(1, Math.ceil(diffTime / (1000 * 60 * 60 * 24)));
    const totalPrice = totalNights * room.pricePerNight;

    const reservationNumber = `GST-${new Date().getFullYear()}-${Math.floor(1000 + Math.random() * 9000)}`;
    const qrCode = `GUEST-QR-${reservationNumber}-${Math.random().toString(36).substring(2, 6).toUpperCase()}`;

    const newReservation: GuestReservation = {
      id: `resv-${Date.now()}`,
      societyId,
      reservationNumber,
      roomId: room.id,
      roomName: room.roomName,
      roomNumber: room.roomNumber,
      residentId,
      residentName,
      flatNumber,
      primaryGuestName,
      primaryGuestPhone,
      idProofType,
      idProofNumber,
      guestCount,
      checkInDate,
      checkOutDate,
      totalNights,
      totalPrice,
      status: 'CONFIRMED', // Auto-confirmed for demonstration
      qrCode,
      createdAt: new Date().toISOString()
    };

    const raw = localStorage.getItem(RESERVATIONS_STORAGE_KEY);
    const items: GuestReservation[] = raw ? JSON.parse(raw) : [];
    items.unshift(newReservation);
    localStorage.setItem(RESERVATIONS_STORAGE_KEY, JSON.stringify(items));

    return newReservation;
  }

  updateReservationStatus(societyId: string, reservationId: string, status: ReservationStatus, adminNotes?: string): GuestReservation {
    const raw = localStorage.getItem(RESERVATIONS_STORAGE_KEY);
    let items: GuestReservation[] = raw ? JSON.parse(raw) : [];

    const index = items.findIndex(r => r.id === reservationId && r.societyId === societyId);
    if (index === -1) throw new Error('Reservation not found');

    items[index].status = status;
    if (adminNotes) items[index].adminNotes = adminNotes;

    localStorage.setItem(RESERVATIONS_STORAGE_KEY, JSON.stringify(items));
    return items[index];
  }

  verifyGuestQRAndCheckIn(societyId: string, qrCodeStr: string): { allowed: boolean; message: string; reservation?: GuestReservation } {
    const reservations = this.getReservations(societyId);
    const resv = reservations.find(r => r.qrCode === qrCodeStr);

    if (!resv) {
      return { allowed: false, message: 'Invalid or unrecognized Guest Stay QR Pass' };
    }

    if (resv.status === 'CANCELLED' || resv.status === 'REJECTED') {
      return { allowed: false, message: `Reservation is ${resv.status.toLowerCase()}`, reservation: resv };
    }

    const nowISO = new Date().toISOString();

    // Check-in action if currently CONFIRMED
    if (resv.status === 'CONFIRMED') {
      resv.status = 'CHECKED_IN';
      resv.checkInTimestamp = nowISO;
      this.updateReservationStatus(societyId, resv.id, 'CHECKED_IN', 'Checked in at Gate Terminal');
      return {
        allowed: true,
        message: `✅ GUEST CHECK-IN VERIFIED! Welcome ${resv.primaryGuestName}. Assigned Room ${resv.roomNumber} (${resv.roomName}).`,
        reservation: resv
      };
    }

    // Check-out action if currently CHECKED_IN
    if (resv.status === 'CHECKED_IN') {
      resv.status = 'CHECKED_OUT';
      resv.checkOutTimestamp = nowISO;
      this.updateReservationStatus(societyId, resv.id, 'CHECKED_OUT', 'Checked out at Gate Terminal');
      return {
        allowed: true,
        message: `👋 GUEST CHECK-OUT RECORDED! Room ${resv.roomNumber} checkout complete for ${resv.primaryGuestName}.`,
        reservation: resv
      };
    }

    if (resv.status === 'CHECKED_OUT') {
      return { allowed: false, message: 'Guest stay reservation has already been checked out', reservation: resv };
    }

    return { allowed: true, message: `Guest reservation active: ${resv.status}`, reservation: resv };
  }
}

export const guestStayService = new GuestStayService();
