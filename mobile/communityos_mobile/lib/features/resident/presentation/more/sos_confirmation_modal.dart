import 'package:flutter/material.dart';
import 'package:flutter/services.dart';
import '../../../../core/theme/app_colors.dart';
import '../../../../core/theme/app_tokens.dart';
import '../../../../core/theme/app_typography.dart';

class SosConfirmationModal extends StatelessWidget {
  final VoidCallback onConfirmSOS;

  const SosConfirmationModal({super.key, required this.onConfirmSOS});

  static Future<void> show(BuildContext context, {required VoidCallback onConfirmSOS}) {
    return showModalBottomSheet(
      context: context,
      isScrollControlled: true,
      backgroundColor: Colors.transparent,
      builder: (context) => SosConfirmationModal(onConfirmSOS: onConfirmSOS),
    );
  }

  @override
  Widget build(BuildContext context) {
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

          const SizedBox(height: AppSpacing.lg),

          // Alert Warning Shield Icon
          Center(
            child: Container(
              width: 64,
              height: 64,
              decoration: const BoxDecoration(
                color: AppColors.crimsonDangerBg,
                shape: BoxShape.circle,
              ),
              child: const Icon(
                Icons.warning_amber_rounded,
                color: AppColors.crimsonDanger,
                size: 40,
              ),
            ),
          ),

          const SizedBox(height: AppSpacing.md),

          Text(
            'Confirm Panic SOS Alert?',
            style: AppTypography.displayHeading.copyWith(fontSize: 20),
            textAlign: TextAlign.center,
          ),

          const SizedBox(height: AppSpacing.xs),

          Text(
            'This will broadcast a high-priority emergency panic signal to the Gate #1 Guard Terminal for Tower B · Flat 1204.',
            style: AppTypography.bodySmall,
            textAlign: TextAlign.center,
          ),

          const SizedBox(height: AppSpacing.md),

          // Prototype Disclaimer Banner
          Container(
            padding: const EdgeInsets.all(AppSpacing.sm),
            decoration: BoxDecoration(
              color: AppColors.amberWarningBg,
              borderRadius: BorderRadius.circular(AppRadius.md),
              border: Border.all(color: AppColors.amberWarning.withAlpha(60)),
            ),
            child: Row(
              children: [
                const Icon(Icons.info_outline_rounded, color: AppColors.amberWarning, size: 16),
                const SizedBox(width: AppSpacing.xs),
                Expanded(
                  child: Text(
                    'PROTOTYPE SIMULATION ONLY — No real police, fire, or emergency medical services will be dispatched.',
                    style: AppTypography.caption.copyWith(color: AppColors.amberWarning, fontSize: 10),
                  ),
                ),
              ],
            ),
          ),

          const SizedBox(height: AppSpacing.xl),

          // Action Buttons
          ElevatedButton.icon(
            onPressed: () {
              HapticFeedback.heavyImpact();
              Navigator.of(context).pop();
              onConfirmSOS();
            },
            icon: const Icon(Icons.emergency_rounded, size: 20),
            label: const Text('CONFIRM & DISPATCH PANIC SOS'),
            style: ElevatedButton.styleFrom(
              backgroundColor: AppColors.crimsonDanger,
              foregroundColor: Colors.white,
              padding: const EdgeInsets.symmetric(vertical: 16),
            ),
          ),

          const SizedBox(height: AppSpacing.sm),

          OutlinedButton(
            onPressed: () => Navigator.of(context).pop(),
            child: const Text('Cancel Request'),
          ),
        ],
      ),
    );
  }
}
