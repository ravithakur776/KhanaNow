import * as React from 'react';
import { cn } from '../../utils/cn';

interface SectionProps extends React.HTMLAttributes<HTMLElement> {
  padding?: 'none' | 'sm' | 'md' | 'lg';
}

export const Section: React.FC<SectionProps> = ({
  className,
  padding = 'md',
  children,
  ...props
}) => {
  const pyClass = {
    none: 'py-0',
    sm: 'py-8 md:py-12',
    md: 'py-12 md:py-20',
    lg: 'py-16 md:py-28',
  }[padding];

  return (
    <section className={cn('relative w-full', pyClass, className)} {...props}>
      {children}
    </section>
  );
};
