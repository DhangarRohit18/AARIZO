import 'package:flutter/material.dart';
import 'package:flutter/services.dart';
import '../../../../core/models/models.dart';
import '../../../../core/repositories/repositories.dart';
import '../../../../core/theme/app_colors.dart';
import '../../../../core/theme/app_tokens.dart';
import '../../../../core/theme/app_typography.dart';
import 'qr_pass_painter.dart';

class PassDetailModal extends StatefulWidget {
  final GatePassModel pass;
  final VoidCallback? onPassUpdated;

  const PassDetailModal({
    super.key,
    required this.pass,
    this.onPassUpdated,
  });

  static Future<void> show(BuildContext context, GatePassModel pass, {VoidCallback? onPassUpdated}) {
    return showModalBottomSheet(
      context: context,
      isScrollControlled: true,
      backgroundColor: Colors.transparent,
      builder: (context) => PassDetailModal(
        pass: pass,
        onPassUpdated: onPassUpdated,
      ),
    );
  }

  @override
  State<PassDetailModal> createState() => _PassDetailModalState();
}

class _PassDetailModalState extends State<PassDetailModal> {
  late GatePassModel _currentPass;

  @override
  void initState() {
    super.initState();
    _currentPass = widget.pass;
  }

  void _handleCancelPass() {
    final success = GatePassRepository.cancelPass(_currentPass.id);
    if (success) {
      HapticFeedback.mediumImpact();
      setState(() {
        _currentPass = _currentPass.copyWith(status: 'cancelled');
      });
      if (widget.onPassUpdated != null) {
        widget.onPassUpdated!();
      }
      ScaffoldMessenger.of(context).showSnackBar(
        SnackBar(
          content: Text('Gate Pass passcode ${_currentPass.passcode} has been cancelled.'),
          backgroundColor: AppColors.crimsonDanger,
          behavior: SnackBarBehavior.floating,
        ),
      );
    }
  }

  void _handleSharePass() {
    HapticFeedback.lightImpact();
    Clipboard.setData(ClipboardData(
      text: 'CommunityOS Gate Pass\nVisitor: ${_currentPass.visitorName}\nPasscode: ${_currentPass.passcode}\nUnit: ${_currentPass.canonicalDisplay}\nSociety: Green Valley Society',
    ));
    ScaffoldMessenger.of(context).showSnackBar(
      const SnackBar(
        content: Text('Gate pass details & passcode copied to clipboard!'),
        backgroundColor: AppColors.emeraldSuccess,
        behavior: SnackBarBehavior.floating,
      ),
    );
  }

  Color _getStatusBadgeColor(String status) {
    switch (status.toLowerCase()) {
      case 'active':
        return AppColors.emeraldSuccess;
      case 'at_gate':
      case 'approval_required':
        return AppColors.amberWarning;
      case 'checked_in':
        return AppColors.skyBlueInfo;
      case 'cancelled':
      case 'expired':
      case 'rejected':
        return AppColors.secondarySlate;
      default:
        return AppColors.brandBlue;
    }
  }

  String _getStatusLabel(String status) {
    switch (status.toLowerCase()) {
      case 'active':
        return 'APPROVED & ACTIVE';
      case 'at_gate':
        return 'VISITOR AT GATE';
      case 'approval_required':
        return 'APPROVAL NEEDED';
      case 'checked_in':
        return 'INSIDE COMMUNITY';
      case 'checked_out':
        return 'CHECKED OUT';
      case 'cancelled':
        return 'PASS CANCELLED';
      case 'expired':
        return 'PASS EXPIRED';
      default:
        return status.toUpperCase();
    }
  }

  IconData _getCategoryIcon(String category) {
    switch (category.toLowerCase()) {
      case 'cab':
        return Icons.local_taxi_rounded;
      case 'delivery':
        return Icons.local_shipping_rounded;
      case 'service staff':
      case 'service':
        return Icons.construction_rounded;
      default:
        return Icons.people_rounded;
    }
  }

  @override
  Widget build(BuildContext context) {
    final statusColor = _getStatusBadgeColor(_currentPass.status);
    final isCanCancel = _currentPass.status == 'active' || _currentPass.status == 'at_gate' || _currentPass.status == 'approval_required';

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
            // Modal Handle Drag Bar
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

            // Modal Header
            Row(
              mainAxisAlignment: MainAxisAlignment.spaceBetween,
              children: [
                Row(
                  children: [
                    Container(
                      padding: const EdgeInsets.all(AppSpacing.sm),
                      decoration: BoxDecoration(
                        color: AppColors.brandBlue.withAlpha(20),
                        borderRadius: BorderRadius.circular(AppRadius.md),
                      ),
                      child: Icon(
                        _getCategoryIcon(_currentPass.category),
                        color: AppColors.brandBlue,
                        size: 20,
                      ),
                    ),
                    const SizedBox(width: AppSpacing.sm),
                    Column(
                      crossAxisAlignment: CrossAxisAlignment.start,
                      children: [
                        Text('Digital Gate Pass', style: AppTypography.titleMedium),
                        Text('Green Valley Society • Entry Gate #1', style: AppTypography.caption),
                      ],
                    ),
                  ],
                ),
                IconButton(
                  onPressed: () => Navigator.of(context).pop(),
                  icon: const Icon(Icons.close_rounded, color: AppColors.secondarySlate),
                  tooltip: 'Close Modal',
                ),
              ],
            ),

            const Divider(height: AppSpacing.lg),

            // Pass Status Header Banner
            Container(
              padding: const EdgeInsets.symmetric(horizontal: AppSpacing.md, vertical: AppSpacing.sm),
              decoration: BoxDecoration(
                color: statusColor.withAlpha(25),
                borderRadius: BorderRadius.circular(AppRadius.md),
                border: Border.all(color: statusColor.withAlpha(60)),
              ),
              child: Row(
                mainAxisAlignment: MainAxisAlignment.spaceBetween,
                children: [
                  Row(
                    children: [
                      Container(
                        width: 8,
                        height: 8,
                        decoration: BoxDecoration(
                          color: statusColor,
                          shape: BoxShape.circle,
                        ),
                      ),
                      const SizedBox(width: AppSpacing.sm),
                      Text(
                        _getStatusLabel(_currentPass.status),
                        style: AppTypography.badgeText.copyWith(
                          color: statusColor,
                          fontWeight: FontWeight.w700,
                        ),
                      ),
                    ],
                  ),
                  Text(
                    _currentPass.validUntil,
                    style: AppTypography.caption.copyWith(fontWeight: FontWeight.w600),
                  ),
                ],
              ),
            ),

            const SizedBox(height: AppSpacing.lg),

            // Central Passcode Banner & QR Graphic
            Card(
              elevation: 0,
              color: AppColors.primaryDarkNavy,
              shape: RoundedRectangleBorder(
                borderRadius: BorderRadius.circular(AppRadius.lg),
              ),
              child: Padding(
                padding: const EdgeInsets.all(AppSpacing.lg),
                child: Column(
                  children: [
                    Text(
                      'ENTRY PASSCODE',
                      style: AppTypography.badgeText.copyWith(
                        color: AppColors.secondarySlate,
                        letterSpacing: 1.2,
                      ),
                    ),

                    const SizedBox(height: AppSpacing.xs),

                    // Big Bold Passcode Number
                    SelectableText(
                      _currentPass.passcode,
                      style: AppTypography.displayHeading.copyWith(
                        fontSize: 36,
                        fontWeight: FontWeight.w900,
                        color: Colors.white,
                        letterSpacing: 6,
                      ),
                    ),

                    const SizedBox(height: AppSpacing.md),

                    // QR Code Graphics Container
                    Container(
                      width: 140,
                      height: 140,
                      padding: const EdgeInsets.all(AppSpacing.sm),
                      decoration: BoxDecoration(
                        color: Colors.white,
                        borderRadius: BorderRadius.circular(AppRadius.md),
                        boxShadow: [
                          BoxShadow(
                            color: Colors.black.withAlpha(40),
                            blurRadius: 10,
                            offset: const Offset(0, 4),
                          ),
                        ],
                      ),
                      child: CustomPaint(
                        painter: QrPassPainter(seedData: _currentPass.qrCodeData ?? _currentPass.passcode),
                      ),
                    ),

                    const SizedBox(height: AppSpacing.sm),

                    Text(
                      'PROTOTYPE QR REPRESENTATION',
                      style: AppTypography.caption.copyWith(
                        color: AppColors.secondarySlate,
                        fontSize: 10,
                        fontWeight: FontWeight.w600,
                        letterSpacing: 0.5,
                      ),
                    ),
                  ],
                ),
              ),
            ),

            const SizedBox(height: AppSpacing.lg),

            // Metadata Detail Grid
            Container(
              padding: const EdgeInsets.all(AppSpacing.md),
              decoration: BoxDecoration(
                color: AppColors.appBackground,
                borderRadius: BorderRadius.circular(AppRadius.lg),
                border: Border.all(color: AppColors.borderSubtle),
              ),
              child: Column(
                children: [
                  _buildDetailRow(
                    icon: Icons.person_rounded,
                    label: 'Visitor Name',
                    value: _currentPass.visitorName,
                    subValue: _currentPass.companyName ?? _currentPass.visitorPhone,
                  ),
                  const Divider(height: AppSpacing.md),
                  _buildDetailRow(
                    icon: Icons.home_work_rounded,
                    label: 'Destination Unit',
                    value: _currentPass.canonicalDisplay,
                    subValue: 'Resident: ${_currentPass.residentName}',
                  ),
                  const Divider(height: AppSpacing.md),
                  _buildDetailRow(
                    icon: Icons.schedule_rounded,
                    label: 'Expected Slot',
                    value: _currentPass.expectedDate ?? 'Today',
                    subValue: _currentPass.expectedTimeSlot ?? _currentPass.validUntil,
                  ),
                  if (_currentPass.notes != null && _currentPass.notes!.isNotEmpty) ...[
                    const Divider(height: AppSpacing.md),
                    _buildDetailRow(
                      icon: Icons.notes_rounded,
                      label: 'Visitor Notes',
                      value: _currentPass.notes!,
                    ),
                  ],
                ],
              ),
            ),

            const SizedBox(height: AppSpacing.xl),

            // Action Buttons
            Row(
              children: [
                Expanded(
                  child: OutlinedButton.icon(
                    onPressed: _handleSharePass,
                    icon: const Icon(Icons.share_rounded, size: 18),
                    label: const Text('Share Pass'),
                    style: OutlinedButton.styleFrom(
                      padding: const EdgeInsets.symmetric(vertical: 14),
                      shape: RoundedRectangleBorder(
                        borderRadius: BorderRadius.circular(AppRadius.md),
                      ),
                    ),
                  ),
                ),
                if (isCanCancel) ...[
                  const SizedBox(width: AppSpacing.md),
                  Expanded(
                    child: ElevatedButton.icon(
                      onPressed: _handleCancelPass,
                      icon: const Icon(Icons.block_rounded, size: 18),
                      label: const Text('Cancel Pass'),
                      style: ElevatedButton.styleFrom(
                        backgroundColor: AppColors.crimsonDangerBg,
                        foregroundColor: AppColors.crimsonDanger,
                        elevation: 0,
                        padding: const EdgeInsets.symmetric(vertical: 14),
                        shape: RoundedRectangleBorder(
                          borderRadius: BorderRadius.circular(AppRadius.md),
                          side: const BorderSide(color: AppColors.crimsonDanger),
                        ),
                      ),
                    ),
                  ),
                ],
              ],
            ),
          ],
        ),
      ),
    );
  }

  Widget _buildDetailRow({
    required IconData icon,
    required String label,
    required String value,
    String? subValue,
  }) {
    return Row(
      children: [
        Container(
          padding: const EdgeInsets.all(AppSpacing.xs + 2),
          decoration: BoxDecoration(
            color: AppColors.secondarySlate.withAlpha(20),
            shape: BoxShape.circle,
          ),
          child: Icon(icon, size: 16, color: AppColors.primarySlate),
        ),
        const SizedBox(width: AppSpacing.sm),
        Expanded(
          child: Column(
            crossAxisAlignment: CrossAxisAlignment.start,
            children: [
              Text(label, style: AppTypography.caption),
              Text(
                value,
                style: AppTypography.bodyMedium.copyWith(fontWeight: FontWeight.w600),
              ),
              if (subValue != null)
                Text(
                  subValue,
                  style: AppTypography.bodySmall,
                ),
            ],
          ),
        ),
      ],
    );
  }
}
