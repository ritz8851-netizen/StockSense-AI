import React, { useState, useMemo } from 'react';
import {
  TrendingUp,
  Clock,
  AlertTriangle,
  Sparkles,
  Search,
  CheckCircle2,
  Calendar,
  Layers,
  ShoppingBag,
  ArrowRight,
  Info,
} from 'lucide-react';
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  ReferenceLine,
} from 'recharts';
import { useStore } from '../../context/StoreContext';
import { Product } from '../../types';
import { generateDemandForecast, calculateReorderRecommendation } from '../../utils/forecasting';

interface DemandForecastViewProps {
  onOpenCreatePO: (supplierId?: string, productId?: string) => void;
}

export const DemandForecastView: React.FC<DemandForecastViewProps> = ({ onOpenCreatePO }) => {
  const { products, sales, businessProfile } = useStore();

  const [periodDays, setPeriodDays] = useState<number>(30);
  const [selectedProductId, setSelectedProductId] = useState<string>(
    products[0]?.id || ''
  );
  const [searchQuery, setSearchQuery] = useState('');
  const [aiInsight, setAiInsight] = useState<any>(null);
  const [aiLoading, setAiLoading] = useState(false);

  const selectedProduct = products.find((p) => p.id === selectedProductId) || products[0];

  // Forecast metrics for all products
  const forecastList = useMemo(() => {
    return products.map((p) => {
      const forecast = generateDemandForecast(p, sales, periodDays);
      const reorderRec = calculateReorderRecommendation(p, sales);
      return {
        product: p,
        forecast,
        reorderRec,
      };
    });
  }, [products, sales, periodDays]);

  // Filtered list
  const filteredForecasts = useMemo(() => {
    return forecastList.filter(
      (f) =>
        f.product.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        f.product.sku.toLowerCase().includes(searchQuery.toLowerCase()) ||
        f.product.category.toLowerCase().includes(searchQuery.toLowerCase())
    );
  }, [forecastList, searchQuery]);

  // Daily projected inventory depletion trajectory for the selected product
  const depletionChartData = useMemo(() => {
    if (!selectedProduct) return [];
    const forecast = generateDemandForecast(selectedProduct, sales, periodDays);
    const dailyBurn = forecast.dailyDepletionRate;
    const reorderThreshold = selectedProduct.minStock;

    const data: Array<{
      day: number;
      dateLabel: string;
      projectedStock: number;
      reorderPoint: number;
    }> = [];

    const today = new Date();
    let current = selectedProduct.currentStock;

    for (let i = 0; i <= periodDays; i++) {
      const d = new Date(today);
      d.setDate(d.getDate() + i);
      const label = d.toLocaleDateString('en-IN', { day: 'numeric', month: 'short' });

      data.push({
        day: i,
        dateLabel: i === 0 ? 'Today' : label,
        projectedStock: Math.max(0, Math.round(current)),
        reorderPoint: reorderThreshold,
      });

      current -= dailyBurn;
    }

    return data;
  }, [selectedProduct, sales, periodDays]);

  // Trigger Gemini AI Forecast Analysis
  const handleExplainWithAi = async () => {
    if (!selectedProduct) return;
    setAiLoading(true);
    setAiInsight(null);

    const forecast = generateDemandForecast(selectedProduct, sales, periodDays);

    try {
      const res = await fetch('/api/ai/forecast-insight', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          product: selectedProduct,
          forecastMetrics: forecast,
        }),
      });
      const data = await res.json();
      setAiInsight(data);
    } catch (e) {
      console.error('Forecast insight failed:', e);
    } finally {
      setAiLoading(false);
    }
  };

  const selectedMetrics = selectedProduct
    ? generateDemandForecast(selectedProduct, sales, periodDays)
    : null;

  return (
    <div className="p-4 sm:p-6 lg:p-8 space-y-6 max-w-7xl mx-auto">
      {/* Header & Period Selectors */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <span className="text-xs font-semibold px-2.5 py-0.5 rounded-full bg-blue-50 text-blue-700 border border-blue-200">
              Deterministic Engine
            </span>
            <span className="text-xs text-slate-400">Moving Average + Trend Analysis</span>
          </div>
          <h1 className="text-2xl font-extrabold text-slate-900 tracking-tight mt-1">
            AI Demand Forecasting
          </h1>
          <p className="text-xs sm:text-sm text-slate-500 mt-0.5">
            Predict future stock depletion, estimate stockout dates, and plan purchase replenishment ahead of time.
          </p>
        </div>

        {/* Timeframe Selector Pills */}
        <div className="flex items-center gap-1.5 p-1 bg-slate-100 rounded-2xl border border-slate-200/80">
          {[7, 15, 30, 60, 90].map((days) => (
            <button
              key={days}
              onClick={() => {
                setPeriodDays(days);
                setAiInsight(null);
              }}
              className={`px-3 py-1.5 text-xs font-bold rounded-xl transition-all ${
                periodDays === days
                  ? 'bg-white text-emerald-700 shadow-sm'
                  : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              Next {days}D
            </button>
          ))}
        </div>
      </div>

      {/* Product Highlight & Interactive Projection Chart */}
      {selectedProduct && selectedMetrics && (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Left 2 Cols: Depletion Trajectory Chart */}
          <div className="lg:col-span-2 bg-white p-5 rounded-2xl border border-slate-200/90 shadow-sm flex flex-col justify-between">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 mb-4">
              <div>
                <div className="flex items-center gap-2">
                  <h3 className="text-sm font-bold text-slate-900">{selectedProduct.name}</h3>
                  <span className="font-mono text-xs text-slate-400">({selectedProduct.sku})</span>
                </div>
                <p className="text-xs text-slate-500">
                  Current Stock: <strong>{selectedProduct.currentStock} {selectedProduct.unit}s</strong> | Burn Rate: ~<strong>{selectedMetrics.dailyDepletionRate} /day</strong>
                </p>
              </div>

              <div className="flex items-center gap-2">
                <button
                  onClick={handleExplainWithAi}
                  disabled={aiLoading}
                  className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold rounded-xl bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-500 hover:to-teal-500 text-white shadow-sm transition-all disabled:opacity-50"
                >
                  <Sparkles className="w-3.5 h-3.5" />
                  <span>{aiLoading ? 'Analyzing...' : 'Ask AI to Explain'}</span>
                </button>

                <button
                  onClick={() => onOpenCreatePO(selectedProduct.supplierId, selectedProduct.id)}
                  className="flex items-center gap-1 px-3 py-1.5 text-xs font-semibold bg-emerald-50 hover:bg-emerald-100 text-emerald-800 border border-emerald-200 rounded-xl transition-colors"
                >
                  <ShoppingBag className="w-3.5 h-3.5" />
                  <span>Reorder</span>
                </button>
              </div>
            </div>

            {/* Recharts Depletion Curve */}
            <div className="h-64 w-full">
              <ResponsiveContainer width="100%" height="100%">
                <LineChart data={depletionChartData} margin={{ top: 10, right: 20, left: -20, bottom: 0 }}>
                  <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" />
                  <XAxis dataKey="dateLabel" tick={{ fontSize: 10, fill: '#64748b' }} axisLine={false} tickLine={false} />
                  <YAxis tick={{ fontSize: 10, fill: '#64748b' }} axisLine={false} tickLine={false} />
                  <Tooltip
                    formatter={(val: any, name: any) => [
                      `${val} units`,
                      name === 'projectedStock' ? 'Projected Inventory' : 'Min Threshold',
                    ]}
                    contentStyle={{ backgroundColor: '#0f172a', borderRadius: '12px', color: '#fff', fontSize: '12px' }}
                  />
                  <ReferenceLine
                    y={selectedProduct.minStock}
                    stroke="#f59e0b"
                    strokeDasharray="4 4"
                    label={{ value: 'Min Stock Level', fill: '#f59e0b', fontSize: 10, position: 'insideTopRight' }}
                  />
                  <Line
                    type="monotone"
                    dataKey="projectedStock"
                    stroke="#3b82f6"
                    strokeWidth={3}
                    dot={false}
                    activeDot={{ r: 6 }}
                  />
                </LineChart>
              </ResponsiveContainer>
            </div>

            <div className="flex items-center justify-between text-xs text-slate-500 pt-3 border-t border-slate-100 mt-2">
              <span className="flex items-center gap-1.5">
                <span className="w-2.5 h-2.5 rounded-full bg-blue-500" />
                Projected Depletion Curve
              </span>
              <span className="flex items-center gap-1.5">
                <span className="w-2.5 h-2.5 rounded-full bg-amber-400" />
                Reorder Threshold ({selectedProduct.minStock} units)
              </span>
            </div>
          </div>

          {/* Right Col: Metric Summary & Gemini Insights */}
          <div className="bg-slate-50 p-5 rounded-2xl border border-slate-200 flex flex-col justify-between">
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <h4 className="text-xs font-bold uppercase tracking-wider text-slate-500">
                  {periodDays}-Day Forecast Metrics
                </h4>
                <span className="text-[11px] font-bold text-emerald-700 bg-emerald-100 px-2 py-0.5 rounded-full">
                  {selectedMetrics.confidenceScore}% Confidence
                </span>
              </div>

              <div className="grid grid-cols-2 gap-3 text-xs">
                <div className="p-3 bg-white rounded-xl border border-slate-200">
                  <span className="text-[10px] text-slate-400 uppercase font-bold">Predicted Sales</span>
                  <p className="text-lg font-bold text-slate-900 mt-0.5">
                    {selectedMetrics.predictedSales} {selectedProduct.unit}s
                  </p>
                  <p className="text-[10px] text-slate-400">Over {periodDays} days</p>
                </div>

                <div className="p-3 bg-white rounded-xl border border-slate-200">
                  <span className="text-[10px] text-slate-400 uppercase font-bold">Days of Stock Left</span>
                  <p className={`text-lg font-bold mt-0.5 ${selectedMetrics.daysLeft <= 4 ? 'text-red-600' : 'text-slate-900'}`}>
                    {selectedMetrics.daysLeft} Days
                  </p>
                  <p className="text-[10px] text-slate-400">At current velocity</p>
                </div>

                <div className="p-3 bg-white rounded-xl border border-slate-200">
                  <span className="text-[10px] text-slate-400 uppercase font-bold">Stockout Date</span>
                  <p className="text-xs font-bold text-red-600 mt-0.5 truncate">
                    {selectedMetrics.stockoutDate || 'No stockout in period'}
                  </p>
                  <p className="text-[10px] text-slate-400">Based on burn rate</p>
                </div>

                <div className="p-3 bg-white rounded-xl border border-slate-200">
                  <span className="text-[10px] text-slate-400 uppercase font-bold">Suggested Reorder</span>
                  <p className="text-xs font-bold text-emerald-700 mt-0.5">
                    {selectedMetrics.suggestedOrderQty} units
                  </p>
                  <p className="text-[10px] text-slate-400">By {selectedMetrics.suggestedOrderDate}</p>
                </div>
              </div>

              {/* AI Insight Box */}
              {aiInsight ? (
                <div className="p-3.5 rounded-xl bg-slate-900 text-white text-xs space-y-2 border border-slate-800 animate-in fade-in">
                  <div className="flex items-center justify-between text-emerald-400">
                    <span className="font-bold flex items-center gap-1.5">
                      <img src="/stocksense-logo.jpeg" alt="AI" className="w-4 h-4 rounded-full object-cover border border-emerald-500/40" />
                      StockSense AI Demand Analysis
                    </span>
                    <span className="text-[10px] bg-emerald-950 px-2 py-0.5 rounded border border-emerald-700">
                      Risk: {aiInsight.riskLevel}
                    </span>
                  </div>
                  <p className="text-[11px] text-slate-300 leading-relaxed">{aiInsight.summary}</p>
                  <div className="pt-2 border-t border-slate-800 text-[11px]">
                    <strong className="text-emerald-300">Action:</strong> {aiInsight.recommendation}
                  </div>
                </div>
              ) : (
                <div className="p-3 rounded-xl bg-white border border-slate-200 text-xs text-slate-600 flex items-start gap-2">
                  <Info className="w-4 h-4 text-blue-500 shrink-0 mt-0.5" />
                  <p className="text-[11px] leading-relaxed">
                    Forecast model uses a weighted moving average (50% recent 7D, 30% prior 14D) combined with weekend velocity patterns. Click &quot;Ask AI to Explain&quot; for intelligent qualitative reasoning.
                  </p>
                </div>
              )}
            </div>

            <div className="pt-4 border-t border-slate-200 text-xs">
              <span className="text-slate-500 text-[11px]">Supplier:</span>{' '}
              <strong className="text-slate-800">{selectedProduct.supplierName}</strong> (
              {selectedProduct.leadTimeDays}d lead time)
            </div>
          </div>
        </div>
      )}

      {/* Catalog Forecasting Table */}
      <div className="bg-white rounded-2xl border border-slate-200/90 shadow-sm overflow-hidden">
        <div className="p-4 border-b border-slate-100 flex flex-col sm:flex-row sm:items-center justify-between gap-3 bg-slate-50/50">
          <div>
            <h3 className="text-sm font-bold text-slate-900">
              Catalog Demand Forecast Table ({periodDays}-Day Horizon)
            </h3>
            <p className="text-xs text-slate-500">
              Click any product row to graph its daily inventory depletion trajectory above
            </p>
          </div>

          <div className="relative w-full sm:w-64">
            <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search product, category, SKU..."
              className="w-full pl-9 pr-3 py-1.5 text-xs bg-white border border-slate-200 rounded-xl focus:ring-2 focus:ring-emerald-500/20 text-slate-800"
            />
          </div>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className="bg-slate-50 text-slate-600 uppercase font-bold text-[10px] border-b border-slate-200">
              <tr>
                <th className="py-3 px-4">Product</th>
                <th className="py-3 px-3 text-center">Current Stock</th>
                <th className="py-3 px-3 text-center">Daily Burn</th>
                <th className="py-3 px-3 text-center">Predicted {periodDays}D Sales</th>
                <th className="py-3 px-3 text-center">Days Left</th>
                <th className="py-3 px-3">Est. Stockout Date</th>
                <th className="py-3 px-3">Suggested Reorder</th>
                <th className="py-3 px-4 text-right">Action</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {filteredForecasts.map(({ product: p, forecast: f, reorderRec: r }) => {
                const isSelected = selectedProductId === p.id;
                return (
                  <tr
                    key={p.id}
                    onClick={() => {
                      setSelectedProductId(p.id);
                      setAiInsight(null);
                    }}
                    className={`cursor-pointer transition-colors ${
                      isSelected ? 'bg-emerald-50/60 font-semibold' : 'hover:bg-slate-50/80'
                    }`}
                  >
                    <td className="py-3 px-4">
                      <p className="font-bold text-slate-900">{p.name}</p>
                      <span className="font-mono text-[10px] text-slate-400">{p.sku} • {p.category}</span>
                    </td>

                    <td className="py-3 px-3 text-center">
                      <span className={`font-bold ${p.currentStock === 0 ? 'text-red-600' : 'text-slate-800'}`}>
                        {p.currentStock} {p.unit}s
                      </span>
                    </td>

                    <td className="py-3 px-3 text-center text-slate-700">
                      {f.dailyDepletionRate} /day
                    </td>

                    <td className="py-3 px-3 text-center font-bold text-slate-900">
                      {f.predictedSales} {p.unit}s
                    </td>

                    <td className="py-3 px-3 text-center">
                      <span
                        className={`inline-flex px-2 py-0.5 rounded-full text-[11px] font-bold ${
                          f.daysLeft <= (p.leadTimeDays || 3)
                            ? 'bg-red-100 text-red-700'
                            : f.daysLeft <= 10
                            ? 'bg-amber-100 text-amber-800'
                            : 'bg-emerald-100 text-emerald-800'
                        }`}
                      >
                        {f.daysLeft} days
                      </span>
                    </td>

                    <td className="py-3 px-3">
                      {f.stockoutDate ? (
                        <span className="text-red-600 font-bold">{f.stockoutDate}</span>
                      ) : (
                        <span className="text-slate-400">Beyond {periodDays}D</span>
                      )}
                    </td>

                    <td className="py-3 px-3">
                      <p className="font-bold text-slate-900">
                        {r.recommendedOrderQty} {p.unit}s
                      </p>
                      <span className="text-[10px] text-slate-400">by {r.suggestedOrderDate}</span>
                    </td>

                    <td className="py-3 px-4 text-right">
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          onOpenCreatePO(p.supplierId, p.id);
                        }}
                        className="px-3 py-1 bg-slate-100 hover:bg-emerald-600 hover:text-white rounded-lg text-xs font-semibold text-slate-700 transition-colors"
                      >
                        Order
                      </button>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};
