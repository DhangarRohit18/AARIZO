import type { FirestoreDataConverter, QueryDocumentSnapshot, SnapshotOptions } from 'firebase/firestore';
import { BaseRepository } from '../BaseRepository';
import type { EmergencyIncident } from '../../types/safetyCommand';

export class EmergencyIncidentRepository extends BaseRepository<EmergencyIncident> {
  constructor() {
    super('emergencyIncidents');
  }

  protected getConverter(): FirestoreDataConverter<EmergencyIncident> {
    return {
      toFirestore(inc: EmergencyIncident): any {
        const { id, ...data } = inc;
        return data;
      },
      fromFirestore(snapshot: QueryDocumentSnapshot, options: SnapshotOptions): EmergencyIncident {
        const data = snapshot.data(options);
        return {
          id: snapshot.id,
          societyId: data.societyId || '',
          incidentNumber: data.incidentNumber || `SOS-${snapshot.id.substring(0, 6).toUpperCase()}`,
          type: data.type || 'SECURITY_BREACH',
          status: data.status || 'TRIGGERED',
          flatNumber: data.flatNumber,
          tower: data.tower,
          locationDetails: data.locationDetails || '',
          reportedByUserId: data.reportedByUserId || '',
          reportedByName: data.reportedByName || '',
          reportedByPhone: data.reportedByPhone || '',
          assignedResponderId: data.assignedResponderId,
          assignedResponderName: data.assignedResponderName,
          description: data.description || '',
          triggeredAt: data.triggeredAt || new Date().toISOString(),
          acknowledgedAt: data.acknowledgedAt,
          respondingAt: data.respondingAt,
          resolvedAt: data.resolvedAt,
          timeline: data.timeline || [],
        } as EmergencyIncident;
      }
    };
  }
}

export const emergencyIncidentRepository = new EmergencyIncidentRepository();
