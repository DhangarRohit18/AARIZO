import { useState } from 'react';
import { ArrowLeft, Search, Building2, Eye } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { societyService } from '../../../services/societyService';
import type { Resident } from '../../../types/society';

export const ResidentManagementPage = () => {
  const navigate = useNavigate();
  const currentSocietyId = 'soc-gvs';
  const [residents] = useState<Resident[]>(societyService.getResidents(currentSocietyId));
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedWing, setSelectedWing] = useState('ALL');

  const filteredResidents = residents.filter((r) => {
    const matchesWing = selectedWing === 'ALL' || r.flatCode.toUpperCase().includes(selectedWing);
    const matchesSearch =
      r.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      r.flatCode.toLowerCase().includes(searchQuery.toLowerCase()) ||
      r.phone.includes(searchQuery);
    return matchesWing && matchesSearch;
  });

  return (
    <div style={{ minHeight: '100%', background: 'var(--aarizo-page, #F7FBFE)', paddingBottom: '1rem' }}>
      {/* ── Subheader with Back Button & Breadcrumbs ── */}
      <div
        style={{
          display: 'flex',
          alignItems: 'center',
          gap: '0.875rem',
          padding: '1rem 1rem 0.75rem',
          background: 'var(--aarizo-card-blue, #F4FAFE)',
          borderBottom: '1px solid var(--aarizo-border, #DCE8EF)',
        }}
      >
        <button
          onClick={() => navigate(-1)}
          aria-label="Back"
          style={{
            width: 36,
            height: 36,
            borderRadius: '50%',
            background: '#ffffff',
            border: '1px solid var(--aarizo-border, #DCE8EF)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            color: 'var(--aarizo-navy, #083B56)',
            cursor: 'pointer',
            flexShrink: 0,
          }}
        >
          <ArrowLeft size={18} />
        </button>
        <div>
          <h2 style={{ fontSize: '1.125rem', fontWeight: 800, color: 'var(--aarizo-navy, #083B56)', margin: 0, letterSpacing: '-0.02em' }}>
            Residents
          </h2>
          <p style={{ fontSize: '0.6875rem', color: 'var(--aarizo-text-secondary, #657785)', margin: 0 }}>
            Green Valley Society · {residents.length} residents
          </p>
        </div>
      </div>

      {/* ── Search Bar & Filter Strip ── */}
      <div style={{ padding: '1rem 1rem 0.5rem' }}>
        <div
          style={{
            display: 'flex',
            alignItems: 'center',
            gap: '0.625rem',
            background: '#ffffff',
            border: '1px solid var(--aarizo-border, #DCE8EF)',
            borderRadius: '12px',
            padding: '0 0.875rem',
            height: '46px',
            boxShadow: '0 1px 4px rgba(8, 59, 86, 0.04)',
          }}
        >
          <Search size={18} color="var(--aarizo-text-secondary, #657785)" />
          <input
            type="text"
            placeholder="Search by name, flat, wing, or building..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            style={{
              flex: 1,
              border: 'none',
              outline: 'none',
              fontSize: '0.8125rem',
              color: 'var(--aarizo-text, #203746)',
              background: 'transparent',
              minHeight: 'auto',
            }}
          />
        </div>

        {/* Wings Filter Pills */}
        <div style={{ display: 'flex', gap: '0.5rem', marginTop: '0.75rem', overflowX: 'auto', scrollbarWidth: 'none' }}>
          {['ALL', 'A', 'B', 'C'].map((wing) => (
            <button
              key={wing}
              onClick={() => setSelectedWing(wing)}
              style={{
                display: 'inline-flex',
                alignItems: 'center',
                gap: '0.375rem',
                background: selectedWing === wing ? 'var(--aarizo-blue, #176B91)' : '#ffffff',
                border: '1px solid var(--aarizo-border, #DCE8EF)',
                borderRadius: '10px',
                padding: '0.4rem 0.75rem',
                fontSize: '0.75rem',
                fontWeight: 600,
                color: selectedWing === wing ? '#ffffff' : 'var(--aarizo-text, #203746)',
                cursor: 'pointer',
              }}
            >
              <Building2 size={14} color={selectedWing === wing ? '#ffffff' : 'var(--aarizo-blue, #176B91)'} />
              <span>{wing === 'ALL' ? 'All Wings' : `Wing ${wing}`}</span>
            </button>
          ))}
        </div>
      </div>

      {/* ── Count Heading ── */}
      <div style={{ padding: '0.5rem 1rem 0.25rem' }}>
        <span style={{ fontSize: '0.75rem', fontWeight: 600, color: 'var(--aarizo-text-secondary, #657785)' }}>
          {filteredResidents.length} residents found
        </span>
      </div>

      {/* ── Resident Cards (Exact Match to Screenshot) ── */}
      <div style={{ padding: '0.25rem 1rem 1rem', display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
        {filteredResidents.map((r) => (
          <div
            key={r.id}
            style={{
              background: '#ffffff',
              border: '1px solid var(--aarizo-border-soft, #E8F1F5)',
              borderRadius: '16px',
              padding: '0.875rem 1rem',
              boxShadow: '0 2px 10px rgba(8, 59, 86, 0.05)',
              display: 'flex',
              flexDirection: 'column',
              gap: '0.625rem',
            }}
          >
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
                {/* Initial Avatar Circle */}
                <div
                  style={{
                    width: 44,
                    height: 44,
                    borderRadius: '50%',
                    background: 'var(--aarizo-pale-blue, #F4FAFE)',
                    border: '1px solid var(--aarizo-border, #DCE8EF)',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    color: 'var(--aarizo-navy, #083B56)',
                    fontWeight: 800,
                    fontSize: '1rem',
                    flexShrink: 0,
                  }}
                >
                  {r.name.charAt(0).toUpperCase()}
                </div>
                <div>
                  <div style={{ fontSize: '0.9375rem', fontWeight: 700, color: 'var(--aarizo-text, #203746)' }}>
                    {r.name}
                  </div>
                  <div style={{ fontSize: '0.75rem', color: 'var(--aarizo-text-secondary, #657785)', marginTop: '0.125rem' }}>
                    ⌂ {r.flatCode} · Floor 1
                  </div>
                  <div style={{ fontSize: '0.75rem', color: 'var(--aarizo-text-secondary, #657785)' }}>
                    🏢 Wing A
                  </div>
                  <div style={{ fontSize: '0.75rem', color: 'var(--aarizo-text-secondary, #657785)' }}>
                    📞 {r.phone}
                  </div>
                </div>
              </div>

              {/* Status & View Button */}
              <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'flex-end', gap: '0.75rem' }}>
                <span
                  style={{
                    fontSize: '0.625rem',
                    fontWeight: 700,
                    color: 'var(--aarizo-text-secondary, #657785)',
                    background: 'var(--aarizo-pale-blue, #F4FAFE)',
                    border: '1px solid var(--aarizo-border, #DCE8EF)',
                    padding: '0.2rem 0.5rem',
                    borderRadius: '9999px',
                    letterSpacing: '0.04em',
                    textTransform: 'uppercase',
                  }}
                >
                  CURRENTLY_RESIDING
                </span>

                <button
                  onClick={() => alert(`Resident Profile: ${r.name} (${r.flatCode})`)}
                  style={{
                    display: 'inline-flex',
                    alignItems: 'center',
                    gap: '0.25rem',
                    padding: '0.35rem 0.75rem',
                    borderRadius: '8px',
                    background: 'var(--aarizo-light-blue, #EAF6FC)',
                    border: '1px solid var(--aarizo-border, #DCE8EF)',
                    color: 'var(--aarizo-navy, #083B56)',
                    fontWeight: 700,
                    fontSize: '0.75rem',
                    cursor: 'pointer',
                  }}
                >
                  <Eye size={13} color="var(--aarizo-blue, #176B91)" />
                  <span>View</span>
                </button>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default ResidentManagementPage;
