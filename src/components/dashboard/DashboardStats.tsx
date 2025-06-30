import React from 'react';
import { Package, DollarSign, Users, AlertTriangle } from 'lucide-react';
import { useInventory } from '../../contexts/InventoryContext';
import { formatCurrency, calculateInventoryValue, getLowStockProducts } from '../../utils/helpers';

export function DashboardStats() {
  const { products, suppliers } = useInventory();

  const stats = [
    {
      name: 'Total Products',
      value: products.length.toLocaleString(),
      icon: Package,
      color: 'bg-blue-500',
    },
    {
      name: 'Total Value of Inventory',
      value: formatCurrency(calculateInventoryValue(products)),
      icon: DollarSign,
      color: 'bg-green-500',
    },
    {
      name: 'Total Suppliers',
      value: suppliers.filter(s => s.activeStatus).length.toString(),
      icon: Users,
      color: 'bg-purple-500',
    },
    {
      name: 'Low Stock Items',
      value: getLowStockProducts(products).length.toString(),
      icon: AlertTriangle,
      color: 'bg-red-500',
    },
  ];

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
      {stats.map((stat) => {
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