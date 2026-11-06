import React, { useState, useMemo } from 'react';
import {
  ShoppingBag,
  AlertTriangle,
  Clock,
  IndianRupee,
  Truck,
  CheckCircle2,
  Layers,
  ArrowRight,
  Filter,
  Plus,
} from 'lucide-react';
import { useStore } from '../../context/StoreContext';
import { PriorityLevel } from '../../types';
import { calculateReorderRecommendation } from '../../utils/forecasting';
import { PurchaseOrderView } from '../purchase/PurchaseOrderView';

interface PurchasePlanningViewProps {
  onOpenCreatePO: (supplierId?: string, productId?: string, prefillQuantity?: number) => void;
}

export const PurchasePlanningView: React.FC<PurchasePlanningViewProps> = ({ onOpenCreatePO }) => {
  const { products, sales, suppliers, purchaseOrders, businessProfile, receivePurchaseOrder, cancelPurchaseOrder } = useStore();

  const [subTab, setSubTab] = useState<'reorders' | 'orders'>('reorders');
  const [selectedPriority, setSelectedPriority] = useState<string>('all');
  const [selectedSupplier, setSelectedSupplier] = useState<string>('all');

  // Compute pending incoming PO quantities per product
  const incomingPOQuantities = useMemo(() => {
    const map: Record<string, number> = {};
    purchaseOrders
      .filter((po) => po.status === 'Ordered' || po.status === 'Pending')
      .forEach((po) => {
        po.items.forEach((item) => {
          map[item.productId] = (map[item.productId] || 0) + item.quantity;
        });
      });
    return map;
  }, [purchaseOrders]);

  // Compute reorder recommendations for all products
  const recommendations = useMemo(() => {
    return products
      .map((p) => {
        const incoming = incomingPOQuantities[p.id] || 0;
        return calculateReorderRecommendation(p, sales, incoming);
      })
      .sort((a, b) => {
        const order = { critical: 0, high: 1, medium: 2, low: 3 };
        return order[a.priority] - order[b.priority];
      });
  }, [products, sales, incomingPOQuantities]);

  // Filter recommendations
  const filteredRecs = useMemo(() => {
    return recommendations.filter((r) => {
      const matchesPriority = selectedPriority === 'all' || r.priority === selectedPriority;
      const matchesSupplier = selectedSupplier === 'all' || r.product.supplierId === selectedSupplier;
      return matchesPriority && matchesSupplier;
    });
  }, [recommendations, selectedPriority, selectedSupplier]);

  // Group by priority for summary cards
  const criticalCount = recommendations.filter((r) => r.priority === 'critical').length;
  const highCount = recommendations.filter((r) => r.priority === 'high').length;
  const mediumCount = recommendations.filter((r) => r.priority === 'medium').length;

  // Total budget required for critical + high items
  const totalUrgentBudget = recommendations
    .filter((r) => r.priority === 'critical' || r.priority === 'high')
    .reduce((sum, r) => sum + r.estimatedCost, 0);

  // Group items by supplier for bulk PO creation
  const supplierBatches = useMemo(() => {
    const map: Record<string, typeof filteredRecs> = {};
    filteredRecs.forEach((r) => {
      const supId = r.product.supplierId || 'other';
      if (!map[supId]) map[supId] = [];
      map[supId].push(r);
    });
    return map;
  }, [filteredRecs]);

  return (
    <div className="p-4 sm:p-6 lg:p-8 space-y-6 max-w-7xl mx-auto">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <span className="text-xs font-semibold px-2.5 py-0.5 rounded-full bg-emerald-50 text-emerald-800 border border-emerald-200">
              Smart Replenishment Planner
            </span>
            <span className="text-xs text-slate-400">ROP = Lead Time Demand + Safety Stock</span>
          </div>
          <h1 className="text-2xl font-extrabold text-slate-900 tracking-tight mt-1">
            Purchase Planning & Reorder Hub
          </h1>
          <p className="text-xs sm:text-sm text-slate-500 mt-0.5">
            Automate purchasing schedules, batch items by vendor, and ensure zero stockouts without over-purchasing.
          </p>
        </div>

        <button
          onClick={() => onOpenCreatePO()}
          className="flex items-center gap-1.5 px-4 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white font-bold text-xs shadow-sm transition-all"
        >
          <Plus className="w-4 h-4 stroke-[2.5]" />
          <span>Create Blank Purchase Order</span>
        </button>
      </div>

      {/* Sub-tab Selector */}
      <div className="flex items-center gap-2 border-b border-slate-200 pb-1">
        <button
          onClick={() => setSubTab('reorders')}
          className={`px-4 py-2 text-xs font-bold rounded-xl transition-all ${
            subTab === 'reorders'
              ? 'bg-slate-900 text-white shadow-sm'
              : 'bg-white text-slate-600 hover:bg-slate-100 border border-slate-200'
          }`}
        >
          Replenishment Planning ({recommendations.filter((r) => r.priority !== 'low').length} Needed)
        </button>
        <button
          onClick={() => setSubTab('orders')}
          className={`px-4 py-2 text-xs font-bold rounded-xl transition-all ${
            subTab === 'orders'
              ? 'bg-slate-900 text-white shadow-sm'
              : 'bg-white text-slate-600 hover:bg-slate-100 border border-slate-200'
          }`}
        >
          Purchase Orders &amp; Receipts ({purchaseOrders.length})
        </button>
      </div>

      {subTab === 'orders' ? (
        <PurchaseOrderView onOpenCreatePO={() => onOpenCreatePO()} />
      ) : (
        <>
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="bg-white p-4 rounded-2xl border border-slate-200/90 shadow-sm">
          <span className="text-xs font-semibold text-slate-500">Critical Priority</span>
          <div className="flex items-baseline justify-between mt-2">
            <p className="text-2xl font-bold text-red-600">{criticalCount}</p>
            <span className="text-[11px] font-bold text-red-700 bg-red-50 px-2 py-0.5 rounded-md">
              Order Today
            </span>
          </div>
          <p className="text-[11px] text-slate-400 mt-1">Stockout within lead time</p>
        </div>

        <div className="bg-white p-4 rounded-2xl border border-slate-200/90 shadow-sm">
          <span className="text-xs font-semibold text-slate-500">High Priority</span>
          <div className="flex items-baseline justify-between mt-2">
            <p className="text-2xl font-bold text-amber-600">{highCount}</p>
            <span className="text-[11px] font-bold text-amber-700 bg-amber-50 px-2 py-0.5 rounded-md">
              Order in 1-3 Days
            </span>
          </div>
          <p className="text-[11px] text-slate-400 mt-1">Breached reorder point</p>
        </div>

        <div className="bg-white p-4 rounded-2xl border border-slate-200/90 shadow-sm">
          <span className="text-xs font-semibold text-slate-500">Medium Priority</span>
          <div className="flex items-baseline justify-between mt-2">
            <p className="text-2xl font-bold text-blue-600">{mediumCount}</p>
            <span className="text-[11px] font-bold text-blue-700 bg-blue-50 px-2 py-0.5 rounded-md">
              Upcoming (~2 Weeks)
            </span>
          </div>
          <p className="text-[11px] text-slate-400 mt-1">Plan vendor consolidation</p>
        </div>

        <div className="bg-white p-4 rounded-2xl border border-slate-200/90 shadow-sm">
          <span className="text-xs font-semibold text-slate-500">Urgent Replenishment Budget</span>
          <div className="flex items-baseline justify-between mt-2">
            <p className="text-2xl font-bold text-slate-900">
              {businessProfile.currency}{totalUrgentBudget.toLocaleString()}
            </p>
          </div>
          <p className="text-[11px] text-emerald-600 font-medium mt-1">To cover Critical & High needs</p>
        </div>
      </div>

      {/* Filters */}
      <div className="bg-white p-4 rounded-2xl border border-slate-200/90 shadow-sm flex flex-wrap items-center justify-between gap-3 text-xs">
        <div className="flex flex-wrap items-center gap-3">
          <div className="flex items-center gap-2">
            <span className="font-semibold text-slate-600">Filter Priority:</span>
            <select
              value={selectedPriority}
              onChange={(e) => setSelectedPriority(e.target.value)}
              className="px-3 py-1.5 bg-slate-50 border border-slate-200 rounded-xl focus:ring-2 focus:ring-emerald-500/20 text-slate-800"
            >
              <option value="all">All Priorities ({recommendations.length})</option>
              <option value="critical">Critical Only ({criticalCount})</option>
              <option value="high">High Only ({highCount})</option>
              <option value="medium">Medium Only ({mediumCount})</option>
              <option value="low">Low (Healthy)</option>
            </select>
          </div>

          <div className="flex items-center gap-2">
            <span className="font-semibold text-slate-600">Supplier:</span>
            <select
              value={selectedSupplier}
              onChange={(e) => setSelectedSupplier(e.target.value)}
              className="px-3 py-1.5 bg-slate-50 border border-slate-200 rounded-xl focus:ring-2 focus:ring-emerald-500/20 text-slate-800"
            >
              <option value="all">All Suppliers</option>
              {suppliers.map((s) => (
                <option key={s.id} value={s.id}>
                  {s.name}
                </option>
              ))}
            </select>
          </div>
        </div>

        <span className="text-slate-400">
          Showing <strong>{filteredRecs.length}</strong> calculated recommendations
        </span>
      </div>

      {/* Recommendations Table */}
      <div className="bg-white rounded-2xl border border-slate-200/90 shadow-sm overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className="bg-slate-50 text-slate-600 uppercase font-bold text-[10px] border-b border-slate-200">
              <tr>
                <th className="py-3 px-4">Priority</th>
                <th className="py-3 px-4">Product Details</th>
                <th className="py-3 px-3 text-center">Stock / ROP</th>
                <th className="py-3 px-3 text-center">Days Left</th>
                <th className="py-3 px-3">Est. Stockout Date</th>
                <th className="py-3 px-3">Recommended Order</th>
                <th className="py-3 px-3 text-right">Est. Cost</th>
                <th className="py-3 px-3">Supplier (Lead Time)</th>
                <th className="py-3 px-4 text-right">Action</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {filteredRecs.map((rec) => {
                const p = rec.product;
                return (
                  <tr key={p.id} className="hover:bg-slate-50/80 transition-colors">
                    {/* Priority */}
                    <td className="py-3 px-4">
                      <span
                        className={`inline-flex px-2 py-0.5 rounded text-[10px] font-bold uppercase tracking-wider ${
                          rec.priority === 'critical'
                            ? 'bg-red-100 text-red-700'
                            : rec.priority === 'high'
                            ? 'bg-amber-100 text-amber-800'
                            : rec.priority === 'medium'
                            ? 'bg-blue-100 text-blue-800'
                            : 'bg-emerald-100 text-emerald-800'
                        }`}
                      >
                        {rec.priority}
                      </span>
                    </td>

                    {/* Product */}
                    <td className="py-3 px-4">
                      <p className="font-bold text-slate-900">{p.name}</p>
                      <span className="font-mono text-[10px] text-slate-400">{p.sku}</span>
                    </td>

                    {/* Stock vs Reorder Point */}
                    <td className="py-3 px-3 text-center">
                      <p className={`font-bold ${rec.currentStock === 0 ? 'text-red-600' : 'text-slate-900'}`}>
                        {rec.currentStock} {p.unit}s
                      </p>
                      <span className="text-[10px] text-slate-400">ROP: {rec.reorderPoint}</span>
                    </td>

                    {/* Days Left */}
                    <td className="py-3 px-3 text-center">
                      <span
                        className={`font-bold ${
                          rec.daysOfStockLeft <= rec.leadTimeDays ? 'text-red-600' : 'text-slate-800'
                        }`}
                      >
                        {rec.daysOfStockLeft}d
                      </span>
                      <span className="text-[10px] text-slate-400 block">{rec.avgDailySales}/day</span>
                    </td>

                    {/* Stockout date */}
                    <td className="py-3 px-3">
                      {rec.predictedStockoutDate ? (
                        <span className="text-red-600 font-semibold">{rec.predictedStockoutDate}</span>
                      ) : (
                        <span className="text-slate-400">Adequate</span>
                      )}
                    </td>

                    {/* Recommended Order */}
                    <td className="py-3 px-3">
                      <p className="font-bold text-emerald-700">
                        {rec.recommendedOrderQty} {p.unit}s
                      </p>
                      <span className="text-[10px] text-slate-400">Order by {rec.suggestedOrderDate}</span>
                    </td>

                    {/* Estimated Cost */}
                    <td className="py-3 px-3 text-right">
                      <p className="font-bold text-slate-900">
                        {businessProfile.currency}{rec.estimatedCost.toLocaleString()}
                      </p>
                      <span className="text-[10px] text-slate-400">
                        @{businessProfile.currency}{p.purchaseCost}/{p.unit}
                      </span>
                    </td>

                    {/* Supplier */}
                    <td className="py-3 px-3 text-slate-700">
                      <p className="font-medium truncate max-w-[150px]">{p.supplierName}</p>
                      <span className="text-[10px] text-slate-400">{rec.leadTimeDays}d lead time</span>
                    </td>

                    {/* Action */}
                    <td className="py-3 px-4 text-right">
                      <button
                        onClick={() => onOpenCreatePO(p.supplierId, p.id, rec.recommendedOrderQty)}
                        className="px-3.5 py-1.5 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white font-semibold text-xs shadow-sm transition-colors whitespace-nowrap"
                      >
                        Create PO
                      </button>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>
        </>
      )}
    </div>
  );
};
