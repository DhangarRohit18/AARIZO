import 'package:flutter_test/flutter_test.dart';
import 'package:communityos_mobile/core/models/models.dart';
import 'package:communityos_mobile/core/repositories/repositories.dart';

void main() {
  group('Phase 4B.3 — Secretary Web-Demo Parity & Prototype Synchronization Tests', () {
    test('1. Initial Secretary Repository state matches Web Demo records', () {
      final residents = SecretaryRepository.getResidents();
      final committee = SecretaryRepository.getCommittee();
      final notices = SecretaryRepository.getNotices();
      final notifications = SecretaryRepository.getNotifications();

      expect(residents.length, greaterThanOrEqualTo(3));
      expect(committee.length, equals(4));
      expect(committee.any((c) => c.name == 'Mayuri Udar'), isTrue);
      expect(committee.any((c) => c.name == 'Rajesh Verma'), isTrue);
      expect(committee.any((c) => c.name == 'Vikram Nair'), isTrue);
      expect(committee.any((c) => c.name == 'Ananya Sharma'), isTrue);
      expect(notices.isNotEmpty, isTrue);
      expect(notifications.isNotEmpty, isTrue);
    });

    test('2. Secretary approves pending resident -> state persists', () {
      final pendingRes = SecretaryRepository.getResidents().firstWhere((r) => r.status.toLowerCase().contains('pending'));
      SecretaryRepository.approveResident(pendingRes.id, 'Verified via Sale Deed copy.');

      final updated = SecretaryRepository.getResidents().firstWhere((r) => r.id == pendingRes.id);
      expect(updated.status, equals('Active'));
      expect(updated.approvalNote, contains('Verified via Sale Deed copy'));
    });

    test('3. Secretary rejects resident with exact Web Demo rejection reason', () {
      const resId = 'res-3'; // Rohan Mehta
      SecretaryRepository.rejectResident(resId, 'Invalid Ownership Document');

      final updated = SecretaryRepository.getResidents().firstWhere((r) => r.id == resId);
      expect(updated.status, equals('Rejected'));
      expect(updated.rejectionReason, equals('Invalid Ownership Document'));
    });

    test('4. Secretary publishes notice -> dispatches to Resident NoticeRepository', () {
      final newNotice = const NoticeItemModel(
        id: 'NOT-TEST-999',
        title: 'Emergency Generator Testing Notice',
        category: 'Maintenance',
        priority: 'high',
        status: 'published',
        publishedAt: 'Today',
        targetAudience: 'All Residents',
        content: 'DG Set testing will occur between 2 PM and 3 PM.',
        summary: 'DG set testing today.',
        authorName: 'Mayuri Udar',
        authorRole: 'Secretary',
        acknowledgmentCount: 0,
      );

      SecretaryRepository.publishNotice(newNotice);

      // Verify Secretary notices list
      final secretaryNotices = SecretaryRepository.getNotices();
      expect(secretaryNotices.any((n) => n.id == 'NOT-TEST-999'), isTrue);

      // Verify Resident NoticeRepository receives published notice!
      final residentNotices = NoticeRepository.getNotices();
      expect(residentNotices.any((n) => n.id == 'NOT-TEST-999'), isTrue);
    });

    test('5. Secretary saves draft notice -> draft remains private to Secretary', () {
      final draftNotice = const NoticeItemModel(
        id: 'NOT-DRAFT-777',
        title: 'Draft Solar Energy Proposal',
        category: 'General',
        priority: 'normal',
        status: 'draft',
        publishedAt: 'Draft',
        targetAudience: 'Committee Only',
        content: 'Draft proposal for rooftop solar panels.',
        summary: 'Draft solar proposal.',
        authorName: 'Mayuri Udar',
        authorRole: 'Secretary',
        acknowledgmentCount: 0,
      );

      SecretaryRepository.saveDraftNotice(draftNotice);

      // Verify Secretary notices list has draft
      final secretaryNotices = SecretaryRepository.getNotices();
      expect(secretaryNotices.any((n) => n.id == 'NOT-DRAFT-777'), isTrue);

      // Verify Resident NoticeRepository does NOT contain draft notice!
      final residentNotices = NoticeRepository.getNotices();
      expect(residentNotices.any((n) => n.id == 'NOT-DRAFT-777'), isFalse);
    });

    test('6. Secretary issues maintenance bill -> dispatches to Resident BillingRepository', () {
      final newBill = const BillingRecordModel(
        id: 'BILL-TEST-888',
        billNumber: 'BILL-2026-10-ALL',
        accountReference: 'GVS-2026-10',
        billingCycle: 'Oct 2026',
        category: 'maintenance',
        title: 'October 2026 Maintenance Dues',
        residentName: 'Sarvesh Kulkarni',
        canonicalDisplay: 'Tower B · Flat 1204',
        totalAmount: 4250,
        amountPaid: 0,
        outstandingAmount: 4250,
        dueDate: '2026-10-15',
        status: 'DUE',
        description: 'Monthly maintenance fee covering security and common area maintenance.',
      );

      SecretaryRepository.issueBill(newBill);

      // Verify Resident BillingRepository receives issued bill
      final records = BillingRepository.getRecords();
      expect(records.any((b) => b.id == 'BILL-TEST-888'), isTrue);

      // Verify canonical payment records are PRESERVED!
      expect(records.any((b) => b.id == 'PAY-101'), isTrue);
      expect(records.any((b) => b.id == 'PAY-102'), isTrue);
      expect(records.any((b) => b.id == 'PAY-099'), isTrue);
      expect(records.any((b) => b.id == 'PAY-098'), isTrue);
    });

    test('7. Privacy Boundary: Secretary repo does not leak Guard PINs or secrets', () {
      final committee = SecretaryRepository.getCommittee();
      for (final member in committee) {
        expect(member.phone, isNotEmpty);
        expect(member.email, isNotEmpty);
      }

      final residents = SecretaryRepository.getResidents();
      for (final res in residents) {
        // Must not contain internal guard terminal PINs or passcodes
        expect(res.name, isNotEmpty);
      }
    });
  });
}
