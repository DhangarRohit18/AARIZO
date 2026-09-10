import 'package:flutter/material.dart';
import '../../../../core/models/models.dart';
import '../../../../core/theme/app_colors.dart';
import '../../../../core/theme/app_tokens.dart';
import '../../../../core/theme/app_typography.dart';

class AnnouncementDetailModal extends StatelessWidget {
  final NoticeItemModel notice;

  const AnnouncementDetailModal({super.key, required this.notice});

  static Future<void> show(BuildContext context, NoticeItemModel notice) {
    return showModalBottomSheet(
      context: context,
      isScrollControlled: true,
      backgroundColor: Colors.transparent,
      builder: (context) => AnnouncementDetailModal(notice: notice),
    );
  }

  Color _getPriorityColor(String priority) {
    switch (priority.toLowerCase()) {
      case 'urgent':
        return AppColors.crimsonDanger;
      case 'important':
        return AppColors.amberWarning;
      default:
        return AppColors.brandBlue;
    }
  }

  @override
  Widget build(BuildContext context) {
    final priorityColor = _getPriorityColor(notice.priority);

    return Container(
      decoration: const BoxDecoration(
        color: AppColors.cardSurface,
        borderRadius: BorderRadius.vertical(top: Radius.circular(AppRadius.xl)),
      ),
      padding: EdgeInsets.only(
        left: AppSpacing.lg,
        right: AppSpacing.lg,
        top: AppSpacing.md,
        bottom: MediaQuery.of(context).padding.bottom + AppSpacing.lg,
      ),
      child: SingleChildScrollView(
        child: Column(
          mainAxisSize: MainAxisSize.min,
          crossAxisAlignment: CrossAxisAlignment.stretch,
          children: [
            // Handle Bar
            Center(
              child: Container(
                width: 36,
                height: 4,
                decoration: BoxDecoration(
                  color: AppColors.borderSubtle,
                  borderRadius: BorderRadius.circular(AppRadius.full),
                ),
              ),
            ),

            const SizedBox(height: AppSpacing.md),

            // Header Row
            Row(
              mainAxisAlignment: MainAxisAlignment.spaceBetween,
              children: [
                Container(
                  padding: const EdgeInsets.symmetric(horizontal: 8, vertical: 3),
                  decoration: BoxDecoration(
                    color: priorityColor.withAlpha(25),
                    borderRadius: BorderRadius.circular(AppRadius.sm),
                    border: Border.all(color: priorityColor.withAlpha(60)),
                  ),
                  child: Text(
                    '${notice.category.toUpperCase()} • ${notice.priority.toUpperCase()}',
                    style: AppTypography.badgeText.copyWith(
                      color: priorityColor,
                      fontWeight: FontWeight.w800,
                    ),
                  ),
                ),
                IconButton(
                  onPressed: () => Navigator.of(context).pop(),
                  icon: const Icon(Icons.close_rounded, color: AppColors.secondarySlate),
                ),
              ],
            ),

            const SizedBox(height: AppSpacing.sm),

            Text(
              notice.title,
              style: AppTypography.titleLarge.copyWith(fontSize: 18),
            ),

            const SizedBox(height: AppSpacing.xs),

            Text(
              'Published ${notice.publishedAt} by ${notice.authorName} (${notice.authorRole})',
              style: AppTypography.caption,
            ),

            const Divider(height: AppSpacing.lg),

            if (notice.effectiveDate != null || notice.locationArea != null) ...[
              Container(
                padding: const EdgeInsets.all(AppSpacing.md),
                decoration: BoxDecoration(
                  color: AppColors.appBackground,
                  borderRadius: BorderRadius.circular(AppRadius.md),
                  border: Border.all(color: AppColors.borderSubtle),
                ),
                child: Column(
                  children: [
                    if (notice.effectiveDate != null)
                      Row(
                        children: [
                          const Icon(Icons.schedule_rounded, size: 16, color: AppColors.brandBlue),
                          const SizedBox(width: AppSpacing.xs),
                          Text('Effective Time: ', style: AppTypography.caption.copyWith(fontWeight: FontWeight.w700)),
                          Text(notice.effectiveDate!, style: AppTypography.bodySmall),
                        ],
                      ),
                    if (notice.locationArea != null) ...[
                      if (notice.effectiveDate != null) const SizedBox(height: 6),
                      Row(
                        children: [
                          const Icon(Icons.place_rounded, size: 16, color: AppColors.amberWarning),
                          const SizedBox(width: AppSpacing.xs),
                          Text('Target Location: ', style: AppTypography.caption.copyWith(fontWeight: FontWeight.w700)),
                          Text(notice.locationArea!, style: AppTypography.bodySmall),
                        ],
                      ),
                    ],
                  ],
                ),
              ),
              const SizedBox(height: AppSpacing.md),
            ],

            Text(
              notice.content,
              style: AppTypography.bodyMedium.copyWith(height: 1.5),
            ),

            const SizedBox(height: AppSpacing.xl),

            ElevatedButton(
              onPressed: () => Navigator.of(context).pop(),
              child: const Text('Acknowledge & Close'),
            ),
          ],
        ),
      ),
    );
  }
}
