import React, { useState, useEffect } from 'react';
import {
  Modal,
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  ScrollView,
  Dimensions,
  Platform,
  ActivityIndicator,
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { X, Check, Crown, Sparkles, Zap } from 'lucide-react-native';
import { usePremium } from '@/contexts/PremiumContext';
import Colors from '@/constants/colors';
import * as Haptics from 'expo-haptics';

const { height } = Dimensions.get('window');

export default function RevenueCatPaywall() {
  const { 
    isUpgradeModalVisible, 
    hideUpgradeModal, 
    purchasePremium, 
    availablePackages,
    isLoadingOfferings 
  } = usePremium();
  
  const [isProcessing, setIsProcessing] = useState(false);
  const [selectedPackageId, setSelectedPackageId] = useState<string | null>(null);

  useEffect(() => {
    if (availablePackages.length > 0 && !selectedPackageId) {
      const lifetimePackage = availablePackages.find(
        p => p.identifier.toLowerCase().includes('lifetime') || 
             p.product.identifier.toLowerCase().includes('lifetime')
      );
      setSelectedPackageId(
        lifetimePackage?.identifier || availablePackages[0]?.identifier
      );
    }
  }, [availablePackages, selectedPackageId]);

  const handlePurchase = async () => {
    if (Platform.OS !== 'web') {
      await Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
    }
    
    setIsProcessing(true);
    
    try {
      const success = await purchasePremium(selectedPackageId || undefined);
      if (success) {
        hideUpgradeModal();
      }
    } finally {
      setIsProcessing(false);
    }
  };

  const getPackageTitle = (pkg: any) => {
    const identifier = pkg.identifier.toLowerCase();
    if (identifier.includes('lifetime')) return 'Lifetime';
    if (identifier.includes('annual') || identifier.includes('yearly')) return 'Yearly';
    if (identifier.includes('monthly')) return 'Monthly';
    return pkg.identifier;
  };

  const getPackageDescription = (pkg: any) => {
    const identifier = pkg.identifier.toLowerCase();
    if (identifier.includes('lifetime')) return 'Pagamento único';
    if (identifier.includes('annual') || identifier.includes('yearly')) return 'Por ano';
    if (identifier.includes('monthly')) return 'Por mês';
    return '';
  };

  return (
    <Modal visible={isUpgradeModalVisible} animationType="slide" transparent>
      <View style={styles.overlay}>
        <View style={styles.container}>
          <TouchableOpacity style={styles.closeButton} onPress={hideUpgradeModal}>
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
              <Text style={styles.subtitle}>Escolha o melhor plano para você 🚀</Text>
            </LinearGradient>

            {isLoadingOfferings ? (
              <View style={styles.loadingContainer}>
                <ActivityIndicator size="large" color={Colors.primary} />
                <Text style={styles.loadingText}>Carregando ofertas...</Text>
              </View>
            ) : availablePackages.length > 0 ? (
              <>
                <View style={styles.packagesSection}>
                  <Text style={styles.sectionTitle}>Escolha seu plano:</Text>
                  {availablePackages.map((pkg) => {
                    const isSelected = selectedPackageId === pkg.identifier;
                    const isLifetime = pkg.identifier.toLowerCase().includes('lifetime');
                    
                    return (
                      <TouchableOpacity
                        key={pkg.identifier}
                        style={[
                          styles.packageCard,
                          isSelected && styles.packageCardSelected,
                          isLifetime && styles.packageCardRecommended,
                        ]}
                        onPress={() => setSelectedPackageId(pkg.identifier)}
                      >
                        {isLifetime && (
                          <View style={styles.recommendedBadge}>
                            <Sparkles size={12} color="#FFF" />
                            <Text style={styles.recommendedText}>RECOMENDADO</Text>
                          </View>
                        )}
                        
                        <View style={styles.packageHeader}>
                          <View style={styles.packageTitleRow}>
                            <Text style={styles.packageTitle}>
                              {getPackageTitle(pkg)}
                            </Text>
                            {isSelected && (
                              <View style={styles.selectedBadge}>
                                <Check size={16} color="#FFF" />
                              </View>
                            )}
                          </View>
                          <Text style={styles.packageDescription}>
                            {getPackageDescription(pkg)}
                          </Text>
                        </View>

                        <View style={styles.packagePricing}>
                          <Text style={styles.packagePrice}>
                            {pkg.product.priceString}
                          </Text>
                          <Text style={styles.packagePeriod}>
                            {getPackageDescription(pkg)}
                          </Text>
                        </View>
                      </TouchableOpacity>
                    );
                  })}
                </View>

                <View style={styles.featuresSection}>
                  <Text style={styles.sectionTitle}>O que está incluso:</Text>
                  <View style={styles.featureRow}>
                    <Check size={20} color={Colors.success} />
                    <Text style={styles.featureText}>📚 Todas as Lições Avançadas</Text>
                  </View>
                  <View style={styles.featureRow}>
                    <Check size={20} color={Colors.success} />
                    <Text style={styles.featureText}>🚫 Experiência Sem Anúncios</Text>
                  </View>
                  <View style={styles.featureRow}>
                    <Check size={20} color={Colors.success} />
                    <Text style={styles.featureText}>🤖 Tutor de IA Ilimitado</Text>
                  </View>
                  <View style={styles.featureRow}>
                    <Check size={20} color={Colors.success} />
                    <Text style={styles.featureText}>📈 Simulador de Trading Real</Text>
                  </View>
                  <View style={styles.featureRow}>
                    <Check size={20} color={Colors.success} />
                    <Text style={styles.featureText}>⚡ Multiplicador 2x XP</Text>
                  </View>
                  <View style={styles.featureRow}>
                    <Check size={20} color={Colors.success} />
                    <Text style={styles.featureText}>💬 Suporte Prioritário</Text>
                  </View>
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
                  disabled={isProcessing || !selectedPackageId}
                >
                  <LinearGradient
                    colors={['#9333EA', '#EC4899']}
                    start={{ x: 0, y: 0 }}
                    end={{ x: 1, y: 0 }}
                    style={styles.purchaseGradient}
                  >
                    <Text style={styles.purchaseButtonText}>
                      {isProcessing ? 'Processando...' : 'Continuar'}
                    </Text>
                  </LinearGradient>
                </TouchableOpacity>

                <Text style={styles.guarantee}>
                  ✅ Garantia de 7 dias - Devolução total se não gostar
                </Text>
              </>
            ) : (
              <View style={styles.errorContainer}>
                <Text style={styles.errorText}>
                  Nenhum produto disponível no momento.{'\n'}
                  Por favor, tente novamente mais tarde.
                </Text>
              </View>
            )}
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
  loadingContainer: {
    padding: 40,
    alignItems: 'center',
    gap: 16,
  },
  loadingText: {
    fontSize: 16,
    color: Colors.textSecondary,
  },
  packagesSection: {
    padding: 20,
    gap: 12,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: '700',
    color: Colors.text,
    marginBottom: 8,
  },
  packageCard: {
    backgroundColor: Colors.background,
    borderRadius: 16,
    padding: 16,
    borderWidth: 2,
    borderColor: Colors.border,
    position: 'relative',
  },
  packageCardSelected: {
    borderColor: Colors.primary,
    backgroundColor: Colors.primary + '10',
  },
  packageCardRecommended: {
    borderColor: Colors.warning,
  },
  recommendedBadge: {
    position: 'absolute',
    top: -10,
    right: 16,
    backgroundColor: Colors.warning,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    paddingHorizontal: 12,
    paddingVertical: 4,
    borderRadius: 12,
  },
  recommendedText: {
    fontSize: 10,
    fontWeight: '700',
    color: '#FFF',
  },
  packageHeader: {
    marginBottom: 12,
  },
  packageTitleRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 4,
  },
  packageTitle: {
    fontSize: 20,
    fontWeight: '700',
    color: Colors.text,
  },
  selectedBadge: {
    width: 24,
    height: 24,
    borderRadius: 12,
    backgroundColor: Colors.primary,
    alignItems: 'center',
    justifyContent: 'center',
  },
  packageDescription: {
    fontSize: 14,
    color: Colors.textSecondary,
  },
  packagePricing: {
    flexDirection: 'row',
    alignItems: 'baseline',
    gap: 8,
  },
  packagePrice: {
    fontSize: 32,
    fontWeight: '800',
    color: Colors.text,
  },
  packagePeriod: {
    fontSize: 14,
    color: Colors.textSecondary,
  },
  featuresSection: {
    padding: 20,
    paddingTop: 0,
    gap: 12,
  },
  featureRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    paddingVertical: 4,
  },
  featureText: {
    fontSize: 14,
    color: Colors.text,
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
  errorContainer: {
    padding: 40,
    alignItems: 'center',
  },
  errorText: {
    fontSize: 16,
    color: Colors.textSecondary,
    textAlign: 'center',
    lineHeight: 24,
  },
});
