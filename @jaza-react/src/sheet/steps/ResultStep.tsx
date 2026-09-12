'use client';

import type { CSSProperties } from 'react';
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

  const container: CSSProperties = {
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center',
    padding: `${spacing.xl}px 0`,
    textAlign: 'center',
  };

  const title: CSSProperties = {
    color: colors.onSurface,
    fontSize: 20,
    fontWeight: 600,
    margin: 0,
  };

  const subtitle: CSSProperties = {
    color: colors.onSurfaceVariant,
    fontSize: 14,
    marginTop: spacing.xs,
    marginBottom: 0,
  };

  const iconWrap = (bg: string): CSSProperties => ({
    width: 80,
    height: 80,
    borderRadius: radius.full,
    backgroundColor: bg,
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: spacing.lg,
  });

  if (resultPhase === 'loading') {
    return (
      <div style={container}>
        <div style={{ marginBottom: spacing.lg }}>
          <ProcessingSpinner theme={theme} size={64} />
        </div>
        <h2 style={{ ...title, opacity: 0.9 }}>{t(locale, 'result.processing')}</h2>
        <p style={subtitle}>{t(locale, 'result.authorize')}</p>
      </div>
    );
  }

  if (resultPhase === 'failure') {
    return (
      <div style={container}>
        <div style={iconWrap(`${colors.error}20`)}>
          <Icon name="error-outline" size={48} color={colors.error} />
        </div>
        <h2 style={title}>{t(locale, 'result.failed')}</h2>
        <p style={subtitle}>
          {failureReason ?? depositError ?? t(locale, 'result.genericError')}
        </p>
        <button
          type="button"
          className="jaza-btn jaza-btn-primary"
          style={{ marginTop: spacing.md }}
          onClick={retryPayment}
        >
          {t(locale, 'common.tryAgain')}
        </button>
        <button
          type="button"
          className="jaza-btn jaza-btn-muted"
          style={{ marginTop: spacing.lg }}
          onClick={closeTopUp}
        >
          {t(locale, 'common.dismiss')}
        </button>
      </div>
    );
  }

  const credits = deposit?.credits ?? selectedBundle?.credits ?? 0;

  return (
    <div style={container}>
      <div
        className="jaza-scale-in"
        style={iconWrap(`${colors.success}20`)}
      >
        <Icon name="check-circle" size={48} color={colors.success} />
      </div>
      <h2 style={title}>{t(locale, 'result.success')}</h2>
      <p style={subtitle}>
        {t(locale, 'result.creditsAdded', {
          credits: formatCredits(credits),
        })}
      </p>
      <button
        type="button"
        className="jaza-btn jaza-btn-muted"
        style={{ marginTop: spacing.lg }}
        onClick={closeTopUp}
      >
        {t(locale, 'common.done')}
      </button>
    </div>
  );
}
