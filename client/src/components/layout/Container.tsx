import * as React from 'react';
import { cn } from '../../utils/cn';

interface ContainerProps extends React.HTMLAttributes<HTMLDivElement> {
  size?: 'sm' | 'md' | 'lg' | 'xl' | 'full';
}

export const Container: React.FC<ContainerProps> = ({
  className,
  size = 'lg',
  children,
  ...props
}) => {
  const maxWidthClass = {
    sm: 'max-w-3xl',
    md: 'max-w-5xl',
    lg: 'max-w-6xl',
    xl: 'max-w-7xl',
    full: 'max-w-full',
  }[size];

  return (
    <div
      className={cn('mx-auto w-full px-4 sm:px-6 lg:px-8', maxWidthClass, className)}
      {...props}
    >
      {children}
    </div>
  );
};
