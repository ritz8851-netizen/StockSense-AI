import React, { useState, useEffect } from 'react';
import { X, Package, Check, AlertCircle } from 'lucide-react';
import { useStore } from '../../context/StoreContext';
import { Product } from '../../types';

interface ProductFormModalProps {
  product?: Product | null;
  onClose: () => void;
}

export const ProductFormModal: React.FC<ProductFormModalProps> = ({ product, onClose }) => {
  const { addProduct, updateProduct, suppliers, businessProfile } = useStore();

  const isEditing = Boolean(product);

  const [name, setName] = useState('');
  const [sku, setSku] = useState('');
  const [category, setCategory] = useState('Grocery & Staples');
  const [description, setDescription] = useState('');
  const [sellingPrice, setSellingPrice] = useState<number | ''>('');
  const [purchaseCost, setPurchaseCost] = useState<number | ''>('');
  const [currentStock, setCurrentStock] = useState<number | ''>('');
  const [minStock, setMinStock] = useState<number | ''>(10);
  const [maxStock, setMaxStock] = useState<number | ''>(50);
  const [avgDailySales, setAvgDailySales] = useState<number | ''>(2);
  const [supplierId, setSupplierId] = useState('');
  const [leadTimeDays, setLeadTimeDays] = useState<number | ''>(3);
  const [unit, setUnit] = useState('pack');
  const [errors, setErrors] = useState<Record<string, string>>({});

  useEffect(() => {
    if (product) {
      setName(product.name);
      setSku(product.sku);
      setCategory(product.category);
      setDescription(product.description || '');
      setSellingPrice(product.sellingPrice);
      setPurchaseCost(product.purchaseCost);
      setCurrentStock(product.currentStock);
      setMinStock(product.minStock);
      setMaxStock(product.maxStock);
      setAvgDailySales(product.avgDailySales);
      setSupplierId(product.supplierId);
      setLeadTimeDays(product.leadTimeDays);
      setUnit(product.unit || 'pack');
    } else {
      if (suppliers.length > 0) {
        setSupplierId(suppliers[0].id);
        setLeadTimeDays(suppliers[0].leadTimeDays);
      }
    }
  }, [product, suppliers]);

  const validate = () => {
    const err: Record<string, string> = {};
    if (!name.trim()) err.name = 'Product name is required';
    if (!sku.trim()) err.sku = 'SKU is required';
    if (sellingPrice === '' || Number(sellingPrice) <= 0) err.sellingPrice = 'Enter valid selling price';
    if (purchaseCost === '' || Number(purchaseCost) < 0) err.purchaseCost = 'Enter valid purchase cost';
    if (currentStock === '' || Number(currentStock) < 0) err.currentStock = 'Enter current stock';
    if (minStock === '' || Number(minStock) < 0) err.minStock = 'Enter minimum stock threshold';
    if (maxStock === '' || Number(maxStock) <= Number(minStock)) err.maxStock = 'Target max stock must be > min stock';
    setErrors(err);
    return Object.keys(err).length === 0;
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!validate()) return;

    const supplier = suppliers.find((s) => s.id === supplierId);
    const supplierName = supplier ? supplier.name : 'Direct Wholesale';

    if (isEditing && product) {
      updateProduct(product.id, {
        name,
        sku,
        category,
        description,
        sellingPrice: Number(sellingPrice),
        purchaseCost: Number(purchaseCost),
        currentStock: Number(currentStock),
        minStock: Number(minStock),
        maxStock: Number(maxStock),
        avgDailySales: Number(avgDailySales) || 1,
        supplierId,
        supplierName,
        leadTimeDays: Number(leadTimeDays) || 3,
        unit,
      });
    } else {
      addProduct({
        name,
        sku,
        category,
        description,
        sellingPrice: Number(sellingPrice),
        purchaseCost: Number(purchaseCost),
        currentStock: Number(currentStock),
        minStock: Number(minStock),
        maxStock: Number(maxStock),
        avgDailySales: Number(avgDailySales) || 1,
        supplierId,
        supplierName,
        leadTimeDays: Number(leadTimeDays) || 3,
        unit,
      });
    }

    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm animate-in fade-in duration-150">
      <div className="bg-white w-full max-w-2xl rounded-2xl shadow-2xl border border-slate-200 overflow-hidden flex flex-col max-h-[90vh]">
        {/* Header */}
        <div className="px-6 py-4 border-b border-slate-100 flex items-center justify-between bg-slate-50/70">
          <div className="flex items-center gap-2.5">
            <div className="w-9 h-9 rounded-xl bg-emerald-100 text-emerald-700 flex items-center justify-center">
              <Package className="w-5 h-5" />
            </div>
            <div>
              <h2 className="text-base font-bold text-slate-900">
                {isEditing ? 'Edit Product' : 'Add New Inventory Product'}
              </h2>
              <p className="text-xs text-slate-500">
                {isEditing ? `Modifying SKU: ${product?.sku}` : 'Fill in product specifications and reorder targets'}
              </p>
            </div>
          </div>
          <button onClick={onClose} className="p-1 rounded-lg text-slate-400 hover:text-slate-600">
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Form Body */}
        <form onSubmit={handleSubmit} className="p-6 overflow-y-auto space-y-4 flex-1 text-xs">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            {/* Product Name */}
            <div className="sm:col-span-2 space-y-1">
              <label className="font-semibold text-slate-700">Product Name *</label>
              <input
                type="text"
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder="e.g. Daawat Rozana Basmati Rice 5kg"
                className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl focus:bg-white focus:ring-2 focus:ring-emerald-500/20 text-slate-800 text-xs"
              />
              {errors.name && <p className="text-[11px] text-red-600">{errors.name}</p>}
            </div>

            {/* SKU */}
            <div className="space-y-1">
              <label className="font-semibold text-slate-700">Unique SKU / Barcode *</label>
              <input
                type="text"
                value={sku}
                onChange={(e) => setSku(e.target.value)}
                placeholder="e.g. GR-RIC-001"
                className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl font-mono focus:bg-white focus:ring-2 focus:ring-emerald-500/20 text-slate-800 text-xs uppercase"
              />
              {errors.sku && <p className="text-[11px] text-red-600">{errors.sku}</p>}
            </div>

            {/* Category */}
            <div className="space-y-1">
              <label className="font-semibold text-slate-700">Category *</label>
              <input
                type="text"
                list="category-suggestions"
                value={category}
                onChange={(e) => setCategory(e.target.value)}
                placeholder="e.g. Grocery & Staples"
                className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl focus:bg-white focus:ring-2 focus:ring-emerald-500/20 text-slate-800 text-xs"
              />
              <datalist id="category-suggestions">
                <option value="Grocery & Staples" />
                <option value="Packaged Foods & Snacks" />
                <option value="Beverages" />
                <option value="Personal Care" />
                <option value="Household & Cleaning" />
                <option value="Dairy & Bakery" />
                <option value="Pharmacy & Health" />
              </datalist>
            </div>

            {/* Selling Price */}
            <div className="space-y-1">
              <label className="font-semibold text-slate-700">
                Selling Price ({businessProfile.currency}) *
              </label>
              <input
                type="number"
                step="0.01"
                value={sellingPrice}
                onChange={(e) => setSellingPrice(e.target.value === '' ? '' : Number(e.target.value))}
                placeholder="e.g. 385"
                className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl focus:bg-white focus:ring-2 focus:ring-emerald-500/20 text-slate-800 text-xs"
              />
              {errors.sellingPrice && <p className="text-[11px] text-red-600">{errors.sellingPrice}</p>}
            </div>

            {/* Purchase Cost */}
            <div className="space-y-1">
              <label className="font-semibold text-slate-700">
                Purchase Cost ({businessProfile.currency}) *
              </label>
              <input
                type="number"
                step="0.01"
                value={purchaseCost}
                onChange={(e) => setPurchaseCost(e.target.value === '' ? '' : Number(e.target.value))}
                placeholder="e.g. 310"
                className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl focus:bg-white focus:ring-2 focus:ring-emerald-500/20 text-slate-800 text-xs"
              />
              {errors.purchaseCost && <p className="text-[11px] text-red-600">{errors.purchaseCost}</p>}
            </div>

            {/* Current Stock */}
            <div className="space-y-1">
              <label className="font-semibold text-slate-700">Current Stock Quantity *</label>
              <input
                type="number"
                value={currentStock}
                onChange={(e) => setCurrentStock(e.target.value === '' ? '' : Number(e.target.value))}
                placeholder="e.g. 24"
                className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl focus:bg-white focus:ring-2 focus:ring-emerald-500/20 text-slate-800 text-xs font-bold"
              />
              {errors.currentStock && <p className="text-[11px] text-red-600">{errors.currentStock}</p>}
            </div>

            {/* Packaging Unit */}
            <div className="space-y-1">
              <label className="font-semibold text-slate-700">Unit of Measurement</label>
              <select
                value={unit}
                onChange={(e) => setUnit(e.target.value)}
                className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl focus:bg-white focus:ring-2 focus:ring-emerald-500/20 text-slate-800 text-xs"
              >
                <option value="pack">Pack</option>
                <option value="bag">Bag</option>
                <option value="bottle">Bottle</option>
                <option value="tin">Tin</option>
                <option value="jar">Jar</option>
                <option value="box">Box</option>
                <option value="kg">Kilogram (kg)</option>
                <option value="unit">Piece / Unit</option>
              </select>
            </div>

            {/* Min Stock (Reorder Point Threshold) */}
            <div className="space-y-1">
              <label className="font-semibold text-slate-700">Min Stock Warning Level *</label>
              <input
                type="number"
                value={minStock}
                onChange={(e) => setMinStock(e.target.value === '' ? '' : Number(e.target.value))}
                placeholder="e.g. 15"
                className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl focus:bg-white focus:ring-2 focus:ring-emerald-500/20 text-slate-800 text-xs"
              />
              {errors.minStock && <p className="text-[11px] text-red-600">{errors.minStock}</p>}
            </div>

            {/* Max Target Stock */}
            <div className="space-y-1">
              <label className="font-semibold text-slate-700">Max Target Inventory *</label>
              <input
                type="number"
                value={maxStock}
                onChange={(e) => setMaxStock(e.target.value === '' ? '' : Number(e.target.value))}
                placeholder="e.g. 50"
                className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl focus:bg-white focus:ring-2 focus:ring-emerald-500/20 text-slate-800 text-xs"
              />
              {errors.maxStock && <p className="text-[11px] text-red-600">{errors.maxStock}</p>}
            </div>

            {/* Avg Daily Sales */}
            <div className="space-y-1">
              <label className="font-semibold text-slate-700">Est. Average Daily Sales (Units)</label>
              <input
                type="number"
                step="0.1"
                value={avgDailySales}
                onChange={(e) => setAvgDailySales(e.target.value === '' ? '' : Number(e.target.value))}
                placeholder="e.g. 3.2"
                className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl focus:bg-white focus:ring-2 focus:ring-emerald-500/20 text-slate-800 text-xs"
              />
            </div>

            {/* Supplier */}
            <div className="space-y-1">
              <label className="font-semibold text-slate-700">Preferred Supplier</label>
              <select
                value={supplierId}
                onChange={(e) => {
                  setSupplierId(e.target.value);
                  const sup = suppliers.find((s) => s.id === e.target.value);
                  if (sup) setLeadTimeDays(sup.leadTimeDays);
                }}
                className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl focus:bg-white focus:ring-2 focus:ring-emerald-500/20 text-slate-800 text-xs"
              >
                {suppliers.map((s) => (
                  <option key={s.id} value={s.id}>
                    {s.name} ({s.leadTimeDays}d lead)
                  </option>
                ))}
              </select>
            </div>

            {/* Supplier Lead Time Days */}
            <div className="space-y-1">
              <label className="font-semibold text-slate-700">Supplier Lead Time (Days)</label>
              <input
                type="number"
                value={leadTimeDays}
                onChange={(e) => setLeadTimeDays(e.target.value === '' ? '' : Number(e.target.value))}
                placeholder="e.g. 3"
                className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl focus:bg-white focus:ring-2 focus:ring-emerald-500/20 text-slate-800 text-xs"
              />
            </div>
          </div>

          {/* Modal Footer */}
          <div className="pt-4 border-t border-slate-100 flex items-center justify-end gap-3">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 text-xs font-semibold text-slate-600 hover:text-slate-800"
            >
              Cancel
            </button>
            <button
              type="submit"
              className="px-5 py-2 text-xs font-bold text-white bg-emerald-600 hover:bg-emerald-500 rounded-xl shadow-sm transition-all"
            >
              {isEditing ? 'Save Product Changes' : 'Create Product'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
