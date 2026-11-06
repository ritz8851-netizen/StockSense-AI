import React, { useState } from 'react';
import {
  Settings,
  Store,
  Sliders,
  Database,
  RefreshCw,
  Trash2,
  Download,
  CheckCircle2,
  ShieldCheck,
  Globe,
  IndianRupee,
} from 'lucide-react';
import { useStore } from '../../context/StoreContext';

export const SettingsView: React.FC = () => {
  const {
    businessProfile,
    updateBusinessProfile,
    userSettings,
    updateUserSettings,
    resetToDemoData,
    clearToFreshStore,
    isDemoMode,
  } = useStore();

  const [businessName, setBusinessName] = useState(businessProfile.businessName);
  const [businessType, setBusinessType] = useState(businessProfile.businessType);
  const [currency, setCurrency] = useState(businessProfile.currency);
  const [location, setLocation] = useState(businessProfile.location);
  const [timezone, setTimezone] = useState(businessProfile.timezone);

  const [leadBuffer, setLeadBuffer] = useState(userSettings.leadTimeBufferDays);
  const [overstockDays, setOverstockDays] = useState(userSettings.overstockDaysThreshold);

  const [savedSuccess, setSavedSuccess] = useState(false);

  const handleSaveProfile = (e: React.FormEvent) => {
    e.preventDefault();
    updateBusinessProfile({
      businessName,
      businessType,
      currency,
      location,
      timezone,
    });
    updateUserSettings({
      leadTimeBufferDays: Number(leadBuffer) || 2,
      overstockDaysThreshold: Number(overstockDays) || 60,
    });
    setSavedSuccess(true);
    setTimeout(() => setSavedSuccess(false), 2500);
  };

  const handleExportBackup = () => {
    const backup = {
      businessProfile,
      userSettings,
      exportedAt: new Date().toISOString(),
      note: 'StockSense JSON Backup',
    };
    const dataStr = 'data:text/json;charset=utf-8,' + encodeURIComponent(JSON.stringify(backup, null, 2));
    const downloadAnchor = document.createElement('a');
    downloadAnchor.setAttribute('href', dataStr);
    downloadAnchor.setAttribute('download', `StockSense_Backup_${Date.now()}.json`);
    document.body.appendChild(downloadAnchor);
    downloadAnchor.click();
    downloadAnchor.remove();
  };

  return (
    <div className="p-4 sm:p-6 lg:p-8 space-y-6 max-w-4xl mx-auto">
      {/* Header */}
      <div>
        <h1 className="text-2xl font-extrabold text-slate-900 tracking-tight">Settings & Preferences</h1>
        <p className="text-xs sm:text-sm text-slate-500 mt-0.5">
          Configure business metadata, currency preferences, safety stock thresholds, and cloud synchronization.
        </p>
      </div>

      {savedSuccess && (
        <div className="p-4 rounded-xl bg-emerald-50 border border-emerald-200 text-emerald-800 text-xs font-semibold flex items-center gap-2 animate-in fade-in">
          <CheckCircle2 className="w-4 h-4 text-emerald-600" />
          <span>Your store profile and forecasting settings have been updated successfully!</span>
        </div>
      )}

      {/* Profile Form */}
      <form onSubmit={handleSaveProfile} className="bg-white p-6 rounded-2xl border border-slate-200/90 shadow-sm space-y-5 text-xs">
        <div className="flex items-center gap-2.5 pb-4 border-b border-slate-100">
          <div className="w-9 h-9 rounded-xl bg-emerald-100 text-emerald-700 flex items-center justify-center">
            <Store className="w-5 h-5" />
          </div>
          <div>
            <h2 className="text-sm font-bold text-slate-900">Store Profile</h2>
            <p className="text-[11px] text-slate-500">Business identification and local currency parameters</p>
          </div>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div className="space-y-1">
            <label className="font-semibold text-slate-700">Business Name *</label>
            <input
              type="text"
              value={businessName}
              onChange={(e) => setBusinessName(e.target.value)}
              className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl focus:bg-white focus:ring-2 focus:ring-emerald-500/20 text-slate-900 text-xs font-semibold"
            />
          </div>

          <div className="space-y-1">
            <label className="font-semibold text-slate-700">Business Type / Industry</label>
            <select
              value={businessType}
              onChange={(e) => setBusinessType(e.target.value)}
              className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl focus:bg-white focus:ring-2 focus:ring-emerald-500/20 text-slate-900 text-xs"
            >
              <option value="Supermarket & Retail Grocer">Supermarket & Retail Grocer</option>
              <option value="Pharmacy & Medical Store">Pharmacy & Medical Store</option>
              <option value="Wholesale Distributor">Wholesale Distributor</option>
              <option value="E-Commerce & Online Seller">E-Commerce & Online Seller</option>
              <option value="Warehouse & Logistics Depot">Warehouse & Logistics Depot</option>
              <option value="Hardware & Electronics">Hardware & Electronics</option>
            </select>
          </div>

          <div className="space-y-1">
            <label className="font-semibold text-slate-700">Currency Symbol</label>
            <select
              value={currency}
              onChange={(e) => setCurrency(e.target.value)}
              className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl focus:bg-white focus:ring-2 focus:ring-emerald-500/20 text-slate-900 text-xs font-bold"
            >
              <option value="₹">₹ (Indian Rupee - INR)</option>
              <option value="$">$ (US Dollar - USD)</option>
              <option value="€">€ (Euro - EUR)</option>
              <option value="£">£ (British Pound - GBP)</option>
              <option value="د.إ">AED (UAE Dirham)</option>
            </select>
          </div>

          <div className="space-y-1">
            <label className="font-semibold text-slate-700">Physical Store Location</label>
            <input
              type="text"
              value={location}
              onChange={(e) => setLocation(e.target.value)}
              placeholder="City, State"
              className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl focus:bg-white focus:ring-2 focus:ring-emerald-500/20 text-slate-900 text-xs"
            />
          </div>

          <div className="space-y-1 sm:col-span-2">
            <label className="font-semibold text-slate-700">Operational Timezone</label>
            <input
              type="text"
              value={timezone}
              onChange={(e) => setTimezone(e.target.value)}
              className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl focus:bg-white focus:ring-2 focus:ring-emerald-500/20 text-slate-900 text-xs font-mono"
            />
          </div>
        </div>

        {/* Algorithm Fine-tuning */}
        <div className="pt-4 border-t border-slate-100 space-y-3">
          <div className="flex items-center gap-2">
            <Sliders className="w-4 h-4 text-emerald-600" />
            <h3 className="text-xs font-bold text-slate-900 uppercase tracking-wider">
              Forecasting Algorithm Parameters
            </h3>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div className="space-y-1">
              <label className="font-semibold text-slate-700">
                Supplier Buffer Window (Days)
              </label>
              <input
                type="number"
                min="0"
                max="14"
                value={leadBuffer}
                onChange={(e) => setLeadBuffer(Number(e.target.value))}
                className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl focus:bg-white focus:ring-2 focus:ring-emerald-500/20 text-slate-900 text-xs"
              />
              <span className="text-[10px] text-slate-400 block">
                Additional grace days added to supplier lead time to prevent stockout delays.
              </span>
            </div>

            <div className="space-y-1">
              <label className="font-semibold text-slate-700">
                Overstock Warning Threshold (Days of Supply)
              </label>
              <input
                type="number"
                min="30"
                max="180"
                value={overstockDays}
                onChange={(e) => setOverstockDays(Number(e.target.value))}
                className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl focus:bg-white focus:ring-2 focus:ring-emerald-500/20 text-slate-900 text-xs"
              />
              <span className="text-[10px] text-slate-400 block">
                Flag items with stock exceeding this number of days as capital lock.
              </span>
            </div>
          </div>
        </div>

        <div className="pt-4 border-t border-slate-100 flex justify-end">
          <button
            type="submit"
            className="px-5 py-2 text-xs font-bold text-white bg-emerald-600 hover:bg-emerald-500 rounded-xl shadow-sm transition-all"
          >
            Save Settings Changes
          </button>
        </div>
      </form>

      {/* Database & Cloud Sync Section */}
      <div className="bg-white p-6 rounded-2xl border border-slate-200/90 shadow-sm space-y-4 text-xs">
        <div className="flex items-center gap-2.5 pb-3 border-b border-slate-100">
          <div className="w-9 h-9 rounded-xl bg-blue-100 text-blue-700 flex items-center justify-center">
            <Database className="w-5 h-5" />
          </div>
          <div>
            <h2 className="text-sm font-bold text-slate-900">Database & Cloud Persistence</h2>
            <p className="text-[11px] text-slate-500">Firebase Firestore and local storage state</p>
          </div>
        </div>

        <div className="p-4 rounded-xl bg-slate-50 border border-slate-200 space-y-2">
          <div className="flex items-center gap-2 text-emerald-700 font-bold">
            <ShieldCheck className="w-4 h-4" />
            <span>Persistent Local Storage Active</span>
          </div>
          <p className="text-[11px] text-slate-600 leading-relaxed">
            All your products, purchase orders, sales transactions, and settings automatically persist in your browser across sessions.
          </p>
          <p className="text-[11px] text-slate-500">
            To connect to a dedicated cloud <strong>Firebase Firestore</strong> database, provision a project via Google Cloud or AI Studio settings. The app includes complete data blueprints and schema rules.
          </p>
        </div>

        <div className="pt-2 flex flex-wrap items-center gap-3">
          <button
            onClick={handleExportBackup}
            className="flex items-center gap-1.5 px-3.5 py-2 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-800 font-semibold"
          >
            <Download className="w-3.5 h-3.5 text-slate-600" />
            <span>Export Store JSON Backup</span>
          </button>

          <button
            onClick={() => {
              if (window.confirm('Reset all inventory, sales history, and orders to the realistic 27 Indian retail sample products?')) {
                resetToDemoData();
                alert('Store reset to initial Indian retail sample dataset!');
              }
            }}
            className="flex items-center gap-1.5 px-3.5 py-2 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-800 font-semibold"
          >
            <RefreshCw className="w-3.5 h-3.5 text-emerald-600" />
            <span>Reset Demo Store (27 SKUs)</span>
          </button>

          <button
            onClick={() => {
              if (window.confirm('Clear all sample data and start with an empty store catalog?')) {
                clearToFreshStore();
                alert('Switched to clean blank store. You can now add your own products or import via CSV!');
              }
            }}
            className="flex items-center gap-1.5 px-3.5 py-2 rounded-xl bg-red-50 hover:bg-red-100 text-red-700 font-semibold border border-red-200"
          >
            <Trash2 className="w-3.5 h-3.5 text-red-600" />
            <span>Clear to Fresh Empty Store</span>
          </button>
        </div>
      </div>
    </div>
  );
};
