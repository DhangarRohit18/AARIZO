import React, { useState } from 'react';
import { usePrototype } from '../../../context/PrototypeContext';
import type {
  CommunityAnnouncement,
  CommunityEvent,
  EventRSVPStatus,
  Poll,
} from '../../../domains/community';
import {
  mockAnnouncements,
  mockEvents,
  mockPolls,
} from '../../../mockData/community';
import { AnnouncementCard } from './AnnouncementCard';
import { AnnouncementDetail } from './AnnouncementDetail';
import { EventCard } from './EventCard';
import { EventDetail } from './EventDetail';
import { PollCard } from './PollCard';
import { LoadingState, EmptyState, ErrorState, Tabs } from '../../common';
import { MessageSquare } from 'lucide-react';
import '../resident.css';
import './community.css';

export interface CommunityHomeProps {
  initialAnnouncementId?: string;
}

type CommunitySubView = 'main' | 'announcement_detail' | 'event_detail';

export const CommunityHome: React.FC<CommunityHomeProps> = ({
  initialAnnouncementId,
}) => {
  const { uiState } = usePrototype();

  // Local state datasets
  const [announcementsList, setAnnouncementsList] =
    useState<CommunityAnnouncement[]>(mockAnnouncements);
  const [eventsList, setEventsList] = useState<CommunityEvent[]>(mockEvents);
  const [pollsList, setPollsList] = useState<Poll[]>(mockPolls);

  const [activeTab, setActiveTab] = useState<
    'all' | 'announcements' | 'events' | 'polls'
  >('all');

  const [subView, setSubView] = useState<CommunitySubView>(() => {
    return initialAnnouncementId ? 'announcement_detail' : 'main';
  });

  const [selectedAnnouncement, setSelectedAnnouncement] =
    useState<CommunityAnnouncement | null>(() => {
      if (initialAnnouncementId) {
        return (
          mockAnnouncements.find((a) => a.id === initialAnnouncementId) || null
        );
      }
      return null;
    });

  const [selectedEvent, setSelectedEvent] = useState<CommunityEvent | null>(
    null
  );

  // Prototype UI States
  if (uiState === 'loading') {
    return <LoadingState message="Fetching society notices, events & community polls..." />;
  }

  if (uiState === 'empty') {
    return (
      <div className="res-community-container">
        <div className="res-screen-header">
          <div>
            <h2 className="vis-screen-title">Community & Notices</h2>
            <p className="vis-screen-subtitle">Lakeview Residency Society Hub</p>
          </div>
        </div>
        <EmptyState
          title="No Active Announcements"
          description="There are currently no active notices, scheduled events, or open polls."
          icon={<MessageSquare size={36} />}
        />
      </div>
    );
  }

  if (uiState === 'error') {
    return (
      <div className="res-community-container">
        <ErrorState
          title="Community Gateway Unavailable"
          message="Simulated connection timeout while fetching society notice board."
          onRetry={() => window.location.reload()}
        />
      </div>
    );
  }

  // Handle Mark Announcement as Read
  const handleMarkAnnouncementRead = (id: string) => {
    setAnnouncementsList((prev) =>
      prev.map((a) => (a.id === id ? { ...a, isRead: true } : a))
    );
    if (selectedAnnouncement && selectedAnnouncement.id === id) {
      setSelectedAnnouncement((prev) => (prev ? { ...prev, isRead: true } : prev));
    }
  };

  // Handle Event RSVP Change
  const handleEventRsvpChange = (eventId: string, newStatus: EventRSVPStatus) => {
    setEventsList((prev) =>
      prev.map((ev) => {
        if (ev.id === eventId) {
          const oldRsvp = ev.userRsvp;
          let diff = 0;
          if (oldRsvp !== 'going' && newStatus === 'going') diff = 1;
          else if (oldRsvp === 'going' && newStatus !== 'going') diff = -1;

          return {
            ...ev,
            userRsvp: newStatus,
            attendeesCount: Math.max(0, ev.attendeesCount + diff),
          };
        }
        return ev;
      })
    );

    if (selectedEvent && selectedEvent.id === eventId) {
      setSelectedEvent((prev) => {
        if (!prev) return null;
        const oldRsvp = prev.userRsvp;
        let diff = 0;
        if (oldRsvp !== 'going' && newStatus === 'going') diff = 1;
        else if (oldRsvp === 'going' && newStatus !== 'going') diff = -1;

        return {
          ...prev,
          userRsvp: newStatus,
          attendeesCount: Math.max(0, prev.attendeesCount + diff),
        };
      });
    }
  };

  // Handle Poll Vote Submission
  const handlePollVoteSubmit = (pollId: string, optionId: string) => {
    setPollsList((prev) =>
      prev.map((p) => {
        if (p.id === pollId) {
          const updatedOptions = p.options.map((opt) =>
            opt.id === optionId ? { ...opt, votesCount: opt.votesCount + 1 } : opt
          );
          return {
            ...p,
            totalVotes: p.totalVotes + 1,
            userVotedOptionId: optionId,
            options: updatedOptions,
          };
        }
        return p;
      })
    );
  };

  // Sub-view Renders
  if (subView === 'announcement_detail' && selectedAnnouncement) {
    return (
      <AnnouncementDetail
        announcement={selectedAnnouncement}
        onBack={() => setSubView('main')}
        onMarkRead={handleMarkAnnouncementRead}
      />
    );
  }

  if (subView === 'event_detail' && selectedEvent) {
    return (
      <EventDetail
        event={selectedEvent}
        onBack={() => setSubView('main')}
        onRsvpChange={handleEventRsvpChange}
      />
    );
  }

  const unreadCount = announcementsList.filter((a) => !a.isRead).length;

  return (
    <div className="res-community-container">
      {/* Header */}
      <div className="res-screen-header">
        <div>
          <h2 className="vis-screen-title">Community</h2>
          <p className="vis-screen-subtitle">
            Lakeview Residency • Notice board & events hub
          </p>
        </div>
      </div>

      {/* Filter Tabs */}
      <Tabs
        tabs={[
          { id: 'all', label: 'All Feed' },
          { id: 'announcements', label: 'Notices', badge: unreadCount > 0 ? unreadCount : undefined },
          { id: 'events', label: 'Events', badge: eventsList.length },
          { id: 'polls', label: 'Polls', badge: pollsList.length },
        ]}
        activeTab={activeTab}
        onChange={(id) => setActiveTab(id as any)}
      />

      {/* Main Sections based on Filter */}
      {(activeTab === 'all' || activeTab === 'announcements') && (
        <section className="res-comm-section">
          <div className="res-comm-section-header">
            <span className="res-comm-section-title">IMPORTANT ANNOUNCEMENTS</span>
          </div>

          <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--space-2)' }}>
            {announcementsList.map((ann) => (
              <AnnouncementCard
                key={ann.id}
                announcement={ann}
                onClick={(item) => {
                  setSelectedAnnouncement(item);
                  setSubView('announcement_detail');
                }}
              />
            ))}
          </div>
        </section>
      )}

      {(activeTab === 'all' || activeTab === 'events') && (
        <section className="res-comm-section">
          <div className="res-comm-section-header">
            <span className="res-comm-section-title">UPCOMING SOCIETY EVENTS</span>
          </div>

          <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--space-2)' }}>
            {eventsList.map((evt) => (
              <EventCard
                key={evt.id}
                event={evt}
                onRsvpChange={handleEventRsvpChange}
                onClick={(item) => {
                  setSelectedEvent(item);
                  setSubView('event_detail');
                }}
              />
            ))}
          </div>
        </section>
      )}

      {(activeTab === 'all' || activeTab === 'polls') && (
        <section className="res-comm-section">
          <div className="res-comm-section-header">
            <span className="res-comm-section-title">RESIDENT OPINION POLLS</span>
          </div>

          <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--space-2)' }}>
            {pollsList.map((poll) => (
              <PollCard
                key={poll.id}
                poll={poll}
                onVoteSubmit={handlePollVoteSubmit}
              />
            ))}
          </div>
        </section>
      )}
    </div>
  );
};
