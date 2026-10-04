import React, { useState, useEffect } from 'react';
import { usePrototype } from '../../../context/PrototypeContext';
import type { VisitorType, VisitorPass, VisitorPassStatus } from '../../../domains/visitors';
import { mockFrequentVisitors } from '../../../mockData/visitors/visitors';
import { mockVisitorHistory } from '../../../mockData/visitors/visitorHistory';
import { apiClient } from '../../../services/apiClient';
import { realtimeService } from '../../../services/realtimeService';

import { VisitorTypeSelector } from './VisitorTypeSelector';
import { VisitorForm } from './VisitorForm';
import { GatePassCreated } from './GatePassCreated';
import { ActiveVisitorCard } from './ActiveVisitorCard';
import { VisitorHistory } from './VisitorHistory';

import { UserPlus, History, Shield, Plus, UserCheck } from 'lucide-react';
import { Button, LoadingState, EmptyState, ErrorState, Toast } from '../../common';
import '../resident.css';
import './visitor.css';

type VisitorViewMode = 'home' | 'invite_type' | 'invite_form' | 'pass_created' | 'history';

export const VisitorHome: React.FC = () => {
  const { uiState } = usePrototype();

  const [viewMode, setViewMode] = useState<VisitorViewMode>('home');
  const [selectedVisitorType, setSelectedVisitorType] = useState<VisitorType>('guest');
  const [activePasses, setActivePasses] = useState<VisitorPass[]>([]);
  const [recentlyCreatedPass, setRecentlyCreatedPass] = useState<VisitorPass | null>(null);
  const [toastMessage, setToastMessage] = useState<string | null>(null);

  const loadPasses = async () => {
    try {
      const dbPasses = await apiClient.getVisitorPasses();
      if (dbPasses && Array.isArray(dbPasses) && dbPasses.length > 0) {
        const mapped: VisitorPass[] = dbPasses.map((p: any) => ({
          id: p.id,
          passcode: (p.id.slice(-4) || '8492'),
          visitorType: (p.passType?.toLowerCase() || 'guest') as any,
          visitorName: p.visitorName,
          visitorPhone: p.phone,
          vehicleNumber: p.vehicleNumber || undefined,
          purpose: p.purpose || undefined,
          flatCode: '1204',
          tower: 'Tower B',
          societyName: 'Green Valley Society',
          expectedDate: new Date(p.validFrom).toLocaleDateString([], { month: 'short', day: 'numeric' }),
          expectedTimeSlot: new Date(p.validFrom).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
          status: p.status === 'CHECKED_IN' ? 'active' : (p.status?.toLowerCase() || 'active'),
          createdAt: new Date(p.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
          validUntil: new Date(p.validTo).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
          gateName: 'Main Gate #1',
          notes: p.purpose,
        }));
        setActivePasses(mapped);
      }
    } catch {
      // Fallback
    }
  };

  useEffect(() => {
    loadPasses();
    const unsub = realtimeService.subscribe('*', () => {
      loadPasses();
    });
    return () => unsub();
  }, []);

  // Handle Prototype UI States
  if (uiState === 'loading') {
    return <LoadingState message="Fetching active visitor passes & gate logs..." />;
  }

  if (uiState === 'empty') {
    return (
      <div className="vis-home-container">
        <div className="vis-main-header">
          <div>
            <h2 className="vis-screen-title">Visitors & Gate Passes</h2>
            <p className="vis-screen-subtitle">Flat 1204 • Lakeview Residency</p>
          </div>
          <Button
            variant="primary"
            size="sm"
            onClick={() => setViewMode('invite_type')}
            leftIcon={<UserPlus size={16} />}
          >
            Invite Visitor
          </Button>
        </div>
        <EmptyState
          title="No Expected Visitors"
          description="You have no active or scheduled gate passes for today."
          actionLabel="+ Invite First Visitor"
          onAction={() => setViewMode('invite_type')}
          icon={<Shield size={36} />}
        />
      </div>
    );
  }

  if (uiState === 'error') {
    return (
      <div className="vis-home-container">
        <ErrorState
          title="Gate Gateway Unreachable"
          message="Simulated connection error between Visitor Terminal and Main Gate Intercom."
          onRetry={() => window.location.reload()}
        />
      </div>
    );
  }

  // Handle Navigation Views inside Visitor Management
  if (viewMode === 'invite_type') {
    return (
      <VisitorTypeSelector
        onSelectType={(type) => {
          setSelectedVisitorType(type);
          setViewMode('invite_form');
        }}
        onCancel={() => setViewMode('home')}
      />
    );
  }

  if (viewMode === 'invite_form') {
    return (
      <VisitorForm
        visitorType={selectedVisitorType}
        onSubmit={async (newPassData) => {
          const generatedPass: VisitorPass = {
            id: `pass-${Date.now().toString().slice(-4)}`,
            passcode: newPassData.passcode || '8492',
            visitorType: newPassData.visitorType || selectedVisitorType,
            visitorName: newPassData.visitorName || 'Guest Visitor',
            visitorPhone: newPassData.visitorPhone,
            vehicleNumber: newPassData.vehicleNumber,
            companyName: newPassData.companyName,
            serviceCategory: newPassData.serviceCategory,
            flatCode: '1204',
            tower: 'Tower B',
            societyName: 'Green Valley Society',
            expectedDate: newPassData.expectedDate || 'Today',
            expectedTimeSlot: newPassData.expectedTimeSlot || 'Just now',
            status: 'active',
            createdAt: 'Just now',
            validUntil: newPassData.validUntil || 'Today, 11:59 PM',
            gateName: 'Main Gate #1',
            notes: newPassData.notes,
          };

          setActivePasses([generatedPass, ...activePasses]);
          setRecentlyCreatedPass(generatedPass);
          setViewMode('pass_created');
          setToastMessage(`Gate pass generated for ${generatedPass.visitorName}`);

          // Persist to PostgreSQL backend database
          try {
            await apiClient.createVisitorPass({
              societyId: 'soc-gvs',
              visitorName: generatedPass.visitorName,
              phone: generatedPass.visitorPhone || '9876543210',
              passType: (generatedPass.visitorType || 'GUEST').toUpperCase(),
              vehicleNumber: generatedPass.vehicleNumber || null,
              purpose: generatedPass.notes || 'Guest Visitor',
              validFrom: new Date(),
              validTo: new Date(Date.now() + 86400000),
              status: 'APPROVED',
            });

            // Broadcast real-time event across network & local tabs
            realtimeService.publish(
              'VISITOR_ARRIVAL',
              {
                visitorName: generatedPass.visitorName,
                flatCode: 'B-1204',
                passType: (generatedPass.visitorType || 'GUEST').toUpperCase(),
                gate: 'Main Gate #1',
              },
              'soc-gvs',
              'RESIDENT',
              'Resident Portal'
            );
          } catch (err) {
            console.error('Failed to persist visitor pass to PostgreSQL:', err);
          }
        }}
        onBack={() => setViewMode('invite_type')}
      />
    );
  }

  if (viewMode === 'pass_created' && recentlyCreatedPass) {
    return (
      <GatePassCreated
        pass={recentlyCreatedPass}
        onDone={() => setViewMode('home')}
        onCancelPass={() => {
          setActivePasses(activePasses.filter((p) => p.id !== recentlyCreatedPass.id));
          setViewMode('home');
          setToastMessage('Gate pass cancelled');
        }}
      />
    );
  }

  if (viewMode === 'history') {
    return (
      <VisitorHistory
        historyLogs={mockVisitorHistory}
        onBack={() => setViewMode('home')}
      />
    );
  }

  // Handle Lifecycle Status Transitions
  const handleStatusChange = (passId: string, newStatus: VisitorPassStatus) => {
    setActivePasses(
      activePasses.map((p) => (p.id === passId ? { ...p, status: newStatus } : p))
    );
    setToastMessage(`Visitor status updated to ${newStatus.replace('_', ' ')}`);
  };

  const handleCancelPass = (passId: string) => {
    setActivePasses(
      activePasses.map((p) => (p.id === passId ? { ...p, status: 'cancelled' } : p))
    );
    setToastMessage('Gate pass has been cancelled');
  };

  const todayPasses = activePasses.filter((p) => p.status !== 'checked_out' && p.status !== 'cancelled');

  return (
    <div className="vis-home-container">
      {/* Toast Notification feedback */}
      {toastMessage && (
        <Toast
          message={toastMessage}
          type="success"
          onClose={() => setToastMessage(null)}
        />
      )}

      {/* Main Visitor Screen Header */}
      <div className="vis-main-header">
        <div>
          <h2 className="vis-screen-title">Visitors & Gate Passes</h2>
          <p className="vis-screen-subtitle">Flat 1204 • Lakeview Residency</p>
        </div>
        <Button
          variant="primary"
          size="sm"
          onClick={() => setViewMode('invite_type')}
          leftIcon={<Plus size={16} />}
        >
          Invite Visitor
        </Button>
      </div>

      {/* Section 1: Active / Today's Visitors */}
      <section className="vis-section">
        <div className="vis-section-title-row">
          <div className="res-title-with-icon">
            <UserCheck size={18} className="res-section-ic" />
            <h3 className="res-section-heading">Today's Active Passes</h3>
          </div>
          <span className="vis-counter-badge">{todayPasses.length} Active</span>
        </div>

        {todayPasses.length === 0 ? (
          <div className="vis-empty-card">
            <p>No active expected visitors right now.</p>
          </div>
        ) : (
          <div className="vis-active-passes-list">
            {todayPasses.map((pass) => (
              <ActiveVisitorCard
                key={pass.id}
                pass={pass}
                onStatusChange={handleStatusChange}
                onCancelPass={handleCancelPass}
              />
            ))}
          </div>
        )}
      </section>

      {/* Section 2: Frequent Visitors */}
      <section className="vis-section">
        <div className="vis-section-title-row">
          <h3 className="res-section-heading">Frequent Visitors (Daily Staff)</h3>
        </div>

        <div className="vis-frequent-grid">
          {mockFrequentVisitors.map((freq) => (
            <div key={freq.id} className="vis-frequent-card">
              <div className="vis-frequent-avatar">{freq.avatarInitials}</div>
              <div className="vis-frequent-meta">
                <h4 className="vis-frequent-name">{freq.name}</h4>
                <span className="vis-frequent-cat">{freq.categoryLabel}</span>
              </div>
              <Button
                variant="outline"
                size="sm"
                onClick={() => {
                  setSelectedVisitorType('guest');
                  setViewMode('invite_form');
                }}
              >
                Allow Entry
              </Button>
            </div>
          ))}
        </div>
      </section>

      {/* Section 3: History Trigger Link */}
      <section className="vis-history-trigger-box" onClick={() => setViewMode('history')}>
        <div className="vis-hist-trigger-left">
          <History size={20} className="hist-ic" />
          <div>
            <h4 className="vis-hist-trigger-title">View Gate History Logs</h4>
            <p className="vis-hist-trigger-sub">Check past visitor entries, check-in, and exit times</p>
          </div>
        </div>
        <Button variant="ghost" size="sm">
          View History
        </Button>
      </section>
    </div>
  );
};
