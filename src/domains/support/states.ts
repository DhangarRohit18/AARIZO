import type { TicketStatus, TicketCategory } from './types';

export const getTicketStatusLabel = (status: TicketStatus): string => {
  switch (status) {
    case 'open':
      return 'Open';
    case 'in_progress':
      return 'In Progress';
    case 'resolved':
      return 'Resolved';
    case 'closed':
      return 'Closed';
  }
};

export const getTicketCategoryLabel = (category: TicketCategory): string => {
  switch (category) {
    case 'maintenance':
      return 'General Maintenance';
    case 'plumbing':
      return 'Plumbing & Water';
    case 'electrical':
      return 'Electrical & Power';
    case 'housekeeping':
      return 'Housekeeping & Cleanliness';
    case 'security':
      return 'Security & Gate';
    case 'common_area':
      return 'Common Area & Amenities';
    case 'other':
      return 'Other Issue';
  }
};

export const getTicketStatusBadgeVariant = (
  status: TicketStatus
): 'success' | 'warning' | 'info' | 'neutral' => {
  switch (status) {
    case 'open':
      return 'warning';
    case 'in_progress':
      return 'info';
    case 'resolved':
      return 'success';
    case 'closed':
    default:
      return 'neutral';
  }
};
