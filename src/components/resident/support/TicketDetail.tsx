import React from 'react';
import type { SupportTicket } from '../../../domains/support';
import { getTicketStatusBadgeVariant, getTicketStatusLabel, getTicketCategoryLabel } from '../../../domains/support';
import { StatusBadge, Button } from '../../common';
import { ArrowLeft, Clock, User, MapPin, LifeBuoy } from 'lucide-react';
import '../resident.css';
import '../more/more.css';

export interface TicketDetailProps {
  ticket: SupportTicket;
  onBack: () => void;
}

export const TicketDetail: React.FC<TicketDetailProps> = ({ ticket, onBack }) => {
  const badgeVariant = getTicketStatusBadgeVariant(ticket.status);

  return (
    <div className="res-ticket-detail-container">
      <div className="res-screen-header">
        <button className="vis-back-icon-btn" onClick={onBack} aria-label="Back to Tickets">
          <ArrowLeft size={18} />
        </button>
        <div>
          <span className="res-ticket-id-badge">{ticket.ticketNumber}</span>
          <h2 className="vis-screen-title">{ticket.subject}</h2>
        </div>
      </div>

      <div className="res-detail-card">
        <div className="res-detail-status-row">
          <span className="res-category-tag">{getTicketCategoryLabel(ticket.category)}</span>
          <StatusBadge
            status={badgeVariant === 'warning' ? 'pending' : badgeVariant === 'info' ? 'syncing' : badgeVariant === 'success' ? 'resolved' : 'offline'}
            label={getTicketStatusLabel(ticket.status)}
          />
        </div>

        <div className="res-detail-description">
          <h4>Description</h4>
          <p>{ticket.description}</p>
        </div>

        <div className="res-detail-meta-grid">
          <div className="res-meta-box">
            <MapPin size={14} className="meta-ic" />
            <div>
              <span className="meta-lbl">Location / Area</span>
              <span className="meta-val">{ticket.locationArea || 'Flat 1204'}</span>
            </div>
          </div>

          <div className="res-meta-box">
            <Clock size={14} className="meta-ic" />
            <div>
              <span className="meta-lbl">Created Date</span>
              <span className="meta-val">{ticket.createdAt}</span>
            </div>
          </div>

          <div className="res-meta-box">
            <User size={14} className="meta-ic" />
            <div>
              <span className="meta-lbl">Assigned Staff</span>
              <span className="meta-val">{ticket.assignedStaffName || 'Unassigned (In Dispatch)'}</span>
            </div>
          </div>
        </div>
      </div>

      {/* Timeline Updates Log */}
      <div className="res-ticket-timeline-section">
        <h3 className="res-section-heading">Updates & Timeline</h3>
        <div className="res-timeline-list">
          {ticket.updates.map((up) => (
            <div key={up.id} className="res-timeline-item">
              <div className="res-timeline-dot" />
              <div className="res-timeline-content">
                <div className="res-timeline-top">
                  <span className="res-author-name">{up.authorName} ({up.authorRole.toUpperCase()})</span>
                  <span className="res-timeline-time">{up.timestamp}</span>
                </div>
                <p className="res-timeline-msg">{up.message}</p>
              </div>
            </div>
          ))}
        </div>
      </div>

      <Button variant="outline" fullWidth onClick={onBack} leftIcon={<LifeBuoy size={16} />}>
        Back to Support Tickets
      </Button>
    </div>
  );
};
