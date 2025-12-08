export interface DuelPlayer {
  id: string;
  name: string;
  avatar: string;
  level: number;
  rating: number;
}

export interface DuelQuestion {
  id: string;
  question: string;
  options: string[];
  correctAnswer: number;
  category: 'fundamentals' | 'trading' | 'defi' | 'security';
  difficulty: 'beginner' | 'intermediate' | 'advanced';
  timeLimit: number;
}

export interface DuelAnswer {
  questionId: string;
  answer: number;
  timeToAnswer: number;
  correct: boolean;
}

export interface DuelResult {
  winner: string | null;
  myScore: number;
  opponentScore: number;
  myAnswers: DuelAnswer[];
  opponentAnswers: DuelAnswer[];
  reward: {
    xp: number;
    coins: number;
    trophies: number;
  };
}

export interface DuelState {
  id: string;
  opponent: DuelPlayer;
  questions: DuelQuestion[];
  currentQuestionIndex: number;
  myAnswers: DuelAnswer[];
  opponentAnswers: DuelAnswer[];
  timeRemaining: number;
  status: 'waiting' | 'in_progress' | 'completed';
  startedAt?: string;
  completedAt?: string;
}

export interface DuelConfig {
  duration: number;
  questionCount: number;
  timePerQuestion: number;
  categories: ('fundamentals' | 'trading' | 'defi' | 'security')[];
  difficultyLevels: ('beginner' | 'intermediate' | 'advanced')[];
  rewards: {
    winner: { xp: number; coins: number; trophies: number };
    loser: { xp: number; coins: number; trophies: number };
    draw: { xp: number; coins: number; trophies: number };
  };
  betting: {
    minBet: number;
    maxBet: number;
    houseEdge: number;
  };
}
