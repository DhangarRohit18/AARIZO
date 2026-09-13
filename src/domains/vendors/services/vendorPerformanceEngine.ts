import type {
  VendorScorecard,
  VendorStatus,
  VendorPerformanceMetrics,
} from '../types';
import { realtimeService } from '../../../services/realtimeService';

const VENDOR_SCORECARDS_KEY = 'aarizo_vendor_scorecards_v2';

const SEED_SCORECARDS: VendorScorecard[] = [
  {
    vendorId: 'v-otis-01',
    vendorName: 'Otis Elevator India Pvt Ltd',
    category: 'Elevator & Lift Maintenance',
    contactPerson: 'Sanjay Deshmukh',
    phone: '+91 98230 11223',
    email: 'service@otis.co.in',
    status: 'PREFERRED',
    isPubliclyRanked: false,
    notes: 'Primary AMC vendor for elevator servicing in Towers A, B, and C.',
    metrics: {
      vendorId: 'v-otis-01',
      vendorName: 'Otis Elevator India Pvt Ltd',
      category: 'Elevator & Lift Maintenance',
      hourlyRateOrPrice: 85000, // Quarterly AMC
      rating: 4.8,
      slaCompliancePercentage: 98.2,
      averageResponseTimeMinutes: 18,
      repeatComplaintsCount: 1,
      completedJobsCount: 42,
      customerSatisfactionPercentage: 96,
      historicalDataPoints: [
        { period: 'Jun 2026', jobsCompleted: 14, avgRating: 4.9, slaMetCount: 14, totalSlaCount: 14 },
        { period: 'Jul 2026', jobsCompleted: 13, avgRating: 4.7, slaMetCount: 12, totalSlaCount: 13 },
        { period: 'Aug 2026', jobsCompleted: 15, avgRating: 4.8, slaMetCount: 15, totalSlaCount: 15 },
      ],
    },
    recentJobHistory: [
      {
        jobId: 'job-981',
        title: 'Tower A Lift 2 Emergency Brake Calibration',
        date: '2026-09-05',
        rating: 5,
        slaMet: true,
        responseTimeMinutes: 15,
        residentFeedback: 'Extremely quick response to emergency stoppage.',
      },
      {
        jobId: 'job-942',
        title: 'Tower B Passenger Lift Sensor Check',
        date: '2026-08-28',
        rating: 4,
        slaMet: true,
        responseTimeMinutes: 20,
      },
    ],
  },
  {
    vendorId: 'v-apex-02',
    vendorName: 'Apex Security & Manpower Solutions',
    category: 'Security Services',
    contactPerson: 'Vikram Singh',
    phone: '+91 99123 44556',
    email: 'contact@apexsecurity.in',
    status: 'APPROVED',
    isPubliclyRanked: false,
    notes: 'Provides 24/7 security guard coverage across society gates.',
    metrics: {
      vendorId: 'v-apex-02',
      vendorName: 'Apex Security & Manpower Solutions',
      category: 'Security Services',
      hourlyRateOrPrice: 180000, // Monthly salary contract
      rating: 4.6,
      slaCompliancePercentage: 94.5,
      averageResponseTimeMinutes: 10,
      repeatComplaintsCount: 3,
      completedJobsCount: 120,
      customerSatisfactionPercentage: 92,
      historicalDataPoints: [
        { period: 'Jun 2026', jobsCompleted: 38, avgRating: 4.5, slaMetCount: 36, totalSlaCount: 38 },
        { period: 'Jul 2026', jobsCompleted: 40, avgRating: 4.7, slaMetCount: 38, totalSlaCount: 40 },
        { period: 'Aug 2026', jobsCompleted: 42, avgRating: 4.6, slaMetCount: 40, totalSlaCount: 42 },
      ],
    },
    recentJobHistory: [
      {
        jobId: 'job-891',
        title: 'Main Gate Patrol Shift Replacement',
        date: '2026-09-01',
        rating: 5,
        slaMet: true,
        responseTimeMinutes: 8,
      },
    ],
  },
  {
    vendorId: 'v-kir-03',
    vendorName: 'Kirloskar Authorized Pump Service',
    category: 'Plumbing & Hydraulic Systems',
    contactPerson: 'Anand Patil',
    phone: '+91 97654 33211',
    email: 'support@kirloskar-service.in',
    status: 'APPROVED',
    isPubliclyRanked: false,
    metrics: {
      vendorId: 'v-kir-03',
      vendorName: 'Kirloskar Authorized Pump Service',
      category: 'Plumbing & Hydraulic Systems',
      hourlyRateOrPrice: 24500,
      rating: 4.3,
      slaCompliancePercentage: 91.0,
      averageResponseTimeMinutes: 35,
      repeatComplaintsCount: 2,
      completedJobsCount: 28,
      customerSatisfactionPercentage: 89,
      historicalDataPoints: [
        { period: 'Jun 2026', jobsCompleted: 8, avgRating: 4.2, slaMetCount: 7, totalSlaCount: 8 },
        { period: 'Jul 2026', jobsCompleted: 10, avgRating: 4.4, slaMetCount: 9, totalSlaCount: 10 },
        { period: 'Aug 2026', jobsCompleted: 10, avgRating: 4.3, slaMetCount: 9, totalSlaCount: 10 },
      ],
    },
    recentJobHistory: [
      {
        jobId: 'job-810',
        title: 'Underground Reservoir Motor Rewinding',
        date: '2026-09-08',
        rating: 4,
        slaMet: true,
        responseTimeMinutes: 30,
      },
    ],
  },
  {
    vendorId: 'v-sch-04',
    vendorName: 'Schindler Elevators India',
    category: 'Elevator & Lift Maintenance',
    contactPerson: 'Rahul Verma',
    phone: '+91 98901 22334',
    email: 'info@schindler.co.in',
    status: 'APPROVED',
    isPubliclyRanked: false,
    metrics: {
      vendorId: 'v-sch-04',
      vendorName: 'Schindler Elevators India',
      category: 'Elevator & Lift Maintenance',
      hourlyRateOrPrice: 92000,
      rating: 4.5,
      slaCompliancePercentage: 95.0,
      averageResponseTimeMinutes: 22,
      repeatComplaintsCount: 1,
      completedJobsCount: 35,
      customerSatisfactionPercentage: 93,
      historicalDataPoints: [
        { period: 'Jun 2026', jobsCompleted: 11, avgRating: 4.5, slaMetCount: 10, totalSlaCount: 11 },
        { period: 'Jul 2026', jobsCompleted: 12, avgRating: 4.6, slaMetCount: 12, totalSlaCount: 12 },
        { period: 'Aug 2026', jobsCompleted: 12, avgRating: 4.4, slaMetCount: 11, totalSlaCount: 12 },
      ],
    },
    recentJobHistory: [],
  },
  {
    vendorId: 'v-bad-05',
    vendorName: 'QuickFix Local Plumbers',
    category: 'Plumbing & Hydraulic Systems',
    contactPerson: 'Mahesh Jadhav',
    phone: '+91 91234 99887',
    status: 'SUSPENDED',
    isPubliclyRanked: false,
    notes: 'Suspended due to multiple delayed responses and unverified spare parts pricing.',
    metrics: {
      vendorId: 'v-bad-05',
      vendorName: 'QuickFix Local Plumbers',
      category: 'Plumbing & Hydraulic Systems',
      hourlyRateOrPrice: 18000,
      rating: 2.9,
      slaCompliancePercentage: 64.0,
      averageResponseTimeMinutes: 95,
      repeatComplaintsCount: 8,
      completedJobsCount: 19,
      customerSatisfactionPercentage: 58,
      historicalDataPoints: [
        { period: 'Jun 2026', jobsCompleted: 7, avgRating: 3.2, slaMetCount: 5, totalSlaCount: 7 },
        { period: 'Jul 2026', jobsCompleted: 6, avgRating: 2.8, slaMetCount: 3, totalSlaCount: 6 },
        { period: 'Aug 2026', jobsCompleted: 6, avgRating: 2.7, slaMetCount: 4, totalSlaCount: 6 },
      ],
    },
    recentJobHistory: [],
  },
];

class VendorPerformanceEngine {
  private getStoredScorecards(): VendorScorecard[] {
    const raw = localStorage.getItem(VENDOR_SCORECARDS_KEY);
    if (!raw) {
      localStorage.setItem(VENDOR_SCORECARDS_KEY, JSON.stringify(SEED_SCORECARDS));
      return SEED_SCORECARDS;
    }
    try {
      return JSON.parse(raw);
    } catch (e) {
      console.error('Failed to parse vendor scorecards', e);
      return SEED_SCORECARDS;
    }
  }

  private saveScorecards(cards: VendorScorecard[]): void {
    localStorage.setItem(VENDOR_SCORECARDS_KEY, JSON.stringify(cards));
    realtimeService.broadcast('VENDOR_PERFORMANCE_UPDATED', { count: cards.length });
  }

  public getVendorScorecards(categoryFilter?: string): VendorScorecard[] {
    let list = this.getStoredScorecards();
    if (categoryFilter && categoryFilter !== 'ALL') {
      list = list.filter((c) => c.category.toLowerCase().includes(categoryFilter.toLowerCase()));
    }
    return list;
  }

  public getVendorById(id: string): VendorScorecard | undefined {
    return this.getStoredScorecards().find((v) => v.vendorId === id);
  }

  public updateVendorStatus(vendorId: string, status: VendorStatus): VendorScorecard | null {
    const cards = this.getStoredScorecards();
    const index = cards.findIndex((c) => c.vendorId === vendorId);
    if (index === -1) return null;

    cards[index].status = status;
    this.saveScorecards(cards);
    return cards[index];
  }

  public togglePublicRanking(vendorId: string, isPubliclyRanked: boolean): VendorScorecard | null {
    const cards = this.getStoredScorecards();
    const index = cards.findIndex((c) => c.vendorId === vendorId);
    if (index === -1) return null;

    cards[index].isPubliclyRanked = isPubliclyRanked;
    this.saveScorecards(cards);
    return cards[index];
  }

  public addJobPerformanceRecord(
    vendorId: string,
    job: {
      jobId: string;
      title: string;
      date: string;
      rating: number;
      slaMet: boolean;
      responseTimeMinutes: number;
      residentFeedback?: string;
    }
  ): VendorScorecard | null {
    const cards = this.getStoredScorecards();
    const index = cards.findIndex((c) => c.vendorId === vendorId);
    if (index === -1) return null;

    const vendor = cards[index];
    vendor.recentJobHistory.unshift(job);

    // Recalculate historical performance metrics dynamically
    const history = vendor.recentJobHistory;
    const totalJobs = history.length;
    const avgRating = Math.round((history.reduce((a, b) => a + b.rating, 0) / (totalJobs || 1)) * 10) / 10;
    const slaMetCount = history.filter((h) => h.slaMet).length;
    const slaPercentage = Math.round((slaMetCount / (totalJobs || 1)) * 100);
    const avgResponse = Math.round(history.reduce((a, b) => a + b.responseTimeMinutes, 0) / (totalJobs || 1));

    vendor.metrics.completedJobsCount += 1;
    vendor.metrics.rating = avgRating;
    vendor.metrics.slaCompliancePercentage = slaPercentage;
    vendor.metrics.averageResponseTimeMinutes = avgResponse;

    this.saveScorecards(cards);
    return vendor;
  }

  public compareVendors(vendorIds: string[]): VendorScorecard[] {
    const cards = this.getStoredScorecards();
    return cards.filter((c) => vendorIds.includes(c.vendorId));
  }
}

export const vendorPerformanceEngine = new VendorPerformanceEngine();
