# 📊 LZ Chat Analytics Events Guide

## 📋 Overview

Complete analytics tracking for the **Chat with Mentor LZ** feature to measure engagement, conversions, and user behavior.

---

## 🎯 Event Categories

### **1. Screen & Navigation Events**
Track when users access LZ Chat

### **2. Message Events**
Track message sending and receiving

### **3. Limit Events**
Track when free users hit daily limits

### **4. Conversion Events**
Track upgrade prompts and conversions

### **5. Error Events**
Track failures and issues

### **6. Engagement Events**
Track overall conversation quality

---

## 📡 All Events

### **1. lz_chat_opened**

**Trigger:** User opens LZ Chat screen

**Properties:**
```typescript
{
  source: 'tab' | 'fab' | 'banner' | 'upgrade_modal',
  is_premium: boolean,
  hour_of_day: number,      // 0-23
  day_of_week: number,      // 0-6 (Sunday = 0)
}
```

**Usage:**
```typescript
analytics.trackLZChatOpened('tab', isPremium);
```

**Why Track:** Understand how users discover the feature

---

### **2. lz_chat_tab_viewed**

**Trigger:** User views LZ Chat tab

**Properties:**
```typescript
{
  is_premium: boolean,
  questions_remaining: number,
}
```

**Usage:**
```typescript
analytics.trackLZChatTabViewed(isPremium, questionsRemaining);
```

**Why Track:** Measure tab engagement vs actual usage

---

### **3. lz_chat_message_sent** (lz_message_sent)

**Trigger:** User sends a message to LZ

**Properties:**
```typescript
{
  is_premium: boolean,
  message_length: number,
  questions_remaining: number,
  conversation_length: number,  // Total messages before this
  time_of_day: number,
}
```

**Usage:**
```typescript
analytics.trackLZMessageSent(
  isPremium,
  userMessage.length,
  questionsRemaining,
  messages.length
);
```

**Why Track:** Core engagement metric - how many questions users ask

---

### **4. lz_chat_message_received**

**Trigger:** LZ successfully responds to user

**Properties:**
```typescript
{
  is_premium: boolean,
  response_length: number,
  response_time_ms: number,    // How long AI took
  questions_remaining: number,
}
```

**Usage:**
```typescript
const startTime = Date.now();
// ... send message ...
const responseTime = Date.now() - startTime;

analytics.trackLZMessageReceived(
  isPremium,
  response.message.length,
  responseTime,
  questionsRemaining
);
```

**Why Track:** Measure AI performance and quality

---

### **5. lz_chat_daily_limit_reached** (lz_daily_limit_reached)

**Trigger:** Free user hits 2 questions/day limit

**Properties:**
```typescript
{
  questions_asked: number,      // Should be 2
  source: 'chat_screen' | 'message_send',
  hour_of_day: number,
  day_of_week: number,
}
```

**Usage:**
```typescript
analytics.trackLZDailyLimitReached(2, 'message_send');
```

**Why Track:** **Critical conversion trigger** - users most likely to upgrade

---

### **6. lz_chat_upgrade_prompted** (lz_upgrade_prompted)

**Trigger:** Upgrade modal shown to user

**Properties:**
```typescript
{
  trigger: 'limit_reached' | 'feature_click' | 'banner_tap',
  questions_asked: number,
  conversation_length: number,
  hour_of_day: number,
}
```

**Usage:**
```typescript
analytics.trackLZUpgradePrompted(
  'limit_reached',
  2,
  messages.length
);
```

**Why Track:** Measure conversion funnel entry point

---

### **7. lz_chat_upgrade_modal_opened**

**Trigger:** User opens upgrade modal from chat

**Properties:**
```typescript
{
  source: 'limit_screen' | 'banner' | 'settings',
}
```

**Usage:**
```typescript
analytics.trackLZUpgradeModalOpened('limit_screen');
```

**Why Track:** Track which upgrade triggers work best

---

### **8. lz_chat_message_error**

**Trigger:** Message sending fails

**Properties:**
```typescript
{
  error_type: 'network' | 'api' | 'rate_limit' | 'unknown',
  error_message: string,
  is_premium: boolean,
}
```

**Usage:**
```typescript
analytics.trackLZMessageError(
  'network',
  error.message,
  isPremium
);
```

**Why Track:** Identify technical issues

---

### **9. lz_chat_history_cleared**

**Trigger:** User clears chat history

**Properties:**
```typescript
{
  message_count: number,
  was_manual: boolean,    // true = user action, false = auto
}
```

**Usage:**
```typescript
analytics.trackLZHistoryCleared(messages.length, true);
```

**Why Track:** Understand cleanup behavior

---

### **10. lz_chat_conversation_updated**

**Trigger:** After each successful message exchange

**Properties:**
```typescript
{
  message_count: number,
  avg_message_length: number,
  session_duration_ms: number,
  is_premium: boolean,
  engagement_score: number,    // 0-100 calculated metric
}
```

**Usage:**
```typescript
analytics.trackLZConversationMetrics(
  messages.length,
  avgLength,
  sessionDuration,
  isPremium
);
```

**Why Track:** Measure conversation quality and engagement

---

## 📊 Key Metrics to Monitor

### **1. Engagement Metrics**

| Metric | Calculation | Target |
|--------|-------------|--------|
| **Daily Active Users** | Unique `lz_chat_opened` | 100+ |
| **Messages per User** | Avg `lz_message_sent` / user | 3-5 |
| **Session Duration** | Avg time in chat | 5+ min |
| **Return Rate** | Users with 2+ sessions | 40%+ |

---

### **2. Conversion Metrics** 💰

| Metric | Calculation | Target |
|--------|-------------|--------|
| **Limit Hit Rate** | `limit_reached` / free users | 60%+ |
| **Upgrade Prompt Rate** | `upgrade_prompted` / `limit_reached` | 90%+ |
| **Modal Open Rate** | `modal_opened` / `upgrade_prompted` | 30%+ |
| **Conversion Rate** | Premium purchases / `modal_opened` | 10%+ |

**Formula:**
```
Conversion Rate = (Premium Purchases / limit_reached events) * 100
```

---

### **3. Quality Metrics**

| Metric | Calculation | Target |
|--------|-------------|--------|
| **Response Time** | Avg `response_time_ms` | <4000ms |
| **Error Rate** | `message_error` / `message_sent` | <1% |
| **Message Quality** | Avg `response_length` | 300-800 |
| **Engagement Score** | Calculated from activity | 60+ |

---

### **4. Premium vs Free Comparison**

```sql
-- Messages per user
SELECT 
  is_premium,
  AVG(message_count) as avg_messages,
  AVG(session_duration_ms) / 60000 as avg_session_min
FROM lz_chat_conversation_updated
GROUP BY is_premium;
```

**Expected Results:**
- Free users: 2-3 messages, 3-5 min sessions
- Premium users: 5-10 messages, 10-20 min sessions

---

## 🔄 Conversion Funnel

```
┌──────────────────────────────────────────────┐
│ 1. lz_chat_opened (100%)                     │
│    Source: tab/fab/banner                    │
└──────────────────────────────────────────────┘
                    ↓
┌──────────────────────────────────────────────┐
│ 2. lz_message_sent (80%)                     │
│    First message engagement                   │
└──────────────────────────────────────────────┘
                    ↓
┌──────────────────────────────────────────────┐
│ 3. lz_daily_limit_reached (60% of free)      │
│    **Critical conversion trigger**           │
└──────────────────────────────────────────────┘
                    ↓
┌──────────────────────────────────────────────┐
│ 4. lz_upgrade_prompted (90% of limits)       │
│    Modal shown to user                       │
└──────────────────────────────────────────────┘
                    ↓
┌──────────────────────────────────────────────┐
│ 5. lz_upgrade_modal_opened (30%)             │
│    User clicked to see details               │
└──────────────────────────────────────────────┘
                    ↓
┌──────────────────────────────────────────────┐
│ 6. purchase_completed (10% of modal opens)   │
│    🎉 Conversion!                            │
└──────────────────────────────────────────────┘
```

**Key Drop-off Points:**
1. Open → Send message (20% drop)
2. Limit reached → Modal open (70% drop) ← **Optimize this!**
3. Modal open → Purchase (90% drop)

---

## 📈 Dashboard Queries

### **Query 1: Daily Engagement**

```sql
SELECT 
  DATE(timestamp) as date,
  COUNT(DISTINCT user_id) as daily_active_users,
  COUNT(*) as total_messages,
  AVG(message_length) as avg_message_length
FROM analytics_events
WHERE event = 'lz_message_sent'
GROUP BY DATE(timestamp)
ORDER BY date DESC;
```

---

### **Query 2: Conversion Funnel**

```sql
WITH funnel AS (
  SELECT user_id,
    MAX(CASE WHEN event = 'lz_chat_opened' THEN 1 ELSE 0 END) as opened,
    MAX(CASE WHEN event = 'lz_message_sent' THEN 1 ELSE 0 END) as sent_message,
    MAX(CASE WHEN event = 'lz_daily_limit_reached' THEN 1 ELSE 0 END) as hit_limit,
    MAX(CASE WHEN event = 'lz_upgrade_prompted' THEN 1 ELSE 0 END) as saw_prompt,
    MAX(CASE WHEN event = 'lz_upgrade_modal_opened' THEN 1 ELSE 0 END) as opened_modal
  FROM analytics_events
  WHERE DATE(timestamp) >= CURRENT_DATE - INTERVAL '30 days'
  GROUP BY user_id
)
SELECT 
  SUM(opened) as total_opened,
  SUM(sent_message) as total_sent,
  SUM(hit_limit) as total_hit_limit,
  SUM(saw_prompt) as total_saw_prompt,
  SUM(opened_modal) as total_opened_modal,
  ROUND(100.0 * SUM(sent_message) / SUM(opened), 2) as pct_sent,
  ROUND(100.0 * SUM(hit_limit) / SUM(sent_message), 2) as pct_hit_limit,
  ROUND(100.0 * SUM(opened_modal) / SUM(saw_prompt), 2) as pct_opened_modal
FROM funnel;
```

---

### **Query 3: Premium vs Free Comparison**

```sql
SELECT 
  is_premium,
  COUNT(*) as total_messages,
  AVG(message_length) as avg_length,
  AVG(response_time_ms) as avg_response_time,
  COUNT(DISTINCT user_id) as unique_users
FROM analytics_events
WHERE event = 'lz_message_sent'
  AND timestamp >= CURRENT_DATE - INTERVAL '7 days'
GROUP BY is_premium;
```

---

### **Query 4: Error Analysis**

```sql
SELECT 
  error_type,
  COUNT(*) as error_count,
  COUNT(DISTINCT user_id) as affected_users,
  AVG(CASE WHEN is_premium THEN 1 ELSE 0 END) as pct_premium
FROM analytics_events
WHERE event = 'lz_message_error'
  AND timestamp >= CURRENT_DATE - INTERVAL '24 hours'
GROUP BY error_type
ORDER BY error_count DESC;
```

---

## 🎯 Optimization Strategies

### **1. Increase Message Engagement**

**Current:** 80% send first message  
**Target:** 90%

**Tactics:**
- Add example questions in empty state
- Auto-suggest first question
- Show "Start conversation" tooltip

**Track:**
```typescript
// Before
const openedCount = events.filter(e => e.event === 'lz_chat_opened').length;
const sentCount = events.filter(e => e.event === 'lz_message_sent').length;
const engagementRate = (sentCount / openedCount) * 100;
```

---

### **2. Improve Limit → Modal Conversion**

**Current:** 30% open modal after limit  
**Target:** 50%

**Tactics:**
- Better alert copy
- Show feature comparison inline
- Add "Just R$ 19.99" in alert
- A/B test urgency ("Today only!")

**Track:**
```typescript
const limitReached = events.filter(e => e.event === 'lz_daily_limit_reached').length;
const modalOpened = events.filter(e => e.event === 'lz_upgrade_modal_opened').length;
const conversionRate = (modalOpened / limitReached) * 100;
```

---

### **3. Reduce Response Time**

**Current:** ~3000ms average  
**Target:** <2500ms

**Tactics:**
- Optimize OpenAI prompt
- Use GPT-4o-mini (faster + cheaper)
- Cache common responses
- Show "typing..." immediately

**Track:**
```typescript
const responseTimes = events
  .filter(e => e.event === 'lz_message_received')
  .map(e => e.properties.response_time_ms);
const avgResponseTime = responseTimes.reduce((a, b) => a + b) / responseTimes.length;
```

---

## 🧪 A/B Test Ideas

### **Test 1: Alert Copy**

**Control:**
> "Você atingiu o limite de 2 perguntas diárias."

**Variant A:**
> "🔥 Você está pegando fogo! Desbloqueie perguntas ilimitadas por apenas R$ 19,99"

**Variant B:**
> "2/2 perguntas usadas. +1000 usuários já upgradaram para ilimitado!"

**Track:** `lz_upgrade_modal_opened` rate

---

### **Test 2: Empty State**

**Control:** Plain text instructions

**Variant A:** 3 example questions as buttons

**Variant B:** Video preview of LZ answering

**Track:** `lz_message_sent` rate

---

### **Test 3: Limit Timing**

**Control:** Show limit on 3rd attempt

**Variant A:** Show "1 question left" warning

**Variant B:** Show countdown timer

**Track:** `lz_upgrade_prompted` → purchase rate

---

## 📱 Implementation Checklist

- [x] Add analytics events to types
- [x] Implement tracking methods
- [x] Integrate in LZ Chat screen
- [x] Track screen opens
- [x] Track message sends
- [x] Track message receives
- [x] Track limit reached
- [x] Track upgrade prompts
- [x] Track errors
- [x] Track history clears
- [ ] Set up analytics dashboard
- [ ] Create SQL queries
- [ ] Set up alerts for errors
- [ ] Monitor conversion funnel
- [ ] A/B test variations

---

## 🚨 Alerts to Set Up

### **1. High Error Rate**

```sql
SELECT COUNT(*) as error_count
FROM analytics_events
WHERE event = 'lz_message_error'
  AND timestamp >= NOW() - INTERVAL '1 hour';

-- Alert if: error_count > 10
```

---

### **2. Low Conversion Rate**

```sql
SELECT 
  (COUNT(CASE WHEN event = 'purchase_completed' THEN 1 END) * 100.0 / 
   COUNT(CASE WHEN event = 'lz_daily_limit_reached' THEN 1 END)) as conversion_rate
FROM analytics_events
WHERE timestamp >= CURRENT_DATE;

-- Alert if: conversion_rate < 3%
```

---

### **3. Slow Response Times**

```sql
SELECT AVG(properties->>'response_time_ms')::numeric as avg_response_time
FROM analytics_events
WHERE event = 'lz_message_received'
  AND timestamp >= NOW() - INTERVAL '1 hour';

-- Alert if: avg_response_time > 5000
```

---

## 📚 Related Documentation

- `LZ_CHAT_BACKEND_IMPLEMENTATION.md` - Backend guide
- `LZ_CHAT_FEATURE_HIGHLIGHT_GUIDE.md` - UI component
- `LIFETIME_PREMIUM_SYSTEM.md` - Premium system
- `utils/analytics.ts` - Analytics implementation

---

**🎯 Track everything. Optimize relentlessly. Convert more users.**

---

*Created: December 2024*  
*Version: 1.0.0*  
*Author: Claude (GenSpark AI)*
