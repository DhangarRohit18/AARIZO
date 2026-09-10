import React from 'react';
import type { CommunityEvent, EventRSVPStatus } from '../../../domains/community';
import { MapPin, Clock, Users, Check, HelpCircle, X } from 'lucide-react';
import '../resident.css';
import './community.css';

export interface EventCardProps {
  event: CommunityEvent;
  onRsvpChange?: (eventId: string, status: EventRSVPStatus) => void;
  onClick?: (event: CommunityEvent) => void;
}

export const EventCard: React.FC<EventCardProps> = ({
  event,
  onRsvpChange,
  onClick,
}) => {
  // Parse date for calendar badge (e.g. "15 Sep 2026")
  const dateParts = event.date.split(' ');
  const dayStr = dateParts[0] || '15';
  const monthStr = dateParts[1] || 'SEP';

  return (
    <div
      className="res-event-card"
      onClick={() => onClick && onClick(event)}
      style={{ cursor: onClick ? 'pointer' : 'default' }}
    >
      <div className="res-event-header">
        <div style={{ display: 'flex', gap: 'var(--space-3)', alignItems: 'flex-start' }}>
          <div className="res-event-date-box">
            <span className="event-date-day">{dayStr}</span>
            <span className="event-date-month">{monthStr}</span>
          </div>
          <div>
            <h4 className="res-event-title">{event.title}</h4>
            <div className="res-event-info-list" style={{ marginTop: '4px' }}>
              <div className="res-event-info-item">
                <Clock size={11} />
                <span>{event.time}</span>
              </div>
              <div className="res-event-info-item">
                <MapPin size={11} />
                <span>{event.location}</span>
              </div>
            </div>
          </div>
        </div>
      </div>

      <div className="res-event-rsvp-row" onClick={(e) => e.stopPropagation()}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '4px', fontSize: '10px', color: 'var(--color-text-muted)' }}>
          <Users size={12} />
          <span>{event.attendeesCount} Residents Attending</span>
        </div>

        <div className="res-rsvp-btns">
          <button
            className={`res-rsvp-btn ${event.userRsvp === 'going' ? 'active-going' : ''}`}
            onClick={() => onRsvpChange && onRsvpChange(event.id, 'going')}
          >
            {event.userRsvp === 'going' && <Check size={10} style={{ display: 'inline', marginRight: '2px' }} />}
            Going
          </button>
          <button
            className={`res-rsvp-btn ${event.userRsvp === 'maybe' ? 'active-maybe' : ''}`}
            onClick={() => onRsvpChange && onRsvpChange(event.id, 'maybe')}
          >
            {event.userRsvp === 'maybe' && <HelpCircle size={10} style={{ display: 'inline', marginRight: '2px' }} />}
            Maybe
          </button>
          <button
            className={`res-rsvp-btn ${event.userRsvp === 'not_going' ? 'selected' : ''}`}
            onClick={() => onRsvpChange && onRsvpChange(event.id, 'not_going')}
          >
            {event.userRsvp === 'not_going' && <X size={10} style={{ display: 'inline', marginRight: '2px' }} />}
            Declined
          </button>
        </div>
      </div>
    </div>
  );
};
