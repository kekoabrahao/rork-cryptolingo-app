export type NewsSource = 'coindesk' | 'cointelegraph' | 'cryptopanic' | 'binance';
export type NewsCategory = 'bitcoin' | 'ethereum' | 'defi' | 'nft' | 'regulation' | 'adoption' | 'market';
export type NewsUrgency = 'breaking' | 'important' | 'normal' | 'educational';
export type NewsImpact = 'bullish' | 'bearish' | 'neutral';
export type NewsDifficulty = 'beginner' | 'intermediate' | 'advanced';
export type UserReaction = 'bullish' | 'bearish' | 'neutral';

export type QuizDifficulty = 'easy' | 'medium' | 'hard';

export interface NewsQuiz {
  question: string;
  options: string[];
  correctAnswer: number;
  explanation: string;
  difficulty: QuizDifficulty;
  xpBonus: number;
  coinBonus: number;
}

export interface NewsArticle {
  id: string;
  title: string;
  summary: string;
  content: string;
  source: NewsSource;
  category: NewsCategory;
  urgency: NewsUrgency;
  impact: NewsImpact;
  impactScore: number;
  relatedCryptos: string[];
  publishedAt: Date;
  imageUrl: string;
  readTime: number;
  difficulty: NewsDifficulty;
  keyTerms: string[];
  relatedLessons: string[];
  xpReward: number;
  coinReward: number;
  quiz?: NewsQuiz;
  comments: number;
  likes: number;
  shares: number;
  userReaction?: UserReaction | null;
}

export interface QuizResult {
  articleId: string;
  isCorrect: boolean;
  difficulty: QuizDifficulty;
  timeToAnswer: number;
  timestamp: string;
}

export interface NewsUserProgress {
  readArticles: string[];
  completedQuizzes: string[];
  quizResults: QuizResult[];
  quizStreak: number;
  bestQuizStreak: number;
  perfectQuizzes: number;
  reactions: Record<string, UserReaction>;
  bookmarks: string[];
  totalXPEarned: number;
  totalCoinsEarned: number;
  articlesReadToday: number;
  currentStreak: number;
  lastReadDate: string;
}

export interface NewsFilters {
  categories: NewsCategory[];
  urgency: NewsUrgency[];
  difficulty: NewsDifficulty[];
  sources: NewsSource[];
  showReadOnly: boolean;
  showUnreadOnly: boolean;
}

export interface NewsStats {
  totalArticlesRead: number;
  articlesReadToday: number;
  currentStreak: number;
  longestStreak: number;
  totalXPEarned: number;
  totalCoinsEarned: number;
  quizzesCompleted: number;
  quizAccuracy: number;
  quizStreak: number;
  bestQuizStreak: number;
  perfectQuizzes: number;
  favoriteCategory: NewsCategory;
}
