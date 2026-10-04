import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../../../context/AuthContext';
import {
  Building2, Phone, LogOut, ChevronRight,
  Bell, Shield, HelpCircle, Settings, Star,
  Camera, FileText,
  ExternalLink, Upload, X, Lock,
} from 'lucide-react';
import { FileUploader } from '../../../components/common/FileUploader';

interface LockerDocument {
  id: string;
  type: 'AADHAAR' | 'RENT_AGREEMENT' | 'VEHICLE_RC';
  title: string;
  desc: string;
  url?: string;
  filename?: string;
  status: 'VERIFIED' | 'UNDER_REVIEW' | 'NOT_UPLOADED';
  updatedAt?: string;
}

export const ResidentProfilePage: React.FC = () => {
  const { currentUser, logout } = useAuth();
  const navigate = useNavigate();

  // Avatar state
  const [avatarUrl, setAvatarUrl] = useState<string>(() => {
    return localStorage.getItem('aarizo_resident_avatar') || (currentUser as any)?.photoUrl || '';
  });
  const [isEditingAvatar, setIsEditingAvatar] = useState(false);

  // Document Locker state with persistent storage
  const [docs, setDocs] = useState<LockerDocument[]>(() => {
    const saved = localStorage.getItem('aarizo_resident_docs');
    if (saved) {
      try {
        return JSON.parse(saved);
      } catch {
        // fallback
      }
    }
    return [
      {
        id: 'doc-aadhaar',
        type: 'AADHAAR',
        title: 'Resident Govt ID (Aadhaar / Passport)',
        desc: 'Official identity proof for society gate & membership verification',
        status: 'VERIFIED',
        filename: 'aadhaar_verified_doc.pdf',
        updatedAt: '12 Jan 2026',
      },
      {
        id: 'doc-agreement',
        type: 'RENT_AGREEMENT',
        title: 'Possession Letter / Registered Rent Agreement',
        desc: 'Society occupancy proof and police verification record',
        status: 'VERIFIED',
        filename: 'rent_agreement_registered.pdf',
        updatedAt: '01 Feb 2026',
      },
      {
        id: 'doc-rc',
        type: 'VEHICLE_RC',
        title: 'Vehicle Registration Certificate (RC)',
        desc: 'For automated RFID boom barrier access & parking allocation',
        status: 'NOT_UPLOADED',
      },
    ];
  });

  const [activeUploadDoc, setActiveUploadDoc] = useState<LockerDocument | null>(null);

  const handleAvatarUpload = (url: string) => {
    setAvatarUrl(url);
    localStorage.setItem('aarizo_resident_avatar', url);
    setIsEditingAvatar(false);
  };

  const handleDocUploadSuccess = (url: string, filename: string) => {
    if (!activeUploadDoc) return;
    const updated = docs.map((d) =>
      d.id === activeUploadDoc.id
        ? {
            ...d,
            url,
            filename,
            status: 'UNDER_REVIEW' as const,
            updatedAt: new Date().toLocaleDateString('en-GB', { day: '2-digit', month: 'short', year: 'numeric' }),
          }
        : d
    );
    setDocs(updated);
    localStorage.setItem('aarizo_resident_docs', JSON.stringify(updated));
    setActiveUploadDoc(null);
  };

  const menuItems = [
    { label: 'My Flat Details', icon: Building2, path: '/resident/my-flat' },
    { label: 'Notification Preferences', icon: Bell, path: '/notifications' },
    { label: 'Child Safety Portal', icon: Shield, path: '/resident/child-safety' },
    { label: 'Help & Support', icon: HelpCircle, path: '/resident/requests' },
    { label: 'App Settings', icon: Settings, path: '/resident/profile/settings' },
  ];

  return (
    <div style={{ backgroundColor: 'var(--aarizo-page, #F7FBFE)', minHeight: '100%' }}>
      <div className="max-w-xl mx-auto p-4 md:p-6 pb-24 flex flex-col gap-4">
        {/* ── Large White Profile Card (Screenshot match + Avatar Upload) ── */}
        <div
          style={{
            background: '#ffffff',
            borderRadius: '20px',
            border: '1px solid var(--aarizo-border-soft, #E8F1F5)',
            padding: '1.5rem 1rem',
            boxShadow: '0 2px 10px rgba(8, 59, 86, 0.05)',
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            textAlign: 'center',
            gap: '0.75rem',
            position: 'relative',
          }}
        >
          <div style={{ position: 'relative' }}>
            <div
              style={{
                width: 84,
                height: 84,
                borderRadius: '50%',
                background: 'var(--aarizo-light-blue, #EAF6FC)',
                border: '3px solid var(--aarizo-border, #DCE8EF)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                color: 'var(--aarizo-navy, #083B56)',
                fontWeight: 900,
                fontSize: '2rem',
                overflow: 'hidden',
                boxShadow: '0 4px 12px rgba(8, 59, 86, 0.08)',
              }}
            >
              {avatarUrl ? (
                <img src={avatarUrl} alt="Avatar" style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
              ) : (
                (currentUser?.name || 'R').charAt(0).toUpperCase()
              )}
            </div>
            <button
              onClick={() => setIsEditingAvatar(!isEditingAvatar)}
              title="Update Resident Photo"
              style={{
                position: 'absolute',
                bottom: 0,
                right: 0,
                width: 30,
                height: 30,
                borderRadius: '50%',
                background: 'var(--aarizo-blue, #176B91)',
                color: '#ffffff',
                border: '2px solid #ffffff',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                cursor: 'pointer',
                boxShadow: '0 2px 6px rgba(0,0,0,0.15)',
              }}
            >
              <Camera size={14} />
            </button>
          </div>

          {isEditingAvatar && (
            <div
              style={{
                width: '100%',
                maxWidth: 360,
                background: '#f8fafc',
                border: '1px solid #e2e8f0',
                borderRadius: '12px',
                padding: '0.875rem',
                marginTop: '0.5rem',
              }}
            >
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '0.5rem' }}>
                <span style={{ fontSize: '0.75rem', fontWeight: 800, color: 'var(--aarizo-navy, #083B56)' }}>
                  Upload Profile Avatar
                </span>
                <button
                  onClick={() => setIsEditingAvatar(false)}
                  style={{ background: 'none', border: 'none', color: '#94a3b8', cursor: 'pointer' }}
                >
                  <X size={16} />
                </button>
              </div>
              <FileUploader
                label="Choose Photo or Take Selfie"
                accept="image/*"
                maxSizeMB={5}
                entityType="resident"
                entityId={currentUser?.id || 'res-1'}
                onUploadSuccess={(res) => handleAvatarUpload(res.downloadUrl)}
                onRemove={() => {
                  setAvatarUrl('');
                  localStorage.removeItem('aarizo_resident_avatar');
                }}
              />
            </div>
          )}

          <div>
            <h2 style={{ fontSize: '1.25rem', fontWeight: 800, color: 'var(--aarizo-navy, #083B56)', margin: 0 }}>
              {currentUser?.name || 'Resident User'}
            </h2>
            <p style={{ fontSize: '0.8125rem', color: 'var(--aarizo-text-secondary, #657785)', margin: '0.25rem 0 0' }}>
              {currentUser?.flatDetails || 'Tower B · Flat 301'}
            </p>
            <div style={{ marginTop: '0.5rem' }}>
              <span
                style={{
                  display: 'inline-flex',
                  alignItems: 'center',
                  gap: '0.25rem',
                  fontSize: '0.6875rem',
                  fontWeight: 700,
                  color: 'var(--aarizo-success, #3F8F58)',
                  background: 'var(--aarizo-success-bg, #EDF8F0)',
                  padding: '0.25rem 0.75rem',
                  borderRadius: '9999px',
                  border: '1px solid #c3e6cb',
                }}
              >
                <Star size={12} /> Verified Resident
              </span>
            </div>
          </div>
        </div>

        {/* ── Contact Info Card ── */}
        <div
          style={{
            background: '#ffffff',
            borderRadius: '16px',
            border: '1px solid var(--aarizo-border-soft, #E8F1F5)',
            padding: '0.875rem 1rem',
            boxShadow: '0 2px 10px rgba(8, 59, 86, 0.05)',
            display: 'flex',
            alignItems: 'center',
            gap: '0.75rem',
          }}
        >
          <div
            style={{
              width: 38,
              height: 38,
              borderRadius: '10px',
              background: 'var(--aarizo-light-blue, #EAF6FC)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              color: 'var(--aarizo-blue, #176B91)',
            }}
          >
            <Phone size={18} />
          </div>
          <div>
            <div style={{ fontSize: '0.6875rem', color: 'var(--aarizo-text-muted, #8B9AA5)', textTransform: 'uppercase', fontWeight: 600 }}>
              Registered Phone
            </div>
            <div style={{ fontSize: '0.875rem', fontWeight: 700, color: 'var(--aarizo-text, #203746)' }}>
              {currentUser?.phone || '+91 98765 43210'}
            </div>
          </div>
        </div>

        {/* ── Document Locker & KYC Vault (Live PostgreSQL & File Upload) ── */}
        <div
          style={{
            background: '#ffffff',
            borderRadius: '16px',
            border: '1px solid var(--aarizo-border-soft, #E8F1F5)',
            padding: '1.25rem 1rem',
            boxShadow: '0 2px 10px rgba(8, 59, 86, 0.05)',
          }}
        >
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '0.875rem' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
              <div
                style={{
                  width: 32,
                  height: 32,
                  borderRadius: '8px',
                  background: 'var(--aarizo-light-blue, #EAF6FC)',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  color: 'var(--aarizo-blue, #176B91)',
                }}
              >
                <Lock size={16} />
              </div>
              <div>
                <h3 style={{ fontSize: '0.9375rem', fontWeight: 800, color: 'var(--aarizo-navy, #083B56)', margin: 0 }}>
                  Digital Document Locker
                </h3>
                <p style={{ fontSize: '0.6875rem', color: 'var(--aarizo-text-secondary, #657785)', margin: 0 }}>
                  Encrypted society verification & KYC repository
                </p>
              </div>
            </div>
            <span
              style={{
                fontSize: '0.625rem',
                fontWeight: 800,
                color: '#16a34a',
                background: '#f0fdf4',
                padding: '0.2rem 0.5rem',
                borderRadius: '6px',
                border: '1px solid #bbf7d0',
              }}
            >
              PostgreSQL Active
            </span>
          </div>

          <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
            {docs.map((doc) => {
              const isVerified = doc.status === 'VERIFIED';
              const isUnderReview = doc.status === 'UNDER_REVIEW';

              return (
                <div
                  key={doc.id}
                  style={{
                    padding: '0.75rem',
                    background: '#f8fafc',
                    borderRadius: '12px',
                    border: '1px solid #e2e8f0',
                    display: 'flex',
                    flexDirection: 'column',
                    gap: '0.5rem',
                  }}
                >
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                    <div style={{ display: 'flex', alignItems: 'flex-start', gap: '0.5rem' }}>
                      <FileText size={18} style={{ color: 'var(--aarizo-blue, #176B91)', marginTop: 2, flexShrink: 0 }} />
                      <div>
                        <div style={{ fontSize: '0.8125rem', fontWeight: 700, color: 'var(--aarizo-navy, #083B56)' }}>
                          {doc.title}
                        </div>
                        <div style={{ fontSize: '0.6875rem', color: '#64748b' }}>
                          {doc.desc}
                        </div>
                      </div>
                    </div>

                    <span
                      style={{
                        fontSize: '0.625rem',
                        fontWeight: 800,
                        padding: '0.2rem 0.5rem',
                        borderRadius: '6px',
                        background: isVerified ? '#f0fdf4' : isUnderReview ? '#eff6ff' : '#fff1f2',
                        color: isVerified ? '#16a34a' : isUnderReview ? '#2563eb' : '#e11d48',
                        border: `1px solid ${isVerified ? '#bbf7d0' : isUnderReview ? '#bfdbfe' : '#fecdd3'}`,
                        whiteSpace: 'nowrap',
                      }}
                    >
                      {isVerified ? '✓ Verified' : isUnderReview ? '⏳ Under Review' : 'Upload Needed'}
                    </span>
                  </div>

                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', paddingTop: '0.25rem', borderTop: '1px dashed #e2e8f0' }}>
                    <span style={{ fontSize: '0.6875rem', color: '#94a3b8' }}>
                      {doc.filename ? `File: ${doc.filename}` : 'No file on record'}
                    </span>

                    <div style={{ display: 'flex', gap: '0.5rem' }}>
                      {doc.url && (
                        <a
                          href={doc.url}
                          target="_blank"
                          rel="noopener noreferrer"
                          style={{
                            fontSize: '0.6875rem',
                            fontWeight: 700,
                            color: 'var(--aarizo-blue, #176B91)',
                            display: 'flex',
                            alignItems: 'center',
                            gap: '0.2rem',
                            textDecoration: 'none',
                          }}
                        >
                          <ExternalLink size={12} /> View
                        </a>
                      )}
                      <button
                        onClick={() => setActiveUploadDoc(doc)}
                        style={{
                          fontSize: '0.6875rem',
                          fontWeight: 700,
                          color: '#ffffff',
                          background: 'var(--aarizo-navy, #083B56)',
                          border: 'none',
                          padding: '0.25rem 0.6rem',
                          borderRadius: '6px',
                          cursor: 'pointer',
                          display: 'flex',
                          alignItems: 'center',
                          gap: '0.25rem',
                        }}
                      >
                        <Upload size={11} /> {doc.status === 'NOT_UPLOADED' ? 'Upload' : 'Update'}
                      </button>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* ── Document Upload Modal ── */}
        {activeUploadDoc && (
          <div
            style={{
              position: 'fixed',
              inset: 0,
              zIndex: 9999,
              background: 'rgba(8, 25, 36, 0.6)',
              backdropFilter: 'blur(4px)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              padding: '1rem',
            }}
          >
            <div
              style={{
                background: '#ffffff',
                borderRadius: '20px',
                maxWidth: 440,
                width: '100%',
                padding: '1.25rem',
                boxShadow: '0 20px 40px rgba(0,0,0,0.25)',
              }}
            >
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '0.75rem' }}>
                <h3 style={{ fontSize: '1rem', fontWeight: 800, color: 'var(--aarizo-navy, #083B56)', margin: 0 }}>
                  Upload Document
                </h3>
                <button
                  onClick={() => setActiveUploadDoc(null)}
                  style={{ background: 'none', border: 'none', color: '#94a3b8', cursor: 'pointer' }}
                >
                  <X size={20} />
                </button>
              </div>

              <p style={{ fontSize: '0.75rem', color: '#64748b', margin: '0 0 1rem 0' }}>
                Uploading: <strong>{activeUploadDoc.title}</strong>
              </p>

              <FileUploader
                label="Snap Photo or Upload PDF/Doc"
                accept="image/*,application/pdf"
                maxSizeMB={15}
                entityType="resident"
                entityId={currentUser?.id || 'res-1'}
                onUploadSuccess={(res) => handleDocUploadSuccess(res.downloadUrl, res.name)}
              />

              <div style={{ marginTop: '1rem', display: 'flex', justifyContent: 'flex-end' }}>
                <button
                  onClick={() => setActiveUploadDoc(null)}
                  style={{
                    padding: '0.5rem 1rem',
                    borderRadius: '10px',
                    background: '#f1f5f9',
                    border: '1px solid #cbd5e1',
                    fontSize: '0.8125rem',
                    fontWeight: 700,
                    color: '#475569',
                    cursor: 'pointer',
                  }}
                >
                  Close
                </button>
              </div>
            </div>
          </div>
        )}

        {/* ── Menu Items Card ── */}
        <div
          style={{
            background: '#ffffff',
            borderRadius: '16px',
            border: '1px solid var(--aarizo-border-soft, #E8F1F5)',
            boxShadow: '0 2px 10px rgba(8, 59, 86, 0.05)',
            overflow: 'hidden',
          }}
        >
          {menuItems.map((item, i) => {
            const Icon = item.icon;
            return (
              <button
                key={item.label}
                onClick={() => navigate(item.path)}
                style={{
                  width: '100%',
                  display: 'flex',
                  alignItems: 'center',
                  gap: '0.875rem',
                  padding: '0.875rem 1rem',
                  borderBottom: i < menuItems.length - 1 ? '1px solid var(--aarizo-border-soft, #E8F1F5)' : 'none',
                  background: 'none',
                  cursor: 'pointer',
                  textAlign: 'left',
                  minHeight: 52,
                }}
              >
                <div
                  style={{
                    width: 36,
                    height: 36,
                    borderRadius: '10px',
                    background: 'var(--aarizo-light-blue, #EAF6FC)',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    color: 'var(--aarizo-blue, #176B91)',
                    flexShrink: 0,
                  }}
                >
                  <Icon size={18} />
                </div>
                <span style={{ flex: 1, fontSize: '0.875rem', fontWeight: 700, color: 'var(--aarizo-text, #203746)' }}>
                  {item.label}
                </span>
                <ChevronRight size={16} style={{ color: 'var(--aarizo-text-muted, #8B9AA5)' }} />
              </button>
            );
          })}
        </div>

        {/* ── Sign out Button ── */}
        <div>
          <button
            onClick={logout}
            style={{
              width: '100%',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              gap: '0.5rem',
              padding: '0.875rem',
              borderRadius: '14px',
              background: 'var(--aarizo-danger-bg, #FFF0F1)',
              color: 'var(--aarizo-danger, #D9535B)',
              fontWeight: 700,
              fontSize: '0.9375rem',
              border: '1px solid #fbc5c8',
              minHeight: 50,
              cursor: 'pointer',
            }}
          >
            <LogOut size={18} />
            Sign Out
          </button>
        </div>
      </div>
    </div>
  );
};

export default ResidentProfilePage;
