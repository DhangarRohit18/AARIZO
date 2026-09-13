import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { usePrototype } from '../../context/PrototypeContext';
import { ResidentAlertCard } from './ResidentAlertCard';
import { ResidentVisitorCard } from './ResidentVisitorCard';
import { ResidentQuickActions } from './ResidentQuickActions';
import { ResidentAnnouncementCard } from './ResidentAnnouncementCard';
import { ResidentActivity } from './ResidentActivity';
import { ResidentParcelWidget } from '../../domains/deliveries/components/ResidentParcelWidget';
import { Skeleton, EmptyState, ErrorState } from '../common';

import {
  mockUrgentAlert,
  mockVisitorStatus,
  mockAnnouncements,
  mockUpcomingActivities,
  mockAccountSnapshot,
} from '../../mockData/residentHomeData';
import type { UrgentAlertMock } from '../../mockData/residentHomeData';
import './resident.css';

export const ResidentHome: React.FC = () => {
  const { uiState } = usePrototype();
  const navigate = useNavigate();
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
        <div className="res-home-content">
          <EmptyState
            title="All Clear on Flat 1204"
            description="You have no expected visitors today, zero pending maintenance dues, and no open helpdesk tickets."
            actionLabel="Pre-approve a Guest"
            onAction={() => navigate('/resident/visitors')}
          />
        </div>
      </div>
    );
  }

  if (uiState === 'error') {
    return (
      <div className="res-home-container">
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
      <div className="res-home-content">
        {/* 2. High-Priority Contextual Alert Banner */}
        {activeAlert && (
          <ResidentAlertCard
            alert={activeAlert}
            onAction={() => navigate('/resident/visitors')}
            onDismiss={() => setActiveAlert(null)}
          />
        )}

        {/* 3. Live Visitor Status Card */}
        <ResidentVisitorCard
          visitorData={mockVisitorStatus}
          onInviteVisitor={() => navigate('/resident/visitors')}
        />

        {/* 3.5 Live Realtime Delivery & Parcel Room Pass Widget */}
        <ResidentParcelWidget />

        {/* 4. Quick Actions Grid */}
        <ResidentQuickActions
          onActionClick={(actionId) => {
            if (actionId === 'invite_visitor' || actionId === 'delivery_pass') {
              navigate('/resident/visitors');
            } else if (actionId === 'pay_maintenance') {
              navigate('/resident/billing');
            } else if (actionId === 'book_amenity') {
              navigate('/resident/amenities');
            } else if (actionId === 'raise_ticket') {
              navigate('/resident/requests');
            } else if (actionId === 'emergency_sos') {
              navigate('/resident/emergency');
            }
          }}
        />

        {/* 5. Society Announcement Feed */}
        <ResidentAnnouncementCard
          announcements={mockAnnouncements}
          onViewAll={() => navigate('/resident/community')}
        />

        {/* 6 & 7. Upcoming Activity & Account Snapshot */}
        <ResidentActivity
          activities={mockUpcomingActivities}
          snapshot={mockAccountSnapshot}
          onPayDuesClick={() => navigate('/resident/billing')}
        />
      </div>
    </div>
  );
};
