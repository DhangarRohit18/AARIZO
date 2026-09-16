import React, { useState, useEffect } from 'react';
import { Wrench } from 'lucide-react';
import { maintenanceService } from '../../../services/maintenanceService';
import type { MaintenanceTicket, TicketStatus } from '../../../types/maintenance';
import { StatusBadge } from '../../../components/ui/StatusBadge';

export const ServiceProviderTaskPage: React.FC = () => {
  const currentSocietyId = 'soc-gvs';
  const providerActor = {
    id: 'ven-plumb-1',
    name: 'Suresh Kumar (Apex Plumbing)',
    role: 'SERVICE_PROVIDER',
  };

  const [tickets, setTickets] = useState<MaintenanceTicket[]>([]);
  const [selectedTicket, setSelectedTicket] = useState<MaintenanceTicket | null>(null);

  // Form State for Updates
  const [statusUpdate, setStatusUpdate] = useState<TicketStatus>('IN_PROGRESS');
  const [notes, setNotes] = useState('');
  const [beforeImage, setBeforeImage] = useState('');
  const [afterImage, setAfterImage] = useState('');

  const reloadData = () => {
    const list = maintenanceService.getTickets(currentSocietyId);
    setTickets(list);
    if (selectedTicket) {
      const updated = list.find((t) => t.id === selectedTicket.id);
      if (updated) setSelectedTicket(updated);
    }
  };

  useEffect(() => {
    reloadData();
  }, []);

  const handleAcceptTask = (ticket: MaintenanceTicket) => {
    maintenanceService.updateTicketStatus(ticket.id, 'ACCEPTED', {}, providerActor);
    reloadData();
  };

  const handleUpdateTaskSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedTicket) return;

    maintenanceService.updateTicketStatus(
      selectedTicket.id,
      statusUpdate,
      {
        serviceNotes: notes,
        beforeImages: beforeImage ? [beforeImage] : selectedTicket.beforeImages,
        afterImages: afterImage ? [afterImage] : selectedTicket.afterImages,
      },
      providerActor
    );

    setSelectedTicket(null);
    setNotes('');
    setBeforeImage('');
    setAfterImage('');
    reloadData();
  };

  return (
    <div className="p-4 md:p-6 space-y-4 md:space-y-6 bg-slate-50 dark:bg-slate-900 min-h-screen text-slate-900 dark:text-slate-100">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-slate-900 dark:text-white flex items-center gap-2">
            <Wrench className="w-7 h-7 text-indigo-600 dark:text-indigo-400" />
            Service Provider Task Execution Portal
          </h1>
          <p className="text-sm text-slate-500 dark:text-slate-400">
            View assigned society maintenance tasks, accept/reject assignments, update work progress, and attach before/after media.
          </p>
        </div>
        <span className="px-3 py-1 bg-indigo-100 dark:bg-indigo-950 text-indigo-700 dark:text-indigo-300 rounded-full text-xs font-semibold">
          {providerActor.name}
        </span>
      </div>

      {/* Task List */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {tickets.map((t) => (
          <div
            key={t.id}
            className="bg-white dark:bg-slate-800 p-5 rounded-xl border border-slate-200 dark:border-slate-700 shadow-sm space-y-4 flex flex-col justify-between"
          >
            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <span className="font-bold text-sm text-slate-900 dark:text-white">
                  Flat {t.flatCode} ({t.residentName})
                </span>
                <StatusBadge
                  variant={
                    t.urgency === 'EMERGENCY' ? 'danger' : t.urgency === 'HIGH' ? 'warning' : 'info'
                  }
                  label={t.urgency}
                />
              </div>

              <div>
                <div className="text-xs font-bold text-indigo-600 dark:text-indigo-400">
                  Category: {t.category}
                </div>
                <p className="text-xs text-slate-600 dark:text-slate-300 mt-1">
                  {t.description}
                </p>
              </div>

              <div className="p-3 bg-slate-50 dark:bg-slate-900 rounded-lg text-xs space-y-1 border border-slate-200 dark:border-slate-700">
                <div className="flex justify-between">
                  <span className="text-slate-500">Scheduled Visit:</span>
                  <span className="font-semibold text-slate-900 dark:text-white">
                    {t.scheduledVisitDate || 'N/A'} ({t.scheduledVisitTime || 'ASAP'})
                  </span>
                </div>
                <div className="flex justify-between">
                  <span className="text-slate-500">SLA Target:</span>
                  <span className="font-semibold">{t.slaTargetHours} Hours</span>
                </div>
                {t.serviceNotes && (
                  <div className="pt-1 text-[11px] italic text-slate-500">
                    Notes: "{t.serviceNotes}"
                  </div>
                )}
              </div>
            </div>

            <div className="pt-3 border-t border-slate-200 dark:border-slate-700 flex items-center justify-between">
              <StatusBadge variant="info" label={t.status} />

              <div className="flex items-center gap-2">
                {t.status === 'ASSIGNED' && (
                  <button
                    onClick={() => handleAcceptTask(t)}
                    className="px-3 py-1.5 bg-emerald-600 hover:bg-emerald-700 text-white rounded text-xs font-semibold"
                  >
                    Accept Task
                  </button>
                )}
                {t.status !== 'CLOSED' && t.status !== 'COMPLETED' && (
                  <button
                    onClick={() => {
                      setSelectedTicket(t);
                      setStatusUpdate(t.status === 'ASSIGNED' ? 'IN_PROGRESS' : t.status);
                    }}
                    className="px-3 py-1.5 bg-indigo-600 hover:bg-indigo-700 text-white rounded text-xs font-semibold"
                  >
                    Update Progress
                  </button>
                )}
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* Modal: Update Progress & Media */}
      {selectedTicket && (
        <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-sm flex items-center justify-center p-4">
          <form
            onSubmit={handleUpdateTaskSubmit}
            className="bg-white dark:bg-slate-800 rounded-xl max-w-md w-full p-4 md:p-6 space-y-4 border border-slate-200 dark:border-slate-700 shadow-xl"
          >
            <h3 className="font-bold text-slate-900 dark:text-white text-base">
              Update Work Status - Flat {selectedTicket.flatCode}
            </h3>

            <div className="space-y-3 text-xs">
              <div>
                <label className="block font-semibold mb-1">Status *</label>
                <select
                  className="w-full p-2.5 bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-lg"
                  value={statusUpdate}
                  onChange={(e) => setStatusUpdate(e.target.value as TicketStatus)}
                >
                  <option value="ACCEPTED">ACCEPTED</option>
                  <option value="IN_PROGRESS">IN_PROGRESS</option>
                  <option value="ON_HOLD">ON_HOLD</option>
                  <option value="COMPLETED">COMPLETED</option>
                  <option value="VERIFIED">VERIFIED</option>
                </select>
              </div>

              <div>
                <label className="block font-semibold mb-1">Technician Work Notes *</label>
                <textarea
                  rows={3}
                  required
                  placeholder="Describe work completed or reasons for delay..."
                  className="w-full p-2.5 bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-lg"
                  value={notes}
                  onChange={(e) => setNotes(e.target.value)}
                />
              </div>

              <div className="grid grid-cols-2 gap-2">
                <div>
                  <label className="block font-semibold mb-1">Before Image URL</label>
                  <input
                    type="text"
                    placeholder="https://..."
                    className="w-full p-2.5 bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-lg"
                    value={beforeImage}
                    onChange={(e) => setBeforeImage(e.target.value)}
                  />
                </div>
                <div>
                  <label className="block font-semibold mb-1">After Image URL</label>
                  <input
                    type="text"
                    placeholder="https://..."
                    className="w-full p-2.5 bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-lg"
                    value={afterImage}
                    onChange={(e) => setAfterImage(e.target.value)}
                  />
                </div>
              </div>
            </div>

            <div className="flex justify-end gap-2 pt-2">
              <button
                type="button"
                onClick={() => setSelectedTicket(null)}
                className="px-4 py-2 bg-slate-100 dark:bg-slate-700 text-slate-700 dark:text-slate-300 rounded-lg text-xs font-semibold"
              >
                Cancel
              </button>
              <button
                type="submit"
                className="px-4 py-2 bg-indigo-600 hover:bg-indigo-700 text-white rounded-lg text-xs font-semibold"
              >
                Save Progress
              </button>
            </div>
          </form>
        </div>
      )}
    </div>
  );
};
