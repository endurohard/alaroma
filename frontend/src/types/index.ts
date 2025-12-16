// User Roles
export type UserRole = 'admin' | 'manager' | 'cashier' | 'salesperson' | 'warehouse_worker';

// User
export interface User {
  id: string;
  email: string;
  full_name: string;
  phone?: string;
  role: UserRole;
  location_id?: string;
  is_active: boolean;
  last_login_at?: string;
  created_at: string;
  updated_at: string;
}

// Auth
export interface LoginCredentials {
  email: string;
  password: string;
}

export interface AuthResponse {
  user: User;
  access_token: string;
  refresh_token: string;
}

// Location
export type LocationType = 'central_warehouse' | 'store';

export interface Location {
  id: string;
  name: string;
  type: LocationType;
  address?: string;
  phone?: string;
  is_active: boolean;
  created_at: string;
  updated_at: string;
}

// Product
export interface Category {
  id: string;
  name: string;
  description?: string;
  parent_id?: string;
  created_at: string;
  updated_at: string;
}

export interface Product {
  id: string;
  sku: string;
  name: string;
  description?: string;
  category_id?: string;
  category?: Category;
  base_price: number;
  cost_price?: number;
  barcode?: string;
  is_active: boolean;
  created_at: string;
  updated_at: string;
}

// Inventory
export interface Inventory {
  id: string;
  productId: string;
  product?: Product;
  locationId: string;
  location?: Location;
  quantity: number;
  reservedQuantity: number;
  updatedAt: string;
}

// Sales
export type PaymentMethod = 'cash' | 'card' | 'certificate' | 'mixed';
export type SaleStatus = 'pending' | 'completed' | 'cancelled' | 'refunded';

export interface SaleItem {
  id: string;
  saleId: string;
  productId: string;
  product?: Product;
  quantity: number;
  unitPrice: number;
  discountAmount: number;
  totalPrice: number;
  isGift: boolean;
  createdAt: string;
}

export interface Sale {
  id: string;
  saleNumber: string;
  locationId: string;
  location?: Location;
  cashierId: string;
  cashier?: User;
  customerPhone?: string;
  customerName?: string;
  subtotal: number;
  discountAmount: number;
  totalAmount: number;
  paymentMethod: PaymentMethod;
  status: SaleStatus;
  promotionId?: string;
  certificateId?: string;
  notes?: string;
  items?: SaleItem[];
  createdAt: string;
  updatedAt: string;
}

// Promotions
export type PromotionType = 'birthday_discount' | 'buy_2_get_1' | 'combo_deal' | 'percentage_discount' | 'fixed_discount';

export interface Promotion {
  id: string;
  name: string;
  type: PromotionType;
  description?: string;
  discountPercentage?: number;
  discountAmount?: number;
  minPurchaseAmount?: number;
  maxGiftPrice?: number;
  isActive: boolean;
  startDate?: string;
  endDate?: string;
  createdAt: string;
  updatedAt: string;
}

// Gift Certificates
export type CertificateStatus = 'active' | 'used' | 'expired' | 'cancelled';

export interface GiftCertificate {
  id: string;
  code: string;
  amount: number;
  status: CertificateStatus;
  issuedBy?: string;
  issuedAt: string;
  usedAt?: string;
  usedInSaleId?: string;
  expiresAt?: string;
  createdAt: string;
}

// Inventory Movements
export type MovementType = 'receipt' | 'transfer' | 'sale' | 'write_off' | 'adjustment';

export interface InventoryMovement {
  id: string;
  movementNumber: string;
  type: MovementType;
  productId: string;
  product?: Product;
  fromLocationId?: string;
  fromLocation?: Location;
  toLocationId?: string;
  toLocation?: Location;
  quantity: number;
  reason?: string;
  performedBy: string;
  performer?: User;
  saleId?: string;
  createdAt: string;
}

// Customers
export interface Customer {
  id: string;
  phone: string;
  fullName?: string;
  email?: string;
  birthDate?: string;
  totalPurchases: number;
  visitCount: number;
  lastVisitAt?: string;
  createdAt: string;
  updatedAt: string;
}

// API Response Types
export interface PaginatedResponse<T> {
  data: T[];
  total: number;
  page: number;
  limit: number;
  totalPages: number;
}

export interface ApiError {
  message: string;
  statusCode: number;
  error?: string;
}

// Cart для POS
export interface CartItem {
  product: Product;
  quantity: number;
  unitPrice: number;
  discount: number;
  isGift: boolean;
}

export interface Cart {
  items: CartItem[];
  subtotal: number;
  discount: number;
  total: number;
  promotion?: Promotion;
  certificate?: GiftCertificate;
}
