export type SubscriptionTier = 'free' | 'premium';

export type SubscriptionPlan = 'lifetime';

export interface FreemiumLimits {
  unlockedLessons: number;
  maxLives: number;
  liveRegenerationTime: number;
  dailyChallenges: number;
  duelsPerDay: number;
  friendsLimit: number;
  showAds: boolean;
  xpMultiplier: number;
  coinMultiplier: number;
  offlineMode: boolean;
  advancedAnalytics: boolean;
  certificates: boolean;
  leaderboardAccess: 'basic' | 'full';
  practiceMode: 'limited' | 'unlimited';
}

export interface PremiumFeatures {
  unlimitedLessons: boolean;
  unlimitedLives: boolean;
  noAds: boolean;
  xpBoost: number;
  coinBoost: number;
  unlimitedDuels: boolean;
  offlineMode: boolean;
  advancedAnalytics: boolean;
  certificates: boolean;
  fullLeaderboard: boolean;
  unlimitedPractice: boolean;
  prioritySupport: boolean;
  exclusiveContent: boolean;
  customThemes: boolean;
  dailyLivesRefill: boolean;
}

export interface SubscriptionPricing {
  id: string;
  plan: SubscriptionPlan;
  priceMonthly: number;
  priceFull: number;
  currency: string;
  savings?: number;
  popular?: boolean;
  features: string[];
  badge?: string;
}

export interface UserSubscription {
  tier: SubscriptionTier;
  plan?: SubscriptionPlan;
  startDate?: string;
  endDate?: string;
  autoRenew?: boolean;
  features: PremiumFeatures;
  limits: FreemiumLimits;
}

export interface PaywallConfig {
  title: string;
  subtitle: string;
  trigger: 'lesson_limit' | 'lives_depleted' | 'daily_challenge' | 'duel_limit' | 'manual' | 'advanced_feature';
  context?: Record<string, unknown>;
}

export const FREE_TIER_LIMITS: FreemiumLimits = {
  unlockedLessons: 15,
  maxLives: 5,
  liveRegenerationTime: 4 * 60 * 60,
  dailyChallenges: 1,
  duelsPerDay: 3,
  friendsLimit: 10,
  showAds: true,
  xpMultiplier: 1.0,
  coinMultiplier: 1.0,
  offlineMode: false,
  advancedAnalytics: false,
  certificates: false,
  leaderboardAccess: 'basic',
  practiceMode: 'limited',
};

export const PREMIUM_FEATURES: PremiumFeatures = {
  unlimitedLessons: true,
  unlimitedLives: true,
  noAds: true,
  xpBoost: 1.5,
  coinBoost: 1.5,
  unlimitedDuels: true,
  offlineMode: true,
  advancedAnalytics: true,
  certificates: true,
  fullLeaderboard: true,
  unlimitedPractice: true,
  prioritySupport: true,
  exclusiveContent: true,
  customThemes: true,
  dailyLivesRefill: true,
};

export const SUBSCRIPTION_PRICING: SubscriptionPricing[] = [
  {
    id: 'lifetime',
    plan: 'lifetime',
    priceMonthly: 0,
    priceFull: 9.99,
    currency: 'BRL',
    popular: true,
    badge: '💎 PREMIUM',
    features: [
      '✨ Todas as lições desbloqueadas',
      '❤️ Vidas ilimitadas',
      '🚫 Sem anúncios',
      '⚡ 1.5x XP e moedas',
      '⚔️ Duelos ilimitados',
      '🎓 Certificados de conclusão',
      '📊 Estatísticas avançadas',
      '🌍 Modo offline',
      '🎨 Temas personalizados',
      '🏆 Acesso completo ao ranking',
      '🤖 Tutor com IA',
      '⭐ Suporte prioritário',
    ],
  },
];
