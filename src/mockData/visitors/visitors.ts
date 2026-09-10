import type { Visitor } from '../../domains/visitors';

export const mockFrequentVisitors: Visitor[] = [
  {
    id: 'freq-1',
    name: 'Sunita Bai',
    phone: '+91 98111 22334',
    avatarInitials: 'SB',
    isFrequent: true,
    categoryLabel: 'House Maid',
  },
  {
    id: 'freq-2',
    name: 'Rajesh Kumar',
    phone: '+91 98222 33445',
    avatarInitials: 'RK',
    isFrequent: true,
    categoryLabel: 'Personal Driver',
  },
  {
    id: 'freq-3',
    name: 'Prem Dairy Supplier',
    phone: '+91 98333 44556',
    avatarInitials: 'PM',
    isFrequent: true,
    categoryLabel: 'Milkman',
  },
];
