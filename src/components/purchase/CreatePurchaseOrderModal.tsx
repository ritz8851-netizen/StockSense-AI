import React, { useState, useEffect } from 'react';
import { X, Truck, Plus, Trash2, IndianRupee, Calendar } from 'lucide-react';
import { useStore } from '../../context/StoreContext';
import { PurchaseOrderItem, PurchaseOrderStatus } from '../../types';

interface CreatePurchaseOrderModalProps {
  onClose: () => void;
  prefillSupplierId?: string;
  prefillProductId?: string;
  prefillQuantity?: number;
}

export const CreatePurchaseOrderModal: React.FC<CreatePurchaseOrderModalProps> = ({
  onClose,
  prefillSupplierId,
  prefillProductId,
  prefillQuantity,
}) => {
  const { suppliers, products, createPurchaseOrder, businessProfile } = useStore();

  const [supplierId, setSupplierId] = useState<string>(
    prefillSupplierId || suppliers[0]?.id || ''
  );

  const [expectedDate, setExpectedDate] = useState<string>(() => {
    const d = new Date();
    d.setDate(d.getDate() + 3);
    return d.toISOString().split('T')[0];
  });

  const [status, setStatus] = useState<PurchaseOrderStatus>('Ordered');
  const [notes, setNotes] = useState<string>('Standard replenishment order');

  const [items, setItems] = useState<PurchaseOrderItem[]>(() => {
    if (prefillProductId) {
      const p = products.find((prod) => prod.id === prefillProductId);
      if (p) {
        const qty = prefillQuantity || Math.max(10, p.minStock * 2);
        return [
          {
            productId: p.id,
            sku: p.sku,
            productName: p.name,
            quantity: qty,
            unitCost: p.purchaseCost,
            total: qty * p.purchaseCost,
          },
        ];
      }
    }
    // Default to first product of supplier
    const supProducts = products.filter((p) => p.supplierId === (prefillSupplierId || suppliers[0]?.id));
    const firstP = supProducts[0] || products[0];
    if (firstP) {
      return [
        {
          productId: firstP.id,
          sku: firstP.sku,
          productName: firstP.name,
          quantity: 20,
          unitCost: firstP.purchaseCost,
          total: 20 * firstP.purchaseCost,
        },
      ];
    }
    return [];
  });

  // When supplier changes, update expected delivery date based on lead time
  useEffect(() => {
    const sup = suppliers.find((s) => s.id === supplierId);
    if (sup) {
      const d = new Date();
      d.setDate(d.getDate() + (sup.leadTimeDays || 3));
      setExpectedDate(d.toISOString().split('T')[0]);
    }
  }, [supplierId, suppliers]);

  const handleAddItem = () => {
    const available = products.filter((p) => !items.some((item) => item.productId === p.id));
    const targetProduct = available[0] || products[0];
    if (!targetProduct) return;

    setItems((prev) => [
      ...prev,
      {
        productId: targetProduct.id,
        sku: targetProduct.sku,
        productName: targetProduct.name,
        quantity: 15,
        unitCost: targetProduct.purchaseCost,
        total: 15 * targetProduct.purchaseCost,
      },
    ]);
  };

  const handleItemProductChange = (index: number, newProductId: string) => {
    const p = products.find((prod) => prod.id === newProductId);
    if (!p) return;

    setItems((prev) => {
      const updated = [...prev];
      const qty = updated[index].quantity;
      updated[index] = {
        productId: p.id,
        sku: p.sku,
        productName: p.name,
        quantity: qty,
        unitCost: p.purchaseCost,
        total: qty * p.purchaseCost,
      };
      return updated;
    });
  };

  const handleQuantityChange = (index: number, qty: number) => {
    const safeQty = Math.max(1, qty || 1);
    setItems((prev) => {
      const updated = [...prev];
      updated[index].quantity = safeQty;
      updated[index].total = safeQty * updated[index].unitCost;
      return updated;
    });
  };

  const handleCostChange = (index: number, cost: number) => {
    const safeCost = Math.max(0, cost || 0);
    setItems((prev) => {
      const updated = [...prev];
      updated[index].unitCost = safeCost;
      updated[index].total = updated[index].quantity * safeCost;
      return updated;
    });
  };

  const handleRemoveItem = (index: number) => {
    if (items.length <= 1) {
      alert('A purchase order must contain at least one line item.');
      return;
    }
    setItems((prev) => prev.filter((_, i) => i !== index));
  };

  const grandTotal = items.reduce((acc, curr) => acc + curr.total, 0);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (items.length === 0) {
      alert('Please add at least one product.');
      return;
    }

    const supplier = suppliers.find((s) => s.id === supplierId);
    const supplierName = supplier ? supplier.name : 'Wholesale Direct';
    const now = new Date().toISOString().split('T')[0];

    const newPO = createPurchaseOrder({
      supplierId,
      supplierName,
      items,
      totalAmount: grandTotal,
      status,
      orderDate: now,
      expectedDeliveryDate: expectedDate,
      notes,
    });

    alert(`Purchase order ${newPO.orderNumber} created successfully! Total: ${businessProfile.currency}${grandTotal.toLocaleString()}`);
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm animate-in fade-in duration-150">
      <div className="bg-white w-full max-w-3xl rounded-2xl shadow-2xl border border-slate-200 overflow-hidden flex flex-col max-h-[90vh]">
        {/* Header */}
        <div className="px-6 py-4 border-b border-slate-100 flex items-center justify-between bg-slate-50/70">
          <div className="flex items-center gap-2.5">
            <div className="w-9 h-9 rounded-xl bg-emerald-100 text-emerald-700 flex items-center justify-center">
              <Truck className="w-5 h-5" />
            </div>
            <div>
              <h2 className="text-base font-bold text-slate-900">Create Purchase Order</h2>
              <p className="text-xs text-slate-500">Replenish stock directly from authorized suppliers</p>
            </div>
          </div>
          <button onClick={onClose} className="p-1 rounded-lg text-slate-400 hover:text-slate-600">
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Body */}
        <form onSubmit={handleSubmit} className="p-6 overflow-y-auto space-y-5 flex-1 text-xs">
          {/* Top Metadata */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 p-4 rounded-xl bg-slate-50 border border-slate-200">
            {/* Supplier */}
            <div className="space-y-1">
              <label className="font-semibold text-slate-700">Select Supplier *</label>
              <select
                value={supplierId}
                onChange={(e) => setSupplierId(e.target.value)}
                className="w-full px-3 py-2 bg-white border border-slate-200 rounded-xl focus:ring-2 focus:ring-emerald-500/20 text-slate-800 text-xs font-semibold"
              >
                {suppliers.map((s) => (
                  <option key={s.id} value={s.id}>
                    {s.name} ({s.leadTimeDays}d lead)
                  </option>
                ))}
              </select>
            </div>

            {/* Expected Delivery Date */}
            <div className="space-y-1">
              <label className="font-semibold text-slate-700">Expected Delivery Date *</label>
              <input
                type="date"
                value={expectedDate}
                onChange={(e) => setExpectedDate(e.target.value)}
                className="w-full px-3 py-2 bg-white border border-slate-200 rounded-xl focus:ring-2 focus:ring-emerald-500/20 text-slate-800 text-xs font-medium"
              />
            </div>

            {/* Initial Status */}
            <div className="space-y-1">
              <label className="font-semibold text-slate-700">Initial Status</label>
              <select
                value={status}
                onChange={(e: any) => setStatus(e.target.value)}
                className="w-full px-3 py-2 bg-white border border-slate-200 rounded-xl focus:ring-2 focus:ring-emerald-500/20 text-slate-800 text-xs font-semibold"
              >
                <option value="Ordered">Ordered (Dispatched)</option>
                <option value="Pending">Pending Approval</option>
                <option value="Draft">Draft</option>
              </select>
            </div>
          </div>

          {/* Line Items */}
          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <h3 className="text-xs font-bold text-slate-900 uppercase tracking-wider">
                Line Items ({items.length})
              </h3>
              <button
                type="button"
                onClick={handleAddItem}
                className="flex items-center gap-1 text-xs font-bold text-emerald-600 hover:text-emerald-700"
              >
                <Plus className="w-3.5 h-3.5" />
                <span>Add Product</span>
              </button>
            </div>

            <div className="border border-slate-200 rounded-xl overflow-hidden divide-y divide-slate-100">
              {items.map((item, index) => (
                <div key={index} className="p-3 bg-white flex flex-col sm:flex-row items-center gap-3">
                  {/* Product Picker */}
                  <div className="flex-1 w-full sm:w-auto">
                    <label className="text-[10px] text-slate-400 font-semibold block mb-0.5">Product</label>
                    <select
                      value={item.productId}
                      onChange={(e) => handleItemProductChange(index, e.target.value)}
                      className="w-full px-2.5 py-1.5 bg-slate-50 border border-slate-200 rounded-lg text-xs font-medium text-slate-800"
                    >
                      {products.map((p) => (
                        <option key={p.id} value={p.id}>
                          {p.name} ({p.sku}) — In Stock: {p.currentStock}
                        </option>
                      ))}
                    </select>
                  </div>

                  {/* Quantity */}
                  <div className="w-24 shrink-0">
                    <label className="text-[10px] text-slate-400 font-semibold block mb-0.5">Quantity</label>
                    <input
                      type="number"
                      min="1"
                      value={item.quantity}
                      onChange={(e) => handleQuantityChange(index, Number(e.target.value))}
                      className="w-full px-2.5 py-1.5 bg-slate-50 border border-slate-200 rounded-lg text-xs font-bold text-slate-900 text-center"
                    />
                  </div>

                  {/* Unit Cost */}
                  <div className="w-28 shrink-0">
                    <label className="text-[10px] text-slate-400 font-semibold block mb-0.5">
                      Cost ({businessProfile.currency})
                    </label>
                    <input
                      type="number"
                      step="0.1"
                      value={item.unitCost}
                      onChange={(e) => handleCostChange(index, Number(e.target.value))}
                      className="w-full px-2.5 py-1.5 bg-slate-50 border border-slate-200 rounded-lg text-xs text-right font-medium text-slate-900"
                    />
                  </div>

                  {/* Total */}
                  <div className="w-28 shrink-0 text-right">
                    <label className="text-[10px] text-slate-400 font-semibold block mb-0.5">Subtotal</label>
                    <p className="font-bold text-slate-900 py-1.5">
                      {businessProfile.currency}{item.total.toLocaleString()}
                    </p>
                  </div>

                  {/* Remove */}
                  <button
                    type="button"
                    onClick={() => handleRemoveItem(index)}
                    className="p-1.5 rounded-lg text-slate-400 hover:text-red-600 hover:bg-red-50 shrink-0 mt-3 sm:mt-0"
                    title="Remove item"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
              ))}
            </div>
          </div>

          {/* Notes */}
          <div className="space-y-1">
            <label className="font-semibold text-slate-700">Internal Notes / Instructions</label>
            <input
              type="text"
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              placeholder="e.g. Deliver before 11 AM at rear unloading bay."
              className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl focus:ring-2 focus:ring-emerald-500/20 text-slate-800 text-xs"
            />
          </div>

          {/* Grand Total & Submit */}
          <div className="p-4 rounded-xl bg-slate-900 text-white flex items-center justify-between">
            <div>
              <span className="text-[11px] text-slate-400 block uppercase font-bold tracking-wider">
                Total Purchase Order Value
              </span>
              <p className="text-xl font-extrabold text-emerald-400 mt-0.5">
                {businessProfile.currency}{grandTotal.toLocaleString()}
              </p>
            </div>

            <div className="flex items-center gap-3">
              <button
                type="button"
                onClick={onClose}
                className="px-4 py-2 text-xs font-semibold text-slate-300 hover:text-white"
              >
                Cancel
              </button>
              <button
                type="submit"
                className="px-5 py-2 text-xs font-bold text-slate-950 bg-emerald-400 hover:bg-emerald-300 rounded-xl shadow-md transition-all"
              >
                Confirm & Create PO
              </button>
            </div>
          </div>
        </form>
      </div>
    </div>
  );
};
