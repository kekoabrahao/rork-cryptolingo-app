import React, {
  createContext,
  useContext,
  useState,
  useEffect,
  useCallback,
  useRef,
  ReactNode,
  useMemo,
} from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';
import {
  AchievementProgress,
  DailyChallenge,
  LessonResult,
  UserProgress,
} from '@/types/lesson';
import { achievements } from '@/data/achievements';
import { selectDailyChallenge } from '@/data/daily-challenges';
import { analytics } from '@/utils/analytics';
import { safeNumber, safeInteger, sanitizeUserProgress, validateUserProgress } from '@/utils/safeNumeric';

const STORAGE_KEY = '@cryptolingo_progress';
const MAX_LIVES = 5;
const XP_PER_LEVEL = 100;

type UserProgressState = UserProgress;

const INITIAL_STATE: UserProgressState = {
  level: 1,
  totalXP: 0,
  currentLevelXP: 0,
  nextLevelXP: 100,
  streak: 0,
  lives: 5,
  coins: 0,
  completedLessons: [],
  lastActiveDate: new Date().toISOString().split('T')[0],
  achievements: [],
  perfectLessons: 0,
  totalLessonsCompleted: 0,
  currentCombo: 0,
  bestCombo: 0,
  xpMultiplier: 1,
  powerUps: [],
  dailyChallengeSessionData: {
    modulesCompleted: [],
    perfectConsecutive: 0,
    sessionStartTime: undefined,
    lastLessonTime: undefined,
  },
};

type LessonCompletionResult = {
  xpGained: number;
  coinsGained: number;
  leveledUp: boolean;
  newAchievements: string[];
  dailyChallengeCompleted: boolean;
};

type AchievementCheckResult = {
  newAchievements: string[];
  rewards: { xp: number; coins: number };
  updatedAchievements: AchievementProgress[];
};

type UserProgressContextValue = {
  progress: UserProgressState;
  isLoading: boolean;
  updateStreak: () => void;
  completeLesson: (
    result: LessonResult,
    xpMultiplier?: number,
    coinMultiplier?: number,
  ) => LessonCompletionResult;
  loseLife: () => void;
  refillLives: () => void;
  spendCoins: (amount: number) => boolean;
  resetProgress: () => void;
  updateCombo: (correct: boolean) => number;
  checkAchievements: (newProgress: UserProgressState) => AchievementCheckResult;
};

const UserProgressContextInternal = createContext<UserProgressContextValue | undefined>(
  undefined,
);

function computeDailyStreak(parsed: UserProgressState): UserProgressState {
  const today = new Date().toISOString().split('T')[0];
  const lastActive = parsed.lastActiveDate;
  
  if (lastActive === today) {
    return parsed;
  }

  const lastDate = new Date(lastActive);
  const todayDate = new Date(today);
  const diffTime = todayDate.getTime() - lastDate.getTime();
  const diffDays = Math.floor(diffTime / (1000 * 60 * 60 * 24));

  let newStreak = parsed.streak;
  let bonusCoins = 0;

  if (diffDays === 1) {
    newStreak = parsed.streak + 1;
    bonusCoins = Math.min(5 + newStreak, 50);
  } else if (diffDays > 1) {
    newStreak = 1;
    bonusCoins = 5;
  }

  return {
    ...parsed,
    streak: newStreak,
    coins: parsed.coins + bonusCoins,
    lastActiveDate: today,
  };
}

function generateDailyChallenge(
  level: number,
  streak: number,
  lastActiveDate: string,
): DailyChallenge {
  const today = new Date().toISOString().split('T')[0];
  const template = selectDailyChallenge(level, streak, lastActiveDate);

  let target = 0;
  if (template.requirement.lessons) target = template.requirement.lessons;
  else if (template.requirement.perfectLessons) target = template.requirement.perfectLessons;
  else if (template.requirement.differentModules) target = template.requirement.differentModules;
  else if (template.type === 'xp') target = 150;
  else if (template.type === 'duration') target = template.requirement.continuousTime || 1800;
  else target = 1;

  return {
    id: `daily_${today}_${template.id}`,
    name: template.name,
    description: template.description,
    date: today,
    type: template.type,
    target,
    current: 0,
    completed: false,
    reward: template.reward,
    icon: template.icon,
    difficulty: template.difficulty,
    requirement: template.requirement,
  } as DailyChallenge;
}

function evaluateAchievements(
  newProgress: UserProgressState,
): AchievementCheckResult {
  const newAchievements: string[] = [];
  let bonusXP = 0;
  let bonusCoins = 0;
  const updatedAchievements = [...newProgress.achievements];

  achievements.forEach((achievement) => {
    const current =
      updatedAchievements.find((a) => a.id === achievement.id) ||
      ({ id: achievement.id, progress: 0, tier: 'none' as const } satisfies AchievementProgress);

    let currentProgress = 0;
    switch (achievement.id) {
      case 'first_steps':
      case 'lesson_master':
        currentProgress = newProgress.totalLessonsCompleted;
        break;
      case 'streak_warrior':
      case 'week_champion':
        currentProgress = newProgress.streak;
        break;
      case 'rising_star':
      case 'crypto_expert':
        currentProgress = newProgress.level;
        break;
      case 'perfectionist':
      case 'flawless_victory':
        currentProgress = newProgress.perfectLessons;
        break;
      case 'coin_collector':
        currentProgress = newProgress.coins;
        break;
      case 'xp_hunter':
        currentProgress = newProgress.totalXP;
        break;
      case 'combo_king':
        currentProgress = newProgress.bestCombo;
        break;
    }

    let newTier: AchievementProgress['tier'] = current.tier;
    if (currentProgress >= achievement.tiers.gold && current.tier !== 'gold') {
      newTier = 'gold';
      bonusXP += achievement.reward.xp;
      bonusCoins += achievement.reward.coins;
      newAchievements.push(`${achievement.name} (Gold)`);
    } else if (
      currentProgress >= achievement.tiers.silver &&
      current.tier !== 'silver' &&
      current.tier !== 'gold'
    ) {
      newTier = 'silver';
      bonusXP += achievement.reward.xp * 0.66;
      bonusCoins += achievement.reward.coins * 0.66;
      newAchievements.push(`${achievement.name} (Silver)`);
    } else if (currentProgress >= achievement.tiers.bronze && current.tier === 'none') {
      newTier = 'bronze';
      bonusXP += achievement.reward.xp * 0.33;
      bonusCoins += achievement.reward.coins * 0.33;
      newAchievements.push(`${achievement.name} (Bronze)`);
    }

    if (newTier !== current.tier) {
      const existingIndex = updatedAchievements.findIndex((a) => a.id === achievement.id);
      const updated: AchievementProgress = {
        id: achievement.id,
        progress: currentProgress,
        tier: newTier,
        unlockedAt: new Date().toISOString(),
      };
      if (existingIndex >= 0) {
        updatedAchievements[existingIndex] = updated;
      } else {
        updatedAchievements.push(updated);
      }
    }
  });

  return { newAchievements, rewards: { xp: bonusXP, coins: bonusCoins }, updatedAchievements };
}

export function UserProgressProvider({ children }: { children: ReactNode }) {
  const [progress, setProgress] = useState<UserProgressState>(INITIAL_STATE);
  const [isLoading, setIsLoading] = useState(true);
  const isInitializedRef = useRef(false);
  const isSavingRef = useRef(false);

  useEffect(() => {
    let isMounted = true;
    
    const loadProgress = async () => {
      if (isInitializedRef.current) return;
      
      try {
        console.log('📂 Loading user progress from storage...');
        const stored = await AsyncStorage.getItem(STORAGE_KEY);
        
        if (!isMounted) return;
        
        if (stored) {
          try {
            const parsed: UserProgressState = JSON.parse(stored);
            
            if (!validateUserProgress(parsed)) {
              console.error('❌ Invalid progress data detected, sanitizing...');
              analytics.trackDataValidationError('user_progress', parsed, 'storage_load');
              const sanitized = sanitizeUserProgress(parsed) as UserProgressState;
              const updated = computeDailyStreak(sanitized);
              setProgress(updated);
              await AsyncStorage.setItem(STORAGE_KEY, JSON.stringify(updated));
            } else {
              const updated = computeDailyStreak(parsed);
              console.log('✅ Progress loaded successfully');
              setProgress(updated);
            }
          } catch (parseError) {
            console.error('❌ Failed to parse progress, resetting:', parseError);
            analytics.trackStorageReadError(
              parseError instanceof Error ? parseError.message : String(parseError),
              parseError instanceof Error ? parseError.stack : undefined
            );
            await AsyncStorage.removeItem(STORAGE_KEY);
            console.log('📝 Reset to initial state');
          }
        } else {
          console.log('📝 No stored progress, using initial state');
        }
      } catch (error) {
        console.error('❌ Error loading progress:', error);
        analytics.trackStorageReadError(
          error instanceof Error ? error.message : String(error),
          error instanceof Error ? error.stack : undefined
        );
      } finally {
        if (isMounted) {
          isInitializedRef.current = true;
          setIsLoading(false);
        }
      }
    };
    
    loadProgress();
    
    return () => {
      isMounted = false;
    };
  }, []);

  const saveProgress = useCallback(async (newProgress: UserProgressState) => {
    if (isSavingRef.current) return;
    
    isSavingRef.current = true;
    try {
      if (!validateUserProgress(newProgress)) {
        console.error('❌ Attempting to save invalid progress, sanitizing...');
        analytics.trackDataValidationError('user_progress', newProgress, 'storage_save');
        const sanitized = sanitizeUserProgress(newProgress) as UserProgressState;
        await AsyncStorage.setItem(STORAGE_KEY, JSON.stringify(sanitized));
      } else {
        await AsyncStorage.setItem(STORAGE_KEY, JSON.stringify(newProgress));
      }
      console.log('💾 Progress saved');
    } catch (error) {
      console.error('❌ Error saving progress:', error);
      analytics.trackStorageWriteError(
        error instanceof Error ? error.message : String(error),
        error instanceof Error ? error.stack : undefined
      );
    } finally {
      isSavingRef.current = false;
    }
  }, []);

  const updateStreak = useCallback(() => {
    setProgress((prev) => {
      const newProgress = {
        ...prev,
        streak: prev.streak + 1,
        lastActiveDate: new Date().toISOString().split('T')[0],
      };
      saveProgress(newProgress);
      return newProgress;
    });
  }, [saveProgress]);

  const loseLife = useCallback(() => {
    setProgress((prev) => {
      if (prev.lives <= 0) return prev;
      const newProgress = { ...prev, lives: prev.lives - 1 };
      saveProgress(newProgress);
      return newProgress;
    });
  }, [saveProgress]);

  const refillLives = useCallback(() => {
    setProgress((prev) => {
      const newProgress = { ...prev, lives: MAX_LIVES };
      saveProgress(newProgress);
      return newProgress;
    });
  }, [saveProgress]);

  const spendCoins = useCallback((amount: number): boolean => {
    let success = false;
    setProgress((prev) => {
      if (prev.coins < amount) return prev;
      success = true;
      const newProgress = { ...prev, coins: prev.coins - amount };
      saveProgress(newProgress);
      return newProgress;
    });
    return success;
  }, [saveProgress]);

  const updateCombo = useCallback((correct: boolean): number => {
    let newCombo = 0;
    setProgress((prev) => {
      if (correct) {
        newCombo = prev.currentCombo + 1;
        const newProgress = {
          ...prev,
          currentCombo: newCombo,
          bestCombo: Math.max(newCombo, prev.bestCombo),
        };
        saveProgress(newProgress);
        return newProgress;
      } else {
        newCombo = 0;
        const newProgress = { ...prev, currentCombo: 0 };
        saveProgress(newProgress);
        return newProgress;
      }
    });
    return newCombo;
  }, [saveProgress]);

  const resetProgress = useCallback(() => {
    setProgress(INITIAL_STATE);
    saveProgress(INITIAL_STATE);
  }, [saveProgress]);

  const completeLesson = useCallback(
    (
      result: LessonResult,
      xpMult: number = 1,
      coinMult: number = 1,
    ): LessonCompletionResult => {
      let completionResult: LessonCompletionResult = {
        xpGained: 0,
        coinsGained: 0,
        leveledUp: false,
        newAchievements: [],
        dailyChallengeCompleted: false,
      };

      setProgress((currentProgress) => {
        const isNewLesson = !currentProgress.completedLessons.includes(result.lessonId);
        const now = new Date();
        const currentTime = now.toTimeString().substring(0, 5);

        analytics.trackLessonCompleted(
          result.lessonId,
          result.score,
          result.totalQuestions,
          result.timeSpent || 0,
          result.xpEarned,
          result.coinsEarned,
          result.perfectScore,
        );

        let xpGained = safeNumber(result.xpEarned * currentProgress.xpMultiplier * xpMult, 0);
        let coinsGained = safeNumber(result.coinsEarned * coinMult, 0);
        let livesBonus = 0;

        if (result.perfectScore) {
          xpGained += safeNumber(10 * currentProgress.xpMultiplier * xpMult, 0);
          coinsGained += safeNumber(5 * coinMult, 0);
        }

        const newPerfectLessons = result.perfectScore
          ? currentProgress.perfectLessons + 1
          : currentProgress.perfectLessons;
        const newTotalLessons = isNewLesson
          ? currentProgress.totalLessonsCompleted + 1
          : currentProgress.totalLessonsCompleted;

        let sessionData = currentProgress.dailyChallengeSessionData || {
          modulesCompleted: [],
          perfectConsecutive: 0,
          sessionStartTime: undefined,
          lastLessonTime: undefined,
        };

        let newDailyChallenge = currentProgress.dailyChallenge;
        const today = new Date().toISOString().split('T')[0];

        if (!newDailyChallenge || newDailyChallenge.date !== today) {
          newDailyChallenge = generateDailyChallenge(
            currentProgress.level,
            currentProgress.streak,
            currentProgress.lastActiveDate,
          );
          sessionData = {
            modulesCompleted: [],
            perfectConsecutive: 0,
            sessionStartTime: now.toISOString(),
            lastLessonTime: undefined,
          };
        }

        newDailyChallenge = { ...newDailyChallenge };

        if (!newDailyChallenge.startedAt) {
          newDailyChallenge.startedAt = now.toISOString();
        }

        if (newDailyChallenge && !newDailyChallenge.completed) {
          let challengeProgress = 0;
          let shouldIncrement = false;

          switch (newDailyChallenge.type) {
            case 'lessons':
              challengeProgress = 1;
              shouldIncrement = true;
              if (newDailyChallenge.requirement?.timeLimit) {
                const elapsedTime =
                  (now.getTime() - new Date(newDailyChallenge.startedAt!).getTime()) / 1000;
                if (elapsedTime > newDailyChallenge.requirement.timeLimit) {
                  shouldIncrement = false;
                }
              }
              break;
            case 'perfect':
              if (result.perfectScore) {
                challengeProgress = 1;
                shouldIncrement = true;
                if (newDailyChallenge.requirement?.consecutive) {
                  sessionData = { ...sessionData, perfectConsecutive: sessionData.perfectConsecutive + 1 };
                  challengeProgress = sessionData.perfectConsecutive;
                }
              } else if (newDailyChallenge.requirement?.consecutive) {
                sessionData = { ...sessionData, perfectConsecutive: 0 };
                newDailyChallenge.current = 0;
              }
              break;
            case 'xp':
              challengeProgress = xpGained;
              shouldIncrement = true;
              break;
            case 'speed':
              if (!sessionData.sessionStartTime) {
                sessionData = { ...sessionData, sessionStartTime: now.toISOString() };
              }
              challengeProgress = 1;
              shouldIncrement = true;
              if (
                newDailyChallenge.requirement?.timeLimit &&
                sessionData.sessionStartTime
              ) {
                const speedElapsedTime =
                  (now.getTime() - new Date(sessionData.sessionStartTime).getTime()) / 1000;
                if (speedElapsedTime > newDailyChallenge.requirement.timeLimit) {
                  shouldIncrement = false;
                }
              }
              break;
            case 'accuracy':
              if (result.perfectScore) {
                sessionData = { ...sessionData, perfectConsecutive: sessionData.perfectConsecutive + 1 };
                challengeProgress = sessionData.perfectConsecutive;
                shouldIncrement = true;
              } else {
                sessionData = { ...sessionData, perfectConsecutive: 0 };
                newDailyChallenge.current = 0;
              }
              break;
            case 'variety': {
              const lessonModule = result.lessonId.split('_')[0];
              if (!sessionData.modulesCompleted.includes(lessonModule)) {
                sessionData = {
                  ...sessionData,
                  modulesCompleted: [...sessionData.modulesCompleted, lessonModule],
                };
                challengeProgress = sessionData.modulesCompleted.length;
                newDailyChallenge.current = challengeProgress;
              }
              break;
            }
            case 'timing':
              if (
                newDailyChallenge.requirement?.beforeTime &&
                currentTime < newDailyChallenge.requirement.beforeTime
              ) {
                challengeProgress = 1;
                shouldIncrement = true;
              } else if (
                newDailyChallenge.requirement?.afterTime &&
                currentTime > newDailyChallenge.requirement.afterTime
              ) {
                challengeProgress = 1;
                shouldIncrement = true;
              }
              break;
            case 'duration': {
              let sessionStart = sessionData.sessionStartTime;
              if (!sessionStart) {
                sessionStart = now.toISOString();
                sessionData = { ...sessionData, sessionStartTime: sessionStart };
              }
              sessionData = { ...sessionData, lastLessonTime: now.toISOString() };
              const durationElapsed =
                (now.getTime() - new Date(sessionStart).getTime()) / 1000;
              if (durationElapsed >= (newDailyChallenge.requirement?.continuousTime || 1800)) {
                newDailyChallenge.current = newDailyChallenge.target;
              }
              break;
            }
            case 'comeback':
              challengeProgress = 1;
              shouldIncrement = true;
              break;
          }

          if (shouldIncrement && challengeProgress > 0) {
            newDailyChallenge.current = Math.min(
              newDailyChallenge.current + challengeProgress,
              newDailyChallenge.target,
            );
          }

          if (newDailyChallenge.current >= newDailyChallenge.target && !newDailyChallenge.completed) {
            newDailyChallenge.completed = true;
            newDailyChallenge.completedAt = now.toISOString();
            xpGained += newDailyChallenge.reward.xp;
            coinsGained += newDailyChallenge.reward.coins;
            if (newDailyChallenge.reward.livesBonus) {
              livesBonus = newDailyChallenge.reward.livesBonus;
            }
          }
        }

        const newTotalXP = safeInteger(currentProgress.totalXP + xpGained, 0);
        const newCoins = safeInteger(currentProgress.coins + coinsGained, 0);
        const newLevel = safeInteger(Math.floor(newTotalXP / XP_PER_LEVEL) + 1, 1);
        const currentLevelXP = safeInteger(newTotalXP % XP_PER_LEVEL, 0);

        const completedLessons = isNewLesson
          ? [...currentProgress.completedLessons, result.lessonId]
          : currentProgress.completedLessons;

        const nextProgress: UserProgressState = {
          ...currentProgress,
          level: newLevel,
          totalXP: newTotalXP,
          currentLevelXP,
          nextLevelXP: XP_PER_LEVEL,
          coins: newCoins,
          lives: Math.min(currentProgress.lives + livesBonus, MAX_LIVES),
          completedLessons,
          perfectLessons: newPerfectLessons,
          totalLessonsCompleted: newTotalLessons,
          dailyChallenge: newDailyChallenge,
          dailyChallengeSessionData: sessionData,
        };

        const achievementResult = evaluateAchievements(nextProgress);
        const finalTotalXP = safeInteger(nextProgress.totalXP + achievementResult.rewards.xp, 0);
        const finalCoins = safeInteger(nextProgress.coins + achievementResult.rewards.coins, 0);
        const finalLevel = safeInteger(Math.floor(finalTotalXP / XP_PER_LEVEL) + 1, 1);
        const finalCurrentLevelXP = safeInteger(finalTotalXP % XP_PER_LEVEL, 0);

        const finalProgress: UserProgressState = {
          ...nextProgress,
          totalXP: finalTotalXP,
          coins: finalCoins,
          level: finalLevel,
          currentLevelXP: finalCurrentLevelXP,
          achievements: achievementResult.updatedAchievements,
        };

        const leveledUp = finalLevel > currentProgress.level;

        if (leveledUp) {
          analytics.trackLevelUp(
            finalLevel,
            finalTotalXP,
            finalProgress.totalLessonsCompleted,
            currentProgress.streak,
          );
        }

        achievementResult.newAchievements.forEach((achievementName) => {
          const achievement = achievements.find((a) => achievementName.includes(a.name));
          if (achievement) {
            const tier = achievementName.includes('Gold')
              ? 'gold'
              : achievementName.includes('Silver')
                ? 'silver'
                : 'bronze';
            analytics.trackAchievementUnlocked(
              achievement.id,
              achievement.name,
              tier,
              finalLevel,
            );
          }
        });

        const dailyChallengeCompleted =
          !!newDailyChallenge?.completed && !currentProgress.dailyChallenge?.completed;

        if (dailyChallengeCompleted && newDailyChallenge?.completedAt && newDailyChallenge.startedAt) {
          const completionTime =
            (new Date(newDailyChallenge.completedAt).getTime() -
              new Date(newDailyChallenge.startedAt).getTime()) /
            1000;
          analytics.trackDailyChallengeCompleted(
            newDailyChallenge.id,
            completionTime,
            newDailyChallenge.reward.xp,
            newDailyChallenge.reward.coins,
          );
        }

        if ([7, 14, 30, 50, 100].includes(finalProgress.streak)) {
          analytics.trackStreakMilestone(finalProgress.streak, finalLevel);
        }

        completionResult = {
          xpGained: xpGained + achievementResult.rewards.xp,
          coinsGained: coinsGained + achievementResult.rewards.coins,
          leveledUp,
          newAchievements: achievementResult.newAchievements,
          dailyChallengeCompleted,
        };

        saveProgress(finalProgress);
        return finalProgress;
      });

      return completionResult;
    },
    [saveProgress],
  );

  const contextValue: UserProgressContextValue = useMemo(
    () => ({
      progress,
      isLoading,
      updateStreak,
      completeLesson,
      loseLife,
      refillLives,
      spendCoins,
      resetProgress,
      updateCombo,
      checkAchievements: evaluateAchievements,
    }),
    [
      progress,
      isLoading,
      updateStreak,
      completeLesson,
      loseLife,
      refillLives,
      spendCoins,
      resetProgress,
      updateCombo,
    ],
  );

  return (
    <UserProgressContextInternal.Provider value={contextValue}>
      {children}
    </UserProgressContextInternal.Provider>
  );
}

export function useUserProgress() {
  const ctx = useContext(UserProgressContextInternal);
  if (!ctx) {
    throw new Error('useUserProgress must be used within UserProgressProvider');
  }
  return ctx;
}

export const UserProgressContext = UserProgressProvider;
