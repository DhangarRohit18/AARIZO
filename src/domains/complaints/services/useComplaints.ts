import { useState, useEffect } from 'react';
import { complaintRepository } from '../../../repositories/complaints/ComplaintRepository';
import type { Complaint } from '../types';
import { where, orderBy } from 'firebase/firestore';

export function useComplaints(societyId: string) {
  const [complaints, setComplaints] = useState<Complaint[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!societyId) return;

    setLoading(true);
    // Subscribe to all complaints for the society, ordered by creation (newest first)
    // The specific filtering for dashboard buckets will happen on the frontend to avoid
    // running 6 different active websocket listeners.
    const unsubscribe = complaintRepository.subscribe(
      societyId,
      (data) => {
        setComplaints(data);
        setLoading(false);
      },
      [orderBy('createdAt', 'desc')]
    );

    return () => unsubscribe();
  }, [societyId]);

  const now = new Date();
  
  // Dashboard Buckets
  const openComplaints = complaints.filter(c => c.status === 'OPEN' || c.status === 'ASSIGNED');
  const inProgressComplaints = complaints.filter(c => c.status === 'IN_PROGRESS');
  const resolvedPendingVerification = complaints.filter(c => c.status === 'RESOLVED');
  const closedComplaints = complaints.filter(c => c.status === 'CLOSED');

  // SLA Specific Buckets
  const breachedComplaints = complaints.filter(c => c.isBreached === true && c.status !== 'CLOSED');
  
  const nearBreachComplaints = complaints.filter(c => {
    if (c.status === 'CLOSED' || c.status === 'RESOLVED' || c.isBreached || !c.dueAt) return false;
    const dueTime = new Date(c.dueAt).getTime();
    const timeRemainingMs = dueTime - now.getTime();
    // Near breach = less than 60 minutes remaining
    return timeRemainingMs > 0 && timeRemainingMs <= 60 * 60 * 1000;
  });

  return {
    complaints,
    openComplaints,
    inProgressComplaints,
    resolvedPendingVerification,
    closedComplaints,
    breachedComplaints,
    nearBreachComplaints,
    loading
  };
}
