import React from 'react';
import './common.css';

export interface PageHeaderProps {
  title: string;
  subtitle?: string;
  action?: React.ReactNode;
  roadmapTag?: 'MVP' | 'V1' | 'V2 Preview';
}

export const PageHeader: React.FC<PageHeaderProps> = ({ title, subtitle, action, roadmapTag }) => {
  return (
    <div className="page-header">
      <div>
        <div className="page-header-title-row">
          <h2>{title}</h2>
          {roadmapTag && <span className={`roadmap-tag tag-${roadmapTag.toLowerCase().replace(/\s+/g, '-')}`}>{roadmapTag}</span>}
        </div>
        {subtitle && <p className="page-header-subtitle">{subtitle}</p>}
      </div>
      {action && <div className="page-header-action">{action}</div>}
    </div>
  );
};

export interface SectionHeaderProps {
  title: string;
  action?: React.ReactNode;
}

export const SectionHeader: React.FC<SectionHeaderProps> = ({ title, action }) => {
  return (
    <div className="section-header">
      <h3>{title}</h3>
      {action && <div>{action}</div>}
    </div>
  );
};

export interface StatCardProps {
  title: string;
  value: string | number;
  change?: string;
  isPositive?: boolean;
  icon?: React.ReactNode;
  caption?: string;
}

export const StatCard: React.FC<StatCardProps> = ({ title, value, change, isPositive, icon, caption }) => {
  return (
    <div className="stat-card">
      <div className="stat-card-header">
        <span className="stat-card-title">{title}</span>
        {icon && <div className="stat-card-icon">{icon}</div>}
      </div>
      <div className="stat-card-value">{value}</div>
      {(change || caption) && (
        <div className="stat-card-footer">
          {change && (
            <span className={`stat-card-change ${isPositive ? 'positive' : 'negative'}`}>
              {isPositive ? '↑' : '↓'} {change}
            </span>
          )}
          {caption && <span className="stat-card-caption">{caption}</span>}
        </div>
      )}
    </div>
  );
};

export interface Column<T> {
  key: string;
  header: string;
  render?: (row: T) => React.ReactNode;
}

export interface DataTableProps<T> {
  columns: Column<T>[];
  data: T[];
  emptyMessage?: string;
}

export function DataTable<T extends { id: string | number }>({
  columns,
  data,
  emptyMessage = 'No data available',
}: DataTableProps<T>) {
  if (data.length === 0) {
    return <div className="data-table-empty">{emptyMessage}</div>;
  }

  return (
    <div className="data-table-wrapper">
      <table className="data-table">
        <thead>
          <tr>
            {columns.map((col) => (
              <th key={col.key}>{col.header}</th>
            ))}
          </tr>
        </thead>
        <tbody>
          {data.map((row) => (
            <tr key={row.id}>
              {columns.map((col) => (
                <td key={col.key}>{col.render ? col.render(row) : (row as Record<string, unknown>)[col.key] as React.ReactNode}</td>
              ))}
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
