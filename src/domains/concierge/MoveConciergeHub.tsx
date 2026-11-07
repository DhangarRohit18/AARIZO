import React, { useState } from 'react';
import { Truck, CheckSquare, Calendar, ShieldCheck, Clock, ArrowRight } from 'lucide-react';

export const MoveConciergeHub: React.FC = () => {
  const [moveType, setMoveType] = useState<'MOVE_IN' | 'MOVE_OUT'>('MOVE_IN');
  const [flatNumber, setFlatNumber] = useState('');
  const [scheduledDate, setScheduledDate] = useState('');
  const [vehicleType, setVehicleType] = useState('LARGE_TRUCK');
  const [isSubmitted, setIsSubmitted] = useState(false);

  const [checklist, setChecklist] = useState([
    { id: 1, text: 'Submit Society Maintenance Clearance Certificate', completed: true },
    { id: 2, text: 'Reserve Service Elevator Slot (10:00 AM - 02:00 PM)', completed: false },
    { id: 3, text: 'Gate Entry Pass generated for Packers & Movers Truck', completed: false },
    { id: 4, text: 'Deposit Move-In Refundable Security Escrow (₹5,000)', completed: false },
    { id: 5, text: 'Submit Tenant Police Verification & Aadhaar Copy', completed: false },
  ]);

  const toggleCheck = (id: number) => {
    setChecklist((prev) =>
      prev.map((item) => (item.id === id ? { ...item, completed: !item.completed } : item))
    );
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitted(true);
  };

  return (
    <div className="p-4 max-w-4xl mx-auto space-y-6">
      {/* Header */}
      <div className="bg-gradient-to-r from-blue-900 via-indigo-900 to-slate-900 rounded-3xl p-6 text-white shadow-xl">
        <div className="flex items-center gap-3">
          <div className="p-3 bg-blue-500/20 text-blue-400 rounded-2xl">
            <Truck size={28} />
          </div>
          <div>
            <h1 className="text-2xl font-bold">AI Move Concierge</h1>
            <p className="text-sm text-blue-200">
              End-to-end relocation management, society gate clearances, and elevator reservation
            </p>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {/* Move Booking Form */}
        <div className="md:col-span-2 bg-slate-900 border border-slate-800 rounded-2xl p-6 text-white shadow-lg space-y-4">
          <h3 className="text-lg font-semibold flex items-center gap-2">
            <Calendar size={20} className="text-blue-400" />
            Schedule Relocation Slot
          </h3>

          {isSubmitted ? (
            <div className="p-6 bg-emerald-950/40 border border-emerald-800 rounded-2xl text-center space-y-3">
              <ShieldCheck size={48} className="mx-auto text-emerald-400 animate-bounce" />
              <h4 className="text-lg font-bold text-emerald-300">Move Request Scheduled</h4>
              <p className="text-sm text-slate-300">
                Your request for {moveType === 'MOVE_IN' ? 'Move-In' : 'Move-Out'} for flat{' '}
                <span className="font-semibold text-white">{flatNumber || 'A-101'}</span> on{' '}
                <span className="font-semibold text-white">{scheduledDate || 'Tomorrow'}</span> has
                been queued. The Secretary and Gate Security have been notified.
              </p>
              <button
                onClick={() => setIsSubmitted(false)}
                className="mt-2 px-4 py-2 bg-slate-800 hover:bg-slate-700 text-sm rounded-xl text-white font-medium"
              >
                Schedule Another
              </button>
            </div>
          ) : (
            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="grid grid-cols-2 gap-3">
                <button
                  type="button"
                  onClick={() => setMoveType('MOVE_IN')}
                  className={`py-3 rounded-xl text-sm font-semibold border transition ${
                    moveType === 'MOVE_IN'
                      ? 'bg-blue-600 border-blue-500 text-white'
                      : 'bg-slate-950 border-slate-800 text-slate-400'
                  }`}
                >
                  Move-In
                </button>
                <button
                  type="button"
                  onClick={() => setMoveType('MOVE_OUT')}
                  className={`py-3 rounded-xl text-sm font-semibold border transition ${
                    moveType === 'MOVE_OUT'
                      ? 'bg-blue-600 border-blue-500 text-white'
                      : 'bg-slate-950 border-slate-800 text-slate-400'
                  }`}
                >
                  Move-Out
                </button>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="text-xs text-slate-400 font-medium">Flat Number</label>
                  <input
                    type="text"
                    required
                    placeholder="e.g. A-402"
                    value={flatNumber}
                    onChange={(e) => setFlatNumber(e.target.value)}
                    className="w-full mt-1 bg-slate-950 border border-slate-800 rounded-xl px-4 py-2.5 text-sm text-white focus:outline-none focus:border-blue-500"
                  />
                </div>

                <div>
                  <label className="text-xs text-slate-400 font-medium">Scheduled Move Date</label>
                  <input
                    type="date"
                    required
                    value={scheduledDate}
                    onChange={(e) => setScheduledDate(e.target.value)}
                    className="w-full mt-1 bg-slate-950 border border-slate-800 rounded-xl px-4 py-2.5 text-sm text-white focus:outline-none focus:border-blue-500"
                  />
                </div>
              </div>

              <div>
                <label className="text-xs text-slate-400 font-medium">Vehicle / Truck Category</label>
                <select
                  value={vehicleType}
                  onChange={(e) => setVehicleType(e.target.value)}
                  className="w-full mt-1 bg-slate-950 border border-slate-800 rounded-xl px-4 py-2.5 text-sm text-white focus:outline-none focus:border-blue-500"
                >
                  <option value="MINI_TRUCK">Small / Tata Ace (Under 2.5T)</option>
                  <option value="LARGE_TRUCK">Large Container Truck (14ft - 19ft)</option>
                  <option value="MULTI_VEHICLE">Multiple Vehicles</option>
                </select>
              </div>

              <button
                type="submit"
                className="w-full py-3 bg-blue-600 hover:bg-blue-500 text-white font-semibold rounded-xl text-sm transition shadow-lg shadow-blue-600/30 flex items-center justify-center gap-2"
              >
                Submit Move Request & Reserve Elevator
                <ArrowRight size={16} />
              </button>
            </form>
          )}
        </div>

        {/* AI Moving Checklist */}
        <div className="bg-slate-900 border border-slate-800 rounded-2xl p-6 text-white shadow-lg space-y-4">
          <h3 className="text-lg font-semibold flex items-center gap-2">
            <CheckSquare size={20} className="text-emerald-400" />
            Clearance Checklist
          </h3>
          <p className="text-xs text-slate-400">
            Mandatory society bylaws requirements before gate pass approval
          </p>

          <div className="space-y-3">
            {checklist.map((item) => (
              <div
                key={item.id}
                onClick={() => toggleCheck(item.id)}
                className={`p-3 rounded-xl border cursor-pointer transition flex items-start gap-3 ${
                  item.completed
                    ? 'bg-emerald-950/30 border-emerald-800/80 text-emerald-200'
                    : 'bg-slate-950 border-slate-800 text-slate-300 hover:border-slate-700'
                }`}
              >
                <input
                  type="checkbox"
                  checked={item.completed}
                  onChange={() => {}}
                  className="mt-1 rounded text-emerald-600 focus:ring-0"
                />
                <span className="text-xs leading-relaxed font-medium">{item.text}</span>
              </div>
            ))}
          </div>

          <div className="p-3 bg-blue-950/40 border border-blue-800/60 rounded-xl text-xs text-blue-300 flex items-center gap-2">
            <Clock size={16} className="flex-shrink-0" />
            <span>Elevators are padded during scheduled moving hours.</span>
          </div>
        </div>
      </div>
    </div>
  );
};
