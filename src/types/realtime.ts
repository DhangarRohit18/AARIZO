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
  | 'NOTIFICATIONS'
  | 'ADVERTISEMENT_PUBLISHED'
  | 'PAYMENT_COMPLETED'
  | 'FILE_UPLOADED'
  | 'VENDOR_REGISTERED'
  | 'ANNOUNCEMENT_CREATED'
  | 'AMENITY_BOOKED'
  | 'OFFLINE_PAYMENT_LOGGED'
  | 'GUEST_STAY_BOOKED'
  | 'CHILD_EXIT_TRIGGERED'
  | 'EMERGENCY_TRIGGERED'
  | 'PARKING_GATE_TRIGGERED'
  | string;

export interface RealtimeMessage<T = any> {
  id: string;
  topic: RealtimeTopic;
  type: string;
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
