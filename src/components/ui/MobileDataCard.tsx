import React from 'react';

interface MobileDataCardProps {
  title: React.ReactNode;
  subtitle?: React.ReactNode;
  status?: React.ReactNode;
  attributes?: { label: string; value: React.ReactNode }[];
  actions?: React.ReactNode;
  onClick?: () => void;
}

export const MobileDataCard: React.FC<MobileDataCardProps> = ({
  title,
  subtitle,
  status,
  attributes = [],
  actions,
  onClick,
}) => {
  return (
    <div
      onClick={onClick}
      style={{
        background: '#fff',
        borderRadius: '0.75rem',
        border: '1px solid #e2e8f0',
        padding: '1rem',
        marginBottom: '0.75rem',
        boxShadow: '0 1px 3px rgba(0,0,0,0.05)',
      }}
    >
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '0.5rem' }}>
        <div>
          <div style={{ fontWeight: 600, fontSize: '0.9375rem', color: '#0f172a' }}>{title}</div>
          {subtitle && <div style={{ fontSize: '0.75rem', color: '#64748b', marginTop: '0.125rem' }}>{subtitle}</div>}
        </div>
        {status && <div>{status}</div>}
      </div>

      {attributes.length > 0 && (
        <div style={{ display: 'flex', flexWrap: 'wrap', gap: '0.75rem', marginTop: '0.75rem' }}>
          {attributes.map((attr, idx) => (
            <div key={idx} style={{ flex: '1 1 45%' }}>
              <div style={{ fontSize: '0.6875rem', color: '#94a3b8', textTransform: 'uppercase', letterSpacing: '0.025em' }}>
                {attr.label}
              </div>
              <div style={{ fontSize: '0.8125rem', color: '#334155', fontWeight: 500 }}>
                {attr.value}
              </div>
            </div>
          ))}
        </div>
      )}

      {actions && (
        <div style={{ marginTop: '1rem', paddingTop: '0.75rem', borderTop: '1px solid #f1f5f9', display: 'flex', gap: '0.5rem', justifyContent: 'flex-end' }}>
          {actions}
        </div>
      )}
    </div>
  );
};
