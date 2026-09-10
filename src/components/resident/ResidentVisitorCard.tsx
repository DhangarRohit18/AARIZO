import React, { useState } from 'react';
import { UserCheck, QrCode, ArrowRight, ShieldCheck, Clock, UserPlus, Eye, EyeOff } from 'lucide-react';
import type { VisitorStatusMock } from '../../mockData/residentHomeData';
import { StatusBadge } from '../common';
import './resident.css';

export interface ResidentVisitorCardProps {
  visitorData: VisitorStatusMock;
  onViewVisitors?: () => void;
  onInviteVisitor?: () => void;
}

export const ResidentVisitorCard: React.FC<ResidentVisitorCardProps> = ({
  visitorData,
  onViewVisitors,
  onInviteVisitor,
}) => {
  const { expectedTodayCount, activeVisitor } = visitorData;
  const [showPasscode, setShowPasscode] = useState(false);

  return (
    <div className="res-visitor-card">
      <div className="res-card-top">
        <div className="res-card-title-group">
          <UserCheck size={18} className="res-card-icon" />
          <span className="res-card-heading">Today's Visitors</span>
        </div>
        <span className="res-visitor-counter">
          {expectedTodayCount > 0 ? `${expectedTodayCount} Scheduled` : 'No expected visitors'}
        </span>
      </div>

      {activeVisitor ? (
        <div className="res-visitor-details">
          <div className="res-visitor-main">
            <div className="res-visitor-avatar">
              {activeVisitor.name.substring(0, 2).toUpperCase()}
            </div>
            <div className="res-visitor-meta">
              <div className="res-visitor-name-row">
                <h4 className="res-visitor-name">{activeVisitor.name}</h4>
                <StatusBadge status={activeVisitor.status === 'expected' ? 'pending' : 'active'} label={activeVisitor.status.replace('_', ' ')} />
              </div>
              <div className="res-visitor-sub">
                <Clock size={12} />
                <span>{activeVisitor.expectedTime}</span>
              </div>
            </div>
          </div>

          {activeVisitor.passcode && (
            <div className="res-passcode-compact">
              <div className="res-passcode-left">
                <QrCode size={15} className="passcode-icon" />
                <span>Entry Passcode</span>
              </div>
              <div className="res-passcode-reveal-area">
                {showPasscode ? (
                  <span className="res-passcode-code">{activeVisitor.passcode}</span>
                ) : (
                  <span className="res-passcode-masked">••••</span>
                )}
                <button
                  className="res-passcode-toggle-btn"
                  onClick={() => setShowPasscode(!showPasscode)}
                  title={showPasscode ? 'Hide Passcode' : 'Show Passcode'}
                >
                  {showPasscode ? <EyeOff size={14} /> : <Eye size={14} />}
                  <span>{showPasscode ? 'Hide Pass' : 'Show Pass'}</span>
                </button>
              </div>
            </div>
          )}

          <div className="res-visitor-actions">
            <button className="res-btn-secondary" onClick={onViewVisitors}>
              <span>View All Visitors</span>
              <ArrowRight size={14} />
            </button>
          </div>
        </div>
      ) : (
        <div className="res-visitor-empty">
          <ShieldCheck size={28} className="res-empty-ic" />
          <p className="res-empty-text">No active or expected guests for your flat right now.</p>
          <button className="res-btn-primary-sm" onClick={onInviteVisitor}>
            <UserPlus size={14} />
            <span>Pre-approve Guest Entry</span>
          </button>
        </div>
      )}
    </div>
  );
};
