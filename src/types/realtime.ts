export type RealtimeTopic =
  | 'VISITOR_ARRIVAL'
  | 'VISITOR_APPROVAL'
  | 'QR_SCAN'
  | 'VISITOR_ENTRY'
  | 'VISITOR_EXIT'
  | 'PARKING_OCCUPANCY'
  | 'EMERGENCY_ALERTS'
  | 'MAINTENANCE_STATUS'
  | 'PAYMENT_STATUS'
  | 'DELIVERY_STATUS'
  | 'WORKER_ENTRY_EXIT'
  | 'AMENITY_AVAILABILITY'
  | 'NOTIFICATIONS';

export interface RealtimeMessage<T = any> {
  id: string;
  topic: RealtimeTopic;
  societyId: string;
  payload: T;
  timestamp: string;
  senderRole?: string;
  senderName?: string;
}

export interface RealtimeConnectionStatus {
  connected: boolean;
  transportType: 'WEBSOCKET' | 'BROADCAST_CHANNEL' | 'EVENT_EMITTER';
  latencyMs: number;
  activeListenersCount: number;
  messagesReceivedTotal: number;
}
