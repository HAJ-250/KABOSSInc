import * as React from 'react';
import { cva, type VariantProps } from 'class-variance-authority';
import { cn } from '@/lib/utils';

const badgeVariants = cva(
  'inline-flex items-center rounded-full px-3 py-1 text-xs font-medium transition-colors',
  {
    variants: {
      variant: {
        default: 'bg-kaboss-100 text-kaboss-800 dark:bg-kaboss-900/50 dark:text-kaboss-200',
        secondary: 'bg-gray-100 text-gray-800 dark:bg-gray-800 dark:text-gray-200',
        destructive: 'bg-red-100 text-red-800 dark:bg-red-900/50 dark:text-red-200',
        success: 'bg-green-100 text-green-800 dark:bg-green-900/50 dark:text-green-200',
        warning: 'bg-amber-100 text-amber-800 dark:bg-amber-900/50 dark:text-amber-200',
        premium: 'bg-gradient-to-r from-premium-gold/20 to-amber-500/20 text-premium-gold border border-premium-gold/30',
      },
    },
    defaultVariants: {
      variant: 'default',
    },
  }
);

export interface BadgeProps
  extends React.HTMLAttributes<HTMLDivElement>,
    VariantProps<typeof badgeVariants> {}

function Badge({ className, variant, ...props }: BadgeProps) {
  return (
    <div className={cn(badgeVariants({ variant }), className)} {...props} />
  );
}

export { Badge, badgeVariants };
