import type { FirestoreDataConverter, QueryDocumentSnapshot, SnapshotOptions } from 'firebase/firestore';
import { BaseRepository } from '../BaseRepository';
import type { SmartVisitorPass } from '../../types/visitor';

export class VisitorRepository extends BaseRepository<SmartVisitorPass> {
  constructor() {
    super('visitorPasses');
  }

  protected getConverter(): FirestoreDataConverter<SmartVisitorPass> {
    return {
      toFirestore(pass: SmartVisitorPass): any {
        const { id, ...data } = pass;
        return data;
      },
      fromFirestore(snapshot: QueryDocumentSnapshot, options: SnapshotOptions): SmartVisitorPass {
        const data = snapshot.data(options);
        return {
          id: snapshot.id,
          societyId: data.societyId || '',
          residentId: data.residentId || '',
          residentName: data.residentName || '',
          flatCode: data.flatCode || '',
          towerName: data.towerName || '',
          visitorName: data.visitorName || '',
          visitorPhone: data.visitorPhone || '',
          category: data.category || 'GUEST',
          passLifecycle: data.passLifecycle || 'ONE_TIME',
          passCode: data.passCode || '',
          qrDataString: data.qrDataString || '',
          validFrom: data.validFrom || '',
          validUntil: data.validUntil || '',
          usageCount: data.usageCount || 0,
          maxUsages: data.maxUsages || 1,
          purpose: data.purpose,
          vehicleNumber: data.vehicleNumber,
          companyName: data.companyName,
          deliveryVendor: data.deliveryVendor,
          packageReferenceNumber: data.packageReferenceNumber,
          status: data.status || 'EXPECTED',
          lifecycleState: data.lifecycleState || 'EXPECTED',
          maxAllowedDurationMinutes: data.maxAllowedDurationMinutes || 180,
          isOverdue: data.isOverdue || false,
          gateName: data.gateName,
          gateOfficerName: data.gateOfficerName,
          checkedInAt: data.checkedInAt,
          checkedOutAt: data.checkedOutAt,
          groupCount: data.groupCount,
          createdAt: data.createdAt || new Date().toISOString(),
        };
      }
    };
  }
}

export const visitorRepository = new VisitorRepository();
