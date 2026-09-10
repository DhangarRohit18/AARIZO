import React from 'react';
import { usePrototype } from '../../context/PrototypeContext';
import { Home, Users, MessageSquare, CreditCard, Menu, Building, Bell } from 'lucide-react';
import { ResidentHome } from './ResidentHome';
import { LoadingState, EmptyState, ErrorState } from '../common';
import './resident.css';

import { VisitorHome } from './visitors/VisitorHome';
import { MoreHome } from './more/MoreHome';
import { PaymentsHome } from './payments/PaymentsHome';
import { CommunityHome } from './community/CommunityHome';

export const ResidentShell: React.FC = () => {
  const { residentTab, setResidentTab, uiState } = usePrototype();

  const renderContent = () => {
    // If on home tab, ResidentHome handles internal UI states cleanly
    if (residentTab === 'home') {
      return <ResidentHome />;
    }

    if (residentTab === 'visitors') {
      return <VisitorHome />;
    }

    if (residentTab === 'community') {
      return <CommunityHome />;
    }

    if (residentTab === 'payments') {
      return <PaymentsHome />;
    }

    if (residentTab === 'more') {
      return <MoreHome onNavigateToTab={(tab) => setResidentTab(tab)} />;
    }

    if (uiState === 'loading') {
      return <LoadingState message="Simulating Resident App data fetch..." />;
    }
    if (uiState === 'empty') {
      return (
        <EmptyState
          title="No Active Resident Data"
          description="There are currently no active visitor requests, pending bills, or announcements for Flat 1204."
        />
      );
    }
    if (uiState === 'error') {
      return (
        <ErrorState
          title="Connection Failure"
          message="Simulated connection failure to CommunityOS Resident Gateway API."
          onRetry={() => {}}
        />
      );
    }

    return null;
  };

  return (
    <div className="resident-app-container">
      {/* For non-home/visitors/community/payments/more placeholder tabs, show simple property context header */}
      {residentTab !== 'home' &&
        residentTab !== 'visitors' &&
        residentTab !== 'community' &&
        residentTab !== 'payments' &&
        residentTab !== 'more' && (
        <header className="resident-header">
          <div className="resident-property-picker">
            <Building size={18} className="property-icon" />
            <div>
              <div className="property-name">Green Valley Society</div>
              <div className="property-flat">Tower B · Flat 1204</div>
            </div>
          </div>
          <button className="resident-bell-btn" aria-label="Notifications">
            <Bell size={18} />
            <span className="bell-badge-dot" />
          </button>
        </header>
      )}

      {/* Main Viewport Content Area */}
      <main className={`resident-main ${residentTab === 'home' ? 'resident-home-tab-main' : ''}`}>
        {renderContent()}
      </main>

      {/* Blueprint Approved Bottom Navigation Bar */}
      <nav className="resident-bottom-nav">
        <button
          className={`nav-item ${residentTab === 'home' ? 'nav-active' : ''}`}
          onClick={() => setResidentTab('home')}
        >
          <Home size={20} />
          <span>Home</span>
        </button>
        <button
          className={`nav-item ${residentTab === 'visitors' ? 'nav-active' : ''}`}
          onClick={() => setResidentTab('visitors')}
        >
          <Users size={20} />
          <span>Visitors</span>
        </button>
        <button
          className={`nav-item ${residentTab === 'community' ? 'nav-active' : ''}`}
          onClick={() => setResidentTab('community')}
        >
          <MessageSquare size={20} />
          <span>Community</span>
        </button>
        <button
          className={`nav-item ${residentTab === 'payments' ? 'nav-active' : ''}`}
          onClick={() => setResidentTab('payments')}
        >
          <CreditCard size={20} />
          <span>Payments</span>
        </button>
        <button
          className={`nav-item ${residentTab === 'more' ? 'nav-active' : ''}`}
          onClick={() => setResidentTab('more')}
        >
          <Menu size={20} />
          <span>More</span>
        </button>
      </nav>
    </div>
  );
};
