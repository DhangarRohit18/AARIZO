import React, { createContext, useContext, useState } from 'react';

export type AppType = 'resident' | 'guard' | 'admin';
export type ViewportMode = 'mobile' | 'tablet' | 'desktop' | 'fluid';
export type RoadmapTag = 'MVP' | 'V1' | 'V2 Preview';
export type UIStateType = 'success' | 'loading' | 'empty' | 'error';
export type GuardOfflineStatus = 'online' | 'offline' | 'syncing' | 'synced' | 'conflict';

export type ResidentTab = 'home' | 'visitors' | 'community' | 'payments' | 'more';
export type GuardTab = 'home' | 'visitors' | 'community' | 'payments' | 'more';
export type AdminNav =
  | 'dashboard'
  | 'society'
  | 'audit'
  | 'finance'
  | 'helpdesk'
  | 'announcements'
  | 'v1-modules'
  | 'v2-preview';

interface PrototypeContextType {
  currentApp: AppType;
  setCurrentApp: (app: AppType) => void;
  viewport: ViewportMode;
  setViewport: (vp: ViewportMode) => void;
  uiState: UIStateType;
  setUiState: (state: UIStateType) => void;
  roadmapFilter: RoadmapTag | 'ALL';
  setRoadmapFilter: (tag: RoadmapTag | 'ALL') => void;
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
  const [currentApp, setCurrentApp] = useState<AppType>('resident');
  const [viewport, setViewport] = useState<ViewportMode>(
    typeof window !== 'undefined' && window.innerWidth < 768 ? 'fluid' : 'mobile'
  );
  const [uiState, setUiState] = useState<UIStateType>('success');
  const [roadmapFilter, setRoadmapFilter] = useState<RoadmapTag | 'ALL'>('ALL');
  const [guardOfflineState, setGuardOfflineState] = useState<GuardOfflineStatus>('online');

  const [residentTab, setResidentTab] = useState<ResidentTab>('home');
  const [guardTab, setGuardTab] = useState<GuardTab>('home');
  const [adminNav, setAdminNav] = useState<AdminNav>('dashboard');

  const handleAppChange = (app: AppType) => {
    setCurrentApp(app);
    // Set appropriate default viewport when switching apps
    if (app === 'resident') setViewport('mobile');
    else if (app === 'guard') setViewport('tablet');
    else if (app === 'admin') setViewport('desktop');
  };

  return (
    <PrototypeContext.Provider
      value={{
        currentApp,
        setCurrentApp: handleAppChange,
        viewport,
        setViewport,
        uiState,
        setUiState,
        roadmapFilter,
        setRoadmapFilter,
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
