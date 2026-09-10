import 'dart:math';
import 'package:flutter/material.dart';
import 'package:flutter/services.dart';
import '../../../../core/models/models.dart';
import '../../../../core/repositories/repositories.dart';
import '../../../../core/theme/app_colors.dart';
import '../../../../core/theme/app_tokens.dart';
import '../../../../core/theme/app_typography.dart';
import 'pass_detail_modal.dart';

class CreatePassBottomSheet extends StatefulWidget {
  final ValueChanged<GatePassModel>? onPassCreated;

  const CreatePassBottomSheet({
    super.key,
    this.onPassCreated,
  });

  static Future<void> show(BuildContext context, {ValueChanged<GatePassModel>? onPassCreated}) {
    return showModalBottomSheet(
      context: context,
      isScrollControlled: true,
      backgroundColor: Colors.transparent,
      builder: (context) => CreatePassBottomSheet(onPassCreated: onPassCreated),
    );
  }

  @override
  State<CreatePassBottomSheet> createState() => _CreatePassBottomSheetState();
}

class _CreatePassBottomSheetState extends State<CreatePassBottomSheet> {
  final _formKey = GlobalKey<FormState>();
  final _nameController = TextEditingController();
  final _phoneController = TextEditingController();
  final _companyController = TextEditingController();
  final _notesController = TextEditingController();

  String _selectedCategory = 'Guest';
  String _selectedDate = 'Today';
  String _selectedTimeSlot = '06:00 PM – 09:00 PM';
  final String _selectedDuration = 'Today, 11:59 PM';

  final List<Map<String, dynamic>> _categories = [
    {
      'id': 'Guest',
      'label': 'Guest / Family',
      'icon': Icons.people_rounded,
      'color': AppColors.brandBlue,
    },
    {
      'id': 'Cab',
      'label': 'Cab / Taxi',
      'icon': Icons.local_taxi_rounded,
      'color': AppColors.amberWarning,
    },
    {
      'id': 'Delivery',
      'label': 'Delivery Agent',
      'icon': Icons.local_shipping_rounded,
      'color': AppColors.emeraldSuccess,
    },
    {
      'id': 'Service Staff',
      'label': 'Service / Workman',
      'icon': Icons.construction_rounded,
      'color': AppColors.skyBlueInfo,
    },
  ];

  final List<String> _dateOptions = ['Today', 'Tomorrow', 'This Weekend'];
  final List<String> _timeSlotOptions = [
    'Just now',
    'Morning (09:00 AM – 12:00 PM)',
    'Afternoon (12:00 PM – 04:00 PM)',
    'Evening (04:00 PM – 09:00 PM)',
    '06:00 PM – 09:00 PM',
  ];

  @override
  void dispose() {
    _nameController.dispose();
    _phoneController.dispose();
    _companyController.dispose();
    _notesController.dispose();
    super.dispose();
  }

  String _generatePasscode() {
    final random = Random();
    final code = random.nextInt(9000) + 1000;
    return code.toString();
  }

  void _submitForm() {
    if (!_formKey.currentState!.validate()) {
      HapticFeedback.vibrate();
      return;
    }

    HapticFeedback.mediumImpact();

    final passcode = _generatePasscode();
    final visitorName = _nameController.text.trim().isNotEmpty
        ? _nameController.text.trim()
        : 'Guest Visitor';

    final resident = ResidentRepository.getCanonicalResident();

    final newPass = GatePassModel(
      id: 'PASS-${DateTime.now().millisecondsSinceEpoch.toString().substring(7)}',
      passcode: passcode,
      visitorName: visitorName,
      visitorPhone: _phoneController.text.trim().isNotEmpty ? _phoneController.text.trim() : '+91 98765 00000',
      category: _selectedCategory,
      residentName: resident.name,
      canonicalDisplay: resident.canonicalDisplay,
      validUntil: _selectedDuration,
      status: 'active',
      qrCodeData: 'COMMUNITYOS_PASS_${passcode}_${visitorName.toUpperCase().replaceAll(' ', '_')}',
      expectedDate: _selectedDate,
      expectedTimeSlot: _selectedTimeSlot,
      notes: _notesController.text.trim().isNotEmpty ? _notesController.text.trim() : null,
      companyName: _companyController.text.trim().isNotEmpty ? _companyController.text.trim() : null,
      createdAt: 'Just now',
    );

    GatePassRepository.addGatePass(newPass);

    if (widget.onPassCreated != null) {
      widget.onPassCreated!(newPass);
    }

    Navigator.of(context).pop();

    ScaffoldMessenger.of(context).showSnackBar(
      SnackBar(
        content: Text('Gate Pass created for $visitorName! Passcode: $passcode'),
        backgroundColor: AppColors.emeraldSuccess,
        behavior: SnackBarBehavior.floating,
      ),
    );

    // Show Digital Pass detail modal for newly generated pass
    PassDetailModal.show(context, newPass, onPassUpdated: () {
      if (widget.onPassCreated != null) {
        widget.onPassCreated!(newPass);
      }
    });
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
              // Drag Handle
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

              // Title & Close Button
              Row(
                mainAxisAlignment: MainAxisAlignment.spaceBetween,
                children: [
                  Column(
                    crossAxisAlignment: CrossAxisAlignment.start,
                    children: [
                      Text('Invite Visitor & Add Pass', style: AppTypography.titleMedium),
                      Text('Tower B · Flat 1204 • Instant Gate Pass', style: AppTypography.caption),
                    ],
                  ),
                  IconButton(
                    onPressed: () => Navigator.of(context).pop(),
                    icon: const Icon(Icons.close_rounded, color: AppColors.secondarySlate),
                  ),
                ],
              ),

              const Divider(height: AppSpacing.lg),

              // Section 1: Visitor Category Selector
              Text('SELECT VISITOR CATEGORY', style: AppTypography.badgeText),
              const SizedBox(height: AppSpacing.sm),

              GridView.builder(
                shrinkWrap: true,
                physics: const NeverScrollableScrollPhysics(),
                gridDelegate: const SliverGridDelegateWithFixedCrossAxisCount(
                  crossAxisCount: 2,
                  childAspectRatio: 2.5,
                  crossAxisSpacing: AppSpacing.sm,
                  mainAxisSpacing: AppSpacing.sm,
                ),
                itemCount: _categories.length,
                itemBuilder: (context, index) {
                  final cat = _categories[index];
                  final isSelected = _selectedCategory == cat['id'];
                  final color = cat['color'] as Color;

                  return InkWell(
                    onTap: () {
                      HapticFeedback.selectionClick();
                      setState(() {
                        _selectedCategory = cat['id'] as String;
                      });
                    },
                    borderRadius: BorderRadius.circular(AppRadius.md),
                    child: AnimatedContainer(
                      duration: const Duration(milliseconds: 150),
                      padding: const EdgeInsets.symmetric(horizontal: AppSpacing.sm, vertical: AppSpacing.xs),
                      decoration: BoxDecoration(
                        color: isSelected ? color.withAlpha(20) : AppColors.appBackground,
                        borderRadius: BorderRadius.circular(AppRadius.md),
                        border: Border.all(
                          color: isSelected ? color : AppColors.borderSubtle,
                          width: isSelected ? 2 : 1,
                        ),
                      ),
                      child: Row(
                        children: [
                          Container(
                            padding: const EdgeInsets.all(6),
                            decoration: BoxDecoration(
                              color: color.withAlpha(30),
                              shape: BoxShape.circle,
                            ),
                            child: Icon(cat['icon'] as IconData, size: 16, color: color),
                          ),
                          const SizedBox(width: AppSpacing.xs),
                          Expanded(
                            child: Text(
                              cat['label'] as String,
                              style: AppTypography.bodySmall.copyWith(
                                fontWeight: isSelected ? FontWeight.w700 : FontWeight.w500,
                                color: isSelected ? color : AppColors.primarySlate,
                              ),
                              overflow: TextOverflow.ellipsis,
                            ),
                          ),
                        ],
                      ),
                    ),
                  );
                },
              ),

              const SizedBox(height: AppSpacing.lg),

              // Section 2: Visitor Name Input
              TextFormField(
                controller: _nameController,
                textCapitalization: TextCapitalization.words,
                decoration: InputDecoration(
                  labelText: 'Visitor Name *',
                  hintText: 'e.g. Rahul Sharma or Zomato Agent',
                  prefixIcon: const Icon(Icons.person_rounded),
                  border: OutlineInputBorder(
                    borderRadius: BorderRadius.circular(AppRadius.md),
                  ),
                ),
                validator: (value) {
                  if (value == null || value.trim().isEmpty) {
                    return 'Please enter visitor name';
                  }
                  return null;
                },
              ),

              const SizedBox(height: AppSpacing.md),

              // Section 3: Phone or Company Input
              Row(
                children: [
                  Expanded(
                    child: TextFormField(
                      controller: _phoneController,
                      keyboardType: TextInputType.phone,
                      decoration: InputDecoration(
                        labelText: 'Visitor Phone (Optional)',
                        hintText: '+91 98765...',
                        prefixIcon: const Icon(Icons.phone_rounded),
                        border: OutlineInputBorder(
                          borderRadius: BorderRadius.circular(AppRadius.md),
                        ),
                      ),
                    ),
                  ),
                  if (_selectedCategory == 'Delivery' || _selectedCategory == 'Cab' || _selectedCategory == 'Service Staff') ...[
                    const SizedBox(width: AppSpacing.sm),
                    Expanded(
                      child: TextFormField(
                        controller: _companyController,
                        textCapitalization: TextCapitalization.words,
                        decoration: InputDecoration(
                          labelText: 'Company / Brand',
                          hintText: 'Zomato, Uber, Amazon',
                          prefixIcon: const Icon(Icons.business_rounded),
                          border: OutlineInputBorder(
                            borderRadius: BorderRadius.circular(AppRadius.md),
                          ),
                        ),
                      ),
                    ),
                  ],
                ],
              ),

              const SizedBox(height: AppSpacing.lg),

              // Section 4: Expected Date Selector
              Text('EXPECTED ENTRY DATE', style: AppTypography.badgeText),
              const SizedBox(height: AppSpacing.xs),

              Row(
                children: _dateOptions.map((date) {
                  final isSelected = _selectedDate == date;
                  return Expanded(
                    child: Padding(
                      padding: const EdgeInsets.only(right: AppSpacing.xs),
                      child: ChoiceChip(
                        label: Text(date),
                        selected: isSelected,
                        onSelected: (selected) {
                          if (selected) {
                            setState(() {
                              _selectedDate = date;
                            });
                          }
                        },
                        selectedColor: AppColors.brandBlue,
                        labelStyle: TextStyle(
                          color: isSelected ? Colors.white : AppColors.primarySlate,
                          fontWeight: isSelected ? FontWeight.w700 : FontWeight.normal,
                          fontSize: 12,
                        ),
                      ),
                    ),
                  );
                }).toList(),
              ),

              const SizedBox(height: AppSpacing.md),

              // Section 5: Time Slot Dropdown
              DropdownButtonFormField<String>(
                initialValue: _selectedTimeSlot,
                decoration: InputDecoration(
                  labelText: 'Expected Time Slot',
                  prefixIcon: const Icon(Icons.schedule_rounded),
                  border: OutlineInputBorder(
                    borderRadius: BorderRadius.circular(AppRadius.md),
                  ),
                ),
                items: _timeSlotOptions.map((slot) {
                  return DropdownMenuItem(
                    value: slot,
                    child: Text(slot, style: AppTypography.bodyMedium),
                  );
                }).toList(),
                onChanged: (val) {
                  if (val != null) {
                    setState(() {
                      _selectedTimeSlot = val;
                    });
                  }
                },
              ),

              const SizedBox(height: AppSpacing.md),

              // Section 6: Optional Notes
              TextFormField(
                controller: _notesController,
                decoration: InputDecoration(
                  labelText: 'Notes for Guard (Optional)',
                  hintText: 'e.g. Leave package at door, Family dinner visit',
                  prefixIcon: const Icon(Icons.notes_rounded),
                  border: OutlineInputBorder(
                    borderRadius: BorderRadius.circular(AppRadius.md),
                  ),
                ),
              ),

              const SizedBox(height: AppSpacing.xl),

              // Submit Action CTA
              ElevatedButton.icon(
                onPressed: _submitForm,
                icon: const Icon(Icons.qr_code_rounded),
                label: const Text('Generate Instant Gate Pass'),
                style: ElevatedButton.styleFrom(
                  padding: const EdgeInsets.symmetric(vertical: 16),
                  shape: RoundedRectangleBorder(
                    borderRadius: BorderRadius.circular(AppRadius.md),
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
