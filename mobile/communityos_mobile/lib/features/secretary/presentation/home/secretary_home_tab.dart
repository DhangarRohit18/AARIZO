import 'package:flutter/material.dart';
import '../../../../core/repositories/repositories.dart';
import '../../../../core/theme/app_colors.dart';
import '../../../../core/theme/app_tokens.dart';
import '../../../../core/theme/app_typography.dart';
import '../committee/committee_roster_screen.dart';
import '../finances/issue_bill_modal.dart';
import '../notices/create_notice_modal.dart';

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
    final notices = SecretaryRepository.getNotices();
    final publishedNotices = notices.where((n) => n.status.toLowerCase() == 'published').toList();

    return SingleChildScrollView(
      padding: const EdgeInsets.all(AppSpacing.lg),
      child: Column(
        crossAxisAlignment: CrossAxisAlignment.start,
        children: [
          // 1. Greeting Card (Matching Screenshot 1)
          Container(
            padding: const EdgeInsets.all(AppSpacing.md),
            decoration: BoxDecoration(
              color: const Color(0xFFF0F7FF),
              borderRadius: BorderRadius.circular(16),
              border: Border.all(color: const Color(0xFFE2E8F0)),
            ),
            child: Row(
              mainAxisAlignment: MainAxisAlignment.spaceBetween,
              crossAxisAlignment: CrossAxisAlignment.start,
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
                          fontSize: 16,
                        ),
                        overflow: TextOverflow.ellipsis,
                      ),
                      const SizedBox(height: 4),
                      Text(
                        'Here\'s what\'s happening in your society today.',
                        style: AppTypography.caption.copyWith(
                          color: AppColors.textMuted,
                          fontSize: 12,
                        ),
                      ),
                    ],
                  ),
                ),
                const SizedBox(width: AppSpacing.sm),
                Row(
                  crossAxisAlignment: CrossAxisAlignment.start,
                  children: [
                    const Icon(Icons.calendar_month_outlined, size: 16, color: AppColors.primaryDarkNavy),
                    const SizedBox(width: 4),
                    Column(
                      crossAxisAlignment: CrossAxisAlignment.end,
                      children: [
                        Text(
                          '07 Sept 2026',
                          style: AppTypography.caption.copyWith(
                            color: AppColors.primaryDarkNavy,
                            fontWeight: FontWeight.bold,
                            fontSize: 11,
                          ),
                        ),
                        Text(
                          'Monday',
                          style: AppTypography.caption.copyWith(
                            color: AppColors.textMuted,
                            fontSize: 10,
                          ),
                        ),
                      ],
                    ),
                  ],
                ),
              ],
            ),
          ),

          const SizedBox(height: AppSpacing.md),

          // 2. Today's Announcements Card (Matching Screenshot 1)
          Container(
            padding: const EdgeInsets.all(AppSpacing.md),
            decoration: BoxDecoration(
              color: const Color(0xFFF0F7FF),
              borderRadius: BorderRadius.circular(16),
              border: Border.all(color: const Color(0xFFE2E8F0)),
            ),
            child: Stack(
              children: [
                Positioned(
                  right: -10,
                  bottom: -10,
                  child: Icon(
                    Icons.campaign_outlined,
                    size: 80,
                    color: AppColors.brandBlue.withAlpha(20),
                  ),
                ),
                Column(
                  crossAxisAlignment: CrossAxisAlignment.start,
                  children: [
                    Row(
                      children: [
                        Container(
                          padding: const EdgeInsets.all(6),
                          decoration: BoxDecoration(
                            color: AppColors.brandBlue.withAlpha(25),
                            shape: BoxShape.circle,
                          ),
                          child: const Icon(Icons.campaign_rounded, size: 18, color: AppColors.brandBlue),
                        ),
                        const SizedBox(width: 8),
                        Text(
                          'Today\'s Announcements',
                          style: AppTypography.bodyMedium.copyWith(
                            fontWeight: FontWeight.bold,
                            color: AppColors.primaryDarkNavy,
                            fontSize: 15,
                          ),
                        ),
                      ],
                    ),
                    const SizedBox(height: 6),
                    Text(
                      publishedNotices.isNotEmpty
                          ? '${publishedNotices.length} active announcements broadcasted to residents.'
                          : 'No announcements for today.',
                      style: AppTypography.caption.copyWith(color: AppColors.textMuted),
                    ),
                    const SizedBox(height: 12),
                    Row(
                      children: [
                        // + New Button
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
                            backgroundColor: AppColors.primaryDarkNavy,
                            foregroundColor: Colors.white,
                            padding: const EdgeInsets.symmetric(horizontal: 14, vertical: 6),
                            minimumSize: const Size(0, 32),
                            shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(16)),
                            elevation: 0,
                          ),
                          icon: const Icon(Icons.add_circle_outline, size: 14, color: Colors.white),
                          label: const Text('New', style: TextStyle(fontSize: 12, fontWeight: FontWeight.bold)),
                        ),
                        const SizedBox(width: 8),
                        // ≡ All Button
                        OutlinedButton.icon(
                          onPressed: () {
                            if (widget.onNavigateToTab != null) {
                              widget.onNavigateToTab!(2); // Notices tab
                            }
                          },
                          style: OutlinedButton.styleFrom(
                            backgroundColor: Colors.white.withAlpha(180),
                            foregroundColor: AppColors.primaryDarkNavy,
                            padding: const EdgeInsets.symmetric(horizontal: 14, vertical: 6),
                            minimumSize: const Size(0, 32),
                            side: const BorderSide(color: Color(0xFFCBD5E1)),
                            shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(16)),
                          ),
                          icon: const Icon(Icons.format_list_bulleted_rounded, size: 14, color: AppColors.primaryDarkNavy),
                          label: const Text('All', style: TextStyle(fontSize: 12, fontWeight: FontWeight.bold)),
                        ),
                      ],
                    ),
                  ],
                ),
              ],
            ),
          ),

          const SizedBox(height: AppSpacing.xl),

          // 3. Quick Actions Section (Matching Screenshot 1 Grid)
          Text(
            'Quick Actions',
            style: AppTypography.titleMedium.copyWith(
              fontWeight: FontWeight.bold,
              color: AppColors.primaryDarkNavy,
              fontSize: 18,
            ),
          ),
          const SizedBox(height: AppSpacing.md),

          GridView.count(
            crossAxisCount: 3,
            shrinkWrap: true,
            physics: const NeverScrollableScrollPhysics(),
            crossAxisSpacing: 12,
            mainAxisSpacing: 12,
            childAspectRatio: 1.0,
            children: [
              _buildQuickActionTile(
                icon: Icons.apartment_outlined,
                label: 'Residents',
                onTap: () {
                  if (widget.onNavigateToTab != null) {
                    widget.onNavigateToTab!(1); // Residents tab
                  }
                },
              ),
              _buildQuickActionTile(
                icon: Icons.assignment_outlined,
                label: 'Complaints',
                onTap: () {
                  if (widget.onNavigateToTab != null) {
                    widget.onNavigateToTab!(2); // Notices / Complaints
                  }
                },
              ),
              _buildQuickActionTile(
                icon: Icons.build_outlined,
                label: 'Maintenance',
                onTap: () {
                  showModalBottomSheet(
                    context: context,
                    isScrollControlled: true,
                    backgroundColor: Colors.transparent,
                    builder: (context) => IssueBillModal(onUpdated: () => setState(() {})),
                  );
                },
              ),
              _buildQuickActionTile(
                icon: Icons.grid_view_rounded,
                label: 'Amenities',
                onTap: () {
                  ScaffoldMessenger.of(context).showSnackBar(
                    const SnackBar(content: Text('Clubhouse & Amenities Reservation Management')),
                  );
                },
              ),
              _buildQuickActionTile(
                icon: Icons.support_agent_outlined,
                label: 'Staff',
                onTap: () {
                  ScaffoldMessenger.of(context).showSnackBar(
                    const SnackBar(content: Text('Society Guards & Housekeeping Staff Roster')),
                  );
                },
              ),
              _buildQuickActionTile(
                icon: Icons.event_note_outlined,
                label: 'Events',
                onTap: () {
                  Navigator.of(context).push(
                    MaterialPageRoute(builder: (context) => const CommitteeRosterScreen()),
                  );
                },
              ),
            ],
          ),

          const SizedBox(height: AppSpacing.xl),

          // 4. Recent Activity Section (Matching Screenshot 1)
          Text(
            'Recent Activity',
            style: AppTypography.titleMedium.copyWith(
              fontWeight: FontWeight.bold,
              color: AppColors.primaryDarkNavy,
              fontSize: 18,
            ),
          ),
          const SizedBox(height: AppSpacing.md),

          Container(
            decoration: BoxDecoration(
              color: Colors.white,
              borderRadius: BorderRadius.circular(16),
              border: Border.all(color: const Color(0xFFE2E8F0)),
              boxShadow: AppShadows.cardShadow,
            ),
            child: Column(
              children: [
                _buildActivityTile(
                  icon: Icons.person_outline_rounded,
                  iconColor: AppColors.emeraldSuccess,
                  iconBg: AppColors.emeraldSuccessBg,
                  title: 'Visitor approved for A-204',
                  subtitle: '5 mins ago',
                ),
                const Divider(height: 1, color: Color(0xFFF1F5F9)),
                _buildActivityTile(
                  icon: Icons.build_outlined,
                  iconColor: AppColors.brandBlue,
                  iconBg: AppColors.skyBlueInfoBg,
                  title: 'Maintenance paid by B-302',
                  subtitle: '20 mins ago',
                ),
                const Divider(height: 1, color: Color(0xFFF1F5F9)),
                _buildActivityTile(
                  icon: Icons.notifications_none_rounded,
                  iconColor: AppColors.amberWarning,
                  iconBg: AppColors.amberWarningBg,
                  title: 'New Helpdesk ticket TK-4029 raised',
                  subtitle: '1 hour ago',
                ),
              ],
            ),
          ),

          const SizedBox(height: 80), // Padding above floating nav bar
        ],
      ),
    );
  }

  Widget _buildQuickActionTile({
    required IconData icon,
    required String label,
    required VoidCallback onTap,
  }) {
    return Container(
      decoration: BoxDecoration(
        color: Colors.white,
        borderRadius: BorderRadius.circular(16),
        border: Border.all(color: const Color(0xFFE2E8F0)),
        boxShadow: [
          BoxShadow(
            color: Colors.black.withAlpha(6),
            blurRadius: 8,
            offset: const Offset(0, 2),
          ),
        ],
      ),
      child: InkWell(
        onTap: onTap,
        borderRadius: BorderRadius.circular(16),
        child: Column(
          mainAxisAlignment: MainAxisAlignment.center,
          children: [
            Container(
              padding: const EdgeInsets.all(10),
              decoration: BoxDecoration(
                color: const Color(0xFFF8FAFC),
                borderRadius: BorderRadius.circular(12),
                border: Border.all(color: const Color(0xFFE2E8F0)),
              ),
              child: Icon(icon, size: 24, color: AppColors.primaryDarkNavy),
            ),
            const SizedBox(height: 8),
            Text(
              label,
              style: AppTypography.caption.copyWith(
                fontWeight: FontWeight.bold,
                color: AppColors.primaryDarkNavy,
                fontSize: 12,
              ),
              textAlign: TextAlign.center,
            ),
          ],
        ),
      ),
    );
  }

  Widget _buildActivityTile({
    required IconData icon,
    required Color iconColor,
    required Color iconBg,
    required String title,
    required String subtitle,
  }) {
    return Padding(
      padding: const EdgeInsets.all(14),
      child: Row(
        children: [
          Container(
            padding: const EdgeInsets.all(10),
            decoration: BoxDecoration(
              color: iconBg,
              shape: BoxShape.circle,
            ),
            child: Icon(icon, size: 20, color: iconColor),
          ),
          const SizedBox(width: 12),
          Expanded(
            child: Column(
              crossAxisAlignment: CrossAxisAlignment.start,
              children: [
                Text(
                  title,
                  style: AppTypography.bodyMedium.copyWith(
                    fontWeight: FontWeight.bold,
                    color: AppColors.primaryDarkNavy,
                    fontSize: 14,
                  ),
                ),
                const SizedBox(height: 2),
                Text(
                  subtitle,
                  style: AppTypography.caption.copyWith(
                    color: AppColors.textMuted,
                    fontSize: 12,
                  ),
                ),
              ],
            ),
          ),
        ],
      ),
    );
  }
}

