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
              padding: '0.35rem 0.875rem',
              borderRadius: '9999px',
              border: isActive ? '1px solid var(--aarizo-blue, #176B91)' : '1px solid var(--aarizo-border, #DCE8EF)',
              backgroundColor: isActive ? 'var(--aarizo-light-blue, #EAF6FC)' : '#ffffff',
              color: isActive ? 'var(--aarizo-blue, #176B91)' : 'var(--aarizo-text-secondary, #657785)',
              fontWeight: isActive ? 700 : 500,
              fontSize: '0.8125rem',
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
                  backgroundColor: isActive ? 'var(--aarizo-sky, #83CBEA)' : 'var(--aarizo-pale-blue, #F4FAFE)',
                  color: isActive ? 'var(--aarizo-navy, #083B56)' : 'var(--aarizo-text-muted, #8B9AA5)',
                  borderRadius: '9999px',
                  padding: '0.1rem 0.4rem',
                  fontSize: '0.6875rem',
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
