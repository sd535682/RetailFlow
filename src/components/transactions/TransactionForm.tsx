import React, { useState } from 'react';
import { useInventory } from '../../contexts/InventoryContext';
import { validateRequired } from '../../utils/helpers';

interface TransactionFormProps {
  onClose: () => void;
}

export function TransactionForm({ onClose }: TransactionFormProps) {
  const { addTransaction, products } = useInventory();
  const [loading, setLoading] = useState(false);
  const [errors, setErrors] = useState<Record<string, string>>({});
  
  const [formData, setFormData] = useState({
    productId: '',
    type: 'SALE' as 'PURCHASE' | 'SALE',
    quantity: 1,
    unitPrice: 0,
    reference: '',
    notes: '',
  });

  const selectedProduct = products.find(p => p.id === formData.productId);
  const total = formData.quantity * formData.unitPrice;

  const validateForm = () => {
    const newErrors: Record<string, string> = {};

    if (!validateRequired(formData.productId)) {
      newErrors.productId = 'Product is required';
    }
    if (!validateRequired(formData.quantity) || formData.quantity <= 0) {
      newErrors.quantity = 'Valid quantity is required';
    }
    if (!validateRequired(formData.unitPrice) || formData.unitPrice <= 0) {
      newErrors.unitPrice = 'Valid unit price is required';
    }

    // Check if sale quantity exceeds available stock
    if (formData.type === 'SALE' && selectedProduct) {
      if (formData.quantity > selectedProduct.quantity) {
        newErrors.quantity = `Cannot sell more than available stock (${selectedProduct.quantity})`;
      }
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!validateForm()) return;

    setLoading(true);
    try {
      addTransaction({
        ...formData,
        date: new Date().toISOString(),
        total,
      });
      onClose();
    } catch (error) {
      console.error('Failed to record transaction:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleInputChange = (field: string, value: any) => {
    setFormData(prev => ({ ...prev, [field]: value }));
    // Clear error when user starts typing
    if (errors[field]) {
      setErrors(prev => ({ ...prev, [field]: '' }));
    }
  };

  const handleProductChange = (productId: string) => {
    const product = products.find(p => p.id === productId);
    setFormData(prev => ({
      ...prev,
      productId,
      unitPrice: product?.price || 0,
    }));
    if (errors.productId) {
      setErrors(prev => ({ ...prev, productId: '' }));
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Transaction Type */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Transaction Type *
          </label>
          <select
            value={formData.type}
            onChange={(e) => handleInputChange('type', e.target.value)}
            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
          >
            <option value="SALE">Sale</option>
            <option value="PURCHASE">Purchase</option>
          </select>
        </div>

        {/* Product */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Product *
          </label>
          <select
            value={formData.productId}
            onChange={(e) => handleProductChange(e.target.value)}
            className={`w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent ${
              errors.productId ? 'border-red-300' : 'border-gray-300'
            }`}
          >
            <option value="">Select a product</option>
            {products.map(product => (
              <option key={product.id} value={product.id}>
                {product.name} - {product.sku} (Stock: {product.quantity})
              </option>
            ))}
          </select>
          {errors.productId && <p className="mt-1 text-sm text-red-600">{errors.productId}</p>}
        </div>

        {/* Quantity */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Quantity *
          </label>
          <input
            type="number"
            min="1"
            value={formData.quantity}
            onChange={(e) => handleInputChange('quantity', parseInt(e.target.value) || 1)}
            className={`w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent ${
              errors.quantity ? 'border-red-300' : 'border-gray-300'
            }`}
            placeholder="Enter quantity"
          />
          {errors.quantity && <p className="mt-1 text-sm text-red-600">{errors.quantity}</p>}
          {selectedProduct && formData.type === 'SALE' && (
            <p className="mt-1 text-sm text-gray-500">
              Available stock: {selectedProduct.quantity}
            </p>
          )}
        </div>

        {/* Unit Price */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Unit Price *
          </label>
          <input
            type="number"
            min="0"
            step="0.01"
            value={formData.unitPrice}
            onChange={(e) => handleInputChange('unitPrice', parseFloat(e.target.value) || 0)}
            className={`w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent ${
              errors.unitPrice ? 'border-red-300' : 'border-gray-300'
            }`}
            placeholder="Enter unit price"
          />
          {errors.unitPrice && <p className="mt-1 text-sm text-red-600">{errors.unitPrice}</p>}
        </div>
      </div>

      {/* Reference */}
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-1">
          Reference
        </label>
        <input
          type="text"
          value={formData.reference}
          onChange={(e) => handleInputChange('reference', e.target.value)}
          className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
          placeholder="Enter reference number or invoice ID"
        />
      </div>

      {/* Notes */}
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-1">
          Notes
        </label>
        <textarea
          rows={3}
          value={formData.notes}
          onChange={(e) => handleInputChange('notes', e.target.value)}
          className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
          placeholder="Enter additional notes"
        />
      </div>

      {/* Total Display */}
      {total > 0 && (
        <div className="bg-gray-50 rounded-lg p-4">
          <div className="flex justify-between items-center">
            <span className="text-sm font-medium text-gray-700">Total Amount:</span>
            <span className="text-lg font-semibold text-gray-900">
              ${total.toFixed(2)}
            </span>
          </div>
        </div>
      )}

      {/* Form Actions */}
      <div className="flex justify-end space-x-3 pt-6 border-t border-gray-200">
        <button
          type="button"
          onClick={onClose}
          className="px-4 py-2 border border-gray-300 rounded-lg text-gray-700 hover:bg-gray-50 transition-colors"
        >
          Cancel
        </button>
        <button
          type="submit"
          disabled={loading}
          className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors disabled:opacity-50"
        >
          {loading ? 'Recording...' : 'Record Transaction'}
        </button>
      </div>
    </form>
  );
}