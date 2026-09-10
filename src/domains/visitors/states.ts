import type { VisitorPassStatus } from './types';

export const getNextLifecycleState = (current: VisitorPassStatus): VisitorPassStatus => {
  switch (current) {
    case 'active':
      return 'arrived';
    case 'arrived':
      return 'approval_required';
    case 'approval_required':
      return 'approved';
    case 'approved':
      return 'checked_in';
    case 'checked_in':
      return 'checked_out';
    default:
      return current;
  }
};

export const getStatusLabel = (status: VisitorPassStatus): string => {
  switch (status) {
    case 'draft':
      return 'Draft';
    case 'active':
      return 'Expected / Active';
    case 'arrived':
      return 'At Gate';
    case 'approval_required':
      return 'Approval Needed';
    case 'approved':
      return 'Approved';
    case 'checked_in':
      return 'Inside Community';
    case 'checked_out':
      return 'Checked Out';
    case 'cancelled':
      return 'Cancelled';
    case 'expired':
      return 'Expired';
    case 'rejected':
      return 'Rejected';
  }
};

export const getStatusBadgeVariant = (status: VisitorPassStatus): 'success' | 'warning' | 'danger' | 'info' | 'neutral' => {
  switch (status) {
    case 'checked_in':
    case 'approved':
      return 'success';
    case 'active':
    case 'arrived':
    case 'approval_required':
      return 'warning';
    case 'rejected':
    case 'cancelled':
    case 'expired':
      return 'danger';
    case 'checked_out':
    default:
      return 'neutral';
  }
};
