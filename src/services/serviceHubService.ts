import type {
  VendorPartner,
  ServiceCatalogItem,
  MarketplaceOrder,
  ServiceHubCategory,
  VendorApprovalStatus,
  MarketplaceOrderStatus,
} from '../types/serviceHub';
import { logAudit } from './societyService';

const STORAGE_KEYS = {
  VENDORS: 'communityos_marketplace_vendors_v7',
  ITEMS: 'communityos_marketplace_items_v7',
  ORDERS: 'communityos_marketplace_orders_v7',
};

const SEED_VENDORS: VendorPartner[] = [
  {
    id: 'ven-groc-1',
    societyId: 'soc-gvs',
    businessName: 'FreshMart Organic Groceries',
    contactPerson: 'Sunil Verma',
    phone: '9820011990',
    email: 'sunil@freshmart.com',
    category: 'GROCERY',
    approvalStatus: 'APPROVED',
    availability: 'AVAILABLE',
    commissionPercentage: 5,
    rating: 4.8,
    ratingCount: 34,
    bannerImage: 'https://images.unsplash.com/photo-1542838132-92c53300491e?auto=format&fit=crop&w=400&q=80',
    description: 'Fresh organic vegetables, fruits, and daily essential groceries delivered to your door.',
    createdAt: '2025-05-10',
  },
  {
    id: 'ven-laundry-1',
    societyId: 'soc-gvs',
    businessName: 'Express Steam Laundry & DryClean',
    contactPerson: 'Anand Shinde',
    phone: '9819922001',
    email: 'anand@expresslaundry.com',
    category: 'LAUNDRY',
    approvalStatus: 'APPROVED',
    availability: 'AVAILABLE',
    commissionPercentage: 7,
    rating: 4.7,
    ratingCount: 22,
    bannerImage: 'https://images.unsplash.com/photo-1517677208171-0bc6725a3e60?auto=format&fit=crop&w=400&q=80',
    description: 'Same day laundry wash & fold, steam pressing, and suit dry cleaning.',
    createdAt: '2025-06-12',
  },
  {
    id: 'ven-ac-1',
    societyId: 'soc-gvs',
    businessName: 'CoolComfort AC Repair & Servicing',
    contactPerson: 'Imran Khan',
    phone: '9870033112',
    email: 'imran@coolcomfort.com',
    category: 'AC_SERVICE',
    approvalStatus: 'APPROVED',
    availability: 'AVAILABLE',
    commissionPercentage: 10,
    rating: 4.9,
    ratingCount: 45,
    bannerImage: 'https://images.unsplash.com/photo-1621905251189-08b45d6a269e?auto=format&fit=crop&w=400&q=80',
    description: 'Split AC deep foam jet service, gas refill, and PCB repair.',
    createdAt: '2025-07-01',
  },
  {
    id: 'ven-tiffin-1',
    societyId: 'soc-gvs',
    businessName: 'Homely Swad Tiffin Service',
    contactPerson: 'Sarita Joshi',
    phone: '9811100223',
    email: 'sarita@homelyswad.com',
    category: 'TIFFIN',
    approvalStatus: 'APPROVED',
    availability: 'AVAILABLE',
    commissionPercentage: 5,
    rating: 4.6,
    ratingCount: 19,
    bannerImage: 'https://images.unsplash.com/photo-1546069901-ba9599a7e63c?auto=format&fit=crop&w=400&q=80',
    description: 'Healthy home-cooked North & South Indian lunch & dinner thali tiffin delivery.',
    createdAt: '2025-08-15',
  },
  {
    id: 'ven-carwash-1',
    societyId: 'soc-gvs',
    businessName: 'ShineX Eco Doorstep Car Wash',
    contactPerson: 'Vikram Jadhav',
    phone: '9833344110',
    email: 'vikram@shinex.com',
    category: 'CAR_WASH',
    approvalStatus: 'APPROVED',
    availability: 'AVAILABLE',
    commissionPercentage: 8,
    rating: 4.8,
    ratingCount: 28,
    bannerImage: 'https://images.unsplash.com/photo-1520340356584-f9917d1eea6f?auto=format&fit=crop&w=400&q=80',
    description: 'Waterless eco car wash, interior vacuuming, and dashboard polish in your parking slot.',
    createdAt: '2025-09-01',
  },
  {
    id: 'ven-med-1',
    societyId: 'soc-gvs',
    businessName: 'MedPlus 24x7 Express Pharmacy',
    contactPerson: 'Dr. Rahul Mehta',
    phone: '9822003344',
    email: 'rahul@medplus.com',
    category: 'MEDICINE',
    approvalStatus: 'PENDING_APPROVAL',
    availability: 'AVAILABLE',
    commissionPercentage: 5,
    rating: 0,
    ratingCount: 0,
    bannerImage: 'https://images.unsplash.com/photo-1584308666744-24d5c474f2ae?auto=format&fit=crop&w=400&q=80',
    description: 'Prescription medicines and healthcare supplies delivered in 30 minutes.',
    createdAt: '2026-09-10',
  },
];

const SEED_ITEMS: ServiceCatalogItem[] = [
  {
    id: 'item-1',
    vendorId: 'ven-groc-1',
    societyId: 'soc-gvs',
    title: 'Organic Farm Fresh Milk (1 Liter)',
    category: 'GROCERY',
    price: 68,
    description: 'Pure cow milk delivered fresh every morning.',
    unit: 'per pouch',
    isAvailable: true,
  },
  {
    id: 'item-2',
    vendorId: 'ven-groc-1',
    societyId: 'soc-gvs',
    title: 'Fresh Alphonso Mangoes (1 Dozen)',
    category: 'GROCERY',
    price: 650,
    description: 'Naturally ripened Ratnagiri Alphonso mangoes.',
    unit: 'per box',
    isAvailable: true,
  },
  {
    id: 'item-3',
    vendorId: 'ven-laundry-1',
    societyId: 'soc-gvs',
    title: 'Men 2-Piece Suit Dry Cleaning',
    category: 'LAUNDRY',
    price: 350,
    description: 'Professional stain removal and steam press.',
    unit: 'per set',
    isAvailable: true,
  },
  {
    id: 'item-4',
    vendorId: 'ven-ac-1',
    societyId: 'soc-gvs',
    title: 'Split AC Power Jet Deep Service',
    category: 'AC_SERVICE',
    price: 599,
    description: 'High-pressure water jet cleaning for indoor and outdoor coils.',
    unit: 'per AC unit',
    isAvailable: true,
  },
  {
    id: 'item-5',
    vendorId: 'ven-tiffin-1',
    societyId: 'soc-gvs',
    title: 'Special Deluxe Veg Thali',
    category: 'TIFFIN',
    price: 160,
    description: '2 Sabzi, 4 Roti, Dal, Rice, Salad, Sweet & Raita.',
    unit: 'per meal',
    isAvailable: true,
  },
  {
    id: 'item-6',
    vendorId: 'ven-carwash-1',
    societyId: 'soc-gvs',
    title: 'SUV Foam Wash & Interior Polish',
    category: 'CAR_WASH',
    price: 450,
    description: 'Full exterior foam wash, tire dressing, and interior vacuuming.',
    unit: 'per car',
    isAvailable: true,
  },
];

const SEED_ORDERS: MarketplaceOrder[] = [
  {
    id: 'ord-101',
    orderNumber: 'ORD-2026-9910',
    societyId: 'soc-gvs',
    vendorId: 'ven-ac-1',
    vendorName: 'CoolComfort AC Repair & Servicing',
    flatId: 'flat-1204',
    flatCode: 'B-1204',
    residentId: 'res-1',
    residentName: 'Rajesh Kumar',
    residentPhone: '9811009922',
    category: 'AC_SERVICE',
    items: [
      { itemId: 'item-4', title: 'Split AC Power Jet Deep Service', price: 599, quantity: 2 },
    ],
    subtotalAmount: 1198,
    commissionFee: 119.8,
    totalAmount: 1198,
    status: 'DISPATCHED_IN_PROGRESS',
    deliverySlot: 'Today, 04:00 PM',
    specialInstructions: 'Please ring bell twice upon arrival.',
    createdAt: '2026-09-13T10:00:00Z',
    updatedAt: '2026-09-13T11:15:00Z',
  },
  {
    id: 'ord-102',
    orderNumber: 'ORD-2026-9911',
    societyId: 'soc-gvs',
    vendorId: 'ven-tiffin-1',
    vendorName: 'Homely Swad Tiffin Service',
    flatId: 'flat-301',
    flatCode: 'C-301',
    residentId: 'res-3',
    residentName: 'Siddharth Patel',
    residentPhone: '9811001199',
    category: 'TIFFIN',
    items: [
      { itemId: 'item-5', title: 'Special Deluxe Veg Thali', price: 160, quantity: 2 },
    ],
    subtotalAmount: 320,
    commissionFee: 16,
    totalAmount: 320,
    status: 'DELIVERED_COMPLETED',
    deliverySlot: 'Today, 01:00 PM',
    rating: 5,
    reviewNotes: 'Fresh piping hot food delivered right on time!',
    createdAt: '2026-09-13T11:00:00Z',
    updatedAt: '2026-09-13T13:00:00Z',
  },
];

function getItem<T>(key: string, defaultValue: T): T {
  try {
    const raw = localStorage.getItem(key);
    if (!raw) {
      localStorage.setItem(key, JSON.stringify(defaultValue));
      return defaultValue;
    }
    return JSON.parse(raw);
  } catch {
    return defaultValue;
  }
}

function setItem<T>(key: string, value: T): void {
  try {
    localStorage.setItem(key, JSON.stringify(value));
  } catch (err) {
    console.error(`Failed to save service hub data to key ${key}:`, err);
  }
}

export const serviceHubService = {
  getVendors: (societyId: string): VendorPartner[] =>
    getItem(STORAGE_KEYS.VENDORS, SEED_VENDORS).filter((v) => v.societyId === societyId),

  getCatalogItems: (societyId: string, vendorId?: string): ServiceCatalogItem[] => {
    const items = getItem(STORAGE_KEYS.ITEMS, SEED_ITEMS).filter((i) => i.societyId === societyId);
    return vendorId ? items.filter((i) => i.vendorId === vendorId) : items;
  },

  getOrders: (societyId: string, filterVendorId?: string, filterResidentId?: string): MarketplaceOrder[] => {
    let orders = getItem(STORAGE_KEYS.ORDERS, SEED_ORDERS).filter((o) => o.societyId === societyId);
    if (filterVendorId) orders = orders.filter((o) => o.vendorId === filterVendorId);
    if (filterResidentId) orders = orders.filter((o) => o.residentId === filterResidentId);
    return orders;
  },

  registerVendor: (
    data: {
      societyId: string;
      businessName: string;
      contactPerson: string;
      phone: string;
      email: string;
      category: ServiceHubCategory;
      description: string;
    },
    actor: { id: string; name: string; role: string }
  ): VendorPartner => {
    const vendors = getItem(STORAGE_KEYS.VENDORS, SEED_VENDORS);
    const newVendor: VendorPartner = {
      ...data,
      id: `ven-${Date.now()}`,
      approvalStatus: 'PENDING_APPROVAL',
      availability: 'AVAILABLE',
      commissionPercentage: 5,
      rating: 0,
      ratingCount: 0,
      bannerImage: 'https://images.unsplash.com/photo-1556742049-0a670f4a4591?auto=format&fit=crop&w=400&q=80',
      createdAt: new Date().toISOString().split('T')[0],
    };

    setItem(STORAGE_KEYS.VENDORS, [newVendor, ...vendors]);
    logAudit(data.societyId, actor, 'CREATE', 'VendorPartner', newVendor.id, `Registered marketplace vendor ${data.businessName}`);
    return newVendor;
  },

  updateVendorStatus: (
    vendorId: string,
    approvalStatus: VendorApprovalStatus,
    commissionPercentage: number,
    actor: { id: string; name: string; role: string }
  ): VendorPartner | null => {
    const vendors = getItem(STORAGE_KEYS.VENDORS, SEED_VENDORS);
    const idx = vendors.findIndex((v) => v.id === vendorId);
    if (idx === -1) return null;

    vendors[idx].approvalStatus = approvalStatus;
    vendors[idx].commissionPercentage = commissionPercentage;

    setItem(STORAGE_KEYS.VENDORS, vendors);
    logAudit(vendors[idx].societyId, actor, 'STATUS_CHANGE', 'VendorPartner', vendorId, `Updated vendor ${vendors[idx].businessName} status to ${approvalStatus}`);
    return vendors[idx];
  },

  createCatalogItem: (
    data: {
      societyId: string;
      vendorId: string;
      title: string;
      category: ServiceHubCategory;
      price: number;
      unit: string;
      description: string;
      imageUrl?: string;
    },
    actor: { id: string; name: string; role: string }
  ): ServiceCatalogItem => {
    const items = getItem(STORAGE_KEYS.ITEMS, SEED_ITEMS);
    const newItem: ServiceCatalogItem = {
      ...data,
      id: `item-${Date.now()}`,
      isAvailable: true,
    };

    setItem(STORAGE_KEYS.ITEMS, [newItem, ...items]);
    logAudit(data.societyId, actor, 'CREATE', 'ServiceCatalogItem', newItem.id, `Added catalog item ${data.title}`);
    return newItem;
  },

  createOrder: (
    data: {
      societyId: string;
      vendorId: string;
      vendorName: string;
      flatId: string;
      flatCode: string;
      residentId: string;
      residentName: string;
      residentPhone: string;
      category: ServiceHubCategory;
      items: { itemId: string; title: string; price: number; quantity: number }[];
      subtotalAmount: number;
      deliverySlot?: string;
      specialInstructions?: string;
    },
    actor: { id: string; name: string; role: string }
  ): MarketplaceOrder => {
    const orders = getItem(STORAGE_KEYS.ORDERS, SEED_ORDERS);
    const vendors = getItem(STORAGE_KEYS.VENDORS, SEED_VENDORS);
    const vendor = vendors.find((v) => v.id === data.vendorId);
    const commissionPercentage = vendor ? vendor.commissionPercentage : 5;
    const commissionFee = Math.round((data.subtotalAmount * commissionPercentage) / 100);

    const newOrder: MarketplaceOrder = {
      ...data,
      id: `ord-${Date.now()}`,
      orderNumber: `ORD-${new Date().getFullYear()}-${Math.floor(1000 + Math.random() * 9000)}`,
      commissionFee,
      totalAmount: data.subtotalAmount,
      status: 'PENDING',
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };

    setItem(STORAGE_KEYS.ORDERS, [newOrder, ...orders]);
    logAudit(data.societyId, actor, 'CREATE', 'MarketplaceOrder', newOrder.id, `Placed marketplace order ${newOrder.orderNumber}`);
    return newOrder;
  },

  updateOrderStatus: (
    orderId: string,
    status: MarketplaceOrderStatus,
    actor: { id: string; name: string; role: string }
  ): MarketplaceOrder | null => {
    const orders = getItem(STORAGE_KEYS.ORDERS, SEED_ORDERS);
    const idx = orders.findIndex((o) => o.id === orderId);
    if (idx === -1) return null;

    orders[idx].status = status;
    orders[idx].updatedAt = new Date().toISOString();

    setItem(STORAGE_KEYS.ORDERS, orders);
    logAudit(orders[idx].societyId, actor, 'STATUS_CHANGE', 'MarketplaceOrder', orderId, `Updated order ${orders[idx].orderNumber} status to ${status}`);
    return orders[idx];
  },

  cancelOrder: (
    orderId: string,
    cancellationReason: string,
    actor: { id: string; name: string; role: string }
  ): MarketplaceOrder | null => {
    const orders = getItem(STORAGE_KEYS.ORDERS, SEED_ORDERS);
    const idx = orders.findIndex((o) => o.id === orderId);
    if (idx === -1) return null;

    orders[idx].status = 'CANCELLED';
    orders[idx].cancellationReason = cancellationReason;
    orders[idx].updatedAt = new Date().toISOString();

    setItem(STORAGE_KEYS.ORDERS, orders);
    logAudit(orders[idx].societyId, actor, 'STATUS_CHANGE', 'MarketplaceOrder', orderId, `Cancelled order ${orders[idx].orderNumber}`);
    return orders[idx];
  },

  rateOrder: (
    orderId: string,
    rating: number,
    reviewNotes: string,
    actor: { id: string; name: string; role: string }
  ): MarketplaceOrder | null => {
    const orders = getItem(STORAGE_KEYS.ORDERS, SEED_ORDERS);
    const idx = orders.findIndex((o) => o.id === orderId);
    if (idx === -1) return null;

    orders[idx].rating = rating;
    orders[idx].reviewNotes = reviewNotes;
    orders[idx].updatedAt = new Date().toISOString();

    // Update Vendor Rating average
    const vendors = getItem(STORAGE_KEYS.VENDORS, SEED_VENDORS);
    const vIdx = vendors.findIndex((v) => v.id === orders[idx].vendorId);
    if (vIdx !== -1) {
      const count = vendors[vIdx].ratingCount + 1;
      const avg = (vendors[vIdx].rating * vendors[vIdx].ratingCount + rating) / count;
      vendors[vIdx].rating = Number(avg.toFixed(1));
      vendors[vIdx].ratingCount = count;
      setItem(STORAGE_KEYS.VENDORS, vendors);
    }

    setItem(STORAGE_KEYS.ORDERS, orders);
    logAudit(orders[idx].societyId, actor, 'UPDATE', 'MarketplaceOrder', orderId, `Rated order ${orders[idx].orderNumber} with ${rating} stars`);
    return orders[idx];
  },
};
