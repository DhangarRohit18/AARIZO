import type { FirestoreDataConverter, QueryDocumentSnapshot, SnapshotOptions } from 'firebase/firestore';
import { BaseRepository } from '../BaseRepository';
import type { FamilyMember, Vehicle, Staff, Vendor, DomesticWorker } from '../../types/society';

export class FamilyMemberRepository extends BaseRepository<FamilyMember> {
  constructor() {
    super('familyMembers');
  }
  protected getConverter(): FirestoreDataConverter<FamilyMember> {
    return {
      toFirestore(m: FamilyMember): any {
        const { id, ...data } = m;
        return data;
      },
      fromFirestore(snapshot: QueryDocumentSnapshot, options: SnapshotOptions): FamilyMember {
        const data = snapshot.data(options);
        return {
          id: snapshot.id,
          societyId: data.societyId || '',
          residentId: data.residentId || '',
          flatId: data.flatId || '',
          name: data.name || '',
          relationship: data.relationship || 'OTHER',
          phone: data.phone,
          avatarUrl: data.avatarUrl,
        };
      }
    };
  }
}

export class VehicleRepository extends BaseRepository<Vehicle> {
  constructor() {
    super('vehicles');
  }
  protected getConverter(): FirestoreDataConverter<Vehicle> {
    return {
      toFirestore(v: Vehicle): any {
        const { id, ...data } = v;
        return data;
      },
      fromFirestore(snapshot: QueryDocumentSnapshot, options: SnapshotOptions): Vehicle {
        const data = snapshot.data(options);
        return {
          id: snapshot.id,
          societyId: data.societyId || '',
          residentId: data.residentId || '',
          flatId: data.flatId || '',
          flatCode: data.flatCode || '',
          registrationNumber: data.registrationNumber || '',
          vehicleType: data.vehicleType || 'CAR',
          parkingSlotNumber: data.parkingSlotNumber || '',
          rfidTagCode: data.rfidTagCode,
        };
      }
    };
  }
}

export class StaffRepository extends BaseRepository<Staff> {
  constructor() {
    super('staff');
  }
  protected getConverter(): FirestoreDataConverter<Staff> {
    return {
      toFirestore(s: Staff): any {
        const { id, ...data } = s;
        return data;
      },
      fromFirestore(snapshot: QueryDocumentSnapshot, options: SnapshotOptions): Staff {
        const data = snapshot.data(options);
        return {
          id: snapshot.id,
          societyId: data.societyId || '',
          name: data.name || '',
          phone: data.phone || '',
          staffType: data.staffType || 'GUARD',
          gateAssigned: data.gateAssigned,
          shiftTiming: data.shiftTiming || '08:00 AM - 08:00 PM',
          status: data.status || 'ON_DUTY',
          avatarUrl: data.avatarUrl,
        };
      }
    };
  }
}

export class VendorRepository extends BaseRepository<Vendor> {
  constructor() {
    super('vendors');
  }
  protected getConverter(): FirestoreDataConverter<Vendor> {
    return {
      toFirestore(v: Vendor): any {
        const { id, ...data } = v;
        return data;
      },
      fromFirestore(snapshot: QueryDocumentSnapshot, options: SnapshotOptions): Vendor {
        const data = snapshot.data(options);
        return {
          id: snapshot.id,
          societyId: data.societyId || '',
          companyName: data.companyName || '',
          category: data.category || 'OTHER',
          contactPerson: data.contactPerson || '',
          phone: data.phone || '',
          contractStatus: data.contractStatus || 'ACTIVE',
          contractExpiryDate: data.contractExpiryDate || '',
        };
      }
    };
  }
}

export class DomesticWorkerRepository extends BaseRepository<DomesticWorker> {
  constructor() {
    super('domesticWorkers');
  }
  protected getConverter(): FirestoreDataConverter<DomesticWorker> {
    return {
      toFirestore(dw: DomesticWorker): any {
        const { id, ...data } = dw;
        return data;
      },
      fromFirestore(snapshot: QueryDocumentSnapshot, options: SnapshotOptions): DomesticWorker {
        const data = snapshot.data(options);
        return {
          id: snapshot.id,
          societyId: data.societyId || '',
          assignedFlatIds: data.assignedFlatIds || [],
          name: data.name || '',
          phone: data.phone || '',
          workRole: data.workRole || 'OTHER',
          passCode: data.passCode || '',
          verificationStatus: data.verificationStatus || 'VERIFIED',
          status: data.status || 'OUTSIDE',
          entryTime: data.entryTime,
        };
      }
    };
  }
}

export const familyMemberRepository = new FamilyMemberRepository();
export const vehicleRepository = new VehicleRepository();
export const staffRepository = new StaffRepository();
export const vendorRepository = new VendorRepository();
export const domesticWorkerRepository = new DomesticWorkerRepository();
