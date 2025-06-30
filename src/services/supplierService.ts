import api from './api';
import { Supplier } from '../types';

export interface SupplierFilters {
  page?: number;
  limit?: number;
  search?: string;
  activeOnly?: boolean;
  sortBy?: string;
  sortOrder?: 'asc' | 'desc';
}

export interface SupplierResponse {
  success: boolean;
  data: (Supplier & { productCount?: number })[];
  pagination: {
    page: number;
    limit: number;
    total: number;
    pages: number;
  };
}

export interface SingleSupplierResponse {
  success: boolean;
  data: Supplier & { products?: any[] };
}

export interface ReportResponse {
  success: boolean;
  data: any;
}

export const supplierService = {
  // Get all suppliers with filtering and pagination
  getSuppliers: async (filters: SupplierFilters = {}): Promise<SupplierResponse> => {
    const params = new URLSearchParams();
    
    Object.entries(filters).forEach(([key, value]) => {
      if (value !== undefined && value !== null && value !== '') {
        params.append(key, value.toString());
      }
    });

    const response = await api.get(`/suppliers?${params.toString()}`);
    return response.data;
  },

  // Get single supplier by ID
  getSupplier: async (id: string): Promise<SingleSupplierResponse> => {
    const response = await api.get(`/suppliers/${id}`);
    return response.data;
  },

  // Create new supplier
  createSupplier: async (supplierData: Omit<Supplier, 'id' | 'createdAt'>): Promise<SingleSupplierResponse> => {
    // Transform address format for backend
    const backendData = {
      ...supplierData,
      address: {
        street: supplierData.address || '',
        city: 'Unknown', // Default values - you may want to update the form
        country: 'USA'
      }
    };
    
    const response = await api.post('/suppliers', backendData);
    return response.data;
  },

  // Update supplier
  updateSupplier: async (id: string, supplierData: Partial<Supplier>): Promise<SingleSupplierResponse> => {
    // Transform address format for backend if address is being updated
    const backendData = { ...supplierData };
    if (supplierData.address && typeof supplierData.address === 'string') {
      backendData.address = {
        street: supplierData.address,
        city: 'Unknown',
        country: 'USA'
      };
    }
    
    const response = await api.put(`/suppliers/${id}`, backendData);
    return response.data;
  },

  // Delete supplier
  deleteSupplier: async (id: string): Promise<{ success: boolean; message: string }> => {
    const response = await api.delete(`/suppliers/${id}`);
    return response.data;
  },

  // Get supplier performance report
  getSupplierPerformance: async (): Promise<ReportResponse> => {
    const response = await api.get('/suppliers/reports/performance');
    return response.data;
  },
};