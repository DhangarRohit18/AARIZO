import 'package:flutter/material.dart';
import '../../../core/repositories/repositories.dart';
import '../../../core/theme/app_colors.dart';
import '../../../core/theme/app_tokens.dart';
import '../../../core/theme/app_typography.dart';
import '../../../core/widgets/app_badge.dart';
import 'more/safety_sos_screen.dart';
import 'more/support_tickets_screen.dart';

class HomeTab extends StatefulWidget {
  final Function(int tabIndex) onNavigateToTab;

  const HomeTab({
    super.key,
    required this.onNavigateToTab,
  });

  @override
  State<HomeTab> createState() => _HomeTabState();
}

class _HomeTabState extends State<HomeTab> {
  bool _isAlertDismissed = false;

  @override
  Widget build(BuildContext context) {
    final society = SocietyRepository.currentSociety;
    final resident = ResidentRepository.getCanonicalResident();
    final passes = GatePassRepository.getPasses();
    final activePass = passes.isNotEmpty ? passes.first : null;
    final totalOutstanding = BillingRepository.getTotalOutstanding();
    final unpaidBills = BillingRepository.getUnpaidRecords();

    final urgentNotice = NoticeRepository.getNotices().firstWhere(
      (n) => n.priority == 'Urgent',
      orElse: () => NoticeRepository.getNotices().first,
    );

    return ListView(
      padding: const EdgeInsets.all(AppSpacing.lg),
      children: [
        // 1. Header (Resident -> Society -> Flat)
        Container(
          decoration: BoxDecoration(
            gradient: const LinearGradient(
              colors: [AppColors.primaryDarkNavy, AppColors.primarySlate],
              begin: Alignment.topLeft,
              end: Alignment.bottomRight,
            ),
            borderRadius: AppRadius.borderLg,
            boxShadow: AppShadows.cardShadow,
          ),
          padding: const EdgeInsets.all(AppSpacing.lg),
          child: Column(
            crossAxisAlignment: CrossAxisAlignment.start,
            children: [
              Row(
                mainAxisAlignment: MainAxisAlignment.spaceBetween,
                children: [
                  Row(
                    children: [
                      Container(
                        width: 40,
                        height: 40,
                        decoration: const BoxDecoration(
                          color: AppColors.brandBlue,
                          shape: BoxShape.circle,
                        ),
                        child: const Center(
                          child: Text(
                            'SK',
                            style: TextStyle(
                              color: Colors.white,
                              fontWeight: FontWeight.w800,
                              fontSize: 15,
                            ),
                          ),
                        ),
                      ),
                      const SizedBox(width: AppSpacing.sm),
                      Column(
                        crossAxisAlignment: CrossAxisAlignment.start,
                        children: [
                          Text(
                            society.name,
                            style: AppTypography.titleMedium.copyWith(color: Colors.white, fontSize: 15),
                          ),
                          Text(
                            resident.canonicalDisplay,
                            style: AppTypography.caption.copyWith(color: Colors.blue.shade200),
                          ),
                        ],
                      ),
                    ],
                  ),
                  IconButton(
                    onPressed: () => widget.onNavigateToTab(4), // More -> Notifications
                    icon: Stack(
                      children: [
                        const Icon(Icons.notifications_outlined, color: Colors.white, size: 22),
                        Positioned(
                          right: 0,
                          top: 0,
                          child: Container(
                            width: 8,
                            height: 8,
                            decoration: const BoxDecoration(
                              color: AppColors.crimsonDanger,
                              shape: BoxShape.circle,
                            ),
                          ),
                        ),
                      ],
                    ),
                  ),
                ],
              ),
              const SizedBox(height: AppSpacing.lg),
              Text(
                'Good Morning, ${resident.name}!',
                style: AppTypography.displayHeading.copyWith(color: Colors.white, fontSize: 20),
              ),
              const SizedBox(height: AppSpacing.xs),
              Text(
                'Everything is quiet and secure at ${society.name}.',
                style: AppTypography.bodySmall.copyWith(color: Colors.blue.shade100),
              ),
            ],
          ),
        ),

        const SizedBox(height: AppSpacing.lg),

        // 2. High-Priority Contextual Alert Banner (ResidentAlertCard Web Parity)
        if (!_isAlertDismissed)
          Container(
            padding: const EdgeInsets.all(AppSpacing.md),
            decoration: BoxDecoration(
              color: AppColors.amberWarningBg,
              borderRadius: AppRadius.borderLg,
              border: Border.all(color: AppColors.amberWarning.withValues(alpha: 0.3)),
              boxShadow: AppShadows.cardShadow,
            ),
            child: Column(
              crossAxisAlignment: CrossAxisAlignment.start,
              children: [
                Row(
                  mainAxisAlignment: MainAxisAlignment.spaceBetween,
                  children: [
                    Row(
                      children: [
                        const Icon(Icons.warning_amber_rounded, size: 18, color: AppColors.amberWarning),
                        const SizedBox(width: 6),
                        Text(
                          'ACTION REQUIRED',
                          style: AppTypography.badgeText.copyWith(
                            color: AppColors.amberWarning,
                            fontWeight: FontWeight.w800,
                            fontSize: 11,
                          ),
                        ),
                      ],
                    ),
                    Row(
                      children: [
                        Text('Just now', style: AppTypography.caption),
                        const SizedBox(width: 4),
                        InkWell(
                          onTap: () => setState(() => _isAlertDismissed = true),
                          child: const Icon(Icons.close_rounded, size: 16, color: AppColors.textSubtle),
                        ),
                      ],
                    ),
                  ],
                ),
                const SizedBox(height: AppSpacing.xs),
                Text(
                  'Gate Entry Approval Required',
                  style: AppTypography.titleMedium.copyWith(fontSize: 14, fontWeight: FontWeight.w700),
                ),
                const SizedBox(height: 2),
                Text(
                  'Security Officer R. Singh is requesting entry approval for Food Delivery Agent at Main Gate #1.',
                  style: AppTypography.bodySmall,
                ),
                const SizedBox(height: AppSpacing.sm),
                SizedBox(
                  width: double.infinity,
                  child: OutlinedButton.icon(
                    onPressed: () => widget.onNavigateToTab(1), // Visitors tab
                    style: OutlinedButton.styleFrom(
                      foregroundColor: AppColors.amberWarning,
                      side: BorderSide(color: AppColors.amberWarning.withValues(alpha: 0.4)),
                      padding: const EdgeInsets.symmetric(vertical: 8),
                      minimumSize: const Size(0, 40),
                      shape: const RoundedRectangleBorder(borderRadius: AppRadius.borderSm),
                    ),
                    icon: const Icon(Icons.rate_review_rounded, size: 16),
                    label: Text(
                      'Review Entry Request',
                      style: AppTypography.buttonLabel.copyWith(
                        color: AppColors.amberWarning,
                        fontSize: 12,
                      ),
                    ),
                  ),
                ),
              ],
            ),
          ),

        if (!_isAlertDismissed) const SizedBox(height: AppSpacing.lg),

        // 3. Active Visitor Status Card (ResidentVisitorCard Web Parity)
        if (activePass != null)
          GestureDetector(
            onTap: () => widget.onNavigateToTab(1),
            child: Container(
              padding: const EdgeInsets.all(AppSpacing.md),
              decoration: BoxDecoration(
                color: Colors.white,
                borderRadius: AppRadius.borderLg,
                border: Border.all(color: AppColors.brandBlue.withValues(alpha: 0.3)),
                boxShadow: AppShadows.cardShadow,
              ),
              child: Column(
                crossAxisAlignment: CrossAxisAlignment.start,
                children: [
                  Row(
                    mainAxisAlignment: MainAxisAlignment.spaceBetween,
                    children: [
                      Row(
                        children: [
                          const Icon(Icons.person_pin_circle_rounded, size: 18, color: AppColors.brandBlue),
                          const SizedBox(width: 6),
                          Text('EXPECTED TODAY', style: AppTypography.badgeText.copyWith(color: AppColors.brandBlue)),
                        ],
                      ),
                      AppBadge.fromStatus(activePass.status),
                    ],
                  ),
                  const SizedBox(height: AppSpacing.sm),
                  Row(
                    children: [
                      Container(
                        width: 42,
                        height: 42,
                        decoration: const BoxDecoration(
                          color: AppColors.skyBlueInfoBg,
                          shape: BoxShape.circle,
                        ),
                        child: const Icon(Icons.qr_code_2_rounded, color: AppColors.brandBlue, size: 22),
                      ),
                      const SizedBox(width: AppSpacing.sm),
                      Expanded(
                        child: Column(
                          crossAxisAlignment: CrossAxisAlignment.start,
                          children: [
                            Text(
                              activePass.visitorName,
                              style: AppTypography.titleMedium.copyWith(fontSize: 15),
                            ),
                            Text(
                              '${activePass.category} • ${activePass.expectedDate}',
                              style: AppTypography.caption,
                            ),
                          ],
                        ),
                      ),
                      Container(
                        padding: const EdgeInsets.symmetric(horizontal: 10, vertical: 4),
                        decoration: BoxDecoration(
                          color: AppColors.primaryDarkNavy,
                          borderRadius: BorderRadius.circular(AppRadius.xs),
                        ),
                        child: Column(
                          children: [
                            Text('PASSCODE', style: AppTypography.badgeText.copyWith(color: Colors.white70, fontSize: 8)),
                            Text(
                              activePass.passcode,
                              style: AppTypography.titleMedium.copyWith(color: Colors.white, fontWeight: FontWeight.w900, fontSize: 15),
                            ),
                          ],
                        ),
                      ),
                    ],
                  ),
                ],
              ),
            ),
          ),

        const SizedBox(height: AppSpacing.xl),

        // 4. Quick Actions Launcher (ResidentQuickActions Web Parity - Exact 6 Actions)
        Row(
          mainAxisAlignment: MainAxisAlignment.spaceBetween,
          children: [
            Text('Quick Actions', style: AppTypography.titleMedium),
            Text('6 Actions Available', style: AppTypography.caption),
          ],
        ),
        const SizedBox(height: AppSpacing.sm),

        GridView.count(
          crossAxisCount: 2,
          shrinkWrap: true,
          physics: const NeverScrollableScrollPhysics(),
          mainAxisSpacing: AppSpacing.sm,
          crossAxisSpacing: AppSpacing.sm,
          childAspectRatio: 2.1,
          children: [
            _QuickActionCard(
              label: 'Invite Guest',
              subtitle: 'Pre-approve visitor',
              icon: Icons.person_add_rounded,
              color: AppColors.brandBlue,
              bgColor: AppColors.skyBlueInfoBg,
              onTap: () => widget.onNavigateToTab(1),
            ),
            _QuickActionCard(
              label: 'Delivery Pass',
              subtitle: 'Instant gate entry',
              icon: Icons.local_shipping_rounded,
              color: AppColors.primarySlate,
              bgColor: AppColors.surfaceSubtle,
              onTap: () => widget.onNavigateToTab(1),
            ),
            _QuickActionCard(
              label: 'Pay Dues',
              subtitle: 'Maintenance bill',
              icon: Icons.payments_rounded,
              color: AppColors.emeraldSuccess,
              bgColor: AppColors.emeraldSuccessBg,
              onTap: () => widget.onNavigateToTab(3),
            ),
            _QuickActionCard(
              label: 'Book Amenity',
              subtitle: 'Clubhouse & courts',
              icon: Icons.event_seat_rounded,
              color: AppColors.amberWarning,
              bgColor: AppColors.amberWarningBg,
              onTap: () => widget.onNavigateToTab(2),
            ),
            _QuickActionCard(
              label: 'Helpdesk Ticket',
              subtitle: 'Electrical & plumbing',
              icon: Icons.build_circle_rounded,
              color: AppColors.primaryDarkNavy,
              bgColor: AppColors.surfaceSubtle,
              onTap: () => Navigator.of(context).push(
                MaterialPageRoute(builder: (_) => const SupportTicketsScreen()),
              ),
            ),
            _QuickActionCard(
              label: 'Emergency SOS',
              subtitle: 'Panic alert',
              icon: Icons.emergency_rounded,
              color: AppColors.crimsonDanger,
              bgColor: AppColors.crimsonDangerBg,
              isDanger: true,
              onTap: () => Navigator.of(context).push(
                MaterialPageRoute(builder: (_) => const SafetySosScreen()),
              ),
            ),
          ],
        ),

        const SizedBox(height: AppSpacing.xl),

        // 5. Official Announcements Ticker Card (ResidentAnnouncementCard Web Parity)
        Row(
          mainAxisAlignment: MainAxisAlignment.spaceBetween,
          children: [
            Text('Society Notice', style: AppTypography.titleMedium),
            GestureDetector(
              onTap: () => widget.onNavigateToTab(2),
              child: Text(
                'View All Notices →',
                style: AppTypography.caption.copyWith(color: AppColors.brandBlue, fontWeight: FontWeight.w700),
              ),
            ),
          ],
        ),
        const SizedBox(height: AppSpacing.sm),

        Container(
          decoration: BoxDecoration(
            color: Colors.white,
            borderRadius: AppRadius.borderLg,
            border: Border.all(color: AppColors.borderSubtle),
            boxShadow: AppShadows.cardShadow,
          ),
          padding: const EdgeInsets.all(AppSpacing.lg),
          child: Column(
            crossAxisAlignment: CrossAxisAlignment.start,
            children: [
              Row(
                mainAxisAlignment: MainAxisAlignment.spaceBetween,
                children: [
                  AppBadge(
                    label: '${urgentNotice.category} • ${urgentNotice.priority}',
                    variant: AppBadgeVariant.danger,
                  ),
                  Text(urgentNotice.publishedAt, style: AppTypography.caption.copyWith(color: AppColors.textMuted)),
                ],
              ),
              const SizedBox(height: AppSpacing.sm),
              Text(
                urgentNotice.title,
                style: AppTypography.titleMedium.copyWith(fontSize: 15, color: AppColors.textPrimary, fontWeight: FontWeight.bold),
              ),
              const SizedBox(height: AppSpacing.xs),
              Text(
                urgentNotice.content,
                style: AppTypography.bodySmall.copyWith(color: AppColors.textMuted),
                maxLines: 2,
                overflow: TextOverflow.ellipsis,
              ),
              const SizedBox(height: AppSpacing.sm),
              Text(
                'Posted by ${urgentNotice.authorName} (${urgentNotice.authorRole})',
                style: AppTypography.caption.copyWith(color: AppColors.textSubtle, fontStyle: FontStyle.italic),
              ),
            ],
          ),
        ),

        const SizedBox(height: AppSpacing.xl),

        // 6. Account & Dues Snapshot Card (ResidentActivity Web Parity - Snapshot)
        Row(
          mainAxisAlignment: MainAxisAlignment.spaceBetween,
          children: [
            Text('Dues & Account Snapshot', style: AppTypography.titleMedium),
            AppBadge(label: '${unpaidBills.length} Unpaid', variant: AppBadgeVariant.warning),
          ],
        ),
        const SizedBox(height: AppSpacing.sm),

        Container(
          decoration: BoxDecoration(
            color: Colors.white,
            borderRadius: AppRadius.borderLg,
            border: Border.all(color: AppColors.borderSubtle),
            boxShadow: AppShadows.cardShadow,
          ),
          padding: const EdgeInsets.all(AppSpacing.lg),
          child: Column(
            children: [
              Row(
                children: [
                  Container(
                    width: 40,
                    height: 40,
                    decoration: const BoxDecoration(
                      color: AppColors.amberWarningBg,
                      shape: BoxShape.circle,
                    ),
                    child: const Icon(Icons.account_balance_wallet_rounded, color: AppColors.amberWarning, size: 20),
                  ),
                  const SizedBox(width: AppSpacing.md),
                  Expanded(
                    child: Column(
                      crossAxisAlignment: CrossAxisAlignment.start,
                      children: [
                        Text('Total Outstanding Balance', style: AppTypography.caption.copyWith(color: AppColors.textMuted)),
                        Text(
                          '₹${totalOutstanding.toStringAsFixed(0)}',
                          style: AppTypography.titleLarge.copyWith(color: AppColors.crimsonDanger, fontWeight: FontWeight.w800),
                        ),
                        Text(
                          'Includes #PAY-101 (₹4,250) & #PAY-102 (₹1,200)',
                          style: AppTypography.caption.copyWith(color: AppColors.textSubtle, fontSize: 10),
                          overflow: TextOverflow.ellipsis,
                        ),
                      ],
                    ),
                  ),
                  const SizedBox(width: AppSpacing.xs),
                  ElevatedButton(
                    onPressed: () => widget.onNavigateToTab(3),
                    style: ElevatedButton.styleFrom(
                      backgroundColor: AppColors.emeraldSuccess,
                      foregroundColor: Colors.white,
                      padding: const EdgeInsets.symmetric(horizontal: 14, vertical: 8),
                      minimumSize: const Size(0, 36),
                    ),
                    child: Text('Pay Now', style: AppTypography.buttonLabel.copyWith(fontSize: 12, color: Colors.white)),
                  ),
                ],
              ),
              const Divider(height: AppSpacing.lg, color: AppColors.borderSubtle),
              Row(
                children: [
                  Expanded(
                    child: Row(
                      children: [
                        const Icon(Icons.confirmation_number_rounded, size: 16, color: AppColors.brandBlue),
                        const SizedBox(width: 6),
                        Expanded(
                          child: Text(
                            '1 Open Ticket',
                            style: AppTypography.caption.copyWith(color: AppColors.textPrimary, fontWeight: FontWeight.w600),
                            overflow: TextOverflow.ellipsis,
                          ),
                        ),
                      ],
                    ),
                  ),
                  Expanded(
                    child: Row(
                      children: [
                        const Icon(Icons.event_available_rounded, size: 16, color: AppColors.emeraldSuccess),
                        const SizedBox(width: 6),
                        Expanded(
                          child: Text(
                            '1 Booking',
                            style: AppTypography.caption.copyWith(color: AppColors.textPrimary, fontWeight: FontWeight.w600),
                            overflow: TextOverflow.ellipsis,
                          ),
                        ),
                      ],
                    ),
                  ),
                ],
              ),
            ],
          ),
        ),

        const SizedBox(height: AppSpacing.xl),

        // 7. Upcoming Activities List (ResidentActivity Web Parity - Upcoming List)
        Text('Upcoming Activities', style: AppTypography.titleMedium),
        const SizedBox(height: AppSpacing.sm),

        Container(
          decoration: BoxDecoration(
            color: Colors.white,
            borderRadius: AppRadius.borderLg,
            border: Border.all(color: AppColors.borderSubtle),
            boxShadow: AppShadows.cardShadow,
          ),
          child: Column(
            children: [
              ListTile(
                leading: const CircleAvatar(
                  backgroundColor: AppColors.skyBlueInfoBg,
                  child: Icon(Icons.sports_tennis_rounded, color: AppColors.brandBlue, size: 20),
                ),
                title: Text('Tennis Court Booking', style: AppTypography.titleMedium.copyWith(fontSize: 14, color: AppColors.textPrimary)),
                subtitle: Text('Court #1 • Evening Slot (Today 7:00 PM)', style: AppTypography.caption.copyWith(color: AppColors.textMuted)),
                trailing: const AppBadge(label: 'Confirmed', variant: AppBadgeVariant.success),
              ),
              const Divider(height: 1, color: AppColors.borderSubtle),
              ListTile(
                leading: const CircleAvatar(
                  backgroundColor: AppColors.amberWarningBg,
                  child: Icon(Icons.build_rounded, color: AppColors.amberWarning, size: 20),
                ),
                title: Text('A/C Duct Inspection Ticket', style: AppTypography.titleMedium.copyWith(fontSize: 14, color: AppColors.textPrimary)),
                subtitle: Text('Ticket #TK-4029 • Tech Ramesh (Tomorrow 11:00 AM)', style: AppTypography.caption.copyWith(color: AppColors.textMuted)),
                trailing: const AppBadge(label: 'In Progress', variant: AppBadgeVariant.warning),
              ),
            ],
          ),
        ),
      ],
    );
  }
}

class _QuickActionCard extends StatelessWidget {
  final String label;
  final String subtitle;
  final IconData icon;
  final Color color;
  final Color bgColor;
  final bool isDanger;
  final VoidCallback onTap;

  const _QuickActionCard({
    required this.label,
    required this.subtitle,
    required this.icon,
    required this.color,
    required this.bgColor,
    this.isDanger = false,
    required this.onTap,
  });

  @override
  Widget build(BuildContext context) {
    return InkWell(
      onTap: onTap,
      borderRadius: AppRadius.borderMd,
      child: Container(
        constraints: const BoxConstraints(minHeight: 52),
        padding: const EdgeInsets.symmetric(horizontal: AppSpacing.sm, vertical: AppSpacing.xs),
        decoration: BoxDecoration(
          color: isDanger ? AppColors.crimsonDangerBg : Colors.white,
          borderRadius: AppRadius.borderMd,
          border: Border.all(
            color: isDanger ? AppColors.crimsonDanger.withValues(alpha: 0.3) : AppColors.borderSubtle,
          ),
          boxShadow: AppShadows.cardShadow,
        ),
        child: Row(
          children: [
            Container(
              width: 36,
              height: 36,
              decoration: BoxDecoration(
                color: bgColor,
                borderRadius: AppRadius.borderSm,
              ),
              child: Icon(icon, color: color, size: 18),
            ),
            const SizedBox(width: 8),
            Expanded(
              child: Column(
                mainAxisAlignment: MainAxisAlignment.center,
                crossAxisAlignment: CrossAxisAlignment.start,
                children: [
                  Text(
                    label,
                    style: AppTypography.titleMedium.copyWith(
                      fontSize: 12,
                      fontWeight: FontWeight.w700,
                      color: isDanger ? AppColors.crimsonDanger : AppColors.textPrimary,
                    ),
                    maxLines: 1,
                    overflow: TextOverflow.ellipsis,
                  ),
                  Text(
                    subtitle,
                    style: AppTypography.caption.copyWith(
                      fontSize: 9,
                      color: isDanger ? AppColors.crimsonDanger.withValues(alpha: 0.8) : AppColors.textSubtle,
                    ),
                    maxLines: 1,
                    overflow: TextOverflow.ellipsis,
                  ),
                ],
              ),
            ),
          ],
        ),
      ),
    );
  }
}
