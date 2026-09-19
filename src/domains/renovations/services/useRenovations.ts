import { useState, useEffect, useMemo } from 'react';
import { renovationRepository } from '../../../repositories/renovations/RenovationRepository';
import { materialGatepassRepository } from '../../../repositories/renovations/MaterialGatepassRepository';
import type { RenovationRequest, MaterialGatepass } from '../types';
import { orderBy, where } from 'firebase/firestore';

/**
 * Role-Based hook for Renovation operations
 * @param role Controls exactly what data is pulled from Firestore
 */
export function useRenovations(
  societyId: string, 
  role: 'RESIDENT' | 'SECRETARY' | 'GUARD', 
  residentId?: string
) {
  const [renovations, setRenovations] = useState<RenovationRequest[]>([]);
  const [gatepasses, setGatepasses] = useState<MaterialGatepass[]>([]);
  const [loading, setLoading] = useState(true);

  // 1. Fetch Renovations with Strict Scoping
  useEffect(() => {
    if (!societyId) return;
    setLoading(true);

    let constraints: any[] = [orderBy('createdAt', 'desc')];

    // RESIDENT sees only their own requests
    if (role === 'RESIDENT' && residentId) {
      constraints.push(where('residentId', '==', residentId));
    }
    // GUARD sees ONLY active/approved ones (hiding old/rejected/draft data)
    else if (role === 'GUARD') {
      constraints.push(where('status', 'in', ['APPROVED', 'ACTIVE']));
    }
    // SECRETARY sees everything (default constraints)
    
    const unsubscribe = renovationRepository.subscribe(
      societyId,
      (data) => setRenovations(data),
      constraints
    );

    return () => unsubscribe();
  }, [societyId, role, residentId]);

  // 2. Fetch Material Gatepasses (Only strictly necessary if they have active renovations)
  useEffect(() => {
    if (!societyId) return;

    // For simplicity we pull all gatepasses and filter locally, but in prod we'd batch query by renovationIds
    const unsubscribe = materialGatepassRepository.subscribe(
      societyId,
      (data) => {
        setGatepasses(data);
        setLoading(false);
      },
      [orderBy('createdAt', 'desc')]
    );

    return () => unsubscribe();
  }, [societyId]);

  // View Buckets
  const pendingApprovals = useMemo(() => 
    renovations.filter(r => r.status === 'SUBMITTED'), 
  [renovations]);

  const activeRenovations = useMemo(() => 
    renovations.filter(r => r.status === 'ACTIVE' || r.status === 'APPROVED'), 
  [renovations]);

  const pendingMaterialGatepasses = useMemo(() => 
    gatepasses.filter(g => g.status === 'PENDING'),
  [gatepasses]);

  return {
    renovations,
    activeRenovations,
    pendingApprovals,
    gatepasses,
    pendingMaterialGatepasses,
    loading
  };
}
