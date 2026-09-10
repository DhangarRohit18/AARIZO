import 'package:flutter/material.dart';
import '../../../../core/repositories/repositories.dart';
import '../../../../core/theme/app_colors.dart';
import '../../../../core/theme/app_tokens.dart';
import '../../../../core/theme/app_typography.dart';

class SecretaryNotificationsScreen extends StatefulWidget {
  const SecretaryNotificationsScreen({super.key});

  @override
  State<SecretaryNotificationsScreen> createState() => _SecretaryNotificationsScreenState();
}

class _SecretaryNotificationsScreenState extends State<SecretaryNotificationsScreen> {
  String _activeFilter = 'ALL'; // 'ALL' | 'UNREAD'

  @override
  Widget build(BuildContext context) {
    final notifications = SecretaryRepository.getNotifications();
    final filtered = notifications.where((n) {
      if (_activeFilter == 'UNREAD') return !n.isRead;
      return true;
    }).toList();

    return Scaffold(
      backgroundColor: AppColors.appBackground,
      appBar: AppBar(
        title: const Text('Secretary Notifications Hub'),
      ),
      body: SafeArea(
        child: Padding(
          padding: const EdgeInsets.all(AppSpacing.lg),
          child: Column(
            crossAxisAlignment: CrossAxisAlignment.start,
            children: [
              // Filter Chips
              Row(
                children: [
                  ChoiceChip(
                    label: Text('All (${notifications.length})'),
                    selected: _activeFilter == 'ALL',
                    selectedColor: AppColors.primaryDarkNavy,
                    labelStyle: TextStyle(
                      color: _activeFilter == 'ALL' ? Colors.white : AppColors.primaryDarkNavy,
                    ),
                    onSelected: (selected) {
                      if (selected) setState(() => _activeFilter = 'ALL');
                    },
                  ),
                  const SizedBox(width: AppSpacing.sm),
                  ChoiceChip(
                    label: Text('Unread (${notifications.where((n) => !n.isRead).length})'),
                    selected: _activeFilter == 'UNREAD',
                    selectedColor: AppColors.primaryDarkNavy,
                    labelStyle: TextStyle(
                      color: _activeFilter == 'UNREAD' ? Colors.white : AppColors.primaryDarkNavy,
                    ),
                    onSelected: (selected) {
                      if (selected) setState(() => _activeFilter = 'UNREAD');
                    },
                  ),
                ],
              ),

              const SizedBox(height: AppSpacing.lg),

              Expanded(
                child: filtered.isEmpty
                    ? Center(
                        child: Text(
                          'No notifications found.',
                          style: AppTypography.bodySmall.copyWith(color: AppColors.textMuted),
                        ),
                      )
                    : ListView.separated(
                        itemCount: filtered.length,
                        separatorBuilder: (context, index) => const SizedBox(height: AppSpacing.md),
                        itemBuilder: (context, index) {
                          final item = filtered[index];
                          return Container(
                            decoration: BoxDecoration(
                              color: item.isRead ? Colors.white : AppColors.skyBlueInfoBg,
                              borderRadius: AppRadius.borderLg,
                              border: Border.all(
                                color: item.isRead ? AppColors.borderSubtle : AppColors.skyBlueInfo,
                              ),
                              boxShadow: AppShadows.cardShadow,
                            ),
                            padding: const EdgeInsets.all(AppSpacing.md),
                            child: Column(
                              crossAxisAlignment: CrossAxisAlignment.start,
                              children: [
                                Row(
                                  children: [
                                    Container(
                                      padding: const EdgeInsets.symmetric(horizontal: 8, vertical: 2),
                                      decoration: BoxDecoration(
                                        color: item.priority == 'high'
                                            ? AppColors.crimsonDangerBg
                                            : AppColors.surfaceSubtle,
                                        borderRadius: AppRadius.borderSm,
                                      ),
                                      child: Text(
                                        item.category.toUpperCase(),
                                        style: AppTypography.caption.copyWith(
                                          color: item.priority == 'high'
                                              ? AppColors.crimsonDanger
                                              : AppColors.primaryDarkNavy,
                                          fontWeight: FontWeight.w800,
                                        ),
                                      ),
                                    ),
                                    const Spacer(),
                                    Text(
                                      item.timestamp,
                                      style: AppTypography.caption.copyWith(color: AppColors.textMuted),
                                    ),
                                  ],
                                ),
                                const SizedBox(height: AppSpacing.xs),
                                Text(item.title, style: AppTypography.titleMedium),
                                const SizedBox(height: 4),
                                Text(item.description, style: AppTypography.bodySmall),
                                if (!item.isRead) ...[
                                  const SizedBox(height: AppSpacing.sm),
                                  Align(
                                    alignment: Alignment.centerRight,
                                    child: TextButton(
                                      onPressed: () {
                                        setState(() {
                                          SecretaryRepository.markNotificationRead(item.id);
                                        });
                                      },
                                      child: const Text('Mark as Read'),
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
