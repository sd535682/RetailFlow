import { Product } from "../types";

// Helper utility functions for data processing and formatting
export const generateId = (prefix: string = "id"): string => {
  return `${prefix}-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
};

export const formatCurrency = (amount: number): string => {
  return new Intl.NumberFormat("en-US", {
    style: "currency",
    currency: "USD",
  }).format(amount);
};

export const formatDate = (dateString: string): string => {
  return new Intl.DateTimeFormat("en-US", {
    year: "numeric",
    month: "short",
    day: "numeric",
  }).format(new Date(dateString));
};

export const formatDateTime = (dateString: string): string => {
  return new Intl.DateTimeFormat("en-US", {
    year: "numeric",
    month: "short",
    day: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  }).format(new Date(dateString));
};

export const calculateInventoryValue = (products: Product[]): number => {
  return products.reduce(
    (total, product) => total + product.quantity * product.price,
    0
  );
};

export const getLowStockProducts = (products: Product[]): Product[] => {
  return products.filter((product) => product.quantity <= product.minimumStock);
};

export const debounce = <T extends (...args: unknown[]) => unknown>(
  func: T,
  delay: number
): ((...args: Parameters<T>) => void) => {
  let timeoutId: ReturnType<typeof setTimeout>;
  return (...args: Parameters<T>) => {
    clearTimeout(timeoutId);
    timeoutId = setTimeout(() => func(...args), delay);
  };
};

export const validateRequired = (value: string | number): boolean => {
  if (typeof value === "string") return value.trim().length > 0;
  if (typeof value === "number") return !isNaN(value) && value >= 0;
  return value != null;
};

export const validateEmail = (email: string): boolean => {
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  return emailRegex.test(email);
};

export const validatePhone = (phone: string): boolean => {
  const phoneRegex = /^\(?\d{3}\)?[-.\s]?\d{3}[-.\s]?\d{4}$/;
  return phoneRegex.test(phone);
};

export const validateSKU = (
  sku: string,
  existingProducts: Product[],
  currentProductId?: string
): boolean => {
  if (!sku.trim()) return false;
  return !existingProducts.some(
    (product) => product.sku === sku && product.id !== currentProductId
  );
};
