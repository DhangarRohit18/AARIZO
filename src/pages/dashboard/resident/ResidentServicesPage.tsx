import React from 'react';
import { useNavigate } from 'react-router-dom';
import {
  UserCheck, Car, Wrench, CreditCard, Store, Sparkles,
  ShieldCheck, ShieldAlert, Trash2, BedDouble, HardHat,
  Users, Building2, MessageSquare, ChevronRight,
} from 'lucide-react';

const SERVICES = [
  { label: 'Visitor Pass', icon: UserCheck, path: '/resident/visitors', description: 'Invite guests & manage passes' },
  { label: 'Parking', icon: Car, path: '/resident/parking', description: 'Manage parking slots' },
  { label: 'Maintenance', icon: Wrench, path: '/resident/maintenance', description: 'Report & track issues' },
  { label: 'Billing', icon: CreditCard, path: '/resident/billing', description: 'Pay dues & view receipts' },
  { label: 'Marketplace', icon: Store, path: '/resident/marketplace', description: 'Shop from society vendors' },
  { label: 'Amenities', icon: Sparkles, path: '/resident/amenities', description: 'Book gym, pool & more' },
  { label: 'Community', icon: Users, path: '/resident/community', description: 'Notices & discussions' },
  { label: 'Child Safety', icon: ShieldCheck, path: '/resident/child-safety', description: 'Authorized pickup management' },
  { label: 'Emergency SOS', icon: ShieldAlert, path: '/resident/emergency', description: 'Report emergencies' },
  { label: 'Garbage', icon: Trash2, path: '/resident/garbage', description: 'Schedules & complaints' },
  { label: 'Guest Stay', icon: BedDouble, path: '/resident/guest-stay', description: 'Guest accommodation passes' },
  { label: 'Domestic Help', icon: HardHat, path: '/resident/domestic-help', description: 'Manage domestic workers' },
  { label: 'My Flat', icon: Building2, path: '/resident/my-flat', description: 'Flat info & documents' },
  { label: 'Requests', icon: MessageSquare, path: '/resident/requests', description: 'Submit & track requests' },
];

export const ResidentServicesPage: React.FC = () => {
  const navigate = useNavigate();

  return (
    <div style={{ backgroundColor: 'var(--aarizo-page, #F7FBFE)', minHeight: '100%', padding: '1rem' }}>
      <h1 style={{ fontWeight: 800, fontSize: '1.25rem', color: 'var(--aarizo-navy, #083B56)', marginBottom: '0.25rem' }}>
        All Services
      </h1>
      <p style={{ fontSize: '0.8125rem', color: 'var(--aarizo-text-secondary, #657785)', marginBottom: '1rem' }}>
        Everything you need, all in one place.
      </p>

      <div style={{ display: 'flex', flexDirection: 'column', gap: '0.625rem' }}>
        {SERVICES.map((service) => {
          const Icon = service.icon;
          return (
            <button
              key={service.label}
              onClick={() => navigate(service.path)}
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: '0.875rem',
                padding: '0.875rem 1rem',
                borderRadius: '16px',
                background: '#ffffff',
                border: '1px solid var(--aarizo-border-soft, #E8F1F5)',
                cursor: 'pointer',
                textAlign: 'left',
                width: '100%',
                minHeight: 64,
                boxShadow: '0 2px 8px rgba(8, 59, 86, 0.04)',
              }}
              aria-label={service.label}
            >
              <div
                style={{
                  width: 42,
                  height: 42,
                  borderRadius: '12px',
                  background: 'var(--aarizo-light-blue, #EAF6FC)',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  color: 'var(--aarizo-blue, #176B91)',
                  flexShrink: 0,
                }}
              >
                <Icon size={20} />
              </div>
              <div style={{ flex: 1, minWidth: 0 }}>
                <div style={{ fontWeight: 700, fontSize: '0.875rem', color: 'var(--aarizo-text, #203746)' }}>
                  {service.label}
                </div>
                <div style={{ fontSize: '0.75rem', color: 'var(--aarizo-text-secondary, #657785)', marginTop: '0.125rem' }}>
                  {service.description}
                </div>
              </div>
              <ChevronRight size={16} style={{ color: 'var(--aarizo-text-muted, #8B9AA5)', flexShrink: 0 }} />
            </button>
          );
        })}
      </div>
    </div>
  );
};

export default ResidentServicesPage;
