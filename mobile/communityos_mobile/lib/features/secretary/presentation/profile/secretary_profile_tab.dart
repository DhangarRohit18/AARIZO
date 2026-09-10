import 'package:flutter/material.dart';
import '../../../../core/repositories/repositories.dart';
import '../../../../core/theme/app_colors.dart';
import '../../../../core/theme/app_tokens.dart';
import '../../../../core/theme/app_typography.dart';
import '../../../auth/presentation/role_selector_screen.dart';
import '../../../resident/presentation/resident_shell.dart';
import '../committee/committee_roster_screen.dart';

class SecretaryProfileTab extends StatelessWidget {
  const SecretaryProfileTab({super.key});

  void _onSwitchRole(BuildContext context) {
    Navigator.of(context).pushAndRemoveUntil(
      MaterialPageRoute(builder: (context) => const ResidentShell()),
      (route) => false,
    );
    ScaffoldMessenger.of(context).showSnackBar(
      const SnackBar(
        content: Text('Switched to Resident View (Sarvesh Kulkarni)'),
        backgroundColor: AppColors.brandBlue,
      ),
    );
  }

  void _onLogout(BuildContext context) {
    showDialog(
      context: context,
      builder: (context) => AlertDialog(
        title: const Text('Log Out of Secretary Portal'),
        content: const Text('Are you sure you want to log out and return to role selection?'),
        actions: [
          TextButton(
            onPressed: () => Navigator.of(context).pop(),
            child: const Text('Cancel'),
          ),
          ElevatedButton(
            onPressed: () {
              Navigator.of(context).pop();
              Navigator.of(context).pushAndRemoveUntil(
                MaterialPageRoute(builder: (context) => const RoleSelectorScreen()),
                (route) => false,
              );
            },
            style: ElevatedButton.styleFrom(backgroundColor: AppColors.primaryDarkNavy),
            child: const Text('Log Out'),
          ),
        ],
      ),
    );
  }

  @override
  Widget build(BuildContext context) {
    final residentsCount = SecretaryRepository.getResidents().length + 138;
    final committeeCount = SecretaryRepository.getCommittee().length;

    return Scaffold(
      backgroundColor: AppColors.appBackground,
      appBar: AppBar(
        title: const Text('Secretary Profile & Society Info'),
      ),
      body: SafeArea(
        child: SingleChildScrollView(
          padding: const EdgeInsets.all(AppSpacing.lg),
          child: Column(
            crossAxisAlignment: CrossAxisAlignment.start,
            children: [
              // Identity & Avatar Header Card (Matching secretary-profile.png.jpeg)
              Container(
                width: double.infinity,
                padding: const EdgeInsets.all(AppSpacing.xl),
                decoration: BoxDecoration(
                  color: Colors.white,
                  borderRadius: AppRadius.borderLg,
                  border: Border.all(color: AppColors.borderSubtle),
                  boxShadow: AppShadows.cardShadow,
                ),
                child: Column(
                  children: [
                    Stack(
                      alignment: Alignment.center,
                      children: [
                        Container(
                          width: 80,
                          height: 80,
                          decoration: const BoxDecoration(
                            color: AppColors.primaryDarkNavy,
                            shape: BoxShape.circle,
                          ),
                          child: Center(
                            child: Text(
                              'MU',
                              style: AppTypography.displayHeading.copyWith(color: Colors.white, fontSize: 28),
                            ),
                          ),
                        ),
                      ],
                    ),
                    const SizedBox(height: AppSpacing.md),
                    Text(
                      SecretaryRepository.secretaryName,
                      style: AppTypography.titleLarge.copyWith(fontSize: 22, fontWeight: FontWeight.bold),
                    ),
                    const SizedBox(height: AppSpacing.xs),
                    Container(
                      padding: const EdgeInsets.symmetric(horizontal: 10, vertical: 4),
                      decoration: BoxDecoration(
                        color: AppColors.emeraldSuccessBg,
                        borderRadius: AppRadius.borderFull,
                        border: Border.all(color: AppColors.emeraldSuccess.withAlpha(76)),
                      ),
                      child: Row(
                        mainAxisSize: MainAxisSize.min,
                        children: [
                          const Icon(Icons.verified_user_rounded, size: 14, color: AppColors.emeraldSuccess),
                          const SizedBox(width: 4),
                          Text(
                            'Secretary',
                            style: AppTypography.caption.copyWith(
                              color: AppColors.emeraldSuccess,
                              fontWeight: FontWeight.bold,
                            ),
                          ),
                        ],
                      ),
                    ),
                    const SizedBox(height: AppSpacing.lg),
                    const Divider(height: 1, color: AppColors.borderSubtle),
                    const SizedBox(height: AppSpacing.md),

                    // Information Rows with Round Icons
                    const _InfoRow(icon: Icons.phone_outlined, label: 'Phone Number', value: '+91 98200 12345'),
                    const SizedBox(height: AppSpacing.md),
                    const _InfoRow(icon: Icons.email_outlined, label: 'Email', value: 'mayuri@greenvalleysociety.org'),
                    const SizedBox(height: AppSpacing.md),
                    const _InfoRow(icon: Icons.apartment_rounded, label: 'Society', value: 'Green Valley Society'),
                    const SizedBox(height: AppSpacing.md),
                    const _InfoRow(icon: Icons.location_on_outlined, label: 'Location', value: 'Navi Mumbai, India'),
                    const SizedBox(height: AppSpacing.md),
                    const _InfoRow(icon: Icons.check_circle_outline_rounded, label: 'Status', value: 'ACTIVE', valueColor: AppColors.emeraldSuccess),
                  ],
                ),
              ),

              const SizedBox(height: AppSpacing.lg),

              // 4 Prototype Metric Summary Chips (Matching reference grid structure)
              Row(
                children: [
                  Expanded(
                    child: _buildMetricChip(
                      icon: Icons.home_work_outlined,
                      value: '4',
                      label: 'Blocks',
                      color: AppColors.brandBlue,
                    ),
                  ),
                  const SizedBox(width: AppSpacing.xs),
                  Expanded(
                    child: _buildMetricChip(
                      icon: Icons.groups_outlined,
                      value: '$residentsCount',
                      label: 'Residents',
                      color: AppColors.emeraldSuccess,
                    ),
                  ),
                  const SizedBox(width: AppSpacing.xs),
                  Expanded(
                    child: _buildMetricChip(
                      icon: Icons.error_outline_rounded,
                      value: '5',
                      label: 'Open Issues',
                      color: AppColors.amberWarning,
                    ),
                  ),
                  const SizedBox(width: AppSpacing.xs),
                  Expanded(
                    child: _buildMetricChip(
                      icon: Icons.badge_outlined,
                      value: '$committeeCount',
                      label: 'Committee',
                      color: AppColors.skyBlueInfo,
                    ),
                  ),
                ],
              ),

              const SizedBox(height: AppSpacing.lg),

              // Committee Members Shortcut Card
              Container(
                decoration: BoxDecoration(
                  color: Colors.white,
                  borderRadius: AppRadius.borderLg,
                  border: Border.all(color: AppColors.borderSubtle),
                ),
                child: ListTile(
                  leading: Container(
                    padding: const EdgeInsets.all(8),
                    decoration: BoxDecoration(
                      color: AppColors.skyBlueInfoBg,
                      borderRadius: AppRadius.borderMd,
                    ),
                    child: const Icon(Icons.people_alt_rounded, color: AppColors.brandBlue, size: 20),
                  ),
                  title: const Text('Committee Members', style: TextStyle(fontWeight: FontWeight.bold)),
                  subtitle: Text('$committeeCount Elected Officers • Term 2025–2027', style: const TextStyle(fontSize: 12)),
                  trailing: const Icon(Icons.chevron_right_rounded, color: AppColors.secondarySlate),
                  onTap: () {
                    Navigator.of(context).push(
                      MaterialPageRoute(builder: (context) => const CommitteeRosterScreen()),
                    );
                  },
                ),
              ),

              const SizedBox(height: AppSpacing.xl),

              // Account & Role Switch Action Buttons
              SizedBox(
                width: double.infinity,
                height: 48,
                child: OutlinedButton.icon(
                  onPressed: () => _onSwitchRole(context),
                  icon: const Icon(Icons.swap_horiz_rounded, color: AppColors.brandBlue),
                  label: const Text('Switch to Resident View (Sarvesh)'),
                  style: OutlinedButton.styleFrom(
                    side: const BorderSide(color: AppColors.brandBlue),
                    shape: const RoundedRectangleBorder(borderRadius: AppRadius.borderLg),
                  ),
                ),
              ),

              const SizedBox(height: AppSpacing.md),

              SizedBox(
                width: double.infinity,
                height: 48,
                child: ElevatedButton.icon(
                  onPressed: () => _onLogout(context),
                  icon: const Icon(Icons.logout_rounded, color: Colors.white),
                  label: const Text('Log Out of Secretary Portal'),
                  style: ElevatedButton.styleFrom(
                    backgroundColor: AppColors.crimsonDanger,
                    shape: const RoundedRectangleBorder(borderRadius: AppRadius.borderLg),
                  ),
                ),
              ),
            ],
          ),
        ),
      ),
    );
  }

  Widget _buildMetricChip({
    required IconData icon,
    required String value,
    required String label,
    required Color color,
  }) {
    return Container(
      padding: const EdgeInsets.symmetric(vertical: AppSpacing.md, horizontal: 4),
      decoration: BoxDecoration(
        color: Colors.white,
        borderRadius: AppRadius.borderMd,
        border: Border.all(color: AppColors.borderSubtle),
      ),
      child: Column(
        children: [
          Icon(icon, size: 20, color: color),
          const SizedBox(height: 4),
          Text(
            value,
            style: AppTypography.titleMedium.copyWith(fontWeight: FontWeight.bold, fontSize: 16),
          ),
          Text(
            label,
            style: AppTypography.caption.copyWith(color: AppColors.textMuted, fontSize: 10),
            textAlign: TextAlign.center,
          ),
        ],
      ),
    );
  }
}

class _InfoRow extends StatelessWidget {
  final IconData icon;
  final String label;
  final String value;
  final Color? valueColor;

  const _InfoRow({
    required this.icon,
    required this.label,
    required this.value,
    this.valueColor,
  });

  @override
  Widget build(BuildContext context) {
    return Row(
      children: [
        Container(
          width: 36,
          height: 36,
          decoration: BoxDecoration(
            color: AppColors.surfaceSubtle,
            borderRadius: AppRadius.borderMd,
          ),
          child: Icon(icon, size: 18, color: AppColors.secondarySlate),
        ),
        const SizedBox(width: AppSpacing.md),
        Expanded(
          child: Text(
            label,
            style: AppTypography.bodySmall.copyWith(color: AppColors.textMuted),
          ),
        ),
        Text(
          value,
          style: AppTypography.bodySmall.copyWith(
            fontWeight: FontWeight.bold,
            color: valueColor ?? AppColors.textPrimary,
          ),
        ),
      ],
    );
  }
}
