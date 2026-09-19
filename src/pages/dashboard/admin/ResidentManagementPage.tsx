import { useState } from 'react';
import { Users, CheckCircle, XCircle } from 'lucide-react';
import { societyService } from '../../../services/societyService';
import type { Resident } from '../../../types/society';
import { DataTable } from '../../../components/ui/DataTable';
import type { Column } from '../../../components/ui/DataTable';
import { StatusBadge } from '../../../components/ui/StatusBadge';
import { FilterBar } from '../../../components/ui/FilterBar';
import { MobileDataCard } from '../../../components/ui/MobileDataCard';

export const ResidentManagementPage = () => {
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
          <span style={{ fontSize: '0.8rem', color: '#94a3b8' }}>Processed</span>
        ),
    },
  ];

  return (
    <div style={{ padding: '1.5rem', maxWidth: '1200px', margin: '0 auto' }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.5rem', flexWrap: 'wrap', gap: '1rem' }}>
        <div>
          <h2 style={{ fontSize: '1.5rem', fontWeight: 800, color: '#0f172a', margin: 0, display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
            <Users style={{ color: '#8b5cf6' }} size={26} /> Resident Approvals
          </h2>
          <p style={{ color: '#64748b', margin: '0.25rem 0 0 0' }}>Manage flat ownership and tenant verifications.</p>
        </div>
      </div>

      <FilterBar
        options={[
          { label: 'All Residents', id: 'ALL' },
          { label: 'Pending Approval', id: 'PENDING' },
          { label: 'Approved', id: 'APPROVED' },
          { label: 'Rejected', id: 'REJECTED' },
        ]}
        activeFilter={statusFilter}
        onFilterChange={setStatusFilter}
      />

      <div style={{ marginTop: '1rem' }}>
        <DataTable
          columns={columns}
          data={filteredResidents}
          keyExtractor={(item) => item.id}
          pageSize={12}
          emptyMessage="No residents found."
          mobileRender={(r) => (
            <MobileDataCard
              title={
                <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                  <img
                    src={r.avatarUrl || 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=150&q=80'}
                    alt={r.name}
                    style={{ width: '28px', height: '28px', borderRadius: '50%', objectFit: 'cover' }}
                  />
                  <span>{r.name}</span>
                </div>
              }
              subtitle={r.email}
              status={
                <StatusBadge
                  label={r.approvalStatus}
                  variant={r.approvalStatus === 'APPROVED' ? 'success' : r.approvalStatus === 'PENDING' ? 'warning' : 'danger'}
                />
              }
              attributes={[
                { label: 'Flat', value: r.flatCode },
                { label: 'Role', value: r.role },
                { label: 'Phone', value: r.phone }
              ]}
              actions={
                r.approvalStatus === 'PENDING' ? (
                  <>
                    <button
                      onClick={() => handleReject(r.id)}
                      aria-label="Reject Resident"
                      style={{ padding: '0.5rem 1rem', background: '#fef2f2', color: '#ef4444', borderRadius: '0.5rem', border: 'none', fontWeight: 600, fontSize: '0.8125rem' }}
                    >
                      Reject
                    </button>
                    <button
                      onClick={() => handleApprove(r.id)}
                      aria-label="Approve Resident"
                      style={{ padding: '0.5rem 1rem', background: '#10b981', color: '#fff', borderRadius: '0.5rem', border: 'none', fontWeight: 600, fontSize: '0.8125rem' }}
                    >
                      Approve
                    </button>
                  </>
                ) : null
              }
            />
          )}
        />
      </div>
    </div>
  );
};
