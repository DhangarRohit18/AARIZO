import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  UserCheck, Car, Wrench, CreditCard, Store, Sparkles,
  ShieldCheck, ShieldAlert, Trash2, BedDouble, HardHat,
  Users, Building2, MessageSquare, ChevronRight, Tag, Gift,
  Phone, Search, CheckCircle2,
} from 'lucide-react';
import { AdvertisementPopup, OffersLauncherPill } from '../../../components/common/AdvertisementPopup';
import { useAuth } from '../../../context/AuthContext';
import { societyService } from '../../../services/societyService';
import { realtimeService } from '../../../services/realtimeService';
import type { Vendor } from '../../../types/society';

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
  const { currentUser } = useAuth();
  const [isOffersOpen, setIsOffersOpen] = useState(false);
  const currentSocietyId = currentUser?.societyId || 'soc-gvs';
  const [vendors, setVendors] = useState<Vendor[]>(() => societyService.getVendors(currentSocietyId));
  const [vendorSearch, setVendorSearch] = useState('');

  const reloadVendors = () => {
    setVendors(societyService.getVendors(currentSocietyId));
  };

  useEffect(() => {
    reloadVendors();
    const unsub = realtimeService.subscribe('*', (msg) => {
      if (['VENDOR_REGISTERED', 'USER_PROVISIONED'].includes(msg.topic)) {
        reloadVendors();
      }
    });
    return () => unsub();
  }, [currentSocietyId]);

  const filteredVendors = vendors.filter((v) => {
    const q = vendorSearch.toLowerCase().trim();
    if (!q) return true;
    return (
      v.companyName.toLowerCase().includes(q) ||
      v.category.toLowerCase().includes(q) ||
      v.contactPerson.toLowerCase().includes(q) ||
      v.phone.includes(q)
    );
  });

  return (
    <div style={{ backgroundColor: 'var(--aarizo-page, #F7FBFE)', minHeight: '100%', padding: '1rem', paddingBottom: '5rem' }}>
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: '0.75rem', marginBottom: '0.5rem' }}>
        <div>
          <h1 style={{ fontWeight: 800, fontSize: '1.25rem', color: 'var(--aarizo-navy, #083B56)', margin: 0 }}>
            All Services
          </h1>
          <p style={{ fontSize: '0.8125rem', color: 'var(--aarizo-text-secondary, #657785)', margin: '0.25rem 0 0' }}>
            Everything you need, all in one place.
          </p>
        </div>

        <button
          onClick={() => setIsOffersOpen(true)}
          style={{
            display: 'inline-flex',
            alignItems: 'center',
            gap: '0.5rem',
            padding: '0.5rem 0.875rem',
            borderRadius: '12px',
            background: 'linear-gradient(135deg, #FFF7ED 0%, #FFEDD5 100%)',
            border: '1px solid #FED7AA',
            color: '#C2410C',
            fontSize: '0.75rem',
            fontWeight: 700,
            cursor: 'pointer',
            boxShadow: '0 2px 6px rgba(194, 65, 12, 0.08)',
          }}
        >
          <Gift size={15} />
          <span>Exclusive Resident Perks</span>
        </button>
      </div>

      {/* Featured Partner Deals Banner */}
      <div
        style={{
          background: 'linear-gradient(135deg, #0A2E44 0%, #083B56 100%)',
          borderRadius: '16px',
          padding: '1rem 1.25rem',
          color: '#ffffff',
          marginBottom: '1.25rem',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          flexWrap: 'wrap',
          gap: '0.75rem',
          boxShadow: '0 4px 16px rgba(8, 59, 86, 0.12)',
        }}
      >
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
          <div
            style={{
              width: 38,
              height: 38,
              borderRadius: '10px',
              background: 'rgba(255, 255, 255, 0.12)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              color: '#83CBEA',
              flexShrink: 0,
            }}
          >
            <Tag size={18} />
          </div>
          <div>
            <div style={{ fontSize: '0.875rem', fontWeight: 800 }}>Society Partner Offers Active</div>
            <div style={{ fontSize: '0.75rem', color: '#EAF6FC', opacity: 0.9 }}>
              Unlock verified resident discounts on grocery, laundry, cleaning & salon services.
            </div>
          </div>
        </div>

        <button
          onClick={() => setIsOffersOpen(true)}
          style={{
            padding: '0.5rem 1rem',
            borderRadius: '10px',
            background: '#83CBEA',
            color: '#083B56',
            fontSize: '0.75rem',
            fontWeight: 800,
            border: 'none',
            cursor: 'pointer',
            whiteSpace: 'nowrap',
          }}
        >
          View Deals & Coupons
        </button>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(280px, 1fr))', gap: '0.75rem' }}>
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

      {/* ── Society Verified Vendors & Daily Partners Section ── */}
      <div style={{ marginTop: '2rem' }}>
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: '0.75rem', marginBottom: '1rem' }}>
          <div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
              <h2 style={{ fontSize: '1.1rem', fontWeight: 800, color: 'var(--aarizo-navy, #083B56)', margin: 0 }}>
                Society Verified Vendors & Partners
              </h2>
              <span
                style={{
                  background: '#ECFDF5',
                  color: '#059669',
                  border: '1px solid #A7F3D0',
                  borderRadius: '12px',
                  padding: '2px 8px',
                  fontSize: '0.72rem',
                  fontWeight: 700,
                  display: 'inline-flex',
                  alignItems: 'center',
                  gap: '4px',
                }}
              >
                <CheckCircle2 size={12} /> {vendors.length} Approved
              </span>
            </div>
            <p style={{ fontSize: '0.78rem', color: 'var(--aarizo-text-secondary, #657785)', margin: '0.2rem 0 0' }}>
              Direct contact numbers for management-authorized service providers
            </p>
          </div>

          <div style={{ position: 'relative', width: '100%', maxWidth: 280 }}>
            <Search size={15} style={{ position: 'absolute', left: 10, top: 11, color: '#94A3B8' }} />
            <input
              type="text"
              placeholder="Search vendor, category, contact..."
              value={vendorSearch}
              onChange={(e) => setVendorSearch(e.target.value)}
              style={{
                width: '100%',
                padding: '0.5rem 0.75rem 0.5rem 2.1rem',
                borderRadius: '10px',
                border: '1px solid var(--aarizo-border, #DCE8EF)',
                fontSize: '0.8rem',
                background: '#ffffff',
                color: '#083B56',
              }}
            />
          </div>
        </div>

        {filteredVendors.length === 0 ? (
          <div style={{ padding: '1.5rem', background: '#ffffff', borderRadius: '16px', border: '1px solid #E8F1F5', textAlign: 'center', color: '#64748B', fontSize: '0.85rem' }}>
            No vendors matching your search.
          </div>
        ) : (
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(300px, 1fr))', gap: '0.85rem' }}>
            {filteredVendors.map((vendor) => (
              <div
                key={vendor.id}
                style={{
                  background: '#ffffff',
                  border: '1px solid var(--aarizo-border-soft, #E8F1F5)',
                  borderRadius: '16px',
                  padding: '1rem',
                  display: 'flex',
                  flexDirection: 'column',
                  justifyContent: 'space-between',
                  gap: '0.75rem',
                  boxShadow: '0 2px 8px rgba(8, 59, 86, 0.04)',
                }}
              >
                <div>
                  <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', gap: '0.5rem' }}>
                    <div>
                      <h3 style={{ margin: 0, fontSize: '0.95rem', fontWeight: 800, color: 'var(--aarizo-navy, #083B56)' }}>
                        {vendor.companyName}
                      </h3>
                      <div style={{ fontSize: '0.75rem', color: '#64748B', marginTop: '0.15rem' }}>
                        Contact: <strong style={{ color: '#1E293B' }}>{vendor.contactPerson}</strong>
                      </div>
                    </div>
                    <span
                      style={{
                        padding: '3px 8px',
                        borderRadius: '8px',
                        background: 'var(--aarizo-light-blue, #EAF6FC)',
                        color: 'var(--aarizo-blue, #176B91)',
                        fontSize: '0.68rem',
                        fontWeight: 700,
                        textTransform: 'uppercase',
                        whiteSpace: 'nowrap',
                      }}
                    >
                      {vendor.category.replace(/_/g, ' ')}
                    </span>
                  </div>
                </div>

                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', paddingTop: '0.5rem', borderTop: '1px solid #F1F5F9' }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '0.35rem', fontSize: '0.8rem', color: '#334155', fontWeight: 600 }}>
                    <Phone size={13} color="#059669" />
                    <span>{vendor.phone}</span>
                  </div>

                  <a
                    href={`tel:${vendor.phone}`}
                    style={{
                      display: 'inline-flex',
                      alignItems: 'center',
                      gap: '0.35rem',
                      padding: '0.4rem 0.85rem',
                      borderRadius: '8px',
                      background: '#ECFDF5',
                      color: '#059669',
                      border: '1px solid #A7F3D0',
                      fontSize: '0.78rem',
                      fontWeight: 700,
                      textDecoration: 'none',
                    }}
                  >
                    <Phone size={12} /> Call Now
                  </a>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Floating Offers Pill Launcher & Popup */}
      <OffersLauncherPill onOpen={() => setIsOffersOpen(true)} />
      <AdvertisementPopup
        forceOpen={isOffersOpen}
        onClose={() => setIsOffersOpen(false)}
        societyId={currentUser?.societyId || 'soc-gvs'}
      />
    </div>
  );
};

export default ResidentServicesPage;
