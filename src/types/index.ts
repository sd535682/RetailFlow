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
  isActive?: boolean;
  // Virtual fields from backend
  stockStatus?: 'OUT_OF_STOCK' | 'LOW_STOCK' | 'IN_STOCK';
  totalValue?: number;
}

export interface Supplier {
  id: string;
  name: string;
  email: string;
  phone: string;
  address: string | {
    street: string;
    city: string;
    state?: string;
    zipCode?: string;
    country: string;
  };
  activeStatus: boolean;
  createdAt: string;
  contactPerson?: string;
  paymentTerms?: 'NET_30' | 'NET_60' | 'NET_90' | 'COD' | 'PREPAID';
  rating?: number;
  // Virtual fields
  fullAddress?: string;
  productCount?: number;
}

export interface Transaction {
  id: string;
  productId: string;
  type: 'PURCHASE' | 'SALE' | 'ADJUSTMENT';
  quantity: number;
  date: string;
  unitPrice: number;
  total: number;
  reference?: string;
  notes?: string;
  supplierId?: string;
  status?: 'PENDING' | 'COMPLETED' | 'CANCELLED';
}

// UI and form types
export interface InventoryContextType {
  products: Product[];
  suppliers: Supplier[];
  transactions: Transaction[];
  addProduct: (product: Omit<Product, 'id' | 'lastUpdated'>) => Promise<void>;
  updateProduct: (id: string, product: Partial<Product>) => Promise<void>;
  deleteProduct: (id: string) => Promise<void>;
  addSupplier: (supplier: Omit<Supplier, 'id' | 'createdAt'>) => Promise<void>;
  updateSupplier: (id: string, supplier: Partial<Supplier>) => Promise<void>;
  deleteSupplier: (id: string) => Promise<void>;
  addTransaction: (transaction: Omit<Transaction, 'id' | 'date'>) => Promise<void>;
  loading: boolean;
  error: string | null;
  refreshData: () => Promise<void>;
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