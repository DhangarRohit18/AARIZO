import React from 'react';
import { Search as SearchIcon } from 'lucide-react';

interface SearchProps {
  value: string;
  onChange: (value: string) => void;
  placeholder?: string;
}

export const Search: React.FC<SearchProps> = ({
  value,
  onChange,
  placeholder = 'Search...',
}) => {
  return (
    <div
      style={{
        display: 'flex',
        alignItems: 'center',
        gap: '0.5rem',
        padding: '0.5rem 0.85rem',
        backgroundColor: '#f8fafc',
        border: '1px solid #cbd5e1',
        borderRadius: '8px',
        width: '100%',
        maxWidth: '360px',
      }}
    >
      <SearchIcon size={16} color="#94a3b8" />
      <input
        type="text"
        value={value}
        onChange={(e) => onChange(e.target.value)}
        placeholder={placeholder}
        style={{
          border: 'none',
          outline: 'none',
          background: 'transparent',
          width: '100%',
          fontSize: '0.85rem',
          color: '#0f172a',
        }}
      />
    </div>
  );
};
