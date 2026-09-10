import 'package:flutter/material.dart';
import '../../../../core/repositories/repositories.dart';
import '../../../../core/theme/app_colors.dart';
import '../../../../core/theme/app_tokens.dart';
import '../../../../core/theme/app_typography.dart';
import 'resident_approval_modal.dart';

class SecretaryResidentsTab extends StatefulWidget {
  final String initialStatusFilter; // 'ALL' | 'PENDING'

  const SecretaryResidentsTab({
    super.key,
    this.initialStatusFilter = 'ALL',
  });

  @override
  State<SecretaryResidentsTab> createState() => _SecretaryResidentsTabState();
}

class _SecretaryResidentsTabState extends State<SecretaryResidentsTab> {
  late String _statusFilter;
  String _selectedWing = 'ALL'; // 'ALL' | 'Block A' | 'Block B' | 'Block C'
  String _searchTerm = '';

  @override
  void initState() {
    super.initState();
    _statusFilter = widget.initialStatusFilter;
  }

  @override
  Widget build(BuildContext context) {
    final residents = SecretaryRepository.getResidents();
    final pendingCount = residents.where((r) => r.status == 'Pending Verification').length;
    final activeCount = residents.where((r) => r.status == 'Active').length;

    final filteredResidents = residents.where((r) {
      final matchesSearch = r.name.toLowerCase().contains(_searchTerm.toLowerCase()) ||
          r.flatNumber.toLowerCase().contains(_searchTerm.toLowerCase()) ||
          r.canonicalDisplay.toLowerCase().contains(_searchTerm.toLowerCase());

      final matchesWing = _selectedWing == 'ALL' || r.blockWing == _selectedWing;

      bool matchesStatus = true;
      if (_statusFilter == 'ACTIVE') {
        matchesStatus = r.status == 'Active';
      } else if (_statusFilter == 'PENDING') {
        matchesStatus = r.status == 'Pending Verification';
      }

      return matchesSearch && matchesWing && matchesStatus;
    }).toList();

    return Scaffold(
      backgroundColor: AppColors.appBackground,
      appBar: AppBar(
        title: const Text('Society Resident Directory'),
        actions: [
          IconButton(
            onPressed: () => setState(() {}),
            icon: const Icon(Icons.refresh_rounded),
          ),
        ],
      ),
      body: SafeArea(
        child: Padding(
          padding: const EdgeInsets.all(AppSpacing.lg),
          child: Column(
            crossAxisAlignment: CrossAxisAlignment.start,
            children: [
              // Header Summary Banner
              Container(
                width: double.infinity,
                padding: const EdgeInsets.all(AppSpacing.md),
                decoration: BoxDecoration(
                  color: AppColors.primaryDarkNavy,
                  borderRadius: AppRadius.borderLg,
                ),
                child: Row(
                  children: [
                    Container(
                      width: 40,
                      height: 40,
                      decoration: const BoxDecoration(
                        color: AppColors.brandBlue,
                        shape: BoxShape.circle,
                      ),
                      child: const Icon(Icons.people_alt_rounded, color: Colors.white, size: 22),
                    ),
                    const SizedBox(width: AppSpacing.md),
                    Expanded(
                      child: Column(
                        crossAxisAlignment: CrossAxisAlignment.start,
                        children: [
                          Text(
                            'Operational Directory & KYC Approvals',
                            style: AppTypography.titleMedium.copyWith(color: Colors.white),
                          ),
                          Text(
                            '$activeCount Active Residents • $pendingCount Pending Verification',
                            style: AppTypography.bodySmall.copyWith(color: Colors.white.withAlpha(204)),
                          ),
                        ],
                      ),
                    ),
                  ],
                ),
              ),

              const SizedBox(height: AppSpacing.md),

              // Pending Highlight Banner
              if (pendingCount > 0 && _statusFilter != 'PENDING') ...[
                GestureDetector(
                  onTap: () => setState(() => _statusFilter = 'PENDING'),
                  child: Container(
                    padding: const EdgeInsets.all(AppSpacing.md),
                    decoration: BoxDecoration(
                      color: AppColors.amberWarningBg,
                      borderRadius: AppRadius.borderMd,
                      border: Border.all(color: AppColors.amberWarning.withAlpha(76)),
                    ),
                    child: Row(
                      children: [
                        const Icon(Icons.pending_actions_rounded, color: AppColors.amberWarning, size: 20),
                        const SizedBox(width: AppSpacing.sm),
                        Expanded(
                          child: Text(
                            '$pendingCount Resident Verification(s) Pending — Tap to review KYC documents',
                            style: AppTypography.caption.copyWith(color: AppColors.amberWarning, fontWeight: FontWeight.w700),
                          ),
                        ),
                      ],
                    ),
                  ),
                ),
                const SizedBox(height: AppSpacing.md),
              ],

              // Search Bar
              TextField(
                onChanged: (val) => setState(() => _searchTerm = val),
                decoration: const InputDecoration(
                  hintText: 'Search by resident name or flat code (e.g. 1204)...',
                  prefixIcon: Icon(Icons.search_rounded),
                  filled: true,
                  fillColor: Colors.white,
                  border: OutlineInputBorder(borderRadius: AppRadius.borderLg),
                ),
              ),

              const SizedBox(height: AppSpacing.sm),

              // Wing Filters & Status Filter Row
              SingleChildScrollView(
                scrollDirection: Axis.horizontal,
                child: Row(
                  children: [
                    _buildChip('All Wing Blocks', 'ALL', _selectedWing, (val) => setState(() => _selectedWing = val)),
                    const SizedBox(width: AppSpacing.xs),
                    _buildChip('Block A', 'Block A', _selectedWing, (val) => setState(() => _selectedWing = val)),
                    const SizedBox(width: AppSpacing.xs),
                    _buildChip('Block B', 'Block B', _selectedWing, (val) => setState(() => _selectedWing = val)),
                    const SizedBox(width: AppSpacing.xs),
                    _buildChip('Block C', 'Block C', _selectedWing, (val) => setState(() => _selectedWing = val)),
                  ],
                ),
              ),

              const SizedBox(height: AppSpacing.xs),

              Row(
                children: [
                  _buildStatusChip('All ($residentsCount)', 'ALL'),
                  const SizedBox(width: AppSpacing.xs),
                  _buildStatusChip('Active ($activeCount)', 'ACTIVE'),
                  const SizedBox(width: AppSpacing.xs),
                  _buildStatusChip('Pending ($pendingCount)', 'PENDING'),
                ],
              ),

              const SizedBox(height: AppSpacing.md),

              Expanded(
                child: filteredResidents.isEmpty
                    ? Center(
                        child: Text(
                          'No residents match the selected filters.',
                          style: AppTypography.bodySmall.copyWith(color: AppColors.textMuted),
                        ),
                      )
                    : ListView.separated(
                        itemCount: filteredResidents.length,
                        separatorBuilder: (context, index) => const SizedBox(height: AppSpacing.md),
                        itemBuilder: (context, index) {
                          final resident = filteredResidents[index];
                          final isPending = resident.status == 'Pending Verification';

                          return Container(
                            decoration: BoxDecoration(
                              color: Colors.white,
                              borderRadius: AppRadius.borderLg,
                              border: Border.all(
                                color: isPending ? AppColors.amberWarning : AppColors.borderSubtle,
                                width: isPending ? 1.5 : 1,
                              ),
                              boxShadow: AppShadows.cardShadow,
                            ),
                            padding: const EdgeInsets.all(AppSpacing.md),
                            child: Column(
                              crossAxisAlignment: CrossAxisAlignment.start,
                              children: [
                                Row(
                                  children: [
                                    CircleAvatar(
                                      radius: 20,
                                      backgroundColor: AppColors.primaryDarkNavy,
                                      child: Text(
                                        resident.name.isNotEmpty ? resident.name[0] : 'R',
                                        style: AppTypography.titleMedium.copyWith(color: Colors.white),
                                      ),
                                    ),
                                    const SizedBox(width: AppSpacing.md),
                                    Expanded(
                                      child: Column(
                                        crossAxisAlignment: CrossAxisAlignment.start,
                                        children: [
                                          Text(resident.name, style: AppTypography.titleMedium),
                                          Text(
                                            '${resident.canonicalDisplay} • ${resident.type}',
                                            style: AppTypography.bodySmall,
                                          ),
                                        ],
                                      ),
                                    ),
                                    Container(
                                      padding: const EdgeInsets.symmetric(horizontal: 8, vertical: 3),
                                      decoration: BoxDecoration(
                                        color: isPending
                                            ? AppColors.amberWarningBg
                                            : resident.status == 'Active'
                                                ? AppColors.emeraldSuccessBg
                                                : AppColors.crimsonDangerBg,
                                        borderRadius: AppRadius.borderSm,
                                      ),
                                      child: Text(
                                        isPending
                                            ? 'PENDING_VERIFICATION'
                                            : resident.status == 'Active'
                                                ? 'CURRENTLY_RESIDING'
                                                : 'REJECTED',
                                        style: AppTypography.caption.copyWith(
                                          color: isPending
                                              ? AppColors.amberWarning
                                              : resident.status == 'Active'
                                                  ? AppColors.emeraldSuccess
                                                  : AppColors.crimsonDanger,
                                          fontWeight: FontWeight.w800,
                                          fontSize: 10,
                                        ),
                                      ),
                                    ),
                                  ],
                                ),
                                const SizedBox(height: AppSpacing.sm),
                                const Divider(height: 1, color: AppColors.borderSubtle),
                                const SizedBox(height: AppSpacing.sm),
                                Row(
                                  mainAxisAlignment: MainAxisAlignment.spaceBetween,
                                  children: [
                                    Expanded(
                                      child: Text(
                                        'Contact: ${resident.phone}',
                                        style: AppTypography.caption.copyWith(color: AppColors.textMuted),
                                        overflow: TextOverflow.ellipsis,
                                      ),
                                    ),
                                    const SizedBox(width: AppSpacing.xs),
                                    ElevatedButton.icon(
                                      onPressed: () {
                                        showModalBottomSheet(
                                          context: context,
                                          isScrollControlled: true,
                                          backgroundColor: Colors.transparent,
                                          builder: (context) => ResidentApprovalModal(
                                            resident: resident,
                                            onUpdated: () => setState(() {}),
                                          ),
                                        );
                                      },
                                      style: ElevatedButton.styleFrom(
                                        backgroundColor: isPending ? AppColors.amberWarning : AppColors.brandBlue,
                                        foregroundColor: Colors.white,
                                        padding: const EdgeInsets.symmetric(horizontal: 12, vertical: 6),
                                        minimumSize: const Size(0, 32),
                                        shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(AppRadius.sm)),
                                      ),
                                      icon: const Icon(Icons.remove_red_eye_outlined, size: 14, color: Colors.white),
                                      label: Text(
                                        isPending ? 'Review KYC' : 'View',
                                        style: const TextStyle(fontSize: 12, color: Colors.white, fontWeight: FontWeight.bold),
                                      ),
                                    ),
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

  int get residentsCount => SecretaryRepository.getResidents().length;

  Widget _buildChip(String label, String value, String current, Function(String) onSelect) {
    final isSel = current == value;
    return ChoiceChip(
      label: Text(label, style: TextStyle(color: isSel ? Colors.white : AppColors.primaryDarkNavy, fontSize: 12)),
      selected: isSel,
      selectedColor: AppColors.primaryDarkNavy,
      onSelected: (selected) {
        if (selected) onSelect(value);
      },
    );
  }

  Widget _buildStatusChip(String label, String value) {
    final isSel = _statusFilter == value;
    return ChoiceChip(
      label: Text(label, style: TextStyle(color: isSel ? Colors.white : AppColors.primaryDarkNavy, fontSize: 12)),
      selected: isSel,
      selectedColor: AppColors.brandBlue,
      onSelected: (selected) {
        if (selected) setState(() => _statusFilter = value);
      },
    );
  }
}
