import 'package:flutter/material.dart';
import '../../../../core/models/models.dart';
import '../../../../core/repositories/repositories.dart';
import '../../../../core/theme/app_colors.dart';
import '../../../../core/theme/app_tokens.dart';
import '../../../../core/theme/app_typography.dart';

class ResidentApprovalModal extends StatefulWidget {
  final SecretaryResidentRecordModel resident;
  final VoidCallback onUpdated;

  const ResidentApprovalModal({
    super.key,
    required this.resident,
    required this.onUpdated,
  });

  @override
  State<ResidentApprovalModal> createState() => _ResidentApprovalModalState();
}

class _ResidentApprovalModalState extends State<ResidentApprovalModal> {
  bool _isRejecting = false;
  final TextEditingController _noteController = TextEditingController();
  final TextEditingController _customReasonController = TextEditingController();
  String _selectedReason = 'Invalid Ownership Document';

  final List<String> _rejectionReasons = [
    'Invalid Ownership Document',
    'Name Mismatch',
    'Unverified Rent Agreement',
    'Other',
  ];

  @override
  void dispose() {
    _noteController.dispose();
    _customReasonController.dispose();
    super.dispose();
  }

  void _onApprove() {
    final note = _noteController.text.trim();
    SecretaryRepository.approveResident(widget.resident.id, note.isNotEmpty ? note : null);
    widget.onUpdated();
    Navigator.of(context).pop();
    ScaffoldMessenger.of(context).showSnackBar(
      SnackBar(
        content: Text('✓ Resident ${widget.resident.name} Approved successfully!'),
        backgroundColor: AppColors.emeraldSuccess,
      ),
    );
  }

  void _onReject() {
    final reason = _selectedReason == 'Other'
        ? (_customReasonController.text.trim().isNotEmpty ? _customReasonController.text.trim() : 'KYC Requirements Not Met')
        : _selectedReason;

    SecretaryRepository.rejectResident(widget.resident.id, reason);
    widget.onUpdated();
    Navigator.of(context).pop();
    ScaffoldMessenger.of(context).showSnackBar(
      SnackBar(
        content: Text('Verification Rejected for ${widget.resident.name}'),
        backgroundColor: AppColors.crimsonDanger,
      ),
    );
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
        child: SingleChildScrollView(
          child: Column(
            mainAxisSize: MainAxisSize.min,
            crossAxisAlignment: CrossAxisAlignment.start,
            children: [
              // Header
              Row(
                mainAxisAlignment: MainAxisAlignment.spaceBetween,
                children: [
                  Text(
                    _isRejecting ? 'Reject Resident KYC' : 'Resident Approval Audit',
                    style: AppTypography.titleLarge,
                  ),
                  IconButton(
                    onPressed: () => Navigator.of(context).pop(),
                    icon: const Icon(Icons.close_rounded, color: AppColors.secondarySlate),
                  ),
                ],
              ),

              const SizedBox(height: AppSpacing.md),

              // Resident Info Box
              Container(
                width: double.infinity,
                padding: const EdgeInsets.all(AppSpacing.md),
                decoration: BoxDecoration(
                  color: AppColors.surfaceSubtle,
                  borderRadius: AppRadius.borderMd,
                  border: Border.all(color: AppColors.borderSubtle),
                ),
                child: Column(
                  crossAxisAlignment: CrossAxisAlignment.start,
                  children: [
                    Row(
                      mainAxisAlignment: MainAxisAlignment.spaceBetween,
                      children: [
                        Text(widget.resident.name, style: AppTypography.titleMedium),
                        Container(
                          padding: const EdgeInsets.symmetric(horizontal: 8, vertical: 2),
                          decoration: BoxDecoration(
                            color: AppColors.skyBlueInfoBg,
                            borderRadius: AppRadius.borderSm,
                          ),
                          child: Text(
                            widget.resident.type.toUpperCase(),
                            style: AppTypography.caption.copyWith(
                              color: AppColors.brandBlue,
                              fontWeight: FontWeight.w700,
                            ),
                          ),
                        ),
                      ],
                    ),
                    const SizedBox(height: 4),
                    Text(
                      '${widget.resident.canonicalDisplay} • Submitted: ${widget.resident.submittedAt}',
                      style: AppTypography.bodySmall,
                    ),
                    Text('Phone: ${widget.resident.phone}', style: AppTypography.bodySmall),
                  ],
                ),
              ),

              const SizedBox(height: AppSpacing.md),

              // Attached KYC Checklist
              Container(
                padding: const EdgeInsets.all(AppSpacing.md),
                decoration: BoxDecoration(
                  color: AppColors.skyBlueInfoBg,
                  borderRadius: AppRadius.borderMd,
                  border: Border.all(color: AppColors.skyBlueInfo.withAlpha(76)),
                ),
                child: Row(
                  children: [
                    const Icon(Icons.description_outlined, size: 18, color: AppColors.brandBlue),
                    const SizedBox(width: AppSpacing.sm),
                    Expanded(
                      child: Text(
                        'Attached Document: ${widget.resident.kycDocType ?? "National ID & Ownership Deed"}',
                        style: AppTypography.caption.copyWith(color: AppColors.brandBlue, fontWeight: FontWeight.w600),
                      ),
                    ),
                  ],
                ),
              ),

              const SizedBox(height: AppSpacing.lg),

              if (!_isRejecting) ...[
                // Approval Mode Form
                Text('Secretary Approval Note (Optional)', style: AppTypography.caption.copyWith(fontWeight: FontWeight.w700)),
                const SizedBox(height: 6),
                TextField(
                  controller: _noteController,
                  maxLines: 2,
                  decoration: const InputDecoration(
                    hintText: 'e.g. Verified flat sale deed with registrar records...',
                    filled: true,
                    fillColor: AppColors.surfaceSubtle,
                    border: OutlineInputBorder(borderRadius: AppRadius.borderMd),
                  ),
                ),
                const SizedBox(height: AppSpacing.xl),

                Row(
                  children: [
                    Expanded(
                      child: OutlinedButton(
                        onPressed: () => setState(() => _isRejecting = true),
                        style: OutlinedButton.styleFrom(
                          foregroundColor: AppColors.crimsonDanger,
                          side: const BorderSide(color: AppColors.crimsonDanger),
                          padding: const EdgeInsets.symmetric(vertical: 14),
                        ),
                        child: const Text('Reject KYC'),
                      ),
                    ),
                    const SizedBox(width: AppSpacing.md),
                    Expanded(
                      child: ElevatedButton(
                        onPressed: _onApprove,
                        style: ElevatedButton.styleFrom(
                          backgroundColor: AppColors.emeraldSuccess,
                          padding: const EdgeInsets.symmetric(vertical: 14),
                        ),
                        child: const Text('Approve Resident'),
                      ),
                    ),
                  ],
                ),
              ] else ...[
                // Rejection Mode Form
                Text('Select Rejection Reason', style: AppTypography.caption.copyWith(fontWeight: FontWeight.w700)),
                const SizedBox(height: 6),
                DropdownButtonFormField<String>(
                  initialValue: _selectedReason,
                  decoration: const InputDecoration(
                    filled: true,
                    fillColor: AppColors.surfaceSubtle,
                    border: OutlineInputBorder(borderRadius: AppRadius.borderMd),
                  ),
                  items: _rejectionReasons.map((reason) {
                    return DropdownMenuItem(value: reason, child: Text(reason, style: AppTypography.bodySmall));
                  }).toList(),
                  onChanged: (val) {
                    if (val != null) setState(() => _selectedReason = val);
                  },
                ),

                if (_selectedReason == 'Other') ...[
                  const SizedBox(height: AppSpacing.md),
                  TextField(
                    controller: _customReasonController,
                    decoration: const InputDecoration(
                      hintText: 'Enter custom rejection reason...',
                      filled: true,
                      fillColor: AppColors.surfaceSubtle,
                      border: OutlineInputBorder(borderRadius: AppRadius.borderMd),
                    ),
                  ),
                ],

                const SizedBox(height: AppSpacing.xl),

                Row(
                  children: [
                    Expanded(
                      child: TextButton(
                        onPressed: () => setState(() => _isRejecting = false),
                        child: const Text('Back to Review'),
                      ),
                    ),
                    const SizedBox(width: AppSpacing.md),
                    Expanded(
                      child: ElevatedButton(
                        onPressed: _onReject,
                        style: ElevatedButton.styleFrom(
                          backgroundColor: AppColors.crimsonDanger,
                          padding: const EdgeInsets.symmetric(vertical: 14),
                        ),
                        child: const Text('Confirm Rejection'),
                      ),
                    ),
                  ],
                ),
              ],
            ],
          ),
        ),
      ),
    );
  }
}
