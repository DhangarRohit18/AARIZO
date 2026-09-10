import 'package:flutter/material.dart';
import '../../../../core/models/models.dart';
import '../../../../core/repositories/repositories.dart';
import '../../../../core/theme/app_colors.dart';
import '../../../../core/theme/app_tokens.dart';
import '../../../../core/theme/app_typography.dart';

class IssueBillModal extends StatefulWidget {
  final VoidCallback onUpdated;

  const IssueBillModal({
    super.key,
    required this.onUpdated,
  });

  @override
  State<IssueBillModal> createState() => _IssueBillModalState();
}

class _IssueBillModalState extends State<IssueBillModal> {
  final TextEditingController _titleController = TextEditingController(text: 'October 2026 Maintenance Dues');
  final TextEditingController _cycleController = TextEditingController(text: 'Oct 2026');
  final TextEditingController _amountController = TextEditingController(text: '4250');
  final TextEditingController _dueDateController = TextEditingController(text: '2026-10-15');
  final TextEditingController _descriptionController = TextEditingController(
    text: 'Monthly society maintenance fee covering 24/7 security, housekeeping, lift maintenance, and water pumping.',
  );

  String _category = 'maintenance'; // 'maintenance' | 'parking' | 'amenity' | 'electricity'
  String _targetFlat = 'ALL'; // 'ALL' | '1204'

  @override
  void dispose() {
    _titleController.dispose();
    _cycleController.dispose();
    _amountController.dispose();
    _dueDateController.dispose();
    _descriptionController.dispose();
    super.dispose();
  }

  void _onIssueBill() {
    final amount = double.tryParse(_amountController.text.trim()) ?? 4250.0;

    final newBill = BillingRecordModel(
      id: 'PAY-${DateTime.now().millisecondsSinceEpoch}',
      billNumber: 'BILL-2026-OCT-${_targetFlat == "ALL" ? "SOC" : "1204"}',
      accountReference: 'GVS-1204-OCT26',
      billingCycle: _cycleController.text.trim(),
      category: _category,
      title: _titleController.text.trim(),
      residentName: _targetFlat == 'ALL' ? 'All Society Residents' : 'Sarvesh Kulkarni',
      canonicalDisplay: _targetFlat == 'ALL' ? 'Entire Society (128 Units)' : 'Tower B · Flat 1204',
      totalAmount: amount,
      amountPaid: 0,
      outstandingAmount: amount,
      penaltyAmount: 0,
      dueDate: _dueDateController.text.trim(),
      status: 'DUE',
      description: _descriptionController.text.trim(),
      items: [
        BillingItemBreakdown(title: 'Base Maintenance Charge', amount: amount * 0.7),
        BillingItemBreakdown(title: 'Common Facilities & Security', amount: amount * 0.3),
      ],
    );

    SecretaryRepository.issueBill(newBill);
    widget.onUpdated();
    Navigator.of(context).pop();
    ScaffoldMessenger.of(context).showSnackBar(
      SnackBar(
        content: Text('✓ Bill "${newBill.title}" Dispatched Successfully!'),
        backgroundColor: AppColors.emeraldSuccess,
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
              Row(
                mainAxisAlignment: MainAxisAlignment.spaceBetween,
                children: [
                  Text('Issue Maintenance Bill', style: AppTypography.titleLarge),
                  IconButton(
                    onPressed: () => Navigator.of(context).pop(),
                    icon: const Icon(Icons.close_rounded, color: AppColors.secondarySlate),
                  ),
                ],
              ),

              const SizedBox(height: AppSpacing.md),

              Text('Bill Title', style: AppTypography.caption.copyWith(fontWeight: FontWeight.w700)),
              const SizedBox(height: 4),
              TextField(
                controller: _titleController,
                decoration: const InputDecoration(
                  filled: true,
                  fillColor: AppColors.surfaceSubtle,
                  border: OutlineInputBorder(borderRadius: AppRadius.borderMd),
                ),
              ),

              const SizedBox(height: AppSpacing.md),

              Row(
                children: [
                  Expanded(
                    child: Column(
                      crossAxisAlignment: CrossAxisAlignment.start,
                      children: [
                        Text('Billing Cycle', style: AppTypography.caption.copyWith(fontWeight: FontWeight.w700)),
                        const SizedBox(height: 4),
                        TextField(
                          controller: _cycleController,
                          decoration: const InputDecoration(
                            filled: true,
                            fillColor: AppColors.surfaceSubtle,
                            border: OutlineInputBorder(borderRadius: AppRadius.borderMd),
                          ),
                        ),
                      ],
                    ),
                  ),
                  const SizedBox(width: AppSpacing.md),
                  Expanded(
                    child: Column(
                      crossAxisAlignment: CrossAxisAlignment.start,
                      children: [
                        Text('Category', style: AppTypography.caption.copyWith(fontWeight: FontWeight.w700)),
                        const SizedBox(height: 4),
                        DropdownButtonFormField<String>(
                          initialValue: _category,
                          decoration: const InputDecoration(
                            filled: true,
                            fillColor: AppColors.surfaceSubtle,
                            border: OutlineInputBorder(borderRadius: AppRadius.borderMd),
                          ),
                          items: const [
                            DropdownMenuItem(value: 'maintenance', child: Text('Maintenance')),
                            DropdownMenuItem(value: 'parking', child: Text('Parking & EV')),
                            DropdownMenuItem(value: 'amenity', child: Text('Amenity Fee')),
                            DropdownMenuItem(value: 'electricity', child: Text('Electricity')),
                          ],
                          onChanged: (v) => setState(() => _category = v!),
                        ),
                      ],
                    ),
                  ),
                ],
              ),

              const SizedBox(height: AppSpacing.md),

              Row(
                children: [
                  Expanded(
                    child: Column(
                      crossAxisAlignment: CrossAxisAlignment.start,
                      children: [
                        Text('Target Scope', style: AppTypography.caption.copyWith(fontWeight: FontWeight.w700)),
                        const SizedBox(height: 4),
                        DropdownButtonFormField<String>(
                          initialValue: _targetFlat,
                          decoration: const InputDecoration(
                            filled: true,
                            fillColor: AppColors.surfaceSubtle,
                            border: OutlineInputBorder(borderRadius: AppRadius.borderMd),
                          ),
                          items: const [
                            DropdownMenuItem(value: 'ALL', child: Text('Entire Society (128 Flats)')),
                            DropdownMenuItem(value: '1204', child: Text('Flat 1204 (Sarvesh)')),
                          ],
                          onChanged: (v) => setState(() => _targetFlat = v!),
                        ),
                      ],
                    ),
                  ),
                  const SizedBox(width: AppSpacing.md),
                  Expanded(
                    child: Column(
                      crossAxisAlignment: CrossAxisAlignment.start,
                      children: [
                        Text('Total Amount (₹)', style: AppTypography.caption.copyWith(fontWeight: FontWeight.w700)),
                        const SizedBox(height: 4),
                        TextField(
                          controller: _amountController,
                          keyboardType: TextInputType.number,
                          decoration: const InputDecoration(
                            filled: true,
                            fillColor: AppColors.surfaceSubtle,
                            border: OutlineInputBorder(borderRadius: AppRadius.borderMd),
                          ),
                        ),
                      ],
                    ),
                  ),
                ],
              ),

              const SizedBox(height: AppSpacing.md),

              Text('Due Date', style: AppTypography.caption.copyWith(fontWeight: FontWeight.w700)),
              const SizedBox(height: 4),
              TextField(
                controller: _dueDateController,
                decoration: const InputDecoration(
                  hintText: 'YYYY-MM-DD',
                  filled: true,
                  fillColor: AppColors.surfaceSubtle,
                  border: OutlineInputBorder(borderRadius: AppRadius.borderMd),
                ),
              ),

              const SizedBox(height: AppSpacing.md),

              Text('Description', style: AppTypography.caption.copyWith(fontWeight: FontWeight.w700)),
              const SizedBox(height: 4),
              TextField(
                controller: _descriptionController,
                maxLines: 2,
                decoration: const InputDecoration(
                  filled: true,
                  fillColor: AppColors.surfaceSubtle,
                  border: OutlineInputBorder(borderRadius: AppRadius.borderMd),
                ),
              ),

              const SizedBox(height: AppSpacing.xl),

              SizedBox(
                width: double.infinity,
                height: 48,
                child: ElevatedButton.icon(
                  onPressed: _onIssueBill,
                  icon: const Icon(Icons.send_rounded, color: Colors.white, size: 18),
                  label: const Text('Dispatch Bill to Residents'),
                  style: ElevatedButton.styleFrom(
                    backgroundColor: AppColors.primaryDarkNavy,
                    shape: const RoundedRectangleBorder(borderRadius: AppRadius.borderLg),
                  ),
                ),
              ),
            ],
          ),
        ),
      ),
    );
  }
}
