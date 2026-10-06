import React from 'react';

interface PermissionsOnboardingModalProps {
  isOpen: boolean;
  onClose: () => void;
  onPermissionsGranted?: () => void;
  theme?: 'light' | 'dark';
}

export const PermissionsOnboardingModal: React.FC<PermissionsOnboardingModalProps> = () => {
  return null;
};
