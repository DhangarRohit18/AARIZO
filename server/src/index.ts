import express, { Request, Response } from 'express';
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
app.use((req, res, next) => {
  req.societyId = req.headers['x-society-id'] as string || undefined;
  req.userId = req.headers['x-user-id'] as string || undefined;
  req.userRole = req.headers['x-user-role'] as string || undefined;
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

// Health check
app.get('/api/health', (req: Request, res: Response) => {
  res.json({ status: 'UP', engine: 'Node.js + Express + Prisma + PostgreSQL' });
});

// Societies
app.get('/api/societies', async (req: Request, res: Response) => {
  try {
    const societies = await prisma.society.findMany({
      include: { towers: true }
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
      include: { tower: true }
    });
    res.json(flats);
  } catch (error) {
    res.status(500).json({ error: String(error) });
  }
});

// Residents
app.get('/api/residents', async (req: Request, res: Response) => {
  try {
    const residents = await prisma.resident.findMany({
      where: req.societyId ? { societyId: req.societyId } : undefined,
      include: { flat: true, familyMembers: true, vehicles: true }
    });
    res.json(residents);
  } catch (error) {
    res.status(500).json({ error: String(error) });
  }
});

// Visitor Passes
app.get('/api/visitor-passes', async (req: Request, res: Response) => {
  try {
    const passes = await prisma.visitorPass.findMany({
      where: req.societyId ? { societyId: req.societyId } : undefined,
      orderBy: { validFrom: 'desc' }
    });
    res.json(passes);
  } catch (error) {
    res.status(500).json({ error: String(error) });
  }
});

app.post('/api/visitor-passes', async (req: Request, res: Response) => {
  try {
    const pass = await prisma.visitorPass.create({
      data: req.body
    });
    res.status(201).json(pass);
  } catch (error) {
    res.status(500).json({ error: String(error) });
  }
});

// Maintenance Tickets
app.get('/api/maintenance', async (req: Request, res: Response) => {
  try {
    const tickets = await prisma.maintenanceTicket.findMany({
      where: req.societyId ? { societyId: req.societyId } : undefined,
      orderBy: { createdAt: 'desc' }
    });
    res.json(tickets);
  } catch (error) {
    res.status(500).json({ error: String(error) });
  }
});

// Billing Invoices
app.get('/api/billing/invoices', async (req: Request, res: Response) => {
  try {
    const invoices = await prisma.billingInvoice.findMany({
      where: req.societyId ? { societyId: req.societyId } : undefined,
      include: { resident: true, flat: true },
      orderBy: { dueDate: 'asc' }
    });
    res.json(invoices);
  } catch (error) {
    res.status(500).json({ error: String(error) });
  }
});

// Parcels
app.get('/api/parcels', async (req: Request, res: Response) => {
  try {
    const parcels = await prisma.parcel.findMany({
      where: req.societyId ? { societyId: req.societyId } : undefined,
      include: { flat: true }
    });
    res.json(parcels);
  } catch (error) {
    res.status(500).json({ error: String(error) });
  }
});

// Generic Query Router for Dynamic Front-end PostgreSQL Client
app.post('/api/:table/query', async (req: Request, res: Response) => {
  const table = String(req.params.table);
  try {
    const delegate = (prisma as any)[table];
    if (!delegate || typeof delegate.findMany !== 'function') {
      return res.status(404).json({ error: `Table delegate ${table} not found in Prisma model.` });
    }
    const where: any = {};
    if (req.societyId) where.societyId = req.societyId;
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
