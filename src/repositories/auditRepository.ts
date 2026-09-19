import { db } from '../services/firebase/config';
import { collection, addDoc, serverTimestamp } from 'firebase/firestore';

export interface AuditEvent {
  societyId: string;
  actorId: string;
  actorRole: string;
  entityType: string;
  entityId: string;
  action: string;
  before?: any;
  after?: any;
  metadata?: any;
}

export const logAuditEvent = async (event: AuditEvent) => {
  return addDoc(collection(db, 'auditLogs'), {
    ...event,
    timestamp: serverTimestamp(),
  });
};

