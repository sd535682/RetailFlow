import api from './api';
import { Product } from '../types';

export interface ProductFilters {
  page?: number;
  limit?: number;
  search?: string;
  category?: string;
  supplierId?: string;
  stockStatus?: 'all' | 'LOW_STOCK' | 'OUT_OF_STOCK' | 'IN_STOCK';
  sortBy?: string;
  sortOrder?: 'asc' | 'desc';
}

export interface ProductResponse {
  success: boolean;
  data: Product[];
  pagination: {
    page: number;
    limit: number;
    total: number;
    pages: number;
  };
}

export interface SingleProductResponse {
  success: boolean;
  data: Product;
}

export interface ReportResponse {
  success: boolean;
  data: any;
  count?: number;
}

export const productService = {
  // Get all products with filtering and pagination
  getProducts: async (filters: ProductFilters = {}): Promise<ProductResponse> => {
    const params = new URLSearchParams();
    
    Object.entries(filters).forEach(([key, value]) => {
      if (value !== undefined && value !== null && value !== '') {
        params.append(key, value.toString());
      }
    });

    const response = await api.get(`/products?${params.toString()}`);
    return response.data;
  },

  // Get single product by ID
  getProduct: async (id: string): Promise<SingleProductResponse> => {
    const response = await api.get(`/products/${id}`);
    return response.data;
  },

  // Create new product
  createProduct: async (productData: Omit<Product, 'id' | 'lastUpdated'>): Promise<SingleProductResponse> => {
    const response = await api.post('/products', productData);
    return response.data;
  },

  // Update product
  updateProduct: async (id: string, productData: Partial<Product>): Promise<SingleProductResponse> => {
    const response = await api.put(`/products/${id}`, productData);
    return response.data;
  },

  // Delete product
  deleteProduct: async (id: string): Promise<{ success: boolean; message: string }> => {
    const response = await api.delete(`/products/${id}`);
    return response.data;
  },

  // Get low stock products
  getLowStockProducts: async (): Promise<ReportResponse> => {
    const response = await api.get('/products/reports/low-stock');
    return response.data;
  },

  // Get inventory value report
  getInventoryValue: async (): Promise<ReportResponse> => {
    const response = await api.get('/products/reports/inventory-value');
    return response.data;
  },

  // Get products by supplier
  getProductsBySupplier: async (): Promise<ReportResponse> => {
    const response = await api.get('/products/reports/by-supplier');
    return response.data;
  },
};