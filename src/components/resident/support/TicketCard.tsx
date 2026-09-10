import React from 'react';
import type { SupportTicket } from '../../../domains/support';
import { getTicketStatusBadgeVariant, getTicketStatusLabel, getTicketCategoryLabel } from '../../../domains/support';
import { StatusBadge } from '../../common';
import { LifeBuoy, Clock, User, ChevronRight } from 'lucide-react';
import '../resident.css';
import '../more/more.css';

export interface TicketCardProps {
  ticket: SupportTicket;
  onClick?: () => void;
}

export const TicketCard: React.FC<TicketCardProps> = ({ ticket, onClick }) => {
  const badgeVariant = getTicketStatusBadgeVariant(ticket.status);

  return (
    <div className="res-ticket-card" onClick={onClick}>
      <div className="res-ticket-header">
        <div className="res-ticket-num-tag">
          <LifeBuoy size={14} className="ticket-ic" />
          <span>{ticket.ticketNumber}</span>
          <span className="res-ticket-cat-chip">{getTicketCategoryLabel(ticket.category)}</span>
        </div>
        <StatusBadge
          status={badgeVariant === 'warning' ? 'pending' : badgeVariant === 'info' ? 'syncing' : badgeVariant === 'success' ? 'resolved' : 'offline'}
          label={getTicketStatusLabel(ticket.status)}
        />
      </div>

      <h4 className="res-ticket-subject">{ticket.subject}</h4>
      <p className="res-ticket-desc-clamp">{ticket.description}</p>

      <div className="res-ticket-footer">
        <div className="res-ticket-meta">
          <span className="res-meta-item">
            <Clock size={12} />
            <span>{ticket.createdAt}</span>
          </span>
          {ticket.assignedStaffName && (
            <span className="res-meta-item">
              <User size={12} />
              <span>{ticket.assignedStaffName}</span>
            </span>
          )}
        </div>
        <ChevronRight size={16} className="res-ticket-arrow" />
      </div>
    </div>
  );
};
