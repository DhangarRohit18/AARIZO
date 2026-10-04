import React, { useState, useEffect } from 'react';
import { usePrototype } from '../../../context/PrototypeContext';
import type { SupportTicket } from '../../../domains/support';
import { apiClient } from '../../../services/apiClient';
import { realtimeService } from '../../../services/realtimeService';
import { TicketCard } from './TicketCard';
import { TicketForm } from './TicketForm';
import { TicketDetail } from './TicketDetail';
import { Button, LoadingState, EmptyState, ErrorState, Toast, Tabs } from '../../common';
import { Plus, LifeBuoy, ArrowLeft } from 'lucide-react';
import '../resident.css';
import '../more/more.css';

export interface SupportHomeProps {
  onBackToMore: () => void;
}

type SupportView = 'list' | 'form' | 'detail';

export const SupportHome: React.FC<SupportHomeProps> = ({ onBackToMore }) => {
  const { uiState } = usePrototype();

  const [view, setView] = useState<SupportView>('list');
  const [tickets, setTickets] = useState<SupportTicket[]>([]);
  const [selectedTicket, setSelectedTicket] = useState<SupportTicket | null>(null);
  const [filterStatus, setFilterStatus] = useState<'all' | 'open' | 'in_progress' | 'resolved'>('all');
  const [toastMsg, setToastMsg] = useState<string | null>(null);

  const loadTickets = async () => {
    try {
      const dbTickets = await apiClient.getMaintenanceTickets();
      if (dbTickets && Array.isArray(dbTickets) && dbTickets.length > 0) {
        const mapped: SupportTicket[] = dbTickets.map((t: any) => ({
          id: t.id,
          ticketNumber: `TKT-${t.id.slice(-4).toUpperCase()}`,
          category: (t.category?.toLowerCase() || 'maintenance') as any,
          subject: t.title || 'Maintenance Request',
          description: t.description || '',
          locationArea: 'Flat 1204',
          status: (t.status?.toLowerCase() || 'open') as any,
          createdAt: new Date(t.createdAt).toLocaleDateString([], { month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit' }),
          updatedAt: new Date(t.updatedAt || t.createdAt).toLocaleDateString([], { month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit' }),
          assignedStaffName: t.assignedStaffName || 'Assigned Facility Executive',
          assignedStaffRole: 'Facility Desk',
          flatCode: '1204',
          tower: 'Tower B',
          updates: [],
        }));
        setTickets(mapped);
      }
    } catch (err) {
      console.error('Error fetching live maintenance tickets:', err);
    }
  };

  useEffect(() => {
    loadTickets();
    const unsub = realtimeService.subscribe('MAINTENANCE_STATUS', () => {
      loadTickets();
    });
    return () => unsub();
  }, []);

  // Handle Prototype UI State
  if (uiState === 'loading') {
    return <LoadingState message="Fetching Helpdesk tickets & SLA status..." />;
  }

  if (uiState === 'empty') {
    return (
      <div className="res-support-container">
        <div className="vis-main-header">
          <div>
            <h2 className="vis-screen-title">Support & Helpdesk</h2>
            <p className="vis-screen-subtitle">Flat 1204 • Maintenance Tickets</p>
          </div>
          <Button variant="primary" size="sm" onClick={() => setView('form')} leftIcon={<Plus size={16} />}>
            Raise Ticket
          </Button>
        </div>
        <EmptyState
          title="No Open Service Tickets"
          description="You currently have zero active or pending maintenance tickets."
          actionLabel="Raise First Ticket"
          onAction={() => setView('form')}
          icon={<LifeBuoy size={36} />}
        />
      </div>
    );
  }

  if (uiState === 'error') {
    return (
      <div className="res-support-container">
        <ErrorState
          title="Helpdesk Service Unavailable"
          message="Simulated connection timeout while connecting to Society Maintenance Server."
          onRetry={() => window.location.reload()}
        />
      </div>
    );
  }

  if (view === 'form') {
    return (
      <TicketForm
        onSubmit={async (newTicketData) => {
          const fullTicket: SupportTicket = {
            id: newTicketData.id || `tk-${Date.now().toString().slice(-4)}`,
            ticketNumber: newTicketData.ticketNumber || `TKT-${Date.now().toString().slice(-4)}`,
            category: newTicketData.category || 'maintenance',
            subject: newTicketData.subject || 'Maintenance Request',
            description: newTicketData.description || '',
            locationArea: newTicketData.locationArea || 'Flat 1204',
            status: 'open',
            createdAt: 'Just now',
            updatedAt: 'Just now',
            assignedStaffName: 'Facility Executive',
            assignedStaffRole: 'Facility Desk',
            flatCode: '1204',
            tower: 'Tower B',
            updates: [],
          };

          setTickets([fullTicket, ...tickets]);
          setSelectedTicket(fullTicket);
          setView('detail');
          setToastMsg(`Ticket ${fullTicket.ticketNumber} created successfully!`);

          // Persist to PostgreSQL backend database
          try {
            await apiClient.createMaintenanceTicket({
              societyId: 'soc-gvs',
              category: fullTicket.category,
              title: fullTicket.subject,
              description: fullTicket.description,
              priority: 'MEDIUM',
              status: 'OPEN',
              attachmentUrl: (fullTicket as any).attachmentUrl,
            });

            // Broadcast real-time event
            realtimeService.publish(
              'MAINTENANCE_STATUS',
              {
                ticketId: fullTicket.id,
                title: fullTicket.subject,
                category: fullTicket.category,
                status: 'OPEN',
              },
              'soc-gvs',
              'RESIDENT',
              'Helpdesk'
            );
          } catch (err) {
            console.error('Failed to create ticket in PostgreSQL:', err);
          }
        }}
        onBack={() => setView('list')}
      />
    );
  }

  if (view === 'detail' && selectedTicket) {
    return (
      <TicketDetail
        ticket={selectedTicket}
        onBack={() => setView('list')}
      />
    );
  }

  const filteredTickets = tickets.filter((t) => {
    if (filterStatus === 'all') return true;
    return t.status === filterStatus;
  });

  return (
    <div className="res-support-container">
      {toastMsg && <Toast message={toastMsg} type="success" onClose={() => setToastMsg(null)} />}

      <div className="res-support-header">
        <div className="res-header-title-group">
          <button className="vis-back-icon-btn" onClick={onBackToMore} aria-label="Back to More">
            <ArrowLeft size={18} />
          </button>
          <div>
            <h2 className="vis-screen-title">Helpdesk & Support</h2>
            <p className="vis-screen-subtitle">Service tickets for Flat 1204</p>
          </div>
        </div>
        <Button variant="primary" size="sm" onClick={() => setView('form')} leftIcon={<Plus size={16} />}>
          Raise Ticket
        </Button>
      </div>

      <Tabs
        tabs={[
          { id: 'all', label: 'All Tickets', badge: tickets.length },
          { id: 'open', label: 'Open' },
          { id: 'in_progress', label: 'In Progress' },
          { id: 'resolved', label: 'Resolved' },
        ]}
        activeTab={filterStatus}
        onChange={(id) => setFilterStatus(id as any)}
      />

      <div className="res-tickets-list">
        {filteredTickets.map((t) => (
          <TicketCard
            key={t.id}
            ticket={t}
            onClick={() => {
              setSelectedTicket(t);
              setView('detail');
            }}
          />
        ))}
      </div>
    </div>
  );
};
