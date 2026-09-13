import { realtimeService } from './realtimeService';

export const realTimeSync = {
  publish: (topic: string, data?: any) => {
    realtimeService.broadcast(topic, data);
  },
  subscribe: (topic: string, callback: (data: any) => void) => {
    return realtimeService.subscribe(topic as any, callback);
  },
};

export default realTimeSync;
