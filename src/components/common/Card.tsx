import React from 'react';
import './common.css';

export interface CardProps extends React.HTMLAttributes<HTMLDivElement> {
  variant?: 'flat' | 'outlined' | 'elevated';
  padding?: 'none' | 'sm' | 'md' | 'lg';
  interactive?: boolean;
}

export const Card: React.FC<CardProps> = ({
  children,
  variant = 'outlined',
  padding = 'md',
  interactive = false,
  className = '',
  ...props
}) => {
  const classes = [
    'card',
    `card-${variant}`,
    `card-pad-${padding}`,
    interactive ? 'card-interactive' : '',
    className,
  ]
    .filter(Boolean)
    .join(' ');

  return (
    <div className={classes} {...props}>
      {children}
    </div>
  );
};

export interface BadgeProps {
  children: React.ReactNode;
  variant?: 'neutral' | 'primary' | 'success' | 'warning' | 'danger' | 'info';
  size?: 'sm' | 'md';
  icon?: React.ReactNode;
}

export const Badge: React.FC<BadgeProps> = ({
  children,
  variant = 'neutral',
  size = 'md',
  icon,
}) => {
  return (
    <span className={`badge badge-${variant} badge-${size}`}>
      {icon && <span className="badge-icon">{icon}</span>}
      {children}
    </span>
  );
};

export interface StatusBadgeProps {
  status: 'online' | 'offline' | 'syncing' | 'synced' | 'conflict' | 'pending' | 'active' | 'resolved';
  label?: string;
}

export const StatusBadge: React.FC<StatusBadgeProps> = ({ status, label }) => {
  const displayLabel = label || status.toUpperCase();
  let badgeVariant: BadgeProps['variant'] = 'neutral';

  switch (status) {
    case 'online':
    case 'synced':
    case 'active':
    case 'resolved':
      badgeVariant = 'success';
      break;
    case 'pending':
    case 'syncing':
      badgeVariant = 'warning';
      break;
    case 'offline':
    case 'conflict':
      badgeVariant = 'danger';
      break;
  }

  return (
    <span className={`status-badge status-${status} status-variant-${badgeVariant}`}>
      <span className="status-dot" />
      <span>{displayLabel}</span>
    </span>
  );
};

export interface ChipProps {
  label: string;
  active?: boolean;
  onClick?: () => void;
  count?: number;
}

export const Chip: React.FC<ChipProps> = ({ label, active = false, onClick, count }) => {
  return (
    <button className={`chip ${active ? 'chip-active' : ''}`} onClick={onClick}>
      <span>{label}</span>
      {count !== undefined && <span className="chip-count">{count}</span>}
    </button>
  );
};
