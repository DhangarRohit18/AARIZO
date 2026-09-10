import React, { useState } from 'react';
import { SupportHome } from '../support/SupportHome';
import { SafetyHome } from '../safety/SafetyHome';
import { NotificationCenter } from '../notifications/NotificationCenter';
import { ProfileHome } from '../profile/ProfileHome';
import { SettingsHome } from '../settings/SettingsHome';

import {
  User,
  Building,
  LifeBuoy,
  PlusCircle,
  AlertOctagon,
  PhoneCall,
  Bell,
  Sliders,
  ChevronRight,
} from 'lucide-react';
import '../resident.css';
import './more.css';

export interface MoreHomeProps {
  onNavigateToTab?: (tab: 'home' | 'visitors' | 'community' | 'payments' | 'more') => void;
}

type MoreSubView = 'main' | 'support' | 'safety' | 'notifications' | 'profile' | 'settings';

export const MoreHome: React.FC<MoreHomeProps> = ({ onNavigateToTab }) => {
  const [subView, setSubView] = useState<MoreSubView>('main');

  if (subView === 'support') {
    return <SupportHome onBackToMore={() => setSubView('main')} />;
  }

  if (subView === 'safety') {
    return <SafetyHome onBackToMore={() => setSubView('main')} />;
  }

  if (subView === 'notifications') {
    return (
      <NotificationCenter
        onBackToMore={() => setSubView('main')}
        onNavigateToTab={(tab) => {
          if (tab === 'more') setSubView('main');
          else if (onNavigateToTab) onNavigateToTab(tab);
        }}
      />
    );
  }

  if (subView === 'profile') {
    return <ProfileHome onBackToMore={() => setSubView('main')} />;
  }

  if (subView === 'settings') {
    return <SettingsHome onBackToMore={() => setSubView('main')} />;
  }

  return (
    <div className="res-more-container">
      {/* Header */}
      <div className="res-more-header">
        <h2 className="vis-screen-title">More & Account Hub</h2>
        <p className="vis-screen-subtitle">Manage support, safety alerts, notifications, and profile</p>
      </div>

      {/* Account Section */}
      <section className="res-more-group">
        <span className="res-group-title">ACCOUNT & RESIDENCE</span>
        <div className="res-more-card-list">
          <button className="res-more-item-btn" onClick={() => setSubView('profile')}>
            <div className="res-more-item-left">
              <div className="res-more-ic-box">
                <User size={18} />
              </div>
              <div>
                <h4 className="more-item-title">My Profile</h4>
                <p className="more-item-sub">Sarvesh Kulkarni • Owner</p>
              </div>
            </div>
            <ChevronRight size={18} className="more-arrow" />
          </button>

          <button className="res-more-item-btn" onClick={() => setSubView('profile')}>
            <div className="res-more-item-left">
              <div className="res-more-ic-box">
                <Building size={18} />
              </div>
              <div>
                <h4 className="more-item-title">Flat & Household Details</h4>
                <p className="more-item-sub">Lakeview Residency • Tower B · Flat 1204</p>
              </div>
            </div>
            <ChevronRight size={18} className="more-arrow" />
          </button>
        </div>
      </section>

      {/* Support / Helpdesk Section */}
      <section className="res-more-group">
        <span className="res-group-title">HELPDESK & SUPPORT</span>
        <div className="res-more-card-list">
          <button className="res-more-item-btn" onClick={() => setSubView('support')}>
            <div className="res-more-item-left">
              <div className="res-more-ic-box ic-support">
                <LifeBuoy size={18} />
              </div>
              <div>
                <h4 className="more-item-title">Support & My Tickets</h4>
                <p className="more-item-sub">Track active maintenance tickets & technician visits</p>
              </div>
            </div>
            <ChevronRight size={18} className="more-arrow" />
          </button>

          <button className="res-more-item-btn" onClick={() => setSubView('support')}>
            <div className="res-more-item-left">
              <div className="res-more-ic-box ic-support">
                <PlusCircle size={18} />
              </div>
              <div>
                <h4 className="more-item-title">Raise a Helpdesk Ticket</h4>
                <p className="more-item-sub">Report plumbing, electrical, or maintenance issues</p>
              </div>
            </div>
            <ChevronRight size={18} className="more-arrow" />
          </button>
        </div>
      </section>

      {/* Safety Section */}
      <section className="res-more-group">
        <span className="res-group-title">SAFETY & EMERGENCY</span>
        <div className="res-more-card-list">
          <button className="res-more-item-btn item-danger-border" onClick={() => setSubView('safety')}>
            <div className="res-more-item-left">
              <div className="res-more-ic-box ic-danger">
                <AlertOctagon size={18} />
              </div>
              <div>
                <h4 className="more-item-title text-danger">Emergency SOS Alert</h4>
                <p className="more-item-sub">Broadcast alert to Gate Security & RWA Desk</p>
              </div>
            </div>
            <ChevronRight size={18} className="more-arrow" />
          </button>

          <button className="res-more-item-btn" onClick={() => setSubView('safety')}>
            <div className="res-more-item-left">
              <div className="res-more-ic-box">
                <PhoneCall size={18} />
              </div>
              <div>
                <h4 className="more-item-title">Emergency Contacts & Guidelines</h4>
                <p className="more-item-sub">24/7 Security Intercom, Property Manager, Hospital</p>
              </div>
            </div>
            <ChevronRight size={18} className="more-arrow" />
          </button>
        </div>
      </section>

      {/* Notifications & Settings Section */}
      <section className="res-more-group">
        <span className="res-group-title">ACTIVITY & PREFERENCES</span>
        <div className="res-more-card-list">
          <button className="res-more-item-btn" onClick={() => setSubView('notifications')}>
            <div className="res-more-item-left">
              <div className="res-more-ic-box">
                <Bell size={18} />
              </div>
              <div>
                <h4 className="more-item-title">Notification Center</h4>
                <p className="more-item-sub">Visitor, payment & society announcement feed</p>
              </div>
            </div>
            <div className="res-more-right-badge">
              <span className="res-notif-pill">2 New</span>
              <ChevronRight size={18} className="more-arrow" />
            </div>
          </button>

          <button className="res-more-item-btn" onClick={() => setSubView('settings')}>
            <div className="res-more-item-left">
              <div className="res-more-ic-box">
                <Sliders size={18} />
              </div>
              <div>
                <h4 className="more-item-title">Settings & Privacy</h4>
                <p className="more-item-sub">Passcode masking, alert toggles & directory opt-out</p>
              </div>
            </div>
            <ChevronRight size={18} className="more-arrow" />
          </button>
        </div>
      </section>
    </div>
  );
};
