import React from 'react';
import type { GuardAlert } from '../../../domains/guard/types';
import { ShieldAlert, AlertTriangle, Bell, CheckCircle2 } from 'lucide-react';
import '../guard.css';

interface GuardAlertsProps {
  alerts: GuardAlert[];
  onAcknowledgeAlert: (id: string) => void;
}

export const GuardAlerts: React.FC<GuardAlertsProps> = ({ alerts, onAcknowledgeAlert }) => {
  return (
    <div>
      <div className="section-heading-row">
        <h3 className="section-title">Security Emergency & Gate Alert Center</h3>
        <span style={{ fontSize: '0.75rem', color: '#dc2626', fontWeight: 800 }}>
          {alerts.filter((a) => !a.isAcknowledged).length} Unacknowledged Alerts
        </span>
      </div>

      {alerts.map((item) => (
        <div
          key={item.id}
          className={item.category === 'emergency_sos' ? 'guard-sos-card' : 'activity-card'}
          style={
            item.category !== 'emergency_sos'
              ? {
                  background: item.isAcknowledged ? '#ffffff' : '#fffbe6',
                  borderColor: item.isAcknowledged ? '#e2e8f0' : '#fde68a',
                }
              : undefined
          }
        >
          {item.category === 'emergency_sos' ? (
            <div>
              <div className="sos-card-header">
                <ShieldAlert size={24} className="spin-icon" style={{ animationDuration: '3s' }} />
                <span>{item.title}</span>
              </div>
              <p style={{ fontSize: '0.9375rem', fontWeight: 700, color: '#991b1b', margin: '0 0 0.25rem 0' }}>
                Resident: {item.residentName} ({item.flatCode})
              </p>
              <p style={{ fontSize: '0.84375rem', color: '#7f1d1d', margin: '0 0 0.875rem 0' }}>
                {item.description}
              </p>

              <div style={{ display: 'flex', gap: '0.625rem' }}>
                {!item.isAcknowledged ? (
                  <button
                    className="btn-guard-action-danger"
                    style={{ flex: 1 }}
                    onClick={() => onAcknowledgeAlert(item.id)}
                  >
                    <CheckCircle2 size={16} />
                    <span>Acknowledge SOS Dispatch</span>
                  </button>
                ) : (
                  <span
                    style={{
                      fontSize: '0.75rem',
                      fontWeight: 800,
                      color: '#16a34a',
                      background: '#dcfce7',
                      padding: '0.375rem 0.75rem',
                      borderRadius: '8px',
                    }}
                  >
                    ✓ SOS Dispatch Acknowledged at Gate #1
                  </span>
                )}
              </div>
            </div>
          ) : (
            <>
              <div
                className="activity-icon-box"
                style={{
                  background: item.severity === 'warning' ? '#fffbe6' : '#eff6ff',
                  color: item.severity === 'warning' ? '#d97706' : '#2563eb',
                }}
              >
                {item.severity === 'warning' ? <AlertTriangle size={20} /> : <Bell size={20} />}
              </div>

              <div className="activity-content">
                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                  <h4 className="activity-title">{item.title}</h4>
                  {!item.isAcknowledged && (
                    <button
                      className="btn-auth-text"
                      style={{ fontSize: '0.6875rem', color: '#2563eb', padding: 0 }}
                      onClick={() => onAcknowledgeAlert(item.id)}
                    >
                      Acknowledge
                    </button>
                  )}
                </div>

                <p className="activity-subtext">{item.description}</p>
                <div className="activity-meta">
                  {item.timestamp} • {item.residentName ? `${item.residentName} (${item.flatCode})` : 'System Alert'}
                </div>
              </div>
            </>
          )}
        </div>
      ))}
    </div>
  );
};
