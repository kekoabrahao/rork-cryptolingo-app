# CryptoLingo Freemium Integration Guide 🚀

## Quick Start

The CryptoLingo app now has a fully implemented two-tier freemium model (FREE and PREMIUM at R$9.99/month).

---

## 1. Basic Setup (Already Done ✅)

The freemium system is already integrated into your app:

- ✅ Types defined in `types/subscription.ts`
- ✅ Context provider in `contexts/SubscriptionContext.tsx`
- ✅ Paywall modal in `components/PaywallModal.tsx`
- ✅ Premium feature gate in `components/PremiumFeatureGate.tsx`
- ✅ Analytics tracking in `utils/analytics.ts`

---

## 2. How to Use in Your Pages

### Example 1: Protect Lessons Beyond #15

```typescript
// app/lesson/[id].tsx
import { useSubscription } from '@/contexts/SubscriptionContext';
import { useLocalSearchParams, router } from 'expo-router';

export default function LessonPage() {
  const { id } = useLocalSearchParams();
  const { canAccessLesson, showPaywall } = useSubscription();
  const lessonIndex = parseInt(id as string);

  // Check if user can access this lesson
  useEffect(() => {
    if (!canAccessLesson(lessonIndex)) {
      showPaywall({
        title: 'Atualize para Premium',
        subtitle: 'Desbloqueie todas as 50+ lições e acelere seu aprendizado',
        trigger: 'lesson_limit',
      });
      router.back();
    }
  }, [lessonIndex]);

  return (
    <View>
      {/* Your lesson content */}
    </View>
  );
}
```

### Example 2: Limit Daily Duels to 3 (Free Users)

```typescript
// app/duel.tsx
import { useSubscription } from '@/contexts/SubscriptionContext';
import { useState } from 'react';

export default function DuelPage() {
  const { canStartDuel, incrementDuelCount, showPaywall, dailyDuelsCount } = useSubscription();

  const handleStartDuel = () => {
    // Check if user can start a duel
    if (!canStartDuel()) {
      showPaywall({
        title: 'Duelos Ilimitados com Premium',
        subtitle: 'Desafie quantos oponentes quiser e ganhe mais XP e moedas',
        trigger: 'duel_limit',
      });
      return;
    }

    // Increment duel count for free users
    incrementDuelCount();
    
    // Start the duel
    // ... your duel logic
  };

  return (
    <View>
      <Text>Duelos restantes hoje: {3 - dailyDuelsCount}</Text>
      <Button onPress={handleStartDuel} title="Iniciar Duelo" />
    </View>
  );
}
```

### Example 3: Show Ads to Free Users

```typescript
// app/(tabs)/index.tsx
import { useSubscription } from '@/contexts/SubscriptionContext';

export default function HomePage() {
  const { showAds, isPremium } = useSubscription();

  return (
    <View>
      <Text>Welcome to CryptoLingo!</Text>
      {isPremium && (
        <View style={styles.premiumBadge}>
          <Text>💎 Premium Member</Text>
        </View>
      )}
      
      {/* Show ads only to free users */}
      {showAds && (
        <View style={styles.adContainer}>
          <Text style={styles.adLabel}>Advertisement</Text>
          {/* Your ad component here */}
        </View>
      )}
      
      {/* Rest of your content */}
    </View>
  );
}
```

### Example 4: Premium Feature Gates

```tsx
// app/(tabs)/settings.tsx
import { PremiumFeatureGate } from '@/components/PremiumFeatureGate';
import { useSubscription } from '@/contexts/SubscriptionContext';

export default function SettingsPage() {
  const { checkFeatureAccess } = useSubscription();

  return (
    <ScrollView>
      <Text style={styles.title}>Configurações</Text>
      
      {/* Always visible settings */}
      <SettingItem title="Idioma" />
      <SettingItem title="Notificações" />
      
      {/* Premium-only setting with gate */}
      <PremiumFeatureGate
        feature="customThemes"
        paywallConfig={{
          title: 'Temas Personalizados',
          subtitle: 'Escolha entre 10+ temas para personalizar seu app',
          trigger: 'advanced_feature',
        }}
      >
        <ThemeSelector />
      </PremiumFeatureGate>
      
      {/* Premium-only with custom fallback */}
      <PremiumFeatureGate
        feature="offlineMode"
        paywallConfig={{
          title: 'Modo Offline',
          subtitle: 'Baixe lições e aprenda em qualquer lugar',
          trigger: 'advanced_feature',
        }}
        fallback={
          <View style={styles.lockedFeature}>
            <Text>🔒 Modo Offline - Premium</Text>
          </View>
        }
      >
        <OfflineModeSettings />
      </PremiumFeatureGate>
      
      {/* Conditional rendering without gate */}
      {checkFeatureAccess('certificates') && (
        <CertificateSettings />
      )}
    </ScrollView>
  );
}
```

### Example 5: XP and Coin Multipliers

```typescript
// When calculating rewards
import { useSubscription } from '@/contexts/SubscriptionContext';

export default function LessonComplete() {
  const { xpMultiplier, coinMultiplier, isPremium } = useSubscription();
  
  const baseXP = 100;
  const baseCoins = 50;
  
  // Apply multipliers (1.0x for free, 1.5x for premium)
  const earnedXP = Math.floor(baseXP * xpMultiplier);
  const earnedCoins = Math.floor(baseCoins * coinMultiplier);

  return (
    <View>
      <Text>Lesson Complete!</Text>
      <Text>+{earnedXP} XP {isPremium && '(1.5x bonus!)'}</Text>
      <Text>+{earnedCoins} coins {isPremium && '(1.5x bonus!)'}</Text>
    </View>
  );
}
```

### Example 6: Lives System

```typescript
// In your lesson or game component
import { useSubscription } from '@/contexts/SubscriptionContext';
import { useUserProgress } from '@/contexts/UserProgressContext';

export default function LessonGame() {
  const { subscription, showPaywall } = useSubscription();
  const { lives } = useUserProgress();
  
  const handleWrongAnswer = () => {
    // Premium users have unlimited lives
    if (subscription.features.unlimitedLives) {
      // Continue playing
      return;
    }
    
    // Free users lose a life
    if (lives <= 0) {
      showPaywall({
        title: 'Vidas Esgotadas',
        subtitle: 'Premium tem vidas ilimitadas - nunca pare de aprender!',
        trigger: 'lives_depleted',
      });
      router.back();
      return;
    }
    
    // Decrease life count
    // ... your life decrease logic
  };

  return (
    <View>
      <Text>Lives: {subscription.features.unlimitedLives ? '∞' : lives}</Text>
      {/* Your game UI */}
    </View>
  );
}
```

---

## 3. Showing the Paywall Manually

```typescript
// In any component
import { useSubscription } from '@/contexts/SubscriptionContext';

export default function ProfilePage() {
  const { showPaywall, isPremium } = useSubscription();

  return (
    <View>
      {!isPremium && (
        <TouchableOpacity
          onPress={() => showPaywall({
            title: 'Desbloqueie Todo o Potencial',
            subtitle: 'Aprenda mais rápido com recursos premium',
            trigger: 'manual',
          })}
          style={styles.upgradeButton}
        >
          <Text>💎 Upgrade para Premium</Text>
        </TouchableOpacity>
      )}
    </View>
  );
}
```

---

## 4. The Paywall Modal

The paywall modal is automatically managed by the context. When you call `showPaywall()`, it:

1. Displays a beautiful full-screen modal
2. Shows premium features and pricing
3. Offers 7-day free trial
4. Tracks analytics events
5. Handles the upgrade flow

The modal will show:
- R$ 9,99/month pricing
- All 12 premium features listed
- "Começar Teste Grátis de 7 Dias" button
- Benefits explanation
- Restore purchases option

---

## 5. Available Subscription Data

```typescript
const {
  // Subscription info
  subscription,           // Full subscription object
  isLoading,             // Loading state
  isPremium,             // Boolean: true if premium
  
  // Multipliers
  xpMultiplier,          // 1.0 for free, 1.5 for premium
  coinMultiplier,        // 1.0 for free, 1.5 for premium
  showAds,               // true for free, false for premium
  
  // Paywall control
  paywallVisible,        // Boolean: paywall modal visible
  paywallConfig,         // Current paywall configuration
  showPaywall,           // Function to show paywall
  hidePaywall,           // Function to hide paywall
  
  // Feature checks
  checkFeatureAccess,    // Check if user has specific feature
  canAccessLesson,       // Check if user can access lesson by index
  canStartDuel,          // Check if user can start a duel today
  incrementDuelCount,    // Increment duel count for free users
  dailyDuelsCount,       // Current duel count today
  
  // Actions
  upgradeToPremium,      // Upgrade user to premium
  cancelSubscription,    // Cancel subscription (revert to free)
  restorePurchases,      // Restore previous purchases
} = useSubscription();
```

---

## 6. Testing

### Test Premium Features:

1. Open the app
2. Navigate to any page with "Upgrade to Premium" button
3. Tap the button
4. In the paywall, tap "Começar Teste Grátis de 7 Dias"
5. You're now premium! Test all features:
   - All lessons unlocked
   - Unlimited lives
   - No ads
   - 1.5x XP and coins
   - Unlimited duels
   - All premium features accessible

### Test Free Tier:

1. Go to Settings
2. Tap "Gerenciar Assinatura"
3. Tap "Cancelar Assinatura"
4. You're back to free tier
5. Test limitations:
   - Can only access first 15 lessons
   - Limited to 5 lives
   - Ads displayed
   - 3 duels per day
   - Premium features locked

---

## 7. Analytics Events

All freemium interactions are tracked automatically:

```typescript
// Tracked events:
- paywall_shown              // When paywall appears
- paywall_dismissed          // When user closes paywall
- paywall_converted          // When user upgrades
- premium_feature_attempted  // When free user tries premium feature
- subscription_purchased     // When purchase completes
- subscription_cancelled     // When user cancels
- restore_purchases_clicked  // When user taps restore
```

View in console:
```
📊 [Analytics] paywall_shown: { trigger: 'lesson_limit', ... }
📊 [Analytics] paywall_converted: { plan: 'monthly', ... }
```

---

## 8. Customization

### Change Pricing:

Edit `types/subscription.ts`:
```typescript
export const SUBSCRIPTION_PRICING: SubscriptionPricing[] = [
  {
    id: 'monthly',
    plan: 'monthly',
    priceMonthly: 14.99,  // Change price here
    priceFull: 14.99,
    currency: 'BRL',
    // ... rest of config
  },
];
```

### Change Free Tier Limits:

Edit `types/subscription.ts`:
```typescript
export const FREE_TIER_LIMITS: FreemiumLimits = {
  unlockedLessons: 20,        // Change to 20 free lessons
  maxLives: 3,                // Change to 3 lives
  liveRegenerationTime: 2 * 60 * 60, // Change to 2 hours
  dailyChallenges: 2,         // Change to 2 challenges
  duelsPerDay: 5,             // Change to 5 duels
  // ... etc
};
```

### Change Premium Features:

Edit `types/subscription.ts`:
```typescript
export const PREMIUM_FEATURES: PremiumFeatures = {
  unlimitedLessons: true,
  unlimitedLives: true,
  xpBoost: 2.0,              // Change to 2x boost
  coinBoost: 2.0,            // Change to 2x boost
  // ... etc
};
```

---

## 9. Real Payment Integration (Production)

For production, you'll need to integrate with a payment provider:

### Option 1: Expo In-App Purchases (Recommended)
```bash
npx expo install expo-in-app-purchases
```

Then update `contexts/SubscriptionContext.tsx` to use real purchases.

### Option 2: Revenue Cat (Easiest)
```bash
npm install react-native-purchases
```

Revenue Cat handles all subscription logic, receipt validation, and cross-platform sync.

### Option 3: Stripe (Web-based)
Best for web apps or hybrid payment flows.

---

## 10. Best Practices

✅ **Do:**
- Show value before asking for payment
- Use paywalls at natural friction points
- Make free tier valuable enough to retain users
- Track conversion metrics and optimize
- A/B test paywall copy and pricing
- Offer trials to increase conversions

❌ **Don't:**
- Show paywall immediately on app open
- Make free tier too limited (frustrate users)
- Use aggressive upselling tactics
- Hide pricing or make it confusing
- Lock core functionality behind paywall

---

## Support

For questions or issues:
1. Check `FREEMIUM_MODEL.md` for detailed documentation
2. Review code examples above
3. Test in the app to see it in action
4. Check console logs for analytics events

---

**Last Updated:** December 2, 2025
