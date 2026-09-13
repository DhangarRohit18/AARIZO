import type {
  EmergencyIncident,
  EmergencyType,
  SocietyEmergencyContact
} from '../types/safetyCommand';

const INCIDENTS_STORAGE_KEY = 'communityos_emergency_incidents';
const CONTACTS_STORAGE_KEY = 'communityos_emergency_contacts';

const SEED_CONTACTS: SocietyEmergencyContact[] = [
  { id: 'c-1', name: 'Main Security Control Gate', role: 'Security Desk', phone: '+91 98765 00001', isExternal: false },
  { id: 'c-2', name: 'Estate Manager Desk', role: 'Society Management', phone: '+91 98765 00002', isExternal: false },
  { id: 'c-3', name: 'City Fire Station Desk', role: 'Fire Emergency Service', phone: '101', isExternal: true },
  { id: 'c-4', name: 'Local Police Precinct', role: 'Police Service', phone: '100', isExternal: true },
  { id: 'c-5', name: 'Emergency Ambulance Control', role: 'Medical Ambulance', phone: '108', isExternal: true }
];

const SEED_INCIDENTS: Omit<EmergencyIncident, 'societyId'>[] = [
  {
    id: 'inc-101',
    incidentNumber: 'SOS-2026-001',
    type: 'LIFT_EMERGENCY',
    status: 'RESPONDING',
    flatNumber: 'A-402',
    tower: 'Tower A',
    locationDetails: 'Lift B2 Passengers Stuck (3rd Floor)',
    reportedByUserId: 'res-10',
    reportedByName: 'Sameer Gupta',
    reportedByPhone: '+91 98123 45678',
    assignedResponderId: 'guard-1',
    assignedResponderName: 'Security Guard Ramesh Kumar',
    description: 'Power surge caused Lift B2 to stall between 3rd and 4th floors. Passengers inside.',
    triggeredAt: new Date(Date.now() - 15 * 60 * 1000).toISOString(),
    acknowledgedAt: new Date(Date.now() - 12 * 60 * 1000).toISOString(),
    respondingAt: new Date(Date.now() - 8 * 60 * 1000).toISOString(),
    timeline: [
      {
        id: 'tl-1',
        incidentId: 'inc-101',
        status: 'TRIGGERED',
        actorName: 'Sameer Gupta',
        actorRole: 'Resident (Flat A-402)',
        timestamp: new Date(Date.now() - 15 * 60 * 1000).toISOString(),
        note: 'SOS Triggered via Resident App'
      },
      {
        id: 'tl-2',
        incidentId: 'inc-101',
        status: 'ACKNOWLEDGED',
        actorName: 'Ramesh Kumar',
        actorRole: 'Security Guard (Main Gate)',
        timestamp: new Date(Date.now() - 12 * 60 * 1000).toISOString(),
        note: 'Alarm acknowledged at Gate Control Terminal'
      },
      {
        id: 'tl-3',
        incidentId: 'inc-101',
        status: 'RESPONDING',
        actorName: 'Ramesh Kumar',
        actorRole: 'Security Guard',
        timestamp: new Date(Date.now() - 8 * 60 * 1000).toISOString(),
        note: 'Dispatched lift maintenance technician to Tower A control room'
      }
    ]
  },
  {
    id: 'inc-102',
    incidentNumber: 'SOS-2026-002',
    type: 'WATER_LEAKAGE',
    status: 'RESOLVED',
    flatNumber: 'B-105',
    tower: 'Tower B',
    locationDetails: 'Basement 1 Main Plumbing Riser',
    reportedByUserId: 'res-12',
    reportedByName: 'Kavita Verma',
    reportedByPhone: '+91 98456 78901',
    assignedResponderId: 'tech-1',
    assignedResponderName: 'Plumbing Vendor Sunil Tech',
    description: 'Major pipe burst near parking B-12.',
    triggeredAt: new Date(Date.now() - 120 * 60 * 1000).toISOString(),
    acknowledgedAt: new Date(Date.now() - 115 * 60 * 1000).toISOString(),
    respondingAt: new Date(Date.now() - 100 * 60 * 1000).toISOString(),
    resolvedAt: new Date(Date.now() - 30 * 60 * 1000).toISOString(),
    resolutionNotes: 'Main valve shut off and damaged pipe section replaced.',
    timeline: [
      {
        id: 'tl-4',
        incidentId: 'inc-102',
        status: 'TRIGGERED',
        actorName: 'Kavita Verma',
        actorRole: 'Resident',
        timestamp: new Date(Date.now() - 120 * 60 * 1000).toISOString(),
        note: 'Water leakage SOS triggered'
      },
      {
        id: 'tl-5',
        incidentId: 'inc-102',
        status: 'RESOLVED',
        actorName: 'Sunil Tech',
        actorRole: 'Plumber Vendor',
        timestamp: new Date(Date.now() - 30 * 60 * 1000).toISOString(),
        note: 'Repaired burst joint.'
      }
    ]
  }
];

class SafetyCommandService {
  getIncidents(societyId: string): EmergencyIncident[] {
    const raw = localStorage.getItem(INCIDENTS_STORAGE_KEY);
    let items: EmergencyIncident[] = raw ? JSON.parse(raw) : [];

    const societyItems = items.filter(i => i.societyId === societyId);
    if (societyItems.length === 0) {
      const seeded = SEED_INCIDENTS.map(i => ({ ...i, societyId }));
      items = [...items, ...seeded];
      localStorage.setItem(INCIDENTS_STORAGE_KEY, JSON.stringify(items));
      return seeded;
    }
    return societyItems;
  }

  saveIncident(incident: EmergencyIncident): EmergencyIncident {
    const raw = localStorage.getItem(INCIDENTS_STORAGE_KEY);
    let items: EmergencyIncident[] = raw ? JSON.parse(raw) : [];

    const index = items.findIndex(i => i.id === incident.id);
    if (index >= 0) {
      items[index] = incident;
    } else {
      items.unshift(incident);
    }

    localStorage.setItem(INCIDENTS_STORAGE_KEY, JSON.stringify(items));
    return incident;
  }

  triggerSOS(
    societyId: string,
    type: EmergencyType,
    flatNumber: string,
    tower: string,
    locationDetails: string,
    reportedByUserId: string,
    reportedByName: string,
    reportedByPhone: string,
    description?: string
  ): EmergencyIncident {
    const incidentNumber = `SOS-${new Date().getFullYear()}-${Math.floor(1000 + Math.random() * 9000)}`;
    const nowISO = new Date().toISOString();

    const newIncident: EmergencyIncident = {
      id: `inc-${Date.now()}`,
      societyId,
      incidentNumber,
      type,
      status: 'TRIGGERED',
      flatNumber,
      tower,
      locationDetails,
      reportedByUserId,
      reportedByName,
      reportedByPhone,
      description,
      triggeredAt: nowISO,
      timeline: [
        {
          id: `tl-${Date.now()}`,
          incidentId: `inc-${Date.now()}`,
          status: 'TRIGGERED',
          actorName: reportedByName,
          actorRole: `Resident (${flatNumber})`,
          timestamp: nowISO,
          note: `Panic SOS Triggered for ${type.replace(/_/g, ' ')}`
        }
      ]
    };

    return this.saveIncident(newIncident);
  }

  acknowledgeIncident(societyId: string, incidentId: string, guardName: string, guardRole: string = 'Security Guard'): EmergencyIncident {
    const incidents = this.getIncidents(societyId);
    const target = incidents.find(i => i.id === incidentId);
    if (!target) throw new Error('Incident not found');

    const nowISO = new Date().toISOString();
    target.status = 'ACKNOWLEDGED';
    target.acknowledgedAt = nowISO;
    target.timeline.push({
      id: `tl-${Date.now()}`,
      incidentId: target.id,
      status: 'ACKNOWLEDGED',
      actorName: guardName,
      actorRole: guardRole,
      timestamp: nowISO,
      note: 'Emergency alarm acknowledged by gate control'
    });

    return this.saveIncident(target);
  }

  respondIncident(
    societyId: string,
    incidentId: string,
    responderId: string,
    responderName: string,
    actorName: string,
    note?: string
  ): EmergencyIncident {
    const incidents = this.getIncidents(societyId);
    const target = incidents.find(i => i.id === incidentId);
    if (!target) throw new Error('Incident not found');

    const nowISO = new Date().toISOString();
    target.status = 'RESPONDING';
    target.respondingAt = nowISO;
    target.assignedResponderId = responderId;
    target.assignedResponderName = responderName;

    target.timeline.push({
      id: `tl-${Date.now()}`,
      incidentId: target.id,
      status: 'RESPONDING',
      actorName,
      actorRole: 'Security / Responder',
      timestamp: nowISO,
      note: note || `Dispatched responder ${responderName} to scene`
    });

    return this.saveIncident(target);
  }

  resolveIncident(societyId: string, incidentId: string, actorName: string, resolutionNotes: string): EmergencyIncident {
    const incidents = this.getIncidents(societyId);
    const target = incidents.find(i => i.id === incidentId);
    if (!target) throw new Error('Incident not found');

    const nowISO = new Date().toISOString();
    target.status = 'RESOLVED';
    target.resolvedAt = nowISO;
    target.resolutionNotes = resolutionNotes;

    target.timeline.push({
      id: `tl-${Date.now()}`,
      incidentId: target.id,
      status: 'RESOLVED',
      actorName,
      actorRole: 'Responder / Admin',
      timestamp: nowISO,
      note: `Incident resolved: ${resolutionNotes}`
    });

    return this.saveIncident(target);
  }

  closeIncident(societyId: string, incidentId: string, adminName: string): EmergencyIncident {
    const incidents = this.getIncidents(societyId);
    const target = incidents.find(i => i.id === incidentId);
    if (!target) throw new Error('Incident not found');

    const nowISO = new Date().toISOString();
    target.status = 'CLOSED';
    target.closedAt = nowISO;

    target.timeline.push({
      id: `tl-${Date.now()}`,
      incidentId: target.id,
      status: 'CLOSED',
      actorName: adminName,
      actorRole: 'Society Admin',
      timestamp: nowISO,
      note: 'Emergency incident reviewed and archived'
    });

    return this.saveIncident(target);
  }

  getEmergencyContacts(): SocietyEmergencyContact[] {
    const raw = localStorage.getItem(CONTACTS_STORAGE_KEY);
    return raw ? JSON.parse(raw) : SEED_CONTACTS;
  }
}

export const safetyCommandService = new SafetyCommandService();
