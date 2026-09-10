import 'package:flutter/material.dart';
import 'package:flutter/services.dart';
import '../../../../core/models/models.dart';
import '../../../../core/repositories/repositories.dart';
import '../../../../core/theme/app_colors.dart';
import '../../../../core/theme/app_tokens.dart';
import '../../../../core/theme/app_typography.dart';

class NotificationsScreen extends StatefulWidget {
  const NotificationsScreen({super.key});

  @override
  State<NotificationsScreen> createState() => _NotificationsScreenState();
}

class _NotificationsScreenState extends State<NotificationsScreen> {
  List<ResidentNotificationModel> _notifications = [];
  String _activeFilter = 'All';

  @override
  void initState() {
    super.initState();
    _refreshNotifications();
  }

  void _refreshNotifications() {
    setState(() {
      _notifications = NotificationRepository.getNotifications();
    });
  }

  List<ResidentNotificationModel> get _filteredNotifications {
    if (_activeFilter == 'Unread') {
      return _notifications.where((n) => !n.isRead).toList();
    }
    if (_activeFilter == 'Gate & Security') {
      return _notifications.where((n) => n.category == 'visitor' || n.category == 'safety').toList();
    }
    if (_activeFilter == 'Notices & Dues') {
      return _notifications.where((n) => n.category == 'maintenance' || n.category == 'payment' || n.category == 'announcement').toList();
    }
    return _notifications;
  }

  IconData _getCategoryIcon(String category) {
    switch (category.toLowerCase()) {
      case 'visitor':
        return Icons.people_rounded;
      case 'maintenance':
        return Icons.build_rounded;
      case 'payment':
        return Icons.payments_rounded;
      case 'announcement':
        return Icons.campaign_rounded;
      case 'safety':
        return Icons.warning_amber_rounded;
      default:
        return Icons.notifications_rounded;
    }
  }

  Color _getCategoryColor(String category) {
    switch (category.toLowerCase()) {
      case 'visitor':
        return AppColors.brandBlue;
      case 'maintenance':
        return AppColors.amberWarning;
      case 'payment':
        return AppColors.emeraldSuccess;
      case 'announcement':
        return AppColors.skyBlueInfo;
      case 'safety':
        return AppColors.crimsonDanger;
      default:
        return AppColors.primarySlate;
    }
  }

  void _handleMarkAllRead() {
    HapticFeedback.lightImpact();
    NotificationRepository.markAllAsRead();
    _refreshNotifications();
    ScaffoldMessenger.of(context).showSnackBar(
      const SnackBar(
        content: Text('All notifications marked as read.'),
        backgroundColor: AppColors.brandBlue,
        behavior: SnackBarBehavior.floating,
      ),
    );
  }

  @override
  Widget build(BuildContext context) {
    final unreadCount = NotificationRepository.getUnreadCount();

    return Scaffold(
      backgroundColor: AppColors.appBackground,
      appBar: AppBar(
        title: const Text('Notifications Hub'),
        backgroundColor: AppColors.primaryDarkNavy,
        foregroundColor: Colors.white,
        elevation: 0,
        leading: IconButton(
          icon: const Icon(Icons.arrow_back_ios_new_rounded, size: 20),
          onPressed: () => Navigator.of(context).pop(),
        ),
        actions: [
          if (unreadCount > 0)
            TextButton.icon(
              onPressed: _handleMarkAllRead,
              icon: const Icon(Icons.done_all_rounded, size: 18, color: Colors.white),
              label: const Text('Mark All Read', style: TextStyle(color: Colors.white, fontSize: 12)),
            ),
        ],
      ),
      body: SingleChildScrollView(
        padding: const EdgeInsets.all(AppSpacing.lg),
        child: Column(
          crossAxisAlignment: CrossAxisAlignment.start,
          children: [
            // Filter Chips
            SingleChildScrollView(
              scrollDirection: Axis.horizontal,
              child: Row(
                children: ['All', 'Unread', 'Gate & Security', 'Notices & Dues'].map((filter) {
                  final isSelected = _activeFilter == filter;
                  return Padding(
                    padding: const EdgeInsets.only(right: AppSpacing.sm),
                    child: ChoiceChip(
                      label: Text(filter),
                      selected: isSelected,
                      onSelected: (selected) {
                        if (selected) {
                          HapticFeedback.selectionClick();
                          setState(() {
                            _activeFilter = filter;
                          });
                        }
                      },
                      selectedColor: AppColors.brandBlue,
                      labelStyle: TextStyle(
                        color: isSelected ? Colors.white : AppColors.primarySlate,
                        fontWeight: isSelected ? FontWeight.w700 : FontWeight.normal,
                      ),
                    ),
                  );
                }).toList(),
              ),
            ),

            const SizedBox(height: AppSpacing.lg),

            // Notifications List
            if (_filteredNotifications.isEmpty)
              const Card(
                child: Padding(
                  padding: EdgeInsets.all(AppSpacing.xl),
                  child: Center(
                    child: Text('No notifications match the selected filter.'),
                  ),
                ),
              )
            else
              ListView.separated(
                shrinkWrap: true,
                physics: const NeverScrollableScrollPhysics(),
                itemCount: _filteredNotifications.length,
                separatorBuilder: (context, index) => const SizedBox(height: AppSpacing.sm),
                itemBuilder: (context, index) {
                  final notif = _filteredNotifications[index];
                  final catColor = _getCategoryColor(notif.category);

                  return Card(
                    color: notif.isRead ? Colors.white : AppColors.skyBlueInfoBg,
                    child: InkWell(
                      onTap: () {
                        NotificationRepository.markAsRead(notif.id);
                        _refreshNotifications();
                      },
                      borderRadius: BorderRadius.circular(AppRadius.lg),
                      child: Padding(
                        padding: const EdgeInsets.all(AppSpacing.md),
                        child: Row(
                          crossAxisAlignment: CrossAxisAlignment.start,
                          children: [
                            Container(
                              width: 40,
                              height: 40,
                              decoration: BoxDecoration(
                                color: catColor.withAlpha(25),
                                shape: BoxShape.circle,
                              ),
                              child: Icon(_getCategoryIcon(notif.category), color: catColor, size: 20),
                            ),
                            const SizedBox(width: AppSpacing.sm),
                            Expanded(
                              child: Column(
                                crossAxisAlignment: CrossAxisAlignment.start,
                                children: [
                                  Row(
                                    mainAxisAlignment: MainAxisAlignment.spaceBetween,
                                    children: [
                                      Expanded(
                                        child: Text(
                                          notif.title,
                                          style: AppTypography.titleMedium.copyWith(
                                            fontSize: 14,
                                            fontWeight: notif.isRead ? FontWeight.w600 : FontWeight.w800,
                                          ),
                                        ),
                                      ),
                                      Text(notif.timestamp, style: AppTypography.caption),
                                    ],
                                  ),
                                  const SizedBox(height: 2),
                                  Text(
                                    notif.message,
                                    style: AppTypography.bodySmall,
                                  ),
                                  if (notif.actionLabel != null) ...[
                                    const SizedBox(height: AppSpacing.xs),
                                    Text(
                                      '${notif.actionLabel} →',
                                      style: AppTypography.caption.copyWith(
                                        color: AppColors.brandBlue,
                                        fontWeight: FontWeight.w700,
                                      ),
                                    ),
                                  ],
                                ],
                              ),
                            ),
                            if (!notif.isRead) ...[
                              const SizedBox(width: AppSpacing.xs),
                              Container(
                                width: 8,
                                height: 8,
                                decoration: const BoxDecoration(
                                  color: AppColors.brandBlue,
                                  shape: BoxShape.circle,
                                ),
                              ),
                            ],
                          ],
                        ),
                      ),
                    ),
                  );
                },
              ),
          ],
        ),
      ),
    );
  }
}
