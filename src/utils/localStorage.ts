// Utility functions for localStorage operations with error handling
const STORAGE_KEYS = {
  PRODUCTS: 'inventory_products',
  SUPPLIERS: 'inventory_suppliers',
  TRANSACTIONS: 'inventory_transactions',
} as const;

// Generic localStorage utilities with error handling
export const storage = {
  get: <T>(key: string, defaultValue: T): T => {
    try {
      const item = localStorage.getItem(key);
      return item ? JSON.parse(item) : defaultValue;
    } catch (error) {
      console.error(`Error reading from localStorage key "${key}":`, error);
      return defaultValue;
    }
  },

  set: <T>(key: string, value: T): boolean => {
    try {
      localStorage.setItem(key, JSON.stringify(value));
      return true;
    } catch (error) {
      console.error(`Error writing to localStorage key "${key}":`, error);
      return false;
    }
  },

  remove: (key: string): boolean => {
    try {
      localStorage.removeItem(key);
      return true;
    } catch (error) {
      console.error(`Error removing localStorage key "${key}":`, error);
      return false;
    }
  },
};

// Specific data access functions
export const productStorage = {
  getAll: () => storage.get(STORAGE_KEYS.PRODUCTS, []),
  save: (products: any[]) => storage.set(STORAGE_KEYS.PRODUCTS, products),
};

export const supplierStorage = {
  getAll: () => storage.get(STORAGE_KEYS.SUPPLIERS, []),
  save: (suppliers: any[]) => storage.set(STORAGE_KEYS.SUPPLIERS, suppliers),
};

export const transactionStorage = {
  getAll: () => storage.get(STORAGE_KEYS.TRANSACTIONS, []),
  save: (transactions: any[]) => storage.set(STORAGE_KEYS.TRANSACTIONS, transactions),
};

// Initialize with sample data if empty
export const initializeSampleData = () => {
  const products = productStorage.getAll();
  const suppliers = supplierStorage.getAll();
  const transactions = transactionStorage.getAll();

  if (suppliers.length === 0) {
    const sampleSuppliers = [
      {
        id: 'sup-1',
        name: 'Green Earth Supplies',
        email: 'contact@greenearthsupplies.com',
        phone: '(555) 123-4567',
        address: '123 Eco Street, Green Valley, CA 90210',
        activeStatus: true,
        createdAt: new Date().toISOString(),
        contactPerson: 'Alex Johnson',
      },
      {
        id: 'sup-2',
        name: 'Sustainable Trends Co.',
        email: 'info@sustainabletrends.com',
        phone: '(555) 987-6543',
        address: '456 Organic Ave, Eco City, CA 90211',
        activeStatus: true,
        createdAt: new Date().toISOString(),
        contactPerson: 'Sarah Lee',
      },
      {
        id: 'sup-3',
        name: 'EcoWrite Inc.',
        email: 'hello@ecowrite.com',
        phone: '(555) 246-8135',
        address: '789 Paper Lane, Recycled Park, CA 90212',
        activeStatus: true,
        createdAt: new Date().toISOString(),
        contactPerson: 'David Chen',
      },
    ];
    supplierStorage.save(sampleSuppliers);
  }

  if (products.length === 0) {
    const sampleProducts = [
      {
        id: 'prod-1',
        name: 'Eco-Friendly Bamboo Toothbrushes',
        sku: 'SKU12345',
        quantity: 250,
        price: 2.50,
        supplierId: 'sup-1',
        minimumStock: 50,
        lastUpdated: new Date().toISOString(),
        category: 'Personal Care',
        description: 'Biodegradable bamboo toothbrushes with soft bristles',
      },
      {
        id: 'prod-2',
        name: 'Organic Cotton T-shirts',
        sku: 'SKU67890',
        quantity: 150,
        price: 15.00,
        supplierId: 'sup-2',
        minimumStock: 25,
        lastUpdated: new Date().toISOString(),
        category: 'Clothing',
        description: '100% organic cotton t-shirts in various sizes',
      },
      {
        id: 'prod-3',
        name: 'Recycled Paper Notebooks',
        sku: 'SKU11223',
        quantity: 300,
        price: 3.00,
        supplierId: 'sup-3',
        minimumStock: 100,
        lastUpdated: new Date().toISOString(),
        category: 'Stationery',
        description: 'A5 notebooks made from 100% recycled paper',
      },
      {
        id: 'prod-4',
        name: 'Reusable Silicone Food Bags',
        sku: 'SKU44556',
        quantity: 45,
        price: 8.00,
        supplierId: 'sup-1',
        minimumStock: 50,
        lastUpdated: new Date().toISOString(),
        category: 'Kitchen',
        description: 'Set of 3 reusable silicone food storage bags',
      },
      {
        id: 'prod-5',
        name: 'Natural Soy Wax Candles',
        sku: 'SKU77889',
        quantity: 100,
        price: 12.00,
        supplierId: 'sup-2',
        minimumStock: 30,
        lastUpdated: new Date().toISOString(),
        category: 'Home Decor',
        description: 'Hand-poured soy wax candles with essential oils',
      },
    ];
    productStorage.save(sampleProducts);
  }
};