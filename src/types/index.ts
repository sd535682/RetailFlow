// Core data models for the inventory management system
export interface Product {
  id: string;
  name: string;
  sku: string;
  quantity: number;
  price: number;
  supplierId: string;
  minimumStock: number;
  lastUpdated: string;
  category?: string;
  description?: string;
}

export interface Supplier {
  id: string;
  name: string;
  email: string;
  phone: string;
  address: string;
  activeStatus: boolean;
  createdAt: string;
  contactPerson?: string;
}

export interface Transaction {
  id: string;
  productId: string;
  type: 'PURCHASE' | 'SALE';
  quantity: number;
  date: string;
  unitPrice: number;
  total: number;
  reference?: string;
  notes?: string;
}

// UI and form types
export interface InventoryContextType {
  products: Product[];
  suppliers: Supplier[];
  transactions: Transaction[];
  addProduct: (product: Omit<Product, 'id' | 'lastUpdated'>) => void;
  updateProduct: (id: string, product: Partial<Product>) => void;
  deleteProduct: (id: string) => void;
  addSupplier: (supplier: Omit<Supplier, 'id' | 'createdAt'>) => void;
  updateSupplier: (id: string, supplier: Partial<Supplier>) => void;
  deleteSupplier: (id: string) => void;
  addTransaction: (transaction: Omit<Transaction, 'id'>) => void;
  loading: boolean;
  error: string | null;
}

export interface DashboardMetrics {
  totalProducts: number;
  totalValue: number;
  totalSuppliers: number;
  lowStockCount: number;
  recentTransactions: Transaction[];
}

export interface FilterOptions {
  search: string;
  category: string;
  supplier: string;
  stockLevel: 'all' | 'low' | 'adequate';
}