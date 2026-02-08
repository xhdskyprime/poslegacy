export type Role = 'admin' | 'cashier';

export interface User {
  id: string;
  name: string;
  role: Role;
  pin: string; // Simple PIN for login
}

export interface Category {
  id: string;
  name: string;
}

export interface Product {
  id: string;
  name: string;
  price: number;
  cost: number; // For profit calculation
  stock: number;
  category: string;
  barcode?: string;
}

export interface CartItem extends Product {
  qty: number;
}

export interface Transaction {
  id: string;
  date: string; // ISO string
  subtotal: number;
  discount: number;
  total: number;
  items: CartItem[];
  cashierId: string;
  cashierName: string;
  paymentMethod: 'cash' | 'qris';
  status: 'valid' | 'void';
  voidReason?: string;
  voidBy?: string; // Admin name
  voidAt?: string; // ISO string
}

export interface ActivityLog {
  id: string;
  userId: string;
  userName: string;
  action: string;
  details?: string;
  timestamp: string; // ISO string
}

export interface Promo {
  id: string;
  name: string;
  type: 'percentage' | 'fixed';
  value: number;
  code: string;
  minPurchase?: number;
  active: boolean;
}

export interface Shift {
  id: string;
  cashierId: string;
  cashierName: string;
  startTime: string; // ISO string
  endTime?: string; // ISO string
  startCash: number;
  expectedCash?: number;
  actualCash?: number;
  difference?: number;
  
  // QRIS Tracking
  expectedQris?: number;
  actualQris?: number;
  qrisDifference?: number;
  
  status: 'open' | 'closed';
}

export interface StoreState {
  user: User | null;
  users: User[];
  products: Product[];
  categories: Category[];
  cart: CartItem[];
  transactions: Transaction[];
  promos: Promo[];
  shifts: Shift[];
  activeShift: Shift | null;
  activityLogs: ActivityLog[];
  
  // User Actions
  login: (pin: string) => boolean;
  logout: () => void;
  addUser: (user: Omit<User, 'id'>) => void;
  updateUser: (id: string, updates: Partial<User>) => void;
  deleteUser: (id: string) => void;
  
  // Audit Actions
  logActivity: (action: string, details?: string) => void;
  
  // Product Actions
  addProduct: (product: Omit<Product, 'id'>) => void;
  updateProduct: (id: string, updates: Partial<Product>) => void;
  deleteProduct: (id: string) => void;

  // Category Actions
  addCategory: (name: string) => void;
  updateCategory: (id: string, name: string) => void;
  deleteCategory: (id: string) => void;

  // Promo Actions
  addPromo: (promo: Omit<Promo, 'id'>) => void;
  updatePromo: (id: string, updates: Partial<Promo>) => void;
  deletePromo: (id: string) => void;

  // Shift Actions
  startShift: (startCash: number) => void;
  endShift: (actualCash: number, actualQris: number) => void;

  // Cart Actions
  addToCart: (product: Product) => void;
  removeFromCart: (productId: string) => void;
  updateCartQty: (productId: string, qty: number) => void;
  clearCart: () => void;

  // Transaction Actions
  processTransaction: (paymentMethod: 'cash' | 'qris', discount?: number) => void;
  voidTransaction: (transactionId: string, reason: string, adminName: string) => void;
}
