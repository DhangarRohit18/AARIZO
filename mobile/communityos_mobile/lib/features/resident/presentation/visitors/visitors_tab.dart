import 'package:flutter/material.dart';
import 'package:flutter/services.dart';
import '../../../../core/models/models.dart';
import '../../../../core/repositories/repositories.dart';
import '../../../../core/theme/app_colors.dart';
import '../../../../core/theme/app_tokens.dart';
import '../../../../core/theme/app_typography.dart';
import 'create_pass_bottom_sheet.dart';
import 'pass_detail_modal.dart';

class VisitorsTab extends StatefulWidget {
  const VisitorsTab({super.key});

  @override
  State<VisitorsTab> createState() => _VisitorsTabState();
}

class _VisitorsTabState extends State<VisitorsTab> {
  List<GatePassModel> _activePasses = [];
  List<GateActivityModel> _historyLogs = [];
  String _historyFilter = 'ALL';

  @override
  void initState() {
    super.initState();
    _refreshVisitorData();
  }

  void _refreshVisitorData() {
    setState(() {
      _activePasses = GatePassRepository.getActivePasses();
      _historyLogs = GateActivityRepository.getActivities();
    });
  }

  List<GateActivityModel> get _filteredHistoryLogs {
    if (_historyFilter == 'ALL') return _historyLogs;
    if (_historyFilter == 'Checked Out') {
      return _historyLogs.where((log) => log.status == 'checked_out').toList();
    }
    if (_historyFilter == 'Cancelled') {
      return _historyLogs.where((log) => log.status == 'cancelled' || log.status == 'rejected').toList();
    }
    return _historyLogs;
  }

  Color _getCategoryColor(String category) {
    switch (category.toLowerCase()) {
      case 'guest':
        return AppColors.brandBlue;
      case 'delivery':
        return AppColors.emeraldSuccess;
      case 'cab':
        return AppColors.amberWarning;
      case 'service staff':
      case 'service':
        return AppColors.skyBlueInfo;
      default:
        return AppColors.primarySlate;
    }
  }

  IconData _getCategoryIcon(String category) {
    switch (category.toLowerCase()) {
      case 'guest':
        return Icons.people_rounded;
      case 'delivery':
        return Icons.local_shipping_rounded;
      case 'cab':
        return Icons.local_taxi_rounded;
      case 'service staff':
      case 'service':
        return Icons.construction_rounded;
      default:
        return Icons.person_rounded;
    }
  }

  Color _getStatusColor(String status) {
    switch (status.toLowerCase()) {
      case 'active':
        return AppColors.emeraldSuccess;
      case 'at_gate':
      case 'approval_required':
        return AppColors.amberWarning;
      case 'checked_in':
        return AppColors.skyBlueInfo;
      case 'checked_out':
      case 'cancelled':
      case 'rejected':
      case 'expired':
        return AppColors.secondarySlate;
      default:
        return AppColors.primarySlate;
    }
  }

  void _openCreatePassSheet() {
    HapticFeedback.lightImpact();
    CreatePassBottomSheet.show(
      context,
      onPassCreated: (newPass) {
        _refreshVisitorData();
      },
    );
  }

  void _openPassDetail(GatePassModel pass) {
    HapticFeedback.lightImpact();
    PassDetailModal.show(
      context,
      pass,
      onPassUpdated: _refreshVisitorData,
    );
  }

  @override
  Widget build(BuildContext context) {
    return SingleChildScrollView(
      padding: const EdgeInsets.all(AppSpacing.lg),
      child: Column(
        crossAxisAlignment: CrossAxisAlignment.start,
        children: [
          // Header Row
          Row(
            mainAxisAlignment: MainAxisAlignment.spaceBetween,
            crossAxisAlignment: CrossAxisAlignment.center,
            children: [
              Expanded(
                child: Column(
                  crossAxisAlignment: CrossAxisAlignment.start,
                  children: [
                    Text(
                      'Visitors & Gate Passes',
                      style: AppTypography.displayHeading.copyWith(fontSize: 20, color: AppColors.textPrimary),
                      overflow: TextOverflow.ellipsis,
                    ),
                    Text(
                      'Tower B · Flat 1204 • Green Valley Society',
                      style: AppTypography.caption.copyWith(color: AppColors.textMuted),
                      overflow: TextOverflow.ellipsis,
                    ),
                  ],
                ),
              ),
              const SizedBox(width: AppSpacing.sm),
              ElevatedButton.icon(
                onPressed: _openCreatePassSheet,
                icon: const Icon(Icons.add_rounded, size: 18),
                label: const Text('Invite Visitor'),
                style: ElevatedButton.styleFrom(
                  backgroundColor: AppColors.brandBlue,
                  foregroundColor: Colors.white,
                  padding: const EdgeInsets.symmetric(horizontal: AppSpacing.md, vertical: AppSpacing.sm),
                  shape: RoundedRectangleBorder(
                    borderRadius: BorderRadius.circular(AppRadius.md),
                  ),
                ),
              ),
            ],
          ),

          const SizedBox(height: AppSpacing.xl),

          // Section 1: Active Passes Header
          Row(
            mainAxisAlignment: MainAxisAlignment.spaceBetween,
            children: [
              Row(
                children: [
                  const Icon(Icons.verified_user_rounded, color: AppColors.brandBlue, size: 20),
                  const SizedBox(width: AppSpacing.xs),
                  Text('Active & Scheduled Passes', style: AppTypography.titleMedium.copyWith(color: AppColors.textPrimary)),
                ],
              ),
              Container(
                padding: const EdgeInsets.symmetric(horizontal: AppSpacing.sm, vertical: AppSpacing.xs),
                decoration: BoxDecoration(
                  color: AppColors.brandBlue.withAlpha(20),
                  borderRadius: BorderRadius.circular(AppRadius.full),
                ),
                child: Text(
                  '${_activePasses.length} Active',
                  style: AppTypography.badgeText.copyWith(
                    color: AppColors.brandBlue,
                    fontWeight: FontWeight.w700,
                  ),
                ),
              ),
            ],
          ),

          const SizedBox(height: AppSpacing.md),

          // Active Passes List or Empty State
          if (_activePasses.isEmpty)
            Card(
              color: Colors.white,
              elevation: 0,
              shape: RoundedRectangleBorder(
                borderRadius: AppRadius.borderLg,
                side: const BorderSide(color: AppColors.borderSubtle),
              ),
              child: Padding(
                padding: const EdgeInsets.all(AppSpacing.xl),
                child: Column(
                  children: [
                    Container(
                      padding: const EdgeInsets.all(AppSpacing.md),
                      decoration: BoxDecoration(
                        color: AppColors.secondarySlate.withAlpha(20),
                        shape: BoxShape.circle,
                      ),
                      child: const Icon(Icons.shield_outlined, size: 36, color: AppColors.secondarySlate),
                    ),
                    const SizedBox(height: AppSpacing.md),
                    Text('No Active Expected Visitors', style: AppTypography.titleMedium.copyWith(color: AppColors.textPrimary)),
                    const SizedBox(height: AppSpacing.xs),
                    Text(
                      'You currently have no active or upcoming pre-approved gate passes.',
                      style: AppTypography.bodySmall.copyWith(color: AppColors.textMuted),
                      textAlign: TextAlign.center,
                    ),
                    const SizedBox(height: AppSpacing.lg),
                    ElevatedButton.icon(
                      onPressed: _openCreatePassSheet,
                      icon: const Icon(Icons.person_add_rounded, size: 18),
                      label: const Text('+ Invite First Visitor'),
                      style: ElevatedButton.styleFrom(
                        backgroundColor: AppColors.brandBlue,
                        foregroundColor: Colors.white,
                      ),
                    ),
                  ],
                ),
              ),
            )
          else
            ListView.separated(
              shrinkWrap: true,
              physics: const NeverScrollableScrollPhysics(),
              itemCount: _activePasses.length,
              separatorBuilder: (context, index) => const SizedBox(height: AppSpacing.sm),
              itemBuilder: (context, index) {
                final pass = _activePasses[index];
                final catColor = _getCategoryColor(pass.category);
                final statusColor = _getStatusColor(pass.status);

                return Container(
                  decoration: BoxDecoration(
                    color: Colors.white,
                    borderRadius: AppRadius.borderLg,
                    border: Border.all(color: AppColors.borderSubtle),
                    boxShadow: AppShadows.cardShadow,
                  ),
                  child: InkWell(
                    onTap: () => _openPassDetail(pass),
                    borderRadius: BorderRadius.circular(AppRadius.lg),
                    child: Padding(
                      padding: const EdgeInsets.all(AppSpacing.md),
                      child: Column(
                        children: [
                          Row(
                            children: [
                              // Visitor Avatar Icon
                              Container(
                                width: 44,
                                height: 44,
                                decoration: BoxDecoration(
                                  color: catColor.withAlpha(20),
                                  shape: BoxShape.circle,
                                ),
                                child: Icon(
                                  _getCategoryIcon(pass.category),
                                  color: catColor,
                                  size: 22,
                                ),
                              ),
                              const SizedBox(width: AppSpacing.sm),

                              // Visitor Info
                              Expanded(
                                child: Column(
                                  crossAxisAlignment: CrossAxisAlignment.start,
                                  children: [
                                    Row(
                                      children: [
                                        Expanded(
                                          child: Text(
                                            pass.visitorName,
                                            style: AppTypography.titleMedium.copyWith(
                                              color: AppColors.textPrimary,
                                              fontSize: 15,
                                              fontWeight: FontWeight.bold,
                                            ),
                                            overflow: TextOverflow.ellipsis,
                                          ),
                                        ),
                                        const SizedBox(width: 4),
                                        Container(
                                          padding: const EdgeInsets.symmetric(horizontal: 6, vertical: 2),
                                          decoration: BoxDecoration(
                                            color: catColor.withAlpha(25),
                                            borderRadius: BorderRadius.circular(AppRadius.sm),
                                          ),
                                          child: Text(
                                            pass.category,
                                            style: AppTypography.badgeText.copyWith(
                                              color: catColor,
                                              fontSize: 10,
                                            ),
                                          ),
                                        ),
                                      ],
                                    ),
                                    const SizedBox(height: 2),
                                    Text(
                                      pass.expectedTimeSlot ?? pass.validUntil,
                                      style: AppTypography.caption.copyWith(color: AppColors.textMuted),
                                      overflow: TextOverflow.ellipsis,
                                    ),
                                  ],
                                ),
                              ),
                              const SizedBox(width: AppSpacing.xs),

                              // Passcode Badge Tag
                              Container(
                                padding: const EdgeInsets.symmetric(horizontal: 10, vertical: 6),
                                decoration: BoxDecoration(
                                  color: AppColors.primaryDarkNavy,
                                  borderRadius: BorderRadius.circular(AppRadius.md),
                                ),
                                child: Column(
                                  children: [
                                    Text(
                                      'PASSCODE',
                                      style: AppTypography.caption.copyWith(
                                        color: Colors.white70,
                                        fontSize: 8,
                                        letterSpacing: 0.8,
                                      ),
                                    ),
                                    Text(
                                      pass.passcode,
                                      style: AppTypography.bodyMedium.copyWith(
                                        color: Colors.white,
                                        fontWeight: FontWeight.w900,
                                        fontSize: 14,
                                        letterSpacing: 1.1,
                                      ),
                                    ),
                                  ],
                                ),
                              ),
                            ],
                          ),

                          const Divider(height: AppSpacing.md, color: AppColors.borderSubtle),

                          // Status Footer Row
                          Row(
                            mainAxisAlignment: MainAxisAlignment.spaceBetween,
                            children: [
                              Expanded(
                                child: Row(
                                  children: [
                                    Container(
                                      width: 8,
                                      height: 8,
                                      decoration: BoxDecoration(
                                        color: statusColor,
                                        shape: BoxShape.circle,
                                      ),
                                    ),
                                    const SizedBox(width: AppSpacing.xs),
                                    Expanded(
                                      child: Text(
                                        pass.status == 'active'
                                            ? 'Valid Pass • Pre-Approved'
                                            : pass.status == 'at_gate'
                                                ? 'Visitor Arrived at Gate'
                                                : pass.status.toUpperCase(),
                                        style: AppTypography.caption.copyWith(
                                          color: statusColor,
                                          fontWeight: FontWeight.w600,
                                        ),
                                        overflow: TextOverflow.ellipsis,
                                      ),
                                    ),
                                  ],
                                ),
                              ),
                              Row(
                                children: [
                                  Text(
                                    'View Pass',
                                    style: AppTypography.caption.copyWith(
                                      color: AppColors.brandBlue,
                                      fontWeight: FontWeight.w700,
                                    ),
                                  ),
                                  const Icon(
                                    Icons.chevron_right_rounded,
                                    size: 16,
                                    color: AppColors.brandBlue,
                                  ),
                                ],
                              ),
                            ],
                          ),
                        ],
                      ),
                    ),
                  ),
                );
              },
            ),

          const SizedBox(height: AppSpacing.xxl),

          // Section 2: Gate History & Logs
          Row(
            mainAxisAlignment: MainAxisAlignment.spaceBetween,
            children: [
              Row(
                children: [
                  const Icon(Icons.history_rounded, color: AppColors.textPrimary, size: 20),
                  const SizedBox(width: AppSpacing.xs),
                  Text('Gate History Logs', style: AppTypography.titleMedium.copyWith(color: AppColors.textPrimary)),
                ],
              ),
              DropdownButton<String>(
                value: _historyFilter,
                underline: const SizedBox.shrink(),
                style: AppTypography.caption.copyWith(color: AppColors.brandBlue, fontWeight: FontWeight.w600),
                items: ['ALL', 'Checked Out', 'Cancelled'].map((f) {
                  return DropdownMenuItem(value: f, child: Text(f));
                }).toList(),
                onChanged: (val) {
                  if (val != null) {
                    setState(() {
                      _historyFilter = val;
                    });
                  }
                },
              ),
            ],
          ),

          const SizedBox(height: AppSpacing.sm),

          // History Logs Feed
          if (_filteredHistoryLogs.isEmpty)
            Container(
              decoration: BoxDecoration(
                color: Colors.white,
                borderRadius: AppRadius.borderMd,
                border: Border.all(color: AppColors.borderSubtle),
              ),
              padding: const EdgeInsets.all(AppSpacing.lg),
              child: Center(
                child: Text('No historical gate logs found for selected filter.', style: AppTypography.bodySmall.copyWith(color: AppColors.textMuted)),
              ),
            )
          else
            ListView.separated(
              shrinkWrap: true,
              physics: const NeverScrollableScrollPhysics(),
              itemCount: _filteredHistoryLogs.length,
              separatorBuilder: (context, index) => const SizedBox(height: AppSpacing.xs),
              itemBuilder: (context, index) {
                final log = _filteredHistoryLogs[index];
                final catColor = _getCategoryColor(log.category);
                final statusColor = _getStatusColor(log.status);

                return Container(
                  decoration: BoxDecoration(
                    color: Colors.white,
                    borderRadius: AppRadius.borderMd,
                    border: Border.all(color: AppColors.borderSubtle),
                    boxShadow: AppShadows.cardShadow,
                  ),
                  child: Padding(
                    padding: const EdgeInsets.all(AppSpacing.md),
                    child: Row(
                      children: [
                        Container(
                          padding: const EdgeInsets.all(AppSpacing.xs),
                          decoration: BoxDecoration(
                            color: catColor.withAlpha(20),
                            shape: BoxShape.circle,
                          ),
                          child: Icon(_getCategoryIcon(log.category), size: 18, color: catColor),
                        ),
                        const SizedBox(width: AppSpacing.sm),
                        Expanded(
                          child: Column(
                            crossAxisAlignment: CrossAxisAlignment.start,
                            children: [
                              Text(log.visitorName, style: AppTypography.bodyMedium.copyWith(fontWeight: FontWeight.w600, color: AppColors.textPrimary)),
                              Text(
                                '${log.date ?? "Today"} • Entry: ${log.entryTime}${log.exitTime != null ? " • Exit: ${log.exitTime}" : ""}',
                                style: AppTypography.caption.copyWith(color: AppColors.textMuted),
                              ),
                              if (log.gateOfficer != null)
                                Text(
                                  log.gateOfficer!,
                                  style: AppTypography.caption.copyWith(fontSize: 10, color: AppColors.secondarySlate),
                                ),
                            ],
                          ),
                        ),
                        Container(
                          padding: const EdgeInsets.symmetric(horizontal: AppSpacing.xs + 2, vertical: 2),
                          decoration: BoxDecoration(
                            color: statusColor.withAlpha(20),
                            borderRadius: BorderRadius.circular(AppRadius.sm),
                          ),
                          child: Text(
                            log.status.toUpperCase().replaceAll('_', ' '),
                            style: AppTypography.badgeText.copyWith(
                              color: statusColor,
                              fontSize: 9,
                            ),
                          ),
                        ),
                      ],
                    ),
                  ),
                );
              },
            ),
        ],
      ),
    );
  }
}
