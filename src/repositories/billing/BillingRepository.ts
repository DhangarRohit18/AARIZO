import type { FirestoreDataConverter, QueryDocumentSnapshot, SnapshotOptions } from 'firebase/firestore';
import { BaseRepository } from '../BaseRepository';
import type { SocietyInvoice, BillingCycle, PaymentTransaction } from '../../types/billing';

export class BillingInvoiceRepository extends BaseRepository<SocietyInvoice> {
  constructor() {
    super('billingInvoices');
  }

  protected getConverter(): FirestoreDataConverter<SocietyInvoice> {
    return {
      toFirestore(inv: SocietyInvoice): any {
        const { id, ...data } = inv;
        return data;
      },
      fromFirestore(snapshot: QueryDocumentSnapshot, options: SnapshotOptions): SocietyInvoice {
        const data = snapshot.data(options);
        return {
          id: snapshot.id,
          invoiceNumber: data.invoiceNumber || '',
          societyId: data.societyId || '',
          flatId: data.flatId || '',
          flatCode: data.flatCode || '',
          residentId: data.residentId || '',
          residentName: data.residentName || '',
          billingCycleId: data.billingCycleId || '',
          cycleName: data.cycleName || '',
          lineItems: data.lineItems || [],
          totalAmount: data.totalAmount || 0,
          paidAmount: data.paidAmount || 0,
          outstandingBalance: data.outstandingBalance !== undefined ? data.outstandingBalance : ((data.totalAmount || 0) - (data.paidAmount || 0)),
          status: data.status || 'UNPAID',
          dueDate: data.dueDate || '',
          createdAt: data.createdAt || new Date().toISOString(),
          updatedAt: data.updatedAt || new Date().toISOString(),
        } as SocietyInvoice;
      }
    };
  }
}

export class BillingCycleRepository extends BaseRepository<BillingCycle> {
  constructor() {
    super('billingCycles');
  }

  protected getConverter(): FirestoreDataConverter<BillingCycle> {
    return {
      toFirestore(cycle: BillingCycle): any {
        const { id, ...data } = cycle;
        return data;
      },
      fromFirestore(snapshot: QueryDocumentSnapshot, options: SnapshotOptions): BillingCycle {
        const data = snapshot.data(options);
        return {
          id: snapshot.id,
          societyId: data.societyId || '',
          cycleName: data.cycleName || '',
          cycleMonth: data.cycleMonth || '',
          dueDate: data.dueDate || '',
          status: data.status || 'PUBLISHED',
          createdAt: data.createdAt || new Date().toISOString(),
        } as BillingCycle;
      }
    };
  }
}

export class PaymentTransactionRepository extends BaseRepository<PaymentTransaction> {
  constructor() {
    super('billingTransactions');
  }

  protected getConverter(): FirestoreDataConverter<PaymentTransaction> {
    return {
      toFirestore(tx: PaymentTransaction): any {
        const { id, ...data } = tx;
        return data;
      },
      fromFirestore(snapshot: QueryDocumentSnapshot, options: SnapshotOptions): PaymentTransaction {
        const data = snapshot.data(options);
        return {
          id: snapshot.id,
          invoiceId: data.invoiceId || '',
          invoiceNumber: data.invoiceNumber || '',
          societyId: data.societyId || '',
          flatCode: data.flatCode || '',
          residentName: data.residentName || '',
          transactionId: data.transactionId || `TXN-${snapshot.id}`,
          amount: data.amount !== undefined ? data.amount : (data.amountPaid || 0),
          paymentMethod: data.paymentMethod || 'UPI',
          status: data.status || 'SUCCESS',
          gatewayReference: data.gatewayReference,
          gatewayResponseNotes: data.gatewayResponseNotes,
          paymentDate: data.paymentDate || data.paidAt || new Date().toISOString(),
        } as PaymentTransaction;
      }
    };
  }
}

export const billingInvoiceRepository = new BillingInvoiceRepository();
export const billingCycleRepository = new BillingCycleRepository();
export const paymentTransactionRepository = new PaymentTransactionRepository();
