// Quiz System Types for CryptoLingo News Articles

export interface QuizQuestion {
  id: string;
  question: string;
  options: QuizOption[];
  correctAnswerId: string;
  explanation?: string;
  difficulty: 'easy' | 'medium' | 'hard';
  category: 'price' | 'entity' | 'sentiment' | 'fact' | 'concept';
}

export interface QuizOption {
  id: string;
  text: string;
  isCorrect: boolean;
}

export interface NewsQuiz {
  id: string;
  newsId: string;
  questions: QuizQuestion[];
  createdAt: string;
  generatedBy: 'ai' | 'template' | 'manual';
}

export interface QuizAttempt {
  quizId: string;
  newsId: string;
  userId?: string;
  answers: QuizAnswer[];
  score: number;
  perfectScore: boolean;
  xpEarned: number;
  timeSpent: number; // in seconds
  completedAt: string;
}

export interface QuizAnswer {
  questionId: string;
  selectedOptionId: string;
  isCorrect: boolean;
  timeSpent: number; // in seconds
}

export interface QuizStats {
  totalQuizzes: number;
  totalAttempts: number;
  perfectScores: number;
  averageScore: number;
  totalXpEarned: number;
  currentStreak: number;
  longestStreak: number;
  accuracy: number; // percentage
  categoryAccuracy: {
    price: number;
    entity: number;
    sentiment: number;
    fact: number;
    concept: number;
  };
}

export interface QuizLeaderboardEntry {
  userId: string;
  userName: string;
  userAvatar?: string;
  quizzesCompleted: number;
  perfectScores: number;
  averageScore: number;
  totalXp: number;
  rank: number;
}

export interface QuizBadge {
  id: string;
  name: string;
  description: string;
  icon: string;
  requirement: number;
  category: 'completion' | 'streak' | 'accuracy' | 'speed';
  unlockedAt?: string;
}

// Quiz Generation Types
export interface ArticleAnalysis {
  entities: ExtractedEntity[];
  sentiment: 'bullish' | 'bearish' | 'neutral';
  keyFacts: string[];
  prices: PriceEntity[];
  dates: DateEntity[];
  locations: string[];
  organizations: string[];
}

export interface ExtractedEntity {
  text: string;
  type: 'price' | 'crypto' | 'company' | 'country' | 'date' | 'percentage';
  confidence: number;
}

export interface PriceEntity {
  currency: string;
  value: number;
  context: string;
}

export interface DateEntity {
  date: string;
  context: string;
}

// Quiz Generation Config
export interface QuizGenerationConfig {
  numQuestions: 3;
  difficulty: 'auto' | 'easy' | 'medium' | 'hard';
  includeExplanations: boolean;
  categoryDistribution: {
    price: number;
    entity: number;
    sentiment: number;
    fact: number;
    concept: number;
  };
}

// Default Config
export const DEFAULT_QUIZ_CONFIG: QuizGenerationConfig = {
  numQuestions: 3,
  difficulty: 'auto',
  includeExplanations: true,
  categoryDistribution: {
    price: 0.3,
    entity: 0.3,
    sentiment: 0.2,
    fact: 0.1,
    concept: 0.1,
  },
};

// XP Rewards
export const QUIZ_XP_REWARDS = {
  PERFECT_SCORE: 15,
  TWO_CORRECT: 10,
  ONE_CORRECT: 5,
  STREAK_BONUS: 5, // per 5 streak
};

// Badge Requirements
export const QUIZ_BADGES: Omit<QuizBadge, 'unlockedAt'>[] = [
  {
    id: 'news_scholar',
    name: 'News Scholar',
    description: 'Complete 50 news quizzes',
    icon: '🎓',
    requirement: 50,
    category: 'completion',
  },
  {
    id: 'perfect_streak_10',
    name: 'Perfect 10',
    description: 'Get 10 perfect scores in a row',
    icon: '🔥',
    requirement: 10,
    category: 'streak',
  },
  {
    id: 'quiz_master',
    name: 'Quiz Master',
    description: '95% accuracy on 100 quizzes',
    icon: '🏆',
    requirement: 100,
    category: 'accuracy',
  },
  {
    id: 'speed_reader',
    name: 'Speed Reader',
    description: 'Complete 10 quizzes in under 30 seconds each',
    icon: '⚡',
    requirement: 10,
    category: 'speed',
  },
  {
    id: 'news_addict',
    name: 'News Addict',
    description: 'Complete 100 news quizzes',
    icon: '📰',
    requirement: 100,
    category: 'completion',
  },
];
