import React, { useState } from 'react';
import { X, ShoppingCart, IndianRupee, Check } from 'lucide-react';
import { useStore } from '../../context/StoreContext';
import { SalesChannel } from '../../types';

interface RecordSaleModalProps {
  onClose: () => void;
}

export const RecordSaleModal: React.FC<RecordSaleModalProps> = ({ onClose }) => {
  const { products, recordSale, businessProfile } = useStore();

  const [productId, setProductId] = useState<string>(products[0]?.id || '');
  const [quantity, setQuantity] = useState<number | ''>(1);
  const [sellingPrice, setSellingPrice] = useState<number | ''>(products[0]?.sellingPrice || 0);
  const [channel, setChannel] = useState<SalesChannel>('In-Store');
  const [saleDate, setSaleDate] = useState<string>(() => new Date().toISOString().split('T')[0]);

  const selectedProduct = products.find((p) => p.id === productId);

  const handleProductChange = (newId: string) => {
    setProductId(newId);
    const p = products.find((prod) => prod.id === newId);
    if (p) {
      setSellingPrice(p.sellingPrice);
    }
  };

  const qtyNum = Number(quantity) || 0;
  const priceNum = Number(sellingPrice) || 0;
  const totalRevenue = qtyNum * priceNum;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedProduct || qtyNum <= 0 || priceNum <= 0) {
      alert('Please enter valid quantity and price.');
      return;
    }

    if (selectedProduct.currentStock < qtyNum) {
      if (
        !window.confirm(
          `Warning: Current stock is ${selectedProduct.currentStock} units, but sale is for ${qtyNum} units. This will drive stock negative. Proceed anyway?`
        )
      ) {
        return;
      }
    }

    recordSale({
      productId: selectedProduct.id,
      sku: selectedProduct.sku,
      productName: selectedProduct.name,
      quantity: qtyNum,
      sellingPrice: priceNum,
      costPrice: selectedProduct.purchaseCost,
      totalRevenue,
      date: saleDate,
      channel,
    });

    alert(`Sale recorded for ${qtyNum} units of ${selectedProduct.name}! Stock automatically deducted.`);
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm animate-in fade-in duration-150">
      <div className="bg-white w-full max-w-md rounded-2xl shadow-2xl border border-slate-200 overflow-hidden flex flex-col">
        {/* Header */}
        <div className="px-6 py-4 border-b border-slate-100 flex items-center justify-between bg-slate-50/70">
          <div className="flex items-center gap-2.5">
            <div className="w-9 h-9 rounded-xl bg-emerald-100 text-emerald-700 flex items-center justify-center">
              <ShoppingCart className="w-5 h-5" />
            </div>
            <div>
              <h2 className="text-base font-bold text-slate-900">Record a Sale</h2>
              <p className="text-xs text-slate-500">Record transaction and auto-deduct inventory</p>
            </div>
          </div>
          <button onClick={onClose} className="p-1 rounded-lg text-slate-400 hover:text-slate-600">
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Body */}
        <form onSubmit={handleSubmit} className="p-6 space-y-4 text-xs">
          {/* Product Picker */}
          <div className="space-y-1">
            <label className="font-semibold text-slate-700">Select Product *</label>
            <select
              value={productId}
              onChange={(e) => handleProductChange(e.target.value)}
              className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl focus:ring-2 focus:ring-emerald-500/20 text-slate-800 text-xs font-semibold"
            >
              {products.map((p) => (
                <option key={p.id} value={p.id}>
                  {p.name} ({p.sku}) — Stock: {p.currentStock} {p.unit}s
                </option>
              ))}
            </select>
          </div>

          {selectedProduct && (
            <div className="p-3 bg-slate-50 rounded-xl border border-slate-200 flex items-center justify-between text-xs">
              <span className="text-slate-500">Available In Stock:</span>
              <strong className={selectedProduct.currentStock <= 3 ? 'text-red-600' : 'text-slate-900'}>
                {selectedProduct.currentStock} {selectedProduct.unit}s
              </strong>
            </div>
          )}

          {/* Quantity & Unit Price */}
          <div className="grid grid-cols-2 gap-3">
            <div className="space-y-1">
              <label className="font-semibold text-slate-700">Quantity Sold *</label>
              <input
                type="number"
                min="1"
                value={quantity}
                onChange={(e) => setQuantity(e.target.value === '' ? '' : Number(e.target.value))}
                className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl focus:ring-2 focus:ring-emerald-500/20 text-slate-900 text-xs font-bold text-center"
              />
            </div>

            <div className="space-y-1">
              <label className="font-semibold text-slate-700">
                Price / Unit ({businessProfile.currency}) *
              </label>
              <input
                type="number"
                step="0.1"
                value={sellingPrice}
                onChange={(e) => setSellingPrice(e.target.value === '' ? '' : Number(e.target.value))}
                className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl focus:ring-2 focus:ring-emerald-500/20 text-slate-900 text-xs font-medium text-right"
              />
            </div>
          </div>

          {/* Channel & Date */}
          <div className="grid grid-cols-2 gap-3">
            <div className="space-y-1">
              <label className="font-semibold text-slate-700">Sales Channel</label>
              <select
                value={channel}
                onChange={(e: any) => setChannel(e.target.value)}
                className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl focus:ring-2 focus:ring-emerald-500/20 text-slate-800 text-xs"
              >
                <option value="In-Store">In-Store Register</option>
                <option value="Online">Online / WhatsApp</option>
                <option value="Wholesale">Wholesale Bulk</option>
                <option value="B2B">B2B Corporate</option>
              </select>
            </div>

            <div className="space-y-1">
              <label className="font-semibold text-slate-700">Sale Date</label>
              <input
                type="date"
                value={saleDate}
                onChange={(e) => setSaleDate(e.target.value)}
                className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl focus:ring-2 focus:ring-emerald-500/20 text-slate-800 text-xs"
              />
            </div>
          </div>

          {/* Total Revenue Box */}
          <div className="p-4 rounded-xl bg-slate-900 text-white flex items-center justify-between">
            <div>
              <span className="text-[10px] text-slate-400 uppercase font-bold tracking-wider">
                Total Transaction
              </span>
              <p className="text-xl font-extrabold text-emerald-400 mt-0.5">
                {businessProfile.currency}{totalRevenue.toLocaleString()}
              </p>
            </div>

            <div className="flex items-center gap-2">
              <button
                type="button"
                onClick={onClose}
                className="px-3 py-1.5 text-xs text-slate-300 hover:text-white"
              >
                Cancel
              </button>
              <button
                type="submit"
                className="px-4 py-2 text-xs font-bold text-slate-950 bg-emerald-400 hover:bg-emerald-300 rounded-xl shadow-md transition-all"
              >
                Record Sale
              </button>
            </div>
          </div>
        </form>
      </div>
    </div>
  );
};
