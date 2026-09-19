import { db } from '../services/firebase/config';
import { collection, query, where, onSnapshot, addDoc, updateDoc, doc, serverTimestamp, orderBy } from 'firebase/firestore';
import type { Complaint } from '../domains/complaints/types';
import { logAuditEvent } from './auditRepository';

export const subscribeToComplaints = (societyId: string, callback: (complaints: Complaint[]) => void) => {
  const q = query(collection(db, 'complaints'), where('societyId', '==', societyId), orderBy('createdAt', 'desc'));
  return onSnapshot(q, (snapshot) => {
    const list = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() } as Complaint));
    callback(list);
  });
};

export const createComplaintToDb = async (data: Partial<Complaint>, actorId: string, actorRole: string) => {
  const docRef = await addDoc(collection(db, 'complaints'), {
    ...data,
    createdAt: serverTimestamp(),
    updatedAt: serverTimestamp(),
  });
  await logAuditEvent({ societyId: data.societyId!, actorId, actorRole, entityType: 'COMPLAINT', entityId: docRef.id, action: 'COMPLAINT_CREATED' });
  return docRef.id;
};

export const updateComplaintInDb = async (societyId: string, complaintId: string, data: Partial<Complaint>, actorId: string, actorRole: string, actionName = 'COMPLAINT_UPDATED') => {
  const docRef = doc(db, 'complaints', complaintId);
  await updateDoc(docRef, { ...data, updatedAt: serverTimestamp() });
  await logAuditEvent({ societyId, actorId, actorRole, entityType: 'COMPLAINT', entityId: complaintId, action: actionName });
};

