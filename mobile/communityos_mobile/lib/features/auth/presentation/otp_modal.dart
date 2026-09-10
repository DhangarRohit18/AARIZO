import 'dart:async';
import 'package:flutter/material.dart';
import '../../../core/theme/app_colors.dart';
import '../../../core/theme/app_tokens.dart';
import '../../../core/theme/app_typography.dart';
import '../../guard/presentation/guard_shell.dart';
import '../../resident/presentation/resident_shell.dart';
import '../../secretary/presentation/secretary_shell.dart';

class OtpModalSheet extends StatefulWidget {
  final String phoneNumber;
  final String selectedRole;

  const OtpModalSheet({
    super.key,
    required this.phoneNumber,
    required this.selectedRole,
  });

  @override
  State<OtpModalSheet> createState() => _OtpModalSheetState();
}

class _OtpModalSheetState extends State<OtpModalSheet> {
  final TextEditingController _otpController = TextEditingController(text: '4092');
  bool _isLoading = false;
  String? _errorMessage;
  int _timerSeconds = 30;
  Timer? _countdownTimer;

  @override
  void initState() {
    super.initState();
    _startTimer();
  }

  void _startTimer() {
    _timerSeconds = 30;
    _countdownTimer?.cancel();
    _countdownTimer = Timer.periodic(const Duration(seconds: 1), (timer) {
      if (_timerSeconds > 0) {
        setState(() {
          _timerSeconds--;
        });
      } else {
        timer.cancel();
      }
    });
  }

  @override
  void dispose() {
    _countdownTimer?.cancel();
    _otpController.dispose();
    super.dispose();
  }

  void _onVerifyOtp() async {
    final code = _otpController.text.trim();
    if (code.length != 4) {
      setState(() {
        _errorMessage = 'Please enter a valid 4-digit OTP code.';
      });
      return;
    }

    setState(() {
      _isLoading = true;
      _errorMessage = null;
    });

    await Future.delayed(const Duration(milliseconds: 500));

    if (code == '4092' || code == '1234') {
      if (mounted) {
        Navigator.of(context).pop(); // Close modal
        final isGuard = widget.selectedRole == 'guard';
        final isSecretary = widget.selectedRole == 'secretary';
        Navigator.of(context).pushAndRemoveUntil(
          MaterialPageRoute(
            builder: (context) => isGuard
                ? const GuardShell()
                : isSecretary
                    ? const SecretaryShell()
                    : const ResidentShell(),
          ),
          (route) => false,
        );
      }
    } else {
      if (mounted) {
        setState(() {
          _isLoading = false;
          _errorMessage = 'Invalid OTP code. Try entering test code 4092.';
        });
      }
    }
  }

  @override
  Widget build(BuildContext context) {
    final bottomInset = MediaQuery.of(context).viewInsets.bottom;

    return Padding(
      padding: EdgeInsets.only(bottom: bottomInset),
      child: Container(
        padding: const EdgeInsets.all(AppSpacing.xl),
        decoration: const BoxDecoration(
          color: Colors.white,
          borderRadius: BorderRadius.vertical(top: Radius.circular(AppRadius.xl)),
        ),
        child: Column(
          mainAxisSize: MainAxisSize.min,
          crossAxisAlignment: CrossAxisAlignment.start,
          children: [
            Row(
              mainAxisAlignment: MainAxisAlignment.spaceBetween,
              children: [
                Container(
                  width: 40,
                  height: 40,
                  decoration: const BoxDecoration(
                    color: AppColors.skyBlueInfoBg,
                    shape: BoxShape.circle,
                  ),
                  child: const Icon(Icons.mark_email_read_rounded, color: AppColors.brandBlue, size: 22),
                ),
                IconButton(
                  onPressed: () => Navigator.of(context).pop(),
                  icon: const Icon(Icons.close_rounded, color: AppColors.secondarySlate),
                ),
              ],
            ),

            const SizedBox(height: AppSpacing.md),

            Text('Verify Phone Number', style: AppTypography.titleLarge),
            const SizedBox(height: AppSpacing.xs),
            RichText(
              text: TextSpan(
                children: [
                  TextSpan(
                    text: 'Enter the 4-digit code sent to ',
                    style: AppTypography.bodySmall,
                  ),
                  TextSpan(
                    text: '+91 ${widget.phoneNumber}',
                    style: AppTypography.bodySmall.copyWith(
                      fontWeight: FontWeight.w700,
                      color: AppColors.textPrimary,
                    ),
                  ),
                ],
              ),
            ),

            const SizedBox(height: AppSpacing.lg),

            // Test OTP Helper Box
            Container(
              padding: const EdgeInsets.all(AppSpacing.sm),
              decoration: BoxDecoration(
                color: AppColors.amberWarningBg,
                borderRadius: AppRadius.borderSm,
                border: Border.all(color: AppColors.amberWarning.withAlpha(76)),
              ),
              child: Row(
                children: [
                  const Icon(Icons.info_outline_rounded, size: 16, color: AppColors.amberWarning),
                  const SizedBox(width: AppSpacing.sm),
                  Text(
                    'Simulated Test OTP Code: ',
                    style: AppTypography.caption.copyWith(color: AppColors.amberWarning, fontWeight: FontWeight.w600),
                  ),
                  Text(
                    '4092',
                    style: AppTypography.caption.copyWith(color: AppColors.amberWarning, fontWeight: FontWeight.w800),
                  ),
                ],
              ),
            ),

            const SizedBox(height: AppSpacing.md),

            // OTP Input Field
            TextField(
              controller: _otpController,
              keyboardType: TextInputType.number,
              maxLength: 4,
              textAlign: TextAlign.center,
              style: AppTypography.displayHeading.copyWith(letterSpacing: 12, fontSize: 24),
              decoration: InputDecoration(
                counterText: '',
                hintText: '• • • •',
                hintStyle: AppTypography.displayHeading.copyWith(
                  letterSpacing: 12,
                  fontSize: 24,
                  color: AppColors.textSubtle,
                ),
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

            if (_errorMessage != null) ...[
              const SizedBox(height: AppSpacing.sm),
              Text(
                _errorMessage!,
                style: AppTypography.bodySmall.copyWith(color: AppColors.crimsonDanger, fontWeight: FontWeight.w600),
              ),
            ],

            const SizedBox(height: AppSpacing.lg),

            // Resend Timer Row
            Row(
              mainAxisAlignment: MainAxisAlignment.spaceBetween,
              children: [
                Text(
                  _timerSeconds > 0 ? 'Resend code in ${_timerSeconds}s' : 'Didn\'t receive code?',
                  style: AppTypography.bodySmall,
                ),
                if (_timerSeconds == 0)
                  TextButton(
                    onPressed: () {
                      _startTimer();
                      setState(() {
                        _otpController.text = '4092';
                      });
                    },
                    style: TextButton.styleFrom(padding: EdgeInsets.zero),
                    child: Text(
                      'Resend OTP',
                      style: AppTypography.bodySmall.copyWith(
                        color: AppColors.brandBlue,
                        fontWeight: FontWeight.w700,
                      ),
                    ),
                  ),
              ],
            ),

            const SizedBox(height: AppSpacing.lg),

            // Verify Submit Button
            SizedBox(
              width: double.infinity,
              height: 50,
              child: ElevatedButton(
                onPressed: _isLoading ? null : _onVerifyOtp,
                style: ElevatedButton.styleFrom(
                  backgroundColor: AppColors.primaryDarkNavy,
                  shape: const RoundedRectangleBorder(borderRadius: AppRadius.borderLg),
                ),
                child: _isLoading
                    ? const SizedBox(
                        width: 20,
                        height: 20,
                        child: CircularProgressIndicator(strokeWidth: 2, color: Colors.white),
                      )
                    : Text(
                        'Verify & Enter Portal',
                        style: AppTypography.buttonLabel,
                      ),
              ),
            ),
          ],
        ),
      ),
    );
  }
}
