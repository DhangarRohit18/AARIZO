import { BaseRepository } from '../BaseRepository';
import type { VendorProfile } from '../../domains/vendors/types';

export class VendorRepository extends BaseRepository<VendorProfile> {
  constructor() {
    super('vendors');
  }

  protected getConverter(): any {
    return {};
  }

  public async getVendorByUid(uid: string): Promise<VendorProfile | null> {
    try {
      const res = await fetch(`/api/collections/vendors/${uid}`);
      if (res.ok) {
        return (await res.json()) as VendorProfile;
      }
      const all = await this.listAll();
      return all.find((v) => v.uid === uid || v.id === uid) || null;
    } catch {
      return null;
    }
  }

  public subscribeVendorByUid(uid: string, callback: (vendor: VendorProfile | null) => void): () => void {
    this.getVendorByUid(uid).then(callback);
    return this.subscribeAll((vendors) => {
      const match = vendors.find((v) => v.uid === uid || v.id === uid) || null;
      callback(match);
    });
  }

  public async approveVendor(id: string, _adminId?: string): Promise<void> {
    await this.update(id, {
      status: 'ACTIVE',
      approvalStatus: 'APPROVED',
    } as any);
  }

  public async rejectVendor(id: string, _reason?: string): Promise<void> {
    await this.update(id, {
      status: 'REJECTED',
      approvalStatus: 'REJECTED',
    } as any);
  }

  public async suspendVendor(id: string): Promise<void> {
    await this.update(id, {
      status: 'SUSPENDED',
    } as any);
  }

  public async reactivateVendor(id: string): Promise<void> {
    await this.update(id, {
      status: 'ACTIVE',
      approvalStatus: 'APPROVED',
    } as any);
  }
}

export const vendorRepository = new VendorRepository();

