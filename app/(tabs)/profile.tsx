import { useState, useMemo } from "react";
import { StyleSheet, Text, View, ScrollView, TouchableOpacity, Alert, Platform } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import {
  User,
  Zap,
  Trophy,
  Target,
  Award,
  Star,
  TrendingUp,
  RefreshCw,
  Languages,
  LogOut,
  Share2,
} from "lucide-react-native";
import * as Haptics from "expo-haptics";
import { useUserProgress } from "@/contexts/UserProgressContext";
import { useLanguage } from "@/contexts/LanguageContext";
import { useAuth } from "@/contexts/AuthContext";
import { achievements } from "@/data/achievements";
import Colors from "@/constants/colors";
import { safeInteger, safePercentage } from "@/utils/safeNumeric";
import { shareTemplates, ShareTemplate } from "@/utils/shareTemplates";
import { ShareCardModal } from "@/components/ShareCardModal";



export default function ProfileScreen() {
  const { progress: rawProgress, resetProgress } = useUserProgress();
  
  const progress = useMemo(() => ({
    ...rawProgress,
    level: safeInteger(rawProgress.level, 1),
    totalXP: safeInteger(rawProgress.totalXP, 0),
    streak: safeInteger(rawProgress.streak, 0),
    completedLessons: rawProgress.completedLessons || [],
    coins: safeInteger(rawProgress.coins, 0),
    perfectLessons: safeInteger(rawProgress.perfectLessons, 0),
    bestCombo: safeInteger(rawProgress.bestCombo, 0),
    xpMultiplier: safeInteger(rawProgress.xpMultiplier, 1),
    achievements: rawProgress.achievements || [],
  }), [rawProgress]);
  const { language, setLanguage, t } = useLanguage();
  const { user, signOut } = useAuth();

  const [shareModalVisible, setShareModalVisible] = useState(false);
  const [shareCardType, setShareCardType] = useState<'achievement' | 'level' | 'streak' | 'duel' | 'perfect' | 'score'>('achievement');
  const [shareCardData, setShareCardData] = useState<Record<string, unknown>>({});
  const [shareTemplate, setShareTemplate] = useState<ShareTemplate>({ text: '' });

  const userAchievements = achievements.map((achievement) => {
    const userProgress = progress.achievements.find((a) => a.id === achievement.id);
    return {
      ...achievement,
      tier: userProgress?.tier || 'none',
      progress: userProgress?.progress || 0,
      unlockedAt: userProgress?.unlockedAt,
    };
  });

  const completionRate = Math.round(
    safePercentage(progress.completedLessons.length, 10, 0)
  );

  const handleShareAchievement = async (achievementName: string, achievementIcon: string, tier: string) => {
    if (Platform.OS !== 'web') {
      await Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    }
    setShareCardType('achievement');
    setShareCardData({
      achievementName,
      achievementIcon,
      tier,
    });
    setShareTemplate(shareTemplates.ACHIEVEMENT_UNLOCK(achievementName, tier));
    setShareModalVisible(true);
  };

  const handleShareStreak = async () => {
    if (Platform.OS !== 'web') {
      await Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    }
    setShareCardType('streak');
    setShareCardData({
      days: progress.streak,
    });
    setShareTemplate(shareTemplates.STREAK_MILESTONE(progress.streak));
    setShareModalVisible(true);
  };

  const handleShareLevel = async () => {
    if (Platform.OS !== 'web') {
      await Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    }
    setShareCardType('level');
    setShareCardData({
      level: progress.level,
      totalXP: progress.totalXP,
    });
    setShareTemplate(shareTemplates.LEVEL_UP(progress.level));
    setShareModalVisible(true);
  };

  return (
    <SafeAreaView style={styles.container} edges={["top"]}>
      <ScrollView
        style={styles.scrollView}
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
      >
        <View style={styles.header}>
          <View style={styles.avatarContainer}>
            <View style={styles.avatar}>
              <User size={40} color={Colors.surface} />
            </View>
            <View style={styles.levelBadge}>
              <Zap size={12} color={Colors.surface} />
              <Text style={styles.levelBadgeText}>{safeInteger(progress.level, 1)}</Text>
            </View>
          </View>

          <Text style={styles.userName}>{user?.displayName || t.profile.userName}</Text>
          <Text style={styles.userEmail}>{user?.email}</Text>
          <Text style={styles.userLevel}>{t.common.level} {safeInteger(progress.level, 1)}</Text>

          {progress.level >= 5 && (
            <TouchableOpacity
              style={styles.shareProfileButton}
              onPress={handleShareLevel}
            >
              <Share2 size={16} color={Colors.surface} />
              <Text style={styles.shareProfileButtonText}>Compartilhar Progresso</Text>
            </TouchableOpacity>
          )}
        </View>

        <View style={styles.statsSection}>
          <View style={styles.statsGrid}>
            <View style={styles.statBox}>
              <View style={styles.statIconContainer}>
                <TrendingUp size={24} color={Colors.primary} />
              </View>
              <Text style={styles.statValue}>{safeInteger(progress.totalXP, 0)}</Text>
              <Text style={styles.statLabel}>{t.profile.totalXP}</Text>
            </View>

            <View style={styles.statBox}>
              <View style={styles.statIconContainer}>
                <Trophy size={24} color={Colors.coins} />
              </View>
              <Text style={styles.statValue}>{safeInteger(progress.completedLessons.length, 0)}</Text>
              <Text style={styles.statLabel}>{t.profile.completed}</Text>
            </View>

            <View style={styles.statBox}>
              <View style={styles.statIconContainer}>
                <Target size={24} color={Colors.success} />
              </View>
              <Text style={styles.statValue}>{completionRate}%</Text>
              <Text style={styles.statLabel}>{t.profile.progress}</Text>
            </View>

            <TouchableOpacity
              style={styles.statBox}
              onPress={progress.streak >= 7 ? handleShareStreak : undefined}
              disabled={progress.streak < 7}
            >
              <View style={styles.statIconContainer}>
                <Star size={24} color={Colors.streak} />
              </View>
              <Text style={styles.statValue}>{safeInteger(progress.streak, 0)}</Text>
              <Text style={styles.statLabel}>{t.profile.dayStreak}</Text>
              {progress.streak >= 7 && (
                <View style={styles.shareIndicator}>
                  <Share2 size={12} color={Colors.primary} />
                </View>
              )}
            </TouchableOpacity>
          </View>
        </View>

        <View style={styles.section}>
          <View style={styles.sectionHeader}>
            <Award size={20} color={Colors.primary} />
            <Text style={styles.sectionTitle}>{t.profile.achievements}</Text>
          </View>

          <View style={styles.achievementsGrid}>
            {userAchievements.map((achievement) => {
              const isUnlocked = achievement.tier !== 'none';
              const tierColor = 
                achievement.tier === 'gold' ? '#FFD700' :
                achievement.tier === 'silver' ? '#C0C0C0' :
                achievement.tier === 'bronze' ? '#CD7F32' : Colors.border;

              return (
                <TouchableOpacity
                  key={achievement.id}
                  style={[
                    styles.achievementCard,
                    !isUnlocked && styles.achievementLocked,
                    isUnlocked && { borderColor: tierColor, borderWidth: 2 },
                  ]}
                  onPress={() => isUnlocked && handleShareAchievement(achievement.name, achievement.icon, achievement.tier)}
                  disabled={!isUnlocked}
                >
                  <Text style={styles.achievementIcon}>{achievement.icon}</Text>
                  <Text style={styles.achievementName}>{achievement.name}</Text>
                  <Text style={styles.achievementDescription}>
                    {achievement.description}
                  </Text>
                  {isUnlocked && (
                    <View style={[styles.tierBadge, { backgroundColor: tierColor }]}>
                      <Text style={styles.tierText}>
                        {achievement.tier.toUpperCase()}
                      </Text>
                    </View>
                  )}
                  {isUnlocked && (
                    <View style={styles.achievementShareIcon}>
                      <Share2 size={14} color={Colors.primary} />
                    </View>
                  )}
                  {!isUnlocked && (
                    <View style={styles.progressInfo}>
                      <Text style={styles.progressInfoText}>
                        {achievement.progress}/{achievement.tiers.bronze}
                      </Text>
                    </View>
                  )}
                </TouchableOpacity>
              );
            })}
          </View>
        </View>

        <View style={styles.section}>
          <Text style={styles.sectionTitle}>{t.profile.studyStatistics}</Text>

          <View style={styles.statCard}>
            <View style={styles.statCardRow}>
              <Text style={styles.statCardLabel}>{t.profile.currentLevel}</Text>
              <Text style={styles.statCardValue}>{t.common.level} {safeInteger(progress.level, 1)}</Text>
            </View>
            <View style={styles.statCardDivider} />
            <View style={styles.statCardRow}>
              <Text style={styles.statCardLabel}>{t.profile.lessonsCompleted}</Text>
              <Text style={styles.statCardValue}>
                {safeInteger(progress.completedLessons.length, 0)} / 10
              </Text>
            </View>
            <View style={styles.statCardDivider} />
            <View style={styles.statCardRow}>
              <Text style={styles.statCardLabel}>{t.profile.totalExperience}</Text>
              <Text style={styles.statCardValue}>{safeInteger(progress.totalXP, 0)} XP</Text>
            </View>
            <View style={styles.statCardDivider} />
            <View style={styles.statCardRow}>
              <Text style={styles.statCardLabel}>{t.profile.lingoCoinsBalance}</Text>
              <Text style={styles.statCardValue}>{safeInteger(progress.coins, 0)} {t.common.coins}</Text>
            </View>
            <View style={styles.statCardDivider} />
            <View style={styles.statCardRow}>
              <Text style={styles.statCardLabel}>Perfect Lessons</Text>
              <Text style={styles.statCardValue}>{safeInteger(progress.perfectLessons, 0)}</Text>
            </View>
            <View style={styles.statCardDivider} />
            <View style={styles.statCardRow}>
              <Text style={styles.statCardLabel}>Best Combo</Text>
              <Text style={styles.statCardValue}>{safeInteger(progress.bestCombo, 0)}x 🔥</Text>
            </View>
            <View style={styles.statCardDivider} />
            <View style={styles.statCardRow}>
              <Text style={styles.statCardLabel}>XP Multiplier</Text>
              <Text style={styles.statCardValue}>{safeInteger(progress.xpMultiplier, 1)}x</Text>
            </View>
          </View>
        </View>

        <View style={styles.section}>
          <Text style={styles.sectionTitle}>{t.profile.languageSettings}</Text>
          <View style={styles.languageCard}>
            <View style={styles.languageHeader}>
              <Languages size={20} color={Colors.primary} />
              <Text style={styles.languageTitle}>{t.profile.selectLanguage}</Text>
            </View>
            <View style={styles.languageButtons}>
              <TouchableOpacity
                style={[
                  styles.languageButton,
                  language === "en" && styles.languageButtonActive,
                ]}
                onPress={() => setLanguage("en")}
              >
                <Text
                  style={[
                    styles.languageButtonText,
                    language === "en" && styles.languageButtonTextActive,
                  ]}
                >
                  🇺🇸 English
                </Text>
              </TouchableOpacity>
              <TouchableOpacity
                style={[
                  styles.languageButton,
                  language === "pt" && styles.languageButtonActive,
                ]}
                onPress={() => setLanguage("pt")}
              >
                <Text
                  style={[
                    styles.languageButtonText,
                    language === "pt" && styles.languageButtonTextActive,
                  ]}
                >
                  🇧🇷 Português
                </Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>

        <View style={styles.section}>
          <TouchableOpacity
            style={styles.resetButton}
            onPress={() => {
              if (Platform.OS === 'web') {
                if (confirm(t.profile.resetConfirmMessage)) {
                  resetProgress();
                }
              } else {
                Alert.alert(
                  t.profile.resetConfirmTitle,
                  t.profile.resetConfirmMessage,
                  [
                    { text: t.profile.cancel, style: "cancel" },
                    { text: t.profile.reset, style: "destructive", onPress: resetProgress },
                  ]
                );
              }
            }}
          >
            <RefreshCw size={18} color={Colors.danger} />
            <Text style={styles.resetButtonText}>{t.profile.resetProgress}</Text>
          </TouchableOpacity>
        </View>

        <View style={styles.section}>
          <TouchableOpacity
            style={styles.logoutButton}
            onPress={signOut}
          >
            <LogOut size={18} color={Colors.primary} />
            <Text style={styles.logoutButtonText}>{t.profile.logout}</Text>
          </TouchableOpacity>
        </View>

        <View style={styles.bottomPadding} />
      </ScrollView>

      <ShareCardModal
        visible={shareModalVisible}
        onClose={() => setShareModalVisible(false)}
        cardType={shareCardType}
        cardData={shareCardData}
        shareTemplate={shareTemplate}
      />
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: Colors.background,
  },
  scrollView: {
    flex: 1,
  },
  scrollContent: {
    paddingBottom: 20,
  },
  header: {
    alignItems: "center",
    paddingVertical: 32,
    paddingHorizontal: 20,
  },
  avatarContainer: {
    position: "relative",
    marginBottom: 16,
  },
  avatar: {
    width: 100,
    height: 100,
    borderRadius: 50,
    backgroundColor: Colors.primary,
    alignItems: "center",
    justifyContent: "center",
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.2,
    shadowRadius: 8,
    elevation: 8,
  },
  levelBadge: {
    position: "absolute",
    bottom: 0,
    right: 0,
    backgroundColor: Colors.success,
    width: 32,
    height: 32,
    borderRadius: 16,
    alignItems: "center",
    justifyContent: "center",
    flexDirection: "row",
    gap: 2,
    borderWidth: 3,
    borderColor: Colors.background,
  },
  levelBadgeText: {
    fontSize: 12,
    fontWeight: "700" as const,
    color: Colors.surface,
  },
  userName: {
    fontSize: 24,
    fontWeight: "700" as const,
    color: Colors.text,
    marginBottom: 4,
  },
  userLevel: {
    fontSize: 14,
    color: Colors.textSecondary,
  },
  userEmail: {
    fontSize: 13,
    color: Colors.textSecondary,
    marginTop: 4,
  },
  statsSection: {
    paddingHorizontal: 20,
    marginBottom: 24,
  },
  statsGrid: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: 12,
  },
  statBox: {
    flex: 1,
    minWidth: "45%",
    backgroundColor: Colors.surface,
    borderRadius: 12,
    padding: 16,
    alignItems: "center",
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 4,
    elevation: 2,
  },
  statIconContainer: {
    marginBottom: 8,
  },
  statValue: {
    fontSize: 24,
    fontWeight: "700" as const,
    color: Colors.text,
    marginBottom: 4,
  },
  statLabel: {
    fontSize: 12,
    color: Colors.textSecondary,
  },
  section: {
    paddingHorizontal: 20,
    marginBottom: 24,
  },
  sectionHeader: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
    marginBottom: 16,
  },
  sectionTitle: {
    fontSize: 20,
    fontWeight: "700" as const,
    color: Colors.text,
    marginBottom: 16,
  },
  achievementsGrid: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: 12,
  },
  achievementCard: {
    flex: 1,
    minWidth: "45%",
    backgroundColor: Colors.surface,
    borderRadius: 12,
    padding: 16,
    alignItems: "center",
    position: "relative",
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 4,
    elevation: 2,
  },
  achievementLocked: {
    opacity: 0.5,
  },
  achievementIcon: {
    fontSize: 32,
    marginBottom: 8,
  },
  achievementName: {
    fontSize: 13,
    fontWeight: "700" as const,
    color: Colors.text,
    textAlign: "center",
    marginBottom: 4,
  },
  achievementDescription: {
    fontSize: 11,
    color: Colors.textSecondary,
    textAlign: "center",
  },
  tierBadge: {
    position: "absolute",
    top: 8,
    right: 8,
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 6,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.3,
    shadowRadius: 4,
    elevation: 4,
  },
  tierText: {
    color: Colors.surface,
    fontSize: 9,
    fontWeight: "800" as const,
  },
  progressInfo: {
    marginTop: 8,
    paddingTop: 8,
    borderTopWidth: 1,
    borderTopColor: Colors.border,
    width: "100%",
  },
  progressInfoText: {
    fontSize: 11,
    color: Colors.textSecondary,
    textAlign: "center",
    fontWeight: "600" as const,
  },
  statCard: {
    backgroundColor: Colors.surface,
    borderRadius: 12,
    padding: 16,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 4,
    elevation: 2,
  },
  statCardRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    paddingVertical: 12,
  },
  statCardLabel: {
    fontSize: 14,
    color: Colors.textSecondary,
  },
  statCardValue: {
    fontSize: 14,
    fontWeight: "700" as const,
    color: Colors.text,
  },
  statCardDivider: {
    height: 1,
    backgroundColor: Colors.border,
  },
  resetButton: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: 8,
    backgroundColor: Colors.surface,
    borderRadius: 12,
    padding: 16,
    borderWidth: 1,
    borderColor: Colors.danger,
  },
  resetButtonText: {
    fontSize: 14,
    fontWeight: "600" as const,
    color: Colors.danger,
  },
  bottomPadding: {
    height: 20,
  },
  languageCard: {
    backgroundColor: Colors.surface,
    borderRadius: 12,
    padding: 16,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 4,
    elevation: 2,
  },
  languageHeader: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
    marginBottom: 12,
  },
  languageTitle: {
    fontSize: 16,
    fontWeight: "600" as const,
    color: Colors.text,
  },
  languageButtons: {
    flexDirection: "row",
    gap: 12,
  },
  languageButton: {
    flex: 1,
    backgroundColor: Colors.borderLight,
    borderRadius: 8,
    padding: 12,
    alignItems: "center",
    borderWidth: 2,
    borderColor: "transparent",
  },
  languageButtonActive: {
    backgroundColor: Colors.primary + "20",
    borderColor: Colors.primary,
  },
  languageButtonText: {
    fontSize: 14,
    fontWeight: "600" as const,
    color: Colors.textSecondary,
  },
  languageButtonTextActive: {
    color: Colors.primary,
  },
  logoutButton: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: 8,
    backgroundColor: Colors.surface,
    borderRadius: 12,
    padding: 16,
    borderWidth: 1,
    borderColor: Colors.primary,
  },
  logoutButtonText: {
    fontSize: 14,
    fontWeight: "600" as const,
    color: Colors.primary,
  },
  shareProfileButton: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
    backgroundColor: "#25D366",
    paddingVertical: 12,
    paddingHorizontal: 20,
    borderRadius: 12,
    marginTop: 16,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.2,
    shadowRadius: 4,
    elevation: 4,
  },
  shareProfileButtonText: {
    fontSize: 14,
    fontWeight: "700" as const,
    color: Colors.surface,
  },
  shareIndicator: {
    position: "absolute",
    top: 8,
    right: 8,
    backgroundColor: Colors.surface,
    width: 20,
    height: 20,
    borderRadius: 10,
    alignItems: "center",
    justifyContent: "center",
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 2,
    elevation: 2,
  },
  achievementShareIcon: {
    position: "absolute",
    bottom: 8,
    left: 8,
    backgroundColor: Colors.surface,
    width: 24,
    height: 24,
    borderRadius: 12,
    alignItems: "center",
    justifyContent: "center",
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 2,
    elevation: 2,
  },
});
