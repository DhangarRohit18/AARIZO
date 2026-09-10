import 'package:flutter/material.dart';
import '../../../../core/repositories/repositories.dart';
import '../../../../core/theme/app_colors.dart';
import '../../../../core/theme/app_tokens.dart';
import '../../../../core/theme/app_typography.dart';

class CommitteeRosterScreen extends StatelessWidget {
  const CommitteeRosterScreen({super.key});

  @override
  Widget build(BuildContext context) {
    final committee = SecretaryRepository.getCommittee();

    return Scaffold(
      backgroundColor: AppColors.appBackground,
      appBar: AppBar(
        title: const Text('Managing Committee Roster'),
      ),
      body: SafeArea(
        child: Padding(
          padding: const EdgeInsets.all(AppSpacing.lg),
          child: Column(
            crossAxisAlignment: CrossAxisAlignment.start,
            children: [
              // Header Banner
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
                        color: AppColors.brandBlue,
                        shape: BoxShape.circle,
                      ),
                      child: const Icon(Icons.badge_rounded, color: Colors.white, size: 22),
                    ),
                    const SizedBox(width: AppSpacing.md),
                    Expanded(
                      child: Column(
                        crossAxisAlignment: CrossAxisAlignment.start,
                        children: [
                          Text(
                            'Green Valley Managing Committee',
                            style: AppTypography.titleMedium.copyWith(color: Colors.white),
                          ),
                          Text(
                            'Elected Officers & Governing Body (2025–2027 Tenure)',
                            style: AppTypography.bodySmall.copyWith(color: Colors.white.withAlpha(204)),
                          ),
                        ],
                      ),
                    ),
                  ],
                ),
              ),

              const SizedBox(height: AppSpacing.lg),

              Text(
                'COMMITTEE OFFICERS (${committee.length})',
                style: AppTypography.caption.copyWith(
                  letterSpacing: 1.2,
                  fontWeight: FontWeight.w700,
                  color: AppColors.textMuted,
                ),
              ),

              const SizedBox(height: AppSpacing.md),

              Expanded(
                child: ListView.separated(
                  itemCount: committee.length,
                  separatorBuilder: (context, index) => const SizedBox(height: AppSpacing.md),
                  itemBuilder: (context, index) {
                    final member = committee[index];
                    return Container(
                      decoration: BoxDecoration(
                        color: Colors.white,
                        borderRadius: AppRadius.borderLg,
                        border: Border.all(color: AppColors.borderSubtle),
                        boxShadow: AppShadows.cardShadow,
                      ),
                      padding: const EdgeInsets.all(AppSpacing.lg),
                      child: Column(
                        crossAxisAlignment: CrossAxisAlignment.start,
                        children: [
                          Row(
                            children: [
                              CircleAvatar(
                                radius: 24,
                                backgroundColor: AppColors.brandBlue,
                                child: Text(
                                  member.name.isNotEmpty ? member.name[0] : 'M',
                                  style: AppTypography.titleLarge.copyWith(color: Colors.white),
                                ),
                              ),
                              const SizedBox(width: AppSpacing.md),
                              Expanded(
                                child: Column(
                                  crossAxisAlignment: CrossAxisAlignment.start,
                                  children: [
                                    Text(member.name, style: AppTypography.titleMedium),
                                    Text(member.canonicalDisplay, style: AppTypography.bodySmall),
                                  ],
                                ),
                              ),
                              Container(
                                padding: const EdgeInsets.symmetric(horizontal: 10, vertical: 4),
                                decoration: BoxDecoration(
                                  color: AppColors.skyBlueInfoBg,
                                  borderRadius: AppRadius.borderSm,
                                  border: Border.all(color: AppColors.brandBlue.withAlpha(76)),
                                ),
                                child: Text(
                                  member.designation.toUpperCase(),
                                  style: AppTypography.caption.copyWith(
                                    color: AppColors.brandBlue,
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
                            children: [
                              const Icon(Icons.phone_outlined, size: 14, color: AppColors.brandBlue),
                              const SizedBox(width: 6),
                              Text(member.phone, style: AppTypography.bodySmall),
                            ],
                          ),
                          const SizedBox(height: 4),
                          Row(
                            children: [
                              const Icon(Icons.email_outlined, size: 14, color: AppColors.brandBlue),
                              const SizedBox(width: 6),
                              Text(member.email, style: AppTypography.bodySmall),
                            ],
                          ),
                          const SizedBox(height: 4),
                          Row(
                            children: [
                              const Icon(Icons.calendar_today_outlined, size: 14, color: AppColors.emeraldSuccess),
                              const SizedBox(width: 6),
                              Text(
                                'Tenure: ${member.termDuration}',
                                style: AppTypography.caption.copyWith(color: AppColors.emeraldSuccess, fontWeight: FontWeight.w600),
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
