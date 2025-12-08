import { useState } from 'react';
import { Modal, View, Text, StyleSheet, TouchableOpacity, Platform } from 'react-native';
import * as Haptics from 'expo-haptics';
import { X, Share2 } from 'lucide-react-native';
import { ShareableCard } from './ShareableCards';
import { shareToSocial, ShareTemplate } from '@/utils/shareTemplates';
import { analytics } from '@/utils/analytics';
import Colors from '@/constants/colors';
import { useUserProgress } from '@/contexts/UserProgressContext';

type CardType = 'achievement' | 'level' | 'streak' | 'duel' | 'perfect' | 'score';

interface ShareCardModalProps {
  visible: boolean;
  onClose: () => void;
  cardType: CardType;
  cardData: Record<string, unknown>;
  shareTemplate: ShareTemplate;
}

export function ShareCardModal({ visible, onClose, cardType, cardData, shareTemplate }: ShareCardModalProps) {
  const [isSharing, setIsSharing] = useState(false);
  const { progress } = useUserProgress();

  const handleShare = async () => {
    if (Platform.OS !== 'web') {
      await Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
    }

    analytics.trackShareButtonClicked(cardType, 'generic', progress.level);
    
    setIsSharing(true);
    try {
      await shareToSocial(shareTemplate);
      analytics.trackShareCompleted(cardType, 'generic', progress.level);
      console.log('✅ Content shared successfully');
    } catch (error) {
      console.error('❌ Failed to share:', error);
      analytics.trackShareCancelled(cardType, 'generic');
    } finally {
      setIsSharing(false);
    }
  };

  const handleClose = async () => {
    if (Platform.OS !== 'web') {
      await Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    }
    onClose();
  };

  return (
    <Modal
      visible={visible}
      transparent
      animationType="fade"
      onRequestClose={onClose}
    >
      <View style={styles.modalOverlay}>
        <View style={styles.modalContent}>
          <TouchableOpacity style={styles.closeButton} onPress={handleClose}>
            <X size={24} color={Colors.text} />
          </TouchableOpacity>

          <View style={styles.cardWrapper}>
            {cardType === 'achievement' && (
              <ShareableCard
                type="achievement"
                achievementName={cardData.achievementName as string}
                achievementIcon={cardData.achievementIcon as string}
                tier={cardData.tier as 'bronze' | 'silver' | 'gold'}
              />
            )}
            {cardType === 'level' && (
              <ShareableCard
                type="level"
                level={cardData.level as number}
                totalXP={cardData.totalXP as number}
              />
            )}
            {cardType === 'streak' && (
              <ShareableCard
                type="streak"
                days={cardData.days as number}
              />
            )}
            {cardType === 'duel' && (
              <ShareableCard
                type="duel"
                opponentName={cardData.opponentName as string}
                myScore={cardData.myScore as number}
                opponentScore={cardData.opponentScore as number}
              />
            )}
            {cardType === 'perfect' && (
              <ShareableCard
                type="perfect"
                lessonName={cardData.lessonName as string}
                xp={cardData.xp as number}
              />
            )}
            {cardType === 'score' && (
              <ShareableCard
                type="score"
                totalXP={cardData.totalXP as number}
                level={cardData.level as number}
                completedLessons={cardData.completedLessons as number}
              />
            )}
          </View>

          <View style={styles.actionSection}>
            <Text style={styles.shareTitle}>Compartilhe sua conquista!</Text>
            <Text style={styles.shareSubtitle}>
              Mostre seu progresso para seus amigos
            </Text>

            <TouchableOpacity
              style={[styles.shareButton, isSharing && styles.shareButtonDisabled]}
              onPress={handleShare}
              disabled={isSharing}
            >
              <Share2 size={20} color="#FFFFFF" />
              <Text style={styles.shareButtonText}>
                {isSharing ? 'Compartilhando...' : 'Compartilhar Agora'}
              </Text>
            </TouchableOpacity>
          </View>
        </View>
      </View>
    </Modal>
  );
}

const styles = StyleSheet.create({
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.9)',
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
  },
  modalContent: {
    alignItems: 'center',
    width: '100%',
    maxWidth: 400,
  },
  closeButton: {
    position: 'absolute',
    top: -50,
    right: 0,
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: Colors.surface,
    alignItems: 'center',
    justifyContent: 'center',
    zIndex: 10,
  },
  cardWrapper: {
    marginBottom: 24,
  },
  actionSection: {
    width: '100%',
    backgroundColor: Colors.surface,
    borderRadius: 16,
    padding: 24,
    alignItems: 'center',
    gap: 16,
  },
  shareTitle: {
    fontSize: 20,
    fontWeight: '700' as const,
    color: Colors.text,
    textAlign: 'center',
  },
  shareSubtitle: {
    fontSize: 14,
    color: Colors.textSecondary,
    textAlign: 'center',
  },
  shareButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 12,
    backgroundColor: '#25D366',
    paddingVertical: 16,
    paddingHorizontal: 32,
    borderRadius: 12,
    width: '100%',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.2,
    shadowRadius: 8,
    elevation: 8,
  },
  shareButtonDisabled: {
    opacity: 0.6,
  },
  shareButtonText: {
    fontSize: 16,
    fontWeight: '700' as const,
    color: '#FFFFFF',
  },
});
