// QuizModal Component - Interactive quiz after reading news article
import React, { useState, useEffect, useRef } from 'react';
import {
  Modal,
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  Animated,
  Dimensions,
  Platform,
} from 'react-native';
import { BlurView } from 'expo-blur';
import { CheckCircle, XCircle, Trophy, Zap, X } from 'lucide-react-native';
import * as Haptics from 'expo-haptics';
import { NewsQuiz, QuizAnswer } from '@/types/quiz';
import { useQuiz } from '@/contexts/QuizContext';
import { useUserProgress } from '@/contexts/UserProgressContext';
import Colors from '@/constants/colors';

const { height } = Dimensions.get('window');

interface QuizModalProps {
  visible: boolean;
  quiz: NewsQuiz;
  newsId: string;
  onClose: () => void;
  onComplete: (xpEarned: number) => void;
}

export default function QuizModal({ visible, quiz, newsId, onClose, onComplete }: QuizModalProps) {
  const { submitQuizAttempt } = useQuiz();
  useUserProgress();
  
  const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0);
  const [selectedAnswers, setSelectedAnswers] = useState<QuizAnswer[]>([]);
  const [showFeedback, setShowFeedback] = useState(false);
  const [quizStartTime] = useState(Date.now());
  const [questionStartTime, setQuestionStartTime] = useState(Date.now());
  const [isComplete, setIsComplete] = useState(false);
  
  // Animations
  const slideAnim = useRef(new Animated.Value(height)).current;
  const fadeAnim = useRef(new Animated.Value(0)).current;
  const scaleAnim = useRef(new Animated.Value(0.9)).current;
  const feedbackAnim = useRef(new Animated.Value(0)).current;

  const currentQuestion = quiz.questions[currentQuestionIndex];
  const isLastQuestion = currentQuestionIndex === quiz.questions.length - 1;

  useEffect(() => {
    if (visible) {
      Animated.parallel([
        Animated.spring(slideAnim, {
          toValue: 0,
          useNativeDriver: true,
          tension: 65,
          friction: 11,
        }),
        Animated.timing(fadeAnim, {
          toValue: 1,
          duration: 300,
          useNativeDriver: true,
        }),
        Animated.spring(scaleAnim, {
          toValue: 1,
          useNativeDriver: true,
        }),
      ]).start();
    } else {
      slideAnim.setValue(height);
      fadeAnim.setValue(0);
      scaleAnim.setValue(0.9);
    }
  }, [visible, slideAnim, fadeAnim, scaleAnim]);

  const handleAnswerSelect = async (optionId: string, isCorrect: boolean) => {
    if (showFeedback) return; // Prevent multiple selections

    const timeSpent = Math.floor((Date.now() - questionStartTime) / 1000);
    
    const answer: QuizAnswer = {
      questionId: currentQuestion.id,
      selectedOptionId: optionId,
      isCorrect,
      timeSpent,
    };

    setSelectedAnswers([...selectedAnswers, answer]);
    setShowFeedback(true);

    // Haptic feedback
    if (Platform.OS !== 'web') {
      if (isCorrect) {
        await Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
      } else {
        await Haptics.notificationAsync(Haptics.NotificationFeedbackType.Error);
      }
    }

    // Feedback animation
    Animated.spring(feedbackAnim, {
      toValue: 1,
      useNativeDriver: true,
    }).start();

    // Move to next question after delay
    setTimeout(() => {
      if (isLastQuestion) {
        finishQuiz([...selectedAnswers, answer]);
      } else {
        moveToNextQuestion();
      }
    }, 2000);
  };

  const moveToNextQuestion = () => {
    setCurrentQuestionIndex(currentQuestionIndex + 1);
    setShowFeedback(false);
    setQuestionStartTime(Date.now());
    feedbackAnim.setValue(0);
  };

  const finishQuiz = async (allAnswers: QuizAnswer[]) => {
    const totalTimeSpent = Math.floor((Date.now() - quizStartTime) / 1000);
    
    const attempt = await submitQuizAttempt({
      quizId: quiz.id,
      newsId,
      answers: allAnswers,
      score: 0,
      perfectScore: false,
      xpEarned: 0,
      timeSpent: totalTimeSpent,
      completedAt: new Date().toISOString(),
    });

    setIsComplete(true);
    onComplete(attempt.xpEarned);

    setTimeout(() => {
      handleClose();
    }, 3000);
  };

  const handleClose = () => {
    Animated.timing(slideAnim, {
      toValue: height,
      duration: 300,
      useNativeDriver: true,
    }).start(() => {
      onClose();
      // Reset state
      setCurrentQuestionIndex(0);
      setSelectedAnswers([]);
      setShowFeedback(false);
      setIsComplete(false);
    });
  };

  const handleSkip = () => {
    if (Platform.OS !== 'web') {
      Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    }
    handleClose();
  };

  const renderQuestion = () => {
    const selectedAnswer = selectedAnswers.find(a => a.questionId === currentQuestion.id);
    
    return (
      <View style={styles.questionContainer}>
        <View style={styles.progressBar}>
          <View 
            style={[
              styles.progressFill, 
              { width: `${((currentQuestionIndex + 1) / quiz.questions.length) * 100}%` }
            ]} 
          />
        </View>

        <Text style={styles.questionNumber}>
          Questão {currentQuestionIndex + 1} de {quiz.questions.length}
        </Text>

        <Text style={styles.questionText}>{currentQuestion.question}</Text>

        <View style={styles.optionsContainer}>
          {currentQuestion.options.map((option) => {
            const isSelected = selectedAnswer?.selectedOptionId === option.id;
            const showCorrect = showFeedback && option.isCorrect;
            const showWrong = showFeedback && isSelected && !option.isCorrect;

            return (
              <TouchableOpacity
                key={option.id}
                style={[
                  styles.optionButton,
                  isSelected && !showFeedback && styles.optionSelected,
                  showCorrect && styles.optionCorrect,
                  showWrong && styles.optionWrong,
                ]}
                onPress={() => handleAnswerSelect(option.id, option.isCorrect)}
                disabled={showFeedback}
              >
                <Text style={[
                  styles.optionText,
                  (showCorrect || showWrong) && styles.optionTextFeedback,
                ]}>
                  {option.text}
                </Text>

                {showCorrect && (
                  <Animated.View style={{ opacity: feedbackAnim }}>
                    <CheckCircle size={24} color={Colors.success} />
                  </Animated.View>
                )}

                {showWrong && (
                  <Animated.View style={{ opacity: feedbackAnim }}>
                    <XCircle size={24} color={Colors.danger} />
                  </Animated.View>
                )}
              </TouchableOpacity>
            );
          })}
        </View>

        {showFeedback && currentQuestion.explanation && (
          <Animated.View 
            style={[
              styles.explanationContainer,
              { opacity: feedbackAnim, transform: [{ translateY: feedbackAnim.interpolate({
                inputRange: [0, 1],
                outputRange: [20, 0],
              })}] }
            ]}
          >
            <Text style={styles.explanationText}>
              💡 {currentQuestion.explanation}
            </Text>
          </Animated.View>
        )}
      </View>
    );
  };

  const renderCompletion = () => {
    const correctAnswers = selectedAnswers.filter(a => a.isCorrect).length;
    const totalQuestions = quiz.questions.length;
    const isPerfect = correctAnswers === totalQuestions;

    return (
      <View style={styles.completionContainer}>
        {isPerfect && <View style={styles.confettiOverlay} />}
        
        <Animated.View style={{ transform: [{ scale: scaleAnim }] }}>
          <View style={styles.scoreCircle}>
            <Trophy size={48} color={isPerfect ? Colors.coins : Colors.primary} />
            <Text style={styles.scoreText}>
              {correctAnswers}/{totalQuestions}
            </Text>
          </View>
        </Animated.View>

        <Text style={styles.completionTitle}>
          {isPerfect ? '🎉 Perfeito!' : correctAnswers >= 2 ? '👏 Muito bem!' : '📚 Continue estudando!'}
        </Text>

        <Text style={styles.completionMessage}>
          {isPerfect 
            ? 'Você acertou todas! Incrível!' 
            : `Você acertou ${correctAnswers} de ${totalQuestions} questões`}
        </Text>

        <View style={styles.xpEarnedContainer}>
          <Zap size={20} color={Colors.warning} />
          <Text style={styles.xpEarnedText}>
            +{selectedAnswers.length > 0 ? (isPerfect ? 15 : correctAnswers === 2 ? 10 : 5) : 0} XP
          </Text>
        </View>

        <Text style={styles.closingText}>Fechando automaticamente...</Text>
      </View>
    );
  };

  return (
    <Modal
      visible={visible}
      transparent
      animationType="none"
      onRequestClose={handleSkip}
    >
      <BlurView intensity={50} style={styles.overlay}>
        <Animated.View
          style={[
            styles.modalContainer,
            {
              transform: [{ translateY: slideAnim }],
              opacity: fadeAnim,
            },
          ]}
        >
          <View style={styles.header}>
            <View style={styles.headerLeft}>
              <Text style={styles.title}>
                {isComplete ? '✅ Completo' : '🧠 Quiz'}
              </Text>
            </View>
            
            <TouchableOpacity onPress={handleSkip} style={styles.closeButton}>
              <X size={24} color={Colors.textSecondary} />
            </TouchableOpacity>
          </View>

          <View style={styles.content}>
            {isComplete ? renderCompletion() : renderQuestion()}
          </View>

          {!isComplete && !showFeedback && (
            <TouchableOpacity onPress={handleSkip} style={styles.skipButton}>
              <Text style={styles.skipText}>Pular Quiz</Text>
            </TouchableOpacity>
          )}
        </Animated.View>
      </BlurView>
    </Modal>
  );
}

const styles = StyleSheet.create({
  overlay: {
    flex: 1,
    justifyContent: 'flex-end',
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
  },
  modalContainer: {
    backgroundColor: Colors.surface,
    borderTopLeftRadius: 24,
    borderTopRightRadius: 24,
    paddingBottom: Platform.OS === 'ios' ? 40 : 20,
    maxHeight: height * 0.85,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: -4 },
    shadowOpacity: 0.15,
    shadowRadius: 12,
    elevation: 8,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    padding: 20,
    borderBottomWidth: 1,
    borderBottomColor: Colors.border,
  },
  headerLeft: {
    flex: 1,
  },
  title: {
    fontSize: 20,
    fontWeight: '700',
    color: Colors.text,
  },
  closeButton: {
    padding: 8,
  },
  content: {
    padding: 20,
  },
  questionContainer: {
    gap: 20,
  },
  progressBar: {
    height: 4,
    backgroundColor: Colors.border,
    borderRadius: 2,
    overflow: 'hidden',
  },
  progressFill: {
    height: '100%',
    backgroundColor: Colors.primary,
    borderRadius: 2,
  },
  questionNumber: {
    fontSize: 14,
    fontWeight: '600',
    color: Colors.textSecondary,
  },
  questionText: {
    fontSize: 18,
    fontWeight: '600',
    color: Colors.text,
    lineHeight: 26,
  },
  optionsContainer: {
    gap: 12,
  },
  optionButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    padding: 16,
    backgroundColor: Colors.background,
    borderRadius: 12,
    borderWidth: 2,
    borderColor: Colors.border,
  },
  optionSelected: {
    borderColor: Colors.primary,
    backgroundColor: Colors.primary + '10',
  },
  optionCorrect: {
    borderColor: Colors.success,
    backgroundColor: Colors.success + '15',
  },
  optionWrong: {
    borderColor: Colors.danger,
    backgroundColor: Colors.danger + '15',
  },
  optionText: {
    flex: 1,
    fontSize: 16,
    color: Colors.text,
    fontWeight: '500',
  },
  optionTextFeedback: {
    fontWeight: '600',
  },
  explanationContainer: {
    padding: 16,
    backgroundColor: Colors.primary + '10',
    borderRadius: 12,
    borderLeftWidth: 4,
    borderLeftColor: Colors.primary,
  },
  explanationText: {
    fontSize: 14,
    color: Colors.text,
    lineHeight: 20,
  },
  skipButton: {
    alignSelf: 'center',
    paddingVertical: 12,
    paddingHorizontal: 24,
    marginTop: 12,
  },
  skipText: {
    fontSize: 14,
    color: Colors.textSecondary,
    fontWeight: '600',
  },
  completionContainer: {
    alignItems: 'center',
    paddingVertical: 40,
    gap: 16,
  },
  confettiOverlay: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: 'transparent',
  },
  scoreCircle: {
    width: 120,
    height: 120,
    borderRadius: 60,
    backgroundColor: Colors.primary + '15',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
    borderWidth: 4,
    borderColor: Colors.primary,
  },
  scoreText: {
    fontSize: 24,
    fontWeight: '700',
    color: Colors.primary,
  },
  completionTitle: {
    fontSize: 28,
    fontWeight: '700',
    color: Colors.text,
  },
  completionMessage: {
    fontSize: 16,
    color: Colors.textSecondary,
    textAlign: 'center',
  },
  xpEarnedContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    paddingVertical: 12,
    paddingHorizontal: 24,
    backgroundColor: Colors.warning + '15',
    borderRadius: 24,
  },
  xpEarnedText: {
    fontSize: 20,
    fontWeight: '700',
    color: Colors.warning,
  },
  closingText: {
    fontSize: 12,
    color: Colors.textSecondary,
    marginTop: 8,
  },
});
