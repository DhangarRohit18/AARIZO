import { 
  collection, 
  doc, 
  getDoc, 
  getDocs, 
  addDoc, 
  setDoc, 
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
import { realtimeService } from '../services/realtimeService';

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
      createdBy: this.getCurrentUserId(),
      updatedBy: this.getCurrentUserId(),
    };

    // Primary: Write directly to PostgreSQL via Prisma API
    try {
      const res = await fetch(`/api/collections/${this.collectionName}`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'x-society-id': (data as any).societyId || 'soc-gvs',
        },
        body: JSON.stringify(payload),
      });
      if (res.ok) {
        const json = await res.json();
        return json.id;
      }
    } catch {
      // Fallback
    }

    // Secondary fallback
    try {
      const ref = await addDoc(this.getCollectionRef(), {
        ...payload,
        createdAt: serverTimestamp(),
        updatedAt: serverTimestamp(),
      } as WithFieldValue<T>);
      return ref.id;
    } catch {
      return `ent_${Date.now()}`;
    }
  }

  public async getById(id: string): Promise<T | null> {
    // Primary: Fetch directly from PostgreSQL
    try {
      const res = await fetch(`/api/collections/${this.collectionName}/${id}`);
      if (res.ok) {
        const json = await res.json();
        if (json && json.id) return json as T;
      }
    } catch {
      // Fallback
    }

    try {
      const docSnap = await getDoc(this.getDocRef(id));
      if (docSnap.exists()) {
        return docSnap.data();
      }
    } catch {}
    return null;
  }

  public async update(id: string, data: Partial<Omit<T, 'id' | 'societyId' | 'createdAt' | 'createdBy'>>): Promise<void> {
    const payload = {
      ...data,
      updatedBy: this.getCurrentUserId(),
    };

    // Primary: Update in PostgreSQL
    try {
      await fetch(`/api/collections/${this.collectionName}/${id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      });
    } catch {
      // Fallback
    }

    try {
      await updateDoc(this.getDocRef(id) as any, {
        ...payload,
        updatedAt: serverTimestamp(),
      } as any);
    } catch {}
  }

  public async delete(id: string): Promise<void> {
    try {
      await fetch(`/api/collections/${this.collectionName}/${id}`, {
        method: 'DELETE',
      });
    } catch {}

    try {
      await deleteDoc(this.getDocRef(id));
    } catch {}
  }

  public async archive(id: string): Promise<void> {
    await this.update(id, { 
      status: 'archived',
    } as any);
  }

  public async upsertWithId(id: string, data: any): Promise<void> {
    const payload = {
      ...data,
      id,
      updatedBy: this.getCurrentUserId(),
    };

    try {
      await fetch(`/api/collections/${this.collectionName}/${id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      });
    } catch {}

    try {
      await setDoc(this.getDocRef(id) as any, {
        ...payload,
        updatedAt: serverTimestamp(),
      } as any, { merge: true });
    } catch {}
  }

  public async listAll(constraints: QueryConstraint[] = []): Promise<T[]> {
    // Primary: Read from PostgreSQL
    try {
      const res = await fetch(`/api/collections/${this.collectionName}`);
      if (res.ok) {
        const rows = await res.json();
        if (Array.isArray(rows) && rows.length > 0) return rows as T[];
      }
    } catch {}

    try {
      const q = query(this.getCollectionRef(), ...constraints);
      const snapshot = await getDocs(q);
      return snapshot.docs.map(doc => doc.data());
    } catch {
      return [];
    }
  }

  public subscribeAll(
    callback: (data: T[]) => void, 
    constraints: QueryConstraint[] = []
  ): () => void {
    // Load initial data from PostgreSQL
    this.listAll(constraints).then((items) => {
      if (items.length > 0) callback(items);
    });

    // Listen to real-time events via PostgreSQL SSE broadcast
    const unsubRealtime = realtimeService.subscribe('*', (msg) => {
      if (msg.topic.includes(this.collectionName.toUpperCase()) || msg.topic === 'GENERAL') {
        this.listAll(constraints).then(callback);
      }
    });

    try {
      const q = query(this.getCollectionRef(), ...constraints);
      const unsubFirestore = onSnapshot(q, (snapshot) => {
        const data = snapshot.docs.map(doc => doc.data());
        callback(data);
      }, () => {});

      return () => {
        unsubRealtime();
        unsubFirestore();
      };
    } catch {
      return unsubRealtime;
    }
  }

  public async list(societyId: string, constraints: QueryConstraint[] = []): Promise<T[]> {
    // Primary: Read from PostgreSQL
    try {
      const res = await fetch(`/api/collections/${this.collectionName}?societyId=${encodeURIComponent(societyId)}`, {
        headers: { 'x-society-id': societyId },
      });
      if (res.ok) {
        const rows = await res.json();
        if (Array.isArray(rows) && rows.length > 0) return rows as T[];
      }
    } catch {}

    try {
      const q = query(
        this.getCollectionRef(),
        where('societyId', '==', societyId),
        ...constraints
      );
      const snapshot = await getDocs(q);
      return snapshot.docs.map(doc => doc.data());
    } catch {
      return [];
    }
  }

  public subscribe(
    societyId: string, 
    callback: (data: T[]) => void, 
    constraints: QueryConstraint[] = []
  ): () => void {
    // Initial fetch from PostgreSQL
    this.list(societyId, constraints).then((items) => {
      if (items.length > 0) callback(items);
    });

    // Listen to SSE updates from PostgreSQL backend
    const unsubRealtime = realtimeService.subscribe('*', (msg) => {
      if (msg.topic.includes(this.collectionName.toUpperCase()) || msg.topic === 'GENERAL') {
        this.list(societyId, constraints).then(callback);
      }
    });

    try {
      const q = query(
        this.getCollectionRef(),
        where('societyId', '==', societyId),
        ...constraints
      );
      const unsubFirestore = onSnapshot(q, (snapshot) => {
        const data = snapshot.docs.map(doc => doc.data());
        callback(data);
      }, () => {});

      return () => {
        unsubRealtime();
        unsubFirestore();
      };
    } catch {
      return unsubRealtime;
    }
  }
}



