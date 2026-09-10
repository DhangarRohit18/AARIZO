import React from 'react';
import type { CommunityAnnouncement } from '../../../domains/community';
import {
  getCategoryLabel,
  getPriorityBadgeVariant,
  getPriorityLabel,
} from '../../../domains/community';
import { Badge } from '../../common';
import { ChevronRight, Calendar, User } from 'lucide-react';
import '../resident.css';
import './community.css';

export interface AnnouncementCardProps {
  announcement: CommunityAnnouncement;
  onClick?: (announcement: CommunityAnnouncement) => void;
}

export const AnnouncementCard: React.FC<AnnouncementCardProps> = ({
  announcement,
  onClick,
}) => {
  return (
    <div
      className={`res-announcement-card ${!announcement.isRead ? 'unread' : ''}`}
      onClick={() => onClick && onClick(announcement)}
    >
      <div className="res-ann-card-header">
        <div className="res-ann-chips-row">
          {!announcement.isRead && <span className="res-ann-unread-dot" />}
          <span className="res-ann-cat-tag">
            {getCategoryLabel(announcement.category)}
          </span>
        </div>
        <Badge variant={getPriorityBadgeVariant(announcement.priority)}>
          {getPriorityLabel(announcement.priority)}
        </Badge>
      </div>

      <h4 className="res-ann-title">{announcement.title}</h4>
      <p className="res-ann-summary">{announcement.summary}</p>

      <div className="res-ann-footer">
        <div className="res-ann-meta">
          <span style={{ display: 'flex', alignItems: 'center', gap: '3px' }}>
            <Calendar size={11} />
            {announcement.publishedDate}
          </span>
          <span style={{ display: 'flex', alignItems: 'center', gap: '3px' }}>
            <User size={11} />
            {announcement.authorName}
          </span>
        </div>

        <ChevronRight size={16} style={{ color: 'var(--color-text-subtle)' }} />
      </div>
    </div>
  );
};
