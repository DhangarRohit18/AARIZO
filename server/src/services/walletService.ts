import { prisma } from '../prisma.js';

export interface WalletTransactionRequest {
  societyId: string;
  residentId: string;
  type: 'CREDIT' | 'DEBIT';
  amount: number;
  category: 'AMENITY_FEE' | 'CLUBHOUSE' | 'MAINTENANCE' | 'RECHARGE';
  description: string;
  referenceId?: string;
}

export class WalletService {
  /**
   * Retrieves the current verified ledger balance for a resident
   */
  public static async getBalance(societyId: string, residentId: string): Promise<number> {
    const transactions = await prisma.walletTransaction.findMany({
      where: { societyId, residentId },
      orderBy: { createdAt: 'desc' },
      take: 1,
    });

    if (transactions.length === 0) return 0.0;
    return Number(transactions[0].balanceAfter);
  }

  /**
   * Executes an atomic, ledger-verified transaction with strict invariant enforcement
   */
  public static async executeTransaction(req: WalletTransactionRequest) {
    const { societyId, residentId, type, amount, category, description, referenceId } = req;

    if (amount <= 0) {
      throw new Error('Transaction amount must be strictly greater than 0.');
    }

    return await prisma.$transaction(async (tx) => {
      // 1. Get current balance
      const lastTx = await tx.walletTransaction.findFirst({
        where: { societyId, residentId },
        orderBy: { createdAt: 'desc' },
      });

      const currentBalance = lastTx ? Number(lastTx.balanceAfter) : 0.0;

      // 2. Strict invariant check for debits
      if (type === 'DEBIT' && currentBalance < amount) {
        throw new Error(
          `Insufficient wallet balance. Current: ₹${currentBalance.toFixed(2)}, Required: ₹${amount.toFixed(2)}`
        );
      }

      // 3. Compute new ledger balance
      const newBalance = type === 'CREDIT' ? currentBalance + amount : currentBalance - amount;

      // 4. Record ledger entry
      const entry = await tx.walletTransaction.create({
        data: {
          societyId,
          residentId,
          type,
          category,
          amount,
          balanceAfter: newBalance,
          description: description.trim(),
          referenceId,
        },
      });

      // 5. Emit Outbox Event for real-time notification
      await tx.outboxEvent.create({
        data: {
          eventId: `evt_${crypto.randomUUID()}`,
          societyId,
          eventType: 'WALLET_TRANSACTION_RECORDED',
          entityId: entry.id,
          payload: {
            transactionId: entry.id,
            residentId,
            type,
            amount,
            newBalance,
            description,
          },
          status: 'PENDING',
        },
      });

      return {
        transactionId: entry.id,
        balance: newBalance,
        amount,
        type,
        timestamp: entry.createdAt,
      };
    });
  }
}
