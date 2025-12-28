# 💬 LZ Chat Feature Highlight Component

## 📋 Overview

Visual component to showcase the **Chat with Mentor LZ** feature in a beautiful, attention-grabbing way.

---

## 🎨 Component Variants

### **1. Full Variant (Default)**

Complete feature showcase with all details:

```typescript
import { LZChatFeatureHighlight } from '@/components/LZChatFeatureHighlight';

<LZChatFeatureHighlight variant="full" />
```

**Visual Elements:**
- 🎨 Dark gradient background (#1a1a1a → #2a2a2a)
- ⭐ "NOVO" badge (gold sparkles)
- 💬 Large icon with gold gradient circle
- 📝 Title + subtitle + description
- 🎯 3 feature pills (market analysis, instant responses, education)
- 📊 Free vs Premium comparison table
- 👥 Social proof footer (+70,000 students)
- 🔸 Gold accent border (#FFD700)

**Dimensions:**
- Height: ~320px
- Full width with padding
- Rounded corners (20px)

---

### **2. Compact Variant**

Minimal inline display:

```typescript
<LZChatFeatureHighlight variant="compact" />
```

**Visual Elements:**
- 🔘 Gold icon circle (40x40px)
- 📝 Title + description (one-line each)
- 🔸 Gold border accent
- Fits in lists and settings

**Dimensions:**
- Height: ~64px
- Full width with padding
- Rounded corners (12px)

---

## 🎯 Usage Examples

### **1. In UpgradeModal** (Recommended)

Showcase feature when user hits limit:

```typescript
// components/UpgradeModal.tsx
import { LZChatFeatureHighlight } from '@/components/LZChatFeatureHighlight';

export default function UpgradeModal() {
  return (
    <Modal visible={visible}>
      <ScrollView>
        {/* ... header ... */}
        
        {/* Highlight LZ Chat */}
        <LZChatFeatureHighlight variant="full" />
        
        {/* ... other features ... */}
        {PREMIUM_FEATURES.map((feature) => (
          <FeatureRow key={feature.id} {...feature} />
        ))}
        
        {/* ... purchase button ... */}
      </ScrollView>
    </Modal>
  );
}
```

---

### **2. In Settings Screen**

Banner promoting premium:

```typescript
// app/(tabs)/settings.tsx
import { LZChatFeatureHighlight } from '@/components/LZChatFeatureHighlight';

export default function SettingsScreen() {
  const { isPremium } = usePremium();
  
  return (
    <ScrollView>
      {/* ... other settings ... */}
      
      {!isPremium && (
        <View style={styles.premiumSection}>
          <Text style={styles.sectionTitle}>Desbloqueie o Premium</Text>
          <LZChatFeatureHighlight variant="compact" />
          <TouchableOpacity onPress={showUpgradeModal}>
            <Text>Ver todos os benefícios →</Text>
          </TouchableOpacity>
        </View>
      )}
    </ScrollView>
  );
}
```

---

### **3. In LZ Chat Screen (Limit Reached)**

Show when daily limit is hit:

```typescript
// app/(tabs)/lz-chat.tsx
import { LZChatFeatureHighlight } from '@/components/LZChatFeatureHighlight';

export default function LZChatScreen() {
  const { questionsRemaining, isPremium } = useLZChat();
  
  if (questionsRemaining === 0 && !isPremium) {
    return (
      <View style={styles.limitReached}>
        <LZChatFeatureHighlight variant="full" />
        
        <TouchableOpacity 
          style={styles.upgradeButton}
          onPress={showUpgradeModal}
        >
          <Text>Desbloquear Chat Ilimitado - R$ 19,99</Text>
        </TouchableOpacity>
      </View>
    );
  }
  
  // ... normal chat UI ...
}
```

---

### **4. In Home Screen Banner**

Promotional banner:

```typescript
// app/(tabs)/index.tsx
import { LZChatFeatureHighlight } from '@/components/LZChatFeatureHighlight';

export default function HomeScreen() {
  const { isPremium } = usePremium();
  const [showLZBanner, setShowLZBanner] = useState(!isPremium);
  
  return (
    <ScrollView>
      {showLZBanner && (
        <TouchableOpacity 
          onPress={() => router.push('/lz-chat')}
          activeOpacity={0.9}
        >
          <LZChatFeatureHighlight variant="compact" />
        </TouchableOpacity>
      )}
      
      {/* ... home content ... */}
    </ScrollView>
  );
}
```

---

## 🎨 Visual Design

### **Color Palette:**

| Element | Color | Usage |
|---------|-------|-------|
| **Primary Accent** | `#FFD700` (Gold) | Icon, border, highlights |
| **Background** | `#1a1a1a` → `#2a2a2a` | Gradient background |
| **Text Primary** | `Colors.text` | Titles, main text |
| **Text Secondary** | `Colors.textSecondary` | Descriptions |
| **Success** | `Colors.success` | Feature icons |
| **Surface** | `Colors.surface` | Feature pills |

### **Typography:**

| Element | Size | Weight | Color |
|---------|------|--------|-------|
| **Title** | 20px | 800 | Text |
| **Subtitle** | 14px | 400 | TextSecondary |
| **Badge** | 10px | 800 | #FFD700 |
| **Feature** | 12px | 600 | Text |
| **Limit** | 14px | 400/700 | TextSecondary/Text |

---

## 📐 Layout Structure

```
┌─────────────────────────────────────────────────┐
│                                         [NOVO]  │  ← Badge
│                                                 │
│              ┌─────────────┐                    │  ← Icon Circle
│              │   💬 (64px)  │                    │     (Gold gradient)
│              └─────────────┘                    │
│                                                 │
│        💬 Converse com o Mentor LZ              │  ← Title
│    Consultor de investimentos em cripto        │  ← Subtitle
│                                                 │
│   [📈 Análises]  [💬 Respostas]  [✨ Educação]  │  ← Feature Pills
│                                                 │
│   ┌──────────────────────────────────────────┐ │
│   │  FREE      2 perguntas/dia              │ │  ← Limits
│   │  ────────────────────────────────────── │ │     Comparison
│   │  PREMIUM   Perguntas ilimitadas ♾️      │ │
│   └──────────────────────────────────────────┘ │
│                                                 │
│    💡 +70.000 alunos já aprendem com o LZ      │  ← Social Proof
└─────────────────────────────────────────────────┘
```

---

## 🔧 Customization

### **Change Gold Color:**

```typescript
// In the component file or theme
const GOLD_COLOR = '#FFD700'; // Default
const GOLD_COLOR = '#FFC107'; // Material Design gold
const GOLD_COLOR = '#D4AF37'; // Metallic gold
```

### **Add Animation:**

```typescript
import Animated, { FadeIn, SlideInUp } from 'react-native-reanimated';

<Animated.View 
  entering={SlideInUp.duration(500)}
  style={styles.fullContainer}
>
  <LZChatFeatureHighlight variant="full" />
</Animated.View>
```

### **Add Tap Action:**

```typescript
import { TouchableOpacity } from 'react-native';

<TouchableOpacity 
  onPress={() => router.push('/lz-chat')}
  activeOpacity={0.9}
>
  <LZChatFeatureHighlight variant="compact" />
</TouchableOpacity>
```

---

## 🎯 When to Use Each Variant

| Scenario | Variant | Why |
|----------|---------|-----|
| **Upgrade Modal** | `full` | Show all details to convince upgrade |
| **Post-limit screen** | `full` | User just hit limit, needs full info |
| **Settings list** | `compact` | Fits inline with other settings |
| **Home banner** | `compact` | Non-intrusive promotional |
| **Onboarding** | `full` | Explain feature to new users |
| **Empty state** | `full` | Fill space with promotional content |

---

## 📊 A/B Testing Ideas

### **Test 1: Badge Text**
- A: "NOVO" (current)
- B: "EM DESTAQUE"
- C: "POPULAR"

### **Test 2: Icon Size**
- A: 64px (current)
- B: 48px (smaller)
- C: 80px (larger)

### **Test 3: Social Proof**
- A: "+70.000 alunos" (current)
- B: "+70K já aprenderam"
- C: "Top #1 recurso mais usado"

### **Test 4: Limit Display**
- A: Side-by-side (current)
- B: Before/After comparison
- C: Checkmark list

---

## 🧪 Testing Checklist

- [ ] Renders correctly in light/dark mode
- [ ] Both variants display properly
- [ ] Responsive on different screen sizes
- [ ] Icons load correctly
- [ ] Text is readable
- [ ] Colors match design system
- [ ] Animations are smooth (if added)
- [ ] Tap actions work (if applicable)
- [ ] No performance issues
- [ ] Accessible (screen readers)

---

## 📈 Success Metrics

Track these when using the component:

1. **Impression Rate:** How often users see it
2. **Click-Through Rate:** % who tap/interact
3. **Conversion Rate:** % who upgrade after seeing
4. **Time to Conversion:** How long after first view
5. **Feature Usage:** % who try LZ Chat after seeing

---

## 🎨 Design Tokens

For consistency across the app:

```typescript
export const LZ_CHAT_TOKENS = {
  colors: {
    gold: '#FFD700',
    goldLight: '#FFD700' + '30',
    goldDark: '#FFA500',
  },
  spacing: {
    compact: 12,
    full: 20,
  },
  borderRadius: {
    compact: 12,
    full: 20,
  },
  iconSize: {
    compact: 20,
    full: 32,
  },
};
```

---

## 🔗 Related Files

- `components/LZChatFeatureHighlight.tsx` - This component
- `types/premium.ts` - Premium feature definitions
- `components/UpgradeModal.tsx` - Main upgrade flow
- `app/(tabs)/lz-chat.tsx` - LZ Chat screen
- `app/(tabs)/settings.tsx` - Settings integration

---

## 📝 Notes

- Component is fully self-contained (no external data needed)
- All text is hardcoded (not using i18n yet)
- Icons are from `lucide-react-native`
- Gradients require `expo-linear-gradient`
- Gold color (#FFD700) is intentional (represents value/premium)

---

## 🚀 Future Enhancements

- [ ] Add i18n support
- [ ] Animate icon on mount
- [ ] Add confetti effect on tap
- [ ] Support custom messages
- [ ] Add video preview of feature
- [ ] A/B test different layouts
- [ ] Track analytics automatically
- [ ] Add loading skeleton

---

**✨ Ready to use! Just import and render.**

---

*Created: December 2024*  
*Version: 1.0.0*  
*Author: Claude (GenSpark AI)*
