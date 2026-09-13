import type { VendorPartner, ServiceItem, ServiceBookingOrder } from '../types';
import { realTimeSync } from '../../../services/realTimeSync';

const STORAGE_KEY_VENDORS = 'aarizo_vendors_v1';
const STORAGE_KEY_SERVICE_ITEMS = 'aarizo_service_items_v1';
const STORAGE_KEY_ORDERS = 'aarizo_service_orders_v1';

const INITIAL_VENDORS: VendorPartner[] = [
  {
    id: 'vnd-101',
    societyId: 'soc-1',
    businessName: 'CoolCare AC Services',
    contactPerson: 'Ramesh Sharma',
    phone: '+91 98765 11111',
    email: 'contact@coolcare.com',
    category: 'AC_REPAIR',
    approvalStatus: 'APPROVED',
    availability: 'AVAILABLE',
    rating: 4.8,
    ratingCount: 24,
    description: 'Expert AC servicing, gas refilling, and chemical wash.',
    createdAt: '2026-01-01T09:00:00Z',
  },
  {
    id: 'vnd-102',
    societyId: 'soc-1',
    businessName: 'QuickFix Plumbing',
    contactPerson: 'Suresh Kumar',
    phone: '+91 98765 22222',
    email: 'suresh@quickfix.com',
    category: 'PLUMBER',
    approvalStatus: 'APPROVED',
    availability: 'AVAILABLE',
    rating: 4.6,
    ratingCount: 18,
    description: '24x7 Emergency plumbing, pipe fitting, and leak repairs.',
    createdAt: '2026-01-01T09:00:00Z',
  },
  {
    id: 'vnd-103',
    societyId: 'soc-1',
    businessName: 'Sparkle Housekeeping & Laundry',
    contactPerson: 'Anita Devi',
    phone: '+91 98765 33333',
    email: 'anita@sparkle.com',
    category: 'LAUNDRY',
    approvalStatus: 'APPROVED',
    availability: 'AVAILABLE',
    rating: 4.9,
    ratingCount: 42,
    description: 'Doorstep steam iron, dry cleaning, and weekly laundry subscriptions.',
    createdAt: '2026-01-01T09:00:00Z',
  },
  {
    id: 'vnd-104',
    societyId: 'soc-1',
    businessName: 'GreenThumb Pest Control',
    contactPerson: 'Vikram Joshi',
    phone: '+91 98765 44444',
    email: 'info@greenthumb.com',
    category: 'PEST_CONTROL',
    approvalStatus: 'PENDING_APPROVAL',
    availability: 'AVAILABLE',
    rating: 4.5,
    ratingCount: 10,
    description: 'Eco-friendly pest treatment for cockroaches, termites, and bedbugs.',
    createdAt: '2026-09-10T09:00:00Z',
  },
];

const INITIAL_SERVICE_ITEMS: ServiceItem[] = [
  {
    id: 'item-201',
    vendorId: 'vnd-101',
    title: 'Split AC Chemical Servicing',
    category: 'AC_REPAIR',
    price: 599,
    unit: 'per unit',
    description: 'Deep foam cleaning, filter wash, and gas pressure check.',
    isAvailable: true,
  },
  {
    id: 'item-202',
    vendorId: 'vnd-102',
    title: 'Tap & Leakage Repair',
    category: 'PLUMBER',
    price: 299,
    unit: 'per visit',
    description: 'Fixing dripping taps, flush valves, and minor pipe leaks.',
    isAvailable: true,
  },
  {
    id: 'item-203',
    vendorId: 'vnd-103',
    title: 'Monthly Laundry Subscription (20 Kg)',
    category: 'LAUNDRY',
    price: 1499,
    unit: 'per month',
    description: 'Weekly door pickup, wash, fold & steam iron for 20 kgs.',
    isAvailable: true,
  },
];

const INITIAL_ORDERS: ServiceBookingOrder[] = [
  {
    id: 'ord-301',
    orderNumber: 'ORD-SRV-9871',
    societyId: 'soc-1',
    residentId: 'res-1',
    residentName: 'Siddharth Malhotra',
    flatCode: 'A-101',
    phone: '+91 98765 00000',
    vendorId: 'vnd-101',
    vendorName: 'CoolCare AC Services',
    category: 'AC_REPAIR',
    serviceTitle: 'Split AC Chemical Servicing',
    price: 599,
    recurringSchedule: 'MONTHLY',
    scheduledDate: '2026-09-16',
    status: 'ACCEPTED',
    createdAt: '2026-09-14T08:00:00Z',
    updatedAt: '2026-09-14T08:30:00Z',
  },
];

class SocietyServicesEngine {
  private getStoredVendors(): VendorPartner[] {
    const raw = localStorage.getItem(STORAGE_KEY_VENDORS);
    if (!raw) {
      localStorage.setItem(STORAGE_KEY_VENDORS, JSON.stringify(INITIAL_VENDORS));
      return INITIAL_VENDORS;
    }
    try {
      return JSON.parse(raw);
    } catch {
      return INITIAL_VENDORS;
    }
  }

  private saveVendors(vendors: VendorPartner[]) {
    localStorage.setItem(STORAGE_KEY_VENDORS, JSON.stringify(vendors));
    realTimeSync.publish('SERVICES_UPDATED', { timestamp: new Date().toISOString() });
  }

  private getStoredItems(): ServiceItem[] {
    const raw = localStorage.getItem(STORAGE_KEY_SERVICE_ITEMS);
    if (!raw) {
      localStorage.setItem(STORAGE_KEY_SERVICE_ITEMS, JSON.stringify(INITIAL_SERVICE_ITEMS));
      return INITIAL_SERVICE_ITEMS;
    }
    try {
      return JSON.parse(raw);
    } catch {
      return INITIAL_SERVICE_ITEMS;
    }
  }

  private saveItems(items: ServiceItem[]) {
    localStorage.setItem(STORAGE_KEY_SERVICE_ITEMS, JSON.stringify(items));
    realTimeSync.publish('SERVICES_UPDATED', { timestamp: new Date().toISOString() });
  }

  private getStoredOrders(): ServiceBookingOrder[] {
    const raw = localStorage.getItem(STORAGE_KEY_ORDERS);
    if (!raw) {
      localStorage.setItem(STORAGE_KEY_ORDERS, JSON.stringify(INITIAL_ORDERS));
      return INITIAL_ORDERS;
    }
    try {
      return JSON.parse(raw);
    } catch {
      return INITIAL_ORDERS;
    }
  }

  private saveOrders(orders: ServiceBookingOrder[]) {
    localStorage.setItem(STORAGE_KEY_ORDERS, JSON.stringify(orders));
    realTimeSync.publish('SERVICES_UPDATED', { timestamp: new Date().toISOString() });
  }

  // --- VENDOR API ---
  public getVendors(): VendorPartner[] {
    return this.getStoredVendors();
  }

  public approveVendor(vendorId: string): VendorPartner | null {
    const vendors = this.getStoredVendors();
    const index = vendors.findIndex(v => v.id === vendorId);
    if (index === -1) return null;

    const updated: VendorPartner = {
      ...vendors[index],
      approvalStatus: 'APPROVED',
    };

    vendors[index] = updated;
    this.saveVendors(vendors);
    return updated;
  }

  public suspendVendor(vendorId: string): VendorPartner | null {
    const vendors = this.getStoredVendors();
    const index = vendors.findIndex(v => v.id === vendorId);
    if (index === -1) return null;

    const updated: VendorPartner = {
      ...vendors[index],
      approvalStatus: 'SUSPENDED',
    };

    vendors[index] = updated;
    this.saveVendors(vendors);
    return updated;
  }

  // --- SERVICE ITEMS API ---
  public getServiceItems(): ServiceItem[] {
    return this.getStoredItems();
  }

  public addServiceItem(item: Omit<ServiceItem, 'id'>): ServiceItem {
    const items = this.getStoredItems();
    const newItem: ServiceItem = {
      ...item,
      id: `item-${Date.now()}`,
    };
    items.unshift(newItem);
    this.saveItems(items);
    return newItem;
  }

  // --- ORDERS & RECURRING SCHEDULE API ---
  public getOrders(): ServiceBookingOrder[] {
    return this.getStoredOrders();
  }

  public createOrder(
    data: Omit<ServiceBookingOrder, 'id' | 'orderNumber' | 'status' | 'createdAt' | 'updatedAt'>
  ): ServiceBookingOrder {
    const orders = this.getStoredOrders();
    const newId = `ord-${Date.now()}`;
    const timestamp = new Date().toISOString();
    const orderNumber = `ORD-SRV-${Math.floor(1000 + Math.random() * 9000)}`;

    const newOrder: ServiceBookingOrder = {
      ...data,
      id: newId,
      orderNumber,
      status: 'PENDING',
      createdAt: timestamp,
      updatedAt: timestamp,
    };

    orders.unshift(newOrder);
    this.saveOrders(orders);
    return newOrder;
  }

  public updateOrderStatus(orderId: string, status: OrderStatus): ServiceBookingOrder | null {
    const orders = this.getStoredOrders();
    const index = orders.findIndex(o => o.id === orderId);
    if (index === -1) return null;

    const timestamp = new Date().toISOString();
    const updated: ServiceBookingOrder = {
      ...orders[index],
      status,
      updatedAt: timestamp,
    };

    orders[index] = updated;
    this.saveOrders(orders);
    return updated;
  }

  public rateOrder(orderId: string, rating: number, reviewNotes?: string): ServiceBookingOrder | null {
    const orders = this.getStoredOrders();
    const index = orders.findIndex(o => o.id === orderId);
    if (index === -1) return null;

    const timestamp = new Date().toISOString();
    const updated: ServiceBookingOrder = {
      ...orders[index],
      rating,
      reviewNotes,
      updatedAt: timestamp,
    };

    orders[index] = updated;
    this.saveOrders(orders);
    return updated;
  }
}

export const societyServicesEngine = new SocietyServicesEngine();
