import {
  StyleSheet,
  Text,
  View,
  TouchableOpacity,
  ScrollView,
  Platform,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { router, Stack, useLocalSearchParams } from "expo-router";
import { X, Zap, Coins, Crown, Clock, TrendingUp, Target } from "lucide-react-native";
import { LinearGradient } from "expo-linear-gradient";
import * as Haptics from "expo-haptics";
import { useLanguage } from "@/contexts/LanguageContext";
import { useChallenges } from "@/contexts/ChallengeContext";
import Colors from "@/constants/colors";
import { useEffect, useState } from "react";

export default function ChallengeDetailScreen() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const { t } = useLanguage();
  const { challenges, getChallengeById } = useChallenges();
  const [challenge, setChallenge] = useState(getChallengeById(id || ""));

  useEffect(() => {
    const foundChallenge = getChallengeById(id || "");
    setChallenge(foundChallenge);
  }, [id, challenges]);

  if (!challenge) {
    return (
      <SafeAreaView style={styles.container}>
        <Stack.Screen options={{ headerShown: false }} />
        <View style={styles.errorContainer}>
          <Text style={styles.errorText}>Challenge not found</Text>
          <TouchableOpacity onPress={() => router.back()} style={styles.backButton}>
            <Text style={styles.backButtonText}>Go Back</Text>
          </TouchableOpacity>
        </View>
      </SafeAreaView>
    );
  }

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

  const handleClose = async () => {
    if (Platform.OS !== 'web') {
      await Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    }
    router.back();
  };

  const handleStartChallenge = async () => {
    if (Platform.OS !== 'web') {
      await Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
    }
    // Navigate to home to start working on the challenge
    router.push("/(tabs)" as any);
  };

  const progressPercentage = (challenge.current / challenge.target) * 100;

  return (
    <View style={styles.container}>
      <Stack.Screen options={{ headerShown: false }} />
      
      <LinearGradient
        colors={[getDifficultyColor(), getDifficultyColor() + 'CC']}
        start={{ x: 0, y: 0 }}
        end={{ x: 1, y: 1 }}
        style={styles.header}
      >
        <SafeAreaView edges={["top"]}>
          <View style={styles.headerContent}>
            <TouchableOpacity onPress={handleClose} style={styles.closeButton}>
              <X size={24} color="#FFFFFF" />
            </TouchableOpacity>
            
            <View style={styles.iconContainer}>
              <Text style={styles.icon}>{challenge.icon}</Text>
            </View>
            
            <Text style={styles.challengeName}>{challenge.name}</Text>
            
            <View style={[styles.difficultyBadge, { backgroundColor: 'rgba(255, 255, 255, 0.3)' }]}>
              <Text style={styles.difficultyText}>
                {challenge.difficulty.toUpperCase()}
              </Text>
            </View>
          </View>
        </SafeAreaView>
      </LinearGradient>

      <ScrollView style={styles.content} showsVerticalScrollIndicator={false}>
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>📋 Description</Text>
          <Text style={styles.description}>{challenge.description}</Text>
        </View>

        <View style={styles.section}>
          <Text style={styles.sectionTitle}>🎯 Progress</Text>
          <View style={styles.progressCard}>
            <View style={styles.progressHeader}>
              <Text style={styles.progressText}>
                {challenge.current} / {challenge.target}
              </Text>
              <Text style={styles.progressPercentage}>
                {Math.round(progressPercentage)}%
              </Text>
            </View>
            <View style={styles.progressBar}>
              <View
                style={[
                  styles.progressFill,
                  {
                    width: `${progressPercentage}%`,
                    backgroundColor: getDifficultyColor(),
                  },
                ]}
              />
            </View>
            {challenge.completed && (
              <View style={styles.completedBadge}>
                <Text style={styles.completedText}>✓ Completed!</Text>
              </View>
            )}
          </View>
        </View>

        <View style={styles.section}>
          <Text style={styles.sectionTitle}>🏆 Rewards</Text>
          <View style={styles.rewardsGrid}>
            <View style={styles.rewardCard}>
              <Zap size={24} color={Colors.xpBar} fill={Colors.xpBar} />
              <Text style={styles.rewardValue}>+{challenge.reward.xp}</Text>
              <Text style={styles.rewardLabel}>XP</Text>
            </View>
            <View style={styles.rewardCard}>
              <Coins size={24} color={Colors.coins} />
              <Text style={styles.rewardValue}>+{challenge.reward.coins}</Text>
              <Text style={styles.rewardLabel}>Coins</Text>
            </View>
            {challenge.reward.badge && (
              <View style={styles.rewardCard}>
                <Crown size={24} color="#FFD700" fill="#FFD700" />
                <Text style={styles.rewardValue}>Special</Text>
                <Text style={styles.rewardLabel}>Badge</Text>
              </View>
            )}
          </View>
        </View>

        {challenge.requirement && (
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>📝 Requirements</Text>
            <View style={styles.requirementsCard}>
              {challenge.requirement.lessons && (
                <View style={styles.requirementRow}>
                  <Target size={16} color={Colors.primary} />
                  <Text style={styles.requirementText}>
                    Complete {challenge.requirement.lessons} lessons
                  </Text>
                </View>
              )}
              {challenge.requirement.perfectLessons && (
                <View style={styles.requirementRow}>
                  <Target size={16} color={Colors.primary} />
                  <Text style={styles.requirementText}>
                    Get {challenge.requirement.perfectLessons} perfect scores
                  </Text>
                </View>
              )}
              {challenge.requirement.timeLimit && (
                <View style={styles.requirementRow}>
                  <Clock size={16} color={Colors.primary} />
                  <Text style={styles.requirementText}>
                    Time limit: {Math.floor(challenge.requirement.timeLimit / 60)} minutes
                  </Text>
                </View>
              )}
              {challenge.requirement.differentModules && (
                <View style={styles.requirementRow}>
                  <TrendingUp size={16} color={Colors.primary} />
                  <Text style={styles.requirementText}>
                    Study {challenge.requirement.differentModules} different modules
                  </Text>
                </View>
              )}
            </View>
          </View>
        )}

        <View style={styles.section}>
          <Text style={styles.sectionTitle}>⏰ Time Remaining</Text>
          <View style={styles.timeCard}>
            <Clock size={20} color={Colors.text} />
            <Text style={styles.timeText}>
              {challenge.completed ? "Completed!" : "Today"}
            </Text>
          </View>
        </View>

        <View style={styles.bottomPadding} />
      </ScrollView>

      {!challenge.completed && (
        <SafeAreaView edges={["bottom"]} style={styles.footer}>
          <TouchableOpacity
            style={styles.startButton}
            onPress={handleStartChallenge}
            activeOpacity={0.8}
          >
            <LinearGradient
              colors={[getDifficultyColor(), getDifficultyColor() + 'DD']}
              start={{ x: 0, y: 0 }}
              end={{ x: 1, y: 0 }}
              style={styles.startButtonGradient}
            >
              <Text style={styles.startButtonText}>Start Challenge</Text>
            </LinearGradient>
          </TouchableOpacity>
        </SafeAreaView>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: Colors.background,
  },
  errorContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
  },
  errorText: {
    fontSize: 18,
    color: Colors.text,
    marginBottom: 20,
  },
  backButton: {
    backgroundColor: Colors.primary,
    paddingHorizontal: 24,
    paddingVertical: 12,
    borderRadius: 12,
  },
  backButtonText: {
    color: '#FFFFFF',
    fontSize: 16,
    fontWeight: '600' as const,
  },
  header: {
    paddingTop: Platform.OS === 'ios' ? 0 : 20,
    paddingBottom: 24,
  },
  headerContent: {
    alignItems: 'center',
    paddingHorizontal: 20,
  },
  closeButton: {
    alignSelf: 'flex-end',
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: 'rgba(255, 255, 255, 0.2)',
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 20,
  },
  iconContainer: {
    width: 80,
    height: 80,
    borderRadius: 40,
    backgroundColor: 'rgba(255, 255, 255, 0.3)',
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 16,
  },
  icon: {
    fontSize: 40,
  },
  challengeName: {
    fontSize: 28,
    fontWeight: '800' as const,
    color: '#FFFFFF',
    textAlign: 'center',
    marginBottom: 12,
  },
  difficultyBadge: {
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 12,
  },
  difficultyText: {
    fontSize: 12,
    fontWeight: '700' as const,
    color: '#FFFFFF',
  },
  content: {
    flex: 1,
  },
  section: {
    paddingHorizontal: 20,
    marginTop: 24,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: '700' as const,
    color: Colors.text,
    marginBottom: 12,
  },
  description: {
    fontSize: 15,
    color: Colors.textSecondary,
    lineHeight: 22,
  },
  progressCard: {
    backgroundColor: Colors.surface,
    borderRadius: 16,
    padding: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 3,
  },
  progressHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 12,
  },
  progressText: {
    fontSize: 16,
    fontWeight: '700' as const,
    color: Colors.text,
  },
  progressPercentage: {
    fontSize: 14,
    fontWeight: '600' as const,
    color: Colors.textSecondary,
  },
  progressBar: {
    height: 12,
    backgroundColor: Colors.borderLight,
    borderRadius: 6,
    overflow: 'hidden',
  },
  progressFill: {
    height: '100%',
    borderRadius: 6,
  },
  completedBadge: {
    marginTop: 12,
    alignItems: 'center',
  },
  completedText: {
    fontSize: 14,
    fontWeight: '700' as const,
    color: Colors.success,
  },
  rewardsGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 12,
  },
  rewardCard: {
    flex: 1,
    minWidth: 100,
    backgroundColor: Colors.surface,
    borderRadius: 16,
    padding: 16,
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 3,
  },
  rewardValue: {
    fontSize: 20,
    fontWeight: '700' as const,
    color: Colors.text,
    marginTop: 8,
  },
  rewardLabel: {
    fontSize: 12,
    color: Colors.textSecondary,
    marginTop: 4,
  },
  requirementsCard: {
    backgroundColor: Colors.surface,
    borderRadius: 16,
    padding: 16,
    gap: 12,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 3,
  },
  requirementRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  requirementText: {
    fontSize: 14,
    color: Colors.text,
    flex: 1,
  },
  timeCard: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    backgroundColor: Colors.surface,
    borderRadius: 16,
    padding: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 3,
  },
  timeText: {
    fontSize: 16,
    fontWeight: '600' as const,
    color: Colors.text,
  },
  bottomPadding: {
    height: 100,
  },
  footer: {
    paddingHorizontal: 20,
    paddingTop: 12,
    paddingBottom: 12,
    backgroundColor: Colors.background,
    borderTopWidth: 1,
    borderTopColor: Colors.border,
  },
  startButton: {
    borderRadius: 16,
    overflow: 'hidden',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.2,
    shadowRadius: 8,
    elevation: 6,
  },
  startButtonGradient: {
    paddingVertical: 16,
    alignItems: 'center',
  },
  startButtonText: {
    fontSize: 18,
    fontWeight: '700' as const,
    color: '#FFFFFF',
  },
});
