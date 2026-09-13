import { useEffect, useState } from 'react';
import { realtimeService } from '../services/realtimeService';
import type { RealtimeTopic, RealtimeMessage, RealtimeConnectionStatus } from '../types/realtime';

/**
 * Hook to auto-subscribe to a specific real-time topic or '*' with automatic unmount cleanup.
 */
export function useRealtimeTopic<T = any>(
  topic: RealtimeTopic | '*',
  callback: (msg: RealtimeMessage<T>) => void,
  deps: any[] = []
) {
  useEffect(() => {
    const unsubscribe = realtimeService.subscribe<T>(topic, callback);
    return () => {
      unsubscribe();
    };
  }, [topic, ...deps]);
}

/**
 * Hook to stream real-time messages & connection health stats.
 */
export function useRealtimeStream(topicFilter: RealtimeTopic | 'ALL' = 'ALL') {
  const [messages, setMessages] = useState<RealtimeMessage[]>(() =>
    realtimeService.getRecentMessages(topicFilter)
  );
  const [status, setStatus] = useState<RealtimeConnectionStatus>(() =>
    realtimeService.getConnectionStatus()
  );

  useEffect(() => {
    const unsubscribe = realtimeService.subscribe('*', () => {
      setMessages(realtimeService.getRecentMessages(topicFilter));
      setStatus(realtimeService.getConnectionStatus());
    });

    return () => {
      unsubscribe();
    };
  }, [topicFilter]);

  return { messages, status };
}
