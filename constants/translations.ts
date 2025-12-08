export type Language = 'en' | 'pt';

export interface Translation {
  app: {
    name: string;
    subtitle: string;
    loading: string;
  };
  challenges: {
    completed: string;
    progress: string;
    bonus: string;
    easy: string;
    medium: string;
    hard: string;
  };
  navigation: {
    home: string;
    leaderboard: string;
    profile: string;
  };
  home: {
    title: string;
    subtitle: string;
    levelLabel: string;
    dayStreak: string;
    lingoCoins: string;
    lives: string;
    learningPath: string;
    noLivesAlert: string;
  };
  lesson: {
    progress: string;
    hint: string;
    check: string;
    continue: string;
    correct: string;
    incorrect: string;
    explanation: string;
    livesRemaining: string;
    questionOf: string;
  };
  lessonComplete: {
    title: string;
    subtitle: string;
    xpEarned: string;
    coinsEarned: string;
    perfectBonus: string;
    accuracy: string;
    levelUp: string;
    levelUpMessage: string;
    continue: string;
    reviewMistakes: string;
  };
  profile: {
    title: string;
    userName: string;
    totalXP: string;
    completed: string;
    progress: string;
    dayStreak: string;
    achievements: string;
    studyStatistics: string;
    currentLevel: string;
    lessonsCompleted: string;
    totalExperience: string;
    lingoCoinsBalance: string;
    resetProgress: string;
    resetConfirmTitle: string;
    resetConfirmMessage: string;
    cancel: string;
    reset: string;
    languageSettings: string;
    selectLanguage: string;
    logout: string;
  };
  leaderboard: {
    title: string;
    rank: string;
    player: string;
    xp: string;
    you: string;
  };
  achievements: {
    firstSteps: { name: string; description: string; };
    weekWarrior: { name: string; description: string; };
    risingStar: { name: string; description: string; };
    perfectionist: { name: string; description: string; };
    coinCollector: { name: string; description: string; };
    cryptoMaster: { name: string; description: string; };
  };
  common: {
    level: string;
    of: string;
    coins: string;
  };
  auth: {
    welcome: string;
    signInToContinue: string;
    createAccount: string;
    email: string;
    password: string;
    displayName: string;
    signIn: string;
    signUp: string;
    or: string;
    continueWithGoogle: string;
    haveAccount: string;
    noAccount: string;
    error: string;
    fillFields: string;
    enterName: string;
    passwordLength: string;
    unknownError: string;
    unexpectedError: string;
    googleNotAvailable: string;
  };
}

export const translations: Record<Language, Translation> = {
  en: {
    app: {
      name: 'CryptoLingo',
      subtitle: 'Master Crypto, One Lesson at a Time',
      loading: 'Loading...',
    },
    challenges: {
      completed: '🎉 Completed!',
      progress: 'Progress',
      bonus: 'Bonus',
      easy: 'Easy',
      medium: 'Medium',
      hard: 'Hard',
    },
    navigation: {
      home: 'Home',
      leaderboard: 'Leaderboard',
      profile: 'Profile',
    },
    home: {
      title: 'CryptoLingo',
      subtitle: 'Master Crypto, One Lesson at a Time',
      levelLabel: 'Level',
      dayStreak: 'Day Streak',
      lingoCoins: 'LingoCoins',
      lives: 'Lives',
      learningPath: 'Your Learning Path',
      noLivesAlert: 'No lives left! Wait for them to regenerate or buy more.',
    },
    lesson: {
      progress: 'Progress',
      hint: 'Hint',
      check: 'Check Answer',
      continue: 'Continue',
      correct: 'Correct!',
      incorrect: 'Incorrect',
      explanation: 'Explanation',
      livesRemaining: 'Lives remaining',
      questionOf: 'of',
    },
    lessonComplete: {
      title: 'Lesson Complete!',
      subtitle: 'Awesome work!',
      xpEarned: 'XP Earned',
      coinsEarned: 'Coins Earned',
      perfectBonus: 'Perfect Bonus',
      accuracy: 'Accuracy',
      levelUp: 'Level Up!',
      levelUpMessage: 'You reached level',
      continue: 'Continue',
      reviewMistakes: 'Review Mistakes',
    },
    profile: {
      title: 'Profile',
      userName: 'Crypto Learner',
      totalXP: 'Total XP',
      completed: 'Completed',
      progress: 'Progress',
      dayStreak: 'Day Streak',
      achievements: 'Achievements',
      studyStatistics: 'Study Statistics',
      currentLevel: 'Current Level',
      lessonsCompleted: 'Lessons Completed',
      totalExperience: 'Total Experience',
      lingoCoinsBalance: 'LingoCoins Balance',
      resetProgress: 'Reset Progress',
      resetConfirmTitle: 'Reset Progress',
      resetConfirmMessage: 'Are you sure you want to reset all progress? This cannot be undone.',
      cancel: 'Cancel',
      reset: 'Reset',
      languageSettings: 'Language Settings',
      selectLanguage: 'Select Language',
      logout: 'Logout',
    },
    leaderboard: {
      title: 'Leaderboard',
      rank: 'Rank',
      player: 'Player',
      xp: 'XP',
      you: 'You',
    },
    achievements: {
      firstSteps: {
        name: 'First Steps',
        description: 'Complete your first lesson',
      },
      weekWarrior: {
        name: 'Week Warrior',
        description: 'Maintain a 7-day streak',
      },
      risingStar: {
        name: 'Rising Star',
        description: 'Reach level 5',
      },
      perfectionist: {
        name: 'Perfectionist',
        description: 'Get perfect score on 3 lessons',
      },
      coinCollector: {
        name: 'Coin Collector',
        description: 'Earn 100 LingoCoins',
      },
      cryptoMaster: {
        name: 'Crypto Fundamentals Master',
        description: 'Complete all Module 1 lessons',
      },
    },
    common: {
      level: 'Level',
      of: 'of',
      coins: 'coins',
    },
    auth: {
      welcome: 'Welcome to CryptoLingo',
      signInToContinue: 'Sign in to continue your learning journey',
      createAccount: 'Create your account to start learning',
      email: 'Email',
      password: 'Password',
      displayName: 'Display Name',
      signIn: 'Sign In',
      signUp: 'Sign Up',
      or: 'OR',
      continueWithGoogle: 'Continue with Google',
      haveAccount: 'Already have an account? Sign in',
      noAccount: "Don't have an account? Sign up",
      error: 'Error',
      fillFields: 'Please fill in all fields',
      enterName: 'Please enter your name',
      passwordLength: 'Password must be at least 6 characters',
      unknownError: 'An unknown error occurred',
      unexpectedError: 'An unexpected error occurred',
      googleNotAvailable: 'Google Sign-In is not available yet',
    },
  },
  pt: {
    app: {
      name: 'CryptoLingo',
      subtitle: 'Domine Cripto, Uma Lição por Vez',
      loading: 'Carregando...',
    },
    challenges: {
      completed: '🎉 Completado!',
      progress: 'Progresso',
      bonus: 'Bônus',
      easy: 'Fácil',
      medium: 'Médio',
      hard: 'Difícil',
    },
    navigation: {
      home: 'Início',
      leaderboard: 'Ranking',
      profile: 'Perfil',
    },
    home: {
      title: 'CryptoLingo',
      subtitle: 'Domine Cripto, Uma Lição por Vez',
      levelLabel: 'Nível',
      dayStreak: 'Dias Seguidos',
      lingoCoins: 'LingoMoedas',
      lives: 'Vidas',
      learningPath: 'Seu Caminho de Aprendizado',
      noLivesAlert: 'Sem vidas! Espere elas regenerarem ou compre mais.',
    },
    lesson: {
      progress: 'Progresso',
      hint: 'Dica',
      check: 'Verificar Resposta',
      continue: 'Continuar',
      correct: 'Correto!',
      incorrect: 'Incorreto',
      explanation: 'Explicação',
      livesRemaining: 'Vidas restantes',
      questionOf: 'de',
    },
    lessonComplete: {
      title: 'Lição Completa!',
      subtitle: 'Trabalho incrível!',
      xpEarned: 'XP Ganho',
      coinsEarned: 'Moedas Ganhas',
      perfectBonus: 'Bônus Perfeito',
      accuracy: 'Precisão',
      levelUp: 'Subiu de Nível!',
      levelUpMessage: 'Você alcançou o nível',
      continue: 'Continuar',
      reviewMistakes: 'Revisar Erros',
    },
    profile: {
      title: 'Perfil',
      userName: 'Aprendiz de Cripto',
      totalXP: 'XP Total',
      completed: 'Concluídos',
      progress: 'Progresso',
      dayStreak: 'Dias Seguidos',
      achievements: 'Conquistas',
      studyStatistics: 'Estatísticas de Estudo',
      currentLevel: 'Nível Atual',
      lessonsCompleted: 'Lições Concluídas',
      totalExperience: 'Experiência Total',
      lingoCoinsBalance: 'Saldo de LingoMoedas',
      resetProgress: 'Resetar Progresso',
      resetConfirmTitle: 'Resetar Progresso',
      resetConfirmMessage: 'Tem certeza que deseja resetar todo o progresso? Isso não pode ser desfeito.',
      cancel: 'Cancelar',
      reset: 'Resetar',
      languageSettings: 'Configurações de Idioma',
      selectLanguage: 'Selecionar Idioma',
      logout: 'Sair',
    },
    leaderboard: {
      title: 'Ranking',
      rank: 'Posição',
      player: 'Jogador',
      xp: 'XP',
      you: 'Você',
    },
    achievements: {
      firstSteps: {
        name: 'Primeiros Passos',
        description: 'Complete sua primeira lição',
      },
      weekWarrior: {
        name: 'Guerreiro Semanal',
        description: 'Mantenha uma sequência de 7 dias',
      },
      risingStar: {
        name: 'Estrela em Ascensão',
        description: 'Alcance o nível 5',
      },
      perfectionist: {
        name: 'Perfeccionista',
        description: 'Obtenha pontuação perfeita em 3 lições',
      },
      coinCollector: {
        name: 'Coletor de Moedas',
        description: 'Ganhe 100 LingoMoedas',
      },
      cryptoMaster: {
        name: 'Mestre em Fundamentos de Cripto',
        description: 'Complete todas as lições do Módulo 1',
      },
    },
    common: {
      level: 'Nível',
      of: 'de',
      coins: 'moedas',
    },
    auth: {
      welcome: 'Bem-vindo ao CryptoLingo',
      signInToContinue: 'Entre para continuar sua jornada de aprendizado',
      createAccount: 'Crie sua conta para começar a aprender',
      email: 'E-mail',
      password: 'Senha',
      displayName: 'Nome de Exibição',
      signIn: 'Entrar',
      signUp: 'Criar Conta',
      or: 'OU',
      continueWithGoogle: 'Continuar com Google',
      haveAccount: 'Já tem uma conta? Entre',
      noAccount: 'Não tem uma conta? Criar conta',
      error: 'Erro',
      fillFields: 'Por favor, preencha todos os campos',
      enterName: 'Por favor, insira seu nome',
      passwordLength: 'A senha deve ter pelo menos 6 caracteres',
      unknownError: 'Ocorreu um erro desconhecido',
      unexpectedError: 'Ocorreu um erro inesperado',
      googleNotAvailable: 'Login com Google ainda não está disponível',
    },
  },
};
