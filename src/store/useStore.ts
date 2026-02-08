import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import type { StoreState, Product, Transaction, User, Promo, Shift, Category } from '../types';

const INITIAL_USERS: User[] = [
  { id: '1', name: 'Admin', role: 'admin', pin: '1234' },
  { id: '2', name: 'Kasir 1', role: 'cashier', pin: '0000' },
];

const INITIAL_CATEGORIES: Category[] = [
  { id: '1', name: 'Makanan' },
  { id: '2', name: 'Minuman' },
  { id: '3', name: 'Snack' },
  { id: '4', name: 'Lainnya' },
];

const INITIAL_PRODUCTS: Product[] = [
  { id: '1', name: 'Kopi Susu Gula Aren', price: 18000, cost: 10000, stock: 50, category: 'Minuman' },
  { id: '2', name: 'Americano', price: 15000, cost: 8000, stock: 50, category: 'Minuman' },
  { id: '3', name: 'Croissant', price: 25000, cost: 15000, stock: 20, category: 'Makanan' },
  { id: '4', name: 'Kentang Goreng', price: 20000, cost: 10000, stock: 100, category: 'Snack' },
];

const INITIAL_PROMOS: Promo[] = [
  { id: '1', name: 'Opening Promo', type: 'percentage', value: 10, code: 'OPEN10', active: true },
  { id: '2', name: 'Potongan 5rb', type: 'fixed', value: 5000, code: 'HEMAT5', minPurchase: 50000, active: true },
];

export const useStore = create<StoreState>()(
  persist(
    (set, get) => ({
      user: null,
      users: INITIAL_USERS,
      products: INITIAL_PRODUCTS,
      categories: INITIAL_CATEGORIES,
      cart: [],
      transactions: [],
      promos: INITIAL_PROMOS,
      shifts: [],
      activeShift: null,
      activityLogs: [],

      logActivity: (action, details) => {
        set((state) => {
          if (!state.user) return state;
          const newLog: import('../types').ActivityLog = {
            id: crypto.randomUUID(),
            userId: state.user.id,
            userName: state.user.name,
            action,
            details,
            timestamp: new Date().toISOString(),
          };
          return { activityLogs: [newLog, ...state.activityLogs] };
        });
      },

      login: (pin) => {
        const { users } = get();
        const user = users.find((u) => u.pin === pin);
        if (user) {
          set({ user });
          get().logActivity('Login', 'User logged in');
          return true;
        }
        return false;
      },

      logout: () => {
        get().logActivity('Logout', 'User logged out');
        set({ user: null });
      },

      addUser: (user) => {
        set((state) => ({
          users: [
            ...state.users,
            { ...user, id: crypto.randomUUID() },
          ],
        }));
        get().logActivity('Add User', `Added user: ${user.name}`);
      },

      updateUser: (id, updates) => {
        set((state) => ({
          users: state.users.map((u) =>
            u.id === id ? { ...u, ...updates } : u
          ),
        }));
        get().logActivity('Update User', `Updated user ID: ${id}`);
      },

      deleteUser: (id) => {
        const user = get().users.find(u => u.id === id);
        set((state) => ({
          users: state.users.filter((u) => u.id !== id),
        }));
        get().logActivity('Delete User', `Deleted user: ${user?.name || id}`);
      },

      addProduct: (product) => {
        set((state) => ({
          products: [
            ...state.products,
            { ...product, id: crypto.randomUUID() },
          ],
        }));
        get().logActivity('Add Product', `Added product: ${product.name}`);
      },

      updateProduct: (id, updates) => {
        const product = get().products.find(p => p.id === id);
        set((state) => ({
          products: state.products.map((p) =>
            p.id === id ? { ...p, ...updates } : p
          ),
        }));
        
        let details = `Updated product: ${product?.name}`;
        if (updates.price) details += `, Price changed to ${updates.price}`;
        get().logActivity('Update Product', details);
      },

      deleteProduct: (id) => {
        const product = get().products.find(p => p.id === id);
        set((state) => ({
          products: state.products.filter((p) => p.id !== id),
        }));
        get().logActivity('Delete Product', `Deleted product: ${product?.name || id}`);
      },

      addCategory: (name) => {
        set((state) => ({
          categories: [
            ...state.categories,
            { id: crypto.randomUUID(), name },
          ],
        }));
        get().logActivity('Add Category', `Added category: ${name}`);
      },

      updateCategory: (id, name) => {
        set((state) => ({
          categories: state.categories.map((c) =>
            c.id === id ? { ...c, name } : c
          ),
        }));
        get().logActivity('Update Category', `Updated category ID: ${id} to ${name}`);
      },

      deleteCategory: (id) => {
        const category = get().categories.find(c => c.id === id);
        set((state) => ({
          categories: state.categories.filter((c) => c.id !== id),
        }));
        get().logActivity('Delete Category', `Deleted category: ${category?.name || id}`);
      },

      addPromo: (promo) => {
        set((state) => ({
          promos: [
            ...state.promos,
            { ...promo, id: crypto.randomUUID() },
          ],
        }));
        get().logActivity('Add Promo', `Added promo: ${promo.name}`);
      },

      updatePromo: (id, updates) => {
        const promo = get().promos.find(p => p.id === id);
        set((state) => ({
          promos: state.promos.map((p) =>
            p.id === id ? { ...p, ...updates } : p
          ),
        }));
        get().logActivity('Update Promo', `Updated promo: ${promo?.name}`);
      },

      deletePromo: (id) => {
        const promo = get().promos.find(p => p.id === id);
        set((state) => ({
          promos: state.promos.filter((p) => p.id !== id),
        }));
        get().logActivity('Delete Promo', `Deleted promo: ${promo?.name}`);
      },

      startShift: (startCash) =>
        set((state) => {
          if (!state.user || state.activeShift) return state;
          const newShift: Shift = {
            id: crypto.randomUUID(),
            cashierId: state.user.id,
            cashierName: state.user.name,
            startTime: new Date().toISOString(),
            startCash,
            status: 'open',
          };
          return {
            activeShift: newShift,
            shifts: [newShift, ...state.shifts],
          };
        }),

      endShift: (actualCash, actualQris) =>
        set((state) => {
          const { activeShift, transactions } = state;
          if (!activeShift) return state;

          // Calculate expected cash
          // Start Cash + Cash Transactions during this shift
          const cashTransactions = transactions.filter(
            (t) => t.cashierId === activeShift.cashierId && 
                   t.paymentMethod === 'cash' &&
                   new Date(t.date) >= new Date(activeShift.startTime)
          );

          // Calculate expected QRIS
          const qrisTransactions = transactions.filter(
            (t) => t.cashierId === activeShift.cashierId && 
                   t.paymentMethod === 'qris' &&
                   new Date(t.date) >= new Date(activeShift.startTime)
          );

          const totalCashTransaction = cashTransactions.reduce((sum, t) => sum + t.total, 0);
          const totalQrisTransaction = qrisTransactions.reduce((sum, t) => sum + t.total, 0);
          
          const expectedCash = activeShift.startCash + totalCashTransaction;
          const expectedQris = totalQrisTransaction;
          
          const difference = actualCash - expectedCash;
          const qrisDifference = actualQris - expectedQris;

          const closedShift: Shift = {
            ...activeShift,
            endTime: new Date().toISOString(),
            expectedCash,
            actualCash,
            difference,
            expectedQris,
            actualQris,
            qrisDifference,
            status: 'closed',
          };

          return {
            activeShift: null,
            shifts: state.shifts.map((s) => s.id === activeShift.id ? closedShift : s),
          };
        }),

      addToCart: (product) =>
        set((state) => {
          const existing = state.cart.find((item) => item.id === product.id);
          if (existing) {
            return {
              cart: state.cart.map((item) =>
                item.id === product.id ? { ...item, qty: item.qty + 1 } : item
              ),
            };
          }
          return { cart: [...state.cart, { ...product, qty: 1 }] };
        }),

      removeFromCart: (productId) =>
        set((state) => ({
          cart: state.cart.filter((item) => item.id !== productId),
        })),

      updateCartQty: (productId, qty) =>
        set((state) => {
          if (qty <= 0) {
            return {
              cart: state.cart.filter((item) => item.id !== productId),
            };
          }
          return {
            cart: state.cart.map((item) =>
              item.id === productId ? { ...item, qty } : item
            ),
          };
        }),

      clearCart: () => set({ cart: [] }),

      processTransaction: (paymentMethod, discount = 0) =>
        set((state) => {
          if (!state.user || !state.activeShift) return state;

          const subtotal = state.cart.reduce(
            (sum, item) => sum + item.price * item.qty,
            0
          );
          const total = subtotal - discount;

          const transaction: Transaction = {
            id: crypto.randomUUID(),
            date: new Date().toISOString(),
            subtotal,
            discount,
            total,
            items: [...state.cart],
            cashierId: state.user.id,
            cashierName: state.user.name,
            paymentMethod,
            status: 'valid',
          };

          // Reduce stock
          const newProducts = state.products.map((p) => {
            const cartItem = state.cart.find((c) => c.id === p.id);
            if (cartItem) {
              return { ...p, stock: p.stock - cartItem.qty };
            }
            return p;
          });

          return {
            transactions: [transaction, ...state.transactions],
            cart: [],
            products: newProducts,
          };
        }),

      voidTransaction: (transactionId, reason, adminName) => {
        const transaction = get().transactions.find((t) => t.id === transactionId);
        if (!transaction || transaction.status === 'void') return;

        set((state) => {
          // 1. Mark transaction as void
          const updatedTransactions = state.transactions.map((t) =>
            t.id === transactionId
              ? {
                  ...t,
                  status: 'void' as const,
                  voidReason: reason,
                  voidBy: adminName,
                  voidAt: new Date().toISOString(),
                }
              : t
          );

          // 2. Restore stock
          const updatedProducts = state.products.map((p) => {
            const item = transaction.items.find((i) => i.id === p.id);
            if (item) {
              return { ...p, stock: p.stock + item.qty };
            }
            return p;
          });

          return {
            transactions: updatedTransactions,
            products: updatedProducts,
          };
        });

        get().logActivity('Void Transaction', `Voided transaction ${transactionId.slice(0, 8)}... by ${adminName}. Reason: ${reason}`);
      },
    }),
    {
      name: 'pos-storage',
      version: 1,
      migrate: (persistedState: any, version: number) => {
        if (version === 0) {
          return {
            ...persistedState,
            promos: persistedState.promos || INITIAL_PROMOS,
            shifts: persistedState.shifts || [],
            activeShift: persistedState.activeShift || null,
            user: persistedState.user ? { ...persistedState.user, role: persistedState.user.role || 'cashier' } : null,
            users: persistedState.users || INITIAL_USERS,
          };
        }
        return persistedState as StoreState;
      },
    }
  )
);
