export type UtilityCategory =
  | 'WATER'
  | 'POWER'
  | 'LIFT'
  | 'EV'
  | 'INTERNET'
  | 'GARBAGE'
  | 'CLEANING'
  | 'SWIMMING_POOL'
  | 'COMMON_AREAS';

export type OperationsStatus = 'NORMAL' | 'MAINTENANCE' | 'OUTAGE' | 'DEGRADED' | 'RESTORED';

export interface UtilityItem {
  id: string;
  societyId: string;
  category: UtilityCategory;
  name: string;
  location: string;
  currentStatus: OperationsStatus;
  
  metricValue?: string; // e.g. "Tank 85% Full", "Grid Voltage 230V", "Fuel 320L"
  sensorId?: string;
  
  notes?: string;
  lastUpdatedBy?: string;
  updatedAt: string;
}

export interface OutageHistoryRecord {
  id: string;
  societyId: string;
  category: UtilityCategory;
  name: string;
  status: OperationsStatus;
  startTime: string;
  endTime?: string;
  durationMinutes?: number;
  causeNotes: string;
  resolvedBy?: string;
  createdAt: string;
}

export interface IoTSensorPayload {
  sensorId: string;
  category: UtilityCategory;
  metricValue: string;
  suggestedStatus: OperationsStatus;
  rawPayload: Record<string, any>;
  timestamp: string;
}

export interface SocietyOperationsSummary {
  totalUtilities: number;
  normalCount: number;
  maintenanceCount: number;
  outageCount: number;
  degradedCount: number;
  overallUptimePercent: number;
}
