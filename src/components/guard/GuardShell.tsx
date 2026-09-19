import React, { useState } from 'react';
import { useAuth } from '../../context/AuthContext';
import type {
  GuardVisitor,
  GateHistoryRecord,
  GuardAlert,
  Gate,
  GuardDashboardStats,
} from '../../domains/guard/types';
import { MOCK_GUARD_PROFILE } from '../../mockData/guard/guardProfile';
import { MOCK_GATES } from '../../mockData/guard/gates';
import { INITIAL_GUARD_VISITORS } from '../../mockData/guard/guardVisitors';
import { INITIAL_GATE_HISTORY } from '../../mockData/guard/gateHistory';
import { INITIAL_GUARD_ALERTS } from '../../mockData/guard/guardAlerts';

import { GuardHome } from './home/GuardHome';
import { PassVerification } from './verification/PassVerification';
import { VisitorVerificationDetail } from './verification/VisitorVerificationDetail';
import { GateDecisionModal } from './verification/GateDecisionModal';
import { CheckInPanel } from './entry/CheckInPanel';
import { InsideVisitors } from './entry/InsideVisitors';
import { GuardVisitors } from './visitors/GuardVisitors';
import { GateHistory } from './history/GateHistory';
import { GuardAlerts } from './alerts/GuardAlerts';
import { GuardProfile } from './profile/GuardProfile';

import { Shield, Users, Clock, Bell, UserCheck, KeyRound } from 'lucide-react';
import './guard.css';

export type GuardShellTab = 'home' | 'verify' | 'visitors' | 'inside' | 'history' | 'alerts' | 'more';

export const GuardShell: React.FC = () => {
  const { currentUser } = useAuth();
  const [activeTab, setActiveTab] = useState<GuardShellTab>('home');

  // Guard domain local prototype state
  const [gate, setGate] = useState<Gate>(MOCK_GATES[0]);
  const [visitors, setVisitors] = useState<GuardVisitor[]>(INITIAL_GUARD_VISITORS);
  const [history, setHistory] = useState<GateHistoryRecord[]>(INITIAL_GATE_HISTORY);
  const [alerts, setAlerts] = useState<GuardAlert[]>(INITIAL_GUARD_ALERTS);

  // Active modal / detail selection states
  const [selectedVisitor, setSelectedVisitor] = useState<GuardVisitor | null>(null);
  const [decisionModalMode, setDecisionModalMode] = useState<'approve' | 'reject' | null>(null);
  const [showCheckInPanel, setShowCheckInPanel] = useState<boolean>(false);

  // Calculate dashboard stats
  const stats: GuardDashboardStats = {
    expectedToday: visitors.filter((v) => v.status === 'expected').length,
    atGate: visitors.filter((v) => v.status === 'at_gate' || v.status === 'approval_required').length,
    inside: visitors.filter((v) => v.status === 'checked_in').length,
    pendingApproval: visitors.filter((v) => v.status === 'approval_required').length,
  };

  const handleToggleGateStatus = () => {
    setGate((prev) => ({
      ...prev,
      status: prev.status === 'open' ? 'closed' : 'open',
    }));
  };

  const handleSelectVisitor = (visitor: GuardVisitor) => {
    setSelectedVisitor(visitor);
    setActiveTab('verify');
  };

  const handleConfirmApprove = (visitor: GuardVisitor) => {
    setVisitors((prev) =>
      prev.map((v) => (v.id === visitor.id ? { ...v, status: 'approved', approvedAt: 'Just Now' } : v))
    );
    setSelectedVisitor((prev) => (prev ? { ...prev, status: 'approved' } : null));
    setDecisionModalMode(null);
    setShowCheckInPanel(true);
  };

  const handleConfirmReject = (visitor: GuardVisitor, reason: string) => {
    const timestamp = 'Today, ' + new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
    setVisitors((prev) =>
      prev.map((v) =>
        v.id === visitor.id ? { ...v, status: 'rejected', rejectionReason: reason } : v
      )
    );

    const newHistoryRecord: GateHistoryRecord = {
      id: `hist-rej-${Date.now()}`,
      visitorId: visitor.id,
      visitorName: visitor.name,
      visitorType: visitor.visitorType,
      residentName: visitor.residentName,
      flatCode: `${visitor.tower} Â· ${visitor.flatCode}`,
      action: 'entry_rejected',
      actionLabel: 'Entry Rejected',
      timestamp,
      gateName: gate.name,
      gateOfficer: MOCK_GUARD_PROFILE.name,
      rejectionReason: reason,
    };

    setHistory((prev) => [newHistoryRecord, ...prev]);
    setSelectedVisitor(null);
    setDecisionModalMode(null);
    setActiveTab('history');
  };

  const handleConfirmCheckIn = (visitor: GuardVisitor) => {
    const timestamp = 'Today, ' + new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
    setVisitors((prev) =>
      prev.map((v) =>
        v.id === visitor.id ? { ...v, status: 'checked_in', checkedInAt: timestamp } : v
      )
    );

    const newHistoryRecord: GateHistoryRecord = {
      id: `hist-in-${Date.now()}`,
      visitorId: visitor.id,
      visitorName: visitor.name,
      visitorType: visitor.visitorType,
      residentName: visitor.residentName,
      flatCode: `${visitor.tower} Â· ${visitor.flatCode}`,
      action: 'checked_in',
      actionLabel: 'Checked In',
      timestamp,
      gateName: gate.name,
      gateOfficer: MOCK_GUARD_PROFILE.name,
    };

    setHistory((prev) => [newHistoryRecord, ...prev]);
    setShowCheckInPanel(false);
    setSelectedVisitor(null);
    setActiveTab('inside');
  };

  const handleCheckOutVisitor = (visitor: GuardVisitor) => {
    const timestamp = 'Today, ' + new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
    setVisitors((prev) =>
      prev.map((v) =>
        v.id === visitor.id ? { ...v, status: 'checked_out', checkedOutAt: timestamp } : v
      )
    );

    const newHistoryRecord: GateHistoryRecord = {
      id: `hist-out-${Date.now()}`,
      visitorId: visitor.id,
      visitorName: visitor.name,
      visitorType: visitor.visitorType,
      residentName: visitor.residentName,
      flatCode: `${visitor.tower} Â· ${visitor.flatCode}`,
      action: 'checked_out',
      actionLabel: 'Checked Out',
      timestamp,
      gateName: gate.name,
      gateOfficer: MOCK_GUARD_PROFILE.name,
    };

    setHistory((prev) => [newHistoryRecord, ...prev]);
  };

  const handleAcknowledgeAlert = (alertId: string) => {
    setAlerts((prev) =>
      prev.map((a) => (a.id === alertId ? { ...a, isAcknowledged: true } : a))
    );
  };

  const renderTabContent = () => {
    if (activeTab === 'verify') {
      if (selectedVisitor) {
        return (
          <VisitorVerificationDetail
            visitor={selectedVisitor}
            onBack={() => setSelectedVisitor(null)}
            onApprove={() => setDecisionModalMode('approve')}
            onReject={() => setDecisionModalMode('reject')}
          />
        );
      }
      return <PassVerification visitors={visitors} onSelectVisitor={handleSelectVisitor} />;
    }

    switch (activeTab) {
      case 'home':
        return (
          <GuardHome
            stats={stats}
            gate={gate}
            onToggleGateStatus={handleToggleGateStatus}
            pendingVisitors={visitors.filter((v) => v.status === 'approval_required')}
            recentActivity={visitors.slice(0, 3)}
            onOpenVerify={() => setActiveTab('verify')}
            onSelectVisitor={handleSelectVisitor}
            onNavigateTab={(t) => setActiveTab(t)}
          />
        );
      case 'visitors':
        return <GuardVisitors visitors={visitors} onSelectVisitor={handleSelectVisitor} />;
      case 'inside':
        return (
          <InsideVisitors
            insideList={visitors.filter((v) => v.status === 'checked_in')}
            onCheckOut={handleCheckOutVisitor}
          />
        );
      case 'history':
        return <GateHistory history={history} />;
      case 'alerts':
        return <GuardAlerts alerts={alerts} onAcknowledgeAlert={handleAcknowledgeAlert} />;
      case 'more':
        return <GuardProfile />;
      default:
        return (
          <GuardHome
            stats={stats}
            gate={gate}
            onToggleGateStatus={handleToggleGateStatus}
            pendingVisitors={visitors.filter((v) => v.status === 'approval_required')}
            recentActivity={visitors.slice(0, 3)}
            onOpenVerify={() => setActiveTab('verify')}
            onSelectVisitor={handleSelectVisitor}
            onNavigateTab={(t) => setActiveTab(t)}
          />
        );
    }
  };

  return (
    <div className="guard-app-container">
      {/* Top Guard Terminal Header */}
      <header className="guard-header">
        <div className="guard-header-left">
          <img
            src={
              currentUser?.avatarUrl ||
              'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?auto=format&fit=crop&w=250&q=80'
            }
            alt="Officer R. Singh"
            className="guard-officer-avatar"
          />
          <div className="guard-terminal-info">
            <h2 className="guard-terminal-title">{gate.name}</h2>
            <p className="guard-officer-sub">{currentUser?.name || 'Officer R. Singh'} â€¢ On Duty</p>
          </div>
        </div>

        <div className="guard-header-right">
          <div
            className={`gate-status-pill ${gate.status === 'open' ? 'gate-status-open' : 'gate-status-closed'}`}
            onClick={handleToggleGateStatus}
            title="Click to toggle gate status"
          >
            <span
              style={{
                width: '6px',
                height: '6px',
                borderRadius: '50%',
                background: gate.status === 'open' ? '#34d399' : '#f87171',
              }}
            />
            <span>{gate.status.toUpperCase()}</span>
          </div>
        </div>
      </header>

      {/* Main Guard Viewport */}
      <main className="guard-main">{renderTabContent()}</main>

      {/* Decision Modal (Approve / Reject) */}
      {decisionModalMode && selectedVisitor && (
        <GateDecisionModal
          mode={decisionModalMode}
          visitor={selectedVisitor}
          onConfirmApprove={handleConfirmApprove}
          onConfirmReject={handleConfirmReject}
          onClose={() => setDecisionModalMode(null)}
        />
      )}

      {/* Check-In Panel */}
      {showCheckInPanel && selectedVisitor && (
        <CheckInPanel
          visitor={selectedVisitor}
          onConfirmCheckIn={handleConfirmCheckIn}
          onCancel={() => setShowCheckInPanel(false)}
        />
      )}

      {/* Guard Bottom Navigation */}
      <nav className="guard-bottom-nav">
        <button
          className={`guard-nav-item ${activeTab === 'home' ? 'active' : ''}`}
          onClick={() => {
            setSelectedVisitor(null);
            setActiveTab('home');
          }}
        >
          <Shield size={20} />
          <span>Home</span>
        </button>

        <button
          className={`guard-nav-item ${activeTab === 'verify' ? 'active' : ''}`}
          onClick={() => {
            setSelectedVisitor(null);
            setActiveTab('verify');
          }}
        >
          <KeyRound size={20} />
          <span>Verify</span>
        </button>

        <button
          className={`guard-nav-item ${activeTab === 'visitors' ? 'active' : ''}`}
          onClick={() => {
            setSelectedVisitor(null);
            setActiveTab('visitors');
          }}
        >
          <Users size={20} />
          <span>Visitors</span>
        </button>

        <button
          className={`guard-nav-item ${activeTab === 'history' ? 'active' : ''}`}
          onClick={() => {
            setSelectedVisitor(null);
            setActiveTab('history');
          }}
        >
          <Clock size={20} />
          <span>History</span>
        </button>

        <button
          className={`guard-nav-item ${activeTab === 'alerts' ? 'active' : ''}`}
          onClick={() => {
            setSelectedVisitor(null);
            setActiveTab('alerts');
          }}
        >
          <Bell size={20} />
          <span>Alerts</span>
        </button>

        <button
          className={`guard-nav-item ${activeTab === 'more' ? 'active' : ''}`}
          onClick={() => {
            setSelectedVisitor(null);
            setActiveTab('more');
          }}
        >
          <UserCheck size={20} />
          <span>Profile</span>
        </button>
      </nav>
    </div>
  );
};


