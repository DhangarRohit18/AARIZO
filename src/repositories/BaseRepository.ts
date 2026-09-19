import { 
  collection, 
  doc, 
  getDoc, 
  getDocs, 
  addDoc, 
  updateDoc, 
  deleteDoc, 
  query, 
  where, 
  onSnapshot,
  serverTimestamp,
  QueryConstraint,
  FirestoreDataConverter,
  QueryDocumentSnapshot,
  SnapshotOptions,
  Timestamp,
  WithFieldValue
} from 'firebase/firestore';
import { db, auth } from '../services/firebase/config';

export interface BaseEntity {
  id: string;
  societyId: string;
  createdAt?: Timestamp | Date | any;
  updatedAt?: Timestamp | Date | any;
  createdBy?: string;
  updatedBy?: string;
}

/**
 * Generic BaseRepository providing standard CRUD operations, 
 * societyId scoping, and automatic timestamping.
 */
export abstract class BaseRepository<T extends BaseEntity> {
  protected collectionName: string;

  constructor(collectionName: string) {
    this.collectionName = collectionName;
  }

  /**
   * Must be implemented by child classes to handle generic type conversions
   */
  protected abstract getConverter(): FirestoreDataConverter<T>;

  /**
   * Helper to get the collection reference with converter attached
   */
  protected getCollectionRef() {
    return collection(db, this.collectionName).withConverter(this.getConverter());
  }

  /**
   * Helper to get a document reference
   */
  protected getDocRef(id: string) {
    return doc(db, this.collectionName, id).withConverter(this.getConverter());
  }

  /**
   * Get current authenticated user ID
   */
  protected getCurrentUserId(): string | null {
    return auth.currentUser?.uid || null;
  }

  /**
   * Create a new document
   */
  public async create(data: Omit<T, 'id' | 'createdAt' | 'updatedAt' | 'createdBy' | 'updatedBy'> & { societyId: string }): Promise<string> {
    const payload = {
      ...data,
      createdAt: serverTimestamp(),
      updatedAt: serverTimestamp(),
      createdBy: this.getCurrentUserId(),
      updatedBy: this.getCurrentUserId()
    };

    const ref = await addDoc(this.getCollectionRef(), payload as WithFieldValue<T>);
    return ref.id;
  }

  /**
   * Fetch a document by its ID
   */
  public async getById(id: string): Promise<T | null> {
    const docSnap = await getDoc(this.getDocRef(id));
    if (docSnap.exists()) {
      return docSnap.data();
    }
    return null;
  }

  /**
   * Update an existing document
   */
  public async update(id: string, data: Partial<Omit<T, 'id' | 'societyId' | 'createdAt' | 'createdBy'>>): Promise<void> {
    const payload = {
      ...data,
      updatedAt: serverTimestamp(),
      updatedBy: this.getCurrentUserId()
    };
    
    // We cast payload to any here because partial generic updates in Firestore TypeScript can be tricky
    await updateDoc(this.getDocRef(id) as any, payload);
  }

  /**
   * Permanently delete a document
   */
  public async delete(id: string): Promise<void> {
    await deleteDoc(this.getDocRef(id));
  }

  /**
   * Perform a soft-delete (archive) by updating status/deletedAt
   */
  public async archive(id: string): Promise<void> {
    await this.update(id, { 
      status: 'archived',
      deletedAt: serverTimestamp()
    } as any);
  }

  /**
   * List all documents for a specific society
   */
  public async list(societyId: string, constraints: QueryConstraint[] = []): Promise<T[]> {
    const q = query(
      this.getCollectionRef(),
      where('societyId', '==', societyId),
      ...constraints
    );
    
    const snapshot = await getDocs(q);
    return snapshot.docs.map(doc => doc.data());
  }

  /**
   * Subscribe to realtime updates for a specific query
   */
  public subscribe(
    societyId: string, 
    callback: (data: T[]) => void, 
    constraints: QueryConstraint[] = []
  ): () => void {
    const q = query(
      this.getCollectionRef(),
      where('societyId', '==', societyId),
      ...constraints
    );

    return onSnapshot(q, (snapshot) => {
      const data = snapshot.docs.map(doc => doc.data());
      callback(data);
    }, (error) => {
      console.error(`Error subscribing to ${this.collectionName}:`, error);
    });
  }
}
