import {
  StyleSheet,
  Text,
  View,
  TouchableOpacity,
  Animated,
  Platform,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { router, useLocalSearchParams, Stack } from "expo-router";
import { useEffect, useRef, useState } from "react";
import { Trophy, Zap, Coins, TrendingUp, Home, RotateCcw, Share2 } from "lucide-react-native";
import * as Haptics from "expo-haptics";
import { LinearGradient } from "expo-linear-gradient";
import { useLanguage } from "@/contexts/LanguageContext";
import { getLesson } from "@/data/lessons-helper";
import Colors from "@/constants/colors";
import { shareTemplates } from "@/utils/shareTemplates";
import { useUserProgress } from "@/contexts/UserProgressContext";
import { ShareCardModal } from "@/components/ShareCardModal";
import { useAchievementUnlock } from "@/contexts/AchievementUnlockContext";

export default function LessonCompleteScreen() {
  const { language, t } = useLanguage();
  const { progress } = useUserProgress();
  const { showAchievementUnlock } = useAchievementUnlock();
  const params = useLocalSearchParams<{
    lessonId: string;
    score: string;
    total: string;
    xp: string;
    coins: string;
    leveledUp: string;
    newAchievements?: string;
  }>();

  const lesson = getLesson(params.lessonId || "", language);
  const score = parseInt(params.score || "0", 10);
  const total = parseInt(params.total || "1", 10);
  const xp = parseInt(params.xp || "0", 10);
  const coins = parseInt(params.coins || "0", 10);
  const leveledUp = params.leveledUp === "true";
  const percentage = Math.round((score / total) * 100);
  const isPerfect = score === total;

  const scaleAnim = useRef(new Animated.Value(0)).current;
  const fadeAnim = useRef(new Animated.Value(0)).current;
  const hasShownAchievements = useRef(false);

  const [shareModalVisible, setShareModalVisible] = useState(false);
  const [shareCardType, setShareCardType] = useState<'perfect' | 'level' | 'score'>('perfect');
  const [shareTemplate, setShareTemplate] = useState(shareTemplates.PERFECT_LESSON('', 0));

  useEffect(() => {
    if (Platform.OS !== "web") {
      Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
    }

    Animated.sequence([
      Animated.spring(scaleAnim, {
        toValue: 1,
        useNativeDriver: true,
        tension: 50,
        friction: 7,
      }),
      Animated.timing(fadeAnim, {
        toValue: 1,
        duration: 300,
        useNativeDriver: true,
      }),
    ]).start();

    if (isPerfect) {
      console.log('⭐ Perfect score achieved! User engagement increased.');
    }

    if (params.newAchievements && !hasShownAchievements.current) {
      hasShownAchievements.current = true;
      try {
        const achievements = JSON.parse(params.newAchievements) as {id: string; tier: 'bronze' | 'silver' | 'gold'}[];
        if (achievements.length > 0) {
          setTimeout(() => {
            showAchievementUnlock(achievements[0].id, achievements[0].tier);
          }, 1500);
        }
      } catch (error) {
        console.error('Failed to parse achievements:', error);
      }
    }
  }, [scaleAnim, fadeAnim, isPerfect, params.newAchievements, showAchievementUnlock]);

  const handleContinue = () => {
    router.replace("/" as any);
  };

  const handleRetry = () => {
    router.back();
    router.back();
    setTimeout(() => {
      router.push(`/lesson/${params.lessonId}` as any);
    }, 100);
  };

  const handleShare = async () => {
    if (Platform.OS !== "web") {
      await Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    }

    if (isPerfect) {
      setShareCardType('perfect');
      setShareTemplate(shareTemplates.PERFECT_LESSON(lesson?.title || "Crypto Lesson", xp));
    } else if (leveledUp) {
      setShareCardType('level');
      setShareTemplate(shareTemplates.LEVEL_UP(progress.level));
    } else {
      setShareCardType('score');
      setShareTemplate(shareTemplates.HIGH_SCORE(progress.totalXP, progress.level));
    }

    setShareModalVisible(true);
  };

  return (
    <View style={styles.container}>
      <Stack.Screen options={{ headerShown: false }} />

      <LinearGradient
        colors={[Colors.gradientStart, Colors.gradientEnd]}
        style={styles.gradient}
      >
        <SafeAreaView style={styles.safeArea}>
          <Animated.View
            style={[
              styles.content,
              {
                transform: [{ scale: scaleAnim }],
              },
            ]}
          >
            <View style={styles.iconContainer}>
              {isPerfect ? (
                <Text style={styles.celebrationIcon}>🎉</Text>
              ) : (
                <Trophy size={64} color={Colors.surface} />
              )}
            </View>

            <Text style={styles.title}>
              {isPerfect ? t.lessonComplete.title : leveledUp ? t.lessonComplete.levelUp : t.lessonComplete.title}
            </Text>

            <Text style={styles.subtitle}>
              {lesson?.title || t.app.name}
            </Text>

            <View style={styles.scoreCard}>
              <View style={styles.scoreCircle}>
                <Text style={styles.scoreNumber}>{percentage}%</Text>
                <Text style={styles.scoreLabel}>
                  {score}/{total} Correct
                </Text>
              </View>
            </View>

            <Animated.View
              style={[
                styles.rewardsSection,
                {
                  opacity: fadeAnim,
                },
              ]}
            >
              <View style={styles.rewardRow}>
                <View style={styles.rewardCard}>
                  <View style={styles.rewardIconContainer}>
                    <Zap size={24} color={Colors.xpBar} />
                  </View>
                  <Text style={styles.rewardValue}>+{xp}</Text>
                  <Text style={styles.rewardLabel}>{t.lessonComplete.xpEarned}</Text>
                </View>

                <View style={styles.rewardCard}>
                  <View style={styles.rewardIconContainer}>
                    <Coins size={24} color={Colors.coins} />
                  </View>
                  <Text style={styles.rewardValue}>+{coins}</Text>
                  <Text style={styles.rewardLabel}>{t.home.lingoCoins}</Text>
                </View>
              </View>

              {leveledUp && (
                <View style={styles.levelUpBanner}>
                  <TrendingUp size={20} color={Colors.surface} />
                  <Text style={styles.levelUpText}>{t.lessonComplete.levelUpMessage}!</Text>
                </View>
              )}

              {isPerfect && (
                <View style={styles.perfectBanner}>
                  <Text style={styles.perfectText}>
                    ⭐ {t.lessonComplete.perfectBonus}: +10 XP, +5 {t.common.coins}!
                  </Text>
                </View>
              )}
            </Animated.View>
          </Animated.View>

          <Animated.View
            style={[
              styles.footer,
              {
                opacity: fadeAnim,
              },
            ]}
          >
            <TouchableOpacity
              style={[styles.button, styles.shareButton]}
              onPress={handleShare}
            >
              <Share2 size={20} color={Colors.surface} />
              <Text style={styles.buttonText}>Compartilhar 🚀</Text>
            </TouchableOpacity>

            <TouchableOpacity
              style={[styles.button, styles.primaryButton]}
              onPress={handleContinue}
            >
              <Home size={20} color={Colors.primary} />
              <Text style={styles.primaryButtonText}>{t.lessonComplete.continue}</Text>
            </TouchableOpacity>

            {!isPerfect && (
              <TouchableOpacity
                style={[styles.button, styles.secondaryButton]}
                onPress={handleRetry}
              >
                <RotateCcw size={20} color={Colors.surface} />
                <Text style={styles.buttonText}>{t.lessonComplete.reviewMistakes}</Text>
              </TouchableOpacity>
            )}
          </Animated.View>
        </SafeAreaView>
      </LinearGradient>

      <ShareCardModal
        visible={shareModalVisible}
        onClose={() => setShareModalVisible(false)}
        cardType={shareCardType}
        cardData={{
          lessonName: lesson?.title || "Crypto Lesson",
          xp,
          level: progress.level,
          totalXP: progress.totalXP,
          completedLessons: progress.completedLessons.length,
        }}
        shareTemplate={shareTemplate}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  gradient: {
    flex: 1,
  },
  safeArea: {
    flex: 1,
    justifyContent: "space-between",
  },
  content: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
    paddingHorizontal: 20,
  },
  iconContainer: {
    width: 120,
    height: 120,
    borderRadius: 60,
    backgroundColor: "rgba(255, 255, 255, 0.2)",
    alignItems: "center",
    justifyContent: "center",
    marginBottom: 24,
  },
  celebrationIcon: {
    fontSize: 72,
  },
  title: {
    fontSize: 36,
    fontWeight: "800" as const,
    color: Colors.surface,
    marginBottom: 8,
    textAlign: "center",
  },
  subtitle: {
    fontSize: 18,
    color: "rgba(255, 255, 255, 0.9)",
    marginBottom: 32,
    textAlign: "center",
  },
  scoreCard: {
    marginBottom: 32,
  },
  scoreCircle: {
    width: 160,
    height: 160,
    borderRadius: 80,
    backgroundColor: Colors.surface,
    alignItems: "center",
    justifyContent: "center",
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.3,
    shadowRadius: 16,
    elevation: 16,
  },
  scoreNumber: {
    fontSize: 48,
    fontWeight: "800" as const,
    color: Colors.primary,
    marginBottom: 4,
  },
  scoreLabel: {
    fontSize: 14,
    color: Colors.textSecondary,
    fontWeight: "600" as const,
  },
  rewardsSection: {
    width: "100%",
    gap: 16,
  },
  rewardRow: {
    flexDirection: "row",
    gap: 16,
  },
  rewardCard: {
    flex: 1,
    backgroundColor: "rgba(255, 255, 255, 0.2)",
    borderRadius: 16,
    padding: 20,
    alignItems: "center",
  },
  rewardIconContainer: {
    marginBottom: 8,
  },
  rewardValue: {
    fontSize: 28,
    fontWeight: "700" as const,
    color: Colors.surface,
    marginBottom: 4,
  },
  rewardLabel: {
    fontSize: 12,
    color: "rgba(255, 255, 255, 0.9)",
  },
  levelUpBanner: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: 8,
    backgroundColor: Colors.success,
    borderRadius: 12,
    padding: 16,
  },
  levelUpText: {
    fontSize: 16,
    fontWeight: "700" as const,
    color: Colors.surface,
  },
  perfectBanner: {
    backgroundColor: "rgba(255, 215, 0, 0.3)",
    borderRadius: 12,
    padding: 16,
    borderWidth: 2,
    borderColor: "rgba(255, 215, 0, 0.5)",
  },
  perfectText: {
    fontSize: 14,
    fontWeight: "600" as const,
    color: Colors.surface,
    textAlign: "center",
  },
  footer: {
    padding: 20,
    paddingBottom: Platform.OS === "ios" ? 0 : 20,
    gap: 12,
  },
  button: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: 8,
    borderRadius: 12,
    padding: 18,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 8,
  },
  primaryButton: {
    backgroundColor: Colors.surface,
  },
  secondaryButton: {
    backgroundColor: "rgba(255, 255, 255, 0.3)",
    borderWidth: 2,
    borderColor: Colors.surface,
  },
  shareButton: {
    backgroundColor: "#25D366",
    shadowColor: "#25D366",
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.4,
    shadowRadius: 8,
    elevation: 8,
  },
  buttonText: {
    fontSize: 16,
    fontWeight: "700" as const,
    color: Colors.surface,
  },
  primaryButtonText: {
    fontSize: 16,
    fontWeight: "700" as const,
    color: Colors.primary,
  },
});
