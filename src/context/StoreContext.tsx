import React, { createContext, useContext, useState, useEffect, useMemo } from 'react';
import {
  Product,
  Supplier,
  SaleRecord,
  PurchaseOrder,
  Alert,
  InventoryTransaction,
  BusinessProfile,
  UserSettings,
  StockStatus,
  TransactionType,
} from '../types';
import {
  INITIAL_BUSINESS_PROFILE,
  INITIAL_SUPPLIERS,
  INITIAL_PRODUCTS,
  INITIAL_PURCHASE_ORDERS,
  INITIAL_ALERTS,
  INITIAL_TRANSACTIONS,
  generateDemoSales,
} from '../data/demoData';
import { getStockStatus, calculateReorderRecommendation } from '../utils/forecasting';

interface StoreKPIs {
  totalProducts: number;
  totalInventoryValue: number;
  totalRetailValue: number;
  lowStockCount: number;
  outOfStockCount: number;
  criticalStockCount: number;
  overstockedCount: number;
  predictedStockouts: number;
  estimatedMonthlySales: number;
  estimatedMonthlyRevenue: number;
  healthyStockCount: number;
  // Period comparisons (last 30D vs previous 30D)
  current30dRevenue: number;
  previous30dRevenue: number;
  revenueGrowthPercent: number;
  current30dUnits: number;
  previous30dUnits: number;
  unitsGrowthPercent: number;
}

interface UserAuth {
  id: string;
  name: string;
  email: string;
  avatarUrl?: string;
}

interface StoreContextType {
  businessProfile: BusinessProfile;
  products: Product[];
  sales: SaleRecord[];
  suppliers: Supplier[];
  purchaseOrders: PurchaseOrder[];
  alerts: Alert[];
  transactions: InventoryTransaction[];
  userSettings: UserSettings;
  isDemoMode: boolean;
  currentUser: UserAuth | null;
  kpis: StoreKPIs;
  unreadAlertsCount: number;

  // Actions
  addProduct: (product: Omit<Product, 'id' | 'createdAt' | 'updatedAt'>) => void;
  updateProduct: (id: string, updates: Partial<Product>) => void;
  deleteProduct: (id: string) => void;
  adjustStock: (productId: string, quantityChange: number, type: TransactionType, reason: string) => void;
  recordSale: (sale: Omit<SaleRecord, 'id'>) => void;
  importSales: (records: Array<Omit<SaleRecord, 'id'>>) => void;
  createPurchaseOrder: (po: Omit<PurchaseOrder, 'id' | 'orderNumber'>) => PurchaseOrder;
  updatePurchaseOrder: (id: string, updates: Partial<PurchaseOrder>) => void;
  receivePurchaseOrder: (id: string) => boolean;
  cancelPurchaseOrder: (id: string) => void;
  addSupplier: (supplier: Omit<Supplier, 'id'>) => void;
  updateSupplier: (id: string, updates: Partial<Supplier>) => void;
  deleteSupplier: (id: string) => void;
  markAlertRead: (id: string) => void;
  dismissAlert: (id: string) => void;
  markAllAlertsRead: () => void;
  resetToDemoData: () => void;
  clearToFreshStore: (profile?: Partial<BusinessProfile>) => void;
  updateBusinessProfile: (profile: Partial<BusinessProfile>) => void;
  updateUserSettings: (settings: Partial<UserSettings>) => void;
  loginUser: (email: string, name?: string) => void;
  logoutUser: () => void;
}

const STORAGE_KEY = 'stocksense_store_state_v1';

const DEFAULT_SETTINGS: UserSettings = {
  leadTimeBufferDays: 2,
  safetyStockFactor: 1.65,
  overstockDaysThreshold: 60,
  enableAlertNotifications: true,
  lowStockThresholdPercent: 20,
};

const StoreContext = createContext<StoreContextType | undefined>(undefined);

export const StoreProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  // Load initial state from LocalStorage or fall back to realistic demo data
  const [businessProfile, setBusinessProfile] = useState<BusinessProfile>(() => {
    try {
      const saved = localStorage.getItem(`${STORAGE_KEY}_profile`);
      return saved ? JSON.parse(saved) : INITIAL_BUSINESS_PROFILE;
    } catch {
      return INITIAL_BUSINESS_PROFILE;
    }
  });

  const [products, setProducts] = useState<Product[]>(() => {
    try {
      const saved = localStorage.getItem(`${STORAGE_KEY}_products`);
      return saved ? JSON.parse(saved) : INITIAL_PRODUCTS;
    } catch {
      return INITIAL_PRODUCTS;
    }
  });

  const [sales, setSales] = useState<SaleRecord[]>(() => {
    try {
      const saved = localStorage.getItem(`${STORAGE_KEY}_sales`);
      return saved ? JSON.parse(saved) : generateDemoSales();
    } catch {
      return generateDemoSales();
    }
  });

  const [suppliers, setSuppliers] = useState<Supplier[]>(() => {
    try {
      const saved = localStorage.getItem(`${STORAGE_KEY}_suppliers`);
      return saved ? JSON.parse(saved) : INITIAL_SUPPLIERS;
    } catch {
      return INITIAL_SUPPLIERS;
    }
  });

  const [purchaseOrders, setPurchaseOrders] = useState<PurchaseOrder[]>(() => {
    try {
      const saved = localStorage.getItem(`${STORAGE_KEY}_pos`);
      return saved ? JSON.parse(saved) : INITIAL_PURCHASE_ORDERS;
    } catch {
      return INITIAL_PURCHASE_ORDERS;
    }
  });

  const [alerts, setAlerts] = useState<Alert[]>(() => {
    try {
      const saved = localStorage.getItem(`${STORAGE_KEY}_alerts`);
      return saved ? JSON.parse(saved) : INITIAL_ALERTS;
    } catch {
      return INITIAL_ALERTS;
    }
  });

  const [transactions, setTransactions] = useState<InventoryTransaction[]>(() => {
    try {
      const saved = localStorage.getItem(`${STORAGE_KEY}_txs`);
      return saved ? JSON.parse(saved) : INITIAL_TRANSACTIONS;
    } catch {
      return INITIAL_TRANSACTIONS;
    }
  });

  const [userSettings, setUserSettings] = useState<UserSettings>(() => {
    try {
      const saved = localStorage.getItem(`${STORAGE_KEY}_settings`);
      return saved ? JSON.parse(saved) : DEFAULT_SETTINGS;
    } catch {
      return DEFAULT_SETTINGS;
    }
  });

  const [currentUser, setCurrentUser] = useState<UserAuth | null>(() => {
    try {
      const saved = localStorage.getItem(`${STORAGE_KEY}_user`);
      if (saved) {
        const parsed = JSON.parse(saved);
        if (!parsed.name || parsed.name.toLowerCase().includes('umesh')) {
          parsed.name = 'Mohit';
          if (parsed.email === 'store@krishnasupermarket.in' || parsed.email?.includes('umesh')) {
            parsed.email = 'mohit@krishnasupermarket.in';
          }
          localStorage.setItem(`${STORAGE_KEY}_user`, JSON.stringify(parsed));
        }
        return parsed;
      }
      return { id: 'usr_demo_1', name: 'Mohit', email: 'mohit@krishnasupermarket.in' };
    } catch {
      return { id: 'usr_demo_1', name: 'Mohit', email: 'mohit@krishnasupermarket.in' };
    }
  });

  const [isDemoMode, setIsDemoMode] = useState<boolean>(() => {
    return localStorage.getItem(`${STORAGE_KEY}_is_demo`) !== 'false';
  });

  // Save changes to LocalStorage
  useEffect(() => {
    try {
      localStorage.setItem(`${STORAGE_KEY}_profile`, JSON.stringify(businessProfile));
      localStorage.setItem(`${STORAGE_KEY}_products`, JSON.stringify(products));
      localStorage.setItem(`${STORAGE_KEY}_suppliers`, JSON.stringify(suppliers));
      localStorage.setItem(`${STORAGE_KEY}_pos`, JSON.stringify(purchaseOrders));
      localStorage.setItem(`${STORAGE_KEY}_alerts`, JSON.stringify(alerts));
      localStorage.setItem(`${STORAGE_KEY}_txs`, JSON.stringify(transactions));
      localStorage.setItem(`${STORAGE_KEY}_settings`, JSON.stringify(userSettings));
      localStorage.setItem(`${STORAGE_KEY}_is_demo`, String(isDemoMode));
      if (currentUser) {
        localStorage.setItem(`${STORAGE_KEY}_user`, JSON.stringify(currentUser));
      } else {
        localStorage.removeItem(`${STORAGE_KEY}_user`);
      }
    } catch (e) {
      console.warn('LocalStorage save failed:', e);
    }
  }, [businessProfile, products, suppliers, purchaseOrders, alerts, transactions, userSettings, isDemoMode, currentUser]);

  // Save sales separately (can be large)
  useEffect(() => {
    try {
      // Only keep last 2500 sales in localStorage to prevent quota exhaustion
      const trimmed = sales.slice(-2500);
      localStorage.setItem(`${STORAGE_KEY}_sales`, JSON.stringify(trimmed));
    } catch (e) {
      console.warn('Could not save all sales records to localStorage:', e);
    }
  }, [sales]);

  // Compute live KPIs from actual data
  const kpis: StoreKPIs = useMemo(() => {
    let totalInvValue = 0;
    let totalRetVal = 0;
    let lowCount = 0;
    let outCount = 0;
    let critCount = 0;
    let overCount = 0;
    let healthyCount = 0;
    let predictedStockoutCount = 0;
    let estMonthlySalesUnits = 0;
    let estMonthlyRevenue = 0;

    // Period boundaries for 30D vs previous 30D (days 31-60)
    const today = new Date();
    const d30 = new Date(today);
    d30.setDate(d30.getDate() - 30);
    const d60 = new Date(today);
    d60.setDate(d60.getDate() - 60);

    const d30Str = d30.toISOString().split('T')[0];
    const d60Str = d60.toISOString().split('T')[0];

    let current30dRev = 0;
    let previous30dRev = 0;
    let current30dUnitsSold = 0;
    let previous30dUnitsSold = 0;

    sales.forEach((s) => {
      if (s.date >= d30Str) {
        current30dRev += s.totalRevenue;
        current30dUnitsSold += s.quantity;
      } else if (s.date >= d60Str && s.date < d30Str) {
        previous30dRev += s.totalRevenue;
        previous30dUnitsSold += s.quantity;
      }
    });

    const revGrowth =
      previous30dRev > 0
        ? Math.round(((current30dRev - previous30dRev) / previous30dRev) * 100)
        : 0;

    const unitsGrowth =
      previous30dUnitsSold > 0
        ? Math.round(((current30dUnitsSold - previous30dUnitsSold) / previous30dUnitsSold) * 100)
        : 0;

    // Helper to calculate exact daily sales velocity for a product from the sales records
    const getDynamicDailySales = (prodId: string, fallback: number) => {
      const prodSales = sales.filter((s) => s.productId === prodId && s.date >= d30Str);
      if (prodSales.length === 0) return fallback || 1;
      const total = prodSales.reduce((acc, curr) => acc + curr.quantity, 0);
      return Number((total / 30).toFixed(2));
    };

    products.forEach((prod) => {
      const cost = prod.purchaseCost || 0;
      const price = prod.sellingPrice || 0;
      const stock = prod.currentStock || 0;
      const daily = getDynamicDailySales(prod.id, prod.avgDailySales);

      totalInvValue += stock * cost;
      totalRetVal += stock * price;

      const status: StockStatus = getStockStatus(prod, sales);
      if (status === 'out_of_stock') outCount++;
      else if (status === 'critical') critCount++;
      else if (status === 'low') lowCount++;
      else if (status === 'overstocked') overCount++;
      else healthyCount++;

      // Check predicted stockouts (if stock depleted in <= 14 days and > 0)
      if (daily > 0 && stock > 0 && stock / daily <= 14) {
        predictedStockoutCount++;
      }

      estMonthlySalesUnits += daily * 30;
      estMonthlyRevenue += daily * 30 * price;
    });

    return {
      totalProducts: products.length,
      totalInventoryValue: Math.round(totalInvValue),
      totalRetailValue: Math.round(totalRetVal),
      lowStockCount: lowCount,
      outOfStockCount: outCount,
      criticalStockCount: critCount,
      overstockedCount: overCount,
      healthyStockCount: healthyCount,
      predictedStockouts: predictedStockoutCount,
      estimatedMonthlySales: Math.round(estMonthlySalesUnits),
      estimatedMonthlyRevenue: Math.round(estMonthlyRevenue),
      current30dRevenue: Math.round(current30dRev),
      previous30dRevenue: Math.round(previous30dRev),
      revenueGrowthPercent: revGrowth,
      current30dUnits: current30dUnitsSold,
      previous30dUnits: previous30dUnitsSold,
      unitsGrowthPercent: unitsGrowth,
    };
  }, [products, sales]);

  const unreadAlertsCount = useMemo(() => {
    return alerts.filter((a) => !a.read).length;
  }, [alerts]);

  // Actions
  const addProduct = (productData: Omit<Product, 'id' | 'createdAt' | 'updatedAt'>) => {
    const now = new Date().toISOString().split('T')[0];
    const newProduct: Product = {
      ...productData,
      id: `prod_${Date.now()}_${Math.random().toString(36).substr(2, 4)}`,
      createdAt: now,
      updatedAt: now,
    };

    setProducts((prev) => [newProduct, ...prev]);

    // Record initial stock transaction if stock > 0
    if (newProduct.currentStock > 0) {
      setTransactions((prev) => [
        {
          id: `tx_${Date.now()}`,
          productId: newProduct.id,
          productName: newProduct.name,
          sku: newProduct.sku,
          type: 'stock_in',
          quantityChange: newProduct.currentStock,
          previousStock: 0,
          newStock: newProduct.currentStock,
          reference: 'Initial product stock creation',
          date: now,
        },
        ...prev,
      ]);
    }
  };

  const updateProduct = (id: string, updates: Partial<Product>) => {
    const now = new Date().toISOString().split('T')[0];
    setProducts((prev) =>
      prev.map((p) => (p.id === id ? { ...p, ...updates, updatedAt: now } : p))
    );
  };

  const deleteProduct = (id: string) => {
    const prod = products.find((p) => p.id === id);
    setProducts((prev) => prev.filter((p) => p.id !== id));
    // Clean up related alerts
    setAlerts((prev) => prev.filter((a) => a.productId !== id));
    if (prod) {
      setTransactions((prev) => [
        {
          id: `tx_${Date.now()}`,
          productId: prod.id,
          productName: prod.name,
          sku: prod.sku,
          type: 'adjustment',
          quantityChange: -prod.currentStock,
          previousStock: prod.currentStock,
          newStock: 0,
          reference: 'Product deleted from inventory',
          date: new Date().toISOString().split('T')[0],
        },
        ...prev,
      ]);
    }
  };

  const adjustStock = (
    productId: string,
    quantityChange: number,
    type: TransactionType,
    reason: string
  ) => {
    const now = new Date().toISOString().split('T')[0];

    setProducts((prev) => {
      const prod = prev.find((p) => p.id === productId);
      if (!prod) return prev;

      const previousStock = prod.currentStock;
      const newStock = Math.max(0, previousStock + quantityChange);
      const actualChange = newStock - previousStock;

      setTransactions((txs) => [
        {
          id: `tx_${Date.now()}_${Math.random().toString(36).substr(2, 4)}`,
          productId: prod.id,
          productName: prod.name,
          sku: prod.sku,
          type,
          quantityChange: actualChange,
          previousStock,
          newStock,
          reference: reason || 'Manual stock adjustment',
          date: now,
        },
        ...txs,
      ]);

      // Automatically sync alerts: if stock hits 0, create critical alert
      if (newStock === 0 && previousStock > 0) {
        setAlerts((alertsPrev) => [
          {
            id: `alert_crit_${Date.now()}`,
            type: 'critical_stockout',
            priority: 'critical',
            title: `Stock Depleted: ${prod.name}`,
            message: `Current stock has reached 0 units. Immediate supplier order recommended.`,
            productId: prod.id,
            sku: prod.sku,
            productName: prod.name,
            createdAt: new Date().toISOString(),
            read: false,
          },
          ...alertsPrev,
        ]);
      } else if (newStock > prod.minStock && previousStock <= prod.minStock) {
        // If replenished above min threshold, dismiss or mark resolved
        setAlerts((alertsPrev) =>
          alertsPrev.map((a) =>
            a.productId === prod.id && (a.type === 'critical_stockout' || a.type === 'low_stock')
              ? { ...a, read: true }
              : a
          )
        );
      }

      return prev.map((p) =>
        p.id === productId ? { ...p, currentStock: newStock, updatedAt: now } : p
      );
    });
  };

  const recordSale = (saleData: Omit<SaleRecord, 'id'>) => {
    const newSale: SaleRecord = {
      ...saleData,
      id: `sale_${Date.now()}_${Math.random().toString(36).substr(2, 4)}`,
    };

    setSales((prev) => [newSale, ...prev]);

    // Deduct stock from product
    adjustStock(
      saleData.productId,
      -saleData.quantity,
      'sale',
      `Direct sale recorded (${saleData.channel})`
    );
  };

  const importSales = (records: Array<Omit<SaleRecord, 'id'>>) => {
    const now = Date.now();
    const newSales: SaleRecord[] = records.map((r, i) => ({
      ...r,
      id: `sale_import_${now}_${i}`,
    }));
    setSales((prev) => [...newSales, ...prev]);
  };

  const createPurchaseOrder = (
    poData: Omit<PurchaseOrder, 'id' | 'orderNumber'>
  ): PurchaseOrder => {
    const orderNumber = `PO-${new Date().getFullYear()}-${String(
      purchaseOrders.length + 101
    ).padStart(3, '0')}`;
    const newPo: PurchaseOrder = {
      ...poData,
      id: `po_${Date.now()}`,
      orderNumber,
    };

    setPurchaseOrders((prev) => [newPo, ...prev]);
    return newPo;
  };

  const updatePurchaseOrder = (id: string, updates: Partial<PurchaseOrder>) => {
    setPurchaseOrders((prev) =>
      prev.map((po) => (po.id === id ? { ...po, ...updates } : po))
    );
  };

  const receivePurchaseOrder = (id: string): boolean => {
    const po = purchaseOrders.find((p) => p.id === id);
    if (!po) return false;

    // Strict idempotency: prevent receiving an order that is already Received
    if (po.status === 'Received') {
      console.warn('Purchase order is already received. Duplicate additions blocked.');
      return false;
    }

    const now = new Date().toISOString().split('T')[0];

    // Mark as received
    updatePurchaseOrder(id, {
      status: 'Received',
      receivedDate: now,
    });

    // Atomically batch update all line item stocks in products
    const itemsMap = new Map<string, number>();
    po.items.forEach((item) => {
      itemsMap.set(item.productId, (itemsMap.get(item.productId) || 0) + item.quantity);
    });

    setProducts((prev) => {
      const newTransactions: InventoryTransaction[] = [];
      const updatedProducts = prev.map((p) => {
        const addedQty = itemsMap.get(p.id);
        if (addedQty !== undefined && addedQty > 0) {
          const previousStock = p.currentStock;
          const newStock = previousStock + addedQty;

          newTransactions.push({
            id: `tx_${Date.now()}_${p.id}`,
            productId: p.id,
            productName: p.name,
            sku: p.sku,
            type: 'po_received',
            quantityChange: addedQty,
            previousStock,
            newStock,
            reference: `Received via PO ${po.orderNumber}`,
            date: now,
          });

          return {
            ...p,
            currentStock: newStock,
            updatedAt: now,
          };
        }
        return p;
      });

      if (newTransactions.length > 0) {
        setTransactions((txs) => [...newTransactions, ...txs]);
      }

      return updatedProducts;
    });

    // Resolve any active critical/low stock alerts for the replenished products
    setAlerts((prevAlerts) => {
      const replenishedIds = new Set(po.items.map((i) => i.productId));
      const updated = prevAlerts.map((a) =>
        a.productId && replenishedIds.has(a.productId) ? { ...a, read: true } : a
      );

      return [
        {
          id: `alert_po_${Date.now()}`,
          type: 'po_delivery',
          priority: 'low',
          title: `PO Received: ${po.orderNumber}`,
          message: `Successfully received ${po.items.length} items from ${po.supplierName}. Stock replenished.`,
          createdAt: new Date().toISOString(),
          read: false,
        },
        ...updated,
      ];
    });

    return true;
  };

  const cancelPurchaseOrder = (id: string) => {
    updatePurchaseOrder(id, { status: 'Cancelled' });
  };

  const addSupplier = (supplierData: Omit<Supplier, 'id'>) => {
    const newSupplier: Supplier = {
      ...supplierData,
      id: `sup_${Date.now()}`,
    };
    setSuppliers((prev) => [...prev, newSupplier]);
  };

  const updateSupplier = (id: string, updates: Partial<Supplier>) => {
    setSuppliers((prev) =>
      prev.map((s) => (s.id === id ? { ...s, ...updates } : s))
    );
  };

  const deleteSupplier = (id: string) => {
    setSuppliers((prev) => prev.filter((s) => s.id !== id));
  };

  const markAlertRead = (id: string) => {
    setAlerts((prev) =>
      prev.map((a) => (a.id === id ? { ...a, read: true } : a))
    );
  };

  const dismissAlert = (id: string) => {
    setAlerts((prev) => prev.filter((a) => a.id !== id));
  };

  const markAllAlertsRead = () => {
    setAlerts((prev) => prev.map((a) => ({ ...a, read: true })));
  };

  const resetToDemoData = () => {
    localStorage.clear();
    setBusinessProfile(INITIAL_BUSINESS_PROFILE);
    setProducts(INITIAL_PRODUCTS);
    setSuppliers(INITIAL_SUPPLIERS);
    setPurchaseOrders(INITIAL_PURCHASE_ORDERS);
    setAlerts(INITIAL_ALERTS);
    setTransactions(INITIAL_TRANSACTIONS);
    setSales(generateDemoSales());
    setUserSettings(DEFAULT_SETTINGS);
    setIsDemoMode(true);
    setCurrentUser({ id: 'usr_demo_1', name: 'Mohit', email: 'mohit@krishnasupermarket.in' });
  };

  const clearToFreshStore = (profile?: Partial<BusinessProfile>) => {
    const freshProfile: BusinessProfile = {
      businessName: profile?.businessName || 'My New Business',
      businessType: profile?.businessType || 'Retail Store',
      currency: profile?.currency || '₹',
      location: profile?.location || 'New Delhi, India',
      timezone: profile?.timezone || 'Asia/Kolkata (IST)',
      email: currentUser?.email || 'owner@store.com',
    };

    setBusinessProfile(freshProfile);
    setProducts([]);
    setSuppliers([]);
    setPurchaseOrders([]);
    setAlerts([]);
    setTransactions([]);
    setSales([]);
    setIsDemoMode(false);
  };

  const updateBusinessProfile = (profile: Partial<BusinessProfile>) => {
    setBusinessProfile((prev) => ({ ...prev, ...profile }));
  };

  const updateUserSettings = (settings: Partial<UserSettings>) => {
    setUserSettings((prev) => ({ ...prev, ...settings }));
  };

  const loginUser = (email: string, name?: string) => {
    const user: UserAuth = {
      id: `usr_${Date.now()}`,
      email,
      name: name || email.split('@')[0],
    };
    setCurrentUser(user);
  };

  const logoutUser = () => {
    setCurrentUser(null);
  };

  return (
    <StoreContext.Provider
      value={{
        businessProfile,
        products,
        sales,
        suppliers,
        purchaseOrders,
        alerts,
        transactions,
        userSettings,
        isDemoMode,
        currentUser,
        kpis,
        unreadAlertsCount,
        addProduct,
        updateProduct,
        deleteProduct,
        adjustStock,
        recordSale,
        importSales,
        createPurchaseOrder,
        updatePurchaseOrder,
        receivePurchaseOrder,
        cancelPurchaseOrder,
        addSupplier,
        updateSupplier,
        deleteSupplier,
        markAlertRead,
        dismissAlert,
        markAllAlertsRead,
        resetToDemoData,
        clearToFreshStore,
        updateBusinessProfile,
        updateUserSettings,
        loginUser,
        logoutUser,
      }}
    >
      {children}
    </StoreContext.Provider>
  );
};

export const useStore = () => {
  const context = useContext(StoreContext);
  if (!context) {
    throw new Error('useStore must be used within a StoreProvider');
  }
  return context;
};
