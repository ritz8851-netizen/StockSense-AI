import React, { useState } from 'react';
import {
  Bell,
  AlertTriangle,
  XCircle,
  Clock,
  CheckCircle2,
  Trash2,
  ArrowRight,
  Filter,
  Check,
  ShoppingBag,
} from 'lucide-react';
import { useStore } from '../../context/StoreContext';
import { Alert, PriorityLevel } from '../../types';
import { NavTab } from '../layout/Sidebar';

interface AlertsViewProps {
  onSelectTab: (tab: NavTab) => void;
  onOpenCreatePO: (supplierId?: string, productId?: string) => void;
}

export const AlertsView: React.FC<AlertsViewProps> = ({ onSelectTab, onOpenCreatePO }) => {
  const { alerts, markAlertRead, dismissAlert, markAllAlertsRead, products } = useStore();

  const [priorityFilter, setPriorityFilter] = useState<string>('all');
  const [unreadOnly, setUnreadOnly] = useState<boolean>(false);

  const filteredAlerts = alerts.filter((a) => {
    const matchesPriority = priorityFilter === 'all' || a.priority === priorityFilter;
    const matchesUnread = !unreadOnly || !a.read;
    return matchesPriority && matchesUnread;
  });

  const getPriorityBadge = (priority: PriorityLevel) => {
    switch (priority) {
      case 'critical':
        return (
          <span className="text-[10px] uppercase font-bold tracking-wider px-2 py-0.5 rounded bg-red-100 text-red-700">
            Critical
          </span>
        );
      case 'high':
        return (
          <span className="text-[10px] uppercase font-bold tracking-wider px-2 py-0.5 rounded bg-amber-100 text-amber-800">
            High Warning
          </span>
        );
      case 'medium':
        return (
          <span className="text-[10px] uppercase font-bold tracking-wider px-2 py-0.5 rounded bg-blue-100 text-blue-800">
            Medium
          </span>
        );
      case 'low':
      default:
        return (
          <span className="text-[10px] uppercase font-bold tracking-wider px-2 py-0.5 rounded bg-slate-100 text-slate-700">
            Info
          </span>
        );
    }
  };

  return (
    <div className="p-4 sm:p-6 lg:p-8 space-y-6 max-w-7xl mx-auto">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <span className="text-xs font-semibold px-2.5 py-0.5 rounded-full bg-red-50 text-red-700 border border-red-200">
              Operations Watchdog
            </span>
            <span className="text-xs text-slate-400">Inventory Anomaly Detection</span>
          </div>
          <h1 className="text-2xl font-extrabold text-slate-900 tracking-tight mt-1">Alerts Center</h1>
          <p className="text-xs sm:text-sm text-slate-500 mt-0.5">
            Real-time notifications for imminent stockouts, breached safety thresholds, and PO deliveries.
          </p>
        </div>

        {alerts.length > 0 && (
          <button
            onClick={markAllAlertsRead}
            className="flex items-center gap-1.5 px-3.5 py-2 text-xs font-semibold text-slate-700 hover:text-slate-900 bg-white border border-slate-200 rounded-xl shadow-sm transition-colors"
          >
            <Check className="w-3.5 h-3.5 text-emerald-600" />
            <span>Mark All as Read</span>
          </button>
        )}
      </div>

      {/* Filter Bar */}
      <div className="bg-white p-4 rounded-2xl border border-slate-200/90 shadow-sm flex flex-wrap items-center justify-between gap-3 text-xs">
        <div className="flex flex-wrap items-center gap-3">
          <div className="flex items-center gap-2">
            <span className="font-semibold text-slate-600">Filter Priority:</span>
            <select
              value={priorityFilter}
              onChange={(e) => setPriorityFilter(e.target.value)}
              className="px-3 py-1.5 bg-slate-50 border border-slate-200 rounded-xl focus:ring-2 focus:ring-emerald-500/20 text-slate-800"
            >
              <option value="all">All Alerts ({alerts.length})</option>
              <option value="critical">Critical Only</option>
              <option value="high">High Warnings</option>
              <option value="medium">Medium / Overstock</option>
              <option value="low">Info</option>
            </select>
          </div>

          <label className="flex items-center gap-2 cursor-pointer select-none text-slate-700 font-medium">
            <input
              type="checkbox"
              checked={unreadOnly}
              onChange={(e) => setUnreadOnly(e.target.checked)}
              className="rounded text-emerald-600 focus:ring-emerald-500 w-3.5 h-3.5"
            />
            <span>Unread Only</span>
          </label>
        </div>

        <span className="text-slate-400">
          Showing <strong>{filteredAlerts.length}</strong> alerts
        </span>
      </div>

      {/* Alerts List */}
      <div className="space-y-3">
        {filteredAlerts.length === 0 ? (
          <div className="bg-white p-12 rounded-2xl border border-slate-200/90 shadow-sm text-center space-y-2">
            <CheckCircle2 className="w-10 h-10 text-emerald-500 mx-auto" />
            <h3 className="text-sm font-bold text-slate-800">All Systems Clear!</h3>
            <p className="text-xs text-slate-400 max-w-sm mx-auto">
              There are no active alerts matching your current filter. Your store inventory is in healthy alignment.
            </p>
          </div>
        ) : (
          filteredAlerts.map((alert) => {
            const product = alert.productId ? products.find((p) => p.id === alert.productId) : null;
            return (
              <div
                key={alert.id}
                className={`p-4 sm:p-5 rounded-2xl border transition-all flex flex-col sm:flex-row sm:items-center justify-between gap-4 ${
                  !alert.read
                    ? 'bg-white border-emerald-300 shadow-sm shadow-emerald-500/5'
                    : 'bg-white/80 border-slate-200/80'
                }`}
              >
                <div className="flex items-start gap-3.5 min-w-0">
                  <div
                    className={`w-9 h-9 rounded-xl flex items-center justify-center shrink-0 mt-0.5 ${
                      alert.priority === 'critical'
                        ? 'bg-red-50 text-red-600'
                        : alert.priority === 'high'
                        ? 'bg-amber-50 text-amber-600'
                        : 'bg-blue-50 text-blue-600'
                    }`}
                  >
                    {alert.priority === 'critical' ? (
                      <XCircle className="w-5 h-5" />
                    ) : alert.priority === 'high' ? (
                      <AlertTriangle className="w-5 h-5" />
                    ) : (
                      <Clock className="w-5 h-5" />
                    )}
                  </div>

                  <div className="min-w-0 space-y-1">
                    <div className="flex flex-wrap items-center gap-2">
                      {getPriorityBadge(alert.priority)}
                      <h4 className="text-xs sm:text-sm font-bold text-slate-900">{alert.title}</h4>
                      {!alert.read && (
                        <span className="w-2 h-2 rounded-full bg-emerald-500" title="Unread" />
                      )}
                    </div>
                    <p className="text-xs text-slate-600 leading-relaxed max-w-2xl">{alert.message}</p>
                    <span className="text-[11px] text-slate-400 block">
                      {new Date(alert.createdAt).toLocaleString()}
                    </span>
                  </div>
                </div>

                {/* Right Action buttons */}
                <div className="flex items-center gap-2 self-end sm:self-center shrink-0">
                  {product && (
                    <button
                      onClick={() => onOpenCreatePO(product.supplierId, product.id)}
                      className="flex items-center gap-1 px-3 py-1.5 text-xs font-semibold rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white shadow-sm transition-colors"
                    >
                      <ShoppingBag className="w-3.5 h-3.5" />
                      <span>Reorder</span>
                    </button>
                  )}

                  {!alert.read && (
                    <button
                      onClick={() => markAlertRead(alert.id)}
                      className="px-2.5 py-1.5 text-xs font-medium text-slate-600 hover:text-slate-900 bg-slate-100 hover:bg-slate-200 rounded-lg transition-colors"
                    >
                      Mark Read
                    </button>
                  )}

                  <button
                    onClick={() => dismissAlert(alert.id)}
                    className="p-1.5 text-slate-400 hover:text-red-600 hover:bg-red-50 rounded-lg transition-colors"
                    title="Dismiss Alert"
                  >
                    <Trash2 className="w-3.5 h-3.5" />
                  </button>
                </div>
              </div>
            );
          })
        )}
      </div>
    </div>
  );
};
