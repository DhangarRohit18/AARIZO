import React, { useEffect } from 'react';
import { BrowserRouter, Link } from 'react-router-dom';
import { PrototypeProvider } from './context/PrototypeContext';
import { AuthProvider } from './context/AuthContext';
import { ToastProvider } from './context/ToastContext';
import { AppRoutes } from './routes';
import { ErrorBoundary } from './components/common/ErrorBoundary';
import { initNativeMobileFeatures } from './utils/nativeMobile';
import { Database } from 'lucide-react';
import './styles/global.css';

export const App: React.FC = () => {
  useEffect(() => {
    initNativeMobileFeatures();
  }, []);
  return (
    <ErrorBoundary>
      <BrowserRouter>
      <PrototypeProvider>
        <AuthProvider>
          <ToastProvider>
            <div
              style={{
                display: 'flex',
                flexDirection: 'column',
                minHeight: '100dvh',
                width: '100%',
                maxWidth: '100vw',
                overflowX: 'hidden',
                backgroundColor: '#f8fafc',
                color: '#0f172a',
                position: 'relative',
              }}
            >
              <AppRoutes />

              {/* Developer Real-Time Database Quick-Launcher */}
              <Link
                to="/dev/database"
                title="Open Real-Time Developer Database Studio"
                style={{
                  position: 'fixed',
                  bottom: 'calc(72px + env(safe-area-inset-bottom, 0px))',
                  right: 14,
                  zIndex: 9999,
                  background: 'rgba(8, 25, 36, 0.92)',
                  color: '#38BDF8',
                  border: '1px solid rgba(56, 189, 248, 0.3)',
                  boxShadow: '0 4px 16px rgba(0, 0, 0, 0.35)',
                  borderRadius: '24px',
                  padding: '0.4rem 0.75rem',
                  display: 'flex',
                  alignItems: 'center',
                  gap: '0.45rem',
                  fontSize: '0.75rem',
                  fontWeight: 800,
                  textDecoration: 'none',
                  backdropFilter: 'blur(10px)',
                  transition: 'all 0.2s ease',
                }}
              >
                <span
                  style={{
                    width: 7,
                    height: 7,
                    borderRadius: '50%',
                    background: '#10B981',
                    boxShadow: '0 0 8px #10B981',
                  }}
                />
                <Database size={13} />
                <span>DB Studio</span>
              </Link>
            </div>
          </ToastProvider>
        </AuthProvider>
      </PrototypeProvider>
    </BrowserRouter>
  </ErrorBoundary>
  );
};

export default App;
