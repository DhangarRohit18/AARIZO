// Domain state helpers & utilities for Resident Community

import type {
  AnnouncementCategory,
  AnnouncementPriority,
  EventRSVPStatus,
} from './types';

export const getCategoryLabel = (category: AnnouncementCategory): string => {
  switch (category) {
    case 'maintenance':
      return 'Maintenance Notice';
    case 'security':
      return 'Security Advisory';
    case 'event':
      return 'Society Event';
    case 'general':
      return 'General Update';
    case 'utility':
      return 'Utility / Water';
    case 'rwa':
      return 'RWA Official';
    default:
      return category;
  }
};

export const getPriorityLabel = (priority: AnnouncementPriority): string => {
  switch (priority) {
    case 'urgent':
      return 'Urgent Action';
    case 'important':
      return 'Important';
    case 'normal':
      return 'Standard';
    default:
      return priority;
  }
};

export const getPriorityBadgeVariant = (
  priority: AnnouncementPriority
): 'danger' | 'warning' | 'info' => {
  switch (priority) {
    case 'urgent':
      return 'danger';
    case 'important':
      return 'warning';
    case 'normal':
      return 'info';
    default:
      return 'info';
  }
};

export const getCategoryBadgeVariant = (
  category: AnnouncementCategory
): 'primary' | 'info' | 'warning' | 'success' | 'danger' => {
  switch (category) {
    case 'maintenance':
      return 'warning';
    case 'security':
      return 'danger';
    case 'event':
      return 'success';
    case 'utility':
      return 'info';
    case 'rwa':
      return 'primary';
    default:
      return 'info';
  }
};

export const getRsvpLabel = (rsvp: EventRSVPStatus): string => {
  switch (rsvp) {
    case 'going':
      return 'Attending';
    case 'maybe':
      return 'Interested';
    case 'not_going':
      return 'Declined';
    case 'none':
      return 'RSVP Now';
    default:
      return 'RSVP Now';
  }
};
