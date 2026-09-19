import React, { useState } from 'react';
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

import './guard.css';

export type GuardShellTab = 'home' | 'verify' | 'visitors' | 'inside' | 'history' | 'alerts' | 'more';

export const GuardShell: React.FC = () => {
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
    <div style={{ minHeight: '100%', backgroundColor: '#f7f4ee' }}>
      {/* Main Guard Viewport */}
      <main style={{ padding: '0' }}>{renderTabContent()}</main>

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
    </div>
  );
};
