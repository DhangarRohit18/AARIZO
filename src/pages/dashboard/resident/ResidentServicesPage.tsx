import React from 'react';
import { useNavigate } from 'react-router-dom';
import {
  UserCheck, Car, Wrench, CreditCard, Store, Sparkles,
  ShieldCheck, ShieldAlert, Trash2, BedDouble, HardHat,
  Users, Building2, MessageSquare, ChevronRight,
} from 'lucide-react';

const SERVICES = [
  { label: 'Visitor Pass', icon: UserCheck, path: '/resident/visitors', color: '#3b82f6', description: 'Invite guests & manage passes' },
  { label: 'Parking', icon: Car, path: '/resident/parking', color: '#8b5cf6', description: 'Manage parking slots' },
  { label: 'Maintenance', icon: Wrench, path: '/resident/maintenance', color: '#f97316', description: 'Report & track issues' },
  { label: 'Billing', icon: CreditCard, path: '/resident/billing', color: '#10b981', description: 'Pay dues & view receipts' },
  { label: 'Marketplace', icon: Store, path: '/resident/marketplace', color: '#f59e0b', description: 'Shop from society vendors' },
  { label: 'Amenities', icon: Sparkles, path: '/resident/amenities', color: '#ec4899', description: 'Book gym, pool & more' },
  { label: 'Community', icon: Users, path: '/resident/community', color: '#14b8a6', description: 'Notices & discussions' },
  { label: 'Child Safety', icon: ShieldCheck, path: '/resident/child-safety', color: '#22c55e', description: 'Authorized pickup management' },
  { label: 'Emergency SOS', icon: ShieldAlert, path: '/resident/emergency', color: '#ef4444', description: 'Report emergencies' },
  { label: 'Garbage', icon: Trash2, path: '/resident/garbage', color: '#6b7280', description: 'Schedules & complaints' },
  { label: 'Guest Stay', icon: BedDouble, path: '/resident/guest-stay', color: '#a855f7', description: 'Guest accommodation passes' },
  { label: 'Domestic Help', icon: HardHat, path: '/resident/domestic-help', color: '#84cc16', description: 'Manage domestic workers' },
  { label: 'My Flat', icon: Building2, path: '/resident/my-flat', color: '#0ea5e9', description: 'Flat info & documents' },
  { label: 'Requests', icon: MessageSquare, path: '/resident/requests', color: '#64748b', description: 'Submit & track requests' },
];

export const ResidentServicesPage: React.FC = () => {
  const navigate = useNavigate();

  return (
    <div style={{ backgroundColor: '#f7f4ee', minHeight: '100%', padding: '1rem 0.75rem' }}>
      <h1 style={{ fontWeight: 800, fontSize: '1.125rem', color: '#1c1917', marginBottom: '0.25rem' }}>All Services</h1>
      <p style={{ fontSize: '0.8125rem', color: '#78716c', marginBottom: '1rem' }}>Everything you need, all in one place.</p>

      <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
        {SERVICES.map((service) => {
          const Icon = service.icon;
          return (
            <button
              key={service.label}
              onClick={() => navigate(service.path)}
              style={{ display: 'flex', alignItems: 'center', gap: '0.875rem', padding: '0.875rem', borderRadius: '0.875rem', background: '#ffffff', border: '1px solid #e8e2d8', cursor: 'pointer', textAlign: 'left', width: '100%', minHeight: 60, boxShadow: '0 1px 3px rgba(0,0,0,0.04)' }}
              aria-label={service.label}
            >
              <div style={{ width: 44, height: 44, borderRadius: '0.75rem', background: `${service.color}15`, display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
                <Icon size={21} style={{ color: service.color }} />
              </div>
              <div style={{ flex: 1, minWidth: 0 }}>
                <div style={{ fontWeight: 700, fontSize: '0.875rem', color: '#1c1917' }}>{service.label}</div>
                <div style={{ fontSize: '0.75rem', color: '#78716c', marginTop: '0.125rem' }}>{service.description}</div>
              </div>
              <ChevronRight size={16} style={{ color: '#d6d3d1', flexShrink: 0 }} />
            </button>
          );
        })}
      </div>
    </div>
  );
};
