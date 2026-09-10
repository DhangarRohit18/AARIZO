import 'package:flutter/material.dart';
import 'package:flutter/services.dart';
import '../../../../core/models/models.dart';
import '../../../../core/repositories/repositories.dart';
import '../../../../core/theme/app_colors.dart';
import '../../../../core/theme/app_tokens.dart';
import '../../../../core/theme/app_typography.dart';
import 'announcement_detail_modal.dart';

class CommunityTab extends StatefulWidget {
  const CommunityTab({super.key});

  @override
  State<CommunityTab> createState() => _CommunityTabState();
}

class _CommunityTabState extends State<CommunityTab> {
  List<NoticeItemModel> _notices = [];
  List<EventModel> _events = [];
  List<PollModel> _polls = [];
  String _activeFilter = 'All Feed';

  @override
  void initState() {
    super.initState();
    _refreshCommunityData();
  }

  void _refreshCommunityData() {
    setState(() {
      _notices = NoticeRepository.getNotices();
      _events = EventRepository.getEvents();
      _polls = PollRepository.getPolls();
    });
  }

  Color _getPriorityColor(String priority) {
    switch (priority.toLowerCase()) {
      case 'urgent':
        return AppColors.crimsonDanger;
      case 'important':
        return AppColors.amberWarning;
      default:
        return AppColors.brandBlue;
    }
  }

  void _handleRSVPChange(String eventId, String newStatus) {
    HapticFeedback.selectionClick();
    EventRepository.updateRSVP(eventId, newStatus);
    _refreshCommunityData();
    ScaffoldMessenger.of(context).showSnackBar(
      SnackBar(
        content: Text('RSVP status updated to ${newStatus.toUpperCase()}'),
        backgroundColor: AppColors.brandBlue,
        behavior: SnackBarBehavior.floating,
        duration: const Duration(seconds: 2),
      ),
    );
  }

  void _handlePollVote(String pollId, String optionId) {
    HapticFeedback.mediumImpact();
    PollRepository.submitVote(pollId, optionId);
    _refreshCommunityData();
    ScaffoldMessenger.of(context).showSnackBar(
      const SnackBar(
        content: Text('Vote recorded successfully! Thank you for participating.'),
        backgroundColor: AppColors.emeraldSuccess,
        behavior: SnackBarBehavior.floating,
        duration: Duration(seconds: 2),
      ),
    );
  }

  @override
  Widget build(BuildContext context) {
    return SingleChildScrollView(
      padding: const EdgeInsets.all(AppSpacing.lg),
      child: Column(
        crossAxisAlignment: CrossAxisAlignment.start,
        children: [
          // Header Row
          Column(
            crossAxisAlignment: CrossAxisAlignment.start,
            children: [
              Text('Community & Society Hub', style: AppTypography.displayHeading.copyWith(fontSize: 20)),
              Text('Tower B · Flat 1204 • Green Valley Society', style: AppTypography.caption),
            ],
          ),

          const SizedBox(height: AppSpacing.lg),

          // Filter Chips
          SingleChildScrollView(
            scrollDirection: Axis.horizontal,
            child: Row(
              children: ['All Feed', 'Notices', 'Events', 'Polls'].map((filter) {
                final isSelected = _activeFilter == filter;
                return Padding(
                  padding: const EdgeInsets.only(right: AppSpacing.sm),
                  child: ChoiceChip(
                    label: Text(filter),
                    selected: isSelected,
                    onSelected: (selected) {
                      if (selected) {
                        HapticFeedback.selectionClick();
                        setState(() {
                          _activeFilter = filter;
                        });
                      }
                    },
                    selectedColor: AppColors.brandBlue,
                    labelStyle: TextStyle(
                      color: isSelected ? Colors.white : AppColors.primarySlate,
                      fontWeight: isSelected ? FontWeight.w700 : FontWeight.normal,
                    ),
                  ),
                );
              }).toList(),
            ),
          ),

          const SizedBox(height: AppSpacing.lg),

          // Section 1: Official Announcements
          if (_activeFilter == 'All Feed' || _activeFilter == 'Notices') ...[
            Row(
              children: [
                const Icon(Icons.campaign_rounded, color: AppColors.crimsonDanger, size: 20),
                const SizedBox(width: AppSpacing.xs),
                Text('Official Society Notices', style: AppTypography.titleMedium),
              ],
            ),
            const SizedBox(height: AppSpacing.sm),

            ListView.separated(
              shrinkWrap: true,
              physics: const NeverScrollableScrollPhysics(),
              itemCount: _notices.length,
              separatorBuilder: (context, index) => const SizedBox(height: AppSpacing.sm),
              itemBuilder: (context, index) {
                final notice = _notices[index];
                final priorityColor = _getPriorityColor(notice.priority);

                return Card(
                  child: InkWell(
                    onTap: () => AnnouncementDetailModal.show(context, notice),
                    borderRadius: BorderRadius.circular(AppRadius.lg),
                    child: Padding(
                      padding: const EdgeInsets.all(AppSpacing.md),
                      child: Column(
                        crossAxisAlignment: CrossAxisAlignment.start,
                        children: [
                          Row(
                            mainAxisAlignment: MainAxisAlignment.spaceBetween,
                            children: [
                              Container(
                                padding: const EdgeInsets.symmetric(horizontal: 8, vertical: 3),
                                decoration: BoxDecoration(
                                  color: priorityColor.withAlpha(20),
                                  borderRadius: BorderRadius.circular(AppRadius.sm),
                                  border: Border.all(color: priorityColor.withAlpha(60)),
                                ),
                                child: Text(
                                  '${notice.category.toUpperCase()} • ${notice.priority.toUpperCase()}',
                                  style: AppTypography.badgeText.copyWith(
                                    color: priorityColor,
                                    fontWeight: FontWeight.w800,
                                    fontSize: 10,
                                  ),
                                ),
                              ),
                              Text(notice.publishedAt, style: AppTypography.caption),
                            ],
                          ),

                          const SizedBox(height: AppSpacing.sm),

                          Text(notice.title, style: AppTypography.titleMedium.copyWith(fontSize: 15)),
                          const SizedBox(height: AppSpacing.xs),
                          Text(
                            notice.summary,
                            style: AppTypography.bodySmall,
                            maxLines: 2,
                            overflow: TextOverflow.ellipsis,
                          ),

                          const SizedBox(height: AppSpacing.sm),

                          Row(
                            mainAxisAlignment: MainAxisAlignment.spaceBetween,
                            children: [
                              Text('By ${notice.authorName} (${notice.authorRole})', style: AppTypography.caption),
                              Row(
                                children: [
                                  Text('Read Notice', style: AppTypography.caption.copyWith(color: AppColors.brandBlue, fontWeight: FontWeight.w600)),
                                  const Icon(Icons.chevron_right_rounded, size: 16, color: AppColors.brandBlue),
                                ],
                              ),
                            ],
                          ),
                        ],
                      ),
                    ),
                  ),
                );
              },
            ),
            const SizedBox(height: AppSpacing.xl),
          ],

          // Section 2: Upcoming Events with RSVP
          if (_activeFilter == 'All Feed' || _activeFilter == 'Events') ...[
            Row(
              children: [
                const Icon(Icons.event_rounded, color: AppColors.amberWarning, size: 20),
                const SizedBox(width: AppSpacing.xs),
                Text('Upcoming Society Events', style: AppTypography.titleMedium),
              ],
            ),
            const SizedBox(height: AppSpacing.sm),

            ListView.separated(
              shrinkWrap: true,
              physics: const NeverScrollableScrollPhysics(),
              itemCount: _events.length,
              separatorBuilder: (context, index) => const SizedBox(height: AppSpacing.sm),
              itemBuilder: (context, index) {
                final evt = _events[index];

                return Card(
                  child: Padding(
                    padding: const EdgeInsets.all(AppSpacing.md),
                    child: Column(
                      crossAxisAlignment: CrossAxisAlignment.start,
                      children: [
                        Row(
                          mainAxisAlignment: MainAxisAlignment.spaceBetween,
                          children: [
                            Container(
                              padding: const EdgeInsets.symmetric(horizontal: 8, vertical: 3),
                              decoration: BoxDecoration(
                                color: AppColors.amberWarning.withAlpha(20),
                                borderRadius: BorderRadius.circular(AppRadius.sm),
                              ),
                              child: Text(
                                evt.category.toUpperCase(),
                                style: AppTypography.badgeText.copyWith(color: AppColors.amberWarning, fontWeight: FontWeight.w700),
                              ),
                            ),
                            Row(
                              children: [
                                const Icon(Icons.people_rounded, size: 14, color: AppColors.secondarySlate),
                                const SizedBox(width: 4),
                                Text('${evt.attendeesCount} Going', style: AppTypography.caption.copyWith(fontWeight: FontWeight.w600)),
                              ],
                            ),
                          ],
                        ),

                        const SizedBox(height: AppSpacing.xs),

                        Text(evt.title, style: AppTypography.titleMedium.copyWith(fontSize: 15)),
                        const SizedBox(height: AppSpacing.xs),
                        Text('${evt.date} • ${evt.time}', style: AppTypography.bodySmall.copyWith(fontWeight: FontWeight.w600, color: AppColors.brandBlue)),
                        Text('Location: ${evt.location}', style: AppTypography.caption),

                        const SizedBox(height: AppSpacing.sm),

                        Text(evt.description, style: AppTypography.bodySmall, maxLines: 2, overflow: TextOverflow.ellipsis),

                        const Divider(height: AppSpacing.md),

                        Row(
                          mainAxisAlignment: MainAxisAlignment.spaceBetween,
                          children: [
                            Text('YOUR RSVP STATUS', style: AppTypography.caption.copyWith(fontSize: 9, fontWeight: FontWeight.w700)),
                            Row(
                              children: [
                                _buildRsvpChip(evt.id, 'going', 'Going', evt.userRsvp == 'going'),
                                const SizedBox(width: AppSpacing.xs),
                                _buildRsvpChip(evt.id, 'maybe', 'Maybe', evt.userRsvp == 'maybe'),
                                const SizedBox(width: AppSpacing.xs),
                                _buildRsvpChip(evt.id, 'none', 'Decline', evt.userRsvp == 'none'),
                              ],
                            ),
                          ],
                        ),
                      ],
                    ),
                  ),
                );
              },
            ),
            const SizedBox(height: AppSpacing.xl),
          ],

          // Section 3: Resident Opinion Polls
          if (_activeFilter == 'All Feed' || _activeFilter == 'Polls') ...[
            Row(
              children: [
                const Icon(Icons.poll_rounded, color: AppColors.emeraldSuccess, size: 20),
                const SizedBox(width: AppSpacing.xs),
                Text('Resident Opinion Polls', style: AppTypography.titleMedium),
              ],
            ),
            const SizedBox(height: AppSpacing.sm),

            ListView.separated(
              shrinkWrap: true,
              physics: const NeverScrollableScrollPhysics(),
              itemCount: _polls.length,
              separatorBuilder: (context, index) => const SizedBox(height: AppSpacing.sm),
              itemBuilder: (context, index) {
                final poll = _polls[index];
                final hasVoted = poll.userVotedOptionId != null;

                return Card(
                  child: Padding(
                    padding: const EdgeInsets.all(AppSpacing.md),
                    child: Column(
                      crossAxisAlignment: CrossAxisAlignment.start,
                      children: [
                        Row(
                          mainAxisAlignment: MainAxisAlignment.spaceBetween,
                          children: [
                            Container(
                              padding: const EdgeInsets.symmetric(horizontal: 8, vertical: 3),
                              decoration: BoxDecoration(
                                color: AppColors.emeraldSuccess.withAlpha(20),
                                borderRadius: BorderRadius.circular(AppRadius.sm),
                              ),
                              child: Text(
                                poll.category.toUpperCase(),
                                style: AppTypography.badgeText.copyWith(color: AppColors.emeraldSuccess, fontWeight: FontWeight.w700),
                              ),
                            ),
                            Text('Closes ${poll.closingDate}', style: AppTypography.caption),
                          ],
                        ),

                        const SizedBox(height: AppSpacing.xs),

                        Text(poll.question, style: AppTypography.titleMedium.copyWith(fontSize: 14)),
                        const SizedBox(height: AppSpacing.xs),
                        Text('${poll.totalVotes} total resident votes cast', style: AppTypography.caption),

                        const SizedBox(height: AppSpacing.md),

                        // Poll Options list with voting interaction or live percentage results
                        Column(
                          children: poll.options.map((opt) {
                            final isUserChoice = poll.userVotedOptionId == opt.id;
                            final percent = poll.totalVotes > 0 ? (opt.votesCount / poll.totalVotes) : 0.0;

                            if (hasVoted) {
                              return Padding(
                                padding: const EdgeInsets.only(bottom: AppSpacing.xs),
                                child: Column(
                                  crossAxisAlignment: CrossAxisAlignment.start,
                                  children: [
                                    Row(
                                      mainAxisAlignment: MainAxisAlignment.spaceBetween,
                                      children: [
                                        Expanded(
                                          child: Text(
                                            opt.text,
                                            style: AppTypography.bodySmall.copyWith(
                                              fontWeight: isUserChoice ? FontWeight.w700 : FontWeight.normal,
                                              color: isUserChoice ? AppColors.emeraldSuccess : AppColors.primarySlate,
                                            ),
                                          ),
                                        ),
                                        Text(
                                          '${(percent * 100).toStringAsFixed(0)}% (${opt.votesCount})',
                                          style: AppTypography.caption.copyWith(fontWeight: FontWeight.w700),
                                        ),
                                      ],
                                    ),
                                    const SizedBox(height: 4),
                                    ClipRRect(
                                      borderRadius: BorderRadius.circular(AppRadius.full),
                                      child: LinearProgressIndicator(
                                        value: percent,
                                        minHeight: 6,
                                        backgroundColor: AppColors.borderSubtle,
                                        valueColor: AlwaysStoppedAnimation<Color>(
                                          isUserChoice ? AppColors.emeraldSuccess : AppColors.brandBlue,
                                        ),
                                      ),
                                    ),
                                  ],
                                ),
                              );
                            } else {
                              return Padding(
                                padding: const EdgeInsets.only(bottom: AppSpacing.xs),
                                child: OutlinedButton(
                                  onPressed: () => _handlePollVote(poll.id, opt.id),
                                  style: OutlinedButton.styleFrom(
                                    alignment: Alignment.centerLeft,
                                    padding: const EdgeInsets.symmetric(horizontal: AppSpacing.md, vertical: 12),
                                    shape: RoundedRectangleBorder(
                                      borderRadius: BorderRadius.circular(AppRadius.md),
                                    ),
                                  ),
                                  child: Text(
                                    opt.text,
                                    style: AppTypography.bodySmall.copyWith(color: AppColors.primarySlate),
                                  ),
                                ),
                              );
                            }
                          }).toList(),
                        ),
                      ],
                    ),
                  ),
                );
              },
            ),
          ],
        ],
      ),
    );
  }

  Widget _buildRsvpChip(String eventId, String statusValue, String label, bool isSelected) {
    Color color = AppColors.brandBlue;
    if (statusValue == 'going') color = AppColors.emeraldSuccess;
    if (statusValue == 'maybe') color = AppColors.amberWarning;
    if (statusValue == 'none') color = AppColors.secondarySlate;

    return InkWell(
      onTap: () => _handleRSVPChange(eventId, statusValue),
      borderRadius: BorderRadius.circular(AppRadius.sm),
      child: AnimatedContainer(
        duration: const Duration(milliseconds: 150),
        padding: const EdgeInsets.symmetric(horizontal: 10, vertical: 5),
        decoration: BoxDecoration(
          color: isSelected ? color : AppColors.appBackground,
          borderRadius: BorderRadius.circular(AppRadius.sm),
          border: Border.all(color: isSelected ? color : AppColors.borderSubtle),
        ),
        child: Text(
          label,
          style: TextStyle(
            color: isSelected ? Colors.white : AppColors.primarySlate,
            fontSize: 11,
            fontWeight: isSelected ? FontWeight.w700 : FontWeight.w500,
          ),
        ),
      ),
    );
  }
}
