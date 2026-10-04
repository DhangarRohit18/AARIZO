import type { FirestoreDataConverter, QueryDocumentSnapshot, SnapshotOptions } from 'firebase/firestore';
import { BaseRepository } from '../BaseRepository';

export interface StoredDocument {
  id: string;
  name: string;
  type: string;
  mimeType: string;
  size: number;
  storagePath: string;
  downloadUrl: string;
  uploadedBy: string;
  uploaderName?: string;
  societyId: string;
  entityType: 'vendor' | 'resident' | 'maintenance' | 'admin' | 'general';
  entityId?: string;
  createdAt: string;
  description?: string;
}

export class DocumentRepository extends BaseRepository<StoredDocument> {
  constructor() {
    super('documents');
  }

  protected getConverter(): FirestoreDataConverter<StoredDocument> {
    return {
      toFirestore(docItem: StoredDocument): any {
        const { id, ...data } = docItem;
        return data;
      },
      fromFirestore(snapshot: QueryDocumentSnapshot, options: SnapshotOptions): StoredDocument {
        const data = snapshot.data(options);
        return {
          id: snapshot.id,
          name: data.name || 'Untitled Document',
          type: data.type || 'DOCUMENT',
          mimeType: data.mimeType || 'application/octet-stream',
          size: data.size || 0,
          storagePath: data.storagePath || '',
          downloadUrl: data.downloadUrl || '',
          uploadedBy: data.uploadedBy || 'system',
          uploaderName: data.uploaderName || 'User',
          societyId: data.societyId || 'soc-gvs',
          entityType: data.entityType || 'general',
          entityId: data.entityId,
          createdAt: data.createdAt || new Date().toISOString(),
          description: data.description,
        };
      },
    };
  }
}

export const documentRepository = new DocumentRepository();
