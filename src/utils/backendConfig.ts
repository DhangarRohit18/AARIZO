/**
 * AARIZO CommunityOS - Dynamic Backend URL Resolver
 * Resolves API & Real-time SSE stream endpoints across Web (Local/Prod) and Native Android (Capacitor)
 */

export const getBackendBaseUrl = (): string => {
  // 1. Explicit Vite Environment variable (highest priority)
  const envUrl = (import.meta as any).env?.VITE_BACKEND_URL;
  if (envUrl && typeof envUrl === 'string' && envUrl.trim() !== '') {
    return envUrl.replace(/\/+$/, '');
  }

  if (typeof window !== 'undefined') {
    // 2. User-configured override in localStorage for field/QA device testing
    try {
      const customOverride = localStorage.getItem('aarizo_backend_url');
      if (customOverride && customOverride.trim() !== '') {
        return customOverride.trim().replace(/\/+$/, '');
      }
    } catch {}

    // 3. Native Capacitor Android/iOS Environment
    if ((window as any).Capacitor?.isNativePlatform?.()) {
      // Android WebView connects to host machine via 10.0.2.2 in emulator or standard loopback
      return 'http://10.0.2.2:5000';
    }

    // 4. Local Vite Dev Server
    if (window.location.port === '5173' || window.location.port === '5174') {
      return 'http://localhost:5000';
    }

    // 5. Deployed Web Browser
    if (window.location.origin && window.location.origin !== 'null') {
      return window.location.origin;
    }
  }

  return 'http://localhost:5000';
};

