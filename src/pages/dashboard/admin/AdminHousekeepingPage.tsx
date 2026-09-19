import React, { useState, useEffect } from 'react';
import { useAuth } from '../../../context/AuthContext';
import { housekeepingService } from '../../../services/housekeepingService';
import type { HousekeepingTask, CommonAreaCategory, GarbagePickupLog } from '../../../types/housekeeping';
import { Modal } from '../../../components/ui/Modal';
import { DataTable } from '../../../components/ui/DataTable';
import { MobileDataCard } from '../../../components/ui/MobileDataCard';
import {
  Sparkles,
  CheckCircle2,
  AlertTriangle,
  Building,
  CheckSquare,
  Plus
} from 'lucide-react';

const COMMON_AREA_CATEGORIES: CommonAreaCategory[] = [
  'GARBAGE',
  'SWIMMING_POOL',
  'STAIRCASE',
  'LOBBY',
  'GARDEN',
  'GYM',
  'CLUBHOUSE',
  'PARKING',
  'CORRIDORS'
];

export const AdminHousekeepingPage: React.FC = () => {
  const { currentUser } = useAuth();
  const societyId = (currentUser as any)?.societyId || 'soc-1';
  const adminName = currentUser?.name || 'Society Admin';

  const [tasks, setTasks] = useState<HousekeepingTask[]>([]);
  const [garbageLogs, setGarbageLogs] = useState<GarbagePickupLog[]>([]);
  const [selectedTask, setSelectedTask] = useState<HousekeepingTask | null>(null);

  const [activeTab, setActiveTab] = useState<'ALL' | 'MISSED_LATE' | 'GARBAGE'>('ALL');
  const [showCreateModal, setShowCreateModal] = useState(false);

  // Form State
  const [taskForm, setTaskForm] = useState({
    title: '',
    category: 'SWIMMING_POOL' as CommonAreaCategory,
    areaLocation: '',
    tower: '',
    floor: '',
    scheduledDate: new Date().toISOString().substring(0, 10),
    startTime: '08:00',
    endTime: '10:00',
    assignedStaffName: 'Sunil Housekeeper',
    checklistText: 'Test water pH level\nClean skimmer baskets\nSweep & mop floor'
  });

  useEffect(() => {
    loadData();
  }, [societyId]);

  const loadData = () => {
    setTasks(housekeepingService.getTasks(societyId));
    setGarbageLogs(housekeepingService.getGarbagePickupLogs(societyId));
  };

  const handleCreateTask = (e: React.FormEvent) => {
    e.preventDefault();
    if (!taskForm.title || !taskForm.areaLocation) return;

    const checklistLabels = taskForm.checklistText
      .split('\n')
      .map(s => s.trim())
      .filter(Boolean);

    housekeepingService.createTask(
      societyId,
      taskForm.title,
      taskForm.category,
      taskForm.areaLocation,
      taskForm.scheduledDate,
      taskForm.startTime,
      taskForm.endTime,
      `staff-${Date.now()}`,
      taskForm.assignedStaffName,
      checklistLabels,
      taskForm.tower,
      taskForm.floor
    );

    setShowCreateModal(false);
    setTaskForm({
      title: '',
      category: 'SWIMMING_POOL',
      areaLocation: '',
      tower: '',
      floor: '',
      scheduledDate: new Date().toISOString().substring(0, 10),
      startTime: '08:00',
      endTime: '10:00',
      assignedStaffName: 'Sunil Housekeeper',
      checklistText: 'Test water pH level\nClean skimmer baskets\nSweep & mop floor'
    });
    loadData();
  };

  const handleVerifyTask = (taskId: string) => {
    housekeepingService.verifyTask(societyId, taskId, adminName);
    setSelectedTask(null);
    loadData();
  };

  const missedOrLateTasks = tasks.filter(t => t.status === 'MISSED' || t.status === 'LATE');
  const completedTasks = tasks.filter(t => t.status === 'COMPLETED' || t.status === 'VERIFIED');

  const filteredTasks = tasks.filter(t => {
    if (activeTab === 'MISSED_LATE') return t.status === 'MISSED' || t.status === 'LATE';
    return true;
  });

  return (
    <div className="space-y-6 p-4 md:p-6">
      {/* Header */}
      <div className="bg-white p-4 md:p-6 rounded-2xl border border-slate-200/80 shadow-sm flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <span className="p-2 bg-indigo-50 text-indigo-600 rounded-xl">
              <Sparkles className="w-5 h-5" />
            </span>
            <h1 className="text-2xl font-bold text-slate-900">Housekeeping & Common Area Operations</h1>
          </div>
          <p className="text-slate-500 text-sm mt-1">
            Manage recurring operational tasks, swimming pool chemical checklists, photo proof verification, and missed task alerts.
          </p>
        </div>
        <button
          onClick={() => setShowCreateModal(true)}
          className="px-4 py-2.5 bg-indigo-600 hover:bg-indigo-700 text-white font-semibold text-sm rounded-xl shadow-sm flex items-center gap-2"
        >
          <Plus className="w-4 h-4" /> Create Operational Task
        </button>
      </div>

      {/* KPI Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-4 gap-6">
        <div className="bg-white p-5 rounded-2xl border border-slate-200/80 shadow-sm">
          <span className="text-xs text-slate-500 block">Total Scheduled Tasks</span>
          <span className="text-2xl font-bold text-slate-900">{tasks.length}</span>
        </div>
        <div className="bg-white p-5 rounded-2xl border border-slate-200/80 shadow-sm">
          <span className="text-xs text-slate-500 block">Completed / Verified</span>
          <span className="text-2xl font-bold text-emerald-600">{completedTasks.length}</span>
        </div>
        <div className="bg-white p-5 rounded-2xl border border-slate-200/80 shadow-sm">
          <span className="text-xs text-slate-500 block">Missed / Late Tasks</span>
          <span className="text-2xl font-bold text-rose-600">{missedOrLateTasks.length}</span>
        </div>
        <div className="bg-white p-5 rounded-2xl border border-slate-200/80 shadow-sm">
          <span className="text-xs text-slate-500 block">Garbage Collections Today</span>
          <span className="text-2xl font-bold text-indigo-600">{garbageLogs.length}</span>
        </div>
      </div>

      {/* Missed / Late Tasks Warning Widget */}
      {missedOrLateTasks.length > 0 && (
        <div className="p-5 bg-rose-50 border border-rose-200 rounded-2xl text-rose-900 space-y-3">
          <div className="flex items-center gap-2 font-bold text-base">
            <AlertTriangle className="w-5 h-5 text-rose-600" />
            <span>Operational Alert: {missedOrLateTasks.length} Missed or Late Task(s) Require Attention</span>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
            {missedOrLateTasks.map(task => (
              <div key={task.id} className="p-3 bg-white rounded-xl border border-rose-200 text-xs">
                <div className="flex items-center justify-between font-bold text-slate-900">
                  <span>{task.title}</span>
                  <span className="px-2 py-0.5 bg-rose-100 text-rose-800 text-[10px] rounded-full">{task.status}</span>
                </div>
                <p className="text-slate-500 mt-1">{task.areaLocation} â€¢ Assigned: {task.assignedStaffName}</p>
                {task.missedReason && <p className="text-rose-700 italic mt-0.5">Reason: {task.missedReason}</p>}
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Tabs */}
      <div className="flex border-b border-slate-200 bg-white px-4 pt-2 rounded-t-2xl">
        <button
          onClick={() => setActiveTab('ALL')}
          className={`px-4 py-3 font-semibold text-sm border-b-2 transition-colors ${
            activeTab === 'ALL' ? 'border-indigo-600 text-indigo-600' : 'border-transparent text-slate-500'
          }`}
        >
          All Operational Tasks ({tasks.length})
        </button>
        <button
          onClick={() => setActiveTab('MISSED_LATE')}
          className={`px-4 py-3 font-semibold text-sm border-b-2 transition-colors ${
            activeTab === 'MISSED_LATE' ? 'border-indigo-600 text-indigo-600' : 'border-transparent text-slate-500'
          }`}
        >
          Missed & Late Tasks ({missedOrLateTasks.length})
        </button>
        <button
          onClick={() => setActiveTab('GARBAGE')}
          className={`px-4 py-3 font-semibold text-sm border-b-2 transition-colors ${
            activeTab === 'GARBAGE' ? 'border-indigo-600 text-indigo-600' : 'border-transparent text-slate-500'
          }`}
        >
          Garbage Pickup Logs ({garbageLogs.length})
        </button>
      </div>

      {/* TAB: TASKS LIST */}
      {activeTab !== 'GARBAGE' ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredTasks.map(task => (
            <div key={task.id} className="bg-white rounded-2xl border border-slate-200/80 shadow-sm overflow-hidden flex flex-col justify-between">
              <div className="p-5">
                <div className="flex items-center justify-between">
                  <span className="px-2.5 py-0.5 bg-slate-100 text-slate-700 text-[11px] font-bold rounded-full">
                    {task.category}
                  </span>
                  <span className={`px-2.5 py-1 text-xs rounded-full font-bold ${
                    task.status === 'VERIFIED' ? 'bg-emerald-100 text-emerald-800' :
                    task.status === 'COMPLETED' ? 'bg-indigo-100 text-indigo-800' :
                    task.status === 'MISSED' ? 'bg-rose-100 text-rose-800' :
                    task.status === 'LATE' ? 'bg-amber-100 text-amber-800' :
                    'bg-slate-100 text-slate-600'
                  }`}>
                    {task.status}
                  </span>
                </div>

                <h3 className="text-base font-bold text-slate-900 mt-2">{task.title}</h3>
                <p className="text-xs text-slate-500 mt-1 flex items-center gap-1">
                  <Building className="w-3.5 h-3.5 text-slate-400" /> {task.areaLocation}
                </p>

                <div className="mt-3 pt-3 border-t border-slate-100 text-xs space-y-1 text-slate-600">
                  <div className="flex items-center justify-between">
                    <span>Scheduled Time:</span>
                    <strong className="text-slate-800">{task.startTime} - {task.endTime}</strong>
                  </div>
                  <div className="flex items-center justify-between">
                    <span>Assigned Staff:</span>
                    <strong className="text-slate-800">{task.assignedStaffName}</strong>
                  </div>
                </div>

                {/* Checklist Summary */}
                <div className="mt-3 bg-slate-50 p-2.5 rounded-xl border text-xs">
                  <span className="font-bold text-slate-700 block mb-1">Checklist Progress:</span>
                  <div className="space-y-1">
                    {task.checklist.map(chk => (
                      <div key={chk.id} className="flex items-center gap-1.5 text-[11px]">
                        <CheckSquare className={`w-3.5 h-3.5 ${chk.isCompleted ? 'text-emerald-600' : 'text-slate-300'}`} />
                        <span className={chk.isCompleted ? 'line-through text-slate-400' : 'text-slate-700'}>{chk.label}</span>
                      </div>
                    ))}
                  </div>
                </div>

                {task.photoProofUrl && (
                  <div className="mt-3">
                    <span className="text-[11px] font-semibold text-slate-500 block mb-1">Photo Proof Attached:</span>
                    <img src={task.photoProofUrl} alt="Task proof" className="w-full h-32 object-cover rounded-xl border" />
                  </div>
                )}
              </div>

              <div className="p-5 pt-0">
                <button
                  onClick={() => setSelectedTask(task)}
                  className="w-full py-2 border border-indigo-200 text-indigo-700 hover:bg-indigo-50 font-semibold text-xs rounded-xl"
                >
                  View Details & Inspect Proof
                </button>
              </div>
            </div>
          ))}
        </div>
      ) : (
        /* TAB: GARBAGE PICKUP LOGS */
        <div className="bg-white p-4 md:p-6 rounded-2xl border border-slate-200/80 shadow-sm">
          <h2 className="text-lg font-bold text-slate-900 mb-4">Area-Wise Garbage Collection Logs</h2>
          <div className="mt-4">
            <DataTable
              columns={[
                { key: 'tower', header: 'Tower' },
                { key: 'floor', header: 'Floor' },
                { key: 'flatNumber', header: 'Flat' },
                { key: 'scheduledTime', header: 'Scheduled Time' },
                {
                  key: 'confirmed',
                  header: 'Resident Confirmed',
                  render: (log: GarbagePickupLog) => (
                    log.confirmedByResident ? (
                      <span className="text-xs font-bold text-emerald-600">✅ Confirmed</span>
                    ) : (
                      <span className="text-xs text-slate-400">Unconfirmed</span>
                    )
                  )
                },
                {
                  key: 'status',
                  header: 'Status',
                  render: (log: GarbagePickupLog) => (
                    <span className={`px-2.5 py-1 text-xs rounded-full font-bold ${
                      log.status === 'COLLECTED' ? 'bg-emerald-100 text-emerald-800' : 'bg-rose-100 text-rose-800'
                    }`}>
                      {log.status}
                    </span>
                  )
                }
              ]}
              data={garbageLogs}
              keyExtractor={(log: GarbagePickupLog) => log.id}
              pageSize={10}
              mobileRender={(log: GarbagePickupLog) => (
                <MobileDataCard
                  title={`Tower ${log.tower} • Flat ${log.flatNumber}`}
                  subtitle={`Floor ${log.floor} • Scheduled: ${log.scheduledTime}`}
                  status={
                    <span className={`px-2 py-0.5 text-[0.65rem] rounded-full font-bold ${
                      log.status === 'COLLECTED' ? 'bg-emerald-100 text-emerald-800' : 'bg-rose-100 text-rose-800'
                    }`}>
                      {log.status}
                    </span>
                  }
                  attributes={[
                    { label: 'Tower', value: log.tower },
                    { label: 'Floor', value: log.floor },
                    { label: 'Flat', value: log.flatNumber },
                    {
                      label: 'Resident Confirmation',
                      value: log.confirmedByResident ? '✅ Confirmed' : 'Unconfirmed'
                    }
                  ]}
                />
              )}
            />
          </div>
        </div>
      )}

      {/* Modal: Inspect & Verify Task */}
      {selectedTask && (
        <Modal isOpen={!!selectedTask} onClose={() => setSelectedTask(null)} title={`Task Details: ${selectedTask.title}`}>
          <div className="space-y-4 py-2">
            <div className="bg-slate-50 p-4 rounded-xl border text-xs space-y-1 text-slate-700">
              <p><strong>Category:</strong> {selectedTask.category}</p>
              <p><strong>Location:</strong> {selectedTask.areaLocation}</p>
              <p><strong>Assigned Staff:</strong> {selectedTask.assignedStaffName}</p>
              <p><strong>Scheduled:</strong> {selectedTask.scheduledDate} ({selectedTask.startTime} - {selectedTask.endTime})</p>
              {selectedTask.staffNotes && <p className="italic text-slate-600"><strong>Staff Notes:</strong> "{selectedTask.staffNotes}"</p>}
            </div>

            {selectedTask.photoProofUrl && (
              <div>
                <h4 className="font-bold text-slate-900 text-xs mb-1">Attached Completion Photo Proof:</h4>
                <img src={selectedTask.photoProofUrl} alt="Photo proof" className="w-full h-48 object-cover rounded-xl border" />
              </div>
            )}

            <div className="pt-4 flex justify-end gap-2">
              <button type="button" onClick={() => setSelectedTask(null)} className="px-4 py-2 text-slate-600 hover:bg-slate-100 text-sm font-semibold rounded-lg">Close</button>
              {selectedTask.status !== 'VERIFIED' && (
                <button onClick={() => handleVerifyTask(selectedTask.id)} className="px-4 py-2 bg-emerald-600 text-white font-bold text-sm rounded-lg flex items-center gap-1">
                  <CheckCircle2 className="w-4 h-4" /> Verify Photo Proof & Close Task
                </button>
              )}
            </div>
          </div>
        </Modal>
      )}

      {/* Modal: Create Task */}
      <Modal isOpen={showCreateModal} onClose={() => setShowCreateModal(false)} title="Create Housekeeping Operational Task">
        <form onSubmit={handleCreateTask} className="space-y-4">
          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-1">Task Title</label>
            <input
              type="text"
              required
              placeholder="e.g. Staircase Disinfection & Window Wiping"
              value={taskForm.title}
              onChange={e => setTaskForm({ ...taskForm, title: e.target.value })}
              className="w-full px-3 py-2 border rounded-lg text-sm"
            />
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">Category</label>
              <select
                value={taskForm.category}
                onChange={e => setTaskForm({ ...taskForm, category: e.target.value as CommonAreaCategory })}
                className="w-full px-3 py-2 border rounded-lg text-sm"
              >
                {COMMON_AREA_CATEGORIES.map(cat => (
                  <option key={cat} value={cat}>{cat.replace(/_/g, ' ')}</option>
                ))}
              </select>
            </div>
            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">Area Location</label>
              <input
                type="text"
                required
                placeholder="e.g. Tower A Staircase 1st to 5th Floor"
                value={taskForm.areaLocation}
                onChange={e => setTaskForm({ ...taskForm, areaLocation: e.target.value })}
                className="w-full px-3 py-2 border rounded-lg text-sm"
              />
            </div>
          </div>

          <div className="grid grid-cols-3 gap-3">
            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">Scheduled Date</label>
              <input
                type="date"
                required
                value={taskForm.scheduledDate}
                onChange={e => setTaskForm({ ...taskForm, scheduledDate: e.target.value })}
                className="w-full px-3 py-2 border rounded-lg text-sm"
              />
            </div>
            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">Start Time</label>
              <input
                type="time"
                value={taskForm.startTime}
                onChange={e => setTaskForm({ ...taskForm, startTime: e.target.value })}
                className="w-full px-3 py-2 border rounded-lg text-sm"
              />
            </div>
            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">End Time</label>
              <input
                type="time"
                value={taskForm.endTime}
                onChange={e => setTaskForm({ ...taskForm, endTime: e.target.value })}
                className="w-full px-3 py-2 border rounded-lg text-sm"
              />
            </div>
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-1">Assigned Staff Name</label>
            <input
              type="text"
              required
              placeholder="e.g. Sunil Waste Collector"
              value={taskForm.assignedStaffName}
              onChange={e => setTaskForm({ ...taskForm, assignedStaffName: e.target.value })}
              className="w-full px-3 py-2 border rounded-lg text-sm"
            />
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-1">Checklist Items (One per line)</label>
            <textarea
              rows={3}
              required
              value={taskForm.checklistText}
              onChange={e => setTaskForm({ ...taskForm, checklistText: e.target.value })}
              className="w-full px-3 py-2 border rounded-lg text-sm font-mono text-xs"
            />
          </div>

          <div className="pt-4 flex justify-end gap-2">
            <button type="button" onClick={() => setShowCreateModal(false)} className="px-4 py-2 text-slate-600 hover:bg-slate-100 text-sm font-semibold rounded-lg">Cancel</button>
            <button type="submit" className="px-4 py-2 bg-indigo-600 text-white font-bold text-sm rounded-lg">Create Task</button>
          </div>
        </form>
      </Modal>
    </div>
  );
};

