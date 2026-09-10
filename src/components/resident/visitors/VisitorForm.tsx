import React, { useState } from 'react';
import type { VisitorType, VisitorPass } from '../../../domains/visitors';
import { Input, Select, Button } from '../../common';
import '../resident.css';
import './visitor.css';

export interface VisitorFormProps {
  visitorType: VisitorType;
  onSubmit: (passData: Partial<VisitorPass>) => void;
  onBack: () => void;
}

export const VisitorForm: React.FC<VisitorFormProps> = ({ visitorType, onSubmit, onBack }) => {
  const [name, setName] = useState('');
  const [phone, setPhone] = useState('');
  const [vehicleNumber, setVehicleNumber] = useState('');
  const [companyName, setCompanyName] = useState('Express Food Delivery');
  const [serviceCategory, setServiceCategory] = useState('Plumbing');
  const [expectedDate, setExpectedDate] = useState('Today (06 Sep 2026)');
  const [timeSlot, setTimeSlot] = useState('06:00 PM – 09:00 PM');
  const [notes, setNotes] = useState('');

  const [errors, setErrors] = useState<{ [key: string]: string }>({});

  const validate = () => {
    const errs: { [key: string]: string } = {};

    if (visitorType === 'guest' || visitorType === 'service') {
      if (!name.trim()) {
        errs.name = 'Visitor name is required';
      }
    }

    if (visitorType === 'cab') {
      if (!vehicleNumber.trim()) {
        errs.vehicleNumber = 'Vehicle plate number is required (e.g. MH 02 EQ 8821)';
      }
    }

    if (phone.trim() && !/^\+?[0-9\s-]{8,14}$/.test(phone.trim())) {
      errs.phone = 'Please enter a valid phone number';
    }

    setErrors(errs);
    return Object.keys(errs).length === 0;
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!validate()) return;

    // Generate mock passcode
    const mockPasscode = Math.floor(1000 + Math.random() * 9000).toString();

    onSubmit({
      visitorType,
      visitorName: name.trim() || (visitorType === 'cab' ? `Cab (${vehicleNumber})` : `${visitorType.toUpperCase()} Agent`),
      visitorPhone: phone.trim() || undefined,
      vehicleNumber: vehicleNumber.trim() || undefined,
      companyName: visitorType === 'delivery' ? companyName : undefined,
      serviceCategory: visitorType === 'service' ? serviceCategory : undefined,
      expectedDate,
      expectedTimeSlot: timeSlot,
      notes: notes.trim() || undefined,
      passcode: mockPasscode,
      flatCode: '1204',
      tower: 'Tower B',
      societyName: 'Lakeview Residency',
      status: 'active',
      validUntil: 'Today, 11:59 PM',
      gateName: 'Main Gate #1',
    });
  };

  const getTypeTitle = () => {
    switch (visitorType) {
      case 'guest':
        return 'Guest Details';
      case 'cab':
        return 'Cab Access Pass';
      case 'delivery':
        return 'Delivery Entry Details';
      case 'service':
        return 'Service Worker Details';
    }
  };

  return (
    <form className="vis-form-container" onSubmit={handleSubmit}>
      <div className="vis-screen-header">
        <h2 className="vis-screen-title">{getTypeTitle()}</h2>
        <p className="vis-screen-subtitle">Fill in expected arrival information for Gate Pass</p>
      </div>

      {/* Guest & Service Name Field */}
      {(visitorType === 'guest' || visitorType === 'service') && (
        <Input
          label={visitorType === 'guest' ? 'Guest Full Name *' : 'Worker / Technician Name *'}
          placeholder={visitorType === 'guest' ? 'e.g. Rahul Sharma' : 'e.g. Ramesh Kumar'}
          value={name}
          onChange={(e) => setName(e.target.value)}
          error={errors.name}
        />
      )}

      {/* Cab Driver / Vehicle Field */}
      {visitorType === 'cab' && (
        <Input
          label="Cab Plate / Vehicle Number *"
          placeholder="e.g. MH 02 EQ 8821"
          value={vehicleNumber}
          onChange={(e) => setVehicleNumber(e.target.value)}
          error={errors.vehicleNumber}
        />
      )}

      {/* Delivery Type Dropdown */}
      {visitorType === 'delivery' && (
        <Select
          label="Delivery Category"
          value={companyName}
          onChange={(e) => setCompanyName(e.target.value)}
          options={[
            { value: 'Express Food Delivery', label: 'Food Delivery' },
            { value: 'Parcel Courier', label: 'Parcel / E-commerce' },
            { value: 'Grocery Delivery', label: 'Grocery Store' },
            { value: 'Water Supplier', label: 'Water Can Supplier' },
          ]}
        />
      )}

      {/* Service Category Dropdown */}
      {visitorType === 'service' && (
        <Select
          label="Service Work Category"
          value={serviceCategory}
          onChange={(e) => setServiceCategory(e.target.value)}
          options={[
            { value: 'Plumbing', label: 'Plumbing & Pipe Repair' },
            { value: 'Electrical', label: 'Electrical Work' },
            { value: 'Carpentry', label: 'Carpentry & Furniture' },
            { value: 'AC Repair', label: 'Air Conditioning Service' },
            { value: 'Pest Control', label: 'Pest Control' },
          ]}
        />
      )}

      {/* Phone Number Field */}
      <Input
        label="Visitor Phone Number (Optional)"
        placeholder="e.g. +91 98765 43210"
        value={phone}
        onChange={(e) => setPhone(e.target.value)}
        error={errors.phone}
      />

      {/* Date & Time Selectors */}
      <div className="vis-form-row">
        <Select
          label="Visit Date"
          value={expectedDate}
          onChange={(e) => setExpectedDate(e.target.value)}
          options={[
            { value: 'Today (06 Sep 2026)', label: 'Today (06 Sep)' },
            { value: 'Tomorrow (07 Sep 2026)', label: 'Tomorrow (07 Sep)' },
            { value: '08 Sep 2026', label: '08 Sep 2026' },
          ]}
        />

        <Select
          label="Expected Arrival"
          value={timeSlot}
          onChange={(e) => setTimeSlot(e.target.value)}
          options={[
            { value: 'Just now', label: 'Immediate / Right Now' },
            { value: '06:00 PM – 09:00 PM', label: 'Evening (6 PM - 9 PM)' },
            { value: '10:00 AM – 01:00 PM', label: 'Morning (10 AM - 1 PM)' },
            { value: '02:00 PM – 05:00 PM', label: 'Afternoon (2 PM - 5 PM)' },
          ]}
        />
      </div>

      {/* Optional Note */}
      <Input
        label="Note for Gate Security (Optional)"
        placeholder="e.g. Allow parking at Slot B-12"
        value={notes}
        onChange={(e) => setNotes(e.target.value)}
      />

      <div className="vis-form-actions">
        <Button variant="outline" type="button" onClick={onBack}>
          Back
        </Button>
        <Button variant="primary" type="submit">
          Generate Gate Pass
        </Button>
      </div>
    </form>
  );
};
