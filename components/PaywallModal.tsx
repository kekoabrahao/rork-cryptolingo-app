import { Modal, StyleSheet, Text, View, TouchableOpacity, ScrollView, Platform } from "react-native";
import { LinearGradient } from "expo-linear-gradient";
import { X, Check, Crown, Sparkles } from "lucide-react-native";
import * as Haptics from "expo-haptics";
import { SUBSCRIPTION_PRICING, SubscriptionPlan } from "@/types/subscription";
import { useSubscription } from "@/contexts/SubscriptionContext";
import Colors from "@/constants/colors";
import { analytics } from "@/utils/analytics";

interface PaywallModalProps {
  visible: boolean;
  onClose: () => void;
}

export function PaywallModal({ visible, onClose }: PaywallModalProps) {
  const { paywallConfig, upgradeToPremium, hidePaywall } = useSubscription();

  const handleSelectPlan = async (plan: SubscriptionPlan) => {
    if (Platform.OS !== 'web') {
      await Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
    }
    
    console.log('💎 User selected plan:', plan);
    
    analytics.track('paywall_converted', {
      plan,
      trigger: paywallConfig.trigger,
    });

    await upgradeToPremium(plan);
    hidePaywall();
    onClose();
  };

  const handleClose = async () => {
    if (Platform.OS !== 'web') {
      await Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    }
    hidePaywall();
    onClose();
  };

  const handleRestorePurchases = async () => {
    if (Platform.OS !== 'web') {
      await Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    }
    
    console.log('💎 Attempting to restore purchases...');
    analytics.track('restore_purchases_clicked', {
      trigger: paywallConfig.trigger,
    });
    
    // TODO: Implement actual restore purchases logic
  };

  return (
    <Modal
      visible={visible}
      animationType="slide"
      presentationStyle="pageSheet"
      onRequestClose={handleClose}
    >
      <View style={styles.container}>
        <LinearGradient
          colors={['#6366F1', '#8B5CF6', '#D946EF']}
          start={{ x: 0, y: 0 }}
          end={{ x: 1, y: 1 }}
          style={styles.header}
        >
          <TouchableOpacity style={styles.closeButton} onPress={handleClose}>
            <X size={24} color="#FFFFFF" />
          </TouchableOpacity>

          <View style={styles.headerContent}>
            <View style={styles.crownContainer}>
              <Crown size={48} color="#FFD700" fill="#FFD700" />
              <Sparkles size={20} color="#FFD700" style={styles.sparkle1} />
              <Sparkles size={16} color="#FFD700" style={styles.sparkle2} />
            </View>
            <Text style={styles.headerTitle}>{paywallConfig.title}</Text>
            <Text style={styles.headerSubtitle}>{paywallConfig.subtitle}</Text>
          </View>
        </LinearGradient>

        <ScrollView style={styles.content} showsVerticalScrollIndicator={false}>
          <View style={styles.pricingSection}>
            {SUBSCRIPTION_PRICING.map((pricing) => (
              <TouchableOpacity
                key={pricing.id}
                style={[
                  styles.pricingCard,
                  styles.pricingCardPopular,
                ]}
                onPress={() => handleSelectPlan(pricing.plan)}
                activeOpacity={0.8}
              >
                {pricing.badge && (
                  <View style={styles.badgePopular}>
                    <Text style={styles.badgeText}>{pricing.badge}</Text>
                  </View>
                )}

                <View style={styles.pricingHeader}>
                  <Text style={styles.pricingTitle}>
                    💎 CryptoLingo Premium
                  </Text>
                  
                  <View style={styles.pricingAmount}>
                    <Text style={styles.priceTotal}>
                      R$ {pricing.priceFull.toFixed(2)}
                      <Text style={styles.pricePeriod}> vitalício</Text>
                    </Text>
                  </View>
                </View>

                <View style={styles.featuresList}>
                  {pricing.features.map((feature, index) => (
                    <View key={index} style={styles.featureItem}>
                      <Check size={18} color={Colors.primary} />
                      <Text style={styles.featureText}>{feature}</Text>
                    </View>
                  ))}
                </View>

                <View style={styles.ctaButton}>
                  <LinearGradient
                    colors={['#6366F1', '#8B5CF6']}
                    start={{ x: 0, y: 0 }}
                    end={{ x: 1, y: 0 }}
                    style={styles.ctaGradient}
                  >
                    <Text style={styles.ctaText}>
                      Comprar Acesso Vitalício
                    </Text>
                  </LinearGradient>
                </View>
              </TouchableOpacity>
            ))}
          </View>

          <View style={styles.benefits}>
            <Text style={styles.benefitsTitle}>Por que Premium?</Text>
            <View style={styles.benefitsList}>
              <BenefitItem
                icon="✨"
                title="Aprendizado Ilimitado"
                description="Acesse todas as lições e módulos sem restrições"
              />
              <BenefitItem
                icon="❤️"
                title="Nunca Pare de Aprender"
                description="Vidas ilimitadas para estudar sem interrupções"
              />
              <BenefitItem
                icon="🚫"
                title="Sem Anúncios"
                description="Foque no aprendizado sem distrações"
              />
              <BenefitItem
                icon="⚡"
                title="Aprenda Mais Rápido"
                description="1.5x de XP e moedas para progredir rapidamente"
              />
              <BenefitItem
                icon="📊"
                title="Acompanhe seu Progresso"
                description="Estatísticas avançadas e certificados de conclusão"
              />
              <BenefitItem
                icon="🌍"
                title="Aprenda em Qualquer Lugar"
                description="Baixe lições para acesso offline"
              />
            </View>
          </View>

          <Text style={styles.disclaimer}>
            • Pagamento único de R$ 9,99{'\n'}
            • Acesso vitalício a todos os recursos{'\n'}
            • Sem renovações ou taxas recorrentes{'\n'}
            • Suporte e atualizações incluídos
          </Text>

          <TouchableOpacity style={styles.restoreButton} onPress={handleRestorePurchases}>
            <Text style={styles.restoreButtonText}>Restaurar Compras</Text>
          </TouchableOpacity>

          <View style={styles.bottomPadding} />
        </ScrollView>
      </View>
    </Modal>
  );
}

function BenefitItem({ icon, title, description }: { icon: string; title: string; description: string }) {
  return (
    <View style={styles.benefitItem}>
      <Text style={styles.benefitIcon}>{icon}</Text>
      <View style={styles.benefitContent}>
        <Text style={styles.benefitTitle}>{title}</Text>
        <Text style={styles.benefitDescription}>{description}</Text>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: Colors.background,
  },
  header: {
    paddingTop: Platform.OS === 'ios' ? 60 : 40,
    paddingBottom: 32,
    paddingHorizontal: 20,
  },
  closeButton: {
    alignSelf: 'flex-end',
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: 'rgba(255, 255, 255, 0.2)',
    alignItems: 'center',
    justifyContent: 'center',
  },
  headerContent: {
    alignItems: 'center',
    marginTop: 16,
  },
  crownContainer: {
    position: 'relative',
    marginBottom: 16,
  },
  sparkle1: {
    position: 'absolute',
    top: -8,
    right: -8,
  },
  sparkle2: {
    position: 'absolute',
    bottom: -4,
    left: -12,
  },
  headerTitle: {
    fontSize: 32,
    fontWeight: '800' as const,
    color: '#FFFFFF',
    textAlign: 'center',
    marginBottom: 8,
  },
  headerSubtitle: {
    fontSize: 16,
    color: 'rgba(255, 255, 255, 0.9)',
    textAlign: 'center',
  },
  content: {
    flex: 1,
  },
  pricingSection: {
    paddingHorizontal: 20,
    paddingTop: 24,
    gap: 16,
  },
  pricingCard: {
    backgroundColor: Colors.surface,
    borderRadius: 20,
    padding: 20,
    marginBottom: 16,
    borderWidth: 2,
    borderColor: Colors.border,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.1,
    shadowRadius: 12,
    elevation: 5,
  },
  pricingCardPopular: {
    borderColor: Colors.primary,
    borderWidth: 3,
    shadowColor: Colors.primary,
    shadowOpacity: 0.3,
  },
  badgePopular: {
    position: 'absolute',
    top: -12,
    alignSelf: 'center',
    paddingHorizontal: 16,
    paddingVertical: 6,
    borderRadius: 12,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.2,
    shadowRadius: 4,
    elevation: 4,
    backgroundColor: Colors.primary,
  },
  badgeText: {
    fontSize: 12,
    fontWeight: '800' as const,
    color: '#FFFFFF',
  },
  pricingHeader: {
    marginBottom: 20,
    paddingTop: 8,
  },
  pricingTitle: {
    fontSize: 24,
    fontWeight: '700' as const,
    color: Colors.text,
    marginBottom: 12,
  },
  pricingAmount: {
    marginBottom: 8,
  },
  pricePerMonth: {
    fontSize: 16,
    color: Colors.textSecondary,
    marginBottom: 4,
  },
  priceTotal: {
    fontSize: 36,
    fontWeight: '800' as const,
    color: Colors.text,
  },
  pricePeriod: {
    fontSize: 18,
    fontWeight: '600' as const,
    color: Colors.textSecondary,
  },

  featuresList: {
    gap: 12,
    marginBottom: 20,
  },
  featureItem: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  featureText: {
    fontSize: 15,
    color: Colors.text,
    flex: 1,
  },
  ctaButton: {
    borderRadius: 16,
    overflow: 'hidden',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.2,
    shadowRadius: 8,
    elevation: 6,
  },
  ctaGradient: {
    paddingVertical: 16,
    alignItems: 'center',
  },
  ctaText: {
    fontSize: 18,
    fontWeight: '700' as const,
    color: '#FFFFFF',
  },
  benefits: {
    paddingHorizontal: 20,
    paddingTop: 32,
    paddingBottom: 24,
  },
  benefitsTitle: {
    fontSize: 24,
    fontWeight: '700' as const,
    color: Colors.text,
    marginBottom: 20,
  },
  benefitsList: {
    gap: 20,
  },
  benefitItem: {
    flexDirection: 'row',
    gap: 16,
  },
  benefitIcon: {
    fontSize: 32,
  },
  benefitContent: {
    flex: 1,
  },
  benefitTitle: {
    fontSize: 17,
    fontWeight: '700' as const,
    color: Colors.text,
    marginBottom: 4,
  },
  benefitDescription: {
    fontSize: 14,
    color: Colors.textSecondary,
    lineHeight: 20,
  },
  disclaimer: {
    fontSize: 11,
    color: Colors.textLight,
    textAlign: 'center',
    paddingHorizontal: 32,
    lineHeight: 16,
    marginTop: 24,
  },
  restoreButton: {
    marginTop: 20,
    paddingVertical: 12,
    alignItems: 'center',
  },
  restoreButtonText: {
    fontSize: 14,
    color: Colors.primary,
    fontWeight: '600' as const,
  },
  bottomPadding: {
    height: 40,
  },
});
