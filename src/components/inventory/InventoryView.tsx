import React, { useState, useMemo } from 'react';
import {
  Package,
  Plus,
  Search,
  Filter,
  Download,
  Upload,
  Edit2,
  Trash2,
  AlertTriangle,
  CheckCircle2,
  XCircle,
  Clock,
  ArrowUpDown,
  MoreVertical,
  RotateCcw,
  FileSpreadsheet,
  IndianRupee,
  Eye,
} from 'lucide-react';
import { useStore } from '../../context/StoreContext';
import { Product, StockStatus } from '../../types';
import { getStockStatus } from '../../utils/forecasting';
import { CsvImportModal } from './CsvImportModal';

interface InventoryViewProps {
  onOpenAddProduct: () => void;
  onOpenEditProduct: (product: Product) => void;
  onOpenAdjustStock: (product?: Product) => void;
  onSelectProductDetails?: (product: Product) => void;
  searchQuery?: string;
  onSearchChange?: (q: string) => void;
  statusFilter?: string;
  onStatusFilterChange?: (status: string) => void;
  categoryFilter?: string;
  onCategoryFilterChange?: (cat: string) => void;
}

export const InventoryView: React.FC<InventoryViewProps> = ({
  onOpenAddProduct,
  onOpenEditProduct,
  onOpenAdjustStock,
  searchQuery: externalSearchQuery,
  onSearchChange: setExternalSearchQuery,
  statusFilter: externalStatusFilter,
  onStatusFilterChange: setExternalStatusFilter,
  categoryFilter: externalCategoryFilter,
  onCategoryFilterChange: setExternalCategoryFilter,
}) => {
  const { products, businessProfile, deleteProduct } = useStore();

  const [localSearch, setLocalSearch] = useState('');
  const [localCategory, setLocalCategory] = useState<string>('all');
  const [localStatus, setLocalStatus] = useState<string>('all');

  const searchQuery = externalSearchQuery !== undefined ? externalSearchQuery : localSearch;
  const setSearchQuery = setExternalSearchQuery || setLocalSearch;

  const selectedCategory = externalCategoryFilter !== undefined ? externalCategoryFilter : localCategory;
  const setSelectedCategory = setExternalCategoryFilter || setLocalCategory;

  const selectedStatus = externalStatusFilter !== undefined ? externalStatusFilter : localStatus;
  const setSelectedStatus = setExternalStatusFilter || setLocalStatus;

  const [sortField, setSortField] = useState<'name' | 'stock' | 'sales' | 'price'>('stock');
  const [sortAsc, setSortAsc] = useState<boolean>(true);
  const [showCsvModal, setShowCsvModal] = useState<boolean>(false);
  const [selectedProduct, setSelectedProduct] = useState<Product | null>(null);

  // Extract unique categories
  const categories = useMemo(() => {
    const set = new Set<string>();
    products.forEach((p) => set.add(p.category));
    return Array.from(set);
  }, [products]);

  // Filter and sort products
  const filteredProducts = useMemo(() => {
    return products
      .filter((p) => {
        const matchesSearch =
          p.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
          p.sku.toLowerCase().includes(searchQuery.toLowerCase()) ||
          p.supplierName.toLowerCase().includes(searchQuery.toLowerCase());

        const matchesCategory = selectedCategory === 'all' || p.category === selectedCategory;

        const status = getStockStatus(p);
        const matchesStatus = selectedStatus === 'all' || status === selectedStatus;

        return matchesSearch && matchesCategory && matchesStatus;
      })
      .sort((a, b) => {
        let diff = 0;
        if (sortField === 'name') diff = a.name.localeCompare(b.name);
        else if (sortField === 'stock') diff = a.currentStock - b.currentStock;
        else if (sortField === 'sales') diff = (a.avgDailySales || 0) - (b.avgDailySales || 0);
        else if (sortField === 'price') diff = a.sellingPrice - b.sellingPrice;
        return sortAsc ? diff : -diff;
      });
  }, [products, searchQuery, selectedCategory, selectedStatus, sortField, sortAsc]);

  // Export inventory to CSV
  const handleExportCsv = () => {
    const headers = [
      'SKU',
      'Product Name',
      'Category',
      'Current Stock',
      'Min Stock',
      'Max Stock',
      'Selling Price',
      'Purchase Cost',
      'Avg Daily Sales',
      'Supplier',
      'Lead Time Days',
      'Status',
    ];

    const rows = products.map((p) => [
      `"${p.sku}"`,
      `"${p.name.replace(/"/g, '""')}"`,
      `"${p.category}"`,
      p.currentStock,
      p.minStock,
      p.maxStock,
      p.sellingPrice,
      p.purchaseCost,
      p.avgDailySales,
      `"${p.supplierName}"`,
      p.leadTimeDays,
      `"${getStockStatus(p)}"`,
    ]);

    const csvContent = 'data:text/csv;charset=utf-8,' + [headers.join(','), ...rows.map((e) => e.join(','))].join('\n');
    const encodedUri = encodeURI(csvContent);
    const link = document.createElement('a');
    link.setAttribute('href', encodedUri);
    link.setAttribute('download', `StockSense_Inventory_${new Date().toISOString().split('T')[0]}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const renderStatusBadge = (status: StockStatus) => {
    switch (status) {
      case 'out_of_stock':
        return (
          <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-bold bg-red-100 text-red-700">
            <XCircle className="w-3 h-3" />
            Out of Stock
          </span>
        );
      case 'critical':
        return (
          <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-bold bg-orange-100 text-orange-800 animate-pulse">
            <AlertTriangle className="w-3 h-3" />
            Critical Stock
          </span>
        );
      case 'low':
        return (
          <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-bold bg-amber-100 text-amber-800">
            <Clock className="w-3 h-3" />
            Low Stock
          </span>
        );
      case 'overstocked':
        return (
          <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-bold bg-indigo-100 text-indigo-800">
            Overstocked
          </span>
        );
      case 'healthy':
      default:
        return (
          <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-bold bg-emerald-100 text-emerald-800">
            <CheckCircle2 className="w-3 h-3" />
            Healthy
          </span>
        );
    }
  };

  return (
    <div className="p-3 sm:p-6 lg:p-8 space-y-4 sm:space-y-6 max-w-7xl mx-auto">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 sm:gap-4">
        <div>
          <h1 className="text-xl sm:text-2xl font-extrabold text-slate-900 tracking-tight">Inventory Management</h1>
          <p className="text-xs sm:text-sm text-slate-500 mt-0.5">
            Manage your catalog of {products.length} products, record stock adjustments, and monitor threshold limits.
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-2">
          <button
            onClick={() => setShowCsvModal(true)}
            className="flex items-center gap-1.5 px-3 py-1.5 sm:py-2 rounded-xl bg-white hover:bg-slate-50 border border-slate-200 text-xs font-semibold text-slate-700 shadow-sm transition-colors"
          >
            <Upload className="w-3.5 h-3.5 text-emerald-600" />
            <span>Import CSV</span>
          </button>

          <button
            onClick={handleExportCsv}
            className="flex items-center gap-1.5 px-3 py-1.5 sm:py-2 rounded-xl bg-white hover:bg-slate-50 border border-slate-200 text-xs font-semibold text-slate-700 shadow-sm transition-colors"
          >
            <Download className="w-3.5 h-3.5 text-slate-500" />
            <span>Export CSV</span>
          </button>

          <button
            onClick={onOpenAddProduct}
            className="flex items-center gap-1.5 px-3.5 py-1.5 sm:py-2 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white font-bold text-xs shadow-sm transition-all"
          >
            <Plus className="w-4 h-4 stroke-[2.5]" />
            <span>Add Product</span>
          </button>
        </div>
      </div>

      {/* Filters and Controls */}
      <div className="bg-white p-3 sm:p-4 rounded-2xl border border-slate-200/90 shadow-sm space-y-3">
        <div className="flex flex-col md:flex-row md:items-center gap-2.5 sm:gap-3">
          {/* Search */}
          <div className="relative flex-1">
            <Search className="w-4 h-4 absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search by name, SKU, or supplier..."
              className="w-full pl-10 pr-4 py-2 text-xs sm:text-sm bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500"
            />
          </div>

          {/* Category Filter */}
          <div className="flex items-center gap-2">
            <span className="text-xs font-medium text-slate-500 shrink-0">Category:</span>
            <select
              value={selectedCategory}
              onChange={(e) => setSelectedCategory(e.target.value)}
              className="px-3 py-2 text-xs bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-emerald-500/20 text-slate-800"
            >
              <option value="all">All Categories ({products.length})</option>
              {categories.map((c) => (
                <option key={c} value={c}>
                  {c}
                </option>
              ))}
            </select>
          </div>

          {/* Stock Status Filter */}
          <div className="flex items-center gap-2">
            <span className="text-xs font-medium text-slate-500 shrink-0">Status:</span>
            <select
              value={selectedStatus}
              onChange={(e) => setSelectedStatus(e.target.value)}
              className="px-3 py-2 text-xs bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-emerald-500/20 text-slate-800"
            >
              <option value="all">All Statuses</option>
              <option value="critical">Critical Stock (&lt; 2-3 Days)</option>
              <option value="low">Low Stock (Below Min)</option>
              <option value="out_of_stock">Out of Stock (0 units)</option>
              <option value="overstocked">Overstocked (&gt; 60 Days)</option>
              <option value="healthy">Healthy Stock</option>
            </select>
          </div>

          {/* Sort Control */}
          <div className="flex items-center gap-2">
            <span className="text-xs font-medium text-slate-500 shrink-0">Sort:</span>
            <select
              value={sortField}
              onChange={(e: any) => setSortField(e.target.value)}
              className="px-3 py-2 text-xs bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-emerald-500/20 text-slate-800"
            >
              <option value="stock">Stock Quantity</option>
              <option value="name">Product Name</option>
              <option value="sales">Daily Sales Rate</option>
              <option value="price">Selling Price</option>
            </select>
            <button
              onClick={() => setSortAsc(!sortAsc)}
              title="Toggle Ascending/Descending"
              className="p-2 rounded-xl border border-slate-200 bg-slate-50 hover:bg-slate-100 text-slate-600"
            >
              <ArrowUpDown className="w-3.5 h-3.5" />
            </button>
          </div>
        </div>

        {/* Showing count indicator */}
        <div className="flex items-center justify-between text-xs text-slate-500 pt-2 border-t border-slate-100">
          <span>
            Showing <strong>{filteredProducts.length}</strong> of <strong>{products.length}</strong> products
          </span>
          {(searchQuery || selectedCategory !== 'all' || selectedStatus !== 'all') && (
            <button
              onClick={() => {
                setSearchQuery('');
                setSelectedCategory('all');
                setSelectedStatus('all');
              }}
              className="text-emerald-600 hover:text-emerald-700 font-semibold"
            >
              Reset all filters
            </button>
          )}
        </div>
      </div>

      {/* Product Table */}
      <div className="bg-white rounded-2xl border border-slate-200/90 shadow-sm overflow-hidden">
        {/* Mobile Swipe Hint */}
        <div className="sm:hidden flex items-center justify-between text-[11px] text-slate-500 bg-slate-50/80 px-3 py-1.5 border-b border-slate-200/80 font-medium">
          <span>&larr; Swipe table horizontally to see prices, stock &amp; actions &rarr;</span>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className="bg-slate-50 text-slate-600 uppercase font-bold text-[11px] border-b border-slate-200/90">
              <tr>
                <th className="py-3.5 px-4">Product Details</th>
                <th className="py-3.5 px-3">Category</th>
                <th className="py-3.5 px-3 text-right">Price / Cost</th>
                <th className="py-3.5 px-4 text-center">Stock Level</th>
                <th className="py-3.5 px-3 text-center">Avg Sales/Day</th>
                <th className="py-3.5 px-3">Status</th>
                <th className="py-3.5 px-3">Supplier (Lead Time)</th>
                <th className="py-3.5 px-4 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {filteredProducts.length === 0 ? (
                <tr>
                  <td colSpan={8} className="py-12 text-center text-slate-400">
                    No products match the selected filters.
                  </td>
                </tr>
              ) : (
                filteredProducts.map((p) => {
                  const status = getStockStatus(p);
                  const marginPercent =
                    p.sellingPrice > 0
                      ? Math.round(((p.sellingPrice - p.purchaseCost) / p.sellingPrice) * 100)
                      : 0;

                  const stockProgress = Math.min(100, (p.currentStock / Math.max(1, p.maxStock || 50)) * 100);

                  return (
                    <tr key={p.id} className="hover:bg-slate-50/70 transition-colors group">
                      {/* Product Details */}
                      <td className="py-3 px-4 min-w-[220px]">
                        <div className="flex items-center gap-3">
                          <div className="w-9 h-9 rounded-xl bg-slate-100 text-slate-600 flex items-center justify-center font-bold text-xs shrink-0 border border-slate-200">
                            <Package className="w-4 h-4 text-slate-500" />
                          </div>
                          <div className="min-w-0">
                            <p className="font-bold text-slate-900 truncate">{p.name}</p>
                            <span className="font-mono text-[10px] text-slate-400 bg-slate-100 px-1.5 py-0.5 rounded">
                              {p.sku}
                            </span>
                          </div>
                        </div>
                      </td>

                      {/* Category */}
                      <td className="py-3 px-3 text-slate-600 whitespace-nowrap">
                        <span className="px-2 py-0.5 rounded-md bg-slate-100 text-slate-700 text-[11px] font-medium">
                          {p.category}
                        </span>
                      </td>

                      {/* Price / Cost / Margin */}
                      <td className="py-3 px-3 text-right whitespace-nowrap">
                        <p className="font-bold text-slate-900">
                          {businessProfile.currency}{p.sellingPrice}
                        </p>
                        <p className="text-[10px] text-slate-400">
                          Cost: {businessProfile.currency}{p.purchaseCost} ({marginPercent}% margin)
                        </p>
                      </td>

                      {/* Stock Level with Progress Bar */}
                      <td className="py-3 px-4 min-w-[140px]">
                        <div className="flex items-center justify-between text-[11px] mb-1">
                          <span className={`font-bold ${p.currentStock === 0 ? 'text-red-600' : 'text-slate-900'}`}>
                            {p.currentStock} {p.unit}s
                          </span>
                          <span className="text-[10px] text-slate-400">
                            Min: {p.minStock} | Max: {p.maxStock}
                          </span>
                        </div>
                        <div className="w-full h-2 bg-slate-100 rounded-full overflow-hidden">
                          <div
                            style={{ width: `${stockProgress}%` }}
                            className={`h-full transition-all ${
                              status === 'out_of_stock'
                                ? 'bg-red-500'
                                : status === 'critical'
                                ? 'bg-orange-500'
                                : status === 'low'
                                ? 'bg-amber-400'
                                : status === 'overstocked'
                                ? 'bg-indigo-500'
                                : 'bg-emerald-500'
                            }`}
                          />
                        </div>
                      </td>

                      {/* Daily Sales Velocity */}
                      <td className="py-3 px-3 text-center whitespace-nowrap">
                        <span className="font-semibold text-slate-800">
                          {p.avgDailySales}
                        </span>
                        <span className="text-[10px] text-slate-400 block">units / day</span>
                      </td>

                      {/* Status */}
                      <td className="py-3 px-3 whitespace-nowrap">
                        {renderStatusBadge(status)}
                      </td>

                      {/* Supplier & Lead Time */}
                      <td className="py-3 px-3 whitespace-nowrap text-slate-700">
                        <p className="font-medium truncate max-w-[150px]">{p.supplierName}</p>
                        <span className="text-[10px] text-slate-400">
                          {p.leadTimeDays} days lead time
                        </span>
                      </td>

                      {/* Actions */}
                      <td className="py-3 px-4 text-right whitespace-nowrap">
                        <div className="flex items-center justify-end gap-1.5">
                          <button
                            onClick={() => onOpenAdjustStock(p)}
                            title="Adjust Stock Quantity"
                            className="p-1.5 rounded-lg text-slate-500 hover:text-slate-900 hover:bg-slate-100 transition-colors"
                          >
                            <RotateCcw className="w-3.5 h-3.5 text-blue-600" />
                          </button>
                          <button
                            onClick={() => onOpenEditProduct(p)}
                            title="Edit Product"
                            className="p-1.5 rounded-lg text-slate-500 hover:text-slate-900 hover:bg-slate-100 transition-colors"
                          >
                            <Edit2 className="w-3.5 h-3.5 text-slate-600" />
                          </button>
                          <button
                            onClick={() => {
                              if (window.confirm(`Are you sure you want to delete ${p.name} (${p.sku})?`)) {
                                deleteProduct(p.id);
                              }
                            }}
                            title="Delete Product"
                            className="p-1.5 rounded-lg text-slate-400 hover:text-red-600 hover:bg-red-50 transition-colors"
                          >
                            <Trash2 className="w-3.5 h-3.5" />
                          </button>
                        </div>
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* CSV Import Modal */}
      {showCsvModal && (
        <CsvImportModal
          onClose={() => setShowCsvModal(false)}
        />
      )}
    </div>
  );
};
