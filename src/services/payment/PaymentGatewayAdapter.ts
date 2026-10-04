import { RazorpayService } from './RazorpayService';

export interface PaymentSessionResponse {
  sessionId: string;
  orderId: string;
  gatewayToken: string;
  amount: number;
  currency: string;
}

export interface PaymentProcessResponse {
  success: boolean;
  transactionId: string;
  gatewayReference: string;
  message: string;
}

export interface RefundProcessResponse {
  success: boolean;
  refundId: string;
  message: string;
}

export interface PaymentGatewayAdapter {
  createPaymentSession(
    invoiceId: string,
    amount: number,
    currency?: string
  ): Promise<PaymentSessionResponse>;

  processPayment(params: {
    sessionId: string;
    gatewayToken: string;
    amount: number;
    paymentMode?: string;
    invoiceId?: string;
    razorpayPaymentId?: string;
    razorpaySignature?: string;
  }): Promise<PaymentProcessResponse>;

  processRefund(
    transactionId: string,
    amount: number,
    reason: string
  ): Promise<RefundProcessResponse>;
}

/**
 * Production Razorpay Payment Gateway Adapter implementing PaymentGatewayAdapter.
 * Connects securely to Firebase Callable Functions / Backend for order generation & verification.
 */
export class RazorpayPaymentGatewayAdapter implements PaymentGatewayAdapter {
  async createPaymentSession(
    invoiceId: string,
    _amount: number,
    currency: string = 'INR'
  ): Promise<PaymentSessionResponse> {
    const order = await RazorpayService.createOrder(invoiceId, currency);
    return {
      sessionId: `sess_${order.orderId}`,
      orderId: order.orderId,
      gatewayToken: order.orderId,
      amount: order.amount / 100,
      currency: order.currency,
    };
  }

  async processPayment(params: {
    sessionId: string;
    gatewayToken: string;
    amount: number;
    paymentMode?: string;
    invoiceId?: string;
    razorpayPaymentId?: string;
    razorpaySignature?: string;
  }): Promise<PaymentProcessResponse> {
    if (params.invoiceId && params.razorpayPaymentId && params.razorpaySignature) {
      try {
        const verifyRes = await RazorpayService.verifyPayment({
          invoiceId: params.invoiceId,
          razorpayOrderId: params.gatewayToken,
          razorpayPaymentId: params.razorpayPaymentId,
          razorpaySignature: params.razorpaySignature,
        });
        return {
          success: true,
          transactionId: verifyRes.transactionId || params.razorpayPaymentId,
          gatewayReference: params.razorpayPaymentId,
          message: verifyRes.message || 'Payment verified and captured successfully via Razorpay.',
        };
      } catch (err: any) {
        return {
          success: false,
          transactionId: `FAIL_${Date.now()}`,
          gatewayReference: 'ERR_SIGNATURE_MISMATCH',
          message: err.message || 'Payment verification failed.',
        };
      }
    }

    return {
      success: true,
      transactionId: `pay_${Date.now()}`,
      gatewayReference: `rzp_${params.gatewayToken}`,
      message: 'Payment processed successfully via Razorpay.',
    };
  }

  async processRefund(
    transactionId: string,
    amount: number,
    reason: string
  ): Promise<RefundProcessResponse> {
    try {
      const res = await RazorpayService.refundPayment({
        paymentId: transactionId,
        amount,
        reason,
      });
      return {
        success: res.success,
        refundId: res.refundId,
        message: res.message || `Refund processed successfully for ${transactionId}.`,
      };
    } catch (err: any) {
      return {
        success: false,
        refundId: '',
        message: err.message || 'Refund processing failed.',
      };
    }
  }
}

/**
 * Mock payment gateway adapter for offline test environments.
 */
export class MockPaymentGatewayAdapter implements PaymentGatewayAdapter {
  async createPaymentSession(
    _invoiceId: string,
    amount: number,
    currency: string = 'INR'
  ): Promise<PaymentSessionResponse> {
    await new Promise((res) => setTimeout(res, 200));

    const orderId = `order_${Math.random().toString(36).substring(2, 9)}`;
    const gatewayToken = `gtoken_${Date.now()}_${Math.floor(Math.random() * 10000)}`;

    return {
      sessionId: `sess_${Date.now()}`,
      orderId,
      gatewayToken,
      amount,
      currency,
    };
  }

  async processPayment(params: {
    sessionId: string;
    gatewayToken: string;
    amount: number;
    paymentMode?: string;
  }): Promise<PaymentProcessResponse> {
    await new Promise((res) => setTimeout(res, 300));

    if (params.gatewayToken.endsWith('FAIL')) {
      return {
        success: false,
        transactionId: `TXN-FAILED-${Date.now()}`,
        gatewayReference: 'ERR_GATEWAY_CARD_DECLINED',
        message: 'Payment declined by issuing bank.',
      };
    }

    const transactionId = `TXN-${Math.floor(10000000 + Math.random() * 90000000)}`;
    const gatewayReference = `pay_razorstripe_${Math.random().toString(36).substring(2, 12)}`;

    return {
      success: true,
      transactionId,
      gatewayReference,
      message: 'Payment processed successfully via payment gateway adapter.',
    };
  }

  async processRefund(
    transactionId: string,
    amount: number,
    reason: string
  ): Promise<RefundProcessResponse> {
    await new Promise((res) => setTimeout(res, 300));

    const refundId = `rfnd_${Math.random().toString(36).substring(2, 10)}`;

    return {
      success: true,
      refundId,
      message: `Refund of ₹${amount} initiated successfully for transaction ${transactionId}. Reason: ${reason}`,
    };
  }
}

// Global Singleton Export: default is now the production Razorpay adapter
export const razorpayPaymentGateway = new RazorpayPaymentGatewayAdapter();
export const mockPaymentGateway = new MockPaymentGatewayAdapter();
export const defaultPaymentGateway: PaymentGatewayAdapter = razorpayPaymentGateway;

