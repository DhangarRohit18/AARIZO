import 'package:flutter/material.dart';
import '../../../../core/repositories/repositories.dart';
import '../../../../core/theme/app_colors.dart';
import '../../../../core/theme/app_typography.dart';
import '../notifications/secretary_notifications_screen.dart';

class SecretaryHeaderBar extends StatelessWidget implements PreferredSizeWidget {
  final VoidCallback? onProfileTap;

  const SecretaryHeaderBar({
    super.key,
    this.onProfileTap,
  });

  @override
  Size get preferredSize => const Size.fromHeight(68);

  @override
  Widget build(BuildContext context) {
    final unreadNotifs = SecretaryRepository.getNotifications().where((n) => !n.isRead).length;

    return Container(
      color: AppColors.primaryDarkNavy,
      padding: const EdgeInsets.symmetric(horizontal: 16, vertical: 10),
      child: SafeArea(
        bottom: false,
        child: Row(
          children: [
            // Left User Avatar Button
            InkWell(
              onTap: onProfileTap,
              borderRadius: BorderRadius.circular(20),
              child: Container(
                width: 40,
                height: 40,
                decoration: BoxDecoration(
                  color: Colors.white.withAlpha(30),
                  shape: BoxShape.circle,
                  border: Border.all(color: Colors.white30, width: 1.5),
                ),
                child: const Icon(
                  Icons.person_outline_rounded,
                  color: Colors.white,
                  size: 22,
                ),
              ),
            ),
            const SizedBox(width: 12),

            // Center Title & Subtitle
            Expanded(
              child: Column(
                mainAxisAlignment: MainAxisAlignment.center,
                crossAxisAlignment: CrossAxisAlignment.start,
                children: [
                  Row(
                    mainAxisSize: MainAxisSize.min,
                    children: [
                      Flexible(
                        child: Text(
                          'Green Valley Society',
                          style: AppTypography.titleMedium.copyWith(
                            color: Colors.white,
                            fontWeight: FontWeight.bold,
                            fontSize: 16,
                          ),
                          overflow: TextOverflow.ellipsis,
                        ),
                      ),
                      const SizedBox(width: 4),
                      const Icon(
                        Icons.keyboard_arrow_down_rounded,
                        color: Colors.white,
                        size: 20,
                      ),
                    ],
                  ),
                  const Text(
                    'Secretary',
                    style: TextStyle(
                      color: Colors.white70,
                      fontSize: 12,
                      fontWeight: FontWeight.w500,
                    ),
                  ),
                ],
              ),
            ),

            // Right Notification Bell
            Stack(
              clipBehavior: Clip.none,
              children: [
                Container(
                  width: 40,
                  height: 40,
                  decoration: BoxDecoration(
                    color: Colors.white.withAlpha(20),
                    shape: BoxShape.circle,
                  ),
                  child: IconButton(
                    icon: const Icon(Icons.notifications_none_rounded, color: Colors.white, size: 20),
                    padding: EdgeInsets.zero,
                    onPressed: () {
                      Navigator.of(context).push(
                        MaterialPageRoute(
                          builder: (context) => const SecretaryNotificationsScreen(),
                        ),
                      );
                    },
                  ),
                ),
                if (unreadNotifs > 0)
                  Positioned(
                    right: 2,
                    top: 2,
                    child: Container(
                      padding: const EdgeInsets.all(4),
                      decoration: const BoxDecoration(
                        color: AppColors.crimsonDanger,
                        shape: BoxShape.circle,
                      ),
                      constraints: const BoxConstraints(
                        minWidth: 14,
                        minHeight: 14,
                      ),
                      child: Text(
                        '$unreadNotifs',
                        style: const TextStyle(
                          color: Colors.white,
                          fontSize: 8,
                          fontWeight: FontWeight.bold,
                        ),
                        textAlign: TextAlign.center,
                      ),
                    ),
                  ),
              ],
            ),
          ],
        ),
      ),
    );
  }
}
