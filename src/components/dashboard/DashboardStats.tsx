import React, { useEffect, useState } from 'react';
import { Package, DollarSign, Users, AlertTriangle } from 'lucide-react';
import { useInventory } from '../../contexts/InventoryContext';
import { productService } from '../../services/productService';
import { formatCurrency } from '../../utils/helpers';
import { LoadingSpinner } from '../shared/LoadingSpinner';
import { ErrorMessage } from '../shared/ErrorMessage';

interface InventoryStats {
  totalProducts: number;
  totalValue: number;
  totalSuppliers: number;
  lowStockCount: number;
}

export function DashboardStats() {
  const { suppliers, loading: contextLoading } = useInventory();
  const [stats, setStats] = useState<InventoryStats>({
    totalProducts: 0,
    totalValue: 0,
    totalSuppliers: 0,
    lowStockCount: 0,
  });
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchStats = async () => {
      try {
        setLoading(true);
        setError(null);

        const [inventoryValueRes, lowStockRes] = await Promise.all([
          productService.getInventoryValue(),
          productService.getLowStockProducts(),
        ]);

        setStats({
          totalProducts: inventoryValueRes.data.summary.totalProducts || 0,
          totalValue: inventoryValueRes.data.summary.totalValue || 0,
          totalSuppliers: suppliers.filter(s => s.activeStatus).length,
          lowStockCount: lowStockRes.count || 0,
        });
      } catch (err) {
        console.error('Failed to fetch dashboard stats:', err);
        setError(err instanceof Error ? err.message : 'Failed to load statistics');
      } finally {
        setLoading(false);
      }
    };

    if (!contextLoading) {
      fetchStats();
    }
  }, [suppliers, contextLoading]);

  if (loading || contextLoading) {
    return (
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
        {[...Array(4)].map((_, index) => (
          <div key={index} className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
            <LoadingSpinner size="sm" className="h-16" />
          </div>
        ))}
      </div>
    );
  }

  if (error) {
    return (
      <div className="mb-8">
        <ErrorMessage message={error} />
      </div>
    );
  }

  const statItems = [
    {
      name: 'Total Products',
      value: stats.totalProducts.toLocaleString(),
      icon: Package,
      color: 'bg-blue-500',
    },
    {
      name: 'Total Value of Inventory',
      value: formatCurrency(stats.totalValue),
      icon: DollarSign,
      color: 'bg-green-500',
    },
    {
      name: 'Total Suppliers',
      value: stats.totalSuppliers.toString(),
      icon: Users,
      color: 'bg-purple-500',
    },
    {
      name: 'Low Stock Items',
      value: stats.lowStockCount.toString(),
      icon: AlertTriangle,
      color: 'bg-red-500',
    },
  ];

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
      {statItems.map((stat) => {
        const Icon = stat.icon;
        return (
          <div
            key={stat.name}
            className="bg-white rounded-lg shadow-sm border border-gray-200 p-6 hover:shadow-md transition-shadow"
          >
            <div className="flex items-center">
              <div className={`${stat.color} rounded-lg p-3`}>
                <Icon className="h-6 w-6 text-white" />
              </div>
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-600">{stat.name}</p>
                <p className="text-2xl font-semibold text-gray-900">{stat.value}</p>
              </div>
            </div>
          </div>
        );
      })}
    </div>
  );
}