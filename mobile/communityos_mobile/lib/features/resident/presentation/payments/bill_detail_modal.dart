import 'package:flutter/material.dart';
import '../../../../core/models/models.dart';
import '../../../../core/theme/app_colors.dart';
import '../../../../core/theme/app_tokens.dart';
import '../../../../core/theme/app_typography.dart';
import 'payment_checkout_modal.dart';

class BillDetailModal extends StatelessWidget {
  final BillingRecordModel bill;
  final VoidCallback onPaymentCompleted;

  const BillDetailModal({
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
      builder: (context) => BillDetailModal(
        bill: bill,
        onPaymentCompleted: onPaymentCompleted,
      ),
    );
  }

  Color _getStatusColor(String status) {
    switch (status.toUpperCase()) {
      case 'DUE':
        return AppColors.brandBlue;
      case 'OVERDUE':
        return AppColors.crimsonDanger;
      case 'PAID':
        return AppColors.emeraldSuccess;
      default:
        return AppColors.secondarySlate;
    }
  }

  @override
  Widget build(BuildContext context) {
    final statusColor = _getStatusColor(bill.status);
    final totalToPay = bill.totalAmount + bill.penaltyAmount;

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
                    Text(bill.title, style: AppTypography.titleMedium),
                    Text('Ref: ${bill.accountReference}', style: AppTypography.caption),
                  ],
                ),
                IconButton(
                  onPressed: () => Navigator.of(context).pop(),
                  icon: const Icon(Icons.close_rounded, color: AppColors.secondarySlate),
                ),
              ],
            ),

            const Divider(height: AppSpacing.lg),

            // Bill Status & Amount Summary Banner
            Container(
              padding: const EdgeInsets.all(AppSpacing.lg),
              decoration: BoxDecoration(
                color: statusColor.withAlpha(20),
                borderRadius: BorderRadius.circular(AppRadius.lg),
                border: Border.all(color: statusColor.withAlpha(60)),
              ),
              child: Row(
                mainAxisAlignment: MainAxisAlignment.spaceBetween,
                children: [
                  Column(
                    crossAxisAlignment: CrossAxisAlignment.start,
                    children: [
                      Container(
                        padding: const EdgeInsets.symmetric(horizontal: 8, vertical: 3),
                        decoration: BoxDecoration(
                          color: statusColor,
                          borderRadius: BorderRadius.circular(AppRadius.sm),
                        ),
                        child: Text(
                          bill.status.toUpperCase(),
                          style: AppTypography.badgeText.copyWith(
                            color: Colors.white,
                            fontWeight: FontWeight.w800,
                          ),
                        ),
                      ),
                      const SizedBox(height: AppSpacing.xs),
                      Text('Due Date: ${bill.dueDate}', style: AppTypography.caption.copyWith(fontWeight: FontWeight.w600)),
                    ],
                  ),
                  Column(
                    crossAxisAlignment: CrossAxisAlignment.end,
                    children: [
                      Text(
                        'TOTAL DUE',
                        style: AppTypography.badgeText.copyWith(color: AppColors.secondarySlate),
                      ),
                      Text(
                        '₹${totalToPay.toStringAsFixed(0)}',
                        style: AppTypography.displayHeading.copyWith(
                          color: statusColor,
                          fontSize: 24,
                        ),
                      ),
                    ],
                  ),
                ],
              ),
            ),

            const SizedBox(height: AppSpacing.lg),

            // Itemized Breakdown Section
            Text('ITEMIZED BILL BREAKDOWN', style: AppTypography.badgeText),
            const SizedBox(height: AppSpacing.xs),

            Container(
              padding: const EdgeInsets.all(AppSpacing.md),
              decoration: BoxDecoration(
                color: AppColors.appBackground,
                borderRadius: BorderRadius.circular(AppRadius.lg),
                border: Border.all(color: AppColors.borderSubtle),
              ),
              child: Column(
                children: [
                  if (bill.items.isNotEmpty)
                    ...bill.items.map((item) {
                      return Padding(
                        padding: const EdgeInsets.only(bottom: AppSpacing.xs),
                        child: Row(
                          mainAxisAlignment: MainAxisAlignment.spaceBetween,
                          children: [
                            Text(item.title, style: AppTypography.bodySmall),
                            Text('₹${item.amount.toStringAsFixed(0)}', style: AppTypography.bodySmall.copyWith(fontWeight: FontWeight.w600)),
                          ],
                        ),
                      );
                    })
                  else
                    Row(
                      mainAxisAlignment: MainAxisAlignment.spaceBetween,
                      children: [
                        Text('Base Charge', style: AppTypography.bodySmall),
                        Text('₹${bill.totalAmount.toStringAsFixed(0)}', style: AppTypography.bodySmall.copyWith(fontWeight: FontWeight.w600)),
                      ],
                    ),

                  if (bill.penaltyAmount > 0) ...[
                    const Divider(height: AppSpacing.md),
                    Row(
                      mainAxisAlignment: MainAxisAlignment.spaceBetween,
                      children: [
                        Text('Late Payment Overdue Fee', style: AppTypography.bodySmall.copyWith(color: AppColors.crimsonDanger)),
                        Text('₹${bill.penaltyAmount.toStringAsFixed(0)}', style: AppTypography.bodySmall.copyWith(color: AppColors.crimsonDanger, fontWeight: FontWeight.w700)),
                      ],
                    ),
                  ],

                  const Divider(height: AppSpacing.md),

                  Row(
                    mainAxisAlignment: MainAxisAlignment.spaceBetween,
                    children: [
                      Text('Total Payable Amount', style: AppTypography.bodyMedium.copyWith(fontWeight: FontWeight.w700)),
                      Text('₹${totalToPay.toStringAsFixed(0)}', style: AppTypography.bodyMedium.copyWith(fontWeight: FontWeight.w800, color: AppColors.primaryDarkNavy)),
                    ],
                  ),
                ],
              ),
            ),

            const SizedBox(height: AppSpacing.lg),

            // Description Box
            Text('BILL DESCRIPTION & CONTEXT', style: AppTypography.badgeText),
            const SizedBox(height: AppSpacing.xs),

            Text(
              bill.description,
              style: AppTypography.bodySmall,
            ),

            const SizedBox(height: AppSpacing.xl),

            // Action Button
            if (bill.status == 'PAID')
              Container(
                padding: const EdgeInsets.all(AppSpacing.md),
                decoration: BoxDecoration(
                  color: AppColors.emeraldSuccessBg,
                  borderRadius: BorderRadius.circular(AppRadius.md),
                ),
                child: Row(
                  mainAxisAlignment: MainAxisAlignment.center,
                  children: [
                    const Icon(Icons.check_circle_rounded, color: AppColors.emeraldSuccess, size: 20),
                    const SizedBox(width: AppSpacing.xs),
                    Text(
                      'Bill Paid on ${bill.paidAt ?? "12 Aug 2026"} via ${bill.paymentMethod ?? "UPI"}',
                      style: AppTypography.bodySmall.copyWith(color: AppColors.emeraldSuccess, fontWeight: FontWeight.w700),
                    ),
                  ],
                ),
              )
            else
              ElevatedButton.icon(
                onPressed: () {
                  Navigator.of(context).pop();
                  PaymentCheckoutModal.show(
                    context,
                    bill: bill,
                    onPaymentCompleted: onPaymentCompleted,
                  );
                },
                icon: const Icon(Icons.payment_rounded),
                label: Text('Pay ₹${totalToPay.toStringAsFixed(0)} Now'),
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
