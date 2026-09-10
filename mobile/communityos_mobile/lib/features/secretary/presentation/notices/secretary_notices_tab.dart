import 'package:flutter/material.dart';
import '../../../../core/repositories/repositories.dart';
import '../../../../core/theme/app_colors.dart';
import '../../../../core/theme/app_tokens.dart';
import '../../../../core/theme/app_typography.dart';
import 'create_notice_modal.dart';

class SecretaryNoticesTab extends StatefulWidget {
  const SecretaryNoticesTab({super.key});

  @override
  State<SecretaryNoticesTab> createState() => _SecretaryNoticesTabState();
}

class _SecretaryNoticesTabState extends State<SecretaryNoticesTab> {
  String _statusFilter = 'ALL'; // 'ALL' | 'Published' | 'Draft'

  @override
  Widget build(BuildContext context) {
    final notices = SecretaryRepository.getNotices();
    final publishedCount = notices.where((n) => n.status == 'Published').length;
    final draftCount = notices.where((n) => n.status == 'Draft').length;

    final filteredNotices = notices.where((n) {
      if (_statusFilter == 'Published') return n.status == 'Published';
      if (_statusFilter == 'Draft') return n.status == 'Draft';
      return true;
    }).toList();

    return Scaffold(
      backgroundColor: AppColors.appBackground,
      appBar: AppBar(
        title: const Text('Notice Broadcasting Center'),
        actions: [
          IconButton(
            onPressed: () => setState(() {}),
            icon: const Icon(Icons.refresh_rounded),
          ),
        ],
      ),
      floatingActionButton: FloatingActionButton.extended(
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
        backgroundColor: AppColors.primaryDarkNavy,
        icon: const Icon(Icons.add_rounded, color: Colors.white),
        label: const Text('Create Broadcast', style: TextStyle(color: Colors.white, fontWeight: FontWeight.bold)),
      ),
      body: SafeArea(
        child: Padding(
          padding: const EdgeInsets.all(AppSpacing.lg),
          child: Column(
            crossAxisAlignment: CrossAxisAlignment.start,
            children: [
              // Metric Banner
              Row(
                children: [
                  Expanded(
                    child: Container(
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
                          Text('$publishedCount', style: AppTypography.displayHeading.copyWith(color: AppColors.brandBlue, fontSize: 24)),
                          Text('Published Notices', style: AppTypography.caption.copyWith(color: AppColors.textMuted)),
                        ],
                      ),
                    ),
                  ),
                  const SizedBox(width: AppSpacing.md),
                  Expanded(
                    child: Container(
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
                          Text('$draftCount', style: AppTypography.displayHeading.copyWith(color: AppColors.amberWarning, fontSize: 24)),
                          Text('Draft Notices Saved', style: AppTypography.caption.copyWith(color: AppColors.textMuted)),
                        ],
                      ),
                    ),
                  ),
                ],
              ),

              const SizedBox(height: AppSpacing.lg),

              // Filter Chips
              Row(
                children: [
                  ChoiceChip(
                    label: Text('All (${notices.length})'),
                    selected: _statusFilter == 'ALL',
                    selectedColor: AppColors.primaryDarkNavy,
                    labelStyle: TextStyle(color: _statusFilter == 'ALL' ? Colors.white : AppColors.primaryDarkNavy),
                    onSelected: (selected) {
                      if (selected) setState(() => _statusFilter = 'ALL');
                    },
                  ),
                  const SizedBox(width: AppSpacing.sm),
                  ChoiceChip(
                    label: Text('Published ($publishedCount)'),
                    selected: _statusFilter == 'Published',
                    selectedColor: AppColors.brandBlue,
                    labelStyle: TextStyle(color: _statusFilter == 'Published' ? Colors.white : AppColors.primaryDarkNavy),
                    onSelected: (selected) {
                      if (selected) setState(() => _statusFilter = 'Published');
                    },
                  ),
                  const SizedBox(width: AppSpacing.sm),
                  ChoiceChip(
                    label: Text('Drafts ($draftCount)'),
                    selected: _statusFilter == 'Draft',
                    selectedColor: AppColors.amberWarning,
                    labelStyle: TextStyle(color: _statusFilter == 'Draft' ? Colors.white : AppColors.primaryDarkNavy),
                    onSelected: (selected) {
                      if (selected) setState(() => _statusFilter = 'Draft');
                    },
                  ),
                ],
              ),

              const SizedBox(height: AppSpacing.md),

              Expanded(
                child: filteredNotices.isEmpty
                    ? Center(
                        child: Text(
                          'No notices found for this filter.',
                          style: AppTypography.bodySmall.copyWith(color: AppColors.textMuted),
                        ),
                      )
                    : ListView.separated(
                        itemCount: filteredNotices.length,
                        separatorBuilder: (context, index) => const SizedBox(height: AppSpacing.md),
                        itemBuilder: (context, index) {
                          final notice = filteredNotices[index];
                          final isDraft = notice.status == 'Draft';

                          return Container(
                            decoration: BoxDecoration(
                              color: Colors.white,
                              borderRadius: AppRadius.borderLg,
                              border: Border.all(
                                color: isDraft ? AppColors.amberWarning : AppColors.borderSubtle,
                                width: isDraft ? 1.5 : 1,
                              ),
                              boxShadow: AppShadows.cardShadow,
                            ),
                            padding: const EdgeInsets.all(AppSpacing.lg),
                            child: Column(
                              crossAxisAlignment: CrossAxisAlignment.start,
                              children: [
                                Row(
                                  mainAxisAlignment: MainAxisAlignment.spaceBetween,
                                  children: [
                                    Container(
                                      padding: const EdgeInsets.symmetric(horizontal: 8, vertical: 3),
                                      decoration: BoxDecoration(
                                        color: notice.priority == 'Urgent'
                                            ? AppColors.crimsonDangerBg
                                            : AppColors.skyBlueInfoBg,
                                        borderRadius: AppRadius.borderSm,
                                      ),
                                      child: Text(
                                        notice.priority.toUpperCase(),
                                        style: AppTypography.caption.copyWith(
                                          color: notice.priority == 'Urgent'
                                              ? AppColors.crimsonDanger
                                              : AppColors.brandBlue,
                                          fontWeight: FontWeight.w800,
                                        ),
                                      ),
                                    ),
                                    Container(
                                      padding: const EdgeInsets.symmetric(horizontal: 8, vertical: 3),
                                      decoration: BoxDecoration(
                                        color: isDraft ? AppColors.amberWarningBg : AppColors.emeraldSuccessBg,
                                        borderRadius: AppRadius.borderSm,
                                      ),
                                      child: Text(
                                        notice.status.toUpperCase(),
                                        style: AppTypography.caption.copyWith(
                                          color: isDraft ? AppColors.amberWarning : AppColors.emeraldSuccess,
                                          fontWeight: FontWeight.w800,
                                        ),
                                      ),
                                    ),
                                  ],
                                ),

                                const SizedBox(height: AppSpacing.md),

                                Text(notice.title, style: AppTypography.titleMedium),
                                const SizedBox(height: 4),
                                Text(notice.summary, style: AppTypography.bodySmall),

                                const SizedBox(height: AppSpacing.md),
                                const Divider(height: 1, color: AppColors.borderSubtle),
                                const SizedBox(height: AppSpacing.sm),

                                Row(
                                  mainAxisAlignment: MainAxisAlignment.spaceBetween,
                                  children: [
                                    Text(
                                      'Target: ${notice.locationArea ?? "All Blocks"}',
                                      style: AppTypography.caption.copyWith(color: AppColors.textMuted),
                                    ),
                                    Text(
                                      'Author: ${notice.authorName}',
                                      style: AppTypography.caption.copyWith(color: AppColors.textMuted),
                                    ),
                                  ],
                                ),
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
