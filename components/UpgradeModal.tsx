// Upgrade Modal Component - Premium Lifetime Purchase
import React, { useState } from 'react';
import {
  Modal,
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  ScrollView,
  Dimensions,
  Platform,
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { X, Check, Crown, Sparkles, Zap } from 'lucide-react-native';
import { usePremium } from '@/contexts/PremiumContext';
import { PREMIUM_PRICE, PREMIUM_FEATURES } from '@/types/premium';
import Colors from '@/constants/colors';
import * as Haptics from 'expo-haptics';

const { height } = Dimensions.get('window');

interface UpgradeModalProps {
  visible: boolean;
  onClose: () => void;
}

export default function UpgradeModal({ visible, onClose }: UpgradeModalProps) {
  const { purchasePremium } = usePremium();
  const [isProcessing, setIsProcessing] = useState(false);

  const handlePurchase = async () => {
    if (Platform.OS !== 'web') {
      await Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
    }
    
    setIsProcessing(true);
    
    try {
      const result = await purchasePremium({
        userId: 'user_123',
        email: 'user@example.com',
        paymentMethod: 'pix',
        paymentGateway: 'mercado_pago',
        amount: PREMIUM_PRICE.amount,
        currency: 'BRL',
      });

      if (result.success) {
        onClose();
      }
    } finally {
      setIsProcessing(false);
    }
  };

  return (
    <Modal visible={visible} animationType="slide" transparent>
      <View style={styles.overlay}>
        <View style={styles.container}>
          <TouchableOpacity style={styles.closeButton} onPress={onClose}>
            <X size={24} color={Colors.text} />
          </TouchableOpacity>

          <ScrollView showsVerticalScrollIndicator={false}>
            <LinearGradient
              colors={['#9333EA', '#EC4899']}
              start={{ x: 0, y: 0 }}
              end={{ x: 1, y: 1 }}
              style={styles.header}
            >
              <Crown size={48} color="#FFF" />
              <Text style={styles.title}>Desbloqueie Premium</Text>
              <Text style={styles.subtitle}>Uma vez. Para sempre. 🚀</Text>
            </LinearGradient>

            <View style={styles.priceSection}>
              <Text style={styles.originalPrice}>{PREMIUM_PRICE.formattedOriginalPrice}</Text>
              <Text style={styles.currentPrice}>{PREMIUM_PRICE.formattedPrice}</Text>
              <View style={styles.discountBadge}>
                <Sparkles size={16} color={Colors.warning} />
                <Text style={styles.discountText}>60% OFF - Preço de Lançamento!</Text>
              </View>
            </View>

            <View style={styles.featuresSection}>
              <Text style={styles.sectionTitle}>O que você desbloqueia:</Text>
              {PREMIUM_FEATURES.slice(0, 6).map((feature) => (
                <View key={feature.id} style={styles.featureRow}>
                  <View style={styles.featureIcon}>
                    <Text style={styles.featureIconText}>{feature.icon}</Text>
                  </View>
                  <View style={styles.featureContent}>
                    <Text style={styles.featureName}>{feature.name}</Text>
                    <Text style={styles.featureDescription}>{feature.description}</Text>
                  </View>
                  <Check size={20} color={Colors.success} />
                </View>
              ))}
            </View>

            <View style={styles.urgencySection}>
              <Zap size={20} color={Colors.warning} />
              <Text style={styles.urgencyText}>
                🔥 500+ usuários upgradaram esta semana!
              </Text>
            </View>

            <TouchableOpacity 
              style={styles.purchaseButton}
              onPress={handlePurchase}
              disabled={isProcessing}
            >
              <LinearGradient
                colors={['#9333EA', '#EC4899']}
                start={{ x: 0, y: 0 }}
                end={{ x: 1, y: 0 }}
                style={styles.purchaseGradient}
              >
                <Text style={styles.purchaseButtonText}>
                  {isProcessing ? 'Processando...' : `Desbloquear por ${PREMIUM_PRICE.formattedPrice}`}
                </Text>
              </LinearGradient>
            </TouchableOpacity>

            <Text style={styles.guarantee}>
              ✅ Garantia de 7 dias - Devolução total se não gostar
            </Text>
          </ScrollView>
        </View>
      </View>
    </Modal>
  );
}

const styles = StyleSheet.create({
  overlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.7)',
    justifyContent: 'flex-end',
  },
  container: {
    backgroundColor: Colors.surface,
    borderTopLeftRadius: 24,
    borderTopRightRadius: 24,
    maxHeight: height * 0.9,
    paddingBottom: 40,
  },
  closeButton: {
    position: 'absolute',
    top: 16,
    right: 16,
    zIndex: 10,
    padding: 8,
    backgroundColor: Colors.surface,
    borderRadius: 20,
  },
  header: {
    padding: 32,
    alignItems: 'center',
    gap: 12,
  },
  title: {
    fontSize: 28,
    fontWeight: '700',
    color: '#FFF',
  },
  subtitle: {
    fontSize: 16,
    color: '#FFF',
    opacity: 0.9,
  },
  priceSection: {
    alignItems: 'center',
    padding: 20,
    gap: 8,
  },
  originalPrice: {
    fontSize: 18,
    color: Colors.textSecondary,
    textDecorationLine: 'line-through',
  },
  currentPrice: {
    fontSize: 48,
    fontWeight: '800',
    color: Colors.primary,
  },
  discountBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    backgroundColor: Colors.warning + '20',
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 20,
  },
  discountText: {
    fontSize: 14,
    fontWeight: '600',
    color: Colors.warning,
  },
  featuresSection: {
    padding: 20,
    gap: 12,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: '700',
    color: Colors.text,
    marginBottom: 8,
  },
  featureRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    padding: 12,
    backgroundColor: Colors.background,
    borderRadius: 12,
  },
  featureIcon: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: Colors.primary + '20',
    alignItems: 'center',
    justifyContent: 'center',
  },
  featureIconText: {
    fontSize: 20,
  },
  featureContent: {
    flex: 1,
  },
  featureName: {
    fontSize: 14,
    fontWeight: '600',
    color: Colors.text,
  },
  featureDescription: {
    fontSize: 12,
    color: Colors.textSecondary,
  },
  urgencySection: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
    padding: 16,
    backgroundColor: Colors.warning + '10',
    marginHorizontal: 20,
    borderRadius: 12,
  },
  urgencyText: {
    fontSize: 14,
    fontWeight: '600',
    color: Colors.text,
  },
  purchaseButton: {
    marginHorizontal: 20,
    marginTop: 20,
    borderRadius: 16,
    overflow: 'hidden',
  },
  purchaseGradient: {
    paddingVertical: 18,
    alignItems: 'center',
  },
  purchaseButtonText: {
    fontSize: 18,
    fontWeight: '700',
    color: '#FFF',
  },
  guarantee: {
    fontSize: 12,
    color: Colors.textSecondary,
    textAlign: 'center',
    marginTop: 16,
  },
});
