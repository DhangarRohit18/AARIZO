import 'package:flutter/material.dart';
import '../../../../core/models/models.dart';
import '../../../../core/repositories/repositories.dart';
import '../../../../core/theme/app_colors.dart';
import '../../../../core/theme/app_tokens.dart';
import '../../../../core/theme/app_typography.dart';

class GuardActivityTab extends StatefulWidget {
  const GuardActivityTab({super.key});

  @override
  State<GuardActivityTab> createState() => _GuardActivityTabState();
}

class _GuardActivityTabState extends State<GuardActivityTab> {
  String _selectedFilter = 'all'; // 'all' | 'checked_in' | 'checked_out' | 'rejected'

  @override
  Widget build(BuildContext context) {
    final activities = GateActivityRepository.getActivities();

    final filteredActivities = activities.where((act) {
      if (_selectedFilter == 'all') return true;
      return act.status == _selectedFilter;
    }).toList();

    return Scaffold(
      backgroundColor: AppColors.appBackground,
      appBar: AppBar(
        title: const Text('Gate Activity Movement Feed'),
        actions: [
          IconButton(
            onPressed: () => setState(() {}),
            icon: const Icon(Icons.refresh_rounded),
            tooltip: 'Refresh Feed',
          ),
        ],
      ),
      body: SafeArea(
        child: Padding(
          padding: const EdgeInsets.all(AppSpacing.lg),
          child: Column(
            crossAxisAlignment: CrossAxisAlignment.start,
            children: [
              // Header Summary Banner
              Container(
                width: double.infinity,
                padding: const EdgeInsets.all(AppSpacing.md),
                decoration: BoxDecoration(
                  color: AppColors.primaryDarkNavy,
                  borderRadius: AppRadius.borderLg,
                ),
                child: Row(
                  children: [
                    Container(
                      width: 40,
                      height: 40,
                      decoration: const BoxDecoration(
                        color: AppColors.amberWarning,
                        shape: BoxShape.circle,
                      ),
                      child: const Icon(Icons.history_rounded, color: Colors.white, size: 22),
                    ),
                    const SizedBox(width: AppSpacing.md),
                    Expanded(
                      child: Column(
                        crossAxisAlignment: CrossAxisAlignment.start,
                        children: [
                          Text(
                            'Gate #1 Movement Log',
                            style: AppTypography.titleMedium.copyWith(color: Colors.white),
                          ),
                          Text(
                            'Logged by ${GuardRepository.officerName} • Green Valley Society',
                            style: AppTypography.bodySmall.copyWith(color: Colors.white.withAlpha(204)),
                          ),
                        ],
                      ),
                    ),
                  ],
                ),
              ),

              const SizedBox(height: AppSpacing.lg),

              // Filter Chips Row
              SingleChildScrollView(
                scrollDirection: Axis.horizontal,
                child: Row(
                  children: [
                    _buildFilterChip('All Events', 'all'),
                    const SizedBox(width: AppSpacing.sm),
                    _buildFilterChip('Check-Ins', 'checked_in'),
                    const SizedBox(width: AppSpacing.sm),
                    _buildFilterChip('Check-Outs', 'checked_out'),
                    const SizedBox(width: AppSpacing.sm),
                    _buildFilterChip('Rejections', 'rejected'),
                  ],
                ),
              ),

              const SizedBox(height: AppSpacing.lg),

              Text(
                'RECENT MOVEMENT LOGS (${filteredActivities.length})',
                style: AppTypography.caption.copyWith(
                  letterSpacing: 1.2,
                  fontWeight: FontWeight.w700,
                  color: AppColors.textMuted,
                ),
              ),

              const SizedBox(height: AppSpacing.md),

              // Activity Feed List
              Expanded(
                child: filteredActivities.isEmpty
                    ? Center(
                        child: Text(
                          'No activity events recorded for this filter.',
                          style: AppTypography.bodySmall.copyWith(color: AppColors.textMuted),
                        ),
                      )
                    : ListView.separated(
                        itemCount: filteredActivities.length,
                        separatorBuilder: (context, index) => const SizedBox(height: AppSpacing.md),
                        itemBuilder: (context, index) {
                          final act = filteredActivities[index];
                          return _ActivityCard(activity: act);
                        },
                      ),
              ),
            ],
          ),
        ),
      ),
    );
  }

  Widget _buildFilterChip(String label, String value) {
    final isSelected = _selectedFilter == value;
    return InkWell(
      onTap: () {
        setState(() {
          _selectedFilter = value;
        });
      },
      borderRadius: BorderRadius.circular(AppRadius.full),
      child: Container(
        padding: const EdgeInsets.symmetric(horizontal: 16, vertical: 8),
        decoration: BoxDecoration(
          color: isSelected ? AppColors.brandBlue : AppColors.surfaceSubtle,
          borderRadius: BorderRadius.circular(AppRadius.full),
          border: Border.all(
            color: isSelected ? AppColors.brandBlue : AppColors.borderSubtle,
          ),
        ),
        child: Text(
          label,
          style: TextStyle(
            color: isSelected ? Colors.white : AppColors.textPrimary,
            fontWeight: isSelected ? FontWeight.w700 : FontWeight.w500,
            fontSize: 12,
          ),
        ),
      ),
    );
  }
}

class _ActivityCard extends StatelessWidget {
  final GateActivityModel activity;

  const _ActivityCard({required this.activity});

  Color _getStatusColor(String status) {
    switch (status) {
      case 'checked_in':
        return AppColors.emeraldSuccess;
      case 'checked_out':
        return AppColors.brandBlue;
      case 'rejected':
        return AppColors.crimsonDanger;
      case 'cancelled':
        return AppColors.amberWarning;
      default:
        return AppColors.secondarySlate;
    }
  }

  Color _getStatusBg(String status) {
    switch (status) {
      case 'checked_in':
        return AppColors.emeraldSuccessBg;
      case 'checked_out':
        return AppColors.skyBlueInfoBg;
      case 'rejected':
        return AppColors.crimsonDangerBg;
      case 'cancelled':
        return AppColors.amberWarningBg;
      default:
        return AppColors.surfaceSubtle;
    }
  }

  IconData _getStatusIcon(String status) {
    switch (status) {
      case 'checked_in':
        return Icons.login_rounded;
      case 'checked_out':
        return Icons.logout_rounded;
      case 'rejected':
        return Icons.block_rounded;
      case 'cancelled':
        return Icons.cancel_outlined;
      default:
        return Icons.history_rounded;
    }
  }

  @override
  Widget build(BuildContext context) {
    final statusColor = _getStatusColor(activity.status);
    final statusBg = _getStatusBg(activity.status);
    final statusIcon = _getStatusIcon(activity.status);

    return Container(
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
            children: [
              Container(
                width: 36,
                height: 36,
                decoration: BoxDecoration(color: statusBg, shape: BoxShape.circle),
                child: Icon(statusIcon, color: statusColor, size: 18),
              ),
              const SizedBox(width: AppSpacing.md),
              Expanded(
                child: Column(
                  crossAxisAlignment: CrossAxisAlignment.start,
                  children: [
                    Text(activity.visitorName, style: AppTypography.titleMedium),
                    Text(
                      '${activity.category} • Passcode: #${activity.passcode}',
                      style: AppTypography.bodySmall,
                    ),
                  ],
                ),
              ),
              Container(
                padding: const EdgeInsets.symmetric(horizontal: 8, vertical: 3),
                decoration: BoxDecoration(
                  color: statusBg,
                  borderRadius: AppRadius.borderSm,
                  border: Border.all(color: statusColor.withAlpha(76)),
                ),
                child: Text(
                  activity.status.replaceAll('_', ' ').toUpperCase(),
                  style: AppTypography.caption.copyWith(
                    color: statusColor,
                    fontWeight: FontWeight.w800,
                  ),
                ),
              ),
            ],
          ),

          const SizedBox(height: AppSpacing.md),
          const Divider(height: 1, color: AppColors.borderSubtle),
          const SizedBox(height: AppSpacing.md),

          Row(
            mainAxisAlignment: MainAxisAlignment.spaceBetween,
            children: [
              Column(
                crossAxisAlignment: CrossAxisAlignment.start,
                children: [
                  Text('Resident Host', style: AppTypography.caption.copyWith(color: AppColors.textMuted)),
                  Text(
                    '${activity.residentName} (${activity.canonicalDisplay})',
                    style: AppTypography.bodySmall.copyWith(fontWeight: FontWeight.w600),
                  ),
                ],
              ),
              Column(
                crossAxisAlignment: CrossAxisAlignment.end,
                children: [
                  Text('Time', style: AppTypography.caption.copyWith(color: AppColors.textMuted)),
                  Text(
                    activity.entryTime != 'N/A' ? activity.entryTime : activity.exitTime ?? 'N/A',
                    style: AppTypography.bodySmall.copyWith(fontWeight: FontWeight.w600),
                  ),
                ],
              ),
            ],
          ),

          if (activity.gateOfficer != null) ...[
            const SizedBox(height: AppSpacing.xs),
            Row(
              children: [
                const Icon(Icons.shield_outlined, size: 12, color: AppColors.textMuted),
                const SizedBox(width: 4),
                Text(
                  'Verified by: ${activity.gateOfficer}',
                  style: AppTypography.caption.copyWith(color: AppColors.textMuted, fontSize: 11),
                ),
              ],
            ),
          ],
        ],
      ),
    );
  }
}
