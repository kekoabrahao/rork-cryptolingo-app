export function safeNumber(value: unknown, fallback: number = 0): number {
  if (value === null || value === undefined) {
    return fallback;
  }

  const num = typeof value === 'number' ? value : Number(value);
  
  if (isNaN(num) || !isFinite(num)) {
    console.warn(`⚠️ Invalid numeric value detected:`, value);
    return fallback;
  }

  return num;
}

export function safeInteger(value: unknown, fallback: number = 0): number {
  const num = safeNumber(value, fallback);
  return Math.floor(num);
}

export function safePercentage(value: number, max: number, fallback: number = 0): number {
  const numerator = safeNumber(value, 0);
  const denominator = safeNumber(max, 1);
  
  if (denominator === 0) {
    return fallback;
  }

  const percentage = (numerator / denominator) * 100;
  
  if (isNaN(percentage) || !isFinite(percentage)) {
    return fallback;
  }

  return Math.min(100, Math.max(0, percentage));
}

export function formatNumber(value: unknown): string {
  const num = safeNumber(value, 0);
  return num.toLocaleString();
}

export function validateUserProgress(progress: any): boolean {
  const requiredFields = [
    'level', 
    'totalXP', 
    'currentLevelXP', 
    'nextLevelXP', 
    'streak', 
    'lives', 
    'coins',
    'perfectLessons',
    'totalLessonsCompleted',
    'currentCombo',
    'bestCombo',
    'xpMultiplier'
  ];

  for (const field of requiredFields) {
    const value = progress[field];
    if (typeof value !== 'number' || isNaN(value) || !isFinite(value)) {
      console.error(`❌ Invalid value for field "${field}":`, value);
      return false;
    }
  }

  return true;
}

export function sanitizeUserProgress(progress: any): any {
  return {
    ...progress,
    level: safeInteger(progress.level, 1),
    totalXP: safeInteger(progress.totalXP, 0),
    currentLevelXP: safeInteger(progress.currentLevelXP, 0),
    nextLevelXP: safeInteger(progress.nextLevelXP, 100),
    streak: safeInteger(progress.streak, 0),
    lives: safeInteger(progress.lives, 5),
    coins: safeInteger(progress.coins, 0),
    perfectLessons: safeInteger(progress.perfectLessons, 0),
    totalLessonsCompleted: safeInteger(progress.totalLessonsCompleted, 0),
    currentCombo: safeInteger(progress.currentCombo, 0),
    bestCombo: safeInteger(progress.bestCombo, 0),
    xpMultiplier: safeNumber(progress.xpMultiplier, 1),
  };
}
