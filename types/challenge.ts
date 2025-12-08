export type ChallengeType = 
  | 'rapid_fire_quiz'
  | 'price_prediction'
  | 'vocabulary_match'
  | 'scenario_solve'
  | 'speed_demon'
  | 'perfect_streak'
  | 'module_explorer'
  | 'time_attack'
  | 'weekend_warrior'
  | 'community_raid';

export type ChallengeDifficulty = 'easy' | 'medium' | 'hard' | 'expert';

export interface Challenge {
  id: string;
  type: ChallengeType;
  name: string;
  description: string;
  difficulty: ChallengeDifficulty;
  icon: string;
  
  target: number;
  current: number;
  completed: boolean;
  
  reward: ChallengeReward;
  
  startedAt?: string;
  completedAt?: string;
  expiresAt: string;
  
  requirement?: ChallengeRequirement;
  
  isWeekend?: boolean;
  isCommunity?: boolean;
  communityProgress?: number;
  communityTarget?: number;
  teamId?: string;
}

export interface ChallengeReward {
  xp: number;
  coins: number;
  badge?: string;
  livesBonus?: number;
  streakBonus?: boolean;
  multiplier?: number;
}

export interface ChallengeRequirement {
  minLevel?: number;
  maxLevel?: number;
  timeLimit?: number;
  perfectAnswers?: number;
  consecutiveCorrect?: number;
  specificModules?: string[];
  beforeTime?: string;
  afterTime?: string;
  categories?: string[];
  minAccuracy?: number;
}

export interface RapidFireQuestion {
  question: string;
  answer: string;
  options: string[];
  correctIndex: number;
  category: string;
  difficulty: ChallengeDifficulty;
}

export interface PricePredictionChallenge {
  crypto: string;
  currentPrice: number;
  timeframe: '1h' | '4h' | '24h';
  predictionOptions: {
    direction: 'up' | 'down' | 'stable';
    range: string;
  }[];
  correctIndex: number;
}

export interface VocabularyMatch {
  term: string;
  definition: string;
  category: string;
}

export interface ScenarioChallenge {
  scenario: string;
  question: string;
  options: string[];
  correctIndex: number;
  explanation: string;
  difficulty: ChallengeDifficulty;
}

export interface UserChallengeProgress {
  currentStreak: number;
  longestStreak: number;
  completedToday: string[];
  completedThisWeek: string[];
  totalCompleted: number;
  perfectChallenges: number;
  
  weekendChallenges: number;
  communityChallenges: number;
  
  lastCompletedDate: string;
  
  stats: {
    rapidFireBest: number;
    priceAccuracy: number;
    vocabularyScore: number;
    scenariosSolved: number;
  };
  
  badges: ChallengeBadge[];
  
  learningGaps: string[];
  strongAreas: string[];
  recommendedDifficulty: ChallengeDifficulty;
}

export interface ChallengeBadge {
  id: string;
  name: string;
  icon: string;
  description: string;
  unlockedAt: string;
  rarity: 'common' | 'rare' | 'epic' | 'legendary';
}

export interface ChallengeTemplate {
  id: string;
  type: ChallengeType;
  name: string;
  description: string;
  difficulty: ChallengeDifficulty;
  icon: string;
  baseReward: ChallengeReward;
  requirement?: ChallengeRequirement;
  weight: number;
  isWeekendOnly?: boolean;
  isCommunityChallenge?: boolean;
}
