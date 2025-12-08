import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';
import createContextHook from '@nkzw/create-context-hook';
import { NewsArticle, NewsUserProgress, NewsFilters, NewsStats, UserReaction } from '@/types/news';
import { newsArticles } from '@/data/news';
import { useUserProgress } from '@/contexts/UserProgressContext';

const STORAGE_KEY = '@cryptolingo_news_progress';

const INITIAL_PROGRESS: NewsUserProgress = {
  readArticles: [],
  completedQuizzes: [],
  quizResults: [],
  quizStreak: 0,
  bestQuizStreak: 0,
  perfectQuizzes: 0,
  reactions: {},
  bookmarks: [],
  totalXPEarned: 0,
  totalCoinsEarned: 0,
  articlesReadToday: 0,
  currentStreak: 0,
  lastReadDate: '',
};

const INITIAL_FILTERS: NewsFilters = {
  categories: [],
  urgency: [],
  difficulty: [],
  sources: [],
  showReadOnly: false,
  showUnreadOnly: false,
};

export const [NewsContext, useNews] = createContextHook(() => {
  const [newsProgress, setNewsProgress] = useState<NewsUserProgress>(INITIAL_PROGRESS);
  const [filters, setFilters] = useState<NewsFilters>(INITIAL_FILTERS);
  const [isLoading, setIsLoading] = useState(true);
  const hasInitializedRef = useRef(false);
  const isSavingRef = useRef(false);
  useUserProgress();

  const saveProgress = useCallback(async (progress: NewsUserProgress) => {
    if (isSavingRef.current) return;
    
    isSavingRef.current = true;
    try {
      await AsyncStorage.setItem(STORAGE_KEY, JSON.stringify(progress));
      console.log('📰 News progress saved');
    } catch (error) {
      console.error('❌ Error saving news progress:', error);
    } finally {
      isSavingRef.current = false;
    }
  }, []);

  useEffect(() => {
    let isMounted = true;
    
    const loadProgress = async () => {
      if (hasInitializedRef.current) return;
      
      try {
        console.log('📂 Loading news progress...');
        const stored = await AsyncStorage.getItem(STORAGE_KEY);
        
        if (!isMounted) return;
        
        if (stored && stored !== 'none' && stored.trim().length > 0) {
          try {
            const parsed: NewsUserProgress = JSON.parse(stored);
            
            const today = new Date().toISOString().split('T')[0];
            const lastReadDate = parsed.lastReadDate;
            
            let updatedProgress = { ...parsed };
            
            if (lastReadDate !== today) {
              const lastDate = new Date(lastReadDate);
              const todayDate = new Date(today);
              const diffTime = todayDate.getTime() - lastDate.getTime();
              const diffDays = Math.floor(diffTime / (1000 * 60 * 60 * 24));
              
              if (diffDays === 1) {
                updatedProgress.currentStreak = parsed.currentStreak + 1;
              } else if (diffDays > 1) {
                updatedProgress.currentStreak = 0;
              }
              
              updatedProgress.articlesReadToday = 0;
              updatedProgress.lastReadDate = today;
            }
            
            console.log('✅ News progress loaded');
            setNewsProgress(updatedProgress);
          } catch (parseError) {
            console.error('❌ Failed to parse news progress, resetting:', parseError);
            console.log('📝 Corrupted data detected, clearing storage');
            try {
              await AsyncStorage.removeItem(STORAGE_KEY);
            } catch (removeError) {
              console.error('❌ Error removing corrupted data:', removeError);
            }
            setNewsProgress(INITIAL_PROGRESS);
          }
        } else {
          console.log('📝 No stored news progress, using initial state');
          setNewsProgress(INITIAL_PROGRESS);
        }
      } catch (error) {
        console.error('❌ Error loading news progress:', error);
      } finally {
        if (isMounted) {
          hasInitializedRef.current = true;
          setIsLoading(false);
        }
      }
    };
    
    loadProgress();
    
    return () => {
      isMounted = false;
    };
  }, []);

  const markAsRead = useCallback((articleId: string) => {
    setNewsProgress((prev) => {
      if (prev.readArticles.includes(articleId)) {
        return prev;
      }
      
      const article = newsArticles.find(a => a.id === articleId);
      if (!article) return prev;
      
      const today = new Date().toISOString().split('T')[0];
      const isNewDay = prev.lastReadDate !== today;
      
      const newProgress: NewsUserProgress = {
        ...prev,
        readArticles: [...prev.readArticles, articleId],
        articlesReadToday: isNewDay ? 1 : prev.articlesReadToday + 1,
        lastReadDate: today,
        totalXPEarned: prev.totalXPEarned + article.xpReward,
        totalCoinsEarned: prev.totalCoinsEarned + article.coinReward,
      };
      
      console.log(`📖 Article ${articleId} marked as read. XP: +${article.xpReward}, Coins: +${article.coinReward}`);
      
      saveProgress(newProgress);
      return newProgress;
    });
  }, [saveProgress]);

  const completeQuiz = useCallback((articleId: string, isCorrect: boolean, timeToAnswer: number) => {
    setNewsProgress((prev) => {
      if (prev.completedQuizzes.includes(articleId)) {
        return prev;
      }
      
      const article = newsArticles.find(a => a.id === articleId);
      if (!article || !article.quiz) return prev;
      
      let xpReward = isCorrect ? article.quiz.xpBonus : Math.floor(article.quiz.xpBonus * 0.3);
      let coinReward = isCorrect ? article.quiz.coinBonus : Math.floor(article.quiz.coinBonus * 0.3);
      
      const newQuizStreak = isCorrect ? prev.quizStreak + 1 : 0;
      const newBestQuizStreak = Math.max(newQuizStreak, prev.bestQuizStreak);
      const newPerfectQuizzes = isCorrect ? prev.perfectQuizzes + 1 : prev.perfectQuizzes;
      
      if (isCorrect && newQuizStreak > 0) {
        const streakBonus = Math.min(Math.floor(newQuizStreak / 3), 5);
        xpReward += streakBonus * 5;
        coinReward += streakBonus * 2;
      }
      
      if (isCorrect && newQuizStreak > 0 && newQuizStreak % 5 === 0) {
        xpReward += 25;
        coinReward += 15;
        console.log(`🔥 STREAK MILESTONE! ${newQuizStreak} correct answers in a row!`);
      }
      
      const quizResult = {
        articleId,
        isCorrect,
        difficulty: article.quiz.difficulty,
        timeToAnswer,
        timestamp: new Date().toISOString(),
      };
      
      const newProgress: NewsUserProgress = {
        ...prev,
        completedQuizzes: [...prev.completedQuizzes, articleId],
        quizResults: [...prev.quizResults, quizResult],
        quizStreak: newQuizStreak,
        bestQuizStreak: newBestQuizStreak,
        perfectQuizzes: newPerfectQuizzes,
        totalXPEarned: prev.totalXPEarned + xpReward,
        totalCoinsEarned: prev.totalCoinsEarned + coinReward,
      };
      
      console.log(`✅ Quiz completed for ${articleId}. Correct: ${isCorrect}. XP: +${xpReward}, Coins: +${coinReward}, Streak: ${newQuizStreak}`);
      
      saveProgress(newProgress);
      return newProgress;
    });
  }, [saveProgress]);

  const addReaction = useCallback((articleId: string, reaction: UserReaction) => {
    setNewsProgress((prev) => {
      const newReactions = { ...prev.reactions, [articleId]: reaction };
      const newProgress: NewsUserProgress = {
        ...prev,
        reactions: newReactions,
      };
      
      console.log(`💬 Reaction added to ${articleId}: ${reaction}`);
      saveProgress(newProgress);
      return newProgress;
    });
  }, [saveProgress]);

  const toggleBookmark = useCallback((articleId: string) => {
    setNewsProgress((prev) => {
      const isBookmarked = prev.bookmarks.includes(articleId);
      const newBookmarks = isBookmarked
        ? prev.bookmarks.filter(id => id !== articleId)
        : [...prev.bookmarks, articleId];
      
      const newProgress: NewsUserProgress = {
        ...prev,
        bookmarks: newBookmarks,
      };
      
      console.log(`🔖 Bookmark ${isBookmarked ? 'removed from' : 'added to'} ${articleId}`);
      saveProgress(newProgress);
      return newProgress;
    });
  }, [saveProgress]);

  const filteredArticles = useMemo(() => {
    if (!newsArticles || newsArticles.length === 0) return [];
    let filtered = [...newsArticles];
    
    if (filters.categories.length > 0) {
      filtered = filtered.filter(article => 
        filters.categories.includes(article.category)
      );
    }
    
    if (filters.urgency.length > 0) {
      filtered = filtered.filter(article => 
        filters.urgency.includes(article.urgency)
      );
    }
    
    if (filters.difficulty.length > 0) {
      filtered = filtered.filter(article => 
        filters.difficulty.includes(article.difficulty)
      );
    }
    
    if (filters.sources.length > 0) {
      filtered = filtered.filter(article => 
        filters.sources.includes(article.source)
      );
    }
    
    if (filters.showReadOnly) {
      filtered = filtered.filter(article => 
        newsProgress.readArticles.includes(article.id)
      );
    }
    
    if (filters.showUnreadOnly) {
      filtered = filtered.filter(article => 
        !newsProgress.readArticles.includes(article.id)
      );
    }
    
    return filtered.sort((a, b) => 
      b.publishedAt.getTime() - a.publishedAt.getTime()
    );
  }, [filters, newsProgress.readArticles]);

  const breakingNews = useMemo(() => {
    if (!newsArticles || newsArticles.length === 0) return [];
    return newsArticles
      .filter(article => article.urgency === 'breaking')
      .sort((a, b) => b.publishedAt.getTime() - a.publishedAt.getTime());
  }, []);

  const trendingNews = useMemo(() => {
    if (!newsArticles || newsArticles.length === 0) return [];
    return [...newsArticles]
      .sort((a, b) => b.likes - a.likes)
      .slice(0, 5);
  }, []);

  const bookmarkedArticles = useMemo(() => {
    if (!newsArticles || newsArticles.length === 0) return [];
    return newsArticles.filter(article => 
      newsProgress.bookmarks.includes(article.id)
    );
  }, [newsProgress.bookmarks]);

  const stats: NewsStats = useMemo(() => {
    if (!newsArticles || newsArticles.length === 0) {
      return {
        totalArticlesRead: 0,
        articlesReadToday: 0,
        currentStreak: 0,
        longestStreak: 0,
        totalXPEarned: 0,
        totalCoinsEarned: 0,
        quizzesCompleted: 0,
        quizAccuracy: 0,
        quizStreak: 0,
        bestQuizStreak: 0,
        perfectQuizzes: 0,
        favoriteCategory: 'bitcoin',
      };
    }
    const readArticles = newsArticles.filter(article => 
      newsProgress.readArticles.includes(article.id)
    );
    
    const categoryCounts = readArticles.reduce((acc, article) => {
      acc[article.category] = (acc[article.category] || 0) + 1;
      return acc;
    }, {} as Record<string, number>);
    
    const favoriteCategory = Object.entries(categoryCounts)
      .sort(([, a], [, b]) => b - a)[0]?.[0] as NewsStats['favoriteCategory'] || 'bitcoin';
    
    const correctQuizzes = newsProgress.quizResults.filter(r => r.isCorrect).length;
    const totalQuizzes = newsProgress.quizResults.length;
    const quizAccuracy = totalQuizzes > 0 ? Math.round((correctQuizzes / totalQuizzes) * 100) : 0;
    
    return {
      totalArticlesRead: newsProgress.readArticles.length,
      articlesReadToday: newsProgress.articlesReadToday,
      currentStreak: newsProgress.currentStreak,
      longestStreak: newsProgress.currentStreak,
      totalXPEarned: newsProgress.totalXPEarned,
      totalCoinsEarned: newsProgress.totalCoinsEarned,
      quizzesCompleted: newsProgress.completedQuizzes.length,
      quizAccuracy,
      quizStreak: newsProgress.quizStreak,
      bestQuizStreak: newsProgress.bestQuizStreak,
      perfectQuizzes: newsProgress.perfectQuizzes,
      favoriteCategory,
    };
  }, [newsProgress]);

  const getArticleById = useCallback((id: string): NewsArticle | undefined => {
    const article = newsArticles.find(a => a.id === id);
    if (!article) return undefined;
    
    return {
      ...article,
      userReaction: newsProgress.reactions[id] || null,
    };
  }, [newsProgress.reactions]);

  const isArticleRead = useCallback((articleId: string): boolean => {
    return newsProgress.readArticles.includes(articleId);
  }, [newsProgress.readArticles]);

  const isQuizCompleted = useCallback((articleId: string): boolean => {
    return newsProgress.completedQuizzes.includes(articleId);
  }, [newsProgress.completedQuizzes]);

  const isBookmarked = useCallback((articleId: string): boolean => {
    return newsProgress.bookmarks.includes(articleId);
  }, [newsProgress.bookmarks]);

  const resetFilters = useCallback(() => {
    setFilters(INITIAL_FILTERS);
  }, []);

  return {
    newsProgress,
    isLoading,
    filteredArticles,
    breakingNews,
    trendingNews,
    bookmarkedArticles,
    stats,
    filters,
    setFilters,
    resetFilters,
    markAsRead,
    completeQuiz,
    addReaction,
    toggleBookmark,
    getArticleById,
    isArticleRead,
    isQuizCompleted,
    isBookmarked,
  };
});
