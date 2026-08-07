import * as React from 'react';
import { cn } from '../../utils/cn';

export interface TabItem {
  id: string;
  label: React.ReactNode;
  icon?: React.ReactNode;
  badge?: string | number;
}

interface TabsProps {
  tabs: TabItem[];
  activeTab: string;
  onChange: (tabId: string) => void;
  variant?: 'pill' | 'underline';
  className?: string;
}

export const Tabs: React.FC<TabsProps> = ({
  tabs,
  activeTab,
  onChange,
  variant = 'pill',
  className,
}) => {
  return (
    <div
      role="tablist"
      className={cn(
        'flex items-center gap-1 overflow-x-auto no-scrollbar',
        variant === 'pill' && 'rounded-2xl border border-border bg-card/60 p-1.5',
        variant === 'underline' && 'border-b border-border gap-6',
        className
      )}
    >
      {tabs.map((tab) => {
        const isActive = activeTab === tab.id;

        return (
          <button
            key={tab.id}
            role="tab"
            aria-selected={isActive}
            onClick={() => onChange(tab.id)}
            className={cn(
              'flex items-center gap-2 text-xs font-bold transition-all duration-200 focus-ring whitespace-nowrap',
              variant === 'pill' &&
                (isActive
                  ? 'bg-primary text-white rounded-xl px-4 py-2 shadow-md'
                  : 'text-muted-foreground hover:text-foreground hover:bg-white/5 rounded-xl px-4 py-2'),
              variant === 'underline' &&
                (isActive
                  ? 'border-b-2 border-primary text-primary py-3'
                  : 'text-muted-foreground hover:text-foreground py-3')
            )}
          >
            {tab.icon && <span>{tab.icon}</span>}
            <span>{tab.label}</span>
            {tab.badge !== undefined && (
              <span
                className={cn(
                  'rounded-full px-2 py-0.5 text-[10px] font-black',
                  isActive ? 'bg-white/20 text-white' : 'bg-muted text-muted-foreground'
                )}
              >
                {tab.badge}
              </span>
            )}
          </button>
        );
      })}
    </div>
  );
};
