import 'package:flutter/material.dart';
import '../../../../core/repositories/repositories.dart';
import '../../../../core/theme/app_colors.dart';
import '../../../../core/theme/app_tokens.dart';
import '../../../../core/theme/app_typography.dart';
import '../committee/committee_roster_screen.dart';
import '../finances/issue_bill_modal.dart';
import '../notices/create_notice_modal.dart';
import '../notifications/secretary_notifications_screen.dart';

class SecretaryHomeTab extends StatefulWidget {
  final Function(int)? onNavigateToTab;

  const SecretaryHomeTab({
    super.key,
    this.onNavigateToTab,
  });

  @override
  State<SecretaryHomeTab> createState() => _SecretaryHomeTabState();
}

class _SecretaryHomeTabState extends State<SecretaryHomeTab> {
  @override
  Widget build(BuildContext context) {
    final unreadNotifs = SecretaryRepository.getNotifications().where((n) => !n.isRead).length;
    final notices = SecretaryRepository.getNotices();
    final publishedNotices = notices.where((n) => n.status.toLowerCase() == 'published').toList();
    final pendingKycCount = SecretaryRepository.getResidents()
        .where((r) => r.status.toLowerCase().contains('pending'))
        .length;

    return Scaffold(
      backgroundColor: AppColors.appBackground,
      body: CustomScrollView(
        slivers: [
          // Custom Header Sliver
          SliverToBoxAdapter(
            child: Container(
              color: AppColors.primaryDarkNavy,
              padding: const EdgeInsets.fromLTRB(
                AppSpacing.lg,
                AppSpacing.xl + 12,
                AppSpacing.lg,
                AppSpacing.xl,
              ),
              child: Column(
                crossAxisAlignment: CrossAxisAlignment.start,
                children: [
                  Row(
                    mainAxisAlignment: MainAxisAlignment.spaceBetween,
                    children: [
                      Expanded(
                        child: Row(
                          children: [
                            Container(
                              width: 44,
                              height: 44,
                              decoration: BoxDecoration(
                                color: AppColors.brandBlue,
                                borderRadius: BorderRadius.circular(22),
                                border: Border.all(color: Colors.white24, width: 2),
                              ),
                              child: const Center(
                                child: Text(
                                  'MU',
                                  style: TextStyle(
                                    color: Colors.white,
                                    fontWeight: FontWeight.bold,
                                    fontSize: 16,
                                  ),
                                ),
                              ),
                            ),
                            const SizedBox(width: AppSpacing.sm),
                            Expanded(
                              child: Column(
                                crossAxisAlignment: CrossAxisAlignment.start,
                                children: [
                                  Text(
                                    'Mayuri Udar',
                                    style: AppTypography.titleLarge.copyWith(
                                      color: Colors.white,
                                      fontWeight: FontWeight.bold,
                                    ),
                                    overflow: TextOverflow.ellipsis,
                                  ),
                                  Row(
                                    children: [
                                      Container(
                                        padding: const EdgeInsets.symmetric(horizontal: 6, vertical: 2),
                                        decoration: BoxDecoration(
                                          color: AppColors.brandBlue.withAlpha(76),
                                          borderRadius: BorderRadius.circular(4),
                                        ),
                                        child: const Text(
                                          'Managing Secretary',
                                          style: TextStyle(
                                            color: Colors.white70,
                                            fontSize: 10,
                                            fontWeight: FontWeight.w600,
                                          ),
                                        ),
                                      ),
                                      const SizedBox(width: 4),
                                      const Expanded(
                                        child: Text(
                                          '• Green Valley Society',
                                          style: TextStyle(
                                            color: Colors.white60,
                                            fontSize: 11,
                                          ),
                                          overflow: TextOverflow.ellipsis,
                                        ),
                                      ),
                                    ],
                                  ),
                                ],
                              ),
                            ),
                          ],
                        ),
                      ),
                      Row(
                        children: [
                          IconButton(
                            icon: const Icon(Icons.people_outline, color: Colors.white),
                            tooltip: 'Committee Roster',
                            onPressed: () {
                              Navigator.of(context).push(
                                MaterialPageRoute(
                                  builder: (context) => const CommitteeRosterScreen(),
                                ),
                              );
                            },
                          ),
                          Stack(
                            children: [
                              IconButton(
                                icon: const Icon(Icons.notifications_none_rounded, color: Colors.white),
                                tooltip: 'Notifications',
                                onPressed: () {
                                  Navigator.of(context).push(
                                    MaterialPageRoute(
                                      builder: (context) => const SecretaryNotificationsScreen(),
                                    ),
                                  ).then((_) => setState(() {}));
                                },
                              ),
                              if (unreadNotifs > 0)
                                Positioned(
                                  right: 8,
                                  top: 8,
                                  child: Container(
                                    padding: const EdgeInsets.all(4),
                                    decoration: const BoxDecoration(
                                      color: AppColors.crimsonDanger,
                                      shape: BoxShape.circle,
                                    ),
                                    constraints: const BoxConstraints(
                                      minWidth: 16,
                                      minHeight: 16,
                                    ),
                                    child: Text(
                                      '$unreadNotifs',
                                      style: const TextStyle(
                                        color: Colors.white,
                                        fontSize: 9,
                                        fontWeight: FontWeight.bold,
                                      ),
                                      textAlign: TextAlign.center,
                                    ),
                                  ),
                                ),
                            ],
                          ),
                        ],
                      ),
                    ],
                  ),
                ],
              ),
            ),
          ),

          // Main Body
          SliverPadding(
            padding: const EdgeInsets.all(AppSpacing.lg),
            sliver: SliverList(
              delegate: SliverChildListDelegate([
                // Greeting Card (Matching secretary-home.png)
                Container(
                  padding: const EdgeInsets.all(AppSpacing.md),
                  decoration: BoxDecoration(
                    color: AppColors.skyBlueInfoBg,
                    borderRadius: AppRadius.borderLg,
                    border: Border.all(color: AppColors.skyBlueInfo.withAlpha(76)),
                  ),
                  child: Row(
                    mainAxisAlignment: MainAxisAlignment.spaceBetween,
                    children: [
                      Expanded(
                        child: Column(
                          crossAxisAlignment: CrossAxisAlignment.start,
                          children: [
                            Text(
                              'Good Morning, Secretary 👋',
                              style: AppTypography.titleMedium.copyWith(
                                fontWeight: FontWeight.bold,
                                color: AppColors.primaryDarkNavy,
                              ),
                              overflow: TextOverflow.ellipsis,
                            ),
                            const SizedBox(height: 2),
                            Text(
                              'Here\'s what\'s happening in your society today.',
                              style: AppTypography.caption.copyWith(color: AppColors.textMuted),
                              overflow: TextOverflow.ellipsis,
                            ),
                          ],
                        ),
                      ),
                      const SizedBox(width: AppSpacing.xs),
                      Column(
                        crossAxisAlignment: CrossAxisAlignment.end,
                        children: [
                          const Icon(Icons.calendar_today_rounded, size: 16, color: AppColors.brandBlue),
                          const SizedBox(height: 2),
                          Text(
                            '10 Sept 2026\nThursday',
                            style: AppTypography.caption.copyWith(
                              color: AppColors.primaryDarkNavy,
                              fontWeight: FontWeight.w600,
                              fontSize: 10,
                            ),
                            textAlign: TextAlign.right,
                          ),
                        ],
                      ),
                    ],
                  ),
                ),

                const SizedBox(height: AppSpacing.md),

                // Today's Announcements Summary Card (Matching secretary-home.png)
                Container(
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
                          Expanded(
                            child: Row(
                              children: [
                                Container(
                                  padding: const EdgeInsets.all(6),
                                  decoration: BoxDecoration(
                                    color: AppColors.skyBlueInfoBg,
                                    borderRadius: AppRadius.borderSm,
                                  ),
                                  child: const Icon(Icons.campaign_rounded, size: 18, color: AppColors.brandBlue),
                                ),
                                const SizedBox(width: AppSpacing.xs),
                                Expanded(
                                  child: Text(
                                    'Today\'s Announcements',
                                    style: AppTypography.bodyMedium.copyWith(fontWeight: FontWeight.bold),
                                    overflow: TextOverflow.ellipsis,
                                  ),
                                ),
                              ],
                            ),
                          ),
                          const SizedBox(width: AppSpacing.xs),
                          Row(
                            children: [
                              ElevatedButton.icon(
                                onPressed: () {
                                  showModalBottomSheet(
                                    context: context,
                                    isScrollControlled: true,
                                    backgroundColor: Colors.transparent,
                                    builder: (context) => CreateNoticeModal(
                                      onUpdated: () => setState(() {}),
                                    ),
                                  );
                                },
                                style: ElevatedButton.styleFrom(
                                  backgroundColor: AppColors.brandBlue,
                                  padding: const EdgeInsets.symmetric(horizontal: 10, vertical: 4),
                                  minimumSize: const Size(0, 32),
                                  shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(16)),
                                ),
                                icon: const Icon(Icons.add, size: 14, color: Colors.white),
                                label: const Text('New', style: TextStyle(fontSize: 11, color: Colors.white)),
                              ),
                              const SizedBox(width: 4),
                              OutlinedButton.icon(
                                onPressed: () {
                                  if (widget.onNavigateToTab != null) {
                                    widget.onNavigateToTab!(2);
                                  }
                                },
                                style: OutlinedButton.styleFrom(
                                  padding: const EdgeInsets.symmetric(horizontal: 10, vertical: 4),
                                  minimumSize: const Size(0, 32),
                                  side: const BorderSide(color: AppColors.borderSubtle),
                                  shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(16)),
                                ),
                                icon: const Icon(Icons.list_alt_rounded, size: 14, color: AppColors.primaryDarkNavy),
                                label: const Text('All', style: TextStyle(fontSize: 11, color: AppColors.primaryDarkNavy)),
                              ),
                            ],
                          ),
                        ],
                      ),
                      const SizedBox(height: 6),
                      Text(
                        publishedNotices.isNotEmpty
                            ? '${publishedNotices.length} active announcements broadcasted to Green Valley residents.'
                            : 'No announcements for today.',
                        style: AppTypography.caption.copyWith(color: AppColors.textMuted),
                      ),
                    ],
                  ),
                ),

                const SizedBox(height: AppSpacing.lg),

                // Metrics Overview Header
                Text(
                  'Society Metrics Overview',
                  style: AppTypography.titleMedium.copyWith(
                    fontWeight: FontWeight.bold,
                    color: AppColors.textPrimary,
                  ),
                ),
                const SizedBox(height: AppSpacing.sm),

                // 4 Metric Cards Grid (2x2)
                GridView.count(
                  crossAxisCount: 2,
                  shrinkWrap: true,
                  physics: const NeverScrollableScrollPhysics(),
                  crossAxisSpacing: AppSpacing.md,
                  mainAxisSpacing: AppSpacing.md,
                  childAspectRatio: 1.5,
                  children: [
                    _buildMetricCard(
                      title: 'Total Residents',
                      value: '${SecretaryRepository.getResidents().length + 138}',
                      subtext: '12 Wing Blocks',
                      icon: Icons.groups_rounded,
                      color: AppColors.brandBlue,
                    ),
                    _buildMetricCard(
                      title: 'Pending KYC',
                      value: '$pendingKycCount',
                      subtext: 'Action Required',
                      icon: Icons.assignment_ind_rounded,
                      color: AppColors.amberWarning,
                      onTap: () {
                        if (widget.onNavigateToTab != null) {
                          widget.onNavigateToTab!(1); // Residents tab
                        }
                      },
                    ),
                    _buildMetricCard(
                      title: 'Open Tickets',
                      value: '5',
                      subtext: '2 High Priority',
                      icon: Icons.confirmation_number_rounded,
                      color: AppColors.skyBlueInfo,
                    ),
                    _buildMetricCard(
                      title: 'Dues Collection',
                      value: '84.5%',
                      subtext: '₹5.4K Outstanding',
                      icon: Icons.account_balance_wallet_rounded,
                      color: AppColors.emeraldSuccess,
                      onTap: () {
                        if (widget.onNavigateToTab != null) {
                          widget.onNavigateToTab!(3); // Finances tab
                        }
                      },
                    ),
                  ],
                ),

                const SizedBox(height: AppSpacing.xl),

                // Quick Administrative Actions
                Text(
                  'Quick Administrative Actions',
                  style: AppTypography.titleMedium.copyWith(
                    fontWeight: FontWeight.bold,
                    color: AppColors.textPrimary,
                  ),
                ),
                const SizedBox(height: AppSpacing.sm),

                Row(
                  children: [
                    Expanded(
                      child: _buildQuickActionButton(
                        icon: Icons.person_add_rounded,
                        label: 'Add / Verify',
                        color: AppColors.brandBlue,
                        onTap: () {
                          if (widget.onNavigateToTab != null) {
                            widget.onNavigateToTab!(1); // Residents tab
                          }
                        },
                      ),
                    ),
                    const SizedBox(width: AppSpacing.sm),
                    Expanded(
                      child: _buildQuickActionButton(
                        icon: Icons.campaign_rounded,
                        label: 'Broadcast',
                        color: AppColors.emeraldSuccess,
                        onTap: () {
                          showModalBottomSheet(
                            context: context,
                            isScrollControlled: true,
                            backgroundColor: Colors.transparent,
                            builder: (context) => CreateNoticeModal(
                              onUpdated: () => setState(() {}),
                            ),
                          );
                        },
                      ),
                    ),
                  ],
                ),
                const SizedBox(height: AppSpacing.sm),
                Row(
                  children: [
                    Expanded(
                      child: _buildQuickActionButton(
                        icon: Icons.fact_check_rounded,
                        label: 'Review KYC',
                        color: AppColors.amberWarning,
                        onTap: () {
                          if (widget.onNavigateToTab != null) {
                            widget.onNavigateToTab!(1); // Residents tab
                          }
                        },
                      ),
                    ),
                    const SizedBox(width: AppSpacing.sm),
                    Expanded(
                      child: _buildQuickActionButton(
                        icon: Icons.receipt_long_rounded,
                        label: 'Issue Bill',
                        color: const Color(0xFF8B5CF6),
                        onTap: () {
                          showModalBottomSheet(
                            context: context,
                            isScrollControlled: true,
                            backgroundColor: Colors.transparent,
                            builder: (context) => IssueBillModal(
                              onUpdated: () => setState(() {}),
                            ),
                          );
                        },
                      ),
                    ),
                  ],
                ),

                const SizedBox(height: AppSpacing.xl),

                // Recent Announcements Header
                Row(
                  mainAxisAlignment: MainAxisAlignment.spaceBetween,
                  children: [
                    Text(
                      'Recent Announcements',
                      style: AppTypography.titleMedium.copyWith(
                        fontWeight: FontWeight.bold,
                        color: AppColors.textPrimary,
                      ),
                    ),
                    TextButton(
                      onPressed: () {
                        if (widget.onNavigateToTab != null) {
                          widget.onNavigateToTab!(2); // Notices tab
                        }
                      },
                      child: Text(
                        'View All (${publishedNotices.length})',
                        style: AppTypography.bodySmall.copyWith(
                          color: AppColors.brandBlue,
                          fontWeight: FontWeight.w600,
                        ),
                      ),
                    ),
                  ],
                ),
                const SizedBox(height: AppSpacing.xs),

                // Announcements Feed List
                ...publishedNotices.take(3).map((notice) => Container(
                      margin: const EdgeInsets.only(bottom: AppSpacing.sm),
                      padding: const EdgeInsets.all(AppSpacing.md),
                      decoration: BoxDecoration(
                        color: Colors.white,
                        borderRadius: AppRadius.borderMd,
                        border: Border.all(color: AppColors.borderSubtle),
                      ),
                      child: Column(
                        crossAxisAlignment: CrossAxisAlignment.start,
                        children: [
                          Row(
                            mainAxisAlignment: MainAxisAlignment.spaceBetween,
                            children: [
                              Container(
                                padding: const EdgeInsets.symmetric(horizontal: 8, vertical: 2),
                                decoration: BoxDecoration(
                                  color: notice.priority.toLowerCase() == 'urgent' || notice.priority.toLowerCase() == 'high'
                                      ? AppColors.crimsonDangerBg
                                      : notice.priority.toLowerCase() == 'important' || notice.priority.toLowerCase() == 'medium'
                                          ? AppColors.amberWarningBg
                                          : AppColors.skyBlueInfoBg,
                                  borderRadius: BorderRadius.circular(4),
                                ),
                                child: Text(
                                  notice.priority.toUpperCase(),
                                  style: TextStyle(
                                    fontSize: 10,
                                    fontWeight: FontWeight.bold,
                                    color: notice.priority.toLowerCase() == 'urgent' || notice.priority.toLowerCase() == 'high'
                                        ? AppColors.crimsonDanger
                                        : notice.priority.toLowerCase() == 'important' || notice.priority.toLowerCase() == 'medium'
                                            ? AppColors.amberWarning
                                            : AppColors.skyBlueInfo,
                                  ),
                                ),
                              ),
                              Text(
                                notice.publishedAt,
                                style: AppTypography.caption.copyWith(color: AppColors.textSubtle),
                              ),
                            ],
                          ),
                          const SizedBox(height: AppSpacing.xs),
                          Text(
                            notice.title,
                            style: AppTypography.bodyMedium.copyWith(
                              fontWeight: FontWeight.bold,
                              color: AppColors.textPrimary,
                            ),
                          ),
                          const SizedBox(height: 4),
                          Text(
                            notice.content,
                            maxLines: 2,
                            overflow: TextOverflow.ellipsis,
                            style: AppTypography.bodySmall.copyWith(color: AppColors.textMuted),
                          ),
                          const SizedBox(height: AppSpacing.sm),
                          Row(
                            children: [
                              const Icon(Icons.people_outline, size: 14, color: AppColors.textSubtle),
                              const SizedBox(width: 4),
                              Text(
                                notice.targetAudience,
                                style: AppTypography.caption.copyWith(color: AppColors.textSubtle),
                              ),
                              const Spacer(),
                              const Icon(Icons.check_circle_outline, size: 14, color: AppColors.emeraldSuccess),
                              const SizedBox(width: 4),
                              Text(
                                '${notice.acknowledgmentCount} Acked',
                                style: AppTypography.caption.copyWith(
                                  color: AppColors.emeraldSuccess,
                                  fontWeight: FontWeight.w600,
                                ),
                              ),
                            ],
                          ),
                        ],
                      ),
                    )),
              ]),
            ),
          ),
        ],
      ),
    );
  }

  Widget _buildMetricCard({
    required String title,
    required String value,
    required String subtext,
    required IconData icon,
    required Color color,
    VoidCallback? onTap,
  }) {
    return Card(
      elevation: 0,
      color: Colors.white,
      shape: RoundedRectangleBorder(
        borderRadius: AppRadius.borderMd,
        side: const BorderSide(color: AppColors.borderSubtle),
      ),
      child: InkWell(
        onTap: onTap,
        borderRadius: AppRadius.borderMd,
        child: Padding(
          padding: const EdgeInsets.all(AppSpacing.md),
          child: Column(
            crossAxisAlignment: CrossAxisAlignment.start,
            mainAxisAlignment: MainAxisAlignment.spaceBetween,
            children: [
              Row(
                mainAxisAlignment: MainAxisAlignment.spaceBetween,
                children: [
                  Text(
                    title,
                    style: AppTypography.caption.copyWith(
                      color: AppColors.textMuted,
                      fontWeight: FontWeight.w500,
                    ),
                  ),
                  Icon(icon, size: 18, color: color),
                ],
              ),
              Text(
                value,
                style: AppTypography.displayHeading.copyWith(
                  fontSize: 22,
                  color: AppColors.textPrimary,
                  fontWeight: FontWeight.bold,
                ),
              ),
              Text(
                subtext,
                style: AppTypography.caption.copyWith(
                  color: AppColors.textSubtle,
                  fontSize: 11,
                ),
              ),
            ],
          ),
        ),
      ),
    );
  }

  Widget _buildQuickActionButton({
    required IconData icon,
    required String label,
    required Color color,
    required VoidCallback onTap,
  }) {
    return ElevatedButton(
      onPressed: onTap,
      style: ElevatedButton.styleFrom(
        elevation: 0,
        backgroundColor: Colors.white,
        foregroundColor: AppColors.textPrimary,
        padding: const EdgeInsets.symmetric(vertical: AppSpacing.md, horizontal: AppSpacing.sm),
        shape: RoundedRectangleBorder(
          borderRadius: AppRadius.borderMd,
          side: const BorderSide(color: AppColors.borderSubtle),
        ),
        minimumSize: const Size(0, 52),
      ),
      child: Row(
        mainAxisAlignment: MainAxisAlignment.center,
        children: [
          Icon(icon, size: 20, color: color),
          const SizedBox(width: AppSpacing.xs),
          Flexible(
            child: Text(
              label,
              style: AppTypography.bodySmall.copyWith(
                fontWeight: FontWeight.bold,
                color: AppColors.textPrimary,
              ),
              overflow: TextOverflow.ellipsis,
            ),
          ),
        ],
      ),
    );
  }
}
