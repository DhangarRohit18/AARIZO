import 'package:flutter/material.dart';
import '../../../../core/repositories/repositories.dart';
import '../../../../core/theme/app_colors.dart';
import '../../../../core/theme/app_tokens.dart';
import '../../../../core/theme/app_typography.dart';

class ResidentProfileScreen extends StatelessWidget {
  const ResidentProfileScreen({super.key});

  @override
  Widget build(BuildContext context) {
    final resident = ResidentRepository.getCanonicalResident();
    final society = SocietyRepository.currentSociety;
    final vehicles = ProfileRepository.vehicles;
    final family = ProfileRepository.familyMembers;
    final staff = ProfileRepository.householdStaff;

    return Scaffold(
      backgroundColor: AppColors.appBackground,
      appBar: AppBar(
        title: const Text('Resident Profile'),
        backgroundColor: AppColors.primaryDarkNavy,
        foregroundColor: Colors.white,
        elevation: 0,
        leading: IconButton(
          icon: const Icon(Icons.arrow_back_ios_new_rounded, size: 20),
          onPressed: () => Navigator.of(context).pop(),
        ),
      ),
      body: SingleChildScrollView(
        padding: const EdgeInsets.all(AppSpacing.lg),
        child: Column(
          crossAxisAlignment: CrossAxisAlignment.start,
          children: [
            // Profile Header Card
            Container(
              decoration: BoxDecoration(
                gradient: const LinearGradient(
                  colors: [AppColors.primaryDarkNavy, AppColors.primarySlate],
                  begin: Alignment.topLeft,
                  end: Alignment.bottomRight,
                ),
                borderRadius: AppRadius.borderLg,
              ),
              padding: const EdgeInsets.all(AppSpacing.lg),
              child: Column(
                children: [
                  Container(
                    width: 64,
                    height: 64,
                    decoration: const BoxDecoration(
                      color: AppColors.brandBlue,
                      shape: BoxShape.circle,
                    ),
                    child: const Center(
                      child: Text(
                        'SK',
                        style: TextStyle(color: Colors.white, fontWeight: FontWeight.w800, fontSize: 24),
                      ),
                    ),
                  ),
                  const SizedBox(height: AppSpacing.md),
                  Text(resident.name, style: AppTypography.displayHeading.copyWith(color: Colors.white, fontSize: 20)),
                  Text(resident.canonicalDisplay, style: AppTypography.bodySmall.copyWith(color: Colors.blue.shade200)),
                  const SizedBox(height: AppSpacing.sm),
                  Container(
                    padding: const EdgeInsets.symmetric(horizontal: 10, vertical: 3),
                    decoration: BoxDecoration(
                      color: AppColors.emeraldSuccess,
                      borderRadius: BorderRadius.circular(AppRadius.sm),
                    ),
                    child: Text(
                      '${resident.type.toUpperCase()} • VERIFIED RESIDENT',
                      style: AppTypography.badgeText.copyWith(color: Colors.white, fontWeight: FontWeight.w800, fontSize: 10),
                    ),
                  ),
                ],
              ),
            ),

            const SizedBox(height: AppSpacing.xl),

            // Section 1: Contact & Property Details
            Text('PROPERTY & CONTACT INFORMATION', style: AppTypography.badgeText),
            const SizedBox(height: AppSpacing.xs),
            Card(
              child: Padding(
                padding: const EdgeInsets.all(AppSpacing.md),
                child: Column(
                  children: [
                    _buildInfoRow(Icons.apartment_rounded, 'Society Name', society.name),
                    const Divider(height: AppSpacing.md),
                    _buildInfoRow(Icons.location_on_rounded, 'Society Address', society.address),
                    const Divider(height: AppSpacing.md),
                    _buildInfoRow(Icons.phone_rounded, 'Phone Number', resident.phone),
                    const Divider(height: AppSpacing.md),
                    _buildInfoRow(Icons.email_rounded, 'Registered Email', resident.email),
                  ],
                ),
              ),
            ),

            const SizedBox(height: AppSpacing.xl),

            // Section 2: Registered Vehicles
            Text('REGISTERED VEHICLES (${vehicles.length})', style: AppTypography.badgeText),
            const SizedBox(height: AppSpacing.xs),
            Card(
              child: Column(
                children: vehicles.map((v) {
                  return ListTile(
                    leading: Icon(
                      v.type == 'Car' ? Icons.directions_car_rounded : Icons.two_wheeler_rounded,
                      color: AppColors.brandBlue,
                    ),
                    title: Text(v.tag, style: AppTypography.titleMedium.copyWith(fontSize: 14)),
                    subtitle: Text('${v.type} • ${v.modelName}', style: AppTypography.caption),
                  );
                }).toList(),
              ),
            ),

            const SizedBox(height: AppSpacing.xl),

            // Section 3: Family Members
            Text('FAMILY MEMBERS ROSTER (${family.length})', style: AppTypography.badgeText),
            const SizedBox(height: AppSpacing.xs),
            Card(
              child: Column(
                children: family.map((m) {
                  return ListTile(
                    leading: const CircleAvatar(
                      backgroundColor: AppColors.surfaceSubtle,
                      child: Icon(Icons.person_rounded, color: AppColors.primarySlate),
                    ),
                    title: Text(m.name, style: AppTypography.titleMedium.copyWith(fontSize: 14)),
                    subtitle: Text('${m.relation} • ${m.phone}', style: AppTypography.caption),
                  );
                }).toList(),
              ),
            ),

            const SizedBox(height: AppSpacing.xl),

            // Section 4: Daily Household Staff
            Text('DAILY HOUSEHOLD STAFF (${staff.length})', style: AppTypography.badgeText),
            const SizedBox(height: AppSpacing.xs),
            Card(
              child: Column(
                children: staff.map((s) {
                  return ListTile(
                    leading: const CircleAvatar(
                      backgroundColor: AppColors.amberWarningBg,
                      child: Icon(Icons.cleaning_services_rounded, color: AppColors.amberWarning),
                    ),
                    title: Text(s.name, style: AppTypography.titleMedium.copyWith(fontSize: 14)),
                    subtitle: Text('${s.role} • Gate Passcode: ••••', style: AppTypography.caption),
                  );
                }).toList(),
              ),
            ),
          ],
        ),
      ),
    );
  }

  Widget _buildInfoRow(IconData icon, String label, String value) {
    return Row(
      children: [
        Icon(icon, size: 18, color: AppColors.secondarySlate),
        const SizedBox(width: AppSpacing.sm),
        Expanded(
          child: Column(
            crossAxisAlignment: CrossAxisAlignment.start,
            children: [
              Text(label, style: AppTypography.caption),
              Text(value, style: AppTypography.bodySmall.copyWith(fontWeight: FontWeight.w600)),
            ],
          ),
        ),
      ],
    );
  }
}
