import 'package:flutter/material.dart';
import 'package:flutter/services.dart';
import '../../../../core/models/models.dart';
import '../../../../core/repositories/repositories.dart';
import '../../../../core/theme/app_colors.dart';
import '../../../../core/theme/app_tokens.dart';
import '../../../../core/theme/app_typography.dart';
import 'bill_detail_modal.dart';
import 'payment_checkout_modal.dart';
import 'payment_success_modal.dart';

class PaymentsTab extends StatefulWidget {
  const PaymentsTab({super.key});

  @override
  State<PaymentsTab> createState() => _PaymentsTabState();
}

class _PaymentsTabState extends State<PaymentsTab> {
  List<BillingRecordModel> _records = [];
  String _activeFilter = 'All Dues';

  @override
  void initState() {
    super.initState();
    _refreshData();
  }

  void _refreshData() {
    setState(() {
      _records = BillingRepository.getRecords();
    });
  }

  List<BillingRecordModel> get _filteredRecords {
    if (_activeFilter == 'Pending Dues') {
      return _records.where((b) => b.status == 'DUE' || b.status == 'OVERDUE').toList();
    }
    if (_activeFilter == 'History') {
      return _records.where((b) => b.status == 'PAID').toList();
    }
    return _records;
  }

  double get _totalOutstanding => BillingRepository.getTotalOutstanding();

  int get _overdueCount {
    return _records.where((b) => b.status == 'OVERDUE').length;
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

  IconData _getCategoryIcon(String category) {
    switch (category.toLowerCase()) {
      case 'maintenance':
        return Icons.build_rounded;
      case 'parking':
        return Icons.directions_car_rounded;
      case 'amenity':
        return Icons.sports_tennis_rounded;
      case 'electricity':
        return Icons.bolt_rounded;
      default:
        return Icons.receipt_long_rounded;
    }
  }

  @override
  Widget build(BuildContext context) {
    return SingleChildScrollView(
      padding: const EdgeInsets.all(AppSpacing.lg),
      child: Column(
        crossAxisAlignment: CrossAxisAlignment.start,
        children: [
          // Header Row
          Column(
            crossAxisAlignment: CrossAxisAlignment.start,
            children: [
              Text('Payments & Dues', style: AppTypography.displayHeading.copyWith(fontSize: 20)),
              Text('Tower B · Flat 1204 • Green Valley Society', style: AppTypography.caption),
            ],
          ),

          const SizedBox(height: AppSpacing.lg),

          // Total Outstanding Dues Summary Card
          Container(
            decoration: BoxDecoration(
              gradient: const LinearGradient(
                colors: [AppColors.primaryDarkNavy, AppColors.primarySlate],
                begin: Alignment.topLeft,
                end: Alignment.bottomRight,
              ),
              borderRadius: AppRadius.borderLg,
              boxShadow: [
                BoxShadow(
                  color: AppColors.primaryDarkNavy.withAlpha(40),
                  blurRadius: 12,
                  offset: const Offset(0, 4),
                ),
              ],
            ),
            padding: const EdgeInsets.all(AppSpacing.lg),
            child: Column(
              crossAxisAlignment: CrossAxisAlignment.start,
              children: [
                Row(
                  mainAxisAlignment: MainAxisAlignment.spaceBetween,
                  children: [
                    Text(
                      'TOTAL OUTSTANDING DUES',
                      style: AppTypography.badgeText.copyWith(
                        color: AppColors.secondarySlate,
                        letterSpacing: 1.1,
                      ),
                    ),
                    if (_overdueCount > 0)
                      Container(
                        padding: const EdgeInsets.symmetric(horizontal: 8, vertical: 3),
                        decoration: BoxDecoration(
                          color: AppColors.crimsonDanger,
                          borderRadius: BorderRadius.circular(AppRadius.sm),
                        ),
                        child: Text(
                          '$_overdueCount OVERDUE',
                          style: AppTypography.badgeText.copyWith(
                            color: Colors.white,
                            fontSize: 9,
                            fontWeight: FontWeight.w800,
                          ),
                        ),
                      ),
                  ],
                ),

                const SizedBox(height: AppSpacing.xs),

                Text(
                  '₹${_totalOutstanding.toStringAsFixed(0)}',
                  style: AppTypography.displayHeading.copyWith(
                    fontSize: 34,
                    color: Colors.white,
                    fontWeight: FontWeight.w900,
                  ),
                ),

                const SizedBox(height: AppSpacing.md),
                const Divider(color: Colors.white12, height: 1),
                const SizedBox(height: AppSpacing.md),

                Row(
                  mainAxisAlignment: MainAxisAlignment.spaceBetween,
                  children: [
                    Column(
                      crossAxisAlignment: CrossAxisAlignment.start,
                      children: [
                        Text('NEXT DUE DATE', style: AppTypography.caption.copyWith(color: AppColors.secondarySlate, fontSize: 10)),
                        Text(
                          _records.any((b) => b.status != 'PAID') ? '15 Sep 2026' : 'No Pending Dues',
                          style: AppTypography.bodySmall.copyWith(color: Colors.white, fontWeight: FontWeight.w600),
                        ),
                      ],
                    ),
                    Column(
                      crossAxisAlignment: CrossAxisAlignment.end,
                      children: [
                        Text('LAST PAYMENT', style: AppTypography.caption.copyWith(color: AppColors.secondarySlate, fontSize: 10)),
                        Text(
                          '₹4,250 (12 Aug)',
                          style: AppTypography.bodySmall.copyWith(color: AppColors.emeraldSuccess, fontWeight: FontWeight.w600),
                        ),
                      ],
                    ),
                  ],
                ),
              ],
            ),
          ),

          const SizedBox(height: AppSpacing.xl),

          // Filter Chips
          SingleChildScrollView(
            scrollDirection: Axis.horizontal,
            child: Row(
              children: ['All Dues', 'Pending Dues', 'History'].map((filter) {
                final isSelected = _activeFilter == filter;
                return Padding(
                  padding: const EdgeInsets.only(right: AppSpacing.sm),
                  child: InkWell(
                    onTap: () {
                      HapticFeedback.selectionClick();
                      setState(() {
                        _activeFilter = filter;
                      });
                    },
                    borderRadius: BorderRadius.circular(AppRadius.full),
                    child: Container(
                      padding: const EdgeInsets.symmetric(horizontal: 16, vertical: 8),
                      decoration: BoxDecoration(
                        color: isSelected ? AppColors.brandBlue : AppColors.surfaceSubtle,
                        borderRadius: BorderRadius.circular(AppRadius.full),
                        border: Border.all(
                          color: isSelected ? AppColors.brandBlue : AppColors.borderSubtle,
                        ),
                      ),
                      child: Text(
                        filter,
                        style: TextStyle(
                          color: isSelected ? Colors.white : AppColors.textPrimary,
                          fontWeight: isSelected ? FontWeight.w700 : FontWeight.w500,
                          fontSize: 13,
                        ),
                      ),
                    ),
                  ),
                );
              }).toList(),
            ),
          ),

          const SizedBox(height: AppSpacing.md),

          // Dues / Receipts List
          if (_filteredRecords.isEmpty)
            Container(
              decoration: BoxDecoration(
                color: Colors.white,
                borderRadius: AppRadius.borderLg,
                border: Border.all(color: AppColors.borderSubtle),
              ),
              child: Padding(
                padding: const EdgeInsets.all(AppSpacing.xl),
                child: Center(
                  child: Column(
                    children: [
                      const Icon(Icons.check_circle_outline_rounded, size: 40, color: AppColors.emeraldSuccess),
                      const SizedBox(height: AppSpacing.sm),
                      Text('No Records Found', style: AppTypography.titleMedium.copyWith(color: AppColors.textPrimary)),
                      Text('No billing records match the selected filter.', style: AppTypography.bodySmall.copyWith(color: AppColors.textMuted)),
                    ],
                  ),
                ),
              ),
            )
          else
            ListView.separated(
              shrinkWrap: true,
              physics: const NeverScrollableScrollPhysics(),
              itemCount: _filteredRecords.length,
              separatorBuilder: (context, index) => const SizedBox(height: AppSpacing.sm),
              itemBuilder: (context, index) {
                final bill = _filteredRecords[index];
                final statusColor = _getStatusColor(bill.status);
                final totalToPay = bill.totalAmount + bill.penaltyAmount;

                return Container(
                  decoration: BoxDecoration(
                    color: Colors.white,
                    borderRadius: AppRadius.borderLg,
                    border: Border.all(color: AppColors.borderSubtle),
                    boxShadow: AppShadows.cardShadow,
                  ),
                  child: InkWell(
                    onTap: () {
                      HapticFeedback.lightImpact();
                      BillDetailModal.show(
                        context,
                        bill: bill,
                        onPaymentCompleted: _refreshData,
                      );
                    },
                    borderRadius: BorderRadius.circular(AppRadius.lg),
                    child: Padding(
                      padding: const EdgeInsets.all(AppSpacing.md),
                      child: Column(
                        crossAxisAlignment: CrossAxisAlignment.start,
                        children: [
                          Row(
                            children: [
                              Container(
                                width: 40,
                                height: 40,
                                decoration: BoxDecoration(
                                  color: statusColor.withAlpha(20),
                                  shape: BoxShape.circle,
                                ),
                                child: Icon(
                                  _getCategoryIcon(bill.category),
                                  color: statusColor,
                                  size: 20,
                                ),
                              ),
                              const SizedBox(width: AppSpacing.sm),
                              Expanded(
                                child: Column(
                                  crossAxisAlignment: CrossAxisAlignment.start,
                                  children: [
                                    Text(
                                      bill.title,
                                      style: AppTypography.titleMedium.copyWith(
                                        fontSize: 15,
                                        color: AppColors.textPrimary,
                                        fontWeight: FontWeight.bold,
                                      ),
                                      overflow: TextOverflow.ellipsis,
                                    ),
                                    Text(
                                      'Period: ${bill.billingCycle} • Due: ${bill.dueDate}',
                                      style: AppTypography.caption.copyWith(color: AppColors.textMuted),
                                      overflow: TextOverflow.ellipsis,
                                    ),
                                  ],
                                ),
                              ),
                              const SizedBox(width: AppSpacing.xs),
                              Container(
                                padding: const EdgeInsets.symmetric(horizontal: 8, vertical: 3),
                                decoration: BoxDecoration(
                                  color: statusColor.withAlpha(25),
                                  borderRadius: BorderRadius.circular(AppRadius.sm),
                                  border: Border.all(color: statusColor.withAlpha(60)),
                                ),
                                child: Text(
                                  bill.status.toUpperCase(),
                                  style: AppTypography.badgeText.copyWith(
                                    color: statusColor,
                                    fontWeight: FontWeight.w800,
                                    fontSize: 10,
                                  ),
                                ),
                              ),
                            ],
                          ),

                          const Divider(height: AppSpacing.md, color: AppColors.borderSubtle),

                          Row(
                            mainAxisAlignment: MainAxisAlignment.spaceBetween,
                            children: [
                              Column(
                                crossAxisAlignment: CrossAxisAlignment.start,
                                children: [
                                  Text('AMOUNT OUTSTANDING', style: AppTypography.caption.copyWith(fontSize: 9, color: AppColors.textSubtle)),
                                  Text(
                                    '₹${totalToPay.toStringAsFixed(0)}',
                                    style: AppTypography.titleMedium.copyWith(
                                      fontWeight: FontWeight.w800,
                                      color: bill.status == 'PAID' ? AppColors.secondarySlate : AppColors.textPrimary,
                                    ),
                                  ),
                                ],
                              ),
                              if (bill.status == 'PAID')
                                OutlinedButton.icon(
                                  onPressed: () {
                                    PaymentSuccessModal.show(
                                      context,
                                      bill: bill,
                                      transactionId: bill.transactionId ?? 'TXN-89320149',
                                      onDone: _refreshData,
                                    );
                                  },
                                  style: OutlinedButton.styleFrom(
                                    foregroundColor: AppColors.brandBlue,
                                    side: const BorderSide(color: AppColors.brandBlue),
                                  ),
                                  icon: const Icon(Icons.receipt_rounded, size: 16),
                                  label: const Text('Receipt'),
                                )
                              else
                                ElevatedButton.icon(
                                  onPressed: () {
                                    PaymentCheckoutModal.show(
                                      context,
                                      bill: bill,
                                      onPaymentCompleted: _refreshData,
                                    );
                                  },
                                  icon: const Icon(Icons.payment_rounded, size: 16),
                                  label: const Text('Pay Dues'),
                                  style: ElevatedButton.styleFrom(
                                    backgroundColor: AppColors.emeraldSuccess,
                                    foregroundColor: Colors.white,
                                    padding: const EdgeInsets.symmetric(horizontal: AppSpacing.md, vertical: AppSpacing.xs + 2),
                                  ),
                                ),
                            ],
                          ),
                        ],
                      ),
                    ),
                  ),
                );
              },
            ),
        ],
      ),
    );
  }
}
