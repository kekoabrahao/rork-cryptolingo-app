import { NotificationTemplate } from '@/types/notification';

export const notificationTemplates: NotificationTemplate[] = [
  {
    type: 'STUDY_REMINDER',
    templates: [
      'Seus 15 minutos de crypto te esperam! 🚀',
      'Bitcoin não para, seu aprendizado também não deveria! ₿',
      'Que tal uma lição rápida sobre DeFi? 💰',
      'Sua streak de {streak} dias está em risco! 🔥',
      'Continue sua jornada crypto! 📚',
      'Hora de aprender sobre blockchain! ⛓️',
      'Seus amigos já estudaram hoje! 👥',
      'Apenas 10 minutos para manter seu progresso! ⏱️'
    ],
    timing: 'user_optimal_time',
    priority: 'high'
  },
  {
    type: 'SOCIAL_COMPETITIVE',
    templates: [
      '{friend_name} passou você no ranking! 😱',
      'Você caiu para #{position} no ranking. Hora de reagir! 📈',
      '5 amigos já estudaram hoje. E você? 👥',
      'Seu grupo está 20 XP na frente! ⚡',
      'Você está a 50 XP de ultrapassar {friend_name}! 🎯',
      'Top 10! Você pode chegar lá com mais 2 lições! 🏆',
      '{friend_name} completou o desafio diário! ⚡'
    ],
    timing: 'evening',
    priority: 'medium'
  },
  {
    type: 'MARKET_NEWS',
    templates: [
      'Bitcoin +15% hoje! Entenda bull markets 📊',
      'Ethereum 2.0 update! Nova lição disponível 🔄',
      'Mercado em queda? Aprenda sobre bear markets 🐻',
      'Altcoin season chegando? Estude altcoins! 🌟',
      'DeFi crescendo! Aprenda sobre yield farming 🌾',
      'NFTs em alta! Descubra o que são NFTs 🖼️',
      'Nova criptomoeda no top 10! Saiba mais 📈'
    ],
    timing: 'market_hours',
    priority: 'low'
  },
  {
    type: 'REWARDS',
    templates: [
      'Mystery Box disponível! Abra agora 📦',
      'Novo achievement desbloqueado: {achievement} 🏆',
      'Parabéns! Você subiu para Level {level}! 🎉',
      'Ganhe XP duplo nas próximas 2 horas! ⏰',
      'Bônus especial: Complete 3 lições e ganhe 100 moedas! 🪙',
      'Oferta limitada: Vidas ilimitadas por 24h! ❤️',
      '+50 moedas grátis! Abra o app agora! 🎁'
    ],
    timing: 'immediate',
    priority: 'high'
  },
  {
    type: 'STREAK_DANGER',
    templates: [
      '🔥 Sua streak de {streak} dias está em risco!',
      '⚠️ Não perca sua sequência! Apenas 5 minutos hoje!',
      '😱 Faltam {hours} horas para perder sua streak!',
      '🚨 Você está prestes a perder {streak} dias de progresso!'
    ],
    timing: 'user_optimal_time',
    priority: 'high'
  },
  {
    type: 'CHALLENGE_AVAILABLE',
    templates: [
      '🎯 Novo desafio diário: {challenge_name}!',
      '⚡ Desafio especial com recompensa dobrada!',
      '🏆 Desafio do fim de semana disponível!',
      '🎁 Complete o desafio e ganhe {reward}!'
    ],
    timing: 'user_optimal_time',
    priority: 'medium'
  },
  {
    type: 'ACHIEVEMENT_UNLOCKED',
    templates: [
      '🏆 Achievement desbloqueado: {achievement}!',
      '⭐ Você conquistou: {achievement}!',
      '🎉 Parabéns! {achievement} está no seu perfil!',
      '✨ Novo achievement: {achievement} +{xp} XP!'
    ],
    timing: 'immediate',
    priority: 'high'
  },
  {
    type: 'BREAKING_NEWS',
    templates: [
      '🚨 URGENTE: {crypto} {direction} {movement}% em 1 hora!',
      '⚡ ALERTA: Mercado em movimento! {crypto} {direction} {movement}%',
      '📊 BREAKING: {crypto} registra {direction} histórica de {movement}%!',
      '🔥 {crypto} explode {movement}%! Entenda o que está acontecendo',
      '⚠️ Volatilidade extrema: {crypto} {movement}% em minutos!'
    ],
    timing: 'immediate',
    priority: 'high'
  },
  {
    type: 'DUEL_CHALLENGE',
    templates: [
      '⚔️ {challenger} te desafiou para um duelo!',
      '🎯 Novo duelo: {challenger} vs você! Aceitar?',
      '🔥 {challenger} apostou {bet} moedas! Está pronto?',
      '⚡ Duelo instantâneo com {challenger}! 3 minutos!',
      '🏆 {challenger} desafiou você. Mostre quem manda!'
    ],
    timing: 'immediate',
    priority: 'high'
  },
  {
    type: 'PERSONALIZED_INSIGHT',
    templates: [
      '📊 Você está a apenas {lessons} lições do Level {level}!',
      '🎯 Seu progresso semanal: {progress}% - Continue assim!',
      '⭐ Você é {percentile}% melhor que outros alunos!',
      '🔥 Sua melhor streak foi {best_streak} dias. Supere isso!',
      '💡 Você domina {strong_topic} mas pode melhorar em {weak_topic}',
      '📈 Nas últimas 7 dias você aprendeu {terms_learned} termos novos!',
      '🏅 Parabéns! {achievements} achievements este mês!'
    ],
    timing: 'user_optimal_time',
    priority: 'low'
  }
];

export function getRandomTemplate(type: string, data?: Record<string, any>): { title: string; body: string } {
  const template = notificationTemplates.find(t => t.type === type);
  if (!template) {
    return { title: 'CryptoLingo', body: 'Você tem uma nova notificação!' };
  }

  let body = template.templates[Math.floor(Math.random() * template.templates.length)];
  
  if (data) {
    Object.keys(data).forEach(key => {
      body = body.replace(`{${key}}`, String(data[key]));
    });
  }

  const titles: Record<string, string> = {
    STUDY_REMINDER: 'Hora de Estudar! 📚',
    SOCIAL_COMPETITIVE: 'Ranking Atualizado! 🏆',
    MARKET_NEWS: 'Novidades do Mercado 📊',
    BREAKING_NEWS: '🚨 ALERTA DE MERCADO',
    DUEL_CHALLENGE: '⚔️ Desafio de Duelo',
    PERSONALIZED_INSIGHT: '💡 Seu Progresso',
    REWARDS: 'Recompensa Disponível! 🎁',
    STREAK_DANGER: 'Streak em Risco! 🔥',
    CHALLENGE_AVAILABLE: 'Novo Desafio! 🎯',
    ACHIEVEMENT_UNLOCKED: 'Achievement! 🏆'
  };

  return {
    title: titles[type] || 'CryptoLingo',
    body
  };
}
