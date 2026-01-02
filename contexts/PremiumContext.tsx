import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
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

  // Load premium status from storage on mount
  useEffect(() => {
    loadPremiumStatus();
  }, []);

  const loadPremiumStatus = async () => {
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
  };

  const validateWithBackend = async (status: PremiumStatus) => {
    try {
      // TODO: Replace with actual backend endpoint
      const response = await fetch(`${process.env.EXPO_PUBLIC_API_URL}/api/premium/validate`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          transactionId: status.transactionId
        })
      });

      const data = await response.json();
      
      if (!data.isValid && status.isPremium) {
        // Premium status invalidated - clear local data
        await AsyncStorage.removeItem(STORAGE_KEYS.PREMIUM_STATUS);
        setIsPremium(false);
        setPremiumStatus(null);
        analytics.track('premium_feature_attempted', { reason: data.reason });
      }
    } catch (error) {
      console.error('Backend validation failed:', error);
      // Don't remove local status on network errors - just log
      analytics.track('data_validation_error', { error: String(error) });
    }
  };

  const checkPremiumStatus = async () => {
    await loadPremiumStatus();
  };

  const purchasePremium = async (request: PaymentData): Promise<PurchaseResponse> => {
    try {
      analytics.track('paywall_converted', {
        payment_method: request.paymentMethod,
        payment_gateway: request.paymentGateway,
        amount: request.amount,
        currency: request.currency
      });

      // TODO: Replace with actual payment gateway integration
      const response = await fetch(`${process.env.EXPO_PUBLIC_API_URL}/api/premium/purchase`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(request)
      });

      const data: PurchaseResponse = await response.json();

      if (data.success && data.premiumStatus) {
        // Save premium status locally
        await AsyncStorage.setItem(STORAGE_KEYS.PREMIUM_STATUS, JSON.stringify(data.premiumStatus));
        setPremiumStatus(data.premiumStatus);
        setIsPremium(true);
        
        // Haptic feedback for success
        if (Platform.OS !== 'web') {
          await Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
        }

        // Track successful purchase
        analytics.track('paywall_converted', {
          transaction_id: data.premiumStatus.transactionId,
          payment_method: request.paymentMethod,
          payment_gateway: request.paymentGateway,
          amount: request.amount
        });

        // Show success celebration
        Alert.alert(
          '🎉 Welcome to Premium!',
          'You now have lifetime access to all premium features!',
          [{ text: 'Start Exploring!', style: 'default' }]
        );

        // Hide upgrade modal
        setIsUpgradeModalVisible(false);
      } else {
        // Track failed purchase
        analytics.track('paywall_dismissed', {
          payment_method: request.paymentMethod,
          error: data.error || 'Unknown error'
        });

        Alert.alert(
          'Purchase Failed',
          data.error || 'Unable to complete purchase. Please try again.',
          [{ text: 'OK', style: 'cancel' }]
        );
      }

      return data;
    } catch (error) {
      console.error('Purchase error:', error);
      analytics.track('data_validation_error', { error: String(error) });
      
      Alert.alert(
        'Connection Error',
        'Unable to connect to payment service. Please check your internet connection.',
        [{ text: 'OK', style: 'cancel' }]
      );

      return {
        success: false,
        error: 'Network error - please try again'
      };
    }
  };

  const restorePurchase = async (request: RestorePurchaseRequest): Promise<boolean> => {
    try {
      analytics.track('restore_purchases_attempted', { email: request.email });

      // TODO: Replace with actual backend endpoint
      const response = await fetch(`${process.env.EXPO_PUBLIC_API_URL}/api/premium/restore`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(request)
      });

      const data = await response.json();

      if (data.success && data.premiumStatus) {
        // Restore premium status locally
        await AsyncStorage.setItem(STORAGE_KEYS.PREMIUM_STATUS, JSON.stringify(data.premiumStatus));
        setPremiumStatus(data.premiumStatus);
        setIsPremium(true);

        // Haptic feedback
        if (Platform.OS !== 'web') {
          await Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
        }

        analytics.track('restore_purchases_attempted', {
          transaction_id: data.premiumStatus.transactionId
        });

        Alert.alert(
          '✅ Premium Restored!',
          'Your premium access has been successfully restored.',
          [{ text: 'Great!', style: 'default' }]
        );

        return true;
      } else {
        analytics.track('restore_purchases_attempted', { error: data.error });
        
        Alert.alert(
          'Restore Failed',
          data.error || 'No premium purchase found for this account.',
          [{ text: 'OK', style: 'cancel' }]
        );

        return false;
      }
    } catch (error) {
      console.error('Restore purchase error:', error);
      analytics.track('data_validation_error', { error: String(error) });
      
      Alert.alert(
        'Connection Error',
        'Unable to restore purchase. Please check your internet connection.',
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
