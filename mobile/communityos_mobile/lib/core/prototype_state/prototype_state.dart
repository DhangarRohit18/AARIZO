import '../models/models.dart';
import '../repositories/repositories.dart';

/// Centralized Cross-Role Shared Prototype State Layer for CommunityOS Mobile.
///
/// Architectured to provide shared in-memory state across Resident ↔ Guard Flutter surfaces
/// during an active session without backend persistence or external services.
class PrototypeState {
  // Shared Domain Pass State
  static List<GatePassModel> get allPasses => GatePassRepository.getPasses();
  static List<GatePassModel> get activePasses => GatePassRepository.getActivePasses();
  static List<GatePassModel> get insideVisitors => GatePassRepository.getInsideVisitors();
  static List<GatePassModel> get pendingApprovals => GatePassRepository.getPendingApprovals();

  // Shared Movement Activity State
  static List<GateActivityModel> get gateActivities => GateActivityRepository.getActivities();

  // Shared Emergency Alert State
  static List<EmergencyAlertModel> get emergencyAlerts => EmergencyAlertRepository.getAlerts();

  // Shared Notification State
  static List<ResidentNotificationModel> get notifications => NotificationRepository.getNotifications();
  static int get unreadNotificationsCount => NotificationRepository.getUnreadCount();

  // Shared Society & Guard Context
  static SocietyModel get society => SocietyRepository.currentSociety;
  static String get guardOfficerName => GuardRepository.officerName;
  static String get gateName => GuardRepository.gateName;

  /// Helper to verify a visitor passcode across roles
  static GatePassModel? findPassByCode(String code) {
    return GatePassRepository.findByPasscode(code);
  }

  /// Action: Resident creates pass -> Shared state updated -> Guard sees in Expected Visitors
  static void createResidentPass(GatePassModel pass) {
    GatePassRepository.addGatePass(pass);
  }

  /// Action: Guard approves pass -> Shared status 'approved' -> Resident view reflects status
  static bool approvePassByGuard(String passId) {
    return GatePassRepository.approvePass(passId);
  }

  /// Action: Guard checks in visitor -> Shared status 'checked_in' -> Resident view reflects status
  static bool checkInVisitorByGuard(String passId) {
    return GatePassRepository.checkInPass(passId);
  }

  /// Action: Guard checks out visitor -> Shared status 'checked_out' -> Resident history updated
  static bool checkOutVisitorByGuard(String passId) {
    return GatePassRepository.checkOutPass(passId);
  }

  /// Action: Resident triggers Panic SOS -> Shared emergency alert created -> Guard Alerts screen displays alert
  static void triggerResidentSOS(EmergencyAlertModel alert) {
    EmergencyAlertRepository.triggerSOS(alert);
  }

  /// Action: Guard acknowledges SOS -> Shared alert acknowledged -> Resident notified
  static bool acknowledgeSOSByGuard(String alertId) {
    return EmergencyAlertRepository.acknowledgeAlert(alertId, GuardRepository.officerName);
  }
}
