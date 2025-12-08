import { View, Text, StyleSheet, ViewStyle } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { Trophy, Award, Zap, Target, Star, Flame } from 'lucide-react-native';

interface BaseShareCardProps {
  type: 'achievement' | 'level' | 'streak' | 'duel' | 'perfect' | 'score';
  style?: ViewStyle;
}

interface AchievementCardProps extends BaseShareCardProps {
  type: 'achievement';
  achievementName: string;
  achievementIcon: string;
  tier: 'bronze' | 'silver' | 'gold';
}

interface LevelUpCardProps extends BaseShareCardProps {
  type: 'level';
  level: number;
  totalXP: number;
}

interface StreakCardProps extends BaseShareCardProps {
  type: 'streak';
  days: number;
}

interface DuelVictoryCardProps extends BaseShareCardProps {
  type: 'duel';
  opponentName: string;
  myScore: number;
  opponentScore: number;
}

interface PerfectLessonCardProps extends BaseShareCardProps {
  type: 'perfect';
  lessonName: string;
  xp: number;
}

interface HighScoreCardProps extends BaseShareCardProps {
  type: 'score';
  totalXP: number;
  level: number;
  completedLessons: number;
}

type ShareableCardProps = 
  | AchievementCardProps 
  | LevelUpCardProps 
  | StreakCardProps 
  | DuelVictoryCardProps
  | PerfectLessonCardProps
  | HighScoreCardProps;

export function ShareableCard(props: ShareableCardProps) {
  switch (props.type) {
    case 'achievement':
      return <AchievementCard {...props} />;
    case 'level':
      return <LevelUpCard {...props} />;
    case 'streak':
      return <StreakCard {...props} />;
    case 'duel':
      return <DuelVictoryCard {...props} />;
    case 'perfect':
      return <PerfectLessonCard {...props} />;
    case 'score':
      return <HighScoreCard {...props} />;
  }
}

function AchievementCard({ achievementName, achievementIcon, tier, style }: AchievementCardProps) {
  const tierColors = {
    gold: ['#FFD700', '#FFA500'],
    silver: ['#E8E8E8', '#A0A0A0'],
    bronze: ['#CD7F32', '#8B4513'],
  };

  const gradientColors = tierColors[tier];

  return (
    <View style={[styles.cardContainer, style]}>
      <LinearGradient
        colors={['#1E3A8A', '#3B82F6', '#F59E0B']}
        start={{ x: 0, y: 0 }}
        end={{ x: 1, y: 1 }}
        style={styles.gradient}
      >
        <View style={styles.contentContainer}>
          <View style={styles.topSection}>
            <Text style={styles.headerText}>ACHIEVEMENT UNLOCKED!</Text>
          </View>

          <View style={styles.iconContainer}>
            <View style={[styles.iconBadge, { backgroundColor: gradientColors[0] }]}>
              <Text style={styles.achievementIconLarge}>{achievementIcon}</Text>
            </View>
          </View>

          <View style={styles.titleSection}>
            <Text style={styles.achievementTitle}>{achievementName}</Text>
            <View style={[styles.tierBadge, { backgroundColor: gradientColors[0] }]}>
              <Text style={styles.tierBadgeText}>{tier.toUpperCase()}</Text>
            </View>
          </View>

          <View style={styles.bottomSection}>
            <Award size={20} color="#FFFFFF80" />
            <Text style={styles.appName}>CryptoLingo</Text>
            <Trophy size={20} color="#FFFFFF80" />
          </View>
        </View>
      </LinearGradient>
    </View>
  );
}

function LevelUpCard({ level, totalXP, style }: LevelUpCardProps) {
  return (
    <View style={[styles.cardContainer, style]}>
      <LinearGradient
        colors={['#8B5CF6', '#EC4899', '#F59E0B']}
        start={{ x: 0, y: 0 }}
        end={{ x: 1, y: 1 }}
        style={styles.gradient}
      >
        <View style={styles.contentContainer}>
          <View style={styles.topSection}>
            <Zap size={32} color="#FFFFFF" />
            <Text style={styles.headerText}>LEVEL UP!</Text>
            <Zap size={32} color="#FFFFFF" />
          </View>

          <View style={styles.centerSection}>
            <View style={styles.levelCircle}>
              <Text style={styles.levelNumberLarge}>{level}</Text>
            </View>
          </View>

          <View style={styles.statsSection}>
            <View style={styles.statItem}>
              <Target size={24} color="#FFFFFF" />
              <Text style={styles.statLabel}>Total XP</Text>
              <Text style={styles.statValue}>{totalXP}</Text>
            </View>
          </View>

          <View style={styles.bottomSection}>
            <Text style={styles.appName}>CryptoLingo</Text>
          </View>
        </View>
      </LinearGradient>
    </View>
  );
}

function StreakCard({ days, style }: StreakCardProps) {
  return (
    <View style={[styles.cardContainer, style]}>
      <LinearGradient
        colors={['#DC2626', '#F59E0B', '#FBBF24']}
        start={{ x: 0, y: 0 }}
        end={{ x: 1, y: 1 }}
        style={styles.gradient}
      >
        <View style={styles.contentContainer}>
          <View style={styles.topSection}>
            <Text style={styles.headerText}>STREAK ON FIRE! 🔥</Text>
          </View>

          <View style={styles.centerSection}>
            <Flame size={80} color="#FFFFFF" strokeWidth={2} />
            <View style={styles.streakBadge}>
              <Text style={styles.streakNumber}>{days}</Text>
              <Text style={styles.streakLabel}>DIAS</Text>
            </View>
          </View>

          <View style={styles.messageSection}>
            <Text style={styles.motivationText}>
              {days >= 30 ? "Imparável! 💪" : days >= 14 ? "Continue assim! 🚀" : "Você está pegando fogo! 🔥"}
            </Text>
          </View>

          <View style={styles.bottomSection}>
            <Star size={20} color="#FFFFFF80" />
            <Text style={styles.appName}>CryptoLingo</Text>
            <Star size={20} color="#FFFFFF80" />
          </View>
        </View>
      </LinearGradient>
    </View>
  );
}

function DuelVictoryCard({ opponentName, myScore, opponentScore, style }: DuelVictoryCardProps) {
  return (
    <View style={[styles.cardContainer, style]}>
      <LinearGradient
        colors={['#059669', '#10B981', '#34D399']}
        start={{ x: 0, y: 0 }}
        end={{ x: 1, y: 1 }}
        style={styles.gradient}
      >
        <View style={styles.contentContainer}>
          <View style={styles.topSection}>
            <Text style={styles.headerText}>VITÓRIA! ⚔️</Text>
          </View>

          <View style={styles.centerSection}>
            <Trophy size={80} color="#FFFFFF" strokeWidth={2} />
          </View>

          <View style={styles.duelScoreSection}>
            <View style={styles.scoreBox}>
              <Text style={styles.scoreLabel}>Você</Text>
              <Text style={styles.scoreNumber}>{myScore}</Text>
            </View>
            <Text style={styles.vsText}>VS</Text>
            <View style={styles.scoreBox}>
              <Text style={styles.scoreLabel}>{opponentName}</Text>
              <Text style={styles.scoreNumber}>{opponentScore}</Text>
            </View>
          </View>

          <View style={styles.messageSection}>
            <Text style={styles.motivationText}>
              {myScore > opponentScore * 1.5 ? "DESTRUIÇÃO TOTAL! 💥" : "Boa vitória! 🎯"}
            </Text>
          </View>

          <View style={styles.bottomSection}>
            <Text style={styles.appName}>CryptoLingo</Text>
          </View>
        </View>
      </LinearGradient>
    </View>
  );
}

function PerfectLessonCard({ lessonName, xp, style }: PerfectLessonCardProps) {
  return (
    <View style={[styles.cardContainer, style]}>
      <LinearGradient
        colors={['#7C3AED', '#A855F7', '#C084FC']}
        start={{ x: 0, y: 0 }}
        end={{ x: 1, y: 1 }}
        style={styles.gradient}
      >
        <View style={styles.contentContainer}>
          <View style={styles.topSection}>
            <Text style={styles.headerText}>PERFECT SCORE! 💯</Text>
          </View>

          <View style={styles.centerSection}>
            <View style={styles.perfectBadge}>
              <Text style={styles.perfectIcon}>💯</Text>
            </View>
          </View>

          <View style={styles.titleSection}>
            <Text style={styles.lessonTitle}>{lessonName}</Text>
            <View style={styles.xpBadge}>
              <Zap size={16} color="#FFFFFF" />
              <Text style={styles.xpText}>+{xp} XP</Text>
            </View>
          </View>

          <View style={styles.bottomSection}>
            <Text style={styles.appName}>CryptoLingo</Text>
          </View>
        </View>
      </LinearGradient>
    </View>
  );
}

function HighScoreCard({ totalXP, level, completedLessons, style }: HighScoreCardProps) {
  return (
    <View style={[styles.cardContainer, style]}>
      <LinearGradient
        colors={['#0891B2', '#06B6D4', '#22D3EE']}
        start={{ x: 0, y: 0 }}
        end={{ x: 1, y: 1 }}
        style={styles.gradient}
      >
        <View style={styles.contentContainer}>
          <View style={styles.topSection}>
            <Text style={styles.headerText}>MEU PROGRESSO</Text>
          </View>

          <View style={styles.statsGrid}>
            <View style={styles.statsCard}>
              <Zap size={32} color="#FFFFFF" />
              <Text style={styles.statsCardValue}>{totalXP}</Text>
              <Text style={styles.statsCardLabel}>Total XP</Text>
            </View>
            <View style={styles.statsCard}>
              <Trophy size={32} color="#FFFFFF" />
              <Text style={styles.statsCardValue}>{level}</Text>
              <Text style={styles.statsCardLabel}>Level</Text>
            </View>
            <View style={styles.statsCard}>
              <Target size={32} color="#FFFFFF" />
              <Text style={styles.statsCardValue}>{completedLessons}</Text>
              <Text style={styles.statsCardLabel}>Lições</Text>
            </View>
          </View>

          <View style={styles.bottomSection}>
            <Award size={20} color="#FFFFFF80" />
            <Text style={styles.appName}>CryptoLingo</Text>
            <Award size={20} color="#FFFFFF80" />
          </View>
        </View>
      </LinearGradient>
    </View>
  );
}

const styles = StyleSheet.create({
  cardContainer: {
    width: 350,
    height: 600,
    borderRadius: 24,
    overflow: 'hidden',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.4,
    shadowRadius: 16,
    elevation: 16,
  },
  gradient: {
    flex: 1,
    padding: 24,
  },
  contentContainer: {
    flex: 1,
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  topSection: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    paddingTop: 16,
  },
  headerText: {
    fontSize: 24,
    fontWeight: '900' as const,
    color: '#FFFFFF',
    textAlign: 'center',
    letterSpacing: 1,
    textShadowColor: 'rgba(0, 0, 0, 0.3)',
    textShadowOffset: { width: 0, height: 2 },
    textShadowRadius: 4,
  },
  iconContainer: {
    alignItems: 'center',
    justifyContent: 'center',
  },
  iconBadge: {
    width: 160,
    height: 160,
    borderRadius: 80,
    alignItems: 'center',
    justifyContent: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.3,
    shadowRadius: 16,
    elevation: 16,
    borderWidth: 6,
    borderColor: '#FFFFFF40',
  },
  achievementIconLarge: {
    fontSize: 80,
  },
  centerSection: {
    alignItems: 'center',
    justifyContent: 'center',
    gap: 16,
  },
  levelCircle: {
    width: 180,
    height: 180,
    borderRadius: 90,
    backgroundColor: '#FFFFFF40',
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 6,
    borderColor: '#FFFFFF',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.3,
    shadowRadius: 16,
    elevation: 16,
  },
  levelNumberLarge: {
    fontSize: 96,
    fontWeight: '900' as const,
    color: '#FFFFFF',
    textShadowColor: 'rgba(0, 0, 0, 0.3)',
    textShadowOffset: { width: 0, height: 4 },
    textShadowRadius: 8,
  },
  titleSection: {
    alignItems: 'center',
    gap: 12,
  },
  achievementTitle: {
    fontSize: 28,
    fontWeight: '800' as const,
    color: '#FFFFFF',
    textAlign: 'center',
    letterSpacing: 0.5,
    textShadowColor: 'rgba(0, 0, 0, 0.3)',
    textShadowOffset: { width: 0, height: 2 },
    textShadowRadius: 4,
  },
  tierBadge: {
    paddingHorizontal: 24,
    paddingVertical: 8,
    borderRadius: 20,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 8,
  },
  tierBadgeText: {
    fontSize: 16,
    fontWeight: '900' as const,
    color: '#FFFFFF',
    letterSpacing: 2,
  },
  bottomSection: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    paddingBottom: 16,
  },
  appName: {
    fontSize: 20,
    fontWeight: '700' as const,
    color: '#FFFFFF',
    letterSpacing: 0.5,
  },
  statsSection: {
    width: '100%',
    alignItems: 'center',
  },
  statItem: {
    alignItems: 'center',
    gap: 8,
    backgroundColor: '#FFFFFF20',
    paddingHorizontal: 32,
    paddingVertical: 20,
    borderRadius: 16,
    width: '100%',
  },
  statLabel: {
    fontSize: 14,
    fontWeight: '600' as const,
    color: '#FFFFFF80',
    textTransform: 'uppercase',
    letterSpacing: 1,
  },
  statValue: {
    fontSize: 32,
    fontWeight: '900' as const,
    color: '#FFFFFF',
  },
  streakBadge: {
    backgroundColor: '#FFFFFF30',
    paddingHorizontal: 32,
    paddingVertical: 16,
    borderRadius: 20,
    alignItems: 'center',
    marginTop: 16,
  },
  streakNumber: {
    fontSize: 64,
    fontWeight: '900' as const,
    color: '#FFFFFF',
    textShadowColor: 'rgba(0, 0, 0, 0.3)',
    textShadowOffset: { width: 0, height: 4 },
    textShadowRadius: 8,
  },
  streakLabel: {
    fontSize: 16,
    fontWeight: '700' as const,
    color: '#FFFFFF',
    letterSpacing: 2,
  },
  messageSection: {
    paddingHorizontal: 24,
  },
  motivationText: {
    fontSize: 20,
    fontWeight: '700' as const,
    color: '#FFFFFF',
    textAlign: 'center',
    textShadowColor: 'rgba(0, 0, 0, 0.3)',
    textShadowOffset: { width: 0, height: 2 },
    textShadowRadius: 4,
  },
  duelScoreSection: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-around',
    width: '100%',
    paddingHorizontal: 16,
  },
  scoreBox: {
    alignItems: 'center',
    backgroundColor: '#FFFFFF20',
    paddingHorizontal: 24,
    paddingVertical: 16,
    borderRadius: 16,
    minWidth: 100,
  },
  scoreLabel: {
    fontSize: 14,
    fontWeight: '600' as const,
    color: '#FFFFFF80',
    marginBottom: 8,
    textTransform: 'uppercase',
    letterSpacing: 1,
  },
  scoreNumber: {
    fontSize: 48,
    fontWeight: '900' as const,
    color: '#FFFFFF',
    textShadowColor: 'rgba(0, 0, 0, 0.3)',
    textShadowOffset: { width: 0, height: 4 },
    textShadowRadius: 8,
  },
  vsText: {
    fontSize: 24,
    fontWeight: '900' as const,
    color: '#FFFFFF',
  },
  perfectBadge: {
    width: 160,
    height: 160,
    borderRadius: 80,
    backgroundColor: '#FFFFFF40',
    alignItems: 'center',
    justifyContent: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.3,
    shadowRadius: 16,
    elevation: 16,
    borderWidth: 6,
    borderColor: '#FFFFFF',
  },
  perfectIcon: {
    fontSize: 80,
  },
  lessonTitle: {
    fontSize: 20,
    fontWeight: '700' as const,
    color: '#FFFFFF',
    textAlign: 'center',
    paddingHorizontal: 24,
  },
  xpBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    backgroundColor: '#FFFFFF30',
    paddingHorizontal: 20,
    paddingVertical: 10,
    borderRadius: 16,
  },
  xpText: {
    fontSize: 18,
    fontWeight: '800' as const,
    color: '#FFFFFF',
  },
  statsGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 16,
    justifyContent: 'center',
    width: '100%',
  },
  statsCard: {
    backgroundColor: '#FFFFFF20',
    paddingHorizontal: 20,
    paddingVertical: 16,
    borderRadius: 16,
    alignItems: 'center',
    minWidth: 90,
    gap: 8,
  },
  statsCardValue: {
    fontSize: 32,
    fontWeight: '900' as const,
    color: '#FFFFFF',
  },
  statsCardLabel: {
    fontSize: 12,
    fontWeight: '600' as const,
    color: '#FFFFFF80',
    textTransform: 'uppercase',
    letterSpacing: 1,
  },
});
