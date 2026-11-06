import React, { useState, useRef, useEffect } from 'react';
import {
  Search,
  Bell,
  RefreshCw,
  Sparkles,
  AlertTriangle,
  CheckCircle2,
  Calendar,
  User,
  ArrowRight,
  ExternalLink,
  ChevronDown,
  Menu,
} from 'lucide-react';
import { useStore } from '../../context/StoreContext';
import { NavTab } from './Sidebar';

interface TopNavbarProps {
  collapsed: boolean;
  onSelectTab: (tab: NavTab) => void;
  onOpenAuth: () => void;
  onOpenOnboarding: () => void;
  searchQuery: string;
  onSearchChange: (q: string) => void;
  onToggleMobileMenu?: () => void;
}

export const TopNavbar: React.FC<TopNavbarProps> = ({
  collapsed,
  onSelectTab,
  onOpenAuth,
  onOpenOnboarding,
  searchQuery,
  onSearchChange,
  onToggleMobileMenu,
}) => {
  const {
    businessProfile,
    kpis,
    alerts,
    unreadAlertsCount,
    markAlertRead,
    markAllAlertsRead,
    resetToDemoData,
    isDemoMode,
    currentUser,
    logoutUser,
  } = useStore();

  const [notificationsOpen, setNotificationsOpen] = useState(false);
  const [profileOpen, setProfileOpen] = useState(false);
  const notifRef = useRef<HTMLDivElement>(null);
  const profileRef = useRef<HTMLDivElement>(null);

  // Close popovers on click outside
  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (notifRef.current && !notifRef.current.contains(e.target as Node)) {
        setNotificationsOpen(false);
      }
      if (profileRef.current && !profileRef.current.contains(e.target as Node)) {
        setProfileOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const todayStr = new Intl.DateTimeFormat('en-IN', {
    weekday: 'short',
    day: 'numeric',
    month: 'short',
    year: 'numeric',
  }).format(new Date());

  return (
    <header
      className={`sticky top-0 z-20 h-16 bg-white/95 backdrop-blur-md border-b border-slate-200/90 transition-all duration-300 flex items-center justify-between px-3 sm:px-6 ml-0 ${
        collapsed ? 'md:ml-20' : 'md:ml-64'
      }`}
    >
      {/* Left: Mobile Menu Toggle & Global Search */}
      <div className="flex items-center gap-2 sm:gap-4 flex-1 max-w-md">
        <button
          type="button"
          onClick={onToggleMobileMenu}
          className="p-2 -ml-1 text-slate-700 hover:text-slate-900 rounded-xl hover:bg-slate-100 md:hidden shrink-0 transition-colors"
          title="Open navigation menu"
          aria-label="Open menu"
        >
          <Menu className="w-5 h-5" />
        </button>

        <div
          onClick={() => onSelectTab('dashboard')}
          className="flex items-center gap-2 md:hidden cursor-pointer shrink-0"
        >
          <img
            src="/stocksense-logo.jpeg"
            alt="StockSense"
            className="w-7 h-7 rounded-lg object-cover border border-emerald-500/30"
          />
        </div>

        <div className="relative w-full">
          <Search className="w-4 h-4 absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => onSearchChange(e.target.value)}
            placeholder="Search products, SKUs, suppliers..."
            className="w-full pl-10 pr-4 py-2 text-xs sm:text-sm bg-slate-50 hover:bg-slate-100/70 focus:bg-white border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500 transition-all text-slate-800 placeholder-slate-400"
          />
          {searchQuery && (
            <button
              onClick={() => onSearchChange('')}
              className="absolute right-3 top-1/2 -translate-y-1/2 text-xs text-slate-400 hover:text-slate-600"
            >
              Clear
            </button>
          )}
        </div>
      </div>

      {/* Right Action Icons & Status */}
      <div className="flex items-center gap-2 sm:gap-3">
        {/* Date Display */}
        <div className="hidden lg:flex items-center gap-1.5 text-xs text-slate-500 font-medium bg-slate-100/80 px-2.5 py-1.5 rounded-lg border border-slate-200/60">
          <Calendar className="w-3.5 h-3.5 text-slate-400" />
          <span>{todayStr}</span>
        </div>

        {/* Currency & Quick Stock Status */}
        <div className="hidden sm:flex items-center gap-2">
          {kpis.criticalStockCount > 0 && (
            <button
              onClick={() => onSelectTab('alerts')}
              className="flex items-center gap-1 px-2.5 py-1 rounded-lg bg-red-50 text-red-700 border border-red-200 text-xs font-semibold animate-pulse hover:bg-red-100 transition-colors"
            >
              <AlertTriangle className="w-3.5 h-3.5" />
              <span>{kpis.criticalStockCount} Critical</span>
            </button>
          )}

          <div className="px-2.5 py-1 rounded-lg bg-emerald-50 text-emerald-800 border border-emerald-200/80 text-xs font-semibold">
            Currency: <span className="font-bold text-emerald-700">{businessProfile.currency} INR</span>
          </div>
        </div>

        {/* Reset Demo Data Button */}
        {isDemoMode && (
          <button
            onClick={() => {
              if (window.confirm('Reset all inventory, sales history, and orders to default Indian retail sample data?')) {
                resetToDemoData();
              }
            }}
            title="Reset to initial 27 sample products"
            className="hidden md:flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium text-slate-600 hover:text-slate-900 bg-slate-100 hover:bg-slate-200/80 border border-slate-200 rounded-lg transition-colors"
          >
            <RefreshCw className="w-3.5 h-3.5 text-slate-500" />
            <span>Reset Demo</span>
          </button>
        )}

        {/* AI Assistant Quick Pill */}
        <button
          onClick={() => onSelectTab('assistant')}
          className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold text-white bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-500 hover:to-teal-500 rounded-xl shadow-sm shadow-emerald-700/20 transition-all hover:scale-[1.02]"
        >
          <img src="/stocksense-logo.jpeg" alt="AI" className="w-4 h-4 rounded-full object-cover border border-emerald-300" />
          <span className="hidden sm:inline">Ask AI</span>
        </button>

        {/* Notifications Popover */}
        <div className="relative" ref={notifRef}>
          <button
            onClick={() => setNotificationsOpen(!notificationsOpen)}
            className="relative p-2 rounded-xl text-slate-600 hover:text-slate-900 hover:bg-slate-100 transition-colors"
            title="Alerts and notifications"
          >
            <Bell className="w-5 h-5" />
            {unreadAlertsCount > 0 && (
              <span className="absolute top-1.5 right-1.5 flex h-4 min-w-4 px-1 items-center justify-center rounded-full bg-red-500 text-[10px] font-bold text-white ring-2 ring-white">
                {unreadAlertsCount}
              </span>
            )}
          </button>

          {notificationsOpen && (
            <div className="absolute right-0 mt-2 w-80 sm:w-96 rounded-2xl bg-white border border-slate-200 shadow-xl shadow-slate-900/10 z-50 overflow-hidden animate-in fade-in zoom-in-95 duration-150">
              <div className="flex items-center justify-between px-4 py-3 border-b border-slate-100 bg-slate-50/70">
                <div className="flex items-center gap-2">
                  <span className="font-semibold text-sm text-slate-800">Alerts & Notifications</span>
                  {unreadAlertsCount > 0 && (
                    <span className="text-[11px] font-semibold bg-red-100 text-red-700 px-2 py-0.5 rounded-full">
                      {unreadAlertsCount} new
                    </span>
                  )}
                </div>
                {unreadAlertsCount > 0 && (
                  <button
                    onClick={markAllAlertsRead}
                    className="text-xs text-emerald-600 hover:text-emerald-700 font-medium"
                  >
                    Mark all read
                  </button>
                )}
              </div>

              <div className="max-h-80 overflow-y-auto divide-y divide-slate-100">
                {alerts.length === 0 ? (
                  <div className="py-8 text-center text-slate-400 text-xs">No active alerts. All systems healthy!</div>
                ) : (
                  alerts.slice(0, 5).map((alert) => (
                    <div
                      key={alert.id}
                      onClick={() => {
                        markAlertRead(alert.id);
                        setNotificationsOpen(false);
                        onSelectTab('alerts');
                      }}
                      className={`p-3.5 hover:bg-slate-50 cursor-pointer transition-colors flex items-start gap-3 ${
                        !alert.read ? 'bg-emerald-50/30' : ''
                      }`}
                    >
                      <div
                        className={`w-2 h-2 mt-1.5 rounded-full shrink-0 ${
                          alert.priority === 'critical'
                            ? 'bg-red-500 ring-2 ring-red-200'
                            : alert.priority === 'high'
                            ? 'bg-amber-500'
                            : 'bg-blue-500'
                        }`}
                      />
                      <div className="flex-1 min-w-0">
                        <p className="text-xs font-semibold text-slate-800 truncate">{alert.title}</p>
                        <p className="text-[11px] text-slate-500 line-clamp-2 mt-0.5">{alert.message}</p>
                      </div>
                    </div>
                  ))
                )}
              </div>

              <div className="p-2.5 border-t border-slate-100 bg-slate-50/60 text-center">
                <button
                  onClick={() => {
                    setNotificationsOpen(false);
                    onSelectTab('alerts');
                  }}
                  className="text-xs font-semibold text-emerald-600 hover:text-emerald-700 flex items-center justify-center gap-1 mx-auto"
                >
                  <span>View All Alerts Center</span>
                  <ArrowRight className="w-3.5 h-3.5" />
                </button>
              </div>
            </div>
          )}
        </div>

        {/* User Profile Popover */}
        <div className="relative" ref={profileRef}>
          <button
            onClick={() => setProfileOpen(!profileOpen)}
            className="flex items-center gap-2 p-1.5 rounded-xl hover:bg-slate-100 transition-colors"
          >
            <div className="w-8 h-8 rounded-full bg-slate-800 text-white flex items-center justify-center font-bold text-xs ring-2 ring-emerald-500/30">
              {currentUser?.name ? currentUser.name.charAt(0).toUpperCase() : 'U'}
            </div>
            <ChevronDown className="w-3.5 h-3.5 text-slate-400 hidden sm:block" />
          </button>

          {profileOpen && (
            <div className="absolute right-0 mt-2 w-64 rounded-2xl bg-white border border-slate-200 shadow-xl shadow-slate-900/10 z-50 overflow-hidden animate-in fade-in zoom-in-95 duration-150">
              <div className="px-4 py-3 border-b border-slate-100 bg-slate-50/60">
                <p className="text-xs font-semibold text-slate-900">{currentUser?.name || 'Store Owner'}</p>
                <p className="text-[11px] text-slate-500 truncate">{currentUser?.email || 'owner@store.com'}</p>
                <div className="mt-2 inline-flex items-center gap-1 text-[10px] font-semibold text-emerald-700 bg-emerald-100/80 px-2 py-0.5 rounded-md">
                  <CheckCircle2 className="w-3 h-3 text-emerald-600" />
                  <span>{businessProfile.businessName}</span>
                </div>
              </div>

              <div className="p-2 space-y-1">
                <button
                  onClick={() => {
                    setProfileOpen(false);
                    onOpenOnboarding();
                  }}
                  className="w-full flex items-center gap-2.5 px-3 py-2 text-xs text-slate-700 hover:bg-slate-100 rounded-lg text-left"
                >
                  <Sparkles className="w-3.5 h-3.5 text-emerald-600" />
                  <span>Setup Wizard / New Store</span>
                </button>
                <button
                  onClick={() => {
                    setProfileOpen(false);
                    onSelectTab('settings');
                  }}
                  className="w-full flex items-center gap-2.5 px-3 py-2 text-xs text-slate-700 hover:bg-slate-100 rounded-lg text-left"
                >
                  <User className="w-3.5 h-3.5 text-slate-500" />
                  <span>Account & Store Settings</span>
                </button>
              </div>

              <div className="p-2 border-t border-slate-100">
                {currentUser ? (
                  <button
                    onClick={() => {
                      logoutUser();
                      setProfileOpen(false);
                    }}
                    className="w-full flex items-center gap-2.5 px-3 py-2 text-xs text-red-600 hover:bg-red-50 rounded-lg text-left font-medium"
                  >
                    <span>Sign Out</span>
                  </button>
                ) : (
                  <button
                    onClick={() => {
                      setProfileOpen(false);
                      onOpenAuth();
                    }}
                    className="w-full flex items-center justify-center gap-2 py-2 text-xs font-semibold bg-emerald-600 text-white rounded-lg hover:bg-emerald-500"
                  >
                    <span>Sign In</span>
                  </button>
                )}
              </div>
            </div>
          )}
        </div>
      </div>
    </header>
  );
};
