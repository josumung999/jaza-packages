import { useCallback, useMemo, useRef } from 'react';
import { Modal, StyleSheet, View } from 'react-native';
import { GestureHandlerRootView } from 'react-native-gesture-handler';
import BottomSheet, {
  BottomSheetBackdrop,
  BottomSheetScrollView,
  type BottomSheetBackdropProps,
} from '@gorhom/bottom-sheet';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useJaza } from '../provider/JazaContext.js';
import { OfferStep } from './steps/OfferStep.js';
import { PaymentStep } from './steps/PaymentStep.js';
import { ResultStep } from './steps/ResultStep.js';

/**
 * RN Modal hosts the sheet so it reliably appears above Expo Router /
 * react-native-screens native stacks (BottomSheetModal.present() often no-ops).
 */
export function TopUpBottomSheet() {
  const { theme, sheetOpen, step, closeTopUp } = useJaza();
  const { colors, spacing } = theme;
  const insets = useSafeAreaInsets();
  const ref = useRef<BottomSheet>(null);
  const snapPoints = useMemo(() => ['92%'], []);

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
      marginBottom: spacing.md,
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
      onRequestClose={closeTopUp}
    >
      {/* Android: GH root must wrap sheets inside RN Modal */}
      <GestureHandlerRootView style={styles.root}>
        <BottomSheet
          ref={ref}
          index={0}
          snapPoints={snapPoints}
          enablePanDownToClose
          onClose={closeTopUp}
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
        </BottomSheet>
      </GestureHandlerRootView>
    </Modal>
  );
}
