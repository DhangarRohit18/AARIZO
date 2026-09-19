import { useState, useEffect } from 'react';
import { attendanceRepository } from '../../../repositories/attendance/AttendanceRepository';
import { staffRepository } from '../../../repositories/attendance/StaffRepository';
import type { AttendanceLog, StaffProfile } from '../types';
import { where, orderBy, limit } from 'firebase/firestore';

/**
 * Hook for Residents to view only their linked domestic workers.
 * Enforces strict privacy using array-contains on householdIds.
 */
export function useHouseholdAttendance(societyId: string, residentId: string) {
  const [logs, setLogs] = useState<AttendanceLog[]>([]);
  const [linkedWorkers, setLinkedWorkers] = useState<StaffProfile[]>([]);
  const [loading, setLoading] = useState(true);

  // 1. Fetch Realtime Attendance Logs restricted to this household
  useEffect(() => {
    if (!societyId || !residentId) return;

    setLoading(true);
    
    // Privacy Constraint: Only fetch logs where this resident is explicitly linked
    const unsubscribeLogs = attendanceRepository.subscribe(
      societyId,
      (data) => setLogs(data),
      [
        where('householdIds', 'array-contains', residentId),
        orderBy('checkIn', 'desc'),
        limit(50) // only load recent history
      ]
    );

    return () => unsubscribeLogs();
  }, [societyId, residentId]);

  // 2. Fetch the actual profiles of linked workers
  useEffect(() => {
    if (!societyId || !residentId) return;

    // This is technically less optimal because Firestore doesn't allow complex nested array queries easily.
    // In production, we'd maintain a flat list of `linkedResidentIds` on the StaffProfile for easy querying.
    // For now, we fetch all staff in society and filter (acceptable for small datasets).
    const fetchProfiles = async () => {
      const allStaff = await staffRepository.list(societyId);
      const linked = allStaff.filter(staff => 
        staff.linkedHouseholds.some(h => h.residentId === residentId)
      );
      setLinkedWorkers(linked);
      setLoading(false);
    };

    fetchProfiles();
  }, [societyId, residentId]);

  // Compute active statuses
  const activeWorkers = linkedWorkers.map(worker => {
    const workerLogs = logs.filter(l => l.workerId === worker.id);
    const activeLog = workerLogs.find(l => !l.checkOut);
    return {
      ...worker,
      isPresent: !!activeLog,
      activeLogId: activeLog?.id,
      lastCheckIn: activeLog?.checkIn
    };
  });

  return {
    logs,
    activeWorkers,
    loading
  };
}

/**
 * Hook for Guards to view global society attendance.
 */
export function useSocietyAttendance(societyId: string) {
  const [activeLogs, setActiveLogs] = useState<AttendanceLog[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!societyId) return;

    setLoading(true);
    
    // In a NoSQL DB, we ideally query checkOut == null.
    // Since Firebase doesn't natively index null easily, we might pull today's logs and filter in-memory.
    const today = new Date();
    today.setHours(0, 0, 0, 0);

    const unsubscribe = attendanceRepository.subscribe(
      societyId,
      (data) => {
        // Filter to only those currently inside the society
        setActiveLogs(data.filter(log => !log.checkOut));
        setLoading(false);
      },
      [
        where('checkIn', '>=', today.toISOString()),
        orderBy('checkIn', 'desc')
      ]
    );

    return () => unsubscribe();
  }, [societyId]);

  return {
    activeLogs,
    activeCount: activeLogs.length,
    loading
  };
}
