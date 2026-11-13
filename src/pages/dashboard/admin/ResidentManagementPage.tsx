import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  ArrowLeft,
  Search,
  Plus,
  Shield,
  Users,
  Wrench,
  Store,
  UserCheck,
  CheckCircle2,
  Copy,
  Key,
  X,
  Phone,
  Mail,
  Home,
  Check,
  AlertCircle
} from 'lucide-react';
import { societyService } from '../../../services/societyService';
import { realtimeService } from '../../../services/realtimeService';
import { apiClient } from '../../../services/apiClient';
import type { Resident, Staff, Vendor } from '../../../types/society';

type UserRoleCategory = 'ALL' | 'RESIDENT' | 'GUARD' | 'COMMITTEE' | 'FACILITY_MANAGER' | 'VENDOR';

interface UnifiedUserItem {
  id: string;
  name: string;
  email: string;
  phone: string;
  role: 'resident' | 'guard' | 'committee' | 'facility_manager' | 'vendor' | 'secretary';
  displayRole: string;
  assignment: string;
  status: 'ACTIVE' | 'PENDING' | 'INACTIVE';
  societyId: string;
}

export const ResidentManagementPage: React.FC = () => {
  const navigate = useNavigate();
  const currentSocietyId = 'soc-gvs';

  const [activeTab, setActiveTab] = useState<UserRoleCategory>('ALL');
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedWing, setSelectedWing] = useState('ALL');

  // Modal States
  const [isProvisionModalOpen, setIsProvisionModalOpen] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [provisionError, setProvisionError] = useState<string | null>(null);

  // Credential Handover State
  const [credentialHandover, setCredentialHandover] = useState<{
    name: string;
    email: string;
    role: string;
    assignment: string;
    temporaryPassword?: string;
  } | null>(null);
  const [copiedCredentials, setCopiedCredentials] = useState(false);

  // Form Fields
  const [formRole, setFormRole] = useState<'resident' | 'guard' | 'committee' | 'facility_manager' | 'vendor'>('resident');
  const [formName, setFormName] = useState('');
  const [formEmail, setFormEmail] = useState('');
  const [formPhone, setFormPhone] = useState('');
  const [formFlatNumber, setFormFlatNumber] = useState('B-1204');
  const [formGate, setFormGate] = useState('Main Gate 1');
  const [formDepartment, setFormDepartment] = useState('Electrical & Elevators');
  const [formCompany, setFormCompany] = useState('');
  const [formVendorCategory, setFormVendorCategory] = useState('Technical AMC');
  const [formCommitteeDesignation, setFormCommitteeDesignation] = useState('Treasurer');
  const [formCustomPassword, setFormCustomPassword] = useState('');

  // Committee list with persistence
  const [committeeList, setCommitteeList] = useState<UnifiedUserItem[]>(() => {
    try {
      const saved = localStorage.getItem('dwellora_committee_members');
      if (saved) return JSON.parse(saved);
    } catch {}
    return [
      {
        id: 'com-1',
        name: 'Sunil Rao',
        email: 'sunil.rao@society.org',
        phone: '+91 98200 44332',
        role: 'committee',
        displayRole: 'Committee Treasurer',
        assignment: 'Flat A-802 · Finance',
        status: 'ACTIVE',
        societyId: currentSocietyId,
      },
      {
        id: 'com-2',
        name: 'Anita Desai',
        email: 'anita.desai@society.org',
        phone: '+91 98200 11998',
        role: 'committee',
        displayRole: 'Committee Member',
        assignment: 'Flat C-304 · Cultural',
        status: 'ACTIVE',
        societyId: currentSocietyId,
      },
    ];
  });

  // Data
  const [residents, setResidents] = useState<Resident[]>([]);
  const [staffList, setStaffList] = useState<Staff[]>([]);
  const [vendorList, setVendorList] = useState<Vendor[]>([]);

  const reloadData = () => {
    setResidents(societyService.getResidents(currentSocietyId));
    setStaffList(societyService.getStaff(currentSocietyId));
    setVendorList(societyService.getVendors(currentSocietyId));
  };

  useEffect(() => {
    reloadData();
    const unsub = realtimeService.subscribe('*', (msg) => {
      if (['USER_PROVISIONED', 'SOCIETY_PROVISIONED', 'STAFF_DUTY_CHANGED', 'VENDOR_REGISTERED'].includes(msg.topic)) {
        reloadData();
      }
    });
    return () => unsub();
  }, []);

  // Consolidate into Unified User Matrix
  const unifiedUsers: UnifiedUserItem[] = [
    // 1. Residents
    ...residents.map((r) => ({
      id: r.id,
      name: r.name,
      email: r.email || `${r.name.toLowerCase().replace(/\s+/g, '.')}@society.com`,
      phone: r.phone,
      role: 'resident' as const,
      displayRole: 'Resident',
      assignment: `Flat ${r.flatCode}`,
      status: 'ACTIVE' as const,
      societyId: r.societyId,
    })),
    // 2. Guards & Staff
    ...staffList.map((s) => ({
      id: s.id,
      name: s.name,
      email: `${s.name.toLowerCase().replace(/\s+/g, '.')}@safegate.security`,
      phone: s.phone,
      role: (s.staffType === 'GUARD' ? 'guard' : 'facility_manager') as 'guard' | 'facility_manager',
      displayRole: s.staffType === 'GUARD' ? 'Security Guard' : 'Facility Staff',
      assignment: s.gateAssigned || s.staffType,
      status: s.status === 'ON_DUTY' ? ('ACTIVE' as const) : ('INACTIVE' as const),
      societyId: s.societyId,
    })),
    // 3. Vendors
    ...vendorList.map((v) => ({
      id: v.id,
      name: v.contactPerson || v.companyName,
      email: `${v.companyName.toLowerCase().replace(/\s+/g, '.')}@vendor.in`,
      phone: v.phone,
      role: 'vendor' as const,
      displayRole: `Vendor (${v.category})`,
      assignment: v.companyName,
      status: 'ACTIVE' as const,
      societyId: v.societyId,
    })),
    // 4. Committee Members (Persistent & Secretary Provisioned)
    ...committeeList,
    // 5. Default Facility Manager
    {
      id: 'fm-1',
      name: 'Mahesh Patil',
      email: 'mahesh.facility@society.org',
      phone: '+91 98200 55441',
      role: 'facility_manager' as const,
      displayRole: 'Facility Manager',
      assignment: 'Clubhouse Maintenance Office',
      status: 'ACTIVE' as const,
      societyId: currentSocietyId,
    },
  ];

  // Filtering
  const filteredUsers = unifiedUsers.filter((u) => {
    // Role filter
    if (activeTab === 'RESIDENT' && u.role !== 'resident') return false;
    if (activeTab === 'GUARD' && u.role !== 'guard') return false;
    if (activeTab === 'COMMITTEE' && u.role !== 'committee') return false;
    if (activeTab === 'FACILITY_MANAGER' && u.role !== 'facility_manager') return false;
    if (activeTab === 'VENDOR' && u.role !== 'vendor') return false;

    // Wing filter for residents
    if (selectedWing !== 'ALL' && u.role === 'resident' && !u.assignment.toUpperCase().includes(selectedWing)) {
      return false;
    }

    // Search query
    const q = searchQuery.toLowerCase().trim();
    if (!q) return true;
    return (
      u.name.toLowerCase().includes(q) ||
      u.email.toLowerCase().includes(q) ||
      u.phone.includes(q) ||
      u.assignment.toLowerCase().includes(q) ||
      u.displayRole.toLowerCase().includes(q)
    );
  });

  const handleProvisionUser = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!formName.trim() || !formEmail.trim() || !formPhone.trim() || !formCustomPassword.trim()) {
      setProvisionError('Name, email, phone number, and password are all required.');
      return;
    }
    if (formCustomPassword.trim().length < 8) {
      setProvisionError('Password must be at least 8 characters long.');
      return;
    }

    setIsSubmitting(true);
    setProvisionError(null);

    try {
      const userPassword = formCustomPassword.trim();
      
      let assignmentText = formFlatNumber;
      if (formRole === 'guard') assignmentText = formGate;
      if (formRole === 'facility_manager') assignmentText = formDepartment;
      if (formRole === 'vendor') assignmentText = formCompany || `${formName} Services`;
      if (formRole === 'committee') assignmentText = `${formCommitteeDesignation} · Flat ${formFlatNumber}`;

      // 1. Call Backend Universal Provisioning Service
      await apiClient.provisionUser({
        societyId: currentSocietyId,
        role: formRole,
        name: formName.trim(),
        email: formEmail.trim(),
        phone: formPhone.trim(),
        flatNumber: formFlatNumber,
        password: userPassword,
        metadata: {
          assignment: assignmentText,
          gate: formGate,
          department: formDepartment,
          company: formCompany,
          committeeDesignation: formCommitteeDesignation,
        },
      });

      // 2. Synchronize Local Domain Repositories
      if (formRole === 'resident') {
        societyService.createResident(
          {
            societyId: currentSocietyId,
            name: formName.trim(),
            flatId: formFlatNumber || 'flat-gen',
            flatCode: formFlatNumber,
            phone: formPhone.trim(),
            email: formEmail.trim(),
            role: 'OWNER',
            moveInDate: new Date().toISOString(),
            approvalStatus: 'APPROVED',
          },
          { id: 'sec-1', name: 'Secretary', role: 'secretary' }
        );
      } else if (formRole === 'guard') {
        societyService.createStaff(
          {
            societyId: currentSocietyId,
            name: formName.trim(),
            phone: formPhone.trim(),
            staffType: 'GUARD',
            gateAssigned: formGate,
            shiftTiming: '08:00 AM - 08:00 PM',
            status: 'ON_DUTY',
          },
          { id: 'sec-1', name: 'Secretary', role: 'secretary' }
        );
      } else if (formRole === 'vendor') {
        societyService.createVendor(
          {
            societyId: currentSocietyId,
            companyName: formCompany || `${formName} Enterprises`,
            category: (formVendorCategory as any) || 'OTHER',
            contactPerson: formName.trim(),
            phone: formPhone.trim(),
            contractStatus: 'ACTIVE',
          },
          { id: 'sec-1', name: 'Secretary', role: 'secretary' }
        );
      } else if (formRole === 'committee') {
        const newCom: UnifiedUserItem = {
          id: `com-${Date.now()}`,
          name: formName.trim(),
          email: formEmail.trim(),
          phone: formPhone.trim(),
          role: 'committee',
          displayRole: `Committee (${formCommitteeDesignation})`,
          assignment: `${formCommitteeDesignation} · Flat ${formFlatNumber}`,
          status: 'ACTIVE',
          societyId: currentSocietyId,
        };
        const updated = [...committeeList, newCom];
        setCommitteeList(updated);
        try {
          localStorage.setItem('dwellora_committee_members', JSON.stringify(updated));
        } catch {}
      }

      // 3. Trigger Real-Time Notification Broadcast
      realtimeService.publish(
        'USER_PROVISIONED',
        {
          name: formName,
          email: formEmail,
          role: formRole,
          assignment: assignmentText,
          timestamp: new Date().toISOString(),
        },
        currentSocietyId,
        'SECRETARY',
        'Society Secretary'
      );

      // 4. Open Credential Handover Card
      setCredentialHandover({
        name: formName.trim(),
        email: formEmail.trim(),
        role: formRole.toUpperCase(),
        assignment: assignmentText,
        temporaryPassword: userPassword,
      });

      // Reset Form
      setIsProvisionModalOpen(false);
      setFormName('');
      setFormEmail('');
      setFormPhone('');
      setFormCustomPassword('');
      reloadData();
    } catch (err: any) {
      setProvisionError(err?.message || 'Failed to provision user. Please check server connection.');
    } finally {
      setIsSubmitting(false);
    }
  };

  const copyCredentialsToClipboard = () => {
    if (!credentialHandover) return;
    const text = `SafeGate 2.0 Credentials Handover\n` +
      `------------------------------------\n` +
      `Name: ${credentialHandover.name}\n` +
      `Role: ${credentialHandover.role}\n` +
      `Assignment: ${credentialHandover.assignment}\n` +
      `Login Email: ${credentialHandover.email}\n` +
      `Temporary Password: ${credentialHandover.temporaryPassword}\n` +
      `App URL: ${window.location.origin}\n` +
      `Please change your password upon initial login.`;
    navigator.clipboard.writeText(text);
    setCopiedCredentials(true);
    setTimeout(() => setCopiedCredentials(false), 2500);
  };

  const getRoleBadgeColor = (role: string) => {
    switch (role) {
      case 'resident':
        return { bg: '#EAF6FC', text: '#176B91', border: '#DCE8EF' };
      case 'guard':
        return { bg: '#FEF9E7', text: '#D97706', border: '#FDE68A' };
      case 'committee':
        return { bg: '#F3E8FF', text: '#7E22CE', border: '#E9D5FF' };
      case 'facility_manager':
        return { bg: '#ECFDF5', text: '#059669', border: '#A7F3D0' };
      case 'vendor':
        return { bg: '#FFF0EC', text: '#F06543', border: '#FED7AA' };
      default:
        return { bg: '#F1F5F9', text: '#475569', border: '#CBD5E1' };
    }
  };

  return (
    <div style={{ minHeight: '100%', background: 'var(--aarizo-page, #F7FBFE)', paddingBottom: '6rem' }}>
      {/* ── Page Hero Header with Actions ── */}
      <div
        style={{
          background: 'linear-gradient(135deg, var(--aarizo-navy, #083B56) 0%, #0D4767 100%)',
          padding: '1.25rem 1rem 1.5rem',
          borderBottom: '1px solid rgba(255, 255, 255, 0.08)',
        }}
      >
        <div style={{ maxWidth: '1280px', margin: '0 auto', display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: '1rem' }}>
          <div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', marginBottom: '0.25rem' }}>
              <button
                onClick={() => navigate(-1)}
                aria-label="Back"
                style={{
                  width: 32,
                  height: 32,
                  borderRadius: '50%',
                  background: 'rgba(255, 255, 255, 0.15)',
                  border: 'none',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  color: '#ffffff',
                  cursor: 'pointer',
                }}
              >
                <ArrowLeft size={16} />
              </button>
              <p style={{ color: 'var(--aarizo-gold, #E5B842)', fontSize: '0.75rem', fontWeight: 700, margin: 0 }}>
                Universal Access & Roles
              </p>
            </div>
            <h1 style={{ color: '#FFFFFF', fontWeight: 800, fontSize: '1.35rem', margin: 0 }}>
              User Directory & Role Provisioning Hub
            </h1>
            <p style={{ color: 'rgba(255, 255, 255, 0.8)', fontSize: '0.8125rem', marginTop: '0.25rem' }}>
              Green Valley Society · 7 Authoritative Roles · Atomic Credential Generation
            </p>
          </div>

          <button
            onClick={() => setIsProvisionModalOpen(true)}
            style={{
              display: 'inline-flex',
              alignItems: 'center',
              gap: '0.5rem',
              background: 'var(--aarizo-gold, #E5B842)',
              color: '#1F1B1A',
              border: 'none',
              borderRadius: '10px',
              padding: '0.65rem 1.25rem',
              fontSize: '0.875rem',
              fontWeight: 800,
              cursor: 'pointer',
              boxShadow: '0 4px 14px rgba(229, 184, 66, 0.3)',
              transition: 'all 0.2s ease',
            }}
            className="hover:brightness-105 active:scale-95"
          >
            <Plus size={18} strokeWidth={2.5} />
            <span>Provision New User</span>
          </button>
        </div>
      </div>

      <div style={{ maxWidth: '1280px', margin: '0 auto', padding: '1rem' }}>
        {/* ── Search Bar ── */}
        <div
          style={{
            display: 'flex',
            alignItems: 'center',
            gap: '0.625rem',
            background: '#ffffff',
            border: '1px solid var(--aarizo-border, #DCE8EF)',
            borderRadius: '12px',
            padding: '0 0.875rem',
            height: '46px',
            boxShadow: '0 1px 4px rgba(8, 59, 86, 0.04)',
            marginBottom: '1rem',
          }}
        >
          <Search size={18} color="var(--aarizo-text-secondary, #657785)" />
          <input
            type="text"
            placeholder="Search by name, email, phone, flat code, gate, or role..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            style={{
              flex: 1,
              border: 'none',
              outline: 'none',
              fontSize: '0.8125rem',
              color: 'var(--aarizo-text, #203746)',
              background: 'transparent',
            }}
          />
        </div>

        {/* ── 7 Role Tabs ── */}
        <div
          style={{
            display: 'flex',
            gap: '0.5rem',
            overflowX: 'auto',
            paddingBottom: '0.5rem',
            marginBottom: '1rem',
            scrollbarWidth: 'none',
          }}
        >
          {[
            { id: 'ALL', label: `All Users (${unifiedUsers.length})`, icon: Users },
            { id: 'RESIDENT', label: `Residents (${residents.length})`, icon: Home },
            { id: 'GUARD', label: `Guards (${staffList.filter(s => s.staffType === 'GUARD').length})`, icon: Shield },
            { id: 'COMMITTEE', label: 'Committee (2)', icon: UserCheck },
            { id: 'FACILITY_MANAGER', label: 'Facility Mgr (1)', icon: Wrench },
            { id: 'VENDOR', label: `Vendors (${vendorList.length})`, icon: Store },
          ].map((tab) => {
            const Icon = tab.icon;
            const active = activeTab === tab.id;
            return (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id as UserRoleCategory)}
                style={{
                  display: 'inline-flex',
                  alignItems: 'center',
                  gap: '0.4rem',
                  padding: '0.45rem 0.875rem',
                  borderRadius: '10px',
                  fontSize: '0.8125rem',
                  fontWeight: active ? 700 : 600,
                  color: active ? '#ffffff' : 'var(--aarizo-text, #203746)',
                  background: active ? 'var(--aarizo-navy, #083B56)' : '#ffffff',
                  border: `1px solid ${active ? 'var(--aarizo-navy, #083B56)' : 'var(--aarizo-border, #DCE8EF)'}`,
                  cursor: 'pointer',
                  whiteSpace: 'nowrap',
                  transition: 'all 0.15s ease',
                }}
              >
                <Icon size={15} color={active ? 'var(--aarizo-gold, #E5B842)' : '#657785'} />
                <span>{tab.label}</span>
              </button>
            );
          })}
        </div>

        {/* Wing Filter (Active when looking at Residents) */}
        {(activeTab === 'ALL' || activeTab === 'RESIDENT') && (
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '1rem', overflowX: 'auto' }}>
            <span style={{ fontSize: '0.75rem', color: '#657785', fontWeight: 600 }}>Filter Wing:</span>
            {['ALL', 'A', 'B', 'C'].map((wing) => (
              <button
                key={wing}
                onClick={() => setSelectedWing(wing)}
                style={{
                  padding: '0.25rem 0.65rem',
                  borderRadius: '6px',
                  fontSize: '0.75rem',
                  fontWeight: 600,
                  background: selectedWing === wing ? 'var(--aarizo-blue, #176B91)' : '#ffffff',
                  color: selectedWing === wing ? '#ffffff' : '#475569',
                  border: '1px solid var(--aarizo-border, #DCE8EF)',
                  cursor: 'pointer',
                }}
              >
                {wing === 'ALL' ? 'All Wings' : `Wing ${wing}`}
              </button>
            ))}
          </div>
        )}

        {/* Results Count */}
        <div style={{ marginBottom: '0.75rem', fontSize: '0.75rem', fontWeight: 700, color: 'var(--aarizo-text-secondary, #657785)' }}>
          {filteredUsers.length} user{filteredUsers.length === 1 ? '' : 's'} managed under society
        </div>

        {/* ── User Cards Responsive Grid ── */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
          {filteredUsers.map((u) => {
            const badge = getRoleBadgeColor(u.role);
            return (
              <div
                key={u.id}
                style={{
                  background: '#ffffff',
                  border: '1px solid var(--aarizo-border-soft, #E8F1F5)',
                  borderRadius: '16px',
                  padding: '1rem',
                  boxShadow: '0 2px 8px rgba(8, 59, 86, 0.04)',
                  display: 'flex',
                  flexDirection: 'column',
                  justifyContent: 'space-between',
                  gap: '0.75rem',
                  transition: 'transform 0.15s ease, box-shadow 0.15s ease',
                }}
                className="hover:-translate-y-0.5 hover:shadow-md"
              >
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
                    <div
                      style={{
                        width: 44,
                        height: 44,
                        borderRadius: '50%',
                        background: badge.bg,
                        border: `1px solid ${badge.border}`,
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        color: badge.text,
                        fontWeight: 800,
                        fontSize: '1.1rem',
                        flexShrink: 0,
                      }}
                    >
                      {u.name.charAt(0).toUpperCase()}
                    </div>
                    <div>
                      <div style={{ fontSize: '0.9375rem', fontWeight: 700, color: 'var(--aarizo-text, #203746)' }}>
                        {u.name}
                      </div>
                      <div style={{ fontSize: '0.75rem', color: '#657785', marginTop: '0.125rem' }}>
                        {u.assignment}
                      </div>
                    </div>
                  </div>

                  <span
                    style={{
                      fontSize: '0.6875rem',
                      fontWeight: 700,
                      background: badge.bg,
                      color: badge.text,
                      border: `1px solid ${badge.border}`,
                      padding: '0.2rem 0.5rem',
                      borderRadius: '9999px',
                      textTransform: 'uppercase',
                      letterSpacing: '0.03em',
                    }}
                  >
                    {u.displayRole}
                  </span>
                </div>

                <div
                  style={{
                    background: '#F8FAFC',
                    borderRadius: '8px',
                    padding: '0.5rem 0.75rem',
                    fontSize: '0.75rem',
                    color: '#475569',
                    display: 'flex',
                    flexDirection: 'column',
                    gap: '0.25rem',
                  }}
                >
                  <div style={{ display: 'flex', alignItems: 'center', gap: '0.4rem' }}>
                    <Mail size={12} color="#64748B" />
                    <span style={{ overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{u.email}</span>
                  </div>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '0.4rem' }}>
                    <Phone size={12} color="#64748B" />
                    <span>{u.phone}</span>
                  </div>
                </div>

                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', borderTop: '1px solid #F1F5F9', paddingTop: '0.5rem' }}>
                  <span style={{ fontSize: '0.6875rem', color: u.status === 'ACTIVE' ? '#16A34A' : '#DC2626', fontWeight: 700 }}>
                    ● {u.status}
                  </span>
                  <button
                    onClick={() => {
                      setCredentialHandover({
                        name: u.name,
                        email: u.email,
                        role: u.displayRole,
                        assignment: u.assignment,
                        temporaryPassword: '(Restricted / Existing Account)',
                      });
                    }}
                    style={{
                      background: 'transparent',
                      border: 'none',
                      color: 'var(--aarizo-blue, #176B91)',
                      fontSize: '0.75rem',
                      fontWeight: 700,
                      cursor: 'pointer',
                      display: 'flex',
                      alignItems: 'center',
                      gap: '0.25rem',
                    }}
                  >
                    <Key size={12} />
                    <span>View Access</span>
                  </button>
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* ── Provision New User Modal ── */}
      {isProvisionModalOpen && (
        <div
          style={{
            position: 'fixed',
            inset: 0,
            zIndex: 100,
            background: 'rgba(0, 0, 0, 0.65)',
            backdropFilter: 'blur(4px)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            padding: '1rem',
          }}
          onClick={() => setIsProvisionModalOpen(false)}
        >
          <div
            style={{
              width: '100%',
              maxWidth: 520,
              background: '#ffffff',
              borderRadius: '20px',
              padding: '1.5rem',
              boxShadow: '0 25px 50px -12px rgba(0, 0, 0, 0.25)',
              maxHeight: '90vh',
              overflowY: 'auto',
            }}
            onClick={(e) => e.stopPropagation()}
          >
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '1.25rem' }}>
              <div>
                <h3 style={{ fontSize: '1.15rem', fontWeight: 800, color: 'var(--aarizo-navy, #083B56)', margin: 0 }}>
                  Provision User Account
                </h3>
                <p style={{ fontSize: '0.75rem', color: '#657785', margin: '0.2rem 0 0' }}>
                  Assign role, society permissions & auto-generate credentials
                </p>
              </div>
              <button
                onClick={() => setIsProvisionModalOpen(false)}
                style={{ background: 'transparent', border: 'none', color: '#657785', cursor: 'pointer' }}
              >
                <X size={20} />
              </button>
            </div>

            {provisionError && (
              <div
                style={{
                  background: '#FEF2F2',
                  border: '1px solid #FCA5A5',
                  color: '#991B1B',
                  padding: '0.75rem',
                  borderRadius: '10px',
                  fontSize: '0.75rem',
                  display: 'flex',
                  alignItems: 'center',
                  gap: '0.5rem',
                  marginBottom: '1rem',
                }}
              >
                <AlertCircle size={16} />
                <span>{provisionError}</span>
              </div>
            )}

            <form onSubmit={handleProvisionUser} style={{ display: 'flex', flexDirection: 'column', gap: '0.85rem' }}>
              {/* Role Selection */}
              <div>
                <label style={{ fontSize: '0.75rem', fontWeight: 700, color: '#334155', display: 'block', marginBottom: '0.35rem' }}>
                  Assigned User Role *
                </label>
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '0.5rem' }}>
                  {[
                    { id: 'resident', label: 'Resident' },
                    { id: 'guard', label: 'Guard' },
                    { id: 'committee', label: 'Committee' },
                    { id: 'facility_manager', label: 'Facility Mgr' },
                    { id: 'vendor', label: 'Vendor' },
                  ].map((r) => (
                    <button
                      key={r.id}
                      type="button"
                      onClick={() => setFormRole(r.id as any)}
                      style={{
                        padding: '0.5rem',
                        borderRadius: '8px',
                        fontSize: '0.75rem',
                        fontWeight: formRole === r.id ? 700 : 500,
                        background: formRole === r.id ? 'var(--aarizo-navy, #083B56)' : '#F8FAFC',
                        color: formRole === r.id ? '#ffffff' : '#334155',
                        border: `1px solid ${formRole === r.id ? 'var(--aarizo-navy, #083B56)' : '#E2E8F0'}`,
                        cursor: 'pointer',
                      }}
                    >
                      {r.label}
                    </button>
                  ))}
                </div>
              </div>

              {/* Basic Info */}
              <div>
                <label style={{ fontSize: '0.75rem', fontWeight: 700, color: '#334155', display: 'block', marginBottom: '0.25rem' }}>
                  Full Name *
                </label>
                <input
                  type="text"
                  required
                  placeholder="e.g. Rahul Sharma"
                  value={formName}
                  onChange={(e) => setFormName(e.target.value)}
                  style={{
                    width: '100%',
                    padding: '0.55rem 0.75rem',
                    borderRadius: '8px',
                    border: '1px solid #CBD5E1',
                    fontSize: '0.8125rem',
                  }}
                />
              </div>

              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '0.75rem' }}>
                <div>
                  <label style={{ fontSize: '0.75rem', fontWeight: 700, color: '#334155', display: 'block', marginBottom: '0.25rem' }}>
                    Email Address *
                  </label>
                  <input
                    type="email"
                    required
                    placeholder="name@email.com"
                    value={formEmail}
                    onChange={(e) => setFormEmail(e.target.value)}
                    style={{
                      width: '100%',
                      padding: '0.55rem 0.75rem',
                      borderRadius: '8px',
                      border: '1px solid #CBD5E1',
                      fontSize: '0.8125rem',
                    }}
                  />
                </div>

                <div>
                  <label style={{ fontSize: '0.75rem', fontWeight: 700, color: '#334155', display: 'block', marginBottom: '0.25rem' }}>
                    Phone Number *
                  </label>
                  <input
                    type="tel"
                    required
                    placeholder="+91 98765 43210"
                    value={formPhone}
                    onChange={(e) => setFormPhone(e.target.value)}
                    style={{
                      width: '100%',
                      padding: '0.55rem 0.75rem',
                      borderRadius: '8px',
                      border: '1px solid #CBD5E1',
                      fontSize: '0.8125rem',
                    }}
                  />
                </div>
              </div>

              {/* Role-Specific Assignment */}
              {formRole === 'resident' && (
                <div>
                  <label style={{ fontSize: '0.75rem', fontWeight: 700, color: '#334155', display: 'block', marginBottom: '0.25rem' }}>
                    Assigned Flat Code *
                  </label>
                  <input
                    type="text"
                    required
                    placeholder="e.g. B-1204 or A-301"
                    value={formFlatNumber}
                    onChange={(e) => setFormFlatNumber(e.target.value.toUpperCase())}
                    style={{
                      width: '100%',
                      padding: '0.55rem 0.75rem',
                      borderRadius: '8px',
                      border: '1px solid #CBD5E1',
                      fontSize: '0.8125rem',
                    }}
                  />
                </div>
              )}

              {formRole === 'committee' && (
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '0.75rem' }}>
                  <div>
                    <label style={{ fontSize: '0.75rem', fontWeight: 700, color: '#334155', display: 'block', marginBottom: '0.25rem' }}>
                      Flat / Unit *
                    </label>
                    <input
                      type="text"
                      required
                      placeholder="e.g. B-1204"
                      value={formFlatNumber}
                      onChange={(e) => setFormFlatNumber(e.target.value.toUpperCase())}
                      style={{
                        width: '100%',
                        padding: '0.55rem 0.75rem',
                        borderRadius: '8px',
                        border: '1px solid #CBD5E1',
                        fontSize: '0.8125rem',
                      }}
                    />
                  </div>
                  <div>
                    <label style={{ fontSize: '0.75rem', fontWeight: 700, color: '#334155', display: 'block', marginBottom: '0.25rem' }}>
                      Committee Portfolio *
                    </label>
                    <select
                      value={formCommitteeDesignation}
                      onChange={(e) => setFormCommitteeDesignation(e.target.value)}
                      style={{
                        width: '100%',
                        padding: '0.55rem 0.75rem',
                        borderRadius: '8px',
                        border: '1px solid #CBD5E1',
                        fontSize: '0.8125rem',
                      }}
                    >
                      <option value="Treasurer">Treasurer (Finance)</option>
                      <option value="Vice President">Vice President</option>
                      <option value="Executive Committee Member">Executive Member</option>
                      <option value="Maintenance Head">Maintenance Head</option>
                      <option value="Cultural & Events Head">Cultural & Events Head</option>
                      <option value="Water & Energy Head">Water & Energy Head</option>
                    </select>
                  </div>
                </div>
              )}

              {formRole === 'guard' && (
                <div>
                  <label style={{ fontSize: '0.75rem', fontWeight: 700, color: '#334155', display: 'block', marginBottom: '0.25rem' }}>
                    Assigned Gate Post *
                  </label>
                  <select
                    value={formGate}
                    onChange={(e) => setFormGate(e.target.value)}
                    style={{
                      width: '100%',
                      padding: '0.55rem 0.75rem',
                      borderRadius: '8px',
                      border: '1px solid #CBD5E1',
                      fontSize: '0.8125rem',
                    }}
                  >
                    <option value="Main Gate 1">Main Gate 1 (Entry/Exit)</option>
                    <option value="Rear Service Gate 2">Rear Service Gate 2 (Commercial/Deliveries)</option>
                    <option value="Basement Parking Gate">Basement Parking Gate</option>
                  </select>
                </div>
              )}

              {formRole === 'facility_manager' && (
                <div>
                  <label style={{ fontSize: '0.75rem', fontWeight: 700, color: '#334155', display: 'block', marginBottom: '0.25rem' }}>
                    Operational Department *
                  </label>
                  <input
                    type="text"
                    required
                    placeholder="e.g. Elevators, Plumbing, Power Backup"
                    value={formDepartment}
                    onChange={(e) => setFormDepartment(e.target.value)}
                    style={{
                      width: '100%',
                      padding: '0.55rem 0.75rem',
                      borderRadius: '8px',
                      border: '1px solid #CBD5E1',
                      fontSize: '0.8125rem',
                    }}
                  />
                </div>
              )}

              {formRole === 'vendor' && (
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '0.75rem' }}>
                  <div>
                    <label style={{ fontSize: '0.75rem', fontWeight: 700, color: '#334155', display: 'block', marginBottom: '0.25rem' }}>
                      Business / Company *
                    </label>
                    <input
                      type="text"
                      required
                      placeholder="e.g. Otis Elevator AMC"
                      value={formCompany}
                      onChange={(e) => setFormCompany(e.target.value)}
                      style={{
                        width: '100%',
                        padding: '0.55rem 0.75rem',
                        borderRadius: '8px',
                        border: '1px solid #CBD5E1',
                        fontSize: '0.8125rem',
                      }}
                    />
                  </div>
                  <div>
                    <label style={{ fontSize: '0.75rem', fontWeight: 700, color: '#334155', display: 'block', marginBottom: '0.25rem' }}>
                      Category *
                    </label>
                    <input
                      type="text"
                      required
                      placeholder="e.g. Maintenance AMC"
                      value={formVendorCategory}
                      onChange={(e) => setFormVendorCategory(e.target.value)}
                      style={{
                        width: '100%',
                        padding: '0.55rem 0.75rem',
                        borderRadius: '8px',
                        border: '1px solid #CBD5E1',
                        fontSize: '0.8125rem',
                      }}
                    />
                  </div>
                </div>
              )}

              <div>
                <label style={{ fontSize: '0.75rem', fontWeight: 700, color: '#334155', display: 'block', marginBottom: '0.25rem' }}>
                  Login Password (Min. 8 characters) *
                </label>
                <input
                  type="password"
                  required
                  minLength={8}
                  placeholder="Enter password for user login"
                  value={formCustomPassword}
                  onChange={(e) => setFormCustomPassword(e.target.value)}
                  style={{
                    width: '100%',
                    padding: '0.55rem 0.75rem',
                    borderRadius: '8px',
                    border: '1px solid #CBD5E1',
                    fontSize: '0.8125rem',
                  }}
                />
              </div>

              <div style={{ display: 'flex', gap: '0.75rem', marginTop: '1rem' }}>
                <button
                  type="button"
                  onClick={() => setIsProvisionModalOpen(false)}
                  style={{
                    flex: 1,
                    padding: '0.65rem',
                    borderRadius: '10px',
                    border: '1px solid #CBD5E1',
                    background: '#F8FAFC',
                    color: '#475569',
                    fontSize: '0.8125rem',
                    fontWeight: 700,
                    cursor: 'pointer',
                  }}
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={isSubmitting}
                  style={{
                    flex: 2,
                    padding: '0.65rem',
                    borderRadius: '10px',
                    border: 'none',
                    background: isSubmitting ? '#94A3B8' : 'var(--aarizo-navy, #083B56)',
                    color: '#ffffff',
                    fontSize: '0.8125rem',
                    fontWeight: 700,
                    cursor: isSubmitting ? 'not-allowed' : 'pointer',
                  }}
                >
                  {isSubmitting ? 'Provisioning Atomic Account...' : 'Provision User & Issue Password'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* ── Credential Handover Card Modal ── */}
      {credentialHandover && (
        <div
          style={{
            position: 'fixed',
            inset: 0,
            zIndex: 110,
            background: 'rgba(0, 0, 0, 0.7)',
            backdropFilter: 'blur(5px)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            padding: '1rem',
          }}
          onClick={() => setCredentialHandover(null)}
        >
          <div
            style={{
              width: '100%',
              maxWidth: 440,
              background: '#ffffff',
              borderRadius: '20px',
              padding: '1.5rem',
              boxShadow: '0 25px 50px -12px rgba(0, 0, 0, 0.3)',
            }}
            onClick={(e) => e.stopPropagation()}
          >
            <div style={{ textAlign: 'center', marginBottom: '1.25rem' }}>
              <div
                style={{
                  width: 52,
                  height: 52,
                  borderRadius: '50%',
                  background: '#EDF8F0',
                  color: '#16A34A',
                  display: 'inline-flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  marginBottom: '0.5rem',
                }}
              >
                <CheckCircle2 size={28} />
              </div>
              <h3 style={{ fontSize: '1.2rem', fontWeight: 800, color: 'var(--aarizo-navy, #083B56)', margin: 0 }}>
                Account Ready for Handover
              </h3>
              <p style={{ fontSize: '0.75rem', color: '#657785', marginTop: '0.25rem' }}>
                Credentials provisioned and synchronized with PostgreSQL Outbox
              </p>
            </div>

            <div
              style={{
                background: '#F8FAFC',
                border: '1px solid #E2E8F0',
                borderRadius: '12px',
                padding: '1rem',
                display: 'flex',
                flexDirection: 'column',
                gap: '0.5rem',
                marginBottom: '1rem',
                fontSize: '0.8125rem',
              }}
            >
              <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                <span style={{ color: '#64748B' }}>User Name:</span>
                <span style={{ fontWeight: 700, color: '#1E293B' }}>{credentialHandover.name}</span>
              </div>
              <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                <span style={{ color: '#64748B' }}>Assigned Role:</span>
                <span style={{ fontWeight: 700, color: 'var(--aarizo-blue, #176B91)' }}>{credentialHandover.role}</span>
              </div>
              <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                <span style={{ color: '#64748B' }}>Assignment:</span>
                <span style={{ fontWeight: 700, color: '#1E293B' }}>{credentialHandover.assignment}</span>
              </div>
              <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                <span style={{ color: '#64748B' }}>Login Email:</span>
                <span style={{ fontWeight: 700, color: '#1E293B' }}>{credentialHandover.email}</span>
              </div>
              <div
                style={{
                  display: 'flex',
                  justifyContent: 'space-between',
                  alignItems: 'center',
                  background: '#FEF3C7',
                  border: '1px solid #FDE68A',
                  borderRadius: '8px',
                  padding: '0.5rem 0.75rem',
                  marginTop: '0.25rem',
                }}
              >
                <span style={{ color: '#92400E', fontWeight: 600 }}>Temporary Password:</span>
                <span style={{ fontFamily: 'monospace', fontWeight: 800, color: '#B45309', fontSize: '0.9375rem' }}>
                  {credentialHandover.temporaryPassword}
                </span>
              </div>
            </div>

            <div style={{ display: 'flex', gap: '0.75rem' }}>
              <button
                type="button"
                onClick={copyCredentialsToClipboard}
                style={{
                  flex: 2,
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  gap: '0.5rem',
                  padding: '0.65rem',
                  borderRadius: '10px',
                  border: 'none',
                  background: copiedCredentials ? '#16A34A' : 'var(--aarizo-navy, #083B56)',
                  color: '#ffffff',
                  fontSize: '0.8125rem',
                  fontWeight: 700,
                  cursor: 'pointer',
                  transition: 'background 0.2s ease',
                }}
              >
                {copiedCredentials ? <Check size={16} /> : <Copy size={16} />}
                <span>{copiedCredentials ? 'Copied to Clipboard!' : 'Copy Login Credentials'}</span>
              </button>
              <button
                type="button"
                onClick={() => setCredentialHandover(null)}
                style={{
                  flex: 1,
                  padding: '0.65rem',
                  borderRadius: '10px',
                  border: '1px solid #CBD5E1',
                  background: '#F8FAFC',
                  color: '#475569',
                  fontSize: '0.8125rem',
                  fontWeight: 700,
                  cursor: 'pointer',
                }}
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default ResidentManagementPage;
