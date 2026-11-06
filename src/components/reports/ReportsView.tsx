import React, { useState } from 'react';
import {
  FileText,
  Download,
  Printer,
  Calendar,
  Layers,
  CheckCircle2,
  AlertTriangle,
  IndianRupee,
  Share2,
} from 'lucide-react';
import { useStore } from '../../context/StoreContext';
import { getStockStatus, generateDemandForecast, calculateReorderRecommendation } from '../../utils/forecasting';

type ReportType =
  | 'valuation'
  | 'low_stock'
  | 'forecast_30'
  | 'purchase_plan'
  | 'sales_margins'
  | 'overstock'
  | 'supplier_performance';

export const ReportsView: React.FC = () => {
  const { products, sales, suppliers, purchaseOrders, businessProfile, kpis } = useStore();
  const [activeReport, setActiveReport] = useState<ReportType>('valuation');

  const reportList: Array<{ id: ReportType; title: string; desc: string }> = [
    { id: 'valuation', title: 'Inventory Valuation Report', desc: 'Detailed cost and retail value breakdown by product' },
    { id: 'low_stock', title: 'Low-Stock & Stockout Risk Report', desc: 'Critical and low threshold inventory needing immediate action' },
    { id: 'forecast_30', title: '30-Day Demand Forecast Report', desc: 'Projected sales velocity and estimated stock depletion dates' },
    { id: 'purchase_plan', title: 'Purchase Planning & Reorder Report', desc: 'Suggested replenishment quantities and supplier cost estimate' },
    { id: 'sales_margins', title: 'Sales Performance & Margins Report', desc: 'Revenue, COGS, gross profits, and retail margin percentages' },
    { id: 'overstock', title: 'Overstock & Capital Lock Report', desc: 'Products with >60 days supply tying up business cash flow' },
    { id: 'supplier_performance', title: 'Supplier Lead Time & Performance', desc: 'Distributor delivery windows, active orders, and ratings' },
  ];

  // Export current report as CSV
  const handleExportCsv = () => {
    let headers: string[] = [];
    let rows: any[][] = [];

    if (activeReport === 'valuation') {
      headers = ['SKU', 'Product Name', 'Category', 'Current Stock', 'Unit Cost', 'Unit Price', 'Total Cost Value', 'Total Retail Value'];
      rows = products.map((p) => [
        `"${p.sku}"`,
        `"${p.name}"`,
        `"${p.category}"`,
        p.currentStock,
        p.purchaseCost,
        p.sellingPrice,
        p.currentStock * p.purchaseCost,
        p.currentStock * p.sellingPrice,
      ]);
    } else if (activeReport === 'low_stock') {
      headers = ['SKU', 'Product Name', 'Current Stock', 'Min Stock Level', 'Avg Daily Sales', 'Days Left', 'Supplier', 'Status'];
      rows = products
        .filter((p) => getStockStatus(p) === 'low' || getStockStatus(p) === 'critical' || getStockStatus(p) === 'out_of_stock')
        .map((p) => {
          const daysLeft = p.avgDailySales > 0 ? (p.currentStock / p.avgDailySales).toFixed(1) : '0';
          return [
            `"${p.sku}"`,
            `"${p.name}"`,
            p.currentStock,
            p.minStock,
            p.avgDailySales,
            daysLeft,
            `"${p.supplierName}"`,
            `"${getStockStatus(p)}"`,
          ];
        });
    } else if (activeReport === 'forecast_30') {
      headers = ['SKU', 'Product Name', 'Current Stock', 'Burn Rate/Day', '30D Predicted Sales', 'Days Left', 'Stockout Date', 'Suggested Reorder Qty'];
      rows = products.map((p) => {
        const f = generateDemandForecast(p, sales, 30);
        return [
          `"${p.sku}"`,
          `"${p.name}"`,
          p.currentStock,
          f.dailyDepletionRate,
          f.predictedSales,
          f.daysLeft,
          `"${f.stockoutDate || 'None'}"`,
          f.suggestedOrderQty,
        ];
      });
    } else if (activeReport === 'purchase_plan') {
      headers = ['Priority', 'SKU', 'Product Name', 'Current Stock', 'Reorder Point', 'Recommended Order', 'Unit Cost', 'Est Order Cost', 'Supplier'];
      rows = products.map((p) => {
        const r = calculateReorderRecommendation(p, sales);
        return [
          `"${r.priority}"`,
          `"${p.sku}"`,
          `"${p.name}"`,
          r.currentStock,
          r.reorderPoint,
          r.recommendedOrderQty,
          p.purchaseCost,
          r.estimatedCost,
          `"${p.supplierName}"`,
        ];
      });
    } else if (activeReport === 'overstock') {
      headers = ['SKU', 'Product Name', 'Current Stock', 'Max Target', 'Daily Sales', 'Days of Supply', 'Capital Locked'];
      rows = products
        .filter((p) => getStockStatus(p) === 'overstocked')
        .map((p) => {
          const daysSupply = p.avgDailySales > 0 ? (p.currentStock / p.avgDailySales).toFixed(0) : '99';
          return [
            `"${p.sku}"`,
            `"${p.name}"`,
            p.currentStock,
            p.maxStock,
            p.avgDailySales,
            daysSupply,
            p.currentStock * p.purchaseCost,
          ];
        });
    } else {
      headers = ['Supplier Name', 'Contact', 'Phone', 'Email', 'Lead Time Days', 'Rating'];
      rows = suppliers.map((s) => [
        `"${s.name}"`,
        `"${s.contactPerson}"`,
        `"${s.phone}"`,
        `"${s.email}"`,
        s.leadTimeDays,
        s.rating,
      ]);
    }

    const csvContent = 'data:text/csv;charset=utf-8,' + [headers.join(','), ...rows.map((e) => e.join(','))].join('\n');
    const encodedUri = encodeURI(csvContent);
    const link = document.createElement('a');
    link.setAttribute('href', encodedUri);
    link.setAttribute('download', `StockSense_${activeReport}_Report_${new Date().toISOString().split('T')[0]}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  // Trigger print / PDF export
  const handlePrint = () => {
    window.print();
  };

  return (
    <div className="p-4 sm:p-6 lg:p-8 space-y-6 max-w-7xl mx-auto">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-extrabold text-slate-900 tracking-tight">Executive Reports & Exports</h1>
          <p className="text-xs sm:text-sm text-slate-500 mt-0.5">
            Download audit-ready CSV datasets or export print-formatted PDF summaries for accounting and suppliers.
          </p>
        </div>

        <div className="flex items-center gap-2.5">
          <button
            onClick={handlePrint}
            className="flex items-center gap-1.5 px-3.5 py-2 rounded-xl bg-white hover:bg-slate-50 border border-slate-200 text-xs font-semibold text-slate-700 shadow-sm transition-colors"
          >
            <Printer className="w-4 h-4 text-slate-500" />
            <span>Print / Save as PDF</span>
          </button>

          <button
            onClick={handleExportCsv}
            className="flex items-center gap-1.5 px-4 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white font-bold text-xs shadow-sm transition-all"
          >
            <Download className="w-4 h-4 stroke-[2.5]" />
            <span>Export CSV</span>
          </button>
        </div>
      </div>

      {/* Report Selector Pills */}
      <div className="flex items-center gap-2 overflow-x-auto pb-1 scrollbar-none">
        {reportList.map((r) => (
          <button
            key={r.id}
            onClick={() => setActiveReport(r.id)}
            className={`px-3.5 py-2 text-xs font-semibold rounded-xl whitespace-nowrap transition-all border ${
              activeReport === r.id
                ? 'bg-slate-900 text-white border-slate-900 shadow-sm'
                : 'bg-white text-slate-600 border-slate-200 hover:bg-slate-50'
            }`}
          >
            {r.title}
          </button>
        ))}
      </div>

      {/* Printable Report Sheet */}
      <div className="bg-white rounded-2xl border border-slate-200/90 shadow-sm overflow-hidden p-6 sm:p-8 space-y-6">
        {/* Report Document Header */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-6 border-b border-slate-200">
          <div>
            <div className="flex items-center gap-2">
              <span className="w-2.5 h-2.5 rounded-full bg-emerald-500" />
              <span className="text-xs font-mono uppercase tracking-widest text-slate-400">StockSense Report</span>
            </div>
            <h2 className="text-xl font-bold text-slate-900 mt-1">
              {reportList.find((r) => r.id === activeReport)?.title}
            </h2>
            <p className="text-xs text-slate-500 mt-0.5">
              {reportList.find((r) => r.id === activeReport)?.desc}
            </p>
          </div>

          <div className="text-right text-xs text-slate-500 space-y-0.5">
            <p><strong className="text-slate-800">{businessProfile.businessName}</strong></p>
            <p>{businessProfile.location}</p>
            <p>Generated: {new Date().toLocaleDateString('en-IN', { day: 'numeric', month: 'long', year: 'numeric' })}</p>
          </div>
        </div>

        {/* Dynamic Report Content Tables */}
        {activeReport === 'valuation' && (
          <div className="overflow-x-auto">
            <div className="mb-4 grid grid-cols-2 sm:grid-cols-4 gap-3 p-4 bg-slate-50 rounded-xl border border-slate-200 text-xs">
              <div>
                <span className="text-slate-400 font-semibold block">Total Active SKUs</span>
                <strong className="text-base font-bold text-slate-900">{products.length}</strong>
              </div>
              <div>
                <span className="text-slate-400 font-semibold block">Inventory Cost Value</span>
                <strong className="text-base font-bold text-emerald-700">
                  {businessProfile.currency}{kpis.totalInventoryValue.toLocaleString()}
                </strong>
              </div>
              <div>
                <span className="text-slate-400 font-semibold block">Estimated Retail Value</span>
                <strong className="text-base font-bold text-blue-700">
                  {businessProfile.currency}{kpis.totalRetailValue.toLocaleString()}
                </strong>
              </div>
              <div>
                <span className="text-slate-400 font-semibold block">Potential Gross Markup</span>
                <strong className="text-base font-bold text-slate-900">
                  {businessProfile.currency}{(kpis.totalRetailValue - kpis.totalInventoryValue).toLocaleString()}
                </strong>
              </div>
            </div>

            <table className="w-full text-left text-xs">
              <thead className="bg-slate-50 text-slate-600 font-bold border-b border-slate-200 text-[11px]">
                <tr>
                  <th className="py-2.5 px-3">SKU</th>
                  <th className="py-2.5 px-3">Product Name</th>
                  <th className="py-2.5 px-3">Category</th>
                  <th className="py-2.5 px-3 text-center">Stock</th>
                  <th className="py-2.5 px-3 text-right">Cost Price</th>
                  <th className="py-2.5 px-3 text-right">Selling Price</th>
                  <th className="py-2.5 px-3 text-right">Cost Value</th>
                  <th className="py-2.5 px-3 text-right">Retail Value</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {products.map((p) => (
                  <tr key={p.id} className="hover:bg-slate-50">
                    <td className="py-2 px-3 font-mono text-slate-400">{p.sku}</td>
                    <td className="py-2 px-3 font-semibold text-slate-800">{p.name}</td>
                    <td className="py-2 px-3 text-slate-500">{p.category}</td>
                    <td className="py-2 px-3 text-center font-bold text-slate-900">{p.currentStock}</td>
                    <td className="py-2 px-3 text-right text-slate-600">{businessProfile.currency}{p.purchaseCost}</td>
                    <td className="py-2 px-3 text-right text-slate-600">{businessProfile.currency}{p.sellingPrice}</td>
                    <td className="py-2 px-3 text-right font-bold text-emerald-700">
                      {businessProfile.currency}{(p.currentStock * p.purchaseCost).toLocaleString()}
                    </td>
                    <td className="py-2 px-3 text-right font-bold text-slate-900">
                      {businessProfile.currency}{(p.currentStock * p.sellingPrice).toLocaleString()}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}

        {activeReport === 'low_stock' && (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead className="bg-slate-50 text-slate-600 font-bold border-b border-slate-200 text-[11px]">
                <tr>
                  <th className="py-2.5 px-3">Status</th>
                  <th className="py-2.5 px-3">SKU</th>
                  <th className="py-2.5 px-3">Product Name</th>
                  <th className="py-2.5 px-3 text-center">Stock</th>
                  <th className="py-2.5 px-3 text-center">Min Level</th>
                  <th className="py-2.5 px-3 text-center">Daily Sales</th>
                  <th className="py-2.5 px-3 text-center">Days Left</th>
                  <th className="py-2.5 px-3">Supplier (Lead Time)</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {products
                  .filter((p) => ['out_of_stock', 'critical', 'low'].includes(getStockStatus(p)))
                  .map((p) => {
                    const status = getStockStatus(p);
                    const daysLeft = p.avgDailySales > 0 ? (p.currentStock / p.avgDailySales).toFixed(1) : '0';
                    return (
                      <tr key={p.id} className="hover:bg-slate-50">
                        <td className="py-2 px-3">
                          <span
                            className={`px-2 py-0.5 rounded text-[10px] font-bold uppercase ${
                              status === 'out_of_stock'
                                ? 'bg-red-100 text-red-700'
                                : status === 'critical'
                                ? 'bg-orange-100 text-orange-800'
                                : 'bg-amber-100 text-amber-800'
                            }`}
                          >
                            {status.replace(/_/g, ' ')}
                          </span>
                        </td>
                        <td className="py-2 px-3 font-mono text-slate-400">{p.sku}</td>
                        <td className="py-2 px-3 font-semibold text-slate-800">{p.name}</td>
                        <td className="py-2 px-3 text-center font-bold text-red-600">{p.currentStock}</td>
                        <td className="py-2 px-3 text-center text-slate-500">{p.minStock}</td>
                        <td className="py-2 px-3 text-center">{p.avgDailySales}/day</td>
                        <td className="py-2 px-3 text-center font-bold">{daysLeft} days</td>
                        <td className="py-2 px-3 text-slate-700">
                          {p.supplierName} ({p.leadTimeDays}d)
                        </td>
                      </tr>
                    );
                  })}
              </tbody>
            </table>
          </div>
        )}

        {activeReport === 'forecast_30' && (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead className="bg-slate-50 text-slate-600 font-bold border-b border-slate-200 text-[11px]">
                <tr>
                  <th className="py-2.5 px-3">Product</th>
                  <th className="py-2.5 px-3 text-center">Stock</th>
                  <th className="py-2.5 px-3 text-center">Burn Rate</th>
                  <th className="py-2.5 px-3 text-center">30D Forecast Sales</th>
                  <th className="py-2.5 px-3 text-center">Days Left</th>
                  <th className="py-2.5 px-3">Predicted Stockout</th>
                  <th className="py-2.5 px-3">Suggested Order</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {products.map((p) => {
                  const f = generateDemandForecast(p, sales, 30);
                  return (
                    <tr key={p.id} className="hover:bg-slate-50">
                      <td className="py-2 px-3 font-semibold text-slate-800">{p.name}</td>
                      <td className="py-2 px-3 text-center font-bold">{p.currentStock}</td>
                      <td className="py-2 px-3 text-center text-slate-600">{f.dailyDepletionRate}/day</td>
                      <td className="py-2 px-3 text-center font-bold text-slate-900">{f.predictedSales} units</td>
                      <td className="py-2 px-3 text-center font-bold">{f.daysLeft}d</td>
                      <td className="py-2 px-3 text-red-600 font-semibold">{f.stockoutDate || 'Beyond 30D'}</td>
                      <td className="py-2 px-3 font-bold text-emerald-700">{f.suggestedOrderQty} units</td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}

        {activeReport === 'purchase_plan' && (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead className="bg-slate-50 text-slate-600 font-bold border-b border-slate-200 text-[11px]">
                <tr>
                  <th className="py-2.5 px-3">Priority</th>
                  <th className="py-2.5 px-3">Product Name</th>
                  <th className="py-2.5 px-3 text-center">Stock</th>
                  <th className="py-2.5 px-3 text-center">Reorder Point</th>
                  <th className="py-2.5 px-3">Recommended Order</th>
                  <th className="py-2.5 px-3 text-right">Est. Cost</th>
                  <th className="py-2.5 px-3">Supplier</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {products.map((p) => {
                  const r = calculateReorderRecommendation(p, sales);
                  return (
                    <tr key={p.id} className="hover:bg-slate-50">
                      <td className="py-2 px-3 font-bold uppercase text-[10px]">{r.priority}</td>
                      <td className="py-2 px-3 font-semibold text-slate-800">{p.name}</td>
                      <td className="py-2 px-3 text-center">{r.currentStock}</td>
                      <td className="py-2 px-3 text-center">{r.reorderPoint}</td>
                      <td className="py-2 px-3 font-bold text-emerald-700">{r.recommendedOrderQty} units</td>
                      <td className="py-2 px-3 text-right font-bold text-slate-900">
                        {businessProfile.currency}{r.estimatedCost.toLocaleString()}
                      </td>
                      <td className="py-2 px-3 text-slate-600">{p.supplierName}</td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}

        {/* Disclaimer / Footer */}
        <div className="pt-6 border-t border-slate-200 text-[11px] text-slate-400 flex flex-col sm:flex-row items-center justify-between gap-2">
          <span>Report compiled via StockSense Smart Inventory Predictor. All rights reserved.</span>
          <span>Confidential Internal Business Document</span>
        </div>
      </div>
    </div>
  );
};
