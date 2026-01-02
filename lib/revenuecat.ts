import Purchases, { LOG_LEVEL, CustomerInfo } from 'react-native-purchases';

const API_KEY = 'test_mlkMKpRpuaOkXmaJBNxrnzypjBb';
const ENTITLEMENT_ID = 'pro';

export const RevenueCatConfig = {
  apiKey: API_KEY,
  entitlementId: ENTITLEMENT_ID,
};

export async function configureRevenueCat(userId?: string) {
  try {
    console.log('🐱 Configuring RevenueCat...');
    
    Purchases.setLogLevel(LOG_LEVEL.DEBUG);
    
    Purchases.configure({
      apiKey: API_KEY,
      appUserID: userId,
    });

    if (userId) {
      await Purchases.logIn(userId);
      console.log('✅ RevenueCat configured with user:', userId);
    } else {
      console.log('✅ RevenueCat configured anonymously');
    }

    const customerInfo = await Purchases.getCustomerInfo();
    console.log('📊 Customer info:', {
      activeSubscriptions: customerInfo.activeSubscriptions,
      entitlements: Object.keys(customerInfo.entitlements.active),
    });

    return customerInfo;
  } catch (error) {
    console.error('❌ RevenueCat configuration error:', error);
    throw error;
  }
}

export async function getOfferings() {
  try {
    const offerings = await Purchases.getOfferings();
    
    if (offerings.current !== null && offerings.current.availablePackages.length !== 0) {
      console.log('📦 Available packages:', offerings.current.availablePackages.map(p => ({
        identifier: p.identifier,
        product: {
          identifier: p.product.identifier,
          price: p.product.priceString,
          title: p.product.title,
        },
      })));
      
      return offerings.current;
    }
    
    console.warn('⚠️ No offerings available');
    return null;
  } catch (error) {
    console.error('❌ Error fetching offerings:', error);
    return null;
  }
}

export async function purchasePackage(packageToPurchase: any) {
  try {
    console.log('💳 Attempting purchase:', packageToPurchase.identifier);
    
    const { customerInfo, productIdentifier } = await Purchases.purchasePackage(packageToPurchase);
    
    console.log('✅ Purchase successful:', {
      productIdentifier,
      entitlements: Object.keys(customerInfo.entitlements.active),
    });
    
    return {
      success: true,
      customerInfo,
      productIdentifier,
    };
  } catch (error: any) {
    console.error('❌ Purchase error:', error);
    
    if (error.userCancelled) {
      console.log('ℹ️ User cancelled purchase');
      return {
        success: false,
        cancelled: true,
        error: 'User cancelled',
      };
    }
    
    return {
      success: false,
      cancelled: false,
      error: error.message || 'Purchase failed',
    };
  }
}

export async function restorePurchases() {
  try {
    console.log('🔄 Restoring purchases...');
    
    const customerInfo = await Purchases.restorePurchases();
    
    const isPro = customerInfo.entitlements.active[ENTITLEMENT_ID] !== undefined;
    
    console.log('✅ Restore complete. Pro status:', isPro);
    
    return {
      success: true,
      customerInfo,
      isPro,
    };
  } catch (error: any) {
    console.error('❌ Restore error:', error);
    return {
      success: false,
      error: error.message || 'Restore failed',
    };
  }
}

export async function getCustomerInfo(): Promise<CustomerInfo> {
  return await Purchases.getCustomerInfo();
}

export function checkEntitlement(customerInfo: CustomerInfo): boolean {
  return customerInfo.entitlements.active[ENTITLEMENT_ID] !== undefined;
}

export async function logInUser(userId: string) {
  try {
    const { customerInfo } = await Purchases.logIn(userId);
    console.log('✅ User logged in to RevenueCat:', userId);
    return customerInfo;
  } catch (error) {
    console.error('❌ RevenueCat login error:', error);
    throw error;
  }
}

export async function logOutUser() {
  try {
    const customerInfo = await Purchases.logOut();
    console.log('✅ User logged out from RevenueCat');
    return customerInfo;
  } catch (error) {
    console.error('❌ RevenueCat logout error:', error);
    throw error;
  }
}
