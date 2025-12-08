# 🔔 Smart Notification System - CryptoLingo

A behavior-learning notification system that personalizes message timing and content based on user activity patterns.

## Features

### 📊 User Behavior Tracking
- **Optimal Study Hours**: Learns when users typically study using weighted activity analysis
- **Session History**: Tracks last 30 sessions with start time and duration
- **Smart Time Calculation**: Analyzes hourly activity patterns to find top 3 optimal hours
- **Session Analytics**: Tracks total sessions, average duration, and patterns
- **Response Rate**: Monitors notification engagement to optimize delivery
- **Adaptive Timing**: Schedules notifications during user's preferred times with fallback options

### 🔔 Notification Types

1. **Study Reminders** (`STUDY_REMINDER`)
   - Daily learning reminders
   - Streak protection alerts
   - Personalized based on activity patterns

2. **Social Competitive** (`SOCIAL_COMPETITIVE`)
   - Ranking updates
   - Friend activity notifications
   - Challenge comparisons

3. **Market News** (`MARKET_NEWS`)
   - Crypto market updates
   - Price movement alerts
   - Educational content ties

4. **Rewards & Achievements** (`REWARDS`, `ACHIEVEMENT_UNLOCKED`)
   - Level up celebrations
   - Achievement unlocks
   - Bonus rewards availability

5. **Streak Danger** (`STREAK_DANGER`)
   - Streak at-risk warnings
   - Time-sensitive reminders

6. **Daily Challenges** (`CHALLENGE_AVAILABLE`)
   - New challenge notifications
   - Completion rewards

### 🧠 Smart Scheduling System

The notification system includes intelligent scheduling that adapts to user behavior:

#### Context-Aware Scheduling
- **Time of Day**: Different strategies for morning, evening, and night hours
- **Day of Week**: Weekend vs weekday scheduling patterns
- **User Level**: Advanced users get more competitive notifications
- **Response Rate**: High-engagement users receive optimized notification frequency
- **Study Completion**: Checks if user has studied today before scheduling reminders

#### Smart Notification Logic (`scheduleSmartNotifications`)
Automatically schedules the right notifications at the right time:

```typescript
// Evening reminder (7-10 PM) - if user hasn't studied
if (hour >= 19 && hour <= 22 && !completedToday) {
  scheduleNotification('STUDY_REMINDER', { streak }, +15 minutes);
}

// Weekend morning reminder (10 AM-12 PM)
if (isWeekend && hour >= 10 && hour <= 12 && !completedToday) {
  scheduleNotification('STUDY_REMINDER', { streak }, +30 minutes);
}

// Streak danger alert (after 8 PM)
if (streak > 0 && !completedToday && hour >= 20) {
  scheduleStreakReminder(streak);
}

// Social competitive (high-engagement users)
if (behavior.responseRate > 0.5 && userLevel >= 3) {
  scheduleSocialCompetitiveNotification(friendName, position);
}
```

#### Market-Based Notifications
- **Crypto Price Movements**: Alerts on 5%+ changes
- **Market Hours Only**: 6 AM - 10 PM local time
- **Immediate Delivery**: Real-time for significant events
- **Educational Tie-In**: Links market events to relevant lessons

#### Automatic Scheduling Triggers
1. **App Launch**: Schedules daily notifications based on completion status
2. **Lesson Completion**: Tracks session and updates behavior patterns
3. **Hourly Check**: Background timer checks for notification opportunities
4. **Achievement Unlocked**: Immediate celebration notifications

### ⚙️ Smart Features

#### Quiet Hours
- Configurable silent period (default: 22:00 - 08:00)
- No notifications during quiet hours
- Auto-reschedule to preferred times

#### Optimal Timing Algorithm
- **Activity Analysis**: Analyzes session history to calculate weighted hourly activity
- **Multi-Level Priorities**: Primary, secondary, and tertiary optimal times
- **Smart Fallback**: If primary time has passed, tries secondary or reschedules for next day
- **Quiet Hours Integration**: Automatically adjusts schedule to respect quiet hours
- **Real-Time Adaptation**: Updates optimal hours as user behavior changes

#### Permission Management
- Graceful permission handling
- Clear UI for enabling notifications
- Works on mobile (iOS/Android)
- Web-friendly fallbacks

## Usage

### Basic Setup

The notification system is already integrated into the app via `NotificationContext` in `app/_layout.tsx`.

### In Components

```typescript
import { useNotifications } from '@/contexts/NotificationContext';

function MyComponent() {
  const { 
    settings, 
    trackSessionStart, 
    scheduleNotification,
    sendImmediateNotification,
    scheduleStreakReminder,
    scheduleSmartNotifications,
    scheduleMarketNewsNotification
  } = useNotifications();

  // Track when user starts a session
  useEffect(() => {
    trackSessionStart(15); // 15 minutes duration
  }, []);

  // Send immediate notification
  await sendImmediateNotification('ACHIEVEMENT_UNLOCKED', {
    achievement: 'Level 10',
    xp: 100
  });

  // Schedule future notification
  const tomorrow = new Date();
  tomorrow.setDate(tomorrow.getDate() + 1);
  tomorrow.setHours(18, 0, 0, 0);
  
  await scheduleNotification('STUDY_REMINDER', { streak: 7 }, tomorrow);

  // Schedule streak reminder
  await scheduleStreakReminder(progress.streak);

  // Schedule smart notifications (recommended)
  await scheduleSmartNotifications(
    progress.level,
    progress.streak,
    hasStudiedToday()
  );

  // Market news notification
  await scheduleMarketNewsNotification(
    15.5, // 15.5% price movement
    'Bitcoin'
  );
}
```

### Testing Notifications

The Settings tab includes testing tools:

1. **Send Test Notification**: Immediately sends a test notification
2. **Schedule Smart Notifications**: Manually triggers smart scheduling
3. **Cancel All**: Removes all scheduled notifications

```typescript
// In Settings screen
const handleTestNotification = async () => {
  await sendImmediateNotification('REWARDS', { 
    achievement: 'Test Achievement',
    level: progress.level,
    xp: 100 
  });
};

const handleScheduleSmartNotifications = async () => {
  const completedToday = hasStudiedToday();
  await scheduleSmartNotifications(
    progress.level, 
    progress.streak, 
    completedToday
  );
};
```

### Settings Management

Users can customize notifications in the Settings tab:

- **Enable/Disable** all notifications
- **Toggle notification types**:
  - Study Reminders
  - Social Updates
  - Market News
  - Achievements
- **View Behavior Insights**:
  - Optimal study hours
  - Total sessions
  - Response rate
  - Average session length

## Notification Templates

Templates support dynamic placeholders:

```typescript
{
  type: 'STREAK_DANGER',
  templates: [
    '🔥 Sua streak de {streak} dias está em risco!',
    '⚠️ Não perca sua sequência! Apenas 5 minutos hoje!',
    '😱 Faltam {hours} horas para perder sua streak!',
  ]
}
```

Usage:
```typescript
scheduleNotification('STREAK_DANGER', { 
  streak: 7, 
  hours: 4 
});
```

## Integration Points

### Lesson Completion
When a lesson is completed, the system:
1. Tracks the session time
2. Sends achievement notifications if applicable
3. Schedules streak reminders for tomorrow
4. Updates user behavior patterns

### Daily Login
On app open:
1. Loads user behavior data
2. Updates optimal study times
3. Checks for pending notifications
4. Requests permissions if needed

## Platform Support

### Mobile (iOS/Android)
- ✅ Full push notification support
- ✅ Scheduled notifications
- ✅ Immediate notifications
- ✅ Notification handlers
- ✅ Permission management

### Web
- ⚠️ Limited support (no push notifications)
- ✅ Settings UI available
- ✅ Behavior tracking works
- ✅ Console logging for debugging

## Data Storage

### AsyncStorage Keys
- `@cryptolingo_user_behavior` - User activity patterns
- `@cryptolingo_notification_settings` - Notification preferences
- `@cryptolingo_scheduled_notifications` - Pending notifications

### Behavior Data Structure
```typescript
{
  optimalStudyHours: [18, 19, 20],    // Top 3 study hours (calculated)
  averageSessionLength: 15,           // Minutes (calculated from history)
  preferredDaysOfWeek: [1, 2, 3, 4, 5], // Mon-Fri
  lastActiveTime: "2025-01-15T18:00:00Z",
  totalSessions: 42,
  averageLessonsPerSession: 2.5,
  responseRate: 0.75                  // 75% click-through
}

// Session History (stored separately, last 30 sessions)
[
  {
    startTime: "2025-01-15T18:00:00Z",
    duration: 12  // minutes
  },
  {
    startTime: "2025-01-15T19:30:00Z",
    duration: 15  // minutes
  }
]
```

## Customization

### Adding New Templates

Edit `data/notification-templates.ts`:

```typescript
export const notificationTemplates: NotificationTemplate[] = [
  // ... existing templates
  {
    type: 'NEW_TYPE',
    templates: [
      'Your message with {placeholder}',
      'Another variant'
    ],
    timing: 'user_optimal_time',
    priority: 'medium'
  }
];
```

### Custom Timing Logic

The system uses a sophisticated algorithm to calculate optimal notification times:

```typescript
// Calculate optimal times based on session history
const calculateOptimalNotificationTimes = (history) => {
  if (history.length === 0) {
    return { primary: 19, secondary: 12, tertiary: 9 };
  }

  // Build hourly activity map weighted by session duration
  const hourlyActivity = history.reduce((acc, session) => {
    const hour = new Date(session.startTime).getHours();
    acc[hour] = (acc[hour] || 0) + session.duration;
    return acc;
  }, {});

  // Get top 3 hours sorted by total activity time
  const optimalHours = Object.entries(hourlyActivity)
    .sort(([, a], [, b]) => b - a)
    .slice(0, 3)
    .map(([hour]) => parseInt(hour));

  return {
    primary: optimalHours[0] || 19,
    secondary: optimalHours[1] || 12,
    tertiary: optimalHours[2] || 9,
  };
};

// Get notification time with priority levels
const getOptimalNotificationTime = (priority = 'primary') => {
  const now = new Date();
  const hourIndex = priority === 'primary' ? 0 : priority === 'secondary' ? 1 : 2;
  let optimalHour = behavior.optimalStudyHours[hourIndex];
  
  const notificationTime = new Date();
  notificationTime.setHours(optimalHour, 0, 0, 0);

  // If time has passed, try next priority or next day
  if (notificationTime <= now) {
    if (priority === 'primary' && behavior.optimalStudyHours[1]) {
      optimalHour = behavior.optimalStudyHours[1];
      notificationTime.setHours(optimalHour, 0, 0, 0);
      if (notificationTime <= now) {
        // Schedule for tomorrow's primary time
        notificationTime.setDate(notificationTime.getDate() + 1);
        notificationTime.setHours(behavior.optimalStudyHours[0], 0, 0, 0);
      }
    } else {
      notificationTime.setDate(notificationTime.getDate() + 1);
    }
  }

  // Adjust for quiet hours
  if (isQuietHours(notificationTime)) {
    const [endHour, endMinute] = settings.quietHoursEnd.split(':').map(Number);
    notificationTime.setHours(endHour, endMinute, 0, 0);
    if (notificationTime <= now) {
      notificationTime.setDate(notificationTime.getDate() + 1);
    }
  }

  return notificationTime;
};
```

## Best Practices

### Don't Over-Notify
- Respect quiet hours
- Limit notifications per day
- Check user preferences before sending

### Personalize Content
- Use user's name when available
- Reference their specific progress
- Include relevant data (streak, level, etc.)

### Test Thoroughly
```typescript
// Development testing
if (__DEV__) {
  // Schedule test notification 10 seconds from now
  const testTime = new Date();
  testTime.setSeconds(testTime.getSeconds() + 10);
  
  scheduleNotification('STUDY_REMINDER', {}, testTime);
}
```

### Handle Errors Gracefully
The system includes comprehensive error handling:
- Permission denied → Show settings prompt
- Scheduling fails → Log and continue
- Web platform → Graceful fallback

## Smart Algorithm Details

### How It Works

1. **Session Tracking**:
   - When user starts a lesson, session begins tracking
   - On lesson completion, duration is calculated and recorded
   - Last 30 sessions are kept in history

2. **Optimal Time Calculation**:
   - Each session contributes its duration to the hour it started
   - Hours are ranked by total activity time (not just frequency)
   - Example: 3 sessions at 7 PM for 15 min each = 45 min total activity
   - Top 3 hours become primary, secondary, and tertiary times

3. **Smart Scheduling**:
   - Notifications use primary time by default
   - If primary has passed, tries secondary same day
   - If both passed, schedules for next day's primary time
   - Always respects quiet hours configuration

4. **Continuous Learning**:
   - Optimal hours update after each session
   - Adapts to changing user patterns over time
   - Handles timezone changes automatically

### Example Scenario

```
User's Session History (last 10 sessions):
- 7:00 PM: 12 min
- 7:00 PM: 15 min  
- 7:00 PM: 10 min
- 12:00 PM: 8 min
- 12:00 PM: 10 min
- 9:00 AM: 5 min
- 9:00 AM: 7 min
- 7:00 PM: 18 min
- 12:00 PM: 12 min

Hourly Activity:
- 19 (7 PM): 55 minutes ← Primary
- 12 (12 PM): 30 minutes ← Secondary  
- 9 (9 AM): 12 minutes ← Tertiary

Result: Notifications sent at 7 PM primarily
```

## API Reference

### Core Functions

#### `scheduleSmartNotifications(userLevel, streak, completedToday)`
Intelligently schedules notifications based on user context.

**Parameters:**
- `userLevel` (number): User's current level
- `streak` (number): Current streak count
- `completedToday` (boolean): Whether user studied today

**Returns:** Promise<void>

**Example:**
```typescript
await scheduleSmartNotifications(5, 7, false);
// Schedules appropriate notifications for level 5 user with 7-day streak who hasn't studied today
```

#### `scheduleMarketNewsNotification(marketMovement, cryptoName)`
Sends market news if movement is significant (≥5%).

**Parameters:**
- `marketMovement` (number): Percentage change
- `cryptoName` (string): Name of cryptocurrency

**Returns:** Promise<void>

**Example:**
```typescript
await scheduleMarketNewsNotification(15.5, 'Bitcoin');
// Sends immediate notification about 15.5% Bitcoin movement
```

#### `trackSessionStart(duration?)`
Tracks user session for behavior learning.

**Parameters:**
- `duration` (number, optional): Session duration in minutes (default: 15)

**Returns:** void

**Example:**
```typescript
trackSessionStart(20);
// Records a 20-minute session at current time
```

#### `hasStudiedToday()`
Checks if user has been active today.

**Returns:** boolean

**Example:**
```typescript
const studiedToday = hasStudiedToday();
if (!studiedToday) {
  scheduleSmartStudyReminder();
}
```

## Future Enhancements

- [x] Smart optimal time calculation with session history
- [x] Multi-priority scheduling system
- [x] Context-aware smart scheduling
- [x] Market-based notifications
- [x] Automatic scheduling on app events
- [ ] A/B testing different message templates
- [ ] Machine learning for send time prediction
- [ ] Rich notifications with images
- [ ] Notification grouping
- [ ] In-app notification center
- [ ] Push notification analytics dashboard
- [ ] Deep linking from notifications
- [ ] Day-of-week preference tracking

## Troubleshooting

### Notifications Not Showing

1. **Check Permissions**
   ```typescript
   const { hasPermission, requestPermissions } = useNotifications();
   if (!hasPermission) {
     await requestPermissions();
   }
   ```

2. **Check Settings**
   - Open Settings tab
   - Ensure notifications are enabled
   - Check specific notification types

3. **Platform Issues**
   - Web: Notifications don't work (expected)
   - iOS: Check device settings
   - Android: Check notification channels

### Debugging

Enable console logs:
```typescript
console.log('Notification settings:', settings);
console.log('User behavior:', behavior);
console.log('Scheduled notifications:', scheduledNotifications);
```

## License

Part of the CryptoLingo project.
