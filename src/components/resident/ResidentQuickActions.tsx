import React from 'react';
import { UserPlus, CreditCard, Calendar, LifeBuoy, Package, AlertOctagon } from 'lucide-react';
import './resident.css';

export interface ResidentQuickActionsProps {
  onActionClick?: (actionId: string) => void;
}

export const ResidentQuickActions: React.FC<ResidentQuickActionsProps> = ({ onActionClick }) => {
  const primaryActions = [
    { id: 'invite_visitor', label: 'Invite Visitor', icon: <UserPlus size={18} /> },
    { id: 'pay_maintenance', label: 'Pay Dues', icon: <CreditCard size={18} /> },
    { id: 'book_amenity', label: 'Book Amenity', icon: <Calendar size={18} /> },
    { id: 'raise_ticket', label: 'Raise Ticket', icon: <LifeBuoy size={18} /> },
  ];

  const secondaryActions = [
    { id: 'delivery_pass', label: 'Delivery Pass', icon: <Package size={16} /> },
    { id: 'emergency_sos', label: 'Emergency SOS', icon: <AlertOctagon size={16} />, danger: true },
  ];

  return (
    <section className="res-quick-actions-section">
      <div className="res-section-title-row">
        <h3 className="res-section-heading">Quick Actions</h3>
      </div>

      {/* Primary 2x2 Action Grid */}
      <div className="res-primary-quick-grid">
        {primaryActions.map((act) => (
          <button
            key={act.id}
            className="res-primary-quick-btn"
            onClick={() => onActionClick && onActionClick(act.id)}
          >
            <div className="res-quick-icon">{act.icon}</div>
            <span className="res-quick-label">{act.label}</span>
          </button>
        ))}
      </div>

      {/* Secondary Action Row */}
      <div className="res-secondary-quick-row">
        {secondaryActions.map((act) => (
          <button
            key={act.id}
            className={`res-secondary-quick-btn ${act.danger ? 'res-secondary-danger' : ''}`}
            onClick={() => onActionClick && onActionClick(act.id)}
          >
            {act.icon}
            <span>{act.label}</span>
          </button>
        ))}
      </div>
    </section>
  );
};
