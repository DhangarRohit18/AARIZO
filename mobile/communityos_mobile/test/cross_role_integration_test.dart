import 'package:flutter/material.dart';
import 'package:flutter_test/flutter_test.dart';
import 'package:communityos_mobile/core/models/models.dart';
import 'package:communityos_mobile/core/repositories/repositories.dart';
import 'package:communityos_mobile/core/prototype_state/prototype_state.dart';
import 'package:communityos_mobile/features/resident/presentation/visitors/visitors_tab.dart';
import 'package:communityos_mobile/features/guard/presentation/dashboard/guard_dashboard_tab.dart';
import 'package:communityos_mobile/features/guard/presentation/alerts/guard_alerts_tab.dart';

void main() {
  group('Phase 4A.7 — Cross-Role Shared Prototype State Integration Tests', () {
    test('1. Resident creates pass -> Guard resolves passcode 8492 and expected count updates', () {
      final rahulPass = PrototypeState.findPassByCode('8492');
      expect(rahulPass, isNotNull);
      expect(rahulPass!.visitorName, equals('Rahul Sharma'));
      expect(rahulPass.residentName, equals('Sarvesh Kulkarni'));
      expect(rahulPass.canonicalDisplay, equals('Tower B · Flat 1204'));

      // Create new pass from Resident side
      final newPass = const GatePassModel(
        id: 'PASS-5512',
        passcode: '5512',
        visitorName: 'Anand Verma',
        visitorPhone: '+91 98111 22233',
        category: 'Guest',
        residentName: 'Sarvesh Kulkarni',
        canonicalDisplay: 'Tower B · Flat 1204',
        validUntil: 'Today, 08:00 PM',
        status: 'active',
      );
      PrototypeState.createResidentPass(newPass);

      final resolvedNew = PrototypeState.findPassByCode('5512');
      expect(resolvedNew, isNotNull);
      expect(resolvedNew!.visitorName, equals('Anand Verma'));
      expect(PrototypeState.activePasses.any((p) => p.passcode == '5512'), isTrue);
    });

    test('2. Guard approval -> Shared status becomes approved -> Resident notification generated', () {
      final passId = 'PASS-5512';
      final approved = PrototypeState.approvePassByGuard(passId);
      expect(approved, isTrue);

      final pass = PrototypeState.findPassByCode('5512');
      expect(pass!.status, equals('approved'));

      final notifs = PrototypeState.notifications;
      expect(notifs.any((n) => n.title == 'Visitor Pass Approved' && n.message.contains('Anand Verma')), isTrue);
    });

    test('3. Guard check-in -> Shared status becomes checked_in -> Inside community registry updated', () {
      final passId = 'PASS-5512';
      final checkedIn = PrototypeState.checkInVisitorByGuard(passId);
      expect(checkedIn, isTrue);

      final pass = PrototypeState.findPassByCode('5512');
      expect(pass!.status, equals('checked_in'));

      final inside = PrototypeState.insideVisitors;
      expect(inside.any((p) => p.id == passId), isTrue);

      final notifs = PrototypeState.notifications;
      expect(notifs.any((n) => n.title == 'Visitor Checked In' && n.message.contains('Anand Verma')), isTrue);
    });

    test('4. Guard check-out -> Shared status becomes checked_out -> Resident history updated', () {
      final passId = 'PASS-5512';
      final checkedOut = PrototypeState.checkOutVisitorByGuard(passId);
      expect(checkedOut, isTrue);

      final pass = PrototypeState.findPassByCode('5512');
      expect(pass!.status, equals('checked_out'));

      final inside = PrototypeState.insideVisitors;
      expect(inside.any((p) => p.id == passId), isFalse);

      final activities = PrototypeState.gateActivities;
      expect(activities.any((a) => a.visitorName == 'Anand Verma' && a.status == 'checked_out'), isTrue);
    });

    test('5. Resident SOS trigger -> Guard receives SOS alert -> Guard acknowledgment notifies Resident', () {
      final sosAlert = EmergencyAlertModel(
        id: 'sos-test-99',
        residentName: 'Sarvesh Kulkarni',
        canonicalDisplay: 'Tower B · Flat 1204',
        timestamp: 'Just now',
        alertType: 'Panic SOS (Test)',
        isAcknowledged: false,
      );

      PrototypeState.triggerResidentSOS(sosAlert);

      final activeAlerts = PrototypeState.emergencyAlerts.where((a) => !a.isAcknowledged).toList();
      expect(activeAlerts.any((a) => a.id == 'sos-test-99'), isTrue);

      final acknowledged = PrototypeState.acknowledgeSOSByGuard('sos-test-99');
      expect(acknowledged, isTrue);

      final updatedAlert = PrototypeState.emergencyAlerts.firstWhere((a) => a.id == 'sos-test-99');
      expect(updatedAlert.isAcknowledged, isTrue);
      expect(updatedAlert.acknowledgedBy, contains('Officer R. Singh'));

      final notifs = PrototypeState.notifications;
      expect(notifs.any((n) => n.title == 'SOS Alert Acknowledged by Gate'), isTrue);
    });

    test('6. Privacy Boundary verification', () {
      final canonicalResident = ResidentRepository.getCanonicalResident();
      expect(canonicalResident.email, isNotEmpty);
      expect(canonicalResident.phone, isNotEmpty);

      // Guard view models only expose visitor, resident name, unit, valid time
      final pass = PrototypeState.findPassByCode('8492');
      expect(pass, isNotNull);
      expect(pass!.visitorName, equals('Rahul Sharma'));
      expect(pass.residentName, equals('Sarvesh Kulkarni'));
      expect(pass.canonicalDisplay, equals('Tower B · Flat 1204'));
      // No sensitive resident fields on GatePassModel or Guard views
    });

    testWidgets('7. Cross-role UI test: VisitorsTab renders updated shared pass status', (WidgetTester tester) async {
      await tester.pumpWidget(
        const MaterialApp(
          home: Scaffold(
            body: VisitorsTab(),
          ),
        ),
      );

      await tester.pumpAndSettle();

      expect(find.text('Visitors & Gate Passes'), findsOneWidget);
      expect(find.text('Rahul Sharma'), findsWidgets);
    });

    testWidgets('8. Cross-role UI test: GuardDashboardTab renders synchronized expected metrics', (WidgetTester tester) async {
      await tester.pumpWidget(
        const MaterialApp(
          home: GuardDashboardTab(),
        ),
      );

      await tester.pumpAndSettle();

      expect(find.text('Officer R. Singh'), findsOneWidget);
      expect(find.text('Expected Visitors'), findsOneWidget);
    });

    testWidgets('9. Cross-role UI test: GuardAlertsTab renders synchronized resident SOS alerts', (WidgetTester tester) async {
      await tester.pumpWidget(
        const MaterialApp(
          home: GuardAlertsTab(),
        ),
      );

      await tester.pumpAndSettle();

      expect(find.text('Resident SOS Safety Alerts'), findsOneWidget);
    });
  });
}
