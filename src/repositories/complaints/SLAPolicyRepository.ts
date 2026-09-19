import { FirestoreDataConverter, QueryDocumentSnapshot, SnapshotOptions } from 'firebase/firestore';
import { BaseRepository } from '../BaseRepository';
import type { SLAPolicy } from '../../domains/complaints/types';

export class SLAPolicyRepository extends BaseRepository<SLAPolicy> {
  constructor() {
    super('slaPolicies');
  }

  protected getConverter(): FirestoreDataConverter<SLAPolicy> {
    return {
      toFirestore(policy: SLAPolicy): any {
        const { id, ...data } = policy;
        return data;
      },
      fromFirestore(
        snapshot: QueryDocumentSnapshot,
        options: SnapshotOptions
      ): SLAPolicy {
        const data = snapshot.data(options);
        return {
          id: snapshot.id,
          societyId: data.societyId || '',
          category: data.category || 'OTHER',
          slaMinutes: data.slaMinutes || 120, // default 2 hours if missing
          escalationLevels: data.escalationLevels || ['STAFF', 'FACILITY_MANAGER', 'SOCIETY_ADMIN'],
          updatedBy: data.updatedBy || ''
        } as SLAPolicy;
      }
    };
  }

  /**
   * Helper method to fetch the policy for a specific category within a society
   */
  public async getPolicyByCategory(societyId: string, category: string): Promise<SLAPolicy | null> {
    const policies = await this.list(societyId);
    return policies.find(p => p.category === category) || null;
  }
}

export const slaPolicyRepository = new SLAPolicyRepository();
