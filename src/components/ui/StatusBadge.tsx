import React from 'react';

export type BadgeVariant = 'success' | 'warning' | 'danger' | 'info' | 'neutral' | 'purple';

interface StatusBadgeProps {
  label: string;
  variant?: BadgeVariant;
  size?: 'sm' | 'md';
  icon?: React.ReactNode;
}

export const StatusBadge: React.FC<StatusBadgeProps> = ({
  label,
  variant = 'neutral',
  size = 'md',
  icon,
}) => {
  const getColors = () => {
    switch (variant) {
      case 'success':
        return { bg: '#ecfdf5', color: '#047857', border: '#a7f3d0' };
      case 'warning':
        return { bg: '#fffbeb', color: '#b45309', border: '#fde68a' };
      case 'danger':
        return { bg: '#fef2f2', color: '#b91c1c', border: '#fecaca' };
      case 'info':
        return { bg: '#eff6ff', color: '#1d4ed8', border: '#bfdbfe' };
      case 'purple':
        return { bg: '#f5f3ff', color: '#6d28d9', border: '#ddd6fe' };
      default:
        return { bg: '#f1f5f9', color: '#475569', border: '#cbd5e1' };
    }
  };

  const style = getColors();

  return (
    <span
      style={{
        display: 'inline-flex',
        alignItems: 'center',
        gap: '0.35rem',
        padding: size === 'sm' ? '0.15rem 0.5rem' : '0.25rem 0.75rem',
        fontSize: size === 'sm' ? '0.75rem' : '0.85rem',
        fontWeight: 600,
        borderRadius: '9999px',
        backgroundColor: style.bg,
        color: style.color,
        border: `1px solid ${style.border}`,
        whiteSpace: 'nowrap',
      }}
    >
      {icon}
      <span>{label}</span>
    </span>
  );
};
