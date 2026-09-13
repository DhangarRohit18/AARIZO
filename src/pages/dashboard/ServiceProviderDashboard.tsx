import React from 'react';
import { UserCheck, QrCode, Clock } from 'lucide-react';
import { StatusBadge } from '../../components/ui/StatusBadge';

export const ServiceProviderDashboard: React.FC = () => {
  const assignments = [
    { id: 'sp-1', resident: 'Mayuri Udar (Tower C · 301)', role: 'Housekeeping / Maid', time: '08:00 AM - 11:00 AM', status: 'PRESENT' },
    { id: 'sp-2', resident: 'Vikram Joshi (Tower A · 704)', role: 'Cook / Chef', time: '12:30 PM - 02:30 PM', status: 'SCHEDULED' },
  ];

  return (
    <div style={{ padding: '1.5rem', maxWidth: '1000px', margin: '0 auto', fontFamily: 'sans-serif' }}>
      <header style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', marginBottom: '1.5rem' }}>
        <UserCheck size={28} color="#2563eb" />
        <div>
          <h1 style={{ margin: 0, fontSize: '1.4rem', color: '#0f172a' }}>Service Provider & Staff Portal</h1>
          <p style={{ margin: 0, color: '#64748b', fontSize: '0.85rem' }}>
            Daily Gate Passes, Work Roster & Attendance
          </p>
        </div>
      </header>

      <div style={{ background: '#eff6ff', borderRadius: '12px', padding: '1.25rem', border: '1px solid #bfdbfe', marginBottom: '1.5rem', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
        <div>
          <h4 style={{ margin: '0 0 0.25rem 0', color: '#1e40af' }}>Daily Gate Pass QR Active</h4>
          <p style={{ margin: 0, fontSize: '0.85rem', color: '#3b82f6' }}>Present this QR code to security at Gate 1 for instant entry</p>
        </div>
        <div style={{ background: '#ffffff', padding: '0.5rem', borderRadius: '8px' }}>
          <QrCode size={44} color="#1d4ed8" />
        </div>
      </div>

      <div style={{ background: '#fff', borderRadius: '12px', border: '1px solid #e2e8f0', padding: '1.25rem' }}>
        <h3 style={{ margin: '0 0 1rem 0', color: '#0f172a' }}>Today's Household Roster</h3>
        <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
          {assignments.map((a) => (
            <div key={a.id} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '0.85rem', background: '#f8fafc', borderRadius: '8px' }}>
              <div>
                <div style={{ fontWeight: 600, color: '#0f172a' }}>{a.resident}</div>
                <div style={{ fontSize: '0.8rem', color: '#64748b' }}>{a.role}</div>
              </div>
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
                <span style={{ fontSize: '0.75rem', color: '#94a3b8', display: 'flex', alignItems: 'center', gap: '0.25rem' }}>
                  <Clock size={12} /> {a.time}
                </span>
                <StatusBadge label={a.status} variant={a.status === 'PRESENT' ? 'success' : 'neutral'} />
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};
