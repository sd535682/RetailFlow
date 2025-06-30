import React from 'react';
import { Clock, TrendingUp, TrendingDown } from 'lucide-react';
import { useInventory } from '../../contexts/InventoryContext';
import { formatCurrency, formatDateTime } from '../../utils/helpers';

export function RecentTransactions() {
  const { transactions, products } = useInventory();

  // Get last 7 days of transactions
  const sevenDaysAgo = new Date();
  sevenDaysAgo.setDate(sevenDaysAgo.getDate() - 7);

  const recentTransactions = transactions
    .filter(transaction => new Date(transaction.date) >= sevenDaysAgo)
    .sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime())
    .slice(0, 10);

  if (recentTransactions.length === 0) {
    return (
      <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
        <div className="flex items-center mb-4">
          <Clock className="h-5 w-5 text-gray-600 mr-2" />
          <h3 className="text-lg font-semibold text-gray-900">Recent Transactions</h3>
        </div>
        <div className="text-center py-8">
          <Clock className="h-12 w-12 text-gray-300 mx-auto mb-4" />
          <p className="text-gray-500">No recent transactions</p>
        </div>
      </div>
    );
  }

  return (
    <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
      <div className="flex items-center mb-4">
        <Clock className="h-5 w-5 text-gray-600 mr-2" />
        <h3 className="text-lg font-semibold text-gray-900">Recent Transactions</h3>
        <span className="ml-2 text-sm text-gray-500">(Last 7 days)</span>
      </div>
      <div className="space-y-3">
        {recentTransactions.map((transaction) => {
          const product = products.find(p => p.id === transaction.productId);
          const isPurchase = transaction.type === 'PURCHASE';
          
          return (
            <div key={transaction.id} className="flex items-center justify-between p-3 hover:bg-gray-50 rounded-lg transition-colors">
              <div className="flex items-center space-x-3">
                <div className={`p-2 rounded-full ${isPurchase ? 'bg-green-100' : 'bg-blue-100'}`}>
                  {isPurchase ? (
                    <TrendingUp className="h-4 w-4 text-green-600" />
                  ) : (
                    <TrendingDown className="h-4 w-4 text-blue-600" />
                  )}
                </div>
                <div>
                  <p className="font-medium text-gray-900">
                    {product?.name || 'Unknown Product'}
                  </p>
                  <p className="text-sm text-gray-600">
                    {isPurchase ? 'Purchase' : 'Sale'} • {transaction.quantity} units
                  </p>
                  <p className="text-xs text-gray-500">
                    {formatDateTime(transaction.date)}
                  </p>
                </div>
              </div>
              <div className="text-right">
                <p className="font-semibold text-gray-900">
                  {formatCurrency(transaction.total)}
                </p>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}