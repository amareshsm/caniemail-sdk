import * as React from 'react';

import { cn } from '@/lib/utils';

const Badge = React.forwardRef<
  HTMLDivElement,
  React.HTMLAttributes<HTMLDivElement> & {
    variant?: 'default' | 'secondary' | 'destructive' | 'outline' | 'success' | 'warning';
  }
>(({ className, variant = 'default', ...props }, ref) => {
  return (
    <div
      ref={ref}
      className={cn(
        'inline-flex items-center rounded-full border px-2.5 py-0.5 text-xs font-semibold transition-colors focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2',
        {
          'border-transparent bg-primary text-primary-foreground shadow': variant === 'default',
          'border-transparent bg-secondary text-secondary-foreground': variant === 'secondary',
          'border-transparent bg-destructive/15 text-destructive': variant === 'destructive',
          'text-foreground': variant === 'outline',
          'border-transparent bg-success/15 text-success': variant === 'success',
          'border-transparent bg-warning/15 text-warning': variant === 'warning'
        },
        className
      )}
      {...props}
    />
  );
});
Badge.displayName = 'Badge';

export { Badge };
