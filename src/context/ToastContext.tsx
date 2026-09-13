import React, { createContext, useContext, useState, useCallback } from 'react';
import { ToastContainer } from '../components/ui/ToastContainer';
import type { ToastMessage } from '../components/ui/ToastContainer';

interface ToastContextType {
  showToast: (type: 'success' | 'error' | 'warning' | 'info', title: string, message?: string) => void;
}

const ToastContext = createContext<ToastContextType | undefined>(undefined);

export const ToastProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [toasts, setToasts] = useState<ToastMessage[]>([]);

  const showToast = useCallback(
    (type: 'success' | 'error' | 'warning' | 'info', title: string, message?: string) => {
      const id = `toast-${Date.now()}-${Math.random()}`;
      const newToast: ToastMessage = { id, type, title, message };
      setToasts((prev) => [...prev, newToast]);
    },
    []
  );

  const dismissToast = useCallback((id: string) => {
    setToasts((prev) => prev.filter((t) => t.id !== id));
  }, []);

  return (
    <ToastContext.Provider value={{ showToast }}>
      {children}
      <ToastContainer toasts={toasts} onDismiss={dismissToast} />
    </ToastContext.Provider>
  );
};

export const useToast = (): ToastContextType => {
  const context = useContext(ToastContext);
  if (!context) {
    throw new Error('useToast must be used within a ToastProvider');
  }
  return context;
};
