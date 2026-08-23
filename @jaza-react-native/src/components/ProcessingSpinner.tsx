import { useEffect, useRef } from 'react';
import { Animated, Easing, StyleSheet, View } from 'react-native';
import { Icon } from './Icon.js';
import type { JazaTheme } from '../theme/tokens.js';

type ProcessingSpinnerProps = {
  theme: JazaTheme;
  size?: number;
};

/**
 * Stitch-style ring spinner with centered lock icon (processing / polling).
 */
export function ProcessingSpinner({
  theme,
  size = 64,
}: ProcessingSpinnerProps) {
  const { colors } = theme;
  const spin = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    const loop = Animated.loop(
      Animated.timing(spin, {
        toValue: 1,
        duration: 900,
        easing: Easing.linear,
        useNativeDriver: true,
      }),
    );
    loop.start();
    return () => loop.stop();
  }, [spin]);

  const rotate = spin.interpolate({
    inputRange: [0, 1],
    outputRange: ['0deg', '360deg'],
  });

  const ring = size;
  const stroke = 4;
  const styles = StyleSheet.create({
    wrap: {
      width: ring,
      height: ring,
      alignItems: 'center',
      justifyContent: 'center',
    },
    ring: {
      position: 'absolute',
      width: ring,
      height: ring,
      borderRadius: ring / 2,
      borderWidth: stroke,
      borderColor: colors.surfaceContainerHighest,
      borderTopColor: colors.primary,
    },
    icon: {
      position: 'absolute',
      alignItems: 'center',
      justifyContent: 'center',
    },
  });

  return (
    <View style={styles.wrap}>
      <Animated.View style={[styles.ring, { transform: [{ rotate }] }]} />
      <View style={styles.icon}>
        <Icon name="lock" size={Math.round(size * 0.38)} color={colors.primary} />
      </View>
    </View>
  );
}
