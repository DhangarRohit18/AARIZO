import React, { useState, useEffect } from 'react';
import { useAuth } from '../../../context/AuthContext';
import { amenityService } from '../../../services/amenityService';
import type { SocietyAmenity, AmenityBooking } from '../../../types/amenity';
import { Modal } from '../../../components/ui/Modal';
import { DataTable } from '../../../components/ui/DataTable';
import { MobileDataCard } from '../../../components/ui/MobileDataCard';
import {
  Calendar,
  Clock,
  Users,
  Building,
  CheckCircle2,
  AlertCircle,
  XCircle,
  Sparkles
} from 'lucide-react';

export const ResidentAmenityBookingPage: React.FC = () => {
  const { currentUser } = useAuth();
  const societyId = (currentUser as any)?.societyId || 'soc-gvs';
  const residentId = currentUser?.id || 'user-resident-01';
  const residentName = currentUser?.name || 'Sarvesh Kulkarni';
  const flatNumber = (currentUser as any)?.flatNumber || (currentUser as any)?.flatDetails || 'B-1204';

  const [amenities, setAmenities] = useState<SocietyAmenity[]>([]);
  const [userBookings, setUserBookings] = useState<AmenityBooking[]>([]);
  const [selectedAmenity, setSelectedAmenity] = useState<SocietyAmenity | null>(null);

  // Booking Form State
  const [bookingDate, setBookingDate] = useState<string>(new Date().toISOString().substring(0, 10));
  const [startTime, setStartTime] = useState<string>('07:00');
  const [endTime, setEndTime] = useState<string>('08:00');
  const [guestCount, setGuestCount] = useState<number>(1);
  const [purpose, setPurpose] = useState<string>('');

  const [bookingError, setBookingError] = useState<string | null>(null);
  const [bookingSuccess, setBookingSuccess] = useState<string | null>(null);

  useEffect(() => {
    loadData();
  }, [societyId, residentId]);

  const loadData = () => {
    const list = amenityService.getAmenities(societyId);
    setAmenities(list);
    const bks = amenityService.getBookings(societyId).filter(b => b.residentId === residentId);
    setUserBookings(bks);
  };

  const handleOpenBookingModal = (amenity: SocietyAmenity) => {
    setSelectedAmenity(amenity);
    setStartTime(amenity.openTime);
    // calculate default end time (+ 1 hour)
    const [h, m] = amenity.openTime.split(':').map(Number);
    const endH = Math.min(23, h + 1).toString().padStart(2, '0');
    setEndTime(`${endH}:${m.toString().padStart(2, '0')}`);
    setGuestCount(1);
    setPurpose('');
    setBookingError(null);
    setBookingSuccess(null);
  };

  const handleBookSlot = (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedAmenity) return;

    setBookingError(null);
    setBookingSuccess(null);

    try {
      const newBooking = amenityService.createBooking(
        societyId,
        selectedAmenity.id,
        residentId,
        residentName,
        flatNumber,
        bookingDate,
        startTime,
        endTime,
        guestCount,
        purpose
      );

      setBookingSuccess(
        newBooking.status === 'PENDING'
          ? 'Booking request submitted! Pending admin approval.'
          : 'Slot booked successfully!'
      );
      loadData();
      setTimeout(() => {
        setSelectedAmenity(null);
      }, 1500);
    } catch (err: any) {
      setBookingError(err.message || 'Failed to complete booking');
    }
  };

  const handleCancelBooking = (bookingId: string) => {
    amenityService.updateBookingStatus(societyId, bookingId, 'CANCELLED', 'Cancelled by resident');
    loadData();
  };

  return (
    <div className="space-y-6 p-4 md:p-6 pb-24 max-w-6xl mx-auto">
      {/* Header */}
      <div
        className="p-5 md:p-6 rounded-2xl shadow-sm flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 text-white"
        style={{ background: 'linear-gradient(135deg, var(--aarizo-navy, #083B56) 0%, #0D4767 100%)' }}
      >
        <div>
          <div className="flex items-center gap-2">
            <Sparkles className="w-6 h-6" style={{ color: 'var(--aarizo-sky, #83CBEA)' }} />
            <h1 className="text-xl md:text-2xl font-extrabold text-white">Amenities & Clubhouse Booking</h1>
          </div>
          <p className="text-xs md:text-sm mt-1" style={{ color: 'var(--aarizo-sky, #83CBEA)' }}>
            Reserve slots for swimming pool, gym, tennis courts, party hall, and community facilities.
          </p>
        </div>
      </div>

      {/* Amenities Cards Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {amenities.map(amenity => (
          <div key={amenity.id} className="bg-white rounded-2xl border border-slate-200/80 shadow-sm overflow-hidden flex flex-col justify-between hover:border-sky-200 transition-colors">
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
                  <Building className="w-3.5 h-3.5 text-[#176B91]" /> {amenity.location}
                </p>
                <p className="text-slate-600 text-sm mt-3 line-clamp-2">{amenity.description}</p>

                <div className="mt-4 pt-3 border-t border-slate-100 grid grid-cols-2 gap-3 text-xs">
                  <div>
                    <span className="text-slate-400 block">Available Hours</span>
                    <span className="font-semibold text-slate-700 flex items-center gap-1 mt-0.5">
                      <Clock className="w-3.5 h-3.5 text-[#176B91]" /> {amenity.openTime} - {amenity.closeTime}
                    </span>
                  </div>
                  <div>
                    <span className="text-slate-400 block">Slot Capacity</span>
                    <span className="font-semibold text-slate-700 flex items-center gap-1 mt-0.5">
                      <Users className="w-3.5 h-3.5 text-emerald-500" /> Max {amenity.capacityPerSlot} Pax
                    </span>
                  </div>
                </div>

                {amenity.rules && amenity.rules.length > 0 && (
                  <div className="mt-3 bg-slate-50 p-2.5 rounded-lg border border-slate-100 text-xs text-slate-600">
                    <span className="font-semibold text-slate-700 block mb-1">Facility Rules:</span>
                    <ul className="list-disc list-inside space-y-0.5">
                      {amenity.rules.map((rule, idx) => (
                        <li key={idx}>{rule}</li>
                      ))}
                    </ul>
                  </div>
                )}
              </div>
            </div>

            <div className="p-5 pt-0">
              <button
                className="w-full py-2.5 px-4 text-white font-bold text-xs rounded-xl transition-all shadow-sm flex items-center justify-center gap-2"
                style={{
                  background: (!amenity.isBookable || !amenity.isActive) ? '#cbd5e1' : 'var(--aarizo-blue, #176B91)',
                  cursor: (!amenity.isBookable || !amenity.isActive) ? 'not-allowed' : 'pointer'
                }}
                onClick={() => handleOpenBookingModal(amenity)}
                disabled={!amenity.isBookable || !amenity.isActive}
              >
                <Calendar className="w-4 h-4" /> Book Slot Now
              </button>
            </div>
          </div>
        ))}
      </div>

      {/* User Booking History */}
      <div className="bg-white p-4 md:p-6 rounded-2xl border border-slate-200/80 shadow-sm">
        <h2 className="text-lg font-bold text-slate-900 mb-4">My Bookings History</h2>
        <div className="mt-4">
          <DataTable
            columns={[
              { key: 'amenityName', header: 'Amenity', render: (bk: AmenityBooking) => <span className="font-medium text-slate-900">{bk.amenityName}</span> },
              { key: 'bookingDate', header: 'Date' },
              { key: 'time', header: 'Time Slot', render: (bk: AmenityBooking) => `${bk.startTime} - ${bk.endTime}` },
              { key: 'guestCount', header: 'Guests', render: (bk: AmenityBooking) => `${bk.guestCount} Pax` },
              {
                key: 'status',
                header: 'Status',
                render: (bk: AmenityBooking) => (
                  <span className={`px-2.5 py-1 text-xs rounded-full font-semibold ${
                    bk.status === 'APPROVED' ? 'bg-emerald-100 text-emerald-800' :
                    bk.status === 'PENDING' ? 'bg-amber-100 text-amber-800' :
                    bk.status === 'REJECTED' ? 'bg-rose-100 text-rose-800' :
                    'bg-slate-100 text-slate-600'
                  }`}>
                    {bk.status}
                  </span>
                )
              },
              {
                key: 'actions',
                header: 'Action',
                render: (bk: AmenityBooking) => (
                  (bk.status === 'APPROVED' || bk.status === 'PENDING') ? (
                    <button
                      onClick={() => handleCancelBooking(bk.id)}
                      className="px-3 py-1.5 border border-rose-200 text-rose-600 hover:bg-rose-50 text-xs font-semibold rounded-lg flex items-center gap-1 ml-auto"
                    >
                      <XCircle className="w-3.5 h-3.5" /> Cancel
                    </button>
                  ) : null
                )
              }
            ]}
            data={userBookings}
            keyExtractor={(bk: AmenityBooking) => bk.id}
            pageSize={10}
            mobileRender={(bk: AmenityBooking) => (
              <MobileDataCard
                title={bk.amenityName}
                subtitle={`${bk.bookingDate} • ${bk.startTime} - ${bk.endTime}`}
                status={
                  <span className={`px-2 py-0.5 text-[0.65rem] rounded-full font-semibold ${
                    bk.status === 'APPROVED' ? 'bg-emerald-100 text-emerald-800' :
                    bk.status === 'PENDING' ? 'bg-amber-100 text-amber-800' :
                    bk.status === 'REJECTED' ? 'bg-rose-100 text-rose-800' :
                    'bg-slate-100 text-slate-600'
                  }`}>
                    {bk.status}
                  </span>
                }
                attributes={[
                  { label: 'Date', value: bk.bookingDate },
                  { label: 'Time', value: `${bk.startTime} - ${bk.endTime}` },
                  { label: 'Guests', value: `${bk.guestCount} Pax` }
                ]}
                actions={
                  (bk.status === 'APPROVED' || bk.status === 'PENDING') ? (
                    <button
                      onClick={() => handleCancelBooking(bk.id)}
                      className="w-full py-1.5 border border-rose-200 text-rose-600 bg-rose-50/50 text-xs font-semibold rounded-lg flex items-center justify-center gap-1 min-h-[44px]"
                    >
                      <XCircle className="w-4 h-4" /> Cancel Booking
                    </button>
                  ) : undefined
                }
              />
            )}
          />
        </div>
      </div>

      {/* Booking Modal */}
      {selectedAmenity && (
        <Modal isOpen={!!selectedAmenity} onClose={() => setSelectedAmenity(null)} title={`Book Slot: ${selectedAmenity.name}`}>
          <form onSubmit={handleBookSlot} className="space-y-4">
            {bookingError && (
              <div className="p-3 bg-rose-50 border border-rose-200 rounded-xl text-xs text-rose-700 flex items-start gap-2">
                <AlertCircle className="w-4 h-4 text-rose-600 shrink-0 mt-0.5" />
                <span>{bookingError}</span>
              </div>
            )}

            {bookingSuccess && (
              <div className="p-3 bg-emerald-50 border border-emerald-200 rounded-xl text-xs text-emerald-700 flex items-center gap-2">
                <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
                <span>{bookingSuccess}</span>
              </div>
            )}

            <div className="bg-indigo-50/60 p-3 rounded-xl text-xs text-indigo-900 space-y-1">
              <p><strong>Configured Hours:</strong> {selectedAmenity.openTime} to {selectedAmenity.closeTime}</p>
              <p><strong>Max Slot Capacity:</strong> {selectedAmenity.capacityPerSlot} Pax</p>
              {selectedAmenity.requiresApproval && (
                <p className="text-amber-700 font-medium">⚠️ Note: Bookings for this facility require society admin approval.</p>
              )}
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">Booking Date</label>
              <input
                type="date"
                required
                value={bookingDate}
                min={new Date().toISOString().substring(0, 10)}
                onChange={e => setBookingDate(e.target.value)}
                className="w-full px-3 py-2 border rounded-lg text-sm"
              />
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">Start Time</label>
                <input
                  type="time"
                  required
                  value={startTime}
                  onChange={e => setStartTime(e.target.value)}
                  className="w-full px-3 py-2 border rounded-lg text-sm"
                />
              </div>
              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">End Time</label>
                <input
                  type="time"
                  required
                  value={endTime}
                  onChange={e => setEndTime(e.target.value)}
                  className="w-full px-3 py-2 border rounded-lg text-sm"
                />
              </div>
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">Number of Guests / Pax</label>
              <input
                type="number"
                min={1}
                max={selectedAmenity.capacityPerSlot}
                required
                value={guestCount}
                onChange={e => setGuestCount(parseInt(e.target.value) || 1)}
                className="w-full px-3 py-2 border rounded-lg text-sm"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">Purpose / Notes (Optional)</label>
              <input
                type="text"
                placeholder="e.g. Birthday celebration, morning practice"
                value={purpose}
                onChange={e => setPurpose(e.target.value)}
                className="w-full px-3 py-2 border rounded-lg text-sm"
              />
            </div>

            <div className="pt-4 flex justify-end gap-2">
              <button
                type="button"
                onClick={() => setSelectedAmenity(null)}
                style={{ background: '#F1F5F9', color: '#475569', border: '1px solid #CBD5E1' }}
                className="px-4 py-2 text-sm font-semibold rounded-lg hover:bg-slate-200 transition"
              >
                Cancel
              </button>
              <button
                type="submit"
                className="px-4 py-2 text-white font-bold text-sm rounded-lg shadow-sm transition"
                style={{ background: 'var(--aarizo-blue, #176B91)' }}
              >
                Confirm Booking
              </button>
            </div>
          </form>
        </Modal>
      )}
    </div>
  );
};

