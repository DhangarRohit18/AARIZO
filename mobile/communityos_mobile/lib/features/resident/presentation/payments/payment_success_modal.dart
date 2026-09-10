import 'package:flutter/material.dart';
import 'package:flutter/services.dart';
import '../../../../core/models/models.dart';
import '../../../../core/theme/app_colors.dart';
import '../../../../core/theme/app_tokens.dart';
import '../../../../core/theme/app_typography.dart';

class PaymentSuccessModal extends StatelessWidget {
  final BillingRecordModel bill;
  final String transactionId;
  final VoidCallback onDone;

  const PaymentSuccessModal({
    super.key,
    required this.bill,
    required this.transactionId,
    required this.onDone,
  });

  static Future<void> show(
    BuildContext context, {
    required BillingRecordModel bill,
    required String transactionId,
    required VoidCallback onDone,
  }) {
    return showModalBottomSheet(
      context: context,
      isScrollControlled: true,
      backgroundColor: Colors.transparent,
      builder: (context) => PaymentSuccessModal(
        bill: bill,
        transactionId: transactionId,
        onDone: onDone,
      ),
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
      child: SingleChildScrollView(
        child: Column(
          mainAxisSize: MainAxisSize.min,
          crossAxisAlignment: CrossAxisAlignment.center,
          children: [
            // Drag handle
            Container(
              width: 36,
              height: 4,
              decoration: BoxDecoration(
                color: AppColors.borderSubtle,
                borderRadius: BorderRadius.circular(AppRadius.full),
              ),
            ),

            const SizedBox(height: AppSpacing.xl),

            // Success Circle Badge
            Container(
              width: 72,
              height: 72,
              decoration: const BoxDecoration(
                color: AppColors.emeraldSuccessBg,
                shape: BoxShape.circle,
              ),
              child: const Icon(
                Icons.check_circle_rounded,
                color: AppColors.emeraldSuccess,
                size: 48,
              ),
            ),

            const SizedBox(height: AppSpacing.md),

            Text(
              'Payment Received!',
              style: AppTypography.displayHeading.copyWith(fontSize: 22),
            ),

            const SizedBox(height: AppSpacing.xs),

            Text(
              '₹${(bill.totalAmount + bill.penaltyAmount).toStringAsFixed(0)} paid successfully for ${bill.title}',
              style: AppTypography.bodySmall,
              textAlign: TextAlign.center,
            ),

            const SizedBox(height: AppSpacing.lg),

            // Receipt Box
            Container(
              padding: const EdgeInsets.all(AppSpacing.md),
              decoration: BoxDecoration(
                color: AppColors.appBackground,
                borderRadius: BorderRadius.circular(AppRadius.lg),
                border: Border.all(color: AppColors.borderSubtle),
              ),
              child: Column(
                children: [
                  _buildReceiptRow('Transaction ID', transactionId, isBold: true),
                  const Divider(height: AppSpacing.md),
                  _buildReceiptRow('Society', 'Green Valley Society'),
                  const SizedBox(height: 6),
                  _buildReceiptRow('Unit Account', bill.canonicalDisplay),
                  const SizedBox(height: 6),
                  _buildReceiptRow('Billing Period', bill.billingCycle),
                  const SizedBox(height: 6),
                  _buildReceiptRow('Paid On', 'Today, ${TimeOfDay.now().format(context)}'),
                  const SizedBox(height: 6),
                  _buildReceiptRow('Payment Method', bill.paymentMethod ?? 'UPI Instant Transfer'),
                  const Divider(height: AppSpacing.md),
                  _buildReceiptRow('Amount Paid', '₹${(bill.totalAmount + bill.penaltyAmount).toStringAsFixed(0)}', isHighlight: true),
                ],
              ),
            ),

            const SizedBox(height: AppSpacing.xl),

            // Action Buttons
            Row(
              children: [
                Expanded(
                  child: OutlinedButton.icon(
                    onPressed: () {
                      HapticFeedback.lightImpact();
                      Clipboard.setData(ClipboardData(
                        text: 'Receipt #${bill.billNumber}\nTxn: $transactionId\nAmount: ₹${bill.totalAmount}\nUnit: ${bill.canonicalDisplay}',
                      ));
                      ScaffoldMessenger.of(context).showSnackBar(
                        const SnackBar(
                          content: Text('Tax receipt summary copied to clipboard!'),
                          backgroundColor: AppColors.emeraldSuccess,
                          behavior: SnackBarBehavior.floating,
                        ),
                      );
                    },
                    icon: const Icon(Icons.download_rounded, size: 18),
                    label: const Text('Download Receipt'),
                  ),
                ),
                const SizedBox(width: AppSpacing.md),
                Expanded(
                  child: ElevatedButton(
                    onPressed: () {
                      Navigator.of(context).pop();
                      onDone();
                    },
                    style: ElevatedButton.styleFrom(
                      padding: const EdgeInsets.symmetric(vertical: 14),
                    ),
                    child: const Text('Back to Payments'),
                  ),
                ),
              ],
            ),
          ],
        ),
      ),
    );
  }

  Widget _buildReceiptRow(String label, String value, {bool isBold = false, bool isHighlight = false}) {
    return Row(
      mainAxisAlignment: MainAxisAlignment.spaceBetween,
      children: [
        Text(label, style: AppTypography.caption),
        Text(
          value,
          style: AppTypography.bodySmall.copyWith(
            fontWeight: isHighlight || isBold ? FontWeight.w700 : FontWeight.normal,
            color: isHighlight ? AppColors.emeraldSuccess : AppColors.primarySlate,
            fontSize: isHighlight ? 14 : 12,
          ),
        ),
      ],
    );
  }
}
