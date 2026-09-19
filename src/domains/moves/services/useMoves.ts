import { useState, useEffect, useMemo } from 'react';
import { moveRepository } from '../../../repositories/moves/MoveRepository';
import type { MoveRequest } from '../types';
import { orderBy, where } from 'firebase/firestore';

/**
 * Realtime hook for Move-In / Move-Out Dashboard
 */
export function useMoves(societyId: string, residentId?: string) {
  const [moves, setMoves] = useState<MoveRequest[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!societyId) return;

    setLoading(true);

    // If residentId provided, fetch only their moves. Otherwise fetch all society moves.
    const constraints = residentId 
      ? [where('residentId', '==', residentId), orderBy('createdAt', 'desc')]
      : [orderBy('createdAt', 'desc')];

    const unsubscribe = moveRepository.subscribe(
      societyId,
      (data) => {
        setMoves(data);
        setLoading(false);
      },
      constraints
    );

    return () => unsubscribe();
  }, [societyId, residentId]);

  // Derived Buckets

  // Secretary: Needs to approve these
  const pendingApproval = useMemo(() => 
    moves.filter(m => m.status === 'SUBMITTED'),
  [moves]);

  // Guard: Today's scheduled moves
  const todaysMoves = useMemo(() => {
    const todayStr = new Date().toISOString().split('T')[0]; // simple YYYY-MM-DD UTC match
    return moves.filter(m => 
      (m.status === 'SCHEDULED' || m.status === 'IN_PROGRESS') && 
      m.date.startsWith(todayStr)
    );
  }, [moves]);

  // Resident: Active moves
  const activeResidentMoves = useMemo(() => 
    moves.filter(m => 
      m.status === 'DRAFT' || 
      m.status === 'SUBMITTED' || 
      m.status === 'SCHEDULED' || 
      m.status === 'IN_PROGRESS'
    ),
  [moves]);

  // General Dashboard Stats
  const completedCount = moves.filter(m => m.status === 'COMPLETED').length;

  return {
    moves,
    pendingApproval,
    todaysMoves,
    activeResidentMoves,
    completedCount,
    loading
  };
}

