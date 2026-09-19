import React, { useState, useEffect } from 'react';
import { useAuth } from '../../../context/AuthContext';
import { guestStayService } from '../../../services/guestStayService';
import type { GuestRoom, GuestReservation, GuestStaySettings, RoomType } from '../../../types/guestStay';
import { Modal } from '../../../components/ui/Modal';
import {
  Hotel,
  Building,
  Plus,
  ToggleLeft,
  ToggleRight,
  IndianRupee,
  Calendar
} from 'lucide-react';

const ROOM_TYPES: RoomType[] = [
  'STUDIO',
  'EXECUTIVE_SUITE',
  'DELUXE_ROOM',
  'PENTHOUSE_SUITE'
];

export const AdminGuestStayPage: React.FC = () => {
  const { currentUser } = useAuth();
  const societyId = (currentUser as any)?.societyId || 'soc-1';

  const [settings, setSettings] = useState<GuestStaySettings | null>(null);
  const [rooms, setRooms] = useState<GuestRoom[]>([]);
  const [reservations, setReservations] = useState<GuestReservation[]>([]);
  const [showCreateModal, setShowCreateModal] = useState(false);

  // Form State
  const [roomForm, setRoomForm] = useState({
    roomNumber: '',
    roomName: '',
    type: 'EXECUTIVE_SUITE' as RoomType,
    description: '',
    pricePerNight: 2000,
    capacity: 2,
    amenitiesText: 'King Size Bed\nAC\nSmart TV\nWiFi\nAttached Bathroom',
    rulesText: 'Government ID Proof mandatory\nCheck-in: 12:00 PM / Check-out: 10:00 AM'
  });

  useEffect(() => {
    loadData();
  }, [societyId]);

  const loadData = () => {
    setSettings(guestStayService.getSettings(societyId));
    setRooms(guestStayService.getRooms(societyId));
    setReservations(guestStayService.getReservations(societyId));
  };

  const handleToggleModule = () => {
    if (!settings) return;
    const updated = guestStayService.saveSettings({
      ...settings,
      isGuestStayEnabled: !settings.isGuestStayEnabled
    });
    setSettings(updated);
  };

  const handleCreateRoom = (e: React.FormEvent) => {
    e.preventDefault();
    if (!roomForm.roomNumber || !roomForm.roomName) return;

    guestStayService.createRoom(
      societyId,
      roomForm.roomNumber,
      roomForm.roomName,
      roomForm.type,
      roomForm.description,
      roomForm.pricePerNight,
      roomForm.capacity,
      roomForm.amenitiesText.split('\n').filter(Boolean),
      roomForm.rulesText.split('\n').filter(Boolean),
      'https://images.unsplash.com/photo-1590490360182-c33d57733427?auto=format&fit=crop&w=800&q=80'
    );

    setShowCreateModal(false);
    setRoomForm({
      roomNumber: '',
      roomName: '',
      type: 'EXECUTIVE_SUITE',
      description: '',
      pricePerNight: 2000,
      capacity: 2,
      amenitiesText: 'King Size Bed\nAC\nSmart TV\nWiFi\nAttached Bathroom',
      rulesText: 'Government ID Proof mandatory\nCheck-in: 12:00 PM / Check-out: 10:00 AM'
    });
    loadData();
  };

  const handleApproveReservation = (id: string) => {
    guestStayService.updateReservationStatus(societyId, id, 'CONFIRMED', 'Approved by Admin');
    loadData();
  };

  const handleRejectReservation = (id: string) => {
    guestStayService.updateReservationStatus(societyId, id, 'REJECTED', 'Rejected by Admin');
    loadData();
  };

  const totalRevenue = reservations
    .filter(r => r.status === 'CONFIRMED' || r.status === 'CHECKED_IN' || r.status === 'CHECKED_OUT')
    .reduce((acc, curr) => acc + curr.totalPrice, 0);

  return (
    <div className="space-y-6 p-4 md:p-6">
      {/* Header */}
      <div className="bg-white p-4 md:p-6 rounded-2xl border border-slate-200/80 shadow-sm flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <span className="p-2 bg-indigo-50 text-indigo-600 rounded-xl">
              <Hotel className="w-5 h-5" />
            </span>
            <h1 className="text-2xl font-bold text-slate-900">Guest Stay & Hotel Accommodation Management</h1>
          </div>
          <p className="text-slate-500 text-sm mt-1">
            Configure society guest suites, pricing, stay policies, approval workflows, and optional module toggle.
          </p>
        </div>

        {/* Optional Module Toggle Switch */}
        <div className="flex items-center gap-3 bg-slate-50 p-3 rounded-2xl border border-slate-200">
          <span className="text-xs font-bold text-slate-700">Module Status:</span>
          <button
            onClick={handleToggleModule}
            className={`flex items-center gap-1.5 px-3 py-1.5 rounded-xl font-bold text-xs transition-all ${
              settings?.isGuestStayEnabled ? 'bg-emerald-600 text-white' : 'bg-slate-300 text-slate-700'
            }`}
          >
            {settings?.isGuestStayEnabled ? (
              <>
                <ToggleRight className="w-5 h-5" /> ENABLED
              </>
            ) : (
              <>
                <ToggleLeft className="w-5 h-5" /> DISABLED
              </>
            )}
          </button>
        </div>
      </div>

      {!settings?.isGuestStayEnabled ? (
        <div className="bg-white p-12 rounded-2xl border border-slate-200/80 text-center space-y-3">
          <Hotel className="w-12 h-12 text-slate-300 mx-auto" />
          <h3 className="text-xl font-bold text-slate-800">Guest Accommodation Module Disabled</h3>
          <p className="text-sm text-slate-500 max-w-md mx-auto">
            Guest stay accommodation is currently disabled for this society. Toggle the switch above to enable guest rooms.
          </p>
        </div>
      ) : (
        <>
          {/* KPI Cards */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-6">
            <div className="bg-white p-5 rounded-2xl border border-slate-200/80 shadow-sm flex items-center gap-4">
              <div className="p-3 bg-indigo-50 text-indigo-600 rounded-xl">
                <Hotel className="w-6 h-6" />
              </div>
              <div>
                <span className="text-xs text-slate-500 block">Total Guest Suites</span>
                <span className="text-2xl font-bold text-slate-900">{rooms.length}</span>
              </div>
            </div>

            <div className="bg-white p-5 rounded-2xl border border-slate-200/80 shadow-sm flex items-center gap-4">
              <div className="p-3 bg-emerald-50 text-emerald-600 rounded-xl">
                <Calendar className="w-6 h-6" />
              </div>
              <div>
                <span className="text-xs text-slate-500 block">Total Reservations</span>
                <span className="text-2xl font-bold text-slate-900">{reservations.length}</span>
              </div>
            </div>

            <div className="bg-white p-5 rounded-2xl border border-slate-200/80 shadow-sm flex items-center gap-4">
              <div className="p-3 bg-amber-50 text-amber-600 rounded-xl">
                <IndianRupee className="w-6 h-6" />
              </div>
              <div>
                <span className="text-xs text-slate-500 block">Guest Stay Revenue</span>
                <span className="text-2xl font-bold text-slate-900">â‚¹{totalRevenue.toLocaleString()}</span>
              </div>
            </div>
          </div>

          {/* Rooms List & Add Button */}
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <h2 className="text-lg font-bold text-slate-900">Society Guest Rooms Register</h2>
              <button
                onClick={() => setShowCreateModal(true)}
                className="px-4 py-2.5 bg-indigo-600 hover:bg-indigo-700 text-white font-semibold text-sm rounded-xl shadow-sm flex items-center gap-2"
              >
                <Plus className="w-4 h-4" /> Add Guest Suite
              </button>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {rooms.map(room => (
                <div key={room.id} className="bg-white rounded-2xl border border-slate-200/80 shadow-sm overflow-hidden flex flex-col justify-between">
                  <div>
                    {room.imageUrl && (
                      <div className="h-44 w-full overflow-hidden relative">
                        <img src={room.imageUrl} alt={room.roomName} className="w-full h-full object-cover" />
                        <div className="absolute top-3 right-3 bg-slate-900/80 backdrop-blur-md text-white text-xs px-2.5 py-1 rounded-full font-bold">
                          â‚¹{room.pricePerNight} / Night
                        </div>
                      </div>
                    )}
                    <div className="p-5 space-y-2">
                      <h3 className="text-lg font-bold text-slate-900">{room.roomName}</h3>
                      <p className="text-xs text-slate-500 flex items-center gap-1">
                        <Building className="w-3.5 h-3.5" /> Room #{room.roomNumber} â€¢ Max {room.capacity} Guests
                      </p>
                      <p className="text-slate-600 text-sm mt-2 line-clamp-2">{room.description}</p>

                      <div className="pt-2">
                        <span className="text-[11px] font-bold text-slate-700 block mb-1">Amenities Included:</span>
                        <div className="flex flex-wrap gap-1">
                          {room.amenities.map((a, idx) => (
                            <span key={idx} className="px-2 py-0.5 bg-slate-100 text-slate-600 text-[10px] rounded-md font-semibold">
                              {a}
                            </span>
                          ))}
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Reservations Board */}
          <div className="bg-white p-4 md:p-6 rounded-2xl border border-slate-200/80 shadow-sm space-y-4">
            <h2 className="text-lg font-bold text-slate-900">Resident Stay Reservations</h2>

            <div className="overflow-x-auto">
              <table className="w-full text-left text-sm text-slate-600">
                <thead className="bg-slate-50 text-slate-700 font-semibold border-b border-slate-200">
                  <tr>
                    <th className="p-3">Reservation #</th>
                    <th className="p-3">Room</th>
                    <th className="p-3">Resident Host</th>
                    <th className="p-3">Primary Guest</th>
                    <th className="p-3">Stay Dates</th>
                    <th className="p-3">Total Price</th>
                    <th className="p-3">Status</th>
                    <th className="p-3 text-right">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {reservations.length === 0 ? (
                    <tr>
                      <td colSpan={8} className="p-4 md:p-6 text-center text-slate-400">No guest stay reservations recorded</td>
                    </tr>
                  ) : (
                    reservations.map(resv => (
                      <tr key={resv.id} className="hover:bg-slate-50">
                        <td className="p-3 font-bold text-slate-900">{resv.reservationNumber}</td>
                        <td className="p-3 font-medium">{resv.roomName} (#{resv.roomNumber})</td>
                        <td className="p-3">{resv.residentName} ({resv.flatNumber})</td>
                        <td className="p-3">{resv.primaryGuestName} ({resv.primaryGuestPhone})</td>
                        <td className="p-3">{resv.checkInDate} to {resv.checkOutDate} ({resv.totalNights} nights)</td>
                        <td className="p-3 font-bold text-slate-900">â‚¹{resv.totalPrice}</td>
                        <td className="p-3">
                          <span className={`px-2.5 py-1 text-xs rounded-full font-bold ${
                            resv.status === 'CONFIRMED' ? 'bg-emerald-100 text-emerald-800' :
                            resv.status === 'CHECKED_IN' ? 'bg-indigo-100 text-indigo-800' :
                            resv.status === 'CHECKED_OUT' ? 'bg-slate-100 text-slate-700' :
                            'bg-rose-100 text-rose-800'
                          }`}>
                            {resv.status}
                          </span>
                        </td>
                        <td className="p-3 text-right flex justify-end gap-1">
                          {resv.status === 'PENDING_APPROVAL' && (
                            <>
                              <button
                                onClick={() => handleApproveReservation(resv.id)}
                                className="px-2.5 py-1 bg-emerald-600 text-white text-xs font-bold rounded-lg"
                              >
                                Approve
                              </button>
                              <button
                                onClick={() => handleRejectReservation(resv.id)}
                                className="px-2.5 py-1 bg-rose-600 text-white text-xs font-bold rounded-lg"
                              >
                                Reject
                              </button>
                            </>
                          )}
                        </td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            </div>
          </div>
        </>
      )}

      {/* Modal: Create Room */}
      <Modal isOpen={showCreateModal} onClose={() => setShowCreateModal(false)} title="Configure New Guest Suite">
        <form onSubmit={handleCreateRoom} className="space-y-4">
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">Room Number</label>
              <input
                type="text"
                required
                placeholder="e.g. 104"
                value={roomForm.roomNumber}
                onChange={e => setRoomForm({ ...roomForm, roomNumber: e.target.value })}
                className="w-full px-3 py-2 border rounded-lg text-sm"
              />
            </div>
            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">Suite Name</label>
              <input
                type="text"
                required
                placeholder="e.g. Penthouse Suite 104"
                value={roomForm.roomName}
                onChange={e => setRoomForm({ ...roomForm, roomName: e.target.value })}
                className="w-full px-3 py-2 border rounded-lg text-sm"
              />
            </div>
          </div>

          <div className="grid grid-cols-3 gap-3">
            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">Room Type</label>
              <select
                value={roomForm.type}
                onChange={e => setRoomForm({ ...roomForm, type: e.target.value as RoomType })}
                className="w-full px-3 py-2 border rounded-lg text-sm"
              >
                {ROOM_TYPES.map(t => (
                  <option key={t} value={t}>{t.replace(/_/g, ' ')}</option>
                ))}
              </select>
            </div>
            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">Price per Night (â‚¹)</label>
              <input
                type="number"
                min={500}
                required
                value={roomForm.pricePerNight}
                onChange={e => setRoomForm({ ...roomForm, pricePerNight: parseInt(e.target.value) || 1000 })}
                className="w-full px-3 py-2 border rounded-lg text-sm"
              />
            </div>
            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">Max Capacity</label>
              <input
                type="number"
                min={1}
                max={6}
                required
                value={roomForm.capacity}
                onChange={e => setRoomForm({ ...roomForm, capacity: parseInt(e.target.value) || 2 })}
                className="w-full px-3 py-2 border rounded-lg text-sm"
              />
            </div>
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-1">Description</label>
            <textarea
              rows={2}
              placeholder="Suite facilities description..."
              value={roomForm.description}
              onChange={e => setRoomForm({ ...roomForm, description: e.target.value })}
              className="w-full px-3 py-2 border rounded-lg text-sm"
            />
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-1">Amenities Included (One per line)</label>
            <textarea
              rows={3}
              value={roomForm.amenitiesText}
              onChange={e => setRoomForm({ ...roomForm, amenitiesText: e.target.value })}
              className="w-full px-3 py-2 border rounded-lg text-sm font-mono text-xs"
            />
          </div>

          <div className="pt-4 flex justify-end gap-2">
            <button type="button" onClick={() => setShowCreateModal(false)} className="px-4 py-2 text-slate-600 hover:bg-slate-100 text-sm font-semibold rounded-lg">Cancel</button>
            <button type="submit" className="px-4 py-2 bg-indigo-600 text-white font-bold text-sm rounded-lg">Save Guest Suite</button>
          </div>
        </form>
      </Modal>
    </div>
  );
};

