import 'package:flutter/material.dart';
import '../../../../core/models/models.dart';
import '../../../../core/repositories/repositories.dart';
import '../../../../core/theme/app_colors.dart';
import '../../../../core/theme/app_tokens.dart';
import '../../../../core/theme/app_typography.dart';
import 'visitor_decision_modal.dart';

class PasscodeVerificationScreen extends StatefulWidget {
  final VoidCallback? onVerified;

  const PasscodeVerificationScreen({
    super.key,
    this.onVerified,
  });

  @override
  State<PasscodeVerificationScreen> createState() => _PasscodeVerificationScreenState();
}

class _PasscodeVerificationScreenState extends State<PasscodeVerificationScreen> {
  String _enteredCode = ''; // Empty default; use keypad or quick demo button
  String? _verificationError;
  GatePassModel? _resolvedPass;

  void _onKeyPress(String digit) {
    if (_enteredCode.length < 4) {
      setState(() {
        _enteredCode += digit;
        _verificationError = null;
        _resolvedPass = null;
      });
    }
  }

  void _onBackspace() {
    if (_enteredCode.isNotEmpty) {
      setState(() {
        _enteredCode = _enteredCode.substring(0, _enteredCode.length - 1);
        _verificationError = null;
        _resolvedPass = null;
      });
    }
  }

  void _onClear() {
    setState(() {
      _enteredCode = '';
      _verificationError = null;
      _resolvedPass = null;
    });
  }

  void _onVerify() {
    if (_enteredCode.length != 4) {
      setState(() {
        _verificationError = 'Please enter a 4-digit numeric passcode.';
      });
      return;
    }

    final pass = GatePassRepository.findByPasscode(_enteredCode);
    if (pass != null) {
      setState(() {
        _resolvedPass = pass;
        _verificationError = null;
      });

      showModalBottomSheet(
        context: context,
        isScrollControlled: true,
        backgroundColor: Colors.transparent,
        builder: (context) => VisitorDecisionModal(
          pass: pass,
          onUpdated: () {
            setState(() {
              _resolvedPass = GatePassRepository.findByPasscode(_enteredCode);
            });
            widget.onVerified?.call();
          },
        ),
      );
    } else {
      setState(() {
        _resolvedPass = null;
        _verificationError = 'Invalid Passcode "$_enteredCode" — Code not found or expired.';
      });
    }
  }

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      backgroundColor: AppColors.appBackground,
      appBar: AppBar(
        title: const Text('Gate #1 Verification Terminal'),
        actions: [
          IconButton(
            onPressed: _onClear,
            icon: const Icon(Icons.refresh_rounded),
            tooltip: 'Reset Keypad',
          ),
        ],
      ),
      body: SafeArea(
        child: SingleChildScrollView(
          padding: const EdgeInsets.symmetric(horizontal: AppSpacing.lg, vertical: AppSpacing.md),
          child: Column(
            crossAxisAlignment: CrossAxisAlignment.center,
            children: [
              // Gate Header & Terminal Identity
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
                      width: 42,
                      height: 42,
                      decoration: const BoxDecoration(
                        color: AppColors.amberWarning,
                        shape: BoxShape.circle,
                      ),
                      child: const Icon(Icons.shield_rounded, color: Colors.white, size: 22),
                    ),
                    const SizedBox(width: AppSpacing.md),
                    Expanded(
                      child: Column(
                        crossAxisAlignment: CrossAxisAlignment.start,
                        children: [
                          Text(
                            'Gate #1 North Terminal',
                            style: AppTypography.titleMedium.copyWith(color: Colors.white),
                          ),
                          Text(
                            'Officer R. Singh • Green Valley Society',
                            style: AppTypography.bodySmall.copyWith(color: Colors.white.withAlpha(204)),
                          ),
                        ],
                      ),
                    ),
                    Container(
                      padding: const EdgeInsets.symmetric(horizontal: 8, vertical: 4),
                      decoration: BoxDecoration(
                        color: AppColors.emeraldSuccess,
                        borderRadius: AppRadius.borderSm,
                      ),
                      child: Text(
                        'ONLINE',
                        style: AppTypography.caption.copyWith(color: Colors.white, fontWeight: FontWeight.w800),
                      ),
                    ),
                  ],
                ),
              ),

              const SizedBox(height: AppSpacing.lg),

              // Demo Helper Hint Banner
              Container(
                width: double.infinity,
                padding: const EdgeInsets.symmetric(horizontal: AppSpacing.md, vertical: AppSpacing.sm),
                decoration: BoxDecoration(
                  color: AppColors.skyBlueInfoBg,
                  borderRadius: AppRadius.borderMd,
                  border: Border.all(color: AppColors.skyBlueInfo.withAlpha(76)),
                ),
                child: Row(
                  children: [
                    const Icon(Icons.info_outline_rounded, size: 18, color: AppColors.brandBlue),
                    const SizedBox(width: AppSpacing.sm),
                    Expanded(
                      child: RichText(
                        text: TextSpan(
                          children: [
                            TextSpan(
                              text: 'Canonical Demo Passcode: ',
                              style: AppTypography.caption.copyWith(color: AppColors.brandBlue),
                            ),
                            TextSpan(
                              text: '8492',
                              style: AppTypography.caption.copyWith(
                                color: AppColors.brandBlue,
                                fontWeight: FontWeight.w800,
                              ),
                            ),
                            TextSpan(
                              text: ' (Rahul Sharma • Tower B · Flat 1204)',
                              style: AppTypography.caption.copyWith(color: AppColors.brandBlue),
                            ),
                          ],
                        ),
                      ),
                    ),
                  ],
                ),
              ),

              const SizedBox(height: AppSpacing.xl),

              // Keypad Terminal Screen Display
              Container(
                width: double.infinity,
                padding: const EdgeInsets.symmetric(vertical: 20, horizontal: 24),
                decoration: BoxDecoration(
                  color: Colors.white,
                  borderRadius: AppRadius.borderLg,
                  border: Border.all(
                    color: _verificationError != null
                        ? AppColors.crimsonDanger
                        : (_enteredCode.length == 4 ? AppColors.emeraldSuccess : AppColors.borderSubtle),
                    width: 2,
                  ),
                  boxShadow: AppShadows.cardShadow,
                ),
                child: Column(
                  children: [
                    Text(
                      'ENTER VISITOR PASSCODE',
                      style: AppTypography.caption.copyWith(
                        letterSpacing: 1.5,
                        fontWeight: FontWeight.w700,
                        color: AppColors.textMuted,
                      ),
                    ),
                    const SizedBox(height: AppSpacing.md),

                    // 4-Digit Display Boxes
                    Row(
                      mainAxisAlignment: MainAxisAlignment.center,
                      children: List.generate(4, (index) {
                        final digit = index < _enteredCode.length ? _enteredCode[index] : '';
                        final isFocused = index == _enteredCode.length;

                        return Container(
                          margin: const EdgeInsets.symmetric(horizontal: 6),
                          width: 52,
                          height: 56,
                          decoration: BoxDecoration(
                            color: digit.isNotEmpty ? AppColors.surfaceSubtle : Colors.white,
                            borderRadius: AppRadius.borderMd,
                            border: Border.all(
                              color: isFocused
                                  ? AppColors.brandBlue
                                  : (digit.isNotEmpty ? AppColors.primaryDarkNavy : AppColors.borderSubtle),
                              width: isFocused ? 2 : 1.5,
                            ),
                          ),
                          alignment: Alignment.center,
                          child: Text(
                            digit,
                            style: AppTypography.displayHeading.copyWith(
                              fontSize: 28,
                              color: AppColors.primaryDarkNavy,
                            ),
                          ),
                        );
                      }),
                    ),
                  ],
                ),
              ),

              if (_verificationError != null) ...[
                const SizedBox(height: AppSpacing.md),
                Container(
                  padding: const EdgeInsets.all(AppSpacing.md),
                  decoration: BoxDecoration(
                    color: AppColors.crimsonDangerBg,
                    borderRadius: AppRadius.borderMd,
                    border: Border.all(color: AppColors.crimsonDanger.withAlpha(76)),
                  ),
                  child: Row(
                    children: [
                      const Icon(Icons.error_outline_rounded, color: AppColors.crimsonDanger, size: 20),
                      const SizedBox(width: AppSpacing.sm),
                      Expanded(
                        child: Text(
                          _verificationError!,
                          style: AppTypography.bodySmall.copyWith(
                            color: AppColors.crimsonDanger,
                            fontWeight: FontWeight.w600,
                          ),
                        ),
                      ),
                    ],
                  ),
                ),
              ],

              if (_resolvedPass != null) ...[
                const SizedBox(height: AppSpacing.md),
                Container(
                  padding: const EdgeInsets.all(AppSpacing.md),
                  decoration: BoxDecoration(
                    color: AppColors.emeraldSuccessBg,
                    borderRadius: AppRadius.borderMd,
                    border: Border.all(color: AppColors.emeraldSuccess.withAlpha(76)),
                  ),
                  child: Row(
                    children: [
                      const Icon(Icons.check_circle_rounded, color: AppColors.emeraldSuccess, size: 22),
                      const SizedBox(width: AppSpacing.md),
                      Expanded(
                        child: Column(
                          crossAxisAlignment: CrossAxisAlignment.start,
                          children: [
                            Text(
                              _resolvedPass!.visitorName,
                              style: AppTypography.titleMedium.copyWith(color: AppColors.emeraldSuccess),
                            ),
                            Text(
                              '${_resolvedPass!.category} • Resident: ${_resolvedPass!.residentName} (${_resolvedPass!.canonicalDisplay})',
                              style: AppTypography.bodySmall.copyWith(color: AppColors.textPrimary),
                            ),
                          ],
                        ),
                      ),
                      OutlinedButton(
                        onPressed: () {
                          showModalBottomSheet(
                            context: context,
                            isScrollControlled: true,
                            backgroundColor: Colors.transparent,
                            builder: (context) => VisitorDecisionModal(
                              pass: _resolvedPass!,
                              onUpdated: () {
                                setState(() {
                                  _resolvedPass = GatePassRepository.findByPasscode(_enteredCode);
                                });
                                widget.onVerified?.call();
                              },
                            ),
                          );
                        },
                        child: const Text('Actions'),
                      ),
                    ],
                  ),
                ),
              ],

              const SizedBox(height: AppSpacing.xl),

              // Operational Keypad Grid
              Container(
                constraints: const BoxConstraints(maxWidth: 340),
                child: Column(
                  children: [
                    _buildKeypadRow(['1', '2', '3']),
                    const SizedBox(height: AppSpacing.sm),
                    _buildKeypadRow(['4', '5', '6']),
                    const SizedBox(height: AppSpacing.sm),
                    _buildKeypadRow(['7', '8', '9']),
                    const SizedBox(height: AppSpacing.sm),
                    Row(
                      mainAxisAlignment: MainAxisAlignment.spaceEvenly,
                      children: [
                        _buildKeypadButton(
                          label: 'CLEAR',
                          icon: Icons.clear_rounded,
                          color: AppColors.amberWarningBg,
                          textColor: AppColors.amberWarning,
                          onTap: _onClear,
                        ),
                        _buildKeypadButton(
                          label: '0',
                          onTap: () => _onKeyPress('0'),
                        ),
                        _buildKeypadButton(
                          label: 'BACK',
                          icon: Icons.backspace_outlined,
                          color: AppColors.surfaceSubtle,
                          textColor: AppColors.secondarySlate,
                          onTap: _onBackspace,
                        ),
                      ],
                    ),
                  ],
                ),
              ),

              const SizedBox(height: AppSpacing.xl),

              // Prominent Submit/Verify CTA
              SizedBox(
                width: double.infinity,
                height: 52,
                child: ElevatedButton.icon(
                  onPressed: _onVerify,
                  style: ElevatedButton.styleFrom(
                    backgroundColor: AppColors.brandBlue,
                    foregroundColor: Colors.white,
                    shape: const RoundedRectangleBorder(borderRadius: AppRadius.borderLg),
                    elevation: 2,
                  ),
                  icon: const Icon(Icons.verified_user_rounded, color: Colors.white, size: 22),
                  label: Text(
                    'VERIFY PASSCODE NOW',
                    style: AppTypography.buttonLabel.copyWith(letterSpacing: 0.5, fontSize: 16, color: Colors.white, fontWeight: FontWeight.bold),
                  ),
                ),
              ),
            ],
          ),
        ),
      ),
    );
  }

  Widget _buildKeypadRow(List<String> keys) {
    return Row(
      mainAxisAlignment: MainAxisAlignment.spaceEvenly,
      children: keys.map((k) => _buildKeypadButton(label: k, onTap: () => _onKeyPress(k))).toList(),
    );
  }

  Widget _buildKeypadButton({
    required String label,
    IconData? icon,
    Color? color,
    Color? textColor,
    required VoidCallback onTap,
  }) {
    return InkWell(
      onTap: onTap,
      borderRadius: AppRadius.borderLg,
      child: Container(
        width: 80,
        height: 60,
        decoration: BoxDecoration(
          color: color ?? Colors.white,
          borderRadius: AppRadius.borderLg,
          border: Border.all(color: AppColors.borderSubtle),
          boxShadow: [
            BoxShadow(
              color: Colors.black.withAlpha(8),
              blurRadius: 4,
              offset: const Offset(0, 2),
            ),
          ],
        ),
        alignment: Alignment.center,
        child: icon != null
            ? Icon(icon, color: textColor ?? AppColors.primaryDarkNavy, size: 22)
            : Text(
                label,
                style: AppTypography.displayHeading.copyWith(
                  fontSize: 22,
                  color: textColor ?? AppColors.primaryDarkNavy,
                ),
              ),
      ),
    );
  }
}
