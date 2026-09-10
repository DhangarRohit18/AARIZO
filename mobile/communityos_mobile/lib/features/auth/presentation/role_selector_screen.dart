import 'package:flutter/material.dart';
import '../../../core/theme/app_colors.dart';
import '../../../core/theme/app_tokens.dart';
import '../../../core/theme/app_typography.dart';
import 'otp_modal.dart';

class RoleSelectorScreen extends StatefulWidget {
  const RoleSelectorScreen({super.key});

  @override
  State<RoleSelectorScreen> createState() => _RoleSelectorScreenState();
}

class _RoleSelectorScreenState extends State<RoleSelectorScreen> {
  String _selectedRole = 'resident'; // 'resident' | 'secretary' | 'guard'
  final TextEditingController _phoneController = TextEditingController(text: '9876543210');
  String? _validationError;

  @override
  void dispose() {
    _phoneController.dispose();
    super.dispose();
  }

  void _onContinue() {
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
        selectedRole: _selectedRole,
      ),
    );
  }

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      backgroundColor: const Color(0xFFF4F9FD),
      body: SafeArea(
        bottom: false,
        child: Column(
          children: [
            Expanded(
              child: SingleChildScrollView(
                padding: const EdgeInsets.symmetric(horizontal: AppSpacing.xl),
                child: Column(
                  children: [
                    const SizedBox(height: AppSpacing.xxl),

                    // LOGIN Title
                    Text(
                      'LOGIN',
                      style: AppTypography.displayHeading.copyWith(
                        fontSize: 26,
                        fontWeight: FontWeight.w900,
                        letterSpacing: 2.0,
                        color: const Color(0xFF0F2537),
                      ),
                    ),

                    const SizedBox(height: AppSpacing.xs),

                    Text(
                      'Login using your registered mobile number',
                      style: AppTypography.bodySmall.copyWith(
                        color: const Color(0xFF64748B),
                        fontSize: 13,
                      ),
                    ),

                    const SizedBox(height: AppSpacing.xxl),

                    // 1. Select Role Dropdown Card
                    Container(
                      decoration: BoxDecoration(
                        color: Colors.white,
                        borderRadius: BorderRadius.circular(14),
                        border: Border.all(color: const Color(0xFFE2E8F0)),
                        boxShadow: [
                          BoxShadow(
                            color: Colors.black.withValues(alpha: 0.04),
                            blurRadius: 10,
                            offset: const Offset(0, 4),
                          ),
                        ],
                      ),
                      padding: const EdgeInsets.symmetric(horizontal: 16, vertical: 4),
                      child: DropdownButtonHideUnderline(
                        child: DropdownButton<String>(
                          value: _selectedRole,
                          isExpanded: true,
                          icon: const Icon(Icons.arrow_drop_down_rounded, color: Color(0xFF64748B), size: 28),
                          items: const [
                            DropdownMenuItem(
                              value: 'resident',
                              child: Text(
                                'Resident (Flat Owner / Tenant)',
                                style: TextStyle(
                                  fontSize: 14.5,
                                  fontWeight: FontWeight.w600,
                                  color: Color(0xFF1E293B),
                                ),
                              ),
                            ),
                            DropdownMenuItem(
                              value: 'secretary',
                              child: Text(
                                'Secretary / Managing Committee',
                                style: TextStyle(
                                  fontSize: 14.5,
                                  fontWeight: FontWeight.w600,
                                  color: Color(0xFF1E293B),
                                ),
                              ),
                            ),
                            DropdownMenuItem(
                              value: 'guard',
                              child: Text(
                                'Security Guard (Gate Terminal)',
                                style: TextStyle(
                                  fontSize: 14.5,
                                  fontWeight: FontWeight.w600,
                                  color: Color(0xFF1E293B),
                                ),
                              ),
                            ),
                          ],
                          onChanged: (val) {
                            if (val != null) {
                              setState(() {
                                _selectedRole = val;
                              });
                            }
                          },
                        ),
                      ),
                    ),

                    const SizedBox(height: AppSpacing.md),

                    // 2. Mobile Number Input Field Card
                    Container(
                      decoration: BoxDecoration(
                        color: Colors.white,
                        borderRadius: BorderRadius.circular(14),
                        border: Border.all(color: const Color(0xFFE2E8F0)),
                        boxShadow: [
                          BoxShadow(
                            color: Colors.black.withValues(alpha: 0.04),
                            blurRadius: 10,
                            offset: const Offset(0, 4),
                          ),
                        ],
                      ),
                      padding: const EdgeInsets.symmetric(horizontal: 16, vertical: 6),
                      child: Row(
                        children: [
                          const Text(
                            'IN  +91',
                            style: TextStyle(
                              fontSize: 14,
                              fontWeight: FontWeight.w700,
                              color: Color(0xFF1E293B),
                            ),
                          ),
                          Container(
                            height: 24,
                            width: 1,
                            margin: const EdgeInsets.symmetric(horizontal: 12),
                            color: const Color(0xFFCBD5E1),
                          ),
                          Expanded(
                            child: TextField(
                              controller: _phoneController,
                              keyboardType: TextInputType.phone,
                              maxLength: 10,
                              style: const TextStyle(
                                fontSize: 14.5,
                                fontWeight: FontWeight.w600,
                                color: Color(0xFF1E293B),
                              ),
                              decoration: const InputDecoration(
                                hintText: 'Enter Mobile Number',
                                hintStyle: TextStyle(
                                  color: Color(0xFF94A3B8),
                                  fontWeight: FontWeight.w400,
                                  fontSize: 14,
                                ),
                                counterText: '',
                                border: InputBorder.none,
                              ),
                            ),
                          ),
                        ],
                      ),
                    ),

                    const SizedBox(height: AppSpacing.xs),

                    // Verify Number Sub-action
                    Align(
                      alignment: Alignment.centerRight,
                      child: InkWell(
                        onTap: _onContinue,
                        child: Padding(
                          padding: const EdgeInsets.symmetric(vertical: 4, horizontal: 2),
                          child: Text(
                            'Verify Number',
                            style: AppTypography.caption.copyWith(
                              color: const Color(0xFF0F2537),
                              fontWeight: FontWeight.w800,
                              fontSize: 13,
                            ),
                          ),
                        ),
                      ),
                    ),

                    if (_validationError != null) ...[
                      const SizedBox(height: AppSpacing.xs),
                      Text(
                        _validationError!,
                        style: AppTypography.bodySmall.copyWith(
                          color: AppColors.crimsonDanger,
                          fontWeight: FontWeight.w600,
                        ),
                      ),
                    ],

                    const SizedBox(height: AppSpacing.xl),

                    // 3. Continue Primary CTA Button
                    SizedBox(
                      width: double.infinity,
                      height: 52,
                      child: ElevatedButton(
                        onPressed: _onContinue,
                        style: ElevatedButton.styleFrom(
                          backgroundColor: const Color(0xFF0F2537),
                          elevation: 3,
                          shadowColor: const Color(0xFF0F2537).withValues(alpha: 0.3),
                          shape: RoundedRectangleBorder(
                            borderRadius: BorderRadius.circular(14),
                          ),
                        ),
                        child: Text(
                          'Continue',
                          style: AppTypography.buttonLabel.copyWith(
                            fontSize: 15,
                            fontWeight: FontWeight.w700,
                            color: Colors.white,
                          ),
                        ),
                      ),
                    ),

                    const SizedBox(height: AppSpacing.lg),

                    // 4. Create Account Footer Text
                    Row(
                      mainAxisAlignment: MainAxisAlignment.center,
                      children: [
                        Text(
                          "Don't have an account? ",
                          style: AppTypography.bodySmall.copyWith(
                            color: const Color(0xFF64748B),
                            fontSize: 13,
                          ),
                        ),
                        InkWell(
                          onTap: _onContinue,
                          child: Text(
                            'Create Account',
                            style: AppTypography.bodySmall.copyWith(
                              color: const Color(0xFF0F2537),
                              fontWeight: FontWeight.w800,
                              fontSize: 13,
                            ),
                          ),
                        ),
                      ],
                    ),

                    const SizedBox(height: AppSpacing.lg),
                  ],
                ),
              ),
            ),

            // 5. Bottom Cityscape Vector Illustration
            SizedBox(
              width: double.infinity,
              height: 180,
              child: Image.asset(
                'assets/images/login_cityscape.png',
                fit: BoxFit.cover,
                errorBuilder: (context, error, stackTrace) {
                  return Container(
                    color: const Color(0xFFE2E8F0),
                    child: const Center(
                      child: Icon(Icons.location_city_rounded, size: 48, color: Color(0xFF64748B)),
                    ),
                  );
                },
              ),
            ),
          ],
        ),
      ),
    );
  }
}
