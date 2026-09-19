import type { FirestoreDataConverter, QueryDocumentSnapshot, SnapshotOptions } from 'firebase/firestore';
import { BaseRepository } from '../BaseRepository';
import type { UserProfile } from '../../domains/auth/types';

export class UserRepository extends BaseRepository<UserProfile> {
  constructor() {
    super('users');
  }

  protected getConverter(): FirestoreDataConverter<UserProfile> {
    return {
      toFirestore(profile: UserProfile): any {
        const { id, ...data } = profile;
        return data;
      },
      fromFirestore(snapshot: QueryDocumentSnapshot, options: SnapshotOptions): UserProfile {
        const data = snapshot.data(options);
        return {
          id: snapshot.id,
          uid: data.uid || snapshot.id,
          name: data.name || '',
          phone: data.phone || '',
          email: data.email,
          role: data.role || 'resident',
          societyId: data.societyId || '',
          societyName: data.societyName,
          roleLabel: data.roleLabel,
          flatNumber: data.flatNumber,
          flatDetails: data.flatDetails,
          unitId: data.unitId,
          status: data.status || 'ACTIVE',
          avatarUrl: data.avatarUrl,
          designation: data.designation,
          statusBadge: data.statusBadge,
          createdAt: data.createdAt,
          updatedAt: data.updatedAt,
        } as UserProfile;
      }
    };
  }
}

export const userRepository = new UserRepository();
