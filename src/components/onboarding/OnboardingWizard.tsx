import React, { useState } from 'react';
import {
  X,
  Store,
  Briefcase,
  IndianRupee,
  MapPin,
  Package,
  CheckCircle2,
  ArrowRight,
  ArrowLeft,
  Sparkles,
} from 'lucide-react';
import { useStore } from '../../context/StoreContext';

interface OnboardingWizardProps {
  onClose: () => void;
}

export const OnboardingWizard: React.FC<OnboardingWizardProps> = ({ onClose }) => {
  const { updateBusinessProfile, resetToDemoData, clearToFreshStore } = useStore();

  const [step, setStep] = useState(1);
  const [businessName, setBusinessName] = useState('My Retail Superstore');
  const [businessType, setBusinessType] = useState('Supermarket & Retail Grocer');
  const [currency, setCurrency] = useState('₹');
  const [location, setLocation] = useState('Bangalore, India');
  const [timezone, setTimezone] = useState('Asia/Kolkata (IST)');
  const [seedChoice, setSeedChoice] = useState<'sample' | 'blank'>('sample');

  const handleFinish = () => {
    updateBusinessProfile({
      businessName,
      businessType,
      currency,
      location,
      timezone,
    });

    if (seedChoice === 'sample') {
      resetToDemoData();
      updateBusinessProfile({ businessName, businessType, currency, location, timezone });
    } else {
      clearToFreshStore({ businessName, businessType, currency, location, timezone });
    }

    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/70 backdrop-blur-md animate-in fade-in duration-150">
      <div className="bg-white w-full max-w-xl rounded-3xl shadow-2xl border border-slate-200 overflow-hidden flex flex-col">
        {/* Header */}
        <div className="px-6 py-4 border-b border-slate-100 flex items-center justify-between bg-slate-50/70">
          <div className="flex items-center gap-2.5">
            <img src="/stocksense-logo.jpeg" alt="StockSense" className="w-6 h-6 rounded-lg object-cover border border-emerald-500/30" />
            <span className="text-xs font-bold uppercase tracking-wider text-slate-600">
              StockSense Wizard • Step {step} of 5
            </span>
          </div>

          <button
            onClick={onClose}
            className="text-xs text-slate-400 hover:text-slate-700 font-semibold"
          >
            Skip to Sample Dashboard
          </button>
        </div>

        {/* Step Progress Bar */}
        <div className="w-full h-1 bg-slate-100">
          <div
            style={{ width: `${(step / 5) * 100}%` }}
            className="h-full bg-emerald-500 transition-all duration-300"
          />
        </div>

        {/* Content Body */}
        <div className="p-6 sm:p-8 space-y-6 text-xs flex-1">
          {step === 1 && (
            <div className="space-y-4 animate-in fade-in">
              <div className="w-12 h-12 rounded-2xl bg-emerald-50 text-emerald-600 flex items-center justify-center">
                <Store className="w-6 h-6" />
              </div>
              <div>
                <h3 className="text-lg font-bold text-slate-900">What is your store name?</h3>
                <p className="text-xs text-slate-500 mt-1">
                  This will be shown on all reorder schedules, purchase orders, and PDF reports.
                </p>
              </div>

              <div className="space-y-1.5 pt-2">
                <label className="font-semibold text-slate-700">Business / Store Name</label>
                <input
                  type="text"
                  value={businessName}
                  onChange={(e) => setBusinessName(e.target.value)}
                  placeholder="e.g. Krishna Supermarket & Daily Needs"
                  className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl focus:bg-white focus:ring-2 focus:ring-emerald-500/20 text-sm font-semibold text-slate-900"
                />
              </div>
            </div>
          )}

          {step === 2 && (
            <div className="space-y-4 animate-in fade-in">
              <div className="w-12 h-12 rounded-2xl bg-blue-50 text-blue-600 flex items-center justify-center">
                <Briefcase className="w-6 h-6" />
              </div>
              <div>
                <h3 className="text-lg font-bold text-slate-900">Select your business type</h3>
                <p className="text-xs text-slate-500 mt-1">
                  Helps our forecasting engine calibrate replenishment frequencies and shelf-life buffers.
                </p>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5 pt-2">
                {[
                  'Supermarket & Retail Grocer',
                  'Pharmacy & Medical Store',
                  'Wholesale Distributor',
                  'E-Commerce & Online Seller',
                  'Warehouse & Logistics Depot',
                  'FMCG Packaged Goods',
                ].map((type) => (
                  <button
                    key={type}
                    type="button"
                    onClick={() => setBusinessType(type)}
                    className={`p-3.5 rounded-xl border text-left font-semibold transition-all ${
                      businessType === type
                        ? 'border-emerald-500 bg-emerald-50/50 text-emerald-900 ring-2 ring-emerald-500/20'
                        : 'border-slate-200 bg-slate-50 text-slate-700 hover:bg-slate-100'
                    }`}
                  >
                    {type}
                  </button>
                ))}
              </div>
            </div>
          )}

          {step === 3 && (
            <div className="space-y-4 animate-in fade-in">
              <div className="w-12 h-12 rounded-2xl bg-amber-50 text-amber-600 flex items-center justify-center">
                <IndianRupee className="w-6 h-6" />
              </div>
              <div>
                <h3 className="text-lg font-bold text-slate-900">Choose currency format</h3>
                <p className="text-xs text-slate-500 mt-1">
                  Default currency for purchase costs, inventory valuation, and sales revenue.
                </p>
              </div>

              <div className="grid grid-cols-2 gap-3 pt-2">
                {[
                  { symbol: '₹', name: 'INR — Indian Rupee' },
                  { symbol: '$', name: 'USD — US Dollar' },
                  { symbol: '€', name: 'EUR — Euro' },
                  { symbol: '£', name: 'GBP — British Pound' },
                ].map((c) => (
                  <button
                    key={c.symbol}
                    type="button"
                    onClick={() => setCurrency(c.symbol)}
                    className={`p-4 rounded-xl border text-center transition-all ${
                      currency === c.symbol
                        ? 'border-emerald-500 bg-emerald-50/50 text-emerald-900 ring-2 ring-emerald-500/20'
                        : 'border-slate-200 bg-slate-50 text-slate-700 hover:bg-slate-100'
                    }`}
                  >
                    <span className="text-2xl font-extrabold block text-slate-900">{c.symbol}</span>
                    <span className="text-xs font-semibold mt-1 block">{c.name}</span>
                  </button>
                ))}
              </div>
            </div>
          )}

          {step === 4 && (
            <div className="space-y-4 animate-in fade-in">
              <div className="w-12 h-12 rounded-2xl bg-purple-50 text-purple-600 flex items-center justify-center">
                <MapPin className="w-6 h-6" />
              </div>
              <div>
                <h3 className="text-lg font-bold text-slate-900">Location & Timezone</h3>
                <p className="text-xs text-slate-500 mt-1">
                  Accurate timezone synchronization for end-of-day sales rollups.
                </p>
              </div>

              <div className="space-y-3 pt-2">
                <div className="space-y-1">
                  <label className="font-semibold text-slate-700">City / Operational Hub</label>
                  <input
                    type="text"
                    value={location}
                    onChange={(e) => setLocation(e.target.value)}
                    placeholder="e.g. Bangalore, Karnataka"
                    className="w-full px-3 py-2.5 bg-slate-50 border border-slate-200 rounded-xl focus:bg-white focus:ring-2 focus:ring-emerald-500/20 text-xs font-semibold text-slate-900"
                  />
                </div>

                <div className="space-y-1">
                  <label className="font-semibold text-slate-700">Timezone</label>
                  <input
                    type="text"
                    value={timezone}
                    onChange={(e) => setTimezone(e.target.value)}
                    className="w-full px-3 py-2.5 bg-slate-50 border border-slate-200 rounded-xl font-mono text-xs text-slate-900"
                  />
                </div>
              </div>
            </div>
          )}

          {step === 5 && (
            <div className="space-y-4 animate-in fade-in">
              <div className="w-12 h-12 rounded-2xl bg-teal-50 text-teal-600 flex items-center justify-center">
                <Sparkles className="w-6 h-6" />
              </div>
              <div>
                <h3 className="text-lg font-bold text-slate-900">How would you like to start?</h3>
                <p className="text-xs text-slate-500 mt-1">
                  You can explore with rich Indian retail sample inventory or initialize a fresh blank catalog.
                </p>
              </div>

              <div className="space-y-3 pt-2">
                <div
                  onClick={() => setSeedChoice('sample')}
                  className={`p-4 rounded-2xl border cursor-pointer transition-all flex items-start gap-3.5 ${
                    seedChoice === 'sample'
                      ? 'border-emerald-500 bg-emerald-50/50 ring-2 ring-emerald-500/20'
                      : 'border-slate-200 hover:bg-slate-50'
                  }`}
                >
                  <div className="w-5 h-5 rounded-full border-2 border-emerald-600 flex items-center justify-center mt-0.5 shrink-0">
                    {seedChoice === 'sample' && <div className="w-2.5 h-2.5 rounded-full bg-emerald-600" />}
                  </div>
                  <div>
                    <h4 className="font-bold text-slate-900">Load 27 Indian Retail Sample Products (Recommended)</h4>
                    <p className="text-[11px] text-slate-500 mt-0.5">
                      Includes Daawat Basmati Rice, Fortune Oil, Amul Ghee, 90 days of daily sales, 5 suppliers, and live stockouts.
                    </p>
                  </div>
                </div>

                <div
                  onClick={() => setSeedChoice('blank')}
                  className={`p-4 rounded-2xl border cursor-pointer transition-all flex items-start gap-3.5 ${
                    seedChoice === 'blank'
                      ? 'border-emerald-500 bg-emerald-50/50 ring-2 ring-emerald-500/20'
                      : 'border-slate-200 hover:bg-slate-50'
                  }`}
                >
                  <div className="w-5 h-5 rounded-full border-2 border-emerald-600 flex items-center justify-center mt-0.5 shrink-0">
                    {seedChoice === 'blank' && <div className="w-2.5 h-2.5 rounded-full bg-emerald-600" />}
                  </div>
                  <div>
                    <h4 className="font-bold text-slate-900">Start with Empty Store</h4>
                    <p className="text-[11px] text-slate-500 mt-0.5">
                      Start completely clean. You can upload your own products or sales records via CSV.
                    </p>
                  </div>
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Footer Navigation */}
        <div className="px-6 py-4 border-t border-slate-100 bg-slate-50 flex items-center justify-between">
          {step > 1 ? (
            <button
              onClick={() => setStep(step - 1)}
              className="flex items-center gap-1 text-xs font-semibold text-slate-600 hover:text-slate-900"
            >
              <ArrowLeft className="w-3.5 h-3.5" />
              <span>Back</span>
            </button>
          ) : (
            <span />
          )}

          {step < 5 ? (
            <button
              onClick={() => setStep(step + 1)}
              className="flex items-center gap-1.5 px-5 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white font-bold text-xs shadow-sm transition-all"
            >
              <span>Continue</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </button>
          ) : (
            <button
              onClick={handleFinish}
              className="flex items-center gap-1.5 px-6 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white font-extrabold text-xs shadow-md transition-all"
            >
              <span>Launch StockSense</span>
              <CheckCircle2 className="w-4 h-4" />
            </button>
          )}
        </div>
      </div>
    </div>
  );
};
