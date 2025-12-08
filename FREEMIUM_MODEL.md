# CryptoLingo Freemium Model 💎

## Overview
CryptoLingo implements a streamlined **two-tier freemium monetization model** that maximizes conversion while maintaining an excellent free user experience.

## Tiers

### 🆓 Free Tier - "CryptoLingo Básico"

**Price:** R$ 0,00/month

**Content Access:**
- ✅ First 15 lessons (covering fundamentals and crypto types modules)
- ✅ Basic crypto terminology
- ✅ Foundation knowledge
- ❌ Advanced modules locked (trading, security, advanced strategies)
- ❌ Practice mode limited to completed lessons only

**Lives/Hearts System:**
- ✅ 5 maximum lives
- ✅ 4-hour regeneration time per life
- ❌ No daily refill at midnight
- ✅ Can purchase lives with LingoCoins

**Gamification:**
- ✅ 1 daily challenge per day
- ✅ 3 duels per day (limited)
- ✅ Normal XP rate (1.0x)
- ✅ Normal coins rate (1.0x)
- ✅ Common mystery boxes only
- ✅ Basic leaderboard access (top 100)

**Social Features:**
- ✅ Maximum 10 friends
- ✅ Join 1 study group
- ❌ Cannot create groups
- ❌ No coin betting in duels

**Features:**
- ❌ No offline mode (must be online)
- ✅ Basic statistics
- ❌ No completion certificates
- ✅ 5 basic avatars
- ✅ Default theme only
- ❌ No AI tutor
- ❌ No trading simulator
- ✅ 1 news quiz per week
- ❌ Standard support

**Ads:**
- ⚠️ Ads displayed after every 2 lessons
- ⚠️ Banner and interstitial ads
- ✅ Can watch rewarded ads for bonuses

---

### 💎 Premium Tier - "CryptoLingo Premium"

**Price:** R$ 9,99/month (with 7-day free trial)

**All Free Features PLUS:**

**Content Access:**
- ✨ All lessons unlocked (50+ lessons)
- ✨ All modules accessible (fundamentals, crypto types, trading, security, advanced)
- ✨ Exclusive advanced content
- ✨ Unlimited practice mode

**Lives/Hearts System:**
- ❤️ Unlimited lives
- ❤️ No waiting time
- ❤️ Daily automatic refill
- ❤️ Never lose progress due to mistakes

**Gamification:**
- ⚡ 1.5x XP multiplier (learn faster)
- ⚡ 1.5x coins multiplier (earn more)
- ⚔️ Unlimited duels per day
- ⚔️ Coin betting enabled in duels
- 🎁 Access to rare and epic mystery boxes
- 🏆 Full leaderboard access with detailed stats

**Social Features:**
- 👥 Unlimited friends
- 👥 Join unlimited study groups
- 👥 Create and manage your own groups
- 👥 Premium-only tournaments and events

**Premium Features:**
- 🚫 **Ad-free experience** - zero interruptions
- 🎓 **Completion certificates** - showcase your achievements
- 📊 **Advanced analytics** - detailed progress tracking and insights
- 🌍 **Offline mode** - download lessons and learn anywhere
- 🎨 **Custom themes** - personalize your learning experience
- 🤖 **AI tutor** - get personalized help and explanations
- 📈 **Paper trading simulator** - practice crypto trading risk-free
- 📰 **Unlimited news quizzes** - stay updated with crypto news
- ⭐ **Priority support** - get help faster
- 🔔 **Advanced notifications** - optimal learning time suggestions

---

## Strategic Paywall Placement

### When to Show Paywall

1. **Lesson Limit** (`lesson_limit`)
   - Trigger: User tries to access lesson #16 or beyond
   - Message: "Desbloqueie todas as lições com Premium"

2. **Lives Depleted** (`lives_depleted`)
   - Trigger: User has 0 lives and tries to start a lesson
   - Message: "Vidas ilimitadas com Premium - nunca pare de aprender"

3. **Daily Challenge Limit** (`daily_challenge`)
   - Trigger: User completes daily challenge and wants more
   - Message: "Desbloqueie desafios ilimitados com Premium"

4. **Duel Limit** (`duel_limit`)
   - Trigger: User exhausts 3 daily duels
   - Message: "Duelos ilimitados com Premium - desafie quantos quiser"

5. **Advanced Features** (`advanced_feature`)
   - Trigger: User tries to access AI tutor, certificates, offline mode, etc.
   - Message: "Este recurso premium acelera seu aprendizado"

6. **Manual** (`manual`)
   - Trigger: User clicks "Upgrade to Premium" button
   - Message: "Desbloquei todo o potencial do CryptoLingo"

### Conversion Strategy

**Value-Based Restrictions:**
- Free tier provides enough value to hook users (15 lessons, basic gamification)
- Premium removes all friction points (lives, ads, content limits)
- Clear upgrade path at natural decision points

**7-Day Free Trial:**
- Let users experience full premium benefits
- No commitment required
- Easy cancellation
- Increases conversion rate by 3-4x

**Single Price Point:**
- No choice paralysis
- R$ 9,99/month is affordable and competitive
- Simple decision: upgrade or stay free

---

## Implementation

### Usage in Code

**Check if user can access a lesson:**
```typescript
import { useSubscription } from '@/contexts/SubscriptionContext';

const { canAccessLesson, showPaywall } = useSubscription();

// Check access
if (!canAccessLesson(lessonIndex)) {
  showPaywall({
    title: 'Atualize para Premium',
    subtitle: 'Desbloqueie todas as lições e aprenda sem limites',
    trigger: 'lesson_limit',
  });
  return;
}
```

**Check if user can start a duel:**
```typescript
import { useSubscription } from '@/contexts/SubscriptionContext';

const { canStartDuel, showPaywall, incrementDuelCount } = useSubscription();

// Check if can duel
if (!canStartDuel()) {
  showPaywall({
    title: 'Duelos Ilimitados',
    subtitle: 'Desafie quantos oponentes quiser com Premium',
    trigger: 'duel_limit',
  });
  return;
}

// Start duel and increment counter
incrementDuelCount();
```

**Check feature access:**
```typescript
import { useSubscription } from '@/contexts/SubscriptionContext';

const { checkFeatureAccess, showPaywall } = useSubscription();

// Check specific feature
if (!checkFeatureAccess('offlineMode')) {
  showPaywall({
    title: 'Modo Offline',
    subtitle: 'Baixe lições e aprenda em qualquer lugar',
    trigger: 'advanced_feature',
  });
  return;
}
```

**Wrap premium content with gate:**
```tsx
import { PremiumFeatureGate } from '@/components/PremiumFeatureGate';

<PremiumFeatureGate
  feature="aiTutor"
  paywallConfig={{
    title: 'Tutor com IA',
    subtitle: 'Obtenha ajuda personalizada com nosso tutor inteligente',
    trigger: 'advanced_feature',
  }}
>
  <AITutorComponent />
</PremiumFeatureGate>
```

**Check subscription status:**
```typescript
import { useSubscription } from '@/contexts/SubscriptionContext';

const { isPremium, subscription, xpMultiplier, coinMultiplier, showAds } = useSubscription();

// Use in your components
const xpEarned = baseXP * xpMultiplier; // 1.0 for free, 1.5 for premium
const coinsEarned = baseCoins * coinMultiplier;

{showAds && <AdBanner />}
```

---

## Analytics & Tracking

All premium-related events are tracked:

```typescript
import { analytics } from '@/utils/analytics';

// Tracked automatically:
// - paywall_shown (with trigger type)
// - paywall_dismissed
// - paywall_converted (successful upgrade)
// - premium_feature_attempted
// - subscription_purchased
// - subscription_cancelled
// - restore_purchases_clicked
```

View analytics in console:
```
📊 [Analytics] paywall_shown: {
  trigger: 'lesson_limit',
  session_id: 'session_xxx',
  timestamp: '2025-12-02T...'
}
```

---

## Success Metrics (Target KPIs)

### Conversion Metrics
- **Free-to-Premium Conversion Rate:** 5-10% (industry standard: 2-5%)
- **7-Day Trial Activation Rate:** 30%
- **Trial-to-Paid Conversion:** 40-50%
- **Monthly Churn Rate:** <5%

### Engagement Metrics (Premium Users)
- **Daily Active Users:** 60%+
- **Weekly Lesson Completion:** 10+ lessons
- **Session Length:** 2x longer than free users
- **Retention (Day 30):** 70%+

### Revenue Metrics
- **ARPU (Average Revenue Per User):** R$ 0.50-1.00
- **LTV (Lifetime Value):** R$ 60-120 (6-12 months)
- **CAC Payback Period:** 2-3 months

---

## Testing Premium Features

To test premium features in development:

1. Open the app
2. Go to Profile/Settings tab
3. Tap "Upgrade to Premium"
4. Select the premium plan (simulated purchase in dev)
5. All premium features are now unlocked

To revert to free tier:
1. Open Profile/Settings
2. Tap "Manage Subscription"
3. Tap "Cancel Subscription"

---

## Future Enhancements

### Phase 2 (Optional)
- Annual plan with discount (R$ 79.99/year = R$ 6.66/month, save 33%)
- Family plan (up to 5 users for R$ 24.99/month)
- Student discount (50% off with valid student ID)

### Phase 3 (Advanced)
- Referral program (free month for each referral that converts)
- Gift subscriptions
- Corporate/Enterprise plans for businesses
- Crypto payment option (pay with BTC, ETH, etc.)

### Phase 4 (Web3 Integration)
- NFT badges for achievements (tradeable)
- Token rewards for learning milestones
- DAO governance for content voting
- Blockchain certificates

---

## Notes

- All pricing is in Brazilian Reais (BRL)
- Subscription auto-renews monthly until cancelled
- No cancellation fees
- Cancel anytime from settings
- 7-day free trial for first-time subscribers
- Restore purchases available for users who reinstall

---

**Last Updated:** December 2, 2025
**Version:** 1.0.0
