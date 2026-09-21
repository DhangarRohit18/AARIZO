import React from 'react';
import { ShoppingBag, Truck, CheckCircle2, Clock } from 'lucide-react';
import { StatusBadge } from '../../components/ui/StatusBadge';

export const VendorDashboard: React.FC = () => {
  const deliveries = [
    { id: 'del-1', recipient: 'Rahul Sharma (Tower A · 402)', type: 'Water Cans (20L)', status: 'DELIVERED', time: '10:30 AM' },
    { id: 'del-2', recipient: 'Priya Mehta (Tower B · 1204)', type: 'Grocery Package', status: 'IN_TRANSIT', time: '11:45 AM' },
  ];

  return (
    <div style={{ padding: '1.5rem', maxWidth: '1000px', margin: '0 auto', fontFamily: 'sans-serif' }}>
      <header style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', marginBottom: '1.5rem' }}>
        <ShoppingBag size={28} color="#2563eb" />
        <div>
          <h1 style={{ margin: 0, fontSize: '1.4rem', color: '#0f172a' }}>Vendor Portal</h1>
          <p style={{ margin: 0, color: '#64748b', fontSize: '0.85rem' }}>
            Deliveries & Society Supplies Dispatch
          </p>
        </div>
      </header>

      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem', marginBottom: '1.5rem' }}>
        <div style={{ padding: '1rem', background: '#fff', borderRadius: '12px', border: '1px solid #e2e8f0', display: 'flex', alignItems: 'center', gap: '1rem' }}>
          <Truck size={24} color="#2563eb" />
          <div>
            <div style={{ fontSize: '1.25rem', fontWeight: 700 }}>5 Active</div>
            <div style={{ fontSize: '0.8rem', color: '#64748b' }}>Dispatches Today</div>
          </div>
        </div>
        <div style={{ padding: '1rem', background: '#fff', borderRadius: '12px', border: '1px solid #e2e8f0', display: 'flex', alignItems: 'center', gap: '1rem' }}>
          <CheckCircle2 size={24} color="#10b981" />
          <div>
            <div style={{ fontSize: '1.25rem', fontWeight: 700 }}>18 Completed</div>
            <div style={{ fontSize: '0.8rem', color: '#64748b' }}>This Week</div>
          </div>
        </div>
      </div>

      <div style={{ background: '#fff', borderRadius: '12px', border: '1px solid #e2e8f0', padding: '1.25rem' }}>
        <h3 style={{ margin: '0 0 1rem 0', color: '#0f172a' }}>Scheduled Gate Deliveries</h3>
        <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
          {deliveries.map((d) => (
            <div key={d.id} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '0.85rem', background: '#f8fafc', borderRadius: '8px' }}>
              <div>
                <div style={{ fontWeight: 600, color: '#0f172a' }}>{d.recipient}</div>
                <div style={{ fontSize: '0.8rem', color: '#64748b' }}>{d.type}</div>
              </div>
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
                <span style={{ fontSize: '0.75rem', color: '#94a3b8', display: 'flex', alignItems: 'center', gap: '0.25rem' }}>
                  <Clock size={12} /> {d.time}
                </span>
                <StatusBadge label={d.status} variant={d.status === 'DELIVERED' ? 'success' : 'warning'} />
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

