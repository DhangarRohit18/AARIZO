import React from 'react';
import { Building, Bell, ChevronDown } from 'lucide-react';
import { Avatar } from '../common';
import type { ResidentProfileMock } from '../../mockData/residentHomeData';
import './resident.css';

export interface ResidentHeaderProps {
  profile: ResidentProfileMock;
  onNotificationClick?: () => void;
  onProfileClick?: () => void;
}

export const ResidentHeader: React.FC<ResidentHeaderProps> = ({
  profile,
  onNotificationClick,
  onProfileClick,
}) => {
  return (
    <header className="res-header">
      <div className="res-header-top">
        {/* Resident Identity & Greeting */}
        <div className="res-profile-trigger" onClick={onProfileClick}>
          <Avatar name={profile.name} size="md" status="online" src={profile.avatarUrl} />
          <div>
            <div className="res-greeting">{profile.greeting},</div>
            <h1 className="res-user-name">{profile.name}</h1>
          </div>
        </div>

        {/* Notification Bell */}
        <button
          className="res-icon-btn"
          aria-label="Notifications"
          onClick={onNotificationClick}
        >
          <Bell size={20} />
          {profile.unreadNotifications > 0 && (
            <span className="res-badge-count">{profile.unreadNotifications}</span>
          )}
        </button>
      </div>

      {/* Society Context Pill (Resident → Society → Flat) */}
      <div className="res-society-pill">
        <Building size={15} className="res-society-icon" />
        <div className="res-society-details">
          <span className="res-society-name">{profile.societyName}</span>
          <span className="res-flat-context">
            {profile.tower} · {profile.flatNumber}
          </span>
        </div>
        <ChevronDown size={14} className="res-society-arrow" />
      </div>
    </header>
  );
};
