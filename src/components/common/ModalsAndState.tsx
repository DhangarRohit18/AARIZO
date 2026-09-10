import React from 'react';
import { X, AlertTriangle, CheckCircle, Info, RefreshCw, Inbox } from 'lucide-react';
import './common.css';

export interface ModalProps {
  isOpen: boolean;
  onClose: () => void;
  title: string;
  children: React.ReactNode;
  footer?: React.ReactNode;
}

export const Modal: React.FC<ModalProps> = ({ isOpen, onClose, title, children, footer }) => {
  if (!isOpen) return null;

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal-content" onClick={(e) => e.stopPropagation()}>
        <div className="modal-header">
          <h3>{title}</h3>
          <button className="modal-close-btn" onClick={onClose} aria-label="Close modal">
            <X size={18} />
          </button>
        </div>
        <div className="modal-body">{children}</div>
        {footer && <div className="modal-footer">{footer}</div>}
      </div>
    </div>
  );
};

export interface DrawerProps {
  isOpen: boolean;
  onClose: () => void;
  title: string;
  children: React.ReactNode;
  position?: 'bottom' | 'right';
}

export const Drawer: React.FC<DrawerProps> = ({ isOpen, onClose, title, children, position = 'bottom' }) => {
  if (!isOpen) return null;

  return (
    <div className="drawer-overlay" onClick={onClose}>
      <div className={`drawer-content drawer-${position}`} onClick={(e) => e.stopPropagation()}>
        <div className="drawer-handle" />
        <div className="drawer-header">
          <h3>{title}</h3>
          <button className="modal-close-btn" onClick={onClose} aria-label="Close drawer">
            <X size={18} />
          </button>
        </div>
        <div className="drawer-body">{children}</div>
      </div>
    </div>
  );
};

export const Skeleton: React.FC<{ height?: string; width?: string; borderRadius?: string }> = ({
  height = '20px',
  width = '100%',
  borderRadius = 'var(--radius-sm)',
}) => {
  return <div className="skeleton-pulse" style={{ height, width, borderRadius }} />;
};

export const LoadingState: React.FC<{ message?: string }> = ({ message = 'Loading dataset...' }) => {
  return (
    <div className="state-container">
      <div className="spinner-large" />
      <p className="state-message">{message}</p>
    </div>
  );
};

export interface EmptyStateProps {
  title?: string;
  description?: string;
  actionLabel?: string;
  onAction?: () => void;
  icon?: React.ReactNode;
}

export const EmptyState: React.FC<EmptyStateProps> = ({
  title = 'No Records Found',
  description = 'There are no active records in this view.',
  actionLabel,
  onAction,
  icon = <Inbox size={36} />,
}) => {
  return (
    <div className="state-container">
      <div className="state-icon-wrapper">{icon}</div>
      <h4 className="state-title">{title}</h4>
      <p className="state-description">{description}</p>
      {actionLabel && onAction && (
        <button className="btn btn-primary btn-sm" style={{ marginTop: '12px' }} onClick={onAction}>
          {actionLabel}
        </button>
      )}
    </div>
  );
};

export interface ErrorStateProps {
  title?: string;
  message?: string;
  onRetry?: () => void;
}

export const ErrorState: React.FC<ErrorStateProps> = ({
  title = 'Unable to Load Data',
  message = 'A simulated connection timeout occurred while fetching records.',
  onRetry,
}) => {
  return (
    <div className="state-container state-error">
      <div className="state-icon-wrapper state-icon-danger">
        <AlertTriangle size={36} />
      </div>
      <h4 className="state-title">{title}</h4>
      <p className="state-description">{message}</p>
      {onRetry && (
        <button className="btn btn-outline btn-sm" style={{ marginTop: '12px' }} onClick={onRetry}>
          <RefreshCw size={14} style={{ marginRight: '6px' }} />
          Retry Request
        </button>
      )}
    </div>
  );
};

export interface SuccessStateProps {
  title?: string;
  message?: string;
  actionLabel?: string;
  onAction?: () => void;
}

export const SuccessState: React.FC<SuccessStateProps> = ({
  title = 'Operation Successful',
  message = 'The requested entry was processed and confirmed.',
  actionLabel = 'Continue',
  onAction,
}) => {
  return (
    <div className="state-container state-success">
      <div className="state-icon-wrapper state-icon-success">
        <CheckCircle size={36} />
      </div>
      <h4 className="state-title">{title}</h4>
      <p className="state-description">{message}</p>
      {onAction && (
        <button className="btn btn-primary btn-sm" style={{ marginTop: '12px' }} onClick={onAction}>
          {actionLabel}
        </button>
      )}
    </div>
  );
};

export interface ToastProps {
  message: string;
  type?: 'success' | 'warning' | 'danger' | 'info';
  onClose?: () => void;
}

export const Toast: React.FC<ToastProps> = ({ message, type = 'info', onClose }) => {
  const getIcon = () => {
    switch (type) {
      case 'success':
        return <CheckCircle size={16} />;
      case 'warning':
      case 'danger':
        return <AlertTriangle size={16} />;
      default:
        return <Info size={16} />;
    }
  };

  return (
    <div className={`toast toast-${type}`}>
      <span className="toast-icon">{getIcon()}</span>
      <span className="toast-message">{message}</span>
      {onClose && (
        <button className="toast-close" onClick={onClose}>
          <X size={14} />
        </button>
      )}
    </div>
  );
};
