import { useState, useEffect } from 'react';
import { collection, query, where, onSnapshot } from 'firebase/firestore';
import { db } from '../../../../firebase/config';
import type { AIInsight } from '../../types';

export function useAIInsights(societyId: string, status: 'PENDING_REVIEW' | 'ACCEPTED' | 'REJECTED' = 'PENDING_REVIEW') {
  const [insights, setInsights] = useState<AIInsight[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!societyId) return;

    const q = query(
      collection(db, 'aiInsights'),
      where('societyId', '==', societyId),
      where('status', '==', status)
    );

    const unsubscribe = onSnapshot(q, (snapshot) => {
      const data = snapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
      })) as AIInsight[];
      setInsights(data);
      setLoading(false);
    });

    return () => unsubscribe();
  }, [societyId, status]);

  return { insights, loading };
}
