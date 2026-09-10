import 'package:flutter/material.dart';
import 'package:flutter/services.dart';
import '../../../../core/models/models.dart';
import '../../../../core/repositories/repositories.dart';
import '../../../../core/theme/app_colors.dart';
import '../../../../core/theme/app_tokens.dart';
import '../../../../core/theme/app_typography.dart';
import 'create_ticket_bottom_sheet.dart';

class SupportTicketsScreen extends StatefulWidget {
  const SupportTicketsScreen({super.key});

  @override
  State<SupportTicketsScreen> createState() => _SupportTicketsScreenState();
}

class _SupportTicketsScreenState extends State<SupportTicketsScreen> {
  List<SupportTicketModel> _tickets = [];
  String _activeFilter = 'All';

  @override
  void initState() {
    super.initState();
    _refreshTickets();
  }

  void _refreshTickets() {
    setState(() {
      _tickets = SupportRepository.getTickets();
    });
  }

  List<SupportTicketModel> get _filteredTickets {
    if (_activeFilter == 'Active') {
      return _tickets.where((t) => t.status != 'resolved').toList();
    }
    if (_activeFilter == 'Resolved') {
      return _tickets.where((t) => t.status == 'resolved').toList();
    }
    return _tickets;
  }

  Color _getStatusColor(String status) {
    switch (status.toLowerCase()) {
      case 'in_progress':
      case 'assigned':
        return AppColors.amberWarning;
      case 'resolved':
        return AppColors.emeraldSuccess;
      default:
        return AppColors.brandBlue;
    }
  }

  IconData _getCategoryIcon(String category) {
    switch (category.toLowerCase()) {
      case 'electrical':
        return Icons.electrical_services_rounded;
      case 'plumbing':
        return Icons.water_drop_rounded;
      case 'housekeeping':
        return Icons.cleaning_services_rounded;
      default:
        return Icons.build_rounded;
    }
  }

  void _openCreateTicket() {
    HapticFeedback.lightImpact();
    CreateTicketBottomSheet.show(context, onTicketCreated: _refreshTickets);
  }

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      backgroundColor: AppColors.appBackground,
      appBar: AppBar(
        title: const Text('Helpdesk & Support'),
        backgroundColor: AppColors.primaryDarkNavy,
        foregroundColor: Colors.white,
        elevation: 0,
        leading: IconButton(
          icon: const Icon(Icons.arrow_back_ios_new_rounded, size: 20),
          onPressed: () => Navigator.of(context).pop(),
        ),
        actions: [
          IconButton(
            onPressed: _openCreateTicket,
            icon: const Icon(Icons.add_rounded),
            tooltip: 'Raise Support Ticket',
          ),
        ],
      ),
      body: SingleChildScrollView(
        padding: const EdgeInsets.all(AppSpacing.lg),
        child: Column(
          crossAxisAlignment: CrossAxisAlignment.start,
          children: [
            // Top CTA Card
            Card(
              color: AppColors.primaryDarkNavy,
              child: Padding(
                padding: const EdgeInsets.all(AppSpacing.lg),
                child: Row(
                  children: [
                    Container(
                      padding: const EdgeInsets.all(AppSpacing.md),
                      decoration: BoxDecoration(
                        color: AppColors.brandBlue.withAlpha(40),
                        shape: BoxShape.circle,
                      ),
                      child: const Icon(Icons.support_agent_rounded, color: Colors.white, size: 28),
                    ),
                    const SizedBox(width: AppSpacing.md),
                    Expanded(
                      child: Column(
                        crossAxisAlignment: CrossAxisAlignment.start,
                        children: [
                          Text('Society Helpdesk', style: AppTypography.titleMedium.copyWith(color: Colors.white)),
                          Text('Plumbing, electrical & general maintenance support', style: AppTypography.caption.copyWith(color: AppColors.secondarySlate)),
                        ],
                      ),
                    ),
                    ElevatedButton(
                      onPressed: _openCreateTicket,
                      style: ElevatedButton.styleFrom(
                        padding: const EdgeInsets.symmetric(horizontal: AppSpacing.md, vertical: 10),
                      ),
                      child: const Text('+ Raise'),
                    ),
                  ],
                ),
              ),
            ),

            const SizedBox(height: AppSpacing.xl),

            // Filter Chips
            Row(
              children: ['All', 'Active', 'Resolved'].map((filter) {
                final isSelected = _activeFilter == filter;
                return Padding(
                  padding: const EdgeInsets.only(right: AppSpacing.sm),
                  child: ChoiceChip(
                    label: Text(filter),
                    selected: isSelected,
                    onSelected: (selected) {
                      if (selected) {
                        HapticFeedback.selectionClick();
                        setState(() {
                          _activeFilter = filter;
                        });
                      }
                    },
                    selectedColor: AppColors.brandBlue,
                    labelStyle: TextStyle(
                      color: isSelected ? Colors.white : AppColors.primarySlate,
                      fontWeight: isSelected ? FontWeight.w700 : FontWeight.normal,
                    ),
                  ),
                );
              }).toList(),
            ),

            const SizedBox(height: AppSpacing.md),

            // Tickets List
            if (_filteredTickets.isEmpty)
              const Card(
                child: Padding(
                  padding: EdgeInsets.all(AppSpacing.xl),
                  child: Center(
                    child: Text('No support tickets found for selected filter.'),
                  ),
                ),
              )
            else
              ListView.separated(
                shrinkWrap: true,
                physics: const NeverScrollableScrollPhysics(),
                itemCount: _filteredTickets.length,
                separatorBuilder: (context, index) => const SizedBox(height: AppSpacing.sm),
                itemBuilder: (context, index) {
                  final ticket = _filteredTickets[index];
                  final statusColor = _getStatusColor(ticket.status);

                  return Card(
                    child: Padding(
                      padding: const EdgeInsets.all(AppSpacing.md),
                      child: Column(
                        crossAxisAlignment: CrossAxisAlignment.start,
                        children: [
                          Row(
                            mainAxisAlignment: MainAxisAlignment.spaceBetween,
                            children: [
                              Row(
                                children: [
                                  Icon(_getCategoryIcon(ticket.category), size: 18, color: AppColors.brandBlue),
                                  const SizedBox(width: AppSpacing.xs),
                                  Text(ticket.ticketNumber, style: AppTypography.titleMedium.copyWith(fontSize: 14)),
                                ],
                              ),
                              Container(
                                padding: const EdgeInsets.symmetric(horizontal: 8, vertical: 3),
                                decoration: BoxDecoration(
                                  color: statusColor.withAlpha(25),
                                  borderRadius: BorderRadius.circular(AppRadius.sm),
                                  border: Border.all(color: statusColor.withAlpha(60)),
                                ),
                                child: Text(
                                  ticket.status.toUpperCase().replaceAll('_', ' '),
                                  style: AppTypography.badgeText.copyWith(
                                    color: statusColor,
                                    fontWeight: FontWeight.w800,
                                    fontSize: 10,
                                  ),
                                ),
                              ),
                            ],
                          ),

                          const SizedBox(height: AppSpacing.xs),

                          Text(ticket.subject, style: AppTypography.titleMedium.copyWith(fontSize: 15)),
                          const SizedBox(height: 2),
                          Text('Area: ${ticket.locationArea} • Created: ${ticket.createdAt}', style: AppTypography.caption),

                          const SizedBox(height: AppSpacing.sm),

                          Text(ticket.description, style: AppTypography.bodySmall, maxLines: 2, overflow: TextOverflow.ellipsis),

                          if (ticket.assignedStaffName != null) ...[
                            const Divider(height: AppSpacing.md),
                            Row(
                              children: [
                                const Icon(Icons.engineering_rounded, size: 16, color: AppColors.secondarySlate),
                                const SizedBox(width: AppSpacing.xs),
                                Expanded(
                                  child: Text(
                                    'Assigned to: ${ticket.assignedStaffName} (${ticket.assignedStaffRole})',
                                    style: AppTypography.caption.copyWith(fontWeight: FontWeight.w600, color: AppColors.primarySlate),
                                    overflow: TextOverflow.ellipsis,
                                  ),
                                ),
                              ],
                            ),
                          ],
                        ],
                      ),
                    ),
                  );
                },
              ),
          ],
        ),
      ),
    );
  }
}
