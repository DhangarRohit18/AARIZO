import React, { useState } from 'react';
import type { TicketCategory, SupportTicket } from '../../../domains/support';
import { Input, Select, Button } from '../../common';
import { ArrowLeft } from 'lucide-react';
import '../resident.css';
import '../more/more.css';

export interface TicketFormProps {
  onSubmit: (newTicket: Partial<SupportTicket>) => void;
  onBack: () => void;
}

export const TicketForm: React.FC<TicketFormProps> = ({ onSubmit, onBack }) => {
  const [category, setCategory] = useState<TicketCategory>('plumbing');
  const [subject, setSubject] = useState('');
  const [description, setDescription] = useState('');
  const [locationArea, setLocationArea] = useState('Flat 1204');

  const [errors, setErrors] = useState<{ [key: string]: string }>({});

  const validate = () => {
    const errs: { [key: string]: string } = {};

    if (!subject.trim()) {
      errs.subject = 'Subject line is required';
    }

    if (!description.trim()) {
      errs.description = 'Please describe the issue in detail';
    }

    setErrors(errs);
    return Object.keys(errs).length === 0;
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!validate()) return;

    const mockId = `tk-${Math.floor(1000 + Math.random() * 9000)}`;

    onSubmit({
      id: mockId,
      ticketNumber: mockId.toUpperCase(),
      category,
      subject: subject.trim(),
      description: description.trim(),
      locationArea: locationArea.trim() || 'Flat 1204',
      status: 'open',
      createdAt: 'Just now',
      updatedAt: 'Just now',
      flatCode: '1204',
      tower: 'Tower B',
      updates: [
        {
          id: `up-${Date.now()}`,
          timestamp: 'Just now',
          authorName: 'Sarvesh Kulkarni',
          authorRole: 'resident',
          message: 'Ticket created and submitted for estate dispatch.',
        },
      ],
    });
  };

  return (
    <form className="res-ticket-form-container" onSubmit={handleSubmit}>
      <div className="res-screen-header">
        <button className="vis-back-icon-btn" type="button" onClick={onBack} aria-label="Back">
          <ArrowLeft size={18} />
        </button>
        <div>
          <h2 className="vis-screen-title">Raise Helpdesk Ticket</h2>
          <p className="vis-screen-subtitle">Report a maintenance or facility issue for Flat 1204</p>
        </div>
      </div>

      <Select
        label="Issue Category *"
        value={category}
        onChange={(e) => setCategory(e.target.value as TicketCategory)}
        options={[
          { value: 'plumbing', label: 'Plumbing & Water' },
          { value: 'electrical', label: 'Electrical & Power' },
          { value: 'maintenance', label: 'General Maintenance' },
          { value: 'housekeeping', label: 'Housekeeping & Cleanliness' },
          { value: 'security', label: 'Security & Gate Issue' },
          { value: 'common_area', label: 'Common Area & Amenities' },
          { value: 'other', label: 'Other Issue' },
        ]}
      />

      <Input
        label="Ticket Subject / Title *"
        placeholder="e.g. Water leak in kitchen pipe"
        value={subject}
        onChange={(e) => setSubject(e.target.value)}
        error={errors.subject}
      />

      <div className="input-group">
        <label className="input-label">Detailed Description *</label>
        <textarea
          className={`input-field res-textarea ${errors.description ? 'input-error' : ''}`}
          placeholder="Please explain the issue, time observed, and any urgent access requirements..."
          rows={4}
          value={description}
          onChange={(e) => setDescription(e.target.value)}
        />
        {errors.description && <p className="input-error-message">{errors.description}</p>}
      </div>

      <Input
        label="Location / Area (Optional)"
        placeholder="e.g. Flat 1204 Master Bathroom"
        value={locationArea}
        onChange={(e) => setLocationArea(e.target.value)}
      />

      <div className="vis-form-actions">
        <Button variant="outline" type="button" onClick={onBack}>
          Cancel
        </Button>
        <Button variant="primary" type="submit">
          Submit Ticket
        </Button>
      </div>
    </form>
  );
};
