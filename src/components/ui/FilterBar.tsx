import React from 'react';

export interface FilterOption {
  id: string;
  label: string;
  count?: number;
}

interface FilterBarProps {
  options: FilterOption[];
  activeFilter: string;
  onFilterChange: (id: string) => void;
}

export const FilterBar: React.FC<FilterBarProps> = ({ options, activeFilter, onFilterChange }) => {
  return (
    <div style={{ display: 'flex', gap: '0.5rem', overflowX: 'auto', paddingBottom: '0.25rem' }}>
      {options.map((opt) => {
        const isActive = activeFilter === opt.id;
        return (
          <button
            key={opt.id}
            onClick={() => onFilterChange(opt.id)}
            style={{
              padding: '0.4rem 0.85rem',
              borderRadius: '9999px',
              border: isActive ? '1px solid #2563eb' : '1px solid #cbd5e1',
              backgroundColor: isActive ? '#eff6ff' : '#ffffff',
              color: isActive ? '#1d4ed8' : '#64748b',
              fontWeight: isActive ? 600 : 500,
              fontSize: '0.8rem',
              cursor: 'pointer',
              whiteSpace: 'nowrap',
              display: 'flex',
              alignItems: 'center',
              gap: '0.35rem',
              transition: 'all 0.15s ease',
            }}
          >
            <span>{opt.label}</span>
            {opt.count !== undefined && (
              <span
                style={{
                  backgroundColor: isActive ? '#bfdbfe' : '#f1f5f9',
                  color: isActive ? '#1e40af' : '#475569',
                  borderRadius: '9999px',
                  padding: '0.1rem 0.4rem',
                  fontSize: '0.7rem',
                  fontWeight: 700,
                }}
              >
                {opt.count}
              </span>
            )}
          </button>
        );
      })}
    </div>
  );
};
