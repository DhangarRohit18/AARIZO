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
  String _selectedWing = 'ALL'; // 'ALL' | 'Wing A' | 'Wing B' | 'Wing C'
  String _searchTerm = '';

  // Canonical mock dataset matching Screenshot 3
  final List<Map<String, String>> _referenceResidents = [
    {
      'name': 'Poonam',
      'flat': '108 · Floor 1',
      'wing': 'Wing A',
      'phone': '8528528520',
      'status': 'CURRENTLY_RESIDING',
      'initial': 'P',
    },
    {
      'name': 'Pransh',
      'flat': '101 · Floor 1',
      'wing': 'Wing B',
      'phone': '9999999900',
      'status': 'CURRENTLY_RESIDING',
      'initial': 'P',
    },
    {
      'name': 'Supriya',
      'flat': '101 · Floor 1',
      'wing': 'Wing B',
      'phone': '9852361470',
      'status': 'CURRENTLY_RESIDING',
      'initial': 'S',
    },
    {
      'name': 'Joti',
      'flat': '101 · Floor 1',
      'wing': 'Wing B',
      'phone': '9999999990',
      'status': 'CURRENTLY_RESIDING',
      'initial': 'J',
    },
    {
      'name': 'Mau',
      'flat': '202 · Floor 2',
      'wing': 'Wing C',
      'phone': '9820012345',
      'status': 'CURRENTLY_RESIDING',
      'initial': 'M',
    },
    {
      'name': 'Rohan Mehta',
      'flat': '203 · Floor 2',
      'wing': 'Wing C',
      'phone': '9876500000',
      'status': 'PENDING_VERIFICATION',
      'initial': 'R',
    },
  ];

  @override
  void initState() {
    super.initState();
    _statusFilter = widget.initialStatusFilter;
  }

  @override
  Widget build(BuildContext context) {
    final filtered = _referenceResidents.where((r) {
      final matchesSearch = r['name']!.toLowerCase().contains(_searchTerm.toLowerCase()) ||
          r['flat']!.toLowerCase().contains(_searchTerm.toLowerCase()) ||
          r['wing']!.toLowerCase().contains(_searchTerm.toLowerCase()) ||
          r['phone']!.contains(_searchTerm);

      final matchesWing = _selectedWing == 'ALL' || r['wing'] == _selectedWing;
      final matchesStatus = _statusFilter == 'ALL' || r['status'] == _statusFilter;

      return matchesSearch && matchesWing && matchesStatus;
    }).toList();

    return SingleChildScrollView(
      child: Column(
        crossAxisAlignment: CrossAxisAlignment.start,
        children: [
          // 1. Sub-Header Banner (Matching Screenshot 3)
          Container(
            width: double.infinity,
            padding: const EdgeInsets.symmetric(horizontal: 16, vertical: 14),
            color: const Color(0xFFEBF5FF),
            child: Row(
              children: [
                Container(
                  width: 36,
                  height: 36,
                  decoration: const BoxDecoration(
                    color: Color(0xFFDBEAFE),
                    shape: BoxShape.circle,
                  ),
                  child: const Icon(Icons.arrow_back_rounded, color: AppColors.primaryDarkNavy, size: 20),
                ),
                const SizedBox(width: 12),
                Column(
                  crossAxisAlignment: CrossAxisAlignment.start,
                  children: [
                    Text(
                      'Residents',
                      style: AppTypography.titleLarge.copyWith(
                        fontSize: 20,
                        fontWeight: FontWeight.bold,
                        color: AppColors.primaryDarkNavy,
                      ),
                    ),
                    Text(
                      'Green Valley Society · ${filtered.length} residents',
                      style: const TextStyle(
                        fontSize: 12,
                        color: AppColors.textMuted,
                        fontWeight: FontWeight.w500,
                      ),
                    ),
                  ],
                ),
              ],
            ),
          ),

          Padding(
            padding: const EdgeInsets.all(AppSpacing.lg),
            child: Column(
              crossAxisAlignment: CrossAxisAlignment.start,
              children: [
                // 2. Search Box (Matching Screenshot 3)
                TextField(
                  onChanged: (val) => setState(() => _searchTerm = val),
                  decoration: InputDecoration(
                    hintText: 'Search by name, flat, wing, or building...',
                    hintStyle: const TextStyle(color: Color(0xFF94A3B8), fontSize: 13),
                    prefixIcon: const Icon(Icons.search_rounded, color: Color(0xFF64748B), size: 20),
                    filled: true,
                    fillColor: Colors.white,
                    contentPadding: const EdgeInsets.symmetric(vertical: 12),
                    enabledBorder: OutlineInputBorder(
                      borderRadius: BorderRadius.circular(12),
                      borderSide: const BorderSide(color: Color(0xFFE2E8F0)),
                    ),
                    focusedBorder: OutlineInputBorder(
                      borderRadius: BorderRadius.circular(12),
                      borderSide: const BorderSide(color: AppColors.brandBlue, width: 1.5),
                    ),
                  ),
                ),

                const SizedBox(height: 12),

                // 3. Wing Filter Dropdown Pill Button (Matching Screenshot 3)
                Row(
                  children: [
                    Container(
                      padding: const EdgeInsets.symmetric(horizontal: 14, vertical: 8),
                      decoration: BoxDecoration(
                        color: Colors.white,
                        borderRadius: BorderRadius.circular(20),
                        border: Border.all(color: const Color(0xFFE2E8F0)),
                      ),
                      child: PopupMenuButton<String>(
                        onSelected: (val) => setState(() => _selectedWing = val),
                        itemBuilder: (context) => const [
                          PopupMenuItem(value: 'ALL', child: Text('All Wings')),
                          PopupMenuItem(value: 'Wing A', child: Text('Wing A')),
                          PopupMenuItem(value: 'Wing B', child: Text('Wing B')),
                          PopupMenuItem(value: 'Wing C', child: Text('Wing C')),
                        ],
                        child: Row(
                          mainAxisSize: MainAxisSize.min,
                          children: [
                            const Icon(Icons.apartment_outlined, size: 16, color: AppColors.primaryDarkNavy),
                            const SizedBox(width: 6),
                            Text(
                              _selectedWing == 'ALL' ? 'All Wings' : _selectedWing,
                              style: const TextStyle(
                                fontSize: 12,
                                fontWeight: FontWeight.bold,
                                color: AppColors.primaryDarkNavy,
                              ),
                            ),
                            const SizedBox(width: 4),
                            const Icon(Icons.keyboard_arrow_down_rounded, size: 16, color: AppColors.primaryDarkNavy),
                          ],
                        ),
                      ),
                    ),
                  ],
                ),

                const SizedBox(height: 16),

                // 4. Resident Count Text (Matching Screenshot 3)
                Text(
                  '${filtered.length} residents found',
                  style: const TextStyle(
                    fontSize: 13,
                    fontWeight: FontWeight.w600,
                    color: Color(0xFF64748B),
                  ),
                ),

                const SizedBox(height: 12),

                // 5. Resident Cards List (Matching Screenshot 3)
                ListView.separated(
                  shrinkWrap: true,
                  physics: const NeverScrollableScrollPhysics(),
                  itemCount: filtered.length,
                  separatorBuilder: (context, index) => const SizedBox(height: 12),
                  itemBuilder: (context, index) {
                    final resident = filtered[index];
                    final isPending = resident['status'] == 'PENDING_VERIFICATION';

                    return Container(
                      padding: const EdgeInsets.all(16),
                      decoration: BoxDecoration(
                        color: Colors.white,
                        borderRadius: BorderRadius.circular(16),
                        border: Border.all(
                          color: isPending ? AppColors.amberWarning : const Color(0xFFE2E8F0),
                        ),
                        boxShadow: [
                          BoxShadow(
                            color: Colors.black.withAlpha(5),
                            blurRadius: 6,
                            offset: const Offset(0, 2),
                          ),
                        ],
                      ),
                      child: Column(
                        crossAxisAlignment: CrossAxisAlignment.start,
                        children: [
                          Row(
                            mainAxisAlignment: MainAxisAlignment.spaceBetween,
                            children: [
                              Row(
                                children: [
                                  Container(
                                    width: 44,
                                    height: 44,
                                    decoration: const BoxDecoration(
                                      color: Color(0xFFF1F5F9),
                                      shape: BoxShape.circle,
                                    ),
                                    child: Center(
                                      child: Text(
                                        resident['initial']!,
                                        style: const TextStyle(
                                          fontWeight: FontWeight.bold,
                                          fontSize: 18,
                                          color: AppColors.primaryDarkNavy,
                                        ),
                                      ),
                                    ),
                                  ),
                                  const SizedBox(width: 12),
                                  Text(
                                    resident['name']!,
                                    style: AppTypography.titleMedium.copyWith(
                                      fontSize: 16,
                                      fontWeight: FontWeight.bold,
                                      color: AppColors.primaryDarkNavy,
                                    ),
                                  ),
                                ],
                              ),
                              Container(
                                padding: const EdgeInsets.symmetric(horizontal: 10, vertical: 3),
                                decoration: BoxDecoration(
                                  color: isPending ? const Color(0xFFFEF3C7) : const Color(0xFFF1F5F9),
                                  borderRadius: BorderRadius.circular(12),
                                ),
                                child: Text(
                                  resident['status']!,
                                  style: TextStyle(
                                    fontSize: 10,
                                    fontWeight: FontWeight.bold,
                                    color: isPending ? AppColors.amberWarning : const Color(0xFF475569),
                                  ),
                                ),
                              ),
                            ],
                          ),

                          const SizedBox(height: 10),

                          // Details Metadata
                          Row(
                            children: [
                              const Icon(Icons.home_outlined, size: 14, color: Color(0xFF64748B)),
                              const SizedBox(width: 6),
                              Text(
                                resident['flat']!,
                                style: const TextStyle(fontSize: 12, color: Color(0xFF475569), fontWeight: FontWeight.w500),
                              ),
                            ],
                          ),
                          const SizedBox(height: 4),
                          Row(
                            children: [
                              const Icon(Icons.apartment_outlined, size: 14, color: Color(0xFF64748B)),
                              const SizedBox(width: 6),
                              Text(
                                resident['wing']!,
                                style: const TextStyle(fontSize: 12, color: Color(0xFF475569), fontWeight: FontWeight.w500),
                              ),
                            ],
                          ),
                          const SizedBox(height: 4),
                          Row(
                            children: [
                              const Icon(Icons.phone_outlined, size: 14, color: Color(0xFF64748B)),
                              const SizedBox(width: 6),
                              Text(
                                resident['phone']!,
                                style: const TextStyle(fontSize: 12, color: Color(0xFF475569), fontWeight: FontWeight.w500),
                              ),
                              const Spacer(),
                              // 👁 View Button (Matching Screenshot 3)
                              ElevatedButton.icon(
                                onPressed: () {
                                  final canonical = SecretaryRepository.getResidents().first;
                                  showModalBottomSheet(
                                    context: context,
                                    isScrollControlled: true,
                                    backgroundColor: Colors.transparent,
                                    builder: (context) => ResidentApprovalModal(
                                      resident: canonical,
                                      onUpdated: () => setState(() {}),
                                    ),
                                  );
                                },
                                style: ElevatedButton.styleFrom(
                                  backgroundColor: const Color(0xFFEFF6FF),
                                  foregroundColor: AppColors.primaryDarkNavy,
                                  padding: const EdgeInsets.symmetric(horizontal: 12, vertical: 4),
                                  minimumSize: const Size(0, 32),
                                  elevation: 0,
                                  shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(16)),
                                ),
                                icon: const Icon(Icons.visibility_outlined, size: 14, color: AppColors.primaryDarkNavy),
                                label: const Text(
                                  'View',
                                  style: TextStyle(fontSize: 12, fontWeight: FontWeight.bold, color: AppColors.primaryDarkNavy),
                                ),
                              ),
                            ],
                          ),
                        ],
                      ),
                    );
                  },
                ),

                const SizedBox(height: 80), // Bottom padding for FAB
              ],
            ),
          ),
        ],
      ),
    );
  }
}

