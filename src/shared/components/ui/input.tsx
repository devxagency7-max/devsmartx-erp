import * as React from 'react';
import { cn } from '@/shared/lib/utils';

export interface InputProps extends React.InputHTMLAttributes<HTMLInputElement> {}

const Input = React.forwardRef<HTMLInputElement, InputProps>(({ className, type, ...props }, ref) => {
  return (
    <input
      type={type}
      className={cn(
        'flex h-9 w-full rounded-lg border border-[hsl(var(--input))] bg-[hsl(var(--background))] px-3 py-1 text-sm text-[hsl(var(--foreground))] shadow-sm transition-colors',
        'placeholder:text-[hsl(var(--muted-foreground))]',
        'focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[hsl(var(--ring))] focus-visible:border-[hsl(var(--ring))]',
        'file:border-0 file:bg-transparent file:text-sm file:font-medium file:text-[hsl(var(--foreground))]',
        'disabled:cursor-not-allowed disabled:opacity-50 disabled:bg-[hsl(var(--muted))]',
        className,
      )}
      ref={ref}
      {...props}
    />
  );
});
Input.displayName = 'Input';

export { Input };
