import api from './api';
import { Transaction } from '../types';

export interface TransactionFilters {
  page?: number;
  limit?: number;
  type?: 'PURCHASE' | 'SALE' | 'ADJUSTMENT';
  productId?: string;
  supplierId?: string;
  startDate?: string;
  endDate?: string;
  sortBy?: string;
  sortOrder?: 'asc' | 'desc';
}

export interface TransactionResponse {
  success: boolean;
  data: Transaction[];
  pagination: {
    page: number;
    limit: number;
    total: number;
    pages: number;
  };
}

export interface SingleTransactionResponse {
  success: boolean;
  data: Transaction;
}

export interface ReportResponse {
  success: boolean;
  data: any;
}

export const transactionService = {
  // Get all transactions with filtering and pagination
  getTransactions: async (filters: TransactionFilters = {}): Promise<TransactionResponse> => {
    const params = new URLSearchParams();
    
    Object.entries(filters).forEach(([key, value]) => {
      if (value !== undefined && value !== null && value !== '') {
        params.append(key, value.toString());
      }
    });

    const response = await api.get(`/transactions?${params.toString()}`);
    return response.data;
  },

  // Get single transaction by ID
  getTransaction: async (id: string): Promise<SingleTransactionResponse> => {
    const response = await api.get(`/transactions/${id}`);
    return response.data;
  },

  // Create new transaction
  createTransaction: async (transactionData: Omit<Transaction, 'id' | 'date'>): Promise<SingleTransactionResponse> => {
    const response = await api.post('/transactions', transactionData);
    return response.data;
  },

  // Update transaction
  updateTransaction: async (id: string, transactionData: Partial<Transaction>): Promise<SingleTransactionResponse> => {
    const response = await api.put(`/transactions/${id}`, transactionData);
    return response.data;
  },

  // Delete transaction
  deleteTransaction: async (id: string): Promise<{ success: boolean; message: string }> => {
    const response = await api.delete(`/transactions/${id}`);
    return response.data;
  },

  // Get transaction summary report
  getTransactionSummary: async (filters: { startDate?: string; endDate?: string } = {}): Promise<ReportResponse> => {
    const params = new URLSearchParams();
    
    Object.entries(filters).forEach(([key, value]) => {
      if (value !== undefined && value !== null && value !== '') {
        params.append(key, value.toString());
      }
    });

    const response = await api.get(`/transactions/reports/summary?${params.toString()}`);
    return response.data;
  },
};