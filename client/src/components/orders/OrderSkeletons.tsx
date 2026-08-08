import React from 'react';
import { Card } from '../ui/card';
import { Skeleton } from '../ui/skeleton';

export const OrderCardSkeleton: React.FC = () => {
  return (
    <Card className="p-6 border-border space-y-4">
      <div className="flex justify-between items-center pb-3 border-b border-border">
        <div className="space-y-2">
          <Skeleton className="h-5 w-48" />
          <Skeleton className="h-3 w-32" />
        </div>
        <Skeleton className="h-6 w-20 rounded-full" />
      </div>
      <div className="space-y-2">
        <Skeleton className="h-4 w-3/4" />
        <Skeleton className="h-4 w-1/2" />
      </div>
      <div className="flex justify-between items-center pt-3 border-t border-border">
        <Skeleton className="h-6 w-24" />
        <div className="flex gap-2">
          <Skeleton className="h-9 w-24 rounded-xl" />
          <Skeleton className="h-9 w-28 rounded-xl" />
        </div>
      </div>
    </Card>
  );
};

export const OrderDetailsSkeleton: React.FC = () => {
  return (
    <div className="max-w-4xl mx-auto py-8 space-y-6">
      <Skeleton className="h-10 w-64" />
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <Card className="p-6 md:col-span-2 space-y-4">
          <Skeleton className="h-6 w-40" />
          <Skeleton className="h-20 w-full" />
          <Skeleton className="h-20 w-full" />
        </Card>
        <Card className="p-6 space-y-4">
          <Skeleton className="h-6 w-32" />
          <Skeleton className="h-32 w-full" />
        </Card>
      </div>
    </div>
  );
};

export const OrderTrackingSkeleton: React.FC = () => {
  return (
    <div className="max-w-4xl mx-auto py-8 space-y-6">
      <div className="flex justify-between items-center">
        <Skeleton className="h-8 w-48" />
        <Skeleton className="h-8 w-32 rounded-xl" />
      </div>
      <Card className="p-8 space-y-6">
        <Skeleton className="h-6 w-32" />
        <div className="flex justify-between gap-4">
          <Skeleton className="h-12 w-12 rounded-full" />
          <Skeleton className="h-12 w-12 rounded-full" />
          <Skeleton className="h-12 w-12 rounded-full" />
          <Skeleton className="h-12 w-12 rounded-full" />
        </div>
      </Card>
    </div>
  );
};
