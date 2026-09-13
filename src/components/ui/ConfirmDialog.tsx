import React from 'react';
import { Modal } from './Modal';
import { AlertTriangle } from 'lucide-react';

interface ConfirmDialogProps {
  isOpen: boolean;
  onClose: () => void;
  onConfirm: () => void;
  title: string;
  message: string;
  confirmText?: string;
  cancelText?: string;
  variant?: 'danger' | 'warning' | 'info';
}

export const ConfirmDialog: React.FC<ConfirmDialogProps> = ({
  isOpen,
  onClose,
  onConfirm,
  title,
  message,
  confirmText = 'Confirm',
  cancelText = 'Cancel',
  variant = 'danger',
}) => {
  const getButtonBg = () => {
    switch (variant) {
      case 'danger':
        return '#dc2626';
      case 'warning':
        return '#d97706';
      default:
        return '#2563eb';
    }
  };

  return (
    <Modal isOpen={isOpen} onClose={onClose} maxWidth="420px">
      <div style={{ textAlign: 'center' }}>
        <div
          style={{
            width: '48px',
            height: '48px',
            borderRadius: '50%',
            backgroundColor: variant === 'danger' ? '#fef2f2' : variant === 'warning' ? '#fffbeb' : '#eff6ff',
            color: getButtonBg(),
            display: 'inline-flex',
            alignItems: 'center',
            justifyContent: 'center',
            marginBottom: '1rem',
          }}
        >
          <AlertTriangle size={24} />
        </div>
        <h3 style={{ margin: '0 0 0.5rem 0', fontSize: '1.15rem', color: '#0f172a' }}>{title}</h3>
        <p style={{ margin: '0 0 1.5rem 0', fontSize: '0.9rem', color: '#64748b' }}>{message}</p>
        <div style={{ display: 'flex', gap: '0.75rem' }}>
          <button
            onClick={onClose}
            style={{
              flex: 1,
              padding: '0.65rem',
              borderRadius: '8px',
              border: '1px solid #cbd5e1',
              background: '#fff',
              color: '#475569',
              fontWeight: 600,
              cursor: 'pointer',
            }}
          >
            {cancelText}
          </button>
          <button
            onClick={() => {
              onConfirm();
              onClose();
            }}
            style={{
              flex: 1,
              padding: '0.65rem',
              borderRadius: '8px',
              border: 'none',
              background: getButtonBg(),
              color: '#fff',
              fontWeight: 600,
              cursor: 'pointer',
            }}
          >
            {confirmText}
          </button>
        </div>
      </div>
    </Modal>
  );
};
