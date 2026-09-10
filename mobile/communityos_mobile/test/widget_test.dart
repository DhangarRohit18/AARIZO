import 'package:flutter/material.dart';
import 'package:flutter_test/flutter_test.dart';
import 'package:communityos_mobile/main.dart';
import 'package:communityos_mobile/features/auth/presentation/splash_screen.dart';
import 'package:communityos_mobile/features/resident/presentation/visitors/visitors_tab.dart';
import 'package:communityos_mobile/features/guard/presentation/guard_shell.dart';
import 'package:communityos_mobile/features/guard/presentation/verification/passcode_verification_screen.dart';
import 'package:communityos_mobile/features/guard/presentation/activity/guard_activity_tab.dart';
import 'package:communityos_mobile/features/guard/presentation/alerts/guard_alerts_tab.dart';
import 'package:communityos_mobile/core/repositories/repositories.dart';
import 'package:communityos_mobile/core/models/models.dart';

void main() {
  testWidgets('CommunityOS Mobile App smoke test', (WidgetTester tester) async {
    await tester.pumpWidget(const CommunityOSMobileApp());
    expect(find.byType(SplashScreen), findsOneWidget);
    await tester.pump(const Duration(seconds: 3));
  });

  testWidgets('VisitorsTab renders active passes and gate history', (WidgetTester tester) async {
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
    expect(find.text('8492'), findsWidgets);
    expect(find.text('Invite Visitor'), findsOneWidget);
  });

  test('GatePassRepository supports creation and cancellation', () {
    final initialActiveCount = GatePassRepository.getActivePasses().length;
    expect(initialActiveCount, greaterThanOrEqualTo(1));

    final rahulPass = GatePassRepository.findByPasscode('8492');
    expect(rahulPass, isNotNull);
    expect(rahulPass!.visitorName, equals('Rahul Sharma'));

    final cancelled = GatePassRepository.cancelPass('PASS-8492');
    expect(cancelled, isTrue);

    final updatedRahulPass = GatePassRepository.findByPasscode('8492');
    expect(updatedRahulPass!.status, equals('cancelled'));
  });

  test('Guard lifecycle: passcode verification, approve, check-in, inside, check-out', () {
    // Add a fresh demo pass for tests
    final demoPass = const GatePassModel(
      id: 'TEST-PASS-8492',
      passcode: '8492',
      visitorName: 'Rahul Sharma',
      visitorPhone: '+91 98765 43210',
      category: 'Guest',
      residentName: 'Sarvesh Kulkarni',
      canonicalDisplay: 'Tower B · Flat 1204',
      validUntil: 'Today',
      status: 'active',
    );
    GatePassRepository.addGatePass(demoPass);

    final resolved = GatePassRepository.findByPasscode('8492');
    expect(resolved, isNotNull);
    expect(resolved!.visitorName, equals('Rahul Sharma'));

    final invalid = GatePassRepository.findByPasscode('9999');
    expect(invalid, isNull);

    final approved = GatePassRepository.approvePass(resolved.id);
    expect(approved, isTrue);

    final checkedIn = GatePassRepository.checkInPass(resolved.id);
    expect(checkedIn, isTrue);

    final inside = GatePassRepository.getInsideVisitors();
    expect(inside.any((p) => p.id == resolved.id), isTrue);

    final checkedOut = GatePassRepository.checkOutPass(resolved.id);
    expect(checkedOut, isTrue);
  });

  test('EmergencyAlertRepository acknowledgment test', () {
    final alerts = EmergencyAlertRepository.getAlerts();
    expect(alerts, isNotEmpty);

    final acknowledged = EmergencyAlertRepository.acknowledgeAlert(alerts.first.id, 'Officer R. Singh');
    expect(acknowledged, isTrue);

    final updatedAlerts = EmergencyAlertRepository.getAlerts();
    expect(updatedAlerts.first.isAcknowledged, isTrue);
  });

  test('BillingRepository initial state and simulated payment', () {
    final initialOutstanding = BillingRepository.getTotalOutstanding();
    expect(initialOutstanding, equals(5450.0));

    final paid = BillingRepository.simulatePayment('PAY-101', 'UPI', 'TXN-99887766');
    expect(paid, isTrue);

    final updatedOutstanding = BillingRepository.getTotalOutstanding();
    expect(updatedOutstanding, equals(1200.0));
  });

  testWidgets('GuardShell renders terminal header and navigation', (WidgetTester tester) async {
    await tester.pumpWidget(
      const MaterialApp(
        home: GuardShell(),
      ),
    );

    await tester.pumpAndSettle();

    expect(find.text('COMMUNITYOS GUARD GATE TERMINAL'), findsOneWidget);
    expect(find.text('Officer R. Singh'), findsWidgets);
    expect(find.text('Dashboard'), findsOneWidget);
    expect(find.text('Verify Pass'), findsOneWidget);
  });

  testWidgets('PasscodeVerificationScreen renders keypad terminal', (WidgetTester tester) async {
    await tester.pumpWidget(
      const MaterialApp(
        home: PasscodeVerificationScreen(),
      ),
    );

    await tester.pumpAndSettle();

    expect(find.text('Gate #1 Verification Terminal'), findsOneWidget);
    expect(find.text('ENTER VISITOR PASSCODE'), findsOneWidget);
    expect(find.text('VERIFY PASSCODE NOW'), findsOneWidget);
  });

  testWidgets('GuardActivityTab renders movement feed', (WidgetTester tester) async {
    await tester.pumpWidget(
      const MaterialApp(
        home: GuardActivityTab(),
      ),
    );

    await tester.pumpAndSettle();

    expect(find.text('Gate Activity Movement Feed'), findsOneWidget);
  });

  testWidgets('GuardAlertsTab renders SOS safety dispatch', (WidgetTester tester) async {
    await tester.pumpWidget(
      const MaterialApp(
        home: GuardAlertsTab(),
      ),
    );

    await tester.pumpAndSettle();

    expect(find.text('Resident SOS Safety Alerts'), findsOneWidget);
  });
}
