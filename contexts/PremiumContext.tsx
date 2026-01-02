import React, { createContext, useContext, useState, useEffect, useCallback, ReactNode } from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { Platform, Alert } from 'react-native';
import * as Haptics from 'expo-haptics';
import { CustomerInfo } from 'react-native-purchases';
import { 
  PremiumStatus, 
  STORAGE_KEYS
} from '@/types/premium';
import { analytics } from '@/utils/analytics';
import { 
  getOfferings, 
  purchasePackage, 
  restorePurchases as rcRestorePurchases,
  getCustomerInfo,
  checkEntitlement
} from '@/lib/revenuecat';

interface PremiumContextType {
  isPremium: boolean;
  premiumStatus: PremiumStatus | null;
  isLoading: boolean;
  customerInfo: CustomerInfo | null;
  purchasePremium: (packageIdentifier?: string) => Promise<boolean>;
  restorePurchase: () => Promise<boolean>;
  checkPremiumStatus: () => Promise<void>;
  showUpgradeModal: () => void;
  hideUpgradeModal: () => void;
  isUpgradeModalVisible: boolean;
  featureLockReason?: string;
  availablePackages: any[];
  isLoadingOfferings: boolean;
}

const PremiumContext = createContext<PremiumContextType | undefined>(undefined);

export const PremiumProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const [isPremium, setIsPremium] = useState(false);
  const [premiumStatus, setPremiumStatus] = useState<PremiumStatus | null>(null);
  const [customerInfo, setCustomerInfo] = useState<CustomerInfo | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isUpgradeModalVisible, setIsUpgradeModalVisible] = useState(false);
  const [featureLockReason, setFeatureLockReason] = useState<string>();
  const [availablePackages, setAvailablePackages] = useState<any[]>([]);
  const [isLoadingOfferings, setIsLoadingOfferings] = useState(false);

  const loadPremiumStatus = useCallback(async () => {
    try {
      setIsLoading(true);
      
      const info = await getCustomerInfo();
      setCustomerInfo(info);
      
      const hasPro = checkEntitlement(info);
      setIsPremium(hasPro);
      
      if (hasPro) {
        const status: PremiumStatus = {
          isPremium: true,
          tier: 'premium_lifetime',
          purchaseDate: info.latestExpirationDate || new Date().toISOString(),
          transactionId: info.originalAppUserId,
          currency: 'BRL',
        };
        
        setPremiumStatus(status);
        await AsyncStorage.setItem(STORAGE_KEYS.PREMIUM_STATUS, JSON.stringify(status));
      } else {
        const storedStatus = await AsyncStorage.getItem(STORAGE_KEYS.PREMIUM_STATUS);
        if (storedStatus) {
          try {
            const status: PremiumStatus = JSON.parse(storedStatus);
            setPremiumStatus(status);
            setIsPremium(status.isPremium);
          } catch {
            setPremiumStatus(null);
          }
        }
      }
    } catch (error) {
      console.error('Failed to load premium status:', error);
      analytics.track('data_validation_error', { error: String(error) });
      
      const storedStatus = await AsyncStorage.getItem(STORAGE_KEYS.PREMIUM_STATUS);
      if (storedStatus) {
        try {
          const status: PremiumStatus = JSON.parse(storedStatus);
          setPremiumStatus(status);
          setIsPremium(status.isPremium);
        } catch {
          setPremiumStatus(null);
        }
      }
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    loadPremiumStatus();
  }, [loadPremiumStatus]);

  const loadOfferings = useCallback(async () => {
    try {
      setIsLoadingOfferings(true);
      const offerings = await getOfferings();
      
      if (offerings) {
        setAvailablePackages(offerings.availablePackages);
        console.log(`✅ Loaded ${offerings.availablePackages.length} packages`);
      }
    } catch (error) {
      console.error('Failed to load offerings:', error);
    } finally {
      setIsLoadingOfferings(false);
    }
  }, []);

  useEffect(() => {
    loadOfferings();
  }, [loadOfferings]);

  const checkPremiumStatus = async () => {
    await loadPremiumStatus();
  };

  const purchasePremium = async (packageIdentifier?: string): Promise<boolean> => {
    try {
      console.log('💎 Processing premium purchase...');
      
      let packageToPurchase = availablePackages[0];
      
      if (packageIdentifier) {
        const foundPackage = availablePackages.find(
          p => p.identifier === packageIdentifier || p.product.identifier === packageIdentifier
        );
        if (foundPackage) {
          packageToPurchase = foundPackage;
        }
      }
      
      if (!packageToPurchase) {
        Alert.alert(
          'Erro',
          'Nenhum produto disponível. Por favor, tente novamente mais tarde.',
          [{ text: 'OK', style: 'cancel' }]
        );
        return false;
      }

      const result = await purchasePackage(packageToPurchase);
      
      if (result.cancelled) {
        console.log('Purchase cancelled by user');
        return false;
      }
      
      if (!result.success) {
        Alert.alert(
          'Erro na Compra',
          result.error || 'Não foi possível completar a compra. Por favor, tente novamente.',
          [{ text: 'OK', style: 'cancel' }]
        );
        return false;
      }

      if (result.customerInfo) {
        setCustomerInfo(result.customerInfo);
        const hasPro = checkEntitlement(result.customerInfo);
        setIsPremium(hasPro);

        if (hasPro) {
          const premiumStatus: PremiumStatus = {
            isPremium: true,
            tier: 'premium_lifetime',
            purchaseDate: new Date().toISOString(),
            transactionId: result.productIdentifier,
            currency: 'BRL',
          };

          await AsyncStorage.setItem(STORAGE_KEYS.PREMIUM_STATUS, JSON.stringify(premiumStatus));
          setPremiumStatus(premiumStatus);
          
          if (Platform.OS !== 'web') {
            await Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
          }

          analytics.track('paywall_converted', {
            transaction_id: result.productIdentifier,
            product_id: packageToPurchase.product.identifier,
          });

          Alert.alert(
            '🎉 Bem-vindo ao Premium!',
            'Você agora tem acesso vitalício a todos os recursos premium!',
            [{ text: 'Começar a Explorar!', style: 'default' }]
          );

          setIsUpgradeModalVisible(false);
          return true;
        }
      }

      return false;
    } catch (error) {
      console.error('Purchase error:', error);
      analytics.track('data_validation_error', { error: String(error) });
      
      Alert.alert(
        'Erro na Compra',
        'Não foi possível completar a compra. Por favor, tente novamente.',
        [{ text: 'OK', style: 'cancel' }]
      );

      return false;
    }
  };

  const restorePurchase = async (): Promise<boolean> => {
    try {
      console.log('💎 Attempting to restore purchase...');
      analytics.track('restore_purchases_attempted', {});

      const result = await rcRestorePurchases();
      
      if (!result.success) {
        Alert.alert(
          'Erro ao Restaurar',
          result.error || 'Não foi possível restaurar a compra. Por favor, tente novamente.',
          [{ text: 'OK', style: 'cancel' }]
        );
        return false;
      }

      if (result.customerInfo) {
        setCustomerInfo(result.customerInfo);
      }
      setIsPremium(result.isPro || false);

      if (result.isPro && result.customerInfo) {
        const status: PremiumStatus = {
          isPremium: true,
          tier: 'premium_lifetime',
          purchaseDate: result.customerInfo.latestExpirationDate || new Date().toISOString(),
          transactionId: result.customerInfo.originalAppUserId,
          currency: 'BRL',
        };
        
        setPremiumStatus(status);
        await AsyncStorage.setItem(STORAGE_KEYS.PREMIUM_STATUS, JSON.stringify(status));

        if (Platform.OS !== 'web') {
          await Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
        }

        analytics.track('restore_purchases_attempted', {
          success: true,
        });

        Alert.alert(
          '✅ Premium Restaurado!',
          'Seu acesso premium foi restaurado com sucesso.',
          [{ text: 'Ótimo!', style: 'default' }]
        );

        return true;
      } else {
        analytics.track('restore_purchases_attempted', { 
          success: false,
          reason: 'no_purchase_found' 
        });
        
        Alert.alert(
          'Nenhuma Compra Encontrada',
          'Não encontramos nenhuma compra premium associada a esta conta.',
          [{ text: 'OK', style: 'cancel' }]
        );

        return false;
      }
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

  const showUpgradeModal = useCallback(() => {
    setIsUpgradeModalVisible(true);
    analytics.track('paywall_shown', {});
  }, []);

  const hideUpgradeModal = useCallback(() => {
    setIsUpgradeModalVisible(false);
    setFeatureLockReason(undefined);
    analytics.track('paywall_dismissed', {});
  }, []);

  return (
    <PremiumContext.Provider
      value={{
        isPremium,
        premiumStatus,
        customerInfo,
        isLoading,
        purchasePremium,
        restorePurchase,
        checkPremiumStatus,
        showUpgradeModal,
        hideUpgradeModal,
        isUpgradeModalVisible,
        featureLockReason,
        availablePackages,
        isLoadingOfferings,
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
