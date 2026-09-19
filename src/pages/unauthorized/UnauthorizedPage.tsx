import React from 'react';
import { ShieldAlert, ArrowLeft } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';

export const UnauthorizedPage: React.FC = () => {
  const navigate = useNavigate();
  const { currentUser, switchRole } = useAuth();

  return (
    <div
      style={{
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        justifyContent: 'center',
        minHeight: '80vh',
        padding: '2rem',
        textAlign: 'center',
      }}
    >
      <div
        style={{
          width: '64px',
          height: '64px',
          borderRadius: '50%',
          backgroundColor: '#fef2f2',
          color: '#ef4444',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          marginBottom: '1rem',
        }}
      >
        <ShieldAlert size={32} />
      </div>
      <h2 style={{ margin: '0 0 0.5rem 0', color: '#0f172a' }}>403 â€” Access Denied</h2>
      <p style={{ margin: '0 0 1.5rem 0', color: '#64748b', maxWidth: '400px' }}>
        You do not have permission to access this page under your current role (
        <strong>{currentUser?.role || 'Guest'}</strong>).
      </p>
      <div style={{ display: 'flex', gap: '0.75rem' }}>
        <button
          onClick={() => navigate(-1)}
          style={{
            display: 'flex',
            alignItems: 'center',
            gap: '0.5rem',
            padding: '0.6rem 1.2rem',
            borderRadius: '8px',
            border: '1px solid #cbd5e1',
            background: '#fff',
            cursor: 'pointer',
            fontWeight: 600,
          }}
        >
          <ArrowLeft size={16} /> Go Back
        </button>
        <button
          onClick={() => switchRole('resident')}
          style={{
            padding: '0.6rem 1.2rem',
            borderRadius: '8px',
            border: 'none',
            background: '#2563eb',
            color: '#fff',
            cursor: 'pointer',
            fontWeight: 600,
          }}
        >
          Switch to Resident Role
        </button>
      </div>
    </div>
  );
};

