import React, { useState } from 'react';
import type { GateHistoryRecord } from '../../../domains/guard/types';
import { Search, LogIn, LogOut, XCircle, CheckCircle2 } from 'lucide-react';
import '../guard.css';

interface GateHistoryProps {
  history: GateHistoryRecord[];
}

export const GateHistory: React.FC<GateHistoryProps> = ({ history }) => {
  const [searchTerm, setSearchTerm] = useState<string>('');
  const [activeFilter, setActiveFilter] = useState<'ALL' | 'ENTRY' | 'EXIT' | 'REJECTED'>('ALL');

  const filteredHistory = history.filter((item) => {
    const matchesSearch =
      item.visitorName.toLowerCase().includes(searchTerm.toLowerCase()) ||
      item.flatCode.toLowerCase().includes(searchTerm.toLowerCase()) ||
      item.residentName.toLowerCase().includes(searchTerm.toLowerCase());

    if (!matchesSearch) return false;

    if (activeFilter === 'ENTRY') return item.action === 'checked_in' || item.action === 'entry_approved';
    if (activeFilter === 'EXIT') return item.action === 'checked_out';
    if (activeFilter === 'REJECTED') return item.action === 'entry_rejected';
    return true;
  });

  return (
    <div>
      <div className="section-heading-row">
        <h3 className="section-title">Gate Activity Audit History</h3>
        <span style={{ fontSize: '0.75rem', color: '#64748b', fontWeight: 600 }}>
          {filteredHistory.length} Movement Records
        </span>
      </div>

      {/* Search Bar */}
      <div className="resident-search-bar" style={{ marginBottom: '0.75rem' }}>
        <div className="search-input-wrapper">
          <Search size={18} style={{ color: '#94a3b8' }} />
          <input
            type="text"
            className="search-input-field"
            placeholder="Search history by visitor, resident, or flat..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
        </div>
      </div>

      {/* Filter Tabs */}
      <div className="control-pill-toggle" style={{ marginBottom: '1.25rem', background: '#e2e8f0' }}>
        <button
          className={`pill-btn ${activeFilter === 'ALL' ? 'pill-active' : ''}`}
          onClick={() => setActiveFilter('ALL')}
        >
          <span>All Logs</span>
        </button>
        <button
          className={`pill-btn ${activeFilter === 'ENTRY' ? 'pill-active' : ''}`}
          onClick={() => setActiveFilter('ENTRY')}
        >
          <span>Entries</span>
        </button>
        <button
          className={`pill-btn ${activeFilter === 'EXIT' ? 'pill-active' : ''}`}
          onClick={() => setActiveFilter('EXIT')}
        >
          <span>Exits</span>
        </button>
        <button
          className={`pill-btn ${activeFilter === 'REJECTED' ? 'pill-active' : ''}`}
          onClick={() => setActiveFilter('REJECTED')}
        >
          <span>Rejected</span>
        </button>
      </div>

      {/* History Log List */}
      {filteredHistory.map((item) => (
        <div key={item.id} className="activity-card">
          <div
            className="activity-icon-box"
            style={{
              background:
                item.action === 'checked_in' || item.action === 'entry_approved'
                  ? '#ecfdf5'
                  : item.action === 'checked_out'
                  ? '#eff6ff'
                  : '#fff1f2',
              color:
                item.action === 'checked_in' || item.action === 'entry_approved'
                  ? '#059669'
                  : item.action === 'checked_out'
                  ? '#2563eb'
                  : '#dc2626',
            }}
          >
            {item.action === 'checked_in' && <LogIn size={20} />}
            {item.action === 'checked_out' && <LogOut size={20} />}
            {item.action === 'entry_rejected' && <XCircle size={20} />}
            {item.action === 'entry_approved' && <CheckCircle2 size={20} />}
          </div>

          <div className="activity-content">
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
              <h4 className="activity-title">{item.visitorName}</h4>
              <span
                style={{
                  fontSize: '0.6875rem',
                  fontWeight: 800,
                  color:
                    item.action === 'checked_in'
                      ? '#059669'
                      : item.action === 'checked_out'
                      ? '#2563eb'
                      : '#dc2626',
                }}
              >
                {item.actionLabel.toUpperCase()}
              </span>
            </div>

            <p className="activity-subtext">
              Resident: <strong>{item.residentName}</strong> ({item.flatCode})
              {item.rejectionReason ? ` • Rejection Reason: ${item.rejectionReason}` : ''}
            </p>

            <div className="activity-meta">
              {item.gateName} • {item.timestamp} • {item.gateOfficer}
            </div>
          </div>
        </div>
      ))}
    </div>
  );
};
