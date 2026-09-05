import { useState, type ReactNode } from 'react';
import {
  ActivityIndicator,
  Pressable,
  StyleSheet,
  Text,
  View,
  type ViewStyle,
} from 'react-native';
import { useJaza } from '../provider/JazaContext.js';

export type JazaActionButtonRenderProps = {
  onPress: () => void;
  canAfford: boolean;
  cost: number | null;
  balanceCredits: number | null;
  loading: boolean;
  disabled: boolean;
  label: string;
  error: string | null;
};

export type JazaActionButtonProps = {
  featureCode: string;
  label?: string;
  onPress: () => void | Promise<void>;
  style?: ViewStyle;
  children?: (props: JazaActionButtonRenderProps) => ReactNode;
};

/**
 * Gate-only control: opens paywall when the wallet cannot afford `featureCode`.
 * Never calls consume — host `onPress` must debit via the secret-key BFF.
 */
export function JazaActionButton({
  featureCode,
  label,
  onPress,
  style,
  children,
}: JazaActionButtonProps) {
  const {
    theme,
    balanceCredits,
    getFeatureCost,
    canAfford,
    openPaywall,
  } = useJaza();
  const { colors, spacing, radius } = theme;
  const [loading, setLoading] = useState(false);
  const [actionError, setActionError] = useState<string | null>(null);

  const cost = getFeatureCost(featureCode);
  const known = cost !== null;
  const afford = known ? canAfford(featureCode) : false;
  const displayLabel = label ?? featureCode;
  const error = !known
    ? `Unknown feature: ${featureCode}`
    : actionError;

  const styles = StyleSheet.create({
    button: {
      backgroundColor: colors.surfaceContainerHigh,
      borderRadius: radius.full,
      paddingVertical: spacing.md,
      paddingHorizontal: spacing.lg,
      flexDirection: 'row',
      alignItems: 'center',
      justifyContent: 'center',
      gap: spacing.sm,
      opacity: !known ? 0.5 : 1,
      ...style,
    },
    pressed: { opacity: 0.9, transform: [{ scale: 0.98 }] },
    label: {
      color: colors.onSurface,
      fontSize: 16,
      fontWeight: '600',
    },
    meta: {
      color: colors.onSurfaceVariant,
      fontSize: 13,
    },
    error: {
      color: colors.error,
      fontSize: 12,
      marginTop: spacing.xs,
      textAlign: 'center',
    },
  });

  const handlePress = () => {
    void (async () => {
      setActionError(null);
      if (!known) return;
      if (!afford) {
        await openPaywall({ featureCode });
        return;
      }
      setLoading(true);
      try {
        await onPress();
      } catch (err) {
        setActionError(
          err instanceof Error ? err.message : 'Action failed',
        );
      } finally {
        setLoading(false);
      }
    })();
  };

  const renderProps: JazaActionButtonRenderProps = {
    onPress: handlePress,
    canAfford: afford,
    cost,
    balanceCredits,
    loading,
    disabled: loading || !known,
    label: displayLabel,
    error,
  };

  if (children) {
    return <>{children(renderProps)}</>;
  }

  return (
    <View>
      <Pressable
        style={({ pressed }) => [styles.button, pressed && styles.pressed]}
        onPress={handlePress}
        disabled={loading || !known}
      >
        {loading ? (
          <ActivityIndicator color={colors.primary} />
        ) : (
          <>
            <Text style={styles.label}>{displayLabel}</Text>
            {known ? (
              <Text style={styles.meta}>{cost} credits</Text>
            ) : null}
          </>
        )}
      </Pressable>
      {error ? <Text style={styles.error}>{error}</Text> : null}
    </View>
  );
}
