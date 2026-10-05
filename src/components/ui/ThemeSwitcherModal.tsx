import React, { useState } from 'react';
import { Palette, Check, Sparkles, X } from 'lucide-react';
import { useTheme } from '../../context/ThemeContext';

export const ThemeSwitcherModal: React.FC = () => {
  const { theme, setTheme, themes } = useTheme();
  const [isOpen, setIsOpen] = useState(false);

  const activeThemeObj = themes.find((t) => t.id === theme) || themes[0];

  return (
    <>
      {/* Floating 4-Color Theme Selector Trigger Button */}
      <button
        onClick={() => setIsOpen(true)}
        aria-label="Open Theme Palette Switcher"
        title="Try 4 Color Themes"
        style={{
          position: 'fixed',
          bottom: 'calc(116px + env(safe-area-inset-bottom, 0px))',
          right: 14,
          zIndex: 9998,
          background: 'rgba(8, 26, 42, 0.92)',
          color: '#ffffff',
          border: '1px solid rgba(255, 255, 255, 0.25)',
          boxShadow: '0 8px 24px rgba(0, 0, 0, 0.35)',
          borderRadius: '24px',
          padding: '0.45rem 0.8rem',
          display: 'flex',
          alignItems: 'center',
          gap: '0.5rem',
          fontSize: '0.75rem',
          fontWeight: 800,
          backdropFilter: 'blur(10px)',
          cursor: 'pointer',
          transition: 'all 0.2s cubic-bezier(0.16, 1, 0.3, 1)',
        }}
      >
        <span
          style={{
            width: 12,
            height: 12,
            borderRadius: '50%',
            background: `linear-gradient(135deg, ${activeThemeObj.primaryColor}, ${activeThemeObj.accentColor})`,
            boxShadow: `0 0 8px ${activeThemeObj.accentColor}`,
            flexShrink: 0,
          }}
        />
        <Palette size={14} className="text-[#83CBEA]" />
        <span style={{ letterSpacing: '0.01em' }}>4 Themes</span>
      </button>

      {/* Interactive Modal to test and preview all 4 options */}
      {isOpen && (
        <div
          role="dialog"
          aria-modal="true"
          style={{
            position: 'fixed',
            inset: 0,
            zIndex: 99999,
            backgroundColor: 'rgba(6, 20, 32, 0.72)',
            backdropFilter: 'blur(8px)',
            WebkitBackdropFilter: 'blur(8px)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            padding: '1rem',
          }}
        >
          <div
            style={{
              background: '#FFFFFF',
              borderRadius: '1.5rem',
              maxWidth: '480px',
              width: '100%',
              boxShadow: '0 25px 65px -12px rgba(8, 59, 86, 0.45)',
              overflow: 'hidden',
              animation: 'aarizoModalEnter 0.2s cubic-bezier(0.16, 1, 0.3, 1)',
            }}
          >
            {/* Header */}
            <div
              style={{
                padding: '1.25rem 1.5rem',
                borderBottom: '1px solid #E2E8F0',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'space-between',
                background: 'linear-gradient(135deg, #06283D 0%, #083B56 100%)',
                color: '#FFFFFF',
              }}
            >
              <div>
                <div style={{ display: 'flex', alignItems: 'center', gap: '0.4rem' }}>
                  <Sparkles size={16} style={{ color: '#83CBEA' }} />
                  <h3 style={{ fontSize: '1rem', fontWeight: 800, margin: 0, color: '#FFFFFF' }}>
                    Select Color Palette
                  </h3>
                </div>
                <p style={{ fontSize: '0.75rem', color: '#83CBEA', margin: '0.2rem 0 0', fontWeight: 500 }}>
                  Test all 4 custom themes instantly across every component
                </p>
              </div>
              <button
                onClick={() => setIsOpen(false)}
                aria-label="Close theme modal"
                style={{
                  width: 32,
                  height: 32,
                  borderRadius: '50%',
                  background: 'rgba(255, 255, 255, 0.15)',
                  border: 'none',
                  color: '#FFFFFF',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  cursor: 'pointer',
                }}
              >
                <X size={16} />
              </button>
            </div>

            {/* 4 Theme Option Buttons */}
            <div style={{ padding: '1.25rem 1.5rem', display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
              {themes.map((t) => {
                const isSelected = theme === t.id;
                return (
                  <button
                    key={t.id}
                    onClick={() => setTheme(t.id)}
                    style={{
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'space-between',
                      padding: '0.875rem 1rem',
                      borderRadius: '1rem',
                      border: isSelected ? `2px solid ${t.primaryColor}` : '1px solid #E2E8F0',
                      background: isSelected ? 'rgba(23, 107, 145, 0.05)' : '#F8FAFC',
                      cursor: 'pointer',
                      textAlign: 'left',
                      transition: 'all 0.15s ease',
                      position: 'relative',
                    }}
                  >
                    <div style={{ display: 'flex', alignItems: 'center', gap: '0.875rem' }}>
                      {/* Color swatches */}
                      <div style={{ display: 'flex', alignItems: 'center', position: 'relative', width: 44, height: 26 }}>
                        <span
                          style={{
                            position: 'absolute',
                            left: 0,
                            top: 0,
                            width: 26,
                            height: 26,
                            borderRadius: '50%',
                            background: t.primaryColor,
                            boxShadow: '0 2px 5px rgba(0,0,0,0.2)',
                            zIndex: 2,
                          }}
                        />
                        <span
                          style={{
                            position: 'absolute',
                            left: 16,
                            top: 0,
                            width: 26,
                            height: 26,
                            borderRadius: '50%',
                            background: t.accentColor,
                            boxShadow: '0 2px 5px rgba(0,0,0,0.15)',
                            zIndex: 1,
                          }}
                        />
                      </div>

                      <div>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '0.4rem' }}>
                          <span style={{ fontSize: '0.875rem', fontWeight: 800, color: '#0F172A' }}>
                            {t.label}
                          </span>
                          <span
                            style={{
                              fontSize: '0.625rem',
                              fontWeight: 700,
                              textTransform: 'uppercase',
                              padding: '0.15rem 0.4rem',
                              borderRadius: '6px',
                              background: isSelected ? t.primaryColor : '#E2E8F0',
                              color: isSelected ? '#FFFFFF' : '#475569',
                            }}
                          >
                            {t.badge}
                          </span>
                        </div>
                        <p style={{ fontSize: '0.72rem', color: '#64748B', margin: '0.2rem 0 0', fontWeight: 500 }}>
                          {t.description}
                        </p>
                      </div>
                    </div>

                    <div
                      style={{
                        width: 24,
                        height: 24,
                        borderRadius: '50%',
                        border: isSelected ? `2px solid ${t.primaryColor}` : '2px solid #CBD5E1',
                        background: isSelected ? t.primaryColor : '#FFFFFF',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        color: '#FFFFFF',
                        flexShrink: 0,
                        marginLeft: '0.5rem',
                      }}
                    >
                      {isSelected && <Check size={14} strokeWidth={3} />}
                    </div>
                  </button>
                );
              })}
            </div>

            {/* Modal Footer */}
            <div
              style={{
                padding: '0.875rem 1.5rem',
                background: '#F8FAFC',
                borderTop: '1px solid #E2E8F0',
                display: 'flex',
                justifyContent: 'space-between',
                alignItems: 'center',
              }}
            >
              <span style={{ fontSize: '0.75rem', color: '#64748B', fontWeight: 600 }}>
                Active: <strong style={{ color: activeThemeObj.primaryColor }}>{activeThemeObj.name}</strong>
              </span>
              <button
                onClick={() => setIsOpen(false)}
                style={{
                  padding: '0.45rem 1.1rem',
                  borderRadius: '0.75rem',
                  background: 'var(--aarizo-blue, #176B91)',
                  color: '#FFFFFF',
                  fontWeight: 700,
                  fontSize: '0.8125rem',
                  border: 'none',
                  cursor: 'pointer',
                  boxShadow: '0 2px 8px rgba(23, 107, 145, 0.3)',
                }}
              >
                Apply &amp; Done
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
};
