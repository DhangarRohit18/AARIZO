import React, { useState, useEffect } from 'react';
import {
  Wrench,
  Plus,
  Calendar as CalendarIcon,
  Repeat,
  Search,
} from 'lucide-react';
import { maintenanceService } from '../../../services/maintenanceService';
import type {
  MaintenanceTicket,
  RecurringMaintenanceSchedule,
  MaintenanceCategory,
  TicketUrgency,
  TicketStatus,
} from '../../../types/maintenance';
import { StatusBadge } from '../../../components/ui/StatusBadge';
import { MaintenanceCalendar } from '../../../components/maintenance/MaintenanceCalendar';

export const MaintenanceManagementPage: React.FC = () => {
  const currentSocietyId = 'soc-gvs';
  const adminActor = { id: 'admin-1', name: 'Mayuri Udar', role: 'SOCIETY_ADMIN' };

  const [activeTab, setActiveTab] = useState<'TICKETS' | 'RECURRING' | 'CALENDAR'>('TICKETS');
  const [tickets, setTickets] = useState<MaintenanceTicket[]>([]);
  const [schedules, setSchedules] = useState<RecurringMaintenanceSchedule[]>([]);

  // Search & Filter state
  const [searchQuery, setSearchQuery] = useState('');
  const [categoryFilter, setCategoryFilter] = useState<string>('ALL');
  const [statusFilter, setStatusFilter] = useState<string>('ALL');

  // Modal State for Assigning Ticket
  const [selectedTicket, setSelectedTicket] = useState<MaintenanceTicket | null>(null);
  const [vendorName, setVendorName] = useState('');
  const [techName, setTechName] = useState('');
  const [visitDate, setVisitDate] = useState('2026-09-14');
  const [visitTime, setVisitTime] = useState('10:00 AM');

  // Modal State for New Recurring Schedule
  const [isNewRecModalOpen, setIsNewRecModalOpen] = useState(false);
  const [recTitle, setRecTitle] = useState('');
  const [recCategory, setRecCategory] = useState<MaintenanceCategory>('SWIMMING_POOL');
  const [recFreq, setRecFreq] = useState<RecurringMaintenanceSchedule['frequency']>('WEEKLY');
  const [recVendor, setRecVendor] = useState('');
  const [recTech, setRecTech] = useState('');
  const [recDueDate, setRecDueDate] = useState('2026-09-20');
  const [recDesc, setRecDesc] = useState('');

  const reloadData = () => {
    setTickets(maintenanceService.getTickets(currentSocietyId));
    setSchedules(maintenanceService.getRecurringSchedules(currentSocietyId));
  };

  useEffect(() => {
    reloadData();
  }, []);

  const handleAssignSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedTicket || !techName) return;

    maintenanceService.assignTicket(
      selectedTicket.id,
      {
        vendorName: vendorName || 'Society In-House Maintenance',
        technicianName: techName,
        scheduledVisitDate: visitDate,
        scheduledVisitTime: visitTime,
      },
      adminActor
    );

    setSelectedTicket(null);
    setVendorName('');
    setTechName('');
    reloadData();
  };

  const handleCreateRecurringSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!recTitle || !recVendor) return;

    maintenanceService.createRecurringSchedule(
      {
        societyId: currentSocietyId,
        title: recTitle,
        category: recCategory,
        frequency: recFreq,
        assignedVendorName: recVendor,
        assignedTechnicianName: recTech || 'Lead Supervisor',
        nextDueDate: recDueDate,
        description: recDesc,
      },
      adminActor
    );

    setIsNewRecModalOpen(false);
    setRecTitle('');
    setRecDesc('');
    reloadData();
  };

  const handleCloseTicket = (ticketId: string) => {
    maintenanceService.updateTicketStatus(ticketId, 'CLOSED', {}, adminActor);
    reloadData();
  };

  const filteredTickets = tickets.filter((t) => {
    const matchesSearch =
      t.flatCode.toLowerCase().includes(searchQuery.toLowerCase()) ||
      t.residentName.toLowerCase().includes(searchQuery.toLowerCase()) ||
      t.description.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesCategory = categoryFilter === 'ALL' || t.category === categoryFilter;
    const matchesStatus = statusFilter === 'ALL' || t.status === statusFilter;
    return matchesSearch && matchesCategory && matchesStatus;
  });

  const getUrgencyBadge = (urgency: TicketUrgency) => {
    switch (urgency) {
      case 'EMERGENCY':
        return <StatusBadge variant="danger" label="EMERGENCY" />;
      case 'HIGH':
        return <StatusBadge variant="warning" label="HIGH" />;
      case 'MEDIUM':
        return <StatusBadge variant="info" label="MEDIUM" />;
      default:
        return <StatusBadge variant="neutral" label="LOW" />;
    }
  };

  const getStatusVariant = (status: TicketStatus): 'success' | 'warning' | 'danger' | 'info' | 'neutral' | 'purple' => {
    switch (status) {
      case 'OPEN':
        return 'warning';
      case 'ASSIGNED':
      case 'ACCEPTED':
        return 'info';
      case 'IN_PROGRESS':
        return 'purple';
      case 'COMPLETED':
      case 'VERIFIED':
        return 'success';
      case 'CLOSED':
        return 'neutral';
      case 'ON_HOLD':
        return 'danger';
      default:
        return 'neutral';
    }
  };

  return (
    <div className="p-6 space-y-6 bg-slate-50 dark:bg-slate-900 min-h-screen text-slate-900 dark:text-slate-100">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-slate-900 dark:text-white flex items-center gap-2">
            <Wrench className="w-7 h-7 text-indigo-600 dark:text-indigo-400" />
            Society Maintenance & SLA Dispatch Portal
          </h1>
          <p className="text-sm text-slate-500 dark:text-slate-400">
            Dispatch maintenance tickets, track vendor SLAs, manage 8 recurring schedules, and view calendar visits.
          </p>
        </div>
        <div className="flex items-center gap-3">
          <button
            onClick={() => setActiveTab('TICKETS')}
            className={`px-4 py-2 text-xs font-semibold rounded-lg transition-colors flex items-center gap-2 ${
              activeTab === 'TICKETS'
                ? 'bg-indigo-600 text-white'
                : 'bg-white dark:bg-slate-800 text-slate-700 dark:text-slate-300 border border-slate-200 dark:border-slate-700'
            }`}
          >
            <Wrench className="w-4 h-4" /> Active Tickets ({tickets.length})
          </button>
          <button
            onClick={() => setActiveTab('RECURRING')}
            className={`px-4 py-2 text-xs font-semibold rounded-lg transition-colors flex items-center gap-2 ${
              activeTab === 'RECURRING'
                ? 'bg-indigo-600 text-white'
                : 'bg-white dark:bg-slate-800 text-slate-700 dark:text-slate-300 border border-slate-200 dark:border-slate-700'
            }`}
          >
            <Repeat className="w-4 h-4" /> Recurring Schedules ({schedules.length})
          </button>
          <button
            onClick={() => setActiveTab('CALENDAR')}
            className={`px-4 py-2 text-xs font-semibold rounded-lg transition-colors flex items-center gap-2 ${
              activeTab === 'CALENDAR'
                ? 'bg-indigo-600 text-white'
                : 'bg-white dark:bg-slate-800 text-slate-700 dark:text-slate-300 border border-slate-200 dark:border-slate-700'
            }`}
          >
            <CalendarIcon className="w-4 h-4" /> Maintenance Calendar
          </button>
        </div>
      </div>

      {/* Tab 1: Maintenance Tickets */}
      {activeTab === 'TICKETS' && (
        <div className="space-y-6">
          {/* Filters Bar */}
          <div className="bg-white dark:bg-slate-800 p-4 rounded-xl border border-slate-200 dark:border-slate-700 shadow-sm flex flex-col sm:flex-row items-center justify-between gap-4">
            <div className="relative w-full sm:w-80">
              <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
              <input
                type="text"
                placeholder="Search flat code, resident, description..."
                className="w-full pl-9 pr-4 py-2 bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-lg text-xs focus:outline-none focus:ring-2 focus:ring-indigo-500"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
              />
            </div>

            <div className="flex items-center gap-3 w-full sm:w-auto">
              <select
                className="py-2 px-3 bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-lg text-xs"
                value={categoryFilter}
                onChange={(e) => setCategoryFilter(e.target.value)}
              >
                <option value="ALL">All 16 Categories</option>
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

              <select
                className="py-2 px-3 bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-lg text-xs"
                value={statusFilter}
                onChange={(e) => setStatusFilter(e.target.value)}
              >
                <option value="ALL">All 8 Statuses</option>
                <option value="OPEN">OPEN</option>
                <option value="ASSIGNED">ASSIGNED</option>
                <option value="ACCEPTED">ACCEPTED</option>
                <option value="IN_PROGRESS">IN_PROGRESS</option>
                <option value="ON_HOLD">ON_HOLD</option>
                <option value="COMPLETED">COMPLETED</option>
                <option value="VERIFIED">VERIFIED</option>
                <option value="CLOSED">CLOSED</option>
              </select>
            </div>
          </div>

          {/* Tickets List */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {filteredTickets.map((t) => (
              <div
                key={t.id}
                className="bg-white dark:bg-slate-800 p-5 rounded-xl border border-slate-200 dark:border-slate-700 shadow-sm space-y-4 flex flex-col justify-between"
              >
                <div className="space-y-3">
                  <div className="flex items-center justify-between">
                    <span className="font-bold text-sm text-slate-900 dark:text-white">
                      Flat {t.flatCode} ({t.residentName})
                    </span>
                    {getUrgencyBadge(t.urgency)}
                  </div>

                  <div>
                    <div className="text-xs font-semibold text-indigo-600 dark:text-indigo-400">
                      Category: {t.category}
                    </div>
                    <p className="text-xs text-slate-600 dark:text-slate-300 mt-1 line-clamp-2">
                      {t.description}
                    </p>
                  </div>

                  <div className="p-3 bg-slate-50 dark:bg-slate-900 rounded-lg text-xs space-y-1.5 border border-slate-200 dark:border-slate-700">
                    <div className="flex justify-between items-center">
                      <span className="text-slate-500">Target SLA:</span>
                      <span className="font-semibold">{t.slaTargetHours} Hours</span>
                    </div>
                    <div className="flex justify-between items-center">
                      <span className="text-slate-500">Assigned Tech:</span>
                      <span className="font-semibold text-slate-900 dark:text-white">
                        {t.assignedTechnicianName || 'Unassigned'}
                      </span>
                    </div>
                    {t.scheduledVisitDate && (
                      <div className="flex justify-between items-center text-[11px] text-slate-500">
                        <span>Scheduled Visit:</span>
                        <span>{t.scheduledVisitDate} ({t.scheduledVisitTime})</span>
                      </div>
                    )}
                  </div>
                </div>

                <div className="pt-2 border-t border-slate-200 dark:border-slate-700 flex items-center justify-between">
                  <StatusBadge variant={getStatusVariant(t.status)} label={t.status} />

                  <div className="flex items-center gap-2">
                    {t.status === 'OPEN' && (
                      <button
                        onClick={() => setSelectedTicket(t)}
                        className="px-3 py-1.5 bg-indigo-600 hover:bg-indigo-700 text-white rounded text-xs font-semibold"
                      >
                        Assign Tech
                      </button>
                    )}
                    {t.status !== 'CLOSED' && (
                      <button
                        onClick={() => handleCloseTicket(t.id)}
                        className="px-2.5 py-1.5 bg-slate-100 dark:bg-slate-700 hover:bg-slate-200 text-slate-700 dark:text-slate-200 rounded text-xs font-semibold"
                      >
                        Close
                      </button>
                    )}
                  </div>
                </div>
              </div>
            ))}

            {filteredTickets.length === 0 && (
              <div className="col-span-full py-12 text-center text-slate-500 text-sm">
                No maintenance tickets match current filters.
              </div>
            )}
          </div>
        </div>
      )}

      {/* Tab 2: Recurring Schedules */}
      {activeTab === 'RECURRING' && (
        <div className="space-y-6">
          <div className="flex items-center justify-between">
            <h2 className="text-lg font-bold text-slate-900 dark:text-white">
              Society Recurring Maintenance Schedules
            </h2>
            <button
              onClick={() => setIsNewRecModalOpen(true)}
              className="px-4 py-2 bg-indigo-600 hover:bg-indigo-700 text-white rounded-lg text-xs font-semibold flex items-center gap-2"
            >
              <Plus className="w-4 h-4" /> Add Recurring Schedule
            </button>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            {schedules.map((s) => (
              <div
                key={s.id}
                className="bg-white dark:bg-slate-800 p-5 rounded-xl border border-slate-200 dark:border-slate-700 shadow-sm space-y-3 flex flex-col justify-between"
              >
                <div className="space-y-2">
                  <div className="flex items-center justify-between">
                    <span className="px-2 py-0.5 bg-indigo-100 dark:bg-indigo-950 text-indigo-700 dark:text-indigo-300 rounded text-[11px] font-bold">
                      {s.frequency}
                    </span>
                    <StatusBadge variant={s.status === 'ACTIVE' ? 'success' : 'neutral'} label={s.status} />
                  </div>
                  <h3 className="font-bold text-sm text-slate-900 dark:text-white line-clamp-1">
                    {s.title}
                  </h3>
                  <p className="text-xs text-slate-500 dark:text-slate-400 line-clamp-2">
                    {s.description}
                  </p>
                </div>

                <div className="p-3 bg-slate-50 dark:bg-slate-900 rounded-lg text-xs space-y-1 border border-slate-200 dark:border-slate-700">
                  <div className="flex justify-between">
                    <span className="text-slate-500">Vendor:</span>
                    <span className="font-semibold text-slate-900 dark:text-white truncate max-w-[120px]">
                      {s.assignedVendorName}
                    </span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-slate-500">Next Due:</span>
                    <span className="font-bold text-indigo-600 dark:text-indigo-400">{s.nextDueDate}</span>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Tab 3: Maintenance Calendar */}
      {activeTab === 'CALENDAR' && (
        <MaintenanceCalendar events={maintenanceService.getCalendarEvents(currentSocietyId)} />
      )}

      {/* Modal: Assign Ticket */}
      {selectedTicket && (
        <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-sm flex items-center justify-center p-4">
          <form
            onSubmit={handleAssignSubmit}
            className="bg-white dark:bg-slate-800 rounded-xl max-w-md w-full p-6 space-y-4 border border-slate-200 dark:border-slate-700 shadow-xl"
          >
            <h3 className="font-bold text-slate-900 dark:text-white text-base">
              Assign Technician to Flat {selectedTicket.flatCode}
            </h3>
            <div className="space-y-3 text-xs">
              <div>
                <label className="block font-semibold mb-1">Vendor / Agency Name</label>
                <input
                  type="text"
                  placeholder="e.g. Apex Plumbing Solutions"
                  className="w-full p-2.5 bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-lg"
                  value={vendorName}
                  onChange={(e) => setVendorName(e.target.value)}
                />
              </div>
              <div>
                <label className="block font-semibold mb-1">Technician Name *</label>
                <input
                  type="text"
                  required
                  placeholder="e.g. Suresh Kumar"
                  className="w-full p-2.5 bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-lg"
                  value={techName}
                  onChange={(e) => setTechName(e.target.value)}
                />
              </div>
              <div className="grid grid-cols-2 gap-2">
                <div>
                  <label className="block font-semibold mb-1">Visit Date</label>
                  <input
                    type="date"
                    className="w-full p-2.5 bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-lg"
                    value={visitDate}
                    onChange={(e) => setVisitDate(e.target.value)}
                  />
                </div>
                <div>
                  <label className="block font-semibold mb-1">Visit Time</label>
                  <input
                    type="text"
                    placeholder="e.g. 10:30 AM"
                    className="w-full p-2.5 bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-lg"
                    value={visitTime}
                    onChange={(e) => setVisitTime(e.target.value)}
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
                Assign & Dispatch
              </button>
            </div>
          </form>
        </div>
      )}

      {/* Modal: New Recurring Schedule */}
      {isNewRecModalOpen && (
        <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-sm flex items-center justify-center p-4">
          <form
            onSubmit={handleCreateRecurringSubmit}
            className="bg-white dark:bg-slate-800 rounded-xl max-w-md w-full p-6 space-y-4 border border-slate-200 dark:border-slate-700 shadow-xl"
          >
            <h3 className="font-bold text-slate-900 dark:text-white text-base">
              Create Recurring Maintenance Schedule
            </h3>
            <div className="space-y-3 text-xs">
              <div>
                <label className="block font-semibold mb-1">Task Title *</label>
                <input
                  type="text"
                  required
                  placeholder="e.g. Swimming Pool Deep Clean"
                  className="w-full p-2.5 bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-lg"
                  value={recTitle}
                  onChange={(e) => setRecTitle(e.target.value)}
                />
              </div>
              <div className="grid grid-cols-2 gap-2">
                <div>
                  <label className="block font-semibold mb-1">Category</label>
                  <select
                    className="w-full p-2.5 bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-lg"
                    value={recCategory}
                    onChange={(e) => setRecCategory(e.target.value as MaintenanceCategory)}
                  >
                    <option value="SWIMMING_POOL">Swimming Pool</option>
                    <option value="GARBAGE">Garbage</option>
                    <option value="HOUSEKEEPING">Housekeeping</option>
                    <option value="ELECTRICAL">Electrical</option>
                    <option value="PLUMBING">Plumbing</option>
                    <option value="LIFT">Lift</option>
                    <option value="GENERATOR">Generator</option>
                    <option value="PEST_CONTROL">Pest Control</option>
                  </select>
                </div>
                <div>
                  <label className="block font-semibold mb-1">Frequency</label>
                  <select
                    className="w-full p-2.5 bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-lg"
                    value={recFreq}
                    onChange={(e) => setRecFreq(e.target.value as any)}
                  >
                    <option value="DAILY">Daily</option>
                    <option value="WEEKLY">Weekly</option>
                    <option value="BI_WEEKLY">Bi-Weekly</option>
                    <option value="MONTHLY">Monthly</option>
                    <option value="QUARTERLY">Quarterly</option>
                  </select>
                </div>
              </div>
              <div className="grid grid-cols-2 gap-2">
                <div>
                  <label className="block font-semibold mb-1">Assigned Vendor *</label>
                  <input
                    type="text"
                    required
                    placeholder="e.g. AquaClean"
                    className="w-full p-2.5 bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-lg"
                    value={recVendor}
                    onChange={(e) => setRecVendor(e.target.value)}
                  />
                </div>
                <div>
                  <label className="block font-semibold mb-1">Technician / Lead</label>
                  <input
                    type="text"
                    placeholder="e.g. Vikram Tech"
                    className="w-full p-2.5 bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-lg"
                    value={recTech}
                    onChange={(e) => setRecTech(e.target.value)}
                  />
                </div>
              </div>
              <div>
                <label className="block font-semibold mb-1">Next Due Date</label>
                <input
                  type="date"
                  className="w-full p-2.5 bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-lg"
                  value={recDueDate}
                  onChange={(e) => setRecDueDate(e.target.value)}
                />
              </div>
              <div>
                <label className="block font-semibold mb-1">Task Description</label>
                <textarea
                  rows={2}
                  placeholder="Task scope details..."
                  className="w-full p-2.5 bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-lg"
                  value={recDesc}
                  onChange={(e) => setRecDesc(e.target.value)}
                />
              </div>
            </div>
            <div className="flex justify-end gap-2 pt-2">
              <button
                type="button"
                onClick={() => setIsNewRecModalOpen(false)}
                className="px-4 py-2 bg-slate-100 dark:bg-slate-700 text-slate-700 dark:text-slate-300 rounded-lg text-xs font-semibold"
              >
                Cancel
              </button>
              <button
                type="submit"
                className="px-4 py-2 bg-indigo-600 hover:bg-indigo-700 text-white rounded-lg text-xs font-semibold"
              >
                Create Schedule
              </button>
            </div>
          </form>
        </div>
      )}
    </div>
  );
};
