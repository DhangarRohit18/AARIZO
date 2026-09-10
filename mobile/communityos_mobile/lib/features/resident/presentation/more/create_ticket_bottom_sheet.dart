import 'dart:math';
import 'package:flutter/material.dart';
import 'package:flutter/services.dart';
import '../../../../core/models/models.dart';
import '../../../../core/repositories/repositories.dart';
import '../../../../core/theme/app_colors.dart';
import '../../../../core/theme/app_tokens.dart';
import '../../../../core/theme/app_typography.dart';

class CreateTicketBottomSheet extends StatefulWidget {
  final VoidCallback onTicketCreated;

  const CreateTicketBottomSheet({super.key, required this.onTicketCreated});

  static Future<void> show(BuildContext context, {required VoidCallback onTicketCreated}) {
    return showModalBottomSheet(
      context: context,
      isScrollControlled: true,
      backgroundColor: Colors.transparent,
      builder: (context) => CreateTicketBottomSheet(onTicketCreated: onTicketCreated),
    );
  }

  @override
  State<CreateTicketBottomSheet> createState() => _CreateTicketBottomSheetState();
}

class _CreateTicketBottomSheetState extends State<CreateTicketBottomSheet> {
  final _formKey = GlobalKey<FormState>();
  final _subjectController = TextEditingController();
  final _descriptionController = TextEditingController();
  final _locationController = TextEditingController(text: 'Flat 1204');

  String _selectedCategory = 'plumbing';
  final String _selectedPriority = 'Medium';

  final List<Map<String, dynamic>> _categories = [
    {'id': 'plumbing', 'label': 'Plumbing', 'icon': Icons.water_drop_rounded},
    {'id': 'electrical', 'label': 'Electrical', 'icon': Icons.electrical_services_rounded},
    {'id': 'maintenance', 'label': 'Maintenance', 'icon': Icons.build_rounded},
    {'id': 'housekeeping', 'label': 'Housekeeping', 'icon': Icons.cleaning_services_rounded},
    {'id': 'security', 'label': 'Security', 'icon': Icons.security_rounded},
    {'id': 'other', 'label': 'Other Request', 'icon': Icons.more_horiz_rounded},
  ];

  @override
  void dispose() {
    _subjectController.dispose();
    _descriptionController.dispose();
    _locationController.dispose();
    super.dispose();
  }

  void _submitForm() {
    if (!_formKey.currentState!.validate()) {
      HapticFeedback.vibrate();
      return;
    }

    HapticFeedback.mediumImpact();

    final ticketNumber = 'TK-${(3000 + Random().nextInt(6000))}';
    final nowStr = 'Today, ${TimeOfDay.now().format(context)}';

    final newTicket = SupportTicketModel(
      id: 'tk-${DateTime.now().millisecondsSinceEpoch.toString().substring(7)}',
      ticketNumber: ticketNumber,
      category: _selectedCategory,
      subject: _subjectController.text.trim(),
      description: _descriptionController.text.trim(),
      locationArea: _locationController.text.trim(),
      status: 'open',
      createdAt: nowStr,
      updatedAt: nowStr,
      priority: _selectedPriority,
      updates: [
        SupportUpdateModel(
          id: 'up-new',
          timestamp: nowStr,
          authorName: 'Sarvesh Kulkarni',
          authorRole: 'resident',
          message: 'Ticket created under ${_selectedCategory.toUpperCase()} category.',
        ),
      ],
    );

    SupportRepository.createTicket(newTicket);
    widget.onTicketCreated();

    Navigator.of(context).pop();

    ScaffoldMessenger.of(context).showSnackBar(
      SnackBar(
        content: Text('Support ticket $ticketNumber raised successfully!'),
        backgroundColor: AppColors.emeraldSuccess,
        behavior: SnackBarBehavior.floating,
      ),
    );
  }

  @override
  Widget build(BuildContext context) {
    final keyboardPadding = MediaQuery.of(context).viewInsets.bottom;

    return Container(
      decoration: const BoxDecoration(
        color: AppColors.cardSurface,
        borderRadius: BorderRadius.vertical(top: Radius.circular(AppRadius.xl)),
      ),
      padding: EdgeInsets.only(
        left: AppSpacing.lg,
        right: AppSpacing.lg,
        top: AppSpacing.md,
        bottom: keyboardPadding + AppSpacing.lg,
      ),
      child: SingleChildScrollView(
        child: Form(
          key: _formKey,
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

              Row(
                mainAxisAlignment: MainAxisAlignment.spaceBetween,
                children: [
                  Column(
                    crossAxisAlignment: CrossAxisAlignment.start,
                    children: [
                      Text('Raise Support Request', style: AppTypography.titleMedium),
                      Text('Helpdesk & Facility Maintenance', style: AppTypography.caption),
                    ],
                  ),
                  IconButton(
                    onPressed: () => Navigator.of(context).pop(),
                    icon: const Icon(Icons.close_rounded, color: AppColors.secondarySlate),
                  ),
                ],
              ),

              const Divider(height: AppSpacing.lg),

              Text('SELECT CATEGORY', style: AppTypography.badgeText),
              const SizedBox(height: AppSpacing.xs),

              GridView.builder(
                shrinkWrap: true,
                physics: const NeverScrollableScrollPhysics(),
                gridDelegate: const SliverGridDelegateWithFixedCrossAxisCount(
                  crossAxisCount: 3,
                  childAspectRatio: 2.2,
                  crossAxisSpacing: AppSpacing.xs,
                  mainAxisSpacing: AppSpacing.xs,
                ),
                itemCount: _categories.length,
                itemBuilder: (context, index) {
                  final cat = _categories[index];
                  final isSelected = _selectedCategory == cat['id'];

                  return InkWell(
                    onTap: () {
                      HapticFeedback.selectionClick();
                      setState(() {
                        _selectedCategory = cat['id'] as String;
                      });
                    },
                    borderRadius: BorderRadius.circular(AppRadius.md),
                    child: Container(
                      padding: const EdgeInsets.symmetric(horizontal: 4, vertical: 4),
                      decoration: BoxDecoration(
                        color: isSelected ? AppColors.brandBlue.withAlpha(20) : AppColors.appBackground,
                        borderRadius: BorderRadius.circular(AppRadius.md),
                        border: Border.all(
                          color: isSelected ? AppColors.brandBlue : AppColors.borderSubtle,
                          width: isSelected ? 2 : 1,
                        ),
                      ),
                      child: Column(
                        mainAxisAlignment: MainAxisAlignment.center,
                        children: [
                          Icon(
                            cat['icon'] as IconData,
                            size: 16,
                            color: isSelected ? AppColors.brandBlue : AppColors.secondarySlate,
                          ),
                          const SizedBox(height: 2),
                          Text(
                            cat['label'] as String,
                            style: AppTypography.caption.copyWith(
                              fontSize: 10,
                              fontWeight: isSelected ? FontWeight.w700 : FontWeight.w500,
                              color: isSelected ? AppColors.brandBlue : AppColors.primarySlate,
                            ),
                            textAlign: TextAlign.center,
                            overflow: TextOverflow.ellipsis,
                          ),
                        ],
                      ),
                    ),
                  );
                },
              ),

              const SizedBox(height: AppSpacing.lg),

              TextFormField(
                controller: _subjectController,
                decoration: InputDecoration(
                  labelText: 'Request Title / Issue *',
                  hintText: 'e.g. Balcony pipe leakage or Lift noise',
                  prefixIcon: const Icon(Icons.title_rounded),
                  border: OutlineInputBorder(
                    borderRadius: BorderRadius.circular(AppRadius.md),
                  ),
                ),
                validator: (val) => val == null || val.trim().isEmpty ? 'Please enter issue title' : null,
              ),

              const SizedBox(height: AppSpacing.md),

              TextFormField(
                controller: _locationController,
                decoration: InputDecoration(
                  labelText: 'Location Area',
                  hintText: 'e.g. Master Bedroom, Balcony, Kitchen',
                  prefixIcon: const Icon(Icons.place_rounded),
                  border: OutlineInputBorder(
                    borderRadius: BorderRadius.circular(AppRadius.md),
                  ),
                ),
              ),

              const SizedBox(height: AppSpacing.md),

              TextFormField(
                controller: _descriptionController,
                maxLines: 3,
                decoration: InputDecoration(
                  labelText: 'Description & Notes *',
                  hintText: 'Provide specific details for the facility technician...',
                  prefixIcon: const Icon(Icons.notes_rounded),
                  border: OutlineInputBorder(
                    borderRadius: BorderRadius.circular(AppRadius.md),
                  ),
                ),
                validator: (val) => val == null || val.trim().isEmpty ? 'Please enter description' : null,
              ),

              const SizedBox(height: AppSpacing.xl),

              ElevatedButton.icon(
                onPressed: _submitForm,
                icon: const Icon(Icons.send_rounded, size: 18),
                label: const Text('Submit Helpdesk Ticket'),
                style: ElevatedButton.styleFrom(
                  padding: const EdgeInsets.symmetric(vertical: 16),
                ),
              ),
            ],
          ),
        ),
      ),
    );
  }
}
