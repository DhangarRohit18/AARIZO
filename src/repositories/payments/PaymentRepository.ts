import { BaseRepository } from '../BaseRepository';
import type { Payment, PaymentStatus } from '../../types/payment';
import { realtimeService } from '../../services/realtimeService';

export class PaymentRepository extends BaseRepository<Payment> {
  constructor() {
    super('payments');
  }

  protected getConverter(): any {
    return {};
  }

  public async listBySociety(societyId: string): Promise<Payment[]> {
    try {
      const res = await fetch(`/api/payments?societyId=${encodeURIComponent(societyId)}`);
      if (res.ok) {
        return (await res.json()) as Payment[];
      }
    } catch (err) {
      console.error('[PostgreSQL] listBySociety error:', err);
    }
    return [];
  }

  public subscribeBySociety(societyId: string, callback: (payments: Payment[]) => void): () => void {
    // Initial fetch from PostgreSQL
    this.listBySociety(societyId).then(callback);

    // Real-time PostgreSQL event stream
    return realtimeService.subscribe('*', (msg) => {
      if (msg.topic.includes('PAYMENT') || msg.topic === 'BILLING_UPDATED') {
        this.listBySociety(societyId).then(callback);
      }
    });
  }

  public async listByResident(residentId: string): Promise<Payment[]> {
    try {
      const res = await fetch(`/api/payments?residentId=${encodeURIComponent(residentId)}`);
      if (res.ok) {
        return (await res.json()) as Payment[];
      }
    } catch (err) {
      console.error('[PostgreSQL] listByResident error:', err);
    }
    return [];
  }

  public subscribeByResident(residentId: string, callback: (payments: Payment[]) => void): () => void {
    // Initial fetch from PostgreSQL
    this.listByResident(residentId).then(callback);

    // Real-time PostgreSQL event stream
    return realtimeService.subscribe('*', (msg) => {
      if (msg.topic.includes('PAYMENT') || msg.topic === 'BILLING_UPDATED') {
        this.listByResident(residentId).then(callback);
      }
    });
  }

  public subscribeByInvoice(invoiceId: string, callback: (payments: Payment[]) => void): () => void {
    const fetchInvoicePayments = async () => {
      try {
        const res = await fetch(`/api/payments?invoiceId=${encodeURIComponent(invoiceId)}`);
        if (res.ok) {
          callback((await res.json()) as Payment[]);
        }
      } catch {}
    };

    fetchInvoicePayments();

    return realtimeService.subscribe('*', (msg) => {
      if (msg.topic.includes('PAYMENT')) {
        fetchInvoicePayments();
      }
    });
  }

  public subscribePayment(paymentId: string, callback: (payment: Payment | null) => void): () => void {
    const fetchPay = async () => {
      try {
        const res = await fetch(`/api/collections/payments/${paymentId}`);
        if (res.ok) {
          callback((await res.json()) as Payment);
        } else {
          callback(null);
        }
      } catch {
        callback(null);
      }
    };

    fetchPay();

    return realtimeService.subscribe('*', (msg) => {
      if (msg.topic.includes('PAYMENT')) {
        fetchPay();
      }
    });
  }

  public async updateStatus(paymentId: string, status: PaymentStatus, metadata?: Partial<Payment>): Promise<void> {
    await this.update(paymentId, {
      status,
      ...metadata,
    } as any);
  }
}

export const paymentRepository = new PaymentRepository();

