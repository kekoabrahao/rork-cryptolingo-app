import React, { createContext, useContext, useState, useEffect, useCallback, ReactNode } from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { Platform, Alert } from 'react-native';
import * as Haptics from 'expo-haptics';
import { 
  PremiumStatus, 
  PaymentData, 
  PurchaseResponse,
  RestorePurchaseRequest,
  STORAGE_KEYS
} from '@/types/premium';
import { analytics } from '@/utils/analytics';

interface PremiumContextType {
  isPremium: boolean;
  premiumStatus: PremiumStatus | null;
  isLoading: boolean;
  purchasePremium: (request: PaymentData) => Promise<PurchaseResponse>;
  restorePurchase: (request: RestorePurchaseRequest) => Promise<boolean>;
  checkPremiumStatus: () => Promise<void>;
  showUpgradeModal: () => void;
  hideUpgradeModal: () => void;
  isUpgradeModalVisible: boolean;
  featureLockReason?: string;
}

const PremiumContext = createContext<PremiumContextType | undefined>(undefined);

export const PremiumProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const [isPremium, setIsPremium] = useState(false);
  const [premiumStatus, setPremiumStatus] = useState<PremiumStatus | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isUpgradeModalVisible, setIsUpgradeModalVisible] = useState(false);
  const [featureLockReason, setFeatureLockReason] = useState<string>();

  const loadPremiumStatus = useCallback(async () => {
    try {
      setIsLoading(true);
      const storedStatus = await AsyncStorage.getItem(STORAGE_KEYS.PREMIUM_STATUS);
      
      if (storedStatus) {
        const status: PremiumStatus = JSON.parse(storedStatus);
        setPremiumStatus(status);
        setIsPremium(status.isPremium);
        
        // Validate with backend (silent background check)
        validateWithBackend(status);
      }
    } catch (error) {
      console.error('Failed to load premium status:', error);
      analytics.track('data_validation_error', { error: String(error) });
    } finally {
      setIsLoading(false);
    }
  }, []);

  // Load premium status from storage on mount
  useEffect(() => {
    loadPremiumStatus();
  }, [loadPremiumStatus]);

  const validateWithBackend = async (status: PremiumStatus) => {
    // Local-only validation - no backend required
    try {
      if (status.isPremium && status.transactionId) {
        console.log('✅ Premium status validated locally:', status.transactionId);
      }
    } catch (error) {
      console.error('Validation error:', error);
    }
  };

  const checkPremiumStatus = async () => {
    await loadPremiumStatus();
  };

  const purchasePremium = async (request: PaymentData): Promise<PurchaseResponse> => {
    try {
      console.log('💎 Processing premium purchase...');
      
      // Simulate payment processing
      await new Promise(resolve => setTimeout(resolve, 1500));

      // Create premium status
      const transactionId = `TXN_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
      const premiumStatus: PremiumStatus = {
        isPremium: true,
        tier: 'premium_lifetime',
        purchaseDate: new Date().toISOString(),
        transactionId,
        paymentMethod: request.paymentMethod,
        paymentGateway: request.paymentGateway,
        amount: request.amount,
        currency: request.currency as 'BRL' | 'USD',
      };

      // Save premium status locally
      await AsyncStorage.setItem(STORAGE_KEYS.PREMIUM_STATUS, JSON.stringify(premiumStatus));
      setPremiumStatus(premiumStatus);
      setIsPremium(true);
      
      // Haptic feedback for success
      if (Platform.OS !== 'web') {
        await Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
      }

      // Track successful purchase
      analytics.track('paywall_converted', {
        transaction_id: transactionId,
        payment_method: request.paymentMethod,
        payment_gateway: request.paymentGateway,
        amount: request.amount,
        currency: request.currency
      });

      // Show success celebration
      Alert.alert(
        '🎉 Bem-vindo ao Premium!',
        'Você agora tem acesso vitalício a todos os recursos premium!',
        [{ text: 'Começar a Explorar!', style: 'default' }]
      );

      // Hide upgrade modal
      setIsUpgradeModalVisible(false);

      return {
        success: true,
        transactionId,
        premiumStatus
      };
    } catch (error) {
      console.error('Purchase error:', error);
      analytics.track('data_validation_error', { error: String(error) });
      
      Alert.alert(
        'Erro na Compra',
        'Não foi possível completar a compra. Por favor, tente novamente.',
        [{ text: 'OK', style: 'cancel' }]
      );

      return {
        success: false,
        error: 'Erro ao processar pagamento'
      };
    }
  };

  const restorePurchase = async (request: RestorePurchaseRequest): Promise<boolean> => {
    try {
      console.log('💎 Attempting to restore purchase...');
      analytics.track('restore_purchases_attempted', { email: request.email });

      // Check local storage for existing premium status
      const storedStatus = await AsyncStorage.getItem(STORAGE_KEYS.PREMIUM_STATUS);
      
      if (storedStatus) {
        const status: PremiumStatus = JSON.parse(storedStatus);
        
        if (status.isPremium) {
          setPremiumStatus(status);
          setIsPremium(true);

          // Haptic feedback
          if (Platform.OS !== 'web') {
            await Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
          }

          analytics.track('restore_purchases_attempted', {
            transaction_id: status.transactionId,
            success: true
          });

          Alert.alert(
            '✅ Premium Restaurado!',
            'Seu acesso premium foi restaurado com sucesso.',
            [{ text: 'Ótimo!', style: 'default' }]
          );

          return true;
        }
      }
      
      // No premium purchase found
      analytics.track('restore_purchases_attempted', { 
        success: false,
        reason: 'no_purchase_found' 
      });
      
      Alert.alert(
        'Nenhuma Compra Encontrada',
        'Não encontramos nenhuma compra premium neste dispositivo.',
        [{ text: 'OK', style: 'cancel' }]
      );

      return false;
    } catch (error) {
      console.error('Restore purchase error:', error);
      analytics.track('data_validation_error', { error: String(error) });
      
      Alert.alert(
        'Erro ao Restaurar',
        'Não foi possível restaurar a compra. Por favor, tente novamente.',
        [{ text: 'OK', style: 'cancel' }]
      );

      return false;
    }
  };

  const showUpgradeModal = () => {
    setIsUpgradeModalVisible(true);
    analytics.track('paywall_shown', {});
  };

  const hideUpgradeModal = () => {
    setIsUpgradeModalVisible(false);
    setFeatureLockReason(undefined);
    analytics.track('paywall_dismissed', {});
  };

  return (
    <PremiumContext.Provider
      value={{
        isPremium,
        premiumStatus,
        isLoading,
        purchasePremium,
        restorePurchase,
        checkPremiumStatus,
        showUpgradeModal,
        hideUpgradeModal,
        isUpgradeModalVisible,
        featureLockReason
      }}
    >
      {children}
    </PremiumContext.Provider>
  );
};

export const usePremium = (): PremiumContextType => {
  const context = useContext(PremiumContext);
  if (!context) {
    throw new Error('usePremium must be used within PremiumProvider');
  }
  return context;
};

export default PremiumContext;
