import 'package:flutter/material.dart';
import '../../../../core/models/models.dart';
import '../../../../core/repositories/repositories.dart';
import '../../../../core/theme/app_colors.dart';
import '../../../../core/theme/app_tokens.dart';
import '../../../../core/theme/app_typography.dart';

class VisitorDecisionModal extends StatefulWidget {
  final GatePassModel pass;
  final VoidCallback onUpdated;

  const VisitorDecisionModal({
    super.key,
    required this.pass,
    required this.onUpdated,
  });

  @override
  State<VisitorDecisionModal> createState() => _VisitorDecisionModalState();
}

class _VisitorDecisionModalState extends State<VisitorDecisionModal> {
  late GatePassModel _currentPass;
  bool _showRejectionReason = false;
  String _selectedReason = 'Invalid ID';

  final List<String> _rejectionReasons = [
    'Invalid ID',
    'Resident Unavailable',
    'Pass Expired',
    'Other',
  ];

  @override
  void initState() {
    super.initState();
    _currentPass = widget.pass;
  }

  void _onApprove() {
    GatePassRepository.approvePass(_currentPass.id);
    setState(() {
      _currentPass = _currentPass.copyWith(status: 'approved');
    });
    widget.onUpdated();
  }

  void _onCheckIn() {
    GatePassRepository.checkInPass(_currentPass.id);
    setState(() {
      _currentPass = _currentPass.copyWith(status: 'checked_in');
    });
    widget.onUpdated();
    ScaffoldMessenger.of(context).showSnackBar(
      SnackBar(
        content: Text('✓ Checked In ${widget.pass.visitorName} at Gate #1'),
        backgroundColor: AppColors.emeraldSuccess,
      ),
    );
  }

  void _onCheckOut() {
    GatePassRepository.checkOutPass(_currentPass.id);
    setState(() {
      _currentPass = _currentPass.copyWith(status: 'checked_out');
    });
    widget.onUpdated();
    ScaffoldMessenger.of(context).showSnackBar(
      SnackBar(
        content: Text('✓ Checked Out ${widget.pass.visitorName} at Gate #1'),
        backgroundColor: AppColors.primaryDarkNavy,
      ),
    );
    Navigator.of(context).pop();
  }

  void _onConfirmReject() {
    GatePassRepository.rejectPass(_currentPass.id, _selectedReason);
    setState(() {
      _currentPass = _currentPass.copyWith(status: 'rejected');
      _showRejectionReason = false;
    });
    widget.onUpdated();
    ScaffoldMessenger.of(context).showSnackBar(
      SnackBar(
        content: Text('Entry Rejected for ${widget.pass.visitorName}'),
        backgroundColor: AppColors.crimsonDanger,
      ),
    );
    Navigator.of(context).pop();
  }

  @override
  Widget build(BuildContext context) {
    final bottomInset = MediaQuery.of(context).viewInsets.bottom;

    return Padding(
      padding: EdgeInsets.only(bottom: bottomInset),
      child: Container(
        padding: const EdgeInsets.all(AppSpacing.xl),
        decoration: const BoxDecoration(
          color: Colors.white,
          borderRadius: BorderRadius.vertical(top: Radius.circular(AppRadius.xl)),
        ),
        child: Column(
          mainAxisSize: MainAxisSize.min,
          crossAxisAlignment: CrossAxisAlignment.start,
          children: [
            // Modal Header
            Row(
              mainAxisAlignment: MainAxisAlignment.spaceBetween,
              children: [
                Row(
                  children: [
                    Container(
                      padding: const EdgeInsets.symmetric(horizontal: 10, vertical: 4),
                      decoration: BoxDecoration(
                        color: AppColors.emeraldSuccessBg,
                        borderRadius: AppRadius.borderSm,
                        border: Border.all(color: AppColors.emeraldSuccess.withAlpha(76)),
                      ),
                      child: Row(
                        children: [
                          const Icon(Icons.verified_rounded, size: 14, color: AppColors.emeraldSuccess),
                          const SizedBox(width: 4),
                          Text(
                            'VERIFIED PASSCODE #${_currentPass.passcode}',
                            style: AppTypography.caption.copyWith(
                              color: AppColors.emeraldSuccess,
                              fontWeight: FontWeight.w700,
                            ),
                          ),
                        ],
                      ),
                    ),
                  ],
                ),
                IconButton(
                  onPressed: () => Navigator.of(context).pop(),
                  icon: const Icon(Icons.close_rounded, color: AppColors.secondarySlate),
                ),
              ],
            ),

            const SizedBox(height: AppSpacing.md),

            // Visitor Main Name & Category Tag
            Row(
              crossAxisAlignment: CrossAxisAlignment.start,
              children: [
                CircleAvatar(
                  radius: 26,
                  backgroundColor: AppColors.primaryDarkNavy,
                  child: Text(
                    _currentPass.visitorName.isNotEmpty ? _currentPass.visitorName[0] : 'V',
                    style: AppTypography.titleLarge.copyWith(color: Colors.white),
                  ),
                ),
                const SizedBox(width: AppSpacing.md),
                Expanded(
                  child: Column(
                    crossAxisAlignment: CrossAxisAlignment.start,
                    children: [
                      Text(
                        _currentPass.visitorName,
                        style: AppTypography.titleLarge.copyWith(fontSize: 20),
                      ),
                      const SizedBox(height: 2),
                      Row(
                        children: [
                          Container(
                            padding: const EdgeInsets.symmetric(horizontal: 8, vertical: 2),
                            decoration: BoxDecoration(
                              color: AppColors.surfaceSubtle,
                              borderRadius: AppRadius.borderSm,
                              border: Border.all(color: AppColors.borderSubtle),
                            ),
                            child: Text(
                              _currentPass.category,
                              style: AppTypography.caption.copyWith(
                                color: AppColors.primaryDarkNavy,
                                fontWeight: FontWeight.w700,
                              ),
                            ),
                          ),
                          if (_currentPass.companyName != null) ...[
                            const SizedBox(width: 6),
                            Text(
                              '• ${_currentPass.companyName}',
                              style: AppTypography.bodySmall,
                            ),
                          ],
                        ],
                      ),
                    ],
                  ),
                ),
              ],
            ),

            const SizedBox(height: AppSpacing.lg),

            const Divider(height: 1, color: AppColors.borderSubtle),

            const SizedBox(height: AppSpacing.lg),

            // Operational Details Table (Privacy Enforced!)
            Container(
              padding: const EdgeInsets.all(AppSpacing.md),
              decoration: BoxDecoration(
                color: AppColors.surfaceSubtle,
                borderRadius: AppRadius.borderMd,
                border: Border.all(color: AppColors.borderSubtle),
              ),
              child: Column(
                children: [
                  _OperationalRow(
                    label: 'Resident',
                    value: _currentPass.residentName,
                    icon: Icons.person_outline_rounded,
                  ),
                  const SizedBox(height: AppSpacing.xs),
                  _OperationalRow(
                    label: 'Destination',
                    value: _currentPass.canonicalDisplay,
                    icon: Icons.home_work_outlined,
                  ),
                  const SizedBox(height: AppSpacing.xs),
                  _OperationalRow(
                    label: 'Gate Terminal',
                    value: 'Gate #1 (Main North)',
                    icon: Icons.shield_outlined,
                  ),
                  const SizedBox(height: AppSpacing.xs),
                  _OperationalRow(
                    label: 'Pass Validity',
                    value: _currentPass.validUntil,
                    icon: Icons.access_time_rounded,
                  ),
                ],
              ),
            ),

            // Privacy Boundary Indicator Note
            const SizedBox(height: AppSpacing.sm),
            Row(
              children: [
                const Icon(Icons.lock_outline_rounded, size: 12, color: AppColors.textMuted),
                const SizedBox(width: 4),
                Text(
                  'CommunityOS Privacy Boundary: Resident personal contacts & vehicle tags hidden.',
                  style: AppTypography.caption.copyWith(color: AppColors.textMuted, fontSize: 11),
                ),
              ],
            ),

            const SizedBox(height: AppSpacing.xl),

            // Rejection Form if toggled
            if (_showRejectionReason) ...[
              Container(
                padding: const EdgeInsets.all(AppSpacing.md),
                decoration: BoxDecoration(
                  color: AppColors.crimsonDangerBg,
                  borderRadius: AppRadius.borderMd,
                  border: Border.all(color: AppColors.crimsonDanger.withAlpha(76)),
                ),
                child: Column(
                  crossAxisAlignment: CrossAxisAlignment.start,
                  children: [
                    Text(
                      'Select Rejection Reason for Audit:',
                      style: AppTypography.caption.copyWith(
                        color: AppColors.crimsonDanger,
                        fontWeight: FontWeight.w700,
                      ),
                    ),
                    const SizedBox(height: AppSpacing.sm),
                    DropdownButtonFormField<String>(
                      initialValue: _selectedReason,
                      isExpanded: true,
                      decoration: const InputDecoration(
                        filled: true,
                        fillColor: Colors.white,
                        contentPadding: EdgeInsets.symmetric(horizontal: 12, vertical: 8),
                        border: OutlineInputBorder(borderRadius: AppRadius.borderSm),
                      ),
                      items: _rejectionReasons
                          .map((r) => DropdownMenuItem(value: r, child: Text(r, style: AppTypography.bodySmall)))
                          .toList(),
                      onChanged: (val) {
                        if (val != null) {
                          setState(() {
                            _selectedReason = val;
                          });
                        }
                      },
                    ),
                    const SizedBox(height: AppSpacing.md),
                    Row(
                      children: [
                        Expanded(
                          child: OutlinedButton(
                            onPressed: () {
                              setState(() {
                                _showRejectionReason = false;
                              });
                            },
                            child: const Text('Cancel'),
                          ),
                        ),
                        const SizedBox(width: AppSpacing.sm),
                        Expanded(
                          child: ElevatedButton(
                            onPressed: _onConfirmReject,
                            style: ElevatedButton.styleFrom(backgroundColor: AppColors.crimsonDanger),
                            child: const Text('Confirm Reject'),
                          ),
                        ),
                      ],
                    ),
                  ],
                ),
              ),
              const SizedBox(height: AppSpacing.lg),
            ],

            // Contextual Action Buttons
            if (!_showRejectionReason) ...[
              if (_currentPass.status == 'active' ||
                  _currentPass.status == 'at_gate' ||
                  _currentPass.status == 'approval_required') ...[
                Row(
                  children: [
                    Expanded(
                      child: OutlinedButton.icon(
                        onPressed: () {
                          setState(() {
                            _showRejectionReason = true;
                          });
                        },
                        icon: const Icon(Icons.cancel_outlined, color: AppColors.crimsonDanger, size: 18),
                        label: Text(
                          'Reject Entry',
                          style: AppTypography.buttonLabel.copyWith(color: AppColors.crimsonDanger),
                        ),
                        style: OutlinedButton.styleFrom(
                          side: const BorderSide(color: AppColors.crimsonDanger),
                          padding: const EdgeInsets.symmetric(vertical: 14),
                        ),
                      ),
                    ),
                    const SizedBox(width: AppSpacing.md),
                    Expanded(
                      child: ElevatedButton.icon(
                        onPressed: _onApprove,
                        icon: const Icon(Icons.check_circle_outline_rounded, color: Colors.white, size: 18),
                        label: Text('Approve Pass', style: AppTypography.buttonLabel),
                        style: ElevatedButton.styleFrom(
                          backgroundColor: AppColors.emeraldSuccess,
                          padding: const EdgeInsets.symmetric(vertical: 14),
                        ),
                      ),
                    ),
                  ],
                ),
              ] else if (_currentPass.status == 'approved') ...[
                SizedBox(
                  width: double.infinity,
                  height: 50,
                  child: ElevatedButton.icon(
                    onPressed: _onCheckIn,
                    icon: const Icon(Icons.login_rounded, color: Colors.white, size: 20),
                    label: Text('Confirm Check In Visitor', style: AppTypography.buttonLabel),
                    style: ElevatedButton.styleFrom(
                      backgroundColor: AppColors.emeraldSuccess,
                      shape: const RoundedRectangleBorder(borderRadius: AppRadius.borderLg),
                    ),
                  ),
                ),
              ] else if (_currentPass.status == 'checked_in') ...[
                SizedBox(
                  width: double.infinity,
                  height: 50,
                  child: ElevatedButton.icon(
                    onPressed: _onCheckOut,
                    icon: const Icon(Icons.logout_rounded, color: Colors.white, size: 20),
                    label: Text('Check Out Visitor Now', style: AppTypography.buttonLabel),
                    style: ElevatedButton.styleFrom(
                      backgroundColor: AppColors.primaryDarkNavy,
                      shape: const RoundedRectangleBorder(borderRadius: AppRadius.borderLg),
                    ),
                  ),
                ),
              ] else ...[
                // Status is checked_out or rejected or cancelled
                Container(
                  width: double.infinity,
                  padding: const EdgeInsets.all(AppSpacing.md),
                  decoration: BoxDecoration(
                    color: AppColors.surfaceSubtle,
                    borderRadius: AppRadius.borderMd,
                  ),
                  child: Text(
                    'Pass Status: ${_currentPass.status.toUpperCase()}',
                    textAlign: TextAlign.center,
                    style: AppTypography.titleMedium.copyWith(color: AppColors.textMuted),
                  ),
                ),
              ],
            ],
          ],
        ),
      ),
    );
  }
}

class _OperationalRow extends StatelessWidget {
  final String label;
  final String value;
  final IconData icon;

  const _OperationalRow({
    required this.label,
    required this.value,
    required this.icon,
  });

  @override
  Widget build(BuildContext context) {
    return Row(
      children: [
        Icon(icon, size: 16, color: AppColors.secondarySlate),
        const SizedBox(width: 8),
        Text(
          '$label:',
          style: AppTypography.bodySmall.copyWith(color: AppColors.textMuted),
        ),
        const SizedBox(width: 8),
        Expanded(
          child: Text(
            value,
            textAlign: TextAlign.end,
            style: AppTypography.bodyMedium.copyWith(
              fontWeight: FontWeight.w600,
              color: AppColors.textPrimary,
            ),
          ),
        ),
      ],
    );
  }
}
