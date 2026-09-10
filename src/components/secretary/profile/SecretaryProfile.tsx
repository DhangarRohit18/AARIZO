import React from 'react';
import { useAuth } from '../../../context/AuthContext';
import {
  Building2,
  Mail,
  Phone,
  FileText,
  UserCheck,
  LogOut,
  ChevronRight,
  MapPin,
} from 'lucide-react';
import '../secretary.css';

export const SecretaryProfile: React.FC = () => {
  const { currentUser, logout, switchRole } = useAuth();

  return (
    <div>
      {/* Profile Header Card */}
      <div className="onboarding-card" style={{ padding: '1.5rem', marginBottom: '1.25rem' }}>
        <img
          src={
            currentUser?.avatarUrl ||
            'https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?auto=format&fit=crop&w=250&q=80'
          }
          alt={currentUser?.name || 'Mayuri Udar'}
          style={{ width: '80px', height: '80px', borderRadius: '50%', objectFit: 'cover', border: '3px solid #2563eb', marginBottom: '0.875rem' }}
        />
        <h2 className="onboarding-title" style={{ fontSize: '1.25rem', margin: '0 0 0.25rem 0' }}>
          {currentUser?.name || 'Mayuri Udar'}
        </h2>
        <p className="onboarding-desc" style={{ marginBottom: '0.75rem', fontSize: '0.84375rem' }}>
          {currentUser?.designation || 'Management Committee Secretary'} • Green Valley Society
        </p>

        <span className="banner-role-tag" style={{ background: '#eff6ff', color: '#2563eb', border: '1px solid #bfdbfe' }}>
          Official Society Representative
        </span>
      </div>

      {/* Society Details Card */}
      <div className="section-heading-row">
        <h3 className="section-title">Society Information</h3>
      </div>

      <div className="onboarding-card" style={{ padding: '1.25rem', textAlign: 'left', marginBottom: '1.25rem' }}>
        <div className="onboarding-features-list">
          <div className="onboarding-feature-item">
            <Building2 size={16} style={{ color: '#2563eb' }} />
            <span>Society Name: Green Valley Society (128 Flats)</span>
          </div>
          <div className="onboarding-feature-item">
            <FileText size={16} style={{ color: '#2563eb' }} />
            <span>Reg. Number: SOC-REG-8042-MH</span>
          </div>
          <div className="onboarding-feature-item">
            <MapPin size={16} style={{ color: '#2563eb' }} />
            <span>Location: Park Road, Sector 14, Navi Mumbai</span>
          </div>
          <div className="onboarding-feature-item">
            <Phone size={16} style={{ color: '#2563eb' }} />
            <span>Official Admin Phone: +91 98200 12345</span>
          </div>
          <div className="onboarding-feature-item">
            <Mail size={16} style={{ color: '#2563eb' }} />
            <span>Secretary Email: secretary@greenvalley.com</span>
          </div>
        </div>
      </div>

      {/* Management Actions */}
      <div className="section-heading-row">
        <h3 className="section-title">Portal Actions</h3>
      </div>

      <div className="onboarding-features-list" style={{ marginBottom: '1.5rem' }}>
        <button
          className="onboarding-feature-item"
          style={{ width: '100%', cursor: 'pointer', justifyContent: 'space-between', background: '#eff6ff', borderColor: '#bfdbfe' }}
          onClick={() => switchRole('resident')}
        >
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.625rem' }}>
            <UserCheck size={16} style={{ color: '#2563eb' }} />
            <span style={{ fontWeight: 700, color: '#1e3a8a' }}>Switch to Resident View (Sarvesh)</span>
          </div>
          <ChevronRight size={16} style={{ color: '#2563eb' }} />
        </button>

        <button
          className="onboarding-feature-item"
          style={{ width: '100%', cursor: 'pointer', justifyContent: 'space-between', background: '#fff1f2', borderColor: '#fecaca' }}
          onClick={logout}
        >
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.625rem' }}>
            <LogOut size={16} style={{ color: '#e11d48' }} />
            <span style={{ fontWeight: 700, color: '#9f1239' }}>Log Out of Secretary Portal</span>
          </div>
          <ChevronRight size={16} style={{ color: '#e11d48' }} />
        </button>
      </div>
    </div>
  );
};
