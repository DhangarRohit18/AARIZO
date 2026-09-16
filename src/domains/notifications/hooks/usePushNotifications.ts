import { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';

/**
 * usePushNotifications — Initializes Capacitor push notifications.
 *
 * On Android/iOS (after `npx cap sync`):
 *   - Requests permission
 *   - Registers device token (send to your backend)
 *   - Handles deep-link routing from notification tap
 *
 * In browser:
 *   - Falls back gracefully, no errors
 */
export function usePushNotifications() {
  const navigate = useNavigate();

  useEffect(() => {
    let cleanup: (() => void) | undefined;

    const init = async () => {
      try {
        const { PushNotifications } = await import('@capacitor/push-notifications');

        // Request permission
        const permResult = await PushNotifications.requestPermissions();
        if (permResult.receive !== 'granted') return;

        // Register with APNs / FCM
        await PushNotifications.register();

        // Handle token registration
        const tokenListener = await PushNotifications.addListener(
          'registration',
          (token) => {
            // In production: send token.value to your backend
            console.debug('[AARIZO Push] Device token:', token.value);
          }
        );

        // Handle notification tap (foreground)
        const receivedListener = await PushNotifications.addListener(
          'pushNotificationReceived',
          (notification) => {
            console.debug('[AARIZO Push] Received:', notification.title);
          }
        );

        // Handle notification action (tap from tray) → deep link
        const actionListener = await PushNotifications.addListener(
          'pushNotificationActionPerformed',
          (action) => {
            const data = action.notification.data as Record<string, string> | undefined;
            if (!data?.screen) return;

            // Map notification screen to route
            const SCREEN_ROUTES: Record<string, string> = {
              visitor_arrival: '/resident/visitors',
              visitor_approval: '/resident/visitors',
              parcel_arrived: '/resident/visitors',
              payment_due: '/resident/billing',
              complaint_update: '/resident/requests',
              maintenance_update: '/resident/maintenance',
              emergency_alert: '/resident/emergency',
              worker_entry: '/resident/domestic-help',
              child_pickup: '/resident/child-safety',
              amenity_booking: '/resident/amenities',
              // Security routes
              security_visitor: '/security',
              security_parcel: '/security/delivery-intelligence',
              security_emergency: '/security/emergency-command',
              // Admin routes
              admin_approval: '/admin/residents',
              admin_complaint: '/admin/requests',
              admin_sla: '/admin/intelligence',
            };

            const route = SCREEN_ROUTES[data.screen];
            if (route) navigate(route);
          }
        );

        cleanup = async () => {
          await tokenListener.remove();
          await receivedListener.remove();
          await actionListener.remove();
        };
      } catch {
        // Running in browser — push notifications not available, silently skip
      }
    };

    init();

    return () => {
      cleanup?.();
    };
  }, [navigate]);
}
