import React from 'react';
import type { CommunityEvent, EventRSVPStatus } from '../../../domains/community';
import { Button } from '../../common';
import { ArrowLeft, Calendar, Clock, Check, HelpCircle, X } from 'lucide-react';
import '../resident.css';
import './community.css';

export interface EventDetailProps {
  event: CommunityEvent;
  onBack: () => void;
  onRsvpChange: (eventId: string, status: EventRSVPStatus) => void;
}

export const EventDetail: React.FC<EventDetailProps> = ({
  event,
  onBack,
  onRsvpChange,
}) => {
  return (
    <div className="res-event-detail-container">
      {/* Header */}
      <div className="res-screen-header">
        <button className="vis-back-icon-btn" onClick={onBack} aria-label="Back">
          <ArrowLeft size={18} />
        </button>
        <div>
          <h2 className="vis-screen-title">Society Event</h2>
          <p className="vis-screen-subtitle">Organizer: {event.organizer}</p>
        </div>
      </div>

      {/* Main Event Detail Card */}
      <div className="res-detail-card">
        <h2 style={{ fontSize: '16px', fontWeight: 800, color: 'var(--color-text)', margin: 0 }}>
          {event.title}
        </h2>

        <div className="res-detail-meta-grid" style={{ gridTemplateColumns: '1fr 1fr' }}>
          <div className="res-meta-box">
            <Calendar size={16} className="meta-ic" />
            <div>
              <span className="meta-lbl">Date</span>
              <span className="meta-val">{event.date}</span>
            </div>
          </div>

          <div className="res-meta-box">
            <Clock size={16} className="meta-ic" />
            <div>
              <span className="meta-lbl">Time</span>
              <span className="meta-val">{event.time}</span>
            </div>
          </div>
        </div>

        <div className="res-detail-info-grid">
          <div className="res-info-item-row">
            <span className="info-item-lbl">Location Venue</span>
            <span className="info-item-val">{event.location}</span>
          </div>

          <div className="res-info-item-row">
            <span className="info-item-lbl">Organized By</span>
            <span className="info-item-val">{event.organizer}</span>
          </div>

          {event.contactPerson && (
            <div className="res-info-item-row">
              <span className="info-item-lbl">Contact Person</span>
              <span className="info-item-val">{event.contactPerson}</span>
            </div>
          )}

          <div className="res-info-item-row">
            <span className="info-item-lbl">RSVP Participation</span>
            <span className="info-item-val" style={{ color: 'var(--color-primary)' }}>
              {event.attendeesCount} Confirmed Attendees
            </span>
          </div>
        </div>

        {/* Description */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: '4px' }}>
          <span style={{ fontSize: '11px', fontWeight: 700, color: 'var(--color-text-muted)' }}>
            About Event
          </span>
          <p style={{ fontSize: '12px', color: 'var(--color-text)', lineHeight: 1.45, margin: 0 }}>
            {event.description}
          </p>
        </div>

        {/* RSVP Interaction Buttons */}
        <div style={{ marginTop: '12px', paddingTop: '12px', borderTop: '1px solid var(--color-border-subtle)', display: 'flex', flexDirection: 'column', gap: '8px' }}>
          <span style={{ fontSize: '11px', fontWeight: 700, color: 'var(--color-text-muted)' }}>
            Your Attendance Status
          </span>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '6px' }}>
            <Button
              variant={event.userRsvp === 'going' ? 'primary' : 'outline'}
              size="sm"
              onClick={() => onRsvpChange(event.id, 'going')}
              leftIcon={<Check size={14} />}
            >
              Going
            </Button>
            <Button
              variant={event.userRsvp === 'maybe' ? 'primary' : 'outline'}
              size="sm"
              onClick={() => onRsvpChange(event.id, 'maybe')}
              leftIcon={<HelpCircle size={14} />}
            >
              Maybe
            </Button>
            <Button
              variant={event.userRsvp === 'not_going' ? 'danger' : 'outline'}
              size="sm"
              onClick={() => onRsvpChange(event.id, 'not_going')}
              leftIcon={<X size={14} />}
            >
              Declined
            </Button>
          </div>
        </div>
      </div>

      <Button variant="outline" fullWidth onClick={onBack}>
        Back to Community
      </Button>
    </div>
  );
};
