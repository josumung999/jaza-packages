import { useCallback, useEffect, useMemo, useRef } from 'react';
import { Modal, Pressable, StyleSheet, View } from 'react-native';
import { GestureHandlerRootView } from 'react-native-gesture-handler';
import BottomSheet, {
  BottomSheetBackdrop,
  BottomSheetScrollView,
  type BottomSheetBackdropProps,
} from '@gorhom/bottom-sheet';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { Icon } from '../components/Icon.js';
import { useJaza } from '../provider/JazaContext.js';
import { OfferStep } from './steps/OfferStep.js';
import { PaymentStep } from './steps/PaymentStep.js';
import { ResultStep } from './steps/ResultStep.js';

/**
 * RN Modal hosts the sheet so it reliably appears above Expo Router /
 * react-native-screens native stacks (BottomSheetModal.present() often no-ops).
 */
export function TopUpBottomSheet() {
  const { theme, sheetOpen, step, resultPhase, closeTopUp } = useJaza();
  const { colors, spacing, radius } = theme;
  const insets = useSafeAreaInsets();
  const ref = useRef<BottomSheet>(null);

  /** Bundle picker opens tall so offers + CTA fit; payment/polling stay compact. */
  const snapPoints = useMemo(() => {
    if (step === 'offer') return ['88%'];
    return ['48%'];
  }, [step]);

  const paymentInFlight =
    step === 'processing' && resultPhase === 'loading';
  const canDismiss = !paymentInFlight;

  useEffect(() => {
    if (!sheetOpen) return;
    // Remount-friendly snap when step changes (offer expandable vs capped steps).
    requestAnimationFrame(() => {
      ref.current?.snapToIndex(0);
    });
  }, [step, sheetOpen]);

  const requestClose = useCallback(() => {
    if (!canDismiss) return;
    closeTopUp();
  }, [canDismiss, closeTopUp]);

  const renderBackdrop = useCallback(
    (props: BottomSheetBackdropProps) => (
      <BottomSheetBackdrop
        {...props}
        disappearsOnIndex={-1}
        appearsOnIndex={0}
        opacity={0.6}
        pressBehavior="none"
      />
    ),
    [],
  );

  const styles = StyleSheet.create({
    root: {
      flex: 1,
    },
    handle: {
      width: 48,
      height: 4,
      borderRadius: 2,
      backgroundColor: colors.surfaceContainerHighest,
      alignSelf: 'center',
      marginTop: spacing.sm,
      marginBottom: spacing.sm,
    },
    header: {
      flexDirection: 'row',
      justifyContent: 'flex-end',
      paddingHorizontal: spacing.gutter,
      marginBottom: spacing.sm,
    },
    closeBtn: {
      width: 36,
      height: 36,
      borderRadius: radius.full,
      backgroundColor: colors.surfaceContainerHigh,
      alignItems: 'center',
      justifyContent: 'center',
      opacity: canDismiss ? 1 : 0.35,
    },
    content: {
      paddingHorizontal: spacing.gutter,
      paddingBottom: insets.bottom + spacing.xl,
    },
  });

  return (
    <Modal
      visible={sheetOpen}
      transparent
      animationType="fade"
      statusBarTranslucent
      onRequestClose={requestClose}
    >
      {/* Android: GH root must wrap sheets inside RN Modal */}
      <GestureHandlerRootView style={styles.root}>
        <BottomSheet
          key={step === 'offer' ? 'offer' : 'compact'}
          ref={ref}
          index={0}
          snapPoints={snapPoints}
          enablePanDownToClose={false}
          enableDynamicSizing={false}
          enableOverDrag={false}
          onClose={requestClose}
          backdropComponent={renderBackdrop}
          keyboardBehavior="interactive"
          keyboardBlurBehavior="restore"
          android_keyboardInputMode="adjustResize"
          backgroundStyle={{ backgroundColor: colors.surface }}
          handleComponent={() => <View style={styles.handle} />}
        >
          <View style={styles.header}>
            <Pressable
              style={styles.closeBtn}
              onPress={requestClose}
              disabled={!canDismiss}
              accessibilityRole="button"
              accessibilityLabel="Close"
              accessibilityState={{ disabled: !canDismiss }}
            >
              <Icon
                name="close"
                size={20}
                color={colors.onSurfaceVariant}
              />
            </Pressable>
          </View>
          <BottomSheetScrollView
            keyboardShouldPersistTaps="handled"
            contentContainerStyle={styles.content}
          >
            {step === 'offer' ? <OfferStep /> : null}
            {step === 'payment' ? <PaymentStep /> : null}
            {step === 'processing' ? <ResultStep /> : null}
          </BottomSheetScrollView>
        </BottomSheet>
      </GestureHandlerRootView>
    </Modal>
  );
}
