import { useState, useEffect, useRef } from 'react';
import {
  Modal,
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  Animated,
  Easing,
  Platform,
} from 'react-native';
import * as Haptics from 'expo-haptics';
import { LinearGradient } from 'expo-linear-gradient';
import { Award, Share2 } from 'lucide-react-native';
import Colors from '@/constants/colors';
import { ConfettiAnimation } from './ConfettiAnimation';
import { achievements as allAchievements } from '@/data/achievements';

interface AchievementUnlockModalProps {
  visible: boolean;
  achievementId: string;
  tier: 'bronze' | 'silver' | 'gold';
  onClose: () => void;
  onShare: () => void;
}

export function AchievementUnlockModal({
  visible,
  achievementId,
  tier,
  onClose,
  onShare,
}: AchievementUnlockModalProps) {
  const [showConfetti, setShowConfetti] = useState(false);
  const scaleAnim = useRef(new Animated.Value(0)).current;
  const fadeAnim = useRef(new Animated.Value(0)).current;
  const pulseAnim = useRef(new Animated.Value(1)).current;

  const achievement = allAchievements.find((a) => a.id === achievementId);

  const tierColors = {
    gold: ['#FFD700', '#FFA500'],
    silver: ['#E8E8E8', '#A0A0A0'],
    bronze: ['#CD7F32', '#8B4513'],
  };

  const tierGradients = {
    gold: ['#FFA500', '#FFD700', '#FFED4E'] as const,
    silver: ['#9CA3AF', '#E5E7EB', '#F9FAFB'] as const,
    bronze: ['#92400E', '#B45309', '#D97706'] as const,
  };

  const tierLabels = {
    gold: 'OURO',
    silver: 'PRATA',
    bronze: 'BRONZE',
  };

  useEffect(() => {
    if (visible) {
      setShowConfetti(true);

      if (Platform.OS !== 'web') {
        Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
      }

      Animated.sequence([
        Animated.timing(scaleAnim, {
          toValue: 1.2,
          duration: 300,
          easing: Easing.out(Easing.cubic),
          useNativeDriver: true,
        }),
        Animated.spring(scaleAnim, {
          toValue: 1,
          friction: 4,
          tension: 40,
          useNativeDriver: true,
        }),
      ]).start();

      Animated.timing(fadeAnim, {
        toValue: 1,
        duration: 600,
        delay: 200,
        useNativeDriver: true,
      }).start();

      const pulseAnimation = Animated.loop(
        Animated.sequence([
          Animated.timing(pulseAnim, {
            toValue: 1.05,
            duration: 1000,
            easing: Easing.inOut(Easing.ease),
            useNativeDriver: true,
          }),
          Animated.timing(pulseAnim, {
            toValue: 1,
            duration: 1000,
            easing: Easing.inOut(Easing.ease),
            useNativeDriver: true,
          }),
        ])
      );
      pulseAnimation.start();

      return () => {
        pulseAnimation.stop();
      };
    } else {
      scaleAnim.setValue(0);
      fadeAnim.setValue(0);
      pulseAnim.setValue(1);
      setShowConfetti(false);
    }
  }, [visible, scaleAnim, fadeAnim, pulseAnim]);

  const handleShare = async () => {
    if (Platform.OS !== 'web') {
      await Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
    }
    onShare();
  };

  const handleContinue = async () => {
    if (Platform.OS !== 'web') {
      await Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    }
    onClose();
  };

  if (!achievement) {
    return null;
  }

  return (
    <Modal visible={visible} transparent animationType="fade" onRequestClose={onClose}>
      <View style={styles.modalOverlay}>
        {showConfetti && <ConfettiAnimation />}

        <View style={styles.contentContainer}>
          <Animated.View
            style={[
              styles.badgeContainer,
              {
                transform: [{ scale: scaleAnim }],
              },
            ]}
          >
            <LinearGradient
              colors={tierGradients[tier]}
              start={{ x: 0, y: 0 }}
              end={{ x: 1, y: 1 }}
              style={styles.badgeGradient}
            >
              <Animated.View
                style={[
                  styles.iconCircle,
                  {
                    transform: [{ scale: pulseAnim }],
                  },
                ]}
              >
                <Text style={styles.achievementIcon}>{achievement.icon}</Text>
              </Animated.View>
            </LinearGradient>
          </Animated.View>

          <Animated.View style={[styles.textContainer, { opacity: fadeAnim }]}>
            <Text style={styles.headerText}>CONQUISTA DESBLOQUEADA!</Text>

            <View style={[styles.tierBadge, { backgroundColor: tierColors[tier][0] }]}>
              <Award size={16} color="#FFFFFF" />
              <Text style={styles.tierText}>{tierLabels[tier]}</Text>
            </View>

            <Text style={styles.achievementName}>{achievement.name}</Text>
            <Text style={styles.achievementDescription}>{achievement.description}</Text>

            <View style={styles.rewardsContainer}>
              <View style={styles.rewardItem}>
                <Text style={styles.rewardValue}>+{achievement.reward.xp}</Text>
                <Text style={styles.rewardLabel}>XP</Text>
              </View>
              <View style={styles.rewardDivider} />
              <View style={styles.rewardItem}>
                <Text style={styles.rewardValue}>+{achievement.reward.coins}</Text>
                <Text style={styles.rewardLabel}>Moedas</Text>
              </View>
            </View>
          </Animated.View>

          <Animated.View style={[styles.buttonsContainer, { opacity: fadeAnim }]}>
            <TouchableOpacity style={styles.shareButton} onPress={handleShare}>
              <LinearGradient
                colors={['#25D366', '#128C7E']}
                start={{ x: 0, y: 0 }}
                end={{ x: 1, y: 0 }}
                style={styles.buttonGradient}
              >
                <Share2 size={20} color="#FFFFFF" />
                <Text style={styles.shareButtonText}>Compartilhar</Text>
              </LinearGradient>
            </TouchableOpacity>

            <TouchableOpacity style={styles.continueButton} onPress={handleContinue}>
              <Text style={styles.continueButtonText}>Continuar</Text>
            </TouchableOpacity>
          </Animated.View>
        </View>
      </View>
    </Modal>
  );
}

const styles = StyleSheet.create({
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.95)',
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
  },
  contentContainer: {
    width: '100%',
    maxWidth: 400,
    alignItems: 'center',
    gap: 32,
  },
  badgeContainer: {
    width: 220,
    height: 220,
    borderRadius: 110,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 12 },
    shadowOpacity: 0.5,
    shadowRadius: 24,
    elevation: 24,
  },
  badgeGradient: {
    flex: 1,
    borderRadius: 110,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
  },
  iconCircle: {
    width: 160,
    height: 160,
    borderRadius: 80,
    backgroundColor: '#FFFFFF40',
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 8,
    borderColor: '#FFFFFF',
  },
  achievementIcon: {
    fontSize: 80,
  },
  textContainer: {
    alignItems: 'center',
    gap: 16,
    paddingHorizontal: 24,
  },
  headerText: {
    fontSize: 28,
    fontWeight: '900' as const,
    color: '#FFFFFF',
    textAlign: 'center',
    letterSpacing: 2,
    textTransform: 'uppercase',
    textShadowColor: 'rgba(0, 0, 0, 0.5)',
    textShadowOffset: { width: 0, height: 2 },
    textShadowRadius: 8,
  },
  tierBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    paddingHorizontal: 24,
    paddingVertical: 10,
    borderRadius: 24,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 8,
  },
  tierText: {
    fontSize: 16,
    fontWeight: '900' as const,
    color: '#FFFFFF',
    letterSpacing: 2,
  },
  achievementName: {
    fontSize: 32,
    fontWeight: '800' as const,
    color: '#FFFFFF',
    textAlign: 'center',
    marginTop: 8,
  },
  achievementDescription: {
    fontSize: 16,
    fontWeight: '500' as const,
    color: '#FFFFFF99',
    textAlign: 'center',
    lineHeight: 24,
  },
  rewardsContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 24,
    marginTop: 16,
    backgroundColor: Colors.surface,
    paddingHorizontal: 32,
    paddingVertical: 20,
    borderRadius: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.2,
    shadowRadius: 8,
    elevation: 8,
  },
  rewardItem: {
    alignItems: 'center',
    gap: 4,
  },
  rewardValue: {
    fontSize: 28,
    fontWeight: '900' as const,
    color: Colors.text,
  },
  rewardLabel: {
    fontSize: 12,
    fontWeight: '600' as const,
    color: Colors.textSecondary,
    textTransform: 'uppercase',
    letterSpacing: 1,
  },
  rewardDivider: {
    width: 1,
    height: 40,
    backgroundColor: Colors.border,
  },
  buttonsContainer: {
    width: '100%',
    gap: 12,
    paddingHorizontal: 24,
  },
  shareButton: {
    borderRadius: 12,
    overflow: 'hidden',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 8,
  },
  buttonGradient: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 12,
    paddingVertical: 18,
    paddingHorizontal: 32,
  },
  shareButtonText: {
    fontSize: 18,
    fontWeight: '700' as const,
    color: '#FFFFFF',
  },
  continueButton: {
    backgroundColor: Colors.surface,
    paddingVertical: 18,
    paddingHorizontal: 32,
    borderRadius: 12,
    alignItems: 'center',
    borderWidth: 2,
    borderColor: Colors.border,
  },
  continueButtonText: {
    fontSize: 18,
    fontWeight: '700' as const,
    color: Colors.text,
  },
});
