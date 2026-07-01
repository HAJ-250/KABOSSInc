import * as React from 'react';
import { Slot } from '@radix-ui/react-slot';
import { cva, type VariantProps } from 'class-variance-authority';
import { cn } from '@/lib/utils';

const buttonVariants = cva(
  'inline-flex items-center justify-center whitespace-nowrap rounded-xl text-sm font-medium transition-all duration-300 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50 active:scale-[0.97]',
  {
    variants: {
      variant: {
        default: 'bg-gradient-to-r from-kaboss-500 to-kaboss-700 text-white shadow-lg shadow-kaboss-500/25 hover:shadow-xl hover:shadow-kaboss-500/30 hover:from-kaboss-600 hover:to-kaboss-800',
        destructive: 'bg-red-500 text-white shadow-lg hover:bg-red-600',
        outline: 'border-2 border-kaboss-500/20 bg-transparent text-kaboss-600 dark:text-kaboss-400 hover:bg-kaboss-50 dark:hover:bg-kaboss-950/50',
        secondary: 'bg-white/10 backdrop-blur-xl border border-white/20 text-white hover:bg-white/20',
        ghost: 'hover:bg-kaboss-50 dark:hover:bg-kaboss-950/50 text-kaboss-700 dark:text-kaboss-300',
        link: 'text-kaboss-600 underline-offset-4 hover:underline dark:text-kaboss-400',
        premium: 'bg-gradient-to-r from-premium-gold to-amber-500 text-premium-dark shadow-lg shadow-premium-gold/25 hover:shadow-xl hover:shadow-premium-gold/30',
      },
      size: {
        default: 'h-11 px-6 py-2',
        sm: 'h-9 rounded-lg px-4 text-xs',
        lg: 'h-13 rounded-xl px-8 text-base',
        xl: 'h-14 rounded-2xl px-10 text-lg',
        icon: 'h-11 w-11 rounded-xl',
      },
    },
    defaultVariants: {
      variant: 'default',
      size: 'default',
    },
  }
);

export interface ButtonProps
  extends React.ButtonHTMLAttributes<HTMLButtonElement>,
    VariantProps<typeof buttonVariants> {
  asChild?: boolean;
}

const Button = React.forwardRef<HTMLButtonElement, ButtonProps>(
  ({ className, variant, size, asChild = false, ...props }, ref) => {
    const Comp = asChild ? Slot : 'button';
    return (
      <Comp
        className={cn(buttonVariants({ variant, size, className }))}
        ref={ref}
        {...props}
      />
    );
  }
);
Button.displayName = 'Button';

export { Button, buttonVariants };
