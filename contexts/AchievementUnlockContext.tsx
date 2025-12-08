import createContextHook from '@nkzw/create-context-hook';
import { useState, useCallback } from 'react';
import { AchievementUnlockModal } from '@/components/AchievementUnlockModal';
import { ShareCardModal } from '@/components/ShareCardModal';
import { shareTemplates } from '@/utils/shareTemplates';
import { achievements } from '@/data/achievements';

interface AchievementUnlock {
  achievementId: string;
  tier: 'bronze' | 'silver' | 'gold';
}

export const [AchievementUnlockProvider, useAchievementUnlock] = createContextHook(() => {
  const [currentUnlock, setCurrentUnlock] = useState<AchievementUnlock | null>(null);
  const [shareModalVisible, setShareModalVisible] = useState(false);

  const showAchievementUnlock = useCallback((achievementId: string, tier: 'bronze' | 'silver' | 'gold') => {
    console.log('🏆 Showing achievement unlock:', achievementId, tier);
    setCurrentUnlock({ achievementId, tier });
  }, []);

  const closeAchievementModal = useCallback(() => {
    console.log('✅ Closing achievement unlock modal');
    setCurrentUnlock(null);
  }, []);

  const openShareModal = useCallback(() => {
    console.log('📤 Opening share modal');
    setShareModalVisible(true);
  }, []);

  const closeShareModal = useCallback(() => {
    console.log('❌ Closing share modal');
    setShareModalVisible(false);
    setCurrentUnlock(null);
  }, []);

  const achievement = currentUnlock 
    ? achievements.find((a) => a.id === currentUnlock.achievementId)
    : null;

  return {
    showAchievementUnlock,
    renderModals: () => (
      <>
        {currentUnlock && (
          <AchievementUnlockModal
            visible={!!currentUnlock}
            achievementId={currentUnlock.achievementId}
            tier={currentUnlock.tier}
            onClose={closeAchievementModal}
            onShare={openShareModal}
          />
        )}
        {shareModalVisible && achievement && currentUnlock && (
          <ShareCardModal
            visible={shareModalVisible}
            onClose={closeShareModal}
            cardType="achievement"
            cardData={{
              achievementName: achievement.name,
              achievementIcon: achievement.icon,
              tier: currentUnlock.tier,
            }}
            shareTemplate={shareTemplates.ACHIEVEMENT_UNLOCK(achievement.name, currentUnlock.tier)}
          />
        )}
      </>
    ),
  };
});
