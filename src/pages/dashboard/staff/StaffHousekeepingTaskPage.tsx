import React, { useState, useEffect } from 'react';
import { useAuth } from '../../../context/AuthContext';
import { housekeepingService } from '../../../services/housekeepingService';
import type { HousekeepingTask, ChecklistItem } from '../../../types/housekeeping';
import { Modal } from '../../../components/ui/Modal';
import {
  CheckSquare,
  Building,
  Sparkles
} from 'lucide-react';

export const StaffHousekeepingTaskPage: React.FC = () => {
  const { currentUser } = useAuth();
  const societyId = (currentUser as any)?.societyId || 'soc-1';

  const [tasks, setTasks] = useState<HousekeepingTask[]>([]);
  const [selectedTask, setSelectedTask] = useState<HousekeepingTask | null>(null);

  // Task Completion Form State
  const [checklistState, setChecklistState] = useState<ChecklistItem[]>([]);
  const [photoUrl, setPhotoUrl] = useState('');
  const [staffNotes, setStaffNotes] = useState('');

  useEffect(() => {
    loadData();
  }, [societyId]);

  const loadData = () => {
    const list = housekeepingService.getTasks(societyId);
    setTasks(list);
  };

  const handleOpenExecuteModal = (task: HousekeepingTask) => {
    setSelectedTask(task);
    setChecklistState(task.checklist.map(c => ({ ...c })));
    setPhotoUrl(task.photoProofUrl || 'https://images.unsplash.com/photo-1581578731548-c64695cc6952?auto=format&fit=crop&w=600&q=80');
    setStaffNotes(task.staffNotes || '');
  };

  const handleToggleChecklist = (id: string) => {
    setChecklistState(prev =>
      prev.map(item => (item.id === id ? { ...item, isCompleted: !item.isCompleted } : item))
    );
  };

  const handleSubmitCompletion = (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedTask) return;

    housekeepingService.completeTaskWithProof(
      societyId,
      selectedTask.id,
      checklistState,
      photoUrl || 'https://images.unsplash.com/photo-1581578731548-c64695cc6952?auto=format&fit=crop&w=600&q=80',
      staffNotes
    );

    setSelectedTask(null);
    loadData();
  };

  return (
    <div className="space-y-6 p-4 md:p-6">
      {/* Header */}
      <div className="bg-white p-6 rounded-2xl border border-slate-200/80 shadow-sm flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <span className="p-2 bg-indigo-50 text-indigo-600 rounded-xl">
              <Sparkles className="w-5 h-5" />
            </span>
            <h1 className="text-2xl font-bold text-slate-900">Staff Housekeeping Execution Portal</h1>
          </div>
          <p className="text-slate-500 text-sm mt-1">
            View daily operational assignments, mark checklists, attach photo proof, and record completion timestamps.
          </p>
        </div>
      </div>

      {/* Task List */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {tasks.map(task => (
          <div key={task.id} className="bg-white p-6 rounded-2xl border border-slate-200/80 shadow-sm space-y-4 flex flex-col justify-between">
            <div>
              <div className="flex items-center justify-between">
                <span className="px-2.5 py-0.5 bg-indigo-100 text-indigo-800 text-xs font-bold rounded-full">
                  {task.category}
                </span>
                <span className={`px-2.5 py-1 text-xs font-bold rounded-full ${
                  task.status === 'VERIFIED' ? 'bg-emerald-100 text-emerald-800' :
                  task.status === 'COMPLETED' ? 'bg-indigo-100 text-indigo-800' :
                  task.status === 'MISSED' ? 'bg-rose-100 text-rose-800' :
                  'bg-slate-100 text-slate-700'
                }`}>
                  {task.status}
                </span>
              </div>

              <h3 className="text-lg font-bold text-slate-900 mt-2">{task.title}</h3>
              <p className="text-xs text-slate-500 mt-1 flex items-center gap-1">
                <Building className="w-3.5 h-3.5 text-slate-400" /> {task.areaLocation}
              </p>

              <div className="mt-3 p-3 bg-slate-50 rounded-xl border text-xs space-y-1 text-slate-600">
                <p><strong>Scheduled Time Window:</strong> {task.startTime} - {task.endTime}</p>
                <p><strong>Checklist Items:</strong> {task.checklist.filter(c => c.isCompleted).length} / {task.checklist.length} Completed</p>
              </div>
            </div>

            <div>
              <button
                onClick={() => handleOpenExecuteModal(task)}
                className="w-full py-2.5 bg-indigo-600 hover:bg-indigo-700 text-white font-bold text-xs rounded-xl flex items-center justify-center gap-1.5"
              >
                <CheckSquare className="w-4 h-4" /> Execute Checklist & Submit Proof
              </button>
            </div>
          </div>
        ))}
      </div>

      {/* Modal: Execute Task & Upload Proof */}
      {selectedTask && (
        <Modal isOpen={!!selectedTask} onClose={() => setSelectedTask(null)} title={`Execute Task: ${selectedTask.title}`}>
          <form onSubmit={handleSubmitCompletion} className="space-y-4">
            <div className="bg-slate-50 p-3 rounded-xl border text-xs space-y-1 text-slate-700">
              <p><strong>Location:</strong> {selectedTask.areaLocation}</p>
              <p><strong>Window:</strong> {selectedTask.startTime} - {selectedTask.endTime}</p>
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-800 mb-2">Checklist Tasks (Tap to check):</label>
              <div className="space-y-2">
                {checklistState.map(item => (
                  <div
                    key={item.id}
                    onClick={() => handleToggleChecklist(item.id)}
                    className={`p-3 rounded-xl border cursor-pointer flex items-center gap-3 transition-all ${
                      item.isCompleted ? 'bg-emerald-50 border-emerald-300 text-emerald-900' : 'bg-white border-slate-200 text-slate-700 hover:bg-slate-50'
                    }`}
                  >
                    <CheckSquare className={`w-5 h-5 shrink-0 ${item.isCompleted ? 'text-emerald-600' : 'text-slate-300'}`} />
                    <span className={`text-xs font-semibold ${item.isCompleted ? 'line-through opacity-80' : ''}`}>{item.label}</span>
                  </div>
                ))}
              </div>
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">Photo Proof Image URL</label>
              <input
                type="text"
                required
                placeholder="https://..."
                value={photoUrl}
                onChange={e => setPhotoUrl(e.target.value)}
                className="w-full px-3 py-2 border rounded-lg text-sm"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">Staff Notes / Observations (Optional)</label>
              <textarea
                rows={2}
                placeholder="e.g. Chemical levels balanced. Floor mopped."
                value={staffNotes}
                onChange={e => setStaffNotes(e.target.value)}
                className="w-full px-3 py-2 border rounded-lg text-sm"
              />
            </div>

            <div className="pt-4 flex justify-end gap-2">
              <button type="button" onClick={() => setSelectedTask(null)} className="px-4 py-2 text-slate-600 hover:bg-slate-100 text-sm font-semibold rounded-lg">Cancel</button>
              <button type="submit" className="px-5 py-2.5 bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-sm rounded-xl">
                Submit Task Completion
              </button>
            </div>
          </form>
        </Modal>
      )}
    </div>
  );
};
