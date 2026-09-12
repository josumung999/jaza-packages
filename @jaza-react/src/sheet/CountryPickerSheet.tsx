'use client';

import { useEffect, useMemo, useState, type CSSProperties } from 'react';
import { useJaza } from '../provider/JazaContext.js';
import { t } from '../i18n/t.js';

export type CountryPickerSheetProps = {
  visible: boolean;
  onClose: () => void;
};

/** Inline country list overlay (nested inside the top-up drawer). */
export function CountryPickerSheet({
  visible,
  onClose,
}: CountryPickerSheetProps) {
  const { theme, locale, countries, selectedCountry, setSelectedCountry } =
    useJaza();
  const { colors, spacing } = theme;
  const [query, setQuery] = useState('');

  useEffect(() => {
    if (!visible) setQuery('');
  }, [visible]);

  const filtered = useMemo(() => {
    const q = query.trim().toLowerCase();
    if (!q) return countries;
    return countries.filter(
      (c) =>
        c.name.toLowerCase().includes(q) ||
        c.iso2.toLowerCase().includes(q) ||
        c.dialCode.includes(q),
    );
  }, [countries, query]);

  if (!visible) return null;

  const nameRow: CSSProperties = {
    display: 'flex',
    alignItems: 'center',
    gap: spacing.md,
    flex: 1,
    minWidth: 0,
  };

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
      <div className="jaza-picker-panel" style={{ position: 'relative' }}>
        <div className="jaza-drawer-handle" />
        <input
          className="jaza-picker-search"
          placeholder={t(locale, 'payment.searchCountry')}
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          autoCorrect="off"
          autoCapitalize="none"
          spellCheck={false}
        />
        <ul className="jaza-picker-list">
          {filtered.length === 0 ? (
            <li className="jaza-picker-empty">{t(locale, 'payment.noCountries')}</li>
          ) : (
            filtered.map((item) => {
              const selected = selectedCountry?.id === item.id;
              return (
                <li key={item.id}>
                  <button
                    type="button"
                    className="jaza-picker-row"
                    data-selected={selected}
                    onClick={() => {
                      setSelectedCountry(item);
                      onClose();
                    }}
                  >
                    <span style={nameRow}>
                      <span style={{ fontSize: 24, flexShrink: 0 }}>{item.flag}</span>
                      <span
                        style={{
                          overflow: 'hidden',
                          textOverflow: 'ellipsis',
                          whiteSpace: 'nowrap',
                          color: selected
                            ? colors.primaryContainer
                            : colors.onSurface,
                          fontWeight: selected ? 600 : 500,
                        }}
                      >
                        {item.name}
                      </span>
                    </span>
                    <span
                      style={{
                        color: colors.onSurfaceVariant,
                        fontSize: 14,
                        fontFamily: 'monospace',
                        flexShrink: 0,
                      }}
                    >
                      +{item.dialCode}
                    </span>
                  </button>
                </li>
              );
            })
          )}
        </ul>
      </div>
    </div>
  );
}

/** @alias CountryPickerSheet */
export const CountryPickerPanel = CountryPickerSheet;
