// Premium System Types for CryptoLingo Lifetime Upgrade

export type PaymentMethod = 'pix' | 'credit_card' | 'debit_card' | 'boleto';
export type PaymentGateway = 'stripe' | 'mercado_pago';
export type PremiumTier = 'free' | 'premium_lifetime';

export interface PremiumStatus {
  isPremium: boolean;
  tier: PremiumTier;
  purchaseDate?: string;
  transactionId?: string;
  paymentMethod?: PaymentMethod;
  paymentGateway?: PaymentGateway;
  amount?: number;
  currency: 'BRL' | 'USD';
  expiresAt?: never;
  userId?: string;
}

export interface PurchaseRequest {
  userId: string;
  email: string;
  paymentMethod: PaymentMethod;
  paymentGateway: PaymentGateway;
  amount: number;
  currency: string;
  metadata?: {
    appVersion: string;
    platform: string;
    referralCode?: string;
  };
}

export interface PremiumFeature {
  id: string;
  name: string;
  description: string;
  icon: string;
  category: 'learning' | 'tools' | 'social' | 'analytics' | 'support';
  freeLimit?: number | string;
  premiumLimit: 'unlimited' | number | string;
}

export interface PaymentData {
  userId: string;
  email: string;
  paymentMethod: PaymentMethod;
  paymentGateway: PaymentGateway;
  amount: number;
  currency: string;
  metadata?: {
    appVersion: string;
    platform: string;
    referralCode?: string;
  };
}

export interface PurchaseResponse {
  success: boolean;
  transactionId?: string;
  premiumStatus?: PremiumStatus;
  error?: string;
  errorCode?: string;
  paymentUrl?: string; // For redirect-based payments (Pix QR code, Boleto)
}

export interface RestorePurchaseRequest {
  userId?: string;
  email?: string;
  transactionId?: string;
}

export interface UpgradePrompt {
  id: string;
  trigger: 'lesson_limit' | 'news_limit' | 'duel_limit' | 'ai_tutor_limit' | 'advanced_lesson_tap' | 'trading_simulator' | 'custom_trigger';
  title: string;
  message: string;
  featureName: string;
  urgency?: 'low' | 'medium' | 'high';
  showTestimonials?: boolean;
}

export interface PremiumBadge {
  id: string;
  name: string;
  icon: string;
  description: string;
  unlockedAt: string;
  isPremiumOnly: boolean;
}

export interface UpgradeAnalytics {
  event: 'upgrade_modal_viewed' | 'upgrade_button_clicked' | 'payment_method_selected' | 'purchase_completed' | 'purchase_failed' | 'restore_attempted';
  trigger?: string;
  paymentMethod?: PaymentMethod;
  timestamp: number;
  userId?: string;
  metadata?: Record<string, any>;
}

export interface ReferralData {
  code: string;
  referrerId: string;
  referrerName: string;
  usageCount: number;
  rewardEarned: number; // in BRL
  createdAt: string;
}

// Premium Feature Definitions
export const PREMIUM_FEATURES: PremiumFeature[] = [
  {
    id: 'unlimited_lessons',
    name: 'Todas as Lições Avançadas',
    description: '50+ lições sobre DeFi, Web3, Trading e mais',
    icon: '📚',
    category: 'learning',
    freeLimit: 'Apenas lições básicas',
    premiumLimit: 'unlimited',
  },
  {
    id: 'ad_free',
    name: 'Experiência Sem Anúncios',
    description: 'Zero ads, interface limpa e rápida',
    icon: '🚫',
    category: 'learning',
    freeLimit: 'Anúncios visíveis',
    premiumLimit: 'Sem anúncios',
  },
  {
    id: 'ai_tutor',
    name: 'Tutor de IA Ilimitado',
    description: 'Perguntas ilimitadas, quizzes personalizados',
    icon: '🤖',
    category: 'tools',
    freeLimit: '2 perguntas/semana',
    premiumLimit: 'unlimited',
  },
  {
    id: 'trading_simulator',
    name: 'Simulador de Trading Real',
    description: 'Portfólio virtual com preços em tempo real',
    icon: '📈',
    category: 'tools',
    freeLimit: 'Bloqueado',
    premiumLimit: '$10,000 virtuais',
  },
  {
    id: 'advanced_analytics',
    name: 'Dashboard de Analytics',
    description: 'Gráficos, métricas e recomendações personalizadas',
    icon: '📊',
    category: 'analytics',
    freeLimit: 'XP e Level básicos',
    premiumLimit: 'Analytics completo',
  },
  {
    id: 'unlimited_news',
    name: 'Notícias Ilimitadas',
    description: 'Leia quantos artigos quiser por dia',
    icon: '📰',
    category: 'learning',
    freeLimit: '5 artigos/dia',
    premiumLimit: 'unlimited',
  },
  {
    id: 'unlimited_duels',
    name: 'Duelos Ilimitados',
    description: 'Desafie amigos sem limites diários',
    icon: '⚔️',
    category: 'social',
    freeLimit: '3 duelos/dia',
    premiumLimit: 'unlimited',
  },
  {
    id: 'unlimited_challenges',
    name: 'Desafios Diários Ilimitados',
    description: 'Complete quantos desafios quiser',
    icon: '🎯',
    category: 'learning',
    freeLimit: '3 desafios/dia',
    premiumLimit: 'unlimited',
  },
  {
    id: 'study_groups',
    name: 'Grupos de Estudo Privados',
    description: 'Crie grupos com até 20 membros',
    icon: '👥',
    category: 'social',
    freeLimit: 'Bloqueado',
    premiumLimit: 'Até 20 membros',
  },
  {
    id: 'premium_badges',
    name: 'Badges Exclusivos Premium',
    description: 'Conquistas e emblemas especiais',
    icon: '🏆',
    category: 'social',
    freeLimit: 'Badges básicos',
    premiumLimit: 'Todos os badges',
  },
  {
    id: 'xp_multiplier',
    name: 'Multiplicador 2x XP',
    description: 'Ganhe XP duas vezes mais rápido',
    icon: '⚡',
    category: 'learning',
    freeLimit: '1x XP',
    premiumLimit: '2x XP',
  },
  {
    id: 'priority_support',
    name: 'Suporte Prioritário',
    description: 'Resposta em até 24 horas por email',
    icon: '💬',
    category: 'support',
    freeLimit: 'Suporte padrão',
    premiumLimit: 'Prioridade 24h',
  },
];

// Pricing Configuration
export const PREMIUM_PRICE = {
  amount: 19.99,
  currency: 'BRL',
  symbol: 'R$',
  formattedPrice: 'R$ 19,99',
  originalPrice: 49.99, // For showing discount
  formattedOriginalPrice: 'R$ 49,99',
  discountPercentage: 60, // 60% off launch price
};

// Upgrade Prompts Configuration
export const UPGRADE_PROMPTS: Record<string, UpgradePrompt> = {
  lesson_limit: {
    id: 'lesson_limit',
    trigger: 'lesson_limit',
    title: 'Você está aprendendo rápido! 🚀',
    message: 'Desbloqueie 45+ lições avançadas sobre DeFi, Web3 e Trading por apenas R$ 19,99 - pagamento único!',
    featureName: 'Lições Avançadas',
    urgency: 'medium',
    showTestimonials: true,
  },
  news_limit: {
    id: 'news_limit',
    trigger: 'news_limit',
    title: '📰 Limite de Artigos Atingido',
    message: 'Você leu 5/5 artigos hoje. Libere acesso ilimitado a todas as notícias com Premium Lifetime!',
    featureName: 'Notícias Ilimitadas',
    urgency: 'high',
  },
  duel_limit: {
    id: 'duel_limit',
    trigger: 'duel_limit',
    title: '⚔️ Você está pegando fogo!',
    message: 'Limite de 3 duelos atingido. Desbloqueie duelos ilimitados e domine o ranking!',
    featureName: 'Duelos Ilimitados',
    urgency: 'high',
  },
  ai_tutor_limit: {
    id: 'ai_tutor_limit',
    trigger: 'ai_tutor_limit',
    title: '🤖 Limite do Tutor de IA',
    message: 'Você usou suas 2 perguntas semanais. Upgrade para perguntas ilimitadas e quizzes personalizados!',
    featureName: 'Tutor de IA Ilimitado',
    urgency: 'medium',
  },
  advanced_lesson_tap: {
    id: 'advanced_lesson_tap',
    trigger: 'advanced_lesson_tap',
    title: 'Lição Premium Bloqueada 🔒',
    message: 'Esta lição faz parte do conteúdo avançado. Desbloqueie esta + 44 outras lições para sempre!',
    featureName: 'Conteúdo Avançado',
    urgency: 'low',
    showTestimonials: true,
  },
  trading_simulator: {
    id: 'trading_simulator',
    trigger: 'trading_simulator',
    title: 'Simulador de Trading 📈',
    message: 'Pratique trading com $10,000 virtuais e preços em tempo real. Vale 10x o preço do Premium!',
    featureName: 'Trading Simulator',
    urgency: 'medium',
  },
};

// Testimonials for social proof
export const PREMIUM_TESTIMONIALS = [
  {
    id: '1',
    name: 'João Silva',
    level: 45,
    avatar: '👨‍💼',
    quote: 'Melhor investimento de R$20 que já fiz em educação!',
    rating: 5,
  },
  {
    id: '2',
    name: 'Maria Santos',
    level: 32,
    avatar: '👩‍🎓',
    quote: 'O simulador de trading sozinho vale 10x o preço!',
    rating: 5,
  },
  {
    id: '3',
    name: 'Carlos Oliveira',
    level: 58,
    avatar: '👨‍💻',
    quote: 'Aprendi DeFi em 2 semanas com as lições Premium. Incrível!',
    rating: 5,
  },
];

// Storage Keys
export const STORAGE_KEYS = {
  PREMIUM_STATUS: '@cryptolingo_premium_status',
  PREMIUM_PURCHASE_RECEIPT: '@cryptolingo_purchase_receipt',
  UPGRADE_PROMPT_HISTORY: '@cryptolingo_upgrade_prompts',
  REFERRAL_CODE: '@cryptolingo_referral_code',
};

export const PREMIUM_STORAGE_KEY = STORAGE_KEYS.PREMIUM_STATUS;
