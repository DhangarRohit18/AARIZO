import { realtimeService } from '../services/realtimeService';

export interface BaseEntity {
  id: string;
  societyId?: string;
  createdAt?: Date | string | any;
  updatedAt?: Date | string | any;
  createdBy?: string;
  updatedBy?: string;
}

export abstract class BaseRepository<T extends BaseEntity> {
  protected collectionName: string;

  constructor(collectionName: string) {
    this.collectionName = collectionName;
  }

  protected abstract getConverter(): any;

  protected getCurrentUserId(): string | null {
    try {
      const rawUser = localStorage.getItem('aarizo_user') || localStorage.getItem('communityos_auth_user');
      if (rawUser) {
        const parsed = JSON.parse(rawUser);
        return parsed.id || parsed.uid || null;
      }
    } catch {}
    return null;
  }

  public async create(data: Omit<T, 'id' | 'createdAt' | 'updatedAt' | 'createdBy' | 'updatedBy'> & { societyId: string }): Promise<string> {
    const payload = {
      ...data,
      createdBy: this.getCurrentUserId(),
      updatedBy: this.getCurrentUserId(),
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };

    // 100% PostgreSQL via Prisma backend
    const res = await fetch(`/api/collections/${this.collectionName}`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'x-society-id': (data as any).societyId || 'soc-gvs',
      },
      body: JSON.stringify(payload),
    });

    if (!res.ok) {
      throw new Error(`Failed to create record in PostgreSQL table ${this.collectionName}: ${res.statusText}`);
    }

    const json = await res.json();
    return json.id;
  }

  public async getById(id: string): Promise<T | null> {
    // 100% PostgreSQL via Prisma backend
    try {
      const res = await fetch(`/api/collections/${this.collectionName}/${id}`);
      if (res.ok) {
        const json = await res.json();
        if (json && json.id) return json as T;
      }
    } catch (err) {
      console.error(`[PostgreSQL] getById error for ${this.collectionName}/${id}:`, err);
    }
    return null;
  }

  public async update(id: string, data: Partial<Omit<T, 'id' | 'societyId' | 'createdAt' | 'createdBy'>>): Promise<void> {
    const payload = {
      ...data,
      updatedBy: this.getCurrentUserId(),
      updatedAt: new Date().toISOString(),
    };

    // 100% PostgreSQL via Prisma backend
    const res = await fetch(`/api/collections/${this.collectionName}/${id}`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(payload),
    });

    if (!res.ok) {
      throw new Error(`Failed to update record in PostgreSQL table ${this.collectionName}: ${res.statusText}`);
    }
  }

  public async delete(id: string): Promise<void> {
    // 100% PostgreSQL via Prisma backend
    const res = await fetch(`/api/collections/${this.collectionName}/${id}`, {
      method: 'DELETE',
    });

    if (!res.ok) {
      throw new Error(`Failed to delete record in PostgreSQL table ${this.collectionName}: ${res.statusText}`);
    }
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
      updatedAt: new Date().toISOString(),
    };

    // 100% PostgreSQL via Prisma backend
    const res = await fetch(`/api/collections/${this.collectionName}/${id}`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(payload),
    });

    if (!res.ok) {
      throw new Error(`Failed to upsert record in PostgreSQL table ${this.collectionName}: ${res.statusText}`);
    }
  }

  public async listAll(_constraints: any[] = []): Promise<T[]> {
    // 100% PostgreSQL via Prisma backend
    try {
      const res = await fetch(`/api/collections/${this.collectionName}`);
      if (res.ok) {
        const rows = await res.json();
        if (Array.isArray(rows)) return rows as T[];
      }
    } catch (err) {
      console.error(`[PostgreSQL] listAll error for ${this.collectionName}:`, err);
    }
    return [];
  }

  public subscribeAll(
    callback: (data: T[]) => void, 
    constraints: any[] = []
  ): () => void {
    // 1. Initial query from PostgreSQL
    this.listAll(constraints).then((items) => {
      callback(items);
    });

    // 2. Real-time PostgreSQL event stream via Server-Sent Events (SSE)
    const unsubRealtime = realtimeService.subscribe('*', (msg) => {
      if (msg.topic.includes(this.collectionName.toUpperCase()) || msg.topic === 'GENERAL') {
        this.listAll(constraints).then(callback);
      }
    });

    return unsubRealtime;
  }

  public async list(societyId: string, _constraints: any[] = []): Promise<T[]> {
    // 100% PostgreSQL via Prisma backend
    try {
      const res = await fetch(`/api/collections/${this.collectionName}?societyId=${encodeURIComponent(societyId)}`, {
        headers: { 'x-society-id': societyId },
      });
      if (res.ok) {
        const rows = await res.json();
        if (Array.isArray(rows)) return rows as T[];
      }
    } catch (err) {
      console.error(`[PostgreSQL] list error for ${this.collectionName}:`, err);
    }
    return [];
  }

  public subscribe(
    societyId: string, 
    callback: (data: T[]) => void, 
    constraints: any[] = []
  ): () => void {
    // 1. Initial query from PostgreSQL
    this.list(societyId, constraints).then((items) => {
      callback(items);
    });

    // 2. Real-time PostgreSQL live synchronization via Server-Sent Events (SSE)
    const unsubRealtime = realtimeService.subscribe('*', (msg) => {
      if (msg.topic.includes(this.collectionName.toUpperCase()) || msg.topic === 'GENERAL') {
        this.list(societyId, constraints).then(callback);
      }
    });

    return unsubRealtime;
  }
}



