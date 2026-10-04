import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Store,
  Clock,
  AlertTriangle,
  CheckCircle2,
  FileText,
  ArrowRight,
  Building2,
  Phone,
  Mail,
  MapPin,
  XCircle,
  Eye,
} from 'lucide-react';
import { useAuth } from '../../../context/AuthContext';
import { vendorRepository } from '../../../repositories/vendors/VendorRepository';
import { vendorDocumentRepository } from '../../../repositories/vendors/VendorDocumentRepository';
import type { VendorProfile, VendorDocument, VendorDocumentType } from '../../../domains/vendors/types';
import { FileUploader } from '../../../components/common/FileUploader';
import { StatusBadge, PageHeader } from '../../../components/ui';

export const VendorOnboardingPage: React.FC = () => {
  const navigate = useNavigate();
  const { currentUser } = useAuth();
  const vendorUid = currentUser?.uid || currentUser?.id || 'user-vendor-01';
  const societyId = currentUser?.societyId || 'soc-gvs';

  const [vendorProfile, setVendorProfile] = useState<VendorProfile | null>(null);
  const [documents, setDocuments] = useState<VendorDocument[]>([]);
  const [isSaving, setIsSaving] = useState(false);
  const [saveSuccess, setSaveSuccess] = useState(false);

  // Form fields
  const [companyName, setCompanyName] = useState('');
  const [contactPerson, setContactPerson] = useState('');
  const [email, setEmail] = useState('');
  const [phone, setPhone] = useState('');
  const [category, setCategory] = useState('WATER_SUPPLY');
  const [address, setAddress] = useState('');

  // Document upload state
  const [selectedDocType, setSelectedDocType] = useState<VendorDocumentType>('GST_CERTIFICATE');
  const [docTitle, setDocTitle] = useState('');
  const [docExpiryDate, setDocExpiryDate] = useState('');
  const [uploadSuccessMsg, setUploadSuccessMsg] = useState<string | null>(null);

  // Subscribe to vendor profile updates in real-time
  useEffect(() => {
    if (!vendorUid) return;

    const unsubVendor = vendorRepository.subscribeVendorByUid(vendorUid, (profile) => {
      if (profile) {
        setVendorProfile(profile);
        setCompanyName(profile.companyName || '');
        setContactPerson(profile.contactPerson || '');
        setEmail(profile.email || currentUser?.email || '');
        setPhone(profile.phone || currentUser?.phone || '');
        setCategory(profile.category || 'WATER_SUPPLY');
        setAddress(profile.address || '');
      } else {
        // Init default from current user
        setCompanyName(currentUser?.name || '');
        setEmail(currentUser?.email || '');
        setPhone(currentUser?.phone || '');
      }
    });

    const unsubDocs = vendorDocumentRepository.subscribeByVendor(vendorUid, (docs) => {
      setDocuments(docs);
    });

    return () => {
      unsubVendor();
      unsubDocs();
    };
  }, [vendorUid, currentUser]);

  const handleSaveProfile = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSaving(true);
    setSaveSuccess(false);

    try {
      const dataToSave = {
        uid: vendorUid,
        societyId,
        companyName,
        contactPerson,
        email,
        phone,
        category,
        address,
        status: vendorProfile?.status || 'PENDING',
        approvalStatus: vendorProfile?.approvalStatus || 'PENDING',
      };

      if (vendorProfile?.id) {
        await vendorRepository.update(vendorProfile.id, dataToSave as any);
      } else {
        await vendorRepository.upsertWithId(vendorUid, dataToSave);
      }

      setSaveSuccess(true);
      setTimeout(() => setSaveSuccess(false), 3000);
    } catch (err) {
      console.error('Failed to save vendor profile:', err);
    } finally {
      setIsSaving(false);
    }
  };

  const handleDocumentUploaded = async (uploadRes: { downloadUrl: string; name: string; size: number }) => {
    try {
      await vendorDocumentRepository.create({
        societyId,
        vendorId: vendorUid,
        documentType: selectedDocType,
        title: docTitle.trim() || selectedDocType.replace(/_/g, ' '),
        fileUrl: uploadRes.downloadUrl,
        fileName: uploadRes.name,
        fileSize: uploadRes.size,
        status: 'PENDING',
        expiryDate: docExpiryDate || undefined,
      } as any);

      setUploadSuccessMsg(`${docTitle || selectedDocType} uploaded successfully for verification!`);
      setDocTitle('');
      setDocExpiryDate('');
      setTimeout(() => setUploadSuccessMsg(null), 4000);
    } catch (err) {
      console.error('Failed to record vendor document in Firestore:', err);
    }
  };

  const isApproved = vendorProfile?.approvalStatus === 'APPROVED' || vendorProfile?.status === 'ACTIVE' || currentUser?.role === 'admin' || currentUser?.role === 'secretary';
  const isPending = vendorProfile?.approvalStatus === 'PENDING' && !isApproved;
  const isSuspended = vendorProfile?.status === 'SUSPENDED';
  const isRejected = vendorProfile?.approvalStatus === 'REJECTED';

  return (
    <div className="min-h-screen bg-slate-50 dark:bg-slate-950 p-4 sm:p-6 lg:p-8">
      <div className="max-w-5xl mx-auto space-y-6">
        <PageHeader
          title="Vendor Onboarding & Compliance Portal"
          subtitle="Complete your business profile and upload statutory compliance documents for society admin verification."
          icon={Store}
          breadcrumbs={[
            { label: 'Vendor', href: '/vendor' },
            { label: 'Onboarding & Verification' },
          ]}
        />

        {/* Status Callout Banner */}
        {isApproved && (
          <div className="p-4 sm:p-5 rounded-2xl bg-emerald-50 dark:bg-emerald-950/40 border border-emerald-200 dark:border-emerald-800 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <div className="flex items-start gap-3">
              <CheckCircle2 className="w-6 h-6 text-emerald-600 dark:text-emerald-400 shrink-0 mt-0.5" />
              <div>
                <h4 className="text-sm font-bold text-emerald-900 dark:text-emerald-100">
                  Vendor Account Approved & Verified
                </h4>
                <p className="text-xs text-emerald-700 dark:text-emerald-300 mt-0.5">
                  You have full access to society service requests, orders, catalogs, and payouts.
                </p>
              </div>
            </div>
            <button
              type="button"
              onClick={() => navigate('/vendor')}
              className="inline-flex items-center justify-center gap-2 px-4 py-2.5 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white text-xs sm:text-sm font-bold shadow-xs transition cursor-pointer"
            >
              <span>Access Vendor Dashboard</span>
              <ArrowRight size={16} />
            </button>
          </div>
        )}

        {isPending && (
          <div className="p-4 sm:p-5 rounded-2xl bg-amber-50 dark:bg-amber-950/40 border border-amber-200 dark:border-amber-800 flex items-start gap-3">
            <Clock className="w-6 h-6 text-amber-600 dark:text-amber-400 shrink-0 mt-0.5 animate-pulse" />
            <div>
              <h4 className="text-sm font-bold text-amber-900 dark:text-amber-100">
                Application Under Review by Society Committee
              </h4>
              <p className="text-xs text-amber-700 dark:text-amber-300 mt-0.5">
                Our management team is reviewing your compliance documents and business registration. Once verified, your account will be activated immediately in real time.
              </p>
            </div>
          </div>
        )}

        {isSuspended && (
          <div className="p-4 sm:p-5 rounded-2xl bg-rose-50 dark:bg-rose-950/40 border border-rose-200 dark:border-rose-800 flex items-start gap-3">
            <XCircle className="w-6 h-6 text-rose-600 dark:text-rose-400 shrink-0 mt-0.5" />
            <div>
              <h4 className="text-sm font-bold text-rose-900 dark:text-rose-100">
                Account Suspended
              </h4>
              <p className="text-xs text-rose-700 dark:text-rose-300 mt-0.5">
                Your vendor account is temporarily suspended. Please get in touch with the Green Valley Society office to resolve compliance requirements.
              </p>
            </div>
          </div>
        )}

        {isRejected && (
          <div className="p-4 sm:p-5 rounded-2xl bg-rose-50 dark:bg-rose-950/40 border border-rose-200 dark:border-rose-800 flex items-start gap-3">
            <AlertTriangle className="w-6 h-6 text-rose-600 dark:text-rose-400 shrink-0 mt-0.5" />
            <div>
              <h4 className="text-sm font-bold text-rose-900 dark:text-rose-100">
                Application Rejected
              </h4>
              <p className="text-xs text-rose-700 dark:text-rose-300 mt-0.5">
                Your previous submission was not approved. Please verify your statutory documentation, update your profile below, and resubmit.
              </p>
            </div>
          </div>
        )}

        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
          {/* Left Column: Vendor Profile Form */}
          <div className="lg:col-span-7 bg-white dark:bg-slate-900 rounded-2xl border border-slate-200/80 dark:border-slate-800 p-5 sm:p-6 shadow-xs space-y-5">
            <div className="border-b border-slate-100 dark:border-slate-800 pb-3 flex items-center justify-between">
              <div>
                <h3 className="text-base font-bold text-slate-900 dark:text-white">Business Profile</h3>
                <p className="text-xs text-slate-500">Provide official trade details and contacts</p>
              </div>
              <StatusBadge
                label={vendorProfile?.approvalStatus || 'PENDING'}
                variant={isApproved ? 'success' : isRejected ? 'danger' : 'warning'}
              />
            </div>

            <form onSubmit={handleSaveProfile} className="space-y-4">
              <div>
                <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                  Company / Agency Name *
                </label>
                <div className="relative">
                  <Building2 className="w-4 h-4 absolute left-3 top-3 text-slate-400" />
                  <input
                    type="text"
                    required
                    value={companyName}
                    onChange={(e) => setCompanyName(e.target.value)}
                    placeholder="e.g. AquaPure Mineral Water Ltd"
                    className="w-full pl-9 pr-3 py-2 text-xs sm:text-sm rounded-xl border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-[#176B91]"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                    Contact Person Name *
                  </label>
                  <input
                    type="text"
                    required
                    value={contactPerson}
                    onChange={(e) => setContactPerson(e.target.value)}
                    placeholder="e.g. Ramesh Kumar"
                    className="w-full px-3 py-2 text-xs sm:text-sm rounded-xl border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-[#176B91]"
                  />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                    Primary Service Category *
                  </label>
                  <select
                    value={category}
                    onChange={(e) => setCategory(e.target.value)}
                    className="w-full px-3 py-2 text-xs sm:text-sm rounded-xl border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-[#176B91]"
                  >
                    <option value="WATER_SUPPLY">Water Supply</option>
                    <option value="CLEANING">Cleaning &amp; Housekeeping</option>
                    <option value="ELECTRICIAN">Electrical Services</option>
                    <option value="PLUMBING">Plumbing &amp; Sanitary</option>
                    <option value="WASTE_MANAGEMENT">Waste Management</option>
                    <option value="ELEVATOR_MAINTENANCE">Elevator Maintenance</option>
                    <option value="SECURITY_AGENCY">Security Agency</option>
                    <option value="PEST_CONTROL">Pest Control</option>
                    <option value="LANDSCAPING">Gardening &amp; Landscaping</option>
                    <option value="OTHER">Other Professional Services</option>
                  </select>
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                    Direct Phone *
                  </label>
                  <div className="relative">
                    <Phone className="w-4 h-4 absolute left-3 top-3 text-slate-400" />
                    <input
                      type="tel"
                      required
                      value={phone}
                      onChange={(e) => setPhone(e.target.value)}
                      placeholder="e.g. 9822100445"
                      className="w-full pl-9 pr-3 py-2 text-xs sm:text-sm rounded-xl border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-[#176B91]"
                    />
                  </div>
                </div>
                <div>
                  <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                    Official Email
                  </label>
                  <div className="relative">
                    <Mail className="w-4 h-4 absolute left-3 top-3 text-slate-400" />
                    <input
                      type="email"
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      placeholder="e.g. sales@aquapure.com"
                      className="w-full pl-9 pr-3 py-2 text-xs sm:text-sm rounded-xl border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-[#176B91]"
                    />
                  </div>
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                  Registered Business Address
                </label>
                <div className="relative">
                  <MapPin className="w-4 h-4 absolute left-3 top-3 text-slate-400" />
                  <textarea
                    rows={2}
                    value={address}
                    onChange={(e) => setAddress(e.target.value)}
                    placeholder="e.g. Unit 402, Apex Commercial Complex, Pune"
                    className="w-full pl-9 pr-3 py-2 text-xs sm:text-sm rounded-xl border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-[#176B91]"
                  />
                </div>
              </div>

              <div className="pt-2 flex items-center justify-between">
                {saveSuccess ? (
                  <span className="text-xs text-emerald-600 font-semibold flex items-center gap-1">
                    <CheckCircle2 size={14} /> Profile details saved!
                  </span>
                ) : <span />}
                <button
                  type="submit"
                  disabled={isSaving}
                  className="px-5 py-2.5 rounded-xl bg-[#176B91] hover:bg-[#083B56] text-white text-xs sm:text-sm font-bold shadow-sm transition cursor-pointer disabled:opacity-50"
                >
                  {isSaving ? 'Saving...' : 'Save Profile Details'}
                </button>
              </div>
            </form>
          </div>

          {/* Right Column: Upload Compliance Documents */}
          <div className="lg:col-span-5 space-y-6">
            <div className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200/80 dark:border-slate-800 p-5 shadow-xs space-y-4">
              <div>
                <h3 className="text-base font-bold text-slate-900 dark:text-white">Statutory Documents</h3>
                <p className="text-xs text-slate-500">Upload documents required for society verification</p>
              </div>

              {uploadSuccessMsg && (
                <div className="p-3 rounded-xl bg-emerald-50 text-emerald-800 text-xs font-semibold flex items-center gap-2">
                  <CheckCircle2 size={14} />
                  <span>{uploadSuccessMsg}</span>
                </div>
              )}

              <div className="space-y-3">
                <div>
                  <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                    Document Category
                  </label>
                  <select
                    value={selectedDocType}
                    onChange={(e) => setSelectedDocType(e.target.value as VendorDocumentType)}
                    className="w-full px-3 py-2 text-xs sm:text-sm rounded-xl border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-[#176B91]"
                  >
                    <option value="GST_CERTIFICATE">GST Certificate</option>
                    <option value="BUSINESS_LICENSE">Business / Trade License</option>
                    <option value="INSURANCE">Commercial Insurance Policy</option>
                    <option value="AGREEMENT">Society Service Agreement</option>
                    <option value="IDENTITY_PROOF">Authorized Signatory ID Proof</option>
                    <option value="CERTIFICATES">Quality / ISO / Safety Certifications</option>
                    <option value="OTHER">Other Supporting Document</option>
                  </select>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                  <div>
                    <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                      Document Title (optional)
                    </label>
                    <input
                      type="text"
                      value={docTitle}
                      onChange={(e) => setDocTitle(e.target.value)}
                      placeholder="e.g. GSTIN 2026"
                      className="w-full px-3 py-2 text-xs rounded-xl border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-white"
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                      Expiry Date (optional)
                    </label>
                    <input
                      type="date"
                      value={docExpiryDate}
                      onChange={(e) => setDocExpiryDate(e.target.value)}
                      className="w-full px-3 py-2 text-xs rounded-xl border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-white"
                    />
                  </div>
                </div>

                <FileUploader
                  label="Select PDF or Image to Upload"
                  description="Upload to Firebase Storage securely"
                  societyId={societyId}
                  entityType="vendor"
                  entityId={vendorUid}
                  onUploadSuccess={handleDocumentUploaded}
                />
              </div>
            </div>

            {/* Uploaded Documents List */}
            <div className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200/80 dark:border-slate-800 p-5 shadow-xs space-y-3">
              <h4 className="text-xs font-bold uppercase tracking-wider text-slate-400">
                Uploaded Documents ({documents.length})
              </h4>

              {documents.length === 0 ? (
                <div className="p-4 text-center border border-dashed border-slate-200 dark:border-slate-800 rounded-xl">
                  <p className="text-xs text-slate-400">No compliance documents uploaded yet.</p>
                </div>
              ) : (
                <div className="space-y-2.5 max-h-72 overflow-y-auto pr-1">
                  {documents.map((doc) => (
                    <div
                      key={doc.id}
                      className="p-3 rounded-xl border border-slate-200/80 dark:border-slate-800 bg-slate-50/50 dark:bg-slate-800/40 flex items-center justify-between gap-3"
                    >
                      <div className="flex items-center gap-2.5 min-w-0">
                        <FileText className="w-4 h-4 text-[#176B91] shrink-0" />
                        <div className="min-w-0">
                          <p className="text-xs font-bold text-slate-800 dark:text-slate-200 truncate">
                            {doc.title}
                          </p>
                          <p className="text-[10px] text-slate-400 truncate">
                            {doc.documentType} {doc.expiryDate ? `· Exp: ${doc.expiryDate}` : ''}
                          </p>
                        </div>
                      </div>

                      <div className="flex items-center gap-2 shrink-0">
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
                            className="p-1.5 rounded-lg bg-slate-200/60 dark:bg-slate-700 text-slate-700 dark:text-slate-300 hover:text-sky-600"
                            title="View Document"
                          >
                            <Eye size={13} />
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
      </div>
    </div>
  );
};

export default VendorOnboardingPage;
