import React from 'react';
import { AlertTriangle, Package } from 'lucide-react';
import { useInventory } from '../../contexts/InventoryContext';
import { getLowStockProducts } from '../../utils/helpers';

export function LowStockAlert() {
  const { products, suppliers } = useInventory();
  const lowStockProducts = getLowStockProducts(products);

  if (lowStockProducts.length === 0) {
    return (
      <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
        <div className="flex items-center mb-4">
          <Package className="h-5 w-5 text-green-600 mr-2" />
          <h3 className="text-lg font-semibold text-gray-900">Stock Status</h3>
        </div>
        <div className="text-center py-8">
          <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
            <Package className="h-8 w-8 text-green-600" />
          </div>
          <p className="text-gray-600">All products are adequately stocked!</p>
        </div>
      </div>
    );
  }

  return (
    <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
      <div className="flex items-center mb-4">
        <AlertTriangle className="h-5 w-5 text-red-600 mr-2" />
        <h3 className="text-lg font-semibold text-gray-900">Low Stock Alert</h3>
        <span className="ml-2 bg-red-100 text-red-800 text-xs font-medium px-2.5 py-0.5 rounded-full">
          {lowStockProducts.length}
        </span>
      </div>
      <div className="space-y-3">
        {lowStockProducts.slice(0, 5).map((product) => {
          const supplier = suppliers.find(s => s.id === product.supplierId);
          return (
            <div key={product.id} className="flex items-center justify-between p-3 bg-red-50 rounded-lg">
              <div className="flex-1">
                <p className="font-medium text-gray-900">{product.name}</p>
                <p className="text-sm text-gray-600">
                  Stock: {product.quantity} | Min: {product.minimumStock}
                </p>
                {supplier && (
                  <p className="text-xs text-gray-500">Supplier: {supplier.name}</p>
                )}
              </div>
              <div className="text-right">
                <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-red-100 text-red-800">
                  Low Stock
                </span>
              </div>
            </div>
          );
        })}
        {lowStockProducts.length > 5 && (
          <p className="text-sm text-gray-500 text-center">
            And {lowStockProducts.length - 5} more items...
          </p>
        )}
      </div>
    </div>
  );
}