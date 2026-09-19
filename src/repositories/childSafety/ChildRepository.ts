import type { FirestoreDataConverter, QueryDocumentSnapshot, SnapshotOptions } from 'firebase/firestore';
import { BaseRepository } from '../BaseRepository';
import type { ChildProfile } from '../../types/childSafety';

export class ChildRepository extends BaseRepository<ChildProfile> {
  constructor() {
    super('children');
  }

  protected getConverter(): FirestoreDataConverter<ChildProfile> {
    return {
      toFirestore(child: ChildProfile): any {
        const { id, ...data } = child;
        return data;
      },
      fromFirestore(snapshot: QueryDocumentSnapshot, options: SnapshotOptions): ChildProfile {
        const data = snapshot.data(options);
        return {
          id: snapshot.id,
          societyId: data.societyId || '',
          flatNumber: data.flatNumber || '',
          fullName: data.fullName || '',
          dateOfBirth: data.dateOfBirth || '',
          gender: data.gender || 'MALE',
          photoUrl: data.photoUrl,
          medicalNotes: data.medicalNotes,
          status: data.status || 'SAFE',
          guardians: data.guardians || [],
          emergencyContacts: data.emergencyContacts || [],
          authorizedPickups: data.authorizedPickups || [],
          createdAt: data.createdAt || new Date().toISOString(),
          updatedAt: data.updatedAt || new Date().toISOString(),
        } as ChildProfile;
      }
    };
  }
}

export const childRepository = new ChildRepository();
