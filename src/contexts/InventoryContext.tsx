/* eslint-disable @typescript-eslint/no-unused-vars */
import {
  createContext,
  useContext,
  useEffect,
  useState,
  ReactNode,
} from "react";
import { Product, Supplier, Transaction, InventoryContextType } from "../types";
import {
  productStorage,
  supplierStorage,
  transactionStorage,
  initializeSampleData,
} from "../utils/localStorage";
import { generateId } from "../utils/helpers";

const InventoryContext = createContext<InventoryContextType | undefined>(
  undefined
);

export function useInventory() {
  const context = useContext(InventoryContext);
  if (context === undefined) {
    throw new Error("useInventory must be used within an InventoryProvider");
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

  // Initialize data on mount
  useEffect(() => {
    try {
      initializeSampleData();
      setProducts(productStorage.getAll());
      setSuppliers(supplierStorage.getAll());
      setTransactions(transactionStorage.getAll());
      setLoading(false);
    } catch (err) {
      setError("Failed to load inventory data");
      setLoading(false);
    }
  }, []);

  // Product operations
  const addProduct = (productData: Omit<Product, "id" | "lastUpdated">) => {
    try {
      const newProduct: Product = {
        ...productData,
        id: generateId("prod"),
        lastUpdated: new Date().toISOString(),
      };

      const updatedProducts = [...products, newProduct];
      setProducts(updatedProducts);
      productStorage.save(updatedProducts);
    } catch (err) {
      setError("Failed to add product");
    }
  };

  const updateProduct = (id: string, productData: Partial<Product>) => {
    try {
      const updatedProducts = products.map((product) =>
        product.id === id
          ? {
              ...product,
              ...productData,
              lastUpdated: new Date().toISOString(),
            }
          : product
      );

      setProducts(updatedProducts);
      productStorage.save(updatedProducts);
    } catch (err) {
      setError("Failed to update product");
    }
  };

  const deleteProduct = (id: string) => {
    try {
      const updatedProducts = products.filter((product) => product.id !== id);
      setProducts(updatedProducts);
      productStorage.save(updatedProducts);

      // Also remove related transactions
      const updatedTransactions = transactions.filter(
        (transaction) => transaction.productId !== id
      );
      setTransactions(updatedTransactions);
      transactionStorage.save(updatedTransactions);
    } catch (err) {
      setError("Failed to delete product");
    }
  };

  // Supplier operations
  const addSupplier = (supplierData: Omit<Supplier, "id" | "createdAt">) => {
    try {
      const newSupplier: Supplier = {
        ...supplierData,
        id: generateId("sup"),
        createdAt: new Date().toISOString(),
      };

      const updatedSuppliers = [...suppliers, newSupplier];
      setSuppliers(updatedSuppliers);
      supplierStorage.save(updatedSuppliers);
    } catch (err) {
      setError("Failed to add supplier");
    }
  };

  const updateSupplier = (id: string, supplierData: Partial<Supplier>) => {
    try {
      const updatedSuppliers = suppliers.map((supplier) =>
        supplier.id === id ? { ...supplier, ...supplierData } : supplier
      );

      setSuppliers(updatedSuppliers);
      supplierStorage.save(updatedSuppliers);
    } catch (err) {
      setError("Failed to update supplier");
    }
  };

  const deleteSupplier = (id: string) => {
    try {
      // Check if supplier has associated products
      const hasProducts = products.some((product) => product.supplierId === id);
      if (hasProducts) {
        setError("Cannot delete supplier with associated products");
        return;
      }

      const updatedSuppliers = suppliers.filter(
        (supplier) => supplier.id !== id
      );
      setSuppliers(updatedSuppliers);
      supplierStorage.save(updatedSuppliers);
    } catch (err) {
      setError("Failed to delete supplier");
    }
  };

  // Transaction operations
  const addTransaction = (transactionData: Omit<Transaction, "id">) => {
    try {
      const newTransaction: Transaction = {
        ...transactionData,
        id: generateId("txn"),
      };

      // Update product quantity based on transaction type
      const updatedProducts = products.map((product) => {
        if (product.id === transactionData.productId) {
          const quantityChange =
            transactionData.type === "PURCHASE"
              ? transactionData.quantity
              : -transactionData.quantity;
          return {
            ...product,
            quantity: Math.max(0, product.quantity + quantityChange),
            lastUpdated: new Date().toISOString(),
          };
        }
        return product;
      });

      const updatedTransactions = [...transactions, newTransaction];

      setProducts(updatedProducts);
      setTransactions(updatedTransactions);
      productStorage.save(updatedProducts);
      transactionStorage.save(updatedTransactions);
    } catch (err) {
      setError("Failed to add transaction");
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
  };

  return (
    <InventoryContext.Provider value={value}>
      {children}
    </InventoryContext.Provider>
  );
}
