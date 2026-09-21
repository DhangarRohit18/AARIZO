import React, { useState } from 'react';
import { UserCheck, Home, QrCode, CheckCircle2, Clock } from 'lucide-react';

export const DomesticWorkerDashboard: React.FC = () => {
  const [isCheckedIn, setIsCheckedIn] = useState(true);

  const assignments = [
    { flat: 'Flat B-1204', owner: 'Vikram Joshi', time: '08:00 AM - 10:00 AM', status: 'COMPLETED', statusColor: '#059669', statusBg: '#ECFDF5' },
    { flat: 'Flat A-402', owner: 'Ananya Roy', time: '10:30 AM - 12:00 PM', status: 'IN_PROGRESS', statusColor: '#D97706', statusBg: '#FFFBEB' },
    { flat: 'Flat C-301', owner: 'Mayuri Udar', time: '04:00 PM - 05:30 PM', status: 'SCHEDULED', statusColor: '#657785', statusBg: '#F1F5F9' },
  ];

  return (
    <div style={{ minHeight: '100%', background: 'var(--aarizo-page, #F7FBFE)' }}>
      {/* ── Aarizo Header ── */}
      <div style={{
        background: 'linear-gradient(135deg, #083B56 0%, #0D4767 100%)',
        padding: '1.25rem 1rem 1.5rem',
        display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between',
      }}>
        <div>
          <p style={{ color: '#83CBEA', fontSize: '0.75rem', fontWeight: 600, textTransform: 'uppercase', letterSpacing: '0.05em', margin: '0 0 0.25rem' }}>
            Domestic Staff Pass
          </p>
          <h1 style={{ color: '#FFFFFF', fontWeight: 800, fontSize: '1.25rem', margin: 0 }}>
            Sunita Devi
          </h1>
          <p style={{ color: 'rgba(255,255,255,0.75)', fontSize: '0.8125rem', marginTop: '0.25rem' }}>
            ID: DW-9042 · Green Valley Society
          </p>
        </div>
        <button
          onClick={() => setIsCheckedIn(!isCheckedIn)}
          style={{
            padding: '0.55rem 1rem',
            background: isCheckedIn ? '#DC2626' : '#059669',
            color: '#fff', borderRadius: '10px', border: 'none',
            fontWeight: 700, fontSize: '0.8rem', cursor: 'pointer',
            display: 'flex', alignItems: 'center', gap: '0.4rem',
            whiteSpace: 'nowrap', flexShrink: 0,
          }}
        >
          <UserCheck size={14} />
          {isCheckedIn ? 'Check Out' : 'Gate Check-In'}
        </button>
      </div>

      <div style={{ padding: '1rem' }}>
        {/* ── Gate Status ── */}
        <div style={{
          background: isCheckedIn ? '#ECFDF5' : '#FEF2F2',
          borderRadius: '12px', border: `1px solid ${isCheckedIn ? '#6EE7B7' : '#FECACA'}`,
          padding: '0.75rem 1rem', marginBottom: '1rem',
          display: 'flex', alignItems: 'center', gap: '0.75rem',
        }}>
          <div style={{ width: 10, height: 10, borderRadius: '50%', background: isCheckedIn ? '#059669' : '#DC2626', boxShadow: `0 0 0 3px ${isCheckedIn ? '#A7F3D0' : '#FCA5A5'}` }} />
          <span style={{ fontWeight: 700, color: isCheckedIn ? '#065F46' : '#991B1B', fontSize: '0.875rem' }}>
            Gate Status: {isCheckedIn ? 'INSIDE SOCIETY' : 'OUTSIDE'}
          </span>
        </div>

        {/* ── QR Pass ── */}
        <div style={{
          background: '#ffffff', borderRadius: '14px', border: '1px solid #DCE8EF',
          padding: '1.25rem', marginBottom: '1rem',
          display: 'flex', flexDirection: 'column', alignItems: 'center', textAlign: 'center',
          boxShadow: '0 2px 8px rgba(8,59,86,0.06)',
        }}>
          <p style={{ fontWeight: 800, color: '#083B56', margin: '0 0 0.75rem', fontSize: '0.9375rem' }}>Gate Entry QR Pass</p>
          <div style={{ background: '#EBF5FA', borderRadius: '14px', padding: '1rem', marginBottom: '0.75rem' }}>
            <QrCode size={110} color="#083B56" />
          </div>
          <p style={{ color: '#657785', fontSize: '0.75rem', margin: 0, maxWidth: 220, lineHeight: 1.5 }}>
            Show this QR at Security Gate for instant touchless verification
          </p>
        </div>

        {/* ── Today's Schedule ── */}
        <div style={{ background: '#ffffff', borderRadius: '14px', border: '1px solid #DCE8EF', overflow: 'hidden', boxShadow: '0 2px 8px rgba(8,59,86,0.06)' }}>
          <div style={{ padding: '0.875rem 1rem', borderBottom: '1px solid #EBF5FA', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
              <Home size={17} color="#176B91" />
              <h3 style={{ fontWeight: 800, color: '#083B56', margin: 0, fontSize: '0.9375rem' }}>Assigned Households (3)</h3>
            </div>
            <span style={{ fontSize: '0.75rem', color: '#8B9AA5', fontWeight: 600 }}>Today's Schedule</span>
          </div>
          <div style={{ padding: '0.75rem', display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
            {assignments.map((a, i) => (
              <div key={i} style={{
                background: '#F7FBFE', borderRadius: '10px', border: '1px solid #DCE8EF',
                padding: '0.875rem', display: 'flex', justifyContent: 'space-between', alignItems: 'center',
              }}>
                <div>
                  <h4 style={{ fontWeight: 700, color: '#083B56', margin: '0 0 0.2rem', fontSize: '0.875rem' }}>{a.flat}</h4>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '0.4rem', fontSize: '0.75rem', color: '#657785' }}>
                    <Clock size={11} />
                    {a.owner} · {a.time}
                  </div>
                </div>
                <span style={{ fontSize: '0.7rem', fontWeight: 700, color: a.statusColor, background: a.statusBg, padding: '0.25rem 0.6rem', borderRadius: '20px', whiteSpace: 'nowrap' }}>
                  {a.status}
                </span>
              </div>
            ))}
          </div>
          {/* Completion indicator */}
          <div style={{ padding: '0.75rem 1rem', borderTop: '1px solid #EBF5FA', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
            <CheckCircle2 size={15} color="#059669" />
            <span style={{ fontSize: '0.75rem', color: '#059669', fontWeight: 700 }}>1 of 3 tasks completed today</span>
          </div>
        </div>
      </div>
    </div>
  );
};

export default DomesticWorkerDashboard;
