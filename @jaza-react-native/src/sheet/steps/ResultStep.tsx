import { useEffect, useRef } from 'react';
import {
  Animated,
  Pressable,
  StyleSheet,
  Text,
  View,
} from 'react-native';
import { Icon } from '../../components/Icon.js';
import { useJaza } from '../../provider/JazaContext.js';
import { formatCredits } from '../../utils/helpers.js';

export function ResultStep() {
  const {
    theme,
    resultPhase,
    selectedBundle,
    deposit,
    failureReason,
    depositError,
    closeTopUp,
    retryPayment,
  } = useJaza();
  const { colors, spacing, radius } = theme;
  const scale = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    if (resultPhase === 'success') {
      scale.setValue(0);
      Animated.spring(scale, {
        toValue: 1,
        useNativeDriver: true,
        friction: 6,
      }).start();
    }
  }, [resultPhase, scale]);

  const styles = StyleSheet.create({
    container: {
      alignItems: 'center',
      paddingVertical: spacing.xl,
    },
    spinnerWrap: {
      width: 64,
      height: 64,
      marginBottom: spacing.lg,
      alignItems: 'center',
      justifyContent: 'center',
    },
    title: {
      color: colors.onSurface,
      fontSize: 20,
      fontWeight: '600',
      textAlign: 'center',
    },
    subtitle: {
      color: colors.onSurfaceVariant,
      fontSize: 14,
      marginTop: spacing.xs,
      textAlign: 'center',
    },
    successIcon: {
      width: 80,
      height: 80,
      borderRadius: radius.full,
      backgroundColor: `${colors.success}20`,
      alignItems: 'center',
      justifyContent: 'center',
      marginBottom: spacing.lg,
    },
    failIcon: {
      width: 80,
      height: 80,
      borderRadius: radius.full,
      backgroundColor: `${colors.error}20`,
      alignItems: 'center',
      justifyContent: 'center',
      marginBottom: spacing.lg,
    },
    doneBtn: {
      backgroundColor: colors.surfaceContainerHigh,
      borderRadius: radius.full,
      paddingHorizontal: spacing.xl,
      paddingVertical: spacing.sm,
      marginTop: spacing.lg,
    },
    doneText: {
      color: colors.onSurface,
      fontSize: 12,
      fontWeight: '500',
      letterSpacing: 0.5,
    },
    retryBtn: {
      backgroundColor: colors.primaryContainer,
      borderRadius: radius.full,
      paddingHorizontal: spacing.xl,
      paddingVertical: spacing.sm,
      marginTop: spacing.md,
    },
    retryText: {
      color: colors.onPrimaryContainer,
      fontSize: 14,
      fontWeight: '600',
    },
  });

  if (resultPhase === 'loading') {
    return (
      <View style={styles.container}>
        <View style={styles.spinnerWrap}>
          <Icon name="lock" size={28} color={colors.primary} />
        </View>
        <Text style={styles.title}>Processing payment...</Text>
        <Text style={styles.subtitle}>
          Please authorize on your device
        </Text>
      </View>
    );
  }

  if (resultPhase === 'failure') {
    return (
      <View style={styles.container}>
        <View style={styles.failIcon}>
          <Icon name="error-outline" size={48} color={colors.error} />
        </View>
        <Text style={styles.title}>Payment failed</Text>
        <Text style={styles.subtitle}>
          {failureReason ?? depositError ?? 'Something went wrong'}
        </Text>
        <Pressable style={styles.retryBtn} onPress={retryPayment}>
          <Text style={styles.retryText}>Try again</Text>
        </Pressable>
        <Pressable style={styles.doneBtn} onPress={closeTopUp}>
          <Text style={styles.doneText}>Dismiss</Text>
        </Pressable>
      </View>
    );
  }

  const credits = deposit?.credits ?? selectedBundle?.credits ?? 0;

  return (
    <View style={styles.container}>
      <Animated.View style={[styles.successIcon, { transform: [{ scale }] }]}>
        <Icon name="check-circle" size={48} color={colors.success} />
      </Animated.View>
      <Text style={styles.title}>Top-up Successful</Text>
      <Text style={styles.subtitle}>
        {formatCredits(credits)} credits have been added to your balance.
      </Text>
      <Pressable style={styles.doneBtn} onPress={closeTopUp}>
        <Text style={styles.doneText}>Done</Text>
      </Pressable>
    </View>
  );
}
