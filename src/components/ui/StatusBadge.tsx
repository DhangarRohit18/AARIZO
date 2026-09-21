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
        return { bg: 'var(--aarizo-success-bg, #EDF8F0)', color: 'var(--aarizo-success, #3F8F58)', border: '#c3e6cb' };
      case 'warning':
        return { bg: 'var(--aarizo-warning-bg, #FFF8E8)', color: 'var(--aarizo-warning, #D99A2B)', border: '#fce3b8' };
      case 'danger':
        return { bg: 'var(--aarizo-danger-bg, #FFF0F1)', color: 'var(--aarizo-danger, #D9535B)', border: '#fbc5c8' };
      case 'info':
        return { bg: 'var(--aarizo-info-bg, #EAF6FC)', color: 'var(--aarizo-info, #176B91)', border: 'var(--aarizo-border, #DCE8EF)' };
      case 'purple':
        return { bg: '#F4FAFE', color: 'var(--aarizo-blue, #176B91)', border: '#d0e5f2' };
      default:
        return { bg: 'var(--aarizo-pale-blue, #F4FAFE)', color: 'var(--aarizo-text-secondary, #657785)', border: 'var(--aarizo-border, #DCE8EF)' };
    }
  };

  const style = getColors();

  return (
    <span
      style={{
        display: 'inline-flex',
        alignItems: 'center',
        gap: '0.35rem',
        padding: size === 'sm' ? '0.15rem 0.5rem' : '0.2rem 0.65rem',
        fontSize: size === 'sm' ? '0.6875rem' : '0.75rem',
        fontWeight: 700,
        borderRadius: '9999px',
        backgroundColor: style.bg,
        color: style.color,
        border: `1px solid ${style.border}`,
        whiteSpace: 'nowrap',
        letterSpacing: '0.02em',
      }}
    >
      {icon}
      <span>{label}</span>
    </span>
  );
};
