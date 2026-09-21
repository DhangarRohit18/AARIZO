import React, { useState } from 'react';
import { ShoppingBag, Truck, CheckCircle2, Clock, Package, ArrowRight } from 'lucide-react';
import { StatusBadge } from '../../components/ui/StatusBadge';

export const VendorDashboard: React.FC = () => {
  const [activeTab, setActiveTab] = useState<'deliveries' | 'history'>('deliveries');

  const deliveries = [
    { id: 'del-1', recipient: 'Rahul Sharma', flat: 'Tower A · 402', type: 'Water Cans (20L)', status: 'DELIVERED', time: '10:30 AM' },
    { id: 'del-2', recipient: 'Priya Mehta', flat: 'Tower B · 1204', type: 'Grocery Package', status: 'IN_TRANSIT', time: '11:45 AM' },
    { id: 'del-3', recipient: 'Amit Gupta', flat: 'Tower C · 308', type: 'Dairy Products', status: 'PENDING', time: '01:00 PM' },
  ];

  const tabs = [
    { key: 'deliveries', label: 'Active Dispatches' },
    { key: 'history', label: 'Delivery History' },
  ] as const;

  return (
    <div style={{ minHeight: '100%', background: 'var(--aarizo-page, #F7FBFE)' }}>
      {/* ── Aarizo Header ── */}
      <div style={{
        background: 'linear-gradient(135deg, #083B56 0%, #0D4767 100%)',
        padding: '1.25rem 1rem 1.5rem',
      }}>
        <p style={{ color: '#83CBEA', fontSize: '0.75rem', fontWeight: 600, textTransform: 'uppercase', letterSpacing: '0.05em', margin: '0 0 0.25rem' }}>
          Vendor Portal
        </p>
        <h1 style={{ color: '#FFFFFF', fontWeight: 800, fontSize: '1.25rem', margin: 0 }}>
          Delivery &amp; Supply Dispatch
        </h1>
        <p style={{ color: 'rgba(255,255,255,0.75)', fontSize: '0.8125rem', marginTop: '0.25rem' }}>
          Manage society deliveries and gate dispatch
        </p>
      </div>

      <div style={{ padding: '1rem' }}>
        {/* ── Stat Cards ── */}
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '0.75rem', marginBottom: '1rem' }}>
          <div style={{ background: '#ffffff', borderRadius: '14px', border: '1px solid #DCE8EF', padding: '1rem', display: 'flex', alignItems: 'center', gap: '0.75rem', boxShadow: '0 2px 8px rgba(8,59,86,0.06)' }}>
            <div style={{ width: 40, height: 40, borderRadius: '12px', background: '#EBF5FA', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
              <Truck size={20} color="#176B91" />
            </div>
            <div>
              <div style={{ fontSize: '1.375rem', fontWeight: 800, color: '#083B56' }}>5</div>
              <div style={{ fontSize: '0.75rem', color: '#657785' }}>Active Today</div>
            </div>
          </div>
          <div style={{ background: '#ffffff', borderRadius: '14px', border: '1px solid #DCE8EF', padding: '1rem', display: 'flex', alignItems: 'center', gap: '0.75rem', boxShadow: '0 2px 8px rgba(8,59,86,0.06)' }}>
            <div style={{ width: 40, height: 40, borderRadius: '12px', background: '#ECFDF5', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
              <CheckCircle2 size={20} color="#059669" />
            </div>
            <div>
              <div style={{ fontSize: '1.375rem', fontWeight: 800, color: '#083B56' }}>18</div>
              <div style={{ fontSize: '0.75rem', color: '#657785' }}>Completed Week</div>
            </div>
          </div>
        </div>

        {/* ── QR Gate Pass Banner ── */}
        <div style={{
          background: 'linear-gradient(135deg, #176B91, #083B56)',
          borderRadius: '14px', padding: '1rem',
          display: 'flex', alignItems: 'center', justifyContent: 'space-between',
          marginBottom: '1rem',
          boxShadow: '0 4px 12px rgba(23,107,145,0.2)',
        }}>
          <div>
            <p style={{ color: '#83CBEA', fontSize: '0.7rem', fontWeight: 700, margin: '0 0 0.25rem', textTransform: 'uppercase' }}>Gate Access</p>
            <h4 style={{ color: '#fff', fontWeight: 700, margin: 0, fontSize: '0.9rem' }}>Vendor Gate Pass Active</h4>
            <p style={{ color: 'rgba(255,255,255,0.7)', fontSize: '0.75rem', margin: '0.2rem 0 0' }}>Show to security for instant entry</p>
          </div>
          <div style={{ background: '#fff', borderRadius: '10px', padding: '0.5rem', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
            <Package size={36} color="#083B56" />
          </div>
        </div>

        {/* ── Tabs ── */}
        <div style={{ display: 'flex', background: '#ffffff', borderRadius: '12px', border: '1px solid #DCE8EF', padding: '4px', gap: '4px', marginBottom: '1rem' }}>
          {tabs.map((t) => (
            <button
              key={t.key}
              onClick={() => setActiveTab(t.key)}
              style={{
                flex: 1, padding: '0.55rem 0.75rem',
                borderRadius: '9px', border: 'none',
                background: activeTab === t.key ? '#083B56' : 'transparent',
                color: activeTab === t.key ? '#fff' : '#657785',
                fontWeight: 700, fontSize: '0.8125rem',
                cursor: 'pointer', transition: 'all 0.2s',
              }}
            >
              {t.label}
            </button>
          ))}
        </div>

        {/* ── Delivery List ── */}
        {activeTab === 'deliveries' && (
          <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
            {deliveries.map((d) => (
              <div key={d.id} style={{
                background: '#ffffff', borderRadius: '14px', border: '1px solid #DCE8EF',
                padding: '1rem', display: 'flex', justifyContent: 'space-between', alignItems: 'center',
                boxShadow: '0 2px 8px rgba(8,59,86,0.06)',
              }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
                  <div style={{ width: 40, height: 40, borderRadius: '12px', background: '#EBF5FA', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                    <ShoppingBag size={18} color="#176B91" />
                  </div>
                  <div>
                    <div style={{ fontWeight: 700, color: '#083B56', fontSize: '0.875rem' }}>{d.recipient}</div>
                    <div style={{ fontSize: '0.75rem', color: '#657785' }}>{d.flat} · {d.type}</div>
                  </div>
                </div>
                <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'flex-end', gap: '0.3rem' }}>
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
