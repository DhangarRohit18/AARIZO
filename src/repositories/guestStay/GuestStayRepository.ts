import type { FirestoreDataConverter, QueryDocumentSnapshot, SnapshotOptions } from 'firebase/firestore';
import { BaseRepository } from '../BaseRepository';
import type { GuestRoom, GuestReservation } from '../../types/guestStay';

export class GuestRoomRepository extends BaseRepository<GuestRoom> {
  constructor() {
    super('guestRooms');
  }

  protected getConverter(): FirestoreDataConverter<GuestRoom> {
    return {
      toFirestore(room: GuestRoom): any {
        const { id, ...data } = room;
        return data;
      },
      fromFirestore(snapshot: QueryDocumentSnapshot, options: SnapshotOptions): GuestRoom {
        const data = snapshot.data(options);
        return {
          id: snapshot.id,
          societyId: data.societyId || '',
          roomNumber: data.roomNumber || '',
          roomName: data.roomName || '',
          type: data.type || 'DELUXE_ROOM',
          description: data.description || '',
          pricePerNight: data.pricePerNight || 0,
          capacity: data.capacity || 2,
          imageUrl: data.imageUrl,
          amenities: data.amenities || [],
          rules: data.rules || [],
          isAvailable: data.isAvailable !== undefined ? data.isAvailable : true,
          isActive: data.isActive !== undefined ? data.isActive : true,
          createdAt: data.createdAt || new Date().toISOString(),
        } as GuestRoom;
      }
    };
  }
}

export class GuestReservationRepository extends BaseRepository<GuestReservation> {
  constructor() {
    super('guestReservations');
  }

  protected getConverter(): FirestoreDataConverter<GuestReservation> {
    return {
      toFirestore(res: GuestReservation): any {
        const { id, ...data } = res;
        return data;
      },
      fromFirestore(snapshot: QueryDocumentSnapshot, options: SnapshotOptions): GuestReservation {
        const data = snapshot.data(options);
        return {
          id: snapshot.id,
          societyId: data.societyId || '',
          reservationNumber: data.reservationNumber || `RES-${snapshot.id.substring(0, 6).toUpperCase()}`,
          roomId: data.roomId || '',
          roomName: data.roomName || '',
          roomNumber: data.roomNumber || '',
          residentId: data.residentId || '',
          residentName: data.residentName || '',
          flatNumber: data.flatNumber || data.flatCode || '',
          primaryGuestName: data.primaryGuestName || data.guestName || '',
          primaryGuestPhone: data.primaryGuestPhone || data.guestPhone || '',
          idProofType: data.idProofType || 'Aadhaar',
          idProofNumber: data.idProofNumber || '',
          guestCount: data.guestCount || 1,
          checkInDate: data.checkInDate || '',
          checkOutDate: data.checkOutDate || '',
          totalNights: data.totalNights || 1,
          totalPrice: data.totalPrice !== undefined ? data.totalPrice : (data.totalAmount || 0),
          status: data.status || 'PENDING_APPROVAL',
          qrCode: data.qrCode || data.gatePassCode || '',
          checkInTimestamp: data.checkInTimestamp,
          checkOutTimestamp: data.checkOutTimestamp,
          adminNotes: data.adminNotes || data.specialRequests,
          createdAt: data.createdAt || new Date().toISOString(),
        } as GuestReservation;
      }
    };
  }
}

export const guestRoomRepository = new GuestRoomRepository();
export const guestReservationRepository = new GuestReservationRepository();
