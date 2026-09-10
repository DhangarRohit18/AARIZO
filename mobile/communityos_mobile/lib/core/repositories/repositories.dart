import '../models/models.dart';

/// Modular Repositories for Shared Local Prototype State

class SocietyRepository {
  static const SocietyModel currentSociety = SocietyModel(
    id: 'soc-01',
    name: 'Green Valley Society',
    address: 'Plot 42, Sector 18, Kharghar, Navi Mumbai',
    totalUnits: 128,
    totalBlocks: 4,
  );
}

class ResidentRepository {
  static final List<ResidentModel> _residents = [
    const ResidentModel(
      id: 'res-1',
      name: 'Sarvesh Kulkarni',
      phone: '+91 98765 43210',
      email: 'sarvesh.kulkarni@example.com',
      flatNumber: '1204',
      blockWing: 'Block B',
      canonicalDisplay: 'Tower B · Flat 1204',
      type: 'Owner',
      status: 'Active',
      vehiclesCount: 2,
      familyCount: 4,
    ),
    const ResidentModel(
      id: 'res-2',
      name: 'Mayuri Udar',
      phone: '+91 98200 12345',
      email: 'mayuri.udar@greenvalley.org',
      flatNumber: '101',
      blockWing: 'Block A',
      canonicalDisplay: 'Block A · Flat 101',
      type: 'Owner',
      status: 'Active',
      vehiclesCount: 1,
      familyCount: 3,
    ),
    const ResidentModel(
      id: 'res-3',
      name: 'Rohan Mehta',
      phone: '+91 91234 56780',
      email: 'rohan.mehta@example.com',
      flatNumber: '203',
      blockWing: 'Block C',
      canonicalDisplay: 'Block C · Flat 203',
      type: 'Tenant',
      status: 'Pending Verification',
      vehiclesCount: 1,
      familyCount: 1,
    ),
  ];

  static List<ResidentModel> getAllResidents() => List.unmodifiable(_residents);

  static ResidentModel getCanonicalResident() => _residents.first;
}

class GatePassRepository {
  static final List<GatePassModel> _passes = [
    const GatePassModel(
      id: 'PASS-8492',
      passcode: '8492',
      visitorName: 'Rahul Sharma',
      visitorPhone: '+91 98765 43210',
      category: 'Guest',
      residentName: 'Sarvesh Kulkarni',
      canonicalDisplay: 'Tower B · Flat 1204',
      validUntil: 'Today, 11:59 PM',
      status: 'active',
      qrCodeData: 'COMMUNITYOS_PASS_8492_RAHUL',
      expectedDate: 'Today (10 Sep 2026)',
      expectedTimeSlot: '06:00 PM – 09:00 PM',
      notes: 'Family dinner visit',
      createdAt: 'Today, 02:15 PM',
    ),
    const GatePassModel(
      id: 'PASS-4921',
      passcode: '4921',
      visitorName: 'Express Delivery Agent',
      visitorPhone: '+91 98200 99887',
      category: 'Delivery',
      residentName: 'Sarvesh Kulkarni',
      canonicalDisplay: 'Tower B · Flat 1204',
      validUntil: 'Today, 03:30 PM',
      status: 'at_gate',
      qrCodeData: 'COMMUNITYOS_PASS_4921_DELIVERY',
      expectedDate: 'Today (10 Sep 2026)',
      expectedTimeSlot: 'Just now',
      companyName: 'Express Parcel Ltd',
      notes: 'Package at North Gate Intercom',
      createdAt: 'Today, 02:30 PM',
    ),
    const GatePassModel(
      id: 'PASS-1029',
      passcode: '1029',
      visitorName: 'Ramesh Carpenter',
      visitorPhone: '+91 91234 56789',
      category: 'Service Staff',
      residentName: 'Sarvesh Kulkarni',
      canonicalDisplay: 'Tower B · Flat 1204',
      validUntil: '11 Sep, 02:00 PM',
      status: 'active',
      qrCodeData: 'COMMUNITYOS_PASS_1029_RAMESH',
      expectedDate: 'Tomorrow (11 Sep 2026)',
      expectedTimeSlot: '11:00 AM – 01:00 PM',
      companyName: 'Carpentry Services',
      notes: 'Kitchen cabinet repair',
      createdAt: 'Yesterday',
    ),
  ];

  static List<GatePassModel> getPasses() => List.unmodifiable(_passes);

  static List<GatePassModel> getActivePasses() {
    return _passes.where((p) => p.status == 'active' || p.status == 'at_gate' || p.status == 'approval_required' || p.status == 'approved').toList();
  }

  static List<GatePassModel> getInsideVisitors() {
    return _passes.where((p) => p.status == 'checked_in').toList();
  }

  static List<GatePassModel> getPendingApprovals() {
    return _passes.where((p) => p.status == 'at_gate' || p.status == 'approval_required').toList();
  }

  static GatePassModel? findByPasscode(String code) {
    try {
      return _passes.firstWhere((p) => p.passcode.trim() == code.trim());
    } catch (_) {
      return null;
    }
  }

  static void addGatePass(GatePassModel pass) {
    _passes.insert(0, pass);
  }

  static bool approvePass(String passId) {
    final index = _passes.indexWhere((p) => p.id == passId);
    if (index != -1) {
      final pass = _passes[index];
      _passes[index] = pass.copyWith(status: 'approved');
      NotificationRepository.addNotification(ResidentNotificationModel(
        id: 'notif-${DateTime.now().millisecondsSinceEpoch}',
        category: 'visitor',
        title: 'Visitor Pass Approved',
        message: 'Security Officer R. Singh approved entry for ${pass.visitorName} at Gate #1.',
        timestamp: 'Just now',
        isRead: false,
        actionRoute: 'visitors',
        actionLabel: 'View Visitor',
      ));
      return true;
    }
    return false;
  }

  static bool rejectPass(String passId, String reason) {
    final index = _passes.indexWhere((p) => p.id == passId);
    if (index != -1) {
      final pass = _passes[index];
      _passes[index] = pass.copyWith(status: 'rejected');
      GateActivityRepository.recordCheckIn(GateActivityModel(
        id: 'ACT-${DateTime.now().millisecondsSinceEpoch.toString().substring(7)}',
        passcode: pass.passcode,
        visitorName: pass.visitorName,
        category: pass.category,
        residentName: pass.residentName,
        canonicalDisplay: pass.canonicalDisplay,
        entryTime: 'N/A',
        exitTime: 'Rejected ($reason)',
        status: 'rejected',
        date: 'Today',
        gateOfficer: 'Officer R. Singh (Gate #1)',
      ));
      NotificationRepository.addNotification(ResidentNotificationModel(
        id: 'notif-${DateTime.now().millisecondsSinceEpoch}',
        category: 'visitor',
        title: 'Visitor Entry Declined',
        message: 'Gate #1 reported entry declined for ${pass.visitorName} ($reason).',
        timestamp: 'Just now',
        isRead: false,
        actionRoute: 'visitors',
        actionLabel: 'View Details',
      ));
      return true;
    }
    return false;
  }

  static bool checkInPass(String passId) {
    final index = _passes.indexWhere((p) => p.id == passId);
    if (index != -1) {
      final pass = _passes[index];
      _passes[index] = pass.copyWith(status: 'checked_in');
      GateActivityRepository.recordCheckIn(GateActivityModel(
        id: 'ACT-${DateTime.now().millisecondsSinceEpoch.toString().substring(7)}',
        passcode: pass.passcode,
        visitorName: pass.visitorName,
        category: pass.category,
        residentName: pass.residentName,
        canonicalDisplay: pass.canonicalDisplay,
        entryTime: 'Just now',
        exitTime: 'Inside Community',
        status: 'checked_in',
        date: 'Today',
        gateOfficer: 'Officer R. Singh (Gate #1)',
      ));
      NotificationRepository.addNotification(ResidentNotificationModel(
        id: 'notif-${DateTime.now().millisecondsSinceEpoch}',
        category: 'visitor',
        title: 'Visitor Checked In',
        message: '${pass.visitorName} checked in at Gate #1 (Inside Community).',
        timestamp: 'Just now',
        isRead: false,
        actionRoute: 'visitors',
        actionLabel: 'View Status',
      ));
      return true;
    }
    return false;
  }

  static bool checkOutPass(String passId) {
    final index = _passes.indexWhere((p) => p.id == passId);
    if (index != -1) {
      final pass = _passes[index];
      _passes[index] = pass.copyWith(status: 'checked_out');
      GateActivityRepository.recordCheckIn(GateActivityModel(
        id: 'ACT-${DateTime.now().millisecondsSinceEpoch.toString().substring(7)}',
        passcode: pass.passcode,
        visitorName: pass.visitorName,
        category: pass.category,
        residentName: pass.residentName,
        canonicalDisplay: pass.canonicalDisplay,
        entryTime: 'Earlier',
        exitTime: 'Just now',
        status: 'checked_out',
        date: 'Today',
        gateOfficer: 'Officer R. Singh (Gate #1)',
      ));
      NotificationRepository.addNotification(ResidentNotificationModel(
        id: 'notif-${DateTime.now().millisecondsSinceEpoch}',
        category: 'visitor',
        title: 'Visitor Checked Out',
        message: '${pass.visitorName} checked out at Gate #1.',
        timestamp: 'Just now',
        isRead: false,
        actionRoute: 'visitors',
        actionLabel: 'View History',
      ));
      return true;
    }
    return false;
  }

  static bool cancelPass(String passId) {
    final index = _passes.indexWhere((p) => p.id == passId);
    if (index != -1) {
      _passes[index] = _passes[index].copyWith(status: 'cancelled');
      // Also add to gate activity log as cancelled
      GateActivityRepository.recordCheckIn(GateActivityModel(
        id: 'ACT-${DateTime.now().millisecondsSinceEpoch.toString().substring(7)}',
        passcode: _passes[index].passcode,
        visitorName: _passes[index].visitorName,
        category: _passes[index].category,
        residentName: _passes[index].residentName,
        canonicalDisplay: _passes[index].canonicalDisplay,
        entryTime: 'N/A',
        exitTime: 'Cancelled',
        status: 'cancelled',
        date: 'Today',
        gateOfficer: 'Resident Cancelled',
      ));
      return true;
    }
    return false;
  }

  static void updateStatus(String passId, String newStatus) {
    final index = _passes.indexWhere((p) => p.id == passId);
    if (index != -1) {
      _passes[index] = _passes[index].copyWith(status: newStatus);
    }
  }
}

extension StringSlice on String {
  String slice(int start) => substring(length + start);
}

class GateActivityRepository {
  static final List<GateActivityModel> _activities = [
    const GateActivityModel(
      id: 'ACT-101',
      passcode: '9102',
      visitorName: 'Zomato Food Delivery',
      category: 'Delivery',
      residentName: 'Sarvesh Kulkarni',
      canonicalDisplay: 'Tower B · Flat 1204',
      entryTime: '10:45 AM',
      exitTime: '10:58 AM',
      status: 'checked_out',
      vehicleTag: 'MH-12-AB-4092',
      date: '10 Sep 2026',
      gateOfficer: 'Officer R. Singh (Main Gate)',
    ),
    const GateActivityModel(
      id: 'ACT-102',
      passcode: '3301',
      visitorName: 'Uber Cab (MH 02 EQ 8821)',
      category: 'Cab',
      residentName: 'Sarvesh Kulkarni',
      canonicalDisplay: 'Tower B · Flat 1204',
      entryTime: '09:10 AM',
      exitTime: '09:15 AM',
      status: 'checked_out',
      vehicleTag: 'MH-02-EQ-8821',
      date: '09 Sep 2026',
      gateOfficer: 'Officer K. Yadav (Main Gate)',
    ),
    const GateActivityModel(
      id: 'ACT-103',
      passcode: '1200',
      visitorName: 'Amazon Courier Agent',
      category: 'Delivery',
      residentName: 'Sarvesh Kulkarni',
      canonicalDisplay: 'Tower B · Flat 1204',
      entryTime: '03:45 PM',
      exitTime: '03:52 PM',
      status: 'checked_out',
      vehicleTag: 'MH-04-AX-1029',
      date: '08 Sep 2026',
      gateOfficer: 'Officer R. Singh (Main Gate)',
    ),
    const GateActivityModel(
      id: 'ACT-104',
      passcode: '0092',
      visitorName: 'Unverified Walk-in',
      category: 'Guest',
      residentName: 'Sarvesh Kulkarni',
      canonicalDisplay: 'Tower B · Flat 1204',
      entryTime: '05:00 PM',
      exitTime: 'N/A',
      status: 'rejected',
      date: '07 Sep 2026',
      gateOfficer: 'Officer R. Singh (Main Gate)',
    ),
  ];

  static List<GateActivityModel> getActivities() => List.unmodifiable(_activities);

  static void recordCheckIn(GateActivityModel activity) {
    _activities.insert(0, activity);
  }
}

class BillingRepository {
  static final List<BillingRecordModel> _billingRecords = [
    const BillingRecordModel(
      id: 'PAY-101',
      billNumber: 'BILL-2026-09-1204',
      accountReference: 'GVS-1204-MNT-SEP26',
      billingCycle: 'Sep 2026',
      category: 'maintenance',
      title: 'September 2026 Maintenance Dues',
      residentName: 'Sarvesh Kulkarni',
      canonicalDisplay: 'Tower B · Flat 1204',
      totalAmount: 4250,
      amountPaid: 0,
      outstandingAmount: 4250,
      penaltyAmount: 0,
      dueDate: '2026-09-15',
      status: 'DUE',
      description:
        'Monthly society maintenance fee covering 24/7 gate security, common area housekeeping, lift AMC, water pump operations, and garden landscaping.',
      items: [
        BillingItemBreakdown(title: 'Base Maintenance Charge', amount: 3000),
        BillingItemBreakdown(title: 'Security & Guard Operations', amount: 800),
        BillingItemBreakdown(title: 'Water Pumping & Housekeeping', amount: 450),
      ],
    ),
    const BillingRecordModel(
      id: 'PAY-102',
      billNumber: 'BILL-2026-Q3-1204',
      accountReference: 'GVS-1204-PRK-Q3',
      billingCycle: 'Q3 2026 (Jul - Sep)',
      category: 'parking',
      title: 'Q3 Parking & EV Charge',
      residentName: 'Sarvesh Kulkarni',
      canonicalDisplay: 'Tower B · Flat 1204',
      totalAmount: 1200,
      amountPaid: 0,
      outstandingAmount: 1200,
      penaltyAmount: 0,
      dueDate: '2026-09-01',
      status: 'OVERDUE',
      description:
        'Quarterly basement parking slot B-12 maintenance fee and dedicated EV socket access.',
      items: [
        BillingItemBreakdown(title: 'Basement Slot B-12 Fee', amount: 900),
        BillingItemBreakdown(title: 'Dedicated EV Socket Access', amount: 300),
      ],
    ),
    const BillingRecordModel(
      id: 'PAY-099',
      billNumber: 'BILL-2026-08-1204',
      accountReference: 'GVS-1204-MNT-AUG26',
      billingCycle: 'Aug 2026',
      category: 'maintenance',
      title: 'August 2026 Maintenance Dues',
      residentName: 'Sarvesh Kulkarni',
      canonicalDisplay: 'Tower B · Flat 1204',
      totalAmount: 4250,
      amountPaid: 4250,
      outstandingAmount: 0,
      penaltyAmount: 0,
      dueDate: '2026-08-15',
      status: 'PAID',
      paidAt: '12 Aug 2026, 04:15 PM',
      paymentMethod: 'UPI / GPay',
      transactionId: 'TXN-89320149',
      description:
        'Monthly society maintenance fee covering security, common area maintenance, and lift operations.',
      items: [
        BillingItemBreakdown(title: 'Base Maintenance Charge', amount: 3000),
        BillingItemBreakdown(title: 'Security & Guard Operations', amount: 800),
        BillingItemBreakdown(title: 'Water Pumping & Housekeeping', amount: 450),
      ],
    ),
    const BillingRecordModel(
      id: 'PAY-098',
      billNumber: 'BILL-2026-08-AMN',
      accountReference: 'GVS-1204-AMN-TC01',
      billingCycle: '04 Aug 2026',
      category: 'amenity',
      title: 'Clubhouse Tennis Court Slot Booking',
      residentName: 'Sarvesh Kulkarni',
      canonicalDisplay: 'Tower B · Flat 1204',
      totalAmount: 350,
      amountPaid: 350,
      outstandingAmount: 0,
      dueDate: '2026-08-04',
      status: 'PAID',
      paidAt: '04 Aug 2026, 10:30 AM',
      paymentMethod: 'Credit Card',
      transactionId: 'TXN-78219033',
      description: 'Hourly booking fee for Tennis Court #1 lighting and equipment usage.',
      items: [
        BillingItemBreakdown(title: 'Tennis Court #1 Lighting & Fee', amount: 350),
      ],
    ),
  ];

  static List<BillingRecordModel> getRecords() => List.unmodifiable(_billingRecords);

  static List<BillingRecordModel> getUnpaidRecords() {
    return _billingRecords.where((b) => b.status == 'DUE' || b.status == 'OVERDUE').toList();
  }

  static double getTotalOutstanding() {
    double total = 0;
    for (final b in getUnpaidRecords()) {
      total += b.outstandingAmount + b.penaltyAmount;
    }
    return total;
  }

  static bool simulatePayment(String billId, String method, String txnId) {
    final index = _billingRecords.indexWhere((b) => b.id == billId);
    if (index != -1) {
      _billingRecords[index] = _billingRecords[index].copyWith(
        status: 'PAID',
        amountPaid: _billingRecords[index].totalAmount + _billingRecords[index].penaltyAmount,
        outstandingAmount: 0,
        paidAt: 'Just now',
        paymentMethod: method,
        transactionId: txnId,
      );
      return true;
    }
    return false;
  }

  static void addBill(BillingRecordModel bill) {
    _billingRecords.insert(0, bill);
  }
}

class NoticeRepository {
  static final List<NoticeItemModel> _notices = [
    const NoticeItemModel(
      id: 'ANN-201',
      title: 'Emergency Water Tank Service & Maintenance',
      category: 'utility',
      priority: 'Urgent',
      targetAudience: 'All Blocks',
      summary:
        'Water supply to all towers will be suspended from 09:00 AM to 04:00 PM for bi-annual tank cleaning.',
      content:
        'Dear Residents,\n\nPlease be informed that the bi-annual cleaning, flushing, and chlorination of all overhead water tanks and the main underground storage sump is scheduled for Tuesday, 15 September 2026.\n\nWater supply will remain completely shut off between 09:00 AM and 04:00 PM across all towers.\n\nKey instructions for residents:\n1. Store adequate drinking and domestic water in advance.\n2. Ensure all household taps are closed tightly.\n3. Upon restoration, run taps for 1-2 minutes to flush initial discolored water.',
      status: 'Published',
      publishedAt: '08 Sep 2026',
      authorName: 'Mayuri Udar',
      authorRole: 'Society Secretary',
      effectiveDate: '15 Sep 2026, 09:00 AM - 04:00 PM',
      locationArea: 'All Towers (Tower A, B & C)',
    ),
    const NoticeItemModel(
      id: 'ANN-202',
      title: 'EV Charging Station Installation & Slot Booking',
      category: 'rwa',
      priority: 'Important',
      targetAudience: 'EV Owners',
      summary:
        'Green Valley Society has commissioned 6 new 22kW Fast EV Chargers in Basement B2.',
      content:
        'Dear Residents,\n\nWe are pleased to announce the commissioning of 6 new 22kW AC Type-2 Fast EV Charging Stations in Basement B2 (near Pillar B2-14).\n\nResidents wishing to register their EV for dedicated slot access or monthly billing integration can submit a Helpdesk ticket.',
      status: 'Published',
      publishedAt: '04 Sep 2026',
      authorName: 'Mayuri Udar',
      authorRole: 'Society Secretary',
      effectiveDate: 'Immediate Access',
      locationArea: 'Basement B2 (Pillar B2-14)',
    ),
    const NoticeItemModel(
      id: 'ANN-204',
      title: 'Annual General Body Meeting (AGM 2026) Date Announced',
      category: 'general',
      priority: 'Normal',
      targetAudience: 'All Residents',
      summary:
        'The Annual General Body Meeting for Green Valley Society will be held on Sunday, September 20th at 10:30 AM in the Main Clubhouse.',
      content:
        'The Annual General Body Meeting for Green Valley Society will be held on Sunday, September 20th at 10:30 AM in the Main Clubhouse.\n\nAgenda items include financial audit review, sinking fund allocation, security vendor renewal, and sports complex lighting upgrade approval.',
      status: 'Published',
      publishedAt: '05 Sep 2026',
      authorName: 'Mayuri Udar',
      authorRole: 'Society Secretary',
      effectiveDate: '20 Sep 2026, 10:30 AM',
      locationArea: 'Main Clubhouse Amphitheatre',
    ),
  ];

  static List<NoticeItemModel> getNotices() => List.unmodifiable(_notices);

  static void addNotice(NoticeItemModel notice) {
    _notices.insert(0, notice);
  }
}

class SecretaryRepository {
  static String secretaryName = 'Mayuri Udar';
  static String secretaryRole = 'Society Secretary';
  static String societyName = 'Green Valley Society';

  static final List<SecretaryResidentRecordModel> _residents = [
    const SecretaryResidentRecordModel(
      id: 'res-1',
      name: 'Sarvesh Kulkarni',
      flatNumber: '1204',
      blockWing: 'Block B',
      canonicalDisplay: 'Tower B · Flat 1204',
      type: 'Owner',
      phone: '+91 98765 43210',
      email: 'sarvesh.kulkarni@example.com',
      vehiclesCount: 2,
      familyCount: 4,
      status: 'Active',
      submittedAt: '2026-01-15',
      kycDocType: 'Sale Deed & Aadhaar Verified',
      approvalNote: 'Verified flat ownership document.',
    ),
    const SecretaryResidentRecordModel(
      id: 'res-2',
      name: 'Mayuri Udar',
      flatNumber: '101',
      blockWing: 'Block A',
      canonicalDisplay: 'Block A · Flat 101',
      type: 'Owner',
      phone: '+91 98200 12345',
      email: 'mayuri.udar@greenvalley.org',
      vehiclesCount: 1,
      familyCount: 3,
      status: 'Active',
      submittedAt: '2025-11-10',
      kycDocType: 'Registry Copy Verified',
      approvalNote: 'Secretary & Managing Committee Member.',
    ),
    const SecretaryResidentRecordModel(
      id: 'res-3',
      name: 'Rajesh & Sunita Verma',
      flatNumber: '304',
      blockWing: 'Block A',
      canonicalDisplay: 'Block A · Flat 304',
      type: 'Owner',
      phone: '+91 98111 22334',
      email: 'rajesh.verma@example.com',
      vehiclesCount: 2,
      familyCount: 5,
      status: 'Active',
      submittedAt: '2026-02-01',
      kycDocType: 'Property Deed Verified',
      approvalNote: 'Chairman of Society Committee.',
    ),
    const SecretaryResidentRecordModel(
      id: 'res-4',
      name: 'Ananya Sharma',
      flatNumber: '402',
      blockWing: 'Block B',
      canonicalDisplay: 'Tower B · Flat 402',
      type: 'Tenant',
      phone: '+91 97654 32109',
      email: 'ananya.sharma@example.com',
      vehiclesCount: 1,
      familyCount: 2,
      status: 'Active',
      submittedAt: '2026-04-12',
      kycDocType: 'Registered Rent Agreement',
      approvalNote: 'Owner consent verified.',
    ),
    const SecretaryResidentRecordModel(
      id: 'res-5',
      name: 'Priya & Vikram Nair',
      flatNumber: '701',
      blockWing: 'Block C',
      canonicalDisplay: 'Block C · Flat 701',
      type: 'Owner',
      phone: '+91 99887 76655',
      email: 'vikram.nair@example.com',
      vehiclesCount: 3,
      familyCount: 4,
      status: 'Active',
      submittedAt: '2026-03-20',
      kycDocType: 'Share Certificate Verified',
      approvalNote: 'Treasurer of Society Committee.',
    ),
    const SecretaryResidentRecordModel(
      id: 'res-6',
      name: 'Rohan Mehta',
      flatNumber: '203',
      blockWing: 'Block C',
      canonicalDisplay: 'Block C · Flat 203',
      type: 'Tenant',
      phone: '+91 91234 56780',
      email: 'rohan.mehta@example.com',
      vehiclesCount: 1,
      familyCount: 1,
      status: 'Pending Verification',
      submittedAt: '2026-09-08',
      kycDocType: 'Notarized Rent Agreement & Passport Copy',
      approvalNote: 'Awaiting Secretary KYC document audit.',
    ),
  ];

  static final List<NoticeItemModel> _secretaryNotices = [
    const NoticeItemModel(
      id: 'notif-101',
      title: 'Annual Society General Body Meeting (AGM) Scheduled',
      category: 'general',
      priority: 'Important',
      targetAudience: 'All Blocks',
      summary: 'Annual General Body Meeting for Green Valley Society on Sunday, Sep 20th at 10:30 AM.',
      content:
          'The Annual General Body Meeting for Green Valley Society will be held on Sunday, September 20th at 10:30 AM in the Main Clubhouse. Agenda items include annual financial audit, security contract renewal, and solar panel installation proposal.',
      status: 'Published',
      publishedAt: '05 Sep 2026',
      authorName: 'Mayuri Udar',
      authorRole: 'Society Secretary',
    ),
    const NoticeItemModel(
      id: 'notif-102',
      title: 'Overhead Tank Cleaning & Water Supply Suspension',
      category: 'maintenance',
      priority: 'Urgent',
      targetAudience: 'All Blocks',
      summary: 'Quarterly cleaning of overhead water tanks scheduled for Tuesday, Sep 15th.',
      content:
          'Quarterly cleaning of main overhead water tanks is scheduled for Tuesday, September 15th between 10:00 AM and 04:00 PM. Water supply will be suspended during this window.',
      status: 'Published',
      publishedAt: '08 Sep 2026',
      authorName: 'Mayuri Udar',
      authorRole: 'Society Secretary',
    ),
    const NoticeItemModel(
      id: 'notif-103',
      title: 'Ganesh Chaturthi Celebration & Cultural Committee Signup',
      category: 'event',
      priority: 'Normal',
      targetAudience: 'All Blocks',
      summary: 'Cultural committee invites volunteers and donations for Ganesh Utsav.',
      content:
          'Cultural committee invites volunteers and donations for the upcoming 5-day Ganesh Utsav in the central courtyard. Registration open at society office.',
      status: 'Published',
      publishedAt: '01 Sep 2026',
      authorName: 'Rajesh Verma',
      authorRole: 'Chairman',
    ),
  ];

  static final List<CommitteeMemberRecordModel> _committee = [
    const CommitteeMemberRecordModel(
      id: 'cm-1',
      name: 'Mayuri Udar',
      designation: 'Secretary',
      flatNumber: '101',
      blockWing: 'Block A',
      canonicalDisplay: 'Block A · Flat 101',
      phone: '+91 98200 12345',
      email: 'secretary@greenvalleysociety.org',
      avatarUrl:
          'https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?auto=format&fit=crop&w=250&q=80',
      termDuration: '2025 - 2027 (Term 2)',
    ),
    const CommitteeMemberRecordModel(
      id: 'cm-2',
      name: 'Rajesh Verma',
      designation: 'Chairman',
      flatNumber: '304',
      blockWing: 'Block A',
      canonicalDisplay: 'Block A · Flat 304',
      phone: '+91 98111 22334',
      email: 'chairman@greenvalleysociety.org',
      avatarUrl:
          'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?auto=format&fit=crop&w=250&q=80',
      termDuration: '2025 - 2027',
    ),
    const CommitteeMemberRecordModel(
      id: 'cm-3',
      name: 'Vikram Nair',
      designation: 'Treasurer',
      flatNumber: '701',
      blockWing: 'Block C',
      canonicalDisplay: 'Block C · Flat 701',
      phone: '+91 99887 76655',
      email: 'treasurer@greenvalleysociety.org',
      avatarUrl:
          'https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?auto=format&fit=crop&w=250&q=80',
      termDuration: '2025 - 2027',
    ),
    const CommitteeMemberRecordModel(
      id: 'cm-4',
      name: 'Ananya Sharma',
      designation: 'Joint Secretary',
      flatNumber: '402',
      blockWing: 'Block B',
      canonicalDisplay: 'Tower B · Flat 402',
      phone: '+91 97654 32109',
      email: 'jointsec@greenvalleysociety.org',
      avatarUrl:
          'https://images.unsplash.com/photo-1580489944761-15a19d654956?auto=format&fit=crop&w=250&q=80',
      termDuration: '2025 - 2027',
    ),
  ];

  static final List<SecretaryNotificationItemModel> _notifications = [
    const SecretaryNotificationItemModel(
      id: 'notif-1',
      title: 'New Plumbing Helpdesk Ticket (#TICK-8042)',
      category: 'Complaint',
      description: 'Flat B-1204 (Sarvesh Kulkarni) submitted a complaint regarding main pipe leakage in bathroom.',
      timestamp: '15 mins ago',
      isRead: false,
      priority: 'high',
    ),
    const SecretaryNotificationItemModel(
      id: 'notif-2',
      title: 'Clubhouse Hall Amenity Booking Request',
      category: 'Amenity',
      description: 'Flat A-304 requested Clubhouse Hall booking for Birthday Party on 20th Sept.',
      timestamp: '1 hour ago',
      isRead: false,
      priority: 'normal',
    ),
    const SecretaryNotificationItemModel(
      id: 'notif-3',
      title: 'Overnight Gate Pass Alert',
      category: 'Security',
      description: 'Main Gate reported guest vehicle MH-12-AB-4092 overstaying visitor slot.',
      timestamp: '3 hours ago',
      isRead: true,
      priority: 'normal',
    ),
    const SecretaryNotificationItemModel(
      id: 'notif-4',
      title: 'Monthly Maintenance Invoice Dispatched',
      category: 'Maintenance',
      description: 'September 2026 Maintenance invoices dispatched to 128 society flats.',
      timestamp: 'Yesterday',
      isRead: true,
      priority: 'normal',
    ),
  ];

  static List<SecretaryResidentRecordModel> getResidents() => List.unmodifiable(_residents);
  static List<NoticeItemModel> getNotices() => List.unmodifiable(_secretaryNotices);
  static List<CommitteeMemberRecordModel> getCommittee() => List.unmodifiable(_committee);
  static List<SecretaryNotificationItemModel> getNotifications() => List.unmodifiable(_notifications);

  static void approveResident(String id, String? note) {
    final idx = _residents.indexWhere((r) => r.id == id);
    if (idx != -1) {
      _residents[idx] = _residents[idx].copyWith(
        status: 'Active',
        approvalNote: note ?? 'Approved by Secretary Mayuri Udar.',
      );
    }
  }

  static void rejectResident(String id, String reason) {
    final idx = _residents.indexWhere((r) => r.id == id);
    if (idx != -1) {
      _residents[idx] = _residents[idx].copyWith(
        status: 'Rejected',
        rejectionReason: reason,
      );
    }
  }

  static void publishNotice(NoticeItemModel notice) {
    _secretaryNotices.insert(0, notice);
    // Sync into resident NoticeRepository
    NoticeRepository.addNotice(notice);
  }

  static void saveDraftNotice(NoticeItemModel draft) {
    _secretaryNotices.insert(0, draft);
    // Draft notice is NOT pushed to Resident NoticeRepository!
  }

  static void issueBill(BillingRecordModel bill) {
    // Push bill to Resident BillingRepository
    BillingRepository.addBill(bill);
  }

  static void markNotificationRead(String id) {
    final idx = _notifications.indexWhere((n) => n.id == id);
    if (idx != -1) {
      _notifications[idx] = _notifications[idx].copyWith(isRead: true);
    }
  }
}

class EventRepository {
  static final List<EventModel> _events = [
    const EventModel(
      id: 'EVT-301',
      title: 'Ganesh Chaturthi Community Utsav 2026',
      category: 'Cultural',
      date: '17 Sep 2026',
      time: '06:00 PM – 09:30 PM',
      location: 'Main Clubhouse Lawn',
      organizer: 'Cultural Committee',
      description:
        'Annual community cultural evening featuring traditional music, children dance performances, prasad distribution, and evening aarti.',
      attendeesCount: 48,
      userRsvp: 'going',
      contactPerson: 'Mrs. Anjali Deshmukh (Flat B-802)',
    ),
    const EventModel(
      id: 'EVT-302',
      title: 'Monsoon Table Tennis Tournament (Doubles & Singles)',
      category: 'Sports',
      date: '12 Sep 2026',
      time: '10:00 AM – 06:00 PM',
      location: 'Sports Complex (1st Floor)',
      organizer: 'Sports Club Committee',
      description:
        'Inter-tower table tennis championship open for Men, Women & Juniors. Trophies and gift vouchers for winners.',
      attendeesCount: 24,
      userRsvp: 'none',
      contactPerson: 'Mr. Vikram Mehta (Flat A-401)',
    ),
    const EventModel(
      id: 'EVT-303',
      title: 'Waste Segregation & Home Composting Workshop',
      category: 'Eco Workshop',
      date: '18 Sep 2026',
      time: '11:00 AM – 12:30 PM',
      location: 'Community Hall B',
      organizer: 'Green Eco Club',
      description:
        'Learn wet waste home composting techniques, plastic reduction tips, and eco-friendly household living.',
      attendeesCount: 19,
      userRsvp: 'maybe',
      contactPerson: 'Dr. Sunita Rao (Flat C-1103)',
    ),
  ];

  static List<EventModel> getEvents() => List.unmodifiable(_events);

  static void updateRSVP(String eventId, String newRsvp) {
    final index = _events.indexWhere((e) => e.id == eventId);
    if (index != -1) {
      final oldRsvp = _events[index].userRsvp;
      int diff = 0;
      if (oldRsvp != 'going' && newRsvp == 'going') diff = 1;
      if (oldRsvp == 'going' && newRsvp != 'going') diff = -1;

      _events[index] = _events[index].copyWith(
        userRsvp: newRsvp,
        attendeesCount: (_events[index].attendeesCount + diff).clamp(0, 9999),
      );
    }
  }
}

class PollRepository {
  static final List<PollModel> _polls = [
    const PollModel(
      id: 'POL-401',
      question:
        'Proposed Installation of 100kW Solar Panels on Tower Rooftops to Reduce Common Electricity Dues',
      category: 'RWA Audit',
      createdDate: '25 Aug 2026',
      closingDate: '15 Sep 2026',
      totalVotes: 114,
      userVotedOptionId: 'opt-1',
      options: [
        PollOptionModel(
          id: 'opt-1',
          text: 'Approve Full 100kW Solar Installation (Est. 25% common bill reduction)',
          votesCount: 64,
        ),
        PollOptionModel(
          id: 'opt-2',
          text: 'Approve Phase 1 Trial (50kW capacity first)',
          votesCount: 38,
        ),
        PollOptionModel(
          id: 'opt-3',
          text: 'Reject / Require detailed technical audit before voting',
          votesCount: 12,
        ),
      ],
    ),
    const PollModel(
      id: 'POL-402',
      question:
        'Weekend Guest Vehicle Parking Policy & Hourly Surcharge Re-evaluation',
      category: 'Security',
      createdDate: '29 Aug 2026',
      closingDate: '20 Sep 2026',
      totalVotes: 115,
      userVotedOptionId: null,
      options: [
        PollOptionModel(
          id: 'opt-201',
          text: 'Keep current policy (2 Hours free, then ₹20/hr)',
          votesCount: 45,
        ),
        PollOptionModel(
          id: 'opt-202',
          text: 'Increase free allowance to 4 Hours for weekend visitors',
          votesCount: 52,
        ),
        PollOptionModel(
          id: 'opt-203',
          text: 'Flat ₹50 overnight fee per visitor vehicle',
          votesCount: 18,
        ),
      ],
    ),
  ];

  static List<PollModel> getPolls() => List.unmodifiable(_polls);

  static void submitVote(String pollId, String optionId) {
    final index = _polls.indexWhere((p) => p.id == pollId);
    if (index != -1 && _polls[index].userVotedOptionId == null) {
      final updatedOptions = _polls[index].options.map((opt) {
        if (opt.id == optionId) {
          return opt.copyWith(votesCount: opt.votesCount + 1);
        }
        return opt;
      }).toList();

      _polls[index] = _polls[index].copyWith(
        totalVotes: _polls[index].totalVotes + 1,
        userVotedOptionId: optionId,
        options: updatedOptions,
      );
    }
  }
}

class NotificationRepository {
  static final List<ResidentNotificationModel> _notifications = [
    const ResidentNotificationModel(
      id: 'notif-1',
      category: 'visitor',
      title: 'Food Delivery Agent at Gate',
      message: 'Security Officer R. Singh requested entry approval at Main Gate #1 for passcode 4921.',
      timestamp: '5 mins ago',
      isRead: false,
      actionRoute: 'visitors',
      actionLabel: 'Review Request',
    ),
    const ResidentNotificationModel(
      id: 'notif-2',
      category: 'maintenance',
      title: 'Helpdesk Ticket Updated',
      message: 'Ticket TK-4029 (AC Outlet) assigned to Technician Ramesh Kumar.',
      timestamp: '1 hour ago',
      isRead: false,
      actionRoute: 'support',
      actionLabel: 'View Ticket',
    ),
    const ResidentNotificationModel(
      id: 'notif-3',
      category: 'payment',
      title: 'September Maintenance Invoice Generated',
      message: 'Invoice #BILL-2026-09-1204 for ₹4,250 is due on 15 Sep 2026.',
      timestamp: 'Yesterday',
      isRead: true,
      actionRoute: 'payments',
      actionLabel: 'Pay Dues',
    ),
    const ResidentNotificationModel(
      id: 'notif-4',
      category: 'announcement',
      title: 'Water Tank Cleaning Notice',
      message: 'Water supply to Tower B will be suspended on 15 Sep between 09 AM and 04 PM.',
      timestamp: '2 days ago',
      isRead: true,
    ),
  ];

  static List<ResidentNotificationModel> getNotifications() => List.unmodifiable(_notifications);

  static void addNotification(ResidentNotificationModel notification) {
    _notifications.insert(0, notification);
  }

  static int getUnreadCount() => _notifications.where((n) => !n.isRead).length;

  static void markAsRead(String id) {
    final index = _notifications.indexWhere((n) => n.id == id);
    if (index != -1) {
      _notifications[index] = _notifications[index].copyWith(isRead: true);
    }
  }

  static void markAllAsRead() {
    for (int i = 0; i < _notifications.length; i++) {
      _notifications[i] = _notifications[i].copyWith(isRead: true);
    }
  }
}

class SupportRepository {
  static final List<SupportTicketModel> _tickets = [
    const SupportTicketModel(
      id: 'tk-4029',
      ticketNumber: 'TK-4029',
      category: 'electrical',
      subject: 'Master Bedroom AC Electrical Outlet Flashing',
      description: 'The 16A power socket in the master bedroom trips the ELCB whenever the AC compressor turns on.',
      locationArea: 'Master Bedroom (Flat 1204)',
      status: 'in_progress',
      createdAt: '05 Sep 2026, 11:30 AM',
      updatedAt: '05 Sep 2026, 02:15 PM',
      priority: 'High',
      assignedStaffName: 'Technician Ramesh Kumar',
      assignedStaffRole: 'Senior Electrician',
      updates: [
        SupportUpdateModel(
          id: 'up-1',
          timestamp: '05 Sep 2026, 11:30 AM',
          authorName: 'Sarvesh Kulkarni',
          authorRole: 'resident',
          message: 'Ticket created with priority inspection request.',
        ),
        SupportUpdateModel(
          id: 'up-2',
          timestamp: '05 Sep 2026, 02:15 PM',
          authorName: 'Estate Management',
          authorRole: 'manager',
          message: 'Assigned to Technician Ramesh. Inspection scheduled for tomorrow morning.',
        ),
      ],
    ),
    const SupportTicketModel(
      id: 'tk-3810',
      ticketNumber: 'TK-3810',
      category: 'plumbing',
      subject: 'Kitchen Sink Drain Leakage',
      description: 'Minor water seepage observed near the PVC trap underneath the kitchen sink counter.',
      locationArea: 'Kitchen (Flat 1204)',
      status: 'resolved',
      createdAt: '28 Aug 2026, 04:00 PM',
      updatedAt: '29 Aug 2026, 10:30 AM',
      priority: 'Medium',
      assignedStaffName: 'Plumber Suresh',
      assignedStaffRole: 'Facility Staff',
      updates: [
        SupportUpdateModel(
          id: 'up-10',
          timestamp: '28 Aug 2026, 04:00 PM',
          authorName: 'Sarvesh Kulkarni',
          authorRole: 'resident',
          message: 'Ticket raised for pipe washer replacement.',
        ),
        SupportUpdateModel(
          id: 'up-11',
          timestamp: '29 Aug 2026, 10:30 AM',
          authorName: 'Plumber Suresh',
          authorRole: 'staff',
          message: 'Replaced rubber gasket washer and tested flow. Leak resolved.',
        ),
      ],
    ),
  ];

  static List<SupportTicketModel> getTickets() => List.unmodifiable(_tickets);

  static void createTicket(SupportTicketModel ticket) {
    _tickets.insert(0, ticket);
  }
}

class ProfileRepository {
  static const List<VehicleModel> vehicles = [
    VehicleModel(tag: 'MH-12-SK-1204', type: 'Car', modelName: 'Tata Nexon EV (Basement B-12)'),
    VehicleModel(tag: 'MH-12-SK-8899', type: 'EV Scooter', modelName: 'Ather 450X (Basement B-12)'),
  ];

  static const List<FamilyMemberModel> familyMembers = [
    FamilyMemberModel(name: 'Sarvesh Kulkarni', relation: 'Primary Resident (Owner)', phone: '+91 98765 43210'),
    FamilyMemberModel(name: 'Radhika Kulkarni', relation: 'Spouse', phone: '+91 98765 11223'),
    FamilyMemberModel(name: 'Aniket Kulkarni', relation: 'Son', phone: '+91 98765 44556'),
  ];

  static const List<HouseholdStaffModel> householdStaff = [
    HouseholdStaffModel(name: 'Sunita Bai', role: 'Daily Housekeeping & Maid', passcode: 'PASS-••••'),
  ];
}

class SettingsRepository {
  static bool gateEntryAlerts = true;
  static bool paymentDuesReminders = true;
  static bool communityBroadcasts = true;
  static bool autoApproveFrequentVisitors = false;
  static bool isDarkMode = false;
}

class EmergencyAlertRepository {
  static final List<EmergencyAlertModel> _alerts = [
    const EmergencyAlertModel(
      id: 'sos-101',
      residentName: 'Sarvesh Kulkarni',
      canonicalDisplay: 'Tower B · Flat 1204',
      timestamp: '06 Sep 2026, 08:30 PM',
      alertType: 'Panic SOS (Simulated)',
      isAcknowledged: true,
      acknowledgedAt: '06 Sep 2026, 08:31 PM',
      acknowledgedBy: 'Officer R. Singh (Main Gate #1)',
    ),
  ];

  static List<EmergencyAlertModel> getAlerts() => List.unmodifiable(_alerts);

  static void triggerSOS(EmergencyAlertModel alert) {
    _alerts.insert(0, alert);
    NotificationRepository.addNotification(ResidentNotificationModel(
      id: 'notif-${DateTime.now().millisecondsSinceEpoch}',
      category: 'safety',
      title: 'Panic SOS Simulation Active',
      message: 'Panic SOS alert active for ${alert.canonicalDisplay}. Broadcast to Gate #1 Guard Terminal.',
      timestamp: 'Just now',
      isRead: false,
      actionRoute: 'safety',
      actionLabel: 'View Status',
    ));
  }

  static bool acknowledgeAlert(String alertId, String officerName) {
    final index = _alerts.indexWhere((a) => a.id == alertId);
    if (index != -1) {
      final current = _alerts[index];
      _alerts[index] = EmergencyAlertModel(
        id: current.id,
        residentName: current.residentName,
        canonicalDisplay: current.canonicalDisplay,
        timestamp: current.timestamp,
        alertType: current.alertType,
        isAcknowledged: true,
        acknowledgedAt: 'Just now',
        acknowledgedBy: '$officerName (Gate #1)',
      );
      NotificationRepository.addNotification(ResidentNotificationModel(
        id: 'notif-${DateTime.now().millisecondsSinceEpoch}',
        category: 'safety',
        title: 'SOS Alert Acknowledged by Gate',
        message: 'Officer R. Singh at Gate #1 acknowledged your Panic SOS alert.',
        timestamp: 'Just now',
        isRead: false,
        actionRoute: 'safety',
        actionLabel: 'View Status',
      ));
      return true;
    }
    return false;
  }
}

class GuardRepository {
  static String officerName = 'Officer R. Singh';
  static String gateName = 'Gate #1';
  static String societyName = 'Green Valley Society';
  static bool isGateOpen = true;

  static void toggleGateStatus() {
    isGateOpen = !isGateOpen;
  }
}
