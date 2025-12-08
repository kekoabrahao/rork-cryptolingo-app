import { ReactNode } from "react";
import { View, Text, TouchableOpacity, StyleSheet } from "react-native";
import { LinearGradient } from "expo-linear-gradient";
import { Crown, Lock } from "lucide-react-native";
import { useSubscription } from "@/contexts/SubscriptionContext";
import { PaywallConfig } from "@/types/subscription";
import Colors from "@/constants/colors";
import { analytics } from "@/utils/analytics";

interface PremiumFeatureGateProps {
  children: ReactNode;
  feature?: keyof typeof import("@/types/subscription").PREMIUM_FEATURES;
  paywallConfig: PaywallConfig;
  fallback?: ReactNode;
  showLock?: boolean;
}

export function PremiumFeatureGate({
  children,
  feature,
  paywallConfig,
  fallback,
  showLock = true,
}: PremiumFeatureGateProps) {
  const { isPremium, checkFeatureAccess, showPaywall } = useSubscription();

  const hasAccess = feature ? checkFeatureAccess(feature) : isPremium;

  const handleUpgradePress = () => {
    analytics.track('premium_feature_attempted', {
      feature: feature || 'general',
      trigger: paywallConfig.trigger,
    });
    showPaywall(paywallConfig);
  };

  if (hasAccess) {
    return <>{children}</>;
  }

  if (fallback) {
    return <>{fallback}</>;
  }

  if (!showLock) {
    return null;
  }

  return (
    <View style={styles.container}>
      <View style={styles.overlay}>
        <LinearGradient
          colors={['rgba(0, 0, 0, 0.7)', 'rgba(0, 0, 0, 0.9)']}
          style={styles.gradient}
        >
          <View style={styles.content}>
            <View style={styles.iconContainer}>
              <Crown size={40} color="#FFD700" fill="#FFD700" />
              <Lock size={20} color="#FFFFFF" style={styles.lockIcon} />
            </View>
            <Text style={styles.title}>Premium Feature</Text>
            <Text style={styles.description}>{paywallConfig.subtitle}</Text>
            <TouchableOpacity
              style={styles.upgradeButton}
              onPress={handleUpgradePress}
              activeOpacity={0.8}
            >
              <LinearGradient
                colors={['#6366F1', '#8B5CF6']}
                start={{ x: 0, y: 0 }}
                end={{ x: 1, y: 0 }}
                style={styles.upgradeGradient}
              >
                <Crown size={20} color="#FFFFFF" />
                <Text style={styles.upgradeText}>Upgrade to Premium</Text>
              </LinearGradient>
            </TouchableOpacity>
          </View>
        </LinearGradient>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    position: 'relative',
    minHeight: 200,
  },
  overlay: {
    ...StyleSheet.absoluteFillObject,
    zIndex: 10,
    borderRadius: 16,
    overflow: 'hidden',
  },
  gradient: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    padding: 24,
  },
  content: {
    alignItems: 'center',
    maxWidth: 300,
  },
  iconContainer: {
    position: 'relative',
    marginBottom: 16,
  },
  lockIcon: {
    position: 'absolute',
    bottom: -4,
    right: -4,
    backgroundColor: Colors.primary,
    borderRadius: 10,
    padding: 2,
  },
  title: {
    fontSize: 24,
    fontWeight: '700' as const,
    color: '#FFFFFF',
    marginBottom: 8,
    textAlign: 'center',
  },
  description: {
    fontSize: 14,
    color: 'rgba(255, 255, 255, 0.8)',
    textAlign: 'center',
    marginBottom: 20,
    lineHeight: 20,
  },
  upgradeButton: {
    borderRadius: 12,
    overflow: 'hidden',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 6,
  },
  upgradeGradient: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    paddingVertical: 14,
    paddingHorizontal: 24,
  },
  upgradeText: {
    fontSize: 16,
    fontWeight: '700' as const,
    color: '#FFFFFF',
  },
});
