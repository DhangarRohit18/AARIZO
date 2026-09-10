import 'package:flutter/material.dart';
import '../../../core/theme/app_colors.dart';
import '../../../core/theme/app_tokens.dart';
import '../../../core/theme/app_typography.dart';
import 'role_selector_screen.dart';

class OnboardingScreen extends StatefulWidget {
  const OnboardingScreen({super.key});

  @override
  State<OnboardingScreen> createState() => _OnboardingScreenState();
}

class _OnboardingScreenState extends State<OnboardingScreen> {
  final PageController _pageController = PageController();
  int _currentPage = 0;

  final List<OnboardingItemData> _items = const [
    OnboardingItemData(
      title: 'Smart Visitor Management',
      description:
          'Pre-approve visitors, track entry history, and manage guest access seamlessly. Keep your society secure with real-time visitor notifications and digital gate passes.',
      imageAsset: 'assets/images/onboarding_visitor_management.png',
      fallbackIcon: Icons.shield_rounded,
    ),
    OnboardingItemData(
      title: 'Complete Family & Security Hub',
      description:
          'Manage family members, register vehicles, request services, and monitor security. Everything you need for modern society living at your fingertips.',
      imageAsset: 'assets/images/onboarding_family_hub.png',
      fallbackIcon: Icons.family_restroom_rounded,
    ),
    OnboardingItemData(
      title: 'Community & Society Services',
      description:
          'Stay connected with your community. Book amenities, raise helpdesk tickets, pay bills, access documents, and connect with neighbors all in one place.',
      imageAsset: 'assets/images/onboarding_community_services.png',
      fallbackIcon: Icons.groups_rounded,
    ),
  ];

  void _onFinishOnboarding() {
    Navigator.of(context).pushReplacement(
      MaterialPageRoute(builder: (context) => const RoleSelectorScreen()),
    );
  }

  void _onNext() {
    if (_currentPage < _items.length - 1) {
      _pageController.nextPage(
        duration: const Duration(milliseconds: 350),
        curve: Curves.easeInOut,
      );
    } else {
      _onFinishOnboarding();
    }
  }

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      body: Container(
        decoration: const BoxDecoration(
          gradient: LinearGradient(
            colors: [
              Color(0xFF8EDBFA), // Soft sky-blue top
              Color(0xFFD6F0FA), // Transition mid
              Color(0xFFF7FCFF), // Ice white bottom
            ],
            begin: Alignment.topCenter,
            end: Alignment.bottomCenter,
          ),
        ),
        child: SafeArea(
          child: Column(
            children: [
              // Top Bar with Skip & Circular Arrow Button
              Padding(
                padding: const EdgeInsets.symmetric(horizontal: AppSpacing.lg, vertical: AppSpacing.md),
                child: Row(
                  mainAxisAlignment: MainAxisAlignment.spaceBetween,
                  children: [
                    InkWell(
                      onTap: _onFinishOnboarding,
                      borderRadius: BorderRadius.circular(8),
                      child: Padding(
                        padding: const EdgeInsets.symmetric(horizontal: 8, vertical: 4),
                        child: Text(
                          'Skip',
                          style: AppTypography.bodyMedium.copyWith(
                            color: AppColors.primaryDarkNavy,
                            fontWeight: FontWeight.w600,
                            fontSize: 15,
                          ),
                        ),
                      ),
                    ),
                    GestureDetector(
                      onTap: _onNext,
                      child: Container(
                        width: 40,
                        height: 40,
                        decoration: const BoxDecoration(
                          color: Color(0xFF0F3B56),
                          shape: BoxShape.circle,
                        ),
                        child: const Icon(
                          Icons.arrow_forward_rounded,
                          color: Colors.white,
                          size: 20,
                        ),
                      ),
                    ),
                  ],
                ),
              ),

              // PageView Content
              Expanded(
                child: PageView.builder(
                  controller: _pageController,
                  itemCount: _items.length,
                  onPageChanged: (index) {
                    setState(() {
                      _currentPage = index;
                    });
                  },
                  itemBuilder: (context, index) {
                    final item = _items[index];
                    return Padding(
                      padding: const EdgeInsets.symmetric(horizontal: AppSpacing.xl),
                      child: Column(
                        mainAxisAlignment: MainAxisAlignment.center,
                        children: [
                          const Spacer(),

                          // Central 3D Illustration Graphic
                          SizedBox(
                            height: 260,
                            width: double.infinity,
                            child: Image.asset(
                              item.imageAsset,
                              fit: BoxFit.contain,
                              errorBuilder: (context, error, stackTrace) {
                                return Center(
                                  child: Container(
                                    width: 140,
                                    height: 140,
                                    decoration: BoxDecoration(
                                      color: Colors.white.withValues(alpha: 0.6),
                                      shape: BoxShape.circle,
                                    ),
                                    child: Icon(
                                      item.fallbackIcon,
                                      size: 64,
                                      color: AppColors.brandBlue,
                                    ),
                                  ),
                                );
                              },
                            ),
                          ),

                          const Spacer(),

                          // Title
                          Text(
                            item.title,
                            style: AppTypography.displayHeading.copyWith(
                              fontSize: 22,
                              fontWeight: FontWeight.w800,
                              color: const Color(0xFF1E293B),
                              height: 1.2,
                            ),
                            textAlign: TextAlign.center,
                          ),

                          const SizedBox(height: AppSpacing.md),

                          // Description Text
                          Padding(
                            padding: const EdgeInsets.symmetric(horizontal: AppSpacing.sm),
                            child: Text(
                              item.description,
                              style: AppTypography.bodyMedium.copyWith(
                                color: const Color(0xFF64748B),
                                fontSize: 13.5,
                                height: 1.45,
                              ),
                              textAlign: TextAlign.center,
                            ),
                          ),

                          const Spacer(),
                        ],
                      ),
                    );
                  },
                ),
              ),

              // Bottom Page Indicator Dots
              Padding(
                padding: const EdgeInsets.only(bottom: 36),
                child: Row(
                  mainAxisAlignment: MainAxisAlignment.center,
                  children: List.generate(_items.length, (index) {
                    final isActive = index == _currentPage;
                    return AnimatedContainer(
                      duration: const Duration(milliseconds: 250),
                      margin: const EdgeInsets.symmetric(horizontal: 4),
                      width: isActive ? 22 : 6,
                      height: 6,
                      decoration: BoxDecoration(
                        color: isActive ? const Color(0xFF1E293B) : const Color(0xFFCBD5E1),
                        borderRadius: BorderRadius.circular(3),
                      ),
                    );
                  }),
                ),
              ),
            ],
          ),
        ),
      ),
    );
  }
}

class OnboardingItemData {
  final String title;
  final String description;
  final String imageAsset;
  final IconData fallbackIcon;

  const OnboardingItemData({
    required this.title,
    required this.description,
    required this.imageAsset,
    required this.fallbackIcon,
  });
}
