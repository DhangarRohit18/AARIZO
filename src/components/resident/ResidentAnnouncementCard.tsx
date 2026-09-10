import React from 'react';
import { Megaphone, ChevronRight, AlertTriangle } from 'lucide-react';
import type { AnnouncementMock } from '../../mockData/residentHomeData';
import { Chip } from '../common';
import './resident.css';

export interface ResidentAnnouncementCardProps {
  announcements: AnnouncementMock[];
  onViewAll?: () => void;
  onSelectAnnouncement?: (id: string) => void;
}

export const ResidentAnnouncementCard: React.FC<ResidentAnnouncementCardProps> = ({
  announcements,
  onViewAll,
  onSelectAnnouncement,
}) => {
  return (
    <section className="res-announcements-section">
      <div className="res-section-title-row">
        <div className="res-title-with-icon">
          <Megaphone size={18} className="res-section-ic" />
          <h3 className="res-section-heading">Society Announcements</h3>
        </div>
        <button className="res-text-action-btn" onClick={onViewAll}>
          <span>View All</span>
          <ChevronRight size={14} />
        </button>
      </div>

      <div className="res-announcements-list">
        {announcements.map((item) => (
          <article
            key={item.id}
            className={`res-announcement-card ${item.priority ? 'priority-announcement' : ''}`}
            onClick={() => onSelectAnnouncement && onSelectAnnouncement(item.id)}
          >
            <div className="res-ann-header">
              <div className="res-ann-tags">
                <Chip label={item.category} active={item.category === 'Urgent'} />
                {item.priority && (
                  <span className="res-priority-badge">
                    <AlertTriangle size={10} />
                    <span>PRIORITY</span>
                  </span>
                )}
              </div>
              <span className="res-ann-time">{item.timestamp}</span>
            </div>

            <h4 className="res-ann-title">{item.title}</h4>
            <p className="res-ann-summary">{item.summary}</p>
          </article>
        ))}
      </div>
    </section>
  );
};
