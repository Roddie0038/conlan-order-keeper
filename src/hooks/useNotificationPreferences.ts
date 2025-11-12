import { useState, useEffect } from 'react';

export interface NotificationPreferences {
  enableSound: boolean;
  soundVolume: number; // 0-1
  displayDuration: number; // milliseconds
  enableDesktop: boolean;
  enabledTypes: {
    orderUpdates: boolean;
    orderMessages: boolean;
    systemAlerts: boolean;
  };
}

const DEFAULT_PREFERENCES: NotificationPreferences = {
  enableSound: true,
  soundVolume: 0.3,
  displayDuration: 5000,
  enableDesktop: true,
  enabledTypes: {
    orderUpdates: true,
    orderMessages: true,
    systemAlerts: true,
  },
};

const STORAGE_KEY = 'notification_preferences';

export function useNotificationPreferences() {
  const [preferences, setPreferences] = useState<NotificationPreferences>(() => {
    try {
      const stored = localStorage.getItem(STORAGE_KEY);
      if (stored) {
        return { ...DEFAULT_PREFERENCES, ...JSON.parse(stored) };
      }
    } catch (error) {
      console.warn('Failed to load notification preferences:', error);
    }
    return DEFAULT_PREFERENCES;
  });

  useEffect(() => {
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(preferences));
    } catch (error) {
      console.warn('Failed to save notification preferences:', error);
    }
  }, [preferences]);

  const updatePreferences = (updates: Partial<NotificationPreferences>) => {
    setPreferences((prev) => ({ ...prev, ...updates }));
  };

  const updateEnabledTypes = (type: keyof NotificationPreferences['enabledTypes'], enabled: boolean) => {
    setPreferences((prev) => ({
      ...prev,
      enabledTypes: {
        ...prev.enabledTypes,
        [type]: enabled,
      },
    }));
  };

  const resetToDefaults = () => {
    setPreferences(DEFAULT_PREFERENCES);
  };

  return {
    preferences,
    updatePreferences,
    updateEnabledTypes,
    resetToDefaults,
  };
}
