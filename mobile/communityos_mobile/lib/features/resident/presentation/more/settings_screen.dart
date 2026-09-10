import 'package:flutter/material.dart';
import '../../../../core/repositories/repositories.dart';
import '../../../../core/theme/app_colors.dart';
import '../../../../core/theme/app_tokens.dart';
import '../../../../core/theme/app_typography.dart';

class SettingsScreen extends StatefulWidget {
  const SettingsScreen({super.key});

  @override
  State<SettingsScreen> createState() => _SettingsScreenState();
}

class _SettingsScreenState extends State<SettingsScreen> {
  bool _gateAlerts = SettingsRepository.gateEntryAlerts;
  bool _dueReminders = SettingsRepository.paymentDuesReminders;
  bool _communityNotices = SettingsRepository.communityBroadcasts;
  bool _autoApprove = SettingsRepository.autoApproveFrequentVisitors;
  bool _darkMode = SettingsRepository.isDarkMode;

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      backgroundColor: AppColors.appBackground,
      appBar: AppBar(
        title: const Text('Settings & Preferences'),
        backgroundColor: AppColors.primaryDarkNavy,
        foregroundColor: Colors.white,
        elevation: 0,
        leading: IconButton(
          icon: const Icon(Icons.arrow_back_ios_new_rounded, size: 20),
          onPressed: () => Navigator.of(context).pop(),
        ),
      ),
      body: ListView(
        padding: const EdgeInsets.all(AppSpacing.lg),
        children: [
          // Section 1: Notification Preferences
          Text('NOTIFICATION PREFERENCES', style: AppTypography.badgeText),
          const SizedBox(height: AppSpacing.xs),

          Card(
            child: Column(
              children: [
                SwitchListTile(
                  value: _gateAlerts,
                  onChanged: (val) {
                    setState(() {
                      _gateAlerts = val;
                      SettingsRepository.gateEntryAlerts = val;
                    });
                  },
                  title: const Text('Gate Visitor Entry Alerts'),
                  subtitle: const Text('Notify when visitor arrives or requests gate pass entry'),
                ),
                const Divider(height: 1),
                SwitchListTile(
                  value: _dueReminders,
                  onChanged: (val) {
                    setState(() {
                      _dueReminders = val;
                      SettingsRepository.paymentDuesReminders = val;
                    });
                  },
                  title: const Text('Maintenance & Dues Reminders'),
                  subtitle: const Text('Receive reminders before maintenance invoice due dates'),
                ),
                const Divider(height: 1),
                SwitchListTile(
                  value: _communityNotices,
                  onChanged: (val) {
                    setState(() {
                      _communityNotices = val;
                      SettingsRepository.communityBroadcasts = val;
                    });
                  },
                  title: const Text('Community Announcement Alerts'),
                  subtitle: const Text('Get urgent society broadcasts and RWA notices'),
                ),
              ],
            ),
          ),

          const SizedBox(height: AppSpacing.xl),

          // Section 2: Visitor Gate Preferences
          Text('GATE PASS & SECURITY PREFERENCES', style: AppTypography.badgeText),
          const SizedBox(height: AppSpacing.xs),

          Card(
            child: SwitchListTile(
              value: _autoApprove,
              onChanged: (val) {
                setState(() {
                  _autoApprove = val;
                  SettingsRepository.autoApproveFrequentVisitors = val;
                });
              },
              title: const Text('Auto-Approve Daily Frequent Visitors'),
              subtitle: const Text('Automatically generate gate pass for registered housekeeping staff'),
            ),
          ),

          const SizedBox(height: AppSpacing.xl),

          // Section 3: App Appearance
          Text('APP APPEARANCE & LOCAL PREFERENCES', style: AppTypography.badgeText),
          const SizedBox(height: AppSpacing.xs),

          Card(
            child: SwitchListTile(
              value: _darkMode,
              onChanged: (val) {
                setState(() {
                  _darkMode = val;
                  SettingsRepository.isDarkMode = val;
                });
              },
              title: const Text('Dark Mode Theme (Prototype)'),
              subtitle: const Text('Toggle high-contrast dark theme background'),
            ),
          ),

          const SizedBox(height: AppSpacing.xxl),

          // App Info Banner
          Center(
            child: Column(
              children: [
                const Icon(Icons.shield_outlined, color: AppColors.secondarySlate, size: 36),
                const SizedBox(height: AppSpacing.xs),
                Text('CommunityOS Mobile Edition', style: AppTypography.titleMedium.copyWith(fontSize: 14)),
                Text('Version 4.0.0-prototype • Flutter Native', style: AppTypography.caption),
                const SizedBox(height: 4),
                Text('Green Valley Society Edition', style: AppTypography.caption.copyWith(color: AppColors.brandBlue, fontWeight: FontWeight.w700)),
              ],
            ),
          ),
        ],
      ),
    );
  }
}
