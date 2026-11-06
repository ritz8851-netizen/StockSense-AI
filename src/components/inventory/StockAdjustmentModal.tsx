import React, { useState } from 'react';
import { X, RotateCcw, ArrowUpRight, ArrowDownRight, CheckCircle2 } from 'lucide-react';
import { useStore } from '../../context/StoreContext';
import { Product, TransactionType } from '../../types';

interface StockAdjustmentModalProps {
  product?: Product | null;
  onClose: () => void;
}

export const StockAdjustmentModal: React.FC<StockAdjustmentModalProps> = ({
  product: initialProduct,
  onClose,
}) => {
  const { products, adjustStock } = useStore();

  const [selectedProductId, setSelectedProductId] = useState<string>(
    initialProduct ? initialProduct.id : products[0]?.id || ''
  );
  const [adjustmentType, setAdjustmentType] = useState<TransactionType>('adjustment');
  const [direction, setDirection] = useState<'add' | 'subtract'>('add');
  const [quantity, setQuantity] = useState<number | ''>(5);
  const [reason, setReason] = useState<string>('Physical inventory count audit');

  const selectedProduct = products.find((p) => p.id === selectedProductId);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedProduct || quantity === '' || Number(quantity) <= 0) {
      alert('Please enter a valid positive quantity.');
      return;
    }

    const qtyNumber = Number(quantity);
    const finalDelta = direction === 'add' ? qtyNumber : -qtyNumber;

    adjustStock(selectedProduct.id, finalDelta, adjustmentType, reason);
    alert(`Stock updated! ${selectedProduct.name} is now ${Math.max(0, selectedProduct.currentStock + finalDelta)} units.`);
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm animate-in fade-in duration-150">
      <div className="bg-white w-full max-w-md rounded-2xl shadow-2xl border border-slate-200 overflow-hidden flex flex-col">
        {/* Header */}
        <div className="px-6 py-4 border-b border-slate-100 flex items-center justify-between bg-slate-50/70">
          <div className="flex items-center gap-2.5">
            <div className="w-9 h-9 rounded-xl bg-blue-100 text-blue-700 flex items-center justify-center">
              <RotateCcw className="w-5 h-5" />
            </div>
            <div>
              <h2 className="text-base font-bold text-slate-900">Adjust Stock Quantity</h2>
              <p className="text-xs text-slate-500">Record physical count, shrinkage, or manual restock</p>
            </div>
          </div>
          <button onClick={onClose} className="p-1 rounded-lg text-slate-400 hover:text-slate-600">
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Form Body */}
        <form onSubmit={handleSubmit} className="p-6 space-y-4 text-xs">
          {/* Select Product */}
          <div className="space-y-1">
            <label className="font-semibold text-slate-700">Select Product</label>
            <select
              value={selectedProductId}
              onChange={(e) => setSelectedProductId(e.target.value)}
              className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl focus:ring-2 focus:ring-blue-500/20 text-slate-800 text-xs"
            >
              {products.map((p) => (
                <option key={p.id} value={p.id}>
                  {p.name} ({p.sku}) — Current: {p.currentStock} {p.unit}s
                </option>
              ))}
            </select>
          </div>

          {selectedProduct && (
            <div className="p-3 rounded-xl bg-slate-50 border border-slate-200 flex items-center justify-between">
              <div>
                <span className="text-[10px] text-slate-400 uppercase font-bold tracking-wider">Current Stock</span>
                <p className="text-base font-bold text-slate-900">
                  {selectedProduct.currentStock} {selectedProduct.unit}s
                </p>
              </div>
              <div className="text-right">
                <span className="text-[10px] text-slate-400 uppercase font-bold tracking-wider">After Adjustment</span>
                <p className="text-base font-bold text-blue-600">
                  {Math.max(
                    0,
                    selectedProduct.currentStock +
                      (direction === 'add' ? Number(quantity) || 0 : -(Number(quantity) || 0))
                  )}{' '}
                  {selectedProduct.unit}s
                </p>
              </div>
            </div>
          )}

          {/* Direction toggle */}
          <div className="space-y-1">
            <label className="font-semibold text-slate-700">Adjustment Type</label>
            <div className="grid grid-cols-2 gap-2">
              <button
                type="button"
                onClick={() => {
                  setDirection('add');
                  setAdjustmentType('stock_in');
                }}
                className={`flex items-center justify-center gap-1.5 py-2 px-3 rounded-xl border text-xs font-semibold transition-all ${
                  direction === 'add'
                    ? 'bg-emerald-50 border-emerald-500 text-emerald-800 shadow-sm'
                    : 'border-slate-200 bg-white text-slate-600 hover:bg-slate-50'
                }`}
              >
                <ArrowUpRight className="w-4 h-4 text-emerald-600" />
                <span>Add Stock (+)</span>
              </button>

              <button
                type="button"
                onClick={() => {
                  setDirection('subtract');
                  setAdjustmentType('stock_out');
                }}
                className={`flex items-center justify-center gap-1.5 py-2 px-3 rounded-xl border text-xs font-semibold transition-all ${
                  direction === 'subtract'
                    ? 'bg-red-50 border-red-500 text-red-800 shadow-sm'
                    : 'border-slate-200 bg-white text-slate-600 hover:bg-slate-50'
                }`}
              >
                <ArrowDownRight className="w-4 h-4 text-red-600" />
                <span>Reduce Stock (-)</span>
              </button>
            </div>
          </div>

          {/* Quantity */}
          <div className="space-y-1">
            <label className="font-semibold text-slate-700">Quantity to Adjust *</label>
            <input
              type="number"
              min="1"
              value={quantity}
              onChange={(e) => setQuantity(e.target.value === '' ? '' : Number(e.target.value))}
              placeholder="e.g. 10"
              className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl focus:ring-2 focus:ring-blue-500/20 text-slate-800 text-xs font-bold"
            />
          </div>

          {/* Reason */}
          <div className="space-y-1">
            <label className="font-semibold text-slate-700">Reason / Reference Note</label>
            <input
              type="text"
              list="reason-options"
              value={reason}
              onChange={(e) => setReason(e.target.value)}
              placeholder="e.g. Physical inventory count audit"
              className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl focus:ring-2 focus:ring-blue-500/20 text-slate-800 text-xs"
            />
            <datalist id="reason-options">
              <option value="Physical inventory count audit" />
              <option value="Damaged or expired goods write-off" />
              <option value="Customer return / restock" />
              <option value="Supplier sample receipt" />
              <option value="Shrinkage or breakage" />
              <option value="Warehouse transfer" />
            </datalist>
          </div>

          {/* Footer */}
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
              className="px-5 py-2 text-xs font-bold text-white bg-blue-600 hover:bg-blue-500 rounded-xl shadow-sm transition-all"
            >
              Apply Adjustment
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
