import 'dart:math';
import 'package:flutter/material.dart';
import 'package:flutter/services.dart';
import '../../../../core/models/models.dart';
import '../../../../core/repositories/repositories.dart';
import '../../../../core/theme/app_colors.dart';
import '../../../../core/theme/app_tokens.dart';
import '../../../../core/theme/app_typography.dart';
import 'payment_success_modal.dart';

class PaymentCheckoutModal extends StatefulWidget {
  final BillingRecordModel bill;
  final VoidCallback onPaymentCompleted;

  const PaymentCheckoutModal({
    super.key,
    required this.bill,
    required this.onPaymentCompleted,
  });

  static Future<void> show(
    BuildContext context, {
    required BillingRecordModel bill,
    required VoidCallback onPaymentCompleted,
  }) {
    return showModalBottomSheet(
      context: context,
      isScrollControlled: true,
      backgroundColor: Colors.transparent,
      builder: (context) => PaymentCheckoutModal(
        bill: bill,
        onPaymentCompleted: onPaymentCompleted,
      ),
    );
  }

  @override
  State<PaymentCheckoutModal> createState() => _PaymentCheckoutModalState();
}

class _PaymentCheckoutModalState extends State<PaymentCheckoutModal> {
  String _selectedMethod = 'UPI / Google Pay';
  bool _isProcessing = false;

  final List<Map<String, dynamic>> _methods = [
    {
      'id': 'UPI / Google Pay',
      'title': 'Instant UPI (Google Pay / PhonePe)',
      'subtitle': 'Zero transaction fee • Instant settlement',
      'icon': Icons.qr_code_2_rounded,
      'color': AppColors.emeraldSuccess,
    },
    {
      'id': 'Net Banking',
      'title': 'Internet Banking',
      'subtitle': 'HDFC, ICICI, SBI, Axis & major banks',
      'icon': Icons.account_balance_rounded,
      'color': AppColors.brandBlue,
    },
    {
      'id': 'Credit / Debit Card',
      'title': 'Debit / Credit Card',
      'subtitle': 'Visa, MasterCard, RuPay',
      'icon': Icons.credit_card_rounded,
      'color': AppColors.amberWarning,
    },
  ];

  void _handleConfirmPayment() async {
    HapticFeedback.mediumImpact();
    setState(() {
      _isProcessing = true;
    });

    await Future.delayed(const Duration(milliseconds: 900));

    final randomTxn = 'TXN-2026-${(100000 + Random().nextInt(900000))}';
    final success = BillingRepository.simulatePayment(
      widget.bill.id,
      _selectedMethod,
      randomTxn,
    );

    if (!mounted) return;

    if (success) {
      Navigator.of(context).pop();
      widget.onPaymentCompleted();

      PaymentSuccessModal.show(
        context,
        bill: widget.bill,
        transactionId: randomTxn,
        onDone: widget.onPaymentCompleted,
      );
    }
  }

  @override
  Widget build(BuildContext context) {
    final totalToPay = widget.bill.totalAmount + widget.bill.penaltyAmount;

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

            const SizedBox(height: AppSpacing.md),

            // Header
            Row(
              mainAxisAlignment: MainAxisAlignment.spaceBetween,
              children: [
                Column(
                  crossAxisAlignment: CrossAxisAlignment.start,
                  children: [
                    Text('Select Payment Method', style: AppTypography.titleMedium),
                    Text('Ref: ${widget.bill.accountReference}', style: AppTypography.caption),
                  ],
                ),
                IconButton(
                  onPressed: () => Navigator.of(context).pop(),
                  icon: const Icon(Icons.close_rounded, color: AppColors.secondarySlate),
                ),
              ],
            ),

            const Divider(height: AppSpacing.lg),

            // Payment Amount Summary Card
            Container(
              padding: const EdgeInsets.all(AppSpacing.md),
              decoration: BoxDecoration(
                color: AppColors.primaryDarkNavy,
                borderRadius: BorderRadius.circular(AppRadius.lg),
              ),
              child: Row(
                mainAxisAlignment: MainAxisAlignment.spaceBetween,
                children: [
                  Column(
                    crossAxisAlignment: CrossAxisAlignment.start,
                    children: [
                      Text(
                        widget.bill.title,
                        style: AppTypography.bodySmall.copyWith(color: Colors.blue.shade200),
                      ),
                      Text(
                        'Due Date: ${widget.bill.dueDate}',
                        style: AppTypography.caption.copyWith(color: AppColors.secondarySlate),
                      ),
                    ],
                  ),
                  Text(
                    '₹${totalToPay.toStringAsFixed(0)}',
                    style: AppTypography.displayHeading.copyWith(
                      color: Colors.white,
                      fontSize: 22,
                    ),
                  ),
                ],
              ),
            ),

            const SizedBox(height: AppSpacing.lg),

            // Method Selector List
            Text('CHOOSE PAYMENT GATEWAY', style: AppTypography.badgeText),
            const SizedBox(height: AppSpacing.xs),

            ListView.separated(
              shrinkWrap: true,
              physics: const NeverScrollableScrollPhysics(),
              itemCount: _methods.length,
              separatorBuilder: (context, index) => const SizedBox(height: AppSpacing.xs),
              itemBuilder: (context, index) {
                final method = _methods[index];
                final isSelected = _selectedMethod == method['id'];
                final color = method['color'] as Color;

                return InkWell(
                  onTap: () {
                    HapticFeedback.selectionClick();
                    setState(() {
                      _selectedMethod = method['id'] as String;
                    });
                  },
                  borderRadius: BorderRadius.circular(AppRadius.md),
                  child: Container(
                    padding: const EdgeInsets.all(AppSpacing.md),
                    decoration: BoxDecoration(
                      color: isSelected ? color.withAlpha(15) : AppColors.appBackground,
                      borderRadius: BorderRadius.circular(AppRadius.md),
                      border: Border.all(
                        color: isSelected ? color : AppColors.borderSubtle,
                        width: isSelected ? 2 : 1,
                      ),
                    ),
                    child: Row(
                      children: [
                        Container(
                          padding: const EdgeInsets.all(8),
                          decoration: BoxDecoration(
                            color: color.withAlpha(25),
                            shape: BoxShape.circle,
                          ),
                          child: Icon(method['icon'] as IconData, color: color, size: 20),
                        ),
                        const SizedBox(width: AppSpacing.md),
                        Expanded(
                          child: Column(
                            crossAxisAlignment: CrossAxisAlignment.start,
                            children: [
                              Text(
                                method['title'] as String,
                                style: AppTypography.bodyMedium.copyWith(
                                  fontWeight: isSelected ? FontWeight.w700 : FontWeight.w500,
                                ),
                              ),
                              Text(
                                method['subtitle'] as String,
                                style: AppTypography.caption,
                              ),
                            ],
                          ),
                        ),
                        Icon(
                          isSelected ? Icons.check_circle_rounded : Icons.radio_button_unchecked_rounded,
                          color: isSelected ? color : AppColors.secondarySlate,
                        ),
                      ],
                    ),
                  ),
                );
              },
            ),

            const SizedBox(height: AppSpacing.md),

            // Prototype Disclaimer Notice
            Container(
              padding: const EdgeInsets.all(AppSpacing.sm),
              decoration: BoxDecoration(
                color: AppColors.skyBlueInfoBg,
                borderRadius: BorderRadius.circular(AppRadius.md),
                border: Border.all(color: AppColors.skyBlueInfo.withAlpha(60)),
              ),
              child: Row(
                children: [
                  const Icon(Icons.info_outline_rounded, color: AppColors.skyBlueInfo, size: 16),
                  const SizedBox(width: AppSpacing.xs),
                  Expanded(
                    child: Text(
                      'SIMULATED LOCAL PROTOTYPE PAYMENT — No real money will be charged.',
                      style: AppTypography.caption.copyWith(color: AppColors.skyBlueInfo, fontSize: 10),
                    ),
                  ),
                ],
              ),
            ),

            const SizedBox(height: AppSpacing.xl),

            // Submit Button
            ElevatedButton.icon(
              onPressed: _isProcessing ? null : _handleConfirmPayment,
              icon: _isProcessing
                  ? const SizedBox(
                      width: 18,
                      height: 18,
                      child: CircularProgressIndicator(strokeWidth: 2, color: Colors.white),
                    )
                  : const Icon(Icons.lock_rounded, size: 18),
              label: Text(_isProcessing ? 'Processing Payment...' : 'Confirm & Pay ₹${totalToPay.toStringAsFixed(0)}'),
              style: ElevatedButton.styleFrom(
                padding: const EdgeInsets.symmetric(vertical: 16),
                backgroundColor: AppColors.emeraldSuccess,
                foregroundColor: Colors.white,
              ),
            ),
          ],
        ),
      ),
    );
  }
}
