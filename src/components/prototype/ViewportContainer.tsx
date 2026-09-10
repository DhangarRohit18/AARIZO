import React from 'react';
import { usePrototype } from '../../context/PrototypeContext';
import './prototype.css';

export const ViewportContainer: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const { viewport, currentApp } = usePrototype();

  return (
    <div className="prototype-workspace">
      <div className={`viewport-frame frame-${viewport} app-frame-${currentApp}`}>
        <div className="viewport-header-bar">
          <div className="window-dots">
            <span className="dot dot-red" />
            <span className="dot dot-yellow" />
            <span className="dot dot-green" />
          </div>
          <div className="viewport-title-bar">
            <span>
              {currentApp === 'resident' && 'CommunityOS Resident Portal (Simulated Device)'}
              {currentApp === 'guard' && 'CommunityOS Security Gate Hub (Simulated Tablet)'}
              {currentApp === 'admin' && 'CommunityOS Operations Dashboard (Desktop Web)'}
            </span>
          </div>
          <div className="viewport-resolution-indicator">
            {viewport === 'mobile' && '375px × 812px'}
            {viewport === 'tablet' && '768px × 1024px'}
            {viewport === 'desktop' && '1440px × 900px'}
            {viewport === 'fluid' && 'Fluid (100%)'}
          </div>
        </div>
        <div className="viewport-screen-content">{children}</div>
      </div>
    </div>
  );
};
