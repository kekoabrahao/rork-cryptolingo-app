import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { Platform, Alert } from 'react-native';
import * as Haptics from 'expo-haptics';
import { 
  PremiumStatus, 
  PurchaseRequest, 
  PurchaseResponse,
  RestorePurchaseRequest,
  PREMIUM_STORAGE_KEY,
  PREMIUM_PRICE
} from '@/types/premium';
import { Analytics } from '@/utils/analytics';

interface PremiumContextType {
  isPremium: boolean;
  premiumStatus: PremiumStatus | null;
  isLoading: boolean;
  purchasePremium: (request: PurchaseRequest) => Promise<PurchaseResponse>;
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
      const storedStatus = await AsyncStorage.getItem(PREMIUM_STORAGE_KEY);
      
      if (storedStatus) {
        const status: PremiumStatus = JSON.parse(storedStatus);
        setPremiumStatus(status);
        setIsPremium(status.isPremium);
        
        // Validate with backend (silent background check)
        validateWithBackend(status);
      }
    } catch (error) {
      console.error('Failed to load premium status:', error);
      Analytics.trackError('premium_status_load_failed', error as Error);
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
          userId: status.userId,
          transactionId: status.transactionId
        })
      });

      const data = await response.json();
      
      if (!data.isValid && status.isPremium) {
        // Premium status invalidated - clear local data
        await AsyncStorage.removeItem(PREMIUM_STORAGE_KEY);
        setIsPremium(false);
        setPremiumStatus(null);
        Analytics.track('premium_status_invalidated', { reason: data.reason });
      }
    } catch (error) {
      console.error('Backend validation failed:', error);
      // Don't remove local status on network errors - just log
      Analytics.trackError('premium_validation_failed', error as Error);
    }
  };

  const checkPremiumStatus = async () => {
    await loadPremiumStatus();
  };

  const purchasePremium = async (request: PurchaseRequest): Promise<PurchaseResponse> => {
    try {
      Analytics.track('purchase_initiated', {
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
        await AsyncStorage.setItem(PREMIUM_STORAGE_KEY, JSON.stringify(data.premiumStatus));
        setPremiumStatus(data.premiumStatus);
        setIsPremium(true);
        
        // Haptic feedback for success
        if (Platform.OS !== 'web') {
          await Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
        }

        // Track successful purchase
        Analytics.track('purchase_completed', {
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
        Analytics.track('purchase_failed', {
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
      Analytics.trackError('purchase_error', error as Error);
      
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
      Analytics.track('restore_purchase_initiated', { email: request.email });

      // TODO: Replace with actual backend endpoint
      const response = await fetch(`${process.env.EXPO_PUBLIC_API_URL}/api/premium/restore`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(request)
      });

      const data = await response.json();

      if (data.success && data.premiumStatus) {
        // Restore premium status locally
        await AsyncStorage.setItem(PREMIUM_STORAGE_KEY, JSON.stringify(data.premiumStatus));
        setPremiumStatus(data.premiumStatus);
        setIsPremium(true);

        // Haptic feedback
        if (Platform.OS !== 'web') {
          await Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
        }

        Analytics.track('restore_purchase_success', {
          transaction_id: data.premiumStatus.transactionId
        });

        Alert.alert(
          '✅ Premium Restored!',
          'Your premium access has been successfully restored.',
          [{ text: 'Great!', style: 'default' }]
        );

        return true;
      } else {
        Analytics.track('restore_purchase_failed', { error: data.error });
        
        Alert.alert(
          'Restore Failed',
          data.error || 'No premium purchase found for this account.',
          [{ text: 'OK', style: 'cancel' }]
        );

        return false;
      }
    } catch (error) {
      console.error('Restore purchase error:', error);
      Analytics.trackError('restore_purchase_error', error as Error);
      
      Alert.alert(
        'Connection Error',
        'Unable to restore purchase. Please check your internet connection.',
        [{ text: 'OK', style: 'cancel' }]
      );

      return false;
    }
  };

  const showUpgradeModal = (reason?: string) => {
    setFeatureLockReason(reason);
    setIsUpgradeModalVisible(true);
    Analytics.track('upgrade_modal_shown', { reason });
  };

  const hideUpgradeModal = () => {
    setIsUpgradeModalVisible(false);
    setFeatureLockReason(undefined);
    Analytics.track('upgrade_modal_dismissed');
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
