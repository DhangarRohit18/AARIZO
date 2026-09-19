import type { FirestoreDataConverter, QueryDocumentSnapshot, SnapshotOptions } from 'firebase/firestore';
import { BaseRepository } from '../BaseRepository';
import type { SocietyAmenity, AmenityBooking } from '../../types/amenity';

export class AmenityRepository extends BaseRepository<SocietyAmenity> {
  constructor() {
    super('amenities');
  }

  protected getConverter(): FirestoreDataConverter<SocietyAmenity> {
    return {
      toFirestore(amenity: SocietyAmenity): any {
        const { id, ...data } = amenity;
        return data;
      },
      fromFirestore(snapshot: QueryDocumentSnapshot, options: SnapshotOptions): SocietyAmenity {
        const data = snapshot.data(options);
        return {
          id: snapshot.id,
          societyId: data.societyId || '',
          name: data.name || '',
          type: data.type || 'COMMUNITY_HALL',
          description: data.description || '',
          location: data.location || '',
          capacityPerSlot: data.capacityPerSlot || 10,
          openTime: data.openTime || '06:00',
          closeTime: data.closeTime || '22:00',
          slotDurationMinutes: data.slotDurationMinutes || 60,
          requiresApproval: data.requiresApproval || false,
          isBookable: data.isBookable !== undefined ? data.isBookable : true,
          isActive: data.isActive !== undefined ? data.isActive : true,
          imageUrl: data.imageUrl,
          rules: data.rules || [],
          blackoutDates: data.blackoutDates || [],
          maintenanceSchedules: data.maintenanceSchedules || [],
          createdAt: data.createdAt || new Date().toISOString(),
          updatedAt: data.updatedAt || new Date().toISOString(),
        } as SocietyAmenity;
      }
    };
  }
}

export class AmenityBookingRepository extends BaseRepository<AmenityBooking> {
  constructor() {
    super('amenityBookings');
  }

  protected getConverter(): FirestoreDataConverter<AmenityBooking> {
    return {
      toFirestore(booking: AmenityBooking): any {
        const { id, ...data } = booking;
        return data;
      },
      fromFirestore(snapshot: QueryDocumentSnapshot, options: SnapshotOptions): AmenityBooking {
        const data = snapshot.data(options);
        return {
          id: snapshot.id,
          societyId: data.societyId || '',
          amenityId: data.amenityId || '',
          amenityName: data.amenityName || '',
          residentId: data.residentId || '',
          residentName: data.residentName || '',
          flatNumber: data.flatNumber || data.flatCode || '',
          bookingDate: data.bookingDate || data.date || '',
          startTime: data.startTime || '',
          endTime: data.endTime || '',
          guestCount: data.guestCount || data.attendeesCount || 1,
          purpose: data.purpose,
          status: data.status || 'CONFIRMED',
          adminNotes: data.adminNotes,
          createdAt: data.createdAt || new Date().toISOString(),
          updatedAt: data.updatedAt || new Date().toISOString(),
        } as AmenityBooking;
      }
    };
  }
}

export const amenityRepository = new AmenityRepository();
export const amenityBookingRepository = new AmenityBookingRepository();
