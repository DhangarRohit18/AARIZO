import React from 'react';
import { NotificationEngineHub } from '../../domains/notifications';

export const NotificationCenterPage: React.FC = () => {
  return (
    <div className="p-4 md:p-6 max-w-7xl mx-auto space-y-6">
      <NotificationEngineHub />
    </div>
  );
};

export default NotificationCenterPage;

