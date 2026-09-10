import 'package:flutter/material.dart';
import 'package:flutter/services.dart';
import '../../../../core/repositories/repositories.dart';
import '../../../../core/theme/app_colors.dart';
import '../../../../core/theme/app_tokens.dart';
import '../../../../core/theme/app_typography.dart';
import '../../../auth/presentation/role_selector_screen.dart';
import 'notifications_screen.dart';
import 'resident_profile_screen.dart';
import 'safety_sos_screen.dart';
import 'settings_screen.dart';
import 'support_tickets_screen.dart';

class MoreTab extends StatelessWidget {
  final Function(int tabIndex)? onNavigateToTab;

  const MoreTab({
    super.key,
    this.onNavigateToTab,
  });

  void _pushScreen(BuildContext context, Widget screen) {
    HapticFeedback.lightImpact();
    Navigator.of(context).push(
      MaterialPageRoute(builder: (context) => screen),
    );
  }

  @override
  Widget build(BuildContext context) {
    final resident = ResidentRepository.getCanonicalResident();
    final society = SocietyRepository.currentSociety;
    final unreadNotifs = NotificationRepository.getUnreadCount();

    return SingleChildScrollView(
      padding: const EdgeInsets.all(AppSpacing.lg),
      child: Column(
        crossAxisAlignment: CrossAxisAlignment.start,
        children: [
          // Header Row
          Column(
            crossAxisAlignment: CrossAxisAlignment.start,
            children: [
              Text('More & Account Hub', style: AppTypography.displayHeading.copyWith(fontSize: 20)),
              Text('Tower B · Flat 1204 • Green Valley Society', style: AppTypography.caption),
            ],
          ),

          const SizedBox(height: AppSpacing.lg),

          // Profile Header Tile
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
            child: InkWell(
              onTap: () => _pushScreen(context, const ResidentProfileScreen()),
              borderRadius: BorderRadius.circular(AppRadius.lg),
              child: Padding(
                padding: const EdgeInsets.all(AppSpacing.lg),
                child: Row(
                  children: [
                    Container(
                      width: 48,
                      height: 48,
                      decoration: const BoxDecoration(
                        color: AppColors.brandBlue,
                        shape: BoxShape.circle,
                      ),
                      child: const Center(
                        child: Text(
                          'SK',
                          style: TextStyle(color: Colors.white, fontWeight: FontWeight.w800, fontSize: 18),
                        ),
                      ),
                    ),
                    const SizedBox(width: AppSpacing.md),
                    Expanded(
                      child: Column(
                        crossAxisAlignment: CrossAxisAlignment.start,
                        children: [
                          Text(resident.name, style: AppTypography.titleMedium.copyWith(color: Colors.white, fontWeight: FontWeight.bold)),
                          Text('${resident.canonicalDisplay} • ${society.name}', style: AppTypography.caption.copyWith(color: Colors.blue.shade200)),
                          const SizedBox(height: 4),
                          Text('Tap to view profile, vehicles & family roster', style: AppTypography.caption.copyWith(color: Colors.white70, fontSize: 10)),
                        ],
                      ),
                    ),
                    const Icon(Icons.chevron_right_rounded, color: Colors.white70),
                  ],
                ),
              ),
            ),
          ),

          const SizedBox(height: AppSpacing.xl),

          // Section 1: Security & Emergency
          Text('SECURITY & EMERGENCY', style: AppTypography.badgeText.copyWith(color: AppColors.textMuted, letterSpacing: 1.1)),
          const SizedBox(height: AppSpacing.xs),

          Container(
            decoration: BoxDecoration(
              color: AppColors.crimsonDangerBg,
              borderRadius: AppRadius.borderLg,
              border: Border.all(color: AppColors.crimsonDanger.withAlpha(76)),
              boxShadow: AppShadows.cardShadow,
            ),
            child: InkWell(
              onTap: () => _pushScreen(context, const SafetySosScreen()),
              borderRadius: BorderRadius.circular(AppRadius.lg),
              child: Padding(
                padding: const EdgeInsets.all(AppSpacing.md),
                child: Row(
                  children: [
                    Container(
                      padding: const EdgeInsets.all(10),
                      decoration: const BoxDecoration(
                        color: AppColors.crimsonDanger,
                        shape: BoxShape.circle,
                      ),
                      child: const Icon(Icons.emergency_rounded, color: Colors.white, size: 22),
                    ),
                    const SizedBox(width: AppSpacing.md),
                    Expanded(
                      child: Column(
                        crossAxisAlignment: CrossAxisAlignment.start,
                        children: [
                          Text('Safety & Panic SOS Center', style: AppTypography.titleMedium.copyWith(color: AppColors.crimsonDanger, fontSize: 15, fontWeight: FontWeight.bold)),
                          Text('Trigger Panic SOS, emergency contacts & guidelines', style: AppTypography.caption.copyWith(color: AppColors.crimsonDanger)),
                        ],
                      ),
                    ),
                    const Icon(Icons.chevron_right_rounded, color: AppColors.crimsonDanger),
                  ],
                ),
              ),
            ),
          ),

          const SizedBox(height: AppSpacing.xl),

          // Section 2: Account & Operations
          Text('ACCOUNT & SOCIETY OPERATIONS', style: AppTypography.badgeText.copyWith(color: AppColors.textMuted, letterSpacing: 1.1)),
          const SizedBox(height: AppSpacing.xs),

          Container(
            decoration: BoxDecoration(
              color: Colors.white,
              borderRadius: AppRadius.borderLg,
              border: Border.all(color: AppColors.borderSubtle),
              boxShadow: AppShadows.cardShadow,
            ),
            child: Column(
              children: [
                _buildMenuTile(
                  icon: Icons.notifications_rounded,
                  iconColor: AppColors.brandBlue,
                  title: 'Notifications Hub',
                  subtitle: 'Gate alerts, payment reminders & announcements',
                  badgeCount: unreadNotifs > 0 ? unreadNotifs : null,
                  onTap: () => _pushScreen(context, const NotificationsScreen()),
                ),
                const Divider(height: 1, color: AppColors.borderSubtle),
                _buildMenuTile(
                  icon: Icons.support_agent_rounded,
                  iconColor: AppColors.amberWarning,
                  title: 'Helpdesk & Support Tickets',
                  subtitle: 'Plumbing, electrical & facility maintenance tickets',
                  onTap: () => _pushScreen(context, const SupportTicketsScreen()),
                ),
                const Divider(height: 1, color: AppColors.borderSubtle),
                _buildMenuTile(
                  icon: Icons.qr_code_scanner_rounded,
                  iconColor: AppColors.emeraldSuccess,
                  title: 'My Visitor Gate Passes',
                  subtitle: 'Active passcodes & visitor entry history',
                  onTap: () {
                    if (onNavigateToTab != null) {
                      onNavigateToTab!(1);
                    }
                  },
                ),
              ],
            ),
          ),

          const SizedBox(height: AppSpacing.xl),

          // Section 3: App & Preferences
          Text('APP & PREFERENCES', style: AppTypography.badgeText.copyWith(color: AppColors.textMuted, letterSpacing: 1.1)),
          const SizedBox(height: AppSpacing.xs),

          Container(
            decoration: BoxDecoration(
              color: Colors.white,
              borderRadius: AppRadius.borderLg,
              border: Border.all(color: AppColors.borderSubtle),
              boxShadow: AppShadows.cardShadow,
            ),
            child: Column(
              children: [
                _buildMenuTile(
                  icon: Icons.settings_rounded,
                  iconColor: AppColors.secondarySlate,
                  title: 'Settings & Preferences',
                  subtitle: 'Notification alerts & visitor preferences',
                  onTap: () => _pushScreen(context, const SettingsScreen()),
                ),
                const Divider(height: 1, color: AppColors.borderSubtle),
                _buildMenuTile(
                  icon: Icons.logout_rounded,
                  iconColor: AppColors.crimsonDanger,
                  title: 'Switch Role / Logout',
                  subtitle: 'Return to Role Selection or Login screen',
                  onTap: () {
                    HapticFeedback.mediumImpact();
                    Navigator.of(context).pushAndRemoveUntil(
                      MaterialPageRoute(builder: (context) => const RoleSelectorScreen()),
                      (route) => false,
                    );
                  },
                ),
              ],
            ),
          ),
        ],
      ),
    );
  }

  Widget _buildMenuTile({
    required IconData icon,
    required Color iconColor,
    required String title,
    required String subtitle,
    int? badgeCount,
    required VoidCallback onTap,
  }) {
    return ListTile(
      onTap: onTap,
      leading: Container(
        padding: const EdgeInsets.all(8),
        decoration: BoxDecoration(
          color: iconColor.withAlpha(25),
          shape: BoxShape.circle,
        ),
        child: Icon(icon, color: iconColor, size: 20),
      ),
      title: Row(
        children: [
          Expanded(
            child: Text(
              title,
              style: AppTypography.titleMedium.copyWith(fontSize: 14, color: AppColors.textPrimary, fontWeight: FontWeight.w600),
              overflow: TextOverflow.ellipsis,
            ),
          ),
          if (badgeCount != null) ...[
            const SizedBox(width: AppSpacing.xs),
            Container(
              padding: const EdgeInsets.symmetric(horizontal: 6, vertical: 2),
              decoration: const BoxDecoration(
                color: AppColors.crimsonDanger,
                shape: BoxShape.circle,
              ),
              child: Text(
                badgeCount.toString(),
                style: const TextStyle(color: Colors.white, fontSize: 10, fontWeight: FontWeight.bold),
              ),
            ),
          ],
        ],
      ),
      subtitle: Text(subtitle, style: AppTypography.caption.copyWith(color: AppColors.textMuted), overflow: TextOverflow.ellipsis),
      trailing: const Icon(Icons.chevron_right_rounded, color: AppColors.secondarySlate),
    );
  }
}
