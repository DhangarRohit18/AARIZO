import React, { useEffect, useRef } from 'react';
import { createPortal } from 'react-dom';
import { X } from 'lucide-react';

export interface ModalProps {
  isOpen: boolean;
  onClose: () => void;
  title?: React.ReactNode;
  subtitle?: React.ReactNode;
  children: React.ReactNode;
  footer?: React.ReactNode;
  maxWidth?: string;
  className?: string;
}

export const Modal: React.FC<ModalProps> = ({
  isOpen,
  onClose,
  title,
  subtitle,
  children,
  footer,
  maxWidth = '520px',
  className = '',
}) => {
  const contentRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onClose();
    };

    if (isOpen) {
      document.body.style.overflow = 'hidden';
      window.addEventListener('keydown', handleKeyDown);
    }

    return () => {
      document.body.style.overflow = '';
      window.removeEventListener('keydown', handleKeyDown);
    };
  }, [isOpen, onClose]);

  if (!isOpen || typeof document === 'undefined') return null;

  const modalNode = (
    <div
      role="dialog"
      aria-modal="true"
      style={{
        position: 'fixed',
        inset: 0,
        zIndex: 99999, // Guarantees overlay is above bottom nav (z-100/999) and all page chrome
        backgroundColor: 'rgba(8, 26, 42, 0.72)',
        backdropFilter: 'blur(6px)',
        WebkitBackdropFilter: 'blur(6px)',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        padding: '0.75rem',
        animation: 'aarizoModalFadeIn 0.2s cubic-bezier(0.16, 1, 0.3, 1) forwards',
      }}
      onClick={(e) => {
        if (contentRef.current && !contentRef.current.contains(e.target as Node)) {
          onClose();
        }
      }}
    >
      <div
        ref={contentRef}
        className={`aarizo-general-modal ${className}`}
        style={{
          width: '100%',
          maxWidth,
          maxHeight: 'min(90vh, 760px)',
          display: 'flex',
          flexDirection: 'column',
          backgroundColor: '#ffffff',
          borderRadius: '20px',
          boxShadow: '0 24px 60px -12px rgba(8, 59, 86, 0.35), 0 8px 24px -4px rgba(0, 0, 0, 0.12)',
          border: '1px solid rgba(226, 232, 240, 0.8)',
          overflow: 'hidden',
          animation: 'aarizoModalScaleUp 0.22s cubic-bezier(0.16, 1, 0.3, 1) forwards',
        }}
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        {title && (
          <div
            style={{
              padding: '1.125rem 1.375rem',
              borderBottom: '1px solid #E8F1F5',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'space-between',
              gap: '0.75rem',
              background: '#FFFFFF',
              flexShrink: 0,
            }}
          >
            <div style={{ minWidth: 0, flex: 1 }}>
              <h3
                style={{
                  margin: 0,
                  fontSize: '1.05rem',
                  fontWeight: 700,
                  color: '#083B56',
                  lineHeight: 1.3,
                  letterSpacing: '-0.01em',
                }}
              >
                {title}
              </h3>
              {subtitle && (
                <p
                  style={{
                    margin: '0.2rem 0 0 0',
                    fontSize: '0.75rem',
                    color: '#657785',
                    fontWeight: 500,
                  }}
                >
                  {subtitle}
                </p>
              )}
            </div>

            <button
              onClick={onClose}
              aria-label="Close modal"
              type="button"
              style={{
                background: '#F4FAFE',
                border: '1px solid #E8F1F5',
                color: '#657785',
                cursor: 'pointer',
                width: '32px',
                height: '32px',
                borderRadius: '50%',
                display: 'inline-flex',
                alignItems: 'center',
                justifyContent: 'center',
                flexShrink: 0,
                transition: 'all 0.15s ease',
              }}
              onMouseEnter={(e) => {
                e.currentTarget.style.background = '#EAF6FC';
                e.currentTarget.style.color = '#083B56';
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.background = '#F4FAFE';
                e.currentTarget.style.color = '#657785';
              }}
            >
              <X size={17} strokeWidth={2.25} />
            </button>
          </div>
        )}

        {/* Scrollable Body with Clean Custom Scrollbar */}
        <div
          style={{
            padding: '1.25rem 1.375rem',
            overflowY: 'auto',
            flex: 1,
            WebkitOverflowScrolling: 'touch',
          }}
        >
          {children}
        </div>

        {/* Optional Footer */}
        {footer && (
          <div
            style={{
              padding: '0.875rem 1.375rem',
              borderTop: '1px solid #E8F1F5',
              background: '#F7FBFE',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'flex-end',
              gap: '0.625rem',
              flexShrink: 0,
            }}
          >
            {footer}
          </div>
        )}
      </div>

      <style>{`
        @keyframes aarizoModalFadeIn {
          from { opacity: 0; }
          to { opacity: 1; }
        }
        @keyframes aarizoModalScaleUp {
          from { opacity: 0; transform: scale(0.96) translateY(8px); }
          to { opacity: 1; transform: scale(1) translateY(0); }
        }
        @media (max-width: 640px) {
          .aarizo-general-modal {
            max-height: 85vh !important;
            border-radius: 20px !important;
          }
        }
      `}</style>
    </div>
  );

  return createPortal(modalNode, document.body);
};

