import React from 'react';
import { Activity } from 'lucide-react';

export interface LogEntry {
  id: string;
  user: string;
  action: string;
  timestamp: string;
  details?: string;
}

interface ActivityLogProps {
  logs: LogEntry[];
}

export const ActivityLog: React.FC<ActivityLogProps> = ({ logs }) => {
  return (
    <div style={{ background: '#ffffff', borderRadius: '12px', border: '1px solid #e2e8f0', padding: '1rem' }}>
      <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '1rem' }}>
        <Activity size={18} color="#2563eb" />
        <h4 style={{ margin: 0, fontSize: '0.95rem', fontWeight: 600, color: '#0f172a' }}>
          Activity Audit Log
        </h4>
      </div>
      <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
        {logs.map((log) => (
          <div
            key={log.id}
            style={{
              padding: '0.65rem',
              borderRadius: '8px',
              background: '#f8fafc',
              display: 'flex',
              justifyContent: 'space-between',
              alignItems: 'flex-start',
              fontSize: '0.85rem',
            }}
          >
            <div>
              <span style={{ fontWeight: 600, color: '#1e293b' }}>{log.user}</span>{' '}
              <span style={{ color: '#475569' }}>{log.action}</span>
              {log.details && (
                <div style={{ fontSize: '0.75rem', color: '#64748b', marginTop: '0.2rem' }}>
                  {log.details}
                </div>
              )}
            </div>
            <span style={{ fontSize: '0.75rem', color: '#94a3b8', whiteSpace: 'nowrap' }}>
              {log.timestamp}
            </span>
          </div>
        ))}
      </div>
    </div>
  );
};
