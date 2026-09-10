import React from 'react';
import {
  Users,
  Clock,
  AlertTriangle,
  CreditCard,
  UserPlus,
  Megaphone,
  CheckSquare,
  DollarSign,
  BellRing,
  ArrowRight,
} from 'lucide-react';
import type {
  SecretaryResidentRecord,
  SecretaryNoticeItem,
  CanonicalBillingRecord,
} from '../../../domains/secretary/types';
import '../secretary.css';

interface SecretaryHomeProps {
  residentsList?: SecretaryResidentRecord[];
  noticesList?: SecretaryNoticeItem[];
  ledgerList?: CanonicalBillingRecord[];
  onQuickActionClick?: (action: string) => void;
}

export const SecretaryHome: React.FC<SecretaryHomeProps> = ({
  residentsList = [],
  noticesList = [],
  ledgerList = [],
  onQuickActionClick,
}) => {
  const pendingCount = residentsList.filter((r) => r.status === 'Pending Verification').length;
  const activeCount = residentsList.filter((r) => r.status === 'Active').length;
  const totalBilled = ledgerList.reduce((acc, curr) => acc + curr.totalAmount, 0);
  const totalCollected = ledgerList.reduce((acc, curr) => acc + curr.amountPaid, 0);
  const collectionPercentage = totalBilled > 0 ? Math.round((totalCollected / totalBilled) * 100) : 88;

  return (
    <div>
      {/* Welcome Banner */}
      <div className="secretary-welcome-banner">
        <span className="banner-role-tag">Management Committee</span>
        <h2 className="banner-title">Welcome back, Mayuri Udar!</h2>
        <p className="banner-subtitle">Secretary • Green Valley Society (128 Units · 4 Blocks)</p>
      </div>

      {/* Quick Stats Grid 2x2 */}
      <div className="stats-grid-2x2">
        {/* Total Residents */}
        <div
          className="secretary-stat-card"
          style={{ cursor: 'pointer' }}
          onClick={() => onQuickActionClick && onQuickActionClick('Add Resident')}
        >
          <div className="stat-icon-wrapper stat-icon-blue">
            <Users size={20} />
          </div>
          <div className="stat-value">{residentsList.length || 128}</div>
          <div className="stat-label">Total Residents ({activeCount} Active)</div>
        </div>

        {/* Pending Approvals */}
        <div
          className="secretary-stat-card"
          style={{ cursor: 'pointer' }}
          onClick={() => onQuickActionClick && onQuickActionClick('Pending Approvals')}
        >
          <div className="stat-icon-wrapper stat-icon-amber">
            <Clock size={20} />
          </div>
          <div className="stat-value">{pendingCount}</div>
          <div className="stat-label">Pending KYC Approvals</div>
        </div>

        {/* Open Issues */}
        <div className="secretary-stat-card">
          <div className="stat-icon-wrapper stat-icon-rose">
            <AlertTriangle size={20} />
          </div>
          <div className="stat-value">4</div>
          <div className="stat-label">Open Helpdesk Tickets</div>
        </div>

        {/* Dues Collection */}
        <div
          className="secretary-stat-card"
          style={{ cursor: 'pointer' }}
          onClick={() => onQuickActionClick && onQuickActionClick('View Ledger')}
        >
          <div className="stat-icon-wrapper stat-icon-emerald">
            <CreditCard size={20} />
          </div>
          <div className="stat-value">{collectionPercentage}%</div>
          <div className="stat-label">Dues Collection Rate</div>
        </div>
      </div>

      {/* Quick Actions Bar */}
      <div className="section-heading-row">
        <h3 className="section-title">Secretary Quick Actions</h3>
        <span style={{ fontSize: '0.75rem', color: '#64748b', fontWeight: 600 }}>Active Operational Workflows</span>
      </div>

      <div className="secretary-quick-actions-row">
        <button
          className="action-card-btn"
          onClick={() => onQuickActionClick && onQuickActionClick('Add Resident')}
        >
          <div className="action-btn-icon">
            <UserPlus size={18} />
          </div>
          <span className="action-btn-text">Add / Verify</span>
        </button>

        <button
          className="action-card-btn"
          onClick={() => onQuickActionClick && onQuickActionClick('Broadcast Notice')}
        >
          <div className="action-btn-icon">
            <Megaphone size={18} />
          </div>
          <span className="action-btn-text">Broadcast</span>
        </button>

        <button
          className="action-card-btn"
          onClick={() => onQuickActionClick && onQuickActionClick('Pending Approvals')}
        >
          <div className="action-btn-icon">
            <CheckSquare size={18} />
          </div>
          <span className="action-btn-text">Review KYC</span>
        </button>

        <button
          className="action-card-btn"
          onClick={() => onQuickActionClick && onQuickActionClick('Collect Dues')}
        >
          <div className="action-btn-icon">
            <DollarSign size={18} />
          </div>
          <span className="action-btn-text">Issue Bill</span>
        </button>
      </div>

      {/* Recent Society Notices Feed */}
      <div className="section-heading-row" style={{ marginTop: '1.25rem' }}>
        <h3 className="section-title">Official Announcements</h3>
        <span
          style={{ fontSize: '0.75rem', color: '#2563eb', fontWeight: 700, cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '0.25rem' }}
          onClick={() => onQuickActionClick && onQuickActionClick('Broadcast Notice')}
        >
          <span>Manage Center</span>
          <ArrowRight size={14} />
        </span>
      </div>

      {noticesList.slice(0, 3).map((notice) => (
        <div key={notice.id} className="activity-card" style={{ marginBottom: '0.75rem' }}>
          <div
            className="activity-icon-box"
            style={{
              background: notice.priority === 'Urgent' ? '#fef2f2' : '#eff6ff',
              color: notice.priority === 'Urgent' ? '#dc2626' : '#2563eb',
            }}
          >
            {notice.priority === 'Urgent' ? <BellRing size={20} /> : <Megaphone size={20} />}
          </div>
          <div className="activity-content">
            <h4 className="activity-title">{notice.title}</h4>
            <p className="activity-subtext">{notice.content}</p>
            <div className="activity-meta">
              {notice.category} • Target: {notice.targetAudience} • Posted by {notice.authorName}
            </div>
          </div>
        </div>
      ))}
    </div>
  );
};
