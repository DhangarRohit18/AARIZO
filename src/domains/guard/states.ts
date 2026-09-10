import type {
  GateEntryStatus,
  VisitorVerificationStatus,
  GuardAlertSeverity,
} from './types';

export const getNextGateLifecycleState = (current: GateEntryStatus): GateEntryStatus => {
  switch (current) {
    case 'expected':
      return 'at_gate';
    case 'at_gate':
      return 'verifying';
    case 'verifying':
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

export const getEntryStatusLabel = (status: GateEntryStatus): string => {
  switch (status) {
    case 'expected':
      return 'Expected Today';
    case 'at_gate':
      return 'At Gate';
    case 'verifying':
      return 'Verifying Pass';
    case 'approval_required':
      return 'Approval Required';
    case 'approved':
      return 'Entry Approved';
    case 'checked_in':
      return 'Inside Community';
    case 'checked_out':
      return 'Checked Out';
    case 'rejected':
      return 'Entry Rejected';
    case 'expired':
      return 'Pass Expired';
    case 'cancelled':
      return 'Pass Cancelled';
  }
};

export const getEntryStatusBadgeVariant = (
  status: GateEntryStatus
): 'success' | 'warning' | 'danger' | 'info' | 'neutral' => {
  switch (status) {
    case 'checked_in':
    case 'approved':
      return 'success';
    case 'expected':
    case 'at_gate':
    case 'verifying':
    case 'approval_required':
      return 'warning';
    case 'rejected':
    case 'expired':
    case 'cancelled':
      return 'danger';
    case 'checked_out':
    default:
      return 'neutral';
  }
};

export const getVerificationLabel = (status: VisitorVerificationStatus): string => {
  switch (status) {
    case 'valid':
      return 'PASS VERIFIED (VALID)';
    case 'approval_required':
      return 'RESIDENT APPROVAL REQUIRED';
    case 'invalid':
      return 'INVALID PASSCODE';
    case 'expired':
      return 'PASS EXPIRED';
    case 'cancelled':
      return 'PASS CANCELLED BY RESIDENT';
  }
};

export const getAlertSeverityVariant = (
  severity: GuardAlertSeverity
): 'danger' | 'warning' | 'info' => {
  switch (severity) {
    case 'critical':
      return 'danger';
    case 'warning':
      return 'warning';
    case 'info':
    default:
      return 'info';
  }
};
