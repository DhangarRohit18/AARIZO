import React from 'react';
import { BrowserRouter } from 'react-router-dom';
import { PrototypeProvider } from './context/PrototypeContext';
import { AuthProvider } from './context/AuthContext';
import { ToastProvider } from './context/ToastContext';
import { AppRoutes } from './routes';
import './styles/global.css';

export const App: React.FC = () => {
  return (
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
                backgroundColor: '#f7f4ee',
                color: '#1c1917',
              }}
            >
              <AppRoutes />
            </div>
          </ToastProvider>
        </AuthProvider>
      </PrototypeProvider>
    </BrowserRouter>
  );
};

export default App;
