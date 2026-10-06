import React from 'react';

interface DailyXp100NotificationProps {
  isOpen: boolean;
  earnedXp: number;
  goalXp: number;
  streakDays?: number;
  onClose: () => void;
  onOpenCelebrationModal?: () => void;
}

export const DailyXp100Notification: React.FC<DailyXp100NotificationProps> = () => {
  return null;
};
