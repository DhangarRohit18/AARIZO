import type { FirestoreDataConverter, QueryDocumentSnapshot, SnapshotOptions } from 'firebase/firestore';
import { BaseRepository } from '../BaseRepository';
import type { MaintenanceTicket } from '../../types/maintenance';

export class MaintenanceTicketRepository extends BaseRepository<MaintenanceTicket> {
  constructor() {
    super('maintenanceTickets');
  }

  protected getConverter(): FirestoreDataConverter<MaintenanceTicket> {
    return {
      toFirestore(ticket: MaintenanceTicket): any {
        const { id, ...data } = ticket;
        return data;
      },
      fromFirestore(snapshot: QueryDocumentSnapshot, options: SnapshotOptions): MaintenanceTicket {
        const data = snapshot.data(options);
        return {
          id: snapshot.id,
          societyId: data.societyId || '',
          flatId: data.flatId,
          flatCode: data.flatCode,
          residentId: data.residentId || '',
          residentName: data.residentName || '',
          category: data.category || 'OTHER',
          urgency: data.urgency || 'MEDIUM',
          description: data.description || '',
          mediaUrls: data.mediaUrls || [],
          status: data.status || 'PENDING',
          assignedVendorId: data.assignedVendorId,
          assignedVendorName: data.assignedVendorName,
          assignedTechnicianName: data.assignedTechnicianName,
          scheduledVisitDate: data.scheduledVisitDate,
          scheduledVisitTime: data.scheduledVisitTime,
          completedAt: data.completedAt,
          slaTargetHours: data.slaTargetHours || 24,
          isSlaBreached: data.isSlaBreached || false,
          serviceNotes: data.serviceNotes,
          costEstimate: data.costEstimate,
          actualCost: data.actualCost,
          residentRating: data.residentRating,
          residentFeedback: data.residentFeedback,
          beforeImages: data.beforeImages || [],
          afterImages: data.afterImages || [],
          createdAt: data.createdAt || new Date().toISOString(),
          updatedAt: data.updatedAt || new Date().toISOString(),
        } as MaintenanceTicket;
      }
    };
  }
}

export const maintenanceTicketRepository = new MaintenanceTicketRepository();
