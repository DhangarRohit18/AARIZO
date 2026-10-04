import type { FirestoreDataConverter, QueryDocumentSnapshot, SnapshotOptions } from 'firebase/firestore';
import { query, where, getDocs, onSnapshot, serverTimestamp } from 'firebase/firestore';
import { BaseRepository } from '../BaseRepository';
import type { VendorDocument, DocumentVerificationStatus } from '../../domains/vendors/types';

export class VendorDocumentRepository extends BaseRepository<VendorDocument> {
  constructor() {
    super('vendorDocuments');
  }

  protected getConverter(): FirestoreDataConverter<VendorDocument> {
    return {
      toFirestore(doc: VendorDocument): any {
        const { id, ...data } = doc;
        return data;
      },
      fromFirestore(snapshot: QueryDocumentSnapshot, options: SnapshotOptions): VendorDocument {
        const data = snapshot.data(options);
        return {
          id: snapshot.id,
          vendorId: data.vendorId || '',
          societyId: data.societyId || 'soc-gvs',
          documentType: data.documentType || 'OTHER',
          title: data.title || 'Document',
          fileUrl: data.fileUrl || '',
          fileName: data.fileName || '',
          fileSize: data.fileSize,
          status: (data.status as DocumentVerificationStatus) || 'PENDING',
          expiryDate: data.expiryDate,
          uploadedAt: data.uploadedAt || data.createdAt,
          verifiedAt: data.verifiedAt,
          verifiedBy: data.verifiedBy,
          rejectionReason: data.rejectionReason,
        };
      },
    };
  }

  public async listByVendor(vendorId: string): Promise<VendorDocument[]> {
    const q = query(this.getCollectionRef(), where('vendorId', '==', vendorId));
    const snapshot = await getDocs(q);
    return snapshot.docs.map((d) => d.data());
  }

  public subscribeByVendor(vendorId: string, callback: (docs: VendorDocument[]) => void): () => void {
    const q = query(this.getCollectionRef(), where('vendorId', '==', vendorId));
    return onSnapshot(q, (snapshot) => {
      callback(snapshot.docs.map((d) => d.data()));
    }, (err) => {
      console.warn(`[VendorDocumentRepository] Error subscribing to documents for vendor ${vendorId}:`, err);
    });
  }

  public async verifyDocument(id: string, adminId: string = 'admin'): Promise<void> {
    await this.update(id, {
      status: 'VERIFIED',
      verifiedAt: serverTimestamp(),
      verifiedBy: adminId,
      updatedAt: serverTimestamp(),
    } as any);
  }

  public async rejectDocument(id: string, reason: string, adminId: string = 'admin'): Promise<void> {
    await this.update(id, {
      status: 'REJECTED',
      rejectionReason: reason,
      verifiedAt: serverTimestamp(),
      verifiedBy: adminId,
      updatedAt: serverTimestamp(),
    } as any);
  }
}

export const vendorDocumentRepository = new VendorDocumentRepository();
