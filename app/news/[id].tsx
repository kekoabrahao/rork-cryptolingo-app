import {
  StyleSheet,
  Text,
  View,
  TouchableOpacity,
  ScrollView,
  Alert,
  Animated,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { LinearGradient } from 'expo-linear-gradient';
import { useLocalSearchParams, router, Stack } from 'expo-router';
import {
  ArrowLeft,
  Bookmark,
  Share2,
  Clock,
  TrendingUp,
  TrendingDown,
  Minus,
  Zap,
  Coins,
  CheckCircle,
  XCircle,
  Flame,
  Award,
  Brain,
} from 'lucide-react-native';
import { useNews } from '@/contexts/NewsContext';
import { useUserProgress } from '@/contexts/UserProgressContext';
import { useQuiz } from '@/contexts/QuizContext';
import Colors from '@/constants/colors';
import { useEffect, useState } from 'react';
import * as Haptics from 'expo-haptics';
import QuizModal from '@/components/QuizModal';
import { generateQuizFromArticle } from '@/utils/quizGenerator';

export default function NewsDetailScreen() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const {
    getArticleById,
    markAsRead,
    completeQuiz,
    addReaction,
    toggleBookmark,
    isArticleRead,
    isQuizCompleted,
    isBookmarked,
  } = useNews();
  const { newsProgress } = useNews();
  const { stats: quizStats } = useQuiz();
  useUserProgress();
  
  const [selectedAnswer, setSelectedAnswer] = useState<number | null>(null);
  const [quizSubmitted, setQuizSubmitted] = useState(false);
  const [showExplanation, setShowExplanation] = useState(false);
  const [quizStartTime, setQuizStartTime] = useState<number | null>(null);
  const [answerAnimation] = useState(new Animated.Value(0));
  const [streakAnimation] = useState(new Animated.Value(0));
  const [showQuizModal, setShowQuizModal] = useState(false);
  const [generatedQuiz, setGeneratedQuiz] = useState<ReturnType<typeof generateQuizFromArticle> | null>(null);
  const [hasScrolledToBottom, setHasScrolledToBottom] = useState(false);
  
  const article = getArticleById(id);
  const isRead = isArticleRead(id);
  const quizDone = isQuizCompleted(id);
  const bookmarked = isBookmarked(id);

  useEffect(() => {
    if (article?.quiz && !quizDone && !quizStartTime) {
      setQuizStartTime(Date.now());
    }
  }, [article?.quiz, quizDone, quizStartTime]);

  useEffect(() => {
    if (article && !isRead) {
      const timer = setTimeout(() => {
        markAsRead(id);
        console.log('📖 Article marked as read after viewing');
      }, 3000);
      return () => clearTimeout(timer);
    }
  }, [article, isRead, id, markAsRead]);

  // Generate quiz when article is loaded
  useEffect(() => {
    if (article && !generatedQuiz) {
      const quiz = generateQuizFromArticle(article);
      setGeneratedQuiz(quiz);
      console.log('🧠 Quiz generated for article');
    }
  }, [article, generatedQuiz]);

  const handleScroll = (event: any) => {
    const { contentOffset, contentSize, layoutMeasurement } = event.nativeEvent;
    const isBottom = contentOffset.y + layoutMeasurement.height >= contentSize.height - 50;
    
    if (isBottom && !hasScrolledToBottom && generatedQuiz && !quizDone) {
      setHasScrolledToBottom(true);
      // Show quiz modal after 1 second of reaching bottom
      setTimeout(() => {
        setShowQuizModal(true);
      }, 1000);
    }
  };

  const handleQuizComplete = (xpEarned: number) => {
    console.log(`🎉 Quiz completed! +${xpEarned} XP earned`);
    // Mark as completed in old system too
    completeQuiz(id, true, 0);
  };

  const handleQuizClose = () => {
    setShowQuizModal(false);
  };

  if (!article) {
    return (
      <SafeAreaView style={styles.container}>
        <View style={styles.errorContainer}>
          <Text style={styles.errorText}>Article not found</Text>
          <TouchableOpacity
            style={styles.backButton}
            onPress={() => router.back()}
          >
            <Text style={styles.backButtonText}>Go Back</Text>
          </TouchableOpacity>
        </View>
      </SafeAreaView>
    );
  }

  const getImpactIcon = () => {
    switch (article.impact) {
      case 'bullish':
        return <TrendingUp size={20} color="#10B981" />;
      case 'bearish':
        return <TrendingDown size={20} color="#EF4444" />;
      default:
        return <Minus size={20} color="#6B7280" />;
    }
  };

  const getImpactColor = () => {
    switch (article.impact) {
      case 'bullish':
        return '#10B981';
      case 'bearish':
        return '#EF4444';
      default:
        return '#6B7280';
    }
  };

  const handleReaction = (reaction: 'bullish' | 'bearish' | 'neutral') => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
    addReaction(id, reaction);
    console.log(`💬 User reacted: ${reaction}`);
  };

  const handleBookmark = () => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    toggleBookmark(id);
  };

  const handleShare = () => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    Alert.alert('Share', `Share: ${article.title}`);
  };

  const handleQuizSubmit = () => {
    if (selectedAnswer === null) {
      Alert.alert('Quiz', 'Please select an answer');
      return;
    }

    const timeToAnswer = quizStartTime ? (Date.now() - quizStartTime) / 1000 : 0;
    const isCorrect = selectedAnswer === article.quiz?.correctAnswer;
    
    Haptics.notificationAsync(
      isCorrect
        ? Haptics.NotificationFeedbackType.Success
        : Haptics.NotificationFeedbackType.Error
    );

    completeQuiz(id, isCorrect, timeToAnswer);
    setQuizSubmitted(true);
    setShowExplanation(true);

    Animated.sequence([
      Animated.spring(answerAnimation, {
        toValue: 1,
        useNativeDriver: true,
        tension: 50,
        friction: 7,
      }),
      Animated.spring(answerAnimation, {
        toValue: 0,
        useNativeDriver: true,
        tension: 50,
        friction: 7,
      }),
    ]).start();

    if (isCorrect) {
      Animated.sequence([
        Animated.spring(streakAnimation, {
          toValue: 1,
          useNativeDriver: true,
        }),
        Animated.spring(streakAnimation, {
          toValue: 0,
          useNativeDriver: true,
        }),
      ]).start();
    }
  };

  const formatDate = (date: Date): string => {
    return date.toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
    });
  };

  return (
    <>
      <Stack.Screen options={{ headerShown: false }} />
      <View style={styles.container}>
        <LinearGradient
          colors={[getImpactColor(), Colors.background]}
          start={{ x: 0, y: 0 }}
          end={{ x: 0, y: 0.3 }}
          style={styles.headerGradient}
        >
          <SafeAreaView edges={['top']}>
            <View style={styles.topBar}>
              <TouchableOpacity
                style={styles.iconButton}
                onPress={() => router.back()}
              >
                <ArrowLeft size={24} color="#FFFFFF" />
              </TouchableOpacity>
              <View style={styles.topBarActions}>
                <TouchableOpacity
                  style={styles.iconButton}
                  onPress={handleBookmark}
                >
                  <Bookmark
                    size={24}
                    color="#FFFFFF"
                    fill={bookmarked ? '#FFFFFF' : 'transparent'}
                  />
                </TouchableOpacity>
                <TouchableOpacity
                  style={styles.iconButton}
                  onPress={handleShare}
                >
                  <Share2 size={24} color="#FFFFFF" />
                </TouchableOpacity>
              </View>
            </View>
          </SafeAreaView>
        </LinearGradient>

        <ScrollView
          style={styles.scrollView}
          contentContainerStyle={styles.scrollContent}
          showsVerticalScrollIndicator={false}
          onScroll={handleScroll}
          scrollEventThrottle={400}
        >
          <View style={styles.headerSection}>
            <View style={styles.metaRow}>
              <View
                style={[
                  styles.urgencyBadge,
                  { backgroundColor: article.urgency === 'breaking' ? '#EF4444' : '#F59E0B' },
                ]}
              >
                <Text style={styles.urgencyBadgeText}>
                  {article.urgency.toUpperCase()}
                </Text>
              </View>
              <View
                style={[
                  styles.impactBadge,
                  { backgroundColor: getImpactColor() + '20' },
                ]}
              >
                {getImpactIcon()}
                <Text style={[styles.impactBadgeText, { color: getImpactColor() }]}>
                  {article.impact.toUpperCase()}
                </Text>
              </View>
            </View>

            <Text style={styles.articleTitle}>{article.title}</Text>

            <View style={styles.articleMeta}>
              <Text style={styles.sourceText}>{article.source}</Text>
              <Text style={styles.metaDot}>•</Text>
              <Clock size={14} color={Colors.textSecondary} />
              <Text style={styles.metaText}>{formatDate(article.publishedAt)}</Text>
              <Text style={styles.metaDot}>•</Text>
              <Text style={styles.metaText}>{article.readTime} min read</Text>
            </View>

            <View style={styles.cryptoTags}>
              {article.relatedCryptos.map((crypto) => (
                <View key={crypto} style={styles.cryptoTag}>
                  <Text style={styles.cryptoTagText}>{crypto}</Text>
                </View>
              ))}
            </View>
          </View>

          <View style={styles.summarySection}>
            <Text style={styles.summaryTitle}>Summary</Text>
            <Text style={styles.summaryText}>{article.summary}</Text>
          </View>

          <View style={styles.contentSection}>
            <Text style={styles.contentText}>{article.content}</Text>
          </View>

          {article.keyTerms && article.keyTerms.length > 0 && (
            <View style={styles.termsSection}>
              <Text style={styles.sectionTitle}>Key Terms</Text>
              <View style={styles.termsList}>
                {article.keyTerms.map((term, index) => (
                  <View key={index} style={styles.termItem}>
                    <View style={styles.termBullet} />
                    <Text style={styles.termText}>{term}</Text>
                  </View>
                ))}
              </View>
            </View>
          )}

          {article.quiz && (
            <View style={styles.quizSection}>
              <View style={styles.quizHeader}>
                <View style={styles.quizHeaderLeft}>
                  <Text style={styles.sectionTitle}>Test Your Knowledge</Text>
                  <View style={styles.difficultyBadge}>
                    <Text style={styles.difficultyText}>
                      {article.quiz.difficulty.toUpperCase()}
                    </Text>
                  </View>
                </View>
                <View style={styles.quizReward}>
                  <Zap size={16} color={Colors.xpBar} />
                  <Text style={styles.quizRewardText}>
                    +{article.quiz.xpBonus} XP
                  </Text>
                </View>
              </View>

              {newsProgress.quizStreak > 0 && !quizDone && (
                <Animated.View
                  style={[
                    styles.streakBanner,
                    {
                      transform: [
                        {
                          scale: streakAnimation.interpolate({
                            inputRange: [0, 1],
                            outputRange: [1, 1.1],
                          }),
                        },
                      ],
                    },
                  ]}
                >
                  <LinearGradient
                    colors={['#FF6B35', '#F7931E']}
                    start={{ x: 0, y: 0 }}
                    end={{ x: 1, y: 0 }}
                    style={styles.streakBannerGradient}
                  >
                    <Flame size={20} color="#FFFFFF" />
                    <Text style={styles.streakText}>
                      {newsProgress.quizStreak} Question Streak! Keep it going!
                    </Text>
                  </LinearGradient>
                </Animated.View>
              )}

              <Text style={styles.quizQuestion}>{article.quiz.question}</Text>

              {article.quiz.options.map((option, index) => {
                const isSelected = selectedAnswer === index;
                const isCorrect = index === article.quiz?.correctAnswer;
                const showResult = quizSubmitted || quizDone;

                return (
                  <TouchableOpacity
                    key={index}
                    style={[
                      styles.quizOption,
                      isSelected && styles.quizOptionSelected,
                      showResult && isCorrect && styles.quizOptionCorrect,
                      showResult && isSelected && !isCorrect && styles.quizOptionWrong,
                    ]}
                    onPress={() => {
                      if (!quizDone && !quizSubmitted) {
                        setSelectedAnswer(index);
                      }
                    }}
                    disabled={quizDone || quizSubmitted}
                    activeOpacity={0.7}
                  >
                    <View style={styles.quizOptionContent}>
                      <View
                        style={[
                          styles.quizOptionCircle,
                          isSelected && styles.quizOptionCircleSelected,
                          showResult && isCorrect && styles.quizOptionCircleCorrect,
                        ]}
                      >
                        {showResult && isCorrect && (
                          <CheckCircle size={20} color="#10B981" />
                        )}
                        {showResult && isSelected && !isCorrect && (
                          <XCircle size={20} color="#EF4444" />
                        )}
                      </View>
                      <Text
                        style={[
                          styles.quizOptionText,
                          isSelected && styles.quizOptionTextSelected,
                        ]}
                      >
                        {option}
                      </Text>
                    </View>
                  </TouchableOpacity>
                );
              })}

              {!quizDone && !quizSubmitted && (
                <TouchableOpacity
                  style={[
                    styles.quizSubmitButton,
                    selectedAnswer === null && styles.quizSubmitButtonDisabled,
                  ]}
                  onPress={handleQuizSubmit}
                  disabled={selectedAnswer === null}
                  activeOpacity={0.8}
                >
                  <LinearGradient
                    colors={
                      selectedAnswer === null
                        ? [Colors.borderLight, Colors.border]
                        : [Colors.primary, Colors.accent]
                    }
                    start={{ x: 0, y: 0 }}
                    end={{ x: 1, y: 0 }}
                    style={styles.quizSubmitGradient}
                  >
                    <Text style={styles.quizSubmitText}>Submit Answer</Text>
                  </LinearGradient>
                </TouchableOpacity>
              )}

              {showExplanation && quizSubmitted && (
                <Animated.View
                  style={[
                    styles.explanationCard,
                    {
                      transform: [
                        {
                          scale: answerAnimation.interpolate({
                            inputRange: [0, 1],
                            outputRange: [1, 1.05],
                          }),
                        },
                      ],
                    },
                  ]}
                >
                  <View
                    style={[
                      styles.explanationHeader,
                      {
                        backgroundColor:
                          selectedAnswer === article.quiz?.correctAnswer
                            ? '#10B981'
                            : '#EF4444',
                      },
                    ]}
                  >
                    {selectedAnswer === article.quiz?.correctAnswer ? (
                      <CheckCircle size={24} color="#FFFFFF" />
                    ) : (
                      <XCircle size={24} color="#FFFFFF" />
                    )}
                    <Text style={styles.explanationHeaderText}>
                      {selectedAnswer === article.quiz?.correctAnswer
                        ? 'Correct!'
                        : 'Not Quite'}
                    </Text>
                  </View>
                  <View style={styles.explanationContent}>
                    <Text style={styles.explanationText}>
                      {article.quiz?.explanation}
                    </Text>
                  </View>
                </Animated.View>
              )}

              {quizDone && (
                <View style={styles.quizCompletedBadge}>
                  <Award size={20} color="#10B981" />
                  <Text style={styles.quizCompletedText}>Quiz Completed!</Text>
                  {newsProgress.bestQuizStreak >= 5 && (
                    <View style={styles.streakBadge}>
                      <Flame size={16} color="#FF6B35" />
                      <Text style={styles.streakBadgeText}>
                        Best Streak: {newsProgress.bestQuizStreak}
                      </Text>
                    </View>
                  )}
                </View>
              )}
            </View>
          )}

          <View style={styles.reactionSection}>
            <Text style={styles.sectionTitle}>What&apos;s your take?</Text>
            <View style={styles.reactionButtons}>
              <TouchableOpacity
                style={[
                  styles.reactionButton,
                  article.userReaction === 'bullish' && styles.reactionButtonActive,
                ]}
                onPress={() => handleReaction('bullish')}
                activeOpacity={0.7}
              >
                <TrendingUp
                  size={24}
                  color={article.userReaction === 'bullish' ? '#FFFFFF' : '#10B981'}
                />
                <Text
                  style={[
                    styles.reactionButtonText,
                    article.userReaction === 'bullish' && styles.reactionButtonTextActive,
                  ]}
                >
                  Bullish
                </Text>
              </TouchableOpacity>

              <TouchableOpacity
                style={[
                  styles.reactionButton,
                  article.userReaction === 'neutral' && styles.reactionButtonActive,
                ]}
                onPress={() => handleReaction('neutral')}
                activeOpacity={0.7}
              >
                <Minus
                  size={24}
                  color={article.userReaction === 'neutral' ? '#FFFFFF' : '#6B7280'}
                />
                <Text
                  style={[
                    styles.reactionButtonText,
                    article.userReaction === 'neutral' && styles.reactionButtonTextActive,
                  ]}
                >
                  Neutral
                </Text>
              </TouchableOpacity>

              <TouchableOpacity
                style={[
                  styles.reactionButton,
                  article.userReaction === 'bearish' && styles.reactionButtonActive,
                ]}
                onPress={() => handleReaction('bearish')}
                activeOpacity={0.7}
              >
                <TrendingDown
                  size={24}
                  color={article.userReaction === 'bearish' ? '#FFFFFF' : '#EF4444'}
                />
                <Text
                  style={[
                    styles.reactionButtonText,
                    article.userReaction === 'bearish' && styles.reactionButtonTextActive,
                  ]}
                >
                  Bearish
                </Text>
              </TouchableOpacity>
            </View>
          </View>

          <View style={styles.rewardsSection}>
            <LinearGradient
              colors={[Colors.primary + '20', Colors.accent + '20']}
              start={{ x: 0, y: 0 }}
              end={{ x: 1, y: 0 }}
              style={styles.rewardsCard}
            >
              <View style={styles.rewardsRow}>
                <View style={styles.rewardItem}>
                  <Zap size={32} color={Colors.xpBar} />
                  <Text style={styles.rewardValue}>+{article.xpReward}</Text>
                  <Text style={styles.rewardLabel}>XP Earned</Text>
                </View>
                <View style={styles.rewardDivider} />
                <View style={styles.rewardItem}>
                  <Coins size={32} color={Colors.coins} />
                  <Text style={styles.rewardValue}>+{article.coinReward}</Text>
                  <Text style={styles.rewardLabel}>Coins Earned</Text>
                </View>
              </View>
            </LinearGradient>
          </View>

          {!quizDone && generatedQuiz && (
            <View style={styles.quizPromptSection}>
              <View style={styles.quizPromptCard}>
                <Brain size={48} color={Colors.primary} />
                <Text style={styles.quizPromptTitle}>Teste seu conhecimento! 🧠</Text>
                <Text style={styles.quizPromptText}>
                  Responda 3 perguntas sobre esta notícia e ganhe até +15 XP
                </Text>
                <TouchableOpacity
                  style={styles.quizPromptButton}
                  onPress={() => setShowQuizModal(true)}
                >
                  <LinearGradient
                    colors={[Colors.primary, Colors.accent]}
                    start={{ x: 0, y: 0 }}
                    end={{ x: 1, y: 0 }}
                    style={styles.quizPromptGradient}
                  >
                    <Text style={styles.quizPromptButtonText}>Começar Quiz</Text>
                  </LinearGradient>
                </TouchableOpacity>
                {quizStats.currentStreak > 0 && (
                  <View style={styles.streakBadge}>
                    <Flame size={16} color={Colors.warning} />
                    <Text style={styles.streakText}>
                      Streak: {quizStats.currentStreak} {quizStats.currentStreak === 1 ? 'quiz' : 'quizzes'}
                    </Text>
                  </View>
                )}
              </View>
            </View>
          )}

          {quizDone && (
            <View style={styles.quizCompletedSection}>
              <View style={styles.quizCompletedCard}>
                <CheckCircle size={32} color={Colors.success} />
                <Text style={styles.quizCompletedTitle}>Quiz Concluído! ✅</Text>
                <Text style={styles.quizCompletedText}>
                  Você já completou o quiz desta notícia
                </Text>
              </View>
            </View>
          )}

          <View style={styles.bottomPadding} />
        </ScrollView>

        {/* Quiz Modal */}
        {generatedQuiz && (
          <QuizModal
            visible={showQuizModal}
            quiz={generatedQuiz}
            newsId={id}
            onClose={handleQuizClose}
            onComplete={handleQuizComplete}
          />
        )}
      </View>
    </>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: Colors.background,
  },
  headerGradient: {
    paddingBottom: 16,
  },
  topBar: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 20,
    paddingTop: 8,
  },
  topBarActions: {
    flexDirection: 'row',
    gap: 12,
  },
  iconButton: {
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: 'rgba(0, 0, 0, 0.3)',
    alignItems: 'center',
    justifyContent: 'center',
  },
  scrollView: {
    flex: 1,
  },
  scrollContent: {
    paddingBottom: 40,
  },
  errorContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
  },
  errorText: {
    fontSize: 18,
    color: Colors.textSecondary,
    marginBottom: 20,
  },
  backButton: {
    backgroundColor: Colors.primary,
    paddingHorizontal: 24,
    paddingVertical: 12,
    borderRadius: 12,
  },
  backButtonText: {
    fontSize: 16,
    fontWeight: '600' as const,
    color: '#FFFFFF',
  },
  headerSection: {
    paddingHorizontal: 20,
    paddingTop: 8,
  },
  metaRow: {
    flexDirection: 'row',
    gap: 8,
    marginBottom: 16,
  },
  urgencyBadge: {
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 8,
  },
  urgencyBadgeText: {
    fontSize: 11,
    fontWeight: '800' as const,
    color: '#FFFFFF',
  },
  impactBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 8,
  },
  impactBadgeText: {
    fontSize: 11,
    fontWeight: '700' as const,
  },
  articleTitle: {
    fontSize: 28,
    fontWeight: '800' as const,
    color: Colors.text,
    lineHeight: 36,
    marginBottom: 12,
  },
  articleMeta: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    marginBottom: 16,
  },
  sourceText: {
    fontSize: 13,
    fontWeight: '600' as const,
    color: Colors.primary,
  },
  metaDot: {
    fontSize: 13,
    color: Colors.textLight,
  },
  metaText: {
    fontSize: 13,
    color: Colors.textSecondary,
  },
  cryptoTags: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
  },
  cryptoTag: {
    backgroundColor: Colors.primary + '20',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 8,
  },
  cryptoTagText: {
    fontSize: 13,
    fontWeight: '700' as const,
    color: Colors.primary,
  },
  summarySection: {
    paddingHorizontal: 20,
    paddingTop: 24,
    paddingBottom: 16,
    backgroundColor: Colors.surface,
    marginTop: 24,
  },
  summaryTitle: {
    fontSize: 18,
    fontWeight: '700' as const,
    color: Colors.text,
    marginBottom: 12,
  },
  summaryText: {
    fontSize: 16,
    color: Colors.textSecondary,
    lineHeight: 24,
  },
  contentSection: {
    paddingHorizontal: 20,
    paddingTop: 24,
  },
  contentText: {
    fontSize: 16,
    color: Colors.text,
    lineHeight: 26,
  },
  termsSection: {
    paddingHorizontal: 20,
    paddingTop: 32,
  },
  sectionTitle: {
    fontSize: 20,
    fontWeight: '700' as const,
    color: Colors.text,
    marginBottom: 16,
  },
  termsList: {
    gap: 12,
  },
  termItem: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  termBullet: {
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: Colors.primary,
  },
  termText: {
    fontSize: 15,
    color: Colors.text,
    fontWeight: '600' as const,
  },
  quizSection: {
    paddingHorizontal: 20,
    paddingTop: 32,
  },
  quizHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 16,
  },
  quizReward: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    backgroundColor: Colors.xpBar + '20',
    paddingHorizontal: 10,
    paddingVertical: 6,
    borderRadius: 8,
  },
  quizRewardText: {
    fontSize: 13,
    fontWeight: '700' as const,
    color: Colors.xpBar,
  },
  quizQuestion: {
    fontSize: 18,
    fontWeight: '600' as const,
    color: Colors.text,
    marginBottom: 20,
    lineHeight: 26,
  },
  quizOption: {
    backgroundColor: Colors.surface,
    borderRadius: 12,
    padding: 16,
    marginBottom: 12,
    borderWidth: 2,
    borderColor: 'transparent',
  },
  quizOptionSelected: {
    borderColor: Colors.primary,
    backgroundColor: Colors.primary + '10',
  },
  quizOptionCorrect: {
    borderColor: '#10B981',
    backgroundColor: '#10B981' + '20',
  },
  quizOptionWrong: {
    borderColor: '#EF4444',
    backgroundColor: '#EF4444' + '20',
  },
  quizOptionContent: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  quizOptionCircle: {
    width: 24,
    height: 24,
    borderRadius: 12,
    borderWidth: 2,
    borderColor: Colors.border,
    alignItems: 'center',
    justifyContent: 'center',
  },
  quizOptionCircleSelected: {
    borderColor: Colors.primary,
    backgroundColor: Colors.primary,
  },
  quizOptionCircleCorrect: {
    borderColor: '#10B981',
    backgroundColor: 'transparent',
  },
  quizOptionText: {
    flex: 1,
    fontSize: 16,
    color: Colors.text,
  },
  quizOptionTextSelected: {
    fontWeight: '600' as const,
  },
  quizSubmitButton: {
    borderRadius: 12,
    overflow: 'hidden',
    marginTop: 8,
  },
  quizSubmitButtonDisabled: {
    opacity: 0.5,
  },
  quizSubmitGradient: {
    padding: 16,
    alignItems: 'center',
  },
  quizSubmitText: {
    fontSize: 16,
    fontWeight: '700' as const,
    color: '#FFFFFF',
  },
  quizCompletedBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
    backgroundColor: '#10B981' + '20',
    padding: 16,
    borderRadius: 12,
    marginTop: 8,
  },
  quizCompletedText: {
    fontSize: 16,
    fontWeight: '700' as const,
    color: '#10B981',
  },
  reactionSection: {
    paddingHorizontal: 20,
    paddingTop: 32,
  },
  reactionButtons: {
    flexDirection: 'row',
    gap: 12,
  },
  reactionButton: {
    flex: 1,
    backgroundColor: Colors.surface,
    borderRadius: 12,
    padding: 16,
    alignItems: 'center',
    gap: 8,
    borderWidth: 2,
    borderColor: 'transparent',
  },
  reactionButtonActive: {
    borderColor: Colors.primary,
    backgroundColor: Colors.primary,
  },
  reactionButtonText: {
    fontSize: 13,
    fontWeight: '600' as const,
    color: Colors.text,
  },
  reactionButtonTextActive: {
    color: '#FFFFFF',
  },
  rewardsSection: {
    paddingHorizontal: 20,
    paddingTop: 32,
  },
  rewardsCard: {
    borderRadius: 16,
    padding: 24,
  },
  rewardsRow: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  rewardItem: {
    flex: 1,
    alignItems: 'center',
    gap: 8,
  },
  rewardDivider: {
    width: 2,
    height: 60,
    backgroundColor: Colors.border,
  },
  rewardValue: {
    fontSize: 24,
    fontWeight: '800' as const,
    color: Colors.text,
  },
  rewardLabel: {
    fontSize: 13,
    color: Colors.textSecondary,
  },
  bottomPadding: {
    height: 40,
  },
  quizHeaderLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  difficultyBadge: {
    backgroundColor: Colors.accent + '30',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 6,
  },
  difficultyText: {
    fontSize: 10,
    fontWeight: '800' as const,
    color: Colors.accent,
  },
  streakBanner: {
    marginBottom: 16,
    borderRadius: 12,
    overflow: 'hidden',
  },
  streakBannerGradient: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    padding: 12,
  },
  streakText: {
    fontSize: 14,
    fontWeight: '700' as const,
    color: '#FFFFFF',
    flex: 1,
  },
  explanationCard: {
    borderRadius: 12,
    overflow: 'hidden',
    marginTop: 16,
    backgroundColor: Colors.surface,
    borderWidth: 2,
    borderColor: Colors.border,
  },
  explanationHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    padding: 16,
  },
  explanationHeaderText: {
    fontSize: 18,
    fontWeight: '700' as const,
    color: '#FFFFFF',
  },
  explanationContent: {
    padding: 16,
  },
  explanationText: {
    fontSize: 15,
    color: Colors.text,
    lineHeight: 22,
  },
  streakBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    backgroundColor: '#FF6B35' + '20',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 6,
    marginLeft: 8,
  },
  streakBadgeText: {
    fontSize: 12,
    fontWeight: '600' as const,
    color: '#FF6B35',
  },
  quizPromptSection: {
    paddingHorizontal: 20,
    paddingTop: 32,
  },
  quizPromptCard: {
    backgroundColor: Colors.surface,
    borderRadius: 16,
    padding: 24,
    alignItems: 'center',
    gap: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.1,
    shadowRadius: 12,
    elevation: 5,
    borderWidth: 2,
    borderColor: Colors.primary + '30',
  },
  quizPromptTitle: {
    fontSize: 20,
    fontWeight: '700' as const,
    color: Colors.text,
    textAlign: 'center',
  },
  quizPromptText: {
    fontSize: 14,
    color: Colors.textSecondary,
    textAlign: 'center',
    lineHeight: 20,
  },
  quizPromptButton: {
    width: '100%',
    borderRadius: 12,
    overflow: 'hidden',
    marginTop: 8,
  },
  quizPromptGradient: {
    paddingVertical: 16,
    paddingHorizontal: 32,
    alignItems: 'center',
  },
  quizPromptButtonText: {
    fontSize: 16,
    fontWeight: '700' as const,
    color: '#FFFFFF',
  },
  streakBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    backgroundColor: Colors.warning + '20',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 16,
  },
  streakText: {
    fontSize: 13,
    fontWeight: '600' as const,
    color: Colors.warning,
  },
  quizCompletedSection: {
    paddingHorizontal: 20,
    paddingTop: 32,
  },
  quizCompletedCard: {
    backgroundColor: Colors.success + '15',
    borderRadius: 16,
    padding: 24,
    alignItems: 'center',
    gap: 12,
    borderWidth: 2,
    borderColor: Colors.success + '50',
  },
  quizCompletedTitle: {
    fontSize: 18,
    fontWeight: '700' as const,
    color: Colors.success,
  },
  quizCompletedText: {
    fontSize: 14,
    color: Colors.textSecondary,
    textAlign: 'center',
  },
});
