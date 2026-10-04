import React, { useState, useEffect, useMemo } from 'react';
import { Link } from 'react-router-dom';
import {
  LayoutDashboard,
  ShoppingBag,
  Inbox,
  Briefcase,
  CreditCard,
  FileText,
  ShieldCheck,
  Star,
  Bell,
  User,
  Plus,
  CheckCircle2,
  Clock,
  AlertTriangle,
  TrendingUp,
  Edit3,
  Trash2,
  ExternalLink,
  ToggleLeft,
  ToggleRight,
  X,
  Download,
} from 'lucide-react';
import { PageHeader, StatCard, StatusBadge, ConfirmDialog } from '../../components/ui';
import { FileUploader } from '../../components/common';
import { useAuth } from '../../context/AuthContext';
import {
  vendorRepository,
  vendorServiceRepository,
  vendorRequestRepository,
  vendorDocumentRepository,
} from '../../repositories/vendors';
import type {
  VendorProfile,
  VendorService,
  VendorRequest,
  VendorDocument,
  PricingType,
  ServiceAvailability,
  VendorRequestStatus,
  VendorDocumentType,
} from '../../domains/vendors/types';

export const VendorDashboard: React.FC = () => {
  const { currentUser } = useAuth();
  const vendorUid = currentUser?.uid || currentUser?.id || 'user-vendor-01';
  const societyId = currentUser?.societyId || 'soc-gvs';

  type ActiveTab =
    | 'dashboard'
    | 'services'
    | 'requests'
    | 'orders'
    | 'payments'
    | 'invoices'
    | 'documents'
    | 'reviews'
    | 'notifications'
    | 'profile';

  const [activeTab, setActiveTab] = useState<ActiveTab>('dashboard');

  // Real-time state
  const [profile, setProfile] = useState<VendorProfile | null>(null);
  const [services, setServices] = useState<VendorService[]>([]);
  const [requests, setRequests] = useState<VendorRequest[]>([]);
  const [documents, setDocuments] = useState<VendorDocument[]>([]);
  const [syncStatus, setSyncStatus] = useState<'LIVE' | 'SYNCING' | 'OFFLINE'>('SYNCING');

  // Service Modal state
  const [isServiceModalOpen, setIsServiceModalOpen] = useState(false);
  const [editingServiceId, setEditingServiceId] = useState<string | null>(null);
  const [serviceForm, setServiceForm] = useState({
    title: '',
    description: '',
    category: 'CLEANING',
    price: 499,
    pricingType: 'FIXED' as PricingType,
    availability: 'AVAILABLE' as ServiceAvailability,
    images: [] as string[],
  });

  // Request Action Modal state
  const [selectedRequest, setSelectedRequest] = useState<VendorRequest | null>(null);
  const [actionNotes, setActionNotes] = useState('');
  const [isAcceptModalOpen, setIsAcceptModalOpen] = useState(false);
  const [isRejectModalOpen, setIsRejectModalOpen] = useState(false);

  // Document Upload state
  const [docUploadType, setDocUploadType] = useState<VendorDocumentType>('GST_CERTIFICATE');
  const [docTitle, setDocTitle] = useState('');
  const [docExpiryDate, setDocExpiryDate] = useState('');
  const [docUploadSuccess, setDocUploadSuccess] = useState<string | null>(null);

  // Confirm delete dialog
  const [deleteConfirmOpen, setDeleteConfirmOpen] = useState(false);
  const [itemToDelete, setItemToDelete] = useState<{ id: string; type: 'service' } | null>(null);

  // Setup Real-time Listeners
  useEffect(() => {
    setSyncStatus('SYNCING');

    const unsubProfile = vendorRepository.subscribeVendorByUid(vendorUid, (p) => {
      if (p) setProfile(p);
      setSyncStatus('LIVE');
    });

    const unsubServices = vendorServiceRepository.subscribeByVendor(vendorUid, (servList) => {
      setServices(servList);
      setSyncStatus('LIVE');
    });

    const unsubRequests = vendorRequestRepository.subscribeByVendor(vendorUid, (reqList) => {
      setRequests(reqList);
      setSyncStatus('LIVE');
    });

    const unsubDocs = vendorDocumentRepository.subscribeByVendor(vendorUid, (docList) => {
      setDocuments(docList);
      setSyncStatus('LIVE');
    });

    return () => {
      unsubProfile();
      unsubServices();
      unsubRequests();
      unsubDocs();
    };
  }, [vendorUid]);

  // Derived KPI Stats
  const activeServicesCount = useMemo(() => services.filter((s) => s.status === 'ACTIVE').length, [services]);
  const pendingRequestsCount = useMemo(() => requests.filter((r) => r.status === 'PENDING').length, [requests]);
  const completedJobsCount = useMemo(() => requests.filter((r) => r.status === 'COMPLETED').length, [requests]);
  const totalRevenue = useMemo(() => {
    return requests
      .filter((r) => r.paymentStatus === 'PAID')
      .reduce((sum, r) => sum + (r.price || 0), 0);
  }, [requests]);
  const pendingPayments = useMemo(() => {
    return requests
      .filter((r) => r.status === 'COMPLETED' && r.paymentStatus !== 'PAID')
      .reduce((sum, r) => sum + (r.price || 0), 0);
  }, [requests]);

  const reviewsList = useMemo(() => {
    return requests.filter((r) => r.rating !== undefined && r.rating > 0);
  }, [requests]);

  const averageRating = useMemo(() => {
    if (reviewsList.length === 0) return 4.9;
    const sum = reviewsList.reduce((acc, r) => acc + (r.rating || 0), 0);
    return Number((sum / reviewsList.length).toFixed(1));
  }, [reviewsList]);

  // Document expiry warnings
  const expiringDocsCount = useMemo(() => {
    const now = new Date();
    const thirtyDaysAhead = new Date(Date.now() + 30 * 86400000);
    return documents.filter((d) => {
      if (!d.expiryDate) return false;
      const exp = new Date(d.expiryDate);
      return exp >= now && exp <= thirtyDaysAhead;
    }).length;
  }, [documents]);

  // Handle Service Creation / Edit
  const handleSaveService = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!serviceForm.title.trim()) return;

    try {
      if (editingServiceId) {
        await vendorServiceRepository.update(editingServiceId, {
          title: serviceForm.title,
          description: serviceForm.description,
          category: serviceForm.category,
          price: Number(serviceForm.price),
          pricingType: serviceForm.pricingType,
          availability: serviceForm.availability,
          images: serviceForm.images,
        });
      } else {
        await vendorServiceRepository.create({
          vendorId: vendorUid,
          vendorName: profile?.companyName || currentUser?.name || 'Verified Vendor',
          societyId,
          title: serviceForm.title,
          description: serviceForm.description,
          category: serviceForm.category,
          price: Number(serviceForm.price),
          pricingType: serviceForm.pricingType,
          availability: serviceForm.availability,
          images: serviceForm.images,
          status: 'ACTIVE',
        } as any);
      }

      setIsServiceModalOpen(false);
      setEditingServiceId(null);
      setServiceForm({
        title: '',
        description: '',
        category: 'CLEANING',
        price: 499,
        pricingType: 'FIXED',
        availability: 'AVAILABLE',
        images: [],
      });
    } catch (err) {
      console.error('Failed to save service:', err);
    }
  };

  const handleOpenEditService = (service: VendorService) => {
    setEditingServiceId(service.id);
    setServiceForm({
      title: service.title,
      description: service.description,
      category: service.category,
      price: service.price,
      pricingType: service.pricingType,
      availability: service.availability,
      images: service.images || [],
    });
    setIsServiceModalOpen(true);
  };

  const handleToggleService = async (service: VendorService) => {
    try {
      await vendorServiceRepository.toggleStatus(service.id, service.status !== 'ACTIVE');
    } catch (err) {
      console.error('Failed to toggle service status:', err);
    }
  };

  // Request actions
  const handleAcceptRequest = async () => {
    if (!selectedRequest) return;
    try {
      await vendorRequestRepository.updateStatus(selectedRequest.id, 'ACCEPTED', actionNotes);
      setIsAcceptModalOpen(false);
      setSelectedRequest(null);
      setActionNotes('');
    } catch (err) {
      console.error('Failed to accept request:', err);
    }
  };

  const handleRejectRequest = async () => {
    if (!selectedRequest) return;
    try {
      await vendorRequestRepository.updateStatus(selectedRequest.id, 'REJECTED', actionNotes);
      setIsRejectModalOpen(false);
      setSelectedRequest(null);
      setActionNotes('');
    } catch (err) {
      console.error('Failed to reject request:', err);
    }
  };

  const handleAdvanceRequestStatus = async (requestId: string, nextStatus: VendorRequestStatus) => {
    try {
      await vendorRequestRepository.updateStatus(requestId, nextStatus);
    } catch (err) {
      console.error('Failed to update request status:', err);
    }
  };

  const handleMarkPaid = async (requestId: string) => {
    try {
      await vendorRequestRepository.recordPayment(requestId, `PAY-${Date.now().toString().slice(-6)}`);
    } catch (err) {
      console.error('Failed to mark request as paid:', err);
    }
  };

  // Document upload handler
  const handleDocUploaded = async (uploadRes: { downloadUrl: string; name: string; size: number }) => {
    try {
      await vendorDocumentRepository.create({
        societyId,
        vendorId: vendorUid,
        documentType: docUploadType,
        title: docTitle.trim() || docUploadType.replace(/_/g, ' '),
        fileUrl: uploadRes.downloadUrl,
        fileName: uploadRes.name,
        fileSize: uploadRes.size,
        status: 'PENDING',
        expiryDate: docExpiryDate || undefined,
      } as any);

      setDocUploadSuccess('Document successfully uploaded for society verification!');
      setDocTitle('');
      setDocExpiryDate('');
      setTimeout(() => setDocUploadSuccess(null), 4000);
    } catch (err) {
      console.error('Failed to save vendor document:', err);
    }
  };

  const isApproved = profile?.approvalStatus === 'APPROVED' || profile?.status === 'ACTIVE' || currentUser?.role === 'admin';

  return (
    <div className="p-4 md:p-6 pb-28 max-w-7xl mx-auto space-y-6">
      {/* SaaS Page Header */}
      <PageHeader
        title={profile?.companyName || 'Vendor Operating Hub'}
        subtitle="Manage resident bookings, service offerings, payments, compliance documents, and customer ratings."
        icon={ShoppingBag}
        syncStatus={syncStatus}
        breadcrumbs={[
          { label: 'Vendor', href: '/vendor' },
          { label: activeTab.toUpperCase() },
        ]}
        actions={
          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={() => {
                setEditingServiceId(null);
                setServiceForm({
                  title: '',
                  description: '',
                  category: 'CLEANING',
                  price: 499,
                  pricingType: 'FIXED',
                  availability: 'AVAILABLE',
                  images: [],
                });
                setIsServiceModalOpen(true);
              }}
              className="flex items-center gap-1.5 px-3.5 py-2 rounded-xl bg-[#176B91] hover:bg-[#083B56] text-white text-xs sm:text-sm font-bold shadow-xs transition cursor-pointer"
            >
              <Plus size={16} />
              <span>Create Service</span>
            </button>
            <Link
              to="/vendor/onboarding"
              className="flex items-center gap-1.5 px-3 py-2 rounded-xl bg-slate-100 hover:bg-slate-200 dark:bg-slate-800 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-300 text-xs sm:text-sm font-semibold transition"
            >
              <ShieldCheck size={16} className="text-emerald-600" />
              <span>KYC &amp; Docs</span>
            </Link>
          </div>
        }
      />

      {/* Onboarding Gate Banner if not approved */}
      {!isApproved && (
        <div className="p-4 rounded-2xl bg-amber-50 dark:bg-amber-950/40 border border-amber-200 dark:border-amber-800 flex items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            <AlertTriangle className="w-5 h-5 text-amber-600 dark:text-amber-400 shrink-0" />
            <div>
              <p className="text-xs font-bold text-amber-900 dark:text-amber-100">
                Vendor Account Verification Pending
              </p>
              <p className="text-[11px] text-amber-700 dark:text-amber-300">
                Upload your compliance documents to unlock public catalog listings and resident inquiries.
              </p>
            </div>
          </div>
          <Link
            to="/vendor/onboarding"
            className="px-3 py-1.5 rounded-lg bg-amber-600 text-white text-xs font-bold shrink-0 hover:bg-amber-700"
          >
            Complete KYC
          </Link>
        </div>
      )}

      {/* Modern SaaS Stat Cards */}
      <div className="grid grid-cols-2 lg:grid-cols-6 gap-3 sm:gap-4">
        <StatCard
          title="Active Services"
          value={activeServicesCount}
          subtitle="Catalog offerings"
          icon={ShoppingBag}
          color="blue"
        />
        <StatCard
          title="Pending Requests"
          value={pendingRequestsCount}
          subtitle="Awaiting response"
          icon={Inbox}
          color={pendingRequestsCount > 0 ? 'amber' : 'emerald'}
        />
        <StatCard
          title="Completed Jobs"
          value={completedJobsCount}
          subtitle="Fulfillments"
          icon={CheckCircle2}
          color="emerald"
        />
        <StatCard
          title="Settled Revenue"
          value={`₹${totalRevenue.toLocaleString('en-IN')}`}
          subtitle="Total earned"
          icon={TrendingUp}
          color="purple"
        />
        <StatCard
          title="Pending Payouts"
          value={`₹${pendingPayments.toLocaleString('en-IN')}`}
          subtitle="Uncollected balance"
          icon={CreditCard}
          color="amber"
        />
        <StatCard
          title="Rating"
          value={`${averageRating} ★`}
          subtitle={`${reviewsList.length} feedback`}
          icon={Star}
          color="rose"
        />
      </div>

      {/* Navigation Tabs */}
      <div className="flex items-center gap-1.5 overflow-x-auto pb-2 border-b border-slate-200 dark:border-slate-800 scrollbar-none">
        {[
          { id: 'dashboard', label: 'Dashboard', icon: LayoutDashboard },
          { id: 'services', label: `Services (${services.length})`, icon: ShoppingBag },
          { id: 'requests', label: `Requests (${pendingRequestsCount})`, icon: Inbox },
          { id: 'orders', label: `Orders / Jobs (${requests.length})`, icon: Briefcase },
          { id: 'payments', label: 'Payments', icon: CreditCard },
          { id: 'invoices', label: 'Invoices', icon: FileText },
          { id: 'documents', label: `Documents (${documents.length})`, icon: ShieldCheck },
          { id: 'reviews', label: `Reviews (${reviewsList.length})`, icon: Star },
          { id: 'notifications', label: 'Notifications', icon: Bell },
          { id: 'profile', label: 'Profile', icon: User },
        ].map((tab) => {
          const Icon = tab.icon;
          const isActive = activeTab === tab.id;
          return (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id as ActiveTab)}
              className={`flex items-center gap-2 px-3.5 py-2 rounded-xl text-xs sm:text-sm font-bold whitespace-nowrap transition cursor-pointer ${
                isActive
                  ? 'bg-[#176B91] text-white shadow-xs'
                  : 'text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800'
              }`}
            >
              <Icon size={15} />
              <span>{tab.label}</span>
            </button>
          );
        })}
      </div>

      {/* ── TAB 1: DASHBOARD OVERVIEW ── */}
      {activeTab === 'dashboard' && (
        <div className="space-y-6">
          {/* Quick Operations Row */}
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            {/* Urgent Inbound Requests */}
            <div className="lg:col-span-2 bg-white dark:bg-slate-900 rounded-2xl border border-slate-200/80 dark:border-slate-800 p-5 shadow-xs space-y-4">
              <div className="flex items-center justify-between">
                <div>
                  <h3 className="text-sm font-bold text-slate-900 dark:text-white flex items-center gap-2">
                    <Clock className="w-4 h-4 text-amber-500" />
                    <span>Inbound Resident Requests</span>
                  </h3>
                  <p className="text-xs text-slate-500">Respond quickly to maintain top service response rate</p>
                </div>
                <button
                  type="button"
                  onClick={() => setActiveTab('requests')}
                  className="text-xs font-bold text-[#176B91] hover:underline"
                >
                  View All
                </button>
              </div>

              {requests.filter((r) => r.status === 'PENDING').length === 0 ? (
                <div className="p-8 text-center border border-dashed border-slate-200 dark:border-slate-800 rounded-xl">
                  <CheckCircle2 className="w-8 h-8 text-emerald-500 mx-auto mb-2" />
                  <p className="text-xs font-semibold text-slate-700 dark:text-slate-300">All caught up!</p>
                  <p className="text-[11px] text-slate-400">No pending service requests waiting for action.</p>
                </div>
              ) : (
                <div className="space-y-3">
                  {requests
                    .filter((r) => r.status === 'PENDING')
                    .slice(0, 3)
                    .map((req) => (
                      <div
                        key={req.id}
                        className="p-3.5 rounded-xl border border-amber-200/80 dark:border-amber-900/40 bg-amber-50/40 dark:bg-amber-950/20 flex flex-col sm:flex-row sm:items-center justify-between gap-3"
                      >
                        <div>
                          <div className="flex items-center gap-2">
                            <span className="font-bold text-xs text-slate-900 dark:text-white">
                              {req.serviceTitle}
                            </span>
                            <span className="text-[11px] px-2 py-0.5 rounded-md bg-amber-100 dark:bg-amber-900/60 text-amber-800 dark:text-amber-200 font-bold">
                              ₹{req.price}
                            </span>
                          </div>
                          <p className="text-xs text-slate-600 dark:text-slate-400 mt-0.5">
                            Resident: <span className="font-semibold">{req.residentName}</span> ({req.flatCode}) · {req.scheduledDate}
                          </p>
                          {req.notes && (
                            <p className="text-[11px] text-slate-500 italic mt-0.5">"{req.notes}"</p>
                          )}
                        </div>

                        <div className="flex items-center gap-2 shrink-0">
                          <button
                            type="button"
                            onClick={() => {
                              setSelectedRequest(req);
                              setIsAcceptModalOpen(true);
                            }}
                            className="px-3 py-1.5 rounded-lg bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-bold shadow-xs transition"
                          >
                            Accept
                          </button>
                          <button
                            type="button"
                            onClick={() => {
                              setSelectedRequest(req);
                              setIsRejectModalOpen(true);
                            }}
                            className="px-3 py-1.5 rounded-lg bg-rose-100 hover:bg-rose-200 text-rose-700 text-xs font-bold transition"
                          >
                            Reject
                          </button>
                        </div>
                      </div>
                    ))}
                </div>
              )}
            </div>

            {/* Compliance & Document Status Card */}
            <div className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200/80 dark:border-slate-800 p-5 shadow-xs space-y-4">
              <div className="flex items-center justify-between">
                <h3 className="text-sm font-bold text-slate-900 dark:text-white flex items-center gap-2">
                  <ShieldCheck className="w-4 h-4 text-emerald-600" />
                  <span>Compliance Health</span>
                </h3>
                <Link to="/vendor/onboarding" className="text-xs font-bold text-[#176B91] hover:underline">
                  Manage
                </Link>
              </div>

              <div className="space-y-3">
                <div className="flex items-center justify-between p-2.5 rounded-xl bg-slate-50 dark:bg-slate-800">
                  <span className="text-xs text-slate-600 dark:text-slate-400 font-medium">Account Status</span>
                  <StatusBadge
                    label={profile?.status || 'PENDING'}
                    variant={profile?.status === 'ACTIVE' ? 'success' : 'warning'}
                  />
                </div>
                <div className="flex items-center justify-between p-2.5 rounded-xl bg-slate-50 dark:bg-slate-800">
                  <span className="text-xs text-slate-600 dark:text-slate-400 font-medium">Admin Approval</span>
                  <StatusBadge
                    label={profile?.approvalStatus || 'PENDING'}
                    variant={profile?.approvalStatus === 'APPROVED' ? 'success' : 'warning'}
                  />
                </div>
                <div className="flex items-center justify-between p-2.5 rounded-xl bg-slate-50 dark:bg-slate-800">
                  <span className="text-xs text-slate-600 dark:text-slate-400 font-medium">Verified Documents</span>
                  <span className="text-xs font-bold text-slate-900 dark:text-white">
                    {documents.filter((d) => d.status === 'VERIFIED').length} / {documents.length}
                  </span>
                </div>
                {expiringDocsCount > 0 && (
                  <div className="p-2.5 rounded-xl bg-amber-50 text-amber-900 text-xs font-semibold flex items-center gap-2">
                    <AlertTriangle size={14} className="text-amber-600" />
                    <span>{expiringDocsCount} document(s) expiring within 30 days!</span>
                  </div>
                )}
              </div>
            </div>
          </div>

          {/* Active Jobs Pipeline */}
          <div className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200/80 dark:border-slate-800 p-5 shadow-xs space-y-4">
            <div className="flex items-center justify-between">
              <div>
                <h3 className="text-sm font-bold text-slate-900 dark:text-white">Active Jobs Pipeline</h3>
                <p className="text-xs text-slate-500">Live operational execution flow</p>
              </div>
              <button
                type="button"
                onClick={() => setActiveTab('orders')}
                className="text-xs font-bold text-[#176B91] hover:underline"
              >
                View Orders ({requests.length})
              </button>
            </div>

            {requests.filter((r) => ['ACCEPTED', 'SCHEDULED', 'IN_PROGRESS'].includes(r.status)).length === 0 ? (
              <div className="p-8 text-center border border-dashed border-slate-200 dark:border-slate-800 rounded-xl">
                <Briefcase className="w-8 h-8 text-slate-400 mx-auto mb-2" />
                <p className="text-xs font-semibold text-slate-600 dark:text-slate-400">No active jobs in progress right now.</p>
              </div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
                {requests
                  .filter((r) => ['ACCEPTED', 'SCHEDULED', 'IN_PROGRESS'].includes(r.status))
                  .map((job) => (
                    <div
                      key={job.id}
                      className="p-4 rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-800/60 shadow-2xs space-y-3"
                    >
                      <div className="flex items-center justify-between">
                        <span className="text-[11px] font-mono font-bold text-slate-400">{job.orderNumber}</span>
                        <StatusBadge
                          label={job.status}
                          variant={job.status === 'IN_PROGRESS' ? 'info' : 'warning'}
                        />
                      </div>
                      <div>
                        <h4 className="text-xs font-bold text-slate-900 dark:text-white">{job.serviceTitle}</h4>
                        <p className="text-[11px] text-slate-500">
                          {job.residentName} · {job.flatCode} · {job.timeSlot || job.scheduledDate}
                        </p>
                      </div>
                      <div className="pt-2 border-t border-slate-100 dark:border-slate-700/60 flex items-center justify-between">
                        <span className="text-xs font-extrabold text-slate-900 dark:text-white">₹{job.price}</span>
                        <div className="flex items-center gap-1.5">
                          {job.status === 'ACCEPTED' && (
                            <button
                              type="button"
                              onClick={() => handleAdvanceRequestStatus(job.id, 'IN_PROGRESS')}
                              className="px-2.5 py-1 rounded-lg bg-sky-600 text-white text-[11px] font-bold"
                            >
                              Start Job
                            </button>
                          )}
                          {job.status === 'IN_PROGRESS' && (
                            <button
                              type="button"
                              onClick={() => handleAdvanceRequestStatus(job.id, 'COMPLETED')}
                              className="px-2.5 py-1 rounded-lg bg-emerald-600 text-white text-[11px] font-bold"
                            >
                              Mark Complete
                            </button>
                          )}
                        </div>
                      </div>
                    </div>
                  ))}
              </div>
            )}
          </div>
        </div>
      )}

      {/* ── TAB 2: SERVICES MANAGEMENT ── */}
      {activeTab === 'services' && (
        <div className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200/80 dark:border-slate-800 p-5 shadow-xs space-y-4">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
            <div>
              <h3 className="text-sm font-bold text-slate-900 dark:text-white">Service Offerings &amp; Tariffs</h3>
              <p className="text-xs text-slate-500">Create, price, and publish services available to Green Valley residents</p>
            </div>
            <button
              type="button"
              onClick={() => {
                setEditingServiceId(null);
                setServiceForm({
                  title: '',
                  description: '',
                  category: 'CLEANING',
                  price: 499,
                  pricingType: 'FIXED',
                  availability: 'AVAILABLE',
                  images: [],
                });
                setIsServiceModalOpen(true);
              }}
              className="flex items-center gap-1.5 px-3.5 py-2 rounded-xl bg-[#176B91] hover:bg-[#083B56] text-white text-xs font-bold transition cursor-pointer"
            >
              <Plus size={15} />
              <span>Add New Service</span>
            </button>
          </div>

          {services.length === 0 ? (
            <div className="p-10 text-center border border-dashed border-slate-200 dark:border-slate-800 rounded-2xl">
              <ShoppingBag className="w-10 h-10 text-slate-300 mx-auto mb-2" />
              <p className="text-sm font-bold text-slate-700 dark:text-slate-300">No Services Registered</p>
              <p className="text-xs text-slate-400 mt-1 max-w-sm mx-auto">
                Add your first service (e.g. Deep Cleaning, Mineral Water 20L, Plumbing Inspection) to receive bookings.
              </p>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {services.map((serv) => (
                <div
                  key={serv.id}
                  className="rounded-2xl border border-slate-200/80 dark:border-slate-800 bg-white dark:bg-slate-800/40 p-4 space-y-3 shadow-2xs hover:shadow-sm transition"
                >
                  <div className="flex items-start justify-between gap-2">
                    <div>
                      <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400">
                        {serv.category}
                      </span>
                      <h4 className="text-sm font-bold text-slate-900 dark:text-white mt-0.5">{serv.title}</h4>
                    </div>
                    <StatusBadge
                      label={serv.status}
                      variant={serv.status === 'ACTIVE' ? 'success' : 'neutral'}
                    />
                  </div>

                  <p className="text-xs text-slate-600 dark:text-slate-400 line-clamp-2">
                    {serv.description || 'Professional service by certified technician.'}
                  </p>

                  <div className="flex items-center justify-between pt-2 border-t border-slate-100 dark:border-slate-700/60">
                    <div>
                      <span className="text-xs font-semibold text-slate-400">Price: </span>
                      <span className="text-sm font-black text-slate-900 dark:text-white">
                        ₹{serv.price}
                      </span>
                      <span className="text-[10px] text-slate-400 ml-1">({serv.pricingType})</span>
                    </div>
                    <span className="text-[10px] px-2 py-0.5 rounded-md bg-slate-100 dark:bg-slate-700 text-slate-600 dark:text-slate-300 font-semibold">
                      {serv.availability}
                    </span>
                  </div>

                  <div className="flex items-center justify-between pt-2">
                    <button
                      type="button"
                      onClick={() => handleToggleService(serv)}
                      className="text-xs font-semibold flex items-center gap-1.5 text-slate-600 hover:text-slate-900 dark:text-slate-400 dark:hover:text-white cursor-pointer"
                    >
                      {serv.status === 'ACTIVE' ? (
                        <>
                          <ToggleRight className="w-4 h-4 text-emerald-600" />
                          <span>Active</span>
                        </>
                      ) : (
                        <>
                          <ToggleLeft className="w-4 h-4 text-slate-400" />
                          <span>Inactive</span>
                        </>
                      )}
                    </button>

                    <div className="flex items-center gap-1">
                      <button
                        type="button"
                        onClick={() => handleOpenEditService(serv)}
                        className="p-1.5 rounded-lg hover:bg-slate-100 dark:hover:bg-slate-700 text-slate-600 dark:text-slate-400 cursor-pointer"
                        title="Edit Service"
                      >
                        <Edit3 size={14} />
                      </button>
                      <button
                        type="button"
                        onClick={() => {
                          setItemToDelete({ id: serv.id, type: 'service' });
                          setDeleteConfirmOpen(true);
                        }}
                        className="p-1.5 rounded-lg hover:bg-rose-50 dark:hover:bg-rose-950 text-rose-500 cursor-pointer"
                        title="Delete Service"
                      >
                        <Trash2 size={14} />
                      </button>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      )}

      {/* ── TAB 3: INBOUND REQUESTS ── */}
      {activeTab === 'requests' && (
        <div className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200/80 dark:border-slate-800 p-5 shadow-xs space-y-4">
          <div>
            <h3 className="text-sm font-bold text-slate-900 dark:text-white">Resident Booking Requests</h3>
            <p className="text-xs text-slate-500">Live requests received from society residents</p>
          </div>

          {requests.length === 0 ? (
            <div className="p-10 text-center border border-dashed border-slate-200 dark:border-slate-800 rounded-2xl">
              <Inbox className="w-10 h-10 text-slate-300 mx-auto mb-2" />
              <p className="text-sm font-bold text-slate-700 dark:text-slate-300">No Booking Requests Found</p>
              <p className="text-xs text-slate-400 mt-1">
                Resident requests will appear here in real time as soon as they book.
              </p>
            </div>
          ) : (
            <div className="space-y-3">
              {requests.map((req) => (
                <div
                  key={req.id}
                  className="p-4 rounded-xl border border-slate-200/80 dark:border-slate-800 bg-white dark:bg-slate-800/40 flex flex-col md:flex-row md:items-center justify-between gap-4"
                >
                  <div className="space-y-1">
                    <div className="flex items-center gap-2">
                      <span className="text-xs font-mono font-bold text-[#176B91]">{req.orderNumber}</span>
                      <StatusBadge
                        label={req.status}
                        variant={
                          req.status === 'COMPLETED'
                            ? 'success'
                            : req.status === 'REJECTED' || req.status === 'CANCELLED'
                            ? 'danger'
                            : 'warning'
                        }
                      />
                      <span className="text-xs font-black text-slate-900 dark:text-white">₹{req.price}</span>
                    </div>
                    <h4 className="text-sm font-bold text-slate-800 dark:text-slate-200">{req.serviceTitle}</h4>
                    <p className="text-xs text-slate-500">
                      Resident: <span className="font-semibold text-slate-700 dark:text-slate-300">{req.residentName}</span> ({req.flatCode}) · Phone: {req.residentPhone || '9876543210'}
                    </p>
                    <p className="text-xs text-slate-500">
                      Schedule: <span className="font-semibold">{req.scheduledDate}</span> ({req.timeSlot || 'General'})
                    </p>
                    {req.notes && (
                      <p className="text-xs text-slate-600 dark:text-slate-400 bg-slate-50 dark:bg-slate-800/80 p-2 rounded-lg mt-1 italic">
                        "{req.notes}"
                      </p>
                    )}
                  </div>

                  <div className="flex items-center gap-2 shrink-0">
                    {req.status === 'PENDING' && (
                      <>
                        <button
                          type="button"
                          onClick={() => {
                            setSelectedRequest(req);
                            setIsAcceptModalOpen(true);
                          }}
                          className="px-3.5 py-1.5 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-bold transition cursor-pointer"
                        >
                          Accept
                        </button>
                        <button
                          type="button"
                          onClick={() => {
                            setSelectedRequest(req);
                            setIsRejectModalOpen(true);
                          }}
                          className="px-3.5 py-1.5 rounded-xl bg-rose-100 hover:bg-rose-200 text-rose-700 text-xs font-bold transition cursor-pointer"
                        >
                          Reject
                        </button>
                      </>
                    )}

                    {req.status === 'ACCEPTED' && (
                      <button
                        type="button"
                        onClick={() => handleAdvanceRequestStatus(req.id, 'IN_PROGRESS')}
                        className="px-3.5 py-1.5 rounded-xl bg-sky-600 hover:bg-sky-700 text-white text-xs font-bold transition cursor-pointer"
                      >
                        Start Job
                      </button>
                    )}

                    {req.status === 'IN_PROGRESS' && (
                      <button
                        type="button"
                        onClick={() => handleAdvanceRequestStatus(req.id, 'COMPLETED')}
                        className="px-3.5 py-1.5 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-bold transition cursor-pointer"
                      >
                        Mark Completed
                      </button>
                    )}

                    {req.status === 'COMPLETED' && req.paymentStatus !== 'PAID' && (
                      <button
                        type="button"
                        onClick={() => handleMarkPaid(req.id)}
                        className="px-3 py-1.5 rounded-xl bg-purple-600 hover:bg-purple-700 text-white text-xs font-bold transition cursor-pointer"
                      >
                        Collect Payment
                      </button>
                    )}
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      )}

      {/* ── TAB 4: ORDERS / JOBS LIFECYCLE ── */}
      {activeTab === 'orders' && (
        <div className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200/80 dark:border-slate-800 p-5 shadow-xs space-y-4">
          <div>
            <h3 className="text-sm font-bold text-slate-900 dark:text-white">Orders &amp; Job Executions</h3>
            <p className="text-xs text-slate-500">Track lifecycle from scheduled through completed</p>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="border-b border-slate-200 dark:border-slate-800 text-[11px] font-bold text-slate-400 uppercase tracking-wider">
                  <th className="pb-3 px-3">Order #</th>
                  <th className="pb-3 px-3">Service</th>
                  <th className="pb-3 px-3">Resident</th>
                  <th className="pb-3 px-3">Schedule</th>
                  <th className="pb-3 px-3">Amount</th>
                  <th className="pb-3 px-3">Status</th>
                  <th className="pb-3 px-3">Payment</th>
                  <th className="pb-3 px-3 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 dark:divide-slate-800 text-xs">
                {requests.map((ord) => (
                  <tr key={ord.id} className="hover:bg-slate-50 dark:hover:bg-slate-800/40 transition">
                    <td className="py-3 px-3 font-mono font-bold text-[#176B91]">{ord.orderNumber}</td>
                    <td className="py-3 px-3 font-semibold text-slate-800 dark:text-slate-200">{ord.serviceTitle}</td>
                    <td className="py-3 px-3">
                      <div>
                        <span className="font-semibold text-slate-800 dark:text-slate-200">{ord.residentName}</span>
                        <div className="text-[11px] text-slate-400">{ord.flatCode}</div>
                      </div>
                    </td>
                    <td className="py-3 px-3 text-slate-600 dark:text-slate-400">{ord.scheduledDate}</td>
                    <td className="py-3 px-3 font-black text-slate-900 dark:text-white">₹{ord.price}</td>
                    <td className="py-3 px-3">
                      <StatusBadge
                        label={ord.status}
                        variant={
                          ord.status === 'COMPLETED'
                            ? 'success'
                            : ord.status === 'IN_PROGRESS'
                            ? 'info'
                            : ord.status === 'REJECTED' || ord.status === 'CANCELLED'
                            ? 'danger'
                            : 'warning'
                        }
                      />
                    </td>
                    <td className="py-3 px-3">
                      <StatusBadge
                        label={ord.paymentStatus}
                        variant={ord.paymentStatus === 'PAID' ? 'success' : 'neutral'}
                      />
                    </td>
                    <td className="py-3 px-3 text-right">
                      {ord.status === 'ACCEPTED' && (
                        <button
                          type="button"
                          onClick={() => handleAdvanceRequestStatus(ord.id, 'IN_PROGRESS')}
                          className="px-2.5 py-1 rounded-lg bg-sky-600 text-white font-bold text-[11px]"
                        >
                          Start
                        </button>
                      )}
                      {ord.status === 'IN_PROGRESS' && (
                        <button
                          type="button"
                          onClick={() => handleAdvanceRequestStatus(ord.id, 'COMPLETED')}
                          className="px-2.5 py-1 rounded-lg bg-emerald-600 text-white font-bold text-[11px]"
                        >
                          Complete
                        </button>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* ── TAB 5: PAYMENTS ── */}
      {activeTab === 'payments' && (
        <div className="space-y-6">
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            <div className="p-5 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800">
              <span className="text-xs font-semibold text-slate-400">Total Revenue Collected</span>
              <h3 className="text-2xl font-black text-emerald-600 mt-1">₹{totalRevenue.toLocaleString('en-IN')}</h3>
              <p className="text-[11px] text-slate-500 mt-1">Settled into registered account</p>
            </div>
            <div className="p-5 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800">
              <span className="text-xs font-semibold text-slate-400">Pending Receivables</span>
              <h3 className="text-2xl font-black text-amber-500 mt-1">₹{pendingPayments.toLocaleString('en-IN')}</h3>
              <p className="text-[11px] text-slate-500 mt-1">For fulfilled services awaiting settlement</p>
            </div>
            <div className="p-5 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800">
              <span className="text-xs font-semibold text-slate-400">Settlement Cycle</span>
              <h3 className="text-2xl font-black text-slate-800 dark:text-slate-100 mt-1">T+2 Days</h3>
              <p className="text-[11px] text-slate-500 mt-1">Direct Bank IMPS / NEFT</p>
            </div>
          </div>

          <div className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200/80 dark:border-slate-800 p-5 shadow-xs space-y-4">
            <h4 className="text-sm font-bold text-slate-900 dark:text-white">Payment Transactions</h4>
            <div className="space-y-2.5">
              {requests
                .filter((r) => r.paymentStatus === 'PAID')
                .map((pay) => (
                  <div
                    key={pay.id}
                    className="p-3 rounded-xl border border-slate-100 dark:border-slate-800 flex items-center justify-between"
                  >
                    <div>
                      <span className="text-xs font-mono font-bold text-[#176B91]">{pay.paymentId || 'TXN-DIRECT'}</span>
                      <p className="text-xs font-semibold text-slate-800 dark:text-slate-200 mt-0.5">
                        {pay.serviceTitle} · {pay.residentName} ({pay.flatCode})
                      </p>
                    </div>
                    <div className="text-right">
                      <span className="text-sm font-black text-emerald-600">+₹{pay.price}</span>
                      <p className="text-[10px] text-slate-400">Settled</p>
                    </div>
                  </div>
                ))}
            </div>
          </div>
        </div>
      )}

      {/* ── TAB 6: INVOICES ── */}
      {activeTab === 'invoices' && (
        <div className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200/80 dark:border-slate-800 p-5 shadow-xs space-y-4">
          <div className="flex items-center justify-between">
            <div>
              <h3 className="text-sm font-bold text-slate-900 dark:text-white">Tax Invoices &amp; Receipts</h3>
              <p className="text-xs text-slate-500">Download billing summaries for delivered services</p>
            </div>
          </div>

          <div className="space-y-3">
            {requests
              .filter((r) => r.status === 'COMPLETED')
              .map((inv) => (
                <div
                  key={inv.id}
                  className="p-4 rounded-xl border border-slate-200 dark:border-slate-800 flex items-center justify-between gap-4"
                >
                  <div className="flex items-center gap-3">
                    <FileText className="w-6 h-6 text-[#176B91]" />
                    <div>
                      <p className="text-xs font-mono font-bold text-slate-900 dark:text-white">
                        INV-{inv.orderNumber}
                      </p>
                      <p className="text-xs text-slate-500">
                        {inv.serviceTitle} · {inv.residentName} ({inv.flatCode}) · {inv.scheduledDate}
                      </p>
                    </div>
                  </div>

                  <div className="flex items-center gap-3">
                    <div className="text-right">
                      <span className="text-xs font-black text-slate-900 dark:text-white">₹{inv.price}</span>
                      <p className="text-[10px] text-slate-400">Incl. 18% GST</p>
                    </div>
                    <button
                      type="button"
                      onClick={() => alert(`Downloading Tax Invoice INV-${inv.orderNumber}`)}
                      className="p-2 rounded-xl bg-slate-100 hover:bg-slate-200 dark:bg-slate-800 text-slate-700 dark:text-slate-300"
                      title="Download PDF"
                    >
                      <Download size={15} />
                    </button>
                  </div>
                </div>
              ))}
          </div>
        </div>
      )}

      {/* ── TAB 7: DOCUMENTS & COMPLIANCE ── */}
      {activeTab === 'documents' && (
        <div className="space-y-6">
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
            {/* Upload Box */}
            <div className="lg:col-span-5 bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 p-5 shadow-xs space-y-4">
              <h3 className="text-sm font-bold text-slate-900 dark:text-white">Upload Compliance Document</h3>

              {docUploadSuccess && (
                <div className="p-3 rounded-xl bg-emerald-50 text-emerald-800 text-xs font-semibold flex items-center gap-2">
                  <CheckCircle2 size={14} />
                  <span>{docUploadSuccess}</span>
                </div>
              )}

              <div className="space-y-3">
                <div>
                  <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                    Document Category
                  </label>
                  <select
                    value={docUploadType}
                    onChange={(e) => setDocUploadType(e.target.value as VendorDocumentType)}
                    className="w-full px-3 py-2 text-xs rounded-xl border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-white"
                  >
                    <option value="GST_CERTIFICATE">GST Certificate</option>
                    <option value="BUSINESS_LICENSE">Business License</option>
                    <option value="INSURANCE">Commercial Insurance</option>
                    <option value="AGREEMENT">Society Agreement</option>
                    <option value="IDENTITY_PROOF">Identity Proof</option>
                    <option value="CERTIFICATES">Quality Certificates</option>
                    <option value="OTHER">Other</option>
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                    Title / Identifier
                  </label>
                  <input
                    type="text"
                    value={docTitle}
                    onChange={(e) => setDocTitle(e.target.value)}
                    placeholder="e.g. GST Registration 2026"
                    className="w-full px-3 py-2 text-xs rounded-xl border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-white"
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                    Expiry Date
                  </label>
                  <input
                    type="date"
                    value={docExpiryDate}
                    onChange={(e) => setDocExpiryDate(e.target.value)}
                    className="w-full px-3 py-2 text-xs rounded-xl border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-white"
                  />
                </div>

                <FileUploader
                  label="Select PDF or Image to Upload"
                  societyId={societyId}
                  entityType="vendor"
                  entityId={vendorUid}
                  onUploadSuccess={handleDocUploaded}
                />
              </div>
            </div>

            {/* Document Vault List */}
            <div className="lg:col-span-7 bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 p-5 shadow-xs space-y-4">
              <h3 className="text-sm font-bold text-slate-900 dark:text-white">
                Uploaded Compliance Vault ({documents.length})
              </h3>

              {documents.length === 0 ? (
                <div className="p-8 text-center border border-dashed border-slate-200 dark:border-slate-800 rounded-xl">
                  <FileText className="w-8 h-8 text-slate-400 mx-auto mb-2" />
                  <p className="text-xs text-slate-400">No compliance documents uploaded yet.</p>
                </div>
              ) : (
                <div className="space-y-3">
                  {documents.map((doc) => (
                    <div
                      key={doc.id}
                      className="p-3.5 rounded-xl border border-slate-200 dark:border-slate-800 flex items-center justify-between gap-3"
                    >
                      <div className="flex items-center gap-3">
                        <FileText className="w-5 h-5 text-[#176B91]" />
                        <div>
                          <p className="text-xs font-bold text-slate-800 dark:text-slate-200">{doc.title}</p>
                          <p className="text-[11px] text-slate-500">
                            {doc.documentType} {doc.expiryDate ? `· Exp: ${doc.expiryDate}` : ''}
                          </p>
                        </div>
                      </div>

                      <div className="flex items-center gap-2">
                        <StatusBadge
                          label={doc.status}
                          variant={
                            doc.status === 'VERIFIED'
                              ? 'success'
                              : doc.status === 'REJECTED'
                              ? 'danger'
                              : 'warning'
                          }
                        />
                        {doc.fileUrl && (
                          <a
                            href={doc.fileUrl}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="p-1.5 rounded-lg bg-slate-100 hover:bg-slate-200 dark:bg-slate-800 text-slate-700 dark:text-slate-300"
                            title="View PDF"
                          >
                            <ExternalLink size={14} />
                          </a>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
        </div>
      )}

      {/* ── TAB 8: REVIEWS ── */}
      {activeTab === 'reviews' && (
        <div className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200/80 dark:border-slate-800 p-5 shadow-xs space-y-4">
          <div className="flex items-center justify-between">
            <div>
              <h3 className="text-sm font-bold text-slate-900 dark:text-white">Resident Reviews &amp; Ratings</h3>
              <p className="text-xs text-slate-500">Customer satisfaction score and verified comments</p>
            </div>
            <div className="flex items-center gap-2 px-3 py-1.5 rounded-xl bg-amber-50 dark:bg-amber-950/40 border border-amber-200 dark:border-amber-800">
              <Star className="w-4 h-4 text-amber-500 fill-amber-500" />
              <span className="text-sm font-black text-amber-900 dark:text-amber-100">{averageRating} / 5.0</span>
            </div>
          </div>

          {reviewsList.length === 0 ? (
            <div className="p-10 text-center border border-dashed border-slate-200 dark:border-slate-800 rounded-xl">
              <Star className="w-8 h-8 text-slate-300 mx-auto mb-2" />
              <p className="text-xs font-semibold text-slate-600 dark:text-slate-400">No ratings yet.</p>
              <p className="text-[11px] text-slate-400">Complete jobs for residents to collect ratings.</p>
            </div>
          ) : (
            <div className="space-y-3">
              {reviewsList.map((rev) => (
                <div
                  key={rev.id}
                  className="p-4 rounded-xl border border-slate-200/80 dark:border-slate-800 bg-slate-50/50 dark:bg-slate-800/40 space-y-2"
                >
                  <div className="flex items-center justify-between">
                    <div>
                      <span className="text-xs font-bold text-slate-800 dark:text-slate-200">{rev.residentName}</span>
                      <span className="text-[11px] text-slate-400 ml-2">({rev.flatCode})</span>
                    </div>
                    <div className="flex items-center gap-1">
                      {[...Array(5)].map((_, i) => (
                        <Star
                          key={i}
                          size={13}
                          className={
                            i < (rev.rating || 0)
                              ? 'text-amber-500 fill-amber-500'
                              : 'text-slate-300 dark:text-slate-600'
                          }
                        />
                      ))}
                    </div>
                  </div>
                  {rev.reviewNotes && (
                    <p className="text-xs text-slate-600 dark:text-slate-300 italic">
                      "{rev.reviewNotes}"
                    </p>
                  )}
                  <p className="text-[10px] text-slate-400">Job: {rev.serviceTitle}</p>
                </div>
              ))}
            </div>
          )}
        </div>
      )}

      {/* ── TAB 9: NOTIFICATIONS ── */}
      {activeTab === 'notifications' && (
        <div className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200/80 dark:border-slate-800 p-5 shadow-xs space-y-4">
          <h3 className="text-sm font-bold text-slate-900 dark:text-white">Vendor Activity &amp; System Alerts</h3>
          <div className="space-y-2.5">
            <div className="p-3 rounded-xl border border-slate-200 dark:border-slate-800 flex items-start gap-3">
              <CheckCircle2 className="w-5 h-5 text-emerald-600 shrink-0 mt-0.5" />
              <div>
                <p className="text-xs font-bold text-slate-800 dark:text-slate-200">
                  Profile Live on Green Valley Catalog
                </p>
                <p className="text-[11px] text-slate-500">
                  Your services are available to all residents of Green Valley Society.
                </p>
              </div>
            </div>
            {expiringDocsCount > 0 && (
              <div className="p-3 rounded-xl border border-amber-200 bg-amber-50/50 flex items-start gap-3">
                <AlertTriangle className="w-5 h-5 text-amber-600 shrink-0 mt-0.5" />
                <div>
                  <p className="text-xs font-bold text-amber-900">Compliance Renewal Notice</p>
                  <p className="text-[11px] text-amber-700">
                    You have documents nearing expiration. Please upload updated versions to avoid account suspension.
                  </p>
                </div>
              </div>
            )}
          </div>
        </div>
      )}

      {/* ── TAB 10: PROFILE ── */}
      {activeTab === 'profile' && (
        <div className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200/80 dark:border-slate-800 p-5 sm:p-6 shadow-xs space-y-6">
          <div className="flex items-center justify-between border-b border-slate-100 dark:border-slate-800 pb-4">
            <div>
              <h3 className="text-base font-bold text-slate-900 dark:text-white">Vendor Business Profile</h3>
              <p className="text-xs text-slate-500">Manage public contact and company credentials</p>
            </div>
            <Link
              to="/vendor/onboarding"
              className="px-4 py-2 rounded-xl bg-[#176B91] hover:bg-[#083B56] text-white text-xs font-bold"
            >
              Edit in Onboarding Portal
            </Link>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs">
            <div className="p-3.5 rounded-xl bg-slate-50 dark:bg-slate-800/60">
              <span className="font-semibold text-slate-400">Company Name</span>
              <p className="text-sm font-bold text-slate-900 dark:text-white mt-1">
                {profile?.companyName || 'Not Set'}
              </p>
            </div>
            <div className="p-3.5 rounded-xl bg-slate-50 dark:bg-slate-800/60">
              <span className="font-semibold text-slate-400">Category</span>
              <p className="text-sm font-bold text-slate-900 dark:text-white mt-1">
                {profile?.category || 'WATER_SUPPLY'}
              </p>
            </div>
            <div className="p-3.5 rounded-xl bg-slate-50 dark:bg-slate-800/60">
              <span className="font-semibold text-slate-400">Contact Person</span>
              <p className="text-sm font-bold text-slate-900 dark:text-white mt-1">
                {profile?.contactPerson || 'Not Set'}
              </p>
            </div>
            <div className="p-3.5 rounded-xl bg-slate-50 dark:bg-slate-800/60">
              <span className="font-semibold text-slate-400">Direct Phone</span>
              <p className="text-sm font-bold text-slate-900 dark:text-white mt-1">
                {profile?.phone || currentUser?.phone || 'Not Set'}
              </p>
            </div>
            <div className="p-3.5 rounded-xl bg-slate-50 dark:bg-slate-800/60 sm:col-span-2">
              <span className="font-semibold text-slate-400">Business Address</span>
              <p className="text-sm font-bold text-slate-900 dark:text-white mt-1">
                {profile?.address || 'Green Valley Commercial Block, Pune'}
              </p>
            </div>
          </div>
        </div>
      )}

      {/* ── CREATE / EDIT SERVICE MODAL ── */}
      {isServiceModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-xs p-4">
          <div className="bg-white dark:bg-slate-900 rounded-3xl max-w-lg w-full p-6 shadow-2xl border border-slate-200 dark:border-slate-800 space-y-4 animate-in fade-in duration-200">
            <div className="flex items-center justify-between border-b border-slate-100 dark:border-slate-800 pb-3">
              <h3 className="text-base font-bold text-slate-900 dark:text-white">
                {editingServiceId ? 'Edit Service Offering' : 'Create New Service Offering'}
              </h3>
              <button
                type="button"
                onClick={() => setIsServiceModalOpen(false)}
                className="p-1 rounded-lg text-slate-400 hover:text-slate-600"
              >
                <X size={18} />
              </button>
            </div>

            <form onSubmit={handleSaveService} className="space-y-4">
              <div>
                <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                  Service Title *
                </label>
                <input
                  type="text"
                  required
                  value={serviceForm.title}
                  onChange={(e) => setServiceForm({ ...serviceForm, title: e.target.value })}
                  placeholder="e.g. 20L Mineral Water Delivery"
                  className="w-full px-3 py-2 text-xs sm:text-sm rounded-xl border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-white"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                    Category *
                  </label>
                  <select
                    value={serviceForm.category}
                    onChange={(e) => setServiceForm({ ...serviceForm, category: e.target.value })}
                    className="w-full px-3 py-2 text-xs rounded-xl border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-white"
                  >
                    <option value="WATER_SUPPLY">Water Supply</option>
                    <option value="CLEANING">Cleaning</option>
                    <option value="ELECTRICIAN">Electrical</option>
                    <option value="PLUMBING">Plumbing</option>
                    <option value="PEST_CONTROL">Pest Control</option>
                    <option value="APPLIANCE">Appliance Repair</option>
                    <option value="OTHER">Other</option>
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                    Price (₹) *
                  </label>
                  <input
                    type="number"
                    required
                    min={0}
                    value={serviceForm.price}
                    onChange={(e) => setServiceForm({ ...serviceForm, price: Number(e.target.value) })}
                    className="w-full px-3 py-2 text-xs rounded-xl border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-white"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                    Pricing Type
                  </label>
                  <select
                    value={serviceForm.pricingType}
                    onChange={(e) =>
                      setServiceForm({ ...serviceForm, pricingType: e.target.value as PricingType })
                    }
                    className="w-full px-3 py-2 text-xs rounded-xl border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-white"
                  >
                    <option value="FIXED">Fixed Price</option>
                    <option value="STARTING_AT">Starting At</option>
                    <option value="HOURLY">Hourly Rate</option>
                    <option value="PER_UNIT">Per Unit</option>
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                    Availability
                  </label>
                  <select
                    value={serviceForm.availability}
                    onChange={(e) =>
                      setServiceForm({
                        ...serviceForm,
                        availability: e.target.value as ServiceAvailability,
                      })
                    }
                    className="w-full px-3 py-2 text-xs rounded-xl border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-white"
                  >
                    <option value="AVAILABLE">Available Always</option>
                    <option value="WEEKDAYS_ONLY">Weekdays Only</option>
                    <option value="WEEKENDS_ONLY">Weekends Only</option>
                    <option value="UNAVAILABLE">Temporarily Unavailable</option>
                  </select>
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                  Description
                </label>
                <textarea
                  rows={2}
                  value={serviceForm.description}
                  onChange={(e) => setServiceForm({ ...serviceForm, description: e.target.value })}
                  placeholder="Details of what is included in this service..."
                  className="w-full px-3 py-2 text-xs rounded-xl border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-white"
                />
              </div>

              <div className="flex justify-end gap-2 pt-3 border-t border-slate-100 dark:border-slate-800">
                <button
                  type="button"
                  onClick={() => setIsServiceModalOpen(false)}
                  className="px-4 py-2 rounded-xl border border-slate-300 dark:border-slate-700 text-xs font-semibold"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 rounded-xl bg-[#176B91] hover:bg-[#083B56] text-white text-xs font-bold shadow-xs cursor-pointer"
                >
                  {editingServiceId ? 'Save Changes' : 'Publish Service'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* ── ACCEPT REQUEST MODAL ── */}
      {isAcceptModalOpen && selectedRequest && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-xs p-4">
          <div className="bg-white dark:bg-slate-900 rounded-3xl max-w-md w-full p-6 shadow-2xl border border-slate-200 dark:border-slate-800 space-y-4">
            <h3 className="text-base font-bold text-slate-900 dark:text-white">Accept Booking Request</h3>
            <p className="text-xs text-slate-500">
              Confirm acceptance for <span className="font-bold">{selectedRequest.serviceTitle}</span> by {selectedRequest.residentName} ({selectedRequest.flatCode}).
            </p>
            <div>
              <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                Dispatch Note or Arrival Time (optional)
              </label>
              <input
                type="text"
                value={actionNotes}
                onChange={(e) => setActionNotes(e.target.value)}
                placeholder="e.g. Technician will arrive by 10:30 AM"
                className="w-full px-3 py-2 text-xs rounded-xl border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-white"
              />
            </div>
            <div className="flex justify-end gap-2 pt-2">
              <button
                type="button"
                onClick={() => setIsAcceptModalOpen(false)}
                className="px-4 py-2 rounded-xl border border-slate-300 text-xs font-semibold"
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={handleAcceptRequest}
                className="px-4 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-bold"
              >
                Confirm Acceptance
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ── REJECT REQUEST MODAL ── */}
      {isRejectModalOpen && selectedRequest && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-xs p-4">
          <div className="bg-white dark:bg-slate-900 rounded-3xl max-w-md w-full p-6 shadow-2xl border border-slate-200 dark:border-slate-800 space-y-4">
            <h3 className="text-base font-bold text-rose-600">Decline Booking Request</h3>
            <p className="text-xs text-slate-500">
              Specify the reason why you cannot fulfill this request for {selectedRequest.residentName}.
            </p>
            <div>
              <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                Reason *
              </label>
              <textarea
                rows={2}
                required
                value={actionNotes}
                onChange={(e) => setActionNotes(e.target.value)}
                placeholder="e.g. Fully booked for this time slot"
                className="w-full px-3 py-2 text-xs rounded-xl border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-white"
              />
            </div>
            <div className="flex justify-end gap-2 pt-2">
              <button
                type="button"
                onClick={() => setIsRejectModalOpen(false)}
                className="px-4 py-2 rounded-xl border border-slate-300 text-xs font-semibold"
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={handleRejectRequest}
                className="px-4 py-2 rounded-xl bg-rose-600 hover:bg-rose-700 text-white text-xs font-bold"
              >
                Decline Request
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Confirmation Dialog for deletions */}
      <ConfirmDialog
        isOpen={deleteConfirmOpen}
        onClose={() => setDeleteConfirmOpen(false)}
        onConfirm={async () => {
          if (itemToDelete?.type === 'service') {
            await vendorServiceRepository.delete(itemToDelete.id);
          }
          setDeleteConfirmOpen(false);
          setItemToDelete(null);
        }}
        title="Delete Service Offering?"
        message="Are you sure you want to remove this service from your catalog? Existing orders will not be affected."
        confirmText="Delete Service"
        variant="danger"
      />
    </div>
  );
};

export default VendorDashboard;
