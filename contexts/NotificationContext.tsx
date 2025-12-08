import createContextHook from "@nkzw/create-context-hook";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { useEffect, useState, useCallback } from "react";
import { Platform } from "react-native";
import * as Notifications from "expo-notifications";
import { UserBehavior, NotificationSettings, ScheduledNotification } from "@/types/notification";
import { getRandomTemplate } from "@/data/notification-templates";
import { analytics } from "@/utils/analytics";

const BEHAVIOR_STORAGE_KEY = "@cryptolingo_user_behavior";
const SETTINGS_STORAGE_KEY = "@cryptolingo_notification_settings";
const SCHEDULED_STORAGE_KEY = "@cryptolingo_scheduled_notifications";

const DEFAULT_SETTINGS: NotificationSettings = {
  enabled: true,
  studyReminders: true,
  socialUpdates: true,
  marketNews: false,
  achievements: true,
  quietHoursStart: "22:00",
  quietHoursEnd: "08:00",
};

const DEFAULT_BEHAVIOR: UserBehavior = {
  optimalStudyHours: [18, 19, 20],
  averageSessionLength: 15,
  preferredDaysOfWeek: [1, 2, 3, 4, 5],
  lastActiveTime: new Date().toISOString(),
  totalSessions: 0,
  averageLessonsPerSession: 2,
  responseRate: 0,
};

Notifications.setNotificationHandler({
  handleNotification: async () => ({
    shouldShowAlert: true,
    shouldPlaySound: true,
    shouldSetBadge: true,
    shouldShowBanner: true,
    shouldShowList: true,
  }),
});

export const [NotificationContext, useNotifications] = createContextHook(() => {
  const [settings, setSettings] = useState<NotificationSettings>(DEFAULT_SETTINGS);
  const [behavior, setBehavior] = useState<UserBehavior>(DEFAULT_BEHAVIOR);
  const [scheduledNotifications, setScheduledNotifications] = useState<ScheduledNotification[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [hasPermission, setHasPermission] = useState(false);

  useEffect(() => {
    initializeNotifications();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const initializeNotifications = async () => {
    try {
      await loadSettings();
      await loadBehavior();
      await loadScheduledNotifications();
      await requestPermissions();
      
      if (Platform.OS !== 'web') {
        setupNotificationListeners();
      }
    } catch (error) {
      console.error('Failed to initialize notifications:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const requestPermissions = async () => {
    if (Platform.OS === 'web') {
      setHasPermission(true);
      return;
    }

    try {
      const { status: existingStatus } = await Notifications.getPermissionsAsync();
      let finalStatus = existingStatus;

      if (existingStatus !== 'granted') {
        const { status } = await Notifications.requestPermissionsAsync();
        finalStatus = status;
      }

      setHasPermission(finalStatus === 'granted');
      
      if (finalStatus === 'granted') {
        console.log('✅ Notification permissions granted');
      }
    } catch (error) {
      console.error('Failed to request notification permissions:', error);
    }
  };

  const setupNotificationListeners = () => {
    const receivedSubscription = Notifications.addNotificationReceivedListener((notification: Notifications.Notification) => {
      console.log('Notification received:', notification);
      const notificationType = (notification.request.content.data?.type as string) || 'unknown';
      analytics.trackNotificationReceived(notificationType, true);
    });

    const responseSubscription = Notifications.addNotificationResponseReceivedListener((response: Notifications.NotificationResponse) => {
      console.log('Notification response:', response);
      const notificationType = (response.notification.request.content.data?.type as string) || 'unknown';
      analytics.trackNotificationOpened(notificationType, 0);
      trackNotificationResponse(response.notification.request.identifier);
    });

    return () => {
      receivedSubscription.remove();
      responseSubscription.remove();
    };
  };

  const loadSettings = async () => {
    try {
      const stored = await AsyncStorage.getItem(SETTINGS_STORAGE_KEY);
      if (stored) {
        try {
          setSettings(JSON.parse(stored));
        } catch (parseError) {
          console.error('Failed to parse notification settings, resetting:', parseError);
          await AsyncStorage.removeItem(SETTINGS_STORAGE_KEY);
        }
      }
    } catch (error) {
      console.error('Failed to load notification settings:', error);
    }
  };

  const saveSettings = async (newSettings: NotificationSettings) => {
    try {
      await AsyncStorage.setItem(SETTINGS_STORAGE_KEY, JSON.stringify(newSettings));
      setSettings(newSettings);
    } catch (error) {
      console.error('Failed to save notification settings:', error);
    }
  };

  const loadBehavior = async () => {
    try {
      const stored = await AsyncStorage.getItem(BEHAVIOR_STORAGE_KEY);
      if (stored) {
        try {
          setBehavior(JSON.parse(stored));
        } catch (parseError) {
          console.error('Failed to parse user behavior, resetting:', parseError);
          await AsyncStorage.removeItem(BEHAVIOR_STORAGE_KEY);
        }
      }
    } catch (error) {
      console.error('Failed to load user behavior:', error);
    }
  };

  const loadScheduledNotifications = async () => {
    try {
      const stored = await AsyncStorage.getItem(SCHEDULED_STORAGE_KEY);
      if (stored) {
        try {
          setScheduledNotifications(JSON.parse(stored));
        } catch (parseError) {
          console.error('Failed to parse scheduled notifications, resetting:', parseError);
          await AsyncStorage.removeItem(SCHEDULED_STORAGE_KEY);
        }
      }
    } catch (error) {
      console.error('Failed to load scheduled notifications:', error);
    }
  };

  const saveScheduledNotifications = async (notifications: ScheduledNotification[]) => {
    try {
      await AsyncStorage.setItem(SCHEDULED_STORAGE_KEY, JSON.stringify(notifications));
      setScheduledNotifications(notifications);
    } catch (error) {
      console.error('Failed to save scheduled notifications:', error);
    }
  };

  const trackSessionStart = useCallback((duration: number = 15) => {
    const now = new Date();
    const currentHour = now.getHours();

    setBehavior(prevBehavior => {
      const newBehavior: UserBehavior = {
        ...prevBehavior,
        lastActiveTime: now.toISOString(),
        totalSessions: prevBehavior.totalSessions + 1,
        averageSessionLength: ((prevBehavior.averageSessionLength * prevBehavior.totalSessions) + duration) / (prevBehavior.totalSessions + 1),
        optimalStudyHours: prevBehavior.optimalStudyHours.includes(currentHour) 
          ? prevBehavior.optimalStudyHours 
          : [currentHour, ...prevBehavior.optimalStudyHours].slice(0, 3),
      };
      
      AsyncStorage.setItem(BEHAVIOR_STORAGE_KEY, JSON.stringify(newBehavior)).catch(err =>
        console.error('Failed to save user behavior:', err)
      );
      
      return newBehavior;
    });
  }, []);

  const trackNotificationResponse = useCallback((notificationId: string) => {
    setScheduledNotifications(prevNotifications => {
      const updated = prevNotifications.map(n => 
        n.id === notificationId ? { ...n, opened: true } : n
      );
      
      AsyncStorage.setItem(SCHEDULED_STORAGE_KEY, JSON.stringify(updated)).catch(err =>
        console.error('Failed to save scheduled notifications:', err)
      );
      
      const openedCount = updated.filter(n => n.opened).length;
      const sentCount = updated.filter(n => n.sent).length;
      const newResponseRate = sentCount > 0 ? openedCount / sentCount : 0;

      setBehavior(prevBehavior => {
        const newBehavior = {
          ...prevBehavior,
          responseRate: newResponseRate,
        };
        
        AsyncStorage.setItem(BEHAVIOR_STORAGE_KEY, JSON.stringify(newBehavior)).catch(err =>
          console.error('Failed to save user behavior:', err)
        );
        
        return newBehavior;
      });
      
      return updated;
    });
  }, []);

  const isQuietHours = useCallback((time: Date): boolean => {
    const hour = time.getHours();
    const minute = time.getMinutes();
    const currentTimeMinutes = hour * 60 + minute;

    const [startHour, startMinute] = settings.quietHoursStart.split(':').map(Number);
    const [endHour, endMinute] = settings.quietHoursEnd.split(':').map(Number);
    
    const startMinutes = startHour * 60 + startMinute;
    const endMinutes = endHour * 60 + endMinute;

    if (startMinutes < endMinutes) {
      return currentTimeMinutes >= startMinutes && currentTimeMinutes < endMinutes;
    } else {
      return currentTimeMinutes >= startMinutes || currentTimeMinutes < endMinutes;
    }
  }, [settings.quietHoursStart, settings.quietHoursEnd]);

  const getOptimalNotificationTime = useCallback((priority: 'primary' | 'secondary' | 'tertiary' = 'primary'): Date => {
    const now = new Date();
    
    const hourIndex = priority === 'primary' ? 0 : priority === 'secondary' ? 1 : 2;
    let optimalHour = behavior.optimalStudyHours[hourIndex] || (priority === 'primary' ? 18 : priority === 'secondary' ? 12 : 9);
    
    const notificationTime = new Date();
    notificationTime.setHours(optimalHour, 0, 0, 0);

    if (notificationTime <= now) {
      if (priority === 'primary' && behavior.optimalStudyHours[1]) {
        optimalHour = behavior.optimalStudyHours[1];
        notificationTime.setHours(optimalHour, 0, 0, 0);
        if (notificationTime <= now) {
          notificationTime.setDate(notificationTime.getDate() + 1);
          notificationTime.setHours(behavior.optimalStudyHours[0] || 18, 0, 0, 0);
        }
      } else {
        notificationTime.setDate(notificationTime.getDate() + 1);
      }
    }

    if (isQuietHours(notificationTime)) {
      const [endHour, endMinute] = settings.quietHoursEnd.split(':').map(Number);
      notificationTime.setHours(endHour, endMinute, 0, 0);
      
      if (notificationTime <= now) {
        notificationTime.setDate(notificationTime.getDate() + 1);
      }
    }

    console.log(`📅 Optimal notification time (${priority}): ${notificationTime.toLocaleString()}`);
    return notificationTime;
  }, [behavior.optimalStudyHours, isQuietHours, settings.quietHoursEnd]);

  const sendImmediateNotification = useCallback(async (
    type: string,
    data?: Record<string, any>
  ) => {
    if (!settings.enabled || !hasPermission) return;

    if (Platform.OS === 'web') {
      console.log('Immediate notification (web):', type, data);
      return;
    }

    const { title, body } = getRandomTemplate(type, data);

    try {
      await Notifications.scheduleNotificationAsync({
        content: {
          title,
          body,
          sound: true,
          priority: Notifications.AndroidNotificationPriority.HIGH,
          data: { type, ...data },
        },
        trigger: null,
      });

      console.log('✅ Immediate notification sent');
    } catch (error) {
      console.error('Failed to send immediate notification:', error);
    }
  }, [settings, hasPermission]);

  const scheduleNotification = useCallback(async (
    type: string,
    data?: Record<string, any>,
    customTime?: Date
  ) => {
    if (!settings.enabled || !hasPermission) {
      console.log('Notifications disabled or no permission');
      return;
    }

    if (Platform.OS === 'web') {
      console.log('Notifications not supported on web');
      return;
    }

    const { title, body } = getRandomTemplate(type, data);
    const scheduledTime = customTime || getOptimalNotificationTime();

    if (isQuietHours(scheduledTime) && !customTime) {
      console.log('Skipping notification during quiet hours');
      return;
    }

    try {
      const notificationId = await Notifications.scheduleNotificationAsync({
        content: {
          title,
          body,
          sound: true,
          priority: Notifications.AndroidNotificationPriority.HIGH,
          data: { type, ...data },
        },
        trigger: {
          type: Notifications.SchedulableTriggerInputTypes.DATE,
          date: scheduledTime,
        } as Notifications.DateTriggerInput,
      });

      const newNotification: ScheduledNotification = {
        id: notificationId,
        type: type as any,
        title,
        body,
        scheduledTime: scheduledTime.toISOString(),
        sent: false,
      };

      const updated = [...scheduledNotifications, newNotification];
      await saveScheduledNotifications(updated);

      console.log(`✅ Notification scheduled for ${scheduledTime.toLocaleString()}`);
      return notificationId;
    } catch (error) {
      console.error('Failed to schedule notification:', error);
    }
  }, [settings, hasPermission, scheduledNotifications, getOptimalNotificationTime, isQuietHours]);

  const hasStudiedToday = useCallback((): boolean => {
    const today = new Date().toISOString().split('T')[0];
    return behavior.lastActiveTime.split('T')[0] === today;
  }, [behavior.lastActiveTime]);

  const scheduleStreakReminder = useCallback(async (streak: number) => {
    if (!settings.studyReminders) return;

    const now = new Date();
    const hoursLeft = 23 - now.getHours();
    
    if (!hasStudiedToday() && hoursLeft <= 4) {
      const reminderTime = new Date();
      reminderTime.setMinutes(reminderTime.getMinutes() + 30);
      await scheduleNotification('STREAK_DANGER', { streak, hours: hoursLeft }, reminderTime);
    }
  }, [settings.studyReminders, scheduleNotification, hasStudiedToday]);

  const scheduleDailyChallengeNotification = useCallback(async (challengeName: string, reward: string) => {
    if (!settings.studyReminders) return;

    const tomorrow = new Date();
    tomorrow.setDate(tomorrow.getDate() + 1);
    tomorrow.setHours(9, 0, 0, 0);

    await scheduleNotification('CHALLENGE_AVAILABLE', { challenge_name: challengeName, reward }, tomorrow);
  }, [settings.studyReminders, scheduleNotification]);

  const scheduleSmartStudyReminder = useCallback(async () => {
    if (!settings.studyReminders || hasStudiedToday()) return;

    const optimalTime = getOptimalNotificationTime('primary');
    const now = new Date();
    
    if (optimalTime > now) {
      const streak = behavior.totalSessions > 0 ? Math.floor(Math.random() * 100) : 0;
      await scheduleNotification('STUDY_REMINDER', { streak }, optimalTime);
      console.log('📚 Smart study reminder scheduled');
    }
  }, [settings.studyReminders, hasStudiedToday, getOptimalNotificationTime, scheduleNotification, behavior.totalSessions]);

  const scheduleSocialCompetitiveNotification = useCallback(async (friendName: string, position: number) => {
    if (!settings.socialUpdates) return;

    const optimalTime = getOptimalNotificationTime('secondary');
    const now = new Date();
    
    if (optimalTime > now) {
      await scheduleNotification('SOCIAL_COMPETITIVE', { friend_name: friendName, position }, optimalTime);
      console.log('🏆 Social competitive notification scheduled');
    }
  }, [settings.socialUpdates, getOptimalNotificationTime, scheduleNotification]);

  const scheduleMarketNewsNotification = useCallback(async (marketMovement: number, cryptoName: string) => {
    if (!settings.marketNews) return;

    const isSignificant = Math.abs(marketMovement) >= 5;
    if (!isSignificant) return;

    const now = new Date();
    const hour = now.getHours();
    const isMarketHours = hour >= 6 && hour <= 22;

    if (isMarketHours) {
      await sendImmediateNotification('MARKET_NEWS', { crypto: cryptoName, movement: marketMovement });
      console.log('📊 Market news notification sent');
    }
  }, [settings.marketNews, sendImmediateNotification]);

  const scheduleSmartNotifications = useCallback(async (userLevel: number, streak: number, completedToday: boolean) => {
    console.log('🎯 Scheduling smart notifications...');
    console.log(`User Level: ${userLevel}, Streak: ${streak}, Completed Today: ${completedToday}`);

    const now = new Date();
    const dayOfWeek = now.getDay();
    const hour = now.getHours();
    const isWeekend = dayOfWeek === 0 || dayOfWeek === 6;

    if (!completedToday) {
      if (hour >= 19 && hour <= 22) {
        const reminderTime = new Date();
        reminderTime.setMinutes(reminderTime.getMinutes() + 15);
        await scheduleNotification('STUDY_REMINDER', { streak }, reminderTime);
        console.log('⏰ Evening study reminder scheduled');
      } else if (isWeekend && hour >= 10 && hour <= 12) {
        const reminderTime = new Date();
        reminderTime.setMinutes(reminderTime.getMinutes() + 30);
        await scheduleNotification('STUDY_REMINDER', { streak }, reminderTime);
        console.log('🏖️ Weekend study reminder scheduled');
      } else {
        await scheduleSmartStudyReminder();
      }
    }

    if (streak > 0 && !completedToday && hour >= 20) {
      await scheduleStreakReminder(streak);
    }

    if (behavior.responseRate > 0.5 && userLevel >= 3) {
      const shouldScheduleSocial = Math.random() > 0.7;
      if (shouldScheduleSocial) {
        const fakeFriend = ['Alex', 'Maria', 'João', 'Ana', 'Carlos'][Math.floor(Math.random() * 5)];
        const fakePosition = Math.floor(Math.random() * 20) + 5;
        await scheduleSocialCompetitiveNotification(fakeFriend, fakePosition);
      }
    }

    console.log('✅ Smart notifications scheduled successfully');
  }, [behavior.responseRate, scheduleSmartStudyReminder, scheduleStreakReminder, scheduleSocialCompetitiveNotification, scheduleNotification]);

  const cancelAllNotifications = useCallback(async () => {
    if (Platform.OS === 'web') return;

    try {
      await Notifications.cancelAllScheduledNotificationsAsync();
      await saveScheduledNotifications([]);
      console.log('✅ All notifications cancelled');
    } catch (error) {
      console.error('Failed to cancel notifications:', error);
    }
  }, []);



  return {
    settings,
    behavior,
    scheduledNotifications,
    isLoading,
    hasPermission,
    updateSettings: saveSettings,
    trackSessionStart,
    scheduleNotification,
    scheduleStreakReminder,
    scheduleDailyChallengeNotification,
    sendImmediateNotification,
    cancelAllNotifications,
    requestPermissions,
    scheduleSmartNotifications,
    scheduleSmartStudyReminder,
    scheduleSocialCompetitiveNotification,
    scheduleMarketNewsNotification,
    hasStudiedToday,
  };
});
