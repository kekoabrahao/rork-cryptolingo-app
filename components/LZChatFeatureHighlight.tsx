import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { MessageCircle, Sparkles, TrendingUp } from 'lucide-react-native';
import Colors from '@/constants/colors';

interface LZChatFeatureHighlightProps {
  variant?: 'compact' | 'full';
}

/**
 * LZ Chat Feature Highlight Component
 * Displays the Chat with LZ feature in a visually appealing way
 * Use in UpgradeModal, settings, or as a promotional banner
 */
export function LZChatFeatureHighlight({ variant = 'full' }: LZChatFeatureHighlightProps) {
  if (variant === 'compact') {
    return (
      <View style={styles.compactContainer}>
        <View style={styles.compactIcon}>
          <MessageCircle size={20} color="#FFD700" />
        </View>
        <View style={styles.compactContent}>
          <Text style={styles.compactTitle}>💬 Chat com Mentor LZ</Text>
          <Text style={styles.compactDescription}>Perguntas ilimitadas ao consultor de investimentos</Text>
        </View>
      </View>
    );
  }

  return (
    <LinearGradient
      colors={['#1a1a1a', '#2a2a2a']}
      start={{ x: 0, y: 0 }}
      end={{ x: 1, y: 1 }}
      style={styles.fullContainer}
    >
      {/* Header with badge */}
      <View style={styles.header}>
        <View style={styles.badge}>
          <Sparkles size={12} color="#FFD700" />
          <Text style={styles.badgeText}>NOVO</Text>
        </View>
      </View>

      {/* Icon Section */}
      <View style={styles.iconSection}>
        <LinearGradient
          colors={['#FFD700', '#FFA500']}
          start={{ x: 0, y: 0 }}
          end={{ x: 1, y: 1 }}
          style={styles.iconCircle}
        >
          <MessageCircle size={32} color="#000" />
        </LinearGradient>
      </View>

      {/* Content */}
      <View style={styles.content}>
        <Text style={styles.title}>💬 Converse com o Mentor LZ</Text>
        <Text style={styles.subtitle}>Consultor de investimentos em criptomoedas com IA</Text>
        
        <View style={styles.featuresGrid}>
          <View style={styles.featureItem}>
            <TrendingUp size={16} color={Colors.success} />
            <Text style={styles.featureText}>Análises de mercado</Text>
          </View>
          <View style={styles.featureItem}>
            <MessageCircle size={16} color={Colors.primary} />
            <Text style={styles.featureText}>Respostas instantâneas</Text>
          </View>
          <View style={styles.featureItem}>
            <Sparkles size={16} color="#FFD700" />
            <Text style={styles.featureText}>Educação personalizada</Text>
          </View>
        </View>
      </View>

      {/* Limits */}
      <View style={styles.limitsSection}>
        <View style={styles.limitRow}>
          <View style={styles.limitBadge}>
            <Text style={styles.limitBadgeText}>FREE</Text>
          </View>
          <Text style={styles.limitText}>2 perguntas/dia</Text>
        </View>
        <View style={styles.divider} />
        <View style={styles.limitRow}>
          <View style={[styles.limitBadge, styles.premiumBadge]}>
            <Text style={[styles.limitBadgeText, styles.premiumBadgeText]}>PREMIUM</Text>
          </View>
          <Text style={[styles.limitText, styles.unlimitedText]}>Perguntas ilimitadas ♾️</Text>
        </View>
      </View>

      {/* Footer */}
      <View style={styles.footer}>
        <Text style={styles.footerText}>
          💡 <Text style={styles.footerHighlight}>+70.000 alunos</Text> já aprendem com o LZ
        </Text>
      </View>
    </LinearGradient>
  );
}

const styles = StyleSheet.create({
  // Compact Variant
  compactContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    padding: 12,
    backgroundColor: Colors.surface,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: '#FFD700' + '30',
  },
  compactIcon: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: '#FFD700' + '20',
    alignItems: 'center',
    justifyContent: 'center',
  },
  compactContent: {
    flex: 1,
  },
  compactTitle: {
    fontSize: 14,
    fontWeight: '700',
    color: Colors.text,
    marginBottom: 2,
  },
  compactDescription: {
    fontSize: 12,
    color: Colors.textSecondary,
  },

  // Full Variant
  fullContainer: {
    borderRadius: 20,
    padding: 20,
    marginVertical: 16,
    borderWidth: 2,
    borderColor: '#FFD700' + '40',
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'flex-end',
    marginBottom: 12,
  },
  badge: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    backgroundColor: '#FFD700' + '20',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: '#FFD700',
  },
  badgeText: {
    fontSize: 10,
    fontWeight: '800',
    color: '#FFD700',
    letterSpacing: 0.5,
  },
  iconSection: {
    alignItems: 'center',
    marginBottom: 16,
  },
  iconCircle: {
    width: 64,
    height: 64,
    borderRadius: 32,
    alignItems: 'center',
    justifyContent: 'center',
    shadowColor: '#FFD700',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 8,
  },
  content: {
    alignItems: 'center',
    marginBottom: 20,
  },
  title: {
    fontSize: 20,
    fontWeight: '800',
    color: Colors.text,
    marginBottom: 6,
    textAlign: 'center',
  },
  subtitle: {
    fontSize: 14,
    color: Colors.textSecondary,
    textAlign: 'center',
    marginBottom: 16,
  },
  featuresGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'center',
    gap: 12,
  },
  featureItem: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    backgroundColor: Colors.surface + '80',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 16,
  },
  featureText: {
    fontSize: 12,
    color: Colors.text,
    fontWeight: '600',
  },
  limitsSection: {
    backgroundColor: Colors.background,
    borderRadius: 12,
    padding: 16,
    marginBottom: 16,
  },
  limitRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    paddingVertical: 8,
  },
  limitBadge: {
    backgroundColor: Colors.textSecondary + '20',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 6,
    minWidth: 60,
    alignItems: 'center',
  },
  limitBadgeText: {
    fontSize: 10,
    fontWeight: '800',
    color: Colors.textSecondary,
  },
  premiumBadge: {
    backgroundColor: Colors.primary + '30',
  },
  premiumBadgeText: {
    color: Colors.primary,
  },
  limitText: {
    fontSize: 14,
    color: Colors.textSecondary,
    flex: 1,
  },
  unlimitedText: {
    color: Colors.text,
    fontWeight: '700',
  },
  divider: {
    height: 1,
    backgroundColor: Colors.border,
    marginVertical: 4,
  },
  footer: {
    alignItems: 'center',
  },
  footerText: {
    fontSize: 12,
    color: Colors.textSecondary,
    textAlign: 'center',
  },
  footerHighlight: {
    color: '#FFD700',
    fontWeight: '700',
  },
});
