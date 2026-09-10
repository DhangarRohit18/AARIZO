// Canonical Domain Models for CommunityOS Mobile

class SocietyModel {
  final String id;
  final String name;
  final String address;
  final int totalUnits;
  final int totalBlocks;

  const SocietyModel({
    required this.id,
    required this.name,
    required this.address,
    required this.totalUnits,
    required this.totalBlocks,
  });
}

class ResidentModel {
  final String id;
  final String name;
  final String phone;
  final String email;
  final String flatNumber;
  final String blockWing;
  final String canonicalDisplay;
  final String type; // Owner | Tenant
  final String status; // Active | Pending Verification | Rejected
  final int vehiclesCount;
  final int familyCount;

  const ResidentModel({
    required this.id,
    required this.name,
    required this.phone,
    required this.email,
    required this.flatNumber,
    required this.blockWing,
    required this.canonicalDisplay,
    required this.type,
    required this.status,
    required this.vehiclesCount,
    required this.familyCount,
  });
}

class GatePassModel {
  final String id;
  final String passcode;
  final String visitorName;
  final String visitorPhone;
  final String category; // Guest | Delivery | Cab | Service Staff
  final String residentName;
  final String canonicalDisplay;
  final String validUntil;
  final String status; // active | at_gate | approval_required | checked_in | checked_out | expired | cancelled
  final String? qrCodeData;
  final String? expectedDate;
  final String? expectedTimeSlot;
  final String? notes;
  final String? companyName;
  final String? vehicleNumber;
  final String? createdAt;

  const GatePassModel({
    required this.id,
    required this.passcode,
    required this.visitorName,
    required this.visitorPhone,
    required this.category,
    required this.residentName,
    required this.canonicalDisplay,
    required this.validUntil,
    required this.status,
    this.qrCodeData,
    this.expectedDate,
    this.expectedTimeSlot,
    this.notes,
    this.companyName,
    this.vehicleNumber,
    this.createdAt,
  });

  GatePassModel copyWith({
    String? id,
    String? passcode,
    String? visitorName,
    String? visitorPhone,
    String? category,
    String? residentName,
    String? canonicalDisplay,
    String? validUntil,
    String? status,
    String? qrCodeData,
    String? expectedDate,
    String? expectedTimeSlot,
    String? notes,
    String? companyName,
    String? vehicleNumber,
    String? createdAt,
  }) {
    return GatePassModel(
      id: id ?? this.id,
      passcode: passcode ?? this.passcode,
      visitorName: visitorName ?? this.visitorName,
      visitorPhone: visitorPhone ?? this.visitorPhone,
      category: category ?? this.category,
      residentName: residentName ?? this.residentName,
      canonicalDisplay: canonicalDisplay ?? this.canonicalDisplay,
      validUntil: validUntil ?? this.validUntil,
      status: status ?? this.status,
      qrCodeData: qrCodeData ?? this.qrCodeData,
      expectedDate: expectedDate ?? this.expectedDate,
      expectedTimeSlot: expectedTimeSlot ?? this.expectedTimeSlot,
      notes: notes ?? this.notes,
      companyName: companyName ?? this.companyName,
      vehicleNumber: vehicleNumber ?? this.vehicleNumber,
      createdAt: createdAt ?? this.createdAt,
    );
  }
}

class GateActivityModel {
  final String id;
  final String passcode;
  final String visitorName;
  final String category;
  final String residentName;
  final String canonicalDisplay;
  final String entryTime;
  final String? exitTime;
  final String status; // checked_in | checked_out | cancelled | rejected
  final String? vehicleTag;
  final String? date;
  final String? gateOfficer;

  const GateActivityModel({
    required this.id,
    required this.passcode,
    required this.visitorName,
    required this.category,
    required this.residentName,
    required this.canonicalDisplay,
    required this.entryTime,
    this.exitTime,
    required this.status,
    this.vehicleTag,
    this.date,
    this.gateOfficer,
  });
}

class BillingItemBreakdown {
  final String title;
  final double amount;

  const BillingItemBreakdown({required this.title, required this.amount});
}

class BillingRecordModel {
  final String id;
  final String billNumber;
  final String accountReference;
  final String billingCycle;
  final String category;
  final String title;
  final String residentName;
  final String canonicalDisplay;
  final double totalAmount;
  final double amountPaid;
  final double outstandingAmount;
  final double penaltyAmount;
  final String dueDate;
  final String status; // DUE | OVERDUE | PAID
  final String? paidAt;
  final String? paymentMethod;
  final String? transactionId;
  final String description;
  final List<BillingItemBreakdown> items;

  const BillingRecordModel({
    required this.id,
    required this.billNumber,
    required this.accountReference,
    required this.billingCycle,
    required this.category,
    required this.title,
    required this.residentName,
    required this.canonicalDisplay,
    required this.totalAmount,
    required this.amountPaid,
    required this.outstandingAmount,
    this.penaltyAmount = 0.0,
    required this.dueDate,
    required this.status,
    this.paidAt,
    this.paymentMethod,
    this.transactionId,
    required this.description,
    this.items = const [],
  });

  BillingRecordModel copyWith({
    String? id,
    String? billNumber,
    String? accountReference,
    String? billingCycle,
    String? category,
    String? title,
    String? residentName,
    String? canonicalDisplay,
    double? totalAmount,
    double? amountPaid,
    double? outstandingAmount,
    double? penaltyAmount,
    String? dueDate,
    String? status,
    String? paidAt,
    String? paymentMethod,
    String? transactionId,
    String? description,
    List<BillingItemBreakdown>? items,
  }) {
    return BillingRecordModel(
      id: id ?? this.id,
      billNumber: billNumber ?? this.billNumber,
      accountReference: accountReference ?? this.accountReference,
      billingCycle: billingCycle ?? this.billingCycle,
      category: category ?? this.category,
      title: title ?? this.title,
      residentName: residentName ?? this.residentName,
      canonicalDisplay: canonicalDisplay ?? this.canonicalDisplay,
      totalAmount: totalAmount ?? this.totalAmount,
      amountPaid: amountPaid ?? this.amountPaid,
      outstandingAmount: outstandingAmount ?? this.outstandingAmount,
      penaltyAmount: penaltyAmount ?? this.penaltyAmount,
      dueDate: dueDate ?? this.dueDate,
      status: status ?? this.status,
      paidAt: paidAt ?? this.paidAt,
      paymentMethod: paymentMethod ?? this.paymentMethod,
      transactionId: transactionId ?? this.transactionId,
      description: description ?? this.description,
      items: items ?? this.items,
    );
  }
}

class NoticeItemModel {
  final String id;
  final String title;
  final String category;
  final String priority; // Normal | Important | Urgent
  final String targetAudience;
  final String content;
  final String summary;
  final String status; // Published | Draft
  final String publishedAt;
  final String authorName;
  final String authorRole;
  final String? effectiveDate;
  final String? locationArea;
  final int acknowledgmentCount;

  const NoticeItemModel({
    required this.id,
    required this.title,
    required this.category,
    required this.priority,
    required this.targetAudience,
    required this.content,
    required this.summary,
    required this.status,
    required this.publishedAt,
    required this.authorName,
    required this.authorRole,
    this.effectiveDate,
    this.locationArea,
    this.acknowledgmentCount = 0,
  });
}

class EventModel {
  final String id;
  final String title;
  final String category;
  final String date;
  final String time;
  final String location;
  final String organizer;
  final String description;
  final int attendeesCount;
  final String userRsvp; // going | maybe | none
  final String contactPerson;

  const EventModel({
    required this.id,
    required this.title,
    required this.category,
    required this.date,
    required this.time,
    required this.location,
    required this.organizer,
    required this.description,
    required this.attendeesCount,
    required this.userRsvp,
    required this.contactPerson,
  });

  EventModel copyWith({
    String? id,
    String? title,
    String? category,
    String? date,
    String? time,
    String? location,
    String? organizer,
    String? description,
    int? attendeesCount,
    String? userRsvp,
    String? contactPerson,
  }) {
    return EventModel(
      id: id ?? this.id,
      title: title ?? this.title,
      category: category ?? this.category,
      date: date ?? this.date,
      time: time ?? this.time,
      location: location ?? this.location,
      organizer: organizer ?? this.organizer,
      description: description ?? this.description,
      attendeesCount: attendeesCount ?? this.attendeesCount,
      userRsvp: userRsvp ?? this.userRsvp,
      contactPerson: contactPerson ?? this.contactPerson,
    );
  }
}

class PollOptionModel {
  final String id;
  final String text;
  final int votesCount;

  const PollOptionModel({
    required this.id,
    required this.text,
    required this.votesCount,
  });

  PollOptionModel copyWith({
    String? id,
    String? text,
    int? votesCount,
  }) {
    return PollOptionModel(
      id: id ?? this.id,
      text: text ?? this.text,
      votesCount: votesCount ?? this.votesCount,
    );
  }
}

class PollModel {
  final String id;
  final String question;
  final String category;
  final String createdDate;
  final String closingDate;
  final int totalVotes;
  final String? userVotedOptionId;
  final List<PollOptionModel> options;

  const PollModel({
    required this.id,
    required this.question,
    required this.category,
    required this.createdDate,
    required this.closingDate,
    required this.totalVotes,
    this.userVotedOptionId,
    required this.options,
  });

  PollModel copyWith({
    String? id,
    String? question,
    String? category,
    String? createdDate,
    String? closingDate,
    int? totalVotes,
    String? userVotedOptionId,
    List<PollOptionModel>? options,
  }) {
    return PollModel(
      id: id ?? this.id,
      question: question ?? this.question,
      category: category ?? this.category,
      createdDate: createdDate ?? this.createdDate,
      closingDate: closingDate ?? this.closingDate,
      totalVotes: totalVotes ?? this.totalVotes,
      userVotedOptionId: userVotedOptionId ?? this.userVotedOptionId,
      options: options ?? this.options,
    );
  }
}

class SupportUpdateModel {
  final String id;
  final String timestamp;
  final String authorName;
  final String authorRole;
  final String message;

  const SupportUpdateModel({
    required this.id,
    required this.timestamp,
    required this.authorName,
    required this.authorRole,
    required this.message,
  });
}

class SupportTicketModel {
  final String id;
  final String ticketNumber;
  final String category; // plumbing | electrical | maintenance | housekeeping | security | other
  final String subject;
  final String description;
  final String locationArea;
  final String status; // open | assigned | in_progress | resolved
  final String createdAt;
  final String updatedAt;
  final String priority; // Low | Medium | High
  final String? assignedStaffName;
  final String? assignedStaffRole;
  final List<SupportUpdateModel> updates;

  const SupportTicketModel({
    required this.id,
    required this.ticketNumber,
    required this.category,
    required this.subject,
    required this.description,
    required this.locationArea,
    required this.status,
    required this.createdAt,
    required this.updatedAt,
    this.priority = 'Medium',
    this.assignedStaffName,
    this.assignedStaffRole,
    this.updates = const [],
  });

  SupportTicketModel copyWith({
    String? id,
    String? ticketNumber,
    String? category,
    String? subject,
    String? description,
    String? locationArea,
    String? status,
    String? createdAt,
    String? updatedAt,
    String? priority,
    String? assignedStaffName,
    String? assignedStaffRole,
    List<SupportUpdateModel>? updates,
  }) {
    return SupportTicketModel(
      id: id ?? this.id,
      ticketNumber: ticketNumber ?? this.ticketNumber,
      category: category ?? this.category,
      subject: subject ?? this.subject,
      description: description ?? this.description,
      locationArea: locationArea ?? this.locationArea,
      status: status ?? this.status,
      createdAt: createdAt ?? this.createdAt,
      updatedAt: updatedAt ?? this.updatedAt,
      priority: priority ?? this.priority,
      assignedStaffName: assignedStaffName ?? this.assignedStaffName,
      assignedStaffRole: assignedStaffRole ?? this.assignedStaffRole,
      updates: updates ?? this.updates,
    );
  }
}

class ResidentNotificationModel {
  final String id;
  final String category; // visitor | maintenance | payment | announcement | safety
  final String title;
  final String message;
  final String timestamp;
  final bool isRead;
  final String? actionRoute;
  final String? actionLabel;

  const ResidentNotificationModel({
    required this.id,
    required this.category,
    required this.title,
    required this.message,
    required this.timestamp,
    required this.isRead,
    this.actionRoute,
    this.actionLabel,
  });

  ResidentNotificationModel copyWith({
    String? id,
    String? category,
    String? title,
    String? message,
    String? timestamp,
    bool? isRead,
    String? actionRoute,
    String? actionLabel,
  }) {
    return ResidentNotificationModel(
      id: id ?? this.id,
      category: category ?? this.category,
      title: title ?? this.title,
      message: message ?? this.message,
      timestamp: timestamp ?? this.timestamp,
      isRead: isRead ?? this.isRead,
      actionRoute: actionRoute ?? this.actionRoute,
      actionLabel: actionLabel ?? this.actionLabel,
    );
  }
}

class VehicleModel {
  final String tag;
  final String type; // Car | EV Scooter | Bike
  final String modelName;

  const VehicleModel({required this.tag, required this.type, required this.modelName});
}

class FamilyMemberModel {
  final String name;
  final String relation;
  final String phone;

  const FamilyMemberModel({required this.name, required this.relation, required this.phone});
}

class HouseholdStaffModel {
  final String name;
  final String role;
  final String passcode;

  const HouseholdStaffModel({required this.name, required this.role, required this.passcode});
}

class EmergencyAlertModel {
  final String id;
  final String residentName;
  final String canonicalDisplay;
  final String timestamp;
  final String alertType;
  final bool isAcknowledged;
  final String? acknowledgedAt;
  final String? acknowledgedBy;

  const EmergencyAlertModel({
    required this.id,
    required this.residentName,
    required this.canonicalDisplay,
    required this.timestamp,
    required this.alertType,
    required this.isAcknowledged,
    this.acknowledgedAt,
    this.acknowledgedBy,
  });
}

class SecretaryResidentRecordModel {
  final String id;
  final String name;
  final String flatNumber;
  final String blockWing;
  final String canonicalDisplay;
  final String type; // Owner | Tenant
  final String phone;
  final String email;
  final int vehiclesCount;
  final int familyCount;
  final String status; // Active | Pending Verification | Rejected
  final String submittedAt;
  final String? kycDocType;
  final String? approvalNote;
  final String? rejectionReason;

  const SecretaryResidentRecordModel({
    required this.id,
    required this.name,
    required this.flatNumber,
    required this.blockWing,
    required this.canonicalDisplay,
    required this.type,
    required this.phone,
    required this.email,
    required this.vehiclesCount,
    required this.familyCount,
    required this.status,
    required this.submittedAt,
    this.kycDocType,
    this.approvalNote,
    this.rejectionReason,
  });

  SecretaryResidentRecordModel copyWith({
    String? id,
    String? name,
    String? flatNumber,
    String? blockWing,
    String? canonicalDisplay,
    String? type,
    String? phone,
    String? email,
    int? vehiclesCount,
    int? familyCount,
    String? status,
    String? submittedAt,
    String? kycDocType,
    String? approvalNote,
    String? rejectionReason,
  }) {
    return SecretaryResidentRecordModel(
      id: id ?? this.id,
      name: name ?? this.name,
      flatNumber: flatNumber ?? this.flatNumber,
      blockWing: blockWing ?? this.blockWing,
      canonicalDisplay: canonicalDisplay ?? this.canonicalDisplay,
      type: type ?? this.type,
      phone: phone ?? this.phone,
      email: email ?? this.email,
      vehiclesCount: vehiclesCount ?? this.vehiclesCount,
      familyCount: familyCount ?? this.familyCount,
      status: status ?? this.status,
      submittedAt: submittedAt ?? this.submittedAt,
      kycDocType: kycDocType ?? this.kycDocType,
      approvalNote: approvalNote ?? this.approvalNote,
      rejectionReason: rejectionReason ?? this.rejectionReason,
    );
  }
}

class CommitteeMemberRecordModel {
  final String id;
  final String name;
  final String designation; // Secretary | Chairman | Treasurer | Joint Secretary
  final String flatNumber;
  final String blockWing;
  final String canonicalDisplay;
  final String phone;
  final String email;
  final String avatarUrl;
  final String termDuration;

  const CommitteeMemberRecordModel({
    required this.id,
    required this.name,
    required this.designation,
    required this.flatNumber,
    required this.blockWing,
    required this.canonicalDisplay,
    required this.phone,
    required this.email,
    required this.avatarUrl,
    required this.termDuration,
  });
}

class SecretaryNotificationItemModel {
  final String id;
  final String title;
  final String category; // Complaint | Amenity | Security | Maintenance
  final String description;
  final String timestamp;
  final bool isRead;
  final String priority; // high | normal

  const SecretaryNotificationItemModel({
    required this.id,
    required this.title,
    required this.category,
    required this.description,
    required this.timestamp,
    required this.isRead,
    required this.priority,
  });

  SecretaryNotificationItemModel copyWith({
    String? id,
    String? title,
    String? category,
    String? description,
    String? timestamp,
    bool? isRead,
    String? priority,
  }) {
    return SecretaryNotificationItemModel(
      id: id ?? this.id,
      title: title ?? this.title,
      category: category ?? this.category,
      description: description ?? this.description,
      timestamp: timestamp ?? this.timestamp,
      isRead: isRead ?? this.isRead,
      priority: priority ?? this.priority,
    );
  }
}
