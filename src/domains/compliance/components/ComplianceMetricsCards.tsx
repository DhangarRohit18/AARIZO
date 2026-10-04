import React from 'react';
import { ShieldCheck, CheckCircle2, Clock, XCircle, AlertTriangle } from 'lucide-react';
import type { ComplianceMetrics } from '../types';

interface ComplianceMetricsCardsProps {
  metrics: ComplianceMetrics;
}

export const ComplianceMetricsCards: React.FC<ComplianceMetricsCardsProps> = ({ metrics }) => {
  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '0.625rem' }}>
      {/* Compliance Health Overall Score */}
      <div style={{ background: '#ffffff', borderRadius: '14px', border: '1px solid #DCE8EF', padding: '1rem', boxShadow: '0 2px 6px rgba(8, 59, 86, 0.04)' }}>
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '0.5rem' }}>
          <div>
            <span style={{ fontSize: '0.6875rem', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.04em', color: '#8B9AA5' }}>
              Compliance Health Score
            </span>
            <div style={{ display: 'flex', alignItems: 'baseline', gap: '0.5rem', marginTop: '0.15rem' }}>
              <span style={{ fontSize: '1.75rem', fontWeight: 900, color: '#083B56', lineHeight: 1 }}>
                {metrics.complianceScorePercent}%
              </span>
              <span style={{
                fontSize: '0.6875rem',
                fontWeight: 700,
                color: metrics.complianceScorePercent >= 80 ? '#059669' : metrics.complianceScorePercent >= 50 ? '#D97706' : '#DC2626',
                background: metrics.complianceScorePercent >= 80 ? '#ECFDF5' : metrics.complianceScorePercent >= 50 ? '#FFFBEB' : '#FEF2F2',
                padding: '0.15rem 0.5rem',
                borderRadius: '12px',
              }}>
                {metrics.complianceScorePercent >= 80 ? 'Good Health' : metrics.complianceScorePercent >= 50 ? 'Needs Attention' : 'Critical Action'}
              </span>
            </div>
          </div>
          <div style={{ width: 42, height: 42, borderRadius: '12px', background: '#EAF6FC', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#176B91' }}>
            <ShieldCheck size={24} />
          </div>
        </div>
        <div style={{ width: '100%', height: '6px', background: '#F1F5F9', borderRadius: '9999px', overflow: 'hidden' }}>
          <div
            style={{
              height: '100%',
              borderRadius: '9999px',
              width: `${metrics.complianceScorePercent}%`,
              background: metrics.complianceScorePercent >= 80 ? '#059669' : metrics.complianceScorePercent >= 50 ? '#D97706' : '#DC2626',
              transition: 'width 0.3s ease',
            }}
          />
        </div>
      </div>

      {/* 2x2 Clean Metrics Grid */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: '0.5rem' }}>
        <div style={{ background: '#ffffff', borderRadius: '12px', border: '1px solid #DCE8EF', padding: '0.75rem', boxShadow: '0 1px 4px rgba(8, 59, 86, 0.04)' }}>
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '0.35rem' }}>
            <span style={{ fontSize: '0.65rem', fontWeight: 700, textTransform: 'uppercase', color: '#657785', letterSpacing: '0.02em' }}>
              Active Compliant
            </span>
            <div style={{ width: 24, height: 24, borderRadius: '6px', background: '#ECFDF5', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
              <CheckCircle2 size={14} color="#059669" />
            </div>
          </div>
          <div style={{ fontSize: '1.375rem', fontWeight: 900, color: '#059669', lineHeight: 1.1 }}>{metrics.activeCount}</div>
          <div style={{ fontSize: '0.65rem', color: '#8B9AA5', marginTop: '0.2rem' }}>Valid AMC & Insurance</div>
        </div>

        <div style={{ background: '#ffffff', borderRadius: '12px', border: '1px solid #DCE8EF', padding: '0.75rem', boxShadow: '0 1px 4px rgba(8, 59, 86, 0.04)' }}>
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '0.35rem' }}>
            <span style={{ fontSize: '0.65rem', fontWeight: 700, textTransform: 'uppercase', color: '#657785', letterSpacing: '0.02em' }}>
              Expiring (30 Days)
            </span>
            <div style={{ width: 24, height: 24, borderRadius: '6px', background: '#FFFBEB', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
              <Clock size={14} color="#D97706" />
            </div>
          </div>
          <div style={{ fontSize: '1.375rem', fontWeight: 900, color: '#D97706', lineHeight: 1.1 }}>{metrics.expiringSoonCount}</div>
          <div style={{ fontSize: '0.65rem', color: '#8B9AA5', marginTop: '0.2rem' }}>Needs renewal review</div>
        </div>

        <div style={{ background: '#ffffff', borderRadius: '12px', border: '1px solid #DCE8EF', padding: '0.75rem', boxShadow: '0 1px 4px rgba(8, 59, 86, 0.04)' }}>
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '0.35rem' }}>
            <span style={{ fontSize: '0.65rem', fontWeight: 700, textTransform: 'uppercase', color: '#657785', letterSpacing: '0.02em' }}>
              Expired Contracts
            </span>
            <div style={{ width: 24, height: 24, borderRadius: '6px', background: '#FEF2F2', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
              <XCircle size={14} color="#DC2626" />
            </div>
          </div>
          <div style={{ fontSize: '1.375rem', fontWeight: 900, color: '#DC2626', lineHeight: 1.1 }}>{metrics.expiredCount}</div>
          <div style={{ fontSize: '0.65rem', color: '#8B9AA5', marginTop: '0.2rem' }}>Action required now</div>
        </div>

        <div style={{ background: '#ffffff', borderRadius: '12px', border: '1px solid #DCE8EF', padding: '0.75rem', boxShadow: '0 1px 4px rgba(8, 59, 86, 0.04)' }}>
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '0.35rem' }}>
            <span style={{ fontSize: '0.65rem', fontWeight: 700, textTransform: 'uppercase', color: '#657785', letterSpacing: '0.02em' }}>
              Non-Compliant
            </span>
            <div style={{ width: 24, height: 24, borderRadius: '6px', background: '#EAF6FC', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
              <AlertTriangle size={14} color="#176B91" />
            </div>
          </div>
          <div style={{ fontSize: '1.375rem', fontWeight: 900, color: '#176B91', lineHeight: 1.1 }}>{metrics.nonCompliantCount}</div>
          <div style={{ fontSize: '0.65rem', color: '#8B9AA5', marginTop: '0.2rem' }}>Failed inspection</div>
        </div>
      </div>
    </div>
  );
};
