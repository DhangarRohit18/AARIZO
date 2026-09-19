import React, { useState, useEffect } from 'react';
import { useAuth } from '../../../context/AuthContext';
import { amenityService } from '../../../services/amenityService';
import type { SocietyAmenity, AmenityBooking, AmenityType } from '../../../types/amenity';
import { Modal } from '../../../components/ui/Modal';
import { DataTable } from '../../../components/ui/DataTable';
import { MobileDataCard } from '../../../components/ui/MobileDataCard';
import {
  Sparkles,
  Clock,
  Users,
  CheckCircle,
  XCircle,
  Calendar,
  Wrench,
  Ban,
  Plus,
  ShieldCheck,
  Building
} from 'lucide-react';

const AMENITY_TYPES: AmenityType[] = [
  'SWIMMING_POOL',
  'GYM',
  'CLUBHOUSE',
  'BADMINTON_COURT',
  'TENNIS_COURT',
  'PARTY_HALL',
  'MEETING_ROOM',
  'KIDS_PLAY_AREA',
  'VISITOR_LOUNGE'
];

export const AdminAmenityManagementPage: React.FC = () => {
  const { currentUser } = useAuth();
  const societyId = (currentUser as any)?.societyId || 'soc-1';

  const [amenities, setAmenities] = useState<SocietyAmenity[]>([]);
  const [bookings, setBookings] = useState<AmenityBooking[]>([]);
  const [selectedAmenity, setSelectedAmenity] = useState<SocietyAmenity | null>(null);

  // Modals state
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [showBlackoutModal, setShowBlackoutModal] = useState(false);
  const [showMaintenanceModal, setShowMaintenanceModal] = useState(false);

  // Forms state
  const [newAmenity, setNewAmenity] = useState<{
    name: string;
    type: AmenityType;
    description: string;
    location: string;
    capacityPerSlot: number;
    openTime: string;
    closeTime: string;
    slotDurationMinutes: number;
    requiresApproval: boolean;
    isBookable: boolean;
    imageUrl?: string;
  }>({
    name: '',
    type: 'BADMINTON_COURT',
    description: '',
    location: '',
    capacityPerSlot: 4,
    openTime: '06:00',
    closeTime: '22:00',
    slotDurationMinutes: 60,
    requiresApproval: false,
    isBookable: true,
    imageUrl: ''
  });

  const [blackoutForm, setBlackoutForm] = useState({
    startDate: '',
    endDate: '',
    reason: ''
  });

  const [maintenanceForm, setMaintenanceForm] = useState({
    title: '',
    startDate: '',
    endDate: '',
    notes: ''
  });

  useEffect(() => {
    loadData();
  }, [societyId]);

  const loadData = () => {
    const data = amenityService.getAmenities(societyId);
    setAmenities(data);
    const bks = amenityService.getBookings(societyId);
    setBookings(bks);
  };

  const handleCreateAmenity = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newAmenity.name || !newAmenity.location) return;

    amenityService.createAmenity(societyId, {
      ...newAmenity,
      isActive: true
    });

    setShowCreateModal(false);
    setNewAmenity({
      name: '',
      type: 'BADMINTON_COURT',
      description: '',
      location: '',
      capacityPerSlot: 4,
      openTime: '06:00',
      closeTime: '22:00',
      slotDurationMinutes: 60,
      requiresApproval: false,
      isBookable: true,
      imageUrl: ''
    });
    loadData();
  };

  const handleApproveBooking = (bookingId: string) => {
    amenityService.updateBookingStatus(societyId, bookingId, 'APPROVED', 'Approved by Admin');
    loadData();
  };

  const handleRejectBooking = (bookingId: string) => {
    amenityService.updateBookingStatus(societyId, bookingId, 'REJECTED', 'Slot capacity or timing clash');
    loadData();
  };

  const handleAddBlackout = (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedAmenity || !blackoutForm.startDate || !blackoutForm.reason) return;

    amenityService.addBlackoutDate(
      societyId,
      selectedAmenity.id,
      blackoutForm.startDate,
      blackoutForm.endDate || blackoutForm.startDate,
      blackoutForm.reason
    );

    setShowBlackoutModal(false);
    setBlackoutForm({ startDate: '', endDate: '', reason: '' });
    loadData();
  };

  const handleAddMaintenance = (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedAmenity || !maintenanceForm.title || !maintenanceForm.startDate) return;

    amenityService.addMaintenanceSchedule(
      societyId,
      selectedAmenity.id,
      maintenanceForm.title,
      maintenanceForm.startDate,
      maintenanceForm.endDate || maintenanceForm.startDate,
      maintenanceForm.notes
    );

    setShowMaintenanceModal(false);
    setMaintenanceForm({ title: '', startDate: '', endDate: '', notes: '' });
    loadData();
  };

  const pendingBookings = bookings.filter(b => b.status === 'PENDING');

  return (
    <div className="space-y-6 p-4 md:p-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 bg-white p-4 md:p-6 rounded-2xl border border-slate-200/80 shadow-sm">
        <div>
          <div className="flex items-center gap-2">
            <span className="p-2 bg-indigo-50 text-indigo-600 rounded-xl">
              <Sparkles className="w-5 h-5" />
            </span>
            <h1 className="text-2xl font-bold text-slate-900">Amenity & Facility Management</h1>
          </div>
          <p className="text-slate-500 text-sm mt-1">
            Configure timings, capacities, maintenance schedules, blackout dates, and approve resident slot bookings.
          </p>
        </div>
        <button
          onClick={() => setShowCreateModal(true)}
          className="px-4 py-2.5 bg-indigo-600 hover:bg-indigo-700 text-white font-semibold text-sm rounded-xl transition-all shadow-sm flex items-center justify-center gap-2"
        >
          <Plus className="w-4 h-4" /> Add New Amenity
        </button>
      </div>

      {/* Pending Approvals Widget */}
      {pendingBookings.length > 0 && (
        <div className="p-4 md:p-6 rounded-2xl border border-amber-200 bg-amber-50/50 shadow-sm">
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center gap-2">
              <ShieldCheck className="w-5 h-5 text-amber-600" />
              <h2 className="text-lg font-semibold text-slate-900">
                Pending Booking Requests ({pendingBookings.length})
              </h2>
            </div>
          </div>

          <div className="divide-y divide-amber-200/60">
            {pendingBookings.map(bk => (
              <div key={bk.id} className="py-3 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                <div>
                  <p className="font-semibold text-slate-900">
                    {bk.amenityName} â€” <span className="text-amber-700">{bk.residentName} ({bk.flatNumber})</span>
                  </p>
                  <div className="flex items-center gap-4 text-xs text-slate-600 mt-1">
                    <span className="flex items-center gap-1">
                      <Calendar className="w-3.5 h-3.5" /> {bk.bookingDate}
                    </span>
                    <span className="flex items-center gap-1">
                      <Clock className="w-3.5 h-3.5" /> {bk.startTime} - {bk.endTime}
                    </span>
                    <span className="flex items-center gap-1">
                      <Users className="w-3.5 h-3.5" /> {bk.guestCount} Guest(s)
                    </span>
                  </div>
                  {bk.purpose && <p className="text-xs text-slate-500 italic mt-0.5">"{bk.purpose}"</p>}
                </div>
                <div className="flex items-center gap-2">
                  <button
                    onClick={() => handleApproveBooking(bk.id)}
                    className="px-3 py-1.5 border border-emerald-300 text-emerald-700 hover:bg-emerald-50 text-xs font-semibold rounded-lg flex items-center gap-1"
                  >
                    <CheckCircle className="w-4 h-4" /> Approve
                  </button>
                  <button
                    onClick={() => handleRejectBooking(bk.id)}
                    className="px-3 py-1.5 border border-rose-300 text-rose-700 hover:bg-rose-50 text-xs font-semibold rounded-lg flex items-center gap-1"
                  >
                    <XCircle className="w-4 h-4" /> Reject
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Amenities Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {amenities.map(amenity => (
          <div key={amenity.id} className="bg-white rounded-2xl border border-slate-200/80 shadow-sm overflow-hidden flex flex-col justify-between">
            <div>
              {amenity.imageUrl && (
                <div className="h-44 w-full overflow-hidden relative">
                  <img src={amenity.imageUrl} alt={amenity.name} className="w-full h-full object-cover" />
                  <div className="absolute top-3 right-3 bg-slate-900/80 backdrop-blur-md text-white text-xs px-2.5 py-1 rounded-full font-medium">
                    {amenity.type.replace(/_/g, ' ')}
                  </div>
                </div>
              )}
              <div className="p-5">
                <h3 className="text-lg font-bold text-slate-900">{amenity.name}</h3>
                <p className="text-slate-500 text-xs mt-1 flex items-center gap-1">
                  <Building className="w-3.5 h-3.5" /> {amenity.location}
                </p>
                <p className="text-slate-600 text-sm mt-3 line-clamp-2">{amenity.description}</p>

                <div className="mt-4 pt-3 border-t border-slate-100 grid grid-cols-2 gap-3 text-xs">
                  <div>
                    <span className="text-slate-400 block">Timings</span>
                    <span className="font-semibold text-slate-700 flex items-center gap-1 mt-0.5">
                      <Clock className="w-3.5 h-3.5 text-indigo-500" /> {amenity.openTime} - {amenity.closeTime}
                    </span>
                  </div>
                  <div>
                    <span className="text-slate-400 block">Slot Capacity</span>
                    <span className="font-semibold text-slate-700 flex items-center gap-1 mt-0.5">
                      <Users className="w-3.5 h-3.5 text-emerald-500" /> Max {amenity.capacityPerSlot} Pax
                    </span>
                  </div>
                </div>

                {/* Maintenance & Blackouts info */}
                {amenity.blackoutDates.length > 0 && (
                  <div className="mt-3 bg-rose-50 border border-rose-100 p-2 rounded-lg text-xs text-rose-800">
                    <span className="font-semibold flex items-center gap-1">
                      <Ban className="w-3.5 h-3.5" /> Blackout Active:
                    </span>
                    {amenity.blackoutDates.map(b => (
                      <div key={b.id}>{b.startDate} to {b.endDate}: {b.reason}</div>
                    ))}
                  </div>
                )}

                {amenity.maintenanceSchedules.length > 0 && (
                  <div className="mt-2 bg-amber-50 border border-amber-100 p-2 rounded-lg text-xs text-amber-800">
                    <span className="font-semibold flex items-center gap-1">
                      <Wrench className="w-3.5 h-3.5" /> Maintenance:
                    </span>
                    {amenity.maintenanceSchedules.map(m => (
                      <div key={m.id}>{m.title} ({m.startDate})</div>
                    ))}
                  </div>
                )}
              </div>
            </div>

            <div className="p-5 pt-0 flex items-center gap-2">
              <button
                className="flex-1 py-2 px-3 border border-slate-200 text-slate-700 hover:bg-slate-50 text-xs font-semibold rounded-xl flex items-center justify-center gap-1"
                onClick={() => {
                  setSelectedAmenity(amenity);
                  setShowBlackoutModal(true);
                }}
              >
                <Ban className="w-3.5 h-3.5" /> Block Dates
              </button>
              <button
                className="flex-1 py-2 px-3 border border-slate-200 text-slate-700 hover:bg-slate-50 text-xs font-semibold rounded-xl flex items-center justify-center gap-1"
                onClick={() => {
                  setSelectedAmenity(amenity);
                  setShowMaintenanceModal(true);
                }}
              >
                <Wrench className="w-3.5 h-3.5" /> Maintenance
              </button>
            </div>
          </div>
        ))}
      </div>

      {/* Booking History Table */}
      <div className="bg-white p-4 md:p-6 rounded-2xl border border-slate-200/80 shadow-sm">
        <h2 className="text-lg font-bold text-slate-900 mb-4">All Resident Amenity Bookings</h2>
        <div className="mt-4">
            <DataTable
              columns={[
                { key: 'amenityName', header: 'Amenity' },
                { key: 'residentName', header: 'Resident' },
                { key: 'flatNumber', header: 'Flat' },
                { key: 'date', header: 'Date' },
                { key: 'timeSlot', header: 'Time' },
                { key: 'guestsCount', header: 'Guests', render: (b: any) => `${b.guestsCount} Guest(s)` },
                { key: 'status', header: 'Status', render: (b: any) => (
                  <span className={`px-2.5 py-1 text-xs rounded-full font-bold ${
                          b.status === 'APPROVED' ? 'bg-emerald-100 text-emerald-800' :
                          b.status === 'PENDING' ? 'bg-amber-100 text-amber-800' :
                          b.status === 'CANCELLED' ? 'bg-slate-100 text-slate-700' :
                          'bg-rose-100 text-rose-800'
                        }`}>
                          {b.status}
                        </span>
                )}
              ]}
              data={bookings}
              keyExtractor={(b: any) => b.id}
              pageSize={10}
              mobileRender={(b: any) => (
                <MobileDataCard
                  title={b.amenityName}
                  subtitle={`${b.date} - ${b.timeSlot}`}
                  status={<span className={`px-2 py-0.5 text-[0.65rem] rounded-full font-bold ${
                          b.status === 'APPROVED' ? 'bg-emerald-100 text-emerald-800' :
                          b.status === 'PENDING' ? 'bg-amber-100 text-amber-800' :
                          b.status === 'CANCELLED' ? 'bg-slate-100 text-slate-700' :
                          'bg-rose-100 text-rose-800'
                        }`}>{b.status}</span>}
                  attributes={[
                    { label: 'Resident', value: `${b.residentName} (${b.flatNumber})` },
                    { label: 'Guests', value: b.guestsCount }
                  ]}
                />
              )}
            />
          </div>

      </div>

      {/* Modal: Create Amenity */}
      <Modal isOpen={showCreateModal} onClose={() => setShowCreateModal(false)} title="Create Society Amenity">
        <form onSubmit={handleCreateAmenity} className="space-y-4">
          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-1">Amenity Name</label>
            <input
              type="text"
              required
              placeholder="e.g. Squash Court B"
              value={newAmenity.name}
              onChange={e => setNewAmenity({ ...newAmenity, name: e.target.value })}
              className="w-full px-3 py-2 border rounded-lg text-sm"
            />
          </div>
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">Type</label>
              <select
                value={newAmenity.type}
                onChange={e => setNewAmenity({ ...newAmenity, type: e.target.value as AmenityType })}
                className="w-full px-3 py-2 border rounded-lg text-sm"
              >
                {AMENITY_TYPES.map(t => (
                  <option key={t} value={t}>{t.replace(/_/g, ' ')}</option>
                ))}
              </select>
            </div>
            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">Location</label>
              <input
                type="text"
                required
                placeholder="e.g. Clubhouse Floor 1"
                value={newAmenity.location}
                onChange={e => setNewAmenity({ ...newAmenity, location: e.target.value })}
                className="w-full px-3 py-2 border rounded-lg text-sm"
              />
            </div>
          </div>
          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-1">Description</label>
            <textarea
              rows={2}
              placeholder="Brief facilities description..."
              value={newAmenity.description}
              onChange={e => setNewAmenity({ ...newAmenity, description: e.target.value })}
              className="w-full px-3 py-2 border rounded-lg text-sm"
            />
          </div>
          <div className="grid grid-cols-3 gap-3">
            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">Slot Capacity</label>
              <input
                type="number"
                min={1}
                value={newAmenity.capacityPerSlot}
                onChange={e => setNewAmenity({ ...newAmenity, capacityPerSlot: parseInt(e.target.value) || 1 })}
                className="w-full px-3 py-2 border rounded-lg text-sm"
              />
            </div>
            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">Open Time</label>
              <input
                type="time"
                value={newAmenity.openTime}
                onChange={e => setNewAmenity({ ...newAmenity, openTime: e.target.value })}
                className="w-full px-3 py-2 border rounded-lg text-sm"
              />
            </div>
            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">Close Time</label>
              <input
                type="time"
                value={newAmenity.closeTime}
                onChange={e => setNewAmenity({ ...newAmenity, closeTime: e.target.value })}
                className="w-full px-3 py-2 border rounded-lg text-sm"
              />
            </div>
          </div>
          <div className="flex items-center gap-4 pt-2">
            <label className="flex items-center gap-2 text-xs font-medium text-slate-700">
              <input
                type="checkbox"
                checked={newAmenity.requiresApproval}
                onChange={e => setNewAmenity({ ...newAmenity, requiresApproval: e.target.checked })}
              />
              Requires Admin Approval
            </label>
            <label className="flex items-center gap-2 text-xs font-medium text-slate-700">
              <input
                type="checkbox"
                checked={newAmenity.isBookable}
                onChange={e => setNewAmenity({ ...newAmenity, isBookable: e.target.checked })}
              />
              Available for Booking
            </label>
          </div>
          <div className="pt-4 flex justify-end gap-2">
            <button type="button" onClick={() => setShowCreateModal(false)} className="px-4 py-2 text-slate-600 hover:bg-slate-100 text-sm font-semibold rounded-lg">Cancel</button>
            <button type="submit" className="px-4 py-2 bg-indigo-600 text-white hover:bg-indigo-700 text-sm font-semibold rounded-lg">Create Amenity</button>
          </div>
        </form>
      </Modal>

      {/* Modal: Add Blackout Date */}
      <Modal isOpen={showBlackoutModal} onClose={() => setShowBlackoutModal(false)} title={`Block Dates: ${selectedAmenity?.name}`}>
        <form onSubmit={handleAddBlackout} className="space-y-4">
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">Start Date</label>
              <input
                type="date"
                required
                value={blackoutForm.startDate}
                onChange={e => setBlackoutForm({ ...blackoutForm, startDate: e.target.value })}
                className="w-full px-3 py-2 border rounded-lg text-sm"
              />
            </div>
            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">End Date</label>
              <input
                type="date"
                value={blackoutForm.endDate}
                onChange={e => setBlackoutForm({ ...blackoutForm, endDate: e.target.value })}
                className="w-full px-3 py-2 border rounded-lg text-sm"
              />
            </div>
          </div>
          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-1">Reason for Blackout</label>
            <input
              type="text"
              required
              placeholder="e.g. Society Private Festival Function"
              value={blackoutForm.reason}
              onChange={e => setBlackoutForm({ ...blackoutForm, reason: e.target.value })}
              className="w-full px-3 py-2 border rounded-lg text-sm"
            />
          </div>
          <div className="pt-4 flex justify-end gap-2">
            <button type="button" onClick={() => setShowBlackoutModal(false)} className="px-4 py-2 text-slate-600 hover:bg-slate-100 text-sm font-semibold rounded-lg">Cancel</button>
            <button type="submit" className="px-4 py-2 bg-rose-600 text-white hover:bg-rose-700 text-sm font-semibold rounded-lg">Save Blackout Date</button>
          </div>
        </form>
      </Modal>

      {/* Modal: Schedule Maintenance */}
      <Modal isOpen={showMaintenanceModal} onClose={() => setShowMaintenanceModal(false)} title={`Schedule Maintenance: ${selectedAmenity?.name}`}>
        <form onSubmit={handleAddMaintenance} className="space-y-4">
          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-1">Maintenance Title</label>
            <input
              type="text"
              required
              placeholder="e.g. Deep Cleaning & Water Treatment"
              value={maintenanceForm.title}
              onChange={e => setMaintenanceForm({ ...maintenanceForm, title: e.target.value })}
              className="w-full px-3 py-2 border rounded-lg text-sm"
            />
          </div>
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">Start Date & Time</label>
              <input
                type="datetime-local"
                required
                value={maintenanceForm.startDate}
                onChange={e => setMaintenanceForm({ ...maintenanceForm, startDate: e.target.value })}
                className="w-full px-3 py-2 border rounded-lg text-sm"
              />
            </div>
            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">End Date & Time</label>
              <input
                type="datetime-local"
                value={maintenanceForm.endDate}
                onChange={e => setMaintenanceForm({ ...maintenanceForm, endDate: e.target.value })}
                className="w-full px-3 py-2 border rounded-lg text-sm"
              />
            </div>
          </div>
          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-1">Additional Notes</label>
            <textarea
              rows={2}
              value={maintenanceForm.notes}
              onChange={e => setMaintenanceForm({ ...maintenanceForm, notes: e.target.value })}
              className="w-full px-3 py-2 border rounded-lg text-sm"
            />
          </div>
          <div className="pt-4 flex justify-end gap-2">
            <button type="button" onClick={() => setShowMaintenanceModal(false)} className="px-4 py-2 text-slate-600 hover:bg-slate-100 text-sm font-semibold rounded-lg">Cancel</button>
            <button type="submit" className="px-4 py-2 bg-indigo-600 text-white hover:bg-indigo-700 text-sm font-semibold rounded-lg">Schedule Maintenance</button>
          </div>
        </form>
      </Modal>
    </div>
  );
};

