import React from 'react';
import { PrototypeProvider } from './context/PrototypeContext';
import { AuthProvider, useAuth } from './context/AuthContext';
import { PrototypeToolbar } from './components/prototype/PrototypeToolbar';
import { ViewportContainer } from './components/prototype/ViewportContainer';
import { OnboardingFlow } from './components/auth/onboarding/OnboardingFlow';
import { LoginScreen } from './components/auth/login/LoginScreen';
import { ResidentShell } from './components/resident/ResidentShell';
import { SecretaryShell } from './components/secretary/SecretaryShell';
import { GuardShell } from './components/guard/GuardShell';

import './styles/global.css';

const AppContent: React.FC = () => {
  const { step, isAuthenticated, currentUser, selectedRole } = useAuth();

  const renderCurrentView = () => {
    if (!isAuthenticated || step === 'onboarding' || step === 'login' || step === 'verify') {
      if (step === 'onboarding') {
        return <OnboardingFlow />;
      }
      return <LoginScreen />;
    }

    const activeRole = currentUser?.role || selectedRole;

    switch (activeRole) {
      case 'resident':
        return <ResidentShell />;
      case 'secretary':
        return <SecretaryShell />;
      case 'guard':
        return <GuardShell />;
      default:
        return <ResidentShell />;
    }
  };

  return <ViewportContainer>{renderCurrentView()}</ViewportContainer>;
};

export const App: React.FC = () => {
  return (
    <PrototypeProvider>
      <AuthProvider>
        <div style={{ display: 'flex', flexDirection: 'column', minHeight: '100vh', width: '100%' }}>
          <PrototypeToolbar />
          <AppContent />
        </div>
      </AuthProvider>
    </PrototypeProvider>
  );
};

export default App;
