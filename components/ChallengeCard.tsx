import React, { useRef, useEffect } from 'react';
import { StyleSheet, Text, View, TouchableOpacity, Animated } from 'react-native';
import { router } from 'expo-router';
import { Clock, Zap, Coins, Users, Crown } from 'lucide-react-native';
import { Challenge } from '@/types/challenge';
import Colors from '@/constants/colors';

interface ChallengeCardProps {
  challenge: Challenge;
}

export function ChallengeCard({ challenge }: ChallengeCardProps) {
  const pulseAnim = useRef(new Animated.Value(1)).current;
  const progressAnim = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    if (!challenge.completed) {
      Animated.loop(
        Animated.sequence([
          Animated.timing(pulseAnim, {
            toValue: 1.03,
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
  }, [challenge.completed, pulseAnim]);

  useEffect(() => {
    const targetProgress = (challenge.current / challenge.target) * 100;
    Animated.spring(progressAnim, {
      toValue: targetProgress,
      useNativeDriver: false,
      tension: 50,
      friction: 7,
    }).start();
  }, [challenge, progressAnim]);

  const getDifficultyColor = () => {
    switch (challenge.difficulty) {
      case 'easy':
        return '#10B981';
      case 'medium':
        return '#F59E0B';
      case 'hard':
        return '#EF4444';
      case 'expert':
        return '#8B5CF6';
      default:
        return Colors.primary;
    }
  };

  const animatedWidth = progressAnim.interpolate({
    inputRange: [0, 100],
    outputRange: ['0%', '100%'],
  });

  const handlePress = () => {
    if (!challenge.completed) {
      router.push(`/challenge/${challenge.id}` as any);
    }
  };

  return (
    <TouchableOpacity
      activeOpacity={0.8}
      onPress={handlePress}
      disabled={challenge.completed}
    >
      <Animated.View
        style={[
          styles.container,
          {
            transform: [{ scale: challenge.completed ? 1 : pulseAnim }],
            borderColor: challenge.completed ? Colors.success : getDifficultyColor(),
            opacity: challenge.completed ? 0.7 : 1,
          },
        ]}
      >
        {challenge.completed && (
          <View style={styles.completedOverlay}>
            <Text style={styles.completedBadge}>✓</Text>
            <Text style={styles.completedText}>Completed</Text>
          </View>
        )}

        <View style={styles.header}>
          <View style={[styles.iconContainer, { backgroundColor: getDifficultyColor() + '20' }]}>
            <Text style={styles.icon}>{challenge.icon}</Text>
          </View>
          <View style={styles.headerContent}>
            <View style={styles.titleRow}>
              <Text style={styles.title} numberOfLines={1}>{challenge.name}</Text>
              {challenge.isWeekend && (
                <View style={styles.weekendBadge}>
                  <Text style={styles.weekendBadgeText}>WEEKEND</Text>
                </View>
              )}
              {challenge.isCommunity && (
                <View style={styles.communityBadge}>
                  <Users size={12} color="#FFFFFF" />
                </View>
              )}
            </View>
            <View style={[styles.difficultyBadge, { backgroundColor: getDifficultyColor() + '20' }]}>
              <Text style={[styles.difficultyText, { color: getDifficultyColor() }]}>
                {challenge.difficulty.toUpperCase()}
              </Text>
            </View>
          </View>
        </View>

        <Text style={styles.description} numberOfLines={2}>{challenge.description}</Text>

        <View style={styles.progressSection}>
          <View style={styles.progressHeader}>
            <Text style={styles.progressText}>
              {challenge.current}/{challenge.target}
            </Text>
            {!challenge.completed && (
              <View style={styles.timeIndicator}>
                <Clock size={12} color={Colors.textSecondary} />
                <Text style={styles.timeText}>Today</Text>
              </View>
            )}
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
            />
          </View>
        </View>

        {challenge.isCommunity && challenge.communityProgress !== undefined && (
          <View style={styles.communitySection}>
            <Users size={14} color={Colors.primary} />
            <Text style={styles.communityText}>
              Global: {challenge.communityProgress}/{challenge.communityTarget}
            </Text>
          </View>
        )}

        <View style={styles.rewards}>
          <View style={styles.rewardItem}>
            <Zap size={14} color={Colors.xpBar} fill={Colors.xpBar} />
            <Text style={styles.rewardText}>+{challenge.reward.xp} XP</Text>
          </View>
          <View style={styles.rewardItem}>
            <Coins size={14} color={Colors.coins} />
            <Text style={styles.rewardText}>+{challenge.reward.coins}</Text>
          </View>
          {challenge.reward.badge && (
            <View style={styles.rewardItem}>
              <Crown size={14} color="#FFD700" />
              <Text style={styles.rewardText}>Badge</Text>
            </View>
          )}
        </View>
      </Animated.View>
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
  container: {
    backgroundColor: Colors.surface,
    borderRadius: 16,
    padding: 16,
    marginBottom: 16,
    borderWidth: 2,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 4,
    position: 'relative',
  },
  completedOverlay: {
    position: 'absolute',
    top: 0,
    right: 0,
    padding: 12,
    alignItems: 'center',
    zIndex: 10,
  },
  completedBadge: {
    fontSize: 32,
    marginBottom: 4,
  },
  completedText: {
    fontSize: 11,
    fontWeight: '700' as const,
    color: Colors.success,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    marginBottom: 12,
    gap: 12,
  },
  iconContainer: {
    width: 48,
    height: 48,
    borderRadius: 24,
    alignItems: 'center',
    justifyContent: 'center',
  },
  icon: {
    fontSize: 24,
  },
  headerContent: {
    flex: 1,
  },
  titleRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    marginBottom: 6,
  },
  title: {
    fontSize: 16,
    fontWeight: '700' as const,
    color: Colors.text,
    flex: 1,
  },
  difficultyBadge: {
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 8,
    alignSelf: 'flex-start',
  },
  difficultyText: {
    fontSize: 10,
    fontWeight: '700' as const,
  },
  weekendBadge: {
    backgroundColor: '#8B5CF6',
    paddingHorizontal: 6,
    paddingVertical: 3,
    borderRadius: 6,
  },
  weekendBadgeText: {
    fontSize: 9,
    fontWeight: '700' as const,
    color: '#FFFFFF',
  },
  communityBadge: {
    backgroundColor: Colors.primary,
    width: 20,
    height: 20,
    borderRadius: 10,
    alignItems: 'center',
    justifyContent: 'center',
  },
  description: {
    fontSize: 13,
    color: Colors.textSecondary,
    marginBottom: 12,
    lineHeight: 18,
  },
  progressSection: {
    marginBottom: 12,
  },
  progressHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 8,
  },
  progressText: {
    fontSize: 12,
    fontWeight: '600' as const,
    color: Colors.text,
  },
  timeIndicator: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    backgroundColor: Colors.borderLight,
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 8,
  },
  timeText: {
    fontSize: 10,
    fontWeight: '600' as const,
    color: Colors.textSecondary,
  },
  progressBar: {
    height: 8,
    backgroundColor: Colors.borderLight,
    borderRadius: 4,
    overflow: 'hidden',
  },
  progressFill: {
    height: '100%',
    borderRadius: 4,
  },
  communitySection: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    backgroundColor: Colors.primary + '15',
    padding: 8,
    borderRadius: 8,
    marginBottom: 12,
  },
  communityText: {
    fontSize: 12,
    fontWeight: '600' as const,
    color: Colors.primary,
  },
  rewards: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
  },
  rewardItem: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    backgroundColor: Colors.borderLight,
    paddingHorizontal: 10,
    paddingVertical: 6,
    borderRadius: 8,
  },
  rewardText: {
    fontSize: 12,
    fontWeight: '600' as const,
    color: Colors.text,
  },
});
