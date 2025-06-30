import React from 'react';
import { DashboardStats } from '../components/dashboard/DashboardStats';
import { QuickActions } from '../components/dashboard/QuickActions';
import { LowStockAlert } from '../components/dashboard/LowStockAlert';
import { RecentTransactions } from '../components/dashboard/RecentTransactions';

export function Dashboard() {
  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-2xl font-bold text-gray-900 mb-2">Inventory Overview</h1>
        <p className="text-gray-600">Monitor your inventory performance and take quick actions.</p>
      </div>

      {/* Key Metrics */}
      <DashboardStats />

      {/* Two Column Layout */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        {/* Left Column */}
        <div className="space-y-8">
          <QuickActions />
          <LowStockAlert />
        </div>

        {/* Right Column */}
        <div className="space-y-8">
          <RecentTransactions />
        </div>
      </div>
    </div>
  );
}