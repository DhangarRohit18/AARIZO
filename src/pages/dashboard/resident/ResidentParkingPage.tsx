import React, { useState } from 'react';
import { Car, Plus, QrCode } from 'lucide-react';
import { parkingService } from '../../../services/parkingService';
import type { ParkingSlot, ParkingLog, RequestType } from '../../../types/parking';
import { StatusBadge } from '../../../components/ui/StatusBadge';
import { Modal } from '../../../components/ui/Modal';
import { Form, FormField } from '../../../components/ui/Form';
import { QRGenerator } from '../../../components/ui/QRGenerator';

export const ResidentParkingPage: React.FC = () => {
  const currentSocietyId = 'soc-gvs';
  const currentResidentId = 'res-1'; // Vikram Joshi (B-1204)

  const [assignedSlots, setAssignedSlots] = useState<ParkingSlot[]>(
    parkingService.getSlots(currentSocietyId).filter((s) => s.assignedFlatCode === 'B-1204')
  );
  const [logs] = useState<ParkingLog[]>(
    parkingService.getLogs(currentSocietyId).filter((l) => l.flatCode === 'B-1204')
  );

  const [isApplyModalOpen, setIsApplyModalOpen] = useState(false);
  const [selectedSlotForQR, setSelectedSlotForQR] = useState<ParkingSlot | null>(null);

  // Apply Form
  const [vehicleNumber, setVehicleNumber] = useState('');
  const [vehicleType, setVehicleType] = useState<'CAR' | 'BIKE' | 'EV'>('CAR');
  const [requestType, setRequestType] = useState<RequestType>('TEMPORARY');
  const [startDate, setStartDate] = useState('');
  const [endDate, setEndDate] = useState('');

  const refreshData = () => {
    setAssignedSlots(
      parkingService.getSlots(currentSocietyId).filter((s) => s.assignedFlatCode === 'B-1204')
    );
  };

  const handleApplyParking = (e: React.FormEvent) => {
    e.preventDefault();
    if (!vehicleNumber) return;

    parkingService.createParkingRequest(
      {
        societyId: currentSocietyId,
        residentId: currentResidentId,
        residentName: 'Vikram Joshi',
        flatCode: 'B-1204',
        vehicleNumber: vehicleNumber.toUpperCase(),
        vehicleType,
        requestType,
        startDate,
        endDate,
      },
      { id: currentResidentId, name: 'Vikram Joshi', role: 'RESIDENT' }
    );

    refreshData();
    alert('Parking application submitted successfully to Society Admin for allocation!');
    setIsApplyModalOpen(false);
    setVehicleNumber('');
  };

  return (
    <div style={{ padding: '1.5rem', maxWidth: '1000px', margin: '0 auto', fontFamily: 'sans-serif' }}>
      <header style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.5rem' }}>
        <div>
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
            <Car size={24} color="#2563eb" />
            <h1 style={{ margin: 0, fontSize: '1.4rem', color: '#0f172a' }}>Resident Parking Hub</h1>
          </div>
          <p style={{ margin: '0.25rem 0 0 0', color: '#64748b', fontSize: '0.85rem' }}>
            View allocated parking bays, digital QR parking passes, and apply for temporary slots.
          </p>
        </div>
        <button
          onClick={() => setIsApplyModalOpen(true)}
          style={{
            display: 'flex',
            alignItems: 'center',
            gap: '0.4rem',
            padding: '0.6rem 1.2rem',
            background: '#2563eb',
            color: '#fff',
            borderRadius: '8px',
            border: 'none',
            fontWeight: 600,
            cursor: 'pointer',
          }}
        >
          <Plus size={18} /> Apply for Slot
        </button>
      </header>

      {/* Allocated Slots Section */}
      <section style={{ marginBottom: '2rem' }}>
        <h3 style={{ margin: '0 0 1rem 0', color: '#0f172a' }}>Your Allocated Parking Bays</h3>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(300px, 1fr))', gap: '1rem' }}>
          {assignedSlots.map((slot) => (
            <div key={slot.id} style={{ padding: '1.25rem', background: '#fff', borderRadius: '12px', border: '1px solid #e2e8f0' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '0.75rem' }}>
                <div>
                  <span style={{ fontSize: '0.75rem', fontWeight: 700, color: '#2563eb' }}>{slot.level}</span>
                  <h4 style={{ margin: 0, fontSize: '1.3rem', color: '#0f172a' }}>Slot {slot.slotNumber}</h4>
                </div>
                <StatusBadge label={slot.occupancyState} variant={slot.occupancyState === 'OCCUPIED' ? 'danger' : 'success'} />
              </div>

              <div style={{ fontSize: '0.85rem', color: '#475569', marginBottom: '1rem' }}>
                Registered Vehicle: <strong>{slot.assignedVehicleNumber || 'N/A'}</strong>
              </div>

              <button
                onClick={() => setSelectedSlotForQR(slot)}
                style={{
                  width: '100%',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  gap: '0.4rem',
                  padding: '0.55rem',
                  borderRadius: '8px',
                  border: '1px solid #bfdbfe',
                  background: '#eff6ff',
                  color: '#1d4ed8',
                  fontWeight: 600,
                  cursor: 'pointer',
                }}
              >
                <QrCode size={16} /> Digital Parking QR Permit
              </button>
            </div>
          ))}
        </div>
      </section>

      {/* Entry/Exit History Section */}
      <section>
        <h3 style={{ margin: '0 0 1rem 0', color: '#0f172a' }}>Vehicle Entry & Exit Log</h3>
        <div style={{ background: '#fff', borderRadius: '12px', border: '1px solid #e2e8f0', padding: '1rem', display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
          {logs.map((log) => (
            <div key={log.id} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '0.65rem 0.85rem', background: '#f8fafc', borderRadius: '8px' }}>
              <div>
                <span style={{ fontWeight: 600, color: '#0f172a' }}>{log.vehicleNumber}</span>{' '}
                <span style={{ fontSize: '0.8rem', color: '#64748b' }}>at Slot {log.slotNumber}</span>
              </div>
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
                <span style={{ fontSize: '0.75rem', color: '#94a3b8' }}>{log.timestamp}</span>
                <StatusBadge label={log.action} variant={log.action === 'ENTRY' ? 'success' : 'neutral'} size="sm" />
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* Apply Modal */}
      <Modal isOpen={isApplyModalOpen} onClose={() => setIsApplyModalOpen(false)} title="Apply for Parking Slot">
        <Form onSubmit={handleApplyParking}>
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
            <FormField label="Vehicle Number" required>
              <input
                type="text"
                required
                value={vehicleNumber}
                onChange={(e) => setVehicleNumber(e.target.value.toUpperCase())}
                placeholder="e.g. KA-01-MH-5544"
                style={{ padding: '0.6rem', borderRadius: '8px', border: '1px solid #cbd5e1' }}
              />
            </FormField>

            <FormField label="Vehicle Type">
              <select
                value={vehicleType}
                onChange={(e) => setVehicleType(e.target.value as any)}
                style={{ padding: '0.6rem', borderRadius: '8px', border: '1px solid #cbd5e1', background: '#fff' }}
              >
                <option value="CAR">Car / SUV</option>
                <option value="BIKE">Two-Wheeler / Bike</option>
                <option value="EV">Electric Vehicle (EV)</option>
              </select>
            </FormField>
          </div>

          <FormField label="Application Type">
            <select
              value={requestType}
              onChange={(e) => setRequestType(e.target.value as RequestType)}
              style={{ padding: '0.6rem', borderRadius: '8px', border: '1px solid #cbd5e1', background: '#fff' }}
            >
              <option value="TEMPORARY">Temporary Guest Parking (Time-limited)</option>
              <option value="PERMANENT">Second Car Permanent Assignment</option>
            </select>
          </FormField>

          {requestType === 'TEMPORARY' && (
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
              <FormField label="Start Date">
                <input
                  type="date"
                  value={startDate}
                  onChange={(e) => setStartDate(e.target.value)}
                  style={{ padding: '0.6rem', borderRadius: '8px', border: '1px solid #cbd5e1' }}
                />
              </FormField>
              <FormField label="End Date">
                <input
                  type="date"
                  value={endDate}
                  onChange={(e) => setEndDate(e.target.value)}
                  style={{ padding: '0.6rem', borderRadius: '8px', border: '1px solid #cbd5e1' }}
                />
              </FormField>
            </div>
          )}

          <div style={{ display: 'flex', gap: '0.75rem', marginTop: '1rem' }}>
            <button type="button" onClick={() => setIsApplyModalOpen(false)} style={{ flex: 1, padding: '0.65rem', borderRadius: '8px', border: '1px solid #cbd5e1', background: '#fff' }}>Cancel</button>
            <button type="submit" style={{ flex: 1, padding: '0.65rem', borderRadius: '8px', border: 'none', background: '#2563eb', color: '#fff', fontWeight: 600 }}>Submit Application</button>
          </div>
        </Form>
      </Modal>

      {/* Parking QR Modal */}
      {selectedSlotForQR && (
        <Modal isOpen={!!selectedSlotForQR} onClose={() => setSelectedSlotForQR(null)} title={`Parking Pass — ${selectedSlotForQR.slotNumber}`}>
          <div style={{ textAlign: 'center' }}>
            <p style={{ margin: '0 0 1rem 0', color: '#64748b', fontSize: '0.85rem' }}>
              Scan QR code at gate scanner for automatic parking slot entry/exit clearance.
            </p>
            <QRGenerator value={selectedSlotForQR.qrDataString} label={`${selectedSlotForQR.slotNumber} • ${selectedSlotForQR.assignedVehicleNumber}`} size={180} />
          </div>
        </Modal>
      )}
    </div>
  );
};
