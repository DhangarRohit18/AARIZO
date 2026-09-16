import React from 'react';
import { AlertCircle, RefreshCw, Inbox, Plus } from 'lucide-react';

// ────────────────────────────────────────────────
// Skeleton
// ────────────────────────────────────────────────
interface SkeletonProps {
  width?: string;
  height?: string;
  borderRadius?: string;
  className?: string;
}

export const Skeleton: React.FC<SkeletonProps> = ({
  width = '100%',
  height = '1rem',
  borderRadius = '0.5rem',
  className,
}) => (
  <div
    className={className}
    style={{
      width,
      height,
      borderRadius,
      background: 'linear-gradient(90deg, #e8e2d8 25%, #f5f0ea 50%, #e8e2d8 75%)',
      backgroundSize: '200% 100%',
      animation: 'skeletonPulse 1.5s ease-in-out infinite',
    }}
    aria-hidden="true"
  />
);

// ────────────────────────────────────────────────
// EmptyState
// ────────────────────────────────────────────────
interface EmptyStateProps {
  title: string;
  description?: string;
  icon?: React.ElementType;
  actionLabel?: string;
  onAction?: () => void;
}

export const EmptyState: React.FC<EmptyStateProps> = ({
  title,
  description,
  icon: Icon = Inbox,
  actionLabel,
  onAction,
}) => (
  <div
    style={{
      display: 'flex',
      flexDirection: 'column',
      alignItems: 'center',
      justifyContent: 'center',
      textAlign: 'center',
      padding: '2rem 1.5rem',
      gap: '0.75rem',
    }}
  >
    <div
      style={{
        width: 64,
        height: 64,
        borderRadius: '50%',
        background: '#f5f0ea',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
      }}
    >
      <Icon size={28} style={{ color: '#a8a29e' }} />
    </div>
    <div>
      <h3 style={{ fontWeight: 700, fontSize: '1rem', color: '#292524', marginBottom: '0.25rem' }}>{title}</h3>
      {description && (
        <p style={{ fontSize: '0.8125rem', color: '#78716c', lineHeight: 1.5, maxWidth: '280px' }}>{description}</p>
      )}
    </div>
    {actionLabel && onAction && (
      <button
        onClick={onAction}
        style={{
          display: 'flex',
          alignItems: 'center',
          gap: '0.375rem',
          padding: '0.625rem 1.25rem',
          borderRadius: '0.75rem',
          background: '#1c1917',
          color: '#fff',
          fontWeight: 700,
          fontSize: '0.8125rem',
          border: 'none',
          cursor: 'pointer',
          minHeight: 44,
          marginTop: '0.25rem',
        }}
      >
        <Plus size={16} />
        {actionLabel}
      </button>
    )}
    <style>{`
      @keyframes skeletonPulse {
        0% { background-position: 200% 0; }
        100% { background-position: -200% 0; }
      }
    `}</style>
  </div>
);

// ────────────────────────────────────────────────
// ErrorState
// ────────────────────────────────────────────────
interface ErrorStateProps {
  title?: string;
  message?: string;
  onRetry?: () => void;
}

export const ErrorState: React.FC<ErrorStateProps> = ({
  title = 'Something went wrong',
  message = 'An unexpected error occurred. Please try again.',
  onRetry,
}) => (
  <div
    style={{
      display: 'flex',
      flexDirection: 'column',
      alignItems: 'center',
      justifyContent: 'center',
      textAlign: 'center',
      padding: '2rem 1.5rem',
      gap: '0.75rem',
    }}
  >
    <div
      style={{
        width: 64,
        height: 64,
        borderRadius: '50%',
        background: '#fef2f2',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
      }}
    >
      <AlertCircle size={28} style={{ color: '#ef4444' }} />
    </div>
    <div>
      <h3 style={{ fontWeight: 700, fontSize: '1rem', color: '#292524', marginBottom: '0.25rem' }}>{title}</h3>
      <p style={{ fontSize: '0.8125rem', color: '#78716c', lineHeight: 1.5, maxWidth: '280px' }}>{message}</p>
    </div>
    {onRetry && (
      <button
        onClick={onRetry}
        style={{
          display: 'flex',
          alignItems: 'center',
          gap: '0.375rem',
          padding: '0.625rem 1.25rem',
          borderRadius: '0.75rem',
          background: '#fef2f2',
          color: '#dc2626',
          fontWeight: 700,
          fontSize: '0.8125rem',
          border: '1px solid #fecaca',
          cursor: 'pointer',
          minHeight: 44,
          marginTop: '0.25rem',
        }}
      >
        <RefreshCw size={16} />
        Try Again
      </button>
    )}
  </div>
);
