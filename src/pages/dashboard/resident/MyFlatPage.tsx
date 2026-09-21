import React, { useState } from 'react';
import { Home, Users, Car, UserCheck, Plus } from 'lucide-react';
import { societyService } from '../../../services/societyService';
import type { FamilyMember, Vehicle, DomesticWorker } from '../../../types/society';
import { StatusBadge } from '../../../components/ui/StatusBadge';
import { Modal } from '../../../components/ui/Modal';
import { Form, FormField } from '../../../components/ui/Form';

export const MyFlatPage: React.FC = () => {
  const currentSocietyId = 'soc-gvs';
  const currentResidentId = 'res-1'; // Vikram Joshi (Flat B-1204)

  const [familyMembers, setFamilyMembers] = useState<FamilyMember[]>(
    societyService.getFamilyMembers(currentSocietyId, currentResidentId)
  );
  const [vehicles, setVehicles] = useState<Vehicle[]>(
    societyService.getVehicles(currentSocietyId, currentResidentId)
  );
  const domesticWorkers: DomesticWorker[] = societyService
    .getDomesticWorkers(currentSocietyId)
    .filter((dw) => dw.assignedFlatIds.includes('flat-1204'));

  // Modals
  const [isFamilyModalOpen, setIsFamilyModalOpen] = useState(false);
  const [isVehicleModalOpen, setIsVehicleModalOpen] = useState(false);

  // Form states
  const [famName, setFamName] = useState('');
  const [relationship, setRelationship] = useState<FamilyMember['relationship']>('SPOUSE');
  const [famPhone, setFamPhone] = useState('');

  const [regNumber, setRegNumber] = useState('');
  const [vehType, setVehType] = useState<Vehicle['vehicleType']>('CAR');
  const [slotNumber, setSlotNumber] = useState('B-P12');

  const refreshData = () => {
    setFamilyMembers(societyService.getFamilyMembers(currentSocietyId, currentResidentId));
    setVehicles(societyService.getVehicles(currentSocietyId, currentResidentId));
  };

  const handleAddFamilyMember = (e: React.FormEvent) => {
    e.preventDefault();
    if (!famName) return;

    societyService.addFamilyMember(
      {
        societyId: currentSocietyId,
        residentId: currentResidentId,
        flatId: 'flat-1204',
        name: famName,
        relationship,
        phone: famPhone,
      },
      { id: currentResidentId, name: 'Vikram Joshi', role: 'resident' }
    );

    refreshData();
    setIsFamilyModalOpen(false);
    setFamName('');
    setFamPhone('');
  };

  const handleAddVehicle = (e: React.FormEvent) => {
    e.preventDefault();
    if (!regNumber) return;

    societyService.addVehicle(
      {
        societyId: currentSocietyId,
        residentId: currentResidentId,
        flatId: 'flat-1204',
        flatCode: 'B-1204',
        registrationNumber: regNumber.toUpperCase(),
        vehicleType: vehType,
        parkingSlotNumber: slotNumber,
        rfidTagCode: `RFID-${Math.floor(10000 + Math.random() * 90000)}`,
      },
      { id: currentResidentId, name: 'Vikram Joshi', role: 'resident' }
    );

    refreshData();
    setIsVehicleModalOpen(false);
    setRegNumber('');
  };

  return (
    <div style={{ padding: '1rem', paddingBottom: '6rem', maxWidth: '1000px', margin: '0 auto', fontFamily: 'sans-serif' }}>
      {/* Header */}
      <header style={{ marginBottom: '1.5rem', background: 'linear-gradient(135deg, var(--aarizo-navy, #083B56) 0%, #0D4767 100%)', padding: '1.5rem', borderRadius: '16px', color: '#FFFFFF' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', marginBottom: '0.5rem' }}>
          <Home size={28} color="var(--aarizo-sky, #83CBEA)" />
          <div>
            <h1 style={{ margin: 0, fontSize: '1.5rem', fontWeight: 800, color: '#FFFFFF' }}>Tower B · Flat 1204</h1>
            <p style={{ margin: '0.2rem 0 0 0', color: 'var(--aarizo-sky, #83CBEA)', fontSize: '0.85rem' }}>Green Valley Society · 3 BHK Owner Occupied</p>
          </div>
        </div>
      </header>

      {/* Grid Section 1: Family Members */}
      <section style={{ marginBottom: '2rem' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1rem' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
            <Users size={20} color="var(--aarizo-blue, #176B91)" />
            <h3 style={{ margin: 0, color: 'var(--aarizo-text-dark, #203746)' }}>Registered Family Members ({familyMembers.length})</h3>
          </div>
          <button
            onClick={() => setIsFamilyModalOpen(true)}
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: '0.35rem',
              padding: '0.45rem 0.85rem',
              background: 'var(--aarizo-blue, #176B91)',
              color: '#FFFFFF',
              borderRadius: '8px',
              border: 'none',
              fontWeight: 600,
              fontSize: '0.85rem',
              cursor: 'pointer',
            }}
          >
            <Plus size={16} /> Add Family Member
          </button>
        </div>

        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(280px, 1fr))', gap: '1rem' }}>
          {familyMembers.map((fam) => (
            <div key={fam.id} style={{ padding: '1rem', background: '#fff', borderRadius: '12px', border: '1px solid var(--aarizo-border, #E8F1F5)', display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
              <div style={{ width: '40px', height: '40px', borderRadius: '50%', background: 'var(--aarizo-blue-light, #EAF6FC)', color: 'var(--aarizo-blue, #176B91)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontWeight: 700 }}>
                {fam.name.charAt(0)}
              </div>
              <div>
                <div style={{ fontWeight: 600, color: 'var(--aarizo-text-dark, #203746)' }}>{fam.name}</div>
                <div style={{ fontSize: '0.8rem', color: '#64748b' }}>{fam.relationship} {fam.phone ? `· ${fam.phone}` : ''}</div>
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* Grid Section 2: Vehicles */}
      <section style={{ marginBottom: '2rem' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1rem' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
            <Car size={20} color="var(--aarizo-blue, #176B91)" />
            <h3 style={{ margin: 0, color: '#0f172a' }}>Vehicles & Parking Slots ({vehicles.length})</h3>
          </div>
          <button
            onClick={() => setIsVehicleModalOpen(true)}
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: '0.35rem',
              padding: '0.45rem 0.85rem',
              background: 'var(--aarizo-blue, #176B91)',
              color: '#FFFFFF',
              borderRadius: '8px',
              border: 'none',
              fontWeight: 600,
              fontSize: '0.85rem',
              cursor: 'pointer',
            }}
          >
            <Plus size={16} /> Register Vehicle
          </button>
        </div>

        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(280px, 1fr))', gap: '1rem' }}>
          {vehicles.map((veh) => (
            <div key={veh.id} style={{ padding: '1rem', background: '#fff', borderRadius: '12px', border: '1px solid #e2e8f0' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '0.5rem' }}>
                <span style={{ fontWeight: 700, fontSize: '1rem', color: '#0f172a' }}>{veh.registrationNumber}</span>
                <StatusBadge label={veh.vehicleType} variant="info" size="sm" />
              </div>
              <div style={{ fontSize: '0.8rem', color: '#64748b' }}>
                Slot: <strong>{veh.parkingSlotNumber}</strong> {veh.rfidTagCode ? `· Tag: ${veh.rfidTagCode}` : ''}
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* Grid Section 3: Household Staff / Domestic Help */}
      <section style={{ marginBottom: '2rem' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '1rem' }}>
          <UserCheck size={20} color="var(--aarizo-blue, #176B91)" />
          <h3 style={{ margin: 0, color: '#0f172a' }}>Assigned Household Staff ({domesticWorkers.length})</h3>
        </div>

        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(280px, 1fr))', gap: '1rem' }}>
          {domesticWorkers.map((dw) => (
            <div key={dw.id} style={{ padding: '1rem', background: '#fff', borderRadius: '12px', border: '1px solid #e2e8f0', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <div>
                <div style={{ fontWeight: 600, color: '#0f172a' }}>{dw.name}</div>
                <div style={{ fontSize: '0.8rem', color: '#64748b' }}>{dw.workRole} · Code: {dw.passCode}</div>
              </div>
              <StatusBadge
                label={dw.status === 'INSIDE' ? 'INSIDE COMPLEX' : 'OUTSIDE'}
                variant={dw.status === 'INSIDE' ? 'success' : 'neutral'}
                size="sm"
              />
            </div>
          ))}
        </div>
      </section>

      {/* Add Family Member Modal */}
      <Modal isOpen={isFamilyModalOpen} onClose={() => setIsFamilyModalOpen(false)} title="Add Family Member">
        <Form onSubmit={handleAddFamilyMember}>
          <FormField label="Full Name" required>
            <input
              type="text"
              required
              value={famName}
              onChange={(e) => setFamName(e.target.value)}
              placeholder="e.g. Aarav Joshi"
              style={{ padding: '0.6rem', borderRadius: '8px', border: '1px solid #cbd5e1' }}
            />
          </FormField>
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
            <FormField label="Relationship">
              <select
                value={relationship}
                onChange={(e) => setRelationship(e.target.value as FamilyMember['relationship'])}
                style={{ padding: '0.6rem', borderRadius: '8px', border: '1px solid #cbd5e1', background: '#fff' }}
              >
                <option value="SPOUSE">Spouse</option>
                <option value="CHILD">Child</option>
                <option value="PARENT">Parent</option>
                <option value="SIBLING">Sibling</option>
                <option value="OTHER">Other</option>
              </select>
            </FormField>
            <FormField label="Phone (Optional)">
              <input
                type="tel"
                value={famPhone}
                onChange={(e) => setFamPhone(e.target.value)}
                style={{ padding: '0.6rem', borderRadius: '8px', border: '1px solid #cbd5e1' }}
              />
            </FormField>
          </div>
          <div style={{ display: 'flex', gap: '0.75rem', marginTop: '1rem' }}>
            <button type="button" onClick={() => setIsFamilyModalOpen(false)} style={{ flex: 1, padding: '0.6rem', borderRadius: '8px', border: '1px solid #cbd5e1', background: '#fff' }}>Cancel</button>
            <button type="submit" style={{ flex: 1, padding: '0.6rem', borderRadius: '8px', border: 'none', background: 'var(--aarizo-blue, #176B91)', color: '#fff', fontWeight: 600 }}>Save Member</button>
          </div>
        </Form>
      </Modal>

      {/* Add Vehicle Modal */}
      <Modal isOpen={isVehicleModalOpen} onClose={() => setIsVehicleModalOpen(false)} title="Register Vehicle & Parking Tag">
        <Form onSubmit={handleAddVehicle}>
          <FormField label="Vehicle Number" required>
            <input
              type="text"
              required
              value={regNumber}
              onChange={(e) => setRegNumber(e.target.value.toUpperCase())}
              placeholder="e.g. MH-02-CB-4092"
              style={{ padding: '0.6rem', borderRadius: '8px', border: '1px solid #cbd5e1' }}
            />
          </FormField>
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
            <FormField label="Vehicle Type">
              <select
                value={vehType}
                onChange={(e) => setVehType(e.target.value as Vehicle['vehicleType'])}
                style={{ padding: '0.6rem', borderRadius: '8px', border: '1px solid #cbd5e1', background: '#fff' }}
              >
                <option value="CAR">Car / SUV</option>
                <option value="BIKE">Two-Wheeler / Bike</option>
                <option value="EV">Electric Vehicle (EV)</option>
              </select>
            </FormField>
            <FormField label="Allocated Slot">
              <input
                type="text"
                value={slotNumber}
                onChange={(e) => setSlotNumber(e.target.value)}
                style={{ padding: '0.6rem', borderRadius: '8px', border: '1px solid #cbd5e1' }}
              />
            </FormField>
          </div>
          <div style={{ display: 'flex', gap: '0.75rem', marginTop: '1rem' }}>
            <button type="button" onClick={() => setIsVehicleModalOpen(false)} style={{ flex: 1, padding: '0.6rem', borderRadius: '8px', border: '1px solid #cbd5e1', background: '#fff' }}>Cancel</button>
            <button type="submit" style={{ flex: 1, padding: '0.6rem', borderRadius: '8px', border: 'none', background: 'var(--aarizo-blue, #176B91)', color: '#fff', fontWeight: 600 }}>Register Vehicle</button>
          </div>
        </Form>
      </Modal>
    </div>
  );
};

