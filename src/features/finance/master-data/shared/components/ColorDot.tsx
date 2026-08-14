interface Props { color: string; size?: 'sm' | 'md' }

export function ColorDot({ color, size = 'md' }: Props) {
  return (
    <span
      className={size === 'sm' ? 'inline-block h-2.5 w-2.5 rounded-full flex-shrink-0' : 'inline-block h-4 w-4 rounded-full flex-shrink-0 border border-black/10'}
      style={{ backgroundColor: color }}
    />
  );
}
