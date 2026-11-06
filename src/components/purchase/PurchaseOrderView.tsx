import React, { useState } from 'react';
import {
  Truck,
  Plus,
  Search,
  CheckCircle2,
  Clock,
  XCircle,
  FileText,
  IndianRupee,
  Eye,
  AlertCircle,
  RotateCcw,
} from 'lucide-react';
import { useStore } from '../../context/StoreContext';
import { PurchaseOrder, PurchaseOrderStatus } from '../../types';

interface PurchaseOrderViewProps {
  onOpenCreatePO: () => void;
}

export const PurchaseOrderView: React.FC<PurchaseOrderViewProps> = ({ onOpenCreatePO }) => {
  const { purchaseOrders, suppliers, businessProfile, receivePurchaseOrder, cancelPurchaseOrder } = useStore();

  const [statusFilter, setStatusFilter] = useState<string>('all');
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedPO, setSelectedPO] = useState<PurchaseOrder | null>(null);

  const filteredPOs = purchaseOrders
    .filter((po) => {
      const matchesStatus = statusFilter === 'all' || po.status === statusFilter;
      const matchesSearch =
        po.orderNumber.toLowerCase().includes(searchQuery.toLowerCase()) ||
        po.supplierName.toLowerCase().includes(searchQuery.toLowerCase()) ||
        po.items.some((item) => item.productName.toLowerCase().includes(searchQuery.toLowerCase()));
      return matchesStatus && matchesSearch;
    })
    .sort((a, b) => new Date(b.orderDate).getTime() - new Date(a.orderDate).getTime());

  const handleReceive = (id: string, orderNumber: string) => {
    if (window.confirm(`Mark purchase order ${orderNumber} as RECEIVED? This will increment product inventory quantities.`)) {
      const success = receivePurchaseOrder(id);
      if (success) {
        alert(`Order ${orderNumber} received successfully! Inventory levels updated.`);
      }
    }
  };

  const handleCancel = (id: string, orderNumber: string) => {
    if (window.confirm(`Cancel purchase order ${orderNumber}?`)) {
      cancelPurchaseOrder(id);
    }
  };

  const renderStatusBadge = (status: PurchaseOrderStatus) => {
    switch (status) {
      case 'Received':
        return (
          <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-bold bg-emerald-100 text-emerald-800">
            <CheckCircle2 className="w-3 h-3" />
            Received
          </span>
        );
      case 'Ordered':
        return (
          <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-bold bg-blue-100 text-blue-800">
            <Truck className="w-3 h-3" />
            Ordered
          </span>
        );
      case 'Pending':
        return (
          <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-bold bg-amber-100 text-amber-800">
            <Clock className="w-3 h-3" />
            Pending Approval
          </span>
        );
      case 'Draft':
        return (
          <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-bold bg-slate-100 text-slate-700">
            Draft
          </span>
        );
      case 'Cancelled':
      default:
        return (
          <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-bold bg-red-100 text-red-700">
            <XCircle className="w-3 h-3" />
            Cancelled
          </span>
        );
    }
  };

  return (
    <div className="p-4 sm:p-6 lg:p-8 space-y-6 max-w-7xl mx-auto">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-extrabold text-slate-900 tracking-tight">Purchase Orders</h1>
          <p className="text-xs sm:text-sm text-slate-500 mt-0.5">
            Manage vendor replenishments, track in-transit stock, and inspect delivery receipts.
          </p>
        </div>

        <button
          onClick={onOpenCreatePO}
          className="flex items-center gap-1.5 px-4 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white font-bold text-xs shadow-sm transition-all"
        >
          <Plus className="w-4 h-4 stroke-[2.5]" />
          <span>Create Purchase Order</span>
        </button>
      </div>

      {/* Filter Bar */}
      <div className="bg-white p-4 rounded-2xl border border-slate-200/90 shadow-sm flex flex-col sm:flex-row sm:items-center justify-between gap-3 text-xs">
        <div className="relative flex-1 max-w-sm">
          <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Search PO #, vendor, or item name..."
            className="w-full pl-9 pr-3 py-2 bg-slate-50 border border-slate-200 rounded-xl focus:ring-2 focus:ring-emerald-500/20 text-slate-800"
          />
        </div>

        <div className="flex items-center gap-2">
          <span className="font-semibold text-slate-500">Status:</span>
          <select
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
            className="px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl focus:ring-2 focus:ring-emerald-500/20 text-slate-800"
          >
            <option value="all">All Orders ({purchaseOrders.length})</option>
            <option value="Ordered">Ordered (In Transit)</option>
            <option value="Received">Received</option>
            <option value="Draft">Draft</option>
            <option value="Pending">Pending</option>
            <option value="Cancelled">Cancelled</option>
          </select>
        </div>
      </div>

      {/* Orders Table */}
      <div className="bg-white rounded-2xl border border-slate-200/90 shadow-sm overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className="bg-slate-50 text-slate-600 uppercase font-bold text-[10px] border-b border-slate-200">
              <tr>
                <th className="py-3 px-4">PO Number</th>
                <th className="py-3 px-4">Supplier</th>
                <th className="py-3 px-3">Order Date</th>
                <th className="py-3 px-3">Expected Delivery</th>
                <th className="py-3 px-3 text-center">Items Count</th>
                <th className="py-3 px-3 text-right">Total Amount</th>
                <th className="py-3 px-3">Status</th>
                <th className="py-3 px-4 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {filteredPOs.length === 0 ? (
                <tr>
                  <td colSpan={8} className="py-12 text-center text-slate-400">
                    No purchase orders found matching your criteria.
                  </td>
                </tr>
              ) : (
                filteredPOs.map((po) => (
                  <tr key={po.id} className="hover:bg-slate-50/70 transition-colors">
                    <td className="py-3 px-4">
                      <span className="font-mono font-bold text-slate-900 bg-slate-100 px-2 py-0.5 rounded">
                        {po.orderNumber}
                      </span>
                    </td>

                    <td className="py-3 px-4 font-semibold text-slate-800">
                      {po.supplierName}
                    </td>

                    <td className="py-3 px-3 text-slate-500 whitespace-nowrap">
                      {po.orderDate}
                    </td>

                    <td className="py-3 px-3 text-slate-700 whitespace-nowrap font-medium">
                      {po.expectedDeliveryDate}
                    </td>

                    <td className="py-3 px-3 text-center font-bold text-slate-700">
                      {po.items.length} SKUs
                    </td>

                    <td className="py-3 px-3 text-right font-bold text-slate-900 whitespace-nowrap">
                      {businessProfile.currency}{po.totalAmount.toLocaleString()}
                    </td>

                    <td className="py-3 px-3 whitespace-nowrap">
                      {renderStatusBadge(po.status)}
                    </td>

                    <td className="py-3 px-4 text-right whitespace-nowrap">
                      <div className="flex items-center justify-end gap-2">
                        <button
                          onClick={() => setSelectedPO(po)}
                          className="px-2.5 py-1 text-xs font-semibold text-slate-600 hover:text-slate-900 bg-slate-100 hover:bg-slate-200 rounded-lg"
                        >
                          Details
                        </button>

                        {po.status !== 'Received' && po.status !== 'Cancelled' && (
                          <button
                            onClick={() => handleReceive(po.id, po.orderNumber)}
                            className="px-2.5 py-1 text-xs font-semibold text-white bg-emerald-600 hover:bg-emerald-500 rounded-lg shadow-sm"
                          >
                            Mark Received
                          </button>
                        )}

                        {po.status === 'Ordered' || po.status === 'Pending' || po.status === 'Draft' ? (
                          <button
                            onClick={() => handleCancel(po.id, po.orderNumber)}
                            className="p-1 text-slate-400 hover:text-red-600 rounded-lg hover:bg-red-50"
                            title="Cancel PO"
                          >
                            <XCircle className="w-4 h-4" />
                          </button>
                        ) : null}
                      </div>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* View PO Details Modal */}
      {selectedPO && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm animate-in fade-in">
          <div className="bg-white w-full max-w-2xl rounded-2xl shadow-2xl border border-slate-200 overflow-hidden flex flex-col max-h-[90vh]">
            <div className="px-6 py-4 border-b border-slate-100 flex items-center justify-between bg-slate-50">
              <div>
                <h3 className="text-base font-bold text-slate-900">{selectedPO.orderNumber}</h3>
                <p className="text-xs text-slate-500">Supplier: {selectedPO.supplierName}</p>
              </div>
              <button
                onClick={() => setSelectedPO(null)}
                className="p-1 rounded-lg text-slate-400 hover:text-slate-600"
              >
                &times;
              </button>
            </div>

            <div className="p-6 space-y-4 overflow-y-auto text-xs">
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 p-3 rounded-xl bg-slate-50 border border-slate-200">
                <div>
                  <span className="text-[10px] text-slate-400 uppercase font-bold">Status</span>
                  <div className="mt-0.5">{renderStatusBadge(selectedPO.status)}</div>
                </div>
                <div>
                  <span className="text-[10px] text-slate-400 uppercase font-bold">Order Date</span>
                  <p className="font-semibold text-slate-800 mt-0.5">{selectedPO.orderDate}</p>
                </div>
                <div>
                  <span className="text-[10px] text-slate-400 uppercase font-bold">Expected Delivery</span>
                  <p className="font-semibold text-slate-800 mt-0.5">{selectedPO.expectedDeliveryDate}</p>
                </div>
                <div>
                  <span className="text-[10px] text-slate-400 uppercase font-bold">Total Amount</span>
                  <p className="font-bold text-emerald-700 mt-0.5">
                    {businessProfile.currency}{selectedPO.totalAmount.toLocaleString()}
                  </p>
                </div>
              </div>

              {selectedPO.notes && (
                <div className="p-3 bg-amber-50/70 border border-amber-200 rounded-xl text-amber-900">
                  <span className="font-bold block text-[11px]">Order Notes:</span>
                  <p className="text-[11px] mt-0.5">{selectedPO.notes}</p>
                </div>
              )}

              <h4 className="font-bold text-slate-900 pt-2 border-t border-slate-100">Line Items</h4>
              <div className="border border-slate-200 rounded-xl overflow-hidden">
                <table className="w-full text-left text-xs">
                  <thead className="bg-slate-50 text-slate-600 font-bold border-b border-slate-200">
                    <tr>
                      <th className="py-2 px-3">Product Name</th>
                      <th className="py-2 px-3">SKU</th>
                      <th className="py-2 px-3 text-center">Quantity</th>
                      <th className="py-2 px-3 text-right">Unit Cost</th>
                      <th className="py-2 px-3 text-right">Subtotal</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100">
                    {selectedPO.items.map((item, idx) => (
                      <tr key={idx}>
                        <td className="py-2.5 px-3 font-medium text-slate-800">{item.productName}</td>
                        <td className="py-2.5 px-3 font-mono text-slate-500">{item.sku}</td>
                        <td className="py-2.5 px-3 text-center font-bold text-slate-900">{item.quantity}</td>
                        <td className="py-2.5 px-3 text-right text-slate-600">
                          {businessProfile.currency}{item.unitCost}
                        </td>
                        <td className="py-2.5 px-3 text-right font-bold text-slate-900">
                          {businessProfile.currency}{item.total.toLocaleString()}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>

            <div className="px-6 py-3 border-t border-slate-100 bg-slate-50 flex items-center justify-between">
              <span className="text-slate-400 text-[11px]">StockSense Purchase Order System</span>
              <button
                onClick={() => setSelectedPO(null)}
                className="px-4 py-1.5 text-xs font-semibold bg-slate-800 text-white rounded-xl hover:bg-slate-700"
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
