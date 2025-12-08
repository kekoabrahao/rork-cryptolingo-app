import { DailyChallenge } from "@/types/lesson";

export interface DailyChallengeTemplate {
  id: string;
  name: string;
  description: string;
  type: DailyChallenge['type'];
  difficulty: 'easy' | 'medium' | 'hard';
  icon: string;
  requirement: NonNullable<DailyChallenge['requirement']>;
  reward: {
    xp: number;
    coins: number;
    livesBonus?: number;
  };
  weight: number;
}

export const dailyChallengeTemplates: DailyChallengeTemplate[] = [
  {
    id: "speed_demon",
    name: "Speed Demon",
    description: "Complete 5 lessons in under 15 minutes",
    type: "speed",
    difficulty: "medium",
    icon: "⚡",
    requirement: { lessons: 5, timeLimit: 900 },
    reward: { xp: 100, coins: 50 },
    weight: 10,
  },
  {
    id: "perfect_streak",
    name: "Perfect Score",
    description: "Get 100% accuracy on 3 consecutive lessons",
    type: "accuracy",
    difficulty: "hard",
    icon: "🎯",
    requirement: { perfectLessons: 3, consecutive: true },
    reward: { xp: 150, coins: 75 },
    weight: 8,
  },
  {
    id: "crypto_explorer",
    name: "Crypto Explorer",
    description: "Complete lessons from 3 different modules",
    type: "variety",
    difficulty: "easy",
    icon: "🔍",
    requirement: { differentModules: 3 },
    reward: { xp: 80, coins: 40 },
    weight: 12,
  },
  {
    id: "early_bird",
    name: "Early Bird",
    description: "Complete 2 lessons before 9 AM",
    type: "timing",
    difficulty: "medium",
    icon: "🌅",
    requirement: { lessons: 2, beforeTime: "09:00" },
    reward: { xp: 120, coins: 60 },
    weight: 7,
  },
  {
    id: "night_owl",
    name: "Night Owl",
    description: "Study after 10 PM",
    type: "timing",
    difficulty: "easy",
    icon: "🦉",
    requirement: { lessons: 1, afterTime: "22:00" },
    reward: { xp: 75, coins: 35 },
    weight: 11,
  },
  {
    id: "marathon_runner",
    name: "Marathon Runner",
    description: "Study for 30 minutes straight",
    type: "duration",
    difficulty: "hard",
    icon: "🏃‍♂️",
    requirement: { continuousTime: 1800 },
    reward: { xp: 200, coins: 100 },
    weight: 6,
  },
  {
    id: "comeback_kid",
    name: "Comeback Kid",
    description: "Return after missing yesterday",
    type: "comeback",
    difficulty: "easy",
    icon: "↩️",
    requirement: { returnAfterMiss: true },
    reward: { xp: 50, coins: 25, livesBonus: 2 },
    weight: 5,
  },
  {
    id: "lesson_spree",
    name: "Lesson Spree",
    description: "Complete 3 lessons today",
    type: "lessons",
    difficulty: "easy",
    icon: "📚",
    requirement: { lessons: 3 },
    reward: { xp: 60, coins: 30 },
    weight: 15,
  },
  {
    id: "perfect_day",
    name: "Perfect Day",
    description: "Get 100% on 2 lessons",
    type: "perfect",
    difficulty: "medium",
    icon: "💎",
    requirement: { perfectLessons: 2 },
    reward: { xp: 90, coins: 45 },
    weight: 10,
  },
  {
    id: "xp_hunter",
    name: "XP Hunter",
    description: "Earn 150 XP today",
    type: "xp",
    difficulty: "medium",
    icon: "⭐",
    requirement: {},
    reward: { xp: 100, coins: 50 },
    weight: 9,
  },
  {
    id: "quick_learner",
    name: "Quick Learner",
    description: "Complete 3 lessons in under 10 minutes",
    type: "speed",
    difficulty: "hard",
    icon: "💨",
    requirement: { lessons: 3, timeLimit: 600 },
    reward: { xp: 180, coins: 90 },
    weight: 5,
  },
  {
    id: "morning_routine",
    name: "Morning Routine",
    description: "Complete 1 lesson before 8 AM",
    type: "timing",
    difficulty: "medium",
    icon: "☀️",
    requirement: { lessons: 1, beforeTime: "08:00" },
    reward: { xp: 100, coins: 50 },
    weight: 8,
  },
];

export function selectDailyChallenge(
  userLevel: number,
  userStreak: number,
  lastActiveDate: string,
  seed?: string
): DailyChallengeTemplate {
  const today = new Date().toISOString().split("T")[0];
  const yesterday = new Date(Date.now() - 24 * 60 * 60 * 1000).toISOString().split("T")[0];
  const missedYesterday = lastActiveDate !== today && lastActiveDate !== yesterday;
  
  let availableChallenges = [...dailyChallengeTemplates];
  
  if (missedYesterday) {
    const comebackChallenge = availableChallenges.find(c => c.type === 'comeback');
    if (comebackChallenge) {
      return comebackChallenge;
    }
  }
  
  if (userLevel < 3) {
    availableChallenges = availableChallenges.filter(
      c => c.difficulty === 'easy' || c.difficulty === 'medium'
    );
  }
  
  const seedValue = seed || today;
  const hash = seedValue.split('').reduce((acc, char) => {
    return ((acc << 5) - acc) + char.charCodeAt(0);
  }, 0);
  
  const totalWeight = availableChallenges.reduce((sum, c) => sum + c.weight, 0);
  const random = Math.abs(hash) % totalWeight;
  
  let cumulativeWeight = 0;
  for (const challenge of availableChallenges) {
    cumulativeWeight += challenge.weight;
    if (random < cumulativeWeight) {
      return challenge;
    }
  }
  
  return availableChallenges[0];
}
