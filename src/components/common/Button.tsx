import React from 'react';
import './common.css';

export interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: 'primary' | 'secondary' | 'outline' | 'danger' | 'ghost';
  size?: 'sm' | 'md' | 'lg';
  fullWidth?: boolean;
  leftIcon?: React.ReactNode;
  rightIcon?: React.ReactNode;
  isLoading?: boolean;
}

export const Button: React.FC<ButtonProps> = ({
  children,
  variant = 'primary',
  size = 'md',
  fullWidth = false,
  leftIcon,
  rightIcon,
  isLoading = false,
  disabled,
  className = '',
  ...props
}) => {
  const classNames = [
    'btn',
    `btn-${variant}`,
    `btn-${size}`,
    fullWidth ? 'btn-full' : '',
    isLoading ? 'btn-loading' : '',
    className,
  ]
    .filter(Boolean)
    .join(' ');

  return (
    <button className={classNames} disabled={disabled || isLoading} {...props}>
      {isLoading && <span className="btn-spinner" />}
      {!isLoading && leftIcon && <span className="btn-icon-left">{leftIcon}</span>}
      <span>{children}</span>
      {!isLoading && rightIcon && <span className="btn-icon-right">{rightIcon}</span>}
    </button>
  );
};

export interface IconButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  icon: React.ReactNode;
  variant?: 'primary' | 'secondary' | 'outline' | 'ghost';
  size?: 'sm' | 'md' | 'lg';
  ariaLabel: string;
}

export const IconButton: React.FC<IconButtonProps> = ({
  icon,
  variant = 'ghost',
  size = 'md',
  ariaLabel,
  className = '',
  ...props
}) => {
  return (
    <button
      className={`btn-icon btn-icon-${variant} btn-icon-${size} ${className}`}
      aria-label={ariaLabel}
      title={ariaLabel}
      {...props}
    >
      {icon}
    </button>
  );
};
