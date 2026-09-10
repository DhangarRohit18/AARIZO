import 'package:flutter/material.dart';
import 'package:flutter/services.dart';
import '../../../core/theme/app_colors.dart';
import '../../../core/theme/app_typography.dart';
import '../../auth/presentation/role_selector_screen.dart';
import 'activity/guard_activity_tab.dart';
import 'alerts/guard_alerts_tab.dart';
import 'dashboard/guard_dashboard_tab.dart';
import 'verification/passcode_verification_screen.dart';

class GuardShell extends StatefulWidget {
  final int initialTabIndex;

  const GuardShell({
    super.key,
    this.initialTabIndex = 0,
  });

  @override
  State<GuardShell> createState() => _GuardShellState();
}

class _GuardShellState extends State<GuardShell> {
  late int _currentIndex;

  @override
  void initState() {
    super.initState();
    _currentIndex = widget.initialTabIndex;
  }

  void _onTabTapped(int index) {
    setState(() {
      _currentIndex = index;
    });
  }

  void _onLogout() {
    showDialog(
      context: context,
      builder: (context) => AlertDialog(
        title: const Text('Exit Guard Terminal'),
        content: const Text('Are you sure you want to exit the Guard Gate Terminal and return to role selection?'),
        actions: [
          TextButton(
            onPressed: () => Navigator.of(context).pop(),
            child: const Text('Cancel'),
          ),
          ElevatedButton(
            onPressed: () {
              Navigator.of(context).pop();
              Navigator.of(context).pushAndRemoveUntil(
                MaterialPageRoute(builder: (context) => const RoleSelectorScreen()),
                (route) => false,
              );
            },
            style: ElevatedButton.styleFrom(backgroundColor: AppColors.primaryDarkNavy),
            child: const Text('Exit Terminal'),
          ),
        ],
      ),
    );
  }

  @override
  Widget build(BuildContext context) {
    final List<Widget> tabs = [
      GuardDashboardTab(
        onNavigateTab: (index) {
          setState(() {
            _currentIndex = index;
          });
        },
      ),
      PasscodeVerificationScreen(
        onVerified: () {
          setState(() {});
        },
      ),
      const GuardActivityTab(),
      const GuardAlertsTab(),
    ];

    return Scaffold(
      backgroundColor: AppColors.appBackground,
      appBar: AppBar(
        backgroundColor: AppColors.primaryDarkNavy,
        elevation: 0,
        leading: IconButton(
          icon: const Icon(Icons.arrow_back_ios_new_rounded, color: Colors.white, size: 20),
          tooltip: 'Exit Terminal / Switch Role',
          onPressed: _onLogout,
        ),
        title: Column(
          crossAxisAlignment: CrossAxisAlignment.start,
          mainAxisSize: MainAxisSize.min,
          children: [
            Text(
              'Guard Gate Terminal',
              style: AppTypography.titleMedium.copyWith(
                color: Colors.white,
                fontWeight: FontWeight.w800,
                fontSize: 16,
              ),
            ),
            Text(
              'Officer R. Singh • Main Gate #1',
              style: AppTypography.caption.copyWith(
                color: AppColors.amberWarning,
                fontSize: 11,
                fontWeight: FontWeight.w600,
              ),
            ),
          ],
        ),
        actions: [
          IconButton(
            icon: const Icon(Icons.swap_horiz_rounded, color: Colors.white),
            tooltip: 'Switch Role',
            onPressed: _onLogout,
          ),
        ],
      ),
      body: SafeArea(
        child: AnimatedSwitcher(
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
      ),
      bottomNavigationBar: Container(
        decoration: BoxDecoration(
          color: Colors.white,
          boxShadow: [
            BoxShadow(
              color: Colors.black.withAlpha(12),
              blurRadius: 16,
              offset: const Offset(0, -4),
            ),
          ],
          border: const Border(
            top: BorderSide(color: AppColors.borderSubtle, width: 1),
          ),
        ),
        child: BottomNavigationBar(
          currentIndex: _currentIndex,
          onTap: (index) {
            HapticFeedback.selectionClick();
            _onTabTapped(index);
          },
          type: BottomNavigationBarType.fixed,
          backgroundColor: Colors.white,
          selectedItemColor: AppColors.brandBlue,
          unselectedItemColor: const Color(0xFF64748B),
          selectedLabelStyle: AppTypography.caption.copyWith(fontWeight: FontWeight.w800, fontSize: 11),
          unselectedLabelStyle: AppTypography.caption.copyWith(fontWeight: FontWeight.w500, fontSize: 11),
          elevation: 0,
          items: const [
            BottomNavigationBarItem(
              icon: Icon(Icons.dashboard_outlined),
              activeIcon: Icon(Icons.dashboard_rounded, color: AppColors.brandBlue),
              label: 'Dashboard',
            ),
            BottomNavigationBarItem(
              icon: Icon(Icons.dialpad_outlined),
              activeIcon: Icon(Icons.dialpad_rounded, color: AppColors.brandBlue),
              label: 'Verify Pass',
            ),
            BottomNavigationBarItem(
              icon: Icon(Icons.history_outlined),
              activeIcon: Icon(Icons.history_rounded, color: AppColors.brandBlue),
              label: 'Activity',
            ),
            BottomNavigationBarItem(
              icon: Icon(Icons.shield_outlined),
              activeIcon: Icon(Icons.shield_rounded, color: AppColors.brandBlue),
              label: 'SOS Alerts',
            ),
          ],
        ),
      ),
    );
  }
}
