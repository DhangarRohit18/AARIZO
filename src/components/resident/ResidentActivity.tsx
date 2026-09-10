import React from 'react';
import { Calendar, Wrench, CreditCard, LifeBuoy, ArrowUpRight, Clock } from 'lucide-react';
import type { UpcomingActivityMock, AccountSnapshotMock } from '../../mockData/residentHomeData';
import { Badge } from '../common';
import './resident.css';

export interface ResidentActivityProps {
  activities: UpcomingActivityMock[];
  snapshot: AccountSnapshotMock;
  onPayDuesClick?: () => void;
  onActivityClick?: (id: string) => void;
}

export const ResidentActivity: React.FC<ResidentActivityProps> = ({
  activities,
  snapshot,
  onPayDuesClick,
  onActivityClick,
}) => {
  const getActivityIcon = (type: string) => {
    switch (type) {
      case 'amenity':
        return <Calendar size={16} />;
      case 'maintenance':
        return <Wrench size={16} />;
      default:
        return <Clock size={16} />;
    }
  };

  return (
    <div className="res-activity-wrapper">
      {/* Account / Community Snapshot */}
      <section className="res-snapshot-card">
        <div className="res-snapshot-item highlight-dues">
          <div className="res-snapshot-left">
            <CreditCard size={18} className="snapshot-ic-dues" />
            <div>
              <span className="res-snapshot-label">Maintenance Dues</span>
              <div className="res-snapshot-amount">₹{snapshot.maintenanceDueAmount.toLocaleString('en-IN')}</div>
              <span className="res-snapshot-sub">Due by {snapshot.dueDate}</span>
            </div>
          </div>
          <button className="res-btn-pay-sm" onClick={onPayDuesClick}>
            <span>Pay Now</span>
            <ArrowUpRight size={14} />
          </button>
        </div>

        <div className="res-snapshot-divider" />

        <div className="res-snapshot-row">
          <div className="res-snapshot-subitem">
            <LifeBuoy size={15} className="snapshot-ic-ticket" />
            <span>{snapshot.openTicketsCount} Open Helpdesk Ticket</span>
          </div>
          <div className="res-snapshot-subitem">
            <Calendar size={15} className="snapshot-ic-booking" />
            <span>{snapshot.upcomingBookingsCount} Upcoming Booking</span>
          </div>
        </div>
      </section>

      {/* Upcoming Activities List */}
      <section className="res-upcoming-section">
        <h3 className="res-section-heading">Upcoming Activities</h3>
        <div className="res-activities-list">
          {activities.map((act) => (
            <div
              key={act.id}
              className="res-activity-item"
              onClick={() => onActivityClick && onActivityClick(act.id)}
            >
              <div className="res-act-icon-box">{getActivityIcon(act.type)}</div>
              <div className="res-act-details">
                <div className="res-act-top-row">
                  <h4 className="res-act-title">{act.title}</h4>
                  <Badge variant="primary" size="sm">
                    {act.statusBadge}
                  </Badge>
                </div>
                <div className="res-act-sub">{act.subtitle}</div>
                <div className="res-act-time">{act.timeSlot}</div>
              </div>
            </div>
          ))}
        </div>
      </section>
    </div>
  );
};
