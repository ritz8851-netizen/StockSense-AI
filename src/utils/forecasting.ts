import { Product, SaleRecord, ForecastMetrics, ReorderRecommendation, StockStatus, PriorityLevel } from '../types';

/**
 * Calculates stock health status based on current stock, minimum stock threshold, and actual daily sales velocity.
 */
export function getStockStatus(product: Product, salesHistory?: SaleRecord[]): StockStatus {
  if (product.currentStock <= 0) {
    return 'out_of_stock';
  }

  let dailySales = product.avgDailySales || 1;
  if (salesHistory && salesHistory.length > 0) {
    const calculatedDaily = calculateAverageDailySales(salesHistory, product.id, 30);
    if (calculatedDaily > 0) {
      dailySales = calculatedDaily;
    }
  }

  const daysOfStock = dailySales > 0 ? product.currentStock / dailySales : 999;

  // If less than supplier lead time + 1 day, it's critical
  if (daysOfStock <= Math.max(2, product.leadTimeDays)) {
    return 'critical';
  }

  // If current stock is below or equal to min stock threshold, or daysOfStock <= 7
  if (product.currentStock <= product.minStock || daysOfStock <= 7) {
    return 'low';
  }

  // If stock is more than 1.5x maxStock or over 60 days of supply
  if ((product.maxStock > 0 && product.currentStock > product.maxStock * 1.5) || daysOfStock > 60) {
    return 'overstocked';
  }

  return 'healthy';
}

/**
 * Calculates average daily sales from the most recent N days of sales history.
 */
export function calculateAverageDailySales(salesHistory: SaleRecord[], productId: string, days = 30): number {
  const cutoff = new Date();
  cutoff.setDate(cutoff.getDate() - days);
  const cutoffStr = cutoff.toISOString().split('T')[0];

  const productSales = salesHistory.filter(
    (s) => s.productId === productId && s.date >= cutoffStr
  );

  const totalSold = productSales.reduce((acc, curr) => acc + curr.quantity, 0);
  return Number((totalSold / Math.max(1, days)).toFixed(2));
}

/**
 * Weighted moving average: assigns higher weight to recent sales.
 * Last 7 days = 50%, Previous 14 days = 30%, Previous 9 days = 20%
 */
export function calculateWeightedMovingAverage(salesHistory: SaleRecord[], productId: string): number {
  const now = new Date();
  
  const getPeriodSales = (startDaysAgo: number, endDaysAgo: number) => {
    const start = new Date(now);
    start.setDate(start.getDate() - startDaysAgo);
    const end = new Date(now);
    end.setDate(end.getDate() - endDaysAgo);
    
    const startStr = start.toISOString().split('T')[0];
    const endStr = end.toISOString().split('T')[0];

    const records = salesHistory.filter(
      (s) => s.productId === productId && s.date >= startStr && s.date <= endStr
    );
    return records.reduce((acc, curr) => acc + curr.quantity, 0);
  };

  const salesLast7d = getPeriodSales(7, 0);
  const salesPrev14d = getPeriodSales(21, 8);
  const salesPrev9d = getPeriodSales(30, 22);

  const rate7d = salesLast7d / 7;
  const rate14d = salesPrev14d / 14;
  const rate9d = salesPrev9d / 9;

  const weighted = rate7d * 0.5 + rate14d * 0.3 + rate9d * 0.2;
  return Number(weighted.toFixed(2));
}

/**
 * Trend analysis: compares last 7 days velocity vs previous 14 days.
 */
export function calculateDemandTrend(salesHistory: SaleRecord[], productId: string): 'rising' | 'stable' | 'declining' {
  const now = new Date();
  const d7 = new Date(now);
  d7.setDate(d7.getDate() - 7);
  const d21 = new Date(now);
  d21.setDate(d21.getDate() - 21);

  const d7Str = d7.toISOString().split('T')[0];
  const d21Str = d21.toISOString().split('T')[0];

  const recentSales = salesHistory
    .filter((s) => s.productId === productId && s.date >= d7Str)
    .reduce((acc, c) => acc + c.quantity, 0) / 7;

  const priorSales = salesHistory
    .filter((s) => s.productId === productId && s.date >= d21Str && s.date < d7Str)
    .reduce((acc, c) => acc + c.quantity, 0) / 14;

  if (priorSales === 0) return 'stable';

  const ratio = recentSales / priorSales;
  if (ratio > 1.15) return 'rising';
  if (ratio < 0.85) return 'declining';
  return 'stable';
}

/**
 * Computes standard deviation of daily sales to determine safety stock.
 */
export function calculateSalesStdDev(salesHistory: SaleRecord[], productId: string, avgDaily: number): number {
  const productSales = salesHistory.filter((s) => s.productId === productId);
  if (productSales.length === 0) return Math.max(1, avgDaily * 0.3);

  const variance =
    productSales.reduce((acc, curr) => acc + Math.pow(curr.quantity - avgDaily, 2), 0) /
    productSales.length;

  return Math.sqrt(variance);
}

/**
 * Deterministic demand forecast for a specified timeframe (e.g. 7, 15, 30, 60, 90 days).
 */
export function generateDemandForecast(
  product: Product,
  salesHistory: SaleRecord[],
  periodDays: number
): ForecastMetrics {
  const weightedDaily = calculateWeightedMovingAverage(salesHistory, product.id);
  const effectiveDaily = weightedDaily > 0 ? weightedDaily : product.avgDailySales || 1;
  const trend = calculateDemandTrend(salesHistory, product.id);

  // Apply slight trend adjustment factor (±8% over 30 days)
  let trendFactor = 1.0;
  if (trend === 'rising') trendFactor = 1.08;
  if (trend === 'declining') trendFactor = 0.92;

  const adjustedDailyRate = Number((effectiveDaily * trendFactor).toFixed(2));
  const predictedSales = Math.round(adjustedDailyRate * periodDays);

  const daysLeft =
    product.currentStock > 0 && adjustedDailyRate > 0
      ? Number((product.currentStock / adjustedDailyRate).toFixed(1))
      : 0;

  let stockoutDate: string | null = null;
  if (daysLeft < periodDays && daysLeft > 0) {
    const d = new Date();
    d.setDate(d.getDate() + Math.floor(daysLeft));
    stockoutDate = d.toISOString().split('T')[0];
  } else if (product.currentStock <= 0) {
    stockoutDate = 'Already out of stock';
  }

  // Confidence score: based on number of days of history available
  const productRecords = salesHistory.filter((s) => s.productId === product.id);
  let confidenceScore = 65;
  if (productRecords.length > 60) confidenceScore = 95;
  else if (productRecords.length > 25) confidenceScore = 85;
  else if (productRecords.length > 10) confidenceScore = 75;

  // Suggested reorder date: (daysLeft - leadTimeDays - safetyBuffer)
  const bufferDays = 2;
  const daysUntilReorder = Math.max(0, Math.floor(daysLeft - product.leadTimeDays - bufferDays));
  const reorderDate = new Date();
  reorderDate.setDate(reorderDate.getDate() + daysUntilReorder);
  const suggestedOrderDate = reorderDate.toISOString().split('T')[0];

  // Suggested order quantity to reach max target stock or 30 days of supply
  const targetInventory = product.maxStock > 0 ? product.maxStock : Math.round(adjustedDailyRate * 30);
  const suggestedOrderQty = Math.max(0, Math.round(targetInventory - product.currentStock));

  return {
    periodDays,
    predictedSales,
    daysLeft,
    stockoutDate,
    demandTrend: trend,
    confidenceScore,
    suggestedOrderDate,
    suggestedOrderQty,
    dailyDepletionRate: adjustedDailyRate,
  };
}

/**
 * Reorder Point formula:
 * ROP = (Average Daily Demand × Supplier Lead Time) + Safety Stock
 * Safety Stock = Z (1.65 for 95% service level) × sqrt(Lead Time) × Daily Sales StdDev
 */
export function calculateReorderRecommendation(
  product: Product,
  salesHistory: SaleRecord[],
  incomingPOQty = 0
): ReorderRecommendation {
  const avgDaily = product.avgDailySales || 1;
  const leadTime = Math.max(1, product.leadTimeDays || 3);
  const stdDev = calculateSalesStdDev(salesHistory, product.id, avgDaily);

  // Safety stock computation
  const safetyStock = Math.ceil(1.65 * Math.sqrt(leadTime) * stdDev);
  const leadTimeDemand = Math.ceil(avgDaily * leadTime);
  const reorderPoint = leadTimeDemand + safetyStock;

  const totalEffectiveStock = product.currentStock + incomingPOQty;
  const daysOfStockLeft = avgDaily > 0 ? Number((product.currentStock / avgDaily).toFixed(1)) : 999;

  let stockoutDateStr: string | null = null;
  if (daysOfStockLeft <= 90 && product.currentStock > 0) {
    const d = new Date();
    d.setDate(d.getDate() + Math.floor(daysOfStockLeft));
    stockoutDateStr = d.toISOString().split('T')[0];
  } else if (product.currentStock <= 0) {
    stockoutDateStr = 'Stockout Now';
  }

  // Priority classification
  let priority: PriorityLevel = 'low';
  let reason = 'Stock is at healthy operational levels.';

  if (product.currentStock <= 0) {
    priority = 'critical';
    reason = 'Product is currently OUT OF STOCK. Sales are immediately lost!';
  } else if (daysOfStockLeft <= leadTime) {
    priority = 'critical';
    reason = `Critical: Stockout expected in ${daysOfStockLeft} days, while supplier lead time is ${leadTime} days!`;
  } else if (totalEffectiveStock <= reorderPoint || daysOfStockLeft <= leadTime + 3) {
    priority = 'high';
    reason = `Current stock (${product.currentStock}) has breached reorder point (${reorderPoint}). Order now to avoid stockout.`;
  } else if (daysOfStockLeft <= 14) {
    priority = 'medium';
    reason = `Stock will deplete within 2 weeks. Monitor and plan supplier batch.`;
  }

  // Recommended order quantity
  const targetStock = product.maxStock > 0 ? product.maxStock : Math.ceil(reorderPoint * 2);
  const recommendedOrderQty = Math.max(
    0,
    Math.ceil(targetStock - totalEffectiveStock)
  );

  const estimatedCost = Math.round(recommendedOrderQty * (product.purchaseCost || 0));

  // Suggested reorder date
  const bufferDays = 2;
  const daysUntilOrder = Math.max(0, Math.floor(daysOfStockLeft - leadTime - bufferDays));
  const suggestedDate = new Date();
  suggestedDate.setDate(suggestedDate.getDate() + daysUntilOrder);

  return {
    product,
    currentStock: product.currentStock,
    avgDailySales: avgDaily,
    leadTimeDays: leadTime,
    daysOfStockLeft,
    predictedStockoutDate: stockoutDateStr,
    reorderPoint,
    recommendedOrderQty,
    estimatedCost,
    suggestedOrderDate: suggestedDate.toISOString().split('T')[0],
    priority,
    reason,
    incomingPOQty,
  };
}
