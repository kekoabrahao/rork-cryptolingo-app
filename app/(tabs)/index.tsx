import {
  StyleSheet,
  Text,
  View,
  TouchableOpacity,
  Animated,
  Platform,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { LinearGradient } from "expo-linear-gradient";
import { router } from "expo-router";
import { Heart, Flame, Coins, Zap, Swords, Crown } from "lucide-react-native";
import { useUserProgress } from "@/contexts/UserProgressContext";
import { useSubscription } from "@/contexts/SubscriptionContext";
import { useLanguage } from "@/contexts/LanguageContext";
import { useNotifications } from "@/contexts/NotificationContext";
import { useDuel } from "@/contexts/DuelContext";
import { useChallenges } from "@/contexts/ChallengeContext";
import { getLessons } from "@/data/lessons-helper";
import DailyChallengeDashboard from "@/components/DailyChallengeDashboard";
import { ChallengeCard } from "@/components/ChallengeCard";
import { PaywallModal } from "@/components/PaywallModal";
import { NextLessonFAB } from "@/components/NextLessonFAB";
import { ModuleProgressBar } from "@/components/ModuleProgressBar";
import Colors from "@/constants/colors";
import { safeNumber, safeInteger, safePercentage } from "@/utils/safeNumeric";
import { useRef, useEffect, useState, useMemo } from "react";
import { analytics } from "@/utils/analytics";

export default function HomeScreen() {
  const { progress: rawProgress, isLoading } = useUserProgress();
  
  const progress = useMemo(() => ({
    ...rawProgress,
    level: safeInteger(rawProgress.level, 1),
    totalXP: safeInteger(rawProgress.totalXP, 0),
    currentLevelXP: safeInteger(rawProgress.currentLevelXP, 0),
    nextLevelXP: safeInteger(rawProgress.nextLevelXP, 100),
    streak: safeInteger(rawProgress.streak, 0),
    lives: safeInteger(rawProgress.lives, 0),
    coins: safeInteger(rawProgress.coins, 0),
    completedLessons: rawProgress.completedLessons || [],
    xpMultiplier: safeNumber(rawProgress.xpMultiplier, 1),
  }), [rawProgress]);
  const { language, t } = useLanguage();
  const { scheduleSmartNotifications, hasStudiedToday, trackSessionStart } = useNotifications();
  const { startDuel } = useDuel();
  const { challenges, generateDailyChallenges } = useChallenges();
  const { isPremium, canAccessLesson, canStartDuel, incrementDuelCount, showPaywall, hidePaywall, xpMultiplier, coinMultiplier } = useSubscription();
  const scrollY = useRef(new Animated.Value(0)).current;
  const lessons = getLessons(language);

  const [hasInitialized, setHasInitialized] = useState(false);
  const [paywallModalVisible, setPaywallModalVisible] = useState(false);

  useEffect(() => {
    if (!isLoading && !hasInitialized) {
      const completedToday = hasStudiedToday();
      console.log('📱 App opened. Scheduling smart notifications...');
      scheduleSmartNotifications(progress.level, progress.streak, completedToday);
      
      generateDailyChallenges(progress.level, progress.completedLessons);
      
      trackSessionStart(15);
      setHasInitialized(true);
    }
  }, [isLoading, hasInitialized, progress.level, progress.streak, progress.completedLessons, scheduleSmartNotifications, hasStudiedToday, trackSessionStart, generateDailyChallenges]);

  const headerOpacity = scrollY.interpolate({
    inputRange: [0, 100],
    outputRange: [0, 1],
    extrapolate: "clamp",
  });

  const handleLessonPress = (lessonId: string, lessonIndex: number) => {
    if (!canAccessLesson(lessonIndex)) {
      console.log('💎 Lesson locked - showing paywall');
      showPaywall({
        title: 'Unlock All Lessons',
        subtitle: 'Get unlimited access to all learning content and accelerate your progress',
        trigger: 'lesson_limit',
        context: { lessonId, lessonIndex },
      });
      setPaywallModalVisible(true);
      return;
    }

    if (progress.lives === 0) {
      showPaywall({
        title: 'Out of Lives',
        subtitle: 'Premium members get unlimited lives and never have to wait',
        trigger: 'lives_depleted',
      });
      setPaywallModalVisible(true);
      return;
    }

    console.log('🎯 Starting lesson:', lessonId);
    trackSessionStart(10);
    router.push(`/lesson/${lessonId}` as any);
  };

  const nextLesson = useMemo(() => {
    const nextUncompletedLesson = lessons.find((lesson, index) => {
      const isCompleted = progress.completedLessons.includes(lesson.id);
      const isLocked = lesson.requiredLevel > progress.level;
      return !isCompleted && !isLocked;
    });
    return nextUncompletedLesson;
  }, [lessons, progress.completedLessons, progress.level]);

  const allLessonsCompleted = useMemo(() => {
    return lessons.every((lesson) => progress.completedLessons.includes(lesson.id));
  }, [lessons, progress.completedLessons]);

  const moduleProgress = useMemo(() => {
    const modules = new Map<string, { total: number; completed: number; moduleNumber: number }>();
    
    lessons.forEach((lesson) => {
      const moduleName = lesson.module;
      if (!modules.has(moduleName)) {
        modules.set(moduleName, { total: 0, completed: 0, moduleNumber: lesson.moduleNumber });
      }
      const moduleData = modules.get(moduleName)!;
      moduleData.total += 1;
      if (progress.completedLessons.includes(lesson.id)) {
        moduleData.completed += 1;
      }
    });
    
    return Array.from(modules.entries())
      .map(([name, data]) => ({ name, ...data }))
      .sort((a, b) => a.moduleNumber - b.moduleNumber);
  }, [lessons, progress.completedLessons]);

  const handleNextLessonPress = () => {
    console.log('🚀 Next lesson FAB clicked');
    analytics.track('share_button_clicked', {
      content_type: 'next_lesson_fab',
      platform: 'app',
      user_level: progress.level,
    });

    if (allLessonsCompleted) {
      console.log('🎉 All lessons completed!');
      return;
    }

    if (nextLesson) {
      const lessonIndex = lessons.findIndex((l) => l.id === nextLesson.id);
      handleLessonPress(nextLesson.id, lessonIndex);
    }
  };

  const handleDuelPress = () => {
    if (!canStartDuel()) {
      console.log('💎 Duel limit reached - showing paywall');
      showPaywall({
        title: 'Unlimited Duels',
        subtitle: 'Challenge unlimited opponents and climb the leaderboard faster with Premium',
        trigger: 'duel_limit',
      });
      setPaywallModalVisible(true);
      return;
    }

    if (progress.lives === 0) {
      showPaywall({
        title: 'Out of Lives',
        subtitle: 'Premium members get unlimited lives and never have to wait',
        trigger: 'lives_depleted',
      });
      setPaywallModalVisible(true);
      return;
    }

    console.log('⚔️ Starting duel...');
    incrementDuelCount();
    startDuel(progress.level);
    router.push('/duel' as any);
  };

  if (isLoading) {
    return (
      <SafeAreaView style={styles.container}>
        <View style={styles.loadingContainer}>
          <Text style={styles.loadingText}>{t.app.loading}</Text>
        </View>
      </SafeAreaView>
    );
  }

  return (
    <View style={styles.container}>
      <Animated.View
        style={[
          styles.header,
          {
            opacity: headerOpacity,
            backgroundColor: Colors.surface,
          },
        ]}
      >
        <View style={styles.headerContent}>
          <View style={styles.statsRow}>
            <View style={styles.statItem}>
              <Flame size={20} color={Colors.streak} />
              <Text style={styles.statText}>{safeInteger(progress.streak, 0)}</Text>
            </View>
            <View style={styles.statItem}>
              <Coins size={20} color={Colors.coins} />
              <Text style={styles.statText}>{safeInteger(progress.coins, 0)}</Text>
            </View>
            <View style={styles.statItem}>
              <Heart size={20} color={Colors.lives} fill={Colors.lives} />
              <Text style={styles.statText}>{safeInteger(progress.lives, 0)}</Text>
            </View>
          </View>
        </View>
      </Animated.View>

      <SafeAreaView edges={["top"]} style={styles.safeArea}>
        <Animated.ScrollView
          style={styles.scrollView}
          contentContainerStyle={styles.scrollContent}
          showsVerticalScrollIndicator={false}
          onScroll={Animated.event([{ nativeEvent: { contentOffset: { y: scrollY } } }], {
            useNativeDriver: Platform.OS !== "web",
          })}
          scrollEventThrottle={16}
        >
          <View style={styles.topSection}>
            <View style={styles.titleRow}>
              <View>
                <Text style={styles.title}>{t.home.title}</Text>
                <Text style={styles.subtitle}>{t.home.subtitle}</Text>
              </View>
              {isPremium && (
                <View style={styles.premiumBadge}>
                  <Crown size={16} color="#FFD700" fill="#FFD700" />
                  <Text style={styles.premiumBadgeText}>PRO</Text>
                </View>
              )}
              {!isPremium && (
                <TouchableOpacity
                  style={styles.upgradeBadge}
                  onPress={() => {
                    showPaywall({
                      title: 'Upgrade to Premium',
                      subtitle: 'Unlock all features and accelerate your learning',
                      trigger: 'manual',
                    });
                    setPaywallModalVisible(true);
                  }}
                  activeOpacity={0.7}
                >
                  <Crown size={14} color="#FFD700" />
                  <Text style={styles.upgradeBadgeText}>Go Pro</Text>
                </TouchableOpacity>
              )}
            </View>

            <View style={styles.levelCard}>
              <View style={styles.levelHeader}>
                <View style={styles.levelBadge}>
                  <Zap size={18} color={Colors.surface} />
                  <Text style={styles.levelBadgeText}>{t.home.levelLabel} {safeInteger(progress.level, 1)}</Text>
                  {(xpMultiplier > 1 || coinMultiplier > 1) && (
                    <View style={styles.boostIndicator}>
                      <Text style={styles.boostText}>{xpMultiplier}x</Text>
                    </View>
                  )}
                </View>
                <Text style={styles.xpText}>
                  {safeInteger(progress.currentLevelXP, 0)}/{safeInteger(progress.nextLevelXP, 100)} XP
                </Text>
              </View>
              <View style={styles.progressBarContainer}>
                <View
                  style={[
                    styles.progressBarFill,
                    { width: `${safePercentage(progress.currentLevelXP, progress.nextLevelXP, 0)}%` },
                  ]}
                />
              </View>
            </View>

            <View style={styles.statsRow}>
              <View style={[styles.statCard, { backgroundColor: Colors.streak + "20" }]}>
                <Flame size={28} color={Colors.streak} />
                <Text style={styles.statCardValue}>{safeInteger(progress.streak, 0)}</Text>
                <Text style={styles.statCardLabel}>{t.home.dayStreak}</Text>
              </View>
              <View style={[styles.statCard, { backgroundColor: Colors.coins + "20" }]}>
                <Coins size={28} color={Colors.coins} />
                <Text style={styles.statCardValue}>{safeInteger(progress.coins, 0)}</Text>
                <Text style={styles.statCardLabel}>{t.home.lingoCoins}</Text>
              </View>
              <View style={[styles.statCard, { backgroundColor: Colors.lives + "20" }]}>
                <Heart size={28} color={Colors.lives} fill={Colors.lives} />
                <Text style={styles.statCardValue}>{safeInteger(progress.lives, 0)}/5</Text>
                <Text style={styles.statCardLabel}>{t.home.lives}</Text>
              </View>
            </View>
          </View>

          <DailyChallengeDashboard />

          <View style={styles.challengesSection}>
            <View style={styles.sectionHeader}>
              <Text style={styles.sectionTitle}>🎯 Daily Challenges</Text>
              <Text style={styles.sectionSubtitle}>Complete personalized challenges</Text>
            </View>
            {Array.isArray(challenges) && challenges.length > 0 ? (
              challenges.map((challenge) => (
                <ChallengeCard key={challenge.id} challenge={challenge} />
              ))
            ) : (
              <View style={styles.emptyState}>
                <Text style={styles.emptyText}>No challenges available today</Text>
              </View>
            )}
          </View>

          <View style={styles.duelSection}>
            <TouchableOpacity
              style={styles.duelCard}
              onPress={handleDuelPress}
              activeOpacity={0.8}
            >
              <LinearGradient
                colors={['#FF6B35', '#FF8C61']}
                start={{ x: 0, y: 0 }}
                end={{ x: 1, y: 1 }}
                style={styles.duelGradient}
              >
                <View style={styles.duelHeader}>
                  <View style={styles.duelIconContainer}>
                    <Swords color="#FFFFFF" size={32} />
                  </View>
                  <View style={styles.duelContent}>
                    <Text style={styles.duelTitle}>PvP DUEL MODE</Text>
                    <Text style={styles.duelSubtitle}>Challenge opponents and earn rewards!</Text>
                  </View>
                </View>
                <View style={styles.duelRewards}>
                  <View style={styles.duelRewardItem}>
                    <Zap size={16} color="#FFD700" />
                    <Text style={styles.duelRewardText}>Up to 100 XP</Text>
                  </View>
                  <View style={styles.duelRewardItem}>
                    <Coins size={16} color="#FFD700" />
                    <Text style={styles.duelRewardText}>Up to 75 Coins</Text>
                  </View>
                </View>
              </LinearGradient>
            </TouchableOpacity>
          </View>

          <View style={styles.lessonsSection}>
            <Text style={styles.sectionTitle}>{t.home.learningPath}</Text>

            {moduleProgress.map((module) => (
              <ModuleProgressBar
                key={module.name}
                moduleName={module.name}
                completedLessons={module.completed}
                totalLessons={module.total}
                animate={true}
              />
            ))}

            {lessons.map((lesson, index) => {
              const isCompleted = progress.completedLessons.includes(lesson.id);
              const isLocked = lesson.requiredLevel > progress.level;
              const isNext =
                !isCompleted &&
                !isLocked &&
                (index === 0 ||
                  progress.completedLessons.includes(lessons[index - 1].id));

              return (
                <View key={lesson.id} style={styles.lessonContainer}>
                  {index > 0 && <View style={styles.lessonConnector} />}

                  <TouchableOpacity
                    onPress={() => handleLessonPress(lesson.id, index)}
                    activeOpacity={0.7}
                    style={[
                      styles.lessonCard,
                      isCompleted && styles.lessonCardCompleted,
                      isLocked && styles.lessonCardLocked,
                      isNext && styles.lessonCardNext,
                    ]}
                  >
                    <LinearGradient
                      colors={
                        isCompleted
                          ? [Colors.success, Colors.accent]
                          : isLocked
                            ? [Colors.borderLight, Colors.border]
                            : [Colors.gradientStart, Colors.gradientEnd]
                      }
                      start={{ x: 0, y: 0 }}
                      end={{ x: 1, y: 1 }}
                      style={styles.lessonGradient}
                    >
                      <View style={styles.lessonIcon}>
                        <Text style={styles.lessonIconText}>{lesson.icon}</Text>
                      </View>
                    </LinearGradient>

                    <View style={styles.lessonContent}>
                      <View style={styles.lessonHeader}>
                        <Text
                          style={[
                            styles.lessonTitle,
                            isLocked && styles.lessonTitleLocked,
                            !canAccessLesson(index) && styles.lessonTitleLocked,
                          ]}
                        >
                          {lesson.title}
                        </Text>
                        {isCompleted && (
                          <View style={styles.completedBadge}>
                            <Text style={styles.completedBadgeText}>✓</Text>
                          </View>
                        )}
                        {!canAccessLesson(index) && (
                          <View style={styles.premiumLockedBadge}>
                            <Crown size={12} color="#FFD700" fill="#FFD700" />
                            <Text style={styles.premiumLockedText}>PRO</Text>
                          </View>
                        )}
                        {isLocked && canAccessLesson(index) && (
                          <View style={styles.lockedBadge}>
                            <Text style={styles.lockedBadgeText}>🔒 {t.home.levelLabel} {lesson.requiredLevel}</Text>
                          </View>
                        )}
                      </View>

                      <Text style={[styles.lessonModule, isLocked && styles.lessonModuleLocked]}>
                        {lesson.module}
                      </Text>

                      <View style={styles.lessonRewards}>
                        <View style={styles.rewardItem}>
                          <Zap size={14} color={Colors.xpBar} />
                          <Text style={styles.rewardText}>+{lesson.xpReward} XP</Text>
                        </View>
                        <View style={styles.rewardItem}>
                          <Coins size={14} color={Colors.coins} />
                          <Text style={styles.rewardText}>+{lesson.coinReward}</Text>
                        </View>
                      </View>
                    </View>
                  </TouchableOpacity>
                </View>
              );
            })}
          </View>

          <View style={styles.bottomPadding} />
        </Animated.ScrollView>
      </SafeAreaView>

      <PaywallModal
        visible={paywallModalVisible}
        onClose={() => {
          setPaywallModalVisible(false);
          hidePaywall();
        }}
      />

      {nextLesson && (
        <NextLessonFAB
          lessonTitle={nextLesson.title}
          xpReward={nextLesson.xpReward}
          coinReward={nextLesson.coinReward}
          onPress={handleNextLessonPress}
          allLessonsCompleted={allLessonsCompleted}
        />
      )}

      {!nextLesson && allLessonsCompleted && (
        <NextLessonFAB
          lessonTitle=""
          xpReward={0}
          coinReward={0}
          onPress={handleNextLessonPress}
          allLessonsCompleted={true}
        />
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: Colors.background,
  },
  safeArea: {
    flex: 1,
  },
  loadingContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
  },
  loadingText: {
    fontSize: 18,
    color: Colors.textSecondary,
  },
  header: {
    position: "absolute",
    top: 0,
    left: 0,
    right: 0,
    zIndex: 10,
    paddingTop: Platform.OS === "ios" ? 50 : 20,
    paddingBottom: 12,
    paddingHorizontal: 20,
    borderBottomWidth: 1,
    borderBottomColor: Colors.border,
  },
  headerContent: {
    alignItems: "center",
  },
  scrollView: {
    flex: 1,
  },
  scrollContent: {
    paddingBottom: 20,
  },
  topSection: {
    paddingHorizontal: 20,
    paddingTop: 20,
  },
  title: {
    fontSize: 36,
    fontWeight: "800" as const,
    color: Colors.primary,
    marginBottom: 4,
  },
  subtitle: {
    fontSize: 16,
    color: Colors.textSecondary,
    marginBottom: 24,
  },
  levelCard: {
    backgroundColor: Colors.surface,
    borderRadius: 16,
    padding: 16,
    marginBottom: 16,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 4,
  },
  levelHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 12,
  },
  levelBadge: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: Colors.primary,
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 20,
    gap: 6,
  },
  levelBadgeText: {
    color: Colors.surface,
    fontSize: 14,
    fontWeight: "700" as const,
  },
  xpText: {
    fontSize: 14,
    fontWeight: "600" as const,
    color: Colors.textSecondary,
  },
  progressBarContainer: {
    height: 8,
    backgroundColor: Colors.borderLight,
    borderRadius: 4,
    overflow: "hidden",
  },
  progressBarFill: {
    height: "100%",
    backgroundColor: Colors.xpBar,
    borderRadius: 4,
  },
  statsRow: {
    flexDirection: "row",
    gap: 12,
    marginBottom: 24,
  },
  statCard: {
    flex: 1,
    backgroundColor: Colors.surface,
    borderRadius: 12,
    padding: 12,
    alignItems: "center",
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 4,
    elevation: 2,
  },
  statCardValue: {
    fontSize: 20,
    fontWeight: "700" as const,
    color: Colors.text,
    marginTop: 4,
  },
  statCardLabel: {
    fontSize: 11,
    color: Colors.textSecondary,
    marginTop: 2,
    textAlign: "center",
  },
  statItem: {
    flexDirection: "row",
    alignItems: "center",
    gap: 6,
    backgroundColor: Colors.surfaceHover,
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 16,
  },
  statText: {
    fontSize: 14,
    fontWeight: "700" as const,
    color: Colors.text,
  },
  lessonsSection: {
    paddingHorizontal: 20,
    paddingTop: 12,
  },
  sectionTitle: {
    fontSize: 24,
    fontWeight: "700" as const,
    color: Colors.text,
    marginBottom: 20,
  },
  lessonContainer: {
    marginBottom: 20,
    position: "relative",
  },
  lessonConnector: {
    position: "absolute",
    top: -20,
    left: 35,
    width: 4,
    height: 20,
    backgroundColor: Colors.border,
    borderRadius: 2,
  },
  lessonCard: {
    flexDirection: "row",
    backgroundColor: Colors.surface,
    borderRadius: 16,
    overflow: "hidden",
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.1,
    shadowRadius: 12,
    elevation: 5,
  },
  lessonCardCompleted: {
    opacity: 0.85,
  },
  lessonCardLocked: {
    opacity: 0.5,
  },
  lessonCardNext: {
    shadowColor: Colors.primary,
    shadowOpacity: 0.3,
    borderWidth: 2,
    borderColor: Colors.primaryLight,
  },
  lessonGradient: {
    width: 70,
    alignItems: "center",
    justifyContent: "center",
  },
  lessonIcon: {
    width: 50,
    height: 50,
    borderRadius: 25,
    backgroundColor: "rgba(255, 255, 255, 0.2)",
    alignItems: "center",
    justifyContent: "center",
  },
  lessonIconText: {
    fontSize: 28,
  },
  lessonContent: {
    flex: 1,
    padding: 16,
  },
  lessonHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "flex-start",
    marginBottom: 4,
  },
  lessonTitle: {
    fontSize: 18,
    fontWeight: "700" as const,
    color: Colors.text,
    flex: 1,
  },
  lessonTitleLocked: {
    color: Colors.textSecondary,
  },
  lessonModule: {
    fontSize: 13,
    color: Colors.textSecondary,
    marginBottom: 8,
  },
  lessonModuleLocked: {
    color: Colors.textLight,
  },
  lessonRewards: {
    flexDirection: "row",
    gap: 12,
  },
  rewardItem: {
    flexDirection: "row",
    alignItems: "center",
    gap: 4,
  },
  rewardText: {
    fontSize: 13,
    fontWeight: "600" as const,
    color: Colors.textSecondary,
  },
  completedBadge: {
    backgroundColor: Colors.success,
    width: 24,
    height: 24,
    borderRadius: 12,
    alignItems: "center",
    justifyContent: "center",
    marginLeft: 8,
  },
  completedBadgeText: {
    color: Colors.surface,
    fontSize: 12,
    fontWeight: "700" as const,
  },
  lockedBadge: {
    backgroundColor: Colors.borderLight,
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 8,
    marginLeft: 8,
  },
  lockedBadgeText: {
    fontSize: 11,
    color: Colors.textLight,
    fontWeight: "600" as const,
  },
  bottomPadding: {
    height: 40,
  },
  duelSection: {
    paddingHorizontal: 20,
    marginBottom: 24,
  },
  duelCard: {
    borderRadius: 20,
    overflow: 'hidden',
    shadowColor: '#FF6B35',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 12,
    elevation: 8,
  },
  duelGradient: {
    padding: 20,
  },
  duelHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 16,
    gap: 16,
  },
  duelIconContainer: {
    width: 64,
    height: 64,
    borderRadius: 32,
    backgroundColor: 'rgba(255, 255, 255, 0.2)',
    alignItems: 'center',
    justifyContent: 'center',
  },
  duelContent: {
    flex: 1,
  },
  duelTitle: {
    fontSize: 20,
    fontWeight: '800' as const,
    color: '#FFFFFF',
    marginBottom: 4,
  },
  duelSubtitle: {
    fontSize: 14,
    color: 'rgba(255, 255, 255, 0.9)',
  },
  duelRewards: {
    flexDirection: 'row',
    gap: 16,
  },
  duelRewardItem: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    backgroundColor: 'rgba(255, 255, 255, 0.2)',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 12,
  },
  duelRewardText: {
    fontSize: 13,
    fontWeight: '600' as const,
    color: '#FFFFFF',
  },
  titleRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: 8,
  },
  premiumBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    backgroundColor: '#1F2937',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: '#FFD700',
  },
  premiumBadgeText: {
    fontSize: 12,
    fontWeight: '700' as const,
    color: '#FFD700',
  },
  upgradeBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    backgroundColor: '#6366F1',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 12,
    shadowColor: '#6366F1',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.3,
    shadowRadius: 4,
    elevation: 4,
  },
  upgradeBadgeText: {
    fontSize: 12,
    fontWeight: '700' as const,
    color: '#FFFFFF',
  },
  boostIndicator: {
    backgroundColor: '#10B981',
    paddingHorizontal: 8,
    paddingVertical: 2,
    borderRadius: 8,
    marginLeft: 4,
  },
  boostText: {
    fontSize: 11,
    fontWeight: '700' as const,
    color: '#FFFFFF',
  },
  premiumLockedBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    backgroundColor: '#1F2937',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 8,
    marginLeft: 8,
  },
  premiumLockedText: {
    fontSize: 10,
    fontWeight: '700' as const,
    color: '#FFD700',
  },
  challengesSection: {
    paddingHorizontal: 20,
    marginBottom: 24,
  },
  sectionHeader: {
    marginBottom: 16,
  },
  sectionSubtitle: {
    fontSize: 14,
    color: Colors.textSecondary,
    marginTop: 4,
  },
  emptyState: {
    padding: 24,
    alignItems: 'center',
    backgroundColor: Colors.surface,
    borderRadius: 16,
  },
  emptyText: {
    fontSize: 14,
    color: Colors.textSecondary,
  },
});
