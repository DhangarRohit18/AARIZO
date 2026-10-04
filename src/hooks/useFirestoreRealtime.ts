import { useState, useEffect, useRef, useCallback } from 'react';
import {
  collection,
  doc,
  query,
  where,
  onSnapshot,
  type QueryConstraint,
  type Unsubscribe,
} from 'firebase/firestore';
import { db } from '../services/firebase/config';

export type SyncState = 'LIVE' | 'SYNCING' | 'OFFLINE';

export interface RealtimeCollectionOptions<T> {
  societyId?: string;
  constraints?: QueryConstraint[];
  fallbackData?: T[];
  autoSubscribe?: boolean;
}

/**
 * High-performance Firestore onSnapshot collection hook with society filtering,
 * clean unmount teardown, connection status, and fallback data support.
 */
export function useRealtimeCollection<T = any>(
  collectionName: string,
  options: RealtimeCollectionOptions<T> = {}
) {
  const {
    societyId = 'soc-gvs',
    constraints = [],
    fallbackData = [],
    autoSubscribe = true,
  } = options;

  const [data, setData] = useState<T[]>(fallbackData);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<Error | null>(null);
  const [syncState, setSyncState] = useState<SyncState>('SYNCING');

  const unsubscribeRef = useRef<Unsubscribe | null>(null);

  const subscribe = useCallback(() => {
    if (unsubscribeRef.current) {
      unsubscribeRef.current();
      unsubscribeRef.current = null;
    }

    setLoading(true);
    setSyncState('SYNCING');
    setError(null);

    try {
      const colRef = collection(db, collectionName);
      const queryConstraints: QueryConstraint[] = [];

      // Scoped society isolation to prevent cross-tenant leakage
      if (societyId && collectionName !== 'societies') {
        queryConstraints.push(where('societyId', '==', societyId));
      }

      queryConstraints.push(...constraints);

      const q = query(colRef, ...queryConstraints);

      const unsub = onSnapshot(
        q,
        (snapshot) => {
          const items: T[] = snapshot.docs.map((docSnap) => {
            const docData = docSnap.data();
            return {
              id: docSnap.id,
              ...docData,
            } as T;
          });

          setData(items.length > 0 ? items : fallbackData);
          setLoading(false);
          setSyncState('LIVE');
          setError(null);
        },
        (err) => {
          console.warn(`[Firestore Realtime] Listener for "${collectionName}" encountered error:`, err);
          setError(err);
          setLoading(false);
          setSyncState('OFFLINE');
          // Gracefully maintain cached or fallback data
          if (fallbackData && fallbackData.length > 0) {
            setData(fallbackData);
          }
        }
      );

      unsubscribeRef.current = unsub;
    } catch (setupError: any) {
      console.warn(`[Firestore Realtime] Failed to initialize query for "${collectionName}":`, setupError);
      setError(setupError);
      setLoading(false);
      setSyncState('OFFLINE');
      if (fallbackData) setData(fallbackData);
    }
  }, [collectionName, societyId]);

  useEffect(() => {
    if (autoSubscribe) {
      subscribe();
    }
    return () => {
      if (unsubscribeRef.current) {
        unsubscribeRef.current();
        unsubscribeRef.current = null;
      }
    };
  }, [subscribe, autoSubscribe]);

  return {
    data,
    loading,
    error,
    syncState,
    reconnect: subscribe,
  };
}

/**
 * Real-time listener for a single Firestore document by ID
 */
export function useRealtimeDocument<T = any>(
  collectionName: string,
  docId: string | null | undefined,
  fallbackData?: T
) {
  const [data, setData] = useState<T | null>(fallbackData || null);
  const [loading, setLoading] = useState(Boolean(docId));
  const [error, setError] = useState<Error | null>(null);
  const [syncState, setSyncState] = useState<SyncState>('SYNCING');

  useEffect(() => {
    if (!docId) {
      setData(fallbackData || null);
      setLoading(false);
      setSyncState('LIVE');
      return;
    }

    setLoading(true);
    setSyncState('SYNCING');
    setError(null);

    const docReference = doc(db, collectionName, docId);

    const unsubscribe = onSnapshot(
      docReference,
      (snapshot) => {
        if (snapshot.exists()) {
          setData({ id: snapshot.id, ...snapshot.data() } as T);
        } else {
          setData(fallbackData || null);
        }
        setLoading(false);
        setSyncState('LIVE');
      },
      (err) => {
        console.warn(`[Firestore Realtime] Document "${collectionName}/${docId}" error:`, err);
        setError(err);
        setLoading(false);
        setSyncState('OFFLINE');
        if (fallbackData) setData(fallbackData);
      }
    );

    return () => unsubscribe();
  }, [collectionName, docId]);

  return { data, loading, error, syncState };
}
