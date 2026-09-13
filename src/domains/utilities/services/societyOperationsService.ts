import { UtilityItem, OutageHistoryRecord, SocietyOperationsSummary, UtilityCategory, OperationsStatus, IoTSensorPayload } from '../types';
import { realTimeSync } from '../../../services/realTimeSync';

const STORAGE_KEY_UTILITIES = 'aarizo_utility_statuses_v1';
const STORAGE_KEY_OUTAGE_HISTORY = 'aarizo_outage_history_v1';

const INITIAL_UTILITIES: UtilityItem[] = [
  {
    id: 'ut-101',
    societyId: 'soc-1',
    category: 'WATER',
    name: 'Overhead & Underground Water Tanks',
    location: 'Pump House B1',
    currentStatus: 'NORMAL',
    metricValue: 'Water Tank: 85% Full (120,000 L)',
    sensorId: 'SENSOR-WATER-TANK-01',
    notes: 'Pumps operating normally in auto-fill mode.',
    lastUpdatedBy: 'Facility Manager',
    updatedAt: new Date().toISOString(),
  },
  {
    id: 'ut-102',
    societyId: 'soc-1',
    category: 'POWER',
    name: 'State Electricity Grid & 500KVA DG Set',
    location: 'Main Substation B2',
    currentStatus: 'NORMAL',
    metricValue: 'Grid: 230V | DG Fuel: 320L',
    sensorId: 'SENSOR-POWER-SUB-02',
    notes: 'Primary grid stable. DG backup on auto-standby.',
    lastUpdatedBy: 'Facility Manager',
    updatedAt: new Date().toISOString(),
  },
  {
    id: 'ut-103',
    societyId: 'soc-1',
    category: 'LIFT',
    name: 'Tower A & B Passenger & Freight Elevators',
    location: 'Tower Shafts A & B',
    currentStatus: 'MAINTENANCE',
    metricValue: 'Tower A Lift 2: Servicing in progress',
    sensorId: 'SENSOR-LIFT-TWR-A2',
    notes: 'Otis technicians conducting scheduled monthly servicing.',
    lastUpdatedBy: 'Facility Manager',
    updatedAt: new Date().toISOString(),
  },
  {
    id: 'ut-104',
    societyId: 'soc-1',
    category: 'EV',
    name: 'Fast EV Charging Stations (4 Ports)',
    location: 'Podium Parking Level 1',
    currentStatus: 'NORMAL',
    metricValue: '3 / 4 Ports Available (7.4 kW)',
    sensorId: 'SENSOR-EV-POD-01',
    notes: 'All charging guns connected to central billing system.',
    lastUpdatedBy: 'Facility Manager',
    updatedAt: new Date().toISOString(),
  },
  {
    id: 'ut-105',
    societyId: 'soc-1',
    category: 'INTERNET',
    name: 'Central Fiber Backbone & Intercom Gateway',
    location: 'Server Room Ground Floor',
    currentStatus: 'NORMAL',
    metricValue: 'Uptime 99.98% | 1 Gbps Fiber',
    sensorId: 'SENSOR-FIBER-GW-01',
    notes: 'Airtel & Jio redundant fiber links active.',
    lastUpdatedBy: 'Facility Manager',
    updatedAt: new Date().toISOString(),
  },
  {
    id: 'ut-106',
    societyId: 'soc-1',
    category: 'GARBAGE',
    name: 'Door-to-Door Waste Collection & Chutes',
    location: 'Towers A, B & C Chutes',
    currentStatus: 'NORMAL',
    metricValue: 'Morning Collection Completed at 09:30 AM',
    notes: 'Wet & Dry segregation verified.',
    lastUpdatedBy: 'Facility Manager',
    updatedAt: new Date().toISOString(),
  },
  {
    id: 'ut-107',
    societyId: 'soc-1',
    category: 'CLEANING',
    name: 'Common Corridors & Lobby Housekeeping',
    location: 'All Towers & Clubhouse',
    currentStatus: 'NORMAL',
    metricValue: 'Morning Shift Cleared',
    notes: 'Mopping & sanitization completed.',
    lastUpdatedBy: 'Facility Manager',
    updatedAt: new Date().toISOString(),
  },
  {
    id: 'ut-108',
    societyId: 'soc-1',
    category: 'SWIMMING_POOL',
    name: 'Main Swimming Pool & Kids Splash Tank',
    location: 'Clubhouse Outdoor Deck',
    currentStatus: 'DEGRADED',
    metricValue: 'Ph Level: 7.2 | Filtration active',
    sensorId: 'SENSOR-POOL-PH-01',
    notes: 'Chlorine dosing in progress. Pool open with caution.',
    lastUpdatedBy: 'Facility Manager',
    updatedAt: new Date().toISOString(),
  },
  {
    id: 'ut-109',
    societyId: 'soc-1',
    category: 'COMMON_AREAS',
    name: 'Clubhouse Hall & Perimeter Lighting',
    location: 'Society Grounds',
    currentStatus: 'NORMAL',
    metricValue: 'Automatic Solar Timers Active',
    notes: 'All LED fixtures functional.',
    lastUpdatedBy: 'Facility Manager',
    updatedAt: new Date().toISOString(),
  },
];

const INITIAL_OUTAGES: OutageHistoryRecord[] = [
  {
    id: 'out-201',
    societyId: 'soc-1',
    category: 'WATER',
    name: 'Underground Water Main Line',
    status: 'RESTORED',
    startTime: '2026-09-10T14:00:00Z',
    endTime: '2026-09-10T16:30:00Z',
    durationMinutes: 150,
    causeNotes: 'Municipal water supply valve replacement in progress.',
    resolvedBy: 'Facility Manager & Municipal Plumber',
    createdAt: '2026-09-10T14:00:00Z',
  },
];

class SocietyOperationsService {
  private getStoredUtilities(): UtilityItem[] {
    const raw = localStorage.getItem(STORAGE_KEY_UTILITIES);
    if (!raw) {
      localStorage.setItem(STORAGE_KEY_UTILITIES, JSON.stringify(INITIAL_UTILITIES));
      return INITIAL_UTILITIES;
    }
    try {
      return JSON.parse(raw);
    } catch {
      return INITIAL_UTILITIES;
    }
  }

  private saveUtilities(items: UtilityItem[]) {
    localStorage.setItem(STORAGE_KEY_UTILITIES, JSON.stringify(items));
    realTimeSync.publish('UTILITY_STATUS_UPDATED', { timestamp: new Date().toISOString() });
  }

  private getStoredOutages(): OutageHistoryRecord[] {
    const raw = localStorage.getItem(STORAGE_KEY_OUTAGE_HISTORY);
    if (!raw) {
      localStorage.setItem(STORAGE_KEY_OUTAGE_HISTORY, JSON.stringify(INITIAL_OUTAGES));
      return INITIAL_OUTAGES;
    }
    try {
      return JSON.parse(raw);
    } catch {
      return INITIAL_OUTAGES;
    }
  }

  private saveOutages(outages: OutageHistoryRecord[]) {
    localStorage.setItem(STORAGE_KEY_OUTAGE_HISTORY, JSON.stringify(outages));
    realTimeSync.publish('UTILITY_STATUS_UPDATED', { timestamp: new Date().toISOString() });
  }

  public getUtilities(): UtilityItem[] {
    return this.getStoredUtilities();
  }

  public getOutageHistory(): OutageHistoryRecord[] {
    return this.getStoredOutages();
  }

  public getSummary(): SocietyOperationsSummary {
    const utilities = this.getStoredUtilities();
    const totalUtilities = utilities.length;
    const normalCount = utilities.filter(u => u.currentStatus === 'NORMAL' || u.currentStatus === 'RESTORED').length;
    const maintenanceCount = utilities.filter(u => u.currentStatus === 'MAINTENANCE').length;
    const outageCount = utilities.filter(u => u.currentStatus === 'OUTAGE').length;
    const degradedCount = utilities.filter(u => u.currentStatus === 'DEGRADED').length;

    const overallUptimePercent = totalUtilities > 0
      ? Math.round(((normalCount + degradedCount * 0.7) / totalUtilities) * 100)
      : 100;

    return {
      totalUtilities,
      normalCount,
      maintenanceCount,
      outageCount,
      degradedCount,
      overallUptimePercent,
    };
  }

  public updateUtilityStatus(
    utilityId: string,
    newStatus: OperationsStatus,
    notes: string,
    metricValue?: string,
    performedBy: string = 'Facility Manager'
  ): UtilityItem | null {
    const utilities = this.getStoredUtilities();
    const index = utilities.findIndex(u => u.id === utilityId);
    if (index === -1) return null;

    const item = utilities[index];
    const timestamp = new Date().toISOString();

    // If changing to OUTAGE, record outage log
    if (newStatus === 'OUTAGE' && item.currentStatus !== 'OUTAGE') {
      const outages = this.getStoredOutages();
      const newOutage: OutageHistoryRecord = {
        id: `out-${Date.now()}`,
        societyId: item.societyId,
        category: item.category,
        name: item.name,
        status: 'OUTAGE',
        startTime: timestamp,
        causeNotes: notes || 'Unscheduled operational outage reported.',
        createdAt: timestamp,
      };
      outages.unshift(newOutage);
      this.saveOutages(outages);
    }

    // If changing from OUTAGE to RESTORED, resolve open outage log
    if ((newStatus === 'RESTORED' || newStatus === 'NORMAL') && item.currentStatus === 'OUTAGE') {
      const outages = this.getStoredOutages();
      const openOutageIndex = outages.findIndex(o => o.category === item.category && !o.endTime);
      if (openOutageIndex !== -1) {
        const startMs = new Date(outages[openOutageIndex].startTime).getTime();
        const durationMinutes = Math.round((new Date(timestamp).getTime() - startMs) / 60000);
        outages[openOutageIndex] = {
          ...outages[openOutageIndex],
          status: 'RESTORED',
          endTime: timestamp,
          durationMinutes,
          resolvedBy: performedBy,
        };
        this.saveOutages(outages);
      }
    }

    const updated: UtilityItem = {
      ...item,
      currentStatus: newStatus,
      notes: notes || item.notes,
      metricValue: metricValue || item.metricValue,
      lastUpdatedBy: performedBy,
      updatedAt: timestamp,
    };

    utilities[index] = updated;
    this.saveUtilities(utilities);
    return updated;
  }

  // IoT Sensor Ingestion Pipeline (Simulated sensor payload mapping directly into event model)
  public ingestIoTSensorPayload(payload: IoTSensorPayload): UtilityItem | null {
    const utilities = this.getStoredUtilities();
    const index = utilities.findIndex(u => u.category === payload.category || u.sensorId === payload.sensorId);
    if (index === -1) return null;

    const item = utilities[index];
    const timestamp = new Date().toISOString();

    return this.updateUtilityStatus(
      item.id,
      payload.suggestedStatus,
      `[IoT SENSOR ALERT]: ${payload.sensorId} recorded metric ${payload.metricValue}`,
      payload.metricValue,
      'Automated IoT Sensor Gateway'
    );
  }
}

export const societyOperationsService = new SocietyOperationsService();
