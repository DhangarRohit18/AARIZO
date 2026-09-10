import 'package:flutter/material.dart';
import '../../../../core/models/models.dart';
import '../../../../core/repositories/repositories.dart';
import '../../../../core/theme/app_colors.dart';
import '../../../../core/theme/app_tokens.dart';
import '../../../../core/theme/app_typography.dart';

class InsideCommunityScreen extends StatefulWidget {
  const InsideCommunityScreen({super.key});

  @override
  State<InsideCommunityScreen> createState() => _InsideCommunityScreenState();
}

class _InsideCommunityScreenState extends State<InsideCommunityScreen> {
  late List<GatePassModel> _insideVisitors;

  @override
  void initState() {
    super.initState();
    _refreshList();
  }

  void _refreshList() {
    setState(() {
      _insideVisitors = GatePassRepository.getInsideVisitors();
    });
  }

  void _onCheckOut(GatePassModel pass) {
    GatePassRepository.checkOutPass(pass.id);
    _refreshList();
    ScaffoldMessenger.of(context).showSnackBar(
      SnackBar(
        content: Text('✓ Checked Out ${pass.visitorName} from Gate #1'),
        backgroundColor: AppColors.primaryDarkNavy,
      ),
    );
  }

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      backgroundColor: AppColors.appBackground,
      appBar: AppBar(
        title: const Text('Active Inside Community Registry'),
        actions: [
          IconButton(
            onPressed: _refreshList,
            icon: const Icon(Icons.refresh_rounded),
            tooltip: 'Refresh List',
          ),
        ],
      ),
      body: SafeArea(
        child: Padding(
          padding: const EdgeInsets.all(AppSpacing.lg),
          child: Column(
            crossAxisAlignment: CrossAxisAlignment.start,
            children: [
              // Header Metrics Banner
              Container(
                width: double.infinity,
                padding: const EdgeInsets.all(AppSpacing.lg),
                decoration: BoxDecoration(
                  color: AppColors.skyBlueInfoBg,
                  borderRadius: AppRadius.borderLg,
                  border: Border.all(color: AppColors.brandBlue.withAlpha(50)),
                ),
                child: Row(
                  children: [
                    Container(
                      width: 44,
                      height: 44,
                      decoration: const BoxDecoration(
                        color: AppColors.brandBlue,
                        shape: BoxShape.circle,
                      ),
                      child: const Icon(Icons.groups_rounded, color: Colors.white, size: 24),
                    ),
                    const SizedBox(width: AppSpacing.md),
                    Expanded(
                      child: Column(
                        crossAxisAlignment: CrossAxisAlignment.start,
                        children: [
                          Text(
                            '${_insideVisitors.length} Visitors Currently Inside',
                            style: AppTypography.titleMedium.copyWith(color: AppColors.brandBlue),
                          ),
                          Text(
                            'Active on-premises registry for Green Valley Society',
                            style: AppTypography.bodySmall,
                          ),
                        ],
                      ),
                    ),
                  ],
                ),
              ),

              const SizedBox(height: AppSpacing.xl),

              Text(
                'ON-PREMISES VISITOR LOG',
                style: AppTypography.caption.copyWith(
                  letterSpacing: 1.2,
                  fontWeight: FontWeight.w700,
                  color: AppColors.textMuted,
                ),
              ),

              const SizedBox(height: AppSpacing.md),

              Expanded(
                child: _insideVisitors.isEmpty
                    ? Center(
                        child: Column(
                          mainAxisAlignment: MainAxisAlignment.center,
                          children: [
                            const Icon(Icons.no_accounts_outlined, size: 48, color: AppColors.textSubtle),
                            const SizedBox(height: AppSpacing.md),
                            Text('No active visitors inside community', style: AppTypography.titleMedium),
                            const SizedBox(height: 4),
                            Text(
                              'All verified visitors have been checked out.',
                              style: AppTypography.bodySmall.copyWith(color: AppColors.textMuted),
                            ),
                          ],
                        ),
                      )
                    : ListView.separated(
                        itemCount: _insideVisitors.length,
                        separatorBuilder: (context, index) => const SizedBox(height: AppSpacing.md),
                        itemBuilder: (context, index) {
                          final pass = _insideVisitors[index];
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
                                      radius: 20,
                                      backgroundColor: AppColors.primaryDarkNavy,
                                      child: Text(
                                        pass.visitorName.isNotEmpty ? pass.visitorName[0] : 'V',
                                        style: AppTypography.titleMedium.copyWith(color: Colors.white),
                                      ),
                                    ),
                                    const SizedBox(width: AppSpacing.md),
                                    Expanded(
                                      child: Column(
                                        crossAxisAlignment: CrossAxisAlignment.start,
                                        children: [
                                          Text(pass.visitorName, style: AppTypography.titleMedium),
                                          Text(
                                            '${pass.category} • Passcode: #${pass.passcode}',
                                            style: AppTypography.bodySmall,
                                          ),
                                        ],
                                      ),
                                    ),
                                    Container(
                                      padding: const EdgeInsets.symmetric(horizontal: 8, vertical: 3),
                                      decoration: BoxDecoration(
                                        color: AppColors.skyBlueInfoBg,
                                        borderRadius: AppRadius.borderSm,
                                        border: Border.all(color: AppColors.skyBlueInfo.withAlpha(76)),
                                      ),
                                      child: Text(
                                        'INSIDE',
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

                                // Operational Info
                                Row(
                                  mainAxisAlignment: MainAxisAlignment.spaceBetween,
                                  children: [
                                    Column(
                                      crossAxisAlignment: CrossAxisAlignment.start,
                                      children: [
                                        Text('Resident Host', style: AppTypography.caption.copyWith(color: AppColors.textMuted)),
                                        Text(pass.residentName, style: AppTypography.bodyMedium.copyWith(fontWeight: FontWeight.w600)),
                                      ],
                                    ),
                                    Column(
                                      crossAxisAlignment: CrossAxisAlignment.end,
                                      children: [
                                        Text('Destination Unit', style: AppTypography.caption.copyWith(color: AppColors.textMuted)),
                                        Text(pass.canonicalDisplay, style: AppTypography.bodyMedium.copyWith(fontWeight: FontWeight.w600)),
                                      ],
                                    ),
                                  ],
                                ),

                                const SizedBox(height: AppSpacing.lg),

                                // Check Out Action Button
                                SizedBox(
                                  width: double.infinity,
                                  height: 44,
                                  child: ElevatedButton.icon(
                                    onPressed: () => _onCheckOut(pass),
                                    icon: const Icon(Icons.logout_rounded, color: Colors.white, size: 18),
                                    label: Text('CHECK OUT VISITOR', style: AppTypography.buttonLabel),
                                    style: ElevatedButton.styleFrom(
                                      backgroundColor: AppColors.primaryDarkNavy,
                                      shape: const RoundedRectangleBorder(borderRadius: AppRadius.borderLg),
                                    ),
                                  ),
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
