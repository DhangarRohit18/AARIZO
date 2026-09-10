import React, { useState } from 'react';
import type { VisitLog } from '../../../domains/visitors';
import { History, ShieldCheck, ArrowLeft } from 'lucide-react';
import { StatusBadge, Tabs, EmptyState } from '../../common';
import '../resident.css';
import './visitor.css';

export interface VisitorHistoryProps {
  historyLogs: VisitLog[];
  onBack: () => void;
}

export const VisitorHistory: React.FC<VisitorHistoryProps> = ({ historyLogs, onBack }) => {
  const [filterTab, setFilterTab] = useState<'all' | 'checked_out' | 'cancelled'>('all');

  const filteredLogs = historyLogs.filter((log) => {
    if (filterTab === 'all') return true;
    return log.status === filterTab;
  });

  return (
    <div className="vis-history-container">
      <div className="vis-history-header">
        <button className="vis-back-icon-btn" onClick={onBack} aria-label="Back to Visitors">
          <ArrowLeft size={18} />
        </button>
        <div>
          <h2 className="vis-screen-title">Visitor History</h2>
          <p className="vis-screen-subtitle">Past gate entries and exit logs for Flat 1204</p>
        </div>
      </div>

      {/* Filter Tabs */}
      <Tabs
        tabs={[
          { id: 'all', label: 'All History', badge: historyLogs.length },
          { id: 'checked_out', label: 'Completed' },
          { id: 'cancelled', label: 'Cancelled' },
        ]}
        activeTab={filterTab}
        onChange={(id) => setFilterTab(id as any)}
      />

      {filteredLogs.length === 0 ? (
        <EmptyState
          title="No Visitor History Records"
          description="There are no past visitor logs matching the selected filter."
          icon={<History size={36} />}
        />
      ) : (
        <div className="vis-history-timeline">
          {filteredLogs.map((item) => (
            <div key={item.id} className="vis-history-card">
              <div className="vis-history-top">
                <div className="vis-history-main">
                  <ShieldCheck size={18} className="vis-history-ic" />
                  <div>
                    <h4 className="vis-history-name">{item.visitorName}</h4>
                    <span className="vis-history-type">{item.visitorType.toUpperCase()}</span>
                  </div>
                </div>
                <StatusBadge
                  status={item.status === 'checked_out' ? 'resolved' : 'offline'}
                  label={item.status === 'checked_out' ? 'Checked Out' : 'Cancelled'}
                />
              </div>

              <div className="vis-history-body">
                <div className="vis-history-row">
                  <span className="vis-hist-label">Date:</span>
                  <span className="vis-hist-val">{item.date}</span>
                </div>
                <div className="vis-history-row">
                  <span className="vis-hist-label">Duration:</span>
                  <span className="vis-hist-val">
                    {item.entryTime} {item.exitTime ? `→ ${item.exitTime}` : ''}
                  </span>
                </div>
                <div className="vis-history-row">
                  <span className="vis-hist-label">Gate Officer:</span>
                  <span className="vis-hist-val">{item.gateOfficer}</span>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};
