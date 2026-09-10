import 'package:flutter/material.dart';
import '../../../core/theme/app_colors.dart';
import '../../../core/theme/app_tokens.dart';
import '../../../core/theme/app_typography.dart';
import '../../../core/repositories/repositories.dart';
import 'otp_modal.dart';

class LoginScreen extends StatefulWidget {
  final String selectedRole;

  const LoginScreen({
    super.key,
    required this.selectedRole,
  });

  @override
  State<LoginScreen> createState() => _LoginScreenState();
}

class _LoginScreenState extends State<LoginScreen> {
  late TextEditingController _phoneController;
  String? _validationError;

  @override
  void initState() {
    super.initState();
    final canonicalResident = ResidentRepository.getCanonicalResident();
    _phoneController = TextEditingController(
      text: canonicalResident.phone.replaceAll(RegExp(r'\D'), '').replaceAll('91', ''),
    );
  }

  @override
  void dispose() {
    _phoneController.dispose();
    super.dispose();
  }

  void _onGetOtp() {
    final cleanPhone = _phoneController.text.replaceAll(RegExp(r'\D'), '');
    if (cleanPhone.length < 10) {
      setState(() {
        _validationError = 'Please enter a valid 10-digit mobile number.';
      });
      return;
    }

    setState(() {
      _validationError = null;
    });

    showModalBottomSheet(
      context: context,
      isScrollControlled: true,
      backgroundColor: Colors.transparent,
      builder: (context) => OtpModalSheet(
        phoneNumber: cleanPhone,
        selectedRole: widget.selectedRole,
      ),
    );
  }

  @override
  Widget build(BuildContext context) {
    final isResident = widget.selectedRole == 'resident';

    return Scaffold(
      backgroundColor: AppColors.appBackground,
      appBar: AppBar(
        title: Text(isResident ? 'Resident Login' : 'Guard Terminal Entry'),
      ),
      body: SafeArea(
        child: Padding(
          padding: const EdgeInsets.all(AppSpacing.xl),
          child: Column(
            crossAxisAlignment: CrossAxisAlignment.start,
            children: [
              // Header Card
              Container(
                padding: const EdgeInsets.all(AppSpacing.lg),
                decoration: BoxDecoration(
                  color: isResident ? AppColors.skyBlueInfoBg : AppColors.amberWarningBg,
                  borderRadius: AppRadius.borderLg,
                  border: Border.all(
                    color: isResident
                        ? AppColors.brandBlue.withAlpha(50)
                        : AppColors.amberWarning.withAlpha(50),
                  ),
                ),
                child: Row(
                  children: [
                    Container(
                      width: 40,
                      height: 40,
                      decoration: BoxDecoration(
                        color: isResident ? AppColors.brandBlue : AppColors.amberWarning,
                        shape: BoxShape.circle,
                      ),
                      child: Icon(
                        isResident ? Icons.person_rounded : Icons.shield_rounded,
                        color: Colors.white,
                        size: 22,
                      ),
                    ),
                    const SizedBox(width: AppSpacing.md),
                    Expanded(
                      child: Column(
                        crossAxisAlignment: CrossAxisAlignment.start,
                        children: [
                          Text(
                            isResident ? 'Sarvesh Kulkarni' : 'Officer R. Singh',
                            style: AppTypography.titleMedium,
                          ),
                          Text(
                            isResident ? 'Green Valley Society • Tower B · Flat 1204' : 'Gate #1 North Terminal',
                            style: AppTypography.bodySmall,
                          ),
                        ],
                      ),
                    ),
                  ],
                ),
              ),

              const SizedBox(height: AppSpacing.xxl),

              Text(
                'Enter Mobile Number',
                style: AppTypography.displayHeading.copyWith(fontSize: 22),
              ),
              const SizedBox(height: AppSpacing.xs),
              Text(
                'We will send a 4-digit verification code to verify your flat account.',
                style: AppTypography.bodyMedium.copyWith(color: AppColors.textMuted),
              ),

              const SizedBox(height: AppSpacing.xl),

              // Phone Input Field
              Row(
                children: [
                  Container(
                    padding: const EdgeInsets.symmetric(horizontal: 14, vertical: 14),
                    decoration: BoxDecoration(
                      color: AppColors.surfaceSubtle,
                      borderRadius: AppRadius.borderMd,
                      border: Border.all(color: AppColors.borderSubtle),
                    ),
                    child: Row(
                      children: [
                        const Text('🇮🇳', style: TextStyle(fontSize: 18)),
                        const SizedBox(width: 6),
                        Text('+91', style: AppTypography.titleMedium),
                      ],
                    ),
                  ),
                  const SizedBox(width: AppSpacing.sm),
                  Expanded(
                    child: TextField(
                      controller: _phoneController,
                      keyboardType: TextInputType.phone,
                      maxLength: 10,
                      style: AppTypography.titleMedium,
                      decoration: InputDecoration(
                        counterText: '',
                        hintText: '9876543210',
                        filled: true,
                        fillColor: AppColors.surfaceSubtle,
                        border: const OutlineInputBorder(
                          borderRadius: AppRadius.borderMd,
                          borderSide: BorderSide(color: AppColors.borderSubtle),
                        ),
                        focusedBorder: const OutlineInputBorder(
                          borderRadius: AppRadius.borderMd,
                          borderSide: BorderSide(color: AppColors.brandBlue, width: 2),
                        ),
                      ),
                    ),
                  ),
                ],
              ),

              if (_validationError != null) ...[
                const SizedBox(height: AppSpacing.sm),
                Text(
                  _validationError!,
                  style: AppTypography.bodySmall.copyWith(
                    color: AppColors.crimsonDanger,
                    fontWeight: FontWeight.w600,
                  ),
                ),
              ],

              const Spacer(),

              // Submit Button
              SizedBox(
                width: double.infinity,
                height: 50,
                child: ElevatedButton(
                  onPressed: _onGetOtp,
                  style: ElevatedButton.styleFrom(
                    backgroundColor: AppColors.primaryDarkNavy,
                    shape: const RoundedRectangleBorder(borderRadius: AppRadius.borderLg),
                  ),
                  child: Text(
                    'Get Verification Code',
                    style: AppTypography.buttonLabel,
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
