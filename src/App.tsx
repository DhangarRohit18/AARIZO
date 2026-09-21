import React from 'react';
import { BrowserRouter } from 'react-router-dom';
import { PrototypeProvider } from './context/PrototypeContext';
import { AuthProvider } from './context/AuthContext';
import { ToastProvider } from './context/ToastContext';
import { AppRoutes } from './routes';
import { ErrorBoundary } from './components/common/ErrorBoundary';
import './styles/global.css';

export const App: React.FC = () => {
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
              }}
            >
              <AppRoutes />
            </div>
          </ToastProvider>
        </AuthProvider>
      </PrototypeProvider>
    </BrowserRouter>
  </ErrorBoundary>
  );
};

export default App;
