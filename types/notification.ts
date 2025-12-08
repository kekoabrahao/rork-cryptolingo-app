export type NotificationType = 
  | 'STUDY_REMINDER'
  | 'SOCIAL_COMPETITIVE'
  | 'MARKET_NEWS'
  | 'REWARDS'
  | 'STREAK_DANGER'
  | 'CHALLENGE_AVAILABLE'
  | 'ACHIEVEMENT_UNLOCKED';

export type NotificationPriority = 'high' | 'medium' | 'low';
export type NotificationTiming = 'immediate' | 'user_optimal_time' | 'evening' | 'market_hours';

export interface NotificationTemplate {
  type: NotificationType;
  templates: string[];
  timing: NotificationTiming;
  priority: NotificationPriority;
}

export interface UserBehavior {
  optimalStudyHours: number[];
  averageSessionLength: number;
  preferredDaysOfWeek: number[];
  lastActiveTime: string;
  totalSessions: number;
  averageLessonsPerSession: number;
  responseRate: number;
}

export interface ScheduledNotification {
  id: string;
  type: NotificationType;
  title: string;
  body: string;
  scheduledTime: string;
  sent: boolean;
  opened?: boolean;
}

export interface NotificationSettings {
  enabled: boolean;
  studyReminders: boolean;
  socialUpdates: boolean;
  marketNews: boolean;
  achievements: boolean;
  quietHoursStart: string;
  quietHoursEnd: string;
}
