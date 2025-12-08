import { useState, useMemo } from "react";
import { StyleSheet, Text, View, ScrollView, TouchableOpacity, Alert, Platform } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { Trophy, Crown, Medal, Award, Swords, Share2 } from "lucide-react-native";
import { useRouter } from "expo-router";
import * as Haptics from "expo-haptics";
import { useUserProgress } from "@/contexts/UserProgressContext";
import { useLanguage } from "@/contexts/LanguageContext";
import { useDuel } from "@/contexts/DuelContext";
import { shareTemplates, ShareTemplate } from "@/utils/shareTemplates";
import { ShareCardModal } from "@/components/ShareCardModal";
import Colors from "@/constants/colors";
import { safeInteger } from "@/utils/safeNumeric";

const mockLeaderboard = [
  { rank: 1, name: "CryptoMaster", level: 15, xp: 1520, streak: 45 },
  { rank: 2, name: "BlockchainPro", level: 14, xp: 1480, streak: 38 },
  { rank: 3, name: "BitcoinGuru", level: 13, xp: 1350, streak: 32 },
  { rank: 4, name: "EthereumFan", level: 12, xp: 1240, streak: 28 },
  { rank: 5, name: "DeFiExpert", level: 11, xp: 1180, streak: 25 },
  { rank: 6, name: "NFTCollector", level: 10, xp: 1050, streak: 22 },
  { rank: 7, name: "CryptoTrader", level: 9, xp: 950, streak: 18 },
  { rank: 8, name: "AltcoinKing", level: 8, xp: 850, streak: 15 },
];

export default function LeaderboardScreen() {
  const router = useRouter();
  const { progress: rawProgress } = useUserProgress();
  
  const progress = useMemo(() => ({
    ...rawProgress,
    level: safeInteger(rawProgress.level, 1),
    totalXP: safeInteger(rawProgress.totalXP, 0),
    streak: safeInteger(rawProgress.streak, 0),
    completedLessons: rawProgress.completedLessons || [],
  }), [rawProgress]);
  const { t } = useLanguage();
  const { startDuel, isSearching } = useDuel();

  const [shareModalVisible, setShareModalVisible] = useState(false);
  const [shareCardType, setShareCardType] = useState<'achievement' | 'level' | 'streak' | 'duel' | 'perfect' | 'score'>('score');
  const [shareCardData, setShareCardData] = useState<Record<string, unknown>>({});
  const [shareTemplate, setShareTemplate] = useState<ShareTemplate>({ text: '' });

  const getRankIcon = (rank: number) => {
    switch (rank) {
      case 1:
        return <Crown size={24} color="#FFD700" />;
      case 2:
        return <Medal size={24} color="#C0C0C0" />;
      case 3:
        return <Medal size={24} color="#CD7F32" />;
      default:
        return <Trophy size={24} color={Colors.textLight} />;
    }
  };

  const handleChallenge = (player: typeof mockLeaderboard[0]) => {
    if (isSearching) return;

    const challengeMessage = `Challenge ${player.name} to a crypto knowledge duel?`;
    
    if (Platform.OS === 'web') {
      if (confirm(challengeMessage)) {
        startDuel(progress.level);
        router.push('/duel');
      }
    } else {
      Alert.alert(
        'Challenge Player',
        challengeMessage,
        [
          { text: 'Cancel', style: 'cancel' },
          { 
            text: 'Challenge', 
            onPress: () => {
              startDuel(progress.level);
              router.push('/duel');
            }
          },
        ]
      );
    }
  };

  const handleShareProgress = async () => {
    if (Platform.OS !== 'web') {
      await Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    }
    setShareCardType('score');
    setShareCardData({
      totalXP: progress.totalXP,
      level: progress.level,
      completedLessons: progress.completedLessons.length,
    });
    setShareTemplate(shareTemplates.HIGH_SCORE(progress.totalXP, progress.level));
    setShareModalVisible(true);
  };

  return (
    <SafeAreaView style={styles.container} edges={["top"]}>
      <View style={styles.header}>
        <Trophy size={32} color={Colors.primary} />
        <Text style={styles.title}>{t.leaderboard.title}</Text>
        <Text style={styles.subtitle}>Compete with learners worldwide</Text>
      </View>

      <View style={styles.userCard}>
        <View style={styles.userRankBadge}>
          <Text style={styles.userRankText}>{t.leaderboard.rank}: ~150</Text>
        </View>
        <View style={styles.userStats}>
          <View style={styles.userStatItem}>
            <Text style={styles.userStatValue}>{safeInteger(progress.level, 1)}</Text>
            <Text style={styles.userStatLabel}>{t.common.level}</Text>
          </View>
          <View style={styles.userStatDivider} />
          <View style={styles.userStatItem}>
            <Text style={styles.userStatValue}>{safeInteger(progress.totalXP, 0)}</Text>
            <Text style={styles.userStatLabel}>{t.profile.totalXP}</Text>
          </View>
          <View style={styles.userStatDivider} />
          <View style={styles.userStatItem}>
            <Text style={styles.userStatValue}>{safeInteger(progress.streak, 0)}</Text>
            <Text style={styles.userStatLabel}>{t.home.dayStreak}</Text>
          </View>
        </View>
        {progress.level >= 3 && (
          <TouchableOpacity
            style={styles.shareProgressButton}
            onPress={handleShareProgress}
          >
            <Share2 size={16} color={Colors.surface} />
            <Text style={styles.shareProgressButtonText}>Compartilhar Progresso</Text>
          </TouchableOpacity>
        )}
      </View>

      <ScrollView style={styles.scrollView} showsVerticalScrollIndicator={false}>
        <View style={styles.leaderboardList}>
          {mockLeaderboard.map((user) => (
            <View
              key={user.rank}
              style={[
                styles.leaderboardItem,
                user.rank <= 3 && styles.leaderboardItemTop,
              ]}
            >
              <View style={styles.rankContainer}>
                <View style={styles.rankIcon}>{getRankIcon(user.rank)}</View>
                <Text
                  style={[
                    styles.rankNumber,
                    user.rank <= 3 && styles.rankNumberTop,
                  ]}
                >
                  {user.rank}
                </Text>
              </View>

              <View style={styles.userInfo}>
                <Text style={styles.userName}>{user.name}</Text>
                <View style={styles.userMeta}>
                  <Text style={styles.userLevel}>{t.common.level} {user.level}</Text>
                  <Text style={styles.userDot}>•</Text>
                  <Text style={styles.userStreak}>{user.streak} {t.home.dayStreak.toLowerCase()}</Text>
                </View>
              </View>

              <View style={styles.rightSection}>
                <View style={styles.xpBadge}>
                  <Award size={14} color={Colors.xpBar} />
                  <Text style={styles.xpText}>{safeInteger(user.xp, 0)}</Text>
                </View>
                
                <TouchableOpacity
                  onPress={() => handleChallenge(user)}
                  disabled={isSearching}
                  style={styles.challengeButton}
                >
                  <Swords size={18} color={Colors.primary} />
                </TouchableOpacity>
              </View>
            </View>
          ))}
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
  header: {
    paddingHorizontal: 20,
    paddingTop: 20,
    paddingBottom: 16,
    alignItems: "center",
  },
  title: {
    fontSize: 32,
    fontWeight: "800" as const,
    color: Colors.primary,
    marginTop: 8,
  },
  subtitle: {
    fontSize: 14,
    color: Colors.textSecondary,
    marginTop: 4,
  },
  userCard: {
    marginHorizontal: 20,
    marginBottom: 20,
    backgroundColor: Colors.surface,
    borderRadius: 16,
    padding: 16,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 4,
  },
  userRankBadge: {
    alignSelf: "center",
    backgroundColor: Colors.primaryLight,
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 20,
    marginBottom: 12,
  },
  userRankText: {
    fontSize: 14,
    fontWeight: "700" as const,
    color: Colors.surface,
  },
  userStats: {
    flexDirection: "row",
    justifyContent: "space-around",
    alignItems: "center",
  },
  userStatItem: {
    alignItems: "center",
    flex: 1,
  },
  userStatValue: {
    fontSize: 24,
    fontWeight: "700" as const,
    color: Colors.text,
  },
  userStatLabel: {
    fontSize: 12,
    color: Colors.textSecondary,
    marginTop: 4,
  },
  userStatDivider: {
    width: 1,
    height: 40,
    backgroundColor: Colors.border,
  },
  scrollView: {
    flex: 1,
  },
  leaderboardList: {
    paddingHorizontal: 20,
  },
  leaderboardItem: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: Colors.surface,
    borderRadius: 12,
    padding: 12,
    marginBottom: 8,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 2,
    elevation: 2,
  },
  leaderboardItemTop: {
    borderWidth: 2,
    borderColor: Colors.primaryLight,
    shadowOpacity: 0.15,
  },
  rankContainer: {
    alignItems: "center",
    marginRight: 12,
    width: 50,
  },
  rankIcon: {
    marginBottom: 4,
  },
  rankNumber: {
    fontSize: 12,
    fontWeight: "700" as const,
    color: Colors.textSecondary,
  },
  rankNumberTop: {
    color: Colors.primary,
    fontSize: 14,
  },
  userInfo: {
    flex: 1,
  },
  userName: {
    fontSize: 16,
    fontWeight: "700" as const,
    color: Colors.text,
    marginBottom: 4,
  },
  userMeta: {
    flexDirection: "row",
    alignItems: "center",
    gap: 6,
  },
  userLevel: {
    fontSize: 13,
    color: Colors.textSecondary,
  },
  userDot: {
    fontSize: 13,
    color: Colors.textLight,
  },
  userStreak: {
    fontSize: 13,
    color: Colors.textSecondary,
  },
  rightSection: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
  },
  xpBadge: {
    flexDirection: "row",
    alignItems: "center",
    gap: 4,
    backgroundColor: Colors.success + "20",
    paddingHorizontal: 10,
    paddingVertical: 6,
    borderRadius: 12,
  },
  xpText: {
    fontSize: 14,
    fontWeight: "700" as const,
    color: Colors.xpBar,
  },
  challengeButton: {
    width: 40,
    height: 40,
    backgroundColor: Colors.primary + "15",
    borderRadius: 20,
    alignItems: "center",
    justifyContent: "center",
    borderWidth: 1.5,
    borderColor: Colors.primary,
  },
  bottomPadding: {
    height: 20,
  },
  shareProgressButton: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
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
  shareProgressButtonText: {
    fontSize: 14,
    fontWeight: "700" as const,
    color: Colors.surface,
  },
});
