import React from 'react';
import { UserPlus, Car, Package, Wrench, ChevronRight } from 'lucide-react';
import type { VisitorType } from '../../../domains/visitors';
import '../resident.css';
import './visitor.css';

export interface VisitorTypeSelectorProps {
  onSelectType: (type: VisitorType) => void;
  onCancel?: () => void;
}

export const VisitorTypeSelector: React.FC<VisitorTypeSelectorProps> = ({ onSelectType, onCancel }) => {
  const options = [
    {
      type: 'guest' as VisitorType,
      title: 'Guest / Family',
      description: 'Pre-approve entry for friends, family, or personal visitors.',
      icon: <UserPlus size={22} />,
    },
    {
      type: 'cab' as VisitorType,
      title: 'Cab / Taxi',
      description: 'Quick gate access for pickup or drop-off rides.',
      icon: <Car size={22} />,
    },
    {
      type: 'delivery' as VisitorType,
      title: 'Delivery Agent',
      description: 'Pre-clear food, parcel, or grocery delivery agents.',
      icon: <Package size={22} />,
    },
    {
      type: 'service' as VisitorType,
      title: 'Service / Workman',
      description: 'Plumber, electrician, carpenter, or appliance technician.',
      icon: <Wrench size={22} />,
    },
  ];

  return (
    <div className="vis-type-selector-container">
      <div className="vis-screen-header">
        <h2 className="vis-screen-title">Invite Visitor</h2>
        <p className="vis-screen-subtitle">Who are you inviting to Flat 1204 today?</p>
      </div>

      <div className="vis-type-grid">
        {options.map((opt) => (
          <button
            key={opt.type}
            className="vis-type-card"
            onClick={() => onSelectType(opt.type)}
          >
            <div className="vis-type-icon-wrapper">{opt.icon}</div>
            <div className="vis-type-info">
              <h3 className="vis-type-title">{opt.title}</h3>
              <p className="vis-type-desc">{opt.description}</p>
            </div>
            <ChevronRight size={18} className="vis-type-arrow" />
          </button>
        ))}
      </div>

      {onCancel && (
        <button className="res-btn-secondary" style={{ marginTop: '16px' }} onClick={onCancel}>
          Cancel & Back to Visitors
        </button>
      )}
    </div>
  );
};
