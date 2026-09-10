import 'package:flutter/material.dart';
import '../theme/app_colors.dart';
import '../theme/app_tokens.dart';
import '../theme/app_typography.dart';

enum AppBadgeVariant {
  success,
  warning,
  danger,
  info,
  neutral,
  accent,
}

class AppBadge extends StatelessWidget {
  final String label;
  final AppBadgeVariant variant;
  final IconData? icon;

  const AppBadge({
    super.key,
    required this.label,
    this.variant = AppBadgeVariant.neutral,
    this.icon,
  });

  factory AppBadge.fromStatus(String status) {
    final s = status.toUpperCase();
    if (s == 'APPROVED' || s == 'PAID' || s == 'ACTIVE' || s == 'CHECKED_OUT' || s == 'RESOLVED') {
      return AppBadge(label: status, variant: AppBadgeVariant.success);
    } else if (s == 'OVERDUE' || s == 'URGENT' || s == 'REJECTED' || s == 'HIGH' || s.contains('SOS')) {
      return AppBadge(label: status, variant: AppBadgeVariant.danger);
    } else if (s == 'DUE' || s == 'AT_GATE' || s == 'AT GATE' || s == 'PENDING' || s == 'IN_PROGRESS' || s == 'IMPORTANT') {
      return AppBadge(label: status, variant: AppBadgeVariant.warning);
    } else if (s == 'INSIDE' || s == 'INSIDE COMMUNITY' || s == 'CHECKED_IN' || s == 'INFO') {
      return AppBadge(label: status, variant: AppBadgeVariant.info);
    }
    return AppBadge(label: status, variant: AppBadgeVariant.neutral);
  }

  @override
  Widget build(BuildContext context) {
    final colors = _getVariantColors(variant);

    return Container(
      padding: const EdgeInsets.symmetric(horizontal: 8, vertical: 4),
      decoration: BoxDecoration(
        color: colors.bg,
        borderRadius: BorderRadius.circular(AppRadius.xs),
        border: Border.all(color: colors.border, width: 0.5),
      ),
      child: Row(
        mainAxisSize: MainAxisSize.min,
        children: [
          if (icon != null) ...[
            Icon(icon, size: 10, color: colors.text),
            const SizedBox(width: 4),
          ],
          Text(
            label.toUpperCase(),
            style: AppTypography.badgeText.copyWith(
              color: colors.text,
              fontSize: 10,
              fontWeight: FontWeight.w700,
            ),
          ),
        ],
      ),
    );
  }

  ({Color bg, Color text, Color border}) _getVariantColors(AppBadgeVariant variant) {
    switch (variant) {
      case AppBadgeVariant.success:
        return (
          bg: AppColors.emeraldSuccessBg,
          text: AppColors.emeraldSuccess,
          border: AppColors.emeraldSuccess.withValues(alpha: 0.2),
        );
      case AppBadgeVariant.warning:
        return (
          bg: AppColors.amberWarningBg,
          text: AppColors.amberWarning,
          border: AppColors.amberWarning.withValues(alpha: 0.2),
        );
      case AppBadgeVariant.danger:
        return (
          bg: AppColors.crimsonDangerBg,
          text: AppColors.crimsonDanger,
          border: AppColors.crimsonDanger.withValues(alpha: 0.2),
        );
      case AppBadgeVariant.info:
        return (
          bg: AppColors.skyBlueInfoBg,
          text: AppColors.skyBlueInfo,
          border: AppColors.skyBlueInfo.withValues(alpha: 0.2),
        );
      case AppBadgeVariant.accent:
        return (
          bg: const Color(0xFFEFF6FF),
          text: AppColors.brandBlue,
          border: AppColors.brandBlue.withValues(alpha: 0.2),
        );
      case AppBadgeVariant.neutral:
        return (
          bg: AppColors.surfaceSubtle,
          text: AppColors.textMuted,
          border: AppColors.borderSubtle,
        );
    }
  }
}
