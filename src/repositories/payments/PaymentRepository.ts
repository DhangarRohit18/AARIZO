import type { FirestoreDataConverter, QueryDocumentSnapshot, SnapshotOptions } from 'firebase/firestore';
import { query, where, getDocs, onSnapshot, serverTimestamp } from 'firebase/firestore';
import { BaseRepository } from '../BaseRepository';
import type { Payment, PaymentStatus } from '../../types/payment';

export class PaymentRepository extends BaseRepository<Payment> {
  constructor() {
    super('payments');
  }

  protected getConverter(): FirestoreDataConverter<Payment> {
    return {
      toFirestore(payment: Payment): any {
        const { id, ...data } = payment;
        return data;
      },
      fromFirestore(snapshot: QueryDocumentSnapshot, options: SnapshotOptions): Payment {
        const data = snapshot.data(options);
        return {
          id: snapshot.id,
          societyId: data.societyId || 'soc-gvs',
          userId: data.userId || '',
          residentId: data.residentId || '',
          residentName: data.residentName,
          flatCode: data.flatCode,
          invoiceId: data.invoiceId || '',
          invoiceNumber: data.invoiceNumber,
          amount: typeof data.amount === 'number' ? data.amount : 0,
          currency: data.currency || 'INR',
          status: (data.status as PaymentStatus) || 'PENDING',
          razorpayOrderId: data.razorpayOrderId,
          razorpayPaymentId: data.razorpayPaymentId,
          razorpaySignatureVerified: Boolean(data.razorpaySignatureVerified),
          paymentMethod: data.paymentMethod || 'RAZORPAY',
          failureReason: data.failureReason,
          refundId: data.refundId,
          refundAmount: data.refundAmount,
          refundReason: data.refundReason,
          refundedAt: data.refundedAt,
          createdAt: data.createdAt,
          updatedAt: data.updatedAt,
        };
      },
    };
  }

  public async listBySociety(societyId: string): Promise<Payment[]> {
    const q = query(this.getCollectionRef(), where('societyId', '==', societyId));
    const snapshot = await getDocs(q);
    return snapshot.docs.map((d) => d.data());
  }

  public subscribeBySociety(societyId: string, callback: (payments: Payment[]) => void): () => void {
    const q = query(this.getCollectionRef(), where('societyId', '==', societyId));
    return onSnapshot(q, (snapshot) => {
      callback(snapshot.docs.map((d) => d.data()));
    }, (err) => {
      console.warn(`[PaymentRepository] Error subscribing to society payments:`, err);
    });
  }

  public async listByResident(residentId: string): Promise<Payment[]> {
    const q = query(this.getCollectionRef(), where('residentId', '==', residentId));
    const snapshot = await getDocs(q);
    return snapshot.docs.map((d) => d.data());
  }

  public subscribeByResident(residentId: string, callback: (payments: Payment[]) => void): () => void {
    const q = query(this.getCollectionRef(), where('residentId', '==', residentId));
    return onSnapshot(q, (snapshot) => {
      callback(snapshot.docs.map((d) => d.data()));
    }, (err) => {
      console.warn(`[PaymentRepository] Error subscribing to resident payments:`, err);
    });
  }

  public subscribeByInvoice(invoiceId: string, callback: (payments: Payment[]) => void): () => void {
    const q = query(this.getCollectionRef(), where('invoiceId', '==', invoiceId));
    return onSnapshot(q, (snapshot) => {
      callback(snapshot.docs.map((d) => d.data()));
    }, (err) => {
      console.warn(`[PaymentRepository] Error subscribing to invoice payments:`, err);
    });
  }

  public subscribePayment(paymentId: string, callback: (payment: Payment | null) => void): () => void {
    const docRef = this.getDocRef(paymentId);
    return onSnapshot(docRef, (docSnap) => {
      if (docSnap.exists()) {
        callback(docSnap.data());
      } else {
        callback(null);
      }
    }, (err) => {
      console.warn(`[PaymentRepository] Error subscribing to payment ${paymentId}:`, err);
    });
  }

  public async updateStatus(paymentId: string, status: PaymentStatus, metadata?: Partial<Payment>): Promise<void> {
    await this.update(paymentId, {
      status,
      ...metadata,
      updatedAt: serverTimestamp(),
    } as any);
  }
}

export const paymentRepository = new PaymentRepository();
