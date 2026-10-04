import type { FirestoreDataConverter, QueryDocumentSnapshot, SnapshotOptions } from 'firebase/firestore';
import { query, where, getDocs, onSnapshot, serverTimestamp } from 'firebase/firestore';
import { BaseRepository } from '../BaseRepository';
import type { VendorRequest, VendorRequestStatus } from '../../domains/vendors/types';

export class VendorRequestRepository extends BaseRepository<VendorRequest> {
  constructor() {
    super('vendorRequests');
  }

  protected getConverter(): FirestoreDataConverter<VendorRequest> {
    return {
      toFirestore(req: VendorRequest): any {
        const { id, ...data } = req;
        return data;
      },
      fromFirestore(snapshot: QueryDocumentSnapshot, options: SnapshotOptions): VendorRequest {
        const data = snapshot.data(options);
        return {
          id: snapshot.id,
          orderNumber: data.orderNumber || `ORD-${snapshot.id.slice(0, 6).toUpperCase()}`,
          societyId: data.societyId || 'soc-gvs',
          residentId: data.residentId || '',
          residentName: data.residentName || 'Resident',
          residentPhone: data.residentPhone || '',
          flatCode: data.flatCode || 'A-101',
          vendorId: data.vendorId || '',
          vendorName: data.vendorName || '',
          serviceId: data.serviceId || '',
          serviceTitle: data.serviceTitle || 'General Service',
          category: data.category || 'SERVICES',
          price: typeof data.price === 'number' ? data.price : 0,
          scheduledDate: data.scheduledDate || new Date().toISOString().split('T')[0],
          timeSlot: data.timeSlot || 'Morning (10:00 AM - 01:00 PM)',
          notes: data.notes || '',
          status: (data.status as VendorRequestStatus) || 'PENDING',
          rating: data.rating,
          reviewNotes: data.reviewNotes,
          paymentStatus: data.paymentStatus || 'UNPAID',
          paymentId: data.paymentId,
          createdAt: data.createdAt,
          updatedAt: data.updatedAt,
        };
      },
    };
  }

  public async listByVendor(vendorId: string): Promise<VendorRequest[]> {
    const q = query(this.getCollectionRef(), where('vendorId', '==', vendorId));
    const snapshot = await getDocs(q);
    return snapshot.docs.map((doc) => doc.data());
  }

  public subscribeByVendor(vendorId: string, callback: (requests: VendorRequest[]) => void): () => void {
    const q = query(this.getCollectionRef(), where('vendorId', '==', vendorId));
    return onSnapshot(q, (snapshot) => {
      callback(snapshot.docs.map((d) => d.data()));
    }, (err) => {
      console.warn(`[VendorRequestRepository] Error subscribing to requests for vendor ${vendorId}:`, err);
    });
  }

  public async listByResident(residentId: string): Promise<VendorRequest[]> {
    const q = query(this.getCollectionRef(), where('residentId', '==', residentId));
    const snapshot = await getDocs(q);
    return snapshot.docs.map((doc) => doc.data());
  }

  public subscribeByResident(residentId: string, callback: (requests: VendorRequest[]) => void): () => void {
    const q = query(this.getCollectionRef(), where('residentId', '==', residentId));
    return onSnapshot(q, (snapshot) => {
      callback(snapshot.docs.map((d) => d.data()));
    }, (err) => {
      console.warn(`[VendorRequestRepository] Error subscribing to requests for resident ${residentId}:`, err);
    });
  }

  public async updateStatus(id: string, status: VendorRequestStatus, notes?: string): Promise<void> {
    const payload: any = {
      status,
      updatedAt: serverTimestamp(),
    };
    if (notes) payload.statusNotes = notes;
    await this.update(id, payload);
  }

  public async recordPayment(id: string, paymentId: string): Promise<void> {
    await this.update(id, {
      paymentStatus: 'PAID',
      paymentId,
      updatedAt: serverTimestamp(),
    } as any);
  }

  public async submitReview(id: string, rating: number, reviewNotes?: string): Promise<void> {
    await this.update(id, {
      rating,
      reviewNotes: reviewNotes || '',
      updatedAt: serverTimestamp(),
    } as any);
  }
}

export const vendorRequestRepository = new VendorRequestRepository();
