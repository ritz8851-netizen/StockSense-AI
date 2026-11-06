import React, { useState } from 'react';
import {
  Truck,
  Plus,
  Search,
  Phone,
  Mail,
  MapPin,
  Clock,
  Star,
  Edit2,
  Trash2,
  ShoppingBag,
} from 'lucide-react';
import { useStore } from '../../context/StoreContext';
import { Supplier } from '../../types';
import { SupplierFormModal } from './SupplierFormModal';

interface SuppliersViewProps {
  onOpenCreatePO: (supplierId?: string) => void;
}

export const SuppliersView: React.FC<SuppliersViewProps> = ({ onOpenCreatePO }) => {
  const { suppliers, products, purchaseOrders, deleteSupplier, businessProfile } = useStore();

  const [searchQuery, setSearchQuery] = useState('');
  const [modalSupplier, setModalSupplier] = useState<Supplier | null | undefined>(undefined);

  const filteredSuppliers = suppliers.filter((s) => {
    return (
      s.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      s.contactPerson.toLowerCase().includes(searchQuery.toLowerCase()) ||
      s.categories.some((c) => c.toLowerCase().includes(searchQuery.toLowerCase()))
    );
  });

  return (
    <div className="p-4 sm:p-6 lg:p-8 space-y-6 max-w-7xl mx-auto">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-extrabold text-slate-900 tracking-tight">Supplier Directory</h1>
          <p className="text-xs sm:text-sm text-slate-500 mt-0.5">
            Manage your distributor partners, verify delivery lead times, and track order fulfillment.
          </p>
        </div>

        <button
          onClick={() => setModalSupplier(null)}
          className="flex items-center gap-1.5 px-4 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white font-bold text-xs shadow-sm transition-all"
        >
          <Plus className="w-4 h-4 stroke-[2.5]" />
          <span>Add New Supplier</span>
        </button>
      </div>

      {/* Search Bar */}
      <div className="bg-white p-4 rounded-2xl border border-slate-200/90 shadow-sm flex items-center justify-between gap-4">
        <div className="relative flex-1 max-w-md">
          <Search className="w-4 h-4 absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Search suppliers by name, contact, category..."
            className="w-full pl-10 pr-4 py-2 bg-slate-50 border border-slate-200 rounded-xl focus:ring-2 focus:ring-emerald-500/20 text-slate-800 text-xs sm:text-sm"
          />
        </div>

        <span className="text-xs text-slate-500 hidden sm:inline">
          <strong>{filteredSuppliers.length}</strong> active vendors
        </span>
      </div>

      {/* Supplier Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
        {filteredSuppliers.map((sup) => {
          const supProducts = products.filter((p) => p.supplierId === sup.id);
          const supPOs = purchaseOrders.filter((po) => po.supplierId === sup.id);
          const totalSpend = supPOs
            .filter((po) => po.status === 'Received')
            .reduce((sum, po) => sum + po.totalAmount, 0);

          return (
            <div
              key={sup.id}
              className="bg-white rounded-2xl border border-slate-200/90 shadow-sm hover:shadow-md transition-all p-5 flex flex-col justify-between"
            >
              <div className="space-y-3">
                {/* Header with Star Rating */}
                <div className="flex items-start justify-between gap-2">
                  <div className="flex items-center gap-2.5">
                    <div className="w-10 h-10 rounded-xl bg-emerald-50 text-emerald-700 flex items-center justify-center font-bold text-sm shrink-0 border border-emerald-100">
                      <Truck className="w-5 h-5" />
                    </div>
                    <div>
                      <h3 className="font-bold text-slate-900 text-sm leading-tight">{sup.name}</h3>
                      <p className="text-xs text-slate-500">{sup.contactPerson}</p>
                    </div>
                  </div>

                  <div className="flex items-center gap-1 bg-amber-50 px-2 py-0.5 rounded-lg border border-amber-200 text-amber-800 text-xs font-bold">
                    <Star className="w-3 h-3 fill-amber-400 text-amber-500" />
                    <span>{sup.rating}</span>
                  </div>
                </div>

                {/* Contact details */}
                <div className="space-y-1.5 text-xs text-slate-600 pt-2 border-t border-slate-100">
                  <div className="flex items-center gap-2 truncate">
                    <Phone className="w-3.5 h-3.5 text-slate-400 shrink-0" />
                    <span>{sup.phone}</span>
                  </div>
                  <div className="flex items-center gap-2 truncate">
                    <Mail className="w-3.5 h-3.5 text-slate-400 shrink-0" />
                    <span className="truncate">{sup.email}</span>
                  </div>
                  <div className="flex items-center gap-2 truncate">
                    <MapPin className="w-3.5 h-3.5 text-slate-400 shrink-0" />
                    <span className="truncate">{sup.address}</span>
                  </div>
                </div>

                {/* Categories */}
                <div className="flex flex-wrap gap-1.5 pt-1">
                  {sup.categories.map((cat) => (
                    <span key={cat} className="text-[10px] font-semibold bg-slate-100 text-slate-700 px-2 py-0.5 rounded-md">
                      {cat}
                    </span>
                  ))}
                </div>

                {/* Performance Box */}
                <div className="grid grid-cols-3 gap-2 p-3 bg-slate-50 rounded-xl border border-slate-100 text-center text-xs">
                  <div>
                    <span className="text-[10px] text-slate-400 font-bold block">Lead Time</span>
                    <strong className="text-slate-900 font-bold">{sup.leadTimeDays} Days</strong>
                  </div>
                  <div>
                    <span className="text-[10px] text-slate-400 font-bold block">SKUs Supplied</span>
                    <strong className="text-slate-900 font-bold">{supProducts.length}</strong>
                  </div>
                  <div>
                    <span className="text-[10px] text-slate-400 font-bold block">Orders</span>
                    <strong className="text-slate-900 font-bold">{supPOs.length}</strong>
                  </div>
                </div>

                {sup.notes && (
                  <p className="text-[11px] text-slate-500 italic bg-slate-50/60 p-2 rounded-lg line-clamp-2">
                    &quot;{sup.notes}&quot;
                  </p>
                )}
              </div>

              {/* Actions Footer */}
              <div className="pt-4 mt-3 border-t border-slate-100 flex items-center justify-between">
                <div className="flex items-center gap-1.5">
                  <button
                    onClick={() => setModalSupplier(sup)}
                    className="p-1.5 rounded-lg text-slate-400 hover:text-slate-700 hover:bg-slate-100"
                    title="Edit Supplier"
                  >
                    <Edit2 className="w-3.5 h-3.5" />
                  </button>
                  <button
                    onClick={() => {
                      if (window.confirm(`Delete supplier ${sup.name}?`)) {
                        deleteSupplier(sup.id);
                      }
                    }}
                    className="p-1.5 rounded-lg text-slate-400 hover:text-red-600 hover:bg-red-50"
                    title="Delete Supplier"
                  >
                    <Trash2 className="w-3.5 h-3.5" />
                  </button>
                </div>

                <button
                  onClick={() => onOpenCreatePO(sup.id)}
                  className="flex items-center gap-1 px-3 py-1.5 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white font-semibold text-xs shadow-sm transition-colors"
                >
                  <ShoppingBag className="w-3 h-3" />
                  <span>Order Stock</span>
                </button>
              </div>
            </div>
          );
        })}
      </div>

      {/* Supplier Modal */}
      {modalSupplier !== undefined && (
        <SupplierFormModal
          supplier={modalSupplier}
          onClose={() => setModalSupplier(undefined)}
        />
      )}
    </div>
  );
};
