import { FirestoreDataConverter, QueryDocumentSnapshot, SnapshotOptions, Timestamp } from 'firebase/firestore';
import { BaseRepository } from '../BaseRepository';
import type { Parcel } from '../../domains/deliveries/types';

export class ParcelRepository extends BaseRepository<Parcel> {
  constructor() {
    super('parcels');
  }

  protected getConverter(): FirestoreDataConverter<Parcel> {
    return {
      toFirestore(parcel: Parcel): any {
        const { id, ...data } = parcel;
        
        let parsedArrivalTime = data.arrivalTime;
        if (typeof data.arrivalTime === 'string' && data.arrivalTime.length > 0) {
          parsedArrivalTime = Timestamp.fromDate(new Date(data.arrivalTime));
        }

        let parsedPickupTime = data.pickupTime;
        if (typeof data.pickupTime === 'string' && data.pickupTime.length > 0) {
          parsedPickupTime = Timestamp.fromDate(new Date(data.pickupTime));
        }

        let parsedExpiresAt = data.expiresAt;
        if (typeof data.expiresAt === 'string' && data.expiresAt.length > 0) {
          parsedExpiresAt = Timestamp.fromDate(new Date(data.expiresAt));
        }

        return {
          ...data,
          arrivalTime: parsedArrivalTime || null,
          pickupTime: parsedPickupTime || null,
          expiresAt: parsedExpiresAt || null,
        };
      },
      fromFirestore(
        snapshot: QueryDocumentSnapshot,
        options: SnapshotOptions
      ): Parcel {
        const data = snapshot.data(options);
        
        const createdAt = data.createdAt instanceof Timestamp ? data.createdAt.toDate().toISOString() : data.createdAt;
        const arrivalTime = data.arrivalTime instanceof Timestamp ? data.arrivalTime.toDate().toISOString() : data.arrivalTime;
        const pickupTime = data.pickupTime instanceof Timestamp ? data.pickupTime.toDate().toISOString() : data.pickupTime;
        const expiresAt = data.expiresAt instanceof Timestamp ? data.expiresAt.toDate().toISOString() : data.expiresAt;

        return {
          id: snapshot.id,
          societyId: data.societyId || '',
          residentId: data.residentId || '',
          residentName: data.residentName || '',
          flatCode: data.flatCode || '',
          authorizedPickupIds: data.authorizedPickupIds || [],
          courierCompany: data.courierCompany || '',
          courierName: data.courierName || '',
          trackingNumber: data.trackingNumber || '',
          barcodeQr: data.barcodeQr,
          storageLocation: data.storageLocation || '',
          status: data.status || 'EXPECTED',
          arrivalTime: arrivalTime || new Date().toISOString(),
          pickupOtp: data.pickupOtp || '',
          pickupQrCode: data.pickupQrCode || '',
          pickupTime: pickupTime,
          collectedBy: data.collectedBy,
          ageHours: data.ageHours || 0, // In UI this should ideally be computed dynamically based on arrivalTime
          isFlagged24h: data.isFlagged24h || false,
          isFlagged48h: data.isFlagged48h || false,
          notes: data.notes,
          createdAt: createdAt || new Date().toISOString(),
          expiresAt: expiresAt || new Date().toISOString(),
          createdBy: data.createdBy || ''
        } as Parcel;
      }
    };
  }
}

export const parcelRepository = new ParcelRepository();
