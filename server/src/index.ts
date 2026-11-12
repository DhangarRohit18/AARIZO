import express, { Request, Response, NextFunction } from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import path from 'path';
import fs from 'fs';
import crypto from 'crypto';
import { fileURLToPath } from 'url';
import { prisma } from './prisma.js';
import { timingSafeCompare } from './crypto.js';
import { UniversalProvisioningService } from './provisioning.js';
import { realtimeEngine } from './realtimeEngine.js';
import { TrustScoreService } from './services/trustScoreService.js';
import { WalletService } from './services/walletService.js';
import { FederationMarketplaceService } from './services/federationMarketplaceService.js';
import { AIGovernancePolicyEngine } from './aiGovernance.js';
import {
  authenticateFirebaseToken,
  requireRole,
  requireSocietyMembership,
  rateLimiter,
} from './auth.js';

dotenv.config();

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();
const PORT = process.env.PORT || 5000;

app.use(cors());
app.use(
  express.json({
    limit: '25mb',
    verify: (req: any, _res, buf) => {
      req.rawBody = buf;
    },
  })
);
app.use(express.urlencoded({ extended: true, limit: '25mb' }));

// Static uploads directory with automated initialization
const uploadsDir = path.resolve(__dirname, '../uploads');
if (!fs.existsSync(uploadsDir)) {
  fs.mkdirSync(uploadsDir, { recursive: true });
}
app.use('/uploads', express.static(uploadsDir));

// Apply global rate limiting
app.use(rateLimiter(200, 60000));

// Multi-tenant contextual headers middleware (with fallback for testing)
app.use((req: Request, _res: Response, next: NextFunction) => {
  req.societyId = (req.headers['x-society-id'] as string) || undefined;
  req.userId = (req.headers['x-user-id'] as string) || undefined;
  req.userRole = (req.headers['x-user-role'] as string)?.toLowerCase() || undefined;
  next();
});

declare global {
  namespace Express {
    interface Request {
      societyId?: string;
      userId?: string;
      userRole?: string;
      rawBody?: Buffer;
    }
  }
}

// Health check
app.get('/api/health', (_req: Request, res: Response) => {
  res.json({
    status: 'UP',
    engine: 'Node.js + Express + Prisma + PostgreSQL',
    timestamp: new Date().toISOString(),
    sseClientsCount: realtimeEngine.getActiveConnectionCount(),
  });
});

// ==========================================
// REAL-TIME TRANSACTIONAL OUTBOX & SSE ENGINE
// ==========================================

// SSE Subscription endpoint for mobile APKs and web dashboards
app.get('/api/realtime/stream', (req: Request, res: Response) => {
  const societyId = (req.query.societyId as string) || req.societyId || 'soc-gvs';
  const userId = (req.query.userId as string) || req.userId;
  const role = (req.query.role as string) || req.userRole || 'resident';
  const lastEventId = (req.headers['last-event-id'] as string) || (req.query.lastEventId as string);
  const clientId = `client_${Date.now()}_${Math.random().toString(36).substring(2, 7)}`;

  realtimeEngine.registerClient(clientId, res, societyId, userId, role, lastEventId);
});

// SSE Broadcast endpoint for cross-device events
app.post('/api/realtime/broadcast', async (req: Request, res: Response) => {
  try {
    const { societyId, eventType, entityId, payload, topic, senderRole, senderName } = req.body;
    const finalType = eventType || topic || 'GENERAL';
    const eventId = await realtimeEngine.recordOutboxEvent({
      societyId: societyId || req.societyId || 'soc-gvs',
      eventType: finalType,
      entityId: entityId || `evt_${Date.now()}`,
      actorId: req.userId || senderName || 'system',
      payload: {
        ...(payload || {}),
        senderRole: senderRole || 'NETWORK',
        senderName: senderName || 'Remote Node',
      },
    });
    res.json({ success: true, eventId, deliveredTo: realtimeEngine.getActiveConnectionCount(societyId) });
  } catch (error: any) {
    res.status(500).json({ error: error?.message });
  }
});

// Diagnostics & Health Check
app.get('/api/realtime/health', (req: Request, res: Response) => {
  const societyId = (req.query.societyId as string) || 'soc-gvs';
  res.json({
    status: 'ACTIVE',
    mode: 'REALTIME_DURABLE_OUTBOX',
    societyId,
    activeSubscribersInSociety: realtimeEngine.getActiveConnectionCount(societyId),
    totalActiveConnections: realtimeEngine.getActiveConnectionCount(),
    timestamp: new Date().toISOString(),
  });
});

// Internal event broadcaster helper routing through authoritative Transactional Outbox
export async function broadcastEvent(topic: string, payload: any, societyId: string = 'soc-gvs') {
  try {
    await realtimeEngine.recordOutboxEvent({
      societyId,
      eventType: topic,
      entityId: payload?.id ? String(payload.id) : `evt_${Date.now()}`,
      payload: payload || {},
    });
  } catch {
    // In-memory fallback if database outbox table write encounters transient error
    realtimeEngine.broadcastToSociety(societyId, topic, {
      ...payload,
      timestamp: new Date().toISOString(),
      fallbackMode: true,
    });
  }
}

// Societies
app.get('/api/societies', async (_req: Request, res: Response) => {
  try {
    const societies = await prisma.society.findMany({
      include: { towers: true },
    });
    res.json(societies);
  } catch (error) {
    res.status(500).json({ error: String(error) });
  }
});

// Societies CRUD
app.post('/api/societies', requireRole(['admin']), async (req: Request, res: Response) => {
  try {
    const { name, code, city, address, pincode, subscriptionTier, adminName, adminEmail } = req.body;
    const newSoc = await prisma.society.create({
      data: {
        name,
        code: (code || name.substring(0, 4)).toUpperCase(),
        city: city || 'Mumbai',
        address: address || '',
        pincode: pincode || '400001',
        settings: { subscriptionTier: subscriptionTier || 'PRO', adminName, adminEmail },
      },
    });
    broadcastEvent('SOCIETY_CREATED', newSoc, newSoc.id);
    res.status(201).json(newSoc);
  } catch (error) {
    res.status(500).json({ error: String(error) });
  }
});

app.patch('/api/societies/:id', requireRole(['admin']), async (req: Request, res: Response) => {
  try {
    const id = String(req.params.id);
    const updated = await prisma.society.update({
      where: { id },
      data: req.body,
    });
    broadcastEvent('SOCIETY_UPDATED', updated, id);
    res.json(updated);
  } catch (error) {
    res.status(500).json({ error: String(error) });
  }
});

app.delete('/api/societies/:id', requireRole(['admin']), async (req: Request, res: Response) => {
  try {
    const id = String(req.params.id);
    await prisma.society.delete({ where: { id } });
    broadcastEvent('SOCIETY_DELETED', { id }, id);
    res.json({ success: true, id });
  } catch (error) {
    res.status(500).json({ error: String(error) });
  }
});

// Towers
app.get('/api/towers', async (req: Request, res: Response) => {
  try {
    const societyId = req.societyId || (req.query.societyId as string) || 'soc-gvs';
    const towers = await prisma.tower.findMany({
      where: societyId !== 'all' ? { societyId } : undefined,
      include: { flats: true },
    });
    res.json(towers);
  } catch (error) {
    res.status(500).json({ error: String(error) });
  }
});

app.post('/api/towers', requireRole(['secretary', 'admin']), async (req: Request, res: Response) => {
  try {
    const societyId = req.societyId || req.body.societyId || 'soc-gvs';
    const { name, blockCode, totalFloors } = req.body;
    const tower = await prisma.tower.create({
      data: {
        societyId,
        name,
        blockCode: (blockCode || name.substring(0, 2)).toUpperCase(),
        totalFloors: Number(totalFloors) || 10,
        totalUnits: 0,
      },
    });
    await prisma.society.update({
      where: { id: societyId },
      data: { totalTowers: { increment: 1 } },
    }).catch(() => null);
    broadcastEvent('TOWER_CREATED', tower, societyId);
    res.status(201).json(tower);
  } catch (error) {
    res.status(500).json({ error: String(error) });
  }
});

app.patch('/api/towers/:id', requireRole(['secretary', 'admin']), async (req: Request, res: Response) => {
  try {
    const id = String(req.params.id);
    const tower = await prisma.tower.update({
      where: { id },
      data: req.body,
    });
    broadcastEvent('TOWER_UPDATED', tower, tower.societyId);
    res.json(tower);
  } catch (error) {
    res.status(500).json({ error: String(error) });
  }
});

app.delete('/api/towers/:id', requireRole(['secretary', 'admin']), async (req: Request, res: Response) => {
  try {
    const id = String(req.params.id);
    const tower = await prisma.tower.findUnique({ where: { id } });
    if (!tower) return res.status(404).json({ error: 'Tower not found' });

    await prisma.tower.delete({ where: { id } });
    await prisma.society.update({
      where: { id: tower.societyId },
      data: { totalTowers: { decrement: 1 } },
    }).catch(() => null);

    broadcastEvent('TOWER_DELETED', { id }, tower.societyId);
    res.json({ success: true, id });
  } catch (error) {
    res.status(500).json({ error: String(error) });
  }
});

// Flats
app.get('/api/flats', async (req: Request, res: Response) => {
  try {
    const flats = await prisma.flat.findMany({
      where: req.societyId ? { societyId: req.societyId } : undefined,
      include: { tower: true },
    });
    res.json(flats);
  } catch (error) {
    res.status(500).json({ error: String(error) });
  }
});

// Flat Creation with Resident Provisioning
app.post('/api/flats', requireRole(['secretary', 'admin']), async (req: Request, res: Response) => {
  try {
    const societyId = req.societyId || req.body.societyId || 'soc-gvs';
    const { towerId, flatNumber, floorNumber, bhkType, occupancyStatus, residentName, residentPhone, residentEmail } = req.body;
    
    // Resolve valid towerId for society
    let resolvedTowerId = towerId;
    if (!resolvedTowerId) {
      const firstTower = await prisma.tower.findFirst({ where: { societyId } });
      resolvedTowerId = firstTower?.id;
    }
    if (!resolvedTowerId) {
      const createdTower = await prisma.tower.create({
        data: { societyId, name: 'Tower A', blockCode: 'A', totalFloors: 10, totalUnits: 0 },
      });
      resolvedTowerId = createdTower.id;
    }

    const flat = await prisma.flat.create({
      data: {
        societyId,
        towerId: resolvedTowerId,
        flatNumber: String(flatNumber).toUpperCase(),
        floorNumber: Number(floorNumber) || 1,
        bhkType: bhkType || '2BHK',
        occupancyStatus: occupancyStatus || 'VACANT',
      },
    });

    if (residentName && residentPhone) {
      await UniversalProvisioningService.provisionUser({
        societyId,
        role: 'resident',
        name: residentName,
        email: residentEmail || `res_${Date.now()}@society.local`,
        phone: residentPhone,
        flatNumber: flat.flatNumber,
        towerId: resolvedTowerId,
        flatId: flat.id,
      }).catch((e) => console.warn('[AutoProvisionResident] Failed:', e));
    }

    await prisma.tower.update({
      where: { id: resolvedTowerId },
      data: { totalUnits: { increment: 1 } },
    }).catch(() => null);

    broadcastEvent('FLAT_CREATED', flat, societyId);
    res.status(201).json(flat);
  } catch (error) {
    res.status(500).json({ error: String(error) });
  }
});

app.patch('/api/flats/:id', requireRole(['secretary', 'admin']), async (req: Request, res: Response) => {
  try {
    const id = String(req.params.id);
    const flat = await prisma.flat.update({
      where: { id },
      data: req.body,
    });
    broadcastEvent('FLAT_UPDATED', flat, flat.societyId);
    res.json(flat);
  } catch (error) {
    res.status(500).json({ error: String(error) });
  }
});

app.delete('/api/flats/:id', requireRole(['secretary', 'admin']), async (req: Request, res: Response) => {
  try {
    const id = String(req.params.id);
    const flat = await prisma.flat.findUnique({ where: { id } });
    if (!flat) return res.status(404).json({ error: 'Flat not found' });

    // Unlink any allocated parking slots safely before deleting
    await prisma.parkingSlot.updateMany({
      where: { allocatedFlatId: id },
      data: { allocatedFlatId: null, isOccupied: false },
    }).catch(() => null);

    await prisma.flat.delete({ where: { id } });
    await prisma.tower.update({
      where: { id: flat.towerId },
      data: { totalUnits: { decrement: 1 } },
    }).catch(() => null);

    broadcastEvent('FLAT_DELETED', { id }, flat.societyId);
    res.json({ success: true, id });
  } catch (error) {
    res.status(500).json({ error: String(error) });
  }
});

// Committee Members
app.get('/api/committee', async (req: Request, res: Response) => {
  try {
    const societyId = req.societyId || (req.query.societyId as string) || 'soc-gvs';
    const members = await prisma.societyMembership.findMany({
      where: { societyId, role: 'committee' },
    });
    res.json(members);
  } catch (error) {
    res.status(500).json({ error: String(error) });
  }
});

app.post('/api/committee', requireRole(['secretary', 'admin']), async (req: Request, res: Response) => {
  try {
    const societyId = req.societyId || req.body.societyId || 'soc-gvs';
    const { name, email, phone, designation, flatNumber } = req.body;
    const provisionResult = await UniversalProvisioningService.provisionUser({
      societyId,
      role: 'committee',
      name,
      email,
      phone,
      flatNumber,
      metadata: { committeeDesignation: designation || 'Executive Member' },
    });
    broadcastEvent('COMMITTEE_MEMBER_ADDED', { name, designation, societyId }, societyId);
    res.status(201).json(provisionResult);
  } catch (error) {
    res.status(500).json({ error: String(error) });
  }
});

// Residents
app.get('/api/residents', requireRole(['secretary', 'guard', 'facility_manager', 'admin', 'resident']), async (req: Request, res: Response) => {
  try {
    const limit = Math.min(Number(req.query.limit) || 100, 200);
    const offset = Number(req.query.offset) || 0;
    const residents = await prisma.resident.findMany({
      where: req.societyId ? { societyId: req.societyId } : undefined,
      include: { flat: true, familyMembers: true, vehicles: true },
      take: limit,
      skip: offset,
      orderBy: { name: 'asc' },
    });
    res.json(residents);
  } catch (error) {
    res.status(500).json({ error: String(error) });
  }
});

app.post('/api/residents', requireRole(['secretary', 'admin']), async (req: Request, res: Response) => {
  try {
    const societyId = req.societyId || req.body.societyId || 'soc-gvs';
    const { name, phone, email, flatId, flatCode, residentType = 'OWNER' } = req.body;
    if (!name || !phone) return res.status(400).json({ error: 'Name and phone are required' });

    let resolvedFlatId = flatId;
    if (!resolvedFlatId && flatCode) {
      const flat = await prisma.flat.findFirst({ where: { societyId, flatNumber: String(flatCode).toUpperCase() } });
      resolvedFlatId = flat?.id;
    }

    if (!resolvedFlatId) {
      const firstFlat = await prisma.flat.findFirst({ where: { societyId } });
      resolvedFlatId = firstFlat?.id;
    }

    const resident = await prisma.resident.create({
      data: {
        societyId,
        flatId: resolvedFlatId,
        name,
        phone,
        email,
        residentType,
        isVerified: true,
      },
      include: { flat: true },
    });

    broadcastEvent('RESIDENT_CREATED', resident, societyId);
    res.status(201).json(resident);
  } catch (error) {
    res.status(500).json({ error: String(error) });
  }
});

app.patch('/api/residents/:id', requireRole(['secretary', 'admin', 'resident']), async (req: Request, res: Response) => {
  try {
    const id = String(req.params.id);
    const resident = await prisma.resident.update({
      where: { id },
      data: req.body,
      include: { flat: true },
    });
    broadcastEvent('RESIDENT_UPDATED', resident, resident.societyId);
    res.json(resident);
  } catch (error) {
    res.status(500).json({ error: String(error) });
  }
});

app.delete('/api/residents/:id', requireRole(['secretary', 'admin']), async (req: Request, res: Response) => {
  try {
    const id = String(req.params.id);
    const resident = await prisma.resident.findUnique({ where: { id } });
    if (!resident) return res.status(404).json({ error: 'Resident not found' });

    await prisma.resident.delete({ where: { id } });
    broadcastEvent('RESIDENT_DELETED', { id }, resident.societyId);
    res.json({ success: true, id });
  } catch (error) {
    res.status(500).json({ error: String(error) });
  }
});

// Visitor Passes
app.get('/api/visitor-passes', requireRole(['resident', 'guard', 'secretary', 'admin', 'facility_manager']), async (req: Request, res: Response) => {
  try {
    const limit = Math.min(Number(req.query.limit) || 100, 200);
    const offset = Number(req.query.offset) || 0;
    const passes = await prisma.visitorPass.findMany({
      where: req.societyId ? { societyId: req.societyId } : undefined,
      orderBy: { validFrom: 'desc' },
      take: limit,
      skip: offset,
      include: { resident: true, flat: true },
    });
    res.json(passes);
  } catch (error) {
    res.status(500).json({ error: String(error) });
  }
});

app.post('/api/visitor-passes', requireRole(['resident', 'guard', 'secretary', 'admin']), async (req: Request, res: Response) => {
  try {
    const pass = await prisma.visitorPass.create({
      data: req.body,
    });
    broadcastEvent('VISITOR_ARRIVAL', pass, pass.societyId);
    res.status(201).json(pass);
  } catch (error) {
    res.status(500).json({ error: String(error) });
  }
});

app.patch('/api/visitor-passes/:id', requireRole(['resident', 'guard', 'secretary', 'admin']), async (req: Request, res: Response) => {
  try {
    const id = String(req.params.id);
    const pass = await prisma.visitorPass.update({
      where: { id },
      data: req.body,
    });
    const topic = req.body.status === 'CHECKED_IN' ? 'VISITOR_ENTRY' : req.body.status === 'CHECKED_OUT' ? 'VISITOR_EXIT' : 'VISITOR_APPROVAL';
    broadcastEvent(topic, pass, pass.societyId);
    res.json(pass);
  } catch (error) {
    res.status(500).json({ error: String(error) });
  }
});

app.delete('/api/visitor-passes/:id', requireRole(['resident', 'secretary', 'admin']), async (req: Request, res: Response) => {
  try {
    const id = String(req.params.id);
    const pass = await prisma.visitorPass.findUnique({ where: { id } });
    if (!pass) return res.status(404).json({ error: 'Visitor pass not found' });

    await prisma.visitorPass.delete({ where: { id } });
    broadcastEvent('VISITOR_PASS_DELETED', { id }, pass.societyId);
    res.json({ success: true, id });
  } catch (error) {
    res.status(500).json({ error: String(error) });
  }
});

// Automated Visitor Overstay Detection & Alert Engine
app.post('/api/visitor-passes/check-overstay', requireRole(['guard', 'secretary', 'admin']), async (req: Request, res: Response) => {
  try {
    const societyId = req.societyId || req.body.societyId || 'soc-gvs';
    const now = new Date();

    const overstayPasses = await prisma.visitorPass.findMany({
      where: {
        societyId,
        status: 'CHECKED_IN',
        validTo: { lt: now },
      },
      include: { resident: true, flat: true },
    });

    const flagged = [];
    for (const p of overstayPasses) {
      const updated = await prisma.visitorPass.update({
        where: { id: p.id },
        data: { status: 'EXPIRED' },
      });

      broadcastEvent('VISITOR_OVERSTAY_ALERT', {
        passId: p.id,
        visitorName: p.visitorName,
        phone: p.phone,
        flatNumber: p.flat?.flatNumber,
        validTo: p.validTo,
        overstayMinutes: Math.round((now.getTime() - new Date(p.validTo).getTime()) / 60000),
      }, societyId);

      flagged.push(updated);
    }

    res.json({ success: true, checkedAt: now.toISOString(), overstayCount: flagged.length, passes: flagged });
  } catch (error) {
    res.status(500).json({ error: String(error) });
  }
});

// Gate Pass Verification Endpoint
app.post('/api/visitor-passes/verify', requireRole(['guard', 'secretary', 'admin', 'resident']), async (req: Request, res: Response) => {
  try {
    const { codeOrQr } = req.body;
    const clean = String(codeOrQr || '').trim().toUpperCase();

    const passes = await prisma.visitorPass.findMany({
      where: req.societyId ? { societyId: req.societyId } : undefined,
      include: {
        resident: true,
        flat: true,
      }
    });

    const matched = passes.find(p =>
      p.id.toUpperCase() === clean ||
      p.id.toUpperCase() === `PASS-${clean}` ||
      (p.qrCodeHash && p.qrCodeHash.toUpperCase().includes(clean)) ||
      p.id.toUpperCase().endsWith(clean)
    );

    if (!matched) {
      return res.status(404).json({
        isValid: false,
        status: 'invalid',
        message: `Passcode ${clean} not recognised in system.`,
      });
    }

    const now = new Date();
    if (matched.status === 'CANCELLED' || matched.status === 'REJECTED') {
      return res.json({
        isValid: false,
        status: 'cancelled',
        message: 'This gate pass is no longer active.',
        pass: matched,
      });
    }

    if (now > new Date(matched.validTo) || matched.status === 'EXPIRED') {
      return res.json({
        isValid: false,
        status: 'expired',
        message: 'This gate pass has expired.',
        pass: matched,
      });
    }

    return res.json({
      isValid: true,
      status: matched.status === 'CHECKED_IN' ? 'checked_in' : 'valid',
      message: 'Gate pass verified successfully!',
      pass: matched,
    });
  } catch (error) {
    res.status(500).json({ error: String(error) });
  }
});

// Maintenance Tickets
app.get('/api/maintenance', requireRole(['resident', 'facility_manager', 'secretary', 'admin', 'vendor']), async (req: Request, res: Response) => {
  try {
    const tickets = await prisma.maintenanceTicket.findMany({
      where: req.societyId ? { societyId: req.societyId } : undefined,
      orderBy: { createdAt: 'desc' },
    });
    res.json(tickets);
  } catch (error) {
    res.status(500).json({ error: String(error) });
  }
});

app.post('/api/maintenance', requireRole(['resident', 'facility_manager', 'secretary', 'admin']), async (req: Request, res: Response) => {
  try {
    const ticket = await prisma.maintenanceTicket.create({
      data: req.body,
    });
    broadcastEvent('MAINTENANCE_STATUS', ticket, ticket.societyId);
    res.status(201).json(ticket);
  } catch (error) {
    res.status(500).json({ error: String(error) });
  }
});

app.patch('/api/maintenance/:id', requireRole(['facility_manager', 'secretary', 'admin', 'vendor']), async (req: Request, res: Response) => {
  try {
    const id = req.params.id as string;
    const ticket = await prisma.maintenanceTicket.update({
      where: { id },
      data: req.body,
    });
    broadcastEvent('MAINTENANCE_STATUS', ticket, ticket.societyId);
    res.json(ticket);
  } catch (error) {
    res.status(500).json({ error: String(error) });
  }
});

// Billing Invoices
app.get('/api/billing/invoices', requireRole(['resident', 'secretary', 'admin', 'committee']), async (req: Request, res: Response) => {
  try {
    const invoices = await prisma.billingInvoice.findMany({
      where: req.societyId ? { societyId: req.societyId } : undefined,
      include: { resident: true, flat: true },
      orderBy: { dueDate: 'asc' },
    });
    res.json(invoices);
  } catch (error) {
    res.status(500).json({ error: String(error) });
  }
});

app.patch('/api/billing/invoices/:id', requireRole(['resident', 'secretary', 'admin', 'committee']), async (req: Request, res: Response) => {
  try {
    const id = String(req.params.id);
    const invoice = await prisma.billingInvoice.update({
      where: { id },
      data: req.body,
    });
    broadcastEvent('BILLING_INVOICES_UPDATED', invoice, invoice.societyId);
    res.json(invoice);
  } catch (error) {
    res.status(500).json({ error: String(error) });
  }
});

app.post('/api/billing/invoices', requireRole(['secretary', 'admin', 'committee']), async (req: Request, res: Response) => {
  try {
    const societyId = req.societyId || req.body.societyId || 'soc-gvs';
    const { residentId, flatId, maintenanceAmount, utilityAmount = 0, sinkingFund = 0, lateFee = 0, dueDate, breakdown } = req.body;

    const totalAmount = Number(maintenanceAmount || 0) + Number(utilityAmount || 0) + Number(sinkingFund || 0) + Number(lateFee || 0);
    const invoiceNumber = `INV-${Date.now().toString().slice(-6)}-${Math.floor(100 + Math.random() * 900)}`;

    const invoice = await prisma.billingInvoice.create({
      data: {
        societyId,
        residentId,
        flatId,
        invoiceNumber,
        maintenanceAmount: Number(maintenanceAmount || 0),
        utilityAmount: Number(utilityAmount || 0),
        sinkingFund: Number(sinkingFund || 0),
        lateFee: Number(lateFee || 0),
        totalAmount,
        dueDate: dueDate ? new Date(dueDate) : new Date(Date.now() + 15 * 86400000),
        status: 'PENDING',
        breakdown: breakdown || {},
      },
      include: { resident: true, flat: true },
    });

    broadcastEvent('BILLING_INVOICE_CREATED', invoice, societyId);
    res.status(201).json(invoice);
  } catch (error) {
    res.status(500).json({ error: String(error) });
  }
});

app.delete('/api/billing/invoices/:id', requireRole(['secretary', 'admin']), async (req: Request, res: Response) => {
  try {
    const id = String(req.params.id);
    await prisma.billingInvoice.delete({ where: { id } });
    broadcastEvent('BILLING_INVOICE_DELETED', { id });
    res.json({ success: true, id });
  } catch (error) {
    res.status(500).json({ error: String(error) });
  }
});

// Billing Cycles API
app.get('/api/billing/cycles', requireRole(['secretary', 'admin', 'committee']), async (req: Request, res: Response) => {
  try {
    const societyId = req.societyId || (req.query.societyId as string) || 'soc-gvs';
    const cycles = await prisma.billingCycle.findMany({
      where: societyId !== 'all' ? { societyId } : undefined,
      orderBy: { billingDate: 'desc' },
      include: { invoices: true },
    });
    res.json(cycles);
  } catch (error) {
    res.status(500).json({ error: String(error) });
  }
});

app.post('/api/billing/cycles', requireRole(['secretary', 'admin']), async (req: Request, res: Response) => {
  try {
    const societyId = req.societyId || req.body.societyId || 'soc-gvs';
    const { cycleName, monthYear, billingDate, dueDate, lateFeeAmount = 250 } = req.body;

    const cycle = await prisma.billingCycle.create({
      data: {
        societyId,
        cycleName: cycleName || `Cycle ${monthYear || 'Current'}`,
        monthYear: monthYear || new Date().toISOString().slice(0, 7),
        billingDate: billingDate ? new Date(billingDate) : new Date(),
        dueDate: dueDate ? new Date(dueDate) : new Date(Date.now() + 15 * 86400000),
        lateFeeAmount: Number(lateFeeAmount),
      },
    });

    broadcastEvent('BILLING_CYCLE_GENERATED', cycle, societyId);
    res.status(201).json(cycle);
  } catch (error) {
    res.status(500).json({ error: String(error) });
  }
});

// Automated Late Fee Assessment Engine
app.post('/api/billing/apply-late-fees', requireRole(['secretary', 'admin', 'committee']), async (req: Request, res: Response) => {
  try {
    const societyId = req.societyId || req.body.societyId || 'soc-gvs';
    const feeAmount = Number(req.body.feeAmount) || 250;
    const now = new Date();

    const overdueInvoices = await prisma.billingInvoice.findMany({
      where: {
        societyId,
        status: 'PENDING',
        dueDate: { lt: now },
      },
    });

    const updatedList = [];
    for (const inv of overdueInvoices) {
      const updated = await prisma.billingInvoice.update({
        where: { id: inv.id },
        data: {
          status: 'OVERDUE',
          lateFee: { increment: feeAmount },
          totalAmount: { increment: feeAmount },
        },
      });
      updatedList.push(updated);
    }

    broadcastEvent('BILLING_LATE_FEES_APPLIED', { count: updatedList.length, feeAmount }, societyId);
    res.json({ success: true, assessedCount: updatedList.length, lateFeeAmount: feeAmount });
  } catch (error) {
    res.status(500).json({ error: String(error) });
  }
});

// Parcels
app.get('/api/parcels', requireRole(['resident', 'guard', 'secretary', 'admin']), async (req: Request, res: Response) => {
  try {
    const parcels = await prisma.parcel.findMany({
      where: req.societyId ? { societyId: req.societyId } : undefined,
      include: { flat: true },
      orderBy: { createdAt: 'desc' },
    });
    res.json(parcels);
  } catch (error) {
    res.status(500).json({ error: String(error) });
  }
});

app.post('/api/parcels', requireRole(['guard', 'secretary', 'admin']), async (req: Request, res: Response) => {
  try {
    const parcel = await prisma.parcel.create({
      data: req.body,
    });
    broadcastEvent('PARCEL_ARRIVED', parcel, parcel.societyId);
    broadcastEvent('DELIVERY_STATUS', parcel, parcel.societyId);
    res.status(201).json(parcel);
  } catch (error) {
    res.status(500).json({ error: String(error) });
  }
});

app.patch('/api/parcels/:id/collect', requireRole(['resident', 'guard', 'secretary', 'admin']), async (req: Request, res: Response) => {
  try {
    const id = req.params.id as string;
    const parcel = await prisma.parcel.update({
      where: { id },
      data: {
        status: 'PICKED_UP',
        pickedUpAt: new Date(),
      },
    });
    broadcastEvent('PARCEL_COLLECTED', parcel, parcel.societyId);
    broadcastEvent('DELIVERY_STATUS', parcel, parcel.societyId);
    res.json(parcel);
  } catch (error) {
    res.status(500).json({ error: String(error) });
  }
});

// Staff
app.get('/api/staff', requireRole(['guard', 'secretary', 'facility_manager', 'admin', 'resident']), async (req: Request, res: Response) => {
  try {
    const staff = await prisma.staff.findMany({
      where: req.societyId ? { societyId: req.societyId } : undefined,
      orderBy: { name: 'asc' },
    });
    res.json(staff);
  } catch (error) {
    res.status(500).json({ error: String(error) });
  }
});

app.post('/api/staff', requireRole(['secretary', 'facility_manager', 'admin']), async (req: Request, res: Response) => {
  try {
    const societyId = req.societyId || req.body.societyId || 'soc-gvs';
    const { name, roleCategory, phone, shiftTimings, isPoliceVerified = false } = req.body;
    if (!name || !phone) return res.status(400).json({ error: 'Name and phone are required' });

    const staffMember = await prisma.staff.create({
      data: {
        societyId,
        name,
        roleCategory: roleCategory || 'SECURITY_GUARD',
        phone,
        shiftTimings: shiftTimings || '08:00 - 20:00',
        isPoliceVerified: Boolean(isPoliceVerified),
      },
    });
    broadcastEvent('STAFF_MEMBER_CREATED', staffMember, societyId);
    res.status(201).json(staffMember);
  } catch (error) {
    res.status(500).json({ error: String(error) });
  }
});

app.patch('/api/staff/:id', requireRole(['secretary', 'facility_manager', 'admin']), async (req: Request, res: Response) => {
  try {
    const id = String(req.params.id);
    const updated = await prisma.staff.update({
      where: { id },
      data: req.body,
    });
    broadcastEvent('STAFF_MEMBER_UPDATED', updated, updated.societyId);
    res.json(updated);
  } catch (error) {
    res.status(500).json({ error: String(error) });
  }
});

app.delete('/api/staff/:id', requireRole(['secretary', 'facility_manager', 'admin']), async (req: Request, res: Response) => {
  try {
    const id = String(req.params.id);
    const staff = await prisma.staff.delete({ where: { id } });
    broadcastEvent('STAFF_MEMBER_DELETED', { id }, staff.societyId);
    res.json({ success: true, id });
  } catch (error) {
    res.status(500).json({ error: String(error) });
  }
});

// Domestic Workers
app.get('/api/domestic-workers', requireRole(['resident', 'guard', 'secretary', 'facility_manager', 'admin']), async (req: Request, res: Response) => {
  try {
    const workers = await prisma.domesticWorker.findMany({
      where: req.societyId ? { societyId: req.societyId } : undefined,
      orderBy: { name: 'asc' },
    });
    res.json(workers);
  } catch (error) {
    res.status(500).json({ error: String(error) });
  }
});

app.post('/api/domestic-workers', requireRole(['resident', 'guard', 'secretary', 'facility_manager', 'admin']), async (req: Request, res: Response) => {
  try {
    const societyId = req.societyId || req.body.societyId || 'soc-gvs';
    const { name, profession, phone, associatedFlats = [], passcode, isPoliceVerified = true } = req.body;
    if (!name || !phone) return res.status(400).json({ error: 'Name and phone are required' });

    const worker = await prisma.domesticWorker.create({
      data: {
        societyId,
        name,
        profession: profession || 'House Maid',
        phone,
        associatedFlats: Array.isArray(associatedFlats) ? associatedFlats : [associatedFlats],
        passcode: passcode || String(Math.floor(1000 + Math.random() * 9000)),
        isPoliceVerified: Boolean(isPoliceVerified),
      },
    });
    broadcastEvent('DOMESTIC_WORKER_CREATED', worker, societyId);
    res.status(201).json(worker);
  } catch (error) {
    res.status(500).json({ error: String(error) });
  }
});

app.patch('/api/domestic-workers/:id', requireRole(['resident', 'guard', 'secretary', 'facility_manager', 'admin']), async (req: Request, res: Response) => {
  try {
    const id = String(req.params.id);
    const updated = await prisma.domesticWorker.update({
      where: { id },
      data: req.body,
    });
    broadcastEvent('DOMESTIC_WORKER_UPDATED', updated, updated.societyId);
    res.json(updated);
  } catch (error) {
    res.status(500).json({ error: String(error) });
  }
});

app.delete('/api/domestic-workers/:id', requireRole(['secretary', 'facility_manager', 'admin']), async (req: Request, res: Response) => {
  try {
    const id = String(req.params.id);
    const worker = await prisma.domesticWorker.delete({ where: { id } });
    broadcastEvent('DOMESTIC_WORKER_DELETED', { id }, worker.societyId);
    res.json({ success: true, id });
  } catch (error) {
    res.status(500).json({ error: String(error) });
  }
});

// Vendors
app.get('/api/vendors', requireRole(['resident', 'secretary', 'facility_manager', 'admin', 'vendor', 'committee']), async (req: Request, res: Response) => {
  try {
    const societyId = (req.query.societyId as string) || req.societyId || 'soc-gvs';
    const category = req.query.category as string | undefined;
    const where: any = { societyId };
    if (category && category !== 'ALL') where.serviceType = category;

    const vendors = await prisma.vendor.findMany({
      where,
      include: { advertisements: true },
      orderBy: { rating: 'desc' },
    });
    res.json(vendors);
  } catch (error) {
    res.status(500).json({ error: String(error) });
  }
});

app.post('/api/vendors', requireRole(['secretary', 'admin', 'committee', 'facility_manager']), async (req: Request, res: Response) => {
  try {
    const {
      societyId = req.societyId || 'soc-gvs',
      businessName,
      companyName,
      contactPerson,
      serviceType,
      category,
      phone,
      email,
      gstNumber,
      documentUrl,
      logoUrl,
    } = req.body;

    const resolvedName = businessName || companyName;
    const resolvedType = serviceType || category || 'GENERAL_MAINTENANCE';

    if (!resolvedName || !phone) {
      return res.status(400).json({ error: 'businessName and phone are required' });
    }

    const vendor = await prisma.vendor.create({
      data: {
        societyId,
        businessName: resolvedName,
        contactPerson: contactPerson || resolvedName,
        serviceType: resolvedType,
        phone,
        email,
        gstNumber,
        documentUrl,
        logoUrl,
        status: 'ACTIVE',
      },
    });

    broadcastEvent('VENDOR_REGISTERED', vendor, societyId);
    res.status(201).json(vendor);
  } catch (error) {
    res.status(500).json({ error: String(error) });
  }
});

app.patch('/api/vendors/:id', requireRole(['secretary', 'admin', 'committee', 'facility_manager']), async (req: Request, res: Response) => {
  try {
    const id = String(req.params.id);
    const vendor = await prisma.vendor.update({
      where: { id },
      data: req.body,
    });
    broadcastEvent('VENDOR_UPDATED', vendor, vendor.societyId);
    res.json(vendor);
  } catch (error) {
    res.status(500).json({ error: String(error) });
  }
});

app.delete('/api/vendors/:id', requireRole(['secretary', 'admin', 'committee']), async (req: Request, res: Response) => {
  try {
    const id = String(req.params.id);
    const vendor = await prisma.vendor.delete({ where: { id } });
    broadcastEvent('VENDOR_DELETED', { id }, vendor.societyId);
    res.json({ success: true, id });
  } catch (error) {
    res.status(500).json({ error: String(error) });
  }
});

// Amenities
app.get('/api/amenities', async (req: Request, res: Response) => {
  try {
    const amenities = await prisma.amenity.findMany({
      where: req.societyId ? { societyId: req.societyId } : undefined,
      orderBy: { name: 'asc' },
    });
    res.json(amenities);
  } catch (error) {
    res.status(500).json({ error: String(error) });
  }
});

app.post('/api/amenities', requireRole(['secretary', 'admin', 'facility_manager']), async (req: Request, res: Response) => {
  try {
    const societyId = req.societyId || req.body.societyId || 'soc-gvs';
    const { name, category, capacityPerSlot = 10, slotDurationMinutes = 60, hourlyCharge = 0, requiresApproval = false, rulesText } = req.body;
    if (!name) return res.status(400).json({ error: 'Amenity name is required' });

    const amenity = await prisma.amenity.create({
      data: {
        societyId,
        name,
        category: category || 'SPORTS',
        capacityPerSlot: Number(capacityPerSlot) || 10,
        slotDurationMinutes: Number(slotDurationMinutes) || 60,
        hourlyCharge: Number(hourlyCharge) || 0,
        requiresApproval: Boolean(requiresApproval),
        rulesText,
      },
    });

    broadcastEvent('AMENITY_CREATED', amenity, societyId);
    res.status(201).json(amenity);
  } catch (error) {
    res.status(500).json({ error: String(error) });
  }
});

app.patch('/api/amenities/:id', requireRole(['secretary', 'admin', 'facility_manager']), async (req: Request, res: Response) => {
  try {
    const id = String(req.params.id);
    const amenity = await prisma.amenity.update({
      where: { id },
      data: req.body,
    });
    broadcastEvent('AMENITY_UPDATED', amenity, amenity.societyId);
    res.json(amenity);
  } catch (error) {
    res.status(500).json({ error: String(error) });
  }
});

app.delete('/api/amenities/:id', requireRole(['secretary', 'admin']), async (req: Request, res: Response) => {
  try {
    const id = String(req.params.id);
    const amenity = await prisma.amenity.delete({ where: { id } });
    broadcastEvent('AMENITY_DELETED', { id }, amenity.societyId);
    res.json({ success: true, id });
  } catch (error) {
    res.status(500).json({ error: String(error) });
  }
});

// Amenity Slot Availability (PostgreSQL Source of Truth)
app.get('/api/amenities/:id/availability', async (req: Request, res: Response) => {
  try {
    const amenityId = String(req.params.id);
    const date = String(req.query.date || new Date().toISOString().substring(0, 10));
    const societyId = req.societyId || (req.query.societyId as string) || 'soc-gvs';

    // 1. Get amenity capacity & hours
    let amenity = await prisma.amenity.findUnique({ where: { id: amenityId } });
    let capacityPerSlot = amenity?.capacityPerSlot || 10;
    let openTime = (amenity as any)?.openTime || '06:00';
    let closeTime = (amenity as any)?.closeTime || '22:00';
    let slotDurationMinutes = amenity?.slotDurationMinutes || 60;
    let amenityName = amenity?.name || 'Amenity Facility';

    if (!amenity) {
      // Fallback to EntityRecord
      const entityRec = await prisma.entityRecord.findUnique({ where: { id: amenityId } }).catch(() => null);
      if (entityRec && entityRec.data) {
        const d = entityRec.data as any;
        capacityPerSlot = d.capacityPerSlot || 10;
        openTime = d.openTime || '06:00';
        closeTime = d.closeTime || '22:00';
        slotDurationMinutes = d.slotDurationMinutes || 60;
        amenityName = d.name || 'Amenity Facility';
      }
    }

    // 2. Fetch existing active bookings for this amenity & date from entityRecord
    const bookingRecords = await prisma.entityRecord.findMany({
      where: {
        collection: 'amenityBookings',
        societyId: societyId !== 'all' ? societyId : undefined,
      },
    });

    const activeBookings = bookingRecords
      .map((r) => r.data as any)
      .filter((b) => {
        if (!b || b.amenityId !== amenityId) return false;
        if (b.bookingDate !== date && b.date !== date) return false;
        const status = (b.status || '').toUpperCase();
        return status === 'CONFIRMED' || status === 'APPROVED' || status === 'PENDING';
      });

    // 3. Generate time slots
    const slots = [];
    let currentMin = parseTimeToMinutes(openTime);
    const closeMin = parseTimeToMinutes(closeTime);

    while (currentMin + slotDurationMinutes <= closeMin) {
      const startTime = formatMinutesToTime(currentMin);
      const endTime = formatMinutesToTime(currentMin + slotDurationMinutes);

      // Sum guest count of overlapping bookings
      let bookedCount = 0;
      for (const bk of activeBookings) {
        const bkStart = bk.startTime || '00:00';
        const bkEnd = bk.endTime || '23:59';
        // Overlap: startTime < bkEnd AND endTime > bkStart
        if (startTime < bkEnd && endTime > bkStart) {
          bookedCount += Number(bk.guestCount || bk.attendeesCount || 1);
        }
      }

      const remainingSpots = Math.max(0, capacityPerSlot - bookedCount);
      const status = remainingSpots === 0 ? 'FULL' : remainingSpots <= 2 ? 'LIMITED' : 'AVAILABLE';

      slots.push({
        startTime,
        endTime,
        bookedCount,
        capacity: capacityPerSlot,
        remainingSpots,
        status,
      });

      currentMin += slotDurationMinutes;
    }

    res.json({
      amenityId,
      amenityName,
      date,
      capacityPerSlot,
      openTime,
      closeTime,
      slotDurationMinutes,
      slots,
    });
  } catch (error) {
    res.status(500).json({ error: String(error) });
  }
});

// Atomic Server-Side Amenity Booking Endpoint
app.post('/api/amenities/:id/book', requireRole(['resident', 'secretary', 'admin', 'committee']), async (req: Request, res: Response) => {
  try {
    const amenityId = String(req.params.id);
    const societyId = req.societyId || req.body.societyId || 'soc-gvs';
    const {
      residentId = 'user-resident-01',
      residentName = 'Resident',
      flatNumber = 'A-101',
      bookingDate,
      startTime,
      endTime,
      guestCount = 1,
      purpose = '',
      bookingFee = 0,
      paymentStatus = 'FREE',
      paymentId,
    } = req.body;

    if (!bookingDate || !startTime || !endTime) {
      return res.status(400).json({ error: 'Missing required booking fields: bookingDate, startTime, endTime' });
    }

    const requestedPax = Number(guestCount) || 1;

    // 1. Fetch Amenity Capacity & Policy
    let amenity = await prisma.amenity.findUnique({ where: { id: amenityId } });
    let capacityPerSlot = amenity?.capacityPerSlot || 10;
    let requiresApproval = amenity?.requiresApproval || false;
    let amenityName = amenity?.name || 'Amenity Facility';

    if (!amenity) {
      const entityRec = await prisma.entityRecord.findUnique({ where: { id: amenityId } }).catch(() => null);
      if (entityRec && entityRec.data) {
        const d = entityRec.data as any;
        capacityPerSlot = d.capacityPerSlot || 10;
        requiresApproval = d.requiresApproval || false;
        amenityName = d.name || 'Amenity Facility';
      }
    }

    // 2. Query active bookings for overlap check in PostgreSQL
    const existingRecords = await prisma.entityRecord.findMany({
      where: {
        collection: 'amenityBookings',
        societyId,
      },
    });

    const activeBookings = existingRecords
      .map((r) => r.data as any)
      .filter((b) => {
        if (!b || b.amenityId !== amenityId) return false;
        if (b.bookingDate !== bookingDate && b.date !== bookingDate) return false;
        const status = (b.status || '').toUpperCase();
        return status === 'CONFIRMED' || status === 'APPROVED' || status === 'PENDING';
      });

    let currentOccupancy = 0;
    for (const bk of activeBookings) {
      const bkStart = bk.startTime || '00:00';
      const bkEnd = bk.endTime || '23:59';
      if (startTime < bkEnd && endTime > bkStart) {
        currentOccupancy += Number(bk.guestCount || bk.attendeesCount || 1);
      }
    }

    // 3. Strict Capacity Validation
    if (currentOccupancy + requestedPax > capacityPerSlot) {
      const remainingSpots = Math.max(0, capacityPerSlot - currentOccupancy);
      return res.status(400).json({
        error: remainingSpots > 0
          ? `Only ${remainingSpots} spot(s) available for ${startTime} - ${endTime}. Requested ${requestedPax} spot(s).`
          : `The ${startTime} - ${endTime} slot is fully booked. Please select another time or date.`,
        remainingSpots,
        capacityPerSlot,
      });
    }

    // 4. Create Booking
    const bookingId = `bk-${Date.now()}-${Math.random().toString(36).substring(2, 6)}`;
    const status = requiresApproval ? 'PENDING' : 'CONFIRMED';
    const newBooking = {
      id: bookingId,
      societyId,
      amenityId,
      amenityName,
      residentId,
      residentName,
      flatNumber,
      bookingDate,
      startTime,
      endTime,
      guestCount: requestedPax,
      purpose,
      bookingFee: Number(bookingFee) || 0,
      paymentStatus,
      paymentId,
      status,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };

    await prisma.entityRecord.create({
      data: {
        id: bookingId,
        collection: 'amenityBookings',
        societyId,
        data: newBooking,
      },
    });

    // 5. Broadcast Realtime Updates
    broadcastEvent('AMENITY_BOOKED', newBooking, societyId);
    broadcastEvent('AMENITY_AVAILABILITY_CHANGED', { amenityId, bookingDate, startTime, endTime }, societyId);

    return res.status(201).json(newBooking);
  } catch (error) {
    return res.status(500).json({ error: String(error) });
  }
});

// Cancel Booking Endpoint
app.post('/api/amenities/bookings/:id/cancel', requireRole(['resident', 'secretary', 'admin', 'committee']), async (req: Request, res: Response) => {
  try {
    const bookingId = String(req.params.id);
    const societyId = req.societyId || req.body.societyId || 'soc-gvs';

    const record = await prisma.entityRecord.findUnique({ where: { id: bookingId } });
    if (!record) {
      return res.status(404).json({ error: 'Booking not found' });
    }

    const dataObj = (record.data as any) || {};
    dataObj.status = 'CANCELLED';
    dataObj.updatedAt = new Date().toISOString();

    await prisma.entityRecord.update({
      where: { id: bookingId },
      data: { data: dataObj },
    });

    broadcastEvent('AMENITY_BOOKED', dataObj, societyId);
    broadcastEvent('AMENITY_AVAILABILITY_CHANGED', { amenityId: dataObj.amenityId, bookingDate: dataObj.bookingDate }, societyId);

    return res.json(dataObj);
  } catch (error) {
    return res.status(500).json({ error: String(error) });
  }
});

// Helper functions for time calculations
function parseTimeToMinutes(tStr: string): number {
  if (!tStr) return 0;
  const parts = tStr.split(':').map(Number);
  return (parts[0] || 0) * 60 + (parts[1] || 0);
}

function formatMinutesToTime(mins: number): string {
  const h = Math.floor(mins / 60);
  const m = mins % 60;
  return `${String(h).padStart(2, '0')}:${String(m).padStart(2, '0')}`;
}

// Announcements
app.get('/api/announcements', async (req: Request, res: Response) => {
  try {
    const announcements = await prisma.announcement.findMany({
      where: req.societyId ? { societyId: req.societyId } : undefined,
      orderBy: { publishedAt: 'desc' },
    });
    res.json(announcements);
  } catch (error) {
    res.status(500).json({ error: String(error) });
  }
});

app.post('/api/announcements', requireRole(['secretary', 'admin', 'committee']), async (req: Request, res: Response) => {
  try {
    const announcement = await prisma.announcement.create({
      data: req.body,
    });
    broadcastEvent('ANNOUNCEMENT_CREATED', announcement, announcement.societyId);
    res.status(201).json(announcement);
  } catch (error) {
    res.status(500).json({ error: String(error) });
  }
});

app.delete('/api/announcements/:id', requireRole(['secretary', 'admin', 'committee']), async (req: Request, res: Response) => {
  try {
    const id = String(req.params.id);
    const ann = await prisma.announcement.delete({ where: { id } });
    broadcastEvent('ANNOUNCEMENT_DELETED', { id }, ann.societyId);
    res.json({ success: true, id });
  } catch (error) {
    res.status(500).json({ error: String(error) });
  }
});

// Community Events
app.get('/api/community-events', async (req: Request, res: Response) => {
  try {
    const events = await prisma.communityEvent.findMany({
      where: req.societyId ? { societyId: req.societyId } : undefined,
      orderBy: { startDate: 'asc' },
    });
    res.json(events);
  } catch (error) {
    res.status(500).json({ error: String(error) });
  }
});

app.post('/api/community-events', requireRole(['secretary', 'admin', 'committee']), async (req: Request, res: Response) => {
  try {
    const event = await prisma.communityEvent.create({
      data: req.body,
    });
    broadcastEvent('COMMUNITY_EVENT_CREATED', event, event.societyId);
    res.status(201).json(event);
  } catch (error) {
    res.status(500).json({ error: String(error) });
  }
});

app.patch('/api/community-events/:id', requireRole(['secretary', 'admin', 'committee']), async (req: Request, res: Response) => {
  try {
    const id = String(req.params.id);
    const event = await prisma.communityEvent.update({
      where: { id },
      data: req.body,
    });
    broadcastEvent('COMMUNITY_EVENT_UPDATED', event, event.societyId);
    res.json(event);
  } catch (error) {
    res.status(500).json({ error: String(error) });
  }
});

app.delete('/api/community-events/:id', requireRole(['secretary', 'admin', 'committee']), async (req: Request, res: Response) => {
  try {
    const id = String(req.params.id);
    const event = await prisma.communityEvent.delete({ where: { id } });
    broadcastEvent('COMMUNITY_EVENT_DELETED', { id }, event.societyId);
    res.json({ success: true, id });
  } catch (error) {
    res.status(500).json({ error: String(error) });
  }
});

app.post('/api/community-events/:id/rsvp', requireRole(['resident', 'secretary', 'admin', 'committee']), async (req: Request, res: Response) => {
  try {
    const id = String(req.params.id);
    const event = await prisma.communityEvent.update({
      where: { id },
      data: { rsvpCount: { increment: 1 } },
    });
    broadcastEvent('COMMUNITY_EVENT_RSVP', { eventId: id, rsvpCount: event.rsvpCount }, event.societyId);
    res.json({ success: true, rsvpCount: event.rsvpCount });
  } catch (error) {
    res.status(500).json({ error: String(error) });
  }
});

// Emergency Incidents
app.get('/api/emergency-incidents', async (req: Request, res: Response) => {
  try {
    const incidents = await prisma.emergencyIncident.findMany({
      where: req.societyId ? { societyId: req.societyId } : undefined,
      orderBy: { createdAt: 'desc' },
    });
    res.json(incidents);
  } catch (error) {
    res.status(500).json({ error: String(error) });
  }
});

app.post('/api/emergency-incidents', requireRole(['resident', 'guard', 'secretary', 'admin']), async (req: Request, res: Response) => {
  try {
    const incident = await prisma.emergencyIncident.create({
      data: req.body,
    });
    broadcastEvent('EMERGENCY_ALERTS', incident, incident.societyId);
    res.status(201).json(incident);
  } catch (error) {
    res.status(500).json({ error: String(error) });
  }
});

app.patch('/api/emergency-incidents/:id/resolve', requireRole(['guard', 'secretary', 'admin']), async (req: Request, res: Response) => {
  try {
    const id = String(req.params.id);
    const incident = await prisma.emergencyIncident.update({
      where: { id },
      data: {
        dispatchStatus: 'RESOLVED',
        resolvedAt: new Date(),
      },
    });
    broadcastEvent('EMERGENCY_INCIDENT_RESOLVED', incident, incident.societyId);
    res.json(incident);
  } catch (error) {
    res.status(500).json({ error: String(error) });
  }
});

// Notifications
app.get('/api/notifications', async (req: Request, res: Response) => {
  try {
    const limit = Math.min(Number(req.query.limit) || 50, 100);
    const offset = Number(req.query.offset) || 0;
    const notifications = await prisma.notification.findMany({
      where: req.societyId ? { societyId: req.societyId } : undefined,
      orderBy: { createdAt: 'desc' },
      take: limit,
      skip: offset,
    });
    res.json(notifications);
  } catch (error) {
    res.status(500).json({ error: String(error) });
  }
});

app.post('/api/notifications', requireRole(['secretary', 'admin', 'guard', 'committee']), async (req: Request, res: Response) => {
  try {
    const notif = await prisma.notification.create({
      data: req.body,
    });
    broadcastEvent('NOTIFICATIONS', notif, notif.societyId);
    res.status(201).json(notif);
  } catch (error) {
    res.status(500).json({ error: String(error) });
  }
});

app.patch('/api/notifications/:id/read', async (req: Request, res: Response) => {
  try {
    const notif = await prisma.notification.update({
      where: { id: String(req.params.id) },
      data: { isRead: true, readAt: new Date() },
    });
    broadcastEvent('NOTIFICATIONS_READ', notif, notif.societyId);
    res.json(notif);
  } catch (error) {
    res.status(500).json({ error: String(error) });
  }
});

// Audit Logs API
app.get('/api/audit-logs', requireRole(['secretary', 'admin', 'committee']), async (req: Request, res: Response) => {
  try {
    const societyId = req.societyId || (req.query.societyId as string) || 'soc-gvs';
    const limit = Math.min(Number(req.query.limit) || 100, 200);
    const offset = Number(req.query.offset) || 0;
    const logs = await prisma.auditLog.findMany({
      where: societyId !== 'all' ? { societyId } : undefined,
      orderBy: { timestamp: 'desc' },
      take: limit,
      skip: offset,
      include: { actor: true },
    });
    res.json(logs);
  } catch (error) {
    res.status(500).json({ error: String(error) });
  }
});

// ==========================================
// 🚀 SAFEGATE 2.0: UNIVERSAL PROVISIONING
// ==========================================
app.post('/api/admin/provision-society', async (req: Request, res: Response) => {
  try {
    const result = await UniversalProvisioningService.provisionSociety(req.body);
    res.status(201).json(result);
  } catch (error: any) {
    res.status(400).json({ error: error?.message || 'Provisioning failed' });
  }
});

app.post('/api/secretary/provision-user', async (req: Request, res: Response) => {
  try {
    const societyId = req.societyId || req.body.societyId;
    if (!societyId) {
      return res.status(400).json({ error: 'Society ID context is required' });
    }
    const result = await UniversalProvisioningService.provisionUser({
      ...req.body,
      societyId,
      creatorId: req.userId || 'secretary',
    });
    res.status(201).json(result);
  } catch (error: any) {
    res.status(400).json({ error: error?.message || 'User provisioning failed' });
  }
});


// ==========================================
// ⭐ SAFEGATE 2.0: ADVANCED DIFFERENTIATORS
// ==========================================

// Trust Score API
app.get('/api/trust-score/:entityType/:entityId', async (req: Request, res: Response) => {
  try {
    const entityType = String(req.params.entityType || '');
    const entityId = String(req.params.entityId || '');
    const societyId = req.societyId || (req.query.societyId as string) || 'soc-gvs';
    if (entityType.toUpperCase() === 'SOCIETY') {
      const score = await TrustScoreService.calculateSocietyTrustScore(societyId);
      return res.json(score);
    }
    const score = await TrustScoreService.calculateResidentTrustScore(societyId, entityId);
    res.json(score);
  } catch (error: any) {
    res.status(500).json({ error: error?.message });
  }
});

// Society Ledger Wallet API
app.get('/api/wallet/balance/:residentId', async (req: Request, res: Response) => {
  try {
    const residentId = String(req.params.residentId || '');
    const societyId = req.societyId || (req.query.societyId as string) || 'soc-gvs';
    const balance = await WalletService.getBalance(societyId, residentId);
    res.json({ residentId, balance, currency: 'INR' });
  } catch (error: any) {
    res.status(500).json({ error: error?.message });
  }
});

app.post('/api/wallet/transaction', async (req: Request, res: Response) => {
  try {
    const societyId = req.societyId || req.body.societyId || 'soc-gvs';
    const tx = await WalletService.executeTransaction({
      ...req.body,
      societyId,
    });
    res.status(201).json(tx);
  } catch (error: any) {
    res.status(400).json({ error: error?.message });
  }
});

// Federation Marketplace API
app.get('/api/marketplace/federated-vendors', async (req: Request, res: Response) => {
  try {
    const societyId = req.societyId || (req.query.societyId as string) || 'soc-gvs';
    const category = req.query.category as string | undefined;
    const vendors = await FederationMarketplaceService.getFederatedVendors(societyId, category);
    res.json(vendors);
  } catch (error: any) {
    res.status(500).json({ error: error?.message });
  }
});

// AI Governance Check API
app.post('/api/ai/governance-check', (req: Request, res: Response) => {
  try {
    const { action, actorType, userRole } = req.body;
    const check = AIGovernancePolicyEngine.evaluateAction(action, actorType, userRole || req.userRole);
    res.json(check);
  } catch (error: any) {
    res.status(400).json({ error: error?.message });
  }
});

// SafeGate 2.0 Work Orders & Facility Operations
app.get('/api/work-orders', async (req: Request, res: Response) => {
  try {
    const societyId = req.societyId || (req.query.societyId as string);
    const orders = await prisma.workOrder.findMany({
      where: societyId ? { societyId } : undefined,
      orderBy: { createdAt: 'desc' },
    });
    res.json(orders);
  } catch (error: any) {
    res.status(500).json({ error: error?.message });
  }
});

app.post('/api/work-orders', requireRole(['facility_manager', 'secretary', 'admin']), async (req: Request, res: Response) => {
  try {
    const order = await prisma.workOrder.create({ data: req.body });
    await realtimeEngine.recordOutboxEvent({
      societyId: order.societyId,
      eventType: 'WORK_ORDER_ASSIGNED',
      entityId: order.id,
      payload: order,
    });
    res.status(201).json(order);
  } catch (error: any) {
    res.status(400).json({ error: error?.message });
  }
});

app.patch('/api/work-orders/:id', requireRole(['facility_manager', 'secretary', 'admin', 'vendor']), async (req: Request, res: Response) => {
  try {
    const id = String(req.params.id);
    const updated = await prisma.workOrder.update({
      where: { id },
      data: req.body,
    });
    broadcastEvent('WORK_ORDER_UPDATED', updated, updated.societyId);
    res.json(updated);
  } catch (error: any) {
    res.status(500).json({ error: error?.message });
  }
});

// Staff Attendance
app.get('/api/attendance', async (req: Request, res: Response) => {
  try {
    const societyId = req.societyId || (req.query.societyId as string);
    const records = await prisma.attendance.findMany({
      where: societyId ? { societyId } : undefined,
      orderBy: { checkIn: 'desc' },
      take: 50,
    });
    res.json(records);
  } catch (error: any) {
    res.status(500).json({ error: error?.message });
  }
});

app.post('/api/attendance/check-in', requireRole(['guard', 'facility_manager', 'secretary', 'admin']), async (req: Request, res: Response) => {
  try {
    const att = await prisma.attendance.create({ data: req.body });
    await realtimeEngine.recordOutboxEvent({
      societyId: att.societyId,
      eventType: 'STAFF_ATTENDANCE_LOGGED',
      entityId: att.id,
      payload: att,
    });
    res.status(201).json(att);
  } catch (error: any) {
    res.status(400).json({ error: error?.message });
  }
});

// Compliance Documents
app.get('/api/compliance-documents', async (req: Request, res: Response) => {
  try {
    const societyId = req.societyId || (req.query.societyId as string);
    const docs = await prisma.complianceDocument.findMany({
      where: societyId ? { societyId } : undefined,
      orderBy: { createdAt: 'desc' },
    });
    res.json(docs);
  } catch (error: any) {
    res.status(500).json({ error: error?.message });
  }
});

app.post('/api/compliance-documents', requireRole(['facility_manager', 'secretary', 'admin', 'committee']), async (req: Request, res: Response) => {
  try {
    const doc = await prisma.complianceDocument.create({ data: req.body });
    broadcastEvent('COMPLIANCE_DOC_UPLOADED', doc, doc.societyId);
    res.status(201).json(doc);
  } catch (error: any) {
    res.status(400).json({ error: error?.message });
  }
});

app.patch('/api/compliance-documents/:id', requireRole(['facility_manager', 'secretary', 'admin', 'committee']), async (req: Request, res: Response) => {
  try {
    const id = String(req.params.id);
    const updated = await prisma.complianceDocument.update({
      where: { id },
      data: req.body,
    });
    broadcastEvent('COMPLIANCE_DOC_UPDATED', updated, updated.societyId);
    res.json(updated);
  } catch (error: any) {
    res.status(500).json({ error: error?.message });
  }
});

app.delete('/api/compliance-documents/:id', requireRole(['secretary', 'admin', 'committee']), async (req: Request, res: Response) => {
  try {
    const id = String(req.params.id);
    const doc = await prisma.complianceDocument.delete({ where: { id } });
    broadcastEvent('COMPLIANCE_DOC_DELETED', { id }, doc.societyId);
    res.json({ success: true, id });
  } catch (error: any) {
    res.status(500).json({ error: error?.message });
  }
});

// Move Requests & Concierge
app.get('/api/move-requests', async (req: Request, res: Response) => {
  try {
    const societyId = req.societyId || (req.query.societyId as string);
    const moves = await prisma.moveRequest.findMany({
      where: societyId ? { societyId } : undefined,
      orderBy: { scheduledDate: 'asc' },
    });
    res.json(moves);
  } catch (error: any) {
    res.status(500).json({ error: error?.message });
  }
});

app.post('/api/move-requests', requireRole(['resident', 'secretary', 'admin']), async (req: Request, res: Response) => {
  try {
    const move = await prisma.moveRequest.create({ data: req.body });
    broadcastEvent('MOVE_REQUEST_CREATED', move, move.societyId);
    res.status(201).json(move);
  } catch (error: any) {
    res.status(400).json({ error: error?.message });
  }
});

app.patch('/api/move-requests/:id', requireRole(['secretary', 'admin', 'committee', 'guard']), async (req: Request, res: Response) => {
  try {
    const id = String(req.params.id);
    const updated = await prisma.moveRequest.update({
      where: { id },
      data: req.body,
    });
    broadcastEvent('MOVE_REQUEST_UPDATED', updated, updated.societyId);
    res.json(updated);
  } catch (error: any) {
    res.status(500).json({ error: error?.message });
  }
});

// Renovation Requests API
app.get('/api/renovation-requests', async (req: Request, res: Response) => {
  try {
    const societyId = req.societyId || (req.query.societyId as string) || 'soc-gvs';
    const renovations = await prisma.renovationRequest.findMany({
      where: societyId !== 'all' ? { societyId } : undefined,
      orderBy: { createdAt: 'desc' },
    });
    res.json(renovations);
  } catch (error: any) {
    res.status(500).json({ error: error?.message });
  }
});

app.post('/api/renovation-requests', requireRole(['resident', 'secretary', 'admin']), async (req: Request, res: Response) => {
  try {
    const renovation = await prisma.renovationRequest.create({ data: req.body });
    broadcastEvent('RENOVATION_REQUEST_CREATED', renovation, renovation.societyId);
    res.status(201).json(renovation);
  } catch (error: any) {
    res.status(400).json({ error: error?.message });
  }
});

app.patch('/api/renovation-requests/:id', requireRole(['secretary', 'admin', 'committee']), async (req: Request, res: Response) => {
  try {
    const id = String(req.params.id);
    const updated = await prisma.renovationRequest.update({
      where: { id },
      data: req.body,
    });
    broadcastEvent('RENOVATION_REQUEST_UPDATED', updated, updated.societyId);
    res.json(updated);
  } catch (error: any) {
    res.status(500).json({ error: error?.message });
  }
});

// Facility AMC Contracts API
app.get('/api/facility/amc', requireRole(['facility_manager', 'secretary', 'admin', 'committee', 'vendor']), async (req: Request, res: Response) => {
  try {
    const societyId = req.societyId || (req.query.societyId as string) || 'soc-gvs';
    const contracts = await prisma.aMCContract.findMany({
      where: societyId !== 'all' ? { societyId } : undefined,
      orderBy: { startDate: 'desc' },
    });
    res.json(contracts);
  } catch (error: any) {
    res.status(500).json({ error: error?.message });
  }
});

app.post('/api/facility/amc', requireRole(['facility_manager', 'secretary', 'admin']), async (req: Request, res: Response) => {
  try {
    const societyId = req.societyId || req.body.societyId || 'soc-gvs';
    const contract = await prisma.aMCContract.create({
      data: {
        ...req.body,
        societyId,
        startDate: new Date(req.body.startDate || Date.now()),
        endDate: new Date(req.body.endDate || Date.now() + 365 * 86400000),
      },
    });
    broadcastEvent('AMC_CONTRACT_CREATED', contract, societyId);
    res.status(201).json(contract);
  } catch (error: any) {
    res.status(400).json({ error: error?.message });
  }
});

app.patch('/api/facility/amc/:id', requireRole(['facility_manager', 'secretary', 'admin']), async (req: Request, res: Response) => {
  try {
    const id = String(req.params.id);
    const updated = await prisma.aMCContract.update({
      where: { id },
      data: req.body,
    });
    broadcastEvent('AMC_CONTRACT_UPDATED', updated, updated.societyId);
    res.json(updated);
  } catch (error: any) {
    res.status(500).json({ error: error?.message });
  }
});

// ==========================================
// 🛡️ CHILD SAFETY & BIOMETRIC GATE RADAR
// ==========================================
app.get('/api/children', async (req: Request, res: Response) => {
  try {
    const societyId = req.societyId || (req.query.societyId as string) || 'soc-gvs';
    const residentId = req.userId || (req.query.residentId as string);
    const where: any = { collection: 'child_profiles' };
    if (societyId && societyId !== 'all') where.societyId = societyId;
    const records = await prisma.entityRecord.findMany({ where, orderBy: { createdAt: 'desc' } });
    const children = records.map((r) => ({ id: r.id, societyId: r.societyId, ...(r.data as any), createdAt: r.createdAt }));
    const filtered = residentId && req.userRole === 'resident' ? children.filter((c: any) => c.residentId === residentId) : children;
    res.json(filtered);
  } catch (error) {
    res.status(500).json({ error: String(error) });
  }
});

app.post('/api/children', requireRole(['resident', 'secretary', 'admin']), async (req: Request, res: Response) => {
  try {
    const societyId = req.societyId || req.body.societyId || 'soc-gvs';
    const id = req.body.id || `child_${Date.now()}`;
    const childData = {
      ...req.body,
      id,
      societyId,
      gatePassCode: req.body.gatePassCode || `PASS-${Math.floor(1000 + Math.random() * 9000)}`,
      createdAt: new Date().toISOString(),
    };
    await prisma.entityRecord.create({
      data: {
        id,
        collection: 'child_profiles',
        societyId,
        data: childData,
      },
    });
    broadcastEvent('CHILD_PROFILE_CREATED', childData, societyId);
    res.status(201).json(childData);
  } catch (error) {
    res.status(500).json({ error: String(error) });
  }
});

app.get('/api/children/passes', async (req: Request, res: Response) => {
  try {
    const societyId = req.societyId || (req.query.societyId as string) || 'soc-gvs';
    const records = await prisma.entityRecord.findMany({
      where: { collection: 'child_gate_passes', societyId: societyId !== 'all' ? societyId : undefined },
      orderBy: { createdAt: 'desc' },
    });
    const passes = records.map((r) => ({ id: r.id, societyId: r.societyId, ...(r.data as any), createdAt: r.createdAt }));
    res.json(passes);
  } catch (error) {
    res.status(500).json({ error: String(error) });
  }
});

app.post('/api/children/passes', requireRole(['resident', 'secretary', 'admin']), async (req: Request, res: Response) => {
  try {
    const societyId = req.societyId || req.body.societyId || 'soc-gvs';
    const id = req.body.id || `cpass_${Date.now()}`;
    const passData = {
      ...req.body,
      id,
      societyId,
      status: 'ACTIVE',
      passCode: req.body.passCode || `CGP-${Math.floor(100000 + Math.random() * 900000)}`,
      validUntil: req.body.validUntil || new Date(Date.now() + 4 * 60 * 60 * 1000).toISOString(),
      createdAt: new Date().toISOString(),
    };
    await prisma.entityRecord.create({
      data: {
        id,
        collection: 'child_gate_passes',
        societyId,
        data: passData,
      },
    });
    broadcastEvent('CHILD_GATE_PASS_GENERATED', passData, societyId);
    res.status(201).json(passData);
  } catch (error) {
    res.status(500).json({ error: String(error) });
  }
});

app.post('/api/children/passes/:id/verify', requireRole(['guard', 'secretary', 'admin']), async (req: Request, res: Response) => {
  try {
    const id = String(req.params.id);
    const { guardName, gate } = req.body;
    const record = await prisma.entityRecord.findUnique({ where: { id } });
    if (!record) return res.status(404).json({ error: 'Child pass not found' });
    const updatedData = {
      ...(record.data as any),
      status: 'VERIFIED_EXITED',
      verifiedAt: new Date().toISOString(),
      verifiedByGuard: guardName || 'Gate Guard',
      exitGate: gate || 'Main Gate',
    };
    await prisma.entityRecord.update({
      where: { id },
      data: { data: updatedData, updatedAt: new Date() },
    });
    broadcastEvent('CHILD_GATE_PASS_VERIFIED', updatedData, record.societyId);
    res.json(updatedData);
  } catch (error) {
    res.status(500).json({ error: String(error) });
  }
});

app.post('/api/children/sos', async (req: Request, res: Response) => {
  try {
    const societyId = req.societyId || req.body.societyId || 'soc-gvs';
    const incident = await prisma.emergencyIncident.create({
      data: {
        societyId,
        incidentType: 'CHILD_SAFETY',
        severity: 'CRITICAL',
        location: req.body.location || 'Society Premises',
        description: req.body.description || `CHILD MISSING / UNATTENDED ALERT: ${req.body.childName || 'Child'}`,
        dispatchStatus: 'DISPATCHED',
      },
    });
    broadcastEvent('EMERGENCY_INCIDENT_CREATED', incident, societyId);
    broadcastEvent('CHILD_SAFETY_SOS_TRIGGERED', { ...req.body, incidentId: incident.id }, societyId);
    res.status(201).json(incident);
  } catch (error) {
    res.status(500).json({ error: String(error) });
  }
});

// ==========================================
// 🚗 QR PARKING & VEHICLE ACCESS MANAGEMENT
// ==========================================
app.get('/api/parking/slots', async (req: Request, res: Response) => {
  try {
    const societyId = req.societyId || (req.query.societyId as string) || 'soc-gvs';
    const slots = await prisma.parkingSlot.findMany({
      where: societyId !== 'all' ? { societyId } : undefined,
      include: { flat: true },
      orderBy: { slotNumber: 'asc' },
    });
    res.json(slots);
  } catch (error) {
    res.status(500).json({ error: String(error) });
  }
});

app.post('/api/parking/slots', requireRole(['secretary', 'admin']), async (req: Request, res: Response) => {
  try {
    const societyId = req.societyId || req.body.societyId || 'soc-gvs';
    const { slotNumber, towerBlock, slotType } = req.body;
    const slot = await prisma.parkingSlot.create({
      data: {
        societyId,
        slotNumber,
        towerBlock: towerBlock || 'Basement 1',
        slotType: slotType || 'RESIDENT',
        isOccupied: false,
      },
    });
    broadcastEvent('PARKING_SLOT_CREATED', slot, societyId);
    res.status(201).json(slot);
  } catch (error) {
    res.status(500).json({ error: String(error) });
  }
});

app.post('/api/parking/allocate', requireRole(['secretary', 'admin']), async (req: Request, res: Response) => {
  try {
    const { slotId, flatId } = req.body;
    const updated = await prisma.parkingSlot.update({
      where: { id: slotId },
      data: {
        allocatedFlatId: flatId || undefined,
        isOccupied: !!flatId,
      },
    });
    broadcastEvent('PARKING_SLOT_ALLOCATED', updated, updated.societyId);
    res.json(updated);
  } catch (error) {
    res.status(500).json({ error: String(error) });
  }
});

app.get('/api/parking/violations', async (req: Request, res: Response) => {
  try {
    const societyId = req.societyId || (req.query.societyId as string) || 'soc-gvs';
    const records = await prisma.entityRecord.findMany({
      where: { collection: 'parking_violations', societyId: societyId !== 'all' ? societyId : undefined },
      orderBy: { createdAt: 'desc' },
    });
    res.json(records.map((r) => ({ id: r.id, societyId: r.societyId, ...(r.data as any), createdAt: r.createdAt })));
  } catch (error) {
    res.status(500).json({ error: String(error) });
  }
});

app.post('/api/parking/violations', requireRole(['guard', 'secretary', 'admin']), async (req: Request, res: Response) => {
  try {
    const societyId = req.societyId || req.body.societyId || 'soc-gvs';
    const id = req.body.id || `viol_${Date.now()}`;
    const violationData = {
      ...req.body,
      id,
      societyId,
      status: 'REPORTED',
      fineAmount: req.body.fineAmount || 500,
      createdAt: new Date().toISOString(),
    };
    await prisma.entityRecord.create({
      data: {
        id,
        collection: 'parking_violations',
        societyId,
        data: violationData,
      },
    });
    broadcastEvent('PARKING_VIOLATION_REPORTED', violationData, societyId);
    res.status(201).json(violationData);
  } catch (error) {
    res.status(500).json({ error: String(error) });
  }
});

// ==========================================
// 🏨 GUEST STAY & ACCOMMODATION SUITES
// ==========================================
app.get('/api/guest-stay/rooms', async (req: Request, res: Response) => {
  try {
    const societyId = req.societyId || (req.query.societyId as string) || 'soc-gvs';
    const records = await prisma.entityRecord.findMany({
      where: { collection: 'guest_rooms', societyId: societyId !== 'all' ? societyId : undefined },
      orderBy: { createdAt: 'asc' },
    });
    res.json(records.map((r) => ({ id: r.id, societyId: r.societyId, ...(r.data as any), createdAt: r.createdAt })));
  } catch (error) {
    res.status(500).json({ error: String(error) });
  }
});

app.post('/api/guest-stay/rooms', requireRole(['secretary', 'admin', 'facility_manager']), async (req: Request, res: Response) => {
  try {
    const societyId = req.societyId || req.body.societyId || 'soc-gvs';
    const id = req.body.id || `room_${Date.now()}`;
    const roomData = { ...req.body, id, societyId, isAvailable: true, createdAt: new Date().toISOString() };
    await prisma.entityRecord.create({
      data: { id, collection: 'guest_rooms', societyId, data: roomData },
    });
    broadcastEvent('GUEST_ROOM_CREATED', roomData, societyId);
    res.status(201).json(roomData);
  } catch (error) {
    res.status(500).json({ error: String(error) });
  }
});

app.get('/api/guest-stay/reservations', async (req: Request, res: Response) => {
  try {
    const societyId = req.societyId || (req.query.societyId as string) || 'soc-gvs';
    const residentId = req.userId || (req.query.residentId as string);
    const records = await prisma.entityRecord.findMany({
      where: { collection: 'guest_reservations', societyId: societyId !== 'all' ? societyId : undefined },
      orderBy: { createdAt: 'desc' },
    });
    const resvs = records.map((r) => ({ id: r.id, societyId: r.societyId, ...(r.data as any), createdAt: r.createdAt }));
    const filtered = residentId && req.userRole === 'resident' ? resvs.filter((v: any) => v.residentId === residentId) : resvs;
    res.json(filtered);
  } catch (error) {
    res.status(500).json({ error: String(error) });
  }
});

app.post('/api/guest-stay/reservations', requireRole(['resident', 'secretary', 'admin']), async (req: Request, res: Response) => {
  try {
    const societyId = req.societyId || req.body.societyId || 'soc-gvs';
    const id = req.body.id || `resv_${Date.now()}`;
    const reservationData = {
      ...req.body,
      id,
      societyId,
      status: 'CONFIRMED',
      qrCodeData: `GUEST-${id}-${req.body.guestName || 'GUEST'}`,
      createdAt: new Date().toISOString(),
    };
    await prisma.entityRecord.create({
      data: { id, collection: 'guest_reservations', societyId, data: reservationData },
    });
    broadcastEvent('GUEST_STAY_BOOKED', reservationData, societyId);
    res.status(201).json(reservationData);
  } catch (error) {
    res.status(500).json({ error: String(error) });
  }
});

// ==========================================
// 🧹 HOUSEKEEPING, WASTE & SANITIZATION
// ==========================================
app.get('/api/housekeeping/garbage-logs', async (req: Request, res: Response) => {
  try {
    const societyId = req.societyId || (req.query.societyId as string) || 'soc-gvs';
    const records = await prisma.entityRecord.findMany({
      where: { collection: 'garbage_pickup_logs', societyId: societyId !== 'all' ? societyId : undefined },
      orderBy: { createdAt: 'desc' },
    });
    res.json(records.map((r) => ({ id: r.id, societyId: r.societyId, ...(r.data as any), createdAt: r.createdAt })));
  } catch (error) {
    res.status(500).json({ error: String(error) });
  }
});

app.post('/api/housekeeping/garbage-logs/confirm', async (req: Request, res: Response) => {
  try {
    const { id } = req.body;
    const record = await prisma.entityRecord.findUnique({ where: { id } });
    if (!record) return res.status(404).json({ error: 'Pickup log not found' });
    const updated = { ...(record.data as any), status: 'COLLECTED', confirmedByResident: true, confirmedAt: new Date().toISOString() };
    await prisma.entityRecord.update({
      where: { id },
      data: { data: updated, updatedAt: new Date() },
    });
    broadcastEvent('GARBAGE_PICKUP_CONFIRMED', updated, record.societyId);
    res.json(updated);
  } catch (error) {
    res.status(500).json({ error: String(error) });
  }
});

app.post('/api/housekeeping/garbage-logs/missed', async (req: Request, res: Response) => {
  try {
    const societyId = req.societyId || req.body.societyId || 'soc-gvs';
    const id = `missed_${Date.now()}`;
    const logData = { ...req.body, id, societyId, status: 'MISSED', createdAt: new Date().toISOString() };
    await prisma.entityRecord.create({
      data: { id, collection: 'garbage_pickup_logs', societyId, data: logData },
    });
    broadcastEvent('GARBAGE_PICKUP_MISSED', logData, societyId);
    res.status(201).json(logData);
  } catch (error) {
    res.status(500).json({ error: String(error) });
  }
});

app.get('/api/housekeeping/tasks', async (req: Request, res: Response) => {
  try {
    const societyId = req.societyId || (req.query.societyId as string) || 'soc-gvs';
    const records = await prisma.entityRecord.findMany({
      where: { collection: 'housekeeping_tasks', societyId: societyId !== 'all' ? societyId : undefined },
      orderBy: { createdAt: 'desc' },
    });
    res.json(records.map((r) => ({ id: r.id, societyId: r.societyId, ...(r.data as any), createdAt: r.createdAt })));
  } catch (error) {
    res.status(500).json({ error: String(error) });
  }
});

app.patch('/api/housekeeping/tasks/:id', requireRole(['facility_manager', 'secretary', 'admin']), async (req: Request, res: Response) => {
  try {
    const id = String(req.params.id);
    const record = await prisma.entityRecord.findUnique({ where: { id } });
    if (!record) return res.status(404).json({ error: 'Task not found' });
    const updated = { ...(record.data as any), ...req.body, updatedAt: new Date().toISOString() };
    await prisma.entityRecord.update({
      where: { id },
      data: { data: updated, updatedAt: new Date() },
    });
    broadcastEvent('HOUSEKEEPING_TASK_UPDATED', updated, record.societyId);
    res.json(updated);
  } catch (error) {
    res.status(500).json({ error: String(error) });
  }
});

// ==========================================
// ⏰ FACILITY STAFF SHIFTS & DUTY ATTENDANCE
// ==========================================
app.get('/api/facility/staff-shifts', async (req: Request, res: Response) => {
  try {
    const societyId = req.societyId || (req.query.societyId as string) || 'soc-gvs';
    const shifts = await prisma.shift.findMany({
      where: societyId !== 'all' ? { societyId } : undefined,
    });
    res.json(shifts);
  } catch (error) {
    res.status(500).json({ error: String(error) });
  }
});

app.post('/api/facility/staff-shifts', requireRole(['facility_manager', 'secretary', 'admin']), async (req: Request, res: Response) => {
  try {
    const societyId = req.societyId || req.body.societyId || 'soc-gvs';
    const { shiftName, startTime, endTime, staffCount } = req.body;
    const shift = await prisma.shift.create({
      data: {
        societyId,
        shiftName: shiftName || 'MORNING',
        startTime: startTime || '06:00',
        endTime: endTime || '14:00',
        staffCount: Number(staffCount) || 1,
      },
    });
    broadcastEvent('STAFF_SHIFT_SCHEDULED', shift, societyId);
    res.status(201).json(shift);
  } catch (error) {
    res.status(500).json({ error: String(error) });
  }
});

app.get('/api/facility/staff-attendance', async (req: Request, res: Response) => {
  try {
    const societyId = req.societyId || (req.query.societyId as string) || 'soc-gvs';
    const attendances = await prisma.attendance.findMany({
      where: societyId !== 'all' ? { societyId } : undefined,
      orderBy: { checkIn: 'desc' },
      take: 100,
    });
    res.json(attendances);
  } catch (error) {
    res.status(500).json({ error: String(error) });
  }
});

app.post('/api/facility/staff-attendance/check-in', requireRole(['guard', 'facility_manager', 'secretary', 'admin']), async (req: Request, res: Response) => {
  try {
    const societyId = req.societyId || req.body.societyId || 'soc-gvs';
    const { staffId, staffName, role, gateId } = req.body;
    const att = await prisma.attendance.create({
      data: {
        societyId,
        staffId: staffId || `stf_${Date.now()}`,
        staffName: staffName || 'Staff Member',
        role: role || 'SECURITY_GUARD',
        gateId: gateId || 'MAIN_GATE',
        status: 'PRESENT',
      },
    });
    broadcastEvent('STAFF_CHECKED_IN', att, societyId);
    res.status(201).json(att);
  } catch (error) {
    res.status(500).json({ error: String(error) });
  }
});

// ==========================================
// 📁 File Upload Support (Web & Native Mobile)
// ==========================================
app.post('/api/upload', async (req: Request, res: Response) => {
  try {
    const { filename, fileData, category = 'attachments' } = req.body;
    if (!fileData) {
      return res.status(400).json({ error: 'Missing fileData (Base64 data URL required)' });
    }

    const matches = fileData.match(/^data:([A-Za-z-+\/]+);base64,(.+)$/);
    let buffer: Buffer;
    let ext = 'bin';

    if (matches && matches.length === 3) {
      const mimeType = matches[1].toLowerCase();
      const subtype = mimeType.split('/')[1] || 'bin';
      ext = subtype === 'jpeg' ? 'jpg' : subtype.split(';')[0];
      buffer = Buffer.from(matches[2], 'base64');
    } else {
      buffer = Buffer.from(fileData, 'base64');
    }

    // Security: Validate allowed extensions and file size limit (15MB)
    const ALLOWED_EXTENSIONS = ['jpg', 'jpeg', 'png', 'webp', 'pdf', 'svg', 'gif'];
    const cleanExt = ext.toLowerCase().trim();
    if (!ALLOWED_EXTENSIONS.includes(cleanExt)) {
      return res.status(400).json({
        error: `Unsupported file type '${cleanExt}'. Allowed formats: JPG, PNG, WEBP, PDF, SVG, GIF.`,
      });
    }

    if (buffer.length > 15 * 1024 * 1024) {
      return res.status(400).json({ error: 'File size exceeds 15MB maximum limit.' });
    }

    const sanitizedBase = (filename || `file_${Date.now()}.${ext}`)
      .replace(/[^a-zA-Z0-9._-]/g, '_');
    const uniqueFilename = `${Date.now()}_${sanitizedBase}`;
    const targetPath = path.join(uploadsDir, uniqueFilename);

    await fs.promises.writeFile(targetPath, buffer);

    const fileUrl = `/uploads/${uniqueFilename}`;

    // Broadcast file upload event
    broadcastEvent('FILE_UPLOADED', {
      filename: uniqueFilename,
      url: fileUrl,
      size: buffer.length,
      category,
      uploadedAt: new Date().toISOString(),
    });

    res.status(201).json({
      success: true,
      url: fileUrl,
      filename: uniqueFilename,
      size: buffer.length,
      category,
    });
  } catch (error) {
    console.error('File upload failed:', error);
    res.status(500).json({ error: String(error) });
  }
});

// ==========================================
// 💳 Razorpay Payment Engine (Production-Grade)
// ==========================================

// 1. Create Order: Strictly resolves amount and currency from server-side database invoice
app.post('/api/payments/razorpay/create-order', async (req: Request, res: Response) => {
  try {
    const { invoiceId, currency = 'INR' } = req.body;
    if (!invoiceId) {
      return res.status(400).json({ error: 'invoiceId is required' });
    }

    // Server-side invoice resolution: NEVER trust client-supplied amounts or ownership
    const invoice = await prisma.billingInvoice.findUnique({
      where: { id: invoiceId },
      include: {
        resident: true,
        flat: true,
      },
    });

    if (!invoice) {
      return res.status(404).json({ error: 'Invoice not found in system records.' });
    }

    if (invoice.status === 'PAID') {
      return res.status(400).json({ error: 'Invoice has already been settled and marked as PAID.' });
    }

    if (invoice.status === 'CANCELLED') {
      return res.status(400).json({ error: 'Invoice has been cancelled and cannot be paid.' });
    }

    // Society multi-tenant isolation check
    if (req.societyId && invoice.societyId !== req.societyId && req.userRole !== 'superadmin') {
      return res.status(403).json({ error: 'Unauthorized: Cross-society payment order creation prohibited.' });
    }

    // Role-based authorization: residents may only pay their own invoices
    if (req.userRole === 'resident' && req.userId) {
      const isOwner =
        invoice.residentId === req.userId ||
        invoice.resident?.userId === req.userId ||
        invoice.resident?.phone === req.userId;
      if (!isOwner && invoice.residentId) {
        return res.status(403).json({ error: 'Unauthorized: You are not authorized to pay invoices for this unit.' });
      }
    }

    const total = Number(invoice.totalAmount || 0);
    const paid = Number(invoice.paidAmount || 0);
    const outstanding = Math.max(0, total - paid);

    if (outstanding <= 0) {
      return res.status(400).json({ error: 'Invoice has no outstanding balance payable.' });
    }

    // Amount in integer subunits (paise for INR)
    const amountInPaise = Math.round(outstanding * 100);

    const keyId = process.env.RAZORPAY_KEY_ID || 'rzp_test_AARIZO_2026';
    const keySecret = process.env.RAZORPAY_KEY_SECRET || 'rzp_secret_AARIZO_2026';
    let orderId = `order_${Date.now()}_${crypto.randomBytes(4).toString('hex')}`;

    // Call live Razorpay API if live/test credentials configured
    if (process.env.RAZORPAY_KEY_ID && process.env.RAZORPAY_KEY_SECRET && !process.env.RAZORPAY_KEY_ID.includes('test_AARIZO')) {
      try {
        const basicAuth = Buffer.from(`${keyId}:${keySecret}`).toString('base64');
        const rzpRes = await fetch('https://api.razorpay.com/v1/orders', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Basic ${basicAuth}`,
          },
          body: JSON.stringify({
            amount: amountInPaise,
            currency,
            receipt: invoice.invoiceNumber,
            notes: {
              invoiceId: invoice.id,
              invoiceNumber: invoice.invoiceNumber,
              societyId: invoice.societyId,
              userId: req.userId || invoice.residentId || 'resident',
            },
          }),
        });

        if (rzpRes.ok) {
          const rzpData = (await rzpRes.json()) as any;
          if (rzpData?.id) {
            orderId = rzpData.id;
          }
        } else {
          const errBody = await rzpRes.text();
          console.warn('[Razorpay API] Order creation returned non-200:', errBody);
        }
      } catch (apiErr) {
        console.warn('[Razorpay API] Live order call failed, fallback order reference used:', apiErr);
      }
    }

    // Persist Payment record in PostgreSQL with status PENDING
    try {
      const existingPending = await prisma.payment.findFirst({
        where: {
          invoiceId: invoice.id,
          status: 'PENDING',
        },
      });

      if (existingPending) {
        await prisma.payment.update({
          where: { id: existingPending.id },
          data: {
            razorpayOrderId: orderId,
            amount: outstanding,
            currency,
            metadata: {
              invoiceNumber: invoice.invoiceNumber,
              updatedAt: new Date().toISOString(),
            },
          },
        });
      } else {
        await prisma.payment.create({
          data: {
            societyId: invoice.societyId,
            invoiceId: invoice.id,
            residentId: invoice.residentId || undefined,
            userId: req.userId || invoice.resident?.userId || undefined,
            amount: outstanding,
            currency,
            status: 'PENDING',
            razorpayOrderId: orderId,
            paymentMethod: 'RAZORPAY',
            metadata: {
              invoiceNumber: invoice.invoiceNumber,
              createdAt: new Date().toISOString(),
            },
          },
        });
      }
    } catch (dbErr) {
      console.warn('[Payment Record] Could not persist pending payment in Prisma:', dbErr);
    }

    res.json({
      orderId,
      amount: amountInPaise,
      currency,
      keyId,
      invoiceId: invoice.id,
      notes: {
        societyId: invoice.societyId,
        invoiceNumber: invoice.invoiceNumber,
        purpose: `Maintenance Bill #${invoice.invoiceNumber}`,
      },
    });
  } catch (error) {
    console.error('Error in create-order endpoint:', error);
    res.status(500).json({ error: String(error) });
  }
});

// 2. Verify Payment: Cryptographic HMAC SHA256 Verification & Atomic Database Settlement
app.post('/api/payments/razorpay/verify', async (req: Request, res: Response) => {
  try {
    const { invoiceId, razorpayPaymentId, razorpayOrderId, razorpaySignature } = req.body;
    if (!invoiceId || !razorpayPaymentId || !razorpayOrderId || !razorpaySignature) {
      return res.status(400).json({
        error: 'invoiceId, razorpayPaymentId, razorpayOrderId, and razorpaySignature are required for verification.',
      });
    }

    const keySecret = process.env.RAZORPAY_KEY_SECRET || 'rzp_secret_AARIZO_2026';

    // Cryptographic HMAC SHA256 Signature Verification
    const expectedSignature = crypto
      .createHmac('sha256', keySecret)
      .update(`${razorpayOrderId}|${razorpayPaymentId}`)
      .digest('hex');

    let isSigValid = timingSafeCompare(expectedSignature, razorpaySignature);

    // Development/Test mock accommodation if test secret in use
    if (!isSigValid && keySecret === 'rzp_secret_AARIZO_2026' && razorpaySignature.startsWith('test_sig_')) {
      isSigValid = true;
    }

    if (!isSigValid) {
      return res.status(403).json({
        success: false,
        error: 'Invalid Razorpay payment signature. Payment verification rejected.',
      });
    }

    // Fetch invoice from database
    const invoice = await prisma.billingInvoice.findUnique({
      where: { id: invoiceId },
      include: {
        flat: true,
        resident: true,
      },
    });

    if (!invoice) {
      return res.status(404).json({ error: 'Invoice not found.' });
    }

    // Idempotency: If invoice is already paid, return success without duplicate balance deduction
    if (invoice.status === 'PAID') {
      return res.json({
        success: true,
        message: 'Invoice has already been verified and marked as PAID.',
        invoice,
        transactionId: razorpayPaymentId,
      });
    }

    // Atomic database transaction: Update Invoice to PAID, Update Payment to SUCCESS, write AuditLog
    const [updatedInvoice, updatedPayment] = await prisma.$transaction(async (tx) => {
      const inv = await tx.billingInvoice.update({
        where: { id: invoiceId },
        data: {
          status: 'PAID',
          paidAmount: invoice.totalAmount,
          paidAt: new Date(),
          paymentMode: 'RAZORPAY',
        },
        include: {
          flat: true,
          resident: true,
        },
      });

      const existingPayment = await tx.payment.findFirst({
        where: {
          OR: [
            { razorpayOrderId },
            { razorpayPaymentId },
            { invoiceId, status: 'PENDING' },
          ],
        },
      });

      let payRecord;
      if (existingPayment) {
        payRecord = await tx.payment.update({
          where: { id: existingPayment.id },
          data: {
            status: 'SUCCESS',
            razorpayPaymentId,
            razorpayOrderId,
            razorpaySignatureVerified: true,
            paymentMethod: 'RAZORPAY',
            amount: inv.totalAmount,
            metadata: {
              ...(typeof existingPayment.metadata === 'object' && existingPayment.metadata ? (existingPayment.metadata as any) : {}),
              paidAt: new Date().toISOString(),
              invoiceNumber: inv.invoiceNumber,
            },
          },
        });
      } else {
        payRecord = await tx.payment.create({
          data: {
            societyId: inv.societyId,
            invoiceId,
            userId: req.userId || inv.resident?.userId || undefined,
            residentId: inv.residentId || undefined,
            amount: inv.totalAmount,
            currency: 'INR',
            status: 'SUCCESS',
            razorpayOrderId,
            razorpayPaymentId,
            razorpaySignatureVerified: true,
            paymentMethod: 'RAZORPAY',
            metadata: {
              paidAt: new Date().toISOString(),
              invoiceNumber: inv.invoiceNumber,
            },
          },
        });
      }

      await tx.auditLog.create({
        data: {
          societyId: inv.societyId,
          actorId: req.userId || 'system',
          actorName: inv.resident?.name || 'Resident',
          role: 'resident',
          action: 'PAYMENT_COMPLETED',
          entityName: 'BillingInvoice',
          entityId: invoiceId,
          metadata: {
            razorpayPaymentId,
            razorpayOrderId,
            amount: Number(inv.totalAmount),
            paidAt: new Date().toISOString(),
          },
        },
      });

      return [inv, payRecord];
    });

    // Instantaneous real-time broadcast across all resident, guard, and secretary screens
    broadcastEvent('PAYMENT_COMPLETED', {
      invoiceId,
      invoiceNumber: updatedInvoice?.invoiceNumber || invoiceId,
      flatNumber: updatedInvoice?.flat?.flatNumber,
      amount: updatedInvoice?.totalAmount || 2500,
      paymentId: razorpayPaymentId,
      paidAt: new Date().toISOString(),
    });

    res.json({
      success: true,
      message: 'Razorpay payment verified and invoice marked as PAID',
      invoice: updatedInvoice,
      transactionId: razorpayPaymentId,
    });
  } catch (error) {
    console.error('Razorpay verification error:', error);
    res.status(500).json({ error: String(error) });
  }
});

// 3. Status Query: Query trusted server-side payment status
app.get('/api/payments/status/:orderId', async (req: Request, res: Response) => {
  try {
    const orderId = String(req.params.orderId);
    const payment = await prisma.payment.findFirst({
      where: {
        OR: [
          { razorpayOrderId: orderId },
          { razorpayPaymentId: orderId },
          { id: orderId },
        ],
      },
      include: {
        invoice: true,
        resident: true,
      },
    });

    if (!payment) {
      return res.status(404).json({ error: 'Payment record not found.' });
    }

    res.json({
      id: payment.id,
      status: payment.status,
      amount: payment.amount,
      currency: payment.currency,
      razorpayOrderId: payment.razorpayOrderId,
      razorpayPaymentId: payment.razorpayPaymentId,
      verified: payment.razorpaySignatureVerified,
      createdAt: payment.createdAt,
      invoice: (payment as any).invoice,
    });
  } catch (error) {
    res.status(500).json({ error: String(error) });
  }
});

// 4. Refund Payment: Authorized Admin/Secretary Only
app.post('/api/payments/razorpay/refund', requireRole(['admin', 'secretary']), async (req: Request, res: Response) => {
  try {
    const { paymentId, amount, reason } = req.body;
    if (!paymentId || !reason) {
      return res.status(400).json({ error: 'paymentId and reason are required for processing a refund.' });
    }

    const keyId = process.env.RAZORPAY_KEY_ID || 'rzp_test_AARIZO_2026';
    const keySecret = process.env.RAZORPAY_KEY_SECRET || 'rzp_secret_AARIZO_2026';
    let refundId = `rfnd_${Date.now()}_${crypto.randomBytes(4).toString('hex')}`;

    // Live Razorpay API Refund Call if production credentials active
    if (process.env.RAZORPAY_KEY_ID && process.env.RAZORPAY_KEY_SECRET && !process.env.RAZORPAY_KEY_ID.includes('test_AARIZO')) {
      try {
        const basicAuth = Buffer.from(`${keyId}:${keySecret}`).toString('base64');
        const refundRes = await fetch(`https://api.razorpay.com/v1/payments/${paymentId}/refund`, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Basic ${basicAuth}`,
          },
          body: JSON.stringify({
            amount: amount ? Math.round(Number(amount) * 100) : undefined,
            notes: { reason },
          }),
        });

        if (refundRes.ok) {
          const rData = (await refundRes.json()) as any;
          if (rData?.id) refundId = rData.id;
        }
      } catch (refundApiErr) {
        console.warn('Razorpay live refund API error:', refundApiErr);
      }
    }

    // Update Payment record in PostgreSQL
    const existingPay = await prisma.payment.findFirst({
      where: {
        OR: [{ id: paymentId }, { razorpayPaymentId: paymentId }],
      },
    });

    if (existingPay) {
      await prisma.payment.update({
        where: { id: existingPay.id },
        data: {
          status: 'REFUNDED',
          refundId,
          refundAmount: amount || existingPay.amount,
          refundReason: reason,
          refundedAt: new Date(),
        },
      });
    }

    // Audit Log Entry
    await prisma.auditLog.create({
      data: {
        societyId: existingPay?.societyId || req.societyId || 'soc-gvs',
        actorId: req.userId || 'admin',
        actorName: 'Admin',
        role: 'admin',
        action: 'PAYMENT_REFUNDED',
        entityName: 'Payment',
        entityId: paymentId,
        metadata: {
          paymentId,
          amount,
          reason,
          refundId,
          refundedAt: new Date().toISOString(),
        },
      },
    });

    broadcastEvent('PAYMENT_REFUNDED', {
      paymentId,
      refundId,
      amount,
      reason,
      refundedAt: new Date().toISOString(),
    });

    res.json({
      success: true,
      refundId,
      amount,
      message: `Refund of ₹${amount} processed successfully.`,
    });
  } catch (error) {
    res.status(500).json({ error: String(error) });
  }
});

// 5. Payment History: Authorized user payments query
app.get('/api/payments', async (req: Request, res: Response) => {
  try {
    const societyId = req.societyId || (req.query.societyId as string) || 'soc-gvs';
    const residentId = (req.query.residentId as string) || undefined;
    const invoiceId = (req.query.invoiceId as string) || undefined;

    const whereClause: any = {};
    if (societyId && societyId !== 'all') whereClause.societyId = societyId;

    // Role-based privacy restriction: ordinary residents may only query their own payments
    if (req.userRole === 'resident' && req.userId) {
      whereClause.OR = [
        { userId: req.userId },
        { residentId: req.userId },
      ];
    } else {
      if (residentId) whereClause.residentId = residentId;
    }

    if (invoiceId) whereClause.invoiceId = invoiceId;

    const payments = await prisma.payment.findMany({
      where: whereClause,
      include: {
        invoice: true,
        resident: true,
      },
      orderBy: { createdAt: 'desc' },
      take: 100,
    });

    res.json(payments);
  } catch (error) {
    res.status(500).json({ error: String(error) });
  }
});

// 6. Razorpay Webhooks: Idempotent Raw-Body Signature Validation & Asynchronous Event Processing
app.post('/api/payments/razorpay/webhook', async (req: Request, res: Response) => {
  try {
    const webhookSecret = process.env.RAZORPAY_WEBHOOK_SECRET || 'rzp_webhook_AARIZO_2026';
    const signature = req.headers['x-razorpay-signature'] as string;

    if (!signature) {
      return res.status(400).json({ error: 'Missing X-Razorpay-Signature header' });
    }

    // Preserve exact unparsed raw body bytes for cryptographic HMAC validation
    const rawBodyBuffer = req.rawBody || Buffer.from(JSON.stringify(req.body), 'utf8');
    const expectedSignature = crypto
      .createHmac('sha256', webhookSecret)
      .update(rawBodyBuffer)
      .digest('hex');

    let isSigValid = timingSafeCompare(expectedSignature, signature);
    if (!isSigValid && webhookSecret === 'rzp_webhook_AARIZO_2026' && signature.startsWith('test_sig_')) {
      isSigValid = true;
    }

    if (!isSigValid) {
      return res.status(401).send('Invalid webhook signature');
    }

    const event = req.body;
    const eventId =
      event?.id ||
      `${event?.event || 'evt'}_${event?.payload?.payment?.entity?.id || Date.now()}`;

    // Deduplication via WebhookEvent table: Ensure webhook retries are idempotent
    try {
      const existingEvent = await prisma.webhookEvent.findUnique({
        where: { eventId },
      });

      if (existingEvent) {
        return res.status(200).json({ status: 'ALREADY_PROCESSED', eventId });
      }

      await prisma.webhookEvent.create({
        data: {
          eventId,
          eventType: event?.event || 'unknown',
          payload: event,
          status: 'PROCESSED',
        },
      });
    } catch (evtErr) {
      console.warn('[Webhook Event Deduplication Error]:', evtErr);
    }

    // Asynchronous Reconciliation Logic
    if (event?.event === 'payment.captured') {
      const paymentEntity = event.payload?.payment?.entity;
      const notes = paymentEntity?.notes || {};
      const invoiceId = notes.invoiceId;
      const orderId = paymentEntity?.order_id;
      const paymentId = paymentEntity?.id;

      if (invoiceId) {
        const invoice = await prisma.billingInvoice.findUnique({
          where: { id: invoiceId },
        });

        if (invoice && invoice.status !== 'PAID') {
          await prisma.$transaction(async (tx) => {
            await tx.billingInvoice.update({
              where: { id: invoiceId },
              data: {
                status: 'PAID',
                paidAmount: invoice.totalAmount,
                paidAt: new Date(),
                paymentMode: 'RAZORPAY',
              },
            });

            const pay = await tx.payment.findFirst({
              where: {
                OR: [{ razorpayOrderId: orderId }, { invoiceId }],
              },
            });

            if (pay) {
              await tx.payment.update({
                where: { id: pay.id },
                data: {
                  status: 'SUCCESS',
                  razorpayPaymentId: paymentId,
                  razorpaySignatureVerified: true,
                },
              });
            }
          });

          broadcastEvent('PAYMENT_COMPLETED', {
            invoiceId,
            paymentId,
            amount: (paymentEntity.amount || 0) / 100,
            reconciledBy: 'WEBHOOK',
          });
        }

        // Auto-credit resident ledger wallet on successful online wallet top-up
        if (paymentEntity?.notes?.type === 'WALLET_TOPUP' || paymentEntity?.notes?.purpose === 'WALLET_RECHARGE') {
          const residentId = paymentEntity.notes.residentId;
          const topupAmount = (paymentEntity.amount || 0) / 100;
          if (residentId && topupAmount > 0) {
            await WalletService.executeTransaction({
              societyId: paymentEntity.notes.societyId || 'soc-gvs',
              residentId,
              type: 'CREDIT',
              category: 'RECHARGE',
              amount: topupAmount,
              description: `Online Wallet Recharge via Razorpay (${paymentId || paymentEntity.id})`,
              referenceId: paymentId || paymentEntity.id,
            }).catch((err) => console.warn('[WalletRechargeWebhook] Failed to credit wallet:', err));
          }
        }
      }
    } else if (event?.event === 'payment.failed') {
      const paymentEntity = event.payload?.payment?.entity;
      const orderId = paymentEntity?.order_id;
      if (orderId) {
        const pay = await prisma.payment.findFirst({
          where: { razorpayOrderId: orderId },
        });
        if (pay) {
          await prisma.payment.update({
            where: { id: pay.id },
            data: {
              status: 'FAILED',
              failureReason: paymentEntity?.error_description || 'Payment failed',
            },
          });
        }
      }
    } else if (event?.event === 'refund.processed') {
      const refundEntity = event.payload?.refund?.entity;
      const paymentId = refundEntity?.payment_id;
      if (paymentId) {
        const pay = await prisma.payment.findFirst({
          where: { razorpayPaymentId: paymentId },
        });
        if (pay) {
          await prisma.payment.update({
            where: { id: pay.id },
            data: {
              status: 'REFUNDED',
              refundId: refundEntity.id,
              refundAmount: (refundEntity.amount || 0) / 100,
              refundReason: refundEntity.notes?.reason || 'Refund processed',
              refundedAt: new Date(),
            },
          });

          broadcastEvent('PAYMENT_REFUNDED', {
            paymentId,
            refundId: refundEntity.id,
            amount: (refundEntity.amount || 0) / 100,
          });
        }
      }
    }

    res.json({ status: 'PROCESSED', eventId });
  } catch (error) {
    console.error('Webhook error:', error);
    res.status(500).json({ error: String(error) });
  }
});

// ==========================================
// 📢 Advertisement & Sponsored Popups
// ==========================================
app.get('/api/advertisements', async (req: Request, res: Response) => {
  try {
    const societyId = (req.query.societyId as string) || req.societyId || 'soc-gvs';
    const ads = await prisma.advertisement.findMany({
      where: {
        societyId,
        status: 'ACTIVE',
      },
      include: {
        vendor: true,
      },
      orderBy: { createdAt: 'desc' },
    });
    res.json(ads);
  } catch (error) {
    res.json([]);
  }
});

app.post('/api/advertisements', async (req: Request, res: Response) => {
  try {
    const {
      societyId = req.societyId || 'soc-gvs',
      vendorId,
      title,
      tagline,
      description,
      imageUrl,
      ctaText = 'Claim Offer',
      ctaLink,
      discountCode,
      category = 'SERVICES',
      endDate,
    } = req.body;

    if (!title || !description) {
      return res.status(400).json({ error: 'Title and description are required' });
    }

    const ad = await prisma.advertisement.create({
      data: {
        societyId,
        vendorId: vendorId || null,
        title,
        tagline,
        description,
        imageUrl,
        ctaText,
        ctaLink,
        discountCode,
        category,
        endDate: endDate ? new Date(endDate) : null,
        status: 'ACTIVE',
      },
      include: {
        vendor: true,
      },
    });

    // Real-time broadcast
    broadcastEvent('ADVERTISEMENT_PUBLISHED', ad);

    res.status(201).json(ad);
  } catch (error) {
    res.status(500).json({ error: String(error) });
  }
});

app.post('/api/advertisements/:id/view', async (req: Request, res: Response) => {
  try {
    const ad = await prisma.advertisement.update({
      where: { id: req.params.id as string },
      data: { viewsCount: { increment: 1 } },
    });
    res.json({ success: true, viewsCount: ad.viewsCount });
  } catch (error) {
    res.status(500).json({ error: String(error) });
  }
});

app.post('/api/advertisements/:id/click', async (req: Request, res: Response) => {
  try {
    const ad = await prisma.advertisement.update({
      where: { id: req.params.id as string },
      data: { clicksCount: { increment: 1 } },
    });
    res.json({ success: true, clicksCount: ad.clicksCount });
  } catch (error) {
    res.status(500).json({ error: String(error) });
  }
});

// Allowed tables whitelist for generic query router
const ALLOWED_QUERY_TABLES: Record<string, string[]> = {
  society: ['resident', 'secretary', 'guard', 'committee', 'facility_manager', 'vendor', 'admin'],
  tower: ['resident', 'secretary', 'guard', 'committee', 'facility_manager', 'vendor', 'admin'],
  flat: ['resident', 'secretary', 'guard', 'committee', 'facility_manager', 'vendor', 'admin'],
  resident: ['resident', 'secretary', 'guard', 'facility_manager', 'admin'],
  visitorPass: ['resident', 'guard', 'secretary', 'admin', 'facility_manager'],
  maintenanceTicket: ['resident', 'facility_manager', 'secretary', 'admin', 'vendor'],
  billingInvoice: ['resident', 'secretary', 'admin', 'committee'],
  parcel: ['resident', 'guard', 'secretary', 'admin'],
  staff: ['guard', 'secretary', 'facility_manager', 'admin'],
  domesticWorker: ['resident', 'guard', 'secretary', 'admin', 'facility_manager'],
  vendor: ['resident', 'secretary', 'facility_manager', 'admin', 'vendor'],
  amenity: ['resident', 'secretary', 'committee', 'facility_manager', 'admin'],
  amenityBooking: ['resident', 'secretary', 'committee', 'facility_manager', 'admin'],
  parkingSlot: ['resident', 'secretary', 'guard', 'admin'],
  emergencyIncident: ['resident', 'guard', 'secretary', 'admin'],
  notification: ['resident', 'guard', 'secretary', 'committee', 'facility_manager', 'vendor', 'admin'],
  announcement: ['resident', 'secretary', 'guard', 'committee', 'facility_manager', 'vendor', 'admin'],
  communityEvent: ['resident', 'secretary', 'guard', 'committee', 'facility_manager', 'vendor', 'admin'],
  advertisement: ['resident', 'secretary', 'guard', 'committee', 'facility_manager', 'vendor', 'admin'],
  auditLog: ['secretary', 'admin', 'committee'],
  payment: ['resident', 'secretary', 'admin', 'committee'],
  workOrder: ['facility_manager', 'secretary', 'admin', 'vendor'],
  attendance: ['guard', 'facility_manager', 'secretary', 'admin'],
  shift: ['guard', 'facility_manager', 'secretary', 'admin'],
  complianceDocument: ['secretary', 'admin', 'committee', 'facility_manager'],
  amcContract: ['secretary', 'admin', 'committee', 'facility_manager', 'vendor'],
  moveRequest: ['resident', 'secretary', 'admin', 'guard'],
  renovationRequest: ['resident', 'secretary', 'admin', 'guard'],
  approval: ['secretary', 'admin', 'committee'],
  trustScore: ['resident', 'guard', 'secretary', 'admin', 'vendor'],
  visitorLog: ['guard', 'secretary', 'admin', 'resident'],
  societyMembership: ['secretary', 'admin', 'committee'],
  entityRecord: ['resident', 'secretary', 'guard', 'committee', 'facility_manager', 'vendor', 'admin'],
};

// Generic Collection CRUD Endpoints for PostgreSQL
app.get('/api/collections/:collection', async (req: Request, res: Response) => {
  try {
    const colName = req.params.collection as string;
    const societyId = req.societyId || (req.query.societyId as string) || 'soc-gvs';

    // Check if table exists natively in Prisma first (supporting plural and camelCase matches)
    const nativeKey = Object.keys(ALLOWED_QUERY_TABLES).find(
      (k) =>
        k.toLowerCase() === colName.toLowerCase() ||
        `${k}s`.toLowerCase() === colName.toLowerCase() ||
        `${k}es`.toLowerCase() === colName.toLowerCase() ||
        (colName.toLowerCase() === 'visitorpasses' && k === 'visitorPass') ||
        (colName.toLowerCase() === 'billinginvoices' && k === 'billingInvoice') ||
        (colName.toLowerCase() === 'parkingslots' && k === 'parkingSlot') ||
        (colName.toLowerCase() === 'domesticworkers' && k === 'domesticWorker')
    );

    if (nativeKey && (prisma as any)[nativeKey]) {
      const where: any = {};
      if (societyId && societyId !== 'all') where.societyId = societyId;
      try {
        const records = await (prisma as any)[nativeKey].findMany({ where, orderBy: { createdAt: 'desc' } });
        return res.json(records);
      } catch (dbErr) {
        return res.json([]);
      }
    }

    // Query entity records in PostgreSQL
    const where: any = { collection: colName };
    if (societyId && societyId !== 'all') where.societyId = societyId;
    const rows = await prisma.entityRecord.findMany({ where, orderBy: { createdAt: 'desc' } });
    const docs = rows.map((r) => {
      const dataObj = typeof r.data === 'object' && r.data ? (r.data as any) : {};
      return { id: r.id, societyId: r.societyId, ...dataObj, createdAt: r.createdAt, updatedAt: r.updatedAt };
    });
    res.json(docs);
  } catch (error) {
    res.json([]);
  }
});

app.get('/api/collections/:collection/:id', async (req: Request, res: Response) => {
  try {
    const colName = String(req.params.collection);
    const id = String(req.params.id);
    const nativeKey = Object.keys(ALLOWED_QUERY_TABLES).find(k => k.toLowerCase() === colName.toLowerCase());
    if (nativeKey && (prisma as any)[nativeKey]) {
      const record = await (prisma as any)[nativeKey].findUnique({ where: { id } });
      return res.json(record);
    }

    const row = await prisma.entityRecord.findUnique({ where: { id } });
    if (!row) return res.status(404).json({ error: 'Record not found' });
    const dataObj = typeof row.data === 'object' && row.data ? (row.data as any) : {};
    res.json({ id: row.id, societyId: row.societyId, ...dataObj, createdAt: row.createdAt, updatedAt: row.updatedAt });
  } catch (error) {
    res.status(500).json({ error: String(error) });
  }
});

app.post('/api/collections/:collection', async (req: Request, res: Response) => {
  try {
    const colName = String(req.params.collection);
    const societyId = req.societyId || req.body.societyId || 'soc-gvs';
    const id = req.body.id || `ent_${Date.now()}_${Math.random().toString(36).substring(2, 8)}`;

    const { id: _, societyId: __, ...data } = req.body;

    const record = await prisma.entityRecord.create({
      data: {
        id,
        collection: colName,
        societyId,
        data,
      },
    });

    broadcastEvent(`${colName.toUpperCase()}_CREATED`, { id, collection: colName, ...data }, societyId);
    res.status(201).json({ id: record.id, societyId: record.societyId, ...data, createdAt: record.createdAt, updatedAt: record.updatedAt });
  } catch (error) {
    res.status(500).json({ error: String(error) });
  }
});

app.put('/api/collections/:collection/:id', async (req: Request, res: Response) => {
  try {
    const colName = String(req.params.collection);
    const id = String(req.params.id);
    const societyId = req.societyId || req.body.societyId || 'soc-gvs';
    const { id: _, societyId: __, ...data } = req.body;

    const record = await prisma.entityRecord.upsert({
      where: { id },
      create: {
        id,
        collection: colName,
        societyId,
        data,
      },
      update: {
        data,
        updatedAt: new Date(),
      },
    });

    broadcastEvent(`${colName.toUpperCase()}_UPDATED`, { id, collection: colName, ...data }, societyId);
    res.json({ id: record.id, societyId: record.societyId, ...data, createdAt: record.createdAt, updatedAt: record.updatedAt });
  } catch (error) {
    res.status(500).json({ error: String(error) });
  }
});

app.delete('/api/collections/:collection/:id', async (req: Request, res: Response) => {
  try {
    const colName = String(req.params.collection);
    const id = String(req.params.id);
    await prisma.entityRecord.delete({ where: { id } }).catch(() => null);
    broadcastEvent(`${colName.toUpperCase()}_DELETED`, { id, collection: colName });
    res.json({ success: true, id });
  } catch (error) {
    res.status(500).json({ error: String(error) });
  }
});

// Generic Query Router with Whitelist and Role Security
app.post('/api/:table/query', async (req: Request, res: Response) => {
  const table = String(req.params.table);

  // Security 1: Whitelist verification
  const allowedRoles = ALLOWED_QUERY_TABLES[table];
  if (!allowedRoles) {
    return res.status(403).json({ error: `Query access to table '${table}' is forbidden.` });
  }

  // Security 2: Role verification
  const role = (req.userRole || '').toLowerCase();
  if (role && role !== 'admin' && !allowedRoles.includes(role)) {
    return res.status(403).json({
      error: `Access denied. Role '${req.userRole}' cannot query '${table}'.`,
    });
  }

  try {
    const delegate = (prisma as any)[table];
    if (!delegate || typeof delegate.findMany !== 'function') {
      return res.status(404).json({ error: `Table delegate ${table} not found in Prisma model.` });
    }
    const where: any = {};
    if (req.societyId && role !== 'admin') {
      where.societyId = req.societyId;
    }
    const records = await delegate.findMany({ where });
    res.json(records);
  } catch (error) {
    res.status(500).json({ error: String(error) });
  }
});

// Serve React frontend production build
const clientDistPath = path.resolve(__dirname, '../../dist');
app.use(express.static(clientDistPath));

app.get('*', (req: Request, res: Response) => {
  if (req.path.startsWith('/api')) {
    return res.status(404).json({ error: 'Endpoint not found' });
  }
  res.sendFile(path.join(clientDistPath, 'index.html'));
});

if (process.env.NODE_ENV !== 'production' || !process.env.VERCEL) {
  app.listen(PORT, () => {
    console.log(`🚀 AARIZO PostgreSQL + Prisma Backend listening on port ${PORT}`);
  });
}

export default app;
