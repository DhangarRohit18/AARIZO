import { BaseRepository } from '../BaseRepository';
import type { VendorRequest, VendorRequestStatus } from '../../domains/vendors/types';

export class VendorRequestRepository extends BaseRepository<VendorRequest> {
  constructor() {
    super('vendorRequests');
  }

  protected getConverter(): any {
    return {};
  }

  public async listByVendor(vendorId: string): Promise<VendorRequest[]> {
    const all = await this.listAll();
    return all.filter((r) => r.vendorId === vendorId);
  }

  public subscribeByVendor(vendorId: string, callback: (requests: VendorRequest[]) => void): () => void {
    return this.subscribeAll((requests) => {
      callback(requests.filter((r) => r.vendorId === vendorId));
    });
  }

  public async listByResident(residentId: string): Promise<VendorRequest[]> {
    const all = await this.listAll();
    return all.filter((r) => r.residentId === residentId);
  }

  public subscribeByResident(residentId: string, callback: (requests: VendorRequest[]) => void): () => void {
    return this.subscribeAll((requests) => {
      callback(requests.filter((r) => r.residentId === residentId));
    });
  }

  public async updateStatus(id: string, status: VendorRequestStatus, notes?: string): Promise<void> {
    const payload: any = {
      status,
      updatedAt: new Date().toISOString(),
    };
    if (notes) payload.statusNotes = notes;
    await this.update(id, payload);
  }

  public async recordPayment(id: string, paymentId: string): Promise<void> {
    await this.update(id, {
      paymentStatus: 'PAID',
      paymentId,
      updatedAt: new Date().toISOString(),
    } as any);
  }

  public async submitReview(id: string, rating: number, reviewNotes?: string): Promise<void> {
    await this.update(id, {
      rating,
      reviewNotes: reviewNotes || '',
      updatedAt: new Date().toISOString(),
    } as any);
  }
}

export const vendorRequestRepository = new VendorRequestRepository();

