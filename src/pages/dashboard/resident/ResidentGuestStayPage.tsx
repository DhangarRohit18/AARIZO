import React, { useState, useEffect } from 'react';
import { useAuth } from '../../../context/AuthContext';
import { guestStayService } from '../../../services/guestStayService';
import type { GuestRoom, GuestReservation, GuestStaySettings } from '../../../types/guestStay';
import { Modal } from '../../../components/ui/Modal';
import {
  Hotel,
  Calendar,
  QrCode,
  Building,
  XCircle,
  Sparkles
} from 'lucide-react';

export const ResidentGuestStayPage: React.FC = () => {
  const { currentUser } = useAuth();
  const societyId = (currentUser as any)?.societyId || 'soc-1';
  const residentId = currentUser?.id || 'res-1';
  const residentName = currentUser?.name || 'resident';
  const flatNumber = (currentUser as any)?.flatDetails || 'A-101';

  const [settings, setSettings] = useState<GuestStaySettings | null>(null);
  const [rooms, setRooms] = useState<GuestRoom[]>([]);
  const [myReservations, setMyReservations] = useState<GuestReservation[]>([]);
  const [selectedRoom, setSelectedRoom] = useState<GuestRoom | null>(null);

  // Booking Form State
  const [guestName, setGuestName] = useState('');
  const [guestPhone, setGuestPhone] = useState('');
  const [idProofType, setIdProofType] = useState('Aadhaar Card');
  const [idProofNumber, setIdProofNumber] = useState('');
  const [guestCount, setGuestCount] = useState(2);
  const [checkInDate, setCheckInDate] = useState(new Date().toISOString().substring(0, 10));
  const [checkOutDate, setCheckOutDate] = useState(new Date(Date.now() + 2 * 24 * 60 * 60 * 1000).toISOString().substring(0, 10));

  // Active QR View Modal
  const [viewingQRResv, setViewingQRResv] = useState<GuestReservation | null>(null);

  useEffect(() => {
    loadData();
  }, [societyId, residentId]);

  const loadData = () => {
    setSettings(guestStayService.getSettings(societyId));
    setRooms(guestStayService.getRooms(societyId));
    const list = guestStayService.getReservations(societyId).filter(r => r.residentId === residentId);
    setMyReservations(list);
  };

  const handleBookRoom = (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedRoom || !guestName || !guestPhone) return;

    const resv = guestStayService.requestReservation(
      societyId,
      selectedRoom.id,
      residentId,
      residentName,
      flatNumber,
      guestName,
      guestPhone,
      idProofType,
      idProofNumber,
      guestCount,
      checkInDate,
      checkOutDate
    );

    setSelectedRoom(null);
    setGuestName('');
    setGuestPhone('');
    setIdProofNumber('');
    setViewingQRResv(resv);
    loadData();
  };

  const handleCancelReservation = (id: string) => {
    guestStayService.updateReservationStatus(societyId, id, 'CANCELLED', 'Cancelled by Resident');
    loadData();
  };

  if (settings && !settings.isGuestStayEnabled) {
    return (
      <div className="p-12 text-center bg-white rounded-2xl border border-slate-200/80 m-6">
        <Hotel className="w-12 h-12 text-slate-300 mx-auto mb-2" />
        <h2 className="text-xl font-bold text-slate-800">Guest Accommodation Unavailable</h2>
        <p className="text-xs text-slate-500 mt-1">Guest room booking is currently not enabled by the society management.</p>
      </div>
    );
  }

  return (
    <div className="space-y-6 p-4 md:p-6">
      {/* Header */}
      <div className="bg-white p-4 md:p-6 rounded-2xl border border-slate-200/80 shadow-sm flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <span className="p-2 bg-indigo-50 text-indigo-600 rounded-xl">
              <Sparkles className="w-5 h-5" />
            </span>
            <h1 className="text-2xl font-bold text-slate-900">Guest Stay & Room Accommodation</h1>
          </div>
          <p className="text-slate-500 text-sm mt-1">
            Book society guest suites for visiting family, friends, or business guests with automatic Gate Access QRs.
          </p>
        </div>
      </div>

      {/* Guest Rooms Catalog */}
      <div className="space-y-3">
        <h2 className="text-lg font-bold text-slate-900">Available Guest Suites</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {rooms.map(room => (
            <div key={room.id} className="bg-white rounded-2xl border border-slate-200/80 shadow-sm overflow-hidden flex flex-col justify-between hover:border-indigo-200 transition-colors">
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
                    <Building className="w-3.5 h-3.5" /> Suite #{room.roomNumber} â€¢ Max {room.capacity} Pax
                  </p>
                  <p className="text-slate-600 text-sm mt-2 line-clamp-2">{room.description}</p>

                  <div className="pt-2">
                    <span className="text-[11px] font-bold text-slate-700 block mb-1">Included Amenities:</span>
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

              <div className="p-5 pt-0">
                <button
                  onClick={() => setSelectedRoom(room)}
                  className="w-full py-2.5 bg-indigo-600 hover:bg-indigo-700 text-white font-bold text-xs rounded-xl shadow-sm flex items-center justify-center gap-2"
                >
                  <Calendar className="w-4 h-4" /> Book Suite Now
                </button>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* My Reservations */}
      <div className="bg-white p-4 md:p-6 rounded-2xl border border-slate-200/80 shadow-sm space-y-4">
        <h2 className="text-lg font-bold text-slate-900">My Guest Stay Reservations</h2>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-sm text-slate-600">
            <thead className="bg-slate-50 text-slate-700 font-semibold border-b border-slate-200">
              <tr>
                <th className="p-3">Reservation #</th>
                <th className="p-3">Suite Name</th>
                <th className="p-3">Primary Guest</th>
                <th className="p-3">Dates</th>
                <th className="p-3">Total Cost</th>
                <th className="p-3">Status</th>
                <th className="p-3 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {myReservations.length === 0 ? (
                <tr>
                  <td colSpan={7} className="p-4 md:p-6 text-center text-slate-400">You have no active guest room reservations</td>
                </tr>
              ) : (
                myReservations.map(resv => (
                  <tr key={resv.id} className="hover:bg-slate-50">
                    <td className="p-3 font-bold text-slate-900">{resv.reservationNumber}</td>
                    <td className="p-3 font-medium">{resv.roomName} (#{resv.roomNumber})</td>
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
                    <td className="p-3 text-right flex justify-end gap-2">
                      {(resv.status === 'CONFIRMED' || resv.status === 'CHECKED_IN') && (
                        <button
                          onClick={() => setViewingQRResv(resv)}
                          className="px-3 py-1.5 border border-indigo-200 text-indigo-700 hover:bg-indigo-50 text-xs font-semibold rounded-lg flex items-center gap-1"
                        >
                          <QrCode className="w-3.5 h-3.5" /> Gate QR Pass
                        </button>
                      )}
                      {resv.status === 'CONFIRMED' && (
                        <button
                          onClick={() => handleCancelReservation(resv.id)}
                          className="px-2.5 py-1 text-xs border border-rose-200 text-rose-600 hover:bg-rose-50 rounded-lg flex items-center gap-1"
                        >
                          <XCircle className="w-3.5 h-3.5" /> Cancel
                        </button>
                      )}
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Modal: View QR Access Pass */}
      {viewingQRResv && (
        <Modal isOpen={!!viewingQRResv} onClose={() => setViewingQRResv(null)} title="Guest Gate Access QR Pass">
          <div className="text-center space-y-4 py-2">
            <div className="bg-indigo-50/70 p-4 rounded-2xl border border-indigo-100 inline-block">
              <div className="w-48 h-48 bg-white p-3 rounded-xl border border-slate-300 shadow-inner mx-auto flex items-center justify-center font-mono font-bold text-center text-indigo-900 text-xs leading-relaxed">
                [ GUEST ACCESS QR ]
                <br />
                {viewingQRResv.qrCode}
              </div>
            </div>
            <div>
              <h3 className="font-bold text-lg text-slate-900">{viewingQRResv.primaryGuestName}</h3>
              <p className="text-xs text-slate-500">Suite: <strong>{viewingQRResv.roomName} (#{viewingQRResv.roomNumber})</strong></p>
              <p className="text-xs text-slate-400 mt-1">Check-in: {viewingQRResv.checkInDate} | Check-out: {viewingQRResv.checkOutDate}</p>
            </div>
            <button
              onClick={() => setViewingQRResv(null)}
              className="w-full py-2.5 bg-indigo-600 text-white font-bold text-sm rounded-xl"
            >
              Done / Share Pass with Guest
            </button>
          </div>
        </Modal>
      )}

      {/* Modal: Book Guest Room */}
      {selectedRoom && (
        <Modal isOpen={!!selectedRoom} onClose={() => setSelectedRoom(null)} title={`Book ${selectedRoom.roomName}`}>
          <form onSubmit={handleBookRoom} className="space-y-4">
            <div className="bg-indigo-50 p-3 rounded-xl text-xs text-indigo-900 font-medium">
              <strong>Rate:</strong> â‚¹{selectedRoom.pricePerNight} / Night â€¢ Max Capacity: {selectedRoom.capacity} Guests
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">Primary Guest Full Name</label>
              <input
                type="text"
                required
                placeholder="e.g. Vikram Sharma"
                value={guestName}
                onChange={e => setGuestName(e.target.value)}
                className="w-full px-3 py-2 border rounded-lg text-sm"
              />
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">Guest Phone Number</label>
                <input
                  type="text"
                  required
                  placeholder="+91 98765 43210"
                  value={guestPhone}
                  onChange={e => setGuestPhone(e.target.value)}
                  className="w-full px-3 py-2 border rounded-lg text-sm"
                />
              </div>
              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">Total Guests</label>
                <input
                  type="number"
                  min={1}
                  max={selectedRoom.capacity}
                  required
                  value={guestCount}
                  onChange={e => setGuestCount(parseInt(e.target.value) || 1)}
                  className="w-full px-3 py-2 border rounded-lg text-sm"
                />
              </div>
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">ID Proof Type</label>
                <select
                  value={idProofType}
                  onChange={e => setIdProofType(e.target.value)}
                  className="w-full px-3 py-2 border rounded-lg text-sm"
                >
                  <option value="Aadhaar Card">Aadhaar Card</option>
                  <option value="Passport">Passport</option>
                  <option value="Driving License">Driving License</option>
                  <option value="Voter ID">Voter ID</option>
                </select>
              </div>
              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">ID Proof Number</label>
                <input
                  type="text"
                  required
                  placeholder="e.g. XXXX-XXXX-9912"
                  value={idProofNumber}
                  onChange={e => setIdProofNumber(e.target.value)}
                  className="w-full px-3 py-2 border rounded-lg text-sm"
                />
              </div>
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">Check-in Date</label>
                <input
                  type="date"
                  required
                  value={checkInDate}
                  min={new Date().toISOString().substring(0, 10)}
                  onChange={e => setCheckInDate(e.target.value)}
                  className="w-full px-3 py-2 border rounded-lg text-sm"
                />
              </div>
              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">Check-out Date</label>
                <input
                  type="date"
                  required
                  value={checkOutDate}
                  min={checkInDate}
                  onChange={e => setCheckOutDate(e.target.value)}
                  className="w-full px-3 py-2 border rounded-lg text-sm"
                />
              </div>
            </div>

            <div className="pt-4 flex justify-end gap-2">
              <button type="button" onClick={() => setSelectedRoom(null)} className="px-4 py-2 text-slate-600 hover:bg-slate-100 text-sm font-semibold rounded-lg">Cancel</button>
              <button type="submit" className="px-4 py-2 bg-indigo-600 text-white font-bold text-sm rounded-lg">Confirm & Generate QR Pass</button>
            </div>
          </form>
        </Modal>
      )}
    </div>
  );
};

