import type { Parcel, ParcelStatus, ParcelPickup, ParcelNotification } from '../types';
import { realtimeService } from '../../../services/realtimeService';
import { filterBySociety } from '../../../utils/societyIsolation';

const STORAGE_KEY_PARCELS = 'aarizo_parcels_v1';
const STORAGE_KEY_PICKUPS = 'aarizo_parcel_pickups_v1';
const STORAGE_KEY_NOTIFS = 'aarizo_parcel_notifications_v1';

const SEED_PARCELS: Parcel[] = [
  {
    id: 'PCL-901',
    societyId: 'soc-gvs',
    residentId: 'res-1',
    residentName: 'Vikram Joshi',
    flatCode: 'Tower B · B-1204',
    courierCompany: 'Amazon',
    courierName: 'Rajesh Kumar',
    trackingNumber: 'AMZ-IN-884029',
    barcodeQr: 'PCL-901-AMZ',
    storageLocation: 'Rack A-2',
    status: 'READY_FOR_PICKUP',
    arrivalTime: new Date(Date.now() - 3600000 * 5).toISOString(), // 5 hours ago
    pickupOtp: '849201',
    pickupQrCode: 'OTP:849201|PCL-901',
    ageHours: 5,
    isFlagged24h: false,
    isFlagged48h: false,
    notes: 'Electronics box',
  },
  {
    id: 'PCL-902',
    societyId: 'soc-gvs',
    residentId: 'res-2',
    residentName: 'Ananya Roy',
    flatCode: 'Tower A · A-402',
    courierCompany: 'Flipkart',
    courierName: 'Sunil Verma',
    trackingNumber: 'FKT-993021',
    barcodeQr: 'PCL-902-FKT',
    storageLocation: 'Locker 104',
    status: 'STORED',
    arrivalTime: new Date(Date.now() - 3600000 * 28).toISOString(), // 28 hours ago
    pickupOtp: '402918',
    pickupQrCode: 'OTP:402918|PCL-902',
    ageHours: 28,
    isFlagged24h: true,
    isFlagged48h: false,
    notes: 'Clothing package',
  },
  {
    id: 'PCL-903',
    societyId: 'soc-gvs',
    residentId: 'res-3',
    residentName: 'Mayuri Udar',
    flatCode: 'Tower C · C-301',
    courierCompany: 'Blinkit',
    courierName: 'Deepak Mali',
    trackingNumber: 'BLK-771029',
    barcodeQr: 'PCL-903-BLK',
    storageLocation: 'Reception Desk',
    status: 'COLLECTED',
    arrivalTime: new Date(Date.now() - 3600000 * 12).toISOString(),
    pickupOtp: '110293',
    pickupQrCode: 'OTP:110293|PCL-903',
    pickupTime: new Date(Date.now() - 3600000 * 2).toISOString(),
    collectedBy: 'Mayuri Udar',
    ageHours: 12,
    isFlagged24h: false,
    isFlagged48h: false,
  },
];

class ParcelRoomService {
  private getStorage<T>(key: string, defaultVal: T[]): T[] {
    try {
      const data = localStorage.getItem(key);
      return data ? JSON.parse(data) : defaultVal;
    } catch {
      return defaultVal;
    }
  }

  private setStorage<T>(key: string, val: T[]) {
    try {
      localStorage.setItem(key, JSON.stringify(val));
    } catch (e) {
      console.error('Storage save error', e);
    }
  }

  public getAllParcels(societyId = 'soc-gvs'): Parcel[] {
    let parcels = this.getStorage<Parcel>(STORAGE_KEY_PARCELS, SEED_PARCELS);
    
    // Recalculate aging flags dynamically
    const now = Date.now();
    parcels = parcels.map((p) => {
      if (p.status === 'COLLECTED' || p.status === 'RETURNED') return p;
      const arrival = new Date(p.arrivalTime).getTime();
      const ageHours = Math.floor((now - arrival) / (1000 * 3600));
      return {
        ...p,
        ageHours,
        isFlagged24h: ageHours >= 24 && ageHours < 48,
        isFlagged48h: ageHours >= 48,
        status: ageHours >= 72 && p.status !== 'COLLECTED' ? 'EXPIRED' : p.status,
      };
    });

    return filterBySociety(parcels, societyId);
  }

  public registerIncomingParcel(
    data: Omit<Parcel, 'id' | 'arrivalTime' | 'pickupOtp' | 'pickupQrCode' | 'ageHours' | 'isFlagged24h' | 'isFlagged48h' | 'status'>
  ): Parcel {
    const parcels = this.getStorage<Parcel>(STORAGE_KEY_PARCELS, SEED_PARCELS);
    const id = `PCL-${Math.floor(1000 + Math.random() * 9000)}`;
    const otp = Math.floor(100000 + Math.random() * 900000).toString();
    const nowIso = new Date().toISOString();

    const newParcel: Parcel = {
      ...data,
      id,
      arrivalTime: nowIso,
      pickupOtp: otp,
      pickupQrCode: `OTP:${otp}|${id}`,
      status: 'READY_FOR_PICKUP',
      ageHours: 0,
      isFlagged24h: false,
      isFlagged48h: false,
    };

    const updated = [newParcel, ...parcels];
    this.setStorage(STORAGE_KEY_PARCELS, updated);

    // Create Notification
    const notifs = this.getStorage<ParcelNotification>(STORAGE_KEY_NOTIFS, []);
    const newNotif: ParcelNotification = {
      id: `NOTIF-${Date.now()}`,
      societyId: data.societyId,
      residentId: data.residentId,
      parcelId: id,
      type: 'PARCEL_ARRIVED',
      message: `Your parcel from ${data.courierCompany} arrived at ${data.storageLocation}. Use OTP ${otp} for pickup.`,
      read: false,
      timestamp: nowIso,
    };
    this.setStorage(STORAGE_KEY_NOTIFS, [newNotif, ...notifs]);

    // Real-Time Event Broadcast across tabs
    realtimeService.publish('DELIVERY_STATUS', {
      type: 'PARCEL_REGISTERED',
      parcel: newParcel,
    }, data.societyId, 'SECURITY', 'Gate 1 Security Guard');

    return newParcel;
  }

  public verifyAndCollectParcel(
    parcelId: string,
    otpOrQr: string,
    verifiedByGuardId = 'guard-1'
  ): { success: boolean; message: string; parcel?: Parcel } {
    const parcels = this.getStorage<Parcel>(STORAGE_KEY_PARCELS, SEED_PARCELS);
    const targetIndex = parcels.findIndex((p) => p.id === parcelId);

    if (targetIndex === -1) {
      return { success: false, message: 'Parcel not found' };
    }

    const parcel = parcels[targetIndex];
    if (parcel.status === 'COLLECTED') {
      return { success: false, message: 'Parcel has already been collected' };
    }

    const cleanInput = otpOrQr.trim();
    const isOtpMatch = cleanInput === parcel.pickupOtp;
    const isQrMatch = cleanInput.includes(parcel.pickupOtp) || cleanInput.includes(parcel.id);

    if (!isOtpMatch && !isQrMatch) {
      return { success: false, message: 'Invalid OTP or QR code verification failed' };
    }

    const nowIso = new Date().toISOString();
    const updatedParcel: Parcel = {
      ...parcel,
      status: 'COLLECTED',
      pickupTime: nowIso,
      collectedBy: parcel.residentName,
    };

    parcels[targetIndex] = updatedParcel;
    this.setStorage(STORAGE_KEY_PARCELS, parcels);

    // Save pickup audit log
    const pickups = this.getStorage<ParcelPickup>(STORAGE_KEY_PICKUPS, []);
    const newPickup: ParcelPickup = {
      id: `PKP-${Date.now()}`,
      parcelId: updatedParcel.id,
      residentId: updatedParcel.residentId,
      otpUsed: cleanInput,
      pickupTime: nowIso,
      verifiedByGuardId,
    };
    this.setStorage(STORAGE_KEY_PICKUPS, [newPickup, ...pickups]);

    // Broadcast Realtime Event
    realtimeService.publish('DELIVERY_STATUS', {
      type: 'PARCEL_COLLECTED',
      parcel: updatedParcel,
    }, updatedParcel.societyId, 'SECURITY', 'Gate 1 Security Guard');

    return { success: true, message: 'Parcel successfully marked COLLECTED', parcel: updatedParcel };
  }
}

export const parcelRoomService = new ParcelRoomService();
