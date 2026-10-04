import { BaseRepository } from '../BaseRepository';
import type { VendorDocument } from '../../domains/vendors/types';

export class VendorDocumentRepository extends BaseRepository<VendorDocument> {
  constructor() {
    super('vendorDocuments');
  }

  protected getConverter(): any {
    return {};
  }

  public async listByVendor(vendorId: string): Promise<VendorDocument[]> {
    const all = await this.listAll();
    return all.filter((d) => d.vendorId === vendorId);
  }

  public subscribeByVendor(vendorId: string, callback: (docs: VendorDocument[]) => void): () => void {
    return this.subscribeAll((docs) => {
      callback(docs.filter((d) => d.vendorId === vendorId));
    });
  }

  public async verifyDocument(id: string, adminId: string = 'admin'): Promise<void> {
    await this.update(id, {
      status: 'VERIFIED',
      verifiedAt: new Date().toISOString(),
      verifiedBy: adminId,
    } as any);
  }

  public async rejectDocument(id: string, reason: string, adminId: string = 'admin'): Promise<void> {
    await this.update(id, {
      status: 'REJECTED',
      rejectionReason: reason,
      verifiedBy: adminId,
    } as any);
  }
}

export const vendorDocumentRepository = new VendorDocumentRepository();

