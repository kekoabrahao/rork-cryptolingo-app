import { StyleSheet, Text, View, TouchableOpacity, Animated, ScrollView } from "react-native";
import { CheckCircle, Clock, Zap, Trophy, Flame, Gift } from "lucide-react-native";
import { useUserProgress } from "@/contexts/UserProgressContext";
import { analytics } from "@/utils/analytics";
import Colors from "@/constants/colors";
import { useRef, useEffect, useState, useMemo } from "react";
import { router } from "expo-router";

interface DailyChallenge {
  id: string;
  type: 'lessons' | 'duels' | 'news';
  name: string;
  description: string;
  icon: string;
  difficulty: 'easy' | 'medium' | 'hard';
  target: number;
  current: number;
  completed: boolean;
  reward: {
    xp: number;
    coins: number;
  };
}

export default function DailyChallengeDashboard() {
  const { progress } = useUserProgress();
  const today = new Date().toISOString().split("T")[0];

  const [showClaimAnimation, setShowClaimAnimation] = useState(false);
  const pulseAnim = useRef(new Animated.Value(1)).current;
  const claimAnim = useRef(new Animated.Value(0)).current;
  const confettiAnim = useRef(new Animated.Value(0)).current;

  const readArticlesKey = `@read_articles_${today}`;
  const [readArticles, setReadArticles] = useState<string[]>([]);

  useEffect(() => {
    const loadReadArticles = async () => {
      try {
        const AsyncStorage = await import('@react-native-async-storage/async-storage').then(m => m.default);
        const stored = await AsyncStorage.getItem(readArticlesKey);
        if (stored) {
          setReadArticles(JSON.parse(stored));
        }
      } catch (error) {
        console.error('Error loading read articles:', error);
      }
    };
    loadReadArticles();
  }, [readArticlesKey]);

  const dailyChallenges: DailyChallenge[] = useMemo(() => {
    const todayLessonsCompleted = progress.completedLessons.filter(lessonId => {
      return true;
    }).length;

    const todayDuelsWon = 0;

    const todayArticlesRead = readArticles.length;

    const challenges: DailyChallenge[] = [
      {
        id: `lessons_${today}`,
        type: 'lessons',
        name: 'Complete 2 Lessons',
        description: 'Learn and grow your crypto knowledge',
        icon: '📚',
        difficulty: 'easy',
        target: 2,
        current: Math.min(todayLessonsCompleted, 2),
        completed: todayLessonsCompleted >= 2,
        reward: { xp: 50, coins: 25 },
      },
      {
        id: `duels_${today}`,
        type: 'duels',
        name: 'Win 1 PvP Duel',
        description: 'Challenge opponents and prove your skills',
        icon: '⚔️',
        difficulty: 'medium',
        target: 1,
        current: Math.min(todayDuelsWon, 1),
        completed: todayDuelsWon >= 1,
        reward: { xp: 75, coins: 40 },
      },
      {
        id: `news_${today}`,
        type: 'news',
        name: 'Read 3 News Articles',
        description: 'Stay updated with crypto market trends',
        icon: '📰',
        difficulty: 'easy',
        target: 3,
        current: Math.min(todayArticlesRead, 3),
        completed: todayArticlesRead >= 3,
        reward: { xp: 40, coins: 20 },
      },
    ];

    return challenges;
  }, [progress.completedLessons, readArticles, today]);

  const allCompleted = useMemo(() => {
    return dailyChallenges.every(c => c.completed);
  }, [dailyChallenges]);

  const totalProgress = useMemo(() => {
    const completed = dailyChallenges.filter(c => c.completed).length;
    return (completed / dailyChallenges.length) * 100;
  }, [dailyChallenges]);

  const bonusReward = useMemo(() => {
    return {
      xp: 100,
      coins: 50,
    };
  }, []);

  const streakCount = useMemo(() => {
    return 7;
  }, []);

  useEffect(() => {
    Animated.loop(
      Animated.sequence([
        Animated.timing(pulseAnim, {
          toValue: 1.05,
          duration: 2000,
          useNativeDriver: true,
        }),
        Animated.timing(pulseAnim, {
          toValue: 1,
          duration: 2000,
          useNativeDriver: true,
        }),
      ])
    ).start();
  }, [pulseAnim]);

  const handleClaimRewards = async () => {
    if (!allCompleted) return;

    analytics.track('share_button_clicked', {
      date: today,
      bonus_xp: bonusReward.xp,
      bonus_coins: bonusReward.coins,
    });

    setShowClaimAnimation(true);

    Animated.parallel([
      Animated.spring(claimAnim, {
        toValue: 1,
        useNativeDriver: true,
        tension: 50,
        friction: 7,
      }),
      Animated.timing(confettiAnim, {
        toValue: 1,
        duration: 1000,
        useNativeDriver: true,
      }),
    ]).start(() => {
      setTimeout(() => {
        setShowClaimAnimation(false);
        claimAnim.setValue(0);
        confettiAnim.setValue(0);
      }, 2000);
    });
  };

  const handleChallengePress = (challenge: DailyChallenge) => {
    if (challenge.completed) return;

    analytics.track('share_button_clicked', {
      challenge_type: challenge.type,
      progress: `${challenge.current}/${challenge.target}`,
    });

    switch (challenge.type) {
      case 'lessons':
        router.push('/(tabs)' as any);
        break;
      case 'duels':
        router.push('/duel' as any);
        break;
      case 'news':
        router.push('/(tabs)/news' as any);
        break;
    }
  };

  const getTimeRemaining = () => {
    const now = new Date();
    const endOfDay = new Date(now);
    endOfDay.setHours(23, 59, 59, 999);
    const diff = endOfDay.getTime() - now.getTime();
    const hours = Math.floor(diff / (1000 * 60 * 60));
    const minutes = Math.floor((diff % (1000 * 60 * 60)) / (1000 * 60));
    return `${hours}h ${minutes}m`;
  };

  const getDifficultyColor = (difficulty: string) => {
    switch (difficulty) {
      case 'easy':
        return Colors.success;
      case 'medium':
        return Colors.coins;
      case 'hard':
        return Colors.lives;
      default:
        return Colors.primary;
    }
  };

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <View style={styles.headerTop}>
          <View>
            <Text style={styles.title}>🎯 Daily Challenges</Text>
            <Text style={styles.subtitle}>Complete all 3 for bonus rewards!</Text>
          </View>
          <View style={styles.timerContainer}>
            <Clock size={14} color={Colors.textSecondary} />
            <Text style={styles.timerText}>{getTimeRemaining()}</Text>
          </View>
        </View>

        <View style={styles.progressSection}>
          <View style={styles.progressHeader}>
            <Text style={styles.progressText}>
              {dailyChallenges.filter(c => c.completed).length}/{dailyChallenges.length} Completed
            </Text>
            <View style={styles.streakBadge}>
              <Flame size={14} color="#FF6B35" />
              <Text style={styles.streakText}>{streakCount} day streak</Text>
            </View>
          </View>
          <View style={styles.progressBar}>
            <View style={[styles.progressFill, { width: `${totalProgress}%` }]}>
              <View style={styles.progressShine} />
            </View>
          </View>
        </View>
      </View>

      <ScrollView
        horizontal
        showsHorizontalScrollIndicator={false}
        contentContainerStyle={styles.challengesScroll}
      >
        {dailyChallenges.map((challenge) => {
          const progressPercent = (challenge.current / challenge.target) * 100;

          return (
            <TouchableOpacity
              key={challenge.id}
              activeOpacity={0.8}
              onPress={() => handleChallengePress(challenge)}
              disabled={challenge.completed}
            >
              <Animated.View
                style={[
                  styles.challengeCard,
                  {
                    transform: [{ scale: challenge.completed ? 1 : pulseAnim }],
                    borderColor: challenge.completed
                      ? Colors.success
                      : getDifficultyColor(challenge.difficulty),
                  },
                ]}
              >
                {challenge.completed && (
                  <View style={styles.completedOverlay}>
                    <CheckCircle size={40} color={Colors.success} fill={Colors.success} />
                  </View>
                )}

                <View style={styles.cardHeader}>
                  <View
                    style={[
                      styles.iconContainer,
                      { backgroundColor: getDifficultyColor(challenge.difficulty) + '20' },
                    ]}
                  >
                    <Text style={styles.challengeIcon}>{challenge.icon}</Text>
                  </View>
                  <View
                    style={[
                      styles.difficultyBadge,
                      { backgroundColor: getDifficultyColor(challenge.difficulty) + '20' },
                    ]}
                  >
                    <Text
                      style={[styles.difficultyText, { color: getDifficultyColor(challenge.difficulty) }]}
                    >
                      {challenge.difficulty.toUpperCase()}
                    </Text>
                  </View>
                </View>

                <Text style={styles.challengeName}>{challenge.name}</Text>
                <Text style={styles.challengeDescription} numberOfLines={2}>
                  {challenge.description}
                </Text>

                <View style={styles.cardProgress}>
                  <View style={styles.cardProgressHeader}>
                    <Text style={styles.cardProgressText}>
                      {challenge.current}/{challenge.target}
                    </Text>
                    <Text style={styles.cardProgressPercent}>{Math.round(progressPercent)}%</Text>
                  </View>
                  <View style={styles.cardProgressBar}>
                    <View
                      style={[
                        styles.cardProgressFill,
                        {
                          width: `${progressPercent}%`,
                          backgroundColor: challenge.completed
                            ? Colors.success
                            : getDifficultyColor(challenge.difficulty),
                        },
                      ]}
                    />
                  </View>
                </View>

                <View style={styles.rewardSection}>
                  <View style={styles.rewardItem}>
                    <Zap size={12} color={Colors.xpBar} fill={Colors.xpBar} />
                    <Text style={styles.rewardText}>+{challenge.reward.xp}</Text>
                  </View>
                  <View style={styles.rewardItem}>
                    <Text style={styles.rewardIcon}>💰</Text>
                    <Text style={styles.rewardText}>+{challenge.reward.coins}</Text>
                  </View>
                </View>
              </Animated.View>
            </TouchableOpacity>
          );
        })}
      </ScrollView>

      {allCompleted && (
        <TouchableOpacity
          style={styles.claimButton}
          onPress={handleClaimRewards}
          activeOpacity={0.9}
        >
          <View style={styles.claimButtonGradient}>
            <Trophy size={20} color="#FFFFFF" />
            <View style={styles.claimButtonContent}>
              <Text style={styles.claimButtonText}>Claim Bonus Rewards!</Text>
              <Text style={styles.claimButtonRewards}>
                +{bonusReward.xp} XP · +{bonusReward.coins} Coins
              </Text>
            </View>
            <Gift size={20} color="#FFFFFF" />
          </View>
        </TouchableOpacity>
      )}

      {showClaimAnimation && (
        <Animated.View
          style={[
            styles.claimAnimationOverlay,
            {
              opacity: claimAnim,
              transform: [
                {
                  scale: claimAnim.interpolate({
                    inputRange: [0, 1],
                    outputRange: [0.5, 1],
                  }),
                },
              ],
            },
          ]}
        >
          <View style={styles.claimAnimationContent}>
            <Trophy size={64} color="#FFD700" />
            <Text style={styles.claimAnimationTitle}>🎉 Amazing Work!</Text>
            <Text style={styles.claimAnimationText}>
              +{bonusReward.xp} XP · +{bonusReward.coins} Coins
            </Text>
          </View>
        </Animated.View>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    marginBottom: 20,
  },
  header: {
    backgroundColor: Colors.surface,
    borderRadius: 20,
    padding: 20,
    marginHorizontal: 20,
    marginBottom: 16,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.15,
    shadowRadius: 12,
    elevation: 6,
  },
  headerTop: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "flex-start",
    marginBottom: 16,
  },
  title: {
    fontSize: 22,
    fontWeight: "800" as const,
    color: Colors.text,
    marginBottom: 4,
  },
  subtitle: {
    fontSize: 13,
    color: Colors.textSecondary,
  },
  timerContainer: {
    flexDirection: "row",
    alignItems: "center",
    gap: 6,
    backgroundColor: Colors.borderLight,
    paddingHorizontal: 10,
    paddingVertical: 6,
    borderRadius: 12,
  },
  timerText: {
    fontSize: 12,
    fontWeight: "700" as const,
    color: Colors.textSecondary,
  },
  progressSection: {
    marginTop: 8,
  },
  progressHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 10,
  },
  progressText: {
    fontSize: 14,
    fontWeight: "700" as const,
    color: Colors.text,
  },
  streakBadge: {
    flexDirection: "row",
    alignItems: "center",
    gap: 4,
    backgroundColor: "#FF6B3520",
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 10,
  },
  streakText: {
    fontSize: 12,
    fontWeight: "700" as const,
    color: "#FF6B35",
  },
  progressBar: {
    height: 10,
    backgroundColor: Colors.borderLight,
    borderRadius: 5,
    overflow: "hidden",
  },
  progressFill: {
    height: "100%",
    backgroundColor: Colors.primary,
    borderRadius: 5,
    position: "relative",
  },
  progressShine: {
    position: "absolute",
    top: 0,
    left: 0,
    right: 0,
    height: "50%",
    backgroundColor: "rgba(255, 255, 255, 0.3)",
    borderRadius: 5,
  },
  challengesScroll: {
    paddingHorizontal: 20,
    gap: 16,
  },
  challengeCard: {
    width: 240,
    backgroundColor: Colors.surface,
    borderRadius: 16,
    padding: 16,
    borderWidth: 3,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.12,
    shadowRadius: 10,
    elevation: 5,
    position: "relative",
  },
  completedOverlay: {
    position: "absolute",
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    backgroundColor: Colors.success + "15",
    borderRadius: 16,
    alignItems: "center",
    justifyContent: "center",
    zIndex: 10,
  },
  cardHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 12,
  },
  iconContainer: {
    width: 48,
    height: 48,
    borderRadius: 24,
    alignItems: "center",
    justifyContent: "center",
  },
  challengeIcon: {
    fontSize: 26,
  },
  difficultyBadge: {
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 8,
  },
  difficultyText: {
    fontSize: 10,
    fontWeight: "700" as const,
  },
  challengeName: {
    fontSize: 16,
    fontWeight: "800" as const,
    color: Colors.text,
    marginBottom: 6,
  },
  challengeDescription: {
    fontSize: 12,
    color: Colors.textSecondary,
    marginBottom: 14,
    lineHeight: 16,
  },
  cardProgress: {
    marginBottom: 12,
  },
  cardProgressHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 6,
  },
  cardProgressText: {
    fontSize: 13,
    fontWeight: "700" as const,
    color: Colors.text,
  },
  cardProgressPercent: {
    fontSize: 12,
    fontWeight: "600" as const,
    color: Colors.textSecondary,
  },
  cardProgressBar: {
    height: 8,
    backgroundColor: Colors.borderLight,
    borderRadius: 4,
    overflow: "hidden",
  },
  cardProgressFill: {
    height: "100%",
    borderRadius: 4,
  },
  rewardSection: {
    flexDirection: "row",
    gap: 8,
  },
  rewardItem: {
    flexDirection: "row",
    alignItems: "center",
    gap: 4,
    backgroundColor: Colors.borderLight,
    paddingHorizontal: 10,
    paddingVertical: 6,
    borderRadius: 8,
  },
  rewardIcon: {
    fontSize: 12,
  },
  rewardText: {
    fontSize: 12,
    fontWeight: "700" as const,
    color: Colors.text,
  },
  claimButton: {
    marginHorizontal: 20,
    marginTop: 16,
    borderRadius: 16,
    overflow: "hidden",
    shadowColor: Colors.primary,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 12,
    elevation: 8,
  },
  claimButtonGradient: {
    backgroundColor: Colors.primary,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: 12,
    paddingVertical: 16,
    paddingHorizontal: 20,
  },
  claimButtonContent: {
    flex: 1,
    alignItems: "center",
  },
  claimButtonText: {
    fontSize: 16,
    fontWeight: "800" as const,
    color: "#FFFFFF",
    marginBottom: 4,
  },
  claimButtonRewards: {
    fontSize: 13,
    fontWeight: "600" as const,
    color: "rgba(255, 255, 255, 0.9)",
  },
  claimAnimationOverlay: {
    position: "absolute",
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    backgroundColor: "rgba(0, 0, 0, 0.85)",
    alignItems: "center",
    justifyContent: "center",
    borderRadius: 20,
    zIndex: 100,
  },
  claimAnimationContent: {
    alignItems: "center",
    gap: 16,
  },
  claimAnimationTitle: {
    fontSize: 28,
    fontWeight: "800" as const,
    color: "#FFFFFF",
  },
  claimAnimationText: {
    fontSize: 18,
    fontWeight: "700" as const,
    color: "#FFD700",
  },
});
