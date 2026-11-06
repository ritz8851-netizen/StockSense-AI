import React, { useState, useMemo } from 'react';
import {
  BarChart3,
  Calendar,
  IndianRupee,
  ShoppingCart,
  TrendingUp,
  Percent,
  Plus,
  Upload,
  ArrowUpRight,
  Filter,
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

interface SalesAnalyticsViewProps {
  onOpenRecordSale: () => void;
}

export const SalesAnalyticsView: React.FC<SalesAnalyticsViewProps> = ({ onOpenRecordSale }) => {
  const { sales, products, businessProfile } = useStore();

  const [dateFilter, setDateFilter] = useState<'7' | '30' | '90' | 'all'>('30');
  const [channelFilter, setChannelFilter] = useState<string>('all');

  // Filter sales based on selected date window
  const filteredSales = useMemo(() => {
    const today = new Date();
    let cutoffStr = '';

    if (dateFilter !== 'all') {
      const days = parseInt(dateFilter, 10);
      const cutoff = new Date(today);
      cutoff.setDate(cutoff.getDate() - days);
      cutoffStr = cutoff.toISOString().split('T')[0];
    }

    return sales.filter((s) => {
      const matchesDate = !cutoffStr || s.date >= cutoffStr;
      const matchesChannel = channelFilter === 'all' || s.channel === channelFilter;
      return matchesDate && matchesChannel;
    });
  }, [sales, dateFilter, channelFilter]);

  // Aggregate financial metrics
  const metrics = useMemo(() => {
    let totalRevenue = 0;
    let totalUnits = 0;
    let totalCogs = 0;

    filteredSales.forEach((s) => {
      totalRevenue += s.totalRevenue;
      totalUnits += s.quantity;
      totalCogs += s.quantity * s.costPrice;
    });

    const grossProfit = totalRevenue - totalCogs;
    const grossMarginPercent = totalRevenue > 0 ? (grossProfit / totalRevenue) * 100 : 0;
    const days = dateFilter === 'all' ? 90 : parseInt(dateFilter, 10);
    const avgDailySalesUnits = totalUnits / Math.max(1, days);
    const avgDailyRevenue = totalRevenue / Math.max(1, days);

    return {
      totalRevenue: Math.round(totalRevenue),
      totalUnits,
      totalCogs: Math.round(totalCogs),
      grossProfit: Math.round(grossProfit),
      grossMarginPercent: Number(grossMarginPercent.toFixed(1)),
      avgDailySalesUnits: Number(avgDailySalesUnits.toFixed(1)),
      avgDailyRevenue: Math.round(avgDailyRevenue),
    };
  }, [filteredSales, dateFilter]);

  // Daily revenue trend chart data
  const trendData = useMemo(() => {
    const dailyMap: Record<string, { date: string; displayDate: string; revenue: number; profit: number }> = {};
    const daysCount = dateFilter === 'all' ? 60 : parseInt(dateFilter, 10);
    const today = new Date();

    for (let i = daysCount - 1; i >= 0; i--) {
      const d = new Date(today);
      d.setDate(d.getDate() - i);
      const iso = d.toISOString().split('T')[0];
      const displayDate = d.toLocaleDateString('en-IN', { day: 'numeric', month: 'short' });
      dailyMap[iso] = { date: iso, displayDate, revenue: 0, profit: 0 };
    }

    filteredSales.forEach((s) => {
      if (dailyMap[s.date]) {
        dailyMap[s.date].revenue += s.totalRevenue;
        dailyMap[s.date].profit += s.totalRevenue - s.quantity * s.costPrice;
      }
    });

    return Object.values(dailyMap);
  }, [filteredSales, dateFilter]);

  // Category breakdown chart data
  const categoryData = useMemo(() => {
    const map: Record<string, number> = {};
    filteredSales.forEach((s) => {
      const p = products.find((prod) => prod.id === s.productId);
      const cat = p ? p.category : 'General';
      map[cat] = (map[cat] || 0) + s.totalRevenue;
    });

    return Object.entries(map).map(([name, value]) => ({
      name,
      value: Math.round(value),
    }));
  }, [filteredSales, products]);

  // Channel breakdown chart data
  const channelData = useMemo(() => {
    const map: Record<string, number> = {};
    filteredSales.forEach((s) => {
      map[s.channel] = (map[s.channel] || 0) + s.totalRevenue;
    });

    return Object.entries(map).map(([name, value]) => ({
      name,
      value: Math.round(value),
    }));
  }, [filteredSales]);

  // Ranked Products by Revenue
  const rankedProducts = useMemo(() => {
    const map: Record<string, { id: string; name: string; sku: string; units: number; revenue: number; profit: number }> = {};

    filteredSales.forEach((s) => {
      if (!map[s.productId]) {
        map[s.productId] = {
          id: s.productId,
          name: s.productName,
          sku: s.sku,
          units: 0,
          revenue: 0,
          profit: 0,
        };
      }
      map[s.productId].units += s.quantity;
      map[s.productId].revenue += s.totalRevenue;
      map[s.productId].profit += s.totalRevenue - s.quantity * s.costPrice;
    });

    return Object.values(map).sort((a, b) => b.revenue - a.revenue);
  }, [filteredSales]);

  const COLORS = ['#10b981', '#3b82f6', '#f59e0b', '#8b5cf6', '#ec4899', '#06b6d4'];

  return (
    <div className="p-4 sm:p-6 lg:p-8 space-y-6 max-w-7xl mx-auto">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <span className="text-xs font-semibold px-2.5 py-0.5 rounded-full bg-blue-50 text-blue-700 border border-blue-200">
              Commercial Intelligence
            </span>
            <span className="text-xs text-slate-400">Revenue, Margins & Velocity</span>
          </div>
          <h1 className="text-2xl font-extrabold text-slate-900 tracking-tight mt-1">Sales Analytics</h1>
          <p className="text-xs sm:text-sm text-slate-500 mt-0.5">
            Monitor product velocity, analyze profit margins, and identify sales trends.
          </p>
        </div>

        <div className="flex items-center gap-3">
          {/* Timeframe Filter */}
          <div className="flex items-center gap-1.5 p-1 bg-slate-100 rounded-xl border border-slate-200">
            {(['7', '30', '90', 'all'] as const).map((period) => (
              <button
                key={period}
                onClick={() => setDateFilter(period)}
                className={`px-3 py-1.5 text-xs font-bold rounded-lg transition-all ${
                  dateFilter === period
                    ? 'bg-white text-emerald-700 shadow-sm'
                    : 'text-slate-600 hover:text-slate-900'
                }`}
              >
                {period === 'all' ? 'All' : `${period}D`}
              </button>
            ))}
          </div>

          <button
            onClick={onOpenRecordSale}
            className="flex items-center gap-1.5 px-4 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white font-bold text-xs shadow-sm transition-all"
          >
            <Plus className="w-4 h-4 stroke-[2.5]" />
            <span>Record Sale</span>
          </button>
        </div>
      </div>

      {/* 4 Financial KPI Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {/* Total Gross Revenue */}
        <div className="bg-white p-5 rounded-2xl border border-slate-200/90 shadow-sm">
          <span className="text-xs font-semibold text-slate-500">Gross Sales Revenue</span>
          <div className="flex items-baseline justify-between mt-2">
            <p className="text-2xl font-extrabold text-slate-900">
              {businessProfile.currency}{metrics.totalRevenue.toLocaleString()}
            </p>
            <span className="text-[11px] font-bold text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded-md flex items-center gap-0.5">
              <ArrowUpRight className="w-3 h-3" />
              {metrics.totalUnits} Units
            </span>
          </div>
          <p className="text-[11px] text-slate-400 mt-1">
            ~{businessProfile.currency}{metrics.avgDailyRevenue.toLocaleString()}/day avg
          </p>
        </div>

        {/* Cost of Goods Sold */}
        <div className="bg-white p-5 rounded-2xl border border-slate-200/90 shadow-sm">
          <span className="text-xs font-semibold text-slate-500">Cost of Goods Sold (COGS)</span>
          <div className="flex items-baseline justify-between mt-2">
            <p className="text-2xl font-extrabold text-slate-700">
              {businessProfile.currency}{metrics.totalCogs.toLocaleString()}
            </p>
          </div>
          <p className="text-[11px] text-slate-400 mt-1">Direct supplier cost of sold goods</p>
        </div>

        {/* Gross Profit */}
        <div className="bg-white p-5 rounded-2xl border border-slate-200/90 shadow-sm">
          <span className="text-xs font-semibold text-slate-500">Gross Profit</span>
          <div className="flex items-baseline justify-between mt-2">
            <p className="text-2xl font-extrabold text-emerald-600">
              {businessProfile.currency}{metrics.grossProfit.toLocaleString()}
            </p>
          </div>
          <p className="text-[11px] text-emerald-600 font-medium mt-1">Revenue minus wholesale cost</p>
        </div>

        {/* Gross Profit Margin % */}
        <div className="bg-white p-5 rounded-2xl border border-slate-200/90 shadow-sm">
          <span className="text-xs font-semibold text-slate-500">Gross Margin %</span>
          <div className="flex items-baseline justify-between mt-2">
            <p className="text-2xl font-extrabold text-blue-600">{metrics.grossMarginPercent}%</p>
            <span className="text-[11px] font-bold text-blue-700 bg-blue-50 px-2 py-0.5 rounded-md">
              Target: &gt;20%
            </span>
          </div>
          <p className="text-[11px] text-slate-400 mt-1">Retail markup performance</p>
        </div>
      </div>

      {/* Revenue & Gross Profit Velocity Chart */}
      <div className="bg-white p-5 rounded-2xl border border-slate-200/90 shadow-sm">
        <div className="flex items-center justify-between mb-4">
          <div>
            <h3 className="text-sm font-bold text-slate-900">Revenue & Gross Profit Velocity</h3>
            <p className="text-xs text-slate-500">Daily gross revenue compared with net gross profit</p>
          </div>

          <div className="flex items-center gap-4 text-xs font-semibold">
            <span className="flex items-center gap-1.5">
              <span className="w-3 h-3 rounded-full bg-emerald-500" />
              Revenue
            </span>
            <span className="flex items-center gap-1.5">
              <span className="w-3 h-3 rounded-full bg-blue-500" />
              Gross Profit
            </span>
          </div>
        </div>

        <div className="h-72 w-full">
          <ResponsiveContainer width="100%" height="100%">
            <AreaChart data={trendData} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
              <defs>
                <linearGradient id="salesRev" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="#10b981" stopOpacity={0.3} />
                  <stop offset="95%" stopColor="#10b981" stopOpacity={0.0} />
                </linearGradient>
                <linearGradient id="salesProfit" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="#3b82f6" stopOpacity={0.3} />
                  <stop offset="95%" stopColor="#3b82f6" stopOpacity={0.0} />
                </linearGradient>
              </defs>
              <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" />
              <XAxis dataKey="displayDate" tick={{ fontSize: 10, fill: '#64748b' }} axisLine={false} tickLine={false} />
              <YAxis tick={{ fontSize: 10, fill: '#64748b' }} axisLine={false} tickLine={false} />
              <Tooltip
                formatter={(val: any, name: any) => [
                  `${businessProfile.currency}${Number(val).toLocaleString()}`,
                  name === 'revenue' ? 'Revenue' : 'Gross Profit',
                ]}
                contentStyle={{ backgroundColor: '#0f172a', borderRadius: '12px', color: '#fff', fontSize: '12px' }}
              />
              <Area type="monotone" dataKey="revenue" stroke="#10b981" strokeWidth={2} fill="url(#salesRev)" />
              <Area type="monotone" dataKey="profit" stroke="#3b82f6" strokeWidth={2} fill="url(#salesProfit)" />
            </AreaChart>
          </ResponsiveContainer>
        </div>
      </div>

      {/* Category Breakdown & Channel Breakdown */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Category Contribution */}
        <div className="bg-white p-5 rounded-2xl border border-slate-200/90 shadow-sm flex flex-col justify-between">
          <h3 className="text-sm font-bold text-slate-900 mb-1">Sales by Category</h3>
          <p className="text-xs text-slate-500 mb-4">Volume generated across product classifications</p>

          <div className="h-60 w-full flex items-center justify-center">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie data={categoryData} dataKey="value" nameKey="name" cx="50%" cy="50%" outerRadius={80} label>
                  {categoryData.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                  ))}
                </Pie>
                <Tooltip
                  formatter={(val: any) => [`${businessProfile.currency}${Number(val).toLocaleString()}`, 'Revenue']}
                  contentStyle={{ backgroundColor: '#0f172a', borderRadius: '12px', color: '#fff', fontSize: '12px' }}
                />
              </PieChart>
            </ResponsiveContainer>
          </div>

          <div className="flex flex-wrap items-center justify-center gap-x-4 gap-y-1 mt-2 text-xs">
            {categoryData.map((cat, i) => (
              <span key={cat.name} className="flex items-center gap-1.5">
                <span className="w-2.5 h-2.5 rounded-full" style={{ backgroundColor: COLORS[i % COLORS.length] }} />
                <span className="text-slate-600">{cat.name}</span>
              </span>
            ))}
          </div>
        </div>

        {/* Sales Channel Mix */}
        <div className="bg-white p-5 rounded-2xl border border-slate-200/90 shadow-sm flex flex-col justify-between">
          <h3 className="text-sm font-bold text-slate-900 mb-1">Channel Contribution</h3>
          <p className="text-xs text-slate-500 mb-4">Revenue split between In-Store, Online & Wholesale</p>

          <div className="h-60 w-full">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={channelData} margin={{ top: 10, right: 10, left: 0, bottom: 0 }}>
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" />
                <XAxis dataKey="name" tick={{ fontSize: 11, fill: '#64748b' }} axisLine={false} tickLine={false} />
                <YAxis tick={{ fontSize: 11, fill: '#64748b' }} axisLine={false} tickLine={false} />
                <Tooltip
                  formatter={(val: any) => [`${businessProfile.currency}${Number(val).toLocaleString()}`, 'Revenue']}
                  contentStyle={{ backgroundColor: '#0f172a', borderRadius: '12px', color: '#fff', fontSize: '12px' }}
                />
                <Bar dataKey="value" fill="#10b981" radius={[8, 8, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>

          <div className="p-3 rounded-xl bg-slate-50 text-xs text-slate-500 text-center">
            In-Store footfall accounts for the largest proportion of daily FMCG velocity.
          </div>
        </div>
      </div>

      {/* Top 10 Revenue Generating Products Table */}
      <div className="bg-white rounded-2xl border border-slate-200/90 shadow-sm overflow-hidden">
        <div className="p-4 border-b border-slate-100 flex items-center justify-between bg-slate-50/50">
          <div>
            <h3 className="text-sm font-bold text-slate-900">Ranked Product Performance</h3>
            <p className="text-xs text-slate-500">Sorted by revenue contribution for selected period</p>
          </div>
          <span className="text-xs font-semibold text-slate-600 bg-slate-200/70 px-2.5 py-1 rounded-lg">
            {rankedProducts.length} Products Sold
          </span>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className="bg-slate-50 text-slate-600 uppercase font-bold text-[10px] border-b border-slate-200">
              <tr>
                <th className="py-3 px-4">Rank</th>
                <th className="py-3 px-4">Product Details</th>
                <th className="py-3 px-3 text-center">Units Sold</th>
                <th className="py-3 px-3 text-right">Total Revenue</th>
                <th className="py-3 px-3 text-right">Gross Profit</th>
                <th className="py-3 px-4 text-right">Margin %</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {rankedProducts.slice(0, 10).map((p, idx) => {
                const margin = p.revenue > 0 ? Math.round((p.profit / p.revenue) * 100) : 0;
                return (
                  <tr key={p.id} className="hover:bg-slate-50 transition-colors">
                    <td className="py-3 px-4 font-bold text-slate-400">#{idx + 1}</td>
                    <td className="py-3 px-4">
                      <p className="font-bold text-slate-900">{p.name}</p>
                      <span className="font-mono text-[10px] text-slate-400">{p.sku}</span>
                    </td>
                    <td className="py-3 px-3 text-center font-bold text-slate-800">{p.units} units</td>
                    <td className="py-3 px-3 text-right font-bold text-slate-900">
                      {businessProfile.currency}{p.revenue.toLocaleString()}
                    </td>
                    <td className="py-3 px-3 text-right font-bold text-emerald-600">
                      {businessProfile.currency}{p.profit.toLocaleString()}
                    </td>
                    <td className="py-3 px-4 text-right">
                      <span className="font-bold text-blue-700 bg-blue-50 px-2 py-0.5 rounded">
                        {margin}%
                      </span>
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
