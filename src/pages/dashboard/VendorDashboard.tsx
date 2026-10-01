import React, { useState } from 'react';
import { ShoppingBag, Truck, CheckCircle2, Clock, ArrowRight, History } from 'lucide-react';
import { QRCodeSVG } from 'qrcode.react';
import { StatusBadge } from '../../components/ui/StatusBadge';

export const VendorDashboard: React.FC = () => {
  const [activeTab, setActiveTab] = useState<'deliveries' | 'history'>('deliveries');

  const deliveries = [
    { id: 'del-1', recipient: 'Rahul Sharma', flat: 'Tower A · 402', type: 'Water Cans (20L)', status: 'DELIVERED', time: '10:30 AM' },
    { id: 'del-2', recipient: 'Priya Mehta', flat: 'Tower B · 1204', type: 'Grocery Package', status: 'IN_TRANSIT', time: '11:45 AM' },
    { id: 'del-3', recipient: 'Amit Gupta', flat: 'Tower C · 308', type: 'Dairy Products', status: 'PENDING', time: '01:00 PM' },
  ];

  const tabs = [
    { key: 'deliveries', label: 'Active Dispatches', icon: Truck },
    { key: 'history', label: 'Delivery History', icon: History },
  ] as const;

  return (
    <div style={{ minHeight: '100%', background: 'var(--aarizo-page, #F7FBFE)', padding: '0.5rem 0 3rem' }}>
      {/* ── Compact Aarizo Header ── */}
      <div style={{
        background: 'linear-gradient(135deg, #083B56 0%, #0D4767 100%)',
        padding: '1.25rem 1.5rem',
        borderRadius: '16px',
        marginBottom: '1rem',
        boxShadow: '0 4px 16px rgba(8,59,86,0.08)',
      }}>
        <p style={{ color: '#83CBEA', fontSize: '0.72rem', fontWeight: 600, textTransform: 'uppercase', letterSpacing: '0.04em', margin: '0 0 0.2rem' }}>
          Vendor Portal
        </p>
        <h1 style={{ color: '#FFFFFF', fontWeight: 800, fontSize: '1.25rem', margin: 0, letterSpacing: '-0.01em' }}>
          Delivery &amp; Supply Dispatch
        </h1>
        <p style={{ color: 'rgba(255,255,255,0.8)', fontSize: '0.78125rem', margin: '0.2rem 0 0' }}>
          Manage society deliveries, order status &amp; gate dispatch
        </p>
      </div>

      <div className="max-w-7xl mx-auto">
        {/* ── Top Row: QR Gate Pass + Stat Cards Side-by-Side on Desktop ── */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
          {/* QR Gate Pass Banner */}
          <div
            style={{
              background: 'linear-gradient(135deg, #176B91, #083B56)',
              borderRadius: '16px',
              padding: '1.25rem',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'space-between',
              boxShadow: '0 4px 12px rgba(23,107,145,0.2)',
            }}
          >
            <div>
              <p style={{ color: '#83CBEA', fontSize: '0.7rem', fontWeight: 700, margin: '0 0 0.25rem', textTransform: 'uppercase' }}>Gate Access</p>
              <h4 style={{ color: '#fff', fontWeight: 700, margin: 0, fontSize: '0.95rem' }}>Vendor Gate Pass Active</h4>
              <p style={{ color: 'rgba(255,255,255,0.75)', fontSize: '0.75rem', margin: '0.2rem 0 0' }}>Show to security for instant gate entry</p>
            </div>
            <div style={{ background: '#fff', borderRadius: '12px', padding: '0.5rem', display: 'flex', alignItems: 'center', justifyContent: 'center', boxShadow: '0 2px 8px rgba(0,0,0,0.1)' }}>
              <QRCodeSVG value="COMMUNITYOS:VENDOR:DEL-4412" size={48} level="M" />
            </div>
          </div>

          {/* Stat Cards (Responsive) */}
          <div className="grid grid-cols-2 gap-3">
            <div style={{ background: '#ffffff', borderRadius: '16px', border: '1px solid #DCE8EF', padding: '1rem', display: 'flex', alignItems: 'center', gap: '0.75rem', boxShadow: '0 2px 6px rgba(8,59,86,0.03)' }}>
              <div style={{ width: 42, height: 42, borderRadius: '12px', background: '#EBF5FA', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
                <Truck size={20} color="#176B91" />
              </div>
              <div style={{ minWidth: 0, flex: 1 }}>
                <div style={{ fontSize: '1.4rem', fontWeight: 800, color: '#083B56', lineHeight: 1.1 }}>5</div>
                <div style={{ fontSize: '0.75rem', color: '#657785', fontWeight: 600, marginTop: '0.15rem' }}>Active Today</div>
              </div>
            </div>
            <div style={{ background: '#ffffff', borderRadius: '16px', border: '1px solid #DCE8EF', padding: '1rem', display: 'flex', alignItems: 'center', gap: '0.75rem', boxShadow: '0 2px 6px rgba(8,59,86,0.03)' }}>
              <div style={{ width: 42, height: 42, borderRadius: '12px', background: '#ECFDF5', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
                <CheckCircle2 size={20} color="#059669" />
              </div>
              <div style={{ minWidth: 0, flex: 1 }}>
                <div style={{ fontSize: '1.4rem', fontWeight: 800, color: '#083B56', lineHeight: 1.1 }}>18</div>
                <div style={{ fontSize: '0.75rem', color: '#657785', fontWeight: 600, marginTop: '0.15rem' }}>Completed Week</div>
              </div>
            </div>
          </div>
        </div>

        {/* ── Tabs ── */}
        <div style={{ display: 'flex', gap: '0.5rem', overflowX: 'auto', paddingBottom: '0.5rem', marginBottom: '1rem' }}>
          {tabs.map((t) => {
            const Icon = t.icon;
            const active = activeTab === t.key;
            return (
              <button
                key={t.key}
                onClick={() => setActiveTab(t.key)}
                style={{
                  display: 'flex', alignItems: 'center', gap: '0.35rem',
                  padding: '0.55rem 1rem',
                  borderRadius: '10px', border: active ? 'none' : '1px solid #DCE8EF',
                  background: active ? '#083B56' : '#ffffff',
                  color: active ? '#ffffff' : '#657785',
                  fontWeight: 700, fontSize: '0.8125rem',
                  cursor: 'pointer', transition: 'all 0.2s',
                  whiteSpace: 'nowrap',
                  boxShadow: active ? '0 2px 8px rgba(8,59,86,0.25)' : '0 1px 3px rgba(8,59,86,0.08)',
                }}
              >
                <Icon size={14} /> {t.label}
              </button>
            );
          })}
        </div>

        {/* ── Delivery List (Responsive Grid) ── */}
        {activeTab === 'deliveries' && (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3.5">
            {deliveries.map((d) => (
              <div key={d.id} style={{
                background: '#ffffff', borderRadius: '16px', border: '1px solid #DCE8EF',
                padding: '1.1rem', display: 'flex', justifyContent: 'space-between', alignItems: 'center',
                boxShadow: '0 2px 8px rgba(8,59,86,0.06)',
              }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
                  <div style={{ width: 42, height: 42, borderRadius: '12px', background: '#EBF5FA', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
                    <ShoppingBag size={20} color="#176B91" />
                  </div>
                  <div>
                    <div style={{ fontWeight: 700, color: '#083B56', fontSize: '0.9rem' }}>{d.recipient}</div>
                    <div style={{ fontSize: '0.75rem', color: '#657785', marginTop: '0.15rem' }}>{d.flat} · {d.type}</div>
                  </div>
                </div>
                <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'flex-end', gap: '0.35rem' }}>
                  <StatusBadge label={d.status} variant={d.status === 'DELIVERED' ? 'success' : d.status === 'IN_TRANSIT' ? 'warning' : 'neutral'} />
                  <span style={{ fontSize: '0.7rem', color: '#8B9AA5', display: 'flex', alignItems: 'center', gap: '0.25rem' }}>
                    <Clock size={11} /> {d.time}
                  </span>
                </div>
              </div>
            ))}
          </div>
        )}

        {activeTab === 'history' && (
          <div style={{ background: '#ffffff', borderRadius: '14px', border: '1px solid #DCE8EF', padding: '1.5rem', textAlign: 'center', boxShadow: '0 2px 8px rgba(8,59,86,0.06)' }}>
            <CheckCircle2 size={40} color="#83CBEA" style={{ marginBottom: '0.75rem' }} />
            <h3 style={{ fontWeight: 700, color: '#083B56', margin: '0 0 0.5rem' }}>18 Deliveries Completed</h3>
            <p style={{ color: '#657785', fontSize: '0.85rem', margin: 0 }}>All deliveries this week were completed on time.</p>
            <button style={{
              marginTop: '1rem', display: 'inline-flex', alignItems: 'center', gap: '0.4rem',
              padding: '0.6rem 1.25rem', borderRadius: '10px', border: 'none',
              background: '#EBF5FA', color: '#176B91', fontWeight: 700, fontSize: '0.8rem', cursor: 'pointer',
            }}>
              View Full Report <ArrowRight size={14} />
            </button>
          </div>
        )}
      </div>
    </div>
  );
};

export default VendorDashboard;
