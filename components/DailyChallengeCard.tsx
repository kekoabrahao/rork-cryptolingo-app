import { StyleSheet, Text, View, Animated, TouchableOpacity } from "react-native";
import { CheckCircle, Clock, Zap, TrendingUp } from "lucide-react-native";
import { useUserProgress } from "@/contexts/UserProgressContext";
import { useLanguage } from "@/contexts/LanguageContext";
import { analytics } from "@/utils/analytics";
import Colors from "@/constants/colors";
import { useRef, useEffect } from "react";

export default function DailyChallengeCard() {
  const { progress } = useUserProgress();
  const { t } = useLanguage();
  const pulseAnim = useRef(new Animated.Value(1)).current;
  const progressAnim = useRef(new Animated.Value(0)).current;
  const completedScale = useRef(new Animated.Value(0)).current;
  const hasTrackedRef = useRef(false);

  const challenge = progress.dailyChallenge;
  const today = new Date().toISOString().split("T")[0];

  useEffect(() => {
    if (challenge && !challenge.completed && !hasTrackedRef.current) {
      analytics.trackDailyChallengeStarted(
        challenge.id,
        challenge.difficulty,
        progress.level
      );
      hasTrackedRef.current = true;
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [challenge?.id, challenge?.difficulty, challenge?.completed, progress.level]);

  useEffect(() => {
    if (challenge && !challenge.completed) {
      Animated.loop(
        Animated.sequence([
          Animated.timing(pulseAnim, {
            toValue: 1.05,
            duration: 1500,
            useNativeDriver: true,
          }),
          Animated.timing(pulseAnim, {
            toValue: 1,
            duration: 1500,
            useNativeDriver: true,
          }),
        ])
      ).start();
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [challenge?.completed, pulseAnim]);

  useEffect(() => {
    if (challenge) {
      const targetProgress = (challenge.current / challenge.target) * 100;
      Animated.spring(progressAnim, {
        toValue: targetProgress,
        useNativeDriver: false,
        tension: 50,
        friction: 7,
      }).start();
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [challenge?.current, challenge?.target, progressAnim]);

  useEffect(() => {
    if (challenge?.completed) {
      Animated.spring(completedScale, {
        toValue: 1,
        useNativeDriver: true,
        tension: 100,
        friction: 7,
      }).start();
    } else {
      completedScale.setValue(0);
    }
  }, [challenge?.completed, completedScale]);

  if (!challenge || challenge.date !== today) {
    return null;
  }

  const progressPercent = Math.min((challenge.current / challenge.target) * 100, 100);
  const animatedWidth = progressAnim.interpolate({
    inputRange: [0, 100],
    outputRange: ['0%', '100%'],
  });

  const getDifficultyColor = () => {
    switch (challenge.difficulty) {
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

  const getDifficultyLabel = () => {
    switch (challenge.difficulty) {
      case 'easy':
        return t.challenges?.easy || 'Easy';
      case 'medium':
        return t.challenges?.medium || 'Medium';
      case 'hard':
        return t.challenges?.hard || 'Hard';
      default:
        return '';
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

  return (
    <TouchableOpacity activeOpacity={1} style={styles.wrapper}>
      <Animated.View
        style={[
          styles.container,
          {
            transform: [{ scale: challenge.completed ? 1 : pulseAnim }],
            borderColor: challenge.completed ? Colors.success : getDifficultyColor(),
          },
        ]}
      >
        {challenge.completed && (
          <Animated.View
            style={[
              styles.completedOverlay,
              {
                transform: [{ scale: completedScale }],
                opacity: completedScale,
              },
            ]}
          >
            <View style={styles.completedBadge}>
              <CheckCircle size={48} color={Colors.success} fill={Colors.success} />
              <Text style={styles.completedText}>{t.challenges?.completed || '🎉 Completed!'}</Text>
            </View>
          </Animated.View>
        )}

        <View style={styles.header}>
          <View style={[styles.iconContainer, { backgroundColor: getDifficultyColor() + '20' }]}>
            <Text style={styles.challengeEmoji}>{challenge.icon}</Text>
          </View>
          <View style={styles.headerText}>
            <View style={styles.titleRow}>
              <Text style={styles.title}>{challenge.name}</Text>
              <View style={[styles.difficultyBadge, { backgroundColor: getDifficultyColor() + '20' }]}>
                <Text style={[styles.difficultyText, { color: getDifficultyColor() }]}>
                  {getDifficultyLabel()}
                </Text>
              </View>
            </View>
            <Text style={styles.subtitle}>{challenge.description}</Text>
          </View>
        </View>

        <View style={styles.progressContainer}>
          <View style={styles.progressHeader}>
            <Text style={styles.progressLabel}>
              {t.challenges?.progress || 'Progress'}: {challenge.current}/{challenge.target}
            </Text>
            <View style={styles.timeContainer}>
              <Clock size={12} color={Colors.textSecondary} />
              <Text style={styles.timeText}>{getTimeRemaining()}</Text>
            </View>
          </View>
          <View style={styles.progressBar}>
            <Animated.View
              style={[
                styles.progressFill,
                {
                  width: animatedWidth,
                  backgroundColor: challenge.completed ? Colors.success : getDifficultyColor(),
                },
              ]}
            >
              {progressPercent > 20 && (
                <View style={styles.progressShine} />
              )}
            </Animated.View>
          </View>
        </View>

        <View style={styles.rewards}>
          <View style={styles.rewardItem}>
            <Zap size={16} color={Colors.xpBar} fill={Colors.xpBar} />
            <Text style={styles.rewardText}>+{challenge.reward.xp} XP</Text>
          </View>
          <View style={styles.rewardItem}>
            <Text style={styles.rewardIcon}>💰</Text>
            <Text style={styles.rewardText}>+{challenge.reward.coins}</Text>
          </View>
          {challenge.reward.livesBonus && challenge.reward.livesBonus > 0 && (
            <View style={styles.rewardItem}>
              <Text style={styles.rewardIcon}>❤️</Text>
              <Text style={styles.rewardText}>+{challenge.reward.livesBonus}</Text>
            </View>
          )}
          {!challenge.completed && (
            <View style={[styles.rewardItem, styles.boostBadge]}>
              <TrendingUp size={14} color={Colors.primary} />
              <Text style={[styles.rewardText, { color: Colors.primary }]}>
                {t.challenges?.bonus || 'Bonus'}
              </Text>
            </View>
          )}
        </View>
      </Animated.View>
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
  wrapper: {
    marginBottom: 20,
  },
  container: {
    backgroundColor: Colors.surface,
    borderRadius: 20,
    padding: 20,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.15,
    shadowRadius: 12,
    elevation: 6,
    borderWidth: 3,
    position: "relative",
    overflow: "hidden",
  },
  completedOverlay: {
    position: "absolute",
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    backgroundColor: Colors.success + "15",
    alignItems: "center",
    justifyContent: "center",
    zIndex: 10,
    borderRadius: 20,
  },
  completedBadge: {
    alignItems: "center",
    gap: 12,
  },
  completedText: {
    fontSize: 20,
    fontWeight: "800" as const,
    color: Colors.success,
  },
  header: {
    flexDirection: "row",
    alignItems: "flex-start",
    marginBottom: 16,
    gap: 12,
  },
  iconContainer: {
    width: 52,
    height: 52,
    borderRadius: 26,
    alignItems: "center",
    justifyContent: "center",
  },
  challengeEmoji: {
    fontSize: 28,
  },
  headerText: {
    flex: 1,
  },
  titleRow: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    marginBottom: 4,
    gap: 8,
  },
  title: {
    fontSize: 18,
    fontWeight: "800" as const,
    color: Colors.text,
    flex: 1,
  },
  difficultyBadge: {
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 12,
  },
  difficultyText: {
    fontSize: 11,
    fontWeight: "700" as const,
    textTransform: "uppercase" as const,
  },
  subtitle: {
    fontSize: 14,
    color: Colors.textSecondary,
    lineHeight: 20,
  },
  progressContainer: {
    marginBottom: 16,
  },
  progressHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 8,
  },
  progressLabel: {
    fontSize: 13,
    fontWeight: "700" as const,
    color: Colors.text,
  },
  timeContainer: {
    flexDirection: "row",
    alignItems: "center",
    gap: 4,
    backgroundColor: Colors.borderLight,
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 8,
  },
  timeText: {
    fontSize: 11,
    fontWeight: "600" as const,
    color: Colors.textSecondary,
  },
  progressBar: {
    height: 12,
    backgroundColor: Colors.borderLight,
    borderRadius: 6,
    overflow: "hidden",
  },
  progressFill: {
    height: "100%",
    borderRadius: 6,
    position: "relative",
  },
  progressShine: {
    position: "absolute",
    top: 0,
    left: 0,
    right: 0,
    height: "50%",
    backgroundColor: "rgba(255, 255, 255, 0.3)",
    borderRadius: 6,
  },
  rewards: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: 10,
  },
  rewardItem: {
    flexDirection: "row",
    alignItems: "center",
    gap: 6,
    backgroundColor: Colors.borderLight,
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 10,
  },
  boostBadge: {
    backgroundColor: Colors.primary + "15",
  },
  rewardIcon: {
    fontSize: 16,
  },
  rewardText: {
    fontSize: 13,
    fontWeight: "700" as const,
    color: Colors.text,
  },
});
