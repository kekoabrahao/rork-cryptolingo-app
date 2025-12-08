import { DuelConfig } from '@/types/duel';

export const DUEL_CONFIG: DuelConfig = {
  duration: 180,
  questionCount: 10,
  timePerQuestion: 15,
  categories: ['fundamentals', 'trading', 'defi', 'security'],
  difficultyLevels: ['beginner', 'intermediate', 'advanced'],
  
  rewards: {
    winner: { xp: 100, coins: 75, trophies: 3 },
    loser: { xp: 25, coins: 15, trophies: 0 },
    draw: { xp: 50, coins: 30, trophies: 1 },
  },
  
  betting: {
    minBet: 10,
    maxBet: 500,
    houseEdge: 0.05,
  },
};
