import React from 'react';
import { View, Text, TouchableOpacity, StyleSheet } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { Lock } from 'lucide-react-native';
import { usePremium } from '@/contexts/PremiumContext';

interface PremiumFeatureLockProps {
  feature: string;
  description?: string;
  compact?: boolean;
  children?: React.ReactNode;
}

export const PremiumFeatureLock: React.FC<PremiumFeatureLockProps> = ({
  feature,
  description,
  compact = false,
  children
}) => {
  const { isPremium, showUpgradeModal } = usePremium();

  // If user is premium, render children normally
  if (isPremium) {
    return <>{children}</>;
  }

  // Otherwise, show lock overlay
  if (compact) {
    return (
      <TouchableOpacity 
        style={styles.compactLock}
        onPress={() => showUpgradeModal()}
        activeOpacity={0.8}
      >
        <LinearGradient
          colors={['#7c3aed', '#a855f7']}
          start={{ x: 0, y: 0 }}
          end={{ x: 1, y: 1 }}
          style={styles.compactGradient}
        >
          <Lock size={16} color="#fff" />
          <Text style={styles.compactText}>Premium</Text>
        </LinearGradient>
      </TouchableOpacity>
    );
  }

  return (
    <View style={styles.container}>
      {/* Blurred background content */}
      <View style={styles.blurredContent}>
        {children}
      </View>

      {/* Lock overlay */}
      <TouchableOpacity 
        style={styles.overlay}
        onPress={() => showUpgradeModal()}
        activeOpacity={0.95}
      >
        <LinearGradient
          colors={['rgba(124, 58, 237, 0.95)', 'rgba(168, 85, 247, 0.95)']}
          start={{ x: 0, y: 0 }}
          end={{ x: 1, y: 1 }}
          style={styles.overlayGradient}
        >
          <View style={styles.lockIconContainer}>
            <Lock size={48} color="#fff" strokeWidth={2} />
          </View>
          
          <Text style={styles.featureTitle}>{feature}</Text>
          
          {description && (
            <Text style={styles.description}>{description}</Text>
          )}

          <View style={styles.upgradeButton}>
            <Text style={styles.upgradeButtonText}>
              Unlock with Premium
            </Text>
            <Text style={styles.priceText}>R$ 19,99 - One Time</Text>
          </View>
        </LinearGradient>
      </TouchableOpacity>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    position: 'relative',
    overflow: 'hidden',
    borderRadius: 12,
  },
  blurredContent: {
    opacity: 0.3,
    pointerEvents: 'none',
  },
  overlay: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
  },
  overlayGradient: {
    width: '100%',
    height: '100%',
    justifyContent: 'center',
    alignItems: 'center',
    borderRadius: 12,
  },
  lockIconContainer: {
    width: 80,
    height: 80,
    backgroundColor: 'rgba(255, 255, 255, 0.2)',
    borderRadius: 40,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 16,
  },
  featureTitle: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#fff',
    marginBottom: 8,
    textAlign: 'center',
  },
  description: {
    fontSize: 14,
    color: 'rgba(255, 255, 255, 0.9)',
    marginBottom: 24,
    textAlign: 'center',
    paddingHorizontal: 20,
  },
  upgradeButton: {
    backgroundColor: 'rgba(255, 255, 255, 0.2)',
    paddingHorizontal: 24,
    paddingVertical: 12,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.3)',
  },
  upgradeButtonText: {
    fontSize: 16,
    fontWeight: '600',
    color: '#fff',
    textAlign: 'center',
  },
  priceText: {
    fontSize: 12,
    color: 'rgba(255, 255, 255, 0.8)',
    marginTop: 4,
    textAlign: 'center',
  },
  compactLock: {
    borderRadius: 6,
    overflow: 'hidden',
  },
  compactGradient: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 12,
    paddingVertical: 6,
    gap: 6,
  },
  compactText: {
    fontSize: 12,
    fontWeight: '600',
    color: '#fff',
  },
});

export default PremiumFeatureLock;
