import React from 'react';
import type { VisitorPassStatus } from '../../../domains/visitors';
import { getNextLifecycleState, getStatusLabel } from '../../../domains/visitors';
import { RefreshCw, CheckCircle, ArrowRight } from 'lucide-react';
import './visitor.css';

export interface VisitorLifecycleProps {
  currentStatus: VisitorPassStatus;
  onStatusChange: (newStatus: VisitorPassStatus) => void;
}

export const VisitorLifecycle: React.FC<VisitorLifecycleProps> = ({
  currentStatus,
  onStatusChange,
}) => {
  const nextStatus = getNextLifecycleState(currentStatus);
  const canAdvance = nextStatus !== currentStatus;

  return (
    <div className="vis-lifecycle-bar">
      <div className="vis-lifecycle-info">
        <RefreshCw size={13} className="vis-lifecycle-ic" />
        <span>PROTOTYPE LIFECYCLE SIMULATOR:</span>
        <strong className="vis-current-st">{getStatusLabel(currentStatus)}</strong>
      </div>
      {canAdvance && (
        <button
          className="vis-lifecycle-advance-btn"
          onClick={() => onStatusChange(nextStatus)}
        >
          <span>Advance to {getStatusLabel(nextStatus)}</span>
          <ArrowRight size={12} />
        </button>
      )}
      {currentStatus === 'checked_out' && (
        <span className="vis-lifecycle-done">
          <CheckCircle size={13} /> Completed
        </span>
      )}
    </div>
  );
};
