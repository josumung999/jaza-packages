'use client';

import { useEffect, useState } from 'react';
import { Drawer } from '@base-ui/react/drawer';
import { Icon } from '../components/Icon.js';
import { t } from '../i18n/t.js';
import { useJaza } from '../provider/JazaContext.js';
import { OfferStep } from './steps/OfferStep.js';
import { PaymentStep } from './steps/PaymentStep.js';
import { ResultStep } from './steps/ResultStep.js';

const MOBILE_MQ = '(max-width: 767px)';

function useSwipeDirection(): 'down' | 'right' {
  const [direction, setDirection] = useState<'down' | 'right'>(() => {
    if (typeof window === 'undefined') return 'right';
    return window.matchMedia(MOBILE_MQ).matches ? 'down' : 'right';
  });

  useEffect(() => {
    const mq = window.matchMedia(MOBILE_MQ);
    const sync = () => setDirection(mq.matches ? 'down' : 'right');
    sync();
    mq.addEventListener('change', sync);
    return () => mq.removeEventListener('change', sync);
  }, []);

  return direction;
}

/**
 * Responsive top-up drawer: bottom sheet on mobile, right panel on desktop.
 */
export function TopUpDrawer() {
  const { theme, sheetOpen, step, resultPhase, closeTopUp, locale } = useJaza();
  const { colors } = theme;
  const swipeDirection = useSwipeDirection();

  const paymentInFlight = step === 'processing' && resultPhase === 'loading';
  const canDismiss = !paymentInFlight;

  return (
    <Drawer.Root
      open={sheetOpen}
      onOpenChange={(open, eventDetails) => {
        if (!open) {
          if (!canDismiss) {
            eventDetails.cancel();
            return;
          }
          closeTopUp();
        }
      }}
      swipeDirection={swipeDirection}
      disablePointerDismissal={paymentInFlight}
    >
      <Drawer.Portal>
        <Drawer.Backdrop className="jaza-drawer-backdrop" />
        <Drawer.Viewport className="jaza-drawer-viewport">
          <Drawer.Popup
            className="jaza-drawer-popup"
            style={{ backgroundColor: colors.surface, color: colors.onSurface }}
          >
            {swipeDirection === 'down' ? (
              <div className="jaza-drawer-handle" aria-hidden />
            ) : null}
            <div className="jaza-drawer-header">
              <Drawer.Close
                className="jaza-drawer-close"
                disabled={!canDismiss}
                aria-label={t(locale, 'common.close')}
                style={{
                  backgroundColor: colors.surfaceContainerHigh,
                  color: colors.onSurfaceVariant,
                  opacity: canDismiss ? 1 : 0.35,
                }}
              >
                <Icon name="close" size={20} color={colors.onSurfaceVariant} />
              </Drawer.Close>
            </div>
            <Drawer.Content className="jaza-drawer-content">
              <Drawer.Title className="jaza-drawer-title-hidden">
                {t(locale, 'topUp.title')}
              </Drawer.Title>
              {step === 'offer' ? <OfferStep /> : null}
              {step === 'payment' ? <PaymentStep /> : null}
              {step === 'processing' ? <ResultStep /> : null}
            </Drawer.Content>
          </Drawer.Popup>
        </Drawer.Viewport>
      </Drawer.Portal>
    </Drawer.Root>
  );
}
