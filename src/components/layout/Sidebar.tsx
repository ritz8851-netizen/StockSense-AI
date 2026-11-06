import React from 'react';
import {
  LayoutDashboard,
  Package,
  TrendingUp,
  ShoppingBag,
  BarChart3,
  Truck,
  Bell,
  Sparkles,
  FileText,
  Settings,
  ChevronLeft,
  ChevronRight,
  Store,
  Layers,
  ArrowUpRight,
  LogOut,
  HelpCircle,
  X,
} from 'lucide-react';
import { useStore } from '../../context/StoreContext';

export type NavTab =
  | 'dashboard'
  | 'inventory'
  | 'forecast'
  | 'planning'
  | 'sales'
  | 'suppliers'
  | 'alerts'
  | 'assistant'
  | 'reports'
  | 'settings';

interface SidebarProps {
  currentTab: NavTab;
  onSelectTab: (tab: NavTab) => void;
  collapsed: boolean;
  onToggleCollapse: () => void;
  onOpenAuth: () => void;
  mobileOpen?: boolean;
  onCloseMobile?: () => void;
}

export const Sidebar: React.FC<SidebarProps> = ({
  currentTab,
  onSelectTab,
  collapsed,
  onToggleCollapse,
  onOpenAuth,
  mobileOpen = false,
  onCloseMobile,
}) => {
  const { businessProfile, unreadAlertsCount, isDemoMode, currentUser, logoutUser } = useStore();

  const navItems: Array<{ id: NavTab; label: string; icon: React.ElementType; badge?: number }> = [
    { id: 'dashboard', label: 'Dashboard', icon: LayoutDashboard },
    { id: 'inventory', label: 'Inventory', icon: Package },
    { id: 'forecast', label: 'Demand Forecast', icon: TrendingUp },
    { id: 'planning', label: 'Purchase Planning', icon: ShoppingBag },
    { id: 'sales', label: 'Sales Analytics', icon: BarChart3 },
    { id: 'suppliers', label: 'Suppliers', icon: Truck },
    { id: 'alerts', label: 'Alerts', icon: Bell, badge: unreadAlertsCount },
    { id: 'assistant', label: 'AI Assistant', icon: Sparkles },
    { id: 'reports', label: 'Reports', icon: FileText },
    { id: 'settings', label: 'Settings', icon: Settings },
  ];

  const handleItemClick = (id: NavTab) => {
    onSelectTab(id);
    if (onCloseMobile) {
      onCloseMobile();
    }
  };

  return (
    <>
      {/* Mobile Backdrop Overlay */}
      {mobileOpen && (
        <div
          onClick={onCloseMobile}
          className="fixed inset-0 bg-slate-950/70 z-40 backdrop-blur-xs md:hidden animate-in fade-in duration-200"
          aria-hidden="true"
        />
      )}

      <aside
        className={`fixed top-0 bottom-0 left-0 z-50 md:z-30 flex flex-col bg-slate-900 border-r border-slate-800 transition-all duration-300 ${
          collapsed ? 'md:w-20' : 'md:w-64'
        } w-72 max-w-[85vw] ${
          mobileOpen ? 'translate-x-0 shadow-2xl' : '-translate-x-full md:translate-x-0'
        }`}
      >
        {/* Brand Header */}
        <div className="flex items-center justify-between h-16 px-4 border-b border-slate-800/80">
          <div
            onClick={() => handleItemClick('dashboard')}
            className="flex items-center gap-3 cursor-pointer group overflow-hidden"
          >
            <img
              src="/stocksense-logo.jpeg"
              alt="StockSense Logo"
              className="w-10 h-10 rounded-xl object-cover shadow-md shadow-emerald-950/40 shrink-0 border border-emerald-500/30 group-hover:scale-105 transition-transform"
            />

            <div className={`flex flex-col min-w-0 ${collapsed ? 'md:hidden' : 'flex'}`}>
              <div className="flex items-center gap-1.5">
                <span className="font-bold text-lg text-white tracking-tight">StockSense</span>
                {isDemoMode && (
                  <span className="text-[10px] font-semibold bg-emerald-500/20 text-emerald-300 px-1.5 py-0.5 rounded border border-emerald-500/30">
                    DEMO
                  </span>
                )}
              </div>
              <span className="text-[11px] text-slate-400 truncate">Predict Smarter. Stock Better.</span>
            </div>
          </div>

          <div className="flex items-center gap-1">
            {/* Mobile close button */}
            <button
              onClick={onCloseMobile}
              className="md:hidden flex items-center justify-center w-8 h-8 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800 transition-colors"
              title="Close menu"
            >
              <X className="w-5 h-5" />
            </button>

            {/* Desktop collapse button */}
            <button
              onClick={onToggleCollapse}
              className="hidden md:flex items-center justify-center w-7 h-7 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800 transition-colors"
              title={collapsed ? 'Expand sidebar' : 'Collapse sidebar'}
            >
              {collapsed ? <ChevronRight className="w-4 h-4" /> : <ChevronLeft className="w-4 h-4" />}
            </button>
          </div>
        </div>

      {/* Store Banner */}
      {!collapsed && (
        <div className="px-4 py-3 mx-3 mt-3 rounded-xl bg-slate-800/60 border border-slate-700/50 flex items-center gap-3">
          <div className="w-8 h-8 rounded-lg bg-emerald-500/10 text-emerald-400 flex items-center justify-center shrink-0">
            <Store className="w-4 h-4" />
          </div>
          <div className="min-w-0 flex-1">
            <p className="text-xs font-semibold text-white truncate">{businessProfile.businessName}</p>
            <p className="text-[11px] text-slate-400 truncate">{businessProfile.businessType}</p>
          </div>
        </div>
      )}

      {/* Navigation Links */}
      <nav className="flex-1 px-3 py-4 space-y-1 overflow-y-auto">
        {navItems.map((item) => {
          const Icon = item.icon;
          const isActive = currentTab === item.id;
          return (
            <button
              key={item.id}
              onClick={() => handleItemClick(item.id)}
              title={collapsed ? item.label : undefined}
              className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-medium transition-all ${
                isActive
                  ? 'bg-emerald-600 text-white shadow-sm shadow-emerald-950 font-semibold'
                  : 'text-slate-300 hover:text-white hover:bg-slate-800/80'
              }`}
            >
              <Icon
                className={`w-5 h-5 shrink-0 ${
                  isActive ? 'text-white' : item.id === 'assistant' ? 'text-emerald-400' : 'text-slate-400'
                }`}
              />

              {!collapsed && (
                <span className="flex-1 text-left truncate">{item.label}</span>
              )}

              {!collapsed && item.badge !== undefined && item.badge > 0 && (
                <span
                  className={`text-[11px] font-bold px-2 py-0.5 rounded-full ${
                    isActive ? 'bg-white text-emerald-700' : 'bg-red-500 text-white'
                  }`}
                >
                  {item.badge}
                </span>
              )}

              {collapsed && item.badge !== undefined && item.badge > 0 && (
                <span className="absolute top-2 right-2 w-2 h-2 rounded-full bg-red-500" />
              )}
            </button>
          );
        })}
      </nav>

      {/* Bottom User Area */}
      <div className="p-3 border-t border-slate-800/80 bg-slate-950/40">
        {currentUser ? (
          <div className="flex items-center justify-between gap-2">
            {!collapsed && (
              <div className="flex items-center gap-2.5 min-w-0">
                <div className="w-8 h-8 rounded-full bg-emerald-600 text-white flex items-center justify-center font-bold text-xs shrink-0">
                  {currentUser.name.charAt(0).toUpperCase()}
                </div>
                <div className="min-w-0">
                  <p className="text-xs font-semibold text-white truncate">{currentUser.name}</p>
                  <p className="text-[10px] text-slate-400 truncate">{currentUser.email}</p>
                </div>
              </div>
            )}
            <button
              onClick={logoutUser}
              title="Sign Out"
              className="p-1.5 rounded-lg text-slate-400 hover:text-red-400 hover:bg-slate-800 transition-colors"
            >
              <LogOut className="w-4 h-4" />
            </button>
          </div>
        ) : (
          <button
            onClick={onOpenAuth}
            className="w-full flex items-center justify-center gap-2 py-2 px-3 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-semibold shadow-sm transition-all"
          >
            <span>Sign In</span>
          </button>
        )}
      </div>
    </aside>
    </>
  );
};
