'use client';

import { useJaza } from '../provider/JazaContext.js';
import { t } from '../i18n/t.js';

export type CurrencyOption = {
  code: string;
  decimals: number;
};

export type CurrencyPickerSheetProps = {
  visible: boolean;
  currencies: CurrencyOption[];
  selectedCode: string | null;
  onSelect: (code: string) => void;
  onClose: () => void;
};

/** Inline currency list overlay (nested inside the top-up drawer). */
export function CurrencyPickerSheet({
  visible,
  currencies,
  selectedCode,
  onSelect,
  onClose,
}: CurrencyPickerSheetProps) {
  const { theme, locale } = useJaza();
  const { colors } = theme;

  if (!visible) return null;

  return (
    <div className="jaza-picker-overlay" role="dialog" aria-modal="true">
      <button
        type="button"
        aria-label={t(locale, 'common.close')}
        onClick={onClose}
        style={{
          position: 'absolute',
          inset: 0,
          border: 'none',
          background: 'transparent',
          cursor: 'pointer',
          padding: 0,
        }}
      />
      <div
        className="jaza-picker-panel"
        style={{ position: 'relative', maxHeight: '50%', minHeight: 180 }}
        onClick={(e) => e.stopPropagation()}
      >
        <div className="jaza-drawer-handle" />
        <h3 className="jaza-picker-title">{t(locale, 'payment.selectCurrency')}</h3>
        <ul className="jaza-picker-list">
          {currencies.map((item) => {
            const selected = selectedCode === item.code;
            return (
              <li key={item.code}>
                <button
                  type="button"
                  className="jaza-picker-row"
                  data-selected={selected}
                  onClick={() => onSelect(item.code)}
                  style={{
                    color: selected ? colors.primaryContainer : colors.onSurface,
                    fontWeight: selected ? 600 : 500,
                  }}
                >
                  {item.code}
                </button>
              </li>
            );
          })}
        </ul>
      </div>
    </div>
  );
}

/** @alias CurrencyPickerSheet */
export const CurrencyPickerPanel = CurrencyPickerSheet;
