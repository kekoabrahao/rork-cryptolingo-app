export type QuestionType = "multiple_choice" | "true_false";

export interface Question {
  id: string;
  type: QuestionType;
  question: string;
  options?: string[];
  correctAnswer: number;
  explanation: string;
  hint?: string;
}

export interface Lesson {
  id: string;
  title: string;
  module: string;
  moduleNumber: number;
  difficulty: "beginner" | "intermediate" | "advanced";
  xpReward: number;
  coinReward: number;
  requiredLevel: number;
  icon: string;
  questions: Question[];
}

export interface DailyChallengeSessionData {
  modulesCompleted: string[];
  perfectConsecutive: number;
  sessionStartTime?: string;
  lastLessonTime?: string;
}

export interface UserProgress {
  level: number;
  totalXP: number;
  currentLevelXP: number;
  nextLevelXP: number;
  streak: number;
  lives: number;
  coins: number;
  completedLessons: string[];
  lastActiveDate: string;
  achievements: AchievementProgress[];
  dailyChallenge?: DailyChallenge;
  dailyChallengeSessionData?: DailyChallengeSessionData;
  perfectLessons: number;
  totalLessonsCompleted: number;
  currentCombo: number;
  bestCombo: number;
  xpMultiplier: number;
  powerUps: PowerUp[];
}

export interface AchievementProgress {
  id: string;
  unlockedAt?: string;
  progress: number;
  tier: 'bronze' | 'silver' | 'gold' | 'none';
}

export type DailyChallengeType = 
  | 'lessons' 
  | 'perfect' 
  | 'streak' 
  | 'xp' 
  | 'speed' 
  | 'accuracy' 
  | 'variety' 
  | 'timing' 
  | 'duration' 
  | 'comeback';

export interface DailyChallenge {
  id: string;
  name: string;
  description: string;
  date: string;
  type: DailyChallengeType;
  target: number;
  current: number;
  completed: boolean;
  reward: {
    xp: number;
    coins: number;
    livesBonus?: number;
  };
  icon: string;
  difficulty: 'easy' | 'medium' | 'hard';
  requirement?: {
    lessons?: number;
    perfectLessons?: number;
    consecutive?: boolean;
    differentModules?: number;
    beforeTime?: string;
    afterTime?: string;
    continuousTime?: number;
    timeLimit?: number;
    returnAfterMiss?: boolean;
  };
  startedAt?: string;
  completedAt?: string;
}

export interface PowerUp {
  id: string;
  type: 'double_xp' | 'life_saver' | 'hint_master';
  expiresAt?: string;
  uses?: number;
}

export interface Achievement {
  id: string;
  name: string;
  description: string;
  icon: string;
  category: 'lesson' | 'streak' | 'level' | 'perfect' | 'social' | 'special';
  tiers: {
    bronze: number;
    silver: number;
    gold: number;
  };
  reward: {
    xp: number;
    coins: number;
    powerUp?: PowerUp;
  };
}

export interface LessonResult {
  lessonId: string;
  score: number;
  totalQuestions: number;
  xpEarned: number;
  coinsEarned: number;
  perfectScore: boolean;
  completed: boolean;
  timeSpent?: number;
}
