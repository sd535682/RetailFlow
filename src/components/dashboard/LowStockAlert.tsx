import React, { useEffect, useState } from 'react';
import { AlertTriangle, Package } from 'lucide-react';
import { useInventory } from '../../contexts/InventoryContext';
import { productService } from '../../services/productService';
import { LoadingSpinner } from '../shared/LoadingSpinner';
import { ErrorMessage } from '../shared/ErrorMessage';

interface LowStockProduct {
  id: string;
  name: string;
  quantity: number;
  minimumStock: number;
  supplierId: {
    name: string;
  };
}

export function LowStockAlert() {
  const { suppliers } = useInventory();
  const [lowStockProducts, setLowStockProducts] = useState<LowStockProduct[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchLowStockProducts = async () => {
      try {
        setLoading(true);
        setError(null);
        const response = await productService.getLowStockProducts();
        setLowStockProducts(response.data || []);
      } catch (err) {
        console.error('Failed to fetch low stock products:', err);
        setError(err instanceof Error ? err.message : 'Failed to load low stock products');
      } finally {
        setLoading(false);
      }
    };

    fetchLowStockProducts();
  }, []);

  if (loading) {
    return (
      <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
        <div className="flex items-center mb-4">
          <Package className="h-5 w-5 text-gray-600 mr-2" />
          <h3 className="text-lg font-semibold text-gray-900">Stock Status</h3>
        </div>
        <LoadingSpinner size="md" className="py-8" text="Loading stock status..." />
      </div>
    );
  }

  if (error) {
    return (
      <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
        <div className="flex items-center mb-4">
          <AlertTriangle className="h-5 w-5 text-red-600 mr-2" />
          <h3 className="text-lg font-semibold text-gray-900">Stock Status</h3>
        </div>
        <ErrorMessage message={error} />
      </div>
    );
  }

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
        {lowStockProducts.slice(0, 5).map((product) => (
          <div key={product.id} className="flex items-center justify-between p-3 bg-red-50 rounded-lg">
            <div className="flex-1">
              <p className="font-medium text-gray-900">{product.name}</p>
              <p className="text-sm text-gray-600">
                Stock: {product.quantity} | Min: {product.minimumStock}
              </p>
              {product.supplierId && (
                <p className="text-xs text-gray-500">Supplier: {product.supplierId.name}</p>
              )}
            </div>
            <div className="text-right">
              <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-red-100 text-red-800">
                Low Stock
              </span>
            </div>
          </div>
        ))}
        {lowStockProducts.length > 5 && (
          <p className="text-sm text-gray-500 text-center">
            And {lowStockProducts.length - 5} more items...
          </p>
        )}
      </div>
    </div>
  );
}