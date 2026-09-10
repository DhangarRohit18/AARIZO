import 'package:flutter/material.dart';
import '../../../../core/models/models.dart';
import '../../../../core/repositories/repositories.dart';
import '../../../../core/theme/app_colors.dart';
import '../../../../core/theme/app_tokens.dart';
import '../../../../core/theme/app_typography.dart';

class GuardAlertsTab extends StatefulWidget {
  const GuardAlertsTab({super.key});

  @override
  State<GuardAlertsTab> createState() => _GuardAlertsTabState();
}

class _GuardAlertsTabState extends State<GuardAlertsTab> {
  late List<EmergencyAlertModel> _alerts;

  @override
  void initState() {
    super.initState();
    _refreshAlerts();
  }

  void _refreshAlerts() {
    setState(() {
      _alerts = EmergencyAlertRepository.getAlerts();
    });
  }

  void _onAcknowledge(EmergencyAlertModel alert) {
    EmergencyAlertRepository.acknowledgeAlert(alert.id, GuardRepository.officerName);
    _refreshAlerts();
    ScaffoldMessenger.of(context).showSnackBar(
      SnackBar(
        content: Text('✓ SOS Alert Acknowledged at ${GuardRepository.gateName} Terminal'),
        backgroundColor: AppColors.emeraldSuccess,
      ),
    );
  }

  @override
  Widget build(BuildContext context) {
    final unacknowledged = _alerts.where((a) => !a.isAcknowledged).toList();

    return Scaffold(
      backgroundColor: AppColors.appBackground,
      appBar: AppBar(
        title: const Text('Resident SOS Safety Alerts'),
        actions: [
          IconButton(
            onPressed: _refreshAlerts,
            icon: const Icon(Icons.refresh_rounded),
            tooltip: 'Refresh Alerts',
          ),
        ],
      ),
      body: SafeArea(
        child: Padding(
          padding: const EdgeInsets.all(AppSpacing.lg),
          child: Column(
            crossAxisAlignment: CrossAxisAlignment.start,
            children: [
              // Critical Alert Banner Header
              Container(
                width: double.infinity,
                padding: const EdgeInsets.all(AppSpacing.lg),
                decoration: BoxDecoration(
                  color: unacknowledged.isNotEmpty ? AppColors.crimsonDangerBg : AppColors.emeraldSuccessBg,
                  borderRadius: AppRadius.borderLg,
                  border: Border.all(
                    color: unacknowledged.isNotEmpty ? AppColors.crimsonDanger : AppColors.emeraldSuccess,
                    width: 1.5,
                  ),
                ),
                child: Row(
                  children: [
                    Container(
                      width: 44,
                      height: 44,
                      decoration: BoxDecoration(
                        color: unacknowledged.isNotEmpty ? AppColors.crimsonDanger : AppColors.emeraldSuccess,
                        shape: BoxShape.circle,
                      ),
                      child: Icon(
                        unacknowledged.isNotEmpty ? Icons.warning_rounded : Icons.verified_user_rounded,
                        color: Colors.white,
                        size: 24,
                      ),
                    ),
                    const SizedBox(width: AppSpacing.md),
                    Expanded(
                      child: Column(
                        crossAxisAlignment: CrossAxisAlignment.start,
                        children: [
                          Text(
                            unacknowledged.isNotEmpty
                                ? 'RESIDENT SOS SIMULATION ACTIVE'
                                : 'All Emergency Alerts Clear',
                            style: AppTypography.titleMedium.copyWith(
                              color: unacknowledged.isNotEmpty ? AppColors.crimsonDanger : AppColors.emeraldSuccess,
                            ),
                          ),
                          Text(
                            unacknowledged.isNotEmpty
                                ? '${unacknowledged.length} Panic SOS workflow triggered — pending gate acknowledgment'
                                : 'Zero active emergency simulation requests at Gate #1',
                            style: AppTypography.bodySmall.copyWith(color: AppColors.textPrimary),
                          ),
                        ],
                      ),
                    ),
                  ],
                ),
              ),

              const SizedBox(height: AppSpacing.lg),

              // Prototype Language Disclaimer Banner
              Container(
                padding: const EdgeInsets.all(AppSpacing.md),
                decoration: BoxDecoration(
                  color: AppColors.amberWarningBg,
                  borderRadius: AppRadius.borderMd,
                  border: Border.all(color: AppColors.amberWarning.withAlpha(76)),
                ),
                child: Row(
                  crossAxisAlignment: CrossAxisAlignment.start,
                  children: [
                    const Icon(Icons.info_outline_rounded, size: 18, color: AppColors.amberWarning),
                    const SizedBox(width: AppSpacing.sm),
                    Expanded(
                      child: Text(
                        'PROTOTYPE SIMULATION ALERT: Local state demonstration mode. No actual emergency services, police, ambulance, or SMS calls were dispatched.',
                        style: AppTypography.caption.copyWith(
                          color: AppColors.amberWarning,
                          fontWeight: FontWeight.w600,
                          fontSize: 11,
                        ),
                      ),
                    ),
                  ],
                ),
              ),

              const SizedBox(height: AppSpacing.xl),

              Text(
                'RESIDENT SOS ALERT LOG',
                style: AppTypography.caption.copyWith(
                  letterSpacing: 1.2,
                  fontWeight: FontWeight.w700,
                  color: AppColors.textMuted,
                ),
              ),

              const SizedBox(height: AppSpacing.md),

              Expanded(
                child: _alerts.isEmpty
                    ? Center(
                        child: Text(
                          'No emergency alerts recorded.',
                          style: AppTypography.bodySmall.copyWith(color: AppColors.textMuted),
                        ),
                      )
                    : ListView.separated(
                        itemCount: _alerts.length,
                        separatorBuilder: (context, index) => const SizedBox(height: AppSpacing.md),
                        itemBuilder: (context, index) {
                          final alert = _alerts[index];
                          return Container(
                            decoration: BoxDecoration(
                              color: Colors.white,
                              borderRadius: AppRadius.borderLg,
                              border: Border.all(
                                color: alert.isAcknowledged ? AppColors.borderSubtle : AppColors.crimsonDanger,
                                width: alert.isAcknowledged ? 1 : 2,
                              ),
                              boxShadow: AppShadows.cardShadow,
                            ),
                            padding: const EdgeInsets.all(AppSpacing.lg),
                            child: Column(
                              crossAxisAlignment: CrossAxisAlignment.start,
                              children: [
                                Row(
                                  children: [
                                    Container(
                                      padding: const EdgeInsets.all(8),
                                      decoration: BoxDecoration(
                                        color: alert.isAcknowledged ? AppColors.surfaceSubtle : AppColors.crimsonDangerBg,
                                        shape: BoxShape.circle,
                                      ),
                                      child: Icon(
                                        Icons.emergency_rounded,
                                        color: alert.isAcknowledged ? AppColors.secondarySlate : AppColors.crimsonDanger,
                                        size: 24,
                                      ),
                                    ),
                                    const SizedBox(width: AppSpacing.md),
                                    Expanded(
                                      child: Column(
                                        crossAxisAlignment: CrossAxisAlignment.start,
                                        children: [
                                          Text(
                                            alert.alertType,
                                            style: AppTypography.titleMedium.copyWith(
                                              color: alert.isAcknowledged ? AppColors.textPrimary : AppColors.crimsonDanger,
                                            ),
                                          ),
                                          Text(
                                            'Resident: ${alert.residentName}',
                                            style: AppTypography.bodySmall.copyWith(fontWeight: FontWeight.w600),
                                          ),
                                        ],
                                      ),
                                    ),
                                    Container(
                                      padding: const EdgeInsets.symmetric(horizontal: 8, vertical: 4),
                                      decoration: BoxDecoration(
                                        color: alert.isAcknowledged ? AppColors.emeraldSuccessBg : AppColors.crimsonDangerBg,
                                        borderRadius: AppRadius.borderSm,
                                      ),
                                      child: Text(
                                        alert.isAcknowledged ? 'ACKNOWLEDGED' : 'PENDING ACTION',
                                        style: AppTypography.caption.copyWith(
                                          color: alert.isAcknowledged ? AppColors.emeraldSuccess : AppColors.crimsonDanger,
                                          fontWeight: FontWeight.w800,
                                        ),
                                      ),
                                    ),
                                  ],
                                ),

                                const SizedBox(height: AppSpacing.md),
                                const Divider(height: 1, color: AppColors.borderSubtle),
                                const SizedBox(height: AppSpacing.md),

                                Row(
                                  mainAxisAlignment: MainAxisAlignment.spaceBetween,
                                  children: [
                                    Column(
                                      crossAxisAlignment: CrossAxisAlignment.start,
                                      children: [
                                        Text('Unit / Flat', style: AppTypography.caption.copyWith(color: AppColors.textMuted)),
                                        Text(alert.canonicalDisplay, style: AppTypography.bodySmall.copyWith(fontWeight: FontWeight.w600)),
                                      ],
                                    ),
                                    Column(
                                      crossAxisAlignment: CrossAxisAlignment.end,
                                      children: [
                                        Text('Broadcast Time', style: AppTypography.caption.copyWith(color: AppColors.textMuted)),
                                        Text(alert.timestamp, style: AppTypography.bodySmall.copyWith(fontWeight: FontWeight.w600)),
                                      ],
                                    ),
                                  ],
                                ),

                                const SizedBox(height: AppSpacing.lg),

                                if (!alert.isAcknowledged) ...[
                                  SizedBox(
                                    width: double.infinity,
                                    height: 48,
                                    child: ElevatedButton.icon(
                                      onPressed: () => _onAcknowledge(alert),
                                      icon: const Icon(Icons.check_circle_outline_rounded, color: Colors.white, size: 20),
                                      label: Text('ACKNOWLEDGE RESIDENT SOS', style: AppTypography.buttonLabel),
                                      style: ElevatedButton.styleFrom(
                                        backgroundColor: AppColors.crimsonDanger,
                                        shape: const RoundedRectangleBorder(borderRadius: AppRadius.borderLg),
                                      ),
                                    ),
                                  ),
                                ] else ...[
                                  Container(
                                    width: double.infinity,
                                    padding: const EdgeInsets.all(AppSpacing.md),
                                    decoration: BoxDecoration(
                                      color: AppColors.emeraldSuccessBg,
                                      borderRadius: AppRadius.borderMd,
                                    ),
                                    child: Row(
                                      children: [
                                        const Icon(Icons.check_circle_rounded, color: AppColors.emeraldSuccess, size: 18),
                                        const SizedBox(width: AppSpacing.sm),
                                        Expanded(
                                          child: Text(
                                            'SOS simulation acknowledged at Gate #1',
                                            style: AppTypography.caption.copyWith(
                                              color: AppColors.emeraldSuccess,
                                              fontWeight: FontWeight.w700,
                                            ),
                                          ),
                                        ),
                                      ],
                                    ),
                                  ),
                                ],
                              ],
                            ),
                          );
                        },
                      ),
              ),
            ],
          ),
        ),
      ),
    );
  }
}
