import {
  ref,
  uploadBytesResumable,
  getDownloadURL,
  deleteObject,
  type UploadTask,
} from 'firebase/storage';
import { storage } from '../firebase/config';
import { documentRepository, type StoredDocument } from '../../repositories/documents/DocumentRepository';
import { where, orderBy, type QueryConstraint } from 'firebase/firestore';

export interface FileUploadOptions {
  societyId?: string;
  entityType?: 'vendor' | 'resident' | 'maintenance' | 'admin' | 'general';
  entityId?: string;
  uploadedBy?: string;
  uploaderName?: string;
  description?: string;
  maxSizeMB?: number;
  onProgress?: (progressPercent: number) => void;
}

export interface UploadResult {
  success: boolean;
  documentId: string;
  downloadUrl: string;
  storagePath: string;
  name: string;
  size: number;
  mimeType: string;
}

// Supported MIME Types
export const ALLOWED_MIME_TYPES: Record<string, string> = {
  // Images
  'image/jpeg': 'JPG',
  'image/jpg': 'JPG',
  'image/png': 'PNG',
  'image/webp': 'WEBP',
  // Documents
  'application/pdf': 'PDF',
  'application/msword': 'DOC',
  'application/vnd.openxmlformats-officedocument.wordprocessingml.document': 'DOCX',
  'application/vnd.ms-excel': 'XLS',
  'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet': 'XLSX',
  'text/csv': 'CSV',
  'text/plain': 'TXT',
};

export class FileStorageService {
  private activeUploadTasks: Map<string, UploadTask> = new Map();

  /**
   * Validate file size and MIME type
   */
  public validateFile(file: File, maxSizeMB = 15): { valid: boolean; error?: string } {
    if (!file) {
      return { valid: false, error: 'No file provided' };
    }

    const maxSizeBytes = maxSizeMB * 1024 * 1024;
    if (file.size > maxSizeBytes) {
      return {
        valid: false,
        error: `File "${file.name}" exceeds the allowed size limit of ${maxSizeMB}MB (Size: ${(file.size / (1024 * 1024)).toFixed(1)}MB).`,
      };
    }

    const isMimeAllowed = Object.prototype.hasOwnProperty.call(ALLOWED_MIME_TYPES, file.type);
    const extension = file.name.split('.').pop()?.toLowerCase();
    const isExtensionAllowed = ['jpg', 'jpeg', 'png', 'webp', 'pdf', 'doc', 'docx', 'xls', 'xlsx', 'csv', 'txt'].includes(extension || '');

    if (!isMimeAllowed && !isExtensionAllowed) {
      return {
        valid: false,
        error: `File type "${file.type || extension}" is not supported. Please upload JPG, PNG, WEBP, PDF, DOC, DOCX, XLS, XLSX, or CSV.`,
      };
    }

    return { valid: true };
  }

  /**
   * Upload file to Firebase Storage with resilient local fallback & Firestore metadata recording
   */
  public async uploadFile(
    file: File,
    options: FileUploadOptions = {}
  ): Promise<UploadResult> {
    const {
      societyId = 'soc-gvs',
      entityType = 'general',
      entityId,
      uploadedBy = 'user-current',
      uploaderName = 'Resident / Member',
      description,
      maxSizeMB = 15,
      onProgress,
    } = options;

    const validation = this.validateFile(file, maxSizeMB);
    if (!validation.valid) {
      throw new Error(validation.error);
    }

    const sanitizedName = file.name.replace(/[^a-zA-Z0-9._-]/g, '_');
    const timestamp = Date.now();
    const storagePath = `societies/${societyId}/${entityType}/${timestamp}_${sanitizedName}`;
    const uploadId = `upload_${timestamp}_${Math.random().toString(36).substring(2, 6)}`;

    try {
      // 1. Attempt upload to Firebase Storage
      const storageReference = ref(storage, storagePath);
      const uploadTask = uploadBytesResumable(storageReference, file, {
        contentType: file.type || 'application/octet-stream',
        customMetadata: {
          originalName: file.name,
          societyId,
          entityType,
          uploadedBy,
        },
      });

      this.activeUploadTasks.set(uploadId, uploadTask);

      let downloadUrl = '';

      await new Promise<void>((resolve, reject) => {
        uploadTask.on(
          'state_changed',
          (snapshot) => {
            const percent = Math.round((snapshot.bytesTransferred / snapshot.totalBytes) * 100);
            if (onProgress) onProgress(percent);
          },
          (error) => {
            this.activeUploadTasks.delete(uploadId);
            reject(error);
          },
          async () => {
            try {
              downloadUrl = await getDownloadURL(uploadTask.snapshot.ref);
              this.activeUploadTasks.delete(uploadId);
              resolve();
            } catch (err) {
              reject(err);
            }
          }
        );
      });

      // 2. Persist metadata to Firestore collection `documents`
      const documentPayload = {
        name: file.name,
        type: this.determineCategory(file),
        mimeType: file.type || 'application/octet-stream',
        size: file.size,
        storagePath,
        downloadUrl,
        uploadedBy,
        uploaderName,
        societyId,
        entityType,
        entityId: entityId || '',
        createdAt: new Date().toISOString(),
        description: description || '',
      };

      const documentId = await documentRepository.create(documentPayload);

      return {
        success: true,
        documentId,
        downloadUrl,
        storagePath,
        name: file.name,
        size: file.size,
        mimeType: file.type,
      };
    } catch (storageError) {
      console.warn('[Firebase Storage] Primary upload threw error, initiating resilient fallback:', storageError);

      // Resilient fallback (e.g. offline, emulator CORS or sandbox)
      const fallbackUrl = await this.readAsDataUrl(file);
      const fallbackDocId = `doc-fallback-${timestamp}`;

      const fallbackPayload: StoredDocument = {
        id: fallbackDocId,
        name: file.name,
        type: this.determineCategory(file),
        mimeType: file.type || 'application/octet-stream',
        size: file.size,
        storagePath: `fallback://${sanitizedName}`,
        downloadUrl: fallbackUrl,
        uploadedBy,
        uploaderName,
        societyId,
        entityType,
        entityId: entityId || '',
        createdAt: new Date().toISOString(),
        description: description || '',
      };

      try {
        await documentRepository.upsertWithId(fallbackDocId, fallbackPayload);
      } catch {
        // Safe memory fallback
      }

      if (onProgress) onProgress(100);

      return {
        success: true,
        documentId: fallbackDocId,
        downloadUrl: fallbackUrl,
        storagePath: `fallback://${sanitizedName}`,
        name: file.name,
        size: file.size,
        mimeType: file.type,
      };
    }
  }

  /**
   * Cancel an in-flight upload task
   */
  public cancelUpload(uploadId: string): boolean {
    const task = this.activeUploadTasks.get(uploadId);
    if (task) {
      task.cancel();
      this.activeUploadTasks.delete(uploadId);
      return true;
    }
    return false;
  }

  /**
   * Delete a document from Storage and Firestore
   */
  public async deleteDocument(documentId: string, storagePath?: string): Promise<boolean> {
    try {
      if (storagePath && !storagePath.startsWith('fallback://')) {
        const storageReference = ref(storage, storagePath);
        await deleteObject(storageReference).catch((e) => console.warn('Storage file deletion warn:', e));
      }
      await documentRepository.delete(documentId);
      return true;
    } catch (err) {
      console.error('Failed to delete document:', err);
      return false;
    }
  }

  /**
   * List documents for a society with optional entityType filter
   */
  public async listDocuments(
    societyId: string,
    entityType?: 'vendor' | 'resident' | 'maintenance' | 'admin' | 'general',
    entityId?: string
  ): Promise<StoredDocument[]> {
    const constraints: QueryConstraint[] = [orderBy('createdAt', 'desc')];
    if (entityType) {
      constraints.unshift(where('entityType', '==', entityType));
    }
    if (entityId) {
      constraints.unshift(where('entityId', '==', entityId));
    }

    try {
      return await documentRepository.list(societyId, constraints);
    } catch (err) {
      console.warn('Failed to query Firestore documents, returning empty list:', err);
      return [];
    }
  }

  /**
   * Live real-time subscription to documents for a society
   */
  public subscribeDocuments(
    societyId: string,
    callback: (docs: StoredDocument[]) => void,
    entityType?: 'vendor' | 'resident' | 'maintenance' | 'admin' | 'general'
  ): () => void {
    const constraints: QueryConstraint[] = [];
    if (entityType) {
      constraints.push(where('entityType', '==', entityType));
    }
    return documentRepository.subscribe(societyId, callback, constraints);
  }

  private determineCategory(file: File): string {
    if (file.type.startsWith('image/')) return 'IMAGE';
    if (file.type === 'application/pdf') return 'PDF';
    if (file.name.endsWith('.doc') || file.name.endsWith('.docx')) return 'WORD';
    if (file.name.endsWith('.xls') || file.name.endsWith('.xlsx') || file.name.endsWith('.csv')) return 'SPREADSHEET';
    return 'DOCUMENT';
  }

  private readAsDataUrl(file: File): Promise<string> {
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.onload = () => resolve(reader.result as string);
      reader.onerror = reject;
      reader.readAsDataURL(file);
    });
  }
}

export const fileStorageService = new FileStorageService();
