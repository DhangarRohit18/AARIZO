import type { Poll } from '../../domains/community';

export const mockPolls: Poll[] = [
  {
    id: 'POL-401',
    question:
      'Proposed Installation of 100kW Solar Panels on Tower Rooftops to Reduce Common Electricity Dues',
    category: 'rwa',
    createdDate: '25 Aug 2026',
    closingDate: '15 Sep 2026',
    totalVotes: 114,
    userVotedOptionId: 'opt-1',
    options: [
      {
        id: 'opt-1',
        text: 'Approve Full 100kW Solar Installation (Est. 25% common bill reduction)',
        votesCount: 64,
      },
      {
        id: 'opt-2',
        text: 'Approve Phase 1 Trial (50kW capacity first)',
        votesCount: 38,
      },
      {
        id: 'opt-3',
        text: 'Reject / Require detailed technical audit before voting',
        votesCount: 12,
      },
    ],
  },
  {
    id: 'POL-402',
    question:
      'Weekend Guest Vehicle Parking Policy & Hourly Surcharge Re-evaluation',
    category: 'security',
    createdDate: '29 Aug 2026',
    closingDate: '20 Sep 2026',
    totalVotes: 115,
    userVotedOptionId: undefined,
    options: [
      {
        id: 'opt-201',
        text: 'Keep current policy (2 Hours free, then ₹20/hr)',
        votesCount: 45,
      },
      {
        id: 'opt-202',
        text: 'Increase free allowance to 4 Hours for weekend visitors',
        votesCount: 52,
      },
      {
        id: 'opt-203',
        text: 'Flat ₹50 overnight fee per visitor vehicle',
        votesCount: 18,
      },
    ],
  },
];
