import React, { useState } from 'react';
import { UserCheck, Clock, CheckCircle2, Calendar } from 'lucide-react';
import { QRCodeSVG } from 'qrcode.react';
import { StatusBadge } from '../../components/ui/StatusBadge';
import { realtimeService } from '../../services/realtimeService';

export const ServiceProviderDashboard: React.FC = () => {
  const [isCheckedIn, setIsCheckedIn] = useState(true);

  const assignments = [
    { id: 'sp-1', resident: 'Mayuri Udar', flat: 'Tower C · 301', role: 'Housekeeping / Maid', time: '08:00 AM - 11:00 AM', status: 'PRESENT' },
    { id: 'sp-2', resident: 'Vikram Joshi', flat: 'Tower A · 704', role: 'Cook / Chef', time: '12:30 PM - 02:30 PM', status: 'SCHEDULED' },
  ];

  const handleToggleCheckIn = () => {
    const nextState = !isCheckedIn;
    setIsCheckedIn(nextState);
    realtimeService.publish(
      'WORKER_ENTRY_EXIT',
      {
        workerId: 'dw-102',
        workerName: 'Rajesh Carpenter',
        workerType: 'TECHNICIAN',
        action: nextState ? 'IN' : 'OUT',
        timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
      },
      'soc-gvs',
      'STAFF',
      'Rajesh Carpenter'
    );
  };

  return (
    <div style={{ minHeight: '100%', background: 'var(--aarizo-page, #F7FBFE)', maxWidth: '1280px', margin: '0 auto', paddingBottom: '6rem' }}>
      {/* ── Aarizo Header ── */}
      <div
        className="m-3 md:m-4 rounded-2xl"
        style={{
          background: 'linear-gradient(135deg, #083B56 0%, #0D4767 100%)',
          padding: '1.25rem 1.25rem 1.5rem',
          display: 'flex',
          alignItems: 'flex-start',
          justifyContent: 'space-between',
          boxShadow: '0 4px 16px rgba(8, 59, 86, 0.08)',
        }}
      >
        <div>
          <p style={{ color: '#83CBEA', fontSize: '0.75rem', fontWeight: 600, textTransform: 'uppercase', letterSpacing: '0.05em', margin: '0 0 0.25rem' }}>
            Staff Portal
          </p>
          <h1 style={{ color: '#FFFFFF', fontWeight: 800, fontSize: '1.25rem', margin: 0 }}>
            Service Provider Dashboard
          </h1>
          <p style={{ color: 'rgba(255,255,255,0.75)', fontSize: '0.8125rem', marginTop: '0.25rem' }}>
            Daily gate pass, roster &amp; attendance management
          </p>
        </div>
        <button
          onClick={handleToggleCheckIn}
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
          {isCheckedIn ? 'Check Out' : 'Check In'}
        </button>
      </div>

      <div className="p-3 md:p-4 flex flex-col gap-4">
        {/* ── Status Badge ── */}
        <div style={{
          background: isCheckedIn ? '#ECFDF5' : '#FEF2F2',
          borderRadius: '12px', border: `1px solid ${isCheckedIn ? '#6EE7B7' : '#FECACA'}`,
          padding: '0.75rem 1rem',
          display: 'flex', alignItems: 'center', gap: '0.75rem',
        }}>
          <div style={{ width: 10, height: 10, borderRadius: '50%', background: isCheckedIn ? '#059669' : '#DC2626', boxShadow: `0 0 0 3px ${isCheckedIn ? '#A7F3D0' : '#FCA5A5'}` }} />
          <span style={{ fontWeight: 700, color: isCheckedIn ? '#065F46' : '#991B1B', fontSize: '0.875rem' }}>
            Gate Status: {isCheckedIn ? 'INSIDE SOCIETY' : 'OUTSIDE SOCIETY'}
          </span>
        </div>

        {/* ── Stats Row ── */}
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(160px, 1fr))', gap: '0.75rem' }}>
          <div style={{ background: '#ffffff', borderRadius: '14px', border: '1px solid #DCE8EF', padding: '1rem', display: 'flex', alignItems: 'center', gap: '0.75rem', boxShadow: '0 2px 8px rgba(8,59,86,0.04)' }}>
            <div style={{ width: 38, height: 38, borderRadius: '10px', background: '#EBF5FA', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
              <Calendar size={18} color="#176B91" />
            </div>
            <div>
              <div style={{ fontSize: '1.25rem', fontWeight: 800, color: '#083B56' }}>2</div>
              <div style={{ fontSize: '0.7rem', color: '#657785' }}>Today's Assignments</div>
            </div>
          </div>
          <div style={{ background: '#ffffff', borderRadius: '14px', border: '1px solid #DCE8EF', padding: '1rem', display: 'flex', alignItems: 'center', gap: '0.75rem', boxShadow: '0 2px 8px rgba(8,59,86,0.04)' }}>
            <div style={{ width: 38, height: 38, borderRadius: '10px', background: '#ECFDF5', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
              <CheckCircle2 size={18} color="#059669" />
            </div>
            <div>
              <div style={{ fontSize: '1.25rem', fontWeight: 800, color: '#083B56' }}>24</div>
              <div style={{ fontSize: '0.7rem', color: '#657785' }}>Completed This Week</div>
            </div>
          </div>
        </div>

        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(320px, 1fr))', gap: '1rem' }}>
          {/* ── QR Gate Pass ── */}
          <div style={{
            background: '#ffffff', borderRadius: '14px', border: '1px solid #DCE8EF',
            padding: '1.25rem',
            display: 'flex', flexDirection: 'column', alignItems: 'center', textAlign: 'center',
            boxShadow: '0 2px 8px rgba(8,59,86,0.04)',
          }}>
            <p style={{ fontWeight: 700, color: '#083B56', margin: '0 0 0.75rem', fontSize: '0.9rem' }}>Daily Gate Entry QR Pass</p>
            <div style={{ background: '#EBF5FA', borderRadius: '14px', padding: '1rem', marginBottom: '0.75rem', display: 'flex', justifyContent: 'center' }}>
              <QRCodeSVG value="COMMUNITYOS:STAFF:PASS-8812:RAJESH_CARPENTER" size={110} level="M" />
            </div>
            <p style={{ color: '#657785', fontSize: '0.75rem', margin: 0, maxWidth: 220 }}>
              Show this QR at Security Gate for instant touchless verification
            </p>
          </div>

          {/* ── Household Roster ── */}
          <div style={{ background: '#ffffff', borderRadius: '14px', border: '1px solid #DCE8EF', overflow: 'hidden', boxShadow: '0 2px 8px rgba(8,59,86,0.04)' }}>
            <div style={{ padding: '0.875rem 1rem', borderBottom: '1px solid #EBF5FA' }}>
              <h3 style={{ fontWeight: 800, color: '#083B56', margin: 0, fontSize: '0.9375rem' }}>Today's Household Roster</h3>
            </div>
            <div style={{ padding: '0.75rem', display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
              {assignments.map((a) => (
                <div key={a.id} style={{
                  background: '#F7FBFE', borderRadius: '10px', border: '1px solid #DCE8EF',
                  padding: '0.875rem', display: 'flex', justifyContent: 'space-between', alignItems: 'center',
                }}>
                  <div>
                    <div style={{ fontWeight: 700, color: '#083B56', fontSize: '0.875rem' }}>{a.resident}</div>
                    <div style={{ fontSize: '0.75rem', color: '#657785' }}>{a.flat} · {a.role}</div>
                    <div style={{ fontSize: '0.7rem', color: '#8B9AA5', marginTop: '0.2rem', display: 'flex', alignItems: 'center', gap: '0.25rem' }}>
                      <Clock size={11} /> {a.time}
                    </div>
                  </div>
                  <StatusBadge label={a.status} variant={a.status === 'PRESENT' ? 'success' : 'neutral'} />
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ServiceProviderDashboard;
