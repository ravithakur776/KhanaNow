import * as React from 'react';
import { cn } from '../../utils/cn';

interface StackProps extends React.HTMLAttributes<HTMLDivElement> {
  direction?: 'row' | 'col';
  gap?: 'xs' | 'sm' | 'md' | 'lg' | 'xl';
  align?: 'start' | 'center' | 'end' | 'stretch';
  justify?: 'start' | 'center' | 'end' | 'between';
}

export const Stack: React.FC<StackProps> = ({
  className,
  direction = 'col',
  gap = 'md',
  align = 'stretch',
  justify = 'start',
  children,
  ...props
}) => {
  const dirClass = direction === 'row' ? 'flex-row' : 'flex-col';

  const gapClass = {
    xs: 'gap-1.5',
    sm: 'gap-3',
    md: 'gap-4',
    lg: 'gap-6',
    xl: 'gap-8',
  }[gap];

  const alignClass = {
    start: 'items-start',
    center: 'items-center',
    end: 'items-end',
    stretch: 'items-stretch',
  }[align];

  const justifyClass = {
    start: 'justify-start',
    center: 'justify-center',
    end: 'justify-end',
    between: 'justify-between',
  }[justify];

  return (
    <div
      className={cn('flex', dirClass, gapClass, alignClass, justifyClass, className)}
      {...props}
    >
      {children}
    </div>
  );
};

export const VStack: React.FC<StackProps> = (props) => <Stack direction="col" {...props} />;
export const HStack: React.FC<StackProps> = (props) => <Stack direction="row" {...props} />;
