import { useState, useEffect, useMemo } from 'react';
import { amcRepository } from '../../../repositories/compliance/AMCRepository';
import { assetRepository } from '../../../repositories/compliance/AssetRepository';
import type { AMCContract, SocietyAsset } from '../types';
import { where, orderBy } from 'firebase/firestore';

/**
 * Hook to consume Compliance and Asset data.
 * @param role Should be 'ADMIN' | 'RESIDENT'. If RESIDENT, only fetches public documents.
 */
export function useCompliance(societyId: string, role: 'admin' | 'resident') {
  const [contracts, setContracts] = useState<AMCContract[]>([]);
  const [assets, setAssets] = useState<SocietyAsset[]>([]);
  const [loadingContracts, setLoadingContracts] = useState(true);
  const [loadingAssets, setLoadingAssets] = useState(true);

  // 1. Fetch AMC Contracts (with strict privacy constraints)
  useEffect(() => {
    if (!societyId) return;

    setLoadingContracts(true);

    const constraints: any[] = [];
    
    // Privacy Constraint
    if (role === 'resident') {
      constraints.push(where('isPublicToResidents', '==', true));
    }
    
    // Order by nearest expiration
    constraints.push(orderBy('contractEnd', 'asc'));

    const unsubscribe = amcRepository.subscribe(
      societyId,
      (data) => {
        setContracts(data);
        setLoadingContracts(false);
      },
      constraints
    );

    return () => unsubscribe();
  }, [societyId, role]);

  // 2. Fetch Assets (Residents usually don't need raw asset lists, but can see them if allowed)
  useEffect(() => {
    if (!societyId) return;

    setLoadingAssets(true);

    const unsubscribe = assetRepository.subscribe(
      societyId,
      (data) => {
        setAssets(data);
        setLoadingAssets(false);
      },
      [orderBy('name', 'asc')]
    );

    return () => unsubscribe();
  }, [societyId]);

  // Derived Dashboard Buckets for UI
  const activeContracts = useMemo(() => 
    contracts.filter(c => c.status === 'ACTIVE' || c.status === 'RENEWED'),
  [contracts]);

  const expiringContracts = useMemo(() => 
    contracts.filter(c => c.status === 'EXPIRING_SOON'),
  [contracts]);

  const expiredContracts = useMemo(() => 
    contracts.filter(c => c.status === 'EXPIRED'),
  [contracts]);

  const loading = loadingContracts || loadingAssets;

  return {
    contracts,
    assets,
    activeContracts,
    expiringContracts,
    expiredContracts,
    loading
  };
}
