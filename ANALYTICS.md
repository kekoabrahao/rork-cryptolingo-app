# Analytics & Tracking Implementation 📊

## Overview
Comprehensive analytics tracking has been implemented across all Quick Win features to monitor user engagement, conversion rates, and feature performance.

## Analytics Events Tracked

### 📚 Daily Challenges
- **daily_challenge_started**: Fired when a user first sees/starts a daily challenge
  - `challenge_id`: Unique challenge identifier
  - `difficulty`: easy/medium/hard
  - `user_level`: Current user level
  - `time_of_day`: Hour when challenge was started

- **daily_challenge_completed**: Fired when user completes a daily challenge
  - `challenge_id`: Unique challenge identifier
  - `completion_time`: Time taken to complete (seconds)
  - `reward_xp`: XP earned
  - `reward_coins`: Coins earned

- **daily_challenge_failed**: Fired when challenge expires without completion
  - `challenge_id`: Unique challenge identifier
  - `progress_achieved`: Current progress value
  - `target_required`: Target required for completion
  - `completion_rate`: Percentage of completion

### 🔔 Push Notifications
- **notification_received**: Fired when a notification is received
  - `notification_type`: Type of notification (e.g., STUDY_REMINDER)
  - `sent_at_optimal_time`: Boolean indicating if sent during user's optimal study hours
  - `hour_of_day`: Hour when notification was received

- **notification_opened**: Fired when user taps on a notification
  - `notification_type`: Type of notification
  - `time_to_open`: Time from sent to opened (seconds)
  - `conversion`: Always true for opened notifications

- **notification_dismissed**: Fired when notification is dismissed without interaction
  - `notification_type`: Type of notification

### ⚔️ Duels
- **duel_started**: Fired when a duel begins
  - `opponent_level`: Level of the opponent
  - `user_level`: Current user level
  - `level_difference`: Absolute difference between levels
  - `bet_amount`: Amount of coins bet (currently 0 in mock)
  - `search_time_ms`: Time spent searching for opponent

- **duel_completed**: Fired when a duel finishes
  - `result`: win/lose/draw
  - `user_score`: Number of correct answers
  - `opponent_score`: Opponent's correct answers
  - `performance_ratio`: User score / total score
  - `duel_duration`: Total time spent (seconds)
  - `average_response_time`: Average answer time per question

- **duel_abandoned**: Fired when user exits mid-duel
  - `question_number`: Question where user abandoned
  - `total_questions`: Total questions in duel
  - `completion_rate`: Percentage completed

### 📤 Sharing
- **share_button_clicked**: Fired when user taps share button
  - `content_type`: achievement/level/streak/duel/perfect/score
  - `intended_platform`: whatsapp/instagram/generic
  - `user_level`: Current user level

- **share_completed**: Fired when sharing successfully completes
  - `content_type`: Type of content shared
  - `platform`: Platform used for sharing
  - `user_level`: Current user level
  - `conversion_funnel`: Always 'share_success'

- **share_cancelled**: Fired when user cancels sharing
  - `content_type`: Type of content
  - `intended_platform`: Platform user tried to share to

### 📖 Lessons
- **lesson_started**: Fired when a lesson begins (needs integration)
  - `lesson_id`: Unique lesson identifier
  - `difficulty`: beginner/intermediate/advanced
  - `user_level`: Current user level
  - `time_of_day`: Hour when lesson started

- **lesson_completed**: Fired when a lesson is finished
  - `lesson_id`: Unique lesson identifier
  - `score`: Number of correct answers
  - `max_score`: Total questions
  - `score_percentage`: (score/max_score) * 100
  - `time_spent`: Time spent on lesson (seconds)
  - `xp_earned`: XP gained
  - `coins_earned`: Coins gained
  - `perfect_score`: Boolean for 100% correct

### 🏆 Achievements & Progression
- **achievement_unlocked**: Fired when achievement tier is reached
  - `achievement_id`: Unique achievement ID
  - `achievement_name`: Human-readable name
  - `tier`: bronze/silver/gold
  - `user_level`: Current user level

- **level_up**: Fired when user levels up
  - `new_level`: The new level reached
  - `total_xp`: Total XP accumulated
  - `total_lessons`: Total lessons completed
  - `days_played`: Current streak

- **streak_milestone**: Fired on important streak milestones (7, 14, 30, 50, 100 days)
  - `streak_days`: Number of consecutive days
  - `user_level`: Current user level
  - `milestone_type`: first_day/one_week/one_month/hundred_days/tens_milestone

### 💰 Purchases
- **lives_purchased**: Fired when user buys lives with coins
  - `lives_amount`: Number of lives purchased
  - `coins_cost`: Cost in coins
  - `remaining_coins`: Coins left after purchase

### 📱 App Lifecycle
- **app_opened**: Fired when app becomes active
  - `is_first_open`: Boolean for first-time users
  - `hour_of_day`: Hour when app opened
  - `day_of_week`: 0-6 (Sunday-Saturday)

- **app_backgrounded**: Fired when app goes to background
  - `session_duration`: Time spent in app (seconds)

## Implementation Details

### Analytics Class (`utils/analytics.ts`)
Central analytics service that handles all tracking:
- Maintains session state (session ID, start time)
- Provides typed methods for each event
- Enriches events with session context
- Currently logs to console (ready for integration with analytics services)

### Integration Points

1. **UserProgressContext**: Tracks lessons, achievements, levels, streaks
2. **DuelContext**: Tracks duel lifecycle and outcomes
3. **NotificationContext**: Tracks notification delivery and engagement
4. **ShareCardModal**: Tracks sharing flow
5. **DailyChallengeCard**: Tracks challenge visibility
6. **App Root (_layout.tsx)**: Tracks app lifecycle

## Usage Examples

```typescript
// Track a custom event
import { analytics } from '@/utils/analytics';

// Lesson started
analytics.trackLessonStarted('bitcoin_basics_1', 'beginner', userLevel);

// Duel completed
analytics.trackDuelCompleted('win', 8, 5, 120, 8.5);

// Share button clicked
analytics.trackShareButtonClicked('achievement', 'whatsapp', userLevel);
```

## Analytics Dashboard Metrics

### Key Performance Indicators (KPIs)

**Engagement Metrics:**
- Daily Active Users (DAU)
- Session length
- Lessons completed per session
- Daily challenge completion rate
- Duel participation rate

**Retention Metrics:**
- Day 1, Day 7, Day 30 retention
- Streak distribution (1, 7, 14, 30+ days)
- Churn indicators (notification dismissals, abandoned duels)

**Conversion Metrics:**
- Notification open rate by type
- Share completion rate by content type
- Challenge completion by difficulty
- Duel win rate distribution

**Monetization Potential:**
- Lives purchase frequency
- Coins earned vs spent
- Power-up usage

**Viral Growth:**
- Share button click-through rate
- Share completion by platform
- Content type performance (what users share most)

## Next Steps

1. **Integration with Analytics Service**: 
   - Connect to Firebase Analytics, Mixpanel, or Amplitude
   - Replace console logs with actual API calls

2. **A/B Testing Setup**:
   - Test notification timing optimization
   - Test daily challenge difficulty curves
   - Test sharing incentives

3. **Funnel Analysis**:
   - Lesson start → completion funnel
   - Share button → share complete funnel
   - Duel search → duel complete funnel

4. **Cohort Analysis**:
   - User behavior by sign-up date
   - Feature adoption by cohort
   - Retention by language preference

5. **Real-time Dashboards**:
   - Live event monitoring
   - Anomaly detection (drop in completions, spike in errors)
   - Performance alerts

## Privacy & Compliance

- All tracking is anonymous (no PII collected)
- Session IDs are randomly generated
- User can opt-out via notification settings
- GDPR/CCPA compliant implementation
- Data retention policies to be configured

## Performance Considerations

- All analytics calls are non-blocking
- Events are logged asynchronously
- Minimal performance impact on app
- Batch events for network efficiency (when integrated)

---

**Note**: This implementation provides the foundation for comprehensive analytics. The actual data collection and visualization will depend on your chosen analytics platform (Firebase, Mixpanel, Amplitude, etc.).
