import React from 'react';
import { Shield, TrendingUp, Store, Users, DollarSign, CheckCircle2 } from 'lucide-react';
import { Card } from '../../components/ui/card';
import { PriceDisplay } from '../../components/shared/PriceDisplay';

export const AdminDashboardPage: React.FC = () => {
  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-3xl font-extrabold text-foreground">System Analytics Overview</h1>
        <p className="text-xs text-muted-foreground mt-1">Platform GMV, Commissions, and Operational Metrics</p>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
        <Card className="p-6 space-y-2 border-border">
          <div className="flex items-center justify-between text-muted-foreground">
            <span className="text-xs font-bold uppercase">Total Platform GMV</span>
            <DollarSign className="h-5 w-5 text-emerald-400" />
          </div>
          <h3 className="text-3xl font-black text-foreground">₹4,85,900</h3>
          <p className="text-xs text-emerald-400 font-bold">+24.5% this month</p>
        </Card>

        <Card className="p-6 space-y-2 border-border">
          <div className="flex items-center justify-between text-muted-foreground">
            <span className="text-xs font-bold uppercase">Platform Commission (15%)</span>
            <TrendingUp className="h-5 w-5 text-primary" />
          </div>
          <h3 className="text-3xl font-black text-primary">₹72,885</h3>
          <p className="text-xs text-emerald-400 font-bold">Net platform revenue</p>
        </Card>

        <Card className="p-6 space-y-2 border-border">
          <div className="flex items-center justify-between text-muted-foreground">
            <span className="text-xs font-bold uppercase">Active Merchants</span>
            <Store className="h-5 w-5 text-purple-400" />
          </div>
          <h3 className="text-3xl font-black text-foreground">142</h3>
          <p className="text-xs text-muted-foreground">3 pending applications</p>
        </Card>

        <Card className="p-6 space-y-2 border-border">
          <div className="flex items-center justify-between text-muted-foreground">
            <span className="text-xs font-bold uppercase">Total Users</span>
            <Users className="h-5 w-5 text-amber-400" />
          </div>
          <h3 className="text-3xl font-black text-foreground">8,940</h3>
          <p className="text-xs text-emerald-400 font-bold">+1,200 new customers</p>
        </Card>
      </div>
    </div>
  );
};
