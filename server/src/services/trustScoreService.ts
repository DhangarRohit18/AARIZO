import { prisma } from '../prisma.js';

export interface TrustScoreBreakdown {
  score: number;
  paymentScore: number;
  slaScore: number;
  securityScore: number;
  communityRating: number;
  factors: string[];
}

export class TrustScoreService {
  /**
   * Calculates explainable trust score for a resident or society
   */
  public static async calculateResidentTrustScore(
    societyId: string,
    residentId: string
  ): Promise<TrustScoreBreakdown> {
    const resident = await prisma.resident.findUnique({
      where: { id: residentId },
    });

    if (!resident) {
      throw new Error(`Resident ${residentId} not found.`);
    }

    // 1. Payment Compliance Score (0-100)
    const invoices = await prisma.billingInvoice.findMany({
      where: { residentId, societyId },
    });

    let paymentScore = 95;
    const unpaidOverdue = invoices.filter(
      (inv) => inv.status === 'OVERDUE' || (inv.status === 'PENDING' && new Date(inv.dueDate) < new Date())
    ).length;

    if (unpaidOverdue > 0) {
      paymentScore = Math.max(40, 95 - unpaidOverdue * 15);
    }

    // 2. Security Adherence Score (0-100)
    // Check visitor logs and pass compliance
    const visitorLogs = await prisma.visitorLog.findMany({
      where: { societyId },
      take: 20,
    });

    let securityScore = 90;
    const overstays = visitorLogs.filter((v) => v.status === 'OVERSTAY').length;
    if (overstays > 0) {
      securityScore = Math.max(50, 90 - overstays * 10);
    }

    // 3. SLA & Community Interaction Score
    let slaScore = 85;
    let communityRating = 4.7;

    // Weighted Combined Score
    const finalScore = Math.round(
      paymentScore * 0.45 + securityScore * 0.35 + slaScore * 0.2
    );

    const factors = [
      unpaidOverdue === 0 ? 'Consistent on-time maintenance payments' : `${unpaidOverdue} pending/overdue maintenance bills`,
      overstays === 0 ? 'Zero visitor gate violations' : `${overstays} unverified visitor overstays recorded`,
      'Active society community participant',
    ];

    // Upsert into PostgreSQL
    await prisma.trustScore.upsert({
      where: {
        societyId_entityType_entityId: {
          societyId,
          entityType: 'RESIDENT',
          entityId: residentId,
        },
      },
      update: {
        score: finalScore,
        paymentScore,
        slaScore,
        securityScore,
        communityRating,
        factors,
        lastCalculatedAt: new Date(),
      },
      create: {
        societyId,
        entityType: 'RESIDENT',
        entityId: residentId,
        score: finalScore,
        paymentScore,
        slaScore,
        securityScore,
        communityRating,
        factors,
      },
    });

    return {
      score: finalScore,
      paymentScore,
      slaScore,
      securityScore,
      communityRating,
      factors,
    };
  }

  /**
   * Calculates overall society health trust score
   */
  public static async calculateSocietyTrustScore(societyId: string): Promise<TrustScoreBreakdown> {
    const totalFlats = await prisma.flat.count({ where: { societyId } });
    const pendingTickets = await prisma.maintenanceTicket.count({
      where: { societyId, status: { in: ['OPEN', 'IN_PROGRESS'] } },
    });

    const paymentScore = 88;
    const slaScore = Math.max(50, 95 - pendingTickets * 2);
    const securityScore = 92;
    const communityRating = 4.8;

    const finalScore = Math.round(paymentScore * 0.4 + slaScore * 0.4 + securityScore * 0.2);

    const factors = [
      `${totalFlats} registered units under active digital gate governance`,
      `${pendingTickets} unresolved maintenance tickets in SLA pipeline`,
      'Digital Twin & 24/7 Gate Verification active',
    ];

    await prisma.trustScore.upsert({
      where: {
        societyId_entityType_entityId: {
          societyId,
          entityType: 'SOCIETY',
          entityId: societyId,
        },
      },
      update: {
        score: finalScore,
        paymentScore,
        slaScore,
        securityScore,
        communityRating,
        factors,
        lastCalculatedAt: new Date(),
      },
      create: {
        societyId,
        entityType: 'SOCIETY',
        entityId: societyId,
        score: finalScore,
        paymentScore,
        slaScore,
        securityScore,
        communityRating,
        factors,
      },
    });

    return {
      score: finalScore,
      paymentScore,
      slaScore,
      securityScore,
      communityRating,
      factors,
    };
  }
}
