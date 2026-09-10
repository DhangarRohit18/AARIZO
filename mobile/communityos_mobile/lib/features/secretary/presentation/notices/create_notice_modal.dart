import 'package:flutter/material.dart';
import '../../../../core/models/models.dart';
import '../../../../core/repositories/repositories.dart';
import '../../../../core/theme/app_colors.dart';
import '../../../../core/theme/app_tokens.dart';
import '../../../../core/theme/app_typography.dart';

class CreateNoticeModal extends StatefulWidget {
  final VoidCallback onUpdated;

  const CreateNoticeModal({
    super.key,
    required this.onUpdated,
  });

  @override
  State<CreateNoticeModal> createState() => _CreateNoticeModalState();
}

class _CreateNoticeModalState extends State<CreateNoticeModal> {
  int _step = 1;
  final TextEditingController _titleController = TextEditingController();
  final TextEditingController _contentController = TextEditingController();
  String _category = 'general'; // 'general' | 'maintenance' | 'event' | 'rwa' | 'security'
  String _priority = 'Important'; // 'Normal' | 'Important' | 'Urgent'
  String _targetAudience = 'All Blocks';

  final List<String> _categories = ['general', 'maintenance', 'event', 'rwa', 'security'];
  final List<String> _priorities = ['Normal', 'Important', 'Urgent'];
  final List<String> _audiences = ['All Blocks', 'Block A', 'Block B', 'Block C', 'Owners Only', 'Tenants Only'];

  @override
  void dispose() {
    _titleController.dispose();
    _contentController.dispose();
    super.dispose();
  }

  bool get _isValid => _titleController.text.trim().length >= 4 && _contentController.text.trim().length >= 10;

  void _onPublish() {
    final notice = NoticeItemModel(
      id: 'ANN-${DateTime.now().millisecondsSinceEpoch}',
      title: _titleController.text.trim(),
      category: _category,
      priority: _priority,
      targetAudience: _targetAudience,
      summary: _contentController.text.trim().length > 100
          ? '${_contentController.text.trim().substring(0, 100)}...'
          : _contentController.text.trim(),
      content: _contentController.text.trim(),
      status: 'Published',
      publishedAt: 'Today',
      authorName: SecretaryRepository.secretaryName,
      authorRole: SecretaryRepository.secretaryRole,
      effectiveDate: 'Immediate Access',
      locationArea: _targetAudience,
    );

    SecretaryRepository.publishNotice(notice);
    widget.onUpdated();
    Navigator.of(context).pop();
    ScaffoldMessenger.of(context).showSnackBar(
      const SnackBar(
        content: Text('✓ Official Notice Broadcasted to Resident Feed!'),
        backgroundColor: AppColors.emeraldSuccess,
      ),
    );
  }

  void _onSaveDraft() {
    final draft = NoticeItemModel(
      id: 'DRAFT-${DateTime.now().millisecondsSinceEpoch}',
      title: _titleController.text.trim().isNotEmpty ? _titleController.text.trim() : 'Untitled Draft',
      category: _category,
      priority: _priority,
      targetAudience: _targetAudience,
      summary: _contentController.text.trim(),
      content: _contentController.text.trim(),
      status: 'Draft',
      publishedAt: 'Draft',
      authorName: SecretaryRepository.secretaryName,
      authorRole: SecretaryRepository.secretaryRole,
      effectiveDate: 'Draft',
      locationArea: _targetAudience,
    );

    SecretaryRepository.saveDraftNotice(draft);
    widget.onUpdated();
    Navigator.of(context).pop();
    ScaffoldMessenger.of(context).showSnackBar(
      const SnackBar(
        content: Text('✓ Draft Notice Saved in Secretary Center.'),
        backgroundColor: AppColors.amberWarning,
      ),
    );
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
        child: SingleChildScrollView(
          child: Column(
            mainAxisSize: MainAxisSize.min,
            crossAxisAlignment: CrossAxisAlignment.start,
            children: [
              // Modal Header
              Row(
                mainAxisAlignment: MainAxisAlignment.spaceBetween,
                children: [
                  Text(
                    _step == 1 ? 'Step 1: Broadcast Notice Details' : 'Step 2: Preview & Publish Broadcast',
                    style: AppTypography.titleLarge,
                  ),
                  IconButton(
                    onPressed: () => Navigator.of(context).pop(),
                    icon: const Icon(Icons.close_rounded, color: AppColors.secondarySlate),
                  ),
                ],
              ),

              const SizedBox(height: AppSpacing.md),

              if (_step == 1) ...[
                // Step 1 Form
                Text('Notice Title', style: AppTypography.caption.copyWith(fontWeight: FontWeight.w700)),
                const SizedBox(height: 4),
                TextField(
                  controller: _titleController,
                  decoration: const InputDecoration(
                    hintText: 'e.g. Overhead Water Tank Cleaning Schedule...',
                    filled: true,
                    fillColor: AppColors.surfaceSubtle,
                    border: OutlineInputBorder(borderRadius: AppRadius.borderMd),
                  ),
                ),

                const SizedBox(height: AppSpacing.md),

                Row(
                  children: [
                    Expanded(
                      child: Column(
                        crossAxisAlignment: CrossAxisAlignment.start,
                        children: [
                          Text('Category', style: AppTypography.caption.copyWith(fontWeight: FontWeight.w700)),
                          const SizedBox(height: 4),
                          DropdownButtonFormField<String>(
                            initialValue: _category,
                            decoration: const InputDecoration(
                              filled: true,
                              fillColor: AppColors.surfaceSubtle,
                              border: OutlineInputBorder(borderRadius: AppRadius.borderMd),
                            ),
                            items: _categories.map((c) => DropdownMenuItem(value: c, child: Text(c.toUpperCase()))).toList(),
                            onChanged: (v) => setState(() => _category = v!),
                          ),
                        ],
                      ),
                    ),
                    const SizedBox(width: AppSpacing.md),
                    Expanded(
                      child: Column(
                        crossAxisAlignment: CrossAxisAlignment.start,
                        children: [
                          Text('Priority', style: AppTypography.caption.copyWith(fontWeight: FontWeight.w700)),
                          const SizedBox(height: 4),
                          DropdownButtonFormField<String>(
                            initialValue: _priority,
                            decoration: const InputDecoration(
                              filled: true,
                              fillColor: AppColors.surfaceSubtle,
                              border: OutlineInputBorder(borderRadius: AppRadius.borderMd),
                            ),
                            items: _priorities.map((p) => DropdownMenuItem(value: p, child: Text(p))).toList(),
                            onChanged: (v) => setState(() => _priority = v!),
                          ),
                        ],
                      ),
                    ),
                  ],
                ),

                const SizedBox(height: AppSpacing.md),

                Text('Target Audience', style: AppTypography.caption.copyWith(fontWeight: FontWeight.w700)),
                const SizedBox(height: 4),
                DropdownButtonFormField<String>(
                  initialValue: _targetAudience,
                  decoration: const InputDecoration(
                    filled: true,
                    fillColor: AppColors.surfaceSubtle,
                    border: OutlineInputBorder(borderRadius: AppRadius.borderMd),
                  ),
                  items: _audiences.map((a) => DropdownMenuItem(value: a, child: Text(a))).toList(),
                  onChanged: (v) => setState(() => _targetAudience = v!),
                ),

                const SizedBox(height: AppSpacing.md),

                Text('Notice Content / Announcement Body', style: AppTypography.caption.copyWith(fontWeight: FontWeight.w700)),
                const SizedBox(height: 4),
                TextField(
                  controller: _contentController,
                  maxLines: 4,
                  decoration: const InputDecoration(
                    hintText: 'Enter full detailed announcement text for residents...',
                    filled: true,
                    fillColor: AppColors.surfaceSubtle,
                    border: OutlineInputBorder(borderRadius: AppRadius.borderMd),
                  ),
                ),

                const SizedBox(height: AppSpacing.xl),

                Row(
                  children: [
                    Expanded(
                      child: OutlinedButton(
                        onPressed: _onSaveDraft,
                        style: OutlinedButton.styleFrom(padding: const EdgeInsets.symmetric(vertical: 14)),
                        child: const Text('Save Draft'),
                      ),
                    ),
                    const SizedBox(width: AppSpacing.md),
                    Expanded(
                      child: ElevatedButton(
                        onPressed: _isValid ? () => setState(() => _step = 2) : null,
                        style: ElevatedButton.styleFrom(
                          backgroundColor: AppColors.primaryDarkNavy,
                          padding: const EdgeInsets.symmetric(vertical: 14),
                        ),
                        child: const Text('Next: Preview'),
                      ),
                    ),
                  ],
                ),
              ] else ...[
                // Step 2 Preview
                Container(
                  padding: const EdgeInsets.all(AppSpacing.lg),
                  decoration: BoxDecoration(
                    color: AppColors.surfaceSubtle,
                    borderRadius: AppRadius.borderLg,
                    border: Border.all(color: AppColors.borderSubtle),
                  ),
                  child: Column(
                    crossAxisAlignment: CrossAxisAlignment.start,
                    children: [
                      Row(
                        mainAxisAlignment: MainAxisAlignment.spaceBetween,
                        children: [
                          Container(
                            padding: const EdgeInsets.symmetric(horizontal: 8, vertical: 3),
                            decoration: BoxDecoration(
                              color: _priority == 'Urgent' ? AppColors.crimsonDangerBg : AppColors.skyBlueInfoBg,
                              borderRadius: AppRadius.borderSm,
                            ),
                            child: Text(
                              _priority.toUpperCase(),
                              style: AppTypography.caption.copyWith(
                                color: _priority == 'Urgent' ? AppColors.crimsonDanger : AppColors.brandBlue,
                                fontWeight: FontWeight.w800,
                              ),
                            ),
                          ),
                          Text('Target: $_targetAudience', style: AppTypography.caption.copyWith(color: AppColors.textMuted)),
                        ],
                      ),
                      const SizedBox(height: AppSpacing.md),
                      Text(_titleController.text.trim(), style: AppTypography.titleLarge),
                      const SizedBox(height: 4),
                      Text('By ${SecretaryRepository.secretaryName} • ${SecretaryRepository.secretaryRole}', style: AppTypography.caption.copyWith(color: AppColors.textMuted)),
                      const SizedBox(height: AppSpacing.md),
                      const Divider(height: 1, color: AppColors.borderSubtle),
                      const SizedBox(height: AppSpacing.md),
                      Text(_contentController.text.trim(), style: AppTypography.bodyMedium),
                    ],
                  ),
                ),

                const SizedBox(height: AppSpacing.xl),

                Row(
                  children: [
                    Expanded(
                      child: TextButton(
                        onPressed: () => setState(() => _step = 1),
                        child: const Text('Back to Edit'),
                      ),
                    ),
                    const SizedBox(width: AppSpacing.md),
                    Expanded(
                      child: ElevatedButton.icon(
                        onPressed: _onPublish,
                        icon: const Icon(Icons.send_rounded, size: 18),
                        label: const Text('Publish Broadcast'),
                        style: ElevatedButton.styleFrom(
                          backgroundColor: AppColors.emeraldSuccess,
                          padding: const EdgeInsets.symmetric(vertical: 14),
                        ),
                      ),
                    ),
                  ],
                ),
              ],
            ],
          ),
        ),
      ),
    );
  }
}
