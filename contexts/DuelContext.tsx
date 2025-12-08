import createContextHook from '@nkzw/create-context-hook';
import { useState, useCallback, useRef, useEffect } from 'react';
import { DuelState, DuelPlayer, DuelAnswer, DuelResult } from '@/types/duel';
import { getRandomDuelQuestions } from '@/data/duel-questions';
import { DUEL_CONFIG } from '@/data/duel-config';
import { analytics } from '@/utils/analytics';

const MOCK_PLAYERS: DuelPlayer[] = [
  { id: 'bot1', name: 'CryptoMaster', avatar: '🤖', level: 5, rating: 1200 },
  { id: 'bot2', name: 'BlockchainPro', avatar: '🦾', level: 4, rating: 1100 },
  { id: 'bot3', name: 'DeFiWizard', avatar: '🧙‍♂️', level: 6, rating: 1300 },
  { id: 'bot4', name: 'HODLer', avatar: '💎', level: 3, rating: 1000 },
  { id: 'bot5', name: 'MoonBoy', avatar: '🚀', level: 5, rating: 1150 },
];

export const [DuelContext, useDuel] = createContextHook(() => {
  const [currentDuel, setCurrentDuel] = useState<DuelState | null>(null);
  const [isSearching, setIsSearching] = useState(false);
  const timerRef = useRef<NodeJS.Timeout | null>(null);

  useEffect(() => {
    const currentTimer = timerRef.current;
    return () => {
      if (currentTimer) {
        clearInterval(currentTimer);
      }
    };
  }, []);

  const findOpponent = useCallback((playerLevel: number): DuelPlayer => {
    const eligibleOpponents = MOCK_PLAYERS.filter(
      player => Math.abs(player.level - playerLevel) <= 2
    );
    
    return eligibleOpponents[Math.floor(Math.random() * eligibleOpponents.length)] || MOCK_PLAYERS[0];
  }, []);

  const startDuel = useCallback((playerLevel: number) => {
    const opponent = findOpponent(playerLevel);
    const questions = getRandomDuelQuestions(DUEL_CONFIG.questionCount);

    analytics.trackDuelStarted(
      opponent.level,
      playerLevel,
      0,
      0
    );
    
    const duel: DuelState = {
      id: `duel_${Date.now()}`,
      opponent,
      questions,
      currentQuestionIndex: 0,
      myAnswers: [],
      opponentAnswers: [],
      timeRemaining: DUEL_CONFIG.timePerQuestion,
      status: 'in_progress',
      startedAt: new Date().toISOString(),
    };
    
    setCurrentDuel(duel);
    return duel;
  }, [findOpponent]);

  const submitAnswer = useCallback((answer: number, timeToAnswer: number) => {
    if (!currentDuel || currentDuel.currentQuestionIndex >= currentDuel.questions.length) {
      return;
    }

    const currentQuestion = currentDuel.questions[currentDuel.currentQuestionIndex];
    const correct = answer === currentQuestion.correctAnswer;
    
    const myAnswer: DuelAnswer = {
      questionId: currentQuestion.id,
      answer,
      timeToAnswer,
      correct,
    };

    const opponentAccuracy = 0.6 + Math.random() * 0.3;
    const opponentCorrect = Math.random() < opponentAccuracy;
    const opponentAnswer: DuelAnswer = {
      questionId: currentQuestion.id,
      answer: opponentCorrect ? currentQuestion.correctAnswer : Math.floor(Math.random() * currentQuestion.options.length),
      timeToAnswer: 5 + Math.random() * 8,
      correct: opponentCorrect,
    };

    const newMyAnswers = [...currentDuel.myAnswers, myAnswer];
    const newOpponentAnswers = [...currentDuel.opponentAnswers, opponentAnswer];
    
    const isLastQuestion = currentDuel.currentQuestionIndex === currentDuel.questions.length - 1;
    
    setCurrentDuel({
      ...currentDuel,
      myAnswers: newMyAnswers,
      opponentAnswers: newOpponentAnswers,
      currentQuestionIndex: currentDuel.currentQuestionIndex + 1,
      timeRemaining: DUEL_CONFIG.timePerQuestion,
      status: isLastQuestion ? 'completed' : 'in_progress',
      completedAt: isLastQuestion ? new Date().toISOString() : undefined,
    });

    return { myAnswer, opponentAnswer };
  }, [currentDuel]);

  const calculateResult = useCallback((): DuelResult | null => {
    if (!currentDuel) return null;

    const myScore = currentDuel.myAnswers.filter(a => a.correct).length;
    const opponentScore = currentDuel.opponentAnswers.filter(a => a.correct).length;

    let winner: string | null = null;
    let reward = DUEL_CONFIG.rewards.draw;

    if (myScore > opponentScore) {
      winner = 'player';
      reward = DUEL_CONFIG.rewards.winner;
    } else if (opponentScore > myScore) {
      winner = 'opponent';
      reward = DUEL_CONFIG.rewards.loser;
    }

    const duelDuration = currentDuel.completedAt && currentDuel.startedAt
      ? (new Date(currentDuel.completedAt).getTime() - new Date(currentDuel.startedAt).getTime()) / 1000
      : 0;

    const avgResponseTime = currentDuel.myAnswers.length > 0
      ? currentDuel.myAnswers.reduce((sum, a) => sum + a.timeToAnswer, 0) / currentDuel.myAnswers.length
      : 0;

    const result: 'win' | 'lose' | 'draw' = winner === 'player' ? 'win' : winner === 'opponent' ? 'lose' : 'draw';

    analytics.trackDuelCompleted(
      result,
      myScore,
      opponentScore,
      duelDuration,
      avgResponseTime
    );

    return {
      winner,
      myScore,
      opponentScore,
      myAnswers: currentDuel.myAnswers,
      opponentAnswers: currentDuel.opponentAnswers,
      reward,
    };
  }, [currentDuel]);

  const endDuel = useCallback(() => {
    setCurrentDuel(null);
    setIsSearching(false);
  }, []);

  const searchForOpponent = useCallback(async (playerLevel: number): Promise<DuelPlayer> => {
    setIsSearching(true);
    
    await new Promise(resolve => setTimeout(resolve, 2000));
    
    const opponent = findOpponent(playerLevel);
    setIsSearching(false);
    return opponent;
  }, [findOpponent]);

  return {
    currentDuel,
    isSearching,
    startDuel,
    submitAnswer,
    calculateResult,
    endDuel,
    searchForOpponent,
  };
});
