import { Share } from 'react-native';

export interface ShareTemplate {
  text: string;
  url?: string;
}

export const APP_URL = "cryptolingo.app";

export const shareTemplates = {
  ACHIEVEMENT_UNLOCK: (achievementName: string, tier: string) => ({
    text: `🚀 Acabei de desbloquear '${achievementName} (${tier.toUpperCase()})' no CryptoLingo!\n\n` +
          `Estou aprendendo crypto de forma divertida. Quer se juntar? 😄\n\n` +
          `Baixe: ${APP_URL}`,
  }),
  
  LEVEL_UP: (newLevel: number) => ({
    text: `🎉 Level ${newLevel} desbloqueado no CryptoLingo!\n\n` +
          `Já sei sobre Bitcoin, Ethereum e muito mais! 💪\n\n` +
          `Estou ficando expert em crypto. E você? 🤔\n\n` +
          `Jogue comigo: ${APP_URL}`,
  }),
  
  STREAK_MILESTONE: (streakDays: number) => ({
    text: `🔥 ${streakDays} dias consecutivos aprendendo crypto!\n\n` +
          `CryptoLingo está me deixando viciado no conhecimento 🧠\n\n` +
          `Consegue me bater? Vamos ver! 😏\n\n` +
          `${APP_URL}`,
  }),
  
  DUEL_VICTORY: (opponentName: string, myScore: number, opponentScore: number) => ({
    text: `⚔️ Acabei de DESTRUIR ${opponentName} num duelo crypto!\n\n` +
          `Score: ${myScore} x ${opponentScore} 💥\n\n` +
          `Quem mais quer tentar me derrotar? 😈\n\n` +
          `Duele comigo: ${APP_URL}`,
  }),

  PERFECT_LESSON: (lessonName: string, xp: number) => ({
    text: `💯 Score perfeito em "${lessonName}"!\n\n` +
          `+${xp} XP ganhos! Estou dominando crypto! 🚀\n\n` +
          `Aprenda comigo: ${APP_URL}`,
  }),

  HIGH_SCORE: (totalXP: number, level: number) => ({
    text: `⚡ ${totalXP} XP Total no CryptoLingo!\n\n` +
          `Level ${level} alcançado! Já sou expert em crypto! 💎\n\n` +
          `Desafie-me: ${APP_URL}`,
  }),

  DAILY_CHALLENGE: (challengeName: string, reward: string) => ({
    text: `✅ Completei o desafio diário: "${challengeName}"!\n\n` +
          `Recompensa: ${reward} 🎁\n\n` +
          `CryptoLingo está me viciando! Junte-se! 🔥\n\n` +
          `${APP_URL}`,
  }),
};

export const shareToWhatsApp = async (template: ShareTemplate) => {
  try {
    await Share.share({
      message: template.text,
    });
    console.log('✅ Shared successfully');
    return true;
  } catch (error) {
    console.error('❌ Share failed:', error);
    return false;
  }
};

export const shareToSocial = async (template: ShareTemplate) => {
  try {
    await Share.share(
      {
        message: template.text,
      },
      {
        dialogTitle: 'Compartilhar no',
      }
    );
    console.log('✅ Shared successfully');
    return true;
  } catch (error) {
    console.error('❌ Share failed:', error);
    return false;
  }
};
