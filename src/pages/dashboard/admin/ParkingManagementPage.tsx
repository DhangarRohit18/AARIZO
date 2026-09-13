import React, { useState } from 'react';
import { Car, Plus } from 'lucide-react';
import { parkingService } from '../../../services/parkingService';
import type { ParkingSlot, ParkingRequest, SlotType } from '../../../types/parking';
import { DataTable } from '../../../components/ui/DataTable';
import type { Column } from '../../../components/ui/DataTable';
import { StatusBadge } from '../../../components/ui/StatusBadge';
import { Modal } from '../../../components/ui/Modal';
import { Form, FormField } from '../../../components/ui/Form';
import { VisualParkingMap } from '../../../components/parking/VisualParkingMap';

export const ParkingManagementPage: React.FC = () => {
  const currentSocietyId = 'soc-gvs';
  const adminActor = { id: 'admin-1', name: 'Mayuri Udar', role: 'SOCIETY_ADMIN' };

  const [slots, setSlots] = useState<ParkingSlot[]>(parkingService.getSlots(currentSocietyId));
  const [requests, setRequests] = useState<ParkingRequest[]>(parkingService.getRequests(currentSocietyId));
  const [activeTab, setActiveTab] = useState<'MAP' | 'SLOTS' | 'REQUESTS'>('MAP');

  const [isAddSlotModalOpen, setIsAddSlotModalOpen] = useState(false);
  const [isAssignModalOpen, setIsAssignModalOpen] = useState(false);
  const [selectedSlotForAssign, setSelectedSlotForAssign] = useState<ParkingSlot | null>(null);

  // Slot Form
  const [slotNumber, setSlotNumber] = useState('');
  const [level, setLevel] = useState('Basement 1');
  const [slotType, setSlotType] = useState<SlotType>('RESIDENT');

  // Assign Form
  const [assignFlatCode, setAssignFlatCode] = useState('');
  const [assignResidentName, setAssignResidentName] = useState('');
  const [assignVehicleNumber, setAssignVehicleNumber] = useState('');

  const refreshData = () => {
    setSlots(parkingService.getSlots(currentSocietyId));
    setRequests(parkingService.getRequests(currentSocietyId));
  };

  const handleCreateSlot = (e: React.FormEvent) => {
    e.preventDefault();
    if (!slotNumber) return;

    try {
      parkingService.createSlot(
        {
          societyId: currentSocietyId,
          slotNumber: slotNumber.toUpperCase(),
          level,
          slotType,
        },
        adminActor
      );
      refreshData();
      setIsAddSlotModalOpen(false);
      setSlotNumber('');
    } catch (err: any) {
      alert(err.message);
    }
  };

  const handleAssignSlot = (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedSlotForAssign || !assignVehicleNumber) return;

    try {
      parkingService.assignSlot(
        selectedSlotForAssign.id,
        {
          flatId: 'flat-assigned',
          flatCode: assignFlatCode || 'B-1204',
          residentName: assignResidentName || 'Resident',
          vehicleNumber: assignVehicleNumber.toUpperCase(),
        },
        adminActor
      );
      refreshData();
      setIsAssignModalOpen(false);
      setSelectedSlotForAssign(null);
      setAssignVehicleNumber('');
    } catch (err: any) {
      alert(err.message);
    }
  };

  const handleApproveRequest = (req: ParkingRequest, slotId: string) => {
    try {
      parkingService.approveParkingRequest(req.id, slotId, adminActor);
      refreshData();
    } catch (err: any) {
      alert(err.message);
    }
  };

  const columns: Column<ParkingSlot>[] = [
    { key: 'slotNumber', header: 'Slot Code', sortable: true, width: '120px' },
    { key: 'level', header: 'Level', sortable: true },
    { key: 'slotType', header: 'Type' },
    {
      key: 'assignedFlatCode',
      header: 'Assigned Flat',
      render: (s) => (
        <div>
          <div style={{ fontWeight: 600 }}>{s.assignedFlatCode || 'Unassigned'}</div>
          <div style={{ fontSize: '0.75rem', color: '#64748b' }}>{s.assignedResidentName}</div>
        </div>
      ),
    },
    { key: 'assignedVehicleNumber', header: 'Vehicle Number' },
    {
      key: 'occupancyState',
      header: 'Occupancy',
      render: (s) => (
        <StatusBadge
          label={s.occupancyState}
          variant={s.occupancyState === 'OCCUPIED' ? 'danger' : s.occupancyState === 'AVAILABLE' ? 'success' : 'info'}
        />
      ),
    },
    {
      key: 'actions',
      header: 'Actions',
      render: (s) => (
        <button
          onClick={() => {
            setSelectedSlotForAssign(s);
            setIsAssignModalOpen(true);
          }}
          style={{ padding: '0.35rem 0.65rem', borderRadius: '6px', border: '1px solid #cbd5e1', background: '#fff', fontSize: '0.75rem', fontWeight: 600, cursor: 'pointer' }}
        >
          Assign / Edit
        </button>
      ),
    },
  ];

  const pendingRequests = requests.filter((r) => r.status === 'PENDING');
  const availableSlots = slots.filter((s) => s.occupancyState === 'AVAILABLE');

  return (
    <div style={{ padding: '1.5rem', maxWidth: '1200px', margin: '0 auto', fontFamily: 'sans-serif' }}>
      <header style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.5rem' }}>
        <div>
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
            <Car size={24} color="#2563eb" />
            <h1 style={{ margin: 0, fontSize: '1.4rem', color: '#0f172a' }}>Smart Parking & Slot Allocations</h1>
          </div>
          <p style={{ margin: '0.25rem 0 0 0', color: '#64748b', fontSize: '0.85rem' }}>
            Manage society parking capacity, visual grid maps, and resident parking applications.
          </p>
        </div>
        <button
          onClick={() => setIsAddSlotModalOpen(true)}
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
          <Plus size={18} /> Add Parking Slot
        </button>
      </header>

      {/* Tabs */}
      <div style={{ display: 'flex', gap: '0.5rem', marginBottom: '1.25rem' }}>
        <button
          onClick={() => setActiveTab('MAP')}
          style={{
            padding: '0.5rem 1rem',
            borderRadius: '8px',
            border: activeTab === 'MAP' ? '1px solid #2563eb' : '1px solid #cbd5e1',
            background: activeTab === 'MAP' ? '#eff6ff' : '#fff',
            color: activeTab === 'MAP' ? '#1d4ed8' : '#64748b',
            fontWeight: 600,
            cursor: 'pointer',
          }}
        >
          Visual Parking Grid Map
        </button>
        <button
          onClick={() => setActiveTab('SLOTS')}
          style={{
            padding: '0.5rem 1rem',
            borderRadius: '8px',
            border: activeTab === 'SLOTS' ? '1px solid #2563eb' : '1px solid #cbd5e1',
            background: activeTab === 'SLOTS' ? '#eff6ff' : '#fff',
            color: activeTab === 'SLOTS' ? '#1d4ed8' : '#64748b',
            fontWeight: 600,
            cursor: 'pointer',
          }}
        >
          Slots Directory ({slots.length})
        </button>
        <button
          onClick={() => setActiveTab('REQUESTS')}
          style={{
            padding: '0.5rem 1rem',
            borderRadius: '8px',
            border: activeTab === 'REQUESTS' ? '1px solid #2563eb' : '1px solid #cbd5e1',
            background: activeTab === 'REQUESTS' ? '#eff6ff' : '#fff',
            color: activeTab === 'REQUESTS' ? '#1d4ed8' : '#64748b',
            fontWeight: 600,
            cursor: 'pointer',
          }}
        >
          Pending Applications ({pendingRequests.length})
        </button>
      </div>

      <div style={{ background: '#ffffff', borderRadius: '12px', border: '1px solid #e2e8f0', padding: '1.25rem' }}>
        {activeTab === 'MAP' && (
          <VisualParkingMap
            slots={slots}
            onEntryScan={(slot) => {
              parkingService.scanEntry(slot.id, slot.assignedVehicleNumber || 'UNKNOWN', adminActor);
              refreshData();
            }}
            onExitScan={(slot) => {
              parkingService.scanExit(slot.id, adminActor);
              refreshData();
            }}
          />
        )}

        {activeTab === 'SLOTS' && (
          <DataTable columns={columns} data={slots} keyExtractor={(s) => s.id} />
        )}

        {activeTab === 'REQUESTS' && (
          <div style={{ display: 'flex', flexDirection: 'column', gap: '0.85rem' }}>
            {pendingRequests.length === 0 ? (
              <div style={{ padding: '2rem', textAlign: 'center', color: '#94a3b8' }}>No pending parking applications</div>
            ) : (
              pendingRequests.map((req) => (
                <div key={req.id} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '1rem', background: '#f8fafc', borderRadius: '8px', border: '1px solid #e2e8f0' }}>
                  <div>
                    <div style={{ fontWeight: 700, color: '#0f172a' }}>{req.residentName} ({req.flatCode})</div>
                    <div style={{ fontSize: '0.8rem', color: '#64748b' }}>
                      Vehicle: <strong>{req.vehicleNumber}</strong> ({req.vehicleType}) • Type: {req.requestType}
                    </div>
                  </div>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                    <select
                      id={`slot-select-${req.id}`}
                      defaultValue={availableSlots[0]?.id || ''}
                      style={{ padding: '0.45rem', borderRadius: '6px', border: '1px solid #cbd5e1', fontSize: '0.8rem' }}
                    >
                      {availableSlots.map((s) => (
                        <option key={s.id} value={s.id}>
                          Slot {s.slotNumber} ({s.level})
                        </option>
                      ))}
                    </select>
                    <button
                      onClick={() => {
                        const sel = (document.getElementById(`slot-select-${req.id}`) as HTMLSelectElement).value;
                        if (sel) handleApproveRequest(req, sel);
                      }}
                      style={{ padding: '0.45rem 0.75rem', background: '#10b981', color: '#fff', border: 'none', borderRadius: '6px', fontWeight: 600, fontSize: '0.8rem', cursor: 'pointer' }}
                    >
                      Approve & Allocate
                    </button>
                  </div>
                </div>
              ))
            )}
          </div>
        )}
      </div>

      {/* Add Slot Modal */}
      <Modal isOpen={isAddSlotModalOpen} onClose={() => setIsAddSlotModalOpen(false)} title="Create Parking Bay / Slot">
        <Form onSubmit={handleCreateSlot}>
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
            <FormField label="Slot Code" required>
              <input
                type="text"
                required
                value={slotNumber}
                onChange={(e) => setSlotNumber(e.target.value)}
                placeholder="e.g. B1-P15"
                style={{ padding: '0.6rem', borderRadius: '8px', border: '1px solid #cbd5e1' }}
              />
            </FormField>
            <FormField label="Level / Floor">
              <input
                type="text"
                value={level}
                onChange={(e) => setLevel(e.target.value)}
                placeholder="e.g. Basement 1"
                style={{ padding: '0.6rem', borderRadius: '8px', border: '1px solid #cbd5e1' }}
              />
            </FormField>
          </div>

          <FormField label="Slot Allocation Type">
            <select
              value={slotType}
              onChange={(e) => setSlotType(e.target.value as SlotType)}
              style={{ padding: '0.6rem', borderRadius: '8px', border: '1px solid #cbd5e1', background: '#fff' }}
            >
              <option value="RESIDENT">Resident Designated Slot</option>
              <option value="VISITOR">Visitor Parking Bay</option>
              <option value="RESERVED">Reserved / Admin Bay</option>
              <option value="BLOCKED">Blocked for Maintenance</option>
            </select>
          </FormField>

          <div style={{ display: 'flex', gap: '0.75rem', marginTop: '1rem' }}>
            <button type="button" onClick={() => setIsAddSlotModalOpen(false)} style={{ flex: 1, padding: '0.65rem', borderRadius: '8px', border: '1px solid #cbd5e1', background: '#fff' }}>Cancel</button>
            <button type="submit" style={{ flex: 1, padding: '0.65rem', borderRadius: '8px', border: 'none', background: '#2563eb', color: '#fff', fontWeight: 600 }}>Create Slot</button>
          </div>
        </Form>
      </Modal>

      {/* Assign Slot Modal */}
      {selectedSlotForAssign && (
        <Modal isOpen={isAssignModalOpen} onClose={() => { setIsAssignModalOpen(false); setSelectedSlotForAssign(null); }} title={`Assign Parking Slot ${selectedSlotForAssign.slotNumber}`}>
          <Form onSubmit={handleAssignSlot}>
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
              <FormField label="Flat Code">
                <input
                  type="text"
                  value={assignFlatCode}
                  onChange={(e) => setAssignFlatCode(e.target.value)}
                  placeholder="e.g. B-1204"
                  style={{ padding: '0.6rem', borderRadius: '8px', border: '1px solid #cbd5e1' }}
                />
              </FormField>
              <FormField label="Resident Name">
                <input
                  type="text"
                  value={assignResidentName}
                  onChange={(e) => setAssignResidentName(e.target.value)}
                  placeholder="e.g. Vikram Joshi"
                  style={{ padding: '0.6rem', borderRadius: '8px', border: '1px solid #cbd5e1' }}
                />
              </FormField>
            </div>

            <FormField label="Vehicle Number" required>
              <input
                type="text"
                required
                value={assignVehicleNumber}
                onChange={(e) => setAssignVehicleNumber(e.target.value.toUpperCase())}
                placeholder="e.g. MH-02-CB-4092"
                style={{ padding: '0.6rem', borderRadius: '8px', border: '1px solid #cbd5e1' }}
              />
            </FormField>

            <div style={{ display: 'flex', gap: '0.75rem', marginTop: '1rem' }}>
              <button type="button" onClick={() => { setIsAssignModalOpen(false); setSelectedSlotForAssign(null); }} style={{ flex: 1, padding: '0.65rem', borderRadius: '8px', border: '1px solid #cbd5e1', background: '#fff' }}>Cancel</button>
              <button type="submit" style={{ flex: 1, padding: '0.65rem', borderRadius: '8px', border: 'none', background: '#2563eb', color: '#fff', fontWeight: 600 }}>Save Assignment</button>
            </div>
          </Form>
        </Modal>
      )}
    </div>
  );
};
