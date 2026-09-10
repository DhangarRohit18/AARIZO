import 'package:flutter/material.dart';
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
    return SingleChildScrollView(
      child: Column(
        crossAxisAlignment: CrossAxisAlignment.start,
        children: [
          // 1. Sub-Header Banner (Matching Screenshot 2)
          Container(
            width: double.infinity,
            padding: const EdgeInsets.symmetric(horizontal: 16, vertical: 14),
            color: const Color(0xFFEBF5FF),
            child: Row(
              children: [
                Container(
                  width: 36,
                  height: 36,
                  decoration: const BoxDecoration(
                    color: Color(0xFFDBEAFE),
                    shape: BoxShape.circle,
                  ),
                  child: const Icon(Icons.arrow_back_rounded, color: AppColors.primaryDarkNavy, size: 20),
                ),
                const SizedBox(width: 12),
                Column(
                  crossAxisAlignment: CrossAxisAlignment.start,
                  children: [
                    Text(
                      'Profile',
                      style: AppTypography.titleLarge.copyWith(
                        fontSize: 20,
                        fontWeight: FontWeight.bold,
                        color: AppColors.primaryDarkNavy,
                      ),
                    ),
                    const Text(
                      'Green Valley Society',
                      style: TextStyle(
                        fontSize: 12,
                        color: AppColors.textMuted,
                        fontWeight: FontWeight.w500,
                      ),
                    ),
                  ],
                ),
              ],
            ),
          ),

          Padding(
            padding: const EdgeInsets.all(AppSpacing.lg),
            child: Column(
              crossAxisAlignment: CrossAxisAlignment.start,
              children: [
                // 2. Profile Details Card (Matching Screenshot 2)
                Container(
                  width: double.infinity,
                  padding: const EdgeInsets.all(20),
                  decoration: BoxDecoration(
                    color: Colors.white,
                    borderRadius: BorderRadius.circular(20),
                    border: Border.all(color: const Color(0xFFE2E8F0)),
                    boxShadow: AppShadows.cardShadow,
                  ),
                  child: Column(
                    children: [
                      Row(
                        mainAxisAlignment: MainAxisAlignment.spaceBetween,
                        crossAxisAlignment: CrossAxisAlignment.start,
                        children: [
                          Row(
                            children: [
                              Container(
                                width: 68,
                                height: 68,
                                decoration: const BoxDecoration(
                                  color: AppColors.primaryDarkNavy,
                                  shape: BoxShape.circle,
                                ),
                                child: const Center(
                                  child: Text(
                                    'MU',
                                    style: TextStyle(
                                      color: Colors.white,
                                      fontWeight: FontWeight.bold,
                                      fontSize: 22,
                                    ),
                                  ),
                                ),
                              ),
                              const SizedBox(width: 14),
                              Column(
                                crossAxisAlignment: CrossAxisAlignment.start,
                                children: [
                                  Text(
                                    'Mayuri Udar',
                                    style: AppTypography.titleLarge.copyWith(
                                      fontSize: 20,
                                      fontWeight: FontWeight.bold,
                                      color: AppColors.primaryDarkNavy,
                                    ),
                                  ),
                                  const SizedBox(height: 4),
                                  Container(
                                    padding: const EdgeInsets.symmetric(horizontal: 10, vertical: 3),
                                    decoration: BoxDecoration(
                                      color: const Color(0xFFDCFCE7),
                                      borderRadius: BorderRadius.circular(12),
                                    ),
                                    child: Row(
                                      mainAxisSize: MainAxisSize.min,
                                      children: const [
                                        Icon(Icons.verified_user_rounded, size: 12, color: Color(0xFF15803D)),
                                        SizedBox(width: 4),
                                        Text(
                                          'Secretary',
                                          style: TextStyle(
                                            color: Color(0xFF15803D),
                                            fontWeight: FontWeight.bold,
                                            fontSize: 11,
                                          ),
                                        ),
                                      ],
                                    ),
                                  ),
                                ],
                              ),
                            ],
                          ),
                          Container(
                            width: 36,
                            height: 36,
                            decoration: const BoxDecoration(
                              color: AppColors.primaryDarkNavy,
                              shape: BoxShape.circle,
                            ),
                            child: const Icon(Icons.edit_outlined, color: Colors.white, size: 18),
                          ),
                        ],
                      ),

                      const SizedBox(height: 20),
                      const Divider(height: 1, color: Color(0xFFF1F5F9)),
                      const SizedBox(height: 16),

                      // Info Rows
                      const _ProfileInfoRow(icon: Icons.phone_outlined, label: 'Phone Number', value: '9876543210'),
                      const SizedBox(height: 14),
                      const _ProfileInfoRow(icon: Icons.email_outlined, label: 'Email', value: 'mayuri@gmail.com'),
                      const SizedBox(height: 14),
                      const _ProfileInfoRow(icon: Icons.apartment_rounded, label: 'Society', value: 'Green Valley Society'),
                      const SizedBox(height: 14),
                      const _ProfileInfoRow(icon: Icons.location_on_outlined, label: 'Location', value: 'Navi Mumbai, India'),
                      const SizedBox(height: 14),
                      const _ProfileInfoRow(
                        icon: Icons.person_outline_rounded,
                        label: 'Status',
                        value: 'ACTIVE',
                        valueColor: Color(0xFF15803D),
                      ),
                    ],
                  ),
                ),

                const SizedBox(height: 16),

                // 3. Statistics 4-Grid (Matching Screenshot 2)
                Row(
                  children: [
                    Expanded(
                      child: _buildMetricCard(
                        icon: Icons.home_outlined,
                        value: '4',
                        label: 'Total Flats',
                      ),
                    ),
                    const SizedBox(width: 8),
                    Expanded(
                      child: _buildMetricCard(
                        icon: Icons.people_outline_rounded,
                        value: '520',
                        label: 'Residents',
                      ),
                    ),
                    const SizedBox(width: 8),
                    Expanded(
                      child: _buildMetricCard(
                        icon: Icons.error_outline_rounded,
                        value: '7',
                        label: 'Open Issues',
                      ),
                    ),
                    const SizedBox(width: 8),
                    Expanded(
                      child: _buildMetricCard(
                        icon: Icons.account_circle_outlined,
                        value: '13',
                        label: 'Staff',
                      ),
                    ),
                  ],
                ),

                const SizedBox(height: 16),

                // 4. Committee Members Card (Matching Screenshot 2)
                Container(
                  decoration: BoxDecoration(
                    color: Colors.white,
                    borderRadius: BorderRadius.circular(16),
                    border: Border.all(color: const Color(0xFFE2E8F0)),
                  ),
                  child: ListTile(
                    leading: Container(
                      padding: const EdgeInsets.all(10),
                      decoration: BoxDecoration(
                        color: const Color(0xFFF0F7FF),
                        borderRadius: BorderRadius.circular(12),
                      ),
                      child: const Icon(Icons.people_alt_rounded, color: AppColors.primaryDarkNavy, size: 22),
                    ),
                    title: const Text(
                      'Committee Members',
                      style: TextStyle(fontWeight: FontWeight.bold, color: AppColors.primaryDarkNavy, fontSize: 15),
                    ),
                    trailing: const Icon(Icons.chevron_right_rounded, color: Color(0xFF94A3B8)),
                    onTap: () {
                      Navigator.of(context).push(
                        MaterialPageRoute(builder: (context) => const CommitteeRosterScreen()),
                      );
                    },
                  ),
                ),

                const SizedBox(height: 24),

                // Switch Role & Logout Buttons
                SizedBox(
                  width: double.infinity,
                  height: 48,
                  child: OutlinedButton.icon(
                    onPressed: () => _onSwitchRole(context),
                    icon: const Icon(Icons.swap_horiz_rounded, color: AppColors.brandBlue),
                    label: const Text('Switch to Resident View (Sarvesh)'),
                    style: OutlinedButton.styleFrom(
                      side: const BorderSide(color: AppColors.brandBlue),
                      shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(12)),
                    ),
                  ),
                ),
                const SizedBox(height: 12),
                SizedBox(
                  width: double.infinity,
                  height: 48,
                  child: ElevatedButton.icon(
                    onPressed: () => _onLogout(context),
                    icon: const Icon(Icons.logout_rounded, color: Colors.white),
                    label: const Text('Log Out of Secretary Portal'),
                    style: ElevatedButton.styleFrom(
                      backgroundColor: AppColors.crimsonDanger,
                      shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(12)),
                    ),
                  ),
                ),

                const SizedBox(height: 80), // Bottom padding for FAB
              ],
            ),
          ),
        ],
      ),
    );
  }

  Widget _buildMetricCard({
    required IconData icon,
    required String value,
    required String label,
  }) {
    return Container(
      padding: const EdgeInsets.symmetric(vertical: 14, horizontal: 4),
      decoration: BoxDecoration(
        color: Colors.white,
        borderRadius: BorderRadius.circular(16),
        border: Border.all(color: const Color(0xFFE2E8F0)),
      ),
      child: Column(
        children: [
          Container(
            padding: const EdgeInsets.all(6),
            decoration: BoxDecoration(
              color: const Color(0xFFF8FAFC),
              shape: BoxShape.circle,
              border: Border.all(color: const Color(0xFFE2E8F0)),
            ),
            child: Icon(icon, size: 18, color: AppColors.primaryDarkNavy),
          ),
          const SizedBox(height: 6),
          Text(
            value,
            style: const TextStyle(fontWeight: FontWeight.bold, fontSize: 18, color: AppColors.primaryDarkNavy),
          ),
          const SizedBox(height: 2),
          Text(
            label,
            style: const TextStyle(color: AppColors.textMuted, fontSize: 10, fontWeight: FontWeight.w500),
            textAlign: TextAlign.center,
          ),
        ],
      ),
    );
  }
}

class _ProfileInfoRow extends StatelessWidget {
  final IconData icon;
  final String label;
  final String value;
  final Color? valueColor;

  const _ProfileInfoRow({
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
            color: const Color(0xFFF0F7FF),
            borderRadius: BorderRadius.circular(10),
          ),
          child: Icon(icon, size: 18, color: AppColors.primaryDarkNavy),
        ),
        const SizedBox(width: 14),
        Expanded(
          child: Text(
            label,
            style: const TextStyle(color: AppColors.textMuted, fontSize: 13, fontWeight: FontWeight.w500),
          ),
        ),
        Text(
          value,
          style: TextStyle(
            fontWeight: FontWeight.bold,
            fontSize: 13,
            color: valueColor ?? AppColors.primaryDarkNavy,
          ),
        ),
      ],
    );
  }
}

