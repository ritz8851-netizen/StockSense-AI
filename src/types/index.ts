export type StockStatus = 'out_of_stock' | 'critical' | 'low' | 'healthy' | 'overstocked';

export type PriorityLevel = 'critical' | 'high' | 'medium' | 'low';

export type PurchaseOrderStatus = 'Draft' | 'Pending' | 'Ordered' | 'Partially Received' | 'Received' | 'Cancelled';

export type TransactionType = 'stock_in' | 'stock_out' | 'sale' | 'po_received' | 'adjustment' | 'return';

export type SalesChannel = 'In-Store' | 'Online' | 'Wholesale' | 'B2B';

export interface Product {
  id: string;
  name: string;
  sku: string;
  category: string;
  description: string;
  sellingPrice: number;
  purchaseCost: number;
  currentStock: number;
  minStock: number; // Reorder threshold
  maxStock: number; // Target inventory level
  avgDailySales: number;
  supplierId: string;
  supplierName: string;
  leadTimeDays: number;
  unit: string; // e.g., 'pack', 'kg', 'bottle', 'unit'
  imageUrl?: string;
  createdAt: string;
  updatedAt: string;
}

export interface SaleRecord {
  id: string;
  productId: string;
  sku: string;
  productName: string;
  quantity: number;
  sellingPrice: number;
  costPrice: number;
  totalRevenue: number;
  date: string; // YYYY-MM-DD
  channel: SalesChannel;
}

export interface Supplier {
  id: string;
  name: string;
  contactPerson: string;
  email: string;
  phone: string;
  address: string;
  leadTimeDays: number;
  categories: string[];
  rating: number; // 1-5
  notes?: string;
}

export interface PurchaseOrderItem {
  productId: string;
  sku: string;
  productName: string;
  quantity: number;
  unitCost: number;
  total: number;
}

export interface PurchaseOrder {
  id: string;
  orderNumber: string; // e.g. PO-2026-001
  supplierId: string;
  supplierName: string;
  items: PurchaseOrderItem[];
  totalAmount: number;
  status: PurchaseOrderStatus;
  orderDate: string;
  expectedDeliveryDate: string;
  receivedDate?: string;
  notes?: string;
}

export interface Alert {
  id: string;
  type: 'critical_stockout' | 'low_stock' | 'predicted_stockout' | 'overstock' | 'unusual_spike' | 'unusual_drop' | 'po_delivery';
  priority: PriorityLevel;
  title: string;
  message: string;
  productId?: string;
  sku?: string;
  productName?: string;
  createdAt: string;
  read: boolean;
}

export interface InventoryTransaction {
  id: string;
  productId: string;
  productName: string;
  sku: string;
  type: TransactionType;
  quantityChange: number; // positive or negative
  previousStock: number;
  newStock: number;
  reference: string; // PO Number or adjustment note
  date: string;
}

export interface BusinessProfile {
  businessName: string;
  businessType: string; // Retail, Supermarket, Pharmacy, Warehouse, etc.
  currency: string; // ₹, $, €, etc.
  location: string;
  timezone: string;
  email: string;
}

export interface UserSettings {
  leadTimeBufferDays: number;
  safetyStockFactor: number;
  overstockDaysThreshold: number;
  enableAlertNotifications: boolean;
  lowStockThresholdPercent: number;
}

export interface ForecastMetrics {
  periodDays: number;
  predictedSales: number;
  daysLeft: number;
  stockoutDate: string | null;
  demandTrend: 'rising' | 'stable' | 'declining';
  confidenceScore: number; // 0 - 100
  suggestedOrderDate: string;
  suggestedOrderQty: number;
  dailyDepletionRate: number;
}

export interface ReorderRecommendation {
  product: Product;
  currentStock: number;
  avgDailySales: number;
  leadTimeDays: number;
  daysOfStockLeft: number;
  predictedStockoutDate: string | null;
  reorderPoint: number;
  recommendedOrderQty: number;
  estimatedCost: number;
  suggestedOrderDate: string;
  priority: PriorityLevel;
  reason: string;
  incomingPOQty: number;
}

export interface AiChatMessage {
  id: string;
  role: 'user' | 'assistant';
  content: string;
  timestamp: string;
}
