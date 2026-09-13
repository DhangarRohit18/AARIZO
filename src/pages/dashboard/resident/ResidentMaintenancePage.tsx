import React, { useState, useEffect } from 'react';
import { Wrench, Plus, Star, Image as ImageIcon } from 'lucide-react';
import { maintenanceService } from '../../../services/maintenanceService';
import type { MaintenanceTicket, MaintenanceCategory, TicketUrgency } from '../../../types/maintenance';
import { StatusBadge } from '../../../components/ui/StatusBadge';

export const ResidentMaintenancePage: React.FC = () => {
  const currentSocietyId = 'soc-gvs';
  const currentResident = {
    id: 'res-1',
    name: 'Rajesh Kumar',
    flatCode: 'B-1204',
    flatId: 'flat-1204',
    role: 'RESIDENT',
  };

  const [tickets, setTickets] = useState<MaintenanceTicket[]>([]);
  const [isNewTicketModalOpen, setIsNewTicketModalOpen] = useState(false);

  // New Ticket Form State
  const [category, setCategory] = useState<MaintenanceCategory>('PLUMBING');
  const [urgency, setUrgency] = useState<TicketUrgency>('MEDIUM');
  const [description, setDescription] = useState('');
  const [mediaUrlInput, setMediaUrlInput] = useState('');

  // Rating Modal State
  const [ratingTicket, setRatingTicket] = useState<MaintenanceTicket | null>(null);
  const [selectedStars, setSelectedStars] = useState<number>(5);
  const [reviewNotes, setReviewNotes] = useState('');

  const reloadData = () => {
    const list = maintenanceService
      .getTickets(currentSocietyId)
      .filter((t) => t.flatCode === currentResident.flatCode || t.residentId === currentResident.id);
    setTickets(list);
  };

  useEffect(() => {
    reloadData();
  }, []);

  const handleCreateTicketSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!description.trim()) return;

    maintenanceService.createTicket(
      {
        societyId: currentSocietyId,
        flatId: currentResident.flatId,
        flatCode: currentResident.flatCode,
        residentId: currentResident.id,
        residentName: currentResident.name,
        category,
        urgency,
        description,
        mediaUrls: mediaUrlInput ? [mediaUrlInput] : [],
      },
      currentResident
    );

    setIsNewTicketModalOpen(false);
    setDescription('');
    setMediaUrlInput('');
    reloadData();
  };

  const handleRatingSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!ratingTicket) return;

    maintenanceService.rateTicket(ratingTicket.id, selectedStars, reviewNotes, currentResident);
    setRatingTicket(null);
    setReviewNotes('');
    reloadData();
  };

  return (
    <div className="p-6 space-y-6 bg-slate-50 dark:bg-slate-900 min-h-screen text-slate-900 dark:text-slate-100">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-slate-900 dark:text-white flex items-center gap-2">
            <Wrench className="w-7 h-7 text-indigo-600 dark:text-indigo-400" />
            My Household Maintenance Hub
          </h1>
          <p className="text-sm text-slate-500 dark:text-slate-400">
            Log maintenance requests for Flat {currentResident.flatCode}, track SLA status, and rate completed work.
          </p>
        </div>
        <button
          onClick={() => setIsNewTicketModalOpen(true)}
          className="px-4 py-2.5 bg-indigo-600 hover:bg-indigo-700 text-white font-semibold rounded-xl text-xs flex items-center gap-2 transition-colors shadow-sm"
        >
          <Plus className="w-4 h-4" /> Log Maintenance Request
        </button>
      </div>

      {/* Ticket Cards Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {tickets.map((t) => (
          <div
            key={t.id}
            className="bg-white dark:bg-slate-800 p-5 rounded-xl border border-slate-200 dark:border-slate-700 shadow-sm space-y-4 flex flex-col justify-between"
          >
            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <span className="px-2 py-0.5 bg-indigo-100 dark:bg-indigo-950 text-indigo-700 dark:text-indigo-300 rounded text-xs font-bold">
                  {t.category}
                </span>
                <StatusBadge
                  variant={
                    t.urgency === 'EMERGENCY'
                      ? 'danger'
                      : t.urgency === 'HIGH'
                      ? 'warning'
                      : 'info'
                  }
                  label={t.urgency}
                />
              </div>

              <p className="text-xs text-slate-700 dark:text-slate-300 font-medium">
                {t.description}
              </p>

              {t.mediaUrls.length > 0 && (
                <div className="flex items-center gap-2 text-xs text-indigo-600 dark:text-indigo-400">
                  <ImageIcon className="w-4 h-4" />
                  <span>{t.mediaUrls.length} media attached</span>
                </div>
              )}

              <div className="p-3 bg-slate-50 dark:bg-slate-900 rounded-lg text-xs space-y-1 border border-slate-200 dark:border-slate-700">
                <div className="flex justify-between">
                  <span className="text-slate-500">Technician:</span>
                  <span className="font-semibold text-slate-900 dark:text-white">
                    {t.assignedTechnicianName || 'Pending Assignment'}
                  </span>
                </div>
                {t.scheduledVisitDate && (
                  <div className="flex justify-between text-slate-500">
                    <span>Visit:</span>
                    <span>{t.scheduledVisitDate} ({t.scheduledVisitTime})</span>
                  </div>
                )}
                {t.serviceNotes && (
                  <div className="pt-1 text-[11px] italic text-slate-600 dark:text-slate-400">
                    "{t.serviceNotes}"
                  </div>
                )}
              </div>
            </div>

            <div className="pt-3 border-t border-slate-200 dark:border-slate-700 flex items-center justify-between">
              <StatusBadge
                variant={
                  t.status === 'COMPLETED' || t.status === 'VERIFIED'
                    ? 'success'
                    : t.status === 'CLOSED'
                    ? 'neutral'
                    : 'warning'
                }
                label={t.status}
              />

              {(t.status === 'COMPLETED' || t.status === 'VERIFIED') && !t.rating && (
                <button
                  onClick={() => setRatingTicket(t)}
                  className="px-3 py-1.5 bg-amber-500 hover:bg-amber-600 text-white font-semibold rounded-lg text-xs flex items-center gap-1.5 transition-colors"
                >
                  <Star className="w-3.5 h-3.5 fill-current" /> Rate Service
                </button>
              )}

              {t.rating && (
                <div className="flex items-center gap-1 text-amber-500 font-bold text-xs">
                  <Star className="w-3.5 h-3.5 fill-current" /> {t.rating} / 5 Stars
                </div>
              )}
            </div>
          </div>
        ))}

        {tickets.length === 0 && (
          <div className="col-span-full py-16 text-center text-slate-500 text-sm bg-white dark:bg-slate-800 rounded-xl border border-slate-200 dark:border-slate-700">
            No maintenance requests logged yet for Flat {currentResident.flatCode}.
          </div>
        )}
      </div>

      {/* Modal: Create Ticket */}
      {isNewTicketModalOpen && (
        <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-sm flex items-center justify-center p-4">
          <form
            onSubmit={handleCreateTicketSubmit}
            className="bg-white dark:bg-slate-800 rounded-xl max-w-md w-full p-6 space-y-4 border border-slate-200 dark:border-slate-700 shadow-xl"
          >
            <h3 className="font-bold text-slate-900 dark:text-white text-base">
              Create Maintenance Request (Flat {currentResident.flatCode})
            </h3>

            <div className="space-y-3 text-xs">
              <div className="grid grid-cols-2 gap-2">
                <div>
                  <label className="block font-semibold mb-1">Category *</label>
                  <select
                    className="w-full p-2.5 bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-lg"
                    value={category}
                    onChange={(e) => setCategory(e.target.value as MaintenanceCategory)}
                  >
                    <option value="PLUMBING">Plumbing</option>
                    <option value="ELECTRICIAN">Electrician</option>
                    <option value="CIVIL">Civil</option>
                    <option value="CARPENTRY">Carpentry</option>
                    <option value="PAINTING">Painting</option>
                    <option value="LIFT">Lift</option>
                    <option value="GENERATOR">Generator</option>
                    <option value="WATER">Water</option>
                    <option value="ELECTRICAL">Electrical</option>
                    <option value="SWIMMING_POOL">Swimming Pool</option>
                    <option value="HOUSEKEEPING">Housekeeping</option>
                    <option value="GARBAGE">Garbage</option>
                    <option value="PEST_CONTROL">Pest Control</option>
                    <option value="GARDENING">Gardening</option>
                    <option value="SECURITY">Security</option>
                    <option value="OTHER">Other</option>
                  </select>
                </div>

                <div>
                  <label className="block font-semibold mb-1">Urgency *</label>
                  <select
                    className="w-full p-2.5 bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-lg"
                    value={urgency}
                    onChange={(e) => setUrgency(e.target.value as TicketUrgency)}
                  >
                    <option value="LOW">Low (48h SLA)</option>
                    <option value="MEDIUM">Medium (24h SLA)</option>
                    <option value="HIGH">High (12h SLA)</option>
                    <option value="EMERGENCY">Emergency (4h SLA)</option>
                  </select>
                </div>
              </div>

              <div>
                <label className="block font-semibold mb-1">Issue Description *</label>
                <textarea
                  rows={3}
                  required
                  placeholder="Describe the issue in detail..."
                  className="w-full p-2.5 bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-lg"
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                />
              </div>

              <div>
                <label className="block font-semibold mb-1">Image / Video URL (Optional)</label>
                <input
                  type="text"
                  placeholder="https://example.com/photo.jpg"
                  className="w-full p-2.5 bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-lg"
                  value={mediaUrlInput}
                  onChange={(e) => setMediaUrlInput(e.target.value)}
                />
              </div>
            </div>

            <div className="flex justify-end gap-2 pt-2">
              <button
                type="button"
                onClick={() => setIsNewTicketModalOpen(false)}
                className="px-4 py-2 bg-slate-100 dark:bg-slate-700 text-slate-700 dark:text-slate-300 rounded-lg text-xs font-semibold"
              >
                Cancel
              </button>
              <button
                type="submit"
                className="px-4 py-2 bg-indigo-600 hover:bg-indigo-700 text-white rounded-lg text-xs font-semibold"
              >
                Submit Ticket
              </button>
            </div>
          </form>
        </div>
      )}

      {/* Modal: Rating & Review */}
      {ratingTicket && (
        <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-sm flex items-center justify-center p-4">
          <form
            onSubmit={handleRatingSubmit}
            className="bg-white dark:bg-slate-800 rounded-xl max-w-md w-full p-6 space-y-4 border border-slate-200 dark:border-slate-700 shadow-xl"
          >
            <h3 className="font-bold text-slate-900 dark:text-white text-base">
              Rate Maintenance Service
            </h3>

            <div className="space-y-3 text-xs">
              <div>
                <label className="block font-semibold mb-2">Rating</label>
                <div className="flex items-center gap-2">
                  {[1, 2, 3, 4, 5].map((star) => (
                    <button
                      key={star}
                      type="button"
                      onClick={() => setSelectedStars(star)}
                      className="p-1 hover:scale-110 transition-transform"
                    >
                      <Star
                        className={`w-7 h-7 ${
                          star <= selectedStars
                            ? 'text-amber-400 fill-amber-400'
                            : 'text-slate-300 dark:text-slate-600'
                        }`}
                      />
                    </button>
                  ))}
                </div>
              </div>

              <div>
                <label className="block font-semibold mb-1">Feedback / Review Notes</label>
                <textarea
                  rows={3}
                  placeholder="Share feedback on technician work quality and behavior..."
                  className="w-full p-2.5 bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-lg"
                  value={reviewNotes}
                  onChange={(e) => setReviewNotes(e.target.value)}
                />
              </div>
            </div>

            <div className="flex justify-end gap-2 pt-2">
              <button
                type="button"
                onClick={() => setRatingTicket(null)}
                className="px-4 py-2 bg-slate-100 dark:bg-slate-700 text-slate-700 dark:text-slate-300 rounded-lg text-xs font-semibold"
              >
                Cancel
              </button>
              <button
                type="submit"
                className="px-4 py-2 bg-amber-500 hover:bg-amber-600 text-white rounded-lg text-xs font-semibold"
              >
                Submit Review
              </button>
            </div>
          </form>
        </div>
      )}
    </div>
  );
};
