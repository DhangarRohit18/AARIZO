import type { FirestoreDataConverter, QueryDocumentSnapshot, SnapshotOptions } from 'firebase/firestore';
import { query, where, getDocs, onSnapshot, serverTimestamp } from 'firebase/firestore';
import { BaseRepository } from '../BaseRepository';
import type { VendorService } from '../../domains/vendors/types';

export class VendorServiceRepository extends BaseRepository<VendorService> {
  constructor() {
    super('vendorServices');
  }

  protected getConverter(): FirestoreDataConverter<VendorService> {
    return {
      toFirestore(service: VendorService): any {
        const { id, ...data } = service;
        return data;
      },
      fromFirestore(snapshot: QueryDocumentSnapshot, options: SnapshotOptions): VendorService {
        const data = snapshot.data(options);
        return {
          id: snapshot.id,
          vendorId: data.vendorId || '',
          vendorName: data.vendorName || '',
          societyId: data.societyId || 'soc-gvs',
          title: data.title || '',
          description: data.description || '',
          category: data.category || 'GENERAL',
          price: typeof data.price === 'number' ? data.price : 0,
          pricingType: data.pricingType || 'FIXED',
          images: Array.isArray(data.images) ? data.images : [],
          availability: data.availability || 'AVAILABLE',
          status: data.status || 'ACTIVE',
          createdAt: data.createdAt,
          updatedAt: data.updatedAt,
        };
      },
    };
  }

  public async listByVendor(vendorId: string): Promise<VendorService[]> {
    const q = query(this.getCollectionRef(), where('vendorId', '==', vendorId));
    const snapshot = await getDocs(q);
    return snapshot.docs.map((doc) => doc.data());
  }

  public subscribeByVendor(vendorId: string, callback: (services: VendorService[]) => void): () => void {
    const q = query(this.getCollectionRef(), where('vendorId', '==', vendorId));
    return onSnapshot(q, (snapshot) => {
      callback(snapshot.docs.map((d) => d.data()));
    }, (err) => {
      console.warn(`[VendorServiceRepository] Error subscribing to services for ${vendorId}:`, err);
    });
  }

  public async listActiveBySociety(societyId: string): Promise<VendorService[]> {
    const q = query(
      this.getCollectionRef(),
      where('societyId', '==', societyId),
      where('status', '==', 'ACTIVE')
    );
    const snapshot = await getDocs(q);
    return snapshot.docs.map((doc) => doc.data());
  }

  public subscribeActiveBySociety(societyId: string, callback: (services: VendorService[]) => void): () => void {
    const q = query(
      this.getCollectionRef(),
      where('societyId', '==', societyId),
      where('status', '==', 'ACTIVE')
    );
    return onSnapshot(q, (snapshot) => {
      callback(snapshot.docs.map((d) => d.data()));
    }, (err) => {
      console.warn(`[VendorServiceRepository] Error subscribing to active services:`, err);
    });
  }

  public async toggleStatus(id: string, active: boolean): Promise<void> {
    await this.update(id, {
      status: active ? 'ACTIVE' : 'INACTIVE',
      updatedAt: serverTimestamp(),
    } as any);
  }
}

export const vendorServiceRepository = new VendorServiceRepository();
