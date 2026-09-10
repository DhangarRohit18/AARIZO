import 'package:flutter/material.dart';
import 'package:flutter/services.dart';
import '../../../core/theme/app_colors.dart';
import 'finances/issue_bill_modal.dart';
import 'home/secretary_home_tab.dart';
import 'notices/create_notice_modal.dart';
import 'notices/secretary_notices_tab.dart';
import 'profile/secretary_profile_tab.dart';
import 'residents/secretary_residents_tab.dart';
import 'widgets/secretary_header_bar.dart';

class SecretaryShell extends StatefulWidget {
  final int initialTabIndex;

  const SecretaryShell({
    super.key,
    this.initialTabIndex = 0,
  });

  @override
  State<SecretaryShell> createState() => _SecretaryShellState();
}

class _SecretaryShellState extends State<SecretaryShell> {
  late int _currentIndex;

  @override
  void initState() {
    super.initState();
    _currentIndex = widget.initialTabIndex;
  }

  void _onTabSelected(int index) {
    setState(() {
      _currentIndex = index;
    });
  }

  void _showQuickActionMenu() {
    HapticFeedback.lightImpact();
    showModalBottomSheet(
      context: context,
      isScrollControlled: true,
      backgroundColor: Colors.transparent,
      builder: (context) => Container(
        padding: const EdgeInsets.all(20),
        decoration: const BoxDecoration(
          color: Colors.white,
          borderRadius: BorderRadius.vertical(top: Radius.circular(24)),
        ),
        child: Column(
          mainAxisSize: MainAxisSize.min,
          crossAxisAlignment: CrossAxisAlignment.start,
          children: [
            Center(
              child: Container(
                width: 40,
                height: 4,
                decoration: BoxDecoration(
                  color: AppColors.borderSubtle,
                  borderRadius: BorderRadius.circular(2),
                ),
              ),
            ),
            const SizedBox(height: 16),
            const Text(
              'Secretary Quick Actions',
              style: TextStyle(fontSize: 18, fontWeight: FontWeight.bold, color: AppColors.primaryDarkNavy),
            ),
            const SizedBox(height: 16),
            ListTile(
              leading: Container(
                padding: const EdgeInsets.all(8),
                decoration: const BoxDecoration(color: AppColors.skyBlueInfoBg, shape: BoxShape.circle),
                child: const Icon(Icons.campaign_rounded, color: AppColors.brandBlue),
              ),
              title: const Text('Broadcast Notice', style: TextStyle(fontWeight: FontWeight.bold)),
              subtitle: const Text('Publish announcement to society residents'),
              onTap: () {
                Navigator.pop(context);
                showModalBottomSheet(
                  context: context,
                  isScrollControlled: true,
                  backgroundColor: Colors.transparent,
                  builder: (context) => CreateNoticeModal(onUpdated: () => setState(() {})),
                );
              },
            ),
            ListTile(
              leading: Container(
                padding: const EdgeInsets.all(8),
                decoration: const BoxDecoration(color: AppColors.amberWarningBg, shape: BoxShape.circle),
                child: const Icon(Icons.person_add_rounded, color: AppColors.amberWarning),
              ),
              title: const Text('Add / Verify Resident', style: TextStyle(fontWeight: FontWeight.bold)),
              subtitle: const Text('Review KYC or add flat tenant'),
              onTap: () {
                Navigator.pop(context);
                _onTabSelected(1); // Switch to Residents tab
              },
            ),
            ListTile(
              leading: Container(
                padding: const EdgeInsets.all(8),
                decoration: const BoxDecoration(color: AppColors.emeraldSuccessBg, shape: BoxShape.circle),
                child: const Icon(Icons.receipt_long_rounded, color: AppColors.emeraldSuccess),
              ),
              title: const Text('Issue Maintenance Bill', style: TextStyle(fontWeight: FontWeight.bold)),
              subtitle: const Text('Generate monthly maintenance dues invoice'),
              onTap: () {
                Navigator.pop(context);
                showModalBottomSheet(
                  context: context,
                  isScrollControlled: true,
                  backgroundColor: Colors.transparent,
                  builder: (context) => IssueBillModal(onUpdated: () => setState(() {})),
                );
              },
            ),
            const SizedBox(height: 12),
          ],
        ),
      ),
    );
  }

  @override
  Widget build(BuildContext context) {
    final tabs = [
      SecretaryHomeTab(
        onNavigateToTab: _onTabSelected,
      ),
      const SecretaryResidentsTab(),
      const SecretaryNoticesTab(),
      const SecretaryProfileTab(),
    ];

    return Scaffold(
      backgroundColor: AppColors.appBackground,
      appBar: SecretaryHeaderBar(
        onProfileTap: () => _onTabSelected(3),
      ),
      body: AnimatedSwitcher(
        duration: const Duration(milliseconds: 220),
        switchInCurve: Curves.easeOutCubic,
        switchOutCurve: Curves.easeInCubic,
        transitionBuilder: (child, animation) {
          return FadeTransition(
            opacity: animation,
            child: child,
          );
        },
        child: KeyedSubtree(
          key: ValueKey<int>(_currentIndex),
          child: tabs[_currentIndex],
        ),
      ),
      floatingActionButton: FloatingActionButton(
        onPressed: _showQuickActionMenu,
        backgroundColor: AppColors.primaryDarkNavy,
        elevation: 6,
        shape: const CircleBorder(),
        child: const Icon(Icons.add_rounded, color: Colors.white, size: 28),
      ),
      floatingActionButtonLocation: FloatingActionButtonLocation.centerDocked,
      bottomNavigationBar: BottomAppBar(
        shape: const CircularNotchedRectangle(),
        notchMargin: 6,
        color: Colors.white,
        elevation: 12,
        padding: EdgeInsets.zero,
        child: Container(
          height: 60,
          decoration: const BoxDecoration(
            border: Border(top: BorderSide(color: AppColors.borderSubtle, width: 1)),
          ),
          child: Row(
            mainAxisAlignment: MainAxisAlignment.spaceAround,
            children: [
              // Tab 0: Home
              _buildNavItem(
                index: 0,
                icon: Icons.home_outlined,
                activeIcon: Icons.home_rounded,
                label: 'Home',
              ),
              // Tab 1: Residents
              _buildNavItem(
                index: 1,
                icon: Icons.apartment_outlined,
                activeIcon: Icons.apartment_rounded,
                label: 'Residents',
              ),
              const SizedBox(width: 48), // Gap for central FAB
              // Tab 2: Notices
              _buildNavItem(
                index: 2,
                icon: Icons.campaign_outlined,
                activeIcon: Icons.campaign_rounded,
                label: 'Notices',
              ),
              // Tab 3: Profile
              _buildNavItem(
                index: 3,
                icon: Icons.person_outline_rounded,
                activeIcon: Icons.person_rounded,
                label: 'Profile',
              ),
            ],
          ),
        ),
      ),
    );
  }

  Widget _buildNavItem({
    required int index,
    required IconData icon,
    required IconData activeIcon,
    required String label,
  }) {
    final isSelected = _currentIndex == index;

    return InkWell(
      onTap: () {
        HapticFeedback.selectionClick();
        _onTabSelected(index);
      },
      borderRadius: BorderRadius.circular(12),
      child: Padding(
        padding: const EdgeInsets.symmetric(horizontal: 12, vertical: 6),
        child: Column(
          mainAxisSize: MainAxisSize.min,
          mainAxisAlignment: MainAxisAlignment.center,
          children: [
            Icon(
              isSelected ? activeIcon : icon,
              color: isSelected ? AppColors.primaryDarkNavy : const Color(0xFF64748B),
              size: 22,
            ),
            const SizedBox(height: 2),
            Text(
              label,
              style: TextStyle(
                fontSize: 11,
                fontWeight: isSelected ? FontWeight.w800 : FontWeight.w500,
                color: isSelected ? AppColors.primaryDarkNavy : const Color(0xFF64748B),
              ),
            ),
          ],
        ),
      ),
    );
  }
}

