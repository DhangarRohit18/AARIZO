import React from 'react';
import './common.css';

export interface InputProps extends React.InputHTMLAttributes<HTMLInputElement> {
  label?: string;
  error?: string;
  helperText?: string;
  leftIcon?: React.ReactNode;
  rightIcon?: React.ReactNode;
}

export const Input: React.FC<InputProps> = ({
  label,
  error,
  helperText,
  leftIcon,
  rightIcon,
  className = '',
  id,
  ...props
}) => {
  const inputId = id || (label ? label.toLowerCase().replace(/\s+/g, '-') : undefined);

  return (
    <div className="input-group">
      {label && (
        <label htmlFor={inputId} className="input-label">
          {label}
        </label>
      )}
      <div className={`input-wrapper ${error ? 'input-error' : ''}`}>
        {leftIcon && <span className="input-icon-left">{leftIcon}</span>}
        <input id={inputId} className={`input-field ${className}`} {...props} />
        {rightIcon && <span className="input-icon-right">{rightIcon}</span>}
      </div>
      {error && <p className="input-error-message">{error}</p>}
      {!error && helperText && <p className="input-helper">{helperText}</p>}
    </div>
  );
};

export interface SelectProps extends React.SelectHTMLAttributes<HTMLSelectElement> {
  label?: string;
  options: Array<{ value: string; label: string }>;
  error?: string;
}

export const Select: React.FC<SelectProps> = ({ label, options, error, id, className = '', ...props }) => {
  const selectId = id || (label ? label.toLowerCase().replace(/\s+/g, '-') : undefined);

  return (
    <div className="input-group">
      {label && (
        <label htmlFor={selectId} className="input-label">
          {label}
        </label>
      )}
      <select id={selectId} className={`select-field ${error ? 'input-error' : ''} ${className}`} {...props}>
        {options.map((opt) => (
          <option key={opt.value} value={opt.value}>
            {opt.label}
          </option>
        ))}
      </select>
      {error && <p className="input-error-message">{error}</p>}
    </div>
  );
};

export interface TabItem {
  id: string;
  label: string;
  badge?: string | number;
  icon?: React.ReactNode;
}

export interface TabsProps {
  tabs: TabItem[];
  activeTab: string;
  onChange: (id: string) => void;
  variant?: 'underline' | 'pills';
}

export const Tabs: React.FC<TabsProps> = ({ tabs, activeTab, onChange, variant = 'underline' }) => {
  return (
    <div className={`tabs-container tabs-${variant}`}>
      {tabs.map((tab) => (
        <button
          key={tab.id}
          className={`tab-btn ${activeTab === tab.id ? 'tab-active' : ''}`}
          onClick={() => onChange(tab.id)}
        >
          {tab.icon && <span className="tab-icon">{tab.icon}</span>}
          <span>{tab.label}</span>
          {tab.badge !== undefined && <span className="tab-badge">{tab.badge}</span>}
        </button>
      ))}
    </div>
  );
};

export const Divider: React.FC<{ margin?: 'sm' | 'md' | 'lg' }> = ({ margin = 'md' }) => {
  return <hr className={`divider divider-margin-${margin}`} />;
};

export interface AvatarProps {
  name: string;
  size?: 'sm' | 'md' | 'lg';
  status?: 'online' | 'offline';
  src?: string;
}

export const Avatar: React.FC<AvatarProps> = ({ name, size = 'md', status, src }) => {
  const initials = name
    .split(' ')
    .map((n) => n[0])
    .join('')
    .substring(0, 2)
    .toUpperCase();

  return (
    <div className={`avatar avatar-${size}`}>
      {src ? (
        <img src={src} alt={name} className="avatar-img" />
      ) : (
        <span className="avatar-initials">{initials}</span>
      )}
      {status && <span className={`avatar-status avatar-status-${status}`} />}
    </div>
  );
};

export const Tooltip: React.FC<{ text: string; children: React.ReactNode }> = ({ text, children }) => {
  return (
    <div className="tooltip-wrapper" title={text}>
      {children}
    </div>
  );
};
