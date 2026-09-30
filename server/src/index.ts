import express, { Request, Response, NextFunction } from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import path from 'path';
import { fileURLToPath } from 'url';
import { prisma } from './prisma.js';

dotenv.config();

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();
const PORT = process.env.PORT || 5000;

app.use(cors());
app.use(express.json());

// Multi-tenant contextual headers middleware
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
    }
  }
}

// Role-based authorization middleware
const requireRole = (allowedRoles: string[]) => {
  return (req: Request, res: Response, next: NextFunction) => {
    const role = (req.userRole || '').toLowerCase();
    // Allow if no role header provided (local dev) or if role is admin or in allowedRoles
    if (!role || role === 'admin' || allowedRoles.map((r) => r.toLowerCase()).includes(role)) {
      return next();
    }
    return res.status(403).json({
      error: `Access denied. Role '${req.userRole}' is not authorized for this resource.`,
    });
  };
};

// Health check
app.get('/api/health', (_req: Request, res: Response) => {
  res.json({
    status: 'UP',
    engine: 'Node.js + Express + Prisma + PostgreSQL',
    timestamp: new Date().toISOString(),
  });
});

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

// Residents
app.get('/api/residents', requireRole(['secretary', 'guard', 'facility_manager', 'admin', 'resident']), async (req: Request, res: Response) => {
  try {
    const residents = await prisma.resident.findMany({
      where: req.societyId ? { societyId: req.societyId } : undefined,
      include: { flat: true, familyMembers: true, vehicles: true },
    });
    res.json(residents);
  } catch (error) {
    res.status(500).json({ error: String(error) });
  }
});

// Visitor Passes
app.get('/api/visitor-passes', requireRole(['resident', 'guard', 'secretary', 'admin', 'facility_manager']), async (req: Request, res: Response) => {
  try {
    const passes = await prisma.visitorPass.findMany({
      where: req.societyId ? { societyId: req.societyId } : undefined,
      orderBy: { validFrom: 'desc' },
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
    res.status(201).json(pass);
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
    const id = req.params.id as string;
    const invoice = await prisma.billingInvoice.update({
      where: { id },
      data: req.body,
    });
    res.json(invoice);
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
    res.json(parcel);
  } catch (error) {
    res.status(500).json({ error: String(error) });
  }
});

// Staff
app.get('/api/staff', requireRole(['guard', 'secretary', 'facility_manager', 'admin']), async (req: Request, res: Response) => {
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

// Vendors
app.get('/api/vendors', requireRole(['resident', 'secretary', 'facility_manager', 'admin', 'vendor']), async (req: Request, res: Response) => {
  try {
    const vendors = await prisma.vendor.findMany({
      where: req.societyId ? { societyId: req.societyId } : undefined,
      orderBy: { businessName: 'asc' },
    });
    res.json(vendors);
  } catch (error) {
    res.status(500).json({ error: String(error) });
  }
});

// Amenities
app.get('/api/amenities', async (req: Request, res: Response) => {
  try {
    const amenities = await prisma.amenity.findMany({
      where: req.societyId ? { societyId: req.societyId } : undefined,
    });
    res.json(amenities);
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
  amenityBooking: ['resident', 'secretary', 'facility_manager', 'admin'],
  notification: ['resident', 'guard', 'secretary', 'committee', 'facility_manager', 'vendor', 'admin'],
};

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
