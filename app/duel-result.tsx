import { useEffect, useRef, useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  Pressable,
  SafeAreaView,
  Animated,
  Platform,
} from 'react-native';
import { useRouter, useLocalSearchParams } from 'expo-router';
import { Trophy, Coins, Zap, Home, RotateCcw, Share2 } from 'lucide-react-native';
import * as Haptics from 'expo-haptics';
import Colors from '@/constants/colors';
import { useDuel } from '@/contexts/DuelContext';
import { useUserProgress } from '@/contexts/UserProgressContext';
import { shareTemplates } from '@/utils/shareTemplates';
import { ShareCardModal } from '@/components/ShareCardModal';

export default function DuelResultScreen() {
  const router = useRouter();
  const params = useLocalSearchParams();
  const { endDuel, startDuel } = useDuel();
  const { progress } = useUserProgress();

  const scaleAnim = useRef(new Animated.Value(0)).current;
  const fadeAnim = useRef(new Animated.Value(0)).current;

  const [shareModalVisible, setShareModalVisible] = useState(false);

  const winner = params.winner as string;
  const myScore = parseInt(params.myScore as string);
  const opponentScore = parseInt(params.opponentScore as string);
  const xp = parseInt(params.xp as string);
  const coins = parseInt(params.coins as string);
  const trophies = parseInt(params.trophies as string);

  const isWinner = winner === 'player';
  const isDraw = winner === 'draw';

  useEffect(() => {
    Animated.parallel([
      Animated.spring(scaleAnim, {
        toValue: 1,
        tension: 50,
        friction: 7,
        useNativeDriver: true,
      }),
      Animated.timing(fadeAnim, {
        toValue: 1,
        duration: 500,
        useNativeDriver: true,
      }),
    ]).start();
  }, [scaleAnim, fadeAnim]);

  const handleRematch = () => {
    endDuel();
    startDuel(progress.level);
    router.replace('/duel' as never);
  };

  const handleGoHome = () => {
    endDuel();
    router.replace('/(tabs)');
  };

  const handleShare = async () => {
    if (Platform.OS !== 'web') {
      await Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    }
    setShareModalVisible(true);
  };

  return (
    <SafeAreaView style={styles.container}>
      <Animated.View style={[styles.content, { opacity: fadeAnim }]}>
        <Animated.View style={[styles.resultCard, { transform: [{ scale: scaleAnim }] }]}>
          <Text style={styles.resultEmoji}>
            {isWinner ? '🏆' : isDraw ? '🤝' : '😔'}
          </Text>
          <Text style={[styles.resultTitle, isWinner && styles.winText]}>
            {isWinner ? 'VICTORY!' : isDraw ? 'DRAW!' : 'DEFEAT'}
          </Text>
          <Text style={styles.resultSubtitle}>
            {isWinner
              ? 'You crushed your opponent!'
              : isDraw
              ? 'Evenly matched!'
              : 'Better luck next time!'}
          </Text>

          <View style={styles.scoreContainer}>
            <View style={styles.scoreItem}>
              <Text style={styles.scoreLabel}>Your Score</Text>
              <Text style={[styles.scoreValue, isWinner && styles.winText]}>{myScore}</Text>
            </View>
            <View style={styles.scoreDivider} />
            <View style={styles.scoreItem}>
              <Text style={styles.scoreLabel}>Opponent</Text>
              <Text style={[styles.scoreValue, !isWinner && !isDraw && styles.loseText]}>
                {opponentScore}
              </Text>
            </View>
          </View>
        </Animated.View>

        <View style={styles.rewardsContainer}>
          <Text style={styles.rewardsTitle}>Rewards Earned</Text>
          
          <View style={styles.rewardsList}>
            <View style={styles.rewardItem}>
              <View style={styles.rewardIcon}>
                <Zap color={Colors.primary} size={24} />
              </View>
              <Text style={styles.rewardValue}>+{xp} XP</Text>
            </View>

            <View style={styles.rewardItem}>
              <View style={styles.rewardIcon}>
                <Coins color="#FFD700" size={24} />
              </View>
              <Text style={styles.rewardValue}>+{coins} Coins</Text>
            </View>

            <View style={styles.rewardItem}>
              <View style={styles.rewardIcon}>
                <Trophy color="#FF6B35" size={24} />
              </View>
              <Text style={styles.rewardValue}>+{trophies} Trophies</Text>
            </View>
          </View>
        </View>

        <View style={styles.actionsContainer}>
          {isWinner && (
            <Pressable
              style={({ pressed }) => [
                styles.button,
                styles.shareButton,
                pressed && styles.buttonPressed,
              ]}
              onPress={handleShare}
            >
              <Share2 color="#FFFFFF" size={20} />
              <Text style={styles.shareButtonText}>Compartilhar Vitória 🏆</Text>
            </Pressable>
          )}

          <Pressable
            style={({ pressed }) => [
              styles.button,
              styles.primaryButton,
              pressed && styles.buttonPressed,
            ]}
            onPress={handleRematch}
          >
            <RotateCcw color="#FFFFFF" size={20} />
            <Text style={styles.primaryButtonText}>Rematch</Text>
          </Pressable>

          <Pressable
            style={({ pressed }) => [
              styles.button,
              styles.secondaryButton,
              pressed && styles.buttonPressed,
            ]}
            onPress={handleGoHome}
          >
            <Home color={Colors.primary} size={20} />
            <Text style={styles.secondaryButtonText}>Home</Text>
          </Pressable>
        </View>
      </Animated.View>

      <ShareCardModal
        visible={shareModalVisible}
        onClose={() => setShareModalVisible(false)}
        cardType="duel"
        cardData={{
          opponentName: 'Opponent',
          myScore,
          opponentScore,
        }}
        shareTemplate={shareTemplates.DUEL_VICTORY('Opponent', myScore, opponentScore)}
      />
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: Colors.background,
  },
  content: {
    flex: 1,
    padding: 20,
    justifyContent: 'center',
  },
  resultCard: {
    backgroundColor: Colors.surface,
    borderRadius: 24,
    padding: 32,
    alignItems: 'center',
    marginBottom: 24,
  },
  resultEmoji: {
    fontSize: 80,
    marginBottom: 16,
  },
  resultTitle: {
    fontSize: 36,
    fontWeight: '800' as const,
    color: Colors.text,
    marginBottom: 8,
  },
  winText: {
    color: Colors.primary,
  },
  loseText: {
    color: Colors.error,
  },
  resultSubtitle: {
    fontSize: 16,
    color: Colors.textSecondary,
    marginBottom: 24,
  },
  scoreContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 24,
    paddingTop: 24,
    borderTopWidth: 1,
    borderTopColor: Colors.border,
    width: '100%',
  },
  scoreItem: {
    flex: 1,
    alignItems: 'center',
  },
  scoreLabel: {
    fontSize: 14,
    color: Colors.textSecondary,
    marginBottom: 8,
  },
  scoreValue: {
    fontSize: 32,
    fontWeight: '700' as const,
    color: Colors.text,
  },
  scoreDivider: {
    width: 2,
    height: 40,
    backgroundColor: Colors.border,
  },
  rewardsContainer: {
    backgroundColor: Colors.surface,
    borderRadius: 20,
    padding: 24,
    marginBottom: 24,
  },
  rewardsTitle: {
    fontSize: 18,
    fontWeight: '700' as const,
    color: Colors.text,
    marginBottom: 16,
    textAlign: 'center',
  },
  rewardsList: {
    flexDirection: 'row',
    justifyContent: 'space-around',
  },
  rewardItem: {
    alignItems: 'center',
    gap: 8,
  },
  rewardIcon: {
    width: 48,
    height: 48,
    borderRadius: 24,
    backgroundColor: Colors.background,
    alignItems: 'center',
    justifyContent: 'center',
  },
  rewardValue: {
    fontSize: 14,
    fontWeight: '600' as const,
    color: Colors.text,
  },
  actionsContainer: {
    gap: 12,
  },
  button: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 16,
    paddingHorizontal: 24,
    borderRadius: 16,
    gap: 8,
  },
  primaryButton: {
    backgroundColor: Colors.primary,
  },
  secondaryButton: {
    backgroundColor: Colors.surface,
    borderWidth: 2,
    borderColor: Colors.primary,
  },
  shareButton: {
    backgroundColor: '#25D366',
  },
  shareButtonText: {
    fontSize: 16,
    fontWeight: '700' as const,
    color: '#FFFFFF',
  },
  buttonPressed: {
    opacity: 0.7,
  },
  primaryButtonText: {
    fontSize: 16,
    fontWeight: '700' as const,
    color: '#FFFFFF',
  },
  secondaryButtonText: {
    fontSize: 16,
    fontWeight: '700' as const,
    color: Colors.primary,
  },
});
