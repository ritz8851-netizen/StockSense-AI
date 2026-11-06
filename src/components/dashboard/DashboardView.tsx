import React, { useState, useMemo } from 'react';
import {
  Package,
  TrendingUp,
  AlertTriangle,
  XCircle,
  Clock,
  IndianRupee,
  Sparkles,
  ArrowRight,
  ArrowUpRight,
  ArrowDownRight,
  Plus,
  ShoppingCart,
  Layers,
  CheckCircle,
  Truck,
  RotateCcw,
} from 'lucide-react';
import {
  AreaChart,
  Area,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell,
} from 'recharts';
import { useStore } from '../../context/StoreContext';
import { NavTab } from '../layout/Sidebar';
import { calculateReorderRecommendation, getStockStatus } from '../../utils/forecasting';

interface DashboardViewProps {
  onSelectTab: (tab: NavTab) => void;
  onNavigateToInventory?: (filter?: { status?: string; category?: string; search?: string }) => void;
  onOpenAddProduct: () => void;
  onOpenRecordSale: () => void;
  onOpenCreatePO: (prefillSupplierId?: string, prefillProductId?: string, prefillQuantity?: number) => void;
  onOpenAdjustStock: () => void;
}

export const DashboardView: React.FC<DashboardViewProps> = ({
  onSelectTab,
  onNavigateToInventory,
  onOpenAddProduct,
  onOpenRecordSale,
  onOpenCreatePO,
  onOpenAdjustStock,
}) => {
  const { businessProfile, products, sales, kpis, alerts } = useStore();
  const [aiAuditing, setAiAuditing] = useState(false);
  const [aiAuditMemo, setAiAuditMemo] = useState<any>(null);
  const [chartTab, setChartTab] = useState<'sales' | 'forecast'>('sales');

  // Reorder recommendations list sorted by priority
  const reorderRecommendations = useMemo(() => {
    return products
      .map((p) => calculateReorderRecommendation(p, sales))
      .filter((r) => r.priority === 'critical' || r.priority === 'high' || r.priority === 'medium')
      .sort((a, b) => {
        const order = { critical: 0, high: 1, medium: 2, low: 3 };
        return order[a.priority] - order[b.priority];
      });
  }, [products, sales]);

  // Overstocked products list
  const overstockedProducts = useMemo(() => {
    return products.filter((p) => getStockStatus(p) === 'overstocked');
  }, [products]);

  // Calculate dynamic potential stockout risk in currency from actual data
  const potentialStockoutRiskValue = useMemo(() => {
    return reorderRecommendations.reduce((acc, r) => {
      if (r.priority === 'critical' || r.priority === 'high') {
        const daysExposed = Math.max(1, r.leadTimeDays - Math.max(0, r.daysOfStockLeft));
        const lostUnits = Math.round(r.avgDailySales * daysExposed);
        return acc + lostUnits * r.product.sellingPrice;
      }
      return acc;
    }, 0);
  }, [reorderRecommendations]);

  // 30-Day aggregate store demand and inventory burn projection
  const projectedDemandData = useMemo(() => {
    const data: Array<{
      day: number;
      date: string;
      displayDate: string;
      projectedUnits: number;
      projectedRevenue: number;
      remainingInventory: number;
    }> = [];

    const today = new Date();
    const totalDailyUnits = products.reduce((sum, p) => sum + (p.avgDailySales || 1), 0);
    const totalDailyRevenue = products.reduce((sum, p) => sum + (p.avgDailySales || 1) * p.sellingPrice, 0);
    let runningInventory = products.reduce((sum, p) => sum + p.currentStock, 0);

    for (let i = 0; i <= 30; i++) {
      const d = new Date(today);
      d.setDate(d.getDate() + i);
      const iso = d.toISOString().split('T')[0];
      const displayDate = i === 0 ? 'Today' : d.toLocaleDateString('en-IN', { day: 'numeric', month: 'short' });

      // Apply realistic weekend shopping multiplier (+25% on Saturdays and Sundays)
      const dayOfWeek = d.getDay();
      const isWeekend = dayOfWeek === 0 || dayOfWeek === 6;
      const dayUnits = Math.round(totalDailyUnits * (isWeekend ? 1.25 : 0.92));
      const dayRev = Math.round(totalDailyRevenue * (isWeekend ? 1.25 : 0.92));

      data.push({
        day: i,
        date: iso,
        displayDate,
        projectedUnits: i === 0 ? 0 : dayUnits,
        projectedRevenue: i === 0 ? 0 : dayRev,
        remainingInventory: Math.max(0, Math.round(runningInventory)),
      });

      if (i > 0) {
        runningInventory -= dayUnits;
      }
    }
    return data;
  }, [products]);

  // Sales Trends chart data (aggregating past 30 days)
  const salesChartData = useMemo(() => {
    const dailyMap: Record<string, { date: string; displayDate: string; revenue: number; units: number }> = {};
    const today = new Date();

    for (let i = 29; i >= 0; i--) {
      const d = new Date(today);
      d.setDate(d.getDate() - i);
      const iso = d.toISOString().split('T')[0];
      const displayDate = d.toLocaleDateString('en-IN', { day: 'numeric', month: 'short' });
      dailyMap[iso] = { date: iso, displayDate, revenue: 0, units: 0 };
    }

    sales.forEach((s) => {
      if (dailyMap[s.date]) {
        dailyMap[s.date].revenue += s.totalRevenue;
        dailyMap[s.date].units += s.quantity;
      }
    });

    return Object.values(dailyMap);
  }, [sales]);

  // Inventory value by category chart data
  const categoryValueData = useMemo(() => {
    const map: Record<string, number> = {};
    products.forEach((p) => {
      const val = p.currentStock * p.purchaseCost;
      map[p.category] = (map[p.category] || 0) + val;
    });

    return Object.entries(map).map(([name, value]) => ({
      name,
      value: Math.round(value),
    }));
  }, [products]);

  // Top 5 selling products
  const topSellingProducts = useMemo(() => {
    const map: Record<string, { name: string; sku: string; units: number; revenue: number }> = {};
    sales.forEach((s) => {
      if (!map[s.productId]) {
        map[s.productId] = { name: s.productName, sku: s.sku, units: 0, revenue: 0 };
      }
      map[s.productId].units += s.quantity;
      map[s.productId].revenue += s.totalRevenue;
    });

    return Object.values(map)
      .sort((a, b) => b.units - a.units)
      .slice(0, 5);
  }, [sales]);

  // Trigger AI Inventory Audit
  const handleRunAiAudit = async () => {
    setAiAuditing(true);
    try {
      const response = await fetch('/api/ai/audit-recommendations', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          kpis,
          topReorders: reorderRecommendations.slice(0, 5).map((r) => ({
            name: r.product.name,
            sku: r.product.sku,
            currentStock: r.currentStock,
            daysLeft: r.daysOfStockLeft,
            supplier: r.product.supplierName,
            recommendedQty: r.recommendedOrderQty,
            cost: r.estimatedCost,
          })),
          overstockedItems: overstockedProducts.slice(0, 3).map((p) => ({
            name: p.name,
            sku: p.sku,
            currentStock: p.currentStock,
            value: p.currentStock * p.purchaseCost,
          })),
          currency: businessProfile.currency,
        }),
      });
      const data = await response.json();
      setAiAuditMemo(data);
    } catch (e) {
      console.error('Audit failed:', e);
    } finally {
      setAiAuditing(false);
    }
  };

  const STOCK_COLORS = {
    healthy: '#10b981',
    low: '#f59e0b',
    critical: '#f97316',
    out: '#ef4444',
    over: '#6366f1',
  };

  return (
    <div className="p-3 sm:p-6 lg:p-8 space-y-4 sm:space-y-6 max-w-7xl mx-auto">
      {/* Welcome & Quick Action Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-gradient-to-r from-slate-900 via-slate-800 to-slate-900 p-4 sm:p-6 rounded-2xl sm:rounded-3xl text-white shadow-xl shadow-slate-900/10 border border-slate-800">
        <div>
          <div className="flex items-center gap-2">
            <span className="text-[11px] sm:text-xs font-semibold px-2 py-0.5 rounded-full bg-emerald-500/20 text-emerald-300 border border-emerald-500/30">
              Operational Hub
            </span>
            <span className="text-[11px] sm:text-xs text-slate-400">Live Inventory Telemetry</span>
          </div>
          <h1 className="text-xl sm:text-2xl lg:text-3xl font-extrabold tracking-tight mt-1 truncate">
            {businessProfile.businessName}
          </h1>
          <p className="hidden sm:block text-xs sm:text-sm text-slate-300 mt-1 max-w-xl">
            StockSense is continuously tracking sales velocity, calculating supplier lead times, and predicting stockouts to protect your cash flow.
          </p>
          <p className="sm:hidden text-xs text-slate-300 mt-0.5">
            Automated stock velocity tracking &amp; inventory replenishment.
          </p>
        </div>

        {/* Quick action buttons - 2x2 grid on phone, inline on desktop */}
        <div className="grid grid-cols-2 sm:flex sm:flex-wrap items-center gap-2">
          <button
            onClick={onOpenRecordSale}
            className="flex items-center justify-center gap-1.5 px-3 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-xs font-semibold text-slate-200 border border-slate-700 transition-colors"
          >
            <ShoppingCart className="w-3.5 h-3.5 text-emerald-400 shrink-0" />
            <span className="truncate">Record Sale</span>
          </button>
          <button
            onClick={onOpenAdjustStock}
            className="flex items-center justify-center gap-1.5 px-3 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-xs font-semibold text-slate-200 border border-slate-700 transition-colors"
          >
            <RotateCcw className="w-3.5 h-3.5 text-blue-400 shrink-0" />
            <span className="truncate">Adjust Stock</span>
          </button>
          <button
            onClick={() => onOpenCreatePO()}
            className="flex items-center justify-center gap-1.5 px-3 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-xs font-semibold text-slate-200 border border-slate-700 transition-colors"
          >
            <Truck className="w-3.5 h-3.5 text-amber-400 shrink-0" />
            <span className="truncate">New PO</span>
          </button>
          <button
            onClick={onOpenAddProduct}
            className="flex items-center justify-center gap-1.5 px-3.5 py-2 rounded-xl bg-emerald-500 hover:bg-emerald-400 text-slate-950 font-bold text-xs shadow-md shadow-emerald-500/20 transition-all hover:scale-[1.02]"
          >
            <Plus className="w-3.5 h-3.5 stroke-[2.5] shrink-0" />
            <span className="truncate">Add Product</span>
          </button>
        </div>
      </div>

      {/* Direct Inventory Access Card - Gives Mobile Users Immediate Clarity */}
      <div
        onClick={() => (onNavigateToInventory ? onNavigateToInventory({ status: 'all' }) : onSelectTab('inventory'))}
        className="flex items-center justify-between p-3.5 sm:p-4 rounded-2xl bg-gradient-to-r from-emerald-600 via-emerald-500 to-teal-600 text-white shadow-sm hover:shadow-md transition-all cursor-pointer group"
      >
        <div className="flex items-center gap-3 min-w-0">
          <div className="w-9 h-9 sm:w-10 sm:h-10 rounded-xl bg-white/20 flex items-center justify-center shrink-0">
            <Package className="w-5 h-5 text-white" />
          </div>
          <div className="min-w-0">
            <div className="flex items-center gap-2">
              <h3 className="text-xs sm:text-sm font-bold truncate">Open Product Inventory Catalog</h3>
              <span className="text-[10px] font-bold bg-white text-emerald-800 px-2 py-0.5 rounded-full shrink-0">
                {products.length} Products
              </span>
            </div>
            <p className="text-[11px] text-emerald-100 truncate mt-0.5">
              Browse SKU list, monitor thresholds, adjust counts, and import/export CSV
            </p>
          </div>
        </div>
        <div className="flex items-center gap-1 text-xs font-bold bg-white/15 group-hover:bg-white group-hover:text-emerald-800 px-3 py-1.5 rounded-xl shrink-0 transition-all ml-2">
          <span className="hidden sm:inline">Open Catalog</span>
          <span className="sm:hidden">Open</span>
          <ArrowRight className="w-3.5 h-3.5" />
        </div>
      </div>

      {/* 6 Key Performance Metric Cards */}
      <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-3.5 sm:gap-4">
        {/* Total Products */}
        <div
          onClick={() => (onNavigateToInventory ? onNavigateToInventory({ status: 'all' }) : onSelectTab('inventory'))}
          className="bg-white p-4 rounded-2xl border border-slate-200/90 shadow-sm hover:shadow-md hover:border-blue-300 transition-all cursor-pointer group"
          title="Click to view all products in Inventory"
        >
          <div className="flex items-center justify-between text-slate-500">
            <span className="text-xs font-medium">Total Products</span>
            <div className="w-8 h-8 rounded-xl bg-blue-50 text-blue-600 flex items-center justify-center group-hover:scale-110 transition-transform">
              <Package className="w-4 h-4" />
            </div>
          </div>
          <p className="text-2xl font-bold text-slate-900 mt-2">{kpis.totalProducts}</p>
          <div className="flex items-center gap-1 mt-1 text-[11px] text-blue-600 font-medium">
            <ArrowUpRight className="w-3 h-3" />
            <span>Active SKUs</span>
          </div>
        </div>

        {/* Total Inventory Value */}
        <div
          onClick={() => (onNavigateToInventory ? onNavigateToInventory({ status: 'all' }) : onSelectTab('inventory'))}
          className="bg-white p-4 rounded-2xl border border-slate-200/90 shadow-sm hover:shadow-md hover:border-emerald-300 transition-all cursor-pointer group"
          title="Click to view valuation breakdown in Inventory"
        >
          <div className="flex items-center justify-between text-slate-500">
            <span className="text-xs font-medium">Inventory Value</span>
            <div className="w-8 h-8 rounded-xl bg-emerald-50 text-emerald-600 flex items-center justify-center group-hover:scale-110 transition-transform">
              <IndianRupee className="w-4 h-4" />
            </div>
          </div>
          <p className="text-2xl font-bold text-slate-900 mt-2">
            {businessProfile.currency}
            {kpis.totalInventoryValue.toLocaleString()}
          </p>
          <p className="text-[11px] text-emerald-700 font-medium mt-1 truncate">
            {businessProfile.currency}{kpis.totalRetailValue.toLocaleString()} retail val
          </p>
        </div>

        {/* Low Stock Items */}
        <div
          onClick={() => (onNavigateToInventory ? onNavigateToInventory({ status: 'low' }) : onSelectTab('inventory'))}
          className="bg-white p-4 rounded-2xl border border-slate-200/90 shadow-sm hover:shadow-md hover:border-amber-400 transition-all cursor-pointer group"
          title="Click to filter Low Stock products in Inventory"
        >
          <div className="flex items-center justify-between text-slate-500">
            <span className="text-xs font-medium">Low Stock</span>
            <div className="w-8 h-8 rounded-xl bg-amber-50 text-amber-600 flex items-center justify-center group-hover:scale-110 transition-transform">
              <AlertTriangle className="w-4 h-4" />
            </div>
          </div>
          <p className="text-2xl font-bold text-amber-600 mt-2">{kpis.lowStockCount}</p>
          <p className="text-[11px] text-amber-700 font-medium mt-1">Below min threshold</p>
        </div>

        {/* Out of Stock Items */}
        <div
          onClick={() => (onNavigateToInventory ? onNavigateToInventory({ status: 'out_of_stock' }) : onSelectTab('inventory'))}
          className="bg-white p-4 rounded-2xl border border-slate-200/90 shadow-sm hover:shadow-md hover:border-red-400 transition-all cursor-pointer group"
          title="Click to filter Out of Stock products in Inventory"
        >
          <div className="flex items-center justify-between text-slate-500">
            <span className="text-xs font-medium">Out of Stock</span>
            <div className="w-8 h-8 rounded-xl bg-red-50 text-red-600 flex items-center justify-center group-hover:scale-110 transition-transform">
              <XCircle className="w-4 h-4" />
            </div>
          </div>
          <p className="text-2xl font-bold text-red-600 mt-2">{kpis.outOfStockCount}</p>
          <p className="text-[11px] text-red-600 font-medium mt-1">Immediate stockout</p>
        </div>

        {/* Predicted Stockouts */}
        <div
          onClick={() => onSelectTab('forecast')}
          className="bg-white p-4 rounded-2xl border border-slate-200/90 shadow-sm hover:shadow-md hover:border-purple-300 transition-all cursor-pointer group"
          title="Click to explore Demand Forecast module"
        >
          <div className="flex items-center justify-between text-slate-500">
            <span className="text-xs font-medium">Predicted Stockouts</span>
            <div className="w-8 h-8 rounded-xl bg-purple-50 text-purple-600 flex items-center justify-center group-hover:scale-110 transition-transform">
              <Clock className="w-4 h-4" />
            </div>
          </div>
          <p className="text-2xl font-bold text-purple-700 mt-2">{kpis.predictedStockouts}</p>
          <p className="text-[11px] text-purple-700 font-medium mt-1">Next 14 days risk</p>
        </div>

        {/* Est. Monthly Sales */}
        <div
          onClick={() => onSelectTab('sales')}
          className="bg-white p-4 rounded-2xl border border-slate-200/90 shadow-sm hover:shadow-md hover:border-teal-300 transition-all cursor-pointer group"
          title="Click to explore Sales Analytics module"
        >
          <div className="flex items-center justify-between text-slate-500">
            <span className="text-xs font-medium">Est. Monthly Sales</span>
            <div className="w-8 h-8 rounded-xl bg-teal-50 text-teal-600 flex items-center justify-center group-hover:scale-110 transition-transform">
              <TrendingUp className="w-4 h-4" />
            </div>
          </div>
          <p className="text-2xl font-bold text-slate-900 mt-2">
            {businessProfile.currency}
            {Math.round(kpis.estimatedMonthlyRevenue).toLocaleString()}
          </p>
          <div className="flex items-center gap-1 mt-1 text-[11px]">
            <span
              className={`font-semibold px-1.5 py-0.2 rounded text-[10px] ${
                kpis.revenueGrowthPercent >= 0
                  ? 'bg-emerald-100 text-emerald-800'
                  : 'bg-red-100 text-red-700'
              }`}
            >
              {kpis.revenueGrowthPercent >= 0 ? `+${kpis.revenueGrowthPercent}%` : `${kpis.revenueGrowthPercent}%`}
            </span>
            <span className="text-slate-400">vs prior 30D</span>
          </div>
        </div>
      </div>

      {/* Stock Health Progress Bar */}
      <div className="bg-white p-5 rounded-2xl border border-slate-200/90 shadow-sm">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 mb-3">
          <div>
            <h3 className="text-sm font-bold text-slate-900">Stock Health Distribution</h3>
            <p className="text-xs text-slate-500">
              Real-time status of all {products.length} products in catalog (Click any status to filter inventory)
            </p>
          </div>
          <div className="flex flex-wrap items-center gap-2 text-xs">
            <button
              onClick={() => (onNavigateToInventory ? onNavigateToInventory({ status: 'healthy' }) : onSelectTab('inventory'))}
              className="flex items-center gap-1.5 px-2.5 py-1 rounded-xl bg-emerald-50 hover:bg-emerald-100 text-emerald-800 border border-emerald-200 transition-colors cursor-pointer font-medium"
              title="Filter Healthy products"
            >
              <span className="w-2 h-2 rounded-full bg-emerald-500" />
              <span>Healthy ({kpis.healthyStockCount})</span>
            </button>

            <button
              onClick={() => (onNavigateToInventory ? onNavigateToInventory({ status: 'low' }) : onSelectTab('inventory'))}
              className="flex items-center gap-1.5 px-2.5 py-1 rounded-xl bg-amber-50 hover:bg-amber-100 text-amber-800 border border-amber-200 transition-colors cursor-pointer font-medium"
              title="Filter Low Stock products"
            >
              <span className="w-2 h-2 rounded-full bg-amber-500" />
              <span>Low ({kpis.lowStockCount})</span>
            </button>

            <button
              onClick={() => (onNavigateToInventory ? onNavigateToInventory({ status: 'critical' }) : onSelectTab('inventory'))}
              className="flex items-center gap-1.5 px-2.5 py-1 rounded-xl bg-orange-50 hover:bg-orange-100 text-orange-800 border border-orange-200 transition-colors cursor-pointer font-medium"
              title="Filter Critical Stock products"
            >
              <span className="w-2 h-2 rounded-full bg-orange-500" />
              <span>Critical ({kpis.criticalStockCount})</span>
            </button>

            <button
              onClick={() => (onNavigateToInventory ? onNavigateToInventory({ status: 'out_of_stock' }) : onSelectTab('inventory'))}
              className="flex items-center gap-1.5 px-2.5 py-1 rounded-xl bg-red-50 hover:bg-red-100 text-red-800 border border-red-200 transition-colors cursor-pointer font-medium"
              title="Filter Out of Stock products"
            >
              <span className="w-2 h-2 rounded-full bg-red-500" />
              <span>Out of Stock ({kpis.outOfStockCount})</span>
            </button>

            <button
              onClick={() => (onNavigateToInventory ? onNavigateToInventory({ status: 'overstocked' }) : onSelectTab('inventory'))}
              className="flex items-center gap-1.5 px-2.5 py-1 rounded-xl bg-indigo-50 hover:bg-indigo-100 text-indigo-800 border border-indigo-200 transition-colors cursor-pointer font-medium"
              title="Filter Overstocked products"
            >
              <span className="w-2 h-2 rounded-full bg-indigo-500" />
              <span>Overstocked ({kpis.overstockedCount})</span>
            </button>
          </div>
        </div>

        {/* Clickable Progress bar */}
        <div className="w-full h-3.5 bg-slate-100 rounded-full overflow-hidden flex shadow-inner cursor-pointer">
          <div
            onClick={() => (onNavigateToInventory ? onNavigateToInventory({ status: 'healthy' }) : onSelectTab('inventory'))}
            style={{ width: `${(kpis.healthyStockCount / Math.max(1, products.length)) * 100}%` }}
            className="bg-emerald-500 h-full transition-all duration-500 hover:opacity-85"
            title={`Healthy: ${kpis.healthyStockCount} products (Click to filter)`}
          />
          <div
            onClick={() => (onNavigateToInventory ? onNavigateToInventory({ status: 'low' }) : onSelectTab('inventory'))}
            style={{ width: `${(kpis.lowStockCount / Math.max(1, products.length)) * 100}%` }}
            className="bg-amber-400 h-full transition-all duration-500 hover:opacity-85"
            title={`Low Stock: ${kpis.lowStockCount} products (Click to filter)`}
          />
          <div
            onClick={() => (onNavigateToInventory ? onNavigateToInventory({ status: 'critical' }) : onSelectTab('inventory'))}
            style={{ width: `${(kpis.criticalStockCount / Math.max(1, products.length)) * 100}%` }}
            className="bg-orange-500 h-full transition-all duration-500 hover:opacity-85"
            title={`Critical Stock: ${kpis.criticalStockCount} products (Click to filter)`}
          />
          <div
            onClick={() => (onNavigateToInventory ? onNavigateToInventory({ status: 'out_of_stock' }) : onSelectTab('inventory'))}
            style={{ width: `${(kpis.outOfStockCount / Math.max(1, products.length)) * 100}%` }}
            className="bg-red-500 h-full transition-all duration-500 hover:opacity-85"
            title={`Out of Stock: ${kpis.outOfStockCount} products (Click to filter)`}
          />
          <div
            onClick={() => (onNavigateToInventory ? onNavigateToInventory({ status: 'overstocked' }) : onSelectTab('inventory'))}
            style={{ width: `${(kpis.overstockedCount / Math.max(1, products.length)) * 100}%` }}
            className="bg-indigo-500 h-full transition-all duration-500 hover:opacity-85"
            title={`Overstocked: ${kpis.overstockedCount} products (Click to filter)`}
          />
        </div>
      </div>

      {/* Main Charts Row */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Sales & Revenue Trend (30 Days) / 30-Day Demand Forecast */}
        <div className="lg:col-span-2 bg-white p-5 rounded-2xl border border-slate-200/90 shadow-sm flex flex-col justify-between">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 mb-4">
            <div>
              <div className="flex items-center gap-2">
                <h3 className="text-sm font-bold text-slate-900">
                  {chartTab === 'sales'
                    ? '30-Day Sales & Revenue Velocity'
                    : '30-Day Predicted Demand & Inventory Burn'}
                </h3>
              </div>
              <p className="text-xs text-slate-500 mt-0.5">
                {chartTab === 'sales'
                  ? 'Historical daily sales volume across all channels derived from store transactions'
                  : 'Predictive daily demand and inventory depletion across all catalog products'}
              </p>
            </div>

            {/* Chart toggle switcher */}
            <div className="flex items-center gap-1.5 p-1 bg-slate-100 rounded-xl border border-slate-200 self-start sm:self-auto">
              <button
                onClick={() => setChartTab('sales')}
                className={`px-3 py-1.5 text-xs font-bold rounded-lg transition-all ${
                  chartTab === 'sales'
                    ? 'bg-white text-emerald-700 shadow-sm'
                    : 'text-slate-600 hover:text-slate-900'
                }`}
              >
                Sales History (30D)
              </button>
              <button
                onClick={() => setChartTab('forecast')}
                className={`px-3 py-1.5 text-xs font-bold rounded-lg transition-all ${
                  chartTab === 'forecast'
                    ? 'bg-white text-blue-700 shadow-sm'
                    : 'text-slate-600 hover:text-slate-900'
                }`}
              >
                Demand Forecast (Next 30D)
              </button>
            </div>
          </div>

          <div className="h-64 w-full">
            <ResponsiveContainer width="100%" height="100%">
              {chartTab === 'sales' ? (
                <AreaChart data={salesChartData} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                  <defs>
                    <linearGradient id="revenueGrad" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="#10b981" stopOpacity={0.3} />
                      <stop offset="95%" stopColor="#10b981" stopOpacity={0.0} />
                    </linearGradient>
                  </defs>
                  <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" />
                  <XAxis dataKey="displayDate" tick={{ fontSize: 11, fill: '#64748b' }} axisLine={false} tickLine={false} />
                  <YAxis tick={{ fontSize: 11, fill: '#64748b' }} axisLine={false} tickLine={false} />
                  <Tooltip
                    formatter={(value: any, name: any) => [
                      `${businessProfile.currency}${Number(value).toLocaleString()}`,
                      'Gross Revenue',
                    ]}
                    labelFormatter={(label) => `Date: ${label}`}
                    contentStyle={{ backgroundColor: '#0f172a', borderRadius: '12px', color: '#fff', fontSize: '12px' }}
                  />
                  <Area type="monotone" dataKey="revenue" stroke="#10b981" strokeWidth={2.5} fillOpacity={1} fill="url(#revenueGrad)" />
                </AreaChart>
              ) : (
                <AreaChart data={projectedDemandData} margin={{ top: 10, right: 10, left: -10, bottom: 0 }}>
                  <defs>
                    <linearGradient id="forecastDemandGrad" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="#3b82f6" stopOpacity={0.35} />
                      <stop offset="95%" stopColor="#3b82f6" stopOpacity={0.0} />
                    </linearGradient>
                  </defs>
                  <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" />
                  <XAxis dataKey="displayDate" tick={{ fontSize: 10, fill: '#64748b' }} axisLine={false} tickLine={false} />
                  <YAxis tick={{ fontSize: 10, fill: '#64748b' }} axisLine={false} tickLine={false} />
                  <Tooltip
                    formatter={(val: any, name: any) => [
                      name === 'projectedRevenue'
                        ? `${businessProfile.currency}${Number(val).toLocaleString()}`
                        : `${Number(val).toLocaleString()} units`,
                      name === 'projectedRevenue'
                        ? 'Projected Revenue'
                        : name === 'projectedUnits'
                        ? 'Projected Daily Demand'
                        : 'Warehouse Inventory Left',
                    ]}
                    contentStyle={{ backgroundColor: '#0f172a', borderRadius: '12px', color: '#fff', fontSize: '12px' }}
                  />
                  <Area
                    type="monotone"
                    dataKey="projectedRevenue"
                    stroke="#3b82f6"
                    strokeWidth={2.5}
                    fillOpacity={1}
                    fill="url(#forecastDemandGrad)"
                  />
                </AreaChart>
              )}
            </ResponsiveContainer>
          </div>

          <div className="flex items-center justify-between text-xs text-slate-500 pt-3 border-t border-slate-100 mt-2">
            {chartTab === 'sales' ? (
              <>
                <span className="flex items-center gap-1.5">
                  <span className="w-2.5 h-2.5 rounded-full bg-emerald-500" />
                  Past 30 Days Actual Sales Revenue
                </span>
                <button
                  onClick={() => onSelectTab('sales')}
                  className="font-semibold text-emerald-600 hover:text-emerald-700 flex items-center gap-1"
                >
                  <span>Full Sales Analytics</span>
                  <ArrowRight className="w-3.5 h-3.5" />
                </button>
              </>
            ) : (
              <>
                <span className="flex items-center gap-1.5">
                  <span className="w-2.5 h-2.5 rounded-full bg-blue-500" />
                  Deterministic 30-Day Projected Revenue Curve
                </span>
                <button
                  onClick={() => onSelectTab('forecast')}
                  className="font-semibold text-blue-600 hover:text-blue-700 flex items-center gap-1"
                >
                  <span>Full Demand Forecast Module</span>
                  <ArrowRight className="w-3.5 h-3.5" />
                </button>
              </>
            )}
          </div>
        </div>

        {/* Inventory Value by Category */}
        <div className="bg-white p-5 rounded-2xl border border-slate-200/90 shadow-sm flex flex-col justify-between">
          <div className="flex items-center justify-between mb-2">
            <div>
              <h3 className="text-sm font-bold text-slate-900">Capital by Category</h3>
              <p className="text-xs text-slate-500">Where working capital is concentrated (Click bar to filter)</p>
            </div>
          </div>

          <div className="h-64 w-full flex items-center justify-center">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={categoryValueData} layout="vertical" margin={{ top: 5, right: 10, left: 10, bottom: 5 }}>
                <CartesianGrid strokeDasharray="3 3" horizontal={false} stroke="#f1f5f9" />
                <XAxis type="number" tick={{ fontSize: 10, fill: '#64748b' }} axisLine={false} tickLine={false} />
                <YAxis dataKey="name" type="category" width={110} tick={{ fontSize: 10, fill: '#475569' }} axisLine={false} tickLine={false} />
                <Tooltip
                  formatter={(val: any) => [`${businessProfile.currency}${Number(val).toLocaleString()}`, 'Inventory Value']}
                  contentStyle={{ backgroundColor: '#0f172a', borderRadius: '12px', color: '#fff', fontSize: '12px' }}
                />
                <Bar
                  dataKey="value"
                  fill="#3b82f6"
                  radius={[0, 6, 6, 0]}
                  className="cursor-pointer hover:opacity-85 transition-opacity"
                  onClick={(entry: any) => onNavigateToInventory?.({ category: entry.name })}
                />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>
      </div>

      {/* AI Recommendations & Smart Reorder Hub */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left: Priority Reorder Recommendations */}
        <div className="lg:col-span-2 bg-white rounded-2xl border border-slate-200/90 shadow-sm overflow-hidden flex flex-col justify-between">
          <div className="p-5 border-b border-slate-100 flex items-center justify-between bg-slate-50/50">
            <div>
              <div className="flex items-center gap-2">
                <h3 className="text-sm font-bold text-slate-900">Smart Reorder Recommendations</h3>
                <span className="text-[11px] font-semibold bg-emerald-100 text-emerald-800 px-2 py-0.5 rounded-full">
                  {reorderRecommendations.length} Needed
                </span>
              </div>
              <p className="text-xs text-slate-500 mt-0.5">
                Calculated using supplier lead times, average daily sales, and safety stock formulas
              </p>
            </div>

            <button
              onClick={() => onSelectTab('planning')}
              className="text-xs font-semibold text-emerald-600 hover:text-emerald-700 flex items-center gap-1"
            >
              <span>Full Planning Hub</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </button>
          </div>

          <div className="divide-y divide-slate-100 overflow-x-auto">
            {reorderRecommendations.length === 0 ? (
              <div className="p-8 text-center text-slate-500 text-xs">
                All inventory is currently above the reorder point.
              </div>
            ) : (
              reorderRecommendations.slice(0, 4).map((rec) => (
                <div key={rec.product.id} className="p-4 hover:bg-slate-50/80 transition-colors flex items-center justify-between gap-4">
                  <div className="min-w-0 flex-1">
                    <div className="flex items-center gap-2">
                      <span
                        className={`text-[10px] font-bold px-2 py-0.5 rounded uppercase tracking-wider ${
                          rec.priority === 'critical'
                            ? 'bg-red-100 text-red-700'
                            : rec.priority === 'high'
                            ? 'bg-amber-100 text-amber-800'
                            : 'bg-blue-100 text-blue-800'
                        }`}
                      >
                        {rec.priority}
                      </span>
                      <h4
                        onClick={() => onNavigateToInventory?.({ search: rec.product.sku })}
                        className="text-xs font-bold text-slate-900 truncate hover:text-emerald-700 cursor-pointer"
                        title="Click to view in inventory"
                      >
                        {rec.product.name}
                      </h4>
                      <span className="text-[11px] text-slate-400 font-mono">({rec.product.sku})</span>
                    </div>

                    <div className="flex flex-wrap items-center gap-x-4 gap-y-1 mt-1 text-[11px] text-slate-500">
                      <span>Stock: <strong className={rec.currentStock === 0 ? 'text-red-600' : 'text-slate-800'}>{rec.currentStock} units</strong></span>
                      <span>Daily: <strong>{rec.avgDailySales} /day</strong></span>
                      <span>Lead Time: <strong>{rec.leadTimeDays}d</strong></span>
                      <span>Est. Stockout: <strong className="text-red-600">{rec.predictedStockoutDate || 'Depleted'}</strong></span>
                    </div>
                  </div>

                  <div className="flex items-center gap-3 shrink-0">
                    <div className="text-right hidden sm:block">
                      <p className="text-xs font-bold text-slate-900">
                        Order {rec.recommendedOrderQty} {rec.product.unit}s
                      </p>
                      <p className="text-[11px] text-slate-500">
                        {businessProfile.currency}{rec.estimatedCost.toLocaleString()}
                      </p>
                    </div>

                    <button
                      onClick={() => onOpenCreatePO(rec.product.supplierId, rec.product.id, rec.recommendedOrderQty)}
                      className="px-3 py-1.5 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white font-semibold text-xs transition-colors shadow-sm"
                    >
                      Create PO
                    </button>
                  </div>
                </div>
              ))
            )}
          </div>

          <div className="p-3 bg-slate-50 border-t border-slate-100 text-center">
            <button
              onClick={() => onSelectTab('planning')}
              className="text-xs font-medium text-slate-600 hover:text-slate-900"
            >
              View all {reorderRecommendations.length} reorder suggestions &rarr;
            </button>
          </div>
        </div>

        {/* Right: AI Assistant & Health Audit Widget */}
        <div className="bg-gradient-to-br from-slate-900 via-slate-900 to-emerald-950 p-6 rounded-2xl text-white border border-slate-800 flex flex-col justify-between shadow-lg">
          <div>
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <img
                  src="/stocksense-logo.jpeg"
                  alt="StockSense AI"
                  className="w-8 h-8 rounded-xl object-cover border border-emerald-500/40 shadow-sm"
                />
                <div>
                  <h3 className="text-sm font-bold text-white">StockSense AI Auditor</h3>
                  <p className="text-[11px] text-emerald-300">Proprietary Forecasting Engine</p>
                </div>
              </div>

              <button
                onClick={handleRunAiAudit}
                disabled={aiAuditing}
                className="px-3 py-1.5 text-xs font-semibold bg-emerald-500 hover:bg-emerald-400 text-slate-950 rounded-lg shadow-sm transition-all disabled:opacity-50"
              >
                {aiAuditing ? 'Analyzing...' : 'Run Audit'}
              </button>
            </div>

            {aiAuditMemo ? (
              <div className="mt-4 space-y-3 text-xs animate-in fade-in">
                <div className="p-3 rounded-xl bg-slate-800/80 border border-emerald-500/30">
                  <span className="text-[10px] uppercase font-bold text-emerald-400 tracking-wider">Health Assessment</span>
                  <p className="font-semibold text-white mt-0.5">{aiAuditMemo.overallHealth}</p>
                  <p className="text-[11px] text-slate-300 mt-1 leading-relaxed">{aiAuditMemo.executiveSummary}</p>
                </div>

                <div className="space-y-1.5">
                  <span className="text-[10px] uppercase font-bold text-slate-400 tracking-wider">Prioritized Actions</span>
                  {aiAuditMemo.actionPlan?.map((action: string, idx: number) => (
                    <div key={idx} className="flex items-start gap-2 text-slate-300 text-[11px]">
                      <span className="text-emerald-400 font-bold">•</span>
                      <span>{action}</span>
                    </div>
                  ))}
                </div>
              </div>
            ) : (
              <div className="mt-4 p-4 rounded-xl bg-slate-800/50 border border-slate-700/50 text-xs text-slate-300 space-y-2">
                <p className="font-semibold text-white">Automated Risk Scan:</p>
                <p className="text-[11px] leading-relaxed text-slate-400">
                  StockSense continuously audits supplier reliability, identifies dead stock holding up capital, and flags high-velocity stockouts.
                </p>
                <div className="pt-2 border-t border-slate-700/50 flex items-center justify-between text-[11px]">
                  <span className="text-slate-400">Calculated Stockout Risk Exposure:</span>
                  <span className="text-amber-400 font-bold">
                    {businessProfile.currency}{potentialStockoutRiskValue.toLocaleString()}
                  </span>
                </div>
              </div>
            )}
          </div>

          <div className="mt-5 pt-4 border-t border-slate-800">
            <button
              onClick={() => onSelectTab('assistant')}
              className="w-full py-2.5 px-4 rounded-xl bg-slate-800 hover:bg-slate-700 text-white font-semibold text-xs flex items-center justify-center gap-2 transition-colors border border-slate-700"
            >
              <img src="/stocksense-logo.jpeg" alt="Logo" className="w-4 h-4 rounded-full object-cover" />
              <span>Open StockSense AI Assistant</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </button>
          </div>
        </div>
      </div>

      {/* Top Sellers vs Slow Movers Summary */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Top 5 Best Sellers */}
        <div className="bg-white p-5 rounded-2xl border border-slate-200/90 shadow-sm">
          <div className="flex items-center justify-between mb-4">
            <div>
              <h3 className="text-sm font-bold text-slate-900">Top-Selling Products (90 Days)</h3>
              <p className="text-xs text-slate-500">Highest volume items driving store revenue (Click to filter)</p>
            </div>
            <span className="text-xs font-semibold text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded-md">
              Top 5 Velocity
            </span>
          </div>

          <div className="space-y-3">
            {topSellingProducts.map((p, idx) => (
              <div
                key={p.sku}
                onClick={() => onNavigateToInventory?.({ search: p.sku })}
                className="flex items-center justify-between text-xs p-2 rounded-xl hover:bg-slate-100 transition-colors cursor-pointer group"
                title={`Click to filter ${p.name} in inventory`}
              >
                <div className="flex items-center gap-3 min-w-0">
                  <span className="w-5 h-5 rounded-full bg-slate-100 text-slate-700 font-bold flex items-center justify-center text-[10px] group-hover:bg-emerald-100 group-hover:text-emerald-800 transition-colors">
                    {idx + 1}
                  </span>
                  <div className="min-w-0">
                    <p className="font-semibold text-slate-900 truncate group-hover:text-emerald-700">{p.name}</p>
                    <p className="text-[11px] text-slate-400 font-mono">{p.sku}</p>
                  </div>
                </div>
                <div className="text-right shrink-0">
                  <p className="font-bold text-slate-900">{p.units} units sold</p>
                  <p className="text-[11px] text-emerald-600 font-medium">
                    {businessProfile.currency}{p.revenue.toLocaleString()}
                  </p>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Slow-Moving / Overstocked Products */}
        <div className="bg-white p-5 rounded-2xl border border-slate-200/90 shadow-sm">
          <div className="flex items-center justify-between mb-4">
            <div>
              <h3 className="text-sm font-bold text-slate-900">Capital Lock / Overstocked Items</h3>
              <p className="text-xs text-slate-500">Products with over 60 days of current stock (Click to filter)</p>
            </div>
            <span className="text-xs font-semibold text-indigo-700 bg-indigo-50 px-2 py-0.5 rounded-md">
              Capital Optimization
            </span>
          </div>

          <div className="space-y-3">
            {overstockedProducts.length === 0 ? (
              <div className="p-6 text-center text-slate-400 text-xs">No overstocked items detected.</div>
            ) : (
              overstockedProducts.map((p) => {
                const daysOfSupply = p.avgDailySales > 0 ? Math.round(p.currentStock / p.avgDailySales) : 99;
                const tiedValue = p.currentStock * p.purchaseCost;
                return (
                  <div
                    key={p.id}
                    onClick={() => onNavigateToInventory?.({ search: p.sku, status: 'overstocked' })}
                    className="flex items-center justify-between text-xs p-2 rounded-xl hover:bg-slate-100 transition-colors cursor-pointer group"
                    title={`Click to filter ${p.name} in inventory`}
                  >
                    <div className="min-w-0">
                      <p className="font-semibold text-slate-900 truncate group-hover:text-indigo-600">{p.name}</p>
                      <p className="text-[11px] text-slate-500">
                        {p.currentStock} units on hand (~{daysOfSupply} days supply)
                      </p>
                    </div>
                    <div className="text-right shrink-0">
                      <p className="font-bold text-indigo-700">
                        {businessProfile.currency}{tiedValue.toLocaleString()}
                      </p>
                      <p className="text-[10px] text-slate-400">Capital tied up</p>
                    </div>
                  </div>
                );
              })
            )}
          </div>
        </div>
      </div>
    </div>
  );
};
