import { useEffect, useRef } from 'react';
import { View, StyleSheet, Animated, Easing, Dimensions } from 'react-native';

const { width: SCREEN_WIDTH, height: SCREEN_HEIGHT } = Dimensions.get('window');
const PARTICLE_COUNT = 50;

interface Particle {
  x: Animated.Value;
  y: Animated.Value;
  rotation: Animated.Value;
  color: string;
  size: number;
  velocity: number;
  amplitude: number;
}

export function ConfettiAnimation() {
  const particlesRef = useRef<Particle[]>([]);

  useEffect(() => {
    const colors = [
      '#FFD700',
      '#FFA500',
      '#FF6B6B',
      '#4ECDC4',
      '#45B7D1',
      '#96CEB4',
      '#FFEAA7',
      '#DFE6E9',
      '#74B9FF',
      '#A29BFE',
    ];

    const particles: Particle[] = [];

    for (let i = 0; i < PARTICLE_COUNT; i++) {
      const x = new Animated.Value(Math.random() * SCREEN_WIDTH);
      const y = new Animated.Value(-50);
      const rotation = new Animated.Value(0);
      
      particles.push({
        x,
        y,
        rotation,
        color: colors[Math.floor(Math.random() * colors.length)],
        size: 8 + Math.random() * 8,
        velocity: 0.8 + Math.random() * 0.6,
        amplitude: 30 + Math.random() * 40,
      });
    }

    particlesRef.current = particles;

    const animations = particles.map((particle, index) => {
      const delay = index * 30;
      const duration = 3000 + Math.random() * 2000;

      const fallAnimation = Animated.timing(particle.y, {
        toValue: SCREEN_HEIGHT + 100,
        duration,
        delay,
        easing: Easing.cubic,
        useNativeDriver: true,
      });

      const swingAnimation = Animated.loop(
        Animated.sequence([
          Animated.timing(particle.x, {
            toValue: (particle.x as unknown as { _value: number })._value + particle.amplitude,
            duration: 1000,
            easing: Easing.inOut(Easing.ease),
            useNativeDriver: true,
          }),
          Animated.timing(particle.x, {
            toValue: (particle.x as unknown as { _value: number })._value - particle.amplitude,
            duration: 1000,
            easing: Easing.inOut(Easing.ease),
            useNativeDriver: true,
          }),
        ])
      );

      const rotationAnimation = Animated.loop(
        Animated.timing(particle.rotation, {
          toValue: 360,
          duration: 2000 + Math.random() * 1000,
          easing: Easing.linear,
          useNativeDriver: true,
        })
      );

      return { fall: fallAnimation, swing: swingAnimation, rotation: rotationAnimation };
    });

    animations.forEach(({ fall, swing, rotation }) => {
      fall.start();
      swing.start();
      rotation.start();
    });

    return () => {
      animations.forEach(({ fall, swing, rotation }) => {
        fall.stop();
        swing.stop();
        rotation.stop();
      });
    };
  }, []);

  return (
    <View style={styles.container} pointerEvents="none">
      {particlesRef.current.map((particle, index) => (
        <Animated.View
          key={index}
          style={[
            styles.particle,
            {
              backgroundColor: particle.color,
              width: particle.size,
              height: particle.size,
              transform: [
                { translateX: particle.x },
                { translateY: particle.y },
                {
                  rotate: particle.rotation.interpolate({
                    inputRange: [0, 360],
                    outputRange: ['0deg', '360deg'],
                  }),
                },
              ],
            },
          ]}
        />
      ))}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    ...StyleSheet.absoluteFillObject,
    zIndex: 1000,
    overflow: 'hidden',
  },
  particle: {
    position: 'absolute',
    borderRadius: 2,
  },
});
