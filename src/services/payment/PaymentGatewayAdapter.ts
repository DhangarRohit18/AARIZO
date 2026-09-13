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
  }): Promise<PaymentProcessResponse>;

  processRefund(
    transactionId: string,
    amount: number,
    reason: string
  ): Promise<RefundProcessResponse>;
}

/**
 * Production-ready mock payment gateway adapter implementing PaymentGatewayAdapter interface.
 * Can be swapped with RazorpayAdapter or StripeAdapter in production without changing application business logic.
 */
export class MockPaymentGatewayAdapter implements PaymentGatewayAdapter {
  async createPaymentSession(
    _invoiceId: string,
    amount: number,
    currency: string = 'INR'
  ): Promise<PaymentSessionResponse> {
    // Simulate gateway API handshake latency
    await new Promise((res) => setTimeout(res, 300));

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
    // Simulate payment gateway processing latency
    await new Promise((res) => setTimeout(res, 600));

    // Simulate gateway failure scenario if gatewayToken ends with 'FAIL'
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
    await new Promise((res) => setTimeout(res, 400));

    const refundId = `rfnd_${Math.random().toString(36).substring(2, 10)}`;

    return {
      success: true,
      refundId,
      message: `Refund of ₹${amount} initiated successfully for transaction ${transactionId}. Reason: ${reason}`,
    };
  }
}

// Global Singleton Export of Gateway Adapter
export const defaultPaymentGateway = new MockPaymentGatewayAdapter();
