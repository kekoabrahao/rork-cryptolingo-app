import {
  StyleSheet,
  Text,
  View,
  TouchableOpacity,
  Animated,
  Platform,
  Alert,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { router, useLocalSearchParams, Stack } from "expo-router";
import { useState, useRef, useEffect } from "react";
import { Heart, X, Lightbulb } from "lucide-react-native";
import * as Haptics from "expo-haptics";
import { LinearGradient } from "expo-linear-gradient";
import { useUserProgress } from "@/contexts/UserProgressContext";
import { useSubscription } from "@/contexts/SubscriptionContext";
import { useLanguage } from "@/contexts/LanguageContext";
import { useNotifications } from "@/contexts/NotificationContext";
import { getLesson } from "@/data/lessons-helper";
import { LessonResult } from "@/types/lesson";
import { achievements } from "@/data/achievements";
import Colors from "@/constants/colors";

export default function LessonScreen() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const { progress, completeLesson, loseLife, updateCombo } = useUserProgress();
  const { xpMultiplier, coinMultiplier } = useSubscription();
  const { language, t } = useLanguage();
  const { trackSessionStart, sendImmediateNotification, scheduleStreakReminder, settings } = useNotifications();

  const lesson = getLesson(id || "", language);

  const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0);
  const [selectedAnswer, setSelectedAnswer] = useState<number | null>(null);
  const [showExplanation, setShowExplanation] = useState(false);
  const [correctAnswers, setCorrectAnswers] = useState(0);
  const [wrongAnswers, setWrongAnswers] = useState(0);
  const [isCorrect, setIsCorrect] = useState(false);
  const [showHint, setShowHint] = useState(false);
  const [combo, setCombo] = useState(0);
  const [sessionStartTime] = useState(new Date());

  const progressAnim = useRef(new Animated.Value(0)).current;
  const feedbackAnim = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    const duration = 10;
    trackSessionStart(duration);
  }, [trackSessionStart]);

  useEffect(() => {
    Animated.timing(progressAnim, {
      toValue: currentQuestionIndex,
      duration: 300,
      useNativeDriver: false,
    }).start();
  }, [currentQuestionIndex, progressAnim]);

  if (!lesson) {
    return (
      <SafeAreaView style={styles.container}>
        <Stack.Screen options={{ headerShown: false }} />
        <View style={styles.errorContainer}>
          <Text style={styles.errorText}>{t.lesson.progress}</Text>
          <TouchableOpacity style={styles.button} onPress={() => router.back()}>
            <Text style={styles.buttonText}>{t.lesson.continue}</Text>
          </TouchableOpacity>
        </View>
      </SafeAreaView>
    );
  }

  const currentQuestion = lesson.questions[currentQuestionIndex];
  const totalQuestions = lesson.questions.length;
  const progressPercent = ((currentQuestionIndex + 1) / totalQuestions) * 100;

  const handleAnswerSelect = (answerIndex: number) => {
    if (showExplanation) return;

    if (Platform.OS !== "web") {
      Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    }

    setSelectedAnswer(answerIndex);
  };

  const handleSubmit = () => {
    if (selectedAnswer === null) return;

    const correct = selectedAnswer === currentQuestion.correctAnswer;
    setIsCorrect(correct);
    setShowExplanation(true);

    const newCombo = updateCombo(correct);
    setCombo(newCombo);

    if (correct) {
      setCorrectAnswers(correctAnswers + 1);
      if (Platform.OS !== "web") {
        Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
      }
    } else {
      setWrongAnswers(wrongAnswers + 1);
      loseLife();
      if (Platform.OS !== "web") {
        Haptics.notificationAsync(Haptics.NotificationFeedbackType.Error);
      }
    }

    Animated.spring(feedbackAnim, {
      toValue: 1,
      useNativeDriver: true,
      tension: 50,
      friction: 7,
    }).start();
  };

  const handleNext = () => {
    if (currentQuestionIndex < totalQuestions - 1) {
      setCurrentQuestionIndex(currentQuestionIndex + 1);
      setSelectedAnswer(null);
      setShowExplanation(false);
      setShowHint(false);
      setCombo(progress.currentCombo);
      feedbackAnim.setValue(0);
    } else {
      handleLessonComplete();
    }
  };

  const handleLessonComplete = () => {
    const score = correctAnswers + (selectedAnswer === currentQuestion.correctAnswer ? 1 : 0);
    const result: LessonResult = {
      lessonId: lesson.id,
      score,
      totalQuestions,
      xpEarned: lesson.xpReward,
      coinsEarned: lesson.coinReward,
      perfectScore: score === totalQuestions,
      completed: true,
    };

    const sessionEndTime = new Date();
    const sessionDuration = Math.round((sessionEndTime.getTime() - sessionStartTime.getTime()) / 1000 / 60);
    trackSessionStart(sessionDuration);

    const rewards = completeLesson(result, xpMultiplier, coinMultiplier);

    if (Platform.OS !== "web") {
      Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
    }

    if (rewards.leveledUp && settings.achievements) {
      sendImmediateNotification('ACHIEVEMENT_UNLOCKED', {
        achievement: `Level ${progress.level + 1}`,
        xp: 0,
      });
    }

    if (rewards.dailyChallengeCompleted && settings.achievements) {
      sendImmediateNotification('REWARDS', {
        achievement: 'Daily Challenge Complete',
      });
    }

    if (progress.streak > 0 && settings.studyReminders) {
      scheduleStreakReminder(progress.streak + 1);
    }

    const achievementsData = rewards.newAchievements.map((name) => {
      const achievement = achievements.find((a) => name.includes(a.name));
      if (!achievement) return null;
      const tier = name.includes('Gold')
        ? 'gold'
        : name.includes('Silver')
          ? 'silver'
          : 'bronze';
      return { id: achievement.id, tier };
    }).filter((a): a is { id: string; tier: 'bronze' | 'silver' | 'gold' } => a !== null);

    router.push({
      pathname: "/lesson-complete" as any,
      params: {
        lessonId: lesson.id,
        score: score.toString(),
        total: totalQuestions.toString(),
        xp: rewards.xpGained.toString(),
        coins: rewards.coinsGained.toString(),
        leveledUp: rewards.leveledUp.toString(),
        newAchievements: achievementsData.length > 0 ? JSON.stringify(achievementsData) : undefined,
      },
    });
  };

  const handleExit = () => {
    if (Platform.OS === 'web') {
      if (confirm(t.lesson.explanation)) {
        router.back();
      }
    } else {
      Alert.alert(
        "Exit Lesson",
        t.lesson.explanation,
        [
          { text: "Cancel", style: "cancel" },
          { text: "Exit", style: "destructive", onPress: () => router.back() },
        ]
      );
    }
  };

  const handleShowHint = () => {
    if (currentQuestion.hint && !showHint) {
      setShowHint(true);
      if (Platform.OS !== "web") {
        Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
      }
    }
  };

  const feedbackScale = feedbackAnim.interpolate({
    inputRange: [0, 1],
    outputRange: [0.8, 1],
  });

  return (
    <View style={styles.container}>
      <Stack.Screen options={{ headerShown: false }} />

      <SafeAreaView edges={["top"]} style={styles.safeArea}>
        <View style={styles.header}>
          <TouchableOpacity onPress={handleExit} style={styles.exitButton}>
            <X size={24} color={Colors.text} />
          </TouchableOpacity>

          <View style={styles.progressContainer}>
            <View style={styles.progressBar}>
              <Animated.View
                style={[
                  styles.progressFill,
                  {
                    width: `${progressPercent}%`,
                  },
                ]}
              />
            </View>
            <Text style={styles.progressText}>
              {currentQuestionIndex + 1}/{totalQuestions}
            </Text>
          </View>

          <View style={styles.statsContainer}>
            {progress.currentCombo > 0 && (
              <View style={styles.comboContainer}>
                <Text style={styles.comboText}>🔥 {progress.currentCombo}x</Text>
              </View>
            )}
            <View style={styles.livesContainer}>
              {Array.from({ length: progress.lives }).map((_, i) => (
                <Heart key={i} size={18} color={Colors.lives} fill={Colors.lives} />
              ))}
            </View>
          </View>
        </View>

        <View style={styles.content}>
          <View style={styles.questionSection}>
            <View style={styles.lessonInfo}>
              <Text style={styles.lessonIcon}>{lesson.icon}</Text>
              <Text style={styles.lessonTitle}>{lesson.title}</Text>
            </View>

            <Text style={styles.question}>{currentQuestion.question}</Text>

            {showHint && currentQuestion.hint && (
              <View style={styles.hintCard}>
                <Lightbulb size={16} color={Colors.warning} />
                <Text style={styles.hintText}>{currentQuestion.hint}</Text>
              </View>
            )}
          </View>

          <View style={styles.answersSection}>
            {currentQuestion.options?.map((option, index) => {
              const isSelected = selectedAnswer === index;
              const isCorrectAnswer = index === currentQuestion.correctAnswer;
              const showAsCorrect = showExplanation && isCorrectAnswer;
              const showAsWrong = showExplanation && isSelected && !isCorrect;

              return (
                <TouchableOpacity
                  key={index}
                  onPress={() => handleAnswerSelect(index)}
                  disabled={showExplanation}
                  activeOpacity={0.7}
                  style={[
                    styles.answerButton,
                    isSelected && !showExplanation && styles.answerButtonSelected,
                    showAsCorrect && styles.answerButtonCorrect,
                    showAsWrong && styles.answerButtonWrong,
                  ]}
                >
                  <View style={styles.answerContent}>
                    <View
                      style={[
                        styles.answerCircle,
                        isSelected && !showExplanation && styles.answerCircleSelected,
                        showAsCorrect && styles.answerCircleCorrect,
                        showAsWrong && styles.answerCircleWrong,
                      ]}
                    >
                      {(showAsCorrect || showAsWrong) && (
                        <Text style={styles.answerIcon}>
                          {showAsCorrect ? "✓" : "✗"}
                        </Text>
                      )}
                    </View>
                    <Text
                      style={[
                        styles.answerText,
                        isSelected && !showExplanation && styles.answerTextSelected,
                        (showAsCorrect || showAsWrong) && styles.answerTextBold,
                      ]}
                    >
                      {option}
                    </Text>
                  </View>
                </TouchableOpacity>
              );
            })}
          </View>

          {showExplanation && (
            <Animated.View
              style={[
                styles.explanationCard,
                {
                  transform: [{ scale: feedbackScale }],
                },
              ]}
            >
              <LinearGradient
                colors={
                  isCorrect
                    ? [Colors.success, Colors.accent]
                    : [Colors.danger, "#DC2626"]
                }
                start={{ x: 0, y: 0 }}
                end={{ x: 1, y: 1 }}
                style={styles.explanationGradient}
              >
                <View style={styles.explanationHeader}>
                  <Text style={styles.explanationTitle}>
                    {isCorrect ? t.lesson.correct + " 🎉" : t.lesson.incorrect + " 💡"}
                  </Text>
                  {isCorrect && combo > 1 && (
                    <View style={styles.comboReward}>
                      <Text style={styles.comboRewardText}>🔥 {combo}x Combo!</Text>
                      <Text style={styles.comboRewardSubtext}>+{combo * 2} XP Bonus</Text>
                    </View>
                  )}
                </View>
                <Text style={styles.explanationText}>
                  {currentQuestion.explanation}
                </Text>
              </LinearGradient>
            </Animated.View>
          )}
        </View>

        <View style={styles.footer}>
          {!showExplanation ? (
            <>
              {currentQuestion.hint && !showHint && (
                <TouchableOpacity
                  style={styles.hintButton}
                  onPress={handleShowHint}
                >
                  <Lightbulb size={20} color={Colors.warning} />
                  <Text style={styles.hintButtonText}>{t.lesson.hint}</Text>
                </TouchableOpacity>
              )}
              <TouchableOpacity
                style={[
                  styles.submitButton,
                  selectedAnswer === null && styles.submitButtonDisabled,
                ]}
                onPress={handleSubmit}
                disabled={selectedAnswer === null}
              >
                <Text style={styles.submitButtonText}>
                  {selectedAnswer === null ? "Select an answer" : t.lesson.check}
                </Text>
              </TouchableOpacity>
            </>
          ) : (
            <TouchableOpacity
              style={[
                styles.submitButton,
                { backgroundColor: isCorrect ? Colors.success : Colors.primary },
              ]}
              onPress={handleNext}
            >
              <Text style={styles.submitButtonText}>
                {currentQuestionIndex < totalQuestions - 1 ? t.lesson.continue : t.lessonComplete.title}
              </Text>
            </TouchableOpacity>
          )}
        </View>
      </SafeAreaView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: Colors.background,
  },
  safeArea: {
    flex: 1,
  },
  errorContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    padding: 20,
  },
  errorText: {
    fontSize: 18,
    color: Colors.textSecondary,
    marginBottom: 20,
  },
  header: {
    flexDirection: "row",
    alignItems: "center",
    paddingHorizontal: 20,
    paddingVertical: 16,
    gap: 12,
  },
  exitButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: Colors.surface,
    alignItems: "center",
    justifyContent: "center",
  },
  progressContainer: {
    flex: 1,
    gap: 4,
  },
  progressBar: {
    height: 8,
    backgroundColor: Colors.borderLight,
    borderRadius: 4,
    overflow: "hidden",
  },
  progressFill: {
    height: "100%",
    backgroundColor: Colors.primary,
    borderRadius: 4,
  },
  progressText: {
    fontSize: 12,
    fontWeight: "600" as const,
    color: Colors.textSecondary,
    textAlign: "center",
  },
  statsContainer: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
  },
  comboContainer: {
    backgroundColor: Colors.warning + "30",
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: Colors.warning,
  },
  comboText: {
    fontSize: 12,
    fontWeight: "700" as const,
    color: Colors.warning,
  },
  livesContainer: {
    flexDirection: "row",
    gap: 4,
  },
  content: {
    flex: 1,
    paddingHorizontal: 20,
  },
  questionSection: {
    marginBottom: 24,
  },
  lessonInfo: {
    flexDirection: "row",
    alignItems: "center",
    gap: 12,
    marginBottom: 20,
  },
  lessonIcon: {
    fontSize: 32,
  },
  lessonTitle: {
    fontSize: 16,
    fontWeight: "600" as const,
    color: Colors.textSecondary,
  },
  question: {
    fontSize: 24,
    fontWeight: "700" as const,
    color: Colors.text,
    lineHeight: 32,
  },
  hintCard: {
    flexDirection: "row",
    alignItems: "flex-start",
    gap: 8,
    backgroundColor: Colors.warning + "20",
    borderLeftWidth: 3,
    borderLeftColor: Colors.warning,
    padding: 12,
    borderRadius: 8,
    marginTop: 16,
  },
  hintText: {
    flex: 1,
    fontSize: 14,
    color: Colors.text,
    lineHeight: 20,
  },
  answersSection: {
    gap: 12,
    marginBottom: 20,
  },
  answerButton: {
    backgroundColor: Colors.surface,
    borderRadius: 12,
    borderWidth: 2,
    borderColor: Colors.border,
    overflow: "hidden",
  },
  answerButtonSelected: {
    borderColor: Colors.primary,
    backgroundColor: Colors.primary + "10",
  },
  answerButtonCorrect: {
    borderColor: Colors.success,
    backgroundColor: Colors.success + "20",
  },
  answerButtonWrong: {
    borderColor: Colors.danger,
    backgroundColor: Colors.danger + "20",
  },
  answerContent: {
    flexDirection: "row",
    alignItems: "center",
    padding: 16,
    gap: 12,
  },
  answerCircle: {
    width: 24,
    height: 24,
    borderRadius: 12,
    borderWidth: 2,
    borderColor: Colors.border,
    alignItems: "center",
    justifyContent: "center",
  },
  answerCircleSelected: {
    borderColor: Colors.primary,
    backgroundColor: Colors.primary,
  },
  answerCircleCorrect: {
    borderColor: Colors.success,
    backgroundColor: Colors.success,
  },
  answerCircleWrong: {
    borderColor: Colors.danger,
    backgroundColor: Colors.danger,
  },
  answerIcon: {
    color: Colors.surface,
    fontSize: 14,
    fontWeight: "700" as const,
  },
  answerText: {
    flex: 1,
    fontSize: 16,
    color: Colors.text,
    lineHeight: 22,
  },
  answerTextSelected: {
    fontWeight: "600" as const,
    color: Colors.primary,
  },
  answerTextBold: {
    fontWeight: "600" as const,
  },
  explanationCard: {
    borderRadius: 16,
    overflow: "hidden",
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.2,
    shadowRadius: 8,
    elevation: 8,
  },
  explanationGradient: {
    padding: 20,
  },
  explanationHeader: {
    marginBottom: 8,
  },
  explanationTitle: {
    fontSize: 20,
    fontWeight: "700" as const,
    color: Colors.surface,
    marginBottom: 4,
  },
  comboReward: {
    marginTop: 8,
    backgroundColor: "rgba(255, 255, 255, 0.2)",
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 8,
    alignSelf: "flex-start",
  },
  comboRewardText: {
    fontSize: 14,
    fontWeight: "700" as const,
    color: Colors.surface,
  },
  comboRewardSubtext: {
    fontSize: 11,
    color: Colors.surface,
    opacity: 0.9,
    marginTop: 2,
  },
  explanationText: {
    fontSize: 15,
    color: Colors.surface,
    lineHeight: 22,
  },
  footer: {
    padding: 20,
    paddingBottom: Platform.OS === "ios" ? 0 : 20,
    gap: 12,
  },
  hintButton: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: 8,
    backgroundColor: Colors.surface,
    borderRadius: 12,
    padding: 16,
    borderWidth: 1,
    borderColor: Colors.warning,
  },
  hintButtonText: {
    fontSize: 16,
    fontWeight: "600" as const,
    color: Colors.warning,
  },
  submitButton: {
    backgroundColor: Colors.primary,
    borderRadius: 12,
    padding: 18,
    alignItems: "center",
    shadowColor: Colors.primary,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 8,
  },
  submitButtonDisabled: {
    backgroundColor: Colors.border,
    shadowOpacity: 0,
  },
  submitButtonText: {
    fontSize: 16,
    fontWeight: "700" as const,
    color: Colors.surface,
  },
  button: {
    backgroundColor: Colors.primary,
    borderRadius: 12,
    padding: 16,
    paddingHorizontal: 32,
  },
  buttonText: {
    fontSize: 16,
    fontWeight: "700" as const,
    color: Colors.surface,
  },
});
