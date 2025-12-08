import React, { useState, useEffect, useRef } from 'react';
import {
  View,
  Text,
  StyleSheet,
  Pressable,
  Animated,
  SafeAreaView,
} from 'react-native';
import { useRouter } from 'expo-router';
import { useDuel } from '@/contexts/DuelContext';
import { useUserProgress } from '@/contexts/UserProgressContext';
import { useAuth } from '@/contexts/AuthContext';
import { Swords, Clock, X } from 'lucide-react-native';
import Colors from '@/constants/colors';



export default function DuelScreen() {
  const router = useRouter();
  const { currentDuel, submitAnswer, calculateResult, endDuel } = useDuel();
  const { completeLesson } = useUserProgress();
  const { user } = useAuth();
  const [selectedAnswer, setSelectedAnswer] = useState<number | null>(null);
  const [timeRemaining, setTimeRemaining] = useState(15);
  const [questionStartTime, setQuestionStartTime] = useState(Date.now());
  const [showFeedback, setShowFeedback] = useState(false);
  const [myLastAnswer, setMyLastAnswer] = useState<{ correct: boolean } | null>(null);
  const [opponentLastAnswer, setOpponentLastAnswer] = useState<{ correct: boolean } | null>(null);
  
  const progressAnim = useRef(new Animated.Value(1)).current;
  const feedbackAnim = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    if (!currentDuel) {
      router.back();
      return;
    }

    if (currentDuel.status === 'completed') {
      handleDuelComplete();
      return;
    }

    setTimeRemaining(15);
    setQuestionStartTime(Date.now());
    setSelectedAnswer(null);
    setShowFeedback(false);
    setMyLastAnswer(null);
    setOpponentLastAnswer(null);

    progressAnim.setValue(1);
    Animated.timing(progressAnim, {
      toValue: 0,
      duration: 15000,
      useNativeDriver: false,
    }).start();

    const timer = setInterval(() => {
      setTimeRemaining(prev => {
        if (prev <= 1) {
          handleTimeout();
          return 0;
        }
        return prev - 1;
      });
    }, 1000);

    return () => clearInterval(timer);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [currentDuel?.currentQuestionIndex]);

  const handleTimeout = () => {
    if (selectedAnswer === null) {
      handleAnswerSelect(-1);
    }
  };

  const handleAnswerSelect = (answerIndex: number) => {
    if (selectedAnswer !== null || !currentDuel) return;

    const timeToAnswer = (Date.now() - questionStartTime) / 1000;
    setSelectedAnswer(answerIndex);

    const result = submitAnswer(answerIndex, timeToAnswer);
    if (result) {
      setMyLastAnswer({ correct: result.myAnswer.correct });
      setOpponentLastAnswer({ correct: result.opponentAnswer.correct });
      setShowFeedback(true);

      Animated.sequence([
        Animated.timing(feedbackAnim, {
          toValue: 1,
          duration: 300,
          useNativeDriver: true,
        }),
        Animated.delay(1500),
        Animated.timing(feedbackAnim, {
          toValue: 0,
          duration: 300,
          useNativeDriver: true,
        }),
      ]).start(() => {
        if (currentDuel.currentQuestionIndex === currentDuel.questions.length - 1) {
          setTimeout(handleDuelComplete, 500);
        }
      });
    }
  };

  const handleDuelComplete = () => {
    const result = calculateResult();
    if (!result) return;

    completeLesson({
      lessonId: `duel_${currentDuel?.id}`,
      score: result.myScore,
      totalQuestions: currentDuel?.questions.length || 10,
      xpEarned: result.reward.xp,
      coinsEarned: result.reward.coins,
      perfectScore: result.myScore === currentDuel?.questions.length,
      completed: true,
    });

    router.push({
      pathname: '/duel-result' as never,
      params: {
        winner: result.winner || 'draw',
        myScore: result.myScore,
        opponentScore: result.opponentScore,
        xp: result.reward.xp,
        coins: result.reward.coins,
        trophies: result.reward.trophies,
      },
    });
  };

  const handleExit = () => {
    endDuel();
    router.back();
  };

  if (!currentDuel || !currentDuel.questions[currentDuel.currentQuestionIndex]) {
    return null;
  }

  const currentQuestion = currentDuel.questions[currentDuel.currentQuestionIndex];
  const myScore = currentDuel.myAnswers.filter(a => a.correct).length;
  const opponentScore = currentDuel.opponentAnswers.filter(a => a.correct).length;

  const progressWidth = progressAnim.interpolate({
    inputRange: [0, 1],
    outputRange: ['0%', '100%'],
  });

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.header}>
        <Pressable onPress={handleExit} style={styles.exitButton}>
          <X color={Colors.text} size={24} />
        </Pressable>
        
        <View style={styles.timerContainer}>
          <Clock color={timeRemaining <= 5 ? Colors.error : Colors.primary} size={20} />
          <Text style={[styles.timer, timeRemaining <= 5 && styles.timerWarning]}>
            {timeRemaining}s
          </Text>
        </View>

        <View style={styles.questionCounter}>
          <Text style={styles.questionCounterText}>
            {currentDuel.currentQuestionIndex + 1}/{currentDuel.questions.length}
          </Text>
        </View>
      </View>

      <View style={styles.progressBarContainer}>
        <Animated.View style={[styles.progressBar, { width: progressWidth }]} />
      </View>

      <View style={styles.scoreBoard}>
        <View style={styles.playerScore}>
          <Text style={styles.playerAvatar}>{user?.avatar || '👤'}</Text>
          <Text style={styles.playerName}>You</Text>
          <Text style={styles.score}>{myScore}</Text>
        </View>

        <View style={styles.vsContainer}>
          <Swords color={Colors.primary} size={28} />
        </View>

        <View style={styles.playerScore}>
          <Text style={styles.playerAvatar}>{currentDuel.opponent.avatar}</Text>
          <Text style={styles.playerName}>{currentDuel.opponent.name}</Text>
          <Text style={styles.score}>{opponentScore}</Text>
        </View>
      </View>

      {showFeedback && (
        <Animated.View style={[styles.feedback, { opacity: feedbackAnim }]}>
          <View style={styles.feedbackRow}>
            <View style={[styles.feedbackItem, myLastAnswer?.correct ? styles.feedbackCorrect : styles.feedbackWrong]}>
              <Text style={styles.feedbackText}>
                {myLastAnswer?.correct ? '✓ Correct!' : '✗ Wrong'}
              </Text>
            </View>
            <View style={[styles.feedbackItem, opponentLastAnswer?.correct ? styles.feedbackCorrect : styles.feedbackWrong]}>
              <Text style={styles.feedbackText}>
                {opponentLastAnswer?.correct ? '✓ Opponent Correct' : '✗ Opponent Wrong'}
              </Text>
            </View>
          </View>
        </Animated.View>
      )}

      <View style={styles.questionContainer}>
        <Text style={styles.question}>{currentQuestion.question}</Text>
      </View>

      <View style={styles.optionsContainer}>
        {currentQuestion.options.map((option, index) => {
          const isSelected = selectedAnswer === index;
          const isCorrect = index === currentQuestion.correctAnswer;
          const showCorrect = selectedAnswer !== null && isCorrect;
          const showWrong = isSelected && !isCorrect && selectedAnswer !== null;

          return (
            <Pressable
              key={index}
              onPress={() => handleAnswerSelect(index)}
              disabled={selectedAnswer !== null}
              style={({ pressed }) => [
                styles.option,
                isSelected && styles.optionSelected,
                showCorrect && styles.optionCorrect,
                showWrong && styles.optionWrong,
                pressed && styles.optionPressed,
              ]}
            >
              <Text style={[
                styles.optionText,
                (isSelected || showCorrect || showWrong) && styles.optionTextSelected,
              ]}>
                {option}
              </Text>
            </Pressable>
          );
        })}
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: Colors.background,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 20,
    paddingVertical: 15,
  },
  exitButton: {
    padding: 8,
  },
  timerContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    backgroundColor: Colors.surface,
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 20,
  },
  timer: {
    fontSize: 18,
    fontWeight: '700' as const,
    color: Colors.primary,
  },
  timerWarning: {
    color: Colors.error,
  },
  questionCounter: {
    backgroundColor: Colors.surface,
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 12,
  },
  questionCounterText: {
    fontSize: 14,
    fontWeight: '600' as const,
    color: Colors.text,
  },
  progressBarContainer: {
    height: 4,
    backgroundColor: Colors.surface,
    marginHorizontal: 20,
  },
  progressBar: {
    height: '100%',
    backgroundColor: Colors.primary,
  },
  scoreBoard: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    alignItems: 'center',
    paddingVertical: 20,
    paddingHorizontal: 20,
  },
  playerScore: {
    alignItems: 'center',
    gap: 8,
  },
  playerAvatar: {
    fontSize: 40,
  },
  playerName: {
    fontSize: 14,
    fontWeight: '600' as const,
    color: Colors.textSecondary,
  },
  score: {
    fontSize: 28,
    fontWeight: '700' as const,
    color: Colors.primary,
  },
  vsContainer: {
    padding: 12,
    backgroundColor: Colors.surface,
    borderRadius: 50,
  },
  feedback: {
    marginHorizontal: 20,
    marginBottom: 10,
  },
  feedbackRow: {
    flexDirection: 'row',
    gap: 10,
  },
  feedbackItem: {
    flex: 1,
    paddingVertical: 12,
    paddingHorizontal: 16,
    borderRadius: 12,
    alignItems: 'center',
  },
  feedbackCorrect: {
    backgroundColor: '#10B98120',
  },
  feedbackWrong: {
    backgroundColor: '#EF444420',
  },
  feedbackText: {
    fontSize: 14,
    fontWeight: '600' as const,
    color: Colors.text,
  },
  questionContainer: {
    paddingHorizontal: 20,
    paddingVertical: 30,
  },
  question: {
    fontSize: 22,
    fontWeight: '700' as const,
    color: Colors.text,
    textAlign: 'center',
    lineHeight: 32,
  },
  optionsContainer: {
    flex: 1,
    paddingHorizontal: 20,
    gap: 12,
  },
  option: {
    backgroundColor: Colors.surface,
    paddingVertical: 18,
    paddingHorizontal: 20,
    borderRadius: 16,
    borderWidth: 2,
    borderColor: 'transparent',
  },
  optionSelected: {
    borderColor: Colors.primary,
    backgroundColor: Colors.primary + '10',
  },
  optionCorrect: {
    borderColor: '#10B981',
    backgroundColor: '#10B98110',
  },
  optionWrong: {
    borderColor: '#EF4444',
    backgroundColor: '#EF444410',
  },
  optionPressed: {
    opacity: 0.7,
  },
  optionText: {
    fontSize: 16,
    fontWeight: '600' as const,
    color: Colors.text,
    textAlign: 'center',
  },
  optionTextSelected: {
    fontWeight: '700' as const,
  },
});
