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
  Timestamp,
  QueryConstraint
} from 'firebase/firestore';
import type { FirestoreDataConverter, WithFieldValue } from 'firebase/firestore';
import { db, auth } from '../services/firebase/config';

export interface BaseEntity {
  id: string;
  societyId?: string;
  createdAt?: Timestamp | Date | any;
  updatedAt?: Timestamp | Date | any;
  createdBy?: string;
  updatedBy?: string;
}

export abstract class BaseRepository<T extends BaseEntity> {
  protected collectionName: string;

  constructor(collectionName: string) {
    this.collectionName = collectionName;
  }

  protected abstract getConverter(): FirestoreDataConverter<T>;

  protected getCollectionRef() {
    return collection(db, this.collectionName).withConverter(this.getConverter());
  }

  protected getDocRef(id: string) {
    return doc(db, this.collectionName, id).withConverter(this.getConverter());
  }

  protected getCurrentUserId(): string | null {
    return auth.currentUser?.uid || null;
  }

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

  public async getById(id: string): Promise<T | null> {
    const docSnap = await getDoc(this.getDocRef(id));
    if (docSnap.exists()) {
      return docSnap.data();
    }
    return null;
  }

  public async update(id: string, data: Partial<Omit<T, 'id' | 'societyId' | 'createdAt' | 'createdBy'>>): Promise<void> {
    const payload = {
      ...data,
      updatedAt: serverTimestamp(),
      updatedBy: this.getCurrentUserId()
    };
    await updateDoc(this.getDocRef(id) as any, payload as any);
  }

  public async delete(id: string): Promise<void> {
    await deleteDoc(this.getDocRef(id));
  }

  public async archive(id: string): Promise<void> {
    await this.update(id, { 
      status: 'archived',
      deletedAt: serverTimestamp()
    } as any);
  }

  public async list(societyId: string, constraints: QueryConstraint[] = []): Promise<T[]> {
    const q = query(
      this.getCollectionRef(),
      where('societyId', '==', societyId),
      ...constraints
    );
    const snapshot = await getDocs(q);
    return snapshot.docs.map(doc => doc.data());
  }

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
      console.error('Error subscribing to', error);
    });
  }
}



