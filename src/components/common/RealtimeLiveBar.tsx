import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Zap, Activity, RefreshCw, X, ShieldAlert, CheckCircle2, ExternalLink } from 'lucide-react';
import { realtimeService } from '../../services/realtimeService';
import type { RealtimeConnectionStatus } from '../../types/realtime';
import { getBackendBaseUrl } from '../../utils/backendConfig';

interface RealtimeAlertItem {
  id: string;
  topic: string;
  title: string;
  description: string;
  urgency: 'info' | 'alert' | 'emergency';
  timestamp: string;
  actionPath?: string;
  payload?: any;
}

/**
 * Live Connection Status Pill for Desktop and Mobile Header
 */
export const RealtimeStatusBadge: React.FC<{ compact?: boolean }> = ({ compact = false }) => {
  const [status, setStatus] = useState<RealtimeConnectionStatus>(realtimeService.getConnectionStatus());
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [customBackendUrl, setCustomBackendUrl] = useState(getBackendBaseUrl());
  const [isSavedUrl, setIsSavedUrl] = useState(false);

  useEffect(() => {
    const unsub = realtimeService.subscribeToStatus((newStatus) => {
      setStatus(newStatus);
    });
    return () => unsub();
  }, []);

  const handleSaveCustomUrl = (e: React.FormEvent) => {
    e.preventDefault();
    try {
      if (typeof window !== 'undefined') {
        localStorage.setItem('aarizo_backend_url', customBackendUrl.trim());
        setIsSavedUrl(true);
        setTimeout(() => setIsSavedUrl(false), 2000);
        realtimeService.forceReconnect();
      }
    } catch {}
  };

  const getDotColor = () => {
    switch (status.state) {
      case 'CONNECTED':
        return '#10B981'; // Green
      case 'RECONNECTING':
      case 'CONNECTING':
        return '#F59E0B'; // Amber
      default:
        return '#EF4444'; // Red
    }
  };

  return (
    <>
      <button
        onClick={() => setIsModalOpen(true)}
        title="Real-Time Network Telemetry & Sync State"
        style={{
          display: 'inline-flex',
          alignItems: 'center',
          gap: '0.4rem',
          padding: compact ? '0.25rem 0.5rem' : '0.35rem 0.65rem',
          borderRadius: '9999px',
          background: 'rgba(255, 255, 255, 0.1)',
          border: '1px solid rgba(255, 255, 255, 0.15)',
          color: '#ffffff',
          fontSize: '0.6875rem',
          fontWeight: 700,
          cursor: 'pointer',
          transition: 'all 0.2s ease',
        }}
        className="hover:bg-white/20 active:scale-95"
      >
        <span
          style={{
            width: 8,
            height: 8,
            borderRadius: '50%',
            background: getDotColor(),
            boxShadow: status.connected ? `0 0 8px ${getDotColor()}` : 'none',
            display: 'inline-block',
          }}
          className={status.connected ? 'animate-pulse' : ''}
        />
        {!compact && (
          <span>
            {status.state === 'CONNECTED'
              ? `LIVE (${status.latencyMs}ms)`
              : status.state === 'RECONNECTING'
              ? 'SYNCING...'
              : 'OFFLINE'}
          </span>
        )}
      </button>

      {/* Real-Time Telemetry Modal */}
      {isModalOpen && (
        <div
          style={{
            position: 'fixed',
            inset: 0,
            zIndex: 100,
            background: 'rgba(0, 0, 0, 0.6)',
            backdropFilter: 'blur(4px)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            padding: '1rem',
          }}
          onClick={() => setIsModalOpen(false)}
        >
          <div
            style={{
              width: '100%',
              maxWidth: 440,
              background: '#1F1B1A',
              borderRadius: '16px',
              border: '1px solid rgba(255, 255, 255, 0.15)',
              padding: '1.25rem',
              color: '#ffffff',
              boxShadow: '0 20px 25px -5px rgba(0, 0, 0, 0.5)',
            }}
            onClick={(e) => e.stopPropagation()}
          >
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '1rem' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                <Zap size={20} style={{ color: 'var(--aarizo-gold, #E5B842)' }} />
                <h3 style={{ fontSize: '1rem', fontWeight: 800, margin: 0 }}>Real-Time Stream Engine</h3>
              </div>
              <button
                onClick={() => setIsModalOpen(false)}
                style={{
                  background: 'transparent',
                  border: 'none',
                  color: 'rgba(255, 255, 255, 0.6)',
                  cursor: 'pointer',
                }}
              >
                <X size={20} />
              </button>
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '0.75rem', marginBottom: '1rem' }}>
              <div style={{ background: 'rgba(255, 255, 255, 0.05)', padding: '0.75rem', borderRadius: '10px' }}>
                <div style={{ fontSize: '0.6875rem', color: 'rgba(255, 255, 255, 0.6)' }}>STATE</div>
                <div style={{ fontSize: '0.875rem', fontWeight: 700, color: getDotColor(), marginTop: '0.2rem' }}>
                  {status.state}
                </div>
              </div>

              <div style={{ background: 'rgba(255, 255, 255, 0.05)', padding: '0.75rem', borderRadius: '10px' }}>
                <div style={{ fontSize: '0.6875rem', color: 'rgba(255, 255, 255, 0.6)' }}>PING LATENCY</div>
                <div style={{ fontSize: '0.875rem', fontWeight: 700, color: '#38BDF8', marginTop: '0.2rem' }}>
                  {status.latencyMs} ms
                </div>
              </div>

              <div style={{ background: 'rgba(255, 255, 255, 0.05)', padding: '0.75rem', borderRadius: '10px' }}>
                <div style={{ fontSize: '0.6875rem', color: 'rgba(255, 255, 255, 0.6)' }}>ACTIVE LISTENERS</div>
                <div style={{ fontSize: '0.875rem', fontWeight: 700, color: '#ffffff', marginTop: '0.2rem' }}>
                  {status.activeListenersCount} components
                </div>
              </div>

              <div style={{ background: 'rgba(255, 255, 255, 0.05)', padding: '0.75rem', borderRadius: '10px' }}>
                <div style={{ fontSize: '0.6875rem', color: 'rgba(255, 255, 255, 0.6)' }}>EVENTS STREAMED</div>
                <div style={{ fontSize: '0.875rem', fontWeight: 700, color: '#A78BFA', marginTop: '0.2rem' }}>
                  {status.messagesReceivedTotal}
                </div>
              </div>
            </div>

            {/* Backend URL Configuration for Physical Device QA */}
            <form onSubmit={handleSaveCustomUrl} style={{ marginBottom: '1rem' }}>
              <label style={{ fontSize: '0.6875rem', color: 'rgba(255, 255, 255, 0.7)', display: 'block', marginBottom: '0.35rem' }}>
                Backend Stream Endpoint (LAN / WiFi / Remote)
              </label>
              <div style={{ display: 'flex', gap: '0.5rem' }}>
                <input
                  type="text"
                  value={customBackendUrl}
                  onChange={(e) => setCustomBackendUrl(e.target.value)}
                  placeholder="http://192.168.1.50:5000"
                  style={{
                    flex: 1,
                    background: 'rgba(0, 0, 0, 0.4)',
                    border: '1px solid rgba(255, 255, 255, 0.15)',
                    borderRadius: '8px',
                    padding: '0.45rem 0.75rem',
                    color: '#ffffff',
                    fontSize: '0.75rem',
                  }}
                />
                <button
                  type="submit"
                  style={{
                    background: isSavedUrl ? '#10B981' : 'var(--aarizo-gold, #E5B842)',
                    color: '#1F1B1A',
                    border: 'none',
                    borderRadius: '8px',
                    padding: '0.45rem 0.85rem',
                    fontSize: '0.75rem',
                    fontWeight: 700,
                    cursor: 'pointer',
                  }}
                >
                  {isSavedUrl ? 'Saved!' : 'Apply'}
                </button>
              </div>
            </form>

            <div style={{ display: 'flex', gap: '0.5rem' }}>
              <button
                type="button"
                onClick={() => {
                  realtimeService.forceReconnect();
                }}
                style={{
                  flex: 1,
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  gap: '0.4rem',
                  background: 'rgba(255, 255, 255, 0.1)',
                  border: '1px solid rgba(255, 255, 255, 0.2)',
                  color: '#ffffff',
                  padding: '0.55rem',
                  borderRadius: '8px',
                  fontSize: '0.75rem',
                  fontWeight: 700,
                  cursor: 'pointer',
                }}
              >
                <RefreshCw size={14} /> Force Reconnect & Replay
              </button>
              <button
                type="button"
                onClick={() => setIsModalOpen(false)}
                style={{
                  background: 'rgba(255, 255, 255, 0.05)',
                  border: '1px solid rgba(255, 255, 255, 0.1)',
                  color: 'rgba(255, 255, 255, 0.8)',
                  padding: '0.55rem 1rem',
                  borderRadius: '8px',
                  fontSize: '0.75rem',
                  fontWeight: 600,
                  cursor: 'pointer',
                }}
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
};

/**
 * Floating Real-Time Alert Toast Container
 * Appears dynamically when events occur across network
 */
export const RealtimeToastContainer: React.FC = () => {
  const [alerts, setAlerts] = useState<RealtimeAlertItem[]>([]);
  const navigate = useNavigate();

  useEffect(() => {
    const unsub = realtimeService.subscribeToAlerts((alert) => {
      setAlerts((prev) => [alert, ...prev.slice(0, 2)]);

      // Auto dismiss after 5 seconds
      setTimeout(() => {
        setAlerts((current) => current.filter((item) => item.id !== alert.id));
      }, 5000);
    });

    return () => unsub();
  }, []);

  if (alerts.length === 0) return null;

  return (
    <div
      style={{
        position: 'fixed',
        top: 'calc(env(safe-area-inset-top, 0px) + 72px)',
        left: '50%',
        transform: 'translateX(-50%)',
        zIndex: 9999,
        display: 'flex',
        flexDirection: 'column',
        gap: '0.5rem',
        width: '92%',
        maxWidth: 420,
        pointerEvents: 'none',
      }}
    >
      {alerts.map((alert) => {
        const isEmergency = alert.urgency === 'emergency';
        const isAlert = alert.urgency === 'alert';

        return (
          <div
            key={alert.id}
            style={{
              pointerEvents: 'auto',
              background: isEmergency ? '#7F1D1D' : isAlert ? '#1E293B' : '#14532D',
              border: `1px solid ${isEmergency ? '#EF4444' : isAlert ? '#38BDF8' : '#22C55E'}`,
              boxShadow: '0 10px 25px -5px rgba(0, 0, 0, 0.5)',
              borderRadius: '12px',
              padding: '0.75rem 1rem',
              color: '#ffffff',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'space-between',
              gap: '0.75rem',
              animation: 'slideDown 0.3s ease-out',
            }}
          >
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', flex: 1, minWidth: 0 }}>
              <div
                style={{
                  width: 32,
                  height: 32,
                  borderRadius: '8px',
                  background: 'rgba(255, 255, 255, 0.15)',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  flexShrink: 0,
                }}
              >
                {isEmergency ? (
                  <ShieldAlert size={18} style={{ color: '#F87171' }} />
                ) : isAlert ? (
                  <Activity size={18} style={{ color: '#38BDF8' }} />
                ) : (
                  <CheckCircle2 size={18} style={{ color: '#4ADE80' }} />
                )}
              </div>

              <div style={{ flex: 1, minWidth: 0 }}>
                <div
                  style={{
                    fontSize: '0.8125rem',
                    fontWeight: 700,
                    whiteSpace: 'nowrap',
                    overflow: 'hidden',
                    textOverflow: 'ellipsis',
                  }}
                >
                  {alert.title}
                </div>
                <div
                  style={{
                    fontSize: '0.6875rem',
                    color: 'rgba(255, 255, 255, 0.75)',
                    whiteSpace: 'nowrap',
                    overflow: 'hidden',
                    textOverflow: 'ellipsis',
                  }}
                >
                  {alert.description}
                </div>
              </div>
            </div>

            <div style={{ display: 'flex', alignItems: 'center', gap: '0.4rem', flexShrink: 0 }}>
              {alert.actionPath && (
                <button
                  onClick={() => {
                    navigate(alert.actionPath!);
                    setAlerts((current) => current.filter((item) => item.id !== alert.id));
                  }}
                  style={{
                    background: 'rgba(255, 255, 255, 0.2)',
                    border: 'none',
                    borderRadius: '6px',
                    padding: '0.25rem 0.5rem',
                    color: '#ffffff',
                    fontSize: '0.6875rem',
                    fontWeight: 700,
                    cursor: 'pointer',
                    display: 'flex',
                    alignItems: 'center',
                    gap: '0.2rem',
                  }}
                >
                  View <ExternalLink size={10} />
                </button>
              )}
              <button
                onClick={() => setAlerts((current) => current.filter((item) => item.id !== alert.id))}
                style={{
                  background: 'transparent',
                  border: 'none',
                  color: 'rgba(255, 255, 255, 0.6)',
                  cursor: 'pointer',
                  padding: '0.2rem',
                }}
              >
                <X size={14} />
              </button>
            </div>
          </div>
        );
      })}
    </div>
  );
};

