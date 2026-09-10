import React, { useState } from 'react';
import type { SecretaryNoticeItem, NoticeStatus } from '../../../domains/secretary/types';
import { Megaphone, Plus, Bell, Clock, FileText, AlertTriangle, X } from 'lucide-react';
import { CreateNoticeDrawer } from './CreateNoticeDrawer';
import '../secretary.css';

interface SecretaryNoticeCenterProps {
  noticesList: SecretaryNoticeItem[];
  onPublishNotice: (notice: Omit<SecretaryNoticeItem, 'id' | 'createdAt' | 'acknowledgedCount'>) => void;
  onSaveDraftNotice: (notice: Omit<SecretaryNoticeItem, 'id' | 'createdAt' | 'acknowledgedCount'>) => void;
  initialCreateOpen?: boolean;
}

export const SecretaryNoticeCenter: React.FC<SecretaryNoticeCenterProps> = ({
  noticesList,
  onPublishNotice,
  onSaveDraftNotice,
  initialCreateOpen = false,
}) => {
  const [isDrawerOpen, setIsDrawerOpen] = useState<boolean>(initialCreateOpen);
  const [activeStatusTab, setActiveStatusTab] = useState<NoticeStatus | 'ALL'>('ALL');
  const [selectedNotice, setSelectedNotice] = useState<SecretaryNoticeItem | null>(null);

  const publishedCount = noticesList.filter((n) => n.status === 'Published').length;
  const draftCount = noticesList.filter((n) => n.status === 'Draft').length;

  const filteredNotices = noticesList.filter((notice) => {
    if (activeStatusTab === 'ALL') return true;
    return notice.status === activeStatusTab;
  });

  return (
    <div>
      {/* Header Row */}
      <div className="section-heading-row">
        <div>
          <h3 className="section-title">Notice Broadcasting Center</h3>
          <p style={{ margin: 0, fontSize: '0.75rem', color: '#64748b' }}>
            Broadcast announcements to residents & manage active notices
          </p>
        </div>
        <button
          className="btn-onboarding-primary"
          style={{ width: 'auto', padding: '0.4rem 0.85rem', fontSize: '0.75rem' }}
          onClick={() => setIsDrawerOpen(true)}
        >
          <Plus size={16} />
          <span>+ Create Broadcast</span>
        </button>
      </div>

      {/* Metric Cards Banner */}
      <div className="stats-grid-2x2" style={{ marginBottom: '1rem' }}>
        <div className="secretary-stat-card">
          <div className="stat-icon-wrapper stat-icon-blue">
            <Megaphone size={18} />
          </div>
          <div className="stat-value">{publishedCount}</div>
          <div className="stat-label">Published Broadcasts</div>
        </div>

        <div className="secretary-stat-card">
          <div className="stat-icon-wrapper stat-icon-amber">
            <FileText size={18} />
          </div>
          <div className="stat-value">{draftCount}</div>
          <div className="stat-label">Draft Notices Saved</div>
        </div>
      </div>

      {/* Filter Tabs */}
      <div style={{ display: 'flex', gap: '0.5rem', marginBottom: '1rem' }}>
        <button
          className={`pill-btn ${activeStatusTab === 'ALL' ? 'pill-active' : ''}`}
          onClick={() => setActiveStatusTab('ALL')}
        >
          All ({noticesList.length})
        </button>
        <button
          className={`pill-btn ${activeStatusTab === 'Published' ? 'pill-active' : ''}`}
          onClick={() => setActiveStatusTab('Published')}
        >
          Published ({publishedCount})
        </button>
        <button
          className={`pill-btn ${activeStatusTab === 'Draft' ? 'pill-active' : ''}`}
          onClick={() => setActiveStatusTab('Draft')}
        >
          Drafts ({draftCount})
        </button>
      </div>

      {/* Notice Feed */}
      {filteredNotices.length === 0 ? (
        <div className="login-form-card" style={{ textAlign: 'center', padding: '2rem 1rem' }}>
          <Bell size={32} style={{ color: '#94a3b8', marginBottom: '0.5rem' }} />
          <h4 style={{ margin: '0 0 0.25rem 0' }}>No Notices in This Category</h4>
          <p style={{ fontSize: '0.8125rem', color: '#64748b', margin: 0 }}>
            Click "+ Create Broadcast" above to publish your first announcement.
          </p>
        </div>
      ) : (
        filteredNotices.map((notice) => (
          <div
            key={notice.id}
            className="activity-card"
            style={{ marginBottom: '0.75rem', cursor: 'pointer' }}
            onClick={() => setSelectedNotice(notice)}
          >
            <div
              className="activity-icon-box"
              style={{
                background:
                  notice.priority === 'Urgent'
                    ? '#fef2f2'
                    : notice.status === 'Draft'
                    ? '#fffbeb'
                    : '#eff6ff',
                color:
                  notice.priority === 'Urgent'
                    ? '#dc2626'
                    : notice.status === 'Draft'
                    ? '#d97706'
                    : '#2563eb',
              }}
            >
              {notice.priority === 'Urgent' ? (
                <AlertTriangle size={20} />
              ) : notice.status === 'Draft' ? (
                <Clock size={20} />
              ) : (
                <Megaphone size={20} />
              )}
            </div>

            <div className="activity-content">
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                <h4 className="activity-title">{notice.title}</h4>
                <span
                  style={{
                    fontSize: '0.625rem',
                    fontWeight: 700,
                    padding: '0.125rem 0.375rem',
                    borderRadius: '4px',
                    background: notice.status === 'Published' ? '#f0fdf4' : '#fffbeb',
                    color: notice.status === 'Published' ? '#16a34a' : '#d97706',
                  }}
                >
                  {notice.status}
                </span>
              </div>
              <p className="activity-subtext" style={{ display: '-webkit-box', WebkitLineClamp: 2, WebkitBoxOrient: 'vertical', overflow: 'hidden' }}>
                {notice.content}
              </p>
              <div className="activity-meta">
                {notice.category} • Target: <strong>{notice.targetAudience}</strong> • {notice.authorName}
              </div>
            </div>
          </div>
        ))
      )}

      {/* Create Notice Drawer Modal */}
      {isDrawerOpen && (
        <CreateNoticeDrawer
          onClose={() => setIsDrawerOpen(false)}
          onPublish={onPublishNotice}
          onSaveDraft={onSaveDraftNotice}
        />
      )}

      {/* Notice Detail View Modal */}
      {selectedNotice && (
        <div className="auth-modal-overlay">
          <div className="auth-modal-card" style={{ maxWidth: '440px' }}>
            <div style={{ display: 'flex', justifyContent: 'flex-end', cursor: 'pointer' }} onClick={() => setSelectedNotice(null)}>
              <X size={18} style={{ color: '#94a3b8' }} />
            </div>

            <div className="otp-icon-header" style={{ background: '#eff6ff', color: '#2563eb' }}>
              <Megaphone size={24} />
            </div>

            <h3 className="otp-title">{selectedNotice.title}</h3>
            <p className="otp-desc">
              {selectedNotice.category} • Priority: <strong>{selectedNotice.priority}</strong>
            </p>

            <div className="login-form-card" style={{ background: '#f8fafc', marginBottom: '1.25rem', textAlign: 'left' }}>
              <p style={{ fontSize: '0.8125rem', color: '#334155', margin: '0 0 0.75rem 0', whiteSpace: 'pre-wrap' }}>
                {selectedNotice.content}
              </p>
              <div style={{ fontSize: '0.6875rem', color: '#64748b', borderTop: '1px solid #e2e8f0', paddingTop: '0.375rem' }}>
                Target: <strong>{selectedNotice.targetAudience}</strong> • Posted by {selectedNotice.authorName} ({selectedNotice.authorRole})
              </div>
            </div>

            <button className="btn-login-submit" onClick={() => setSelectedNotice(null)}>
              Close Notice View
            </button>
          </div>
        </div>
      )}
    </div>
  );
};
