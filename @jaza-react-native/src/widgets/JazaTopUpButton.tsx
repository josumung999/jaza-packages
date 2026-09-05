import { useState, type ReactNode } from 'react';
import {
  ActivityIndicator,
  Pressable,
  StyleSheet,
  Text,
  View,
  type ViewStyle,
} from 'react-native';
import { Icon } from '../components/Icon.js';
import { useJaza } from '../provider/JazaContext.js';

export type JazaTopUpButtonRenderProps = {
  onPress: () => void;
  loading: boolean;
  disabled: boolean;
  label: string;
  error: string | null;
};

export type JazaTopUpButtonProps = {
  label?: string;
  style?: ViewStyle;
  children?: (props: JazaTopUpButtonRenderProps) => ReactNode;
};

export function JazaTopUpButton({
  label = 'Top up credits',
  style,
  children,
}: JazaTopUpButtonProps) {
  const { theme, openTopUp } = useJaza();
  const { colors, spacing, radius } = theme;
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const styles = StyleSheet.create({
    button: {
      backgroundColor: colors.primaryContainer,
      borderRadius: radius.full,
      paddingVertical: spacing.md,
      paddingHorizontal: spacing.lg,
      flexDirection: 'row',
      alignItems: 'center',
      justifyContent: 'center',
      gap: spacing.sm,
      ...style,
    },
    pressed: { opacity: 0.9, transform: [{ scale: 0.98 }] },
    label: {
      color: colors.onPrimaryContainer,
      fontSize: 16,
      fontWeight: '600',
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
      setError(null);
      setLoading(true);
      try {
        await openTopUp();
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Could not start top-up');
      } finally {
        setLoading(false);
      }
    })();
  };

  const renderProps: JazaTopUpButtonRenderProps = {
    onPress: handlePress,
    loading,
    disabled: loading,
    label,
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
        disabled={loading}
      >
        {loading ? (
          <ActivityIndicator color={colors.onPrimaryContainer} />
        ) : (
          <>
            <Text style={styles.label}>{label}</Text>
            <Icon
              name="arrow-forward"
              size={20}
              color={colors.onPrimaryContainer}
            />
          </>
        )}
      </Pressable>
      {error ? <Text style={styles.error}>{error}</Text> : null}
    </View>
  );
}
