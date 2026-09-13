import type {
  HousekeepingTask,
  GarbagePickupLog,
  CommonAreaCategory,
  ChecklistItem
} from '../types/housekeeping';

const TASKS_STORAGE_KEY = 'communityos_housekeeping_tasks';
const GARBAGE_STORAGE_KEY = 'communityos_garbage_pickup_logs';

const SEED_TASKS: Omit<HousekeepingTask, 'societyId'>[] = [
  {
    id: 'hk-101',
    title: 'Daily Pool Water Chemical Treatment & Backwash',
    category: 'SWIMMING_POOL',
    areaLocation: 'Clubhouse Ground Floor Swimming Pool',
    scheduledDate: new Date().toISOString().substring(0, 10),
    startTime: '06:00',
    endTime: '08:00',
    assignedStaffId: 'staff-pool-1',
    assignedStaffName: 'Ramesh Pool Technician',
    status: 'COMPLETED',
    photoProofUrl: 'https://images.unsplash.com/photo-1576013551627-0cc20b96c2a7?auto=format&fit=crop&w=600&q=80',
    completionTimestamp: new Date(Date.now() - 3 * 60 * 60 * 1000).toISOString(),
    staffNotes: 'pH level balanced at 7.4. Chlorine PPM at 2.5. Filter backwash completed clean.',
    checklist: [
      { id: 'chk-1', label: 'Test water pH level (Target: 7.2 - 7.6)', isCompleted: true },
      { id: 'chk-2', label: 'Check Chlorine PPM concentration', isCompleted: true },
      { id: 'chk-3', label: 'Run main filter backwash cycle', isCompleted: true },
      { id: 'chk-4', label: 'Net floating leaves & debris from surface', isCompleted: true },
      { id: 'chk-5', label: 'Empty skimmer baskets', isCompleted: true }
    ],
    createdAt: new Date().toISOString()
  },
  {
    id: 'hk-102',
    title: 'Morning Floor-by-Floor Doorstep Garbage Collection',
    category: 'GARBAGE',
    areaLocation: 'Tower A Floors 1 to 15',
    tower: 'Tower A',
    scheduledDate: new Date().toISOString().substring(0, 10),
    startTime: '07:00',
    endTime: '09:30',
    assignedStaffId: 'staff-clean-1',
    assignedStaffName: 'Sunil Waste Collector',
    status: 'IN_PROGRESS',
    checklist: [
      { id: 'chk-6', label: 'Collect wet waste bins from Flats 101 to 504', isCompleted: true },
      { id: 'chk-7', label: 'Collect dry recyclable waste bins', isCompleted: true },
      { id: 'chk-8', label: 'Sanitize waste collection trolley', isCompleted: false },
      { id: 'chk-9', label: 'Deposit collected waste at Central Segregation Compactor', isCompleted: false }
    ],
    createdAt: new Date().toISOString()
  },
  {
    id: 'hk-103',
    title: 'Main Entrance Lobby Mopping & Glass Sanitization',
    category: 'LOBBY',
    areaLocation: 'Tower B Ground Floor Lobby',
    tower: 'Tower B',
    floor: 'Ground',
    scheduledDate: new Date().toISOString().substring(0, 10),
    startTime: '08:00',
    endTime: '10:00',
    assignedStaffId: 'staff-clean-2',
    assignedStaffName: 'Anita Housekeeper',
    status: 'MISSED',
    missedReason: 'Staff assigned to emergency water leak cleanup in Basement 1',
    checklist: [
      { id: 'chk-10', label: 'Sweep & mop lobby marble flooring with pine disinfectant', isCompleted: false },
      { id: 'chk-11', label: 'Wipe glass entrance doors and handles', isCompleted: false },
      { id: 'chk-12', label: 'Wipe visitor sofa chairs and reception counter', isCompleted: false }
    ],
    createdAt: new Date().toISOString()
  },
  {
    id: 'hk-104',
    title: 'Fitness Gym Equipment Disinfection & Towel Replenishment',
    category: 'GYM',
    areaLocation: 'Clubhouse 1st Floor Gym',
    scheduledDate: new Date().toISOString().substring(0, 10),
    startTime: '13:00',
    endTime: '14:30',
    assignedStaffId: 'staff-clean-2',
    assignedStaffName: 'Anita Housekeeper',
    status: 'SCHEDULED',
    checklist: [
      { id: 'chk-13', label: 'Sanitize treadmill handles and touchscreens', isCompleted: false },
      { id: 'chk-14', label: 'Wipe dumbbell racks and benches', isCompleted: false },
      { id: 'chk-15', label: 'Mop rubber gym flooring', isCompleted: false }
    ],
    createdAt: new Date().toISOString()
  }
];

const SEED_GARBAGE_LOGS: Omit<GarbagePickupLog, 'societyId'>[] = [
  {
    id: 'glog-1',
    tower: 'Tower A',
    floor: '1st Floor',
    flatNumber: 'A-101',
    scheduledTime: '07:30 AM',
    status: 'COLLECTED',
    confirmedByResident: true,
    collectedAt: new Date(Date.now() - 4 * 60 * 60 * 1000).toISOString(),
    staffNotes: 'Wet & dry waste collected in segregated bags'
  },
  {
    id: 'glog-2',
    tower: 'Tower A',
    floor: '1st Floor',
    flatNumber: 'A-102',
    scheduledTime: '07:35 AM',
    status: 'COLLECTED',
    confirmedByResident: false,
    collectedAt: new Date(Date.now() - 4 * 60 * 60 * 1000).toISOString()
  },
  {
    id: 'glog-3',
    tower: 'Tower A',
    floor: '1st Floor',
    flatNumber: 'A-103',
    scheduledTime: '07:40 AM',
    status: 'MISSED',
    confirmedByResident: false,
    staffNotes: 'Bin was not kept outside door during collection window'
  }
];

class HousekeepingService {
  getTasks(societyId: string): HousekeepingTask[] {
    const raw = localStorage.getItem(TASKS_STORAGE_KEY);
    let items: HousekeepingTask[] = raw ? JSON.parse(raw) : [];

    const societyItems = items.filter(t => t.societyId === societyId);
    if (societyItems.length === 0) {
      const seeded = SEED_TASKS.map(t => ({ ...t, societyId }));
      items = [...items, ...seeded];
      localStorage.setItem(TASKS_STORAGE_KEY, JSON.stringify(items));
      return seeded;
    }
    return societyItems;
  }

  saveTask(task: HousekeepingTask): HousekeepingTask {
    const raw = localStorage.getItem(TASKS_STORAGE_KEY);
    let items: HousekeepingTask[] = raw ? JSON.parse(raw) : [];

    const index = items.findIndex(t => t.id === task.id);
    if (index >= 0) {
      items[index] = task;
    } else {
      items.unshift(task);
    }

    localStorage.setItem(TASKS_STORAGE_KEY, JSON.stringify(items));
    return task;
  }

  createTask(
    societyId: string,
    title: string,
    category: CommonAreaCategory,
    areaLocation: string,
    scheduledDate: string,
    startTime: string,
    endTime: string,
    assignedStaffId: string,
    assignedStaffName: string,
    checklistLabels: string[],
    tower?: string,
    floor?: string
  ): HousekeepingTask {
    const newTask: HousekeepingTask = {
      id: `hk-${Date.now()}`,
      societyId,
      title,
      category,
      areaLocation,
      tower,
      floor,
      scheduledDate,
      startTime,
      endTime,
      assignedStaffId,
      assignedStaffName,
      status: 'SCHEDULED',
      checklist: checklistLabels.map((lbl, idx) => ({
        id: `chk-${Date.now()}-${idx}`,
        label: lbl,
        isCompleted: false
      })),
      createdAt: new Date().toISOString()
    };

    return this.saveTask(newTask);
  }

  completeTaskWithProof(
    societyId: string,
    taskId: string,
    updatedChecklist: ChecklistItem[],
    photoProofUrl: string,
    staffNotes?: string
  ): HousekeepingTask {
    const tasks = this.getTasks(societyId);
    const target = tasks.find(t => t.id === taskId);
    if (!target) throw new Error('Task not found');

    const nowISO = new Date().toISOString();
    target.checklist = updatedChecklist;
    target.photoProofUrl = photoProofUrl;
    target.staffNotes = staffNotes;
    target.completionTimestamp = nowISO;

    // Evaluate if completed late
    const nowTimeStr = new Date().toTimeString().substring(0, 5);
    if (nowTimeStr > target.endTime && new Date().toISOString().substring(0, 10) === target.scheduledDate) {
      target.status = 'LATE';
    } else {
      target.status = 'COMPLETED';
    }

    return this.saveTask(target);
  }

  verifyTask(societyId: string, taskId: string, adminName: string): HousekeepingTask {
    const tasks = this.getTasks(societyId);
    const target = tasks.find(t => t.id === taskId);
    if (!target) throw new Error('Task not found');

    target.status = 'VERIFIED';
    target.verifiedBy = adminName;
    target.verifiedAt = new Date().toISOString();

    return this.saveTask(target);
  }

  flagMissedTask(societyId: string, taskId: string, reason: string): HousekeepingTask {
    const tasks = this.getTasks(societyId);
    const target = tasks.find(t => t.id === taskId);
    if (!target) throw new Error('Task not found');

    target.status = 'MISSED';
    target.missedReason = reason;

    return this.saveTask(target);
  }

  // --- GARBAGE PICKUP LOGS ---
  getGarbagePickupLogs(societyId: string): GarbagePickupLog[] {
    const raw = localStorage.getItem(GARBAGE_STORAGE_KEY);
    let items: GarbagePickupLog[] = raw ? JSON.parse(raw) : [];

    const societyItems = items.filter(g => g.societyId === societyId);
    if (societyItems.length === 0) {
      const seeded = SEED_GARBAGE_LOGS.map(g => ({ ...g, societyId }));
      items = [...items, ...seeded];
      localStorage.setItem(GARBAGE_STORAGE_KEY, JSON.stringify(items));
      return seeded;
    }
    return societyItems;
  }

  confirmResidentGarbagePickup(societyId: string, logId: string): GarbagePickupLog {
    const logs = this.getGarbagePickupLogs(societyId);
    const target = logs.find(g => g.id === logId);
    if (!target) throw new Error('Garbage log not found');

    target.confirmedByResident = true;
    target.status = 'COLLECTED';
    if (!target.collectedAt) target.collectedAt = new Date().toISOString();

    const raw = localStorage.getItem(GARBAGE_STORAGE_KEY);
    let allLogs: GarbagePickupLog[] = raw ? JSON.parse(raw) : [];
    const idx = allLogs.findIndex(g => g.id === logId);
    if (idx >= 0) allLogs[idx] = target;
    localStorage.setItem(GARBAGE_STORAGE_KEY, JSON.stringify(allLogs));

    return target;
  }

  reportMissedGarbagePickup(societyId: string, tower: string, floor: string, flatNumber: string, notes?: string): GarbagePickupLog {
    const newLog: GarbagePickupLog = {
      id: `glog-${Date.now()}`,
      societyId,
      tower,
      floor,
      flatNumber,
      scheduledTime: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
      status: 'MISSED',
      confirmedByResident: false,
      staffNotes: notes || 'Resident reported missed garbage collection'
    };

    const raw = localStorage.getItem(GARBAGE_STORAGE_KEY);
    const items: GarbagePickupLog[] = raw ? JSON.parse(raw) : [];
    items.unshift(newLog);
    localStorage.setItem(GARBAGE_STORAGE_KEY, JSON.stringify(items));
    return newLog;
  }
}

export const housekeepingService = new HousekeepingService();
