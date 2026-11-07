import { Response } from 'express';
import crypto from 'crypto';
import { prisma } from './prisma.js';

export interface SSEClient {
  id: string;
  res: Response;
  societyId: string;
  userId?: string;
  role?: string;
  connectedAt: Date;
}

export interface DomainEventInput {
  societyId: string;
  eventType: string;
  entityId: string;
  actorId?: string;
  payload: Record<string, any>;
}

export class RealtimeEngine {
  private static instance: RealtimeEngine;
  private clients: Map<string, SSEClient> = new Map();
  private outboxInterval: NodeJS.Timeout | null = null;
  private isProcessing = false;

  private constructor() {
    this.startOutboxWorker();
  }

  public static getInstance(): RealtimeEngine {
    if (!RealtimeEngine.instance) {
      RealtimeEngine.instance = new RealtimeEngine();
    }
    return RealtimeEngine.instance;
  }

  /**
   * Registers a new client for Server-Sent Events
   */
  public registerClient(
    clientId: string,
    res: Response,
    societyId: string,
    userId?: string,
    role?: string,
    lastEventId?: string
  ): void {
    res.setHeader('Content-Type', 'text/event-stream');
    res.setHeader('Cache-Control', 'no-cache, no-transform');
    res.setHeader('Connection', 'keep-alive');
    res.setHeader('X-Accel-Buffering', 'no');
    res.flushHeaders?.();

    const client: SSEClient = {
      id: clientId,
      res,
      societyId,
      userId,
      role,
      connectedAt: new Date(),
    };

    this.clients.set(clientId, client);

    // Initial connection ack
    this.sendToClient(client, 'connected', {
      clientId,
      societyId,
      timestamp: new Date().toISOString(),
      message: 'SafeGate 2.0 Real-time Stream Connected',
    });

    // Replay missed events if Last-Event-ID was supplied
    if (lastEventId) {
      this.replayEventsSince(client, lastEventId).catch((err) =>
        console.error('[RealtimeEngine] Replay error:', err)
      );
    }

    // Handle disconnection
    res.on('close', () => {
      this.clients.delete(clientId);
    });
  }

  /**
   * Remove a client
   */
  public removeClient(clientId: string): void {
    this.clients.delete(clientId);
  }

  /**
   * Get active connection count
   */
  public getActiveConnectionCount(societyId?: string): number {
    if (!societyId) return this.clients.size;
    let count = 0;
    for (const client of this.clients.values()) {
      if (client.societyId === societyId) count++;
    }
    return count;
  }

  /**
   * Persists an event to the Transactional Outbox inside an existing Prisma transaction or standard client
   */
  public async recordOutboxEvent(
    eventInput: DomainEventInput,
    txClient?: any
  ): Promise<string> {
    const db = txClient || prisma;
    const eventId = `evt_${crypto.randomUUID()}`;

    await db.outboxEvent.create({
      data: {
        eventId,
        societyId: eventInput.societyId,
        eventType: eventInput.eventType,
        entityId: eventInput.entityId,
        actorId: eventInput.actorId || 'system',
        payload: eventInput.payload,
        status: 'PENDING',
      },
    });

    // Also trigger immediate in-memory dispatch to currently connected clients in this instance
    this.broadcastToSociety(eventInput.societyId, eventInput.eventType, {
      eventId,
      ...eventInput.payload,
      timestamp: new Date().toISOString(),
    });

    return eventId;
  }

  /**
   * Broadcast an event to all connected clients in a specific society
   */
  public broadcastToSociety(
    societyId: string,
    eventType: string,
    payload: any,
    targetRole?: string
  ): void {
    for (const client of this.clients.values()) {
      if (client.societyId === societyId) {
        if (!targetRole || client.role === targetRole || client.role === 'admin') {
          this.sendToClient(client, eventType, payload);
        }
      }
    }
  }

  /**
   * Send single SSE frame to client
   */
  private sendToClient(client: SSEClient, eventType: string, data: any): void {
    try {
      const id = data.eventId || crypto.randomUUID();
      const payloadString = JSON.stringify(data);
      client.res.write(`id: ${id}\n`);
      client.res.write(`event: ${eventType}\n`);
      client.res.write(`data: ${payloadString}\n\n`);
    } catch (err) {
      this.clients.delete(client.id);
    }
  }

  /**
   * Replays missed outbox events since Last-Event-ID
   */
  private async replayEventsSince(client: SSEClient, lastEventId: string): Promise<void> {
    try {
      const lastEvent = await prisma.outboxEvent.findUnique({
        where: { eventId: lastEventId },
      });

      const missedEvents = await prisma.outboxEvent.findMany({
        where: {
          societyId: client.societyId,
          createdAt: {
            gt: lastEvent ? lastEvent.createdAt : new Date(Date.now() - 3600000),
          },
        },
        orderBy: { createdAt: 'asc' },
        take: 50,
      });

      for (const ev of missedEvents) {
        this.sendToClient(client, ev.eventType, {
          eventId: ev.eventId,
          ...(ev.payload as object),
          replayed: true,
        });
      }
    } catch (err) {
      console.warn('[RealtimeEngine] Failed to replay events:', err);
    }
  }

  /**
   * Background outbox poller ensuring at-least-once delivery
   */
  private startOutboxWorker(): void {
    if (this.outboxInterval) return;

    // Send heartbeats every 15s to keep connections alive through mobile firewalls
    setInterval(() => {
      for (const client of this.clients.values()) {
        try {
          client.res.write(':keepalive\n\n');
        } catch {
          this.clients.delete(client.id);
        }
      }
    }, 15000);

    // Process pending outbox records
    this.outboxInterval = setInterval(async () => {
      if (this.isProcessing) return;
      this.isProcessing = true;

      try {
        const pendingEvents = await prisma.outboxEvent.findMany({
          where: { status: 'PENDING' },
          orderBy: { createdAt: 'asc' },
          take: 20,
        });

        for (const ev of pendingEvents) {
          try {
            this.broadcastToSociety(ev.societyId, ev.eventType, {
              eventId: ev.eventId,
              ...(ev.payload as object),
            });

            await prisma.outboxEvent.update({
              where: { id: ev.id },
              data: {
                status: 'PUBLISHED',
                processedAt: new Date(),
              },
            });
          } catch (dispatchErr: any) {
            await prisma.outboxEvent.update({
              where: { id: ev.id },
              data: {
                retryCount: { increment: 1 },
                error: dispatchErr?.message || 'Dispatch failed',
                status: ev.retryCount >= 5 ? 'FAILED' : 'PENDING',
              },
            });
          }
        }
      } catch (err) {
        // Ignore DB connection errors in poller loop
      } finally {
        this.isProcessing = false;
      }
    }, 3000);
  }
}

export const realtimeEngine = RealtimeEngine.getInstance();
