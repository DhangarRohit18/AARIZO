import React, { useState } from 'react';
import { Users, CheckCircle, XCircle } from 'lucide-react';
import { societyService } from '../../../services/societyService';
import type { Resident } from '../../../types/society';
import { DataTable } from '../../../components/ui/DataTable';
import type { Column } from '../../../components/ui/DataTable';
import { StatusBadge } from '../../../components/ui/StatusBadge';
import { FilterBar } from '../../../components/ui/FilterBar';

export const ResidentManagementPage: React.FC = () => {
  const currentSocietyId = 'soc-gvs';
  const [residents, setResidents] = useState<Resident[]>(societyService.getResidents(currentSocietyId));
  const [statusFilter, setStatusFilter] = useState<string>('ALL');

  const refreshData = () => {
    setResidents(societyService.getResidents(currentSocietyId));
  };

  const handleApprove = (id: string) => {
    societyService.updateResidentApproval(id, 'APPROVED', {
      id: 'sec-admin-1',
      name: 'Mayuri Udar',
      role: 'SOCIETY_ADMIN',
    });
    refreshData();
  };

  const handleReject = (id: string) => {
    societyService.updateResidentApproval(id, 'REJECTED', {
      id: 'sec-admin-1',
      name: 'Mayuri Udar',
      role: 'SOCIETY_ADMIN',
    });
    refreshData();
  };

  const filteredResidents = residents.filter((r) => {
    if (statusFilter === 'ALL') return true;
    return r.approvalStatus === statusFilter;
  });

  const columns: Column<Resident>[] = [
    {
      key: 'name',
      header: 'Resident Name',
      sortable: true,
      render: (r) => (
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.65rem' }}>
          <img
            src={r.avatarUrl || 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=150&q=80'}
            alt={r.name}
            style={{ width: '36px', height: '36px', borderRadius: '50%', objectFit: 'cover' }}
          />
          <div>
            <div style={{ fontWeight: 600, color: '#0f172a' }}>{r.name}</div>
            <div style={{ fontSize: '0.75rem', color: '#64748b' }}>{r.email} • {r.phone}</div>
          </div>
        </div>
      ),
    },
    { key: 'flatCode', header: 'Flat', sortable: true },
    {
      key: 'role',
      header: 'Occupancy Role',
      render: (r) => (
        <StatusBadge label={r.role} variant={r.role === 'OWNER' ? 'info' : 'purple'} />
      ),
    },
    {
      key: 'approvalStatus',
      header: 'Approval Status',
      render: (r) => (
        <StatusBadge
          label={r.approvalStatus}
          variant={r.approvalStatus === 'APPROVED' ? 'success' : r.approvalStatus === 'PENDING' ? 'warning' : 'danger'}
        />
      ),
    },
    {
      key: 'actions',
      header: 'Actions',
      render: (r) =>
        r.approvalStatus === 'PENDING' ? (
          <div style={{ display: 'flex', gap: '0.5rem' }}>
            <button
              onClick={() => handleApprove(r.id)}
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: '0.25rem',
                padding: '0.35rem 0.65rem',
                borderRadius: '6px',
                border: 'none',
                background: '#10b981',
                color: '#fff',
                fontWeight: 600,
                fontSize: '0.75rem',
                cursor: 'pointer',
              }}
            >
              <CheckCircle size={14} /> Approve
            </button>
            <button
              onClick={() => handleReject(r.id)}
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: '0.25rem',
                padding: '0.35rem 0.65rem',
                borderRadius: '6px',
                border: 'none',
                background: '#ef4444',
                color: '#fff',
                fontWeight: 600,
                fontSize: '0.75rem',
                cursor: 'pointer',
              }}
            >
              <XCircle size={14} /> Reject
            </button>
          </div>
        ) : (
          <span style={{ fontSize: '0.75rem', color: '#94a3b8' }}>Processed</span>
        ),
    },
  ];

  return (
    <div style={{ padding: '1.5rem', maxWidth: '1100px', margin: '0 auto', fontFamily: 'sans-serif' }}>
      <header style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.5rem' }}>
        <div>
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
            <Users size={24} color="#2563eb" />
            <h1 style={{ margin: 0, fontSize: '1.4rem', color: '#0f172a' }}>Resident Registry & Approvals</h1>
          </div>
          <p style={{ margin: '0.25rem 0 0 0', color: '#64748b', fontSize: '0.85rem' }}>
            Review pending registration requests, manage resident records, family members, and vehicle tags.
          </p>
        </div>
      </header>

      {/* Filter Bar */}
      <div style={{ marginBottom: '1.25rem' }}>
        <FilterBar
          options={[
            { id: 'ALL', label: 'All Residents', count: residents.length },
            { id: 'PENDING', label: 'Pending Approvals', count: residents.filter((r) => r.approvalStatus === 'PENDING').length },
            { id: 'APPROVED', label: 'Approved', count: residents.filter((r) => r.approvalStatus === 'APPROVED').length },
          ]}
          activeFilter={statusFilter}
          onFilterChange={setStatusFilter}
        />
      </div>

      <div style={{ background: '#ffffff', borderRadius: '12px', border: '1px solid #e2e8f0', padding: '1.25rem' }}>
        <DataTable columns={columns} data={filteredResidents} keyExtractor={(r) => r.id} />
      </div>
    </div>
  );
};
