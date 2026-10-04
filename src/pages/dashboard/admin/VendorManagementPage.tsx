import React, { useState, useEffect, useMemo } from 'react';
import {
  ShoppingBag,
  Plus,
  Download,
  ShieldCheck,
  Store,
  Layers,
  CheckCircle2,
  XCircle,
  AlertTriangle,
  Eye,
  FileText,
  CreditCard,
  Briefcase,
  History,
  UserCheck,
  Ban,
  Mail,
} from 'lucide-react';
import { DataTable, type Column } from '../../../components/ui/DataTable';
import { StatusBadge } from '../../../components/ui/StatusBadge';
import { Modal } from '../../../components/ui/Modal';
import { Form, FormField } from '../../../components/ui/Form';
import { MobileDataCard } from '../../../components/ui/MobileDataCard';
import { PageHeader } from '../../../components/ui/PageHeader';
import { StatCard } from '../../../components/ui/StatCard';
import { SearchBar } from '../../../components/ui/SearchBar';
import { ConfirmDialog } from '../../../components/ui/ConfirmDialog';
import { DocumentList } from '../../../components/common/DocumentList';
import { FileUploader } from '../../../components/common/FileUploader';
import {
  vendorRepository,
  vendorDocumentRepository,
  vendorServiceRepository,
  vendorRequestRepository,
} from '../../../repositories/vendors';
import type {
  VendorProfile,
  VendorDocument,
  VendorService,
  VendorRequest,
} from '../../../domains/vendors/types';
import { VendorPerformanceHub } from '../../../domains/vendors';

export const VendorManagementPage: React.FC = () => {
  const currentSocietyId = 'soc-gvs';

  // Live Firestore Real-Time Query
  const [vendors, setVendors] = useState<VendorProfile[]>([]);
  const [syncState, setSyncState] = useState<'LIVE' | 'SYNCING' | 'OFFLINE'>('SYNCING');

  useEffect(() => {
    setSyncState('SYNCING');
    const unsub = vendorRepository.subscribe(currentSocietyId, (list) => {
      setVendors(list);
      setSyncState('LIVE');
    });
    return () => unsub();
  }, [currentSocietyId]);

  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState<string>('ALL');

  // Create / Invite Vendor Modal State
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [isInviting, setIsInviting] = useState(false);
  const [companyName, setCompanyName] = useState('');
  const [category, setCategory] = useState('WATER_SUPPLY');
  const [contactPerson, setContactPerson] = useState('');
  const [phone, setPhone] = useState('');
  const [email, setEmail] = useState('');
  const [address, setAddress] = useState('');
  const [documentUrl, setDocumentUrl] = useState('');
  const [documentName, setDocumentName] = useState('');

  // Vendor Details & Audit Inspection Modal
  const [selectedVendor, setSelectedVendor] = useState<VendorProfile | null>(null);
  const [vendorDetailTab, setVendorDetailTab] = useState<'docs' | 'services' | 'jobs' | 'payments' | 'audit'>('docs');
  const [vendorDocs, setVendorDocs] = useState<VendorDocument[]>([]);
  const [vendorServices, setVendorServices] = useState<VendorService[]>([]);
  const [vendorJobs, setVendorJobs] = useState<VendorRequest[]>([]);

  // Confirmation dialogs
  const [confirmDialog, setConfirmDialog] = useState<{
    isOpen: boolean;
    title: string;
    message: string;
    confirmText: string;
    variant: 'danger' | 'warning' | 'info';
    action: () => Promise<void>;
  }>({
    isOpen: false,
    title: '',
    message: '',
    confirmText: 'Confirm',
    variant: 'info',
    action: async () => {},
  });

  // Load details when selected vendor changes
  useEffect(() => {
    if (!selectedVendor) return;
    const unsubDocs = vendorDocumentRepository.subscribeByVendor(selectedVendor.uid, (d) => setVendorDocs(d));
    const unsubServices = vendorServiceRepository.subscribeByVendor(selectedVendor.uid, (s) => setVendorServices(s));
    const unsubJobs = vendorRequestRepository.subscribeByVendor(selectedVendor.uid, (j) => setVendorJobs(j));

    return () => {
      unsubDocs();
      unsubServices();
      unsubJobs();
    };
  }, [selectedVendor]);

  // Handle Create or Invite Vendor
  const handleCreateOrInviteVendor = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!companyName || !contactPerson) return;

    const vendorUid = `vendor-${Date.now().toString().slice(-6)}`;
    await vendorRepository.create({
      uid: vendorUid,
      societyId: currentSocietyId,
      companyName,
      category,
      contactPerson,
      phone,
      email,
      address,
      status: isInviting ? 'PENDING' : 'ACTIVE',
      approvalStatus: isInviting ? 'PENDING' : 'APPROVED',
      rating: 5.0,
      totalReviews: 0,
      totalJobs: 0,
      verifiedDocumentsCount: documentUrl ? 1 : 0,
    } as any);

    if (documentUrl) {
      await vendorDocumentRepository.create({
        societyId: currentSocietyId,
        vendorId: vendorUid,
        documentType: 'AGREEMENT',
        title: documentName || 'Initial Vendor Agreement',
        fileUrl: documentUrl,
        fileName: documentName,
        status: isInviting ? 'PENDING' : 'VERIFIED',
      } as any);
    }

    setIsAddModalOpen(false);
    setCompanyName('');
    setContactPerson('');
    setPhone('');
    setEmail('');
    setAddress('');
    setDocumentUrl('');
    setDocumentName('');
  };

  // Vendor Action Handlers with Confirmation
  const promptApprove = (v: VendorProfile) => {
    setConfirmDialog({
      isOpen: true,
      title: `Approve Vendor "${v.companyName}"?`,
      message: 'Approving will grant this vendor immediate catalog access and allow them to receive service bookings from residents.',
      confirmText: 'Approve & Activate',
      variant: 'info',
      action: async () => {
        await vendorRepository.approveVendor(v.id);
      },
    });
  };

  const promptReject = (v: VendorProfile) => {
    setConfirmDialog({
      isOpen: true,
      title: `Reject Vendor Application "${v.companyName}"?`,
      message: 'This will reject the vendor onboarding submission. The vendor will be notified to revise their documentation.',
      confirmText: 'Reject Application',
      variant: 'danger',
      action: async () => {
        await vendorRepository.rejectVendor(v.id, 'Does not meet society statutory compliance criteria');
      },
    });
  };

  const promptSuspend = (v: VendorProfile) => {
    setConfirmDialog({
      isOpen: true,
      title: `Suspend Vendor "${v.companyName}"?`,
      message: 'Suspending will immediately hide the vendor services from residents and freeze new requests.',
      confirmText: 'Suspend Vendor',
      variant: 'danger',
      action: async () => {
        await vendorRepository.suspendVendor(v.id);
      },
    });
  };

  const promptReactivate = (v: VendorProfile) => {
    setConfirmDialog({
      isOpen: true,
      title: `Reactivate Vendor "${v.companyName}"?`,
      message: 'Reactivating will restore public service visibility and allow resident bookings.',
      confirmText: 'Reactivate',
      variant: 'info',
      action: async () => {
        await vendorRepository.reactivateVendor(v.id);
      },
    });
  };

  const handleVerifyDocument = async (docId: string) => {
    await vendorDocumentRepository.verifyDocument(docId, 'Admin');
  };

  const handleRejectDocument = async (docId: string) => {
    await vendorDocumentRepository.rejectDocument(docId, 'Document unreadable or invalid credentials', 'Admin');
  };

  // Filter vendors
  const filteredVendors = useMemo(() => {
    return vendors.filter((v) => {
      const matchesSearch =
        v.companyName.toLowerCase().includes(searchQuery.toLowerCase()) ||
        v.category.toLowerCase().includes(searchQuery.toLowerCase()) ||
        v.contactPerson.toLowerCase().includes(searchQuery.toLowerCase());
      const matchesStatus = statusFilter === 'ALL' || v.status === statusFilter || v.approvalStatus === statusFilter;
      return matchesSearch && matchesStatus;
    });
  }, [vendors, searchQuery, statusFilter]);

  const activeVendorsCount = vendors.filter((v) => v.status === 'ACTIVE').length;
  const pendingVendorsCount = vendors.filter((v) => v.approvalStatus === 'PENDING').length;
  const uniqueCategoriesCount = new Set(vendors.map((v) => v.category)).size;

  const columns: Column<VendorProfile>[] = [
    { key: 'companyName', header: 'Vendor / Company', sortable: true },
    { key: 'category', header: 'Service Category' },
    {
      key: 'contactPerson',
      header: 'Contact Person',
      render: (v) => (
        <div>
          <div className="font-semibold text-slate-800 dark:text-slate-200">{v.contactPerson}</div>
          <div className="text-xs text-slate-500 dark:text-slate-400">{v.phone}</div>
        </div>
      ),
    },
    {
      key: 'status',
      header: 'Account Status',
      render: (v) => (
        <StatusBadge
          label={v.status}
          variant={
            v.status === 'ACTIVE'
              ? 'success'
              : v.status === 'SUSPENDED' || v.status === 'REJECTED'
              ? 'danger'
              : 'warning'
          }
        />
      ),
    },
    {
      key: 'approvalStatus',
      header: 'Admin Approval',
      render: (v) => (
        <StatusBadge
          label={v.approvalStatus || 'PENDING'}
          variant={
            v.approvalStatus === 'APPROVED'
              ? 'success'
              : v.approvalStatus === 'REJECTED'
              ? 'danger'
              : 'warning'
          }
        />
      ),
    },
    {
      key: 'actions' as any,
      header: 'Actions',
      render: (v) => (
        <div className="flex items-center gap-1.5">
          <button
            type="button"
            onClick={() => {
              setSelectedVendor(v);
              setVendorDetailTab('docs');
            }}
            className="p-1.5 rounded-lg bg-slate-100 hover:bg-slate-200 dark:bg-slate-700 text-slate-700 dark:text-slate-200 text-xs font-semibold cursor-pointer"
            title="Inspect & Verify"
          >
            <Eye size={14} />
          </button>

          {v.approvalStatus === 'PENDING' && (
            <>
              <button
                type="button"
                onClick={() => promptApprove(v)}
                className="p-1.5 rounded-lg bg-emerald-100 hover:bg-emerald-200 text-emerald-800 text-xs font-semibold cursor-pointer"
                title="Approve Vendor"
              >
                <CheckCircle2 size={14} />
              </button>
              <button
                type="button"
                onClick={() => promptReject(v)}
                className="p-1.5 rounded-lg bg-rose-100 hover:bg-rose-200 text-rose-800 text-xs font-semibold cursor-pointer"
                title="Reject Vendor"
              >
                <XCircle size={14} />
              </button>
            </>
          )}

          {v.status === 'ACTIVE' && (
            <button
              type="button"
              onClick={() => promptSuspend(v)}
              className="p-1.5 rounded-lg bg-amber-100 hover:bg-amber-200 text-amber-800 text-xs font-semibold cursor-pointer"
              title="Suspend Vendor"
            >
              <Ban size={14} />
            </button>
          )}

          {v.status === 'SUSPENDED' && (
            <button
              type="button"
              onClick={() => promptReactivate(v)}
              className="p-1.5 rounded-lg bg-sky-100 hover:bg-sky-200 text-sky-800 text-xs font-semibold cursor-pointer"
              title="Reactivate Vendor"
            >
              <UserCheck size={14} />
            </button>
          )}
        </div>
      ),
    },
  ];

  return (
    <div className="p-4 md:p-6 pb-24 max-w-7xl mx-auto space-y-6">
      {/* SaaS Page Header */}
      <PageHeader
        title="Vendor Management & Procurement"
        subtitle="Manage approved society suppliers, verify compliance documents, track jobs, and moderate service offerings in real time."
        icon={ShoppingBag}
        syncStatus={syncState}
        breadcrumbs={[
          { label: 'Admin', href: '/admin' },
          { label: 'Vendors' },
        ]}
        actions={
          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={() => {
                setIsInviting(true);
                setIsAddModalOpen(true);
              }}
              className="flex items-center gap-1.5 px-3 py-2 rounded-xl bg-slate-100 hover:bg-slate-200 dark:bg-slate-800 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-300 text-xs sm:text-sm font-semibold transition cursor-pointer"
            >
              <Mail size={16} />
              <span>Invite Vendor</span>
            </button>
            <button
              type="button"
              onClick={() => {
                setIsInviting(false);
                setIsAddModalOpen(true);
              }}
              className="flex items-center gap-1.5 px-4 py-2 rounded-xl bg-[#176B91] hover:bg-[#083B56] text-white text-xs sm:text-sm font-bold shadow-sm transition-colors cursor-pointer"
            >
              <Plus size={16} />
              <span>Onboard Vendor</span>
            </button>
          </div>
        }
      />

      {/* Modern SaaS Stat Cards */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4">
        <StatCard
          title="Total Vendors"
          value={vendors.length}
          subtitle="Registered suppliers"
          icon={Store}
          color="blue"
        />
        <StatCard
          title="Active Vendors"
          value={activeVendorsCount}
          subtitle="Verified & operating"
          icon={ShieldCheck}
          color="emerald"
        />
        <StatCard
          title="Pending Approvals"
          value={pendingVendorsCount}
          subtitle="Awaiting admin action"
          icon={AlertTriangle}
          color={pendingVendorsCount > 0 ? 'amber' : 'emerald'}
        />
        <StatCard
          title="Service Categories"
          value={uniqueCategoriesCount}
          subtitle="Essential utilities"
          icon={Layers}
          color="purple"
        />
      </div>

      {/* Main Vendor Directory Card */}
      <div className="bg-white dark:bg-slate-800 rounded-2xl border border-slate-200/80 dark:border-slate-700/80 p-4 sm:p-5 shadow-xs space-y-4">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          <div>
            <h3 className="text-sm font-bold text-slate-900 dark:text-white">Vendor Directory</h3>
            <p className="text-xs text-slate-500 dark:text-slate-400">Live synchronized with Firestore</p>
          </div>
          <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-2">
            <div className="w-full sm:w-64">
              <SearchBar
                value={searchQuery}
                onChange={setSearchQuery}
                placeholder="Search vendor or category..."
              />
            </div>
            <select
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
              className="px-3 py-2 text-xs rounded-xl border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-900 text-slate-800 dark:text-slate-200"
            >
              <option value="ALL">All Statuses</option>
              <option value="PENDING">Pending Review</option>
              <option value="ACTIVE">Active</option>
              <option value="APPROVED">Approved</option>
              <option value="SUSPENDED">Suspended</option>
              <option value="REJECTED">Rejected</option>
            </select>
          </div>
        </div>

        <DataTable
          columns={columns}
          data={filteredVendors}
          keyExtractor={(v) => v.id}
          pageSize={8}
          mobileRender={(v) => (
            <MobileDataCard
              title={v.companyName}
              subtitle={v.category}
              status={
                <StatusBadge
                  label={v.status}
                  variant={v.status === 'ACTIVE' ? 'success' : 'danger'}
                />
              }
              attributes={[
                { label: 'Contact', value: `${v.contactPerson} (${v.phone})` },
                { label: 'Approval', value: v.approvalStatus || 'PENDING' },
              ]}
              actions={
                <button
                  type="button"
                  onClick={() => {
                    setSelectedVendor(v);
                    setVendorDetailTab('docs');
                  }}
                  className="px-3 py-1.5 rounded-lg bg-[#176B91] text-white text-xs font-bold"
                >
                  Manage
                </button>
              }
            />
          )}
        />
      </div>

      {/* Live Firestore Document Vault */}
      <DocumentList
        societyId={currentSocietyId}
        entityType="vendor"
        title="Society Vendor Contracts & Compliance Vault"
      />

      <VendorPerformanceHub />

      {/* Onboard / Invite Vendor Modal */}
      <Modal
        isOpen={isAddModalOpen}
        onClose={() => setIsAddModalOpen(false)}
        title={isInviting ? 'Invite New Society Vendor' : 'Onboard Society Vendor'}
      >
        <Form onSubmit={handleCreateOrInviteVendor}>
          <div className="space-y-4">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 sm:gap-4">
              <FormField label="Company Name *">
                <input
                  type="text"
                  required
                  value={companyName}
                  onChange={(e) => setCompanyName(e.target.value)}
                  placeholder="e.g. Pure Aqua Solutions Pvt Ltd"
                  className="w-full p-2.5 rounded-xl border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-900 text-slate-900 dark:text-white text-xs sm:text-sm focus:outline-none focus:ring-2 focus:ring-[#176B91]"
                />
              </FormField>
              <FormField label="Service Category">
                <select
                  value={category}
                  onChange={(e) => setCategory(e.target.value)}
                  className="w-full p-2.5 rounded-xl border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-900 text-slate-900 dark:text-white text-xs sm:text-sm focus:outline-none focus:ring-2 focus:ring-[#176B91]"
                >
                  <option value="WATER_SUPPLY">Water Supply</option>
                  <option value="CLEANING">Cleaning &amp; Housekeeping</option>
                  <option value="ELECTRICIAN">Electrical Services</option>
                  <option value="PLUMBING">Plumbing</option>
                  <option value="WASTE_MANAGEMENT">Waste Management</option>
                  <option value="ELEVATOR_MAINTENANCE">Elevator Maintenance</option>
                  <option value="SECURITY_AGENCY">Security Agency</option>
                  <option value="LANDSCAPING">Landscaping</option>
                  <option value="INTERNET">Internet &amp; Telecom</option>
                  <option value="OTHER">Other Services</option>
                </select>
              </FormField>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 sm:gap-4">
              <FormField label="Contact Person *">
                <input
                  type="text"
                  required
                  value={contactPerson}
                  onChange={(e) => setContactPerson(e.target.value)}
                  placeholder="e.g. Ramesh Kumar"
                  className="w-full p-2.5 rounded-xl border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-900 text-slate-900 dark:text-white text-xs sm:text-sm focus:outline-none focus:ring-2 focus:ring-[#176B91]"
                />
              </FormField>
              <FormField label="Phone Number *">
                <input
                  type="tel"
                  required
                  value={phone}
                  onChange={(e) => setPhone(e.target.value)}
                  placeholder="e.g. 9822100445"
                  className="w-full p-2.5 rounded-xl border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-900 text-slate-900 dark:text-white text-xs sm:text-sm focus:outline-none focus:ring-2 focus:ring-[#176B91]"
                />
              </FormField>
            </div>

            <FormField label="Email Address">
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="e.g. vendor@supplier.com"
                className="w-full p-2.5 rounded-xl border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-900 text-slate-900 dark:text-white text-xs sm:text-sm focus:outline-none focus:ring-2 focus:ring-[#176B91]"
              />
            </FormField>

            <FormField label="Registered Office Address">
              <input
                type="text"
                value={address}
                onChange={(e) => setAddress(e.target.value)}
                placeholder="e.g. Office 101, Business Bay, Pune"
                className="w-full p-2.5 rounded-xl border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-900 text-slate-900 dark:text-white text-xs sm:text-sm focus:outline-none focus:ring-2 focus:ring-[#176B91]"
              />
            </FormField>

            <div className="pt-2">
              <FileUploader
                label="Contract / Trade License PDF"
                description="Upload PDF or image to Firebase Storage"
                societyId={currentSocietyId}
                entityType="vendor"
                onUploadSuccess={(res) => {
                  setDocumentUrl(res.downloadUrl);
                  setDocumentName(res.name);
                }}
              />
              {documentName && (
                <p className="text-xs text-emerald-600 mt-1 font-semibold">Attached: {documentName}</p>
              )}
            </div>

            <div className="flex justify-end gap-2 pt-3 border-t border-slate-200 dark:border-slate-700">
              <button
                type="button"
                onClick={() => setIsAddModalOpen(false)}
                className="px-4 py-2 border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-700 dark:text-slate-300 rounded-xl font-semibold text-xs sm:text-sm hover:bg-slate-50 transition cursor-pointer"
              >
                Cancel
              </button>
              <button
                type="submit"
                className="px-4 py-2 bg-[#176B91] hover:bg-[#083B56] text-white rounded-xl font-bold text-xs sm:text-sm shadow-md transition cursor-pointer"
              >
                {isInviting ? 'Send Invitation' : 'Onboard Vendor'}
              </button>
            </div>
          </div>
        </Form>
      </Modal>

      {/* Vendor Inspection & Audit Detail Modal */}
      {selectedVendor && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-xs p-4">
          <div className="bg-white dark:bg-slate-900 rounded-3xl max-w-3xl w-full p-6 shadow-2xl border border-slate-200 dark:border-slate-800 space-y-4 max-h-[90vh] overflow-y-auto">
            <div className="flex items-start justify-between border-b border-slate-100 dark:border-slate-800 pb-3">
              <div>
                <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400">
                  Vendor Inspection
                </span>
                <h3 className="text-lg font-bold text-slate-900 dark:text-white">
                  {selectedVendor.companyName}
                </h3>
                <p className="text-xs text-slate-500">
                  {selectedVendor.contactPerson} · {selectedVendor.phone} · {selectedVendor.category}
                </p>
              </div>
              <button
                type="button"
                onClick={() => setSelectedVendor(null)}
                className="p-1 rounded-lg text-slate-400 hover:text-slate-600"
              >
                <XCircle size={20} />
              </button>
            </div>

            {/* Modal Tabs */}
            <div className="flex items-center gap-2 border-b border-slate-200 dark:border-slate-800 pb-2">
              {[
                { id: 'docs', label: `Documents (${vendorDocs.length})`, icon: ShieldCheck },
                { id: 'services', label: `Services (${vendorServices.length})`, icon: ShoppingBag },
                { id: 'jobs', label: `Jobs / Orders (${vendorJobs.length})`, icon: Briefcase },
                { id: 'payments', label: 'Payments', icon: CreditCard },
                { id: 'audit', label: 'Audit History', icon: History },
              ].map((tab) => {
                const Icon = tab.icon;
                const isActive = vendorDetailTab === tab.id;
                return (
                  <button
                    key={tab.id}
                    onClick={() => setVendorDetailTab(tab.id as any)}
                    className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-bold transition cursor-pointer ${
                      isActive
                        ? 'bg-[#176B91] text-white'
                        : 'text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800'
                    }`}
                  >
                    <Icon size={14} />
                    <span>{tab.label}</span>
                  </button>
                );
              })}
            </div>

            {/* TAB: Documents Verification */}
            {vendorDetailTab === 'docs' && (
              <div className="space-y-3">
                {vendorDocs.length === 0 ? (
                  <div className="p-6 text-center border border-dashed border-slate-200 dark:border-slate-800 rounded-xl">
                    <p className="text-xs text-slate-400">No documents uploaded for this vendor.</p>
                  </div>
                ) : (
                  vendorDocs.map((doc) => (
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
                            className="p-1.5 rounded-lg bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300"
                            title="Open Document"
                          >
                            <Download size={14} />
                          </a>
                        )}
                        {doc.status === 'PENDING' && (
                          <>
                            <button
                              type="button"
                              onClick={() => handleVerifyDocument(doc.id)}
                              className="px-2.5 py-1 rounded-lg bg-emerald-600 text-white text-xs font-bold"
                            >
                              Verify
                            </button>
                            <button
                              type="button"
                              onClick={() => handleRejectDocument(doc.id)}
                              className="px-2.5 py-1 rounded-lg bg-rose-100 text-rose-700 text-xs font-bold"
                            >
                              Reject
                            </button>
                          </>
                        )}
                      </div>
                    </div>
                  ))
                )}
              </div>
            )}

            {/* TAB: Services Offered */}
            {vendorDetailTab === 'services' && (
              <div className="space-y-2">
                {vendorServices.length === 0 ? (
                  <p className="text-xs text-slate-400 p-4 text-center">No services published yet.</p>
                ) : (
                  vendorServices.map((s) => (
                    <div
                      key={s.id}
                      className="p-3 rounded-xl border border-slate-200 dark:border-slate-800 flex items-center justify-between"
                    >
                      <div>
                        <span className="text-xs font-bold text-slate-900 dark:text-white">{s.title}</span>
                        <p className="text-[11px] text-slate-500">{s.description}</p>
                      </div>
                      <div className="flex items-center gap-2">
                        <span className="text-xs font-black text-slate-900 dark:text-white">₹{s.price}</span>
                        <StatusBadge label={s.status} variant={s.status === 'ACTIVE' ? 'success' : 'neutral'} />
                      </div>
                    </div>
                  ))
                )}
              </div>
            )}

            {/* TAB: Jobs / Orders */}
            {vendorDetailTab === 'jobs' && (
              <div className="space-y-2">
                {vendorJobs.length === 0 ? (
                  <p className="text-xs text-slate-400 p-4 text-center">No jobs on record.</p>
                ) : (
                  vendorJobs.map((j) => (
                    <div
                      key={j.id}
                      className="p-3 rounded-xl border border-slate-200 dark:border-slate-800 flex items-center justify-between"
                    >
                      <div>
                        <span className="text-xs font-mono font-bold text-[#176B91]">{j.orderNumber}</span>
                        <p className="text-xs text-slate-800 dark:text-slate-200">
                          {j.serviceTitle} · {j.residentName} ({j.flatCode})
                        </p>
                      </div>
                      <div className="flex items-center gap-2">
                        <StatusBadge label={j.status} variant={j.status === 'COMPLETED' ? 'success' : 'warning'} />
                        <span className="text-xs font-black text-slate-900 dark:text-white">₹{j.price}</span>
                      </div>
                    </div>
                  ))
                )}
              </div>
            )}

            {/* TAB: Payments */}
            {vendorDetailTab === 'payments' && (
              <div className="space-y-3">
                <div className="p-4 rounded-xl bg-slate-50 dark:bg-slate-800">
                  <span className="text-xs font-semibold text-slate-500">Total Fulfilled Volume</span>
                  <h4 className="text-xl font-black text-slate-900 dark:text-white">
                    ₹
                    {vendorJobs
                      .filter((j) => j.paymentStatus === 'PAID')
                      .reduce((sum, j) => sum + (j.price || 0), 0)
                      .toLocaleString('en-IN')}
                  </h4>
                </div>
              </div>
            )}

            {/* TAB: Audit History */}
            {vendorDetailTab === 'audit' && (
              <div className="space-y-2 text-xs text-slate-600 dark:text-slate-400">
                <div className="p-3 rounded-xl bg-slate-50 dark:bg-slate-800 flex items-center justify-between">
                  <span>Vendor Record Registered</span>
                  <span className="font-semibold text-slate-800 dark:text-slate-200">System Admin</span>
                </div>
                <div className="p-3 rounded-xl bg-slate-50 dark:bg-slate-800 flex items-center justify-between">
                  <span>Status: {selectedVendor.status}</span>
                  <span className="font-semibold text-slate-800 dark:text-slate-200">Current</span>
                </div>
              </div>
            )}
          </div>
        </div>
      )}

      {/* Confirmation Dialog */}
      <ConfirmDialog
        isOpen={confirmDialog.isOpen}
        onClose={() => setConfirmDialog((prev) => ({ ...prev, isOpen: false }))}
        onConfirm={async () => {
          await confirmDialog.action();
          setConfirmDialog((prev) => ({ ...prev, isOpen: false }));
        }}
        title={confirmDialog.title}
        message={confirmDialog.message}
        confirmText={confirmDialog.confirmText}
        variant={confirmDialog.variant}
      />
    </div>
  );
};

export default VendorManagementPage;
