import React, { createContext, useContext, useState } from 'react';

export type UIStateType = 'success' | 'loading' | 'empty' | 'error';
export type GuardOfflineStatus = 'online' | 'offline' | 'syncing' | 'synced' | 'conflict';

export type ResidentTab = 'home' | 'community' | 'services' | 'activity' | 'profile';
export type GuardTab = 'gate' | 'visitors' | 'parcels' | 'parking' | 'safety';
export type AdminNav =
  | 'overview'
  | 'operations'
  | 'approvals'
  | 'reports'
  | 'profile';

interface PrototypeContextType {
  uiState: UIStateType;
  setUiState: (state: UIStateType) => void;
  guardOfflineState: GuardOfflineStatus;
  setGuardOfflineState: (status: GuardOfflineStatus) => void;
  residentTab: ResidentTab;
  setResidentTab: (tab: ResidentTab) => void;
  guardTab: GuardTab;
  setGuardTab: (tab: GuardTab) => void;
  adminNav: AdminNav;
  setAdminNav: (nav: AdminNav) => void;
}

const PrototypeContext = createContext<PrototypeContextType | undefined>(undefined);

export const PrototypeProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [uiState, setUiState] = useState<UIStateType>('success');
  const [guardOfflineState, setGuardOfflineState] = useState<GuardOfflineStatus>('online');
  const [residentTab, setResidentTab] = useState<ResidentTab>('home');
  const [guardTab, setGuardTab] = useState<GuardTab>('gate');
  const [adminNav, setAdminNav] = useState<AdminNav>('overview');

  return (
    <PrototypeContext.Provider
      value={{
        uiState,
        setUiState,
        guardOfflineState,
        setGuardOfflineState,
        residentTab,
        setResidentTab,
        guardTab,
        setGuardTab,
        adminNav,
        setAdminNav,
      }}
    >
      {children}
    </PrototypeContext.Provider>
  );
};

export const usePrototype = () => {
  const context = useContext(PrototypeContext);
  if (!context) {
    throw new Error('usePrototype must be used within a PrototypeProvider');
  }
  return context;
};
