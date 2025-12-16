import axios, { AxiosError, AxiosInstance } from 'axios';
import type {
  User,
  LoginCredentials,
  AuthResponse,
  Product,
  Sale,
  Inventory,
  Promotion,
  GiftCertificate,
  Location,
  Customer,
  PaginatedResponse,
  ApiError
} from '@/types';

// API Base URL - через Kong
const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000/api';

// Create axios instance
const api: AxiosInstance = axios.create({
  baseURL: API_BASE_URL,
  timeout: 30000,
  headers: {
    'Content-Type': 'application/json',
  },
  withCredentials: true, // Для cookies
});

// Request interceptor - добавляем токен
api.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('accessToken');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

// Response interceptor - обработка ошибок и refresh token
api.interceptors.response.use(
  (response) => response,
  async (error: AxiosError<ApiError>) => {
    const originalRequest = error.config as any;

    // Если 401 и это не запрос на refresh
    if (error.response?.status === 401 && !originalRequest._retry) {
      originalRequest._retry = true;

      try {
        const refreshToken = localStorage.getItem('refreshToken');
        if (!refreshToken) {
          throw new Error('No refresh token');
        }

        // Обновляем токен
        const response = await axios.post(`${API_BASE_URL}/auth/refresh`, {
          refreshToken,
        });

        const { accessToken } = response.data;
        localStorage.setItem('accessToken', accessToken);

        // Повторяем оригинальный запрос
        originalRequest.headers.Authorization = `Bearer ${accessToken}`;
        return api(originalRequest);
      } catch (refreshError) {
        // Если refresh не удался - разлогиниваем
        localStorage.removeItem('accessToken');
        localStorage.removeItem('refreshToken');
        localStorage.removeItem('user');

        // Редирект на логин (если на клиенте)
        if (typeof window !== 'undefined') {
          window.location.href = '/auth/login';
        }

        return Promise.reject(refreshError);
      }
    }

    return Promise.reject(error);
  }
);

// ============================================
// AUTH API
// ============================================

export const authApi = {
  login: async (credentials: LoginCredentials): Promise<AuthResponse> => {
    const { data } = await api.post<AuthResponse>('/auth/login', credentials);
    return data;
  },

  logout: async (): Promise<void> => {
    await api.post('/auth/logout');
    localStorage.removeItem('accessToken');
    localStorage.removeItem('refreshToken');
    localStorage.removeItem('user');
  },

  me: async (): Promise<User> => {
    const { data } = await api.get<User>('/auth/me');
    return data;
  },

  refresh: async (refreshToken: string): Promise<{ accessToken: string }> => {
    const { data } = await api.post('/auth/refresh', { refreshToken });
    return data;
  },
};

// ============================================
// PRODUCTS API
// ============================================

export const productsApi = {
  getAll: async (params?: {
    page?: number;
    limit?: number;
    search?: string;
    categoryId?: string;
  }): Promise<PaginatedResponse<Product>> => {
    const { data } = await api.get<PaginatedResponse<Product>>('/products', { params });
    return data;
  },

  getById: async (id: string): Promise<Product> => {
    const { data } = await api.get<Product>(`/products/${id}`);
    return data;
  },

  create: async (product: Partial<Product>): Promise<Product> => {
    const { data } = await api.post<Product>('/products', product);
    return data;
  },

  update: async (id: string, product: Partial<Product>): Promise<Product> => {
    const { data } = await api.patch<Product>(`/products/${id}`, product);
    return data;
  },

  delete: async (id: string): Promise<void> => {
    await api.delete(`/products/${id}`);
  },

  search: async (query: string): Promise<Product[]> => {
    const { data } = await api.get<Product[]>(`/products/search`, {
      params: { q: query }
    });
    return data;
  },
};

// ============================================
// SALES API
// ============================================

export const salesApi = {
  getAll: async (params?: {
    page?: number;
    limit?: number;
    startDate?: string;
    endDate?: string;
    locationId?: string;
    status?: string;
  }): Promise<PaginatedResponse<Sale>> => {
    const { data } = await api.get<PaginatedResponse<Sale>>('/sales', { params });
    return data;
  },

  getById: async (id: string): Promise<Sale> => {
    const { data } = await api.get<Sale>(`/sales/${id}`);
    return data;
  },

  create: async (sale: {
    locationId: string;
    items: Array<{
      productId: string;
      quantity: number;
      unitPrice: number;
      discountAmount?: number;
      isGift?: boolean;
    }>;
    paymentMethod: string;
    customerPhone?: string;
    customerName?: string;
    promotionId?: string;
    certificateId?: string;
  }): Promise<Sale> => {
    const { data } = await api.post<Sale>('/sales', sale);
    return data;
  },

  cancel: async (id: string): Promise<Sale> => {
    const { data } = await api.post<Sale>(`/sales/${id}/cancel`);
    return data;
  },
};

// ============================================
// INVENTORY API
// ============================================

export const inventoryApi = {
  getByLocation: async (locationId: string): Promise<Inventory[]> => {
    const { data } = await api.get<Inventory[]>('/inventory', {
      params: { locationId },
    });
    return data;
  },

  transfer: async (transfer: {
    productId: string;
    fromLocationId: string;
    toLocationId: string;
    quantity: number;
    reason?: string;
  }): Promise<void> => {
    await api.post('/inventory/transfer', transfer);
  },

  writeOff: async (writeOff: {
    productId: string;
    locationId: string;
    quantity: number;
    reason: string;
  }): Promise<void> => {
    await api.post('/inventory/writeoff', writeOff);
  },

  adjust: async (adjustment: {
    productId: string;
    locationId: string;
    quantity: number;
    reason: string;
  }): Promise<void> => {
    await api.post('/inventory/adjust', adjustment);
  },
};

// ============================================
// PROMOTIONS API
// ============================================

export const promotionsApi = {
  getActive: async (): Promise<Promotion[]> => {
    const { data } = await api.get<Promotion[]>('/promotions/active');
    return data;
  },

  getAll: async (): Promise<Promotion[]> => {
    const { data } = await api.get<Promotion[]>('/promotions');
    return data;
  },

  getById: async (id: string): Promise<Promotion> => {
    const { data } = await api.get<Promotion>(`/promotions/${id}`);
    return data;
  },

  create: async (promotion: Partial<Promotion>): Promise<Promotion> => {
    const { data } = await api.post<Promotion>('/promotions', promotion);
    return data;
  },

  update: async (id: string, promotion: Partial<Promotion>): Promise<Promotion> => {
    const { data } = await api.patch<Promotion>(`/promotions/${id}`, promotion);
    return data;
  },

  delete: async (id: string): Promise<void> => {
    await api.delete(`/promotions/${id}`);
  },
};

// ============================================
// CERTIFICATES API
// ============================================

export const certificatesApi = {
  create: async (amount: number): Promise<GiftCertificate> => {
    const { data } = await api.post<GiftCertificate>('/certificates', { amount });
    return data;
  },

  verify: async (code: string): Promise<GiftCertificate> => {
    const { data } = await api.get<GiftCertificate>(`/certificates/${code}`);
    return data;
  },

  redeem: async (code: string, saleId: string): Promise<void> => {
    await api.post(`/certificates/${code}/redeem`, { saleId });
  },
};

// ============================================
// LOCATIONS API
// ============================================

export const locationsApi = {
  getAll: async (): Promise<Location[]> => {
    const { data } = await api.get<Location[]>('/locations');
    return data;
  },

  getById: async (id: string): Promise<Location> => {
    const { data } = await api.get<Location>(`/locations/${id}`);
    return data;
  },

  create: async (location: Partial<Location>): Promise<Location> => {
    const { data } = await api.post<Location>('/locations', location);
    return data;
  },

  update: async (id: string, location: Partial<Location>): Promise<Location> => {
    const { data } = await api.patch<Location>(`/locations/${id}`, location);
    return data;
  },
};

// ============================================
// CUSTOMERS API
// ============================================

export const customersApi = {
  getAll: async (params?: { page?: number; limit?: number; search?: string }): Promise<PaginatedResponse<Customer>> => {
    const { data } = await api.get<PaginatedResponse<Customer>>('/customers', { params });
    return data;
  },

  getByPhone: async (phone: string): Promise<Customer> => {
    const { data } = await api.get<Customer>(`/customers/phone/${phone}`);
    return data;
  },

  create: async (customer: Partial<Customer>): Promise<Customer> => {
    const { data } = await api.post<Customer>('/customers', customer);
    return data;
  },

  update: async (id: string, customer: Partial<Customer>): Promise<Customer> => {
    const { data } = await api.patch<Customer>(`/customers/${id}`, customer);
    return data;
  },
};

// ============================================
// REPORTS & ANALYTICS API
// ============================================

export interface SalesReport {
  totalSales: number;
  totalRevenue: number;
  averageOrderValue: number;
  topProducts: Array<{
    product: Product;
    quantity: number;
    revenue: number;
  }>;
  salesByDay: Array<{
    date: string;
    count: number;
    revenue: number;
  }>;
  salesByPaymentMethod: Array<{
    method: string;
    count: number;
    amount: number;
  }>;
}

export interface InventoryReport {
  totalProducts: number;
  totalValue: number;
  lowStockProducts: Array<{
    product: Product;
    location: Location;
    quantity: number;
  }>;
  inventoryByLocation: Array<{
    location: Location;
    totalProducts: number;
    totalValue: number;
    quantity: number;
  }>;
  topMovingProducts: Array<{
    product: Product;
    movementsCount: number;
  }>;
}

export const reportsApi = {
  // Аналитика продаж
  getSalesReport: async (params: {
    startDate: string;
    endDate: string;
    locationId?: string;
  }): Promise<SalesReport> => {
    const { data } = await api.get<SalesReport>('/reports/sales', { params });
    return data;
  },

  // Аналитика остатков
  getInventoryReport: async (params?: {
    locationId?: string;
  }): Promise<InventoryReport> => {
    const { data } = await api.get<InventoryReport>('/reports/inventory', { params });
    return data;
  },

  // Отчет по продукту
  getProductReport: async (productId: string, params: {
    startDate: string;
    endDate: string;
  }) => {
    const { data } = await api.get(`/reports/products/${productId}`, { params });
    return data;
  },

  // Отчет по кассиру
  getCashierReport: async (cashierId: string, params: {
    startDate: string;
    endDate: string;
  }) => {
    const { data } = await api.get(`/reports/cashiers/${cashierId}`, { params });
    return data;
  },

  // ABC анализ товаров
  getABCAnalysis: async (params: {
    startDate: string;
    endDate: string;
  }) => {
    const { data } = await api.get('/reports/abc-analysis', { params });
    return data;
  },

  // Отчет по акциям
  getPromotionsReport: async (params: {
    startDate: string;
    endDate: string;
  }) => {
    const { data } = await api.get('/reports/promotions', { params });
    return data;
  },

  // Экспорт в Excel
  exportToExcel: async (reportType: string, params: any): Promise<Blob> => {
    const { data } = await api.get(`/reports/export/${reportType}`, {
      params,
      responseType: 'blob',
    });
    return data;
  },
};

// ============================================
// USERS API (Admin only)
// ============================================

export const usersApi = {
  getAll: async (): Promise<User[]> => {
    const { data } = await api.get<User[]>('/users');
    return data;
  },

  getById: async (id: string): Promise<User> => {
    const { data } = await api.get<User>(`/users/${id}`);
    return data;
  },

  create: async (user: Partial<User> & { password: string }): Promise<User> => {
    const { data } = await api.post<User>('/users', user);
    return data;
  },

  update: async (id: string, user: Partial<User>): Promise<User> => {
    const { data } = await api.patch<User>(`/users/${id}`, user);
    return data;
  },

  delete: async (id: string): Promise<void> => {
    await api.delete(`/users/${id}`);
  },
};

// Default export
export default api;
