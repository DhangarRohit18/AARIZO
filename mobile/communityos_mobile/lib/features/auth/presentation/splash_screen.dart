import 'dart:async';
import 'package:flutter/material.dart';
import '../../../core/theme/app_colors.dart';
import '../../../core/theme/app_tokens.dart';
import '../../../core/theme/app_typography.dart';
import 'onboarding_screen.dart';

class SplashScreen extends StatefulWidget {
  const SplashScreen({super.key});

  @override
  State<SplashScreen> createState() => _SplashScreenState();
}

class _SplashScreenState extends State<SplashScreen> with TickerProviderStateMixin {
  late AnimationController _mainController;
  late AnimationController _pulseController;
  late Animation<double> _fadeAnimation;
  late Animation<double> _scaleAnimation;
  late Animation<double> _floatAnimation;
  late Animation<double> _progressAnimation;

  double _loadingProgress = 0.0;
  String _statusText = 'Initializing Smart Gate & Security...';
  Timer? _statusTimer;
  Timer? _navigationTimer;

  final List<String> _statusMessages = [
    'Initializing Smart Gate & Security...',
    'Connecting Gate Intercom & Passcodes...',
    'Synchronizing Resident Dues & Notices...',
    'Welcome to Green Valley Society!',
  ];

  @override
  void initState() {
    super.initState();

    _mainController = AnimationController(
      vsync: this,
      duration: const Duration(milliseconds: 2800),
    );

    _pulseController = AnimationController(
      vsync: this,
      duration: const Duration(milliseconds: 1800),
    )..repeat(reverse: true);

    _fadeAnimation = Tween<double>(begin: 0.0, end: 1.0).animate(
      CurvedAnimation(parent: _mainController, curve: const Interval(0.0, 0.4, curve: Curves.easeIn)),
    );

    _scaleAnimation = Tween<double>(begin: 0.90, end: 1.0).animate(
      CurvedAnimation(parent: _mainController, curve: const Interval(0.0, 0.5, curve: Curves.easeOutCubic)),
    );

    _floatAnimation = Tween<double>(begin: -6.0, end: 6.0).animate(
      CurvedAnimation(parent: _pulseController, curve: Curves.easeInOut),
    );

    _progressAnimation = Tween<double>(begin: 0.0, end: 1.0).animate(
      CurvedAnimation(parent: _mainController, curve: Curves.easeInOutCubic),
    );

    _mainController.addListener(() {
      setState(() {
        _loadingProgress = _progressAnimation.value;
      });
    });

    _mainController.forward();

    // Rotate status messages smoothly
    int messageIndex = 0;
    _statusTimer = Timer.periodic(const Duration(milliseconds: 700), (timer) {
      if (mounted && messageIndex < _statusMessages.length - 1) {
        messageIndex++;
        setState(() {
          _statusText = _statusMessages[messageIndex];
        });
      } else {
        timer.cancel();
      }
    });

    // Navigate to Onboarding after splash sequence finishes
    _navigationTimer = Timer(const Duration(milliseconds: 3200), () {
      if (mounted) {
        Navigator.of(context).pushReplacement(
          PageRouteBuilder(
            pageBuilder: (context, animation, secondaryAnimation) => const OnboardingScreen(),
            transitionsBuilder: (context, animation, secondaryAnimation, child) {
              return FadeTransition(opacity: animation, child: child);
            },
            transitionDuration: const Duration(milliseconds: 500),
          ),
        );
      }
    });
  }

  @override
  void dispose() {
    _statusTimer?.cancel();
    _navigationTimer?.cancel();
    _mainController.dispose();
    _pulseController.dispose();
    super.dispose();
  }

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      body: Container(
        width: double.infinity,
        height: double.infinity,
        decoration: const BoxDecoration(
          gradient: LinearGradient(
            colors: [
              Color(0xFFE0F2FE), // Soft Sky Blue
              Color(0xFFF8FAFC), // Pure Soft Surface
              Color(0xFFEFF6FF), // Light Sky Glow
            ],
            begin: Alignment.topCenter,
            end: Alignment.bottomCenter,
          ),
        ),
        child: SafeArea(
          child: Padding(
            padding: const EdgeInsets.symmetric(horizontal: AppSpacing.xl),
            child: FadeTransition(
              opacity: _fadeAnimation,
              child: ScaleTransition(
                scale: _scaleAnimation,
                child: Column(
                  mainAxisAlignment: MainAxisAlignment.spaceBetween,
                  children: [
                    const SizedBox(height: AppSpacing.lg),

                    // Top Badge Tag
                    Container(
                      padding: const EdgeInsets.symmetric(horizontal: 14, vertical: 6),
                      decoration: BoxDecoration(
                        color: AppColors.brandBlue.withAlpha(20),
                        borderRadius: BorderRadius.circular(AppRadius.full),
                        border: Border.all(color: AppColors.brandBlue.withAlpha(40)),
                      ),
                      child: Row(
                        mainAxisSize: MainAxisSize.min,
                        children: [
                          Container(
                            width: 8,
                            height: 8,
                            decoration: const BoxDecoration(
                              color: AppColors.brandBlue,
                              shape: BoxShape.circle,
                            ),
                          ),
                          const SizedBox(width: 8),
                          Text(
                            'GREEN VALLEY SOCIETY EDITION • v4.0',
                            style: AppTypography.caption.copyWith(
                              color: AppColors.brandBlue,
                              fontWeight: FontWeight.w800,
                              fontSize: 10,
                              letterSpacing: 0.8,
                            ),
                          ),
                        ],
                      ),
                    ),

                    // Center 3D Hero Illustration with Glow & Float Animation
                    AnimatedBuilder(
                      animation: _floatAnimation,
                      builder: (context, child) {
                        return Transform.translate(
                          offset: Offset(0, _floatAnimation.value),
                          child: child,
                        );
                      },
                      child: Container(
                        height: 240,
                        width: double.infinity,
                        margin: const EdgeInsets.symmetric(horizontal: AppSpacing.sm),
                        decoration: BoxDecoration(
                          borderRadius: BorderRadius.circular(24),
                          boxShadow: [
                            BoxShadow(
                              color: AppColors.brandBlue.withAlpha(25),
                              blurRadius: 32,
                              offset: const Offset(0, 16),
                            ),
                          ],
                        ),
                        child: ClipRRect(
                          borderRadius: BorderRadius.circular(24),
                          child: Image.asset(
                            'assets/images/splash_hero.png',
                            fit: BoxFit.cover,
                            errorBuilder: (context, error, stackTrace) {
                              return Container(
                                color: AppColors.brandBlue,
                                child: const Icon(Icons.apartment_rounded, size: 80, color: Colors.white),
                              );
                            },
                          ),
                        ),
                      ),
                    ),

                    // Brand Title & Tagline
                    Column(
                      children: [
                        RichText(
                          text: TextSpan(
                            children: [
                              TextSpan(
                                text: 'Community',
                                style: AppTypography.displayHeading.copyWith(
                                  color: AppColors.primaryDarkNavy,
                                  fontSize: 32,
                                  fontWeight: FontWeight.w900,
                                  letterSpacing: -0.5,
                                ),
                              ),
                              TextSpan(
                                text: 'OS',
                                style: AppTypography.displayHeading.copyWith(
                                  color: AppColors.brandBlue,
                                  fontSize: 32,
                                  fontWeight: FontWeight.w900,
                                  letterSpacing: -0.5,
                                ),
                              ),
                            ],
                          ),
                        ),
                        const SizedBox(height: 6),
                        Text(
                          'Next-Gen Smart Living & Security Platform',
                          style: AppTypography.bodySmall.copyWith(
                            color: AppColors.textMuted,
                            fontWeight: FontWeight.w600,
                            fontSize: 13,
                          ),
                          textAlign: TextAlign.center,
                        ),
                      ],
                    ),

                    // Bottom Loading Bar & Status Messages
                    Column(
                      children: [
                        // Animated Status Message
                        AnimatedSwitcher(
                          duration: const Duration(milliseconds: 300),
                          child: Text(
                            _statusText,
                            key: ValueKey<String>(_statusText),
                            style: AppTypography.caption.copyWith(
                              color: AppColors.brandBlue,
                              fontWeight: FontWeight.w700,
                              fontSize: 12,
                            ),
                            textAlign: TextAlign.center,
                          ),
                        ),

                        const SizedBox(height: AppSpacing.sm),

                        // Sleek Progress Track
                        Container(
                          height: 6,
                          width: double.infinity,
                          decoration: BoxDecoration(
                            color: AppColors.borderSubtle,
                            borderRadius: BorderRadius.circular(3),
                          ),
                          child: Stack(
                            children: [
                              FractionallySizedBox(
                                widthFactor: _loadingProgress,
                                child: Container(
                                  decoration: BoxDecoration(
                                    gradient: const LinearGradient(
                                      colors: [AppColors.brandBlue, AppColors.skyBlueInfo],
                                    ),
                                    borderRadius: BorderRadius.circular(3),
                                    boxShadow: [
                                      BoxShadow(
                                        color: AppColors.brandBlue.withAlpha(100),
                                        blurRadius: 6,
                                        offset: const Offset(0, 2),
                                      ),
                                    ],
                                  ),
                                ),
                              ),
                            ],
                          ),
                        ),

                        const SizedBox(height: AppSpacing.sm),

                        // Loading Percentage Indicator
                        Text(
                          '${(_loadingProgress * 100).toInt()}%',
                          style: AppTypography.caption.copyWith(
                            color: AppColors.textSubtle,
                            fontWeight: FontWeight.w800,
                            fontSize: 11,
                          ),
                        ),

                        const SizedBox(height: AppSpacing.lg),
                      ],
                    ),
                  ],
                ),
              ),
            ),
          ),
        ),
      ),
    );
  }
}
