import React, { useEffect, useRef } from 'react';
import { View, Text, StyleSheet, Animated } from 'react-native';
import Colors from '@/constants/colors';

interface ModuleProgressBarProps {
  moduleName: string;
  completedLessons: number;
  totalLessons: number;
  animate?: boolean;
}

export function ModuleProgressBar({
  moduleName,
  completedLessons,
  totalLessons,
  animate = true,
}: ModuleProgressBarProps) {
  const progressAnim = useRef(new Animated.Value(0)).current;
  const percentage = totalLessons > 0 ? (completedLessons / totalLessons) * 100 : 0;

  useEffect(() => {
    if (animate) {
      Animated.timing(progressAnim, {
        toValue: percentage,
        duration: 800,
        useNativeDriver: false,
      }).start();
    } else {
      progressAnim.setValue(percentage);
    }
  }, [percentage, animate, progressAnim]);

  const progressWidth = progressAnim.interpolate({
    inputRange: [0, 100],
    outputRange: ['0%', '100%'],
    extrapolate: 'clamp',
  });

  const getProgressColor = () => {
    if (percentage === 100) return Colors.success;
    if (percentage >= 50) return '#FFA500';
    return Colors.borderLight;
  };

  const getBackgroundColor = () => {
    if (percentage === 100) return Colors.success + '20';
    if (percentage >= 50) return '#FFA50020';
    return Colors.borderLight + '20';
  };

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.moduleName}>{moduleName}</Text>
        <Text style={styles.stats}>
          {completedLessons}/{totalLessons}
        </Text>
      </View>
      <View style={[styles.progressBarContainer, { backgroundColor: getBackgroundColor() }]}>
        <Animated.View
          style={[
            styles.progressBarFill,
            {
              width: progressWidth,
              backgroundColor: getProgressColor(),
            },
          ]}
        />
      </View>
      <Text style={styles.percentage}>{Math.round(percentage)}% Complete</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    marginBottom: 20,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 8,
  },
  moduleName: {
    fontSize: 16,
    fontWeight: '600' as const,
    color: Colors.text,
    flex: 1,
  },
  stats: {
    fontSize: 14,
    fontWeight: '600' as const,
    color: Colors.textSecondary,
  },
  progressBarContainer: {
    height: 12,
    borderRadius: 6,
    overflow: 'hidden',
    marginBottom: 6,
  },
  progressBarFill: {
    height: '100%',
    borderRadius: 6,
  },
  percentage: {
    fontSize: 12,
    color: Colors.textSecondary,
    fontWeight: '500' as const,
  },
});
