import {
  StyleSheet,
  Text,
  View,
  TouchableOpacity,
  ScrollView,
  Animated,
  Platform,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { LinearGradient } from 'expo-linear-gradient';
import { router } from 'expo-router';
import { 
  Newspaper, 
  TrendingUp, 
  Bookmark, 
  Filter,
  Clock,
  Zap,
  AlertCircle,
  ArrowUp,
  ArrowDown,
  Minus,
} from 'lucide-react-native';
import { useNews } from '@/contexts/NewsContext';
import Colors from '@/constants/colors';
import { useRef } from 'react';
import { NewsArticle } from '@/types/news';

export default function NewsScreen() {
  const {
    filteredArticles,
    breakingNews,
    stats,
    isLoading,
    isArticleRead,
  } = useNews();
  
  const scrollY = useRef(new Animated.Value(0)).current;

  const headerOpacity = scrollY.interpolate({
    inputRange: [0, 100],
    outputRange: [0, 1],
    extrapolate: 'clamp',
  });

  const handleArticlePress = (articleId: string) => {
    console.log('📰 Opening article:', articleId);
    router.push(`/news/${articleId}` as any);
  };

  const getImpactIcon = (impact: NewsArticle['impact']) => {
    switch (impact) {
      case 'bullish':
        return <ArrowUp size={16} color="#10B981" />;
      case 'bearish':
        return <ArrowDown size={16} color="#EF4444" />;
      default:
        return <Minus size={16} color="#6B7280" />;
    }
  };

  const getImpactColor = (impact: NewsArticle['impact']) => {
    switch (impact) {
      case 'bullish':
        return '#10B981';
      case 'bearish':
        return '#EF4444';
      default:
        return '#6B7280';
    }
  };

  const getUrgencyColor = (urgency: NewsArticle['urgency']) => {
    switch (urgency) {
      case 'breaking':
        return '#EF4444';
      case 'important':
        return '#F59E0B';
      default:
        return '#6B7280';
    }
  };

  const formatTimeAgo = (date: Date): string => {
    const now = new Date();
    const diffInMs = now.getTime() - date.getTime();
    const diffInMinutes = Math.floor(diffInMs / 60000);
    const diffInHours = Math.floor(diffInMinutes / 60);
    const diffInDays = Math.floor(diffInHours / 24);

    if (diffInMinutes < 60) {
      return `${diffInMinutes}m ago`;
    } else if (diffInHours < 24) {
      return `${diffInHours}h ago`;
    } else {
      return `${diffInDays}d ago`;
    }
  };

  if (isLoading) {
    return (
      <SafeAreaView style={styles.container}>
        <View style={styles.loadingContainer}>
          <Newspaper size={48} color={Colors.primary} />
          <Text style={styles.loadingText}>Loading news...</Text>
        </View>
      </SafeAreaView>
    );
  }

  return (
    <View style={styles.container}>
      <Animated.View
        style={[
          styles.header,
          {
            opacity: headerOpacity,
            backgroundColor: Colors.surface,
          },
        ]}
      >
        <View style={styles.headerContent}>
          <Text style={styles.headerTitle}>Crypto News</Text>
        </View>
      </Animated.View>

      <SafeAreaView edges={['top']} style={styles.safeArea}>
        <Animated.ScrollView
          style={styles.scrollView}
          contentContainerStyle={styles.scrollContent}
          showsVerticalScrollIndicator={false}
          onScroll={Animated.event(
            [{ nativeEvent: { contentOffset: { y: scrollY } } }],
            {
              useNativeDriver: Platform.OS !== 'web',
            }
          )}
          scrollEventThrottle={16}
        >
          <View style={styles.topSection}>
            <View style={styles.titleRow}>
              <View>
                <Text style={styles.title}>Market News</Text>
                <Text style={styles.subtitle}>Stay informed, earn rewards</Text>
              </View>
              <TouchableOpacity
                style={styles.filterButton}
                onPress={() => console.log('Filter pressed')}
              >
                <Filter size={20} color={Colors.primary} />
              </TouchableOpacity>
            </View>

            <View style={styles.statsRow}>
              <View style={[styles.statCard, { backgroundColor: Colors.primary + '20' }]}>
                <Newspaper size={24} color={Colors.primary} />
                <Text style={styles.statCardValue}>{stats.totalArticlesRead}</Text>
                <Text style={styles.statCardLabel}>Articles Read</Text>
              </View>
              <View style={[styles.statCard, { backgroundColor: Colors.streak + '20' }]}>
                <TrendingUp size={24} color={Colors.streak} />
                <Text style={styles.statCardValue}>{stats.currentStreak}</Text>
                <Text style={styles.statCardLabel}>Day Streak</Text>
              </View>
              <View style={[styles.statCard, { backgroundColor: Colors.xpBar + '20' }]}>
                <Zap size={24} color={Colors.xpBar} />
                <Text style={styles.statCardValue}>{stats.totalXPEarned}</Text>
                <Text style={styles.statCardLabel}>XP Earned</Text>
              </View>
            </View>
          </View>

          {breakingNews && breakingNews.length > 0 && (
            <View style={styles.breakingSection}>
              <View style={styles.sectionHeader}>
                <AlertCircle size={20} color="#EF4444" />
                <Text style={styles.sectionTitle}>Breaking News</Text>
              </View>
              <ScrollView
                horizontal
                showsHorizontalScrollIndicator={false}
                contentContainerStyle={styles.breakingScrollContent}
              >
                {breakingNews.map((article) => (
                  <TouchableOpacity
                    key={article.id}
                    style={styles.breakingCard}
                    onPress={() => handleArticlePress(article.id)}
                    activeOpacity={0.7}
                  >
                    <LinearGradient
                      colors={['#EF4444', '#DC2626']}
                      start={{ x: 0, y: 0 }}
                      end={{ x: 1, y: 1 }}
                      style={styles.breakingGradient}
                    >
                      <View style={styles.breakingBadge}>
                        <Text style={styles.breakingBadgeText}>BREAKING</Text>
                      </View>
                      <Text style={styles.breakingTitle} numberOfLines={3}>
                        {article.title}
                      </Text>
                      <View style={styles.breakingFooter}>
                        <Text style={styles.breakingSource}>{article.source.toUpperCase()}</Text>
                        <View style={styles.breakingReward}>
                          <Zap size={14} color="#FFD700" />
                          <Text style={styles.breakingRewardText}>+{article.xpReward} XP</Text>
                        </View>
                      </View>
                    </LinearGradient>
                  </TouchableOpacity>
                ))}
              </ScrollView>
            </View>
          )}

          <View style={styles.newsSection}>
            <View style={styles.sectionHeader}>
              <Bookmark size={20} color={Colors.primary} />
              <Text style={styles.sectionTitle}>All News</Text>
            </View>

            {filteredArticles && filteredArticles.map((article) => {
              const isRead = isArticleRead(article.id);
              
              return (
                <TouchableOpacity
                  key={article.id}
                  style={[
                    styles.newsCard,
                    isRead && styles.newsCardRead,
                  ]}
                  onPress={() => handleArticlePress(article.id)}
                  activeOpacity={0.7}
                >
                  <View style={styles.newsHeader}>
                    <View style={styles.newsMetaRow}>
                      <View
                        style={[
                          styles.urgencyBadge,
                          { backgroundColor: getUrgencyColor(article.urgency) + '20' },
                        ]}
                      >
                        <Text
                          style={[
                            styles.urgencyBadgeText,
                            { color: getUrgencyColor(article.urgency) },
                          ]}
                        >
                          {article.urgency.toUpperCase()}
                        </Text>
                      </View>
                      <View
                        style={[
                          styles.impactBadge,
                          { backgroundColor: getImpactColor(article.impact) + '20' },
                        ]}
                      >
                        {getImpactIcon(article.impact)}
                        <Text
                          style={[
                            styles.impactBadgeText,
                            { color: getImpactColor(article.impact) },
                          ]}
                        >
                          {article.impact.toUpperCase()}
                        </Text>
                      </View>
                    </View>
                  </View>

                  <Text style={[styles.newsTitle, isRead && styles.newsTitleRead]}>
                    {article.title}
                  </Text>

                  <Text style={styles.newsSummary} numberOfLines={2}>
                    {article.summary}
                  </Text>

                  <View style={styles.newsFooter}>
                    <View style={styles.newsMetaInfo}>
                      <Text style={styles.newsSource}>{article.source}</Text>
                      <Text style={styles.newsDot}>•</Text>
                      <Clock size={12} color={Colors.textSecondary} />
                      <Text style={styles.newsTime}>{formatTimeAgo(article.publishedAt)}</Text>
                      <Text style={styles.newsDot}>•</Text>
                      <Text style={styles.newsReadTime}>{article.readTime} min</Text>
                    </View>

                    <View style={styles.newsRewards}>
                      <View style={styles.rewardItem}>
                        <Zap size={14} color={Colors.xpBar} />
                        <Text style={styles.rewardText}>+{article.xpReward}</Text>
                      </View>
                    </View>
                  </View>

                  {!isRead && <View style={styles.unreadIndicator} />}
                </TouchableOpacity>
              );
            })}
          </View>

          <View style={styles.bottomPadding} />
        </Animated.ScrollView>
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
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    gap: 16,
  },
  loadingText: {
    fontSize: 18,
    color: Colors.textSecondary,
    fontWeight: '600' as const,
  },
  header: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    zIndex: 10,
    paddingTop: Platform.OS === 'ios' ? 50 : 20,
    paddingBottom: 12,
    paddingHorizontal: 20,
    borderBottomWidth: 1,
    borderBottomColor: Colors.border,
  },
  headerContent: {
    alignItems: 'center',
  },
  headerTitle: {
    fontSize: 18,
    fontWeight: '700' as const,
    color: Colors.text,
  },
  scrollView: {
    flex: 1,
  },
  scrollContent: {
    paddingBottom: 20,
  },
  topSection: {
    paddingHorizontal: 20,
    paddingTop: 20,
  },
  titleRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: 24,
  },
  title: {
    fontSize: 36,
    fontWeight: '800' as const,
    color: Colors.primary,
    marginBottom: 4,
  },
  subtitle: {
    fontSize: 16,
    color: Colors.textSecondary,
  },
  filterButton: {
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: Colors.surface,
    alignItems: 'center',
    justifyContent: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  statsRow: {
    flexDirection: 'row',
    gap: 12,
    marginBottom: 24,
  },
  statCard: {
    flex: 1,
    backgroundColor: Colors.surface,
    borderRadius: 12,
    padding: 12,
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 4,
    elevation: 2,
  },
  statCardValue: {
    fontSize: 20,
    fontWeight: '700' as const,
    color: Colors.text,
    marginTop: 4,
  },
  statCardLabel: {
    fontSize: 11,
    color: Colors.textSecondary,
    marginTop: 2,
    textAlign: 'center',
  },
  breakingSection: {
    marginBottom: 24,
  },
  sectionHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    paddingHorizontal: 20,
    marginBottom: 16,
  },
  sectionTitle: {
    fontSize: 20,
    fontWeight: '700' as const,
    color: Colors.text,
  },
  breakingScrollContent: {
    paddingLeft: 20,
    paddingRight: 20,
    gap: 12,
  },
  breakingCard: {
    width: 280,
    borderRadius: 16,
    overflow: 'hidden',
    shadowColor: '#EF4444',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 6,
  },
  breakingGradient: {
    padding: 16,
    minHeight: 140,
    justifyContent: 'space-between',
  },
  breakingBadge: {
    alignSelf: 'flex-start',
    backgroundColor: 'rgba(255, 255, 255, 0.2)',
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 8,
    marginBottom: 8,
  },
  breakingBadgeText: {
    fontSize: 11,
    fontWeight: '800' as const,
    color: '#FFFFFF',
  },
  breakingTitle: {
    fontSize: 16,
    fontWeight: '700' as const,
    color: '#FFFFFF',
    marginBottom: 12,
    lineHeight: 22,
  },
  breakingFooter: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  breakingSource: {
    fontSize: 11,
    fontWeight: '600' as const,
    color: 'rgba(255, 255, 255, 0.8)',
  },
  breakingReward: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    backgroundColor: 'rgba(255, 255, 255, 0.2)',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 8,
  },
  breakingRewardText: {
    fontSize: 11,
    fontWeight: '700' as const,
    color: '#FFFFFF',
  },
  newsSection: {
    paddingHorizontal: 20,
  },
  newsCard: {
    backgroundColor: Colors.surface,
    borderRadius: 16,
    padding: 16,
    marginBottom: 12,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 4,
    position: 'relative',
  },
  newsCardRead: {
    opacity: 0.7,
  },
  newsHeader: {
    marginBottom: 12,
  },
  newsMetaRow: {
    flexDirection: 'row',
    gap: 8,
  },
  urgencyBadge: {
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 8,
  },
  urgencyBadgeText: {
    fontSize: 11,
    fontWeight: '700' as const,
  },
  impactBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 8,
  },
  impactBadgeText: {
    fontSize: 11,
    fontWeight: '700' as const,
  },
  newsTitle: {
    fontSize: 18,
    fontWeight: '700' as const,
    color: Colors.text,
    marginBottom: 8,
    lineHeight: 24,
  },
  newsTitleRead: {
    color: Colors.textSecondary,
  },
  newsSummary: {
    fontSize: 14,
    color: Colors.textSecondary,
    lineHeight: 20,
    marginBottom: 12,
  },
  newsFooter: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  newsMetaInfo: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  newsSource: {
    fontSize: 12,
    fontWeight: '600' as const,
    color: Colors.primary,
  },
  newsDot: {
    fontSize: 12,
    color: Colors.textLight,
  },
  newsTime: {
    fontSize: 12,
    color: Colors.textSecondary,
  },
  newsReadTime: {
    fontSize: 12,
    color: Colors.textSecondary,
  },
  newsRewards: {
    flexDirection: 'row',
    gap: 8,
  },
  rewardItem: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  rewardText: {
    fontSize: 13,
    fontWeight: '600' as const,
    color: Colors.textSecondary,
  },
  unreadIndicator: {
    position: 'absolute',
    top: 16,
    right: 16,
    width: 10,
    height: 10,
    borderRadius: 5,
    backgroundColor: Colors.primary,
  },
  bottomPadding: {
    height: 40,
  },
});
