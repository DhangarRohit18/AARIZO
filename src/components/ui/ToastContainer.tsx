import React, { useEffect } from 'react';
import { CheckCircle2, AlertTriangle, AlertCircle, Info, X } from 'lucide-react';

export interface ToastMessage {
  id: string;
  type: 'success' | 'error' | 'warning' | 'info';
  title: string;
  message?: string;
}

interface ToastContainerProps {
  toasts: ToastMessage[];
  onDismiss: (id: string) => void;
}

export const ToastContainer: React.FC<ToastContainerProps> = ({ toasts, onDismiss }) => {
  return (
    <div className="fixed bottom-5 right-5 z-50 flex flex-col gap-2 max-w-sm w-full pointer-events-none">
      {toasts.map((toast) => (
        <ToastItem key={toast.id} toast={toast} onDismiss={onDismiss} />
      ))}
    </div>
  );
};

const ToastItem: React.FC<{ toast: ToastMessage; onDismiss: (id: string) => void }> = ({
  toast,
  onDismiss,
}) => {
  useEffect(() => {
    const timer = setTimeout(() => {
      onDismiss(toast.id);
    }, 4500);
    return () => clearTimeout(timer);
  }, [toast.id, onDismiss]);

  const styles = {
    success: {
      bg: 'bg-emerald-950/90 border-emerald-700/60 text-emerald-200',
      icon: <CheckCircle2 className="w-5 h-5 text-emerald-400 shrink-0" />,
    },
    error: {
      bg: 'bg-rose-950/90 border-rose-700/60 text-rose-200',
      icon: <AlertCircle className="w-5 h-5 text-rose-400 shrink-0" />,
    },
    warning: {
      bg: 'bg-amber-950/90 border-amber-700/60 text-amber-200',
      icon: <AlertTriangle className="w-5 h-5 text-amber-400 shrink-0" />,
    },
    info: {
      bg: 'bg-blue-950/90 border-blue-700/60 text-blue-200',
      icon: <Info className="w-5 h-5 text-blue-400 shrink-0" />,
    },
  }[toast.type];

  return (
    <div
      className={`pointer-events-auto p-4 rounded-xl shadow-xl border backdrop-blur-md transition-all duration-300 animate-slide-in flex items-start justify-between gap-3 ${styles.bg}`}
    >
      <div className="flex items-start gap-3">
        {styles.icon}
        <div>
          <h4 className="text-xs font-bold text-white">{toast.title}</h4>
          {toast.message && <p className="text-[11px] opacity-80 mt-0.5">{toast.message}</p>}
        </div>
      </div>
      <button
        onClick={() => onDismiss(toast.id)}
        className="opacity-60 hover:opacity-100 transition p-0.5 text-white"
      >
        <X className="w-4 h-4" />
      </button>
    </div>
  );
};
