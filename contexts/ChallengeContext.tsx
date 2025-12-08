import React, {
  createContext,
  useContext,
  useState,
  useEffect,
  useCallback,
  useMemo,
  ReactNode,
} from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';
import {
  Challenge,
  UserChallengeProgress,
  ChallengeDifficulty,
  ChallengeType,
} from '@/types/challenge';
import {
  challengeTemplates,
  rapidFireQuestions,
  vocabularyMatches,
  scenarioChallenges,
  challengeBadges,
} from '@/data/challenge-templates';

const STORAGE_KEY = '@cryptolingo_challenges';

const INITIAL_PROGRESS: UserChallengeProgress = {
  currentStreak: 0,
  longestStreak: 0,
  completedToday: [],
  completedThisWeek: [],
  totalCompleted: 0,
  perfectChallenges: 0,
  weekendChallenges: 0,
  communityChallenges: 0,
  lastCompletedDate: '',
  stats: {
    rapidFireBest: 0,
    priceAccuracy: 0,
    vocabularyScore: 0,
    scenariosSolved: 0,
  },
  badges: [],
  learningGaps: [],
  strongAreas: [],
  recommendedDifficulty: 'easy',
};

interface ChallengeContextValue {
  challenges: Challenge[];
  progress: UserChallengeProgress;
  isLoading: boolean;
  generateDailyChallenges: (userLevel: number, completedLessons: string[]) => void;
  completeChallenge: (challengeId: string, score: number, perfect: boolean) => void;
  startChallenge: (challengeId: string) => void;
  updateChallengeProgress: (challengeId: string, current: number) => void;
  getRapidFireQuestions: (difficulty: ChallengeDifficulty, count: number) => typeof rapidFireQuestions;
  getVocabularyMatches: (count: number) => typeof vocabularyMatches;
  getScenarioChallenges: (difficulty: ChallengeDifficulty, count: number) => typeof scenarioChallenges;
  resetProgress: () => void;
}

const ChallengeContextInternal = createContext<ChallengeContextValue | undefined>(undefined);

function calculateRecommendedDifficulty(
  userLevel: number,
  recentPerformance: number,
  totalCompleted: number,
): ChallengeDifficulty {
  if (userLevel < 3 || totalCompleted < 5) return 'easy';
  if (userLevel < 6 || recentPerformance < 0.6) return 'medium';
  if (userLevel < 10 || recentPerformance < 0.8) return 'hard';
  return 'expert';
}

function identifyLearningGaps(
  completedLessons: string[],
  stats: UserChallengeProgress['stats'],
): string[] {
  const gaps: string[] = [];
  
  if (stats.rapidFireBest < 15) gaps.push('basics');
  if (stats.vocabularyScore < 70) gaps.push('terminology');
  if (stats.scenariosSolved < 10) gaps.push('practical_application');
  if (stats.priceAccuracy < 50) gaps.push('market_analysis');
  
  const modulesCovered = new Set(completedLessons.map(id => id.split('_')[0]));
  const allModules = ['bitcoin', 'ethereum', 'defi', 'trading', 'security'];
  
  allModules.forEach(module => {
    if (!modulesCovered.has(module)) {
      gaps.push(module);
    }
  });
  
  return gaps;
}

function identifyStrongAreas(stats: UserChallengeProgress['stats']): string[] {
  const strong: string[] = [];
  
  if (stats.rapidFireBest > 18) strong.push('speed');
  if (stats.vocabularyScore > 90) strong.push('terminology');
  if (stats.scenariosSolved > 20) strong.push('practical_skills');
  if (stats.priceAccuracy > 70) strong.push('market_analysis');
  
  return strong;
}

function selectChallengesForUser(
  userLevel: number,
  progress: UserChallengeProgress,
  completedLessons: string[],
): Challenge[] {
  const today = new Date();
  const dayOfWeek = today.getDay();
  const isWeekend = dayOfWeek === 0 || dayOfWeek === 6;
  
  const todayStr = today.toISOString().split('T')[0];
  const expiresAt = new Date(today.getTime() + 24 * 60 * 60 * 1000).toISOString();
  
  let availableTemplates = challengeTemplates.filter(template => {
    if (template.requirement?.minLevel && userLevel < template.requirement.minLevel) {
      return false;
    }
    if (template.requirement?.maxLevel && userLevel > template.requirement.maxLevel) {
      return false;
    }
    if (template.isWeekendOnly && !isWeekend) {
      return false;
    }
    return true;
  });
  
  const learningGaps = identifyLearningGaps(completedLessons, progress.stats);
  const recommendedDiff = calculateRecommendedDifficulty(
    userLevel,
    progress.perfectChallenges / Math.max(progress.totalCompleted, 1),
    progress.totalCompleted,
  );
  
  const prioritizedTemplates = availableTemplates.sort((a, b) => {
    let scoreA = a.weight;
    let scoreB = b.weight;
    
    if (a.difficulty === recommendedDiff) scoreA += 10;
    if (b.difficulty === recommendedDiff) scoreB += 10;
    
    if (learningGaps.includes('speed') && a.type === 'rapid_fire_quiz') scoreA += 15;
    if (learningGaps.includes('speed') && b.type === 'rapid_fire_quiz') scoreB += 15;
    if (learningGaps.includes('terminology') && a.type === 'vocabulary_match') scoreA += 15;
    if (learningGaps.includes('terminology') && b.type === 'vocabulary_match') scoreB += 15;
    if (learningGaps.includes('practical_application') && a.type === 'scenario_solve') scoreA += 15;
    if (learningGaps.includes('practical_application') && b.type === 'scenario_solve') scoreB += 15;
    
    return scoreB - scoreA;
  });
  
  const selectedChallenges: Challenge[] = [];
  const typesAdded = new Set<ChallengeType>();
  
  for (const template of prioritizedTemplates) {
    if (selectedChallenges.length >= 6) break;
    
    if (typesAdded.has(template.type) && selectedChallenges.length > 3) continue;
    
    const challenge: Challenge = {
      id: `${todayStr}_${template.id}`,
      type: template.type,
      name: template.name,
      description: template.description,
      difficulty: template.difficulty,
      icon: template.icon,
      target: getTargetForChallenge(template.type, template.difficulty),
      current: 0,
      completed: false,
      reward: { ...template.baseReward },
      expiresAt,
      requirement: template.requirement,
      isWeekend: template.isWeekendOnly,
      isCommunity: template.isCommunityChallenge,
    };
    
    if (template.isCommunityChallenge) {
      challenge.communityProgress = Math.floor(Math.random() * 300);
      challenge.communityTarget = template.id.includes('epic') ? 1000 : 100;
      challenge.teamId = 'global';
    }
    
    selectedChallenges.push(challenge);
    typesAdded.add(template.type);
  }
  
  return selectedChallenges;
}

function getTargetForChallenge(type: ChallengeType, difficulty: ChallengeDifficulty): number {
  const targets: Record<ChallengeType, Record<ChallengeDifficulty, number>> = {
    rapid_fire_quiz: { easy: 10, medium: 15, hard: 20, expert: 25 },
    price_prediction: { easy: 3, medium: 5, hard: 7, expert: 10 },
    vocabulary_match: { easy: 10, medium: 15, hard: 20, expert: 25 },
    scenario_solve: { easy: 3, medium: 5, hard: 8, expert: 10 },
    speed_demon: { easy: 2, medium: 3, hard: 4, expert: 5 },
    perfect_streak: { easy: 3, medium: 5, hard: 7, expert: 10 },
    module_explorer: { easy: 2, medium: 4, hard: 5, expert: 6 },
    time_attack: { easy: 2, medium: 3, hard: 4, expert: 5 },
    weekend_warrior: { easy: 3, medium: 5, hard: 10, expert: 15 },
    community_raid: { easy: 50, medium: 100, hard: 500, expert: 1000 },
  };
  
  return targets[type]?.[difficulty] || 5;
}

export function ChallengeProvider({ children }: { children: ReactNode }) {
  const [challenges, setChallenges] = useState<Challenge[]>([]);
  const [progress, setProgress] = useState<UserChallengeProgress>(INITIAL_PROGRESS);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const loadData = async () => {
      try {
        const stored = await AsyncStorage.getItem(STORAGE_KEY);
        if (stored) {
          const parsed = JSON.parse(stored);
          setProgress(parsed.progress || INITIAL_PROGRESS);
          setChallenges(parsed.challenges || []);
        }
      } catch (error) {
        console.error('❌ Error loading challenges:', error);
      } finally {
        setIsLoading(false);
      }
    };
    
    loadData();
  }, []);

  const saveData = useCallback(async (newProgress: UserChallengeProgress, newChallenges: Challenge[]) => {
    try {
      await AsyncStorage.setItem(STORAGE_KEY, JSON.stringify({
        progress: newProgress,
        challenges: newChallenges,
      }));
      console.log('💾 Challenges saved');
    } catch (error) {
      console.error('❌ Error saving challenges:', error);
    }
  }, []);

  const generateDailyChallenges = useCallback((userLevel: number, completedLessons: string[]) => {
    const today = new Date().toISOString().split('T')[0];
    
    const existingToday = challenges.filter(c => c.id.startsWith(today));
    if (existingToday.length > 0) {
      console.log('✅ Today\'s challenges already generated');
      return;
    }
    
    const newChallenges = selectChallengesForUser(userLevel, progress, completedLessons);
    
    const updatedProgress: UserChallengeProgress = {
      ...progress,
      learningGaps: identifyLearningGaps(completedLessons, progress.stats),
      strongAreas: identifyStrongAreas(progress.stats),
      recommendedDifficulty: calculateRecommendedDifficulty(
        userLevel,
        progress.perfectChallenges / Math.max(progress.totalCompleted, 1),
        progress.totalCompleted,
      ),
    };
    
    setChallenges(newChallenges);
    setProgress(updatedProgress);
    saveData(updatedProgress, newChallenges);
    
    console.log('🎯 Generated', newChallenges.length, 'personalized challenges');
  }, [challenges, progress, saveData]);

  const startChallenge = useCallback((challengeId: string) => {
    setChallenges(prev => {
      const updated = prev.map(c => {
        if (c.id === challengeId && !c.startedAt) {
          return { ...c, startedAt: new Date().toISOString() };
        }
        return c;
      });
      saveData(progress, updated);
      return updated;
    });
  }, [progress, saveData]);

  const updateChallengeProgress = useCallback((challengeId: string, current: number) => {
    setChallenges(prev => {
      const updated = prev.map(c => {
        if (c.id === challengeId) {
          return { ...c, current: Math.min(current, c.target) };
        }
        return c;
      });
      saveData(progress, updated);
      return updated;
    });
  }, [progress, saveData]);

  const completeChallenge = useCallback((challengeId: string, score: number, perfect: boolean) => {
    const today = new Date().toISOString().split('T')[0];
    const challenge = challenges.find(c => c.id === challengeId);
    
    if (!challenge || challenge.completed) return;
    
    const updatedChallenges = challenges.map(c => {
      if (c.id === challengeId) {
        return {
          ...c,
          current: c.target,
          completed: true,
          completedAt: new Date().toISOString(),
        };
      }
      return c;
    });
    
    const newCompletedToday = [...progress.completedToday, challengeId];
    const newCompletedThisWeek = [...progress.completedThisWeek, challengeId];
    
    const lastDate = progress.lastCompletedDate;
    const yesterday = new Date(Date.now() - 24 * 60 * 60 * 1000).toISOString().split('T')[0];
    
    let newStreak = progress.currentStreak;
    if (lastDate === yesterday) {
      newStreak += 1;
    } else if (lastDate !== today) {
      newStreak = 1;
    }
    
    const newStats = { ...progress.stats };
    
    if (challenge.type === 'rapid_fire_quiz') {
      newStats.rapidFireBest = Math.max(newStats.rapidFireBest, score);
    } else if (challenge.type === 'vocabulary_match') {
      newStats.vocabularyScore = Math.max(newStats.vocabularyScore, score);
    } else if (challenge.type === 'scenario_solve') {
      newStats.scenariosSolved += 1;
    } else if (challenge.type === 'price_prediction') {
      const accuracy = (score / challenge.target) * 100;
      newStats.priceAccuracy = (newStats.priceAccuracy + accuracy) / 2;
    }
    
    const newBadges = [...progress.badges];
    
    if (challenge.reward.badge) {
      const badgeTemplate = challengeBadges.find(b => b.id === challenge.reward.badge);
      if (badgeTemplate && !newBadges.find(b => b.id === badgeTemplate.id)) {
        newBadges.push({
          ...badgeTemplate,
          unlockedAt: new Date().toISOString(),
        });
      }
    }
    
    if (progress.totalCompleted + 1 === 100) {
      const masterBadge = challengeBadges.find(b => b.id === 'challenge_master');
      if (masterBadge && !newBadges.find(b => b.id === masterBadge.id)) {
        newBadges.push({
          ...masterBadge,
          unlockedAt: new Date().toISOString(),
        });
      }
    }
    
    if (newStreak === 30) {
      const streakBadge = challengeBadges.find(b => b.id === 'streak_legend');
      if (streakBadge && !newBadges.find(b => b.id === streakBadge.id)) {
        newBadges.push({
          ...streakBadge,
          unlockedAt: new Date().toISOString(),
        });
      }
    }
    
    const updatedProgress: UserChallengeProgress = {
      ...progress,
      currentStreak: newStreak,
      longestStreak: Math.max(progress.longestStreak, newStreak),
      completedToday: newCompletedToday,
      completedThisWeek: newCompletedThisWeek,
      totalCompleted: progress.totalCompleted + 1,
      perfectChallenges: perfect ? progress.perfectChallenges + 1 : progress.perfectChallenges,
      weekendChallenges: challenge.isWeekend ? progress.weekendChallenges + 1 : progress.weekendChallenges,
      communityChallenges: challenge.isCommunity ? progress.communityChallenges + 1 : progress.communityChallenges,
      lastCompletedDate: today,
      stats: newStats,
      badges: newBadges,
    };
    
    setChallenges(updatedChallenges);
    setProgress(updatedProgress);
    saveData(updatedProgress, updatedChallenges);
    
    console.log('🎉 Challenge completed!', challengeId, 'Perfect:', perfect);
  }, [challenges, progress, saveData]);

  const getRapidFireQuestions = useCallback((difficulty: ChallengeDifficulty, count: number) => {
    const filtered = rapidFireQuestions.filter(q => q.difficulty === difficulty || difficulty === 'easy');
    const shuffled = [...filtered].sort(() => Math.random() - 0.5);
    return shuffled.slice(0, count);
  }, []);

  const getVocabularyMatches = useCallback((count: number) => {
    const shuffled = [...vocabularyMatches].sort(() => Math.random() - 0.5);
    return shuffled.slice(0, count);
  }, []);

  const getScenarioChallenges = useCallback((difficulty: ChallengeDifficulty, count: number) => {
    const filtered = scenarioChallenges.filter(s => s.difficulty === difficulty || difficulty === 'easy');
    const shuffled = [...filtered].sort(() => Math.random() - 0.5);
    return shuffled.slice(0, count);
  }, []);

  const resetProgress = useCallback(() => {
    setProgress(INITIAL_PROGRESS);
    setChallenges([]);
    saveData(INITIAL_PROGRESS, []);
  }, [saveData]);

  const contextValue: ChallengeContextValue = useMemo(
    () => ({
      challenges,
      progress,
      isLoading,
      generateDailyChallenges,
      completeChallenge,
      startChallenge,
      updateChallengeProgress,
      getRapidFireQuestions,
      getVocabularyMatches,
      getScenarioChallenges,
      resetProgress,
    }),
    [
      challenges,
      progress,
      isLoading,
      generateDailyChallenges,
      completeChallenge,
      startChallenge,
      updateChallengeProgress,
      getRapidFireQuestions,
      getVocabularyMatches,
      getScenarioChallenges,
      resetProgress,
    ],
  );

  return (
    <ChallengeContextInternal.Provider value={contextValue}>
      {children}
    </ChallengeContextInternal.Provider>
  );
}

export function useChallenges() {
  const ctx = useContext(ChallengeContextInternal);
  if (!ctx) {
    throw new Error('useChallenges must be used within ChallengeProvider');
  }
  return ctx;
}
