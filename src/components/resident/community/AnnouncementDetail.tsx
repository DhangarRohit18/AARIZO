import React from 'react';
import type { CommunityAnnouncement } from '../../../domains/community';
import {
  getCategoryLabel,
  getPriorityBadgeVariant,
  getPriorityLabel,
} from '../../../domains/community';
import { Badge, Button } from '../../common';
import {
  ArrowLeft,
  Calendar,
  User,
  MapPin,
  Clock,
  CheckCircle2,
} from 'lucide-react';
import '../resident.css';
import './community.css';

export interface AnnouncementDetailProps {
  announcement: CommunityAnnouncement;
  onBack: () => void;
  onMarkRead?: (id: string) => void;
}

export const AnnouncementDetail: React.FC<AnnouncementDetailProps> = ({
  announcement,
  onBack,
  onMarkRead,
}) => {
  return (
    <div className="res-announcement-detail-container">
      {/* Header */}
      <div className="res-screen-header">
        <button className="vis-back-icon-btn" onClick={onBack} aria-label="Back">
          <ArrowLeft size={18} />
        </button>
        <div>
          <h2 className="vis-screen-title">Announcement Detail</h2>
          <p className="vis-screen-subtitle">Ref ID: {announcement.id}</p>
        </div>
      </div>

      {/* Main Card */}
      <div className="res-detail-card">
        <div className="res-detail-status-row">
          <span className="res-ann-cat-tag">
            {getCategoryLabel(announcement.category)}
          </span>
          <Badge variant={getPriorityBadgeVariant(announcement.priority)}>
            {getPriorityLabel(announcement.priority)}
          </Badge>
        </div>

        <h2 style={{ fontSize: '15px', fontWeight: 800, color: 'var(--color-text)', margin: '4px 0 0 0' }}>
          {announcement.title}
        </h2>

        <div className="res-ann-meta" style={{ padding: '4px 0', borderBottom: '1px solid var(--color-border-subtle)' }}>
          <span style={{ display: 'flex', alignItems: 'center', gap: '4px' }}>
            <Calendar size={12} /> Published {announcement.publishedDate}
          </span>
          <span style={{ display: 'flex', alignItems: 'center', gap: '4px' }}>
            <User size={12} /> {announcement.authorName} ({announcement.authorRole})
          </span>
        </div>

        {announcement.effectiveDate && (
          <div className="res-meta-box" style={{ background: 'var(--color-surface-subtle)', padding: '8px 12px', borderRadius: 'var(--radius-sm)' }}>
            <Clock size={16} className="meta-ic" />
            <div>
              <span className="meta-lbl">Effective Period / Schedule</span>
              <span className="meta-val">{announcement.effectiveDate}</span>
            </div>
          </div>
        )}

        {announcement.locationArea && (
          <div className="res-meta-box" style={{ background: 'var(--color-surface-subtle)', padding: '8px 12px', borderRadius: 'var(--radius-sm)' }}>
            <MapPin size={16} className="meta-ic" />
            <div>
              <span className="meta-lbl">Affected Area / Location</span>
              <span className="meta-val">{announcement.locationArea}</span>
            </div>
          </div>
        )}

        {/* Content Paragraphs */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: '10px', marginTop: '6px' }}>
          {announcement.content.split('\n\n').map((paragraph, index) => (
            <p key={index} style={{ fontSize: '12px', color: 'var(--color-text)', lineHeight: 1.45, margin: 0 }}>
              {paragraph}
            </p>
          ))}
        </div>

        {/* Action / Mark as Read */}
        <div style={{ marginTop: '12px', paddingTop: '12px', borderTop: '1px solid var(--color-border-subtle)' }}>
          {!announcement.isRead ? (
            <Button
              variant="primary"
              fullWidth
              onClick={() => onMarkRead && onMarkRead(announcement.id)}
              leftIcon={<CheckCircle2 size={16} />}
            >
              Mark Notice as Read
            </Button>
          ) : (
            <div style={{ display: 'flex', alignItems: 'center', gap: '6px', fontSize: '11px', color: 'var(--color-success)', fontWeight: 700 }}>
              <CheckCircle2 size={14} />
              <span>Notice Read & Acknowledged</span>
            </div>
          )}
        </div>
      </div>

      <Button variant="outline" fullWidth onClick={onBack}>
        Back to Community
      </Button>
    </div>
  );
};
