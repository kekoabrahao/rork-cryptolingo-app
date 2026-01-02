// Quiz Context for CryptoLingo
import createContextHook from "@nkzw/create-context-hook";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { useState, useCallback, useEffect } from "react";
import { 
  QuizAttempt, 
  QuizStats, 
  QuizBadge, 
  QUIZ_XP_REWARDS, 
  QUIZ_BADGES 
} from "@/types/quiz";
import { analytics } from "@/utils/analytics";

const QUIZ_STATS_KEY = "@cryptolingo_quiz_stats";
const QUIZ_ATTEMPTS_KEY = "@cryptolingo_quiz_attempts";
const QUIZ_BADGES_KEY = "@cryptolingo_quiz_badges";

const DEFAULT_STATS: QuizStats = {
  totalQuizzes: 0,
  totalAttempts: 0,
  perfectScores: 0,
  averageScore: 0,
  totalXpEarned: 0,
  currentStreak: 0,
  longestStreak: 0,
  accuracy: 0,
  categoryAccuracy: {
    price: 0,
    entity: 0,
    sentiment: 0,
    fact: 0,
    concept: 0,
  },
};

export const [QuizContext, useQuiz] = createContextHook(() => {
  const [stats, setStats] = useState<QuizStats>(DEFAULT_STATS);
  const [attempts, setAttempts] = useState<QuizAttempt[]>([]);
  const [badges, setBadges] = useState<QuizBadge[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  // Load data on mount
  useEffect(() => {
    loadQuizData();
  }, []);

  const loadQuizData = async () => {
    try {
      const [statsData, attemptsData, badgesData] = await Promise.all([
        AsyncStorage.getItem(QUIZ_STATS_KEY),
        AsyncStorage.getItem(QUIZ_ATTEMPTS_KEY),
        AsyncStorage.getItem(QUIZ_BADGES_KEY),
      ]);

      if (statsData) setStats(JSON.parse(statsData));
      if (attemptsData) setAttempts(JSON.parse(attemptsData));
      if (badgesData) setBadges(JSON.parse(badgesData));
    } catch (error) {
      console.error('Failed to load quiz data:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const saveStats = async (newStats: QuizStats) => {
    try {
      await AsyncStorage.setItem(QUIZ_STATS_KEY, JSON.stringify(newStats));
      setStats(newStats);
    } catch (error) {
      console.error('Failed to save quiz stats:', error);
    }
  };

  const saveAttempts = async (newAttempts: QuizAttempt[]) => {
    try {
      // Keep only last 100 attempts to avoid storage bloat
      const attemptsToSave = newAttempts.slice(-100);
      await AsyncStorage.setItem(QUIZ_ATTEMPTS_KEY, JSON.stringify(attemptsToSave));
      setAttempts(attemptsToSave);
    } catch (error) {
      console.error('Failed to save quiz attempts:', error);
    }
  };

  const saveBadges = async (newBadges: QuizBadge[]) => {
    try {
      await AsyncStorage.setItem(QUIZ_BADGES_KEY, JSON.stringify(newBadges));
      setBadges(newBadges);
    } catch (error) {
      console.error('Failed to save quiz badges:', error);
    }
  };

  /**
   * Submits a quiz attempt and updates stats
   */
  const checkAndUnlockBadges = useCallback(async (currentStats: QuizStats) => {
    const newBadges: QuizBadge[] = [];

    for (const badgeTemplate of QUIZ_BADGES) {
      if (badges.some(b => b.id === badgeTemplate.id)) continue;

      let shouldUnlock = false;

      switch (badgeTemplate.category) {
        case 'completion':
          shouldUnlock = currentStats.totalQuizzes >= badgeTemplate.requirement;
          break;
        case 'streak':
          shouldUnlock = currentStats.longestStreak >= badgeTemplate.requirement;
          break;
        case 'accuracy':
          shouldUnlock = currentStats.accuracy >= 95 && currentStats.totalQuizzes >= badgeTemplate.requirement;
          break;
        case 'speed':
          const fastAttempts = attempts.filter(a => a.timeSpent < 30).length;
          shouldUnlock = fastAttempts >= badgeTemplate.requirement;
          break;
      }

      if (shouldUnlock) {
        const unlockedBadge: QuizBadge = {
          ...badgeTemplate,
          unlockedAt: new Date().toISOString(),
        };
        newBadges.push(unlockedBadge);
        console.log(`🏆 New badge unlocked: ${unlockedBadge.name}`);
      }
    }

    if (newBadges.length > 0) {
      const updatedBadges = [...badges, ...newBadges];
      await saveBadges(updatedBadges);
      
      newBadges.forEach(badge => {
        analytics.trackAchievementUnlocked(badge.id, badge.name, 'bronze', 1);
      });
    }

    return newBadges;
  }, [badges, attempts]);

  const submitQuizAttempt = useCallback(async (attempt: QuizAttempt) => {
    const correctAnswers = attempt.answers.filter(a => a.isCorrect).length;
    const totalQuestions = attempt.answers.length;
    const score = (correctAnswers / totalQuestions) * 100;
    const perfectScore = correctAnswers === totalQuestions;

    let xpEarned = 0;
    if (perfectScore) {
      xpEarned = QUIZ_XP_REWARDS.PERFECT_SCORE;
    } else if (correctAnswers === 2) {
      xpEarned = QUIZ_XP_REWARDS.TWO_CORRECT;
    } else if (correctAnswers === 1) {
      xpEarned = QUIZ_XP_REWARDS.ONE_CORRECT;
    }

    const newStreak = perfectScore ? stats.currentStreak + 1 : 0;
    if (newStreak > 0 && newStreak % 5 === 0) {
      xpEarned += QUIZ_XP_REWARDS.STREAK_BONUS;
    }

    const completedAttempt: QuizAttempt = {
      ...attempt,
      score,
      perfectScore,
      xpEarned,
    };

    const newStats: QuizStats = {
      ...stats,
      totalQuizzes: stats.totalQuizzes + 1,
      totalAttempts: stats.totalAttempts + 1,
      perfectScores: stats.perfectScores + (perfectScore ? 1 : 0),
      averageScore: ((stats.averageScore * stats.totalAttempts) + score) / (stats.totalAttempts + 1),
      totalXpEarned: stats.totalXpEarned + xpEarned,
      currentStreak: newStreak,
      longestStreak: Math.max(stats.longestStreak, newStreak),
      accuracy: ((stats.accuracy * stats.totalAttempts) + (correctAnswers / totalQuestions) * 100) / (stats.totalAttempts + 1),
      categoryAccuracy: stats.categoryAccuracy,
    };

    await saveStats(newStats);
    await saveAttempts([...attempts, completedAttempt]);

    const newBadges = await checkAndUnlockBadges(newStats);
    if (newBadges.length > 0) {
      console.log(`🏆 Unlocked ${newBadges.length} new badge(s)!`);
    }

    analytics.trackQuizCompleted(attempt.newsId, score, xpEarned, perfectScore);

    console.log(`✅ Quiz completed: ${correctAnswers}/${totalQuestions} correct, +${xpEarned} XP`);
    
    return completedAttempt;
  }, [stats, attempts, checkAndUnlockBadges]);

  const getAttemptsForNews = useCallback((newsId: string): QuizAttempt[] => {
    return attempts.filter(a => a.newsId === newsId);
  }, [attempts]);

  /**
   * Gets recent quiz attempts (last N)
   */
  const getRecentAttempts = useCallback((limit: number = 10): QuizAttempt[] => {
    return attempts.slice(-limit).reverse();
  }, [attempts]);

  /**
   * Resets quiz stats (for testing)
   */
  const resetQuizStats = useCallback(async () => {
    await saveStats(DEFAULT_STATS);
    await saveAttempts([]);
    await saveBadges([]);
    console.log('✅ Quiz stats reset');
  }, []);

  /**
   * Gets user's rank position (mock implementation)
   */
  const getUserRank = useCallback((): number => {
    // In a real implementation, this would query a backend
    // For now, return a mock rank based on total quizzes
    if (stats.totalQuizzes >= 100) return 1;
    if (stats.totalQuizzes >= 50) return 5;
    if (stats.totalQuizzes >= 25) return 10;
    if (stats.totalQuizzes >= 10) return 25;
    return 50;
  }, [stats.totalQuizzes]);

  return {
    stats,
    attempts,
    badges,
    isLoading,
    submitQuizAttempt,
    getAttemptsForNews,
    getRecentAttempts,
    resetQuizStats,
    getUserRank,
  };
});
