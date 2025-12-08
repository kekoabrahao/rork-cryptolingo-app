import createContextHook from "@nkzw/create-context-hook";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { useEffect, useState, useCallback } from "react";
import {
  UserSubscription,
  SubscriptionPlan,
  FREE_TIER_LIMITS,
  PREMIUM_FEATURES,
  PaywallConfig,
} from "@/types/subscription";
import { analytics } from "@/utils/analytics";

const STORAGE_KEY = "@cryptolingo_subscription";

const createFreeSubscription = (): UserSubscription => ({
  tier: 'free',
  features: {
    unlimitedLessons: false,
    unlimitedLives: false,
    noAds: false,
    xpBoost: 1.0,
    coinBoost: 1.0,
    unlimitedDuels: false,
    offlineMode: false,
    advancedAnalytics: false,
    certificates: false,
    fullLeaderboard: false,
    unlimitedPractice: false,
    prioritySupport: false,
    exclusiveContent: false,
    customThemes: false,
    dailyLivesRefill: false,
  },
  limits: FREE_TIER_LIMITS,
});

const createPremiumSubscription = (plan: SubscriptionPlan): UserSubscription => {
  const now = new Date();

  return {
    tier: 'premium',
    plan,
    startDate: now.toISOString(),
    autoRenew: false,
    features: PREMIUM_FEATURES,
    limits: {
      unlockedLessons: 999,
      maxLives: 999,
      liveRegenerationTime: 0,
      dailyChallenges: 999,
      duelsPerDay: 999,
      friendsLimit: 999,
      showAds: false,
      xpMultiplier: PREMIUM_FEATURES.xpBoost,
      coinMultiplier: PREMIUM_FEATURES.coinBoost,
      offlineMode: true,
      advancedAnalytics: true,
      certificates: true,
      leaderboardAccess: 'full',
      practiceMode: 'unlimited',
    },
  };
};

export const [SubscriptionContext, useSubscription] = createContextHook(() => {
  const [subscription, setSubscription] = useState<UserSubscription>(createFreeSubscription());
  const [isLoading, setIsLoading] = useState(true);
  const [paywallVisible, setPaywallVisible] = useState(false);
  const [paywallConfig, setPaywallConfig] = useState<PaywallConfig>({
    title: 'Upgrade to Premium',
    subtitle: 'Unlock all features and accelerate your learning',
    trigger: 'manual',
  });
  const [dailyDuelsCount, setDailyDuelsCount] = useState(0);
  const [lastDuelDate, setLastDuelDate] = useState<string>('');

  useEffect(() => {
    const loadSubscription = async () => {
      try {
        const stored = await AsyncStorage.getItem(STORAGE_KEY);
        if (stored) {
          try {
            const parsed: UserSubscription = JSON.parse(stored);
            setSubscription(parsed);
          } catch (parseError) {
            console.error("Failed to parse subscription, resetting:", parseError);
            await AsyncStorage.removeItem(STORAGE_KEY);
            setSubscription(createFreeSubscription());
          }
        }
      } catch (error) {
        console.error("Failed to load subscription:", error);
      } finally {
        setIsLoading(false);
      }
    };
    
    loadSubscription();
  }, []);

  const saveSubscription = async (newSubscription: UserSubscription) => {
    try {
      await AsyncStorage.setItem(STORAGE_KEY, JSON.stringify(newSubscription));
      setSubscription(newSubscription);
    } catch (error) {
      console.error("Failed to save subscription:", error);
    }
  };

  const upgradeToPremium = useCallback(async (plan: SubscriptionPlan) => {
    console.log(`💎 Upgrading to ${plan} plan`);
    const premiumSubscription = createPremiumSubscription(plan);
    await saveSubscription(premiumSubscription);
    
    analytics.track('subscription_purchased', {
      plan,
      price: 9.99,
      tier: premiumSubscription.tier,
    });

    return true;
  }, []);

  const cancelSubscription = useCallback(async () => {
    console.log('💎 Cancelling subscription');
    const freeSubscription = createFreeSubscription();
    await saveSubscription(freeSubscription);
    
    analytics.track('subscription_cancelled', {
      previous_tier: subscription.tier,
      previous_plan: subscription.plan,
    });
  }, [subscription]);

  const restorePurchases = useCallback(async () => {
    console.log('💎 Restoring purchases...');
    analytics.track('restore_purchases_attempted', {});
    
    return false;
  }, []);

  const showPaywall = useCallback((config: PaywallConfig) => {
    console.log('💎 Showing paywall:', config.trigger);
    setPaywallConfig(config);
    setPaywallVisible(true);
    
    analytics.track('paywall_shown', {
      trigger: config.trigger,
    });
  }, []);

  const hidePaywall = useCallback(() => {
    setPaywallVisible(false);
    
    analytics.track('paywall_dismissed', {
      trigger: paywallConfig.trigger,
    });
  }, [paywallConfig]);

  const checkFeatureAccess = useCallback((feature: keyof typeof PREMIUM_FEATURES): boolean => {
    return subscription.features[feature] === true;
  }, [subscription]);

  const canAccessLesson = useCallback((lessonIndex: number): boolean => {
    if (subscription.tier !== 'free') return true;
    return lessonIndex < subscription.limits.unlockedLessons;
  }, [subscription]);

  const canStartDuel = useCallback((): boolean => {
    if (subscription.tier !== 'free') return true;
    
    const today = new Date().toISOString().split('T')[0];
    if (lastDuelDate !== today) {
      return true;
    }
    
    return dailyDuelsCount < subscription.limits.duelsPerDay;
  }, [subscription, dailyDuelsCount, lastDuelDate]);

  const incrementDuelCount = useCallback(() => {
    const today = new Date().toISOString().split('T')[0];
    if (lastDuelDate !== today) {
      setDailyDuelsCount(1);
      setLastDuelDate(today);
    } else {
      setDailyDuelsCount(prev => prev + 1);
    }
  }, [lastDuelDate]);

  const isPremium = subscription.tier === 'premium';
  const showAds = subscription.limits.showAds;
  const xpMultiplier = subscription.limits.xpMultiplier;
  const coinMultiplier = subscription.limits.coinMultiplier;

  return {
    subscription,
    isLoading,
    isPremium,
    showAds,
    xpMultiplier,
    coinMultiplier,
    paywallVisible,
    paywallConfig,
    upgradeToPremium,
    cancelSubscription,
    restorePurchases,
    showPaywall,
    hidePaywall,
    checkFeatureAccess,
    canAccessLesson,
    canStartDuel,
    incrementDuelCount,
    dailyDuelsCount,
  };
});
