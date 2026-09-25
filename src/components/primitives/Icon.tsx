import type { IconProps } from '@phosphor-icons/react';
import type { ComponentType } from 'react';

export type IconType = ComponentType<IconProps>;

export function Icon({
  icon: Cmp,
  size = 20,
  className,
}: {
  icon: IconType;
  size?: 20 | 24;
  className?: string;
}) {
  return <Cmp className={className} size={size} weight="regular" aria-hidden="true" />;
}
