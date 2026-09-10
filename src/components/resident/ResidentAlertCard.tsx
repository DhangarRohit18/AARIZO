import React from 'react';
import { AlertCircle, ArrowRight, ShieldAlert, CheckCircle2 } from 'lucide-react';
import type { UrgentAlertMock } from '../../mockData/residentHomeData';
import './resident.css';

export interface ResidentAlertCardProps {
  alert: UrgentAlertMock;
  onAction?: () => void;
  onDismiss?: () => void;
}

export const ResidentAlertCard: React.FC<ResidentAlertCardProps> = ({ alert, onAction }) => {
  const getIcon = () => {
    switch (alert.severity) {
      case 'urgent':
        return <ShieldAlert size={18} className="alert-icon-urgent" />;
      case 'warning':
        return <AlertCircle size={18} className="alert-icon-warning" />;
      default:
        return <CheckCircle2 size={18} className="alert-icon-info" />;
    }
  };

  const getLabel = () => {
    switch (alert.severity) {
      case 'urgent':
        return 'CRITICAL EMERGENCY';
      case 'warning':
        return 'ACTION REQUIRED';
      default:
        return 'INFORMATION';
    }
  };

  return (
    <div className={`res-alert-card res-alert-${alert.severity}`}>
      <div className="res-alert-header">
        <div className="res-alert-title-row">
          {getIcon()}
          <span className="res-alert-label">{getLabel()}</span>
        </div>
        <span className="res-alert-time">{alert.timestamp}</span>
      </div>

      <div className="res-alert-body">
        <h3 className="res-alert-title">{alert.title}</h3>
        <p className="res-alert-message">{alert.message}</p>
      </div>

      {alert.actionLabel && (
        <button className="res-alert-action-btn" onClick={onAction}>
          <span>{alert.actionLabel}</span>
          <ArrowRight size={14} />
        </button>
      )}
    </div>
  );
};
