import React, { useState } from 'react';
import { Activity } from 'lucide-react';
import { societyService } from '../../../services/societyService';
import type { AuditLog } from '../../../types/society';
import { DataTable } from '../../../components/ui/DataTable';
import type { Column } from '../../../components/ui/DataTable';
import { StatusBadge } from '../../../components/ui/StatusBadge';

export const AuditLogsPage: React.FC = () => {
  const currentSocietyId = 'soc-gvs';
  const [logs] = useState<AuditLog[]>(societyService.getAuditLogs(currentSocietyId));

  const columns: Column<AuditLog>[] = [
    { key: 'timestamp', header: 'Timestamp', width: '170px', sortable: true },
    {
      key: 'actorName',
      header: 'Actor',
      render: (l) => (
        <div>
          <div style={{ fontWeight: 600, color: '#0f172a' }}>{l.actorName}</div>
          <div style={{ fontSize: '0.75rem', color: '#64748b' }}>{l.actorRole}</div>
        </div>
      ),
    },
    {
      key: 'action',
      header: 'Action',
      render: (l) => (
        <StatusBadge
          label={l.action}
          variant={l.action === 'CREATE' ? 'success' : l.action === 'STATUS_CHANGE' ? 'info' : l.action === 'DELETE' ? 'danger' : 'warning'}
        />
      ),
    },
    { key: 'targetEntity', header: 'Target Entity' },
    { key: 'description', header: 'Action Details' },
  ];

  return (
    <div style={{ padding: '1.5rem', maxWidth: '1100px', margin: '0 auto', fontFamily: 'sans-serif' }}>
      <header style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.5rem' }}>
        <div>
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
            <Activity size={24} color="#2563eb" />
            <h1 style={{ margin: 0, fontSize: '1.4rem', color: '#0f172a' }}>Security & CRUD Audit Trail</h1>
          </div>
          <p style={{ margin: '0.25rem 0 0 0', color: '#64748b', fontSize: '0.85rem' }}>
            Immutable audit log recording all administrative modifications, resident approvals, and status changes.
          </p>
        </div>
      </header>

      <div style={{ background: '#ffffff', borderRadius: '12px', border: '1px solid #e2e8f0', padding: '1.25rem' }}>
        <DataTable columns={columns} data={logs} keyExtractor={(l) => l.id} />
      </div>
    </div>
  );
};
