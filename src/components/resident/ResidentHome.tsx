import React, { useState } from 'react';
import { usePrototype } from '../../context/PrototypeContext';
import { ResidentHeader } from './ResidentHeader';
import { ResidentAlertCard } from './ResidentAlertCard';
import { ResidentVisitorCard } from './ResidentVisitorCard';
import { ResidentQuickActions } from './ResidentQuickActions';
import { ResidentAnnouncementCard } from './ResidentAnnouncementCard';
import { ResidentActivity } from './ResidentActivity';
import { ResidentParcelWidget } from '../../domains/deliveries/components/ResidentParcelWidget';
import { Skeleton, EmptyState, ErrorState } from '../common';

import {
  mockResidentProfile,
  mockUrgentAlert,
  mockVisitorStatus,
  mockAnnouncements,
  mockUpcomingActivities,
  mockAccountSnapshot,
} from '../../mockData/residentHomeData';
import type { UrgentAlertMock } from '../../mockData/residentHomeData';
import './resident.css';

export const ResidentHome: React.FC = () => {
  const { uiState, setResidentTab } = usePrototype();
  const [activeAlert, setActiveAlert] = useState<UrgentAlertMock | null>(mockUrgentAlert);

  // Handle Prototype UI States
  if (uiState === 'loading') {
    return (
      <div className="res-home-container">
        <div className="res-skeleton-header">
          <Skeleton height="44px" width="100%" />
          <Skeleton height="36px" width="70%" />
        </div>
        <div className="res-home-content">
          <Skeleton height="110px" width="100%" borderRadius="var(--radius-lg)" />
          <Skeleton height="160px" width="100%" borderRadius="var(--radius-lg)" />
          <Skeleton height="140px" width="100%" borderRadius="var(--radius-lg)" />
          <Skeleton height="200px" width="100%" borderRadius="var(--radius-lg)" />
        </div>
      </div>
    );
  }

  if (uiState === 'empty') {
    return (
      <div className="res-home-container">
        <ResidentHeader profile={mockResidentProfile} />
        <div className="res-home-content">
          <EmptyState
            title="All Clear on Flat 1204"
            description="You have no expected visitors today, zero pending maintenance dues, and no open helpdesk tickets."
            actionLabel="Pre-approve a Guest"
            onAction={() => setResidentTab('visitors')}
          />
        </div>
      </div>
    );
  }

  if (uiState === 'error') {
    return (
      <div className="res-home-container">
        <ResidentHeader profile={mockResidentProfile} />
        <div className="res-home-content">
          <ErrorState
            title="Could Not Load Activity Feed"
            message="A simulated timeout occurred while connecting to Lakeview Society gateway server."
            onRetry={() => window.location.reload()}
          />
        </div>
      </div>
    );
  }

  return (
    <div className="res-home-container">
      {/* 1. Header (Resident → Society → Flat) */}
      <ResidentHeader profile={mockResidentProfile} />

      <div className="res-home-content">
        {/* 2. High-Priority Contextual Alert Banner */}
        {activeAlert && (
          <ResidentAlertCard
            alert={activeAlert}
            onAction={() => setResidentTab('visitors')}
            onDismiss={() => setActiveAlert(null)}
          />
        )}

        {/* 3. Live Visitor Status Card */}
        <ResidentVisitorCard
          visitorData={mockVisitorStatus}
          onInviteVisitor={() => setResidentTab('visitors')}
        />

        {/* 3.5 Live Realtime Delivery & Parcel Room Pass Widget */}
        <ResidentParcelWidget />

        {/* 4. Quick Actions Grid */}
        <ResidentQuickActions
          onActionClick={(actionId) => {
            if (actionId === 'invite_visitor' || actionId === 'delivery_pass') {
              setResidentTab('visitors');
            } else if (actionId === 'pay_maintenance') {
              setResidentTab('payments');
            } else if (actionId === 'book_amenity') {
              setResidentTab('community');
            } else if (actionId === 'raise_ticket' || actionId === 'emergency_sos') {
              setResidentTab('more');
            }
          }}
        />

        {/* 5. Society Announcement Feed */}
        <ResidentAnnouncementCard
          announcements={mockAnnouncements}
          onViewAll={() => setResidentTab('community')}
        />

        {/* 6 & 7. Upcoming Activity & Account Snapshot */}
        <ResidentActivity
          activities={mockUpcomingActivities}
          snapshot={mockAccountSnapshot}
          onPayDuesClick={() => setResidentTab('payments')}
        />
      </div>
    </div>
  );
};
