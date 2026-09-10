// Resident Community Domain Types for CommunityOS

export type AnnouncementCategory =
  | 'maintenance'
  | 'security'
  | 'event'
  | 'general'
  | 'utility'
  | 'rwa';

export type AnnouncementPriority = 'normal' | 'important' | 'urgent';

export interface CommunityAnnouncement {
  id: string;
  title: string;
  category: AnnouncementCategory;
  priority: AnnouncementPriority;
  publishedDate: string;
  authorName: string;
  authorRole: string;
  summary: string;
  content: string;
  isRead: boolean;
  effectiveDate?: string;
  locationArea?: string;
  actionLabel?: string;
  actionRoute?: string;
}

export type EventRSVPStatus = 'going' | 'maybe' | 'not_going' | 'none';

export interface CommunityEvent {
  id: string;
  title: string;
  category: AnnouncementCategory;
  date: string;
  time: string;
  location: string;
  organizer: string;
  description: string;
  attendeesCount: number;
  userRsvp: EventRSVPStatus;
  maxCapacity?: number;
  contactPerson?: string;
}

export interface PollOption {
  id: string;
  text: string;
  votesCount: number;
}

export interface Poll {
  id: string;
  question: string;
  category: AnnouncementCategory;
  createdDate: string;
  closingDate: string;
  totalVotes: number;
  options: PollOption[];
  userVotedOptionId?: string;
  isClosed?: boolean;
}
