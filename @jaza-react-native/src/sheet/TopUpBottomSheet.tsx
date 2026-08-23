import { useCallback, useEffect, useMemo, useRef } from 'react';
import { StyleSheet, View } from 'react-native';
import {
  BottomSheetModal,
  BottomSheetBackdrop,
  BottomSheetScrollView,
  type BottomSheetBackdropProps,
} from '@gorhom/bottom-sheet';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useJaza } from '../provider/JazaContext.js';
import { OfferStep } from './steps/OfferStep.js';
import { PaymentStep } from './steps/PaymentStep.js';
import { ResultStep } from './steps/ResultStep.js';

export function TopUpBottomSheet() {
  const { theme, sheetOpen, step, closeTopUp } = useJaza();
  const { colors, spacing } = theme;
  const insets = useSafeAreaInsets();
  const ref = useRef<BottomSheetModal>(null);
  const snapPoints = useMemo(() => ['90%'], []);

  useEffect(() => {
    if (sheetOpen) {
      ref.current?.present();
    } else {
      ref.current?.dismiss();
    }
  }, [sheetOpen]);

  const renderBackdrop = useCallback(
    (props: BottomSheetBackdropProps) => (
      <BottomSheetBackdrop
        {...props}
        disappearsOnIndex={-1}
        appearsOnIndex={0}
        opacity={0.6}
        pressBehavior="close"
      />
    ),
    [],
  );

  const styles = StyleSheet.create({
    handle: {
      width: 48,
      height: 4,
      borderRadius: 2,
      backgroundColor: colors.surfaceContainerHighest,
      alignSelf: 'center',
      marginTop: spacing.sm,
      marginBottom: spacing.md,
    },
    content: {
      paddingHorizontal: spacing.gutter,
      paddingBottom: insets.bottom + spacing.xl,
    },
  });

  return (
    <BottomSheetModal
      ref={ref}
      snapPoints={snapPoints}
      enablePanDownToClose
      onDismiss={closeTopUp}
      backdropComponent={renderBackdrop}
      keyboardBehavior="interactive"
      keyboardBlurBehavior="restore"
      android_keyboardInputMode="adjustResize"
      backgroundStyle={{ backgroundColor: colors.surface }}
      handleComponent={() => <View style={styles.handle} />}
    >
      <BottomSheetScrollView
        keyboardShouldPersistTaps="handled"
        contentContainerStyle={styles.content}
      >
        {step === 'offer' ? <OfferStep /> : null}
        {step === 'payment' ? <PaymentStep /> : null}
        {step === 'processing' ? <ResultStep /> : null}
      </BottomSheetScrollView>
    </BottomSheetModal>
  );
}
