import 'package:flutter/material.dart';
import '../../../../core/repositories/repositories.dart';
import '../../../../core/theme/app_colors.dart';
import '../../../../core/theme/app_tokens.dart';
import '../../../../core/theme/app_typography.dart';
import '../verification/inside_community_screen.dart';
import '../verification/visitor_decision_modal.dart';

class GuardDashboardTab extends StatefulWidget {
  final Function(int tabIndex)? onNavigateTab;

  const GuardDashboardTab({
    super.key,
    this.onNavigateTab,
  });

  @override
  State<GuardDashboardTab> createState() => _GuardDashboardTabState();
}

class _GuardDashboardTabState extends State<GuardDashboardTab> {
  late bool _isGateOpen;

  @override
  void initState() {
    super.initState();
    _isGateOpen = GuardRepository.isGateOpen;
  }

  void _toggleGate() {
    setState(() {
      GuardRepository.toggleGateStatus();
      _isGateOpen = GuardRepository.isGateOpen;
    });
  }

  @override
  Widget build(BuildContext context) {
    final activePasses = GatePassRepository.getActivePasses();
    final insideVisitors = GatePassRepository.getInsideVisitors();
    final pendingApprovals = GatePassRepository.getPendingApprovals();
    final unacknowledgedAlerts = EmergencyAlertRepository.getAlerts().where((a) => !a.isAcknowledged).toList();

    return Scaffold(
      backgroundColor: AppColors.appBackground,
      body: SafeArea(
        child: RefreshIndicator(
          onRefresh: () async {
            setState(() {});
          },
          child: SingleChildScrollView(
            physics: const AlwaysScrollableScrollPhysics(),
            padding: const EdgeInsets.all(AppSpacing.lg),
            child: Column(
              crossAxisAlignment: CrossAxisAlignment.start,
              children: [
                // Header Bar with Officer & Gate Status Switch
                Container(
                  padding: const EdgeInsets.all(AppSpacing.lg),
                  decoration: BoxDecoration(
                    color: AppColors.primaryDarkNavy,
                    borderRadius: AppRadius.borderLg,
                    boxShadow: AppShadows.cardShadow,
                  ),
                  child: Column(
                    children: [
                      Row(
                        children: [
                          Container(
                            width: 46,
                            height: 46,
                            decoration: const BoxDecoration(
                              color: AppColors.amberWarning,
                              shape: BoxShape.circle,
                            ),
                            child: const Icon(Icons.shield_rounded, color: Colors.white, size: 24),
                          ),
                          const SizedBox(width: AppSpacing.md),
                          Expanded(
                            child: Column(
                              crossAxisAlignment: CrossAxisAlignment.start,
                              children: [
                                Text(
                                  GuardRepository.officerName,
                                  style: AppTypography.titleLarge.copyWith(color: Colors.white),
                                ),
                                Text(
                                  '${GuardRepository.gateName} • ${GuardRepository.societyName}',
                                  style: AppTypography.bodySmall.copyWith(color: Colors.white.withAlpha(204)),
                                ),
                              ],
                            ),
                          ),
                          // Gate Open/Closed Switch
                          InkWell(
                            onTap: _toggleGate,
                            borderRadius: AppRadius.borderFull,
                            child: AnimatedContainer(
                              duration: const Duration(milliseconds: 200),
                              padding: const EdgeInsets.symmetric(horizontal: 10, vertical: 6),
                              decoration: BoxDecoration(
                                color: _isGateOpen ? AppColors.emeraldSuccess : AppColors.crimsonDanger,
                                borderRadius: AppRadius.borderFull,
                              ),
                              child: Row(
                                mainAxisSize: MainAxisSize.min,
                                children: [
                                  Icon(
                                    _isGateOpen ? Icons.lock_open_rounded : Icons.lock_rounded,
                                    color: Colors.white,
                                    size: 14,
                                  ),
                                  const SizedBox(width: 4),
                                  Text(
                                    _isGateOpen ? 'GATE OPEN' : 'GATE CLOSED',
                                    style: AppTypography.caption.copyWith(
                                      color: Colors.white,
                                      fontWeight: FontWeight.w800,
                                    ),
                                  ),
                                ],
                              ),
                            ),
                          ),
                        ],
                      ),
                    ],
                  ),
                ),

                const SizedBox(height: AppSpacing.xl),

                // Prominent CTA: VERIFY PASS
                GestureDetector(
                  onTap: () {
                    widget.onNavigateTab?.call(1); // Switch to Verify Tab
                  },
                  child: Container(
                    width: double.infinity,
                    padding: const EdgeInsets.symmetric(vertical: 18, horizontal: 20),
                    decoration: BoxDecoration(
                      gradient: const LinearGradient(
                        colors: [AppColors.primaryDarkNavy, AppColors.primarySlate],
                        begin: Alignment.topLeft,
                        end: Alignment.bottomRight,
                      ),
                      borderRadius: AppRadius.borderLg,
                      boxShadow: AppShadows.cardShadow,
                    ),
                    child: Row(
                      children: [
                        Container(
                          width: 48,
                          height: 48,
                          decoration: BoxDecoration(
                            color: AppColors.amberWarning,
                            borderRadius: AppRadius.borderMd,
                          ),
                          child: const Icon(Icons.dialpad_rounded, color: Colors.white, size: 26),
                        ),
                        const SizedBox(width: AppSpacing.md),
                        Expanded(
                          child: Column(
                            crossAxisAlignment: CrossAxisAlignment.start,
                            children: [
                              Text(
                                'VERIFY PASSCODE NOW',
                                style: AppTypography.titleLarge.copyWith(
                                  color: Colors.white,
                                  letterSpacing: 0.5,
                                ),
                              ),
                              Text(
                                'Tap to open keypad & enter visitor passcode (e.g. 8492)',
                                style: AppTypography.bodySmall.copyWith(color: Colors.white.withAlpha(204)),
                              ),
                            ],
                          ),
                        ),
                        const Icon(Icons.arrow_forward_ios_rounded, color: Colors.white, size: 18),
                      ],
                    ),
                  ),
                ),

                const SizedBox(height: AppSpacing.xl),

                // Operational Summary Metrics Grid
                Text(
                  'GATE OPERATIONS METRICS',
                  style: AppTypography.caption.copyWith(
                    letterSpacing: 1.2,
                    fontWeight: FontWeight.w700,
                    color: AppColors.textMuted,
                  ),
                ),

                const SizedBox(height: AppSpacing.md),

                Row(
                  children: [
                    Expanded(
                      child: _MetricCard(
                        title: 'Expected Visitors',
                        value: '${activePasses.length}',
                        icon: Icons.badge_outlined,
                        color: AppColors.brandBlue,
                        bgColor: AppColors.skyBlueInfoBg,
                        onTap: () => widget.onNavigateTab?.call(1),
                      ),
                    ),
                    const SizedBox(width: AppSpacing.md),
                    Expanded(
                      child: _MetricCard(
                        title: 'Inside Community',
                        value: '${insideVisitors.length}',
                        icon: Icons.groups_rounded,
                        color: AppColors.emeraldSuccess,
                        bgColor: AppColors.emeraldSuccessBg,
                        onTap: () {
                          Navigator.of(context).push(
                            MaterialPageRoute(builder: (context) => const InsideCommunityScreen()),
                          );
                        },
                      ),
                    ),
                  ],
                ),

                const SizedBox(height: AppSpacing.md),

                Row(
                  children: [
                    Expanded(
                      child: _MetricCard(
                        title: 'Pending Action',
                        value: '${pendingApprovals.length}',
                        icon: Icons.pending_actions_rounded,
                        color: AppColors.amberWarning,
                        bgColor: AppColors.amberWarningBg,
                        onTap: () => widget.onNavigateTab?.call(1),
                      ),
                    ),
                    const SizedBox(width: AppSpacing.md),
                    Expanded(
                      child: _MetricCard(
                        title: 'Resident SOS Alerts',
                        value: '${unacknowledgedAlerts.length}',
                        icon: Icons.warning_amber_rounded,
                        color: AppColors.crimsonDanger,
                        bgColor: AppColors.crimsonDangerBg,
                        onTap: () => widget.onNavigateTab?.call(3), // Switch to Alerts Tab
                      ),
                    ),
                  ],
                ),

                const SizedBox(height: AppSpacing.xl),

                // Active & Scheduled Passes Quick List
                Row(
                  mainAxisAlignment: MainAxisAlignment.spaceBetween,
                  children: [
                    Text(
                      'EXPECTED VISITORS AT GATE',
                      style: AppTypography.caption.copyWith(
                        letterSpacing: 1.2,
                        fontWeight: FontWeight.w700,
                        color: AppColors.textMuted,
                      ),
                    ),
                    TextButton(
                      onPressed: () => widget.onNavigateTab?.call(1),
                      child: Text(
                        'View Keypad',
                        style: AppTypography.caption.copyWith(
                          color: AppColors.brandBlue,
                          fontWeight: FontWeight.w700,
                        ),
                      ),
                    ),
                  ],
                ),

                const SizedBox(height: AppSpacing.xs),

                if (activePasses.isEmpty) ...[
                  Container(
                    width: double.infinity,
                    padding: const EdgeInsets.all(AppSpacing.xl),
                    decoration: BoxDecoration(
                      color: Colors.white,
                      borderRadius: AppRadius.borderLg,
                      border: Border.all(color: AppColors.borderSubtle),
                    ),
                    child: Center(
                      child: Text(
                        'No expected visitors currently pending.',
                        style: AppTypography.bodySmall.copyWith(color: AppColors.textMuted),
                      ),
                    ),
                  ),
                ] else ...[
                  ListView.separated(
                    shrinkWrap: true,
                    physics: const NeverScrollableScrollPhysics(),
                    itemCount: activePasses.length,
                    separatorBuilder: (context, index) => const SizedBox(height: AppSpacing.md),
                    itemBuilder: (context, index) {
                      final pass = activePasses[index];
                      return Container(
                        decoration: BoxDecoration(
                          color: Colors.white,
                          borderRadius: AppRadius.borderLg,
                          border: Border.all(color: AppColors.borderSubtle),
                          boxShadow: AppShadows.cardShadow,
                        ),
                        padding: const EdgeInsets.all(AppSpacing.md),
                        child: Column(
                          crossAxisAlignment: CrossAxisAlignment.start,
                          children: [
                            Row(
                              children: [
                                CircleAvatar(
                                  radius: 18,
                                  backgroundColor: AppColors.primaryDarkNavy,
                                  child: Text(
                                    pass.visitorName.isNotEmpty ? pass.visitorName[0] : 'V',
                                    style: AppTypography.titleMedium.copyWith(color: Colors.white, fontSize: 14),
                                  ),
                                ),
                                const SizedBox(width: AppSpacing.md),
                                Expanded(
                                  child: Column(
                                    crossAxisAlignment: CrossAxisAlignment.start,
                                    children: [
                                      Text(pass.visitorName, style: AppTypography.titleMedium),
                                      Text(
                                        'Passcode: #${pass.passcode} • ${pass.category}',
                                        style: AppTypography.bodySmall,
                                      ),
                                    ],
                                  ),
                                ),
                                Container(
                                  padding: const EdgeInsets.symmetric(horizontal: 8, vertical: 3),
                                  decoration: BoxDecoration(
                                    color: AppColors.amberWarningBg,
                                    borderRadius: AppRadius.borderSm,
                                  ),
                                  child: Text(
                                    pass.status.toUpperCase(),
                                    style: AppTypography.caption.copyWith(
                                      color: AppColors.amberWarning,
                                      fontWeight: FontWeight.w800,
                                    ),
                                  ),
                                ),
                              ],
                            ),
                            const SizedBox(height: AppSpacing.sm),
                            Row(
                              mainAxisAlignment: MainAxisAlignment.spaceBetween,
                              children: [
                                Expanded(
                                  child: Text(
                                    'Host: ${pass.residentName} (${pass.canonicalDisplay})',
                                    style: AppTypography.caption.copyWith(color: AppColors.textMuted),
                                    overflow: TextOverflow.ellipsis,
                                  ),
                                ),
                                const SizedBox(width: AppSpacing.xs),
                                ElevatedButton(
                                  onPressed: () {
                                    showModalBottomSheet(
                                      context: context,
                                      isScrollControlled: true,
                                      backgroundColor: Colors.transparent,
                                      builder: (context) => VisitorDecisionModal(
                                        pass: pass,
                                        onUpdated: () => setState(() {}),
                                      ),
                                    );
                                  },
                                  style: ElevatedButton.styleFrom(
                                    backgroundColor: AppColors.brandBlue,
                                    foregroundColor: Colors.white,
                                    padding: const EdgeInsets.symmetric(horizontal: 14, vertical: 6),
                                    minimumSize: const Size(0, 32),
                                    shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(AppRadius.sm)),
                                  ),
                                  child: const Text('Verify', style: TextStyle(fontWeight: FontWeight.bold, fontSize: 12, color: Colors.white)),
                                ),
                              ],
                            ),
                          ],
                        ),
                      );
                    },
                  ),
                ],
              ],
            ),
          ),
        ),
      ),
    );
  }
}

class _MetricCard extends StatelessWidget {
  final String title;
  final String value;
  final IconData icon;
  final Color color;
  final Color bgColor;
  final VoidCallback onTap;

  const _MetricCard({
    required this.title,
    required this.value,
    required this.icon,
    required this.color,
    required this.bgColor,
    required this.onTap,
  });

  @override
  Widget build(BuildContext context) {
    return GestureDetector(
      onTap: onTap,
      child: Container(
        padding: const EdgeInsets.all(AppSpacing.md),
        decoration: BoxDecoration(
          color: Colors.white,
          borderRadius: AppRadius.borderLg,
          border: Border.all(color: AppColors.borderSubtle),
          boxShadow: AppShadows.cardShadow,
        ),
        child: Column(
          crossAxisAlignment: CrossAxisAlignment.start,
          children: [
            Row(
              mainAxisAlignment: MainAxisAlignment.spaceBetween,
              children: [
                Container(
                  width: 36,
                  height: 36,
                  decoration: BoxDecoration(color: bgColor, borderRadius: AppRadius.borderMd),
                  child: Icon(icon, color: color, size: 20),
                ),
                Text(
                  value,
                  style: AppTypography.displayHeading.copyWith(fontSize: 26, color: color),
                ),
              ],
            ),
            const SizedBox(height: AppSpacing.sm),
            Text(
              title,
              style: AppTypography.caption.copyWith(color: AppColors.textMuted, fontWeight: FontWeight.w600),
            ),
          ],
        ),
      ),
    );
  }
}
