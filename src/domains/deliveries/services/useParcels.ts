// @ts-nocheck
import { useState, useEffect, useMemo } from 'react';
import { parcelRepository } from '../../../repositories/deliveries/ParcelRepository';
import type { Parcel } from '../types';
import { orderBy, where } from 'firebase/firestore';

export function useParcels(societyId: string, residentId?: string) {
  const [parcels, setParcels] = useState<Parcel[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!societyId) return;

    setLoading(true);
    
    // If residentId is provided, only subscribe to their parcels.
    // Otherwise, subscribe to all parcels in the society (for Guard/Secretary view).
    const constraints = residentId 
      ? [where('residentId', '==', residentId), orderBy('createdAt', 'desc')]
      : [orderBy('createdAt', 'desc')];

    const unsubscribe = parcelRepository.subscribe(
      societyId,
      (data) => {
        setParcels(data);
        setLoading(false);
      },
      constraints
    );

    return () => unsubscribe();
  }, [societyId, residentId]);

  // Derived Buckets for UI Convenience
  
  // Guard View: Parcels sitting in the room right now
  const storedParcels = useMemo(() => 
    parcels.filter(p => p.status === 'STORED' || p.status === 'READY_FOR_PICKUP'),
  [parcels]);

  // Guard View: Parcels expected today (often pre-approved by resident)
  const expectedParcels = useMemo(() => 
    parcels.filter(p => p.status === 'EXPECTED'),
  [parcels]);

  // Resident View: Uncollected
  const myPendingParcels = useMemo(() => 
    parcels.filter(p => p.status === 'STORED' || p.status === 'READY_FOR_PICKUP'),
  [parcels]);

  // Resident View: History
  const myHistoryParcels = useMemo(() => 
    parcels.filter(p => p.status === 'PICKED_UP' || p.status === 'RETURNED' || p.status === 'EXPIRED'),
  [parcels]);

  // Analytics Metrics
  const totalReceived = parcels.filter(p => p.status !== 'EXPECTED').length;
  const totalPending = storedParcels.length;
  const expiredCount = parcels.filter(p => p.status === 'EXPIRED').length;

  return {
    parcels,
    storedParcels,
    expectedParcels,
    myPendingParcels,
    myHistoryParcels,
    loading,
    analytics: {
      totalReceived,
      totalPending,
      expiredCount
    }
  };
}


