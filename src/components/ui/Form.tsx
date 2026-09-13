import React from 'react';

interface FormProps extends React.FormHTMLAttributes<HTMLFormElement> {
  children: React.ReactNode;
}

export const Form: React.FC<FormProps> = ({ children, ...props }) => {
  return (
    <form {...props} style={{ display: 'flex', flexDirection: 'column', gap: '1rem', width: '100%', ...props.style }}>
      {children}
    </form>
  );
};

interface FormFieldProps {
  label: string;
  error?: string;
  required?: boolean;
  children: React.ReactNode;
}

export const FormField: React.FC<FormFieldProps> = ({ label, error, required, children }) => {
  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '0.35rem' }}>
      <label style={{ fontSize: '0.85rem', fontWeight: 600, color: '#334155' }}>
        {label} {required && <span style={{ color: '#ef4444' }}>*</span>}
      </label>
      {children}
      {error && <span style={{ fontSize: '0.75rem', color: '#ef4444' }}>{error}</span>}
    </div>
  );
};
