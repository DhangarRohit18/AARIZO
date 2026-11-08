import type { RealtimeTopic, RealtimeMessage, RealtimeConnectionStatus } from '../types/realtime';
import { getBackendBaseUrl } from '../utils/backendConfig';
import { triggerHaptic } from '../utils/nativeMobile';

type MessageCallback<T = any> = (msg: RealtimeMessage<T>) => void;
type StatusCallback = (status: RealtimeConnectionStatus) => void;
type AlertCallback = (alert: {
  id: string;
  topic: string;
  title: string;
  description: string;
  urgency: 'info' | 'alert' | 'emergency';
  timestamp: string;
  actionPath?: string;
  payload?: any;
}) => void;

/**
 * Clean Web Audio API Chime Synthesizer
 * Produces crisp harmonic notification tones with 0 external sound files
 */
function playAudioChime(urgency: 'info' | 'alert' | 'emergency' = 'info') {
  if (typeof window === 'undefined') return;
  try {
    const AudioCtx = window.AudioContext || (window as any).webkitAudioContext;
    if (!AudioCtx) return;
    const ctx = new AudioCtx();

    if (urgency === 'emergency') {
      // High-priority alternating dual-tone siren
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();
      osc.type = 'sawtooth';
      osc.frequency.setValueAtTime(880, ctx.currentTime);
      osc.frequency.exponentialRampToValueAtTime(1174, ctx.currentTime + 0.15);
      osc.frequency.exponentialRampToValueAtTime(880, ctx.currentTime + 0.3);
      gain.gain.setValueAtTime(0.18, ctx.currentTime);
      gain.gain.exponentialRampToValueAtTime(0.01, ctx.currentTime + 0.45);
      osc.connect(gain);
      gain.connect(ctx.destination);
      osc.start();
      osc.stop(ctx.currentTime + 0.46);
    } else if (urgency === 'alert') {
      // Pleasant two-tone ascending doorbell chime (G5 -> C6)
      [784, 1046].forEach((freq, idx) => {
        const osc = ctx.createOscillator();
        const gain = ctx.createGain();
        osc.type = 'sine';
        const start = ctx.currentTime + idx * 0.11;
        osc.frequency.setValueAtTime(freq, start);
        gain.gain.setValueAtTime(0.12, start);
        gain.gain.exponentialRampToValueAtTime(0.001, start + 0.22);
        osc.connect(gain);
        gain.connect(ctx.destination);
        osc.start(start);
        osc.stop(start + 0.23);
      });
    } else {
      // Subtle gentle confirmation ping
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();
      osc.type = 'sine';
      osc.frequency.setValueAtTime(987.77, ctx.currentTime);
      gain.gain.setValueAtTime(0.06, ctx.currentTime);
      gain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + 0.18);
      osc.connect(gain);
      gain.connect(ctx.destination);
      osc.start();
      osc.stop(ctx.currentTime + 0.2);
    }
  } catch {
    // Audio autoplay restrictions before first user interaction
  }
}

class RealtimeService {
  private channel: BroadcastChannel | null = null;
  private sseSource: EventSource | null = null;
  private subscribers: Map<string, Set<MessageCallback>> = new Map();
  private statusSubscribers: Set<StatusCallback> = new Set();
  private alertSubscribers: Set<AlertCallback> = new Set();
  private recentMessages: RealtimeMessage[] = [];
  private seenMessageIds: Set<string> = new Set();
  private totalMessagesReceived = 0;
  private isConnected = false;
  private connectionState: 'CONNECTING' | 'CONNECTED' | 'RECONNECTING' | 'OFFLINE' = 'CONNECTING';
  private measuredLatencyMs = 8;
  public lastPingTime: number = Date.now();
  private lastEventTime?: string;
  private sseErrorCount = 0;
  private reconnectTimeout: any = null;
  public currentSocietyId = 'soc-gvs';

  constructor() {
    this.initBroadcastChannel();
    this.initSseStream();
    this.seedRecentMessages();
  }

  /**
   * Initialize HTML5 BroadcastChannel for multi-tab real-time sync
   */
  private initBroadcastChannel() {
    if (typeof window !== 'undefined' && 'BroadcastChannel' in window) {
      try {
        this.channel = new BroadcastChannel('communityos_realtime_hub');
        this.channel.onmessage = (event) => {
          if (event.data && event.data.topic) {
            this.handleIncomingMessage(event.data);
          }
        };
      } catch {
        // Fallback to in-memory bus
      }
    }
  }

  /**
   * Initialize Server-Sent Events (SSE) with resilient auto-reconnect and live ping telemetry
   */
  public initSseStream(societyId = 'soc-gvs', userId?: string, userRole?: string) {
    this.currentSocietyId = societyId;
    if (typeof window === 'undefined' || !('EventSource' in window)) return;

    if (this.sseSource) {
      try {
        this.sseSource.close();
      } catch {}
      this.sseSource = null;
    }

    this.connectionState = this.sseErrorCount > 0 ? 'RECONNECTING' : 'CONNECTING';
    this.notifyStatusListeners();

    try {
      const baseUrl = getBackendBaseUrl();
      const params = new URLSearchParams({
        societyId,
        ...(userId ? { userId } : {}),
        ...(userRole ? { role: userRole } : {}),
      });

      const streamUrl = `${baseUrl}/api/realtime/stream?${params.toString()}`;
      this.sseSource = new EventSource(streamUrl);

      this.sseSource.onopen = () => {
        this.isConnected = true;
        this.connectionState = 'CONNECTED';
        this.sseErrorCount = 0;
        this.notifyStatusListeners();
      };

      this.sseSource.onmessage = (event) => {
        try {
          const data = JSON.parse(event.data);

          // Handle server ping frame for instantaneous network latency measurement
          if (data && data.type === 'PING') {
            this.measuredLatencyMs = Math.max(2, Date.now() - (data.timestamp || Date.now()));
            this.lastPingTime = Date.now();
            this.notifyStatusListeners();
            return;
          }

          if (data && (data.topic || data.eventType || data.type)) {
            const topic = data.topic || data.eventType || data.type;
            this.handleIncomingMessage({
              id: data.id || data.eventId || `sse_${Date.now()}`,
              topic,
              type: topic,
              societyId: data.societyId || societyId,
              payload: data.payload || data,
              timestamp: data.timestamp || new Date().toISOString(),
              senderRole: data.senderRole || 'SYSTEM',
              senderName: data.senderName || 'PostgreSQL Realtime',
            });
          }
        } catch {
          // Heartbeat frame
        }
      };

      this.sseSource.onerror = () => {
        this.isConnected = false;
        this.connectionState = 'RECONNECTING';
        this.notifyStatusListeners();

        try {
          this.sseSource?.close();
        } catch {}
        this.sseSource = null;

        // Fast jittered auto-reconnect (500ms -> 1s -> 2s -> max 10s)
        const baseDelay = Math.min(500 * Math.pow(1.5, Math.min(this.sseErrorCount, 7)), 10000);
        const jitter = Math.floor(Math.random() * 200);
        this.sseErrorCount += 1;

        clearTimeout(this.reconnectTimeout);
        this.reconnectTimeout = setTimeout(() => {
          this.initSseStream(societyId, userId, userRole);
        }, baseDelay + jitter);
      };
    } catch {
      this.connectionState = 'OFFLINE';
      this.notifyStatusListeners();
    }
  }

  public forceReconnect(societyId?: string) {
    this.sseErrorCount = 0;
    this.initSseStream(societyId || this.currentSocietyId);
  }

  private seedRecentMessages() {
    this.recentMessages = [];
    this.totalMessagesReceived = 0;
  }

  /**
   * Central Publish Engine: Broadcasts to local listeners + cross-tab BroadcastChannel + Network SSE
   */
  public publish<T = any>(
    topicOrMsg: RealtimeTopic | { type?: string; topic?: RealtimeTopic; payload?: any; societyId?: string; senderRole?: string; senderName?: string },
    payload?: T,
    societyId = 'soc-gvs',
    senderRole = 'SYSTEM',
    senderName = 'Realtime Engine'
  ): RealtimeMessage<T> {
    let actualTopic: RealtimeTopic;
    let actualPayload: any;
    let actualSocietyId = societyId;
    let actualSenderRole = senderRole;
    let actualSenderName = senderName;

    if (typeof topicOrMsg === 'object' && topicOrMsg !== null && ('type' in topicOrMsg || 'topic' in topicOrMsg)) {
      actualTopic = (topicOrMsg.topic || topicOrMsg.type || 'GENERAL') as RealtimeTopic;
      actualPayload = topicOrMsg.payload;
      actualSocietyId = topicOrMsg.societyId || societyId;
      actualSenderRole = topicOrMsg.senderRole || senderRole;
      actualSenderName = topicOrMsg.senderName || senderName;
    } else {
      actualTopic = topicOrMsg as RealtimeTopic;
      actualPayload = payload;
    }

    const msg: RealtimeMessage<T> = {
      id: `rt-${Date.now()}-${Math.floor(Math.random() * 1000)}`,
      topic: actualTopic,
      type: actualTopic,
      societyId: actualSocietyId,
      payload: actualPayload,
      timestamp: new Date().toISOString(),
      senderRole: actualSenderRole,
      senderName: actualSenderName,
    };

    // Mark as locally processed
    this.seenMessageIds.add(msg.id);
    if (this.seenMessageIds.size > 200) {
      const oldest = Array.from(this.seenMessageIds)[0];
      this.seenMessageIds.delete(oldest);
    }

    // 1. Send across browser tabs via BroadcastChannel
    if (this.channel) {
      try {
        this.channel.postMessage(msg);
      } catch (e) {
        console.error('BroadcastChannel postMessage error', e);
      }
    }

    // 2. Broadcast across network via backend Outbox SSE hub
    if (typeof window !== 'undefined' && typeof window.fetch === 'function') {
      try {
        fetch(`${getBackendBaseUrl()}/api/realtime/broadcast`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            topic: actualTopic,
            payload: actualPayload,
            societyId: actualSocietyId,
            senderRole: actualSenderRole,
            senderName: actualSenderName,
          }),
        }).catch(() => {});
      } catch {}
    }

    // 3. Dispatch to local subscribers
    this.handleIncomingMessage(msg);

    return msg;
  }

  public broadcast<T = any>(
    topic: string,
    payload: T,
    societyId = 'soc-gvs',
    senderRole = 'SYSTEM',
    senderName = 'Realtime Engine'
  ): RealtimeMessage<T> {
    return this.publish(topic as any, payload, societyId, senderRole, senderName);
  }

  /**
   * Internal message handler with deduplication, audio synthesis & haptic triggers
   */
  private handleIncomingMessage(msg: RealtimeMessage) {
    if (this.seenMessageIds.has(msg.id)) {
      return;
    }
    this.seenMessageIds.add(msg.id);
    if (this.seenMessageIds.size > 200) {
      const oldest = Array.from(this.seenMessageIds)[0];
      this.seenMessageIds.delete(oldest);
    }

    this.totalMessagesReceived += 1;
    this.lastEventTime = msg.timestamp;
    this.recentMessages = [msg, ...this.recentMessages.slice(0, 49)];

    // Sound & Haptic dispatch based on event type
    const topicUpper = String(msg.topic).toUpperCase();
    if (topicUpper.includes('EMERGENCY')) {
      playAudioChime('emergency');
      triggerHaptic('heavy');
      this.dispatchAlert({
        id: msg.id,
        topic: msg.topic,
        title: '🚨 Emergency Alert Broadcasted',
        description: msg.payload?.message || msg.payload?.description || 'Immediate emergency protocol activated',
        urgency: 'emergency',
        timestamp: msg.timestamp,
        actionPath: '/emergency',
        payload: msg.payload,
      });
    } else if (
      topicUpper.includes('VISITOR') ||
      topicUpper.includes('GATE') ||
      topicUpper.includes('PARCEL') ||
      topicUpper.includes('DELIVERY')
    ) {
      playAudioChime('alert');
      triggerHaptic('medium');
      const title = topicUpper.includes('VISITOR')
        ? `👤 Visitor Entry: ${msg.payload?.visitorName || 'Guest'}`
        : topicUpper.includes('PARCEL')
        ? `📦 Parcel Arrived: ${msg.payload?.courier || 'Delivery'}`
        : `⚡ Gate Activity: ${msg.payload?.status || 'Update'}`;
      this.dispatchAlert({
        id: msg.id,
        topic: msg.topic,
        title,
        description: msg.payload?.flatCode ? `For Flat ${msg.payload.flatCode}` : 'Activity recorded at gate',
        urgency: 'alert',
        timestamp: msg.timestamp,
        actionPath: topicUpper.includes('VISITOR') ? '/resident/visitors' : '/resident/deliveries',
        payload: msg.payload,
      });
    } else if (topicUpper.includes('PAYMENT')) {
      playAudioChime('info');
      triggerHaptic('success');
      this.dispatchAlert({
        id: msg.id,
        topic: msg.topic,
        title: '💳 Payment Transaction Completed',
        description: msg.payload?.amount ? `Amount: ₹${msg.payload.amount}` : 'Society payment verified',
        urgency: 'info',
        timestamp: msg.timestamp,
        actionPath: '/resident/billing',
        payload: msg.payload,
      });
    } else {
      triggerHaptic('light');
    }

    // Notify specific topic subscribers
    const topicSubscribers = this.subscribers.get(msg.topic);
    if (topicSubscribers) {
      topicSubscribers.forEach((cb) => {
        try {
          cb(msg);
        } catch (err) {
          console.error(`Error in realtime subscriber for topic ${msg.topic}:`, err);
        }
      });
    }

    // Notify wildcard '*' subscribers
    const wildcardSubscribers = this.subscribers.get('*');
    if (wildcardSubscribers) {
      wildcardSubscribers.forEach((cb) => {
        try {
          cb(msg);
        } catch (err) {
          console.error('Error in wildcard realtime subscriber:', err);
        }
      });
    }

    this.notifyStatusListeners();
  }

  private dispatchAlert(alert: Parameters<AlertCallback>[0]) {
    this.alertSubscribers.forEach((cb) => {
      try {
        cb(alert);
      } catch (err) {
        console.error('Error in alert subscriber:', err);
      }
    });
  }

  /**
   * Subscribe to real-time UI floating alert toasts
   */
  public subscribeToAlerts(callback: AlertCallback): () => void {
    this.alertSubscribers.add(callback);
    return () => {
      this.alertSubscribers.delete(callback);
    };
  }

  /**
   * Subscribe to connection status changes
   */
  public subscribeToStatus(callback: StatusCallback): () => void {
    this.statusSubscribers.add(callback);
    callback(this.getConnectionStatus());
    return () => {
      this.statusSubscribers.delete(callback);
    };
  }

  private notifyStatusListeners() {
    const status = this.getConnectionStatus();
    this.statusSubscribers.forEach((cb) => {
      try {
        cb(status);
      } catch {}
    });
  }

  /**
   * Central Subscription Engine with automatic Unsubscribe function
   */
  public subscribe<T = any>(topic: RealtimeTopic | '*', callback: MessageCallback<T>): () => void {
    const key = topic;
    if (!this.subscribers.has(key)) {
      this.subscribers.set(key, new Set());
    }

    const set = this.subscribers.get(key)!;
    set.add(callback as MessageCallback);

    return () => {
      const currentSet = this.subscribers.get(key);
      if (currentSet) {
        currentSet.delete(callback as MessageCallback);
        if (currentSet.size === 0) {
          this.subscribers.delete(key);
        }
      }
    };
  }

  /**
   * Get Recent Message Stream
   */
  public getRecentMessages(topicFilter?: RealtimeTopic | 'ALL'): RealtimeMessage[] {
    if (!topicFilter || topicFilter === 'ALL') {
      return this.recentMessages;
    }
    return this.recentMessages.filter((m) => m.topic === topicFilter);
  }

  /**
   * Get Diagnostic Connection Status
   */
  public getConnectionStatus(): RealtimeConnectionStatus {
    let activeListenersCount = 0;
    this.subscribers.forEach((set) => {
      activeListenersCount += set.size;
    });

    return {
      connected: this.isConnected,
      state: this.connectionState,
      transportType: 'HYBRID_OUTBOX',
      latencyMs: this.measuredLatencyMs,
      activeListenersCount,
      messagesReceivedTotal: this.totalMessagesReceived,
      lastEventTime: this.lastEventTime,
    };
  }
}

export const realtimeService = new RealtimeService();
