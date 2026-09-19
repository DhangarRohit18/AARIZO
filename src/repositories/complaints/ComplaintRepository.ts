import { FirestoreDataConverter, QueryDocumentSnapshot, SnapshotOptions, Timestamp } from 'firebase/firestore';
import { BaseRepository } from '../BaseRepository';
import type { Complaint } from '../../domains/complaints/types';

export class ComplaintRepository extends BaseRepository<Complaint> {
  constructor() {
    super('complaints');
  }

  protected getConverter(): FirestoreDataConverter<Complaint> {
    return {
      toFirestore(complaint: Complaint): any {
        // Exclude the 'id' field as it's the document key
        const { id, ...data } = complaint;
        
        // Ensure dates are converted properly if they exist as strings
        // Convert string dates back to Timestamp for precise Firestore querying
        let parsedDueAt = data.dueAt;
        if (typeof data.dueAt === 'string' && data.dueAt.length > 0) {
          parsedDueAt = Timestamp.fromDate(new Date(data.dueAt));
        }

        return {
          ...data,
          dueAt: parsedDueAt || null,
        };
      },
      fromFirestore(
        snapshot: QueryDocumentSnapshot,
        options: SnapshotOptions
      ): Complaint {
        const data = snapshot.data(options);
        
        // Safely map timestamps back to ISO strings for frontend compatibility
        const createdAt = data.createdAt instanceof Timestamp ? data.createdAt.toDate().toISOString() : data.createdAt;
        const updatedAt = data.updatedAt instanceof Timestamp ? data.updatedAt.toDate().toISOString() : data.updatedAt;
        const resolvedAt = data.resolvedAt instanceof Timestamp ? data.resolvedAt.toDate().toISOString() : data.resolvedAt;
        const closedAt = data.closedAt instanceof Timestamp ? data.closedAt.toDate().toISOString() : data.closedAt;
        const deletedAt = data.deletedAt instanceof Timestamp ? data.deletedAt.toDate().toISOString() : data.deletedAt;
        const dueAt = data.dueAt instanceof Timestamp ? data.dueAt.toDate().toISOString() : data.dueAt;

        return {
          id: snapshot.id,
          societyId: data.societyId || '',
          residentId: data.residentId || '',
          residentName: data.residentName || '',
          flatCode: data.flatCode || '',
          category: data.category || 'OTHER',
          title: data.title || '',
          description: data.description || '',
          location: data.location || '',
          urgency: data.urgency || 'LOW',
          photoUrl: data.photoUrl,
          videoUrl: data.videoUrl,
          status: data.status || 'OPEN',
          escalationLevel: data.escalationLevel || 'STAFF',
          assignedToName: data.assignedToName,
          assignedToRole: data.assignedToRole,
          slaMinutes: data.slaMinutes || 0,
          createdAt: createdAt || new Date().toISOString(),
          updatedAt: updatedAt,
          dueAt: dueAt || '',
          resolvedAt: resolvedAt,
          closedAt: closedAt,
          isWarningState: data.isWarningState || false,
          isBreached: data.isBreached || false,
          reopenCount: data.reopenCount || 0,
          resolutionHistory: data.resolutionHistory || [],
        } as Complaint;
      }
    };
  }
}

// Export a singleton instance for easy usage
export const complaintRepository = new ComplaintRepository();
