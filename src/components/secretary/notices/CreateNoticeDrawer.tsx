import React, { useState } from 'react';
import type {
  NoticeCategory,
  NoticePriority,
  NoticeTargetAudience,
  SecretaryNoticeItem,
} from '../../../domains/secretary/types';
import { Megaphone, X, Eye, Send } from 'lucide-react';
import '../secretary.css';

interface CreateNoticeDrawerProps {
  onClose: () => void;
  onPublish: (notice: Omit<SecretaryNoticeItem, 'id' | 'createdAt' | 'acknowledgedCount'>) => void;
  onSaveDraft: (notice: Omit<SecretaryNoticeItem, 'id' | 'createdAt' | 'acknowledgedCount'>) => void;
}

export const CreateNoticeDrawer: React.FC<CreateNoticeDrawerProps> = ({
  onClose,
  onPublish,
  onSaveDraft,
}) => {
  const [step, setStep] = useState<1 | 2>(1);
  const [title, setTitle] = useState<string>('');
  const [category, setCategory] = useState<NoticeCategory>('General Notice');
  const [priority, setPriority] = useState<NoticePriority>('Normal');
  const [targetAudience, setTargetAudience] = useState<NoticeTargetAudience>('All Blocks');
  const [content, setContent] = useState<string>('');

  const isFormValid = title.trim().length > 3 && content.trim().length > 10;

  const handlePublishSubmit = () => {
    onPublish({
      title: title.trim(),
      category,
      priority,
      targetAudience,
      content: content.trim(),
      status: 'Published',
      publishedAt: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
      authorName: 'Mayuri Udar',
      authorRole: 'Society Secretary',
    });
    onClose();
  };

  const handleDraftSubmit = () => {
    onSaveDraft({
      title: title.trim() || 'Untitled Notice Draft',
      category,
      priority,
      targetAudience,
      content: content.trim(),
      status: 'Draft',
      authorName: 'Mayuri Udar',
      authorRole: 'Society Secretary',
    });
    onClose();
  };

  return (
    <div className="auth-modal-overlay">
      <div className="auth-modal-card" style={{ maxWidth: '480px' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '0.75rem' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
            <div className="otp-icon-header" style={{ width: '36px', height: '36px', background: '#eff6ff', color: '#2563eb', margin: 0 }}>
              <Megaphone size={20} />
            </div>
            <h3 className="otp-title" style={{ fontSize: '1.125rem', margin: 0 }}>
              Broadcast Society Notice
            </h3>
          </div>
          <button className="btn-auth-text" onClick={onClose} style={{ color: '#94a3b8' }}>
            <X size={20} />
          </button>
        </div>

        {step === 1 ? (
          <div>
            <label className="form-group-label" style={{ fontSize: '0.8125rem' }}>Notice Title</label>
            <input
              type="text"
              className="search-input-field"
              placeholder="e.g. Overhead Water Tank Cleaning Schedule..."
              style={{ width: '100%', marginBottom: '0.75rem', padding: '0.5rem' }}
              value={title}
              onChange={(e) => setTitle(e.target.value)}
            />

            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '0.5rem', marginBottom: '0.75rem' }}>
              <div>
                <label className="form-group-label" style={{ fontSize: '0.75rem' }}>Category</label>
                <select
                  className="wing-filter-select"
                  style={{ width: '100%', padding: '0.45rem' }}
                  value={category}
                  onChange={(e) => setCategory(e.target.value as NoticeCategory)}
                >
                  <option value="General Notice">General Notice</option>
                  <option value="Maintenance Alert">Maintenance Alert</option>
                  <option value="Event / Celebration">Event / Celebration</option>
                  <option value="Security Alert">Security Alert</option>
                  <option value="Emergency Broadcast">Emergency Broadcast</option>
                </select>
              </div>

              <div>
                <label className="form-group-label" style={{ fontSize: '0.75rem' }}>Priority Level</label>
                <select
                  className="wing-filter-select"
                  style={{ width: '100%', padding: '0.45rem' }}
                  value={priority}
                  onChange={(e) => setPriority(e.target.value as NoticePriority)}
                >
                  <option value="Normal">Normal</option>
                  <option value="Important">Important</option>
                  <option value="Urgent">Urgent (High Priority)</option>
                </select>
              </div>
            </div>

            <label className="form-group-label" style={{ fontSize: '0.75rem' }}>Target Audience</label>
            <select
              className="wing-filter-select"
              style={{ width: '100%', marginBottom: '0.75rem', padding: '0.45rem' }}
              value={targetAudience}
              onChange={(e) => setTargetAudience(e.target.value as NoticeTargetAudience)}
            >
              <option value="All Blocks">All Blocks (Entire Society)</option>
              <option value="Block A">Block A Only</option>
              <option value="Block B">Block B Only</option>
              <option value="Block C">Block C Only</option>
              <option value="Owners Only">Flat Owners Only</option>
              <option value="Tenants Only">Tenants Only</option>
            </select>

            <label className="form-group-label" style={{ fontSize: '0.8125rem' }}>Notice Content Body</label>
            <textarea
              className="search-input-field"
              rows={4}
              style={{ width: '100%', marginBottom: '1rem', padding: '0.5rem', fontSize: '0.8125rem' }}
              placeholder="Type official notice details, schedule, requirements, and instructions for residents..."
              value={content}
              onChange={(e) => setContent(e.target.value)}
            />

            <div style={{ display: 'flex', gap: '0.75rem' }}>
              <button
                className="btn-onboarding-primary"
                style={{ flex: 1, background: '#64748b' }}
                onClick={handleDraftSubmit}
              >
                Save Draft
              </button>
              <button
                className="btn-onboarding-primary"
                style={{ flex: 1, opacity: isFormValid ? 1 : 0.5 }}
                disabled={!isFormValid}
                onClick={() => setStep(2)}
              >
                <Eye size={16} />
                <span>Preview Broadcast</span>
              </button>
            </div>
          </div>
        ) : (
          <div>
            <div style={{ background: '#f8fafc', padding: '0.875rem', borderRadius: '8px', border: '1px solid #e2e8f0', marginBottom: '1rem' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '0.25rem' }}>
                <span className="banner-role-tag" style={{ background: priority === 'Urgent' ? '#fef2f2' : '#eff6ff', color: priority === 'Urgent' ? '#dc2626' : '#2563eb' }}>
                  {category} • {priority}
                </span>
                <span style={{ fontSize: '0.75rem', color: '#64748b' }}>Target: {targetAudience}</span>
              </div>
              <h4 style={{ margin: '0.5rem 0 0.25rem 0', fontWeight: 800 }}>{title}</h4>
              <p style={{ margin: 0, fontSize: '0.8125rem', color: '#475569', whiteSpace: 'pre-wrap' }}>
                {content}
              </p>
              <div style={{ marginTop: '0.75rem', fontSize: '0.6875rem', color: '#64748b', borderTop: '1px solid #e2e8f0', paddingTop: '0.375rem' }}>
                Posted by Mayuri Udar (Secretary) • Broadcast preview for Resident App
              </div>
            </div>

            <div style={{ display: 'flex', gap: '0.75rem' }}>
              <button
                className="btn-onboarding-primary"
                style={{ flex: 1, background: '#64748b' }}
                onClick={() => setStep(1)}
              >
                Edit Notice
              </button>
              <button
                className="btn-onboarding-primary"
                style={{ flex: 1.2, background: '#16a34a' }}
                onClick={handlePublishSubmit}
              >
                <Send size={16} />
                <span>Publish Broadcast</span>
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};
