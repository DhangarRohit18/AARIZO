import 'package:flutter/material.dart';
import '../../../../core/repositories/repositories.dart';
import '../../../../core/theme/app_colors.dart';
import '../../../../core/theme/app_tokens.dart';
import '../../../../core/theme/app_typography.dart';
import 'issue_bill_modal.dart';

class SecretaryBillingTab extends StatefulWidget {
  const SecretaryBillingTab({super.key});

  @override
  State<SecretaryBillingTab> createState() => _SecretaryBillingTabState();
}

class _SecretaryBillingTabState extends State<SecretaryBillingTab> {
  String _statusFilter = 'ALL'; // 'ALL' | 'DUE' | 'OVERDUE' | 'PAID'
  String _searchTerm = '';

  @override
  Widget build(BuildContext context) {
    final ledger = BillingRepository.getRecords();

    double totalBilled = 0;
    double totalCollected = 0;
    double totalOutstanding = 0;
    int overdueCount = 0;

    for (final item in ledger) {
      totalBilled += item.totalAmount;
      totalCollected += item.amountPaid;
      totalOutstanding += item.outstandingAmount;
      if (item.status == 'OVERDUE') overdueCount++;
    }

    final collectionRate = totalBilled > 0 ? ((totalCollected / totalBilled) * 100).round() : 74;

    final filteredLedger = ledger.where((item) {
      final matchesSearch = item.residentName.toLowerCase().contains(_searchTerm.toLowerCase()) ||
          item.canonicalDisplay.toLowerCase().contains(_searchTerm.toLowerCase()) ||
          item.title.toLowerCase().contains(_searchTerm.toLowerCase()) ||
          item.accountReference.toLowerCase().contains(_searchTerm.toLowerCase());

      final matchesStatus = _statusFilter == 'ALL' || item.status == _statusFilter;
      return matchesSearch && matchesStatus;
    }).toList();

    return Scaffold(
      backgroundColor: AppColors.appBackground,
      appBar: AppBar(
        title: const Text('Society Maintenance Billing Ledger'),
        actions: [
          IconButton(
            onPressed: () => setState(() {}),
            icon: const Icon(Icons.refresh_rounded),
          ),
        ],
      ),
      floatingActionButton: FloatingActionButton.extended(
        onPressed: () {
          showModalBottomSheet(
            context: context,
            isScrollControlled: true,
            backgroundColor: Colors.transparent,
            builder: (context) => IssueBillModal(
              onUpdated: () => setState(() {}),
            ),
          );
        },
        backgroundColor: AppColors.primaryDarkNavy,
        icon: const Icon(Icons.add_card_rounded, color: Colors.white),
        label: const Text('Issue Bill', style: TextStyle(color: Colors.white, fontWeight: FontWeight.bold)),
      ),
      body: SafeArea(
        child: Padding(
          padding: const EdgeInsets.all(AppSpacing.lg),
          child: Column(
            crossAxisAlignment: CrossAxisAlignment.start,
            children: [
              // Metrics Grid
              Row(
                children: [
                  Expanded(
                    child: Container(
                      padding: const EdgeInsets.all(AppSpacing.md),
                      decoration: BoxDecoration(
                        color: Colors.white,
                        borderRadius: AppRadius.borderLg,
                        border: Border.all(color: AppColors.borderSubtle),
                        boxShadow: AppShadows.cardShadow,
                      ),
                      child: Column(
                        crossAxisAlignment: CrossAxisAlignment.start,
                        children: [
                          Text(
                            '₹${(totalCollected / 1000).toStringAsFixed(1)}k',
                            style: AppTypography.displayHeading.copyWith(color: AppColors.emeraldSuccess, fontSize: 22),
                          ),
                          Text('Total Dues Collected', style: AppTypography.caption.copyWith(color: AppColors.textMuted)),
                        ],
                      ),
                    ),
                  ),
                  const SizedBox(width: AppSpacing.md),
                  Expanded(
                    child: Container(
                      padding: const EdgeInsets.all(AppSpacing.md),
                      decoration: BoxDecoration(
                        color: Colors.white,
                        borderRadius: AppRadius.borderLg,
                        border: Border.all(color: AppColors.borderSubtle),
                        boxShadow: AppShadows.cardShadow,
                      ),
                      child: Column(
                        crossAxisAlignment: CrossAxisAlignment.start,
                        children: [
                          Text(
                            '₹${(totalOutstanding / 1000).toStringAsFixed(1)}k',
                            style: AppTypography.displayHeading.copyWith(color: AppColors.crimsonDanger, fontSize: 22),
                          ),
                          Text('Outstanding ($overdueCount Overdue)', style: AppTypography.caption.copyWith(color: AppColors.textMuted)),
                        ],
                      ),
                    ),
                  ),
                ],
              ),

              const SizedBox(height: AppSpacing.md),

              // Collection Progress Bar
              Container(
                padding: const EdgeInsets.all(AppSpacing.md),
                decoration: BoxDecoration(
                  color: Colors.white,
                  borderRadius: AppRadius.borderLg,
                  border: Border.all(color: AppColors.borderSubtle),
                  boxShadow: AppShadows.cardShadow,
                ),
                child: Column(
                  children: [
                    Row(
                      mainAxisAlignment: MainAxisAlignment.spaceBetween,
                      children: [
                        Text('Overall Collection Progress', style: AppTypography.caption.copyWith(fontWeight: FontWeight.w700)),
                        Text('$collectionRate% Paid', style: AppTypography.caption.copyWith(color: AppColors.emeraldSuccess, fontWeight: FontWeight.w800)),
                      ],
                    ),
                    const SizedBox(height: 6),
                    ClipRRect(
                      borderRadius: AppRadius.borderFull,
                      child: LinearProgressIndicator(
                        value: collectionRate / 100.0,
                        minHeight: 8,
                        backgroundColor: AppColors.surfaceSubtle,
                        valueColor: const AlwaysStoppedAnimation<Color>(AppColors.emeraldSuccess),
                      ),
                    ),
                  ],
                ),
              ),

              const SizedBox(height: AppSpacing.md),

              // Search & Filter Row
              TextField(
                onChanged: (v) => setState(() => _searchTerm = v),
                decoration: const InputDecoration(
                  hintText: 'Search ledger by resident or bill reference...',
                  prefixIcon: Icon(Icons.search_rounded),
                  filled: true,
                  fillColor: Colors.white,
                  border: OutlineInputBorder(borderRadius: AppRadius.borderLg),
                ),
              ),

              const SizedBox(height: AppSpacing.sm),

              SingleChildScrollView(
                scrollDirection: Axis.horizontal,
                child: Row(
                  children: [
                    ChoiceChip(
                      label: Text('All (${ledger.length})'),
                      selected: _statusFilter == 'ALL',
                      selectedColor: AppColors.primaryDarkNavy,
                      labelStyle: TextStyle(color: _statusFilter == 'ALL' ? Colors.white : AppColors.primaryDarkNavy),
                      onSelected: (s) {
                        if (s) setState(() => _statusFilter = 'ALL');
                      },
                    ),
                    const SizedBox(width: AppSpacing.xs),
                    ChoiceChip(
                      label: Text('Due (${ledger.where((b) => b.status == 'DUE').length})'),
                      selected: _statusFilter == 'DUE',
                      selectedColor: AppColors.amberWarning,
                      labelStyle: TextStyle(color: _statusFilter == 'DUE' ? Colors.white : AppColors.primaryDarkNavy),
                      onSelected: (s) {
                        if (s) setState(() => _statusFilter = 'DUE');
                      },
                    ),
                    const SizedBox(width: AppSpacing.xs),
                    ChoiceChip(
                      label: Text('Overdue ($overdueCount)'),
                      selected: _statusFilter == 'OVERDUE',
                      selectedColor: AppColors.crimsonDanger,
                      labelStyle: TextStyle(color: _statusFilter == 'OVERDUE' ? Colors.white : AppColors.primaryDarkNavy),
                      onSelected: (s) {
                        if (s) setState(() => _statusFilter = 'OVERDUE');
                      },
                    ),
                    const SizedBox(width: AppSpacing.xs),
                    ChoiceChip(
                      label: Text('Paid (${ledger.where((b) => b.status == 'PAID').length})'),
                      selected: _statusFilter == 'PAID',
                      selectedColor: AppColors.emeraldSuccess,
                      labelStyle: TextStyle(color: _statusFilter == 'PAID' ? Colors.white : AppColors.primaryDarkNavy),
                      onSelected: (s) {
                        if (s) setState(() => _statusFilter = 'PAID');
                      },
                    ),
                  ],
                ),
              ),

              const SizedBox(height: AppSpacing.md),

              Expanded(
                child: filteredLedger.isEmpty
                    ? Center(
                        child: Text(
                          'No billing records match filter.',
                          style: AppTypography.bodySmall.copyWith(color: AppColors.textMuted),
                        ),
                      )
                    : ListView.separated(
                        itemCount: filteredLedger.length,
                        separatorBuilder: (context, index) => const SizedBox(height: AppSpacing.md),
                        itemBuilder: (context, index) {
                          final item = filteredLedger[index];
                          final isOverdue = item.status == 'OVERDUE';
                          final isPaid = item.status == 'PAID';

                          return Container(
                            decoration: BoxDecoration(
                              color: Colors.white,
                              borderRadius: AppRadius.borderLg,
                              border: Border.all(
                                color: isOverdue
                                    ? AppColors.crimsonDanger
                                    : isPaid
                                        ? AppColors.borderSubtle
                                        : AppColors.amberWarning,
                                width: isOverdue ? 1.5 : 1,
                              ),
                              boxShadow: AppShadows.cardShadow,
                            ),
                            padding: const EdgeInsets.all(AppSpacing.md),
                            child: Column(
                              crossAxisAlignment: CrossAxisAlignment.start,
                              children: [
                                Row(
                                  mainAxisAlignment: MainAxisAlignment.spaceBetween,
                                  children: [
                                    Text(item.title, style: AppTypography.titleMedium),
                                    Container(
                                      padding: const EdgeInsets.symmetric(horizontal: 8, vertical: 3),
                                      decoration: BoxDecoration(
                                        color: isOverdue
                                            ? AppColors.crimsonDangerBg
                                            : isPaid
                                                ? AppColors.emeraldSuccessBg
                                                : AppColors.amberWarningBg,
                                        borderRadius: AppRadius.borderSm,
                                      ),
                                      child: Text(
                                        item.status,
                                        style: AppTypography.caption.copyWith(
                                          color: isOverdue
                                              ? AppColors.crimsonDanger
                                              : isPaid
                                                  ? AppColors.emeraldSuccess
                                                  : AppColors.amberWarning,
                                          fontWeight: FontWeight.w800,
                                        ),
                                      ),
                                    ),
                                  ],
                                ),
                                const SizedBox(height: 4),
                                Text(
                                  '${item.residentName} (${item.canonicalDisplay}) • Ref: ${item.accountReference}',
                                  style: AppTypography.bodySmall,
                                ),
                                const SizedBox(height: AppSpacing.md),
                                const Divider(height: 1, color: AppColors.borderSubtle),
                                const SizedBox(height: AppSpacing.sm),
                                Row(
                                  mainAxisAlignment: MainAxisAlignment.spaceBetween,
                                  children: [
                                    Text('Amount: ₹${item.totalAmount.toStringAsFixed(0)}', style: AppTypography.titleMedium.copyWith(color: AppColors.brandBlue)),
                                    Text('Due Date: ${item.dueDate}', style: AppTypography.caption.copyWith(color: AppColors.textMuted)),
                                  ],
                                ),
                              ],
                            ),
                          );
                        },
                      ),
              ),
            ],
          ),
        ),
      ),
    );
  }
}
