import React from 'react';
import type { GuardVisitor, GuardDashboardStats, Gate } from '../../../domains/guard/types';
import {
  KeyRound,
  LogIn,
  ShieldCheck,
  ChevronRight,
  CheckCircle2,
} from 'lucide-react';
import '../guard.css';

interface GuardHomeProps {
  stats: GuardDashboardStats;
  gate: Gate;
  onToggleGateStatus: () => void;
  pendingVisitors: GuardVisitor[];
  recentActivity: GuardVisitor[];
  onOpenVerify: () => void;
  onSelectVisitor: (visitor: GuardVisitor) => void;
  onNavigateTab: (tab: 'visitors' | 'inside' | 'history' | 'alerts') => void;
}

export const GuardHome: React.FC<GuardHomeProps> = ({
  stats,
  gate,
  onToggleGateStatus,
  pendingVisitors,
  recentActivity,
  onOpenVerify,
  onSelectVisitor,
  onNavigateTab,
}) => {
  return (
    <div>
      {/* Gate Status & Officer Overview Hero Card */}
      <div className="guard-hero-card">
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '0.75rem' }}>
          <div>
            <span
              className="banner-role-tag"
              style={{ background: 'rgba(251, 191, 36, 0.15)', color: '#fbbf24', border: '1px solid rgba(251, 191, 36, 0.3)' }}
            >
              ACTIVE OPERATIONAL TERMINAL
            </span>
            <h2 style={{ fontSize: '1.25rem', fontWeight: 800, margin: '0.25rem 0 0 0' }}>{gate.name}</h2>
          </div>

          <div
            className={`gate-status-pill ${gate.status === 'open' ? 'gate-status-open' : 'gate-status-closed'}`}
            onClick={onToggleGateStatus}
            title="Click to toggle gate status"
          >
            <span style={{ width: '8px', height: '8px', borderRadius: '50%', background: gate.status === 'open' ? '#34d399' : '#f87171' }} />
            <span>{gate.status.toUpperCase()}</span>
          </div>
        </div>
        <p style={{ fontSize: '0.8125rem', color: '#94a3b8', margin: 0 }}>
          Officer: Officer R. Singh • Morning Shift (06:00 AM – 02:00 PM)
        </p>
      </div>

      {/* Prominent Primary Action — VERIFY PASS */}
      <button className="verify-hero-cta" onClick={onOpenVerify}>
        <div className="verify-cta-left">
          <div className="verify-cta-icon">
            <KeyRound size={26} />
          </div>
          <div>
            <h3 className="verify-cta-title">Verify Gate Pass / Code</h3>
            <p className="verify-cta-sub">Enter passcode (8492) or simulate QR scanner</p>
          </div>
        </div>
        <ChevronRight size={22} style={{ color: '#ffffff' }} />
      </button>

      {/* Dashboard Stats 4-Grid */}
      <div className="guard-stats-row">
        <div className="guard-stat-box" onClick={() => onNavigateTab('visitors')} style={{ cursor: 'pointer' }}>
          <div className="stat-box-num" style={{ color: '#2563eb' }}>{stats.expectedToday}</div>
          <div className="stat-box-label">Expected Today</div>
        </div>

        <div className="guard-stat-box" onClick={() => onNavigateTab('visitors')} style={{ cursor: 'pointer' }}>
          <div className="stat-box-num" style={{ color: '#d97706' }}>{stats.atGate}</div>
          <div className="stat-box-label">At Gate</div>
        </div>

        <div className="guard-stat-box" onClick={() => onNavigateTab('inside')} style={{ cursor: 'pointer' }}>
          <div className="stat-box-num" style={{ color: '#059669' }}>{stats.inside}</div>
          <div className="stat-box-label">Inside</div>
        </div>

        <div className="guard-stat-box" onClick={() => onNavigateTab('alerts')} style={{ cursor: 'pointer' }}>
          <div className="stat-box-num" style={{ color: '#e11d48' }}>{stats.pendingApproval}</div>
          <div className="stat-box-label">Pending</div>
        </div>
      </div>

      {/* Pending Approvals Section */}
      {pendingVisitors.length > 0 && (
        <div style={{ marginBottom: '1.25rem' }}>
          <div className="section-heading-row">
            <h3 className="section-title">Pending Gate Approvals</h3>
            <span style={{ fontSize: '0.75rem', color: '#d97706', fontWeight: 700 }}>
              {pendingVisitors.length} Action Needed
            </span>
          </div>

          {pendingVisitors.map((v) => (
            <div key={v.id} className="guard-visitor-card" style={{ borderColor: '#fde68a', background: '#fffbe6' }}>
              <div className="guard-visitor-header">
                <h4 className="guard-visitor-title" style={{ color: '#78350f' }}>{v.name}</h4>
                <span className="banner-role-tag" style={{ background: '#fef3c7', color: '#d97706' }}>
                  APPROVAL REQUIRED
                </span>
              </div>

              <p className="guard-visitor-resident">
                Visiting <strong>{v.residentName}</strong> ({v.tower} • {v.flatCode})
              </p>

              <div className="guard-action-btns-row">
                <button
                  className="btn-guard-action-primary"
                  onClick={() => onSelectVisitor(v)}
                >
                  <CheckCircle2 size={16} />
                  <span>Verify & Approve</span>
                </button>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Recent Gate Activity Stream */}
      <div className="section-heading-row">
        <h3 className="section-title">Recent Gate Movements</h3>
        <span
          style={{ fontSize: '0.75rem', color: '#2563eb', fontWeight: 700, cursor: 'pointer' }}
          onClick={() => onNavigateTab('history')}
        >
          View Log
        </span>
      </div>

      {recentActivity.map((act) => (
        <div key={act.id} className="activity-card" onClick={() => onSelectVisitor(act)} style={{ cursor: 'pointer' }}>
          <div
            className="activity-icon-box"
            style={{
              background: act.status === 'checked_in' ? '#ecfdf5' : '#eff6ff',
              color: act.status === 'checked_in' ? '#059669' : '#2563eb',
            }}
          >
            {act.status === 'checked_in' ? <LogIn size={20} /> : <ShieldCheck size={20} />}
          </div>
          <div className="activity-content">
            <h4 className="activity-title">{act.name}</h4>
            <p className="activity-subtext">
              {act.visitorTypeLabel} • Visiting {act.residentName} ({act.flatCode})
            </p>
            <div className="activity-meta">
              Passcode: {act.passcode} • Status: {act.status.toUpperCase()}
            </div>
          </div>
        </div>
      ))}
    </div>
  );
};
