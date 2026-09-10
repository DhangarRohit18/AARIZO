import React, { useState } from 'react';
import { usePrototype } from '../../../context/PrototypeContext';
import type { SupportTicket } from '../../../domains/support';
import { initialMockTickets } from '../../../mockData/support/tickets';
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
  const [tickets, setTickets] = useState<SupportTicket[]>(initialMockTickets);
  const [selectedTicket, setSelectedTicket] = useState<SupportTicket | null>(null);
  const [filterStatus, setFilterStatus] = useState<'all' | 'open' | 'in_progress' | 'resolved'>('all');
  const [toastMsg, setToastMsg] = useState<string | null>(null);

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
        onSubmit={(newTicketData) => {
          const fullTicket = newTicketData as SupportTicket;
          setTickets([fullTicket, ...tickets]);
          setSelectedTicket(fullTicket);
          setView('detail');
          setToastMsg(`Ticket ${fullTicket.ticketNumber} created successfully!`);
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
