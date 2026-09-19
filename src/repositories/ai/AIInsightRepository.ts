import { FirestoreDataConverter, QueryDocumentSnapshot, SnapshotOptions, Timestamp } from 'firebase/firestore';
import { BaseRepository } from '../BaseRepository';
import type { AIInsight } from '../../domains/ai/types';

export class AIInsightRepository extends BaseRepository<AIInsight> {
  constructor() {
    super('aiInsights');
  }

  protected getConverter(): FirestoreDataConverter<AIInsight> {
    return {
      toFirestore(insight: AIInsight): any {
        const { id, ...data } = insight;
        return {
          ...data,
          timestamp: data.timestamp ? Timestamp.fromDate(new Date(data.timestamp)) : null,
          resolvedAt: data.resolvedAt ? Timestamp.fromDate(new Date(data.resolvedAt)) : null,
        };
      },
      fromFirestore(
        snapshot: QueryDocumentSnapshot,
        options: SnapshotOptions
      ): AIInsight {
        const data = snapshot.data(options);
        
        const timestamp = data.timestamp instanceof Timestamp ? data.timestamp.toDate().toISOString() : data.timestamp;
        const resolvedAt = data.resolvedAt instanceof Timestamp ? data.resolvedAt.toDate().toISOString() : data.resolvedAt;

        return {
          id: snapshot.id,
          societyId: data.societyId || '',
          entityId: data.entityId || '',
          context: data.context || 'OPERATIONAL_SUMMARY',
          recommendation: data.recommendation || '',
          reason: data.reason || '',
          confidence: typeof data.confidence === 'number' ? data.confidence : 0,
          supportingData: data.supportingData || {},
          status: data.status || 'PENDING_REVIEW',
          reviewedBy: data.reviewedBy,
          timestamp: timestamp || new Date().toISOString(),
          resolvedAt: resolvedAt
        } as AIInsight;
      }
    };
  }
}

export const aiInsightRepository = new AIInsightRepository();
