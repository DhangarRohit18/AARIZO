import React, { useState } from 'react';
import type { GuardVisitor } from '../../../domains/guard/types';
import { getEntryStatusLabel } from '../../../domains/guard/states';
import { Search, ChevronRight } from 'lucide-react';
import '../guard.css';

interface GuardVisitorsProps {
  visitors: GuardVisitor[];
  onSelectVisitor: (visitor: GuardVisitor) => void;
}

export const GuardVisitors: React.FC<GuardVisitorsProps> = ({ visitors, onSelectVisitor }) => {
  const [searchTerm, setSearchTerm] = useState<string>('');
  const [activeTab, setActiveTab] = useState<'expected' | 'at_gate' | 'inside' | 'all'>('all');

  const filteredVisitors = visitors.filter((item) => {
    const matchesSearch =
      item.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      item.passcode.includes(searchTerm) ||
      item.flatCode.toLowerCase().includes(searchTerm.toLowerCase()) ||
      item.residentName.toLowerCase().includes(searchTerm.toLowerCase());

    if (!matchesSearch) return false;

    if (activeTab === 'expected') return item.status === 'expected';
    if (activeTab === 'at_gate') return item.status === 'at_gate' || item.status === 'approval_required';
    if (activeTab === 'inside') return item.status === 'checked_in';
    return true;
  });

  return (
    <div>
      <div className="section-heading-row">
        <h3 className="section-title">Gate Visitor Registry</h3>
        <span style={{ fontSize: '0.75rem', color: '#64748b', fontWeight: 600 }}>
          {filteredVisitors.length} Visitors
        </span>
      </div>

      {/* Filter Tabs */}
      <div className="resident-search-bar" style={{ marginBottom: '0.75rem' }}>
        <div className="search-input-wrapper">
          <Search size={18} style={{ color: '#94a3b8' }} />
          <input
            type="text"
            className="search-input-field"
            placeholder="Search by visitor name, passcode (8492), or flat..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
        </div>
      </div>

      <div className="control-pill-toggle" style={{ marginBottom: '1.25rem', background: '#e2e8f0' }}>
        <button
          className={`pill-btn ${activeTab === 'all' ? 'pill-active' : ''}`}
          onClick={() => setActiveTab('all')}
        >
          <span>All ({visitors.length})</span>
        </button>
        <button
          className={`pill-btn ${activeTab === 'expected' ? 'pill-active' : ''}`}
          onClick={() => setActiveTab('expected')}
        >
          <span>Expected ({visitors.filter((v) => v.status === 'expected').length})</span>
        </button>
        <button
          className={`pill-btn ${activeTab === 'at_gate' ? 'pill-active' : ''}`}
          onClick={() => setActiveTab('at_gate')}
        >
          <span>At Gate ({visitors.filter((v) => v.status === 'approval_required' || v.status === 'at_gate').length})</span>
        </button>
        <button
          className={`pill-btn ${activeTab === 'inside' ? 'pill-active' : ''}`}
          onClick={() => setActiveTab('inside')}
        >
          <span>Inside ({visitors.filter((v) => v.status === 'checked_in').length})</span>
        </button>
      </div>

      {/* Visitor Cards List */}
      {filteredVisitors.map((item) => (
        <div key={item.id} className="guard-visitor-card" onClick={() => onSelectVisitor(item)} style={{ cursor: 'pointer' }}>
          <div className="guard-visitor-header">
            <h4 className="guard-visitor-title">{item.name}</h4>
            <span
              className="banner-role-tag"
              style={{
                background: item.status === 'checked_in' ? '#ecfdf5' : item.status === 'approval_required' ? '#fffbe6' : '#eff6ff',
                color: item.status === 'checked_in' ? '#059669' : item.status === 'approval_required' ? '#d97706' : '#2563eb',
              }}
            >
              {getEntryStatusLabel(item.status)}
            </span>
          </div>

          <p className="guard-visitor-resident">
            {item.visitorTypeLabel} • Visiting <strong>{item.residentName}</strong> ({item.tower} • {item.flatCode})
          </p>

          <div className="guard-visitor-meta-row">
            <span>Passcode: <strong>{item.passcode}</strong></span>
            <span>Time: {item.expectedTimeSlot}</span>
            {item.vehicleNumber && <span>{item.vehicleNumber}</span>}
          </div>

          <button
            className="btn-guard-action-primary"
            style={{ width: '100%', background: '#2563eb' }}
            onClick={(e) => {
              e.stopPropagation();
              onSelectVisitor(item);
            }}
          >
            <span>View & Verify Pass</span>
            <ChevronRight size={16} />
          </button>
        </div>
      ))}
    </div>
  );
};
