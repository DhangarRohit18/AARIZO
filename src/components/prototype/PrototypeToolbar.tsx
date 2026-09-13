import React from 'react';
import { useNavigate } from 'react-router-dom';
import { usePrototype } from '../../context/PrototypeContext';
import { useAuth } from '../../context/AuthContext';
import {
  Smartphone,
  Tablet,
  Monitor,
  Maximize2,
  Tag,
  Layers,
  RotateCcw,
  LogOut,
} from 'lucide-react';
import './prototype.css';

export const PrototypeToolbar: React.FC = () => {
  const navigate = useNavigate();
  const {
    viewport,
    setViewport,
    uiState,
    setUiState,
    roadmapFilter,
    setRoadmapFilter,
  } = usePrototype();

  const {
    selectedRole,
    switchRole,
    resetOnboarding,
    logout,
    isAuthenticated,
  } = useAuth();

  const handleRoleSwitch = (role: string) => {
    switchRole(role as any);
    const r = role.toUpperCase();
    if (r === 'SOCIETY_ADMIN' || r === 'SECRETARY') navigate('/admin');
    else if (r === 'SECURITY' || r === 'SECURITY_GUARD' || r === 'GUARD') navigate('/security');
    else if (r === 'SUPER_ADMIN') navigate('/super-admin');
    else if (r === 'COMMITTEE_MEMBER') navigate('/committee');
    else if (r === 'FACILITY_MANAGER') navigate('/facility');
    else if (r === 'DOMESTIC_WORKER') navigate('/domestic');
    else if (r === 'VENDOR') navigate('/vendor');
    else if (r === 'SERVICE_PROVIDER') navigate('/service-provider');
    else navigate('/resident');
  };

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  const handleResetOnboarding = () => {
    resetOnboarding();
    navigate('/onboarding');
  };

  return (
    <header className="prototype-toolbar">
      {/* Brand & Laboratory Title */}
      <div className="prototype-brand">
        <span className="prototype-logo-badge">PROD</span>
        <div>
          <h1 className="prototype-title">AARIZO</h1>
          <span className="prototype-subtitle">Multi-Tenant Role System & Dashboard Suite</span>
        </div>
      </div>

      <div className="prototype-toolbar-controls">
        {/* Shared Auth & Role Switcher */}
        <div className="control-group">
          <span className="control-label">Switch Persona / Role</span>
          <div className="control-select-wrapper">
            <select
              value={selectedRole}
              onChange={(e) => handleRoleSwitch(e.target.value)}
              className="prototype-select font-bold"
            >
              <option value="RESIDENT">RESIDENT</option>
              <option value="SOCIETY_ADMIN">SOCIETY ADMIN</option>
              <option value="COMMITTEE_MEMBER">COMMITTEE MEMBER</option>
              <option value="SECURITY_GUARD">SECURITY GUARD</option>
              <option value="FACILITY_MANAGER">FACILITY MANAGER</option>
              <option value="VENDOR">VENDOR</option>
              <option value="SERVICE_PROVIDER">SERVICE PROVIDER</option>
              <option value="DOMESTIC_WORKER">DOMESTIC WORKER</option>
              <option value="SUPER_ADMIN">SUPER ADMIN</option>
            </select>
          </div>
        </div>


        {/* Viewport Frame Switcher */}
        <div className="control-group">
          <span className="control-label">Viewport</span>
          <div className="control-icon-toggle">
            <button
              className={`icon-toggle-btn ${viewport === 'mobile' ? 'active' : ''}`}
              onClick={() => setViewport('mobile')}
              title="Mobile Viewport (375px)"
            >
              <Smartphone size={15} />
            </button>
            <button
              className={`icon-toggle-btn ${viewport === 'tablet' ? 'active' : ''}`}
              onClick={() => setViewport('tablet')}
              title="Tablet Viewport (768px)"
            >
              <Tablet size={15} />
            </button>
            <button
              className={`icon-toggle-btn ${viewport === 'desktop' ? 'active' : ''}`}
              onClick={() => setViewport('desktop')}
              title="Desktop Viewport (1440px)"
            >
              <Monitor size={15} />
            </button>
            <button
              className={`icon-toggle-btn ${viewport === 'fluid' ? 'active' : ''}`}
              onClick={() => setViewport('fluid')}
              title="Fluid / Full Width"
            >
              <Maximize2 size={15} />
            </button>
          </div>
        </div>

        {/* Auth Reset & Logout Actions */}
        <div className="control-group">
          <span className="control-label">Auth Controls</span>
          <div className="control-pill-toggle">
            <button
              className="pill-btn"
              onClick={handleResetOnboarding}
              title="Reset to Onboarding Carousel"
            >
              <RotateCcw size={13} />
              <span>Onboarding</span>
            </button>

            {isAuthenticated && (
              <button
                className="pill-btn"
                onClick={handleLogout}
                title="Log Out to Login Screen"
              >
                <LogOut size={13} />
                <span>Logout</span>
              </button>
            )}
          </div>
        </div>

        {/* Simulated UI State Selector */}
        <div className="control-group">
          <span className="control-label">Simulated UI State</span>
          <div className="control-select-wrapper">
            <Layers size={13} className="select-icon" />
            <select
              value={uiState}
              onChange={(e) => setUiState(e.target.value as any)}
              className="prototype-select"
            >
              <option value="success">Success / Normal</option>
              <option value="loading">Loading State</option>
              <option value="empty">Empty State</option>
              <option value="error">Error State</option>
            </select>
          </div>
        </div>

        {/* Roadmap Tag Filter */}
        <div className="control-group">
          <span className="control-label">Roadmap Filter</span>
          <div className="control-select-wrapper">
            <Tag size={13} className="select-icon" />
            <select
              value={roadmapFilter}
              onChange={(e) => setRoadmapFilter(e.target.value as any)}
              className="prototype-select"
            >
              <option value="ALL">All Roadmap Modules</option>
              <option value="MVP">MVP Only</option>
              <option value="V1">V1 Modules</option>
              <option value="V2 Preview">V2 Previews</option>
            </select>
          </div>
        </div>
      </div>
    </header>
  );
};
