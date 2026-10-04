import type { FirestoreDataConverter, QueryDocumentSnapshot, SnapshotOptions } from 'firebase/firestore';
import { query, where, getDocs, onSnapshot, serverTimestamp } from 'firebase/firestore';
import { BaseRepository } from '../BaseRepository';
import type { VendorProfile, VendorStatus, VendorApprovalStatus } from '../../domains/vendors/types';

export class VendorRepository extends BaseRepository<VendorProfile> {
  constructor() {
    super('vendors');
  }

  protected getConverter(): FirestoreDataConverter<VendorProfile> {
    return {
      toFirestore(vendor: VendorProfile): any {
        const { id, ...data } = vendor;
        return data;
      },
      fromFirestore(snapshot: QueryDocumentSnapshot, options: SnapshotOptions): VendorProfile {
        const data = snapshot.data(options);
        return {
          id: snapshot.id,
          uid: data.uid || snapshot.id,
          societyId: data.societyId || 'soc-gvs',
          companyName: data.companyName || '',
          contactPerson: data.contactPerson || '',
          email: data.email || '',
          phone: data.phone || '',
          category: data.category || 'OTHER',
          address: data.address || '',
          status: (data.status as VendorStatus) || 'PENDING',
          approvalStatus: (data.approvalStatus as VendorApprovalStatus) || 'PENDING',
          rating: typeof data.rating === 'number' ? data.rating : 4.8,
          totalReviews: data.totalReviews || 0,
          totalJobs: data.totalJobs || 0,
          verifiedDocumentsCount: data.verifiedDocumentsCount || 0,
          createdAt: data.createdAt,
          updatedAt: data.updatedAt,
        };
      },
    };
  }

  public async getVendorByUid(uid: string): Promise<VendorProfile | null> {
    const q = query(this.getCollectionRef(), where('uid', '==', uid));
    const snapshot = await getDocs(q);
    if (!snapshot.empty) {
      return snapshot.docs[0].data();
    }
    return this.getById(uid);
  }

  public subscribeVendorByUid(uid: string, callback: (vendor: VendorProfile | null) => void): () => void {
    const q = query(this.getCollectionRef(), where('uid', '==', uid));
    return onSnapshot(q, (snapshot) => {
      if (!snapshot.empty) {
        callback(snapshot.docs[0].data());
      } else {
        // Fallback: check doc with id === uid
        const docRef = this.getDocRef(uid);
        onSnapshot(docRef, (docSnap) => {
          if (docSnap.exists()) {
            callback(docSnap.data());
          } else {
            callback(null);
          }
        });
      }
    }, (err) => {
      console.warn(`[VendorRepository] Error subscribing to vendor ${uid}:`, err);
    });
  }

  public async approveVendor(id: string, _adminId?: string): Promise<void> {
    await this.update(id, {
      status: 'ACTIVE',
      approvalStatus: 'APPROVED',
      updatedAt: serverTimestamp(),
    } as any);
  }

  public async rejectVendor(id: string, _reason?: string): Promise<void> {
    await this.update(id, {
      status: 'REJECTED',
      approvalStatus: 'REJECTED',
      updatedAt: serverTimestamp(),
    } as any);
  }

  public async suspendVendor(id: string): Promise<void> {
    await this.update(id, {
      status: 'SUSPENDED',
      updatedAt: serverTimestamp(),
    } as any);
  }

  public async reactivateVendor(id: string): Promise<void> {
    await this.update(id, {
      status: 'ACTIVE',
      approvalStatus: 'APPROVED',
      updatedAt: serverTimestamp(),
    } as any);
  }
}

export const vendorRepository = new VendorRepository();
