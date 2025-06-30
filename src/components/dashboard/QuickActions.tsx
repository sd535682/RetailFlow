import React from 'react';
import { Plus, ShoppingCart, Users } from 'lucide-react';
import { useNavigate } from 'react-router-dom';

export function QuickActions() {
  const navigate = useNavigate();

  const actions = [
    {
      name: 'Add New Product',
      icon: Plus,
      color: 'bg-blue-600 hover:bg-blue-700',
      onClick: () => navigate('/products?action=add'),
    },
    {
      name: 'Record Sale',
      icon: ShoppingCart,
      color: 'bg-green-600 hover:bg-green-700',
      onClick: () => navigate('/transactions?action=add&type=sale'),
    },
    {
      name: 'Add New Supplier',
      icon: Users,
      color: 'bg-purple-600 hover:bg-purple-700',
      onClick: () => navigate('/suppliers?action=add'),
    },
  ];

  return (
    <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
      <h3 className="text-lg font-semibold text-gray-900 mb-4">Quick Actions</h3>
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        {actions.map((action) => {
          const Icon = action.icon;
          return (
            <button
              key={action.name}
              onClick={action.onClick}
              className={`${action.color} text-white rounded-lg p-4 flex items-center justify-center space-x-2 transition-colors`}
            >
              <Icon className="h-5 w-5" />
              <span className="font-medium">{action.name}</span>
            </button>
          );
        })}
      </div>
    </div>
  );
}