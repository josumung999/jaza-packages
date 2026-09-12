'use client';

import type { CSSProperties } from 'react';

export type IconName =
  | 'close'
  | 'bolt'
  | 'arrow-forward'
  | 'arrow-back'
  | 'expand-more'
  | 'check-circle'
  | 'info'
  | 'lock'
  | 'error-outline';

type IconProps = {
  name: IconName;
  size?: number;
  color: string;
  style?: CSSProperties;
  className?: string;
  'aria-hidden'?: boolean | 'true' | 'false';
};

const PATHS: Record<IconName, string> = {
  close:
    'M19 6.41 17.59 5 12 10.59 6.41 5 5 6.41 10.59 12 5 17.59 6.41 19 12 13.41 17.59 19 19 17.59 13.41 12z',
  bolt: 'M11 21h-1l1-7H7.5c-.58 0-.57-.32-.38-.66.19-.34.05-.08.07-.12C10.42 10.42 16 3 16 3h1l-1 7h3.5c.49 0 .56.33.47.51l-.07.15C13.66 15.03 11 21 11 21z',
  'arrow-forward': 'M12 4 10.59 5.41 16.17 11H4v2h12.17l-5.58 5.59L12 20l8-8z',
  'arrow-back': 'M20 11H7.83l5.59-5.59L12 4l-8 8 8 8 1.41-1.41L7.83 13H20z',
  'expand-more': 'M16.59 8.59 12 13.17 7.41 8.59 6 10l6 6 6-6z',
  'check-circle':
    'M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm-2 15-5-5 1.41-1.41L10 14.17l7.59-7.59L19 8l-9 9z',
  info: 'M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm1 15h-2v-6h2v6zm0-8h-2V7h2v2z',
  lock: 'M18 8h-1V6c0-2.76-2.24-5-5-5S7 3.24 7 6v2H6c-1.1 0-2 .9-2 2v10c0 1.1.9 2 2 2h12c1.1 0 2-.9 2-2V10c0-1.1-.9-2-2-2zm-6 9c-1.1 0-2-.9-2-2s.9-2 2-2 2 .9 2 2-.9 2-2 2zm3.1-9H8.9V6c0-1.71 1.39-3.1 3.1-3.1s3.1 1.39 3.1 3.1v2z',
  'error-outline':
    'M11 15h2v2h-2zm0-8h2v6h-2zm.99-5C6.47 2 2 6.48 2 12s4.47 10 9.99 10C17.52 22 22 17.52 22 12S17.52 2 11.99 2zM12 20c-4.42 0-8-3.58-8-8s3.58-8 8-8 8 3.58 8 8-3.58 8-8 8z',
};

export function Icon({
  name,
  size = 24,
  color,
  style,
  className,
  'aria-hidden': ariaHidden = true,
}: IconProps) {
  return (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      width={size}
      height={size}
      viewBox="0 0 24 24"
      fill={color}
      className={className}
      style={style}
      aria-hidden={ariaHidden}
      focusable="false"
    >
      <path d={PATHS[name]} />
    </svg>
  );
}
