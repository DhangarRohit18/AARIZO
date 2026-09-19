import type { FirestoreDataConverter, QueryDocumentSnapshot, SnapshotOptions } from 'firebase/firestore';
import { BaseRepository } from '../BaseRepository';
import type { ParkingSlot, ParkingRequest } from '../../types/parking';

export class ParkingSlotRepository extends BaseRepository<ParkingSlot> {
  constructor() {
    super('parkingSlots');
  }

  protected getConverter(): FirestoreDataConverter<ParkingSlot> {
    return {
      toFirestore(slot: ParkingSlot): any {
        const { id, ...data } = slot;
        return data;
      },
      fromFirestore(snapshot: QueryDocumentSnapshot, options: SnapshotOptions): ParkingSlot {
        const data = snapshot.data(options);
        return {
          id: snapshot.id,
          societyId: data.societyId || '',
          slotNumber: data.slotNumber || '',
          level: data.level || 'Ground',
          slotType: data.slotType || 'RESIDENT',
          occupancyState: data.occupancyState || 'AVAILABLE',
          assignedFlatId: data.assignedFlatId,
          assignedFlatCode: data.assignedFlatCode,
          assignedResidentName: data.assignedResidentName,
          assignedVehicleNumber: data.assignedVehicleNumber,
          qrDataString: data.qrDataString || '',
          updatedAt: data.updatedAt || new Date().toISOString(),
        } as ParkingSlot;
      }
    };
  }
}

export class ParkingRequestRepository extends BaseRepository<ParkingRequest> {
  constructor() {
    super('parkingRequests');
  }

  protected getConverter(): FirestoreDataConverter<ParkingRequest> {
    return {
      toFirestore(req: ParkingRequest): any {
        const { id, ...data } = req;
        return data;
      },
      fromFirestore(snapshot: QueryDocumentSnapshot, options: SnapshotOptions): ParkingRequest {
        const data = snapshot.data(options);
        return {
          id: snapshot.id,
          societyId: data.societyId || '',
          residentId: data.residentId || '',
          residentName: data.residentName || '',
          flatCode: data.flatCode || '',
          vehicleNumber: data.vehicleNumber || '',
          vehicleType: data.vehicleType || 'CAR',
          requestType: data.requestType || 'PERMANENT',
          startDate: data.startDate,
          endDate: data.endDate,
          status: data.status || 'PENDING',
          allocatedSlotNumber: data.allocatedSlotNumber,
          createdAt: data.createdAt || new Date().toISOString(),
        } as ParkingRequest;
      }
    };
  }
}

export const parkingSlotRepository = new ParkingSlotRepository();
export const parkingRequestRepository = new ParkingRequestRepository();
