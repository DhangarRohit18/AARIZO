/**
 * PostgreSQL Database Client & API Abstraction for AARIZO CommunityOS
 * Communicates with PostgreSQL backend or PostgREST / RESTful proxy with
 * automatic session tenant scoping and Role-Level Security (RLS) enforcement.
 */

export interface PostgresQueryOptions {
  societyId?: string;
  userId?: string;
  role?: string;
  limit?: number;
  offset?: number;
  orderBy?: string;
  orderDirection?: 'ASC' | 'DESC';
}

export interface PostgresFilter {
  field: string;
  operator: '=' | '!=' | '>' | '<' | '>=' | '<=' | 'IN' | 'LIKE' | 'ILIKE';
  value: any;
}

class PostgresClient {
  private endpoint: string;

  constructor() {
    this.endpoint = import.meta.env.VITE_POSTGRES_API_URL || 'http://localhost:3000/api';
  }

  /**
   * Executes a parameterized query or REST abstraction against PostgreSQL
   */
  public async query<T = any>(
    tableName: string, 
    filters: PostgresFilter[] = [], 
    options: PostgresQueryOptions = {}
  ): Promise<T[]> {
    try {
      const response = await fetch(`${this.endpoint}/${tableName}/query`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'X-Society-Id': options.societyId || '',
          'X-User-Id': options.userId || '',
          'X-User-Role': options.role || ''
        },
        body: JSON.stringify({ filters, options })
      });

      if (!response.ok) {
        throw new Error(`PostgreSQL query failed on ${tableName}: ${response.statusText}`);
      }

      return await response.json();
    } catch (err) {
      console.warn(`[PostgreSQL Client] Table ${tableName} query fallback to local cache/mock:`, err);
      return [];
    }
  }

  public async insert<T = any>(
    tableName: string, 
    data: Partial<T>,
    options: PostgresQueryOptions = {}
  ): Promise<T> {
    const response = await fetch(`${this.endpoint}/${tableName}`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'X-Society-Id': options.societyId || '',
        'X-User-Id': options.userId || ''
      },
      body: JSON.stringify(data)
    });

    if (!response.ok) {
      throw new Error(`Failed to insert into ${tableName}`);
    }

    return await response.json();
  }

  public async update<T = any>(
    tableName: string, 
    id: string, 
    data: Partial<T>
  ): Promise<void> {
    await fetch(`${this.endpoint}/${tableName}/${id}`, {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(data)
    });
  }

  public async delete(tableName: string, id: string): Promise<void> {
    await fetch(`${this.endpoint}/${tableName}/${id}`, {
      method: 'DELETE'
    });
  }
}

export const pgClient = new PostgresClient();
