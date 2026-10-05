import React, { useState, useEffect } from 'react';
import { Wrench } from 'lucide-react';
import { maintenanceService } from '../../../services/maintenanceService';
import { realtimeService } from '../../../services/realtimeService';
import { FileUpload } from '../../../components/ui/FileUpload';
import type { MaintenanceTicket, TicketStatus } from '../../../types/maintenance';
import { StatusBadge } from '../../../components/ui/StatusBadge';
import { Modal } from '../../../components/ui/Modal';

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

    const unsub = realtimeService.subscribe('*', (msg) => {
      if (['MAINTENANCE_TICKET_CREATED', 'TICKET_STATUS_UPDATED', 'SOCIETY_SYNC'].includes(msg.topic)) {
        reloadData();
      }
    });

    return () => unsub();
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
    <div style={{ minHeight: '100%', background: 'var(--aarizo-page, #F7FBFE)' }}>
      {/* Header */}
      <div
        style={{
          background: 'linear-gradient(135deg, var(--aarizo-navy, #083B56) 0%, #0D4767 100%)',
          padding: '1.25rem 1.5rem',
          color: '#FFFFFF',
          boxShadow: '0 4px 16px rgba(8, 59, 86, 0.08)',
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          flexWrap: 'wrap',
          gap: '1rem',
        }}
      >
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
          <div
            style={{
              width: 44,
              height: 44,
              borderRadius: '12px',
              background: 'rgba(131,203,234,0.15)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              flexShrink: 0,
            }}
          >
            <Wrench size={22} color="var(--aarizo-sky, #83CBEA)" />
          </div>
          <div>
            <h1 style={{ color: '#FFFFFF', fontWeight: 800, fontSize: '1.25rem', margin: 0 }}>
              Service Provider Task Portal
            </h1>
            <p style={{ color: 'var(--aarizo-sky, #83CBEA)', fontSize: '0.8rem', margin: '0.2rem 0 0' }}>
              Assigned society maintenance tasks, status logs &amp; proof submissions
            </p>
          </div>
        </div>
        <span
          style={{
            padding: '0.35rem 0.85rem',
            background: 'rgba(255, 255, 255, 0.12)',
            color: '#FFFFFF',
            borderRadius: '9999px',
            fontSize: '0.75rem',
            fontWeight: 700,
            border: '1px solid rgba(255, 255, 255, 0.2)',
          }}
        >
          {providerActor.name}
        </span>
      </div>

      <div className="max-w-7xl mx-auto p-4 md:p-6 pb-24 space-y-6">
        {/* Task List */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
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
                <div className="text-xs font-bold text-[#083B56] dark:text-[#83CBEA]">
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
                    className="px-3 py-1.5 bg-[#176B91] hover:bg-[#083B56] text-white rounded text-xs font-semibold"
                  >
                    Update Progress
                  </button>
                )}
              </div>
            </div>
          </div>
        ))}
      </div>

      </div>
      {/* Task Update Modal */}
      <Modal
        isOpen={Boolean(selectedTicket)}
        onClose={() => setSelectedTicket(null)}
        title={selectedTicket ? `Update Work Status · Unit ${selectedTicket.flatCode}` : 'Update Work Status'}
        subtitle="Record progress notes, update ticket status, and attach photo proof"
        maxWidth="480px"
      >
        {selectedTicket && (
          <form onSubmit={handleUpdateTaskSubmit} className="space-y-4 pt-1">
            <div>
              <label className="block text-xs font-bold text-slate-700 dark:text-slate-200 mb-1.5">
                Work Status *
              </label>
              <select
                className="w-full px-3.5 py-2.5 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl text-xs font-semibold text-slate-800 dark:text-slate-100 focus:outline-none focus:ring-2 focus:ring-[#176B91]/20 focus:border-[#176B91]"
                value={statusUpdate}
                onChange={(e) => setStatusUpdate(e.target.value as TicketStatus)}
              >
                <option value="ACCEPTED">ACCEPTED (Acknowledged by Technician)</option>
                <option value="IN_PROGRESS">IN_PROGRESS (Currently Servicing)</option>
                <option value="ON_HOLD">ON_HOLD (Awaiting Parts/Approval)</option>
                <option value="COMPLETED">COMPLETED (Ready for Resident Verification)</option>
                <option value="VERIFIED">VERIFIED (Work Confirmed)</option>
              </select>
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-700 dark:text-slate-200 mb-1.5">
                Technician Work Notes *
              </label>
              <textarea
                rows={3}
                required
                placeholder="Describe actions taken, replaced parts, or reason for delay..."
                className="w-full p-3 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl text-xs text-slate-800 dark:text-slate-100 focus:outline-none focus:ring-2 focus:ring-[#176B91]/20 focus:border-[#176B91]"
                value={notes}
                onChange={(e) => setNotes(e.target.value)}
              />
            </div>

            <div className="space-y-3 pt-1">
              <div>
                <FileUpload
                  category="tickets"
                  label="Upload Before-Work Photo"
                  currentUrl={beforeImage}
                  onUploadSuccess={(url) => setBeforeImage(url)}
                  onRemove={() => setBeforeImage('')}
                />
              </div>

              <div>
                <FileUpload
                  category="tickets"
                  label="Upload After-Work Photo (Completion Proof)"
                  currentUrl={afterImage}
                  onUploadSuccess={(url) => setAfterImage(url)}
                  onRemove={() => setAfterImage('')}
                />
              </div>
            </div>

            <div className="flex justify-end gap-2.5 pt-4 border-t border-slate-100 dark:border-slate-800">
              <button
                type="button"
                onClick={() => setSelectedTicket(null)}
                className="px-4 py-2.5 border border-slate-200 dark:border-slate-700 hover:bg-slate-100 dark:hover:bg-slate-800 text-slate-600 dark:text-slate-300 font-bold rounded-xl text-xs transition"
              >
                Cancel
              </button>
              <button
                type="submit"
                className="px-5 py-2.5 text-white font-bold rounded-xl text-xs shadow-md transition"
                style={{ background: 'var(--aarizo-blue, #176B91)' }}
              >
                Save Progress
              </button>
            </div>
          </form>
        )}
      </Modal>
    </div>
  );
};

