import * as React from 'react';
import { cva, type VariantProps } from 'class-variance-authority';
import { cn } from '../../utils/cn';

// Display Variants (Hero, Key Metrics)
const displayVariants = cva(
  'font-display font-black tracking-tight text-foreground leading-[1.1]',
  {
    variants: {
      size: {
        '2xl': 'text-5xl sm:text-7xl md:text-8xl',
        xl: 'text-4xl sm:text-6xl md:text-7xl',
        lg: 'text-3xl sm:text-5xl md:text-6xl',
        md: 'text-2xl sm:text-4xl md:text-5xl',
        sm: 'text-xl sm:text-3xl md:text-4xl',
      },
      gradient: {
        true: 'text-transparent bg-clip-text bg-gradient-to-r from-primary via-amber-400 to-amber-500',
        false: '',
      },
    },
    defaultVariants: {
      size: 'lg',
      gradient: false,
    },
  }
);

export interface DisplayProps
  extends React.HTMLAttributes<HTMLHeadingElement>,
    VariantProps<typeof displayVariants> {
  as?: 'h1' | 'h2' | 'h3' | 'div';
}

export const Display = React.forwardRef<HTMLHeadingElement, DisplayProps>(
  ({ className, size, gradient, as: Component = 'h1', ...props }, ref) => (
    <Component
      ref={ref}
      className={cn(displayVariants({ size, gradient, className }))}
      {...props}
    />
  )
);
Display.displayName = 'Display';

// Heading Variants (H1 - H6)
const headingVariants = cva('font-display font-bold tracking-tight text-foreground', {
  variants: {
    level: {
      h1: 'text-3xl sm:text-4xl md:text-5xl leading-tight',
      h2: 'text-2xl sm:text-3xl md:text-4xl leading-tight',
      h3: 'text-xl sm:text-2xl leading-snug',
      h4: 'text-lg sm:text-xl leading-snug',
      h5: 'text-base sm:text-lg leading-normal',
      h6: 'text-sm sm:text-base font-semibold leading-normal uppercase tracking-wider',
    },
  },
  defaultVariants: {
    level: 'h2',
  },
});

export interface HeadingProps
  extends React.HTMLAttributes<HTMLHeadingElement>,
    VariantProps<typeof headingVariants> {
  as?: 'h1' | 'h2' | 'h3' | 'h4' | 'h5' | 'h6' | 'div';
}

export const Heading = React.forwardRef<HTMLHeadingElement, HeadingProps>(
  ({ className, level = 'h2', as, ...props }, ref) => {
    const Component = (as || level || 'h2') as React.ElementType;
    return (
      <Component
        ref={ref}
        className={cn(headingVariants({ level, className }))}
        {...props}
      />
    );
  }
);
Heading.displayName = 'Heading';

// Text Body Variants
const textVariants = cva('font-sans text-foreground', {
  variants: {
    variant: {
      lead: 'text-lg sm:text-xl leading-relaxed text-muted-foreground font-normal',
      body: 'text-sm sm:text-base leading-relaxed',
      small: 'text-xs sm:text-sm leading-normal text-muted-foreground',
      caption: 'text-[11px] sm:text-xs leading-tight text-muted-foreground font-medium',
      mono: 'font-mono text-xs sm:text-sm tracking-tight',
    },
    weight: {
      normal: 'font-normal',
      medium: 'font-medium',
      semibold: 'font-semibold',
      bold: 'font-bold',
      black: 'font-black',
    },
  },
  defaultVariants: {
    variant: 'body',
    weight: 'normal',
  },
});

export interface TextProps
  extends React.HTMLAttributes<HTMLElement>,
    VariantProps<typeof textVariants> {
  as?: 'p' | 'span' | 'div' | 'label';
}

export const Text = React.forwardRef<HTMLElement, TextProps>(
  ({ className, variant, weight, as = 'p', ...props }, ref) => {
    const Component = as as React.ElementType;
    return (
      <Component
        ref={ref}
        className={cn(textVariants({ variant, weight, className }))}
        {...props}
      />
    );
  }
);
Text.displayName = 'Text';
