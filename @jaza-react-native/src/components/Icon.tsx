import MaterialIcons from '@expo/vector-icons/MaterialIcons';
import type { ComponentProps } from 'react';

type IconProps = {
  name: ComponentProps<typeof MaterialIcons>['name'];
  size?: number;
  color: string;
};

export function Icon({ name, size = 24, color }: IconProps) {
  return <MaterialIcons name={name} size={size} color={color} />;
}
