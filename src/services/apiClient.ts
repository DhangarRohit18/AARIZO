import { getBackendBaseUrl } from '../utils/backendConfig';

/**
 * AARIZO CommunityOS - Unified API Client
 * Connects React frontend directly to the Node.js + Express + Prisma + PostgreSQL backend.
 * Provides multi-tenant context headers (societyId, userId, userRole) and handles fallbacks.
 */

const API_BASE = `${getBackendBaseUrl()}/api`;

interface RequestOptions extends RequestInit {
  societyId?: string;
  userId?: string;
  userRole?: string;
}

function getStoredAuthHeaders(): Record<string, string> {
  const headers: Record<string, string> = {
    'Content-Type': 'application/json',
  };

  try {
    const rawUser = localStorage.getItem('aarizo_user') || localStorage.getItem('communityos_auth_user');
    if (rawUser) {
      const parsed = JSON.parse(rawUser);
      if (parsed.societyId) headers['x-society-id'] = parsed.societyId;
      if (parsed.id || parsed.uid) headers['x-user-id'] = parsed.id || parsed.uid;
      if (parsed.role) headers['x-user-role'] = parsed.role;
    }
  } catch {
    // Non-critical fallback
  }

  return headers;
}

async function apiRequest<T>(endpoint: string, options: RequestOptions = {}): Promise<T | null> {
  const url = `${API_BASE}${endpoint.startsWith('/') ? endpoint : `/${endpoint}`}`;
  const defaultHeaders = getStoredAuthHeaders();

  if (options.societyId) defaultHeaders['x-society-id'] = options.societyId;
  if (options.userId) defaultHeaders['x-user-id'] = options.userId;
  if (options.userRole) defaultHeaders['x-user-role'] = options.userRole;

  try {
    const response = await fetch(url, {
      ...options,
      headers: {
        ...defaultHeaders,
        ...(options.headers || {}),
      },
    });

    if (!response.ok) {
      const errorText = await response.text();
      console.warn(`[API] ${options.method || 'GET'} ${url} returned ${response.status}:`, errorText);
      return null;
    }

    return (await response.json()) as T;
  } catch (err) {
    console.warn(`[API] Failed to fetch ${url}. Falling back to client-side cache/state.`, err);
    return null;
  }
}

export const apiClient = {
  // Health
  checkHealth: () => apiRequest<{ status: string; engine: string }>('/health'),

  // Universal Provisioning API (7 Roles)
  provisionUser: (data: {
    societyId: string;
    role: string;
    name: string;
    email: string;
    phone: string;
    flatNumber?: string;
    password?: string;
    metadata?: Record<string, any>;
  }) =>
    apiRequest<{
      success: boolean;
      message: string;
      userId: string;
      role: string;
      temporaryPassword?: string;
      details?: any;
    }>('/secretary/provision-user', {
      method: 'POST',
      body: JSON.stringify(data),
      societyId: data.societyId,
    }),

  provisionSociety: (data: {
    societyName: string;
    address: string;
    city: string;
    state?: string;
    pincode: string;
    secretaryName: string;
    secretaryEmail: string;
    secretaryPhone: string;
    secretaryPassword?: string;
    towersCount?: number;
    flatsCount?: number;
  }) =>
    apiRequest<{
      success: boolean;
      message: string;
      societyId: string;
      userId: string;
      role: string;
      temporaryPassword?: string;
      details?: any;
    }>('/admin/provision-society', {
      method: 'POST',
      body: JSON.stringify(data),
    }),

  // Societies
  getSocieties: () => apiRequest<any[]>('/societies'),
  createSociety: (data: any) =>
    apiRequest<any>('/societies', {
      method: 'POST',
      body: JSON.stringify(data),
    }),
  updateSociety: (id: string, data: any) =>
    apiRequest<any>(`/societies/${id}`, {
      method: 'PATCH',
      body: JSON.stringify(data),
    }),
  deleteSociety: (id: string) =>
    apiRequest<any>(`/societies/${id}`, {
      method: 'DELETE',
    }),

  // Committee Members
  getCommitteeMembers: (societyId?: string) => apiRequest<any[]>('/committee', { societyId }),
  createCommitteeMember: (data: {
    societyId?: string;
    name: string;
    email: string;
    phone: string;
    designation: string;
    flatNumber?: string;
  }) =>
    apiRequest<any>('/committee', {
      method: 'POST',
      body: JSON.stringify(data),
      societyId: data.societyId,
    }),

  // Child Safety
  getChildren: (societyId?: string) => apiRequest<any[]>('/children', { societyId }),
  createChild: (data: any) =>
    apiRequest<any>('/children', {
      method: 'POST',
      body: JSON.stringify(data),
    }),
  getChildPasses: (societyId?: string) => apiRequest<any[]>('/children/passes', { societyId }),
  createChildPass: (data: any) =>
    apiRequest<any>('/children/passes', {
      method: 'POST',
      body: JSON.stringify(data),
    }),
  verifyChildPass: (id: string, societyId?: string) =>
    apiRequest<any>(`/children/passes/${id}/verify`, {
      method: 'POST',
      body: JSON.stringify({ societyId }),
    }),
  triggerChildSOS: (data: any) =>
    apiRequest<any>('/children/sos', {
      method: 'POST',
      body: JSON.stringify(data),
    }),

  // Flats
  getFlats: (societyId?: string) => apiRequest<any[]>('/flats', { societyId }),
  createFlat: (data: any) =>
    apiRequest<any>('/flats', {
      method: 'POST',
      body: JSON.stringify(data),
    }),
  deleteFlat: (id: string) =>
    apiRequest<any>(`/flats/${id}`, {
      method: 'DELETE',
    }),

  // Residents
  getResidents: (societyId?: string) => apiRequest<any[]>('/residents', { societyId }),
  createResident: (data: any) =>
    apiRequest<any>('/residents', {
      method: 'POST',
      body: JSON.stringify(data),
    }),
  updateResident: (id: string, data: any) =>
    apiRequest<any>(`/residents/${id}`, {
      method: 'PATCH',
      body: JSON.stringify(data),
    }),
  deleteResident: (id: string) =>
    apiRequest<any>(`/residents/${id}`, {
      method: 'DELETE',
    }),

  // Visitor Passes
  getVisitorPasses: (societyId?: string) => apiRequest<any[]>('/visitor-passes', { societyId }),
  verifyVisitorPass: (codeOrQr: string, societyId?: string) =>
    apiRequest<any>('/visitor-passes/verify', {
      method: 'POST',
      body: JSON.stringify({ codeOrQr, societyId }),
    }),
  createVisitorPass: (data: any) =>
    apiRequest<any>('/visitor-passes', {
      method: 'POST',
      body: JSON.stringify(data),
    }),
  deleteVisitorPass: (id: string) =>
    apiRequest<any>(`/visitor-passes/${id}`, {
      method: 'DELETE',
    }),

  // Maintenance Tickets
  getMaintenanceTickets: (societyId?: string) => apiRequest<any[]>('/maintenance', { societyId }),
  createMaintenanceTicket: (data: any) =>
    apiRequest<any>('/maintenance', {
      method: 'POST',
      body: JSON.stringify(data),
    }),
  updateMaintenanceTicket: (id: string, data: any) =>
    apiRequest<any>(`/maintenance/${id}`, {
      method: 'PATCH',
      body: JSON.stringify(data),
    }),

  // Billing Invoices
  getBillingInvoices: (societyId?: string) => apiRequest<any[]>('/billing/invoices', { societyId }),
  updateBillingInvoice: (id: string, data: any) =>
    apiRequest<any>(`/billing/invoices/${id}`, {
      method: 'PATCH',
      body: JSON.stringify(data),
    }),

  // Parcels
  getParcels: (societyId?: string) => apiRequest<any[]>('/parcels', { societyId }),
  createParcel: (data: any) =>
    apiRequest<any>('/parcels', {
      method: 'POST',
      body: JSON.stringify(data),
    }),
  collectParcel: (id: string, collectedBy?: string) =>
    apiRequest<any>(`/parcels/${id}/collect`, {
      method: 'PATCH',
      body: JSON.stringify({ collectedBy }),
    }),

  // Staff
  getStaff: (societyId?: string) => apiRequest<any[]>('/staff', { societyId }),

  // Domestic Workers
  getDomesticWorkers: (societyId?: string) => apiRequest<any[]>('/domestic-workers', { societyId }),

  // Vendors
  getVendors: (societyId?: string) => apiRequest<any[]>('/vendors', { societyId }),

  // Amenities
  getAmenities: (societyId?: string) => apiRequest<any[]>('/amenities', { societyId }),

  // Announcements
  getAnnouncements: (societyId?: string) => apiRequest<any[]>('/announcements', { societyId }),
  createAnnouncement: (data: any) =>
    apiRequest<any>('/announcements', {
      method: 'POST',
      body: JSON.stringify(data),
    }),

  // Community Events
  getCommunityEvents: (societyId?: string) => apiRequest<any[]>('/community-events', { societyId }),
  createCommunityEvent: (data: any) =>
    apiRequest<any>('/community-events', {
      method: 'POST',
      body: JSON.stringify(data),
    }),

  // Emergency Incidents
  getEmergencyIncidents: (societyId?: string) => apiRequest<any[]>('/emergency-incidents', { societyId }),
  createEmergencyIncident: (data: any) =>
    apiRequest<any>('/emergency-incidents', {
      method: 'POST',
      body: JSON.stringify(data),
    }),

  // Notifications
  getNotifications: (societyId?: string) => apiRequest<any[]>('/notifications', { societyId }),
  markNotificationRead: (id: string) =>
    apiRequest<any>(`/notifications/${id}/read`, {
      method: 'PATCH',
    }),

  // File Upload Engine
  uploadFile: async (file: File, category: string = 'attachments'): Promise<{ success: boolean; url: string; fullUrl: string; filename: string; size: number }> => {
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.onload = async () => {
        try {
          const fileData = reader.result as string;
          const res = await apiRequest<{ success: boolean; url: string; filename: string; size: number }>('/upload', {
            method: 'POST',
            body: JSON.stringify({
              filename: file.name,
              fileData,
              category,
            }),
          });
          if (!res || !res.url) {
            throw new Error('Upload failed on server');
          }
          const baseUrl = API_BASE.replace(/\/api$/, '');
          const relativeOrAbsUrl = res.url;
          resolve({
            success: Boolean(res.success),
            url: relativeOrAbsUrl,
            filename: res.filename || file.name,
            size: res.size || file.size,
            fullUrl: relativeOrAbsUrl.startsWith('http') ? relativeOrAbsUrl : `${baseUrl}${relativeOrAbsUrl}`,
          });
        } catch (err) {
          reject(err);
        }
      };
      reader.onerror = (err) => reject(err);
      reader.readAsDataURL(file);
    });
  },

  // Razorpay Payment Engine
  createRazorpayOrder: (invoiceId: string, amount: number) =>
    apiRequest<{ orderId: string; amount: number; currency: string; keyId: string; notes?: any }>('/payments/razorpay/create-order', {
      method: 'POST',
      body: JSON.stringify({ invoiceId, amount }),
    }),

  verifyRazorpayPayment: (data: { invoiceId: string; razorpayPaymentId: string; razorpayOrderId: string; amount: number; razorpaySignature?: string }) =>
    apiRequest<{ success: boolean; message: string; invoice: any; transactionId: string }>('/payments/razorpay/verify', {
      method: 'POST',
      body: JSON.stringify(data),
    }),

  refundRazorpayPayment: (data: { paymentId: string; amount: number; reason: string }) =>
    apiRequest<{ success: boolean; refundId: string; amount: number; message: string }>('/payments/razorpay/refund', {
      method: 'POST',
      body: JSON.stringify(data),
    }),

  getPayments: (societyId?: string, residentId?: string, invoiceId?: string) => {
    const params = new URLSearchParams();
    if (societyId) params.append('societyId', societyId);
    if (residentId) params.append('residentId', residentId);
    if (invoiceId) params.append('invoiceId', invoiceId);
    const queryString = params.toString() ? `?${params.toString()}` : '';
    return apiRequest<any[]>(`/payments${queryString}`, { societyId });
  },

  // Advertisements & Sponsored Offers
  getAdvertisements: (societyId?: string) => apiRequest<any[]>('/advertisements', { societyId }),
  createAdvertisement: (data: any) =>
    apiRequest<any>('/advertisements', {
      method: 'POST',
      body: JSON.stringify(data),
    }),
  recordAdView: (id: string) =>
    apiRequest<any>(`/advertisements/${id}/view`, {
      method: 'POST',
    }),
  recordAdClick: (id: string) =>
    apiRequest<any>(`/advertisements/${id}/click`, {
      method: 'POST',
    }),

  // Vendors
  registerVendor: (data: any) =>
    apiRequest<any>('/vendors', {
      method: 'POST',
      body: JSON.stringify(data),
    }),
  updateVendor: (id: string, data: any) =>
    apiRequest<any>(`/vendors/${id}`, {
      method: 'PATCH',
      body: JSON.stringify(data),
    }),
  deleteVendor: (id: string) =>
    apiRequest<any>(`/vendors/${id}`, {
      method: 'DELETE',
    }),

  // Generic Query
  queryTable: (table: string, societyId?: string) =>
    apiRequest<any[]>(`/${table}/query`, {
      method: 'POST',
      societyId,
    }),
};
