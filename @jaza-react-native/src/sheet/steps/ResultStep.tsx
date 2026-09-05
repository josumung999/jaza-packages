import { useEffect, useRef } from 'react';
import {
  Animated,
  Pressable,
  StyleSheet,
  Text,
  View,
} from 'react-native';
import { Icon } from '../../components/Icon.js';
import { ProcessingSpinner } from '../../components/ProcessingSpinner.js';
import { t } from '../../i18n/t.js';
import { useJaza } from '../../provider/JazaContext.js';
import { formatCredits } from '../../utils/helpers.js';

export function ResultStep() {
  const {
    theme,
    locale,
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
      marginBottom: spacing.lg,
    },
    title: {
      color: colors.onSurface,
      fontSize: 20,
      fontWeight: '600',
      textAlign: 'center',
    },
    titlePulse: {
      opacity: 0.9,
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
          <ProcessingSpinner theme={theme} size={64} />
        </View>
        <Text style={[styles.title, styles.titlePulse]}>
          {t(locale, 'result.processing')}
        </Text>
        <Text style={styles.subtitle}>{t(locale, 'result.authorize')}</Text>
      </View>
    );
  }

  if (resultPhase === 'failure') {
    return (
      <View style={styles.container}>
        <View style={styles.failIcon}>
          <Icon name="error-outline" size={48} color={colors.error} />
        </View>
        <Text style={styles.title}>{t(locale, 'result.failed')}</Text>
        <Text style={styles.subtitle}>
          {failureReason ?? depositError ?? t(locale, 'result.genericError')}
        </Text>
        <Pressable style={styles.retryBtn} onPress={retryPayment}>
          <Text style={styles.retryText}>{t(locale, 'common.tryAgain')}</Text>
        </Pressable>
        <Pressable style={styles.doneBtn} onPress={closeTopUp}>
          <Text style={styles.doneText}>{t(locale, 'common.dismiss')}</Text>
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
      <Text style={styles.title}>{t(locale, 'result.success')}</Text>
      <Text style={styles.subtitle}>
        {t(locale, 'result.creditsAdded', {
          credits: formatCredits(credits),
        })}
      </Text>
      <Pressable style={styles.doneBtn} onPress={closeTopUp}>
        <Text style={styles.doneText}>{t(locale, 'common.done')}</Text>
      </Pressable>
    </View>
  );
}
