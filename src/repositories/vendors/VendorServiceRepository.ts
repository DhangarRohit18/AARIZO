import { BaseRepository } from '../BaseRepository';
import type { VendorService } from '../../domains/vendors/types';

export class VendorServiceRepository extends BaseRepository<VendorService> {
  constructor() {
    super('vendorServices');
  }

  protected getConverter(): any {
    return {};
  }

  public async listByVendor(vendorId: string): Promise<VendorService[]> {
    const all = await this.listAll();
    return all.filter((s) => s.vendorId === vendorId);
  }

  public subscribeByVendor(vendorId: string, callback: (services: VendorService[]) => void): () => void {
    return this.subscribeAll((services) => {
      callback(services.filter((s) => s.vendorId === vendorId));
    });
  }

  public async listActiveBySociety(societyId: string): Promise<VendorService[]> {
    const all = await this.list(societyId);
    return all.filter((s) => s.status === 'ACTIVE');
  }

  public subscribeActiveBySociety(societyId: string, callback: (services: VendorService[]) => void): () => void {
    return this.subscribe(societyId, (services) => {
      callback(services.filter((s) => s.status === 'ACTIVE'));
    });
  }

  public async toggleStatus(id: string, active: boolean): Promise<void> {
    await this.update(id, {
      status: active ? 'ACTIVE' : 'INACTIVE',
      updatedAt: new Date().toISOString(),
    } as any);
  }
}

export const vendorServiceRepository = new VendorServiceRepository();

