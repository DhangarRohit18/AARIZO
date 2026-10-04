import React, { useState, useEffect } from 'react';
import { useAuth } from '../../context/AuthContext';
import { Building2, Users, Bell, CreditCard, UserCheck, X, ShieldCheck } from 'lucide-react';
import { SecretaryHome } from './home/SecretaryHome';
import { SecretaryResidents } from './residents/SecretaryResidents';
import { SecretaryNoticeCenter } from './notices/SecretaryNoticeCenter';
import { SecretaryBillingLedger } from './finances/SecretaryBillingLedger';
import { SecretaryProfile } from './profile/SecretaryProfile';
import { SecretaryCommitteeRoster } from './committee/SecretaryCommitteeRoster';
import { SecretaryNotifications } from './notifications/SecretaryNotifications';
import { apiClient } from '../../services/apiClient';
import { realtimeService } from '../../services/realtimeService';

import {
  INITIAL_CANONICAL_BILLING,
  INITIAL_COMMITTEE_ROSTER,
} from '../../domains/secretary/states';

import type {
  SecretaryResidentRecord,
  SecretaryNoticeItem,
  CanonicalBillingRecord,
  CommitteeMemberRecord,
} from '../../domains/secretary/types';

import './secretary.css';

export type SecretaryTab = 'home' | 'residents' | 'notices' | 'finances' | 'profile';

export const SecretaryShell: React.FC = () => {
  const { currentUser } = useAuth();
  const [activeTab, setActiveTab] = useState<SecretaryTab>('home');
  const [isNotifHeaderModalOpen, setIsNotifHeaderModalOpen] = useState<boolean>(false);
  const [profileViewMode, setProfileViewMode] = useState<'profile' | 'committee'>('profile');
  const [residentsFilter, setResidentsFilter] = useState<'ALL' | 'PENDING'>('ALL');
  const [noticeDrawerOpen, setNoticeDrawerOpen] = useState<boolean>(false);
  const [issueBillModalOpen, setIssueBillModalOpen] = useState<boolean>(false);

  // Live state loaded from PostgreSQL
  const [residents, setResidents] = useState<SecretaryResidentRecord[]>([]);
  const [notices, setNotices] = useState<SecretaryNoticeItem[]>([]);
  const [ledger, setLedger] = useState<CanonicalBillingRecord[]>(INITIAL_CANONICAL_BILLING);
  const [committee] = useState<CommitteeMemberRecord[]>(INITIAL_COMMITTEE_ROSTER);

  const loadSecretaryData = async () => {
    try {
      const [resList, annList] = await Promise.all([
        apiClient.getResidents(),
        apiClient.getAnnouncements(),
      ]);

      if (resList && Array.isArray(resList) && resList.length > 0) {
        const mapped: SecretaryResidentRecord[] = resList.map((r: any) => ({
          id: r.id,
          name: r.name,
          flatNumber: r.flat ? `${r.flat.tower?.blockCode || 'T'}-${r.flat.flatNumber}` : 'B-1204',
          blockWing: 'Block B' as const,
          canonicalDisplay: `${r.name} (${r.flat ? `${r.flat.tower?.blockCode || 'T'}-${r.flat.flatNumber}` : 'B-1204'})`,
          type: (r.residentType === 'OWNER' ? 'Owner' : 'Tenant') as 'Owner' | 'Tenant',
          status: (r.status === 'ACTIVE' ? 'Active' : 'Pending Verification') as 'Active' | 'Pending Verification',
          phone: r.phone,
          email: r.email || `${r.name.toLowerCase().replace(' ', '.')}@aarizo.com`,
          vehiclesCount: r.vehicles?.length || 1,
          familyCount: r.familyMembers?.length || 2,
          submittedAt: r.moveInDate ? new Date(r.moveInDate).toLocaleDateString([], { month: 'short', year: 'numeric' }) : 'Jan 2024',
        }));
        setResidents(mapped);
      }

      if (annList && Array.isArray(annList) && annList.length > 0) {
        const mappedNotices: SecretaryNoticeItem[] = annList.map((a: any) => ({
          id: a.id,
          title: a.title,
          category: (a.category === 'MAINTENANCE' ? 'Maintenance Alert' : a.category === 'SECURITY' ? 'Security Alert' : 'General Notice') as any,
          priority: (a.isUrgent ? 'Urgent' : 'Normal') as any,
          targetAudience: 'All Blocks' as const,
          content: a.content,
          status: 'Published' as const,
          createdAt: new Date(a.createdAt || Date.now()).toISOString().split('T')[0],
          publishedAt: new Date(a.publishedAt || Date.now()).toLocaleDateString([], { month: 'short', day: 'numeric', year: 'numeric' }),
          authorName: a.authorName || 'Managing Committee',
          authorRole: 'Committee',
          acknowledgedCount: 42,
          attachmentUrl: a.attachmentUrl || undefined,
          attachmentName: a.attachmentName || undefined,
        }));
        setNotices(mappedNotices);
      }
    } catch (err) {
      console.error('Error loading secretary data:', err);
    }
  };

  useEffect(() => {
    loadSecretaryData();
    const unsub = realtimeService.subscribe('*', () => {
      loadSecretaryData();
    });
    return () => unsub();
  }, []);

  // Handlers for Shared Simulated Prototype Synchronization
  const handleApproveResident = (id: string, note?: string) => {
    setResidents((prev) =>
      prev.map((r) =>
        r.id === id
          ? {
              ...r,
              status: 'Active',
              approvalNote: note || 'Approved by Secretary Mayuri Udar.',
            }
          : r
      )
    );
  };

  const handleRejectResident = (id: string, reason: string) => {
    setResidents((prev) =>
      prev.map((r) =>
        r.id === id
          ? {
              ...r,
              status: 'Rejected',
              rejectionReason: reason,
            }
          : r
      )
    );
  };

  const handlePublishNotice = (
    newNoticeData: Omit<SecretaryNoticeItem, 'id' | 'createdAt' | 'acknowledgedCount'>
  ) => {
    const id = `notif-${Date.now()}`;
    const newNotice: SecretaryNoticeItem = {
      ...newNoticeData,
      id,
      createdAt: new Date().toISOString().split('T')[0],
      acknowledgedCount: 0,
    };

    setNotices((prev) => [newNotice, ...prev]);

    // Persist to PostgreSQL backend database and broadcast in real time
    apiClient
      .createAnnouncement({
        societyId: 'soc-gvs',
        title: newNotice.title,
        content: newNotice.content,
        category: newNotice.category,
        authorName: newNotice.authorName,
        isUrgent: newNotice.priority === 'Urgent',
        attachmentUrl: newNotice.attachmentUrl,
        attachmentName: newNotice.attachmentName,
      })
      .then(() => {
        realtimeService.publish(
          'NOTIFICATIONS',
          {
            title: newNotice.title,
            category: newNotice.category,
          },
          'soc-gvs',
          'SECRETARY',
          'Society Office'
        );
      })
      .catch((err) => {
        console.error('Failed to create announcement in PostgreSQL:', err);
      });
  };

  const handleSaveDraftNotice = (
    draftNoticeData: Omit<SecretaryNoticeItem, 'id' | 'createdAt' | 'acknowledgedCount'>
  ) => {
    const id = `draft-${Date.now()}`;
    const draftNotice: SecretaryNoticeItem = {
      ...draftNoticeData,
      id,
      createdAt: new Date().toISOString().split('T')[0],
      acknowledgedCount: 0,
    };
    setNotices((prev) => [draftNotice, ...prev]);
  };

  const handleIssueNewBill = (
    billData: Omit<
      CanonicalBillingRecord,
      'id' | 'billNumber' | 'accountReference' | 'amountPaid' | 'outstandingAmount' | 'status'
    >
  ) => {
    const id = `PAY-${Date.now()}`;
    const billNumber = `BILL-2026-OCT-${billData.flatNumber}`;
    const accountReference = `GVS-${billData.flatNumber}-OCT26`;

    const newBill: CanonicalBillingRecord = {
      ...billData,
      id,
      billNumber,
      accountReference,
      amountPaid: 0,
      outstandingAmount: billData.totalAmount,
      status: 'DUE',
    };

    setLedger((prev) => [newBill, ...prev]);
  };

  const handleNavigateFromHome = (action: string) => {
    if (action === 'Add Resident' || action === 'Pending Approvals') {
      setResidentsFilter(action === 'Pending Approvals' ? 'PENDING' : 'ALL');
      setActiveTab('residents');
    } else if (action === 'Broadcast Notice') {
      setActiveTab('notices');
      setNoticeDrawerOpen(true);
    } else if (action === 'Collect Dues' || action === 'View Ledger') {
      setActiveTab('finances');
      setIssueBillModalOpen(action === 'Collect Dues');
    }
  };

  const renderTabContent = () => {
    switch (activeTab) {
      case 'home':
        return (
          <SecretaryHome
            residentsList={residents}
            noticesList={notices}
            ledgerList={ledger}
            onQuickActionClick={handleNavigateFromHome}
          />
        );
      case 'residents':
        return (
          <SecretaryResidents
            residentsList={residents}
            onApproveResident={handleApproveResident}
            onRejectResident={handleRejectResident}
            initialFilter={residentsFilter}
          />
        );
      case 'notices':
        return (
          <SecretaryNoticeCenter
            noticesList={notices}
            onPublishNotice={handlePublishNotice}
            onSaveDraftNotice={handleSaveDraftNotice}
            initialCreateOpen={noticeDrawerOpen}
          />
        );
      case 'finances':
        return (
          <SecretaryBillingLedger
            ledgerList={ledger}
            onIssueNewBill={handleIssueNewBill}
            initialIssueOpen={issueBillModalOpen}
          />
        );
      case 'profile':
        return (
          <div>
            {/* View Mode Toggle Bar */}
            <div className="section-heading-row" style={{ marginBottom: '1rem' }}>
              <div className="control-pill-toggle" style={{ background: '#e2e8f0', width: '100%' }}>
                <button
                  className={`pill-btn ${profileViewMode === 'profile' ? 'pill-active' : ''}`}
                  style={{ flex: 1 }}
                  onClick={() => setProfileViewMode('profile')}
                >
                  <UserCheck size={14} />
                  <span>Secretary Profile</span>
                </button>
                <button
                  className={`pill-btn ${profileViewMode === 'committee' ? 'pill-active' : ''}`}
                  style={{ flex: 1 }}
                  onClick={() => setProfileViewMode('committee')}
                >
                  <ShieldCheck size={14} />
                  <span>Managing Committee</span>
                </button>
              </div>
            </div>

            {profileViewMode === 'profile' ? (
              <SecretaryProfile />
            ) : (
              <SecretaryCommitteeRoster committeeList={committee} />
            )}
          </div>
        );
      default:
        return <SecretaryHome residentsList={residents} noticesList={notices} ledgerList={ledger} onQuickActionClick={handleNavigateFromHome} />;
    }
  };

  return (
    <div className="secretary-app-container">
      {/* Top Secretary Header */}
      <header className="secretary-header">
        <div className="secretary-header-left">
          <img
            src={
              currentUser?.avatarUrl ||
              'https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?auto=format&fit=crop&w=250&q=80'
            }
            alt="Mayuri Udar"
            className="secretary-avatar"
          />
          <div className="secretary-title-box">
            <h2 className="secretary-society-name">Green Valley Society</h2>
            <p className="secretary-user-title">Mayuri Udar · Secretary</p>
          </div>
        </div>

        <div className="secretary-header-right">
          <button
            className="icon-btn-header"
            onClick={() => setIsNotifHeaderModalOpen(true)}
            title="View Administrative Notifications"
          >
            <Bell size={18} />
            <span className="header-badge-dot" />
          </button>
        </div>
      </header>

      {/* Main Viewport Content */}
      <main className="secretary-main">{renderTabContent()}</main>

      {/* Secretary Bottom Navigation Bar (5-Tab Architecture) */}
      <nav className="secretary-bottom-nav">
        <button
          className={`sec-nav-item ${activeTab === 'home' ? 'active' : ''}`}
          onClick={() => {
            setActiveTab('home');
            setNoticeDrawerOpen(false);
            setIssueBillModalOpen(false);
          }}
        >
          <Building2 size={20} />
          <span>Home</span>
        </button>

        <button
          className={`sec-nav-item ${activeTab === 'residents' ? 'active' : ''}`}
          onClick={() => {
            setActiveTab('residents');
            setResidentsFilter('ALL');
          }}
        >
          <Users size={20} />
          <span>Residents</span>
        </button>

        <button
          className={`sec-nav-item ${activeTab === 'notices' ? 'active' : ''}`}
          onClick={() => {
            setActiveTab('notices');
            setNoticeDrawerOpen(false);
          }}
        >
          <Bell size={20} />
          <span>Notices</span>
        </button>

        <button
          className={`sec-nav-item ${activeTab === 'finances' ? 'active' : ''}`}
          onClick={() => {
            setActiveTab('finances');
            setIssueBillModalOpen(false);
          }}
        >
          <CreditCard size={20} />
          <span>Finances</span>
        </button>

        <button
          className={`sec-nav-item ${activeTab === 'profile' ? 'active' : ''}`}
          onClick={() => setActiveTab('profile')}
        >
          <UserCheck size={20} />
          <span>Profile</span>
        </button>
      </nav>

      {/* Administrative Notifications Header Popover Modal */}
      {isNotifHeaderModalOpen && (
        <div className="auth-modal-overlay">
          <div className="auth-modal-card" style={{ maxWidth: '440px' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '0.75rem' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                <div className="otp-icon-header" style={{ width: '32px', height: '32px', background: 'var(--aarizo-light-blue, #EAF6FC)', color: 'var(--aarizo-blue, #176B91)', margin: 0 }}>
                  <Bell size={18} />
                </div>
                <h3 className="otp-title" style={{ fontSize: '1rem', margin: 0 }}>
                  Administrative Notifications
                </h3>
              </div>
              <button className="btn-auth-text" onClick={() => setIsNotifHeaderModalOpen(false)} style={{ color: '#94a3b8' }}>
                <X size={20} />
              </button>
            </div>

            <div style={{ maxHeight: '60vh', overflowY: 'auto' }}>
              <SecretaryNotifications />
            </div>

            <button
              className="btn-login-submit"
              style={{ marginTop: '1rem' }}
              onClick={() => setIsNotifHeaderModalOpen(false)}
            >
              Close Notifications
            </button>
          </div>
        </div>
      )}
    </div>
  );
};


