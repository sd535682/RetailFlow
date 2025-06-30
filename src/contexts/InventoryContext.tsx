import React, { createContext, useContext, useEffect, useState, ReactNode } from 'react';
import { Product, Supplier, Transaction, InventoryContextType } from '../types';
import { productService } from '../services/productService';
import { supplierService } from '../services/supplierService';
import { transactionService } from '../services/transactionService';

const InventoryContext = createContext<InventoryContextType | undefined>(undefined);

export function useInventory() {
  const context = useContext(InventoryContext);
  if (context === undefined) {
    throw new Error('useInventory must be used within an InventoryProvider');
  }
  return context;
}

interface InventoryProviderProps {
  children: ReactNode;
}

export function InventoryProvider({ children }: InventoryProviderProps) {
  const [products, setProducts] = useState<Product[]>([]);
  const [suppliers, setSuppliers] = useState<Supplier[]>([]);
  const [transactions, setTransactions] = useState<Transaction[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Transform backend data to frontend format
  const transformProduct = (product: any): Product => ({
    ...product,
    id: product._id || product.id,
    lastUpdated: product.updatedAt || product.lastUpdated,
  });

  const transformSupplier = (supplier: any): Supplier => ({
    ...supplier,
    id: supplier._id || supplier.id,
    createdAt: supplier.createdAt || new Date().toISOString(),
    address: typeof supplier.address === 'object' 
      ? supplier.fullAddress || `${supplier.address.street}, ${supplier.address.city}, ${supplier.address.country}`
      : supplier.address,
  });

  const transformTransaction = (transaction: any): Transaction => ({
    ...transaction,
    id: transaction._id || transaction.id,
    date: transaction.createdAt || transaction.date,
  });

  // Load initial data
  const loadData = async () => {
    try {
      setLoading(true);
      setError(null);

      const [productsRes, suppliersRes, transactionsRes] = await Promise.all([
        productService.getProducts({ limit: 1000 }), // Get all products
        supplierService.getSuppliers({ limit: 1000 }), // Get all suppliers
        transactionService.getTransactions({ limit: 1000 }) // Get all transactions
      ]);

      setProducts(productsRes.data.map(transformProduct));
      setSuppliers(suppliersRes.data.map(transformSupplier));
      setTransactions(transactionsRes.data.map(transformTransaction));
    } catch (err) {
      console.error('Failed to load data:', err);
      setError(err instanceof Error ? err.message : 'Failed to load data');
    } finally {
      setLoading(false);
    }
  };

  // Initialize data on mount
  useEffect(() => {
    loadData();
  }, []);

  // Refresh data function
  const refreshData = async () => {
    await loadData();
  };

  // Product operations
  const addProduct = async (productData: Omit<Product, 'id' | 'lastUpdated'>) => {
    try {
      setError(null);
      const response = await productService.createProduct(productData);
      const newProduct = transformProduct(response.data);
      setProducts(prev => [...prev, newProduct]);
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to add product';
      setError(errorMessage);
      throw new Error(errorMessage);
    }
  };

  const updateProduct = async (id: string, productData: Partial<Product>) => {
    try {
      setError(null);
      const response = await productService.updateProduct(id, productData);
      const updatedProduct = transformProduct(response.data);
      setProducts(prev => prev.map(product => 
        product.id === id ? updatedProduct : product
      ));
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to update product';
      setError(errorMessage);
      throw new Error(errorMessage);
    }
  };

  const deleteProduct = async (id: string) => {
    try {
      setError(null);
      await productService.deleteProduct(id);
      setProducts(prev => prev.filter(product => product.id !== id));
      // Also remove related transactions
      setTransactions(prev => prev.filter(transaction => transaction.productId !== id));
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to delete product';
      setError(errorMessage);
      throw new Error(errorMessage);
    }
  };

  // Supplier operations
  const addSupplier = async (supplierData: Omit<Supplier, 'id' | 'createdAt'>) => {
    try {
      setError(null);
      const response = await supplierService.createSupplier(supplierData);
      const newSupplier = transformSupplier(response.data);
      setSuppliers(prev => [...prev, newSupplier]);
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to add supplier';
      setError(errorMessage);
      throw new Error(errorMessage);
    }
  };

  const updateSupplier = async (id: string, supplierData: Partial<Supplier>) => {
    try {
      setError(null);
      const response = await supplierService.updateSupplier(id, supplierData);
      const updatedSupplier = transformSupplier(response.data);
      setSuppliers(prev => prev.map(supplier => 
        supplier.id === id ? updatedSupplier : supplier
      ));
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to update supplier';
      setError(errorMessage);
      throw new Error(errorMessage);
    }
  };

  const deleteSupplier = async (id: string) => {
    try {
      setError(null);
      await supplierService.deleteSupplier(id);
      setSuppliers(prev => prev.filter(supplier => supplier.id !== id));
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to delete supplier';
      setError(errorMessage);
      throw new Error(errorMessage);
    }
  };

  // Transaction operations
  const addTransaction = async (transactionData: Omit<Transaction, 'id' | 'date'>) => {
    try {
      setError(null);
      const response = await transactionService.createTransaction(transactionData);
      const newTransaction = transformTransaction(response.data);
      setTransactions(prev => [...prev, newTransaction]);
      
      // Refresh products to get updated quantities
      const productsRes = await productService.getProducts({ limit: 1000 });
      setProducts(productsRes.data.map(transformProduct));
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to add transaction';
      setError(errorMessage);
      throw new Error(errorMessage);
    }
  };

  const value: InventoryContextType = {
    products,
    suppliers,
    transactions,
    addProduct,
    updateProduct,
    deleteProduct,
    addSupplier,
    updateSupplier,
    deleteSupplier,
    addTransaction,
    loading,
    error,
    refreshData,
  };

  return (
    <InventoryContext.Provider value={value}>
      {children}
    </InventoryContext.Provider>
  );
}