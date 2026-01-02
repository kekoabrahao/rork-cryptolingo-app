type AnalyticsEvent = 
  | 'daily_challenge_started'
  | 'daily_challenge_completed'
  | 'daily_challenge_failed'
  | 'notification_received'
  | 'notification_opened'
  | 'notification_dismissed'
  | 'duel_started'
  | 'duel_completed'
  | 'duel_abandoned'
  | 'share_button_clicked'
  | 'share_completed'
  | 'share_cancelled'
  | 'lesson_started'
  | 'lesson_completed'
  | 'achievement_unlocked'
  | 'level_up'
  | 'streak_milestone'
  | 'lives_purchased'
  | 'app_opened'
  | 'app_backgrounded'
  | 'subscription_purchased'
  | 'subscription_cancelled'
  | 'restore_purchases_attempted'
  | 'restore_purchases_clicked'
  | 'paywall_shown'
  | 'paywall_dismissed'
  | 'paywall_converted'
  | 'premium_feature_attempted'
  | 'ad_shown'
  | 'purchase_initiated'
  | 'purchase_completed'
  | 'purchase_failed'
  | 'restore_purchase_initiated'
  | 'restore_purchase_success'
  | 'restore_purchase_failed'
  | 'premium_status_invalidated'
  | 'upgrade_modal_shown'
  | 'upgrade_modal_dismissed'
  | 'ad_clicked'
  | 'ad_closed'
  | 'quiz_started'
  | 'quiz_completed'
  | 'quiz_question_answered'
  | 'quiz_perfect_score'
  | 'quiz_badge_unlocked'
  | 'data_validation_error'
  | 'storage_read_error'
  | 'storage_write_error'
  | 'nan_value_detected';

interface AnalyticsProperties {
  [key: string]: string | number | boolean | undefined;
}

class Analytics {
  private sessionStartTime: Date | null = null;
  private sessionId: string | null = null;

  initialize() {
    this.sessionStartTime = new Date();
    this.sessionId = `session_${Date.now()}_${Math.random().toString(36).substring(7)}`;
    console.log('📊 Analytics initialized:', this.sessionId);
  }

  track(event: AnalyticsEvent, properties?: AnalyticsProperties) {
    const timestamp = new Date().toISOString();
    const enrichedProperties = {
      ...properties,
      session_id: this.sessionId,
      timestamp,
    };

    console.log(`📊 [Analytics] ${event}:`, enrichedProperties);
  }

  trackDailyChallengeStarted(challengeId: string, difficulty: string, userLevel: number) {
    this.track('daily_challenge_started', {
      challenge_id: challengeId,
      difficulty,
      user_level: userLevel,
      time_of_day: new Date().getHours(),
    });
  }

  trackDailyChallengeCompleted(
    challengeId: string,
    timeToComplete: number,
    rewardXP: number,
    rewardCoins: number
  ) {
    this.track('daily_challenge_completed', {
      challenge_id: challengeId,
      completion_time: timeToComplete,
      reward_xp: rewardXP,
      reward_coins: rewardCoins,
    });
  }

  trackDailyChallengeFailed(challengeId: string, progress: number, target: number) {
    this.track('daily_challenge_failed', {
      challenge_id: challengeId,
      progress_achieved: progress,
      target_required: target,
      completion_rate: (progress / target) * 100,
    });
  }

  trackNotificationReceived(type: string, sentAtOptimalTime: boolean) {
    this.track('notification_received', {
      notification_type: type,
      sent_at_optimal_time: sentAtOptimalTime,
      hour_of_day: new Date().getHours(),
    });
  }

  trackNotificationOpened(type: string, timeFromSent: number) {
    this.track('notification_opened', {
      notification_type: type,
      time_to_open: timeFromSent,
      conversion: true,
    });
  }

  trackNotificationDismissed(type: string) {
    this.track('notification_dismissed', {
      notification_type: type,
    });
  }

  trackDuelStarted(
    opponentLevel: number,
    userLevel: number,
    betAmount: number,
    searchTime: number
  ) {
    this.track('duel_started', {
      opponent_level: opponentLevel,
      user_level: userLevel,
      level_difference: Math.abs(userLevel - opponentLevel),
      bet_amount: betAmount,
      search_time_ms: searchTime,
    });
  }

  trackDuelCompleted(
    result: 'win' | 'lose' | 'draw',
    userScore: number,
    opponentScore: number,
    duelDuration: number,
    averageResponseTime: number
  ) {
    const totalScore = userScore + opponentScore;
    this.track('duel_completed', {
      result,
      user_score: userScore,
      opponent_score: opponentScore,
      performance_ratio: totalScore > 0 ? userScore / totalScore : 0,
      duel_duration: duelDuration,
      average_response_time: averageResponseTime,
    });
  }

  trackDuelAbandoned(questionNumber: number, totalQuestions: number) {
    this.track('duel_abandoned', {
      question_number: questionNumber,
      total_questions: totalQuestions,
      completion_rate: (questionNumber / totalQuestions) * 100,
    });
  }

  trackShareButtonClicked(contentType: string, platform: string, userLevel: number) {
    this.track('share_button_clicked', {
      content_type: contentType,
      intended_platform: platform,
      user_level: userLevel,
    });
  }

  trackShareCompleted(contentType: string, platform: string, userLevel: number) {
    this.track('share_completed', {
      content_type: contentType,
      platform,
      user_level: userLevel,
      conversion_funnel: 'share_success',
    });
  }

  trackShareCancelled(contentType: string, platform: string) {
    this.track('share_cancelled', {
      content_type: contentType,
      intended_platform: platform,
    });
  }

  trackLessonStarted(lessonId: string, difficulty: string, userLevel: number) {
    this.track('lesson_started', {
      lesson_id: lessonId,
      difficulty,
      user_level: userLevel,
      time_of_day: new Date().getHours(),
    });
  }

  trackLessonCompleted(
    lessonId: string,
    score: number,
    maxScore: number,
    timeSpent: number,
    xpEarned: number,
    coinsEarned: number,
    isPerfect: boolean
  ) {
    this.track('lesson_completed', {
      lesson_id: lessonId,
      score,
      max_score: maxScore,
      score_percentage: (score / maxScore) * 100,
      time_spent: timeSpent,
      xp_earned: xpEarned,
      coins_earned: coinsEarned,
      perfect_score: isPerfect,
    });
  }

  trackAchievementUnlocked(
    achievementId: string,
    achievementName: string,
    tier: string,
    userLevel: number
  ) {
    this.track('achievement_unlocked', {
      achievement_id: achievementId,
      achievement_name: achievementName,
      tier,
      user_level: userLevel,
    });
  }

  trackLevelUp(
    newLevel: number,
    totalXP: number,
    totalLessons: number,
    daysPlayed: number
  ) {
    this.track('level_up', {
      new_level: newLevel,
      total_xp: totalXP,
      total_lessons: totalLessons,
      days_played: daysPlayed,
    });
  }

  trackStreakMilestone(streak: number, userLevel: number) {
    this.track('streak_milestone', {
      streak_days: streak,
      user_level: userLevel,
      milestone_type: this.getStreakMilestoneType(streak),
    });
  }

  trackLivesPurchased(amount: number, coinsCost: number, remainingCoins: number) {
    this.track('lives_purchased', {
      lives_amount: amount,
      coins_cost: coinsCost,
      remaining_coins: remainingCoins,
    });
  }

  trackAppOpened(isFirstOpen: boolean) {
    this.track('app_opened', {
      is_first_open: isFirstOpen,
      hour_of_day: new Date().getHours(),
      day_of_week: new Date().getDay(),
    });
  }

  trackAppBackgrounded(sessionDuration: number) {
    this.track('app_backgrounded', {
      session_duration: sessionDuration,
    });
  }

  getSessionDuration(): number {
    if (!this.sessionStartTime) return 0;
    return Math.floor((Date.now() - this.sessionStartTime.getTime()) / 1000);
  }

  private getStreakMilestoneType(streak: number): string {
    if (streak === 1) return 'first_day';
    if (streak === 7) return 'one_week';
    if (streak === 30) return 'one_month';
    if (streak === 100) return 'hundred_days';
    if (streak % 10 === 0) return 'tens_milestone';
    return 'regular';
  }

  trackError(message: string, error?: Error) {
    const stack = error?.stack;
    this.track('storage_read_error', {
      error_message: message,
      stack_trace: stack,
    });
  }

  trackDataValidationError(
    fieldName: string,
    invalidValue: unknown,
    context: string
  ) {
    this.track('data_validation_error', {
      field_name: fieldName,
      invalid_value: String(invalidValue),
      context,
      value_type: typeof invalidValue,
    });
  }

  trackStorageReadError(errorMessage: string, stackTrace?: string) {
    this.track('storage_read_error', {
      error_message: errorMessage,
      stack_trace: stackTrace,
    });
  }

  trackStorageWriteError(errorMessage: string, stackTrace?: string) {
    this.track('storage_write_error', {
      error_message: errorMessage,
      stack_trace: stackTrace,
    });
  }

  trackNaNValueDetected(
    fieldName: string,
    component: string,
    fallbackUsed: number
  ) {
    this.track('nan_value_detected', {
      field_name: fieldName,
      component,
      fallback_used: fallbackUsed,
    });
  }

  // Quiz Analytics
  trackQuizStarted(newsId: string, quizId: string) {
    this.track('quiz_started', {
      news_id: newsId,
      quiz_id: quizId,
      timestamp: Date.now(),
    });
  }

  trackQuizCompleted(
    newsId: string,
    score: number,
    xpEarned: number,
    isPerfect: boolean
  ) {
    this.track('quiz_completed', {
      news_id: newsId,
      score,
      xp_earned: xpEarned,
      is_perfect: isPerfect,
      timestamp: Date.now(),
    });

    if (isPerfect) {
      this.track('quiz_perfect_score', {
        news_id: newsId,
        xp_earned: xpEarned,
      });
    }
  }

  trackQuizQuestionAnswered(
    questionId: string,
    isCorrect: boolean,
    timeSpent: number,
    category: string
  ) {
    this.track('quiz_question_answered', {
      question_id: questionId,
      is_correct: isCorrect,
      time_spent: timeSpent,
      category,
    });
  }

  trackQuizBadgeUnlocked(badgeId: string, badgeName: string) {
    this.track('quiz_badge_unlocked', {
      badge_id: badgeId,
      badge_name: badgeName,
      timestamp: Date.now(),
    });
  }
}

export const analytics = new Analytics();
export { Analytics };
