import 'package:flutter/material.dart';
import 'package:flutter/services.dart';
import '../../../../core/models/models.dart';
import '../../../../core/repositories/repositories.dart';
import '../../../../core/theme/app_colors.dart';
import '../../../../core/theme/app_tokens.dart';
import '../../../../core/theme/app_typography.dart';
import 'sos_confirmation_modal.dart';

class SafetySosScreen extends StatefulWidget {
  const SafetySosScreen({super.key});

  @override
  State<SafetySosScreen> createState() => _SafetySosScreenState();
}

class _SafetySosScreenState extends State<SafetySosScreen> {
  List<EmergencyAlertModel> _alerts = [];
  bool _isSosActive = false;

  @override
  void initState() {
    super.initState();
    _refreshAlerts();
  }

  void _refreshAlerts() {
    setState(() {
      _alerts = EmergencyAlertRepository.getAlerts();
    });
  }

  void _triggerSosFlow() {
    SosConfirmationModal.show(
      context,
      onConfirmSOS: () {
        final resident = ResidentRepository.getCanonicalResident();
        final nowStr = 'Today, ${TimeOfDay.now().format(context)}';

        final newAlert = EmergencyAlertModel(
          id: 'sos-${DateTime.now().millisecondsSinceEpoch.toString().substring(7)}',
          residentName: resident.name,
          canonicalDisplay: resident.canonicalDisplay,
          timestamp: nowStr,
          alertType: 'Panic SOS Broadcast',
          isAcknowledged: false,
        );

        EmergencyAlertRepository.triggerSOS(newAlert);

        setState(() {
          _isSosActive = true;
        });

        _refreshAlerts();

        ScaffoldMessenger.of(context).showSnackBar(
          const SnackBar(
            content: Text('Simulated Panic SOS Alert broadcast to Gate #1 Guard Terminal!'),
            backgroundColor: AppColors.crimsonDanger,
            behavior: SnackBarBehavior.floating,
            duration: Duration(seconds: 4),
          ),
        );
      },
    );
  }

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      backgroundColor: AppColors.appBackground,
      appBar: AppBar(
        title: const Text('Safety & SOS Emergency'),
        backgroundColor: AppColors.primaryDarkNavy,
        foregroundColor: Colors.white,
        elevation: 0,
      ),
      body: SingleChildScrollView(
        padding: const EdgeInsets.all(AppSpacing.lg),
        child: Column(
          crossAxisAlignment: CrossAxisAlignment.start,
          children: [
            // Active Emergency Alert Status Banner if triggered
            if (_isSosActive) ...[
              Container(
                padding: const EdgeInsets.all(AppSpacing.md),
                decoration: BoxDecoration(
                  color: AppColors.crimsonDangerBg,
                  borderRadius: BorderRadius.circular(AppRadius.lg),
                  border: Border.all(color: AppColors.crimsonDanger),
                ),
                child: Column(
                  crossAxisAlignment: CrossAxisAlignment.start,
                  children: [
                    Row(
                      children: [
                        const Icon(Icons.emergency_rounded, color: AppColors.crimsonDanger, size: 20),
                        const SizedBox(width: AppSpacing.xs),
                        Text(
                          'PANIC SOS DISPATCHED (SIMULATION)',
                          style: AppTypography.badgeText.copyWith(color: AppColors.crimsonDanger, fontWeight: FontWeight.w800),
                        ),
                      ],
                    ),
                    const SizedBox(height: AppSpacing.xs),
                    Text(
                      'Gate #1 Guard Terminal has received panic signal for Tower B · Flat 1204.',
                      style: AppTypography.bodySmall.copyWith(color: AppColors.crimsonDanger, fontWeight: FontWeight.w600),
                    ),
                    const SizedBox(height: AppSpacing.sm),
                    OutlinedButton(
                      onPressed: () {
                        setState(() {
                          _isSosActive = false;
                        });
                      },
                      style: OutlinedButton.styleFrom(
                        foregroundColor: AppColors.crimsonDanger,
                        side: const BorderSide(color: AppColors.crimsonDanger),
                      ),
                      child: const Text('Reset Simulated SOS State'),
                    ),
                  ],
                ),
              ),
              const SizedBox(height: AppSpacing.lg),
            ],

            // SOS Trigger Button Card
            Container(
              decoration: BoxDecoration(
                gradient: const LinearGradient(
                  colors: [Color(0xFF991B1B), AppColors.crimsonDanger],
                  begin: Alignment.topLeft,
                  end: Alignment.bottomRight,
                ),
                borderRadius: AppRadius.borderLg,
                boxShadow: [
                  BoxShadow(
                    color: AppColors.crimsonDanger.withAlpha(50),
                    blurRadius: 16,
                    offset: const Offset(0, 6),
                  ),
                ],
              ),
              padding: const EdgeInsets.all(AppSpacing.xl),
              child: Column(
                children: [
                  const Icon(Icons.shield_rounded, color: Colors.white, size: 44),
                  const SizedBox(height: AppSpacing.sm),
                  Text('EMERGENCY PANIC BUTTON', style: AppTypography.displayHeading.copyWith(color: Colors.white, fontSize: 18)),
                  const SizedBox(height: AppSpacing.xs),
                  Text(
                    'Press to send immediate panic alert for Tower B · Flat 1204 to Gate #1 Security Intercom.',
                    style: AppTypography.bodySmall.copyWith(color: Colors.red.shade100),
                    textAlign: TextAlign.center,
                  ),
                  const SizedBox(height: AppSpacing.lg),
                  ElevatedButton.icon(
                    onPressed: _triggerSosFlow,
                    icon: const Icon(Icons.emergency_rounded, color: AppColors.crimsonDanger, size: 22),
                    label: const Text('TRIGGER PANIC SOS', style: TextStyle(fontWeight: FontWeight.w900, letterSpacing: 1.1)),
                    style: ElevatedButton.styleFrom(
                      backgroundColor: Colors.white,
                      foregroundColor: AppColors.crimsonDanger,
                      padding: const EdgeInsets.symmetric(horizontal: AppSpacing.xl, vertical: 16),
                      elevation: 4,
                    ),
                  ),
                ],
              ),
            ),

            const SizedBox(height: AppSpacing.xl),

            // Emergency Contacts Grid
            Text('EMERGENCY HELPLINE SHORTCUTS', style: AppTypography.badgeText),
            const SizedBox(height: AppSpacing.xs),

            GridView.count(
              crossAxisCount: 2,
              shrinkWrap: true,
              physics: const NeverScrollableScrollPhysics(),
              childAspectRatio: 2.3,
              mainAxisSpacing: AppSpacing.xs,
              crossAxisSpacing: AppSpacing.xs,
              children: [
                _buildContactTile(
                  title: 'Main Gate #1',
                  number: 'Ext #100',
                  icon: Icons.shield_rounded,
                  color: AppColors.brandBlue,
                ),
                _buildContactTile(
                  title: 'Society Office',
                  number: '+91 98200 12345',
                  icon: Icons.business_rounded,
                  color: AppColors.skyBlueInfo,
                ),
                _buildContactTile(
                  title: 'Ambulance / Medical',
                  number: '108',
                  icon: Icons.medical_services_rounded,
                  color: AppColors.crimsonDanger,
                ),
                _buildContactTile(
                  title: 'Fire & Rescue',
                  number: '101',
                  icon: Icons.local_fire_department_rounded,
                  color: AppColors.amberWarning,
                ),
              ],
            ),

            const SizedBox(height: AppSpacing.xl),

            // Recent Alerts Log
            Text('RECENT SECURITY ALERTS LOG', style: AppTypography.badgeText),
            const SizedBox(height: AppSpacing.xs),

            if (_alerts.isEmpty)
              const Card(
                child: Padding(
                  padding: EdgeInsets.all(AppSpacing.lg),
                  child: Center(child: Text('No emergency alerts logged.')),
                ),
              )
            else
              ListView.separated(
                shrinkWrap: true,
                physics: const NeverScrollableScrollPhysics(),
                itemCount: _alerts.length,
                separatorBuilder: (context, index) => const SizedBox(height: AppSpacing.xs),
                itemBuilder: (context, index) {
                  final alert = _alerts[index];

                  return Card(
                    child: Padding(
                      padding: const EdgeInsets.all(AppSpacing.md),
                      child: Row(
                        children: [
                          Container(
                            padding: const EdgeInsets.all(8),
                            decoration: const BoxDecoration(
                              color: AppColors.crimsonDangerBg,
                              shape: BoxShape.circle,
                            ),
                            child: const Icon(Icons.warning_amber_rounded, color: AppColors.crimsonDanger, size: 20),
                          ),
                          const SizedBox(width: AppSpacing.sm),
                          Expanded(
                            child: Column(
                              crossAxisAlignment: CrossAxisAlignment.start,
                              children: [
                                Text(alert.alertType, style: AppTypography.titleMedium.copyWith(fontSize: 14)),
                                Text('${alert.canonicalDisplay} • ${alert.timestamp}', style: AppTypography.caption),
                              ],
                            ),
                          ),
                          Container(
                            padding: const EdgeInsets.symmetric(horizontal: 8, vertical: 3),
                            decoration: BoxDecoration(
                              color: alert.isAcknowledged ? AppColors.emeraldSuccessBg : AppColors.amberWarningBg,
                              borderRadius: BorderRadius.circular(AppRadius.sm),
                            ),
                            child: Text(
                              alert.isAcknowledged ? 'ACKNOWLEDGED' : 'BROADCASTING',
                              style: AppTypography.badgeText.copyWith(
                                color: alert.isAcknowledged ? AppColors.emeraldSuccess : AppColors.amberWarning,
                                fontSize: 9,
                              ),
                            ),
                          ),
                        ],
                      ),
                    ),
                  );
                },
              ),
          ],
        ),
      ),
    );
  }

  Widget _buildContactTile({
    required String title,
    required String number,
    required IconData icon,
    required Color color,
  }) {
    return Container(
      decoration: BoxDecoration(
        color: Colors.white,
        borderRadius: AppRadius.borderMd,
        border: Border.all(color: AppColors.borderSubtle),
        boxShadow: AppShadows.cardShadow,
      ),
      child: InkWell(
        onTap: () {
          HapticFeedback.lightImpact();
          Clipboard.setData(ClipboardData(text: number));
          ScaffoldMessenger.of(context).showSnackBar(
            SnackBar(
              content: Text('$title helpline ($number) copied to clipboard!'),
              backgroundColor: AppColors.brandBlue,
              behavior: SnackBarBehavior.floating,
              duration: const Duration(seconds: 2),
            ),
          );
        },
        borderRadius: BorderRadius.circular(AppRadius.md),
        child: Padding(
          padding: const EdgeInsets.all(AppSpacing.sm),
          child: Row(
            children: [
              Container(
                padding: const EdgeInsets.all(8),
                decoration: BoxDecoration(
                  color: color.withAlpha(25),
                  shape: BoxShape.circle,
                ),
                child: Icon(icon, color: color, size: 20),
              ),
              const SizedBox(width: AppSpacing.xs + 2),
              Expanded(
                child: Column(
                  crossAxisAlignment: CrossAxisAlignment.start,
                  mainAxisAlignment: MainAxisAlignment.center,
                  children: [
                    Text(
                      title,
                      style: AppTypography.titleMedium.copyWith(
                        fontWeight: FontWeight.w700,
                        fontSize: 12,
                        color: AppColors.textPrimary,
                      ),
                      overflow: TextOverflow.ellipsis,
                    ),
                    const SizedBox(height: 2),
                    Text(
                      number,
                      style: AppTypography.caption.copyWith(
                        color: color,
                        fontWeight: FontWeight.w800,
                        fontSize: 11,
                      ),
                    ),
                  ],
                ),
              ),
            ],
          ),
        ),
      ),
    );
  }
}
