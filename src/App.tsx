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
              <PrototypeToolbar />
              <ViewportContainer>
                <AppRoutes />
              </ViewportContainer>
            </div>
          </ToastProvider>
        </AuthProvider>
      </PrototypeProvider>
    </BrowserRouter>
  );
};

export default App;
