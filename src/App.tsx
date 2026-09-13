import React from 'react';
import { BrowserRouter } from 'react-router-dom';
import { PrototypeProvider } from './context/PrototypeContext';
import { AuthProvider } from './context/AuthContext';
import { PrototypeToolbar } from './components/prototype/PrototypeToolbar';
import { ViewportContainer } from './components/prototype/ViewportContainer';
import { ToastProvider } from './context/ToastContext';
import { AppRoutes } from './routes';
import './styles/global.css';

export const App: React.FC = () => {
  return (
    <BrowserRouter>
      <PrototypeProvider>
        <AuthProvider>
          <ToastProvider>
            <div style={{ display: 'flex', flexDirection: 'column', minHeight: '100vh', width: '100%' }}>
              {/* Hide PrototypeToolbar and Viewport on native platforms (Capacitor) or small screens if preferred, 
                  but for now we'll rely on checking window.Capacitor (added by Capacitor) */}
              {!(window as any).Capacitor?.isNative ? (
                <>
                  <PrototypeToolbar />
                  <ViewportContainer>
                    <AppRoutes />
                  </ViewportContainer>
                </>
              ) : (
                <div style={{ flex: 1, display: 'flex', flexDirection: 'column', width: '100%', height: '100%', overflow: 'auto' }}>
                   <AppRoutes />
                </div>
              )}
            </div>
          </ToastProvider>
        </AuthProvider>
      </PrototypeProvider>
    </BrowserRouter>
  );
};

export default App;
