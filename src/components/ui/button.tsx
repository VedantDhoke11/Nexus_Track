import * as React from 'react';
import { Slot } from '@radix-ui/react-slot';
import { cva, type VariantProps } from 'class-variance-authority';
import { cn } from '@/lib/utils';

const buttonVariants = cva(
  'inline-flex items-center justify-center whitespace-nowrap rounded-lg text-sm font-semibold transition-all duration-300 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50 active:scale-[0.98]',
  {
    variants: {
      variant: {
        default:
          'bg-[#6366F1] text-white shadow-[0_4px_12px_rgba(99,102,241,0.25)] hover:shadow-[0_8px_20px_rgba(99,102,241,0.35)] hover:bg-[#4F46E5] border-none',
        outline:
          'border border-slate-200 bg-white hover:bg-slate-50 text-slate-700 hover:border-slate-300',
        ghost:
          'hover:bg-slate-100 text-slate-600 hover:text-slate-900',
        secondary:
          'bg-indigo-50 text-indigo-700 hover:bg-indigo-100 border border-indigo-100',
        destructive:
          'bg-rose-500 text-white hover:bg-rose-600 shadow-[0_4px_12px_rgba(244,63,94,0.2)]'
      },
      size: {
        default: 'h-10 px-5',
        sm: 'h-9 px-3 text-xs',
        lg: 'h-12 px-8 text-base',
        icon: 'h-10 w-10'
      }
    },
    defaultVariants: {
      variant: 'default',
      size: 'default'
    }
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
        className={cn(buttonVariants({ variant, size }), className)}
        ref={ref}
        {...props}
      />
    );
  }
);

Button.displayName = 'Button';

export { Button, buttonVariants };
