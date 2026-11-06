import React, { useState } from 'react';
import {
  LayoutDashboard,
  Package,
  TrendingUp,
  ShoppingBag,
  Menu,
  Sparkles,
} from 'lucide-react';
import { StoreProvider, useStore } from './context/StoreContext';
import { Sidebar, NavTab } from './components/layout/Sidebar';
import { TopNavbar } from './components/layout/TopNavbar';
import { DashboardView } from './components/dashboard/DashboardView';
import { InventoryView } from './components/inventory/InventoryView';
import { DemandForecastView } from './components/forecast/DemandForecastView';
import { PurchasePlanningView } from './components/planning/PurchasePlanningView';
import { PurchaseOrderView } from './components/purchase/PurchaseOrderView';
import { SalesAnalyticsView } from './components/sales/SalesAnalyticsView';
import { SuppliersView } from './components/suppliers/SuppliersView';
import { AlertsView } from './components/alerts/AlertsView';
import { AiAssistantView } from './components/ai/AiAssistantView';
import { ReportsView } from './components/reports/ReportsView';
import { SettingsView } from './components/settings/SettingsView';

import { ProductFormModal } from './components/inventory/ProductFormModal';
import { StockAdjustmentModal } from './components/inventory/StockAdjustmentModal';
import { CreatePurchaseOrderModal } from './components/purchase/CreatePurchaseOrderModal';
import { RecordSaleModal } from './components/sales/RecordSaleModal';
import { AuthModal } from './components/auth/AuthModal';
import { OnboardingWizard } from './components/onboarding/OnboardingWizard';
import { Product } from './types';

function MainApp() {
  const { isDemoMode, unreadAlertsCount } = useStore();

  const [currentTab, setCurrentTab] = useState<NavTab>('dashboard');
  const [collapsed, setCollapsed] = useState(false);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [inventoryStatusFilter, setInventoryStatusFilter] = useState<string>('all');
  const [inventoryCategoryFilter, setInventoryCategoryFilter] = useState<string>('all');

  // Navigation helper with filters
  const handleNavigateToInventory = (filter?: { status?: string; category?: string; search?: string }) => {
    if (filter?.status !== undefined) setInventoryStatusFilter(filter.status);
    if (filter?.category !== undefined) setInventoryCategoryFilter(filter.category);
    if (filter?.search !== undefined) setSearchQuery(filter.search);
    setCurrentTab('inventory');
    setMobileMenuOpen(false);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  // Modals state
  const [productModalOpen, setProductModalOpen] = useState(false);
  const [editingProduct, setEditingProduct] = useState<Product | null>(null);

  const [adjustStockModalOpen, setAdjustStockModalOpen] = useState(false);
  const [adjustProduct, setAdjustProduct] = useState<Product | null>(null);

  const [createPOModalOpen, setCreatePOModalOpen] = useState(false);
  const [poPrefillSupplier, setPoPrefillSupplier] = useState<string | undefined>(undefined);
  const [poPrefillProduct, setPoPrefillProduct] = useState<string | undefined>(undefined);
  const [poPrefillQty, setPoPrefillQty] = useState<number | undefined>(undefined);

  const [recordSaleModalOpen, setRecordSaleModalOpen] = useState(false);
  const [authModalOpen, setAuthModalOpen] = useState(false);
  const [onboardingWizardOpen, setOnboardingWizardOpen] = useState(false);

  // Open Create PO with prefill
  const handleOpenCreatePO = (
    supplierId?: string,
    productId?: string,
    prefillQuantity?: number
  ) => {
    setPoPrefillSupplier(supplierId);
    setPoPrefillProduct(productId);
    setPoPrefillQty(prefillQuantity);
    setCreatePOModalOpen(true);
  };

  // Open Edit Product
  const handleOpenEditProduct = (product: Product) => {
    setEditingProduct(product);
    setProductModalOpen(true);
  };

  // Open Adjust Stock
  const handleOpenAdjustStock = (product?: Product) => {
    setAdjustProduct(product || null);
    setAdjustStockModalOpen(true);
  };

  return (
    <div className="min-h-screen bg-slate-50 text-slate-900 flex font-sans antialiased selection:bg-emerald-500 selection:text-white">
      {/* Dark Navy Sidebar with Mobile Drawer */}
      <Sidebar
        currentTab={currentTab}
        onSelectTab={(tab) => {
          setCurrentTab(tab);
          setMobileMenuOpen(false);
          window.scrollTo({ top: 0, behavior: 'smooth' });
        }}
        collapsed={collapsed}
        onToggleCollapse={() => setCollapsed(!collapsed)}
        onOpenAuth={() => setAuthModalOpen(true)}
        mobileOpen={mobileMenuOpen}
        onCloseMobile={() => setMobileMenuOpen(false)}
      />

      {/* Main Container */}
      <div className="flex-1 flex flex-col min-w-0">
        {/* Sticky Top Navbar */}
        <TopNavbar
          collapsed={collapsed}
          onSelectTab={(tab) => {
            setCurrentTab(tab);
            setMobileMenuOpen(false);
          }}
          onOpenAuth={() => setAuthModalOpen(true)}
          onOpenOnboarding={() => setOnboardingWizardOpen(true)}
          searchQuery={searchQuery}
          onSearchChange={setSearchQuery}
          onToggleMobileMenu={() => setMobileMenuOpen(!mobileMenuOpen)}
        />

        {/* Demo Mode Notice Banner */}
        {isDemoMode && (
          <div
            className={`transition-all duration-300 bg-emerald-50 border-b border-emerald-200/80 px-3 sm:px-4 py-2 flex flex-col sm:flex-row sm:items-center justify-between text-xs text-emerald-900 gap-1.5 ml-0 ${
              collapsed ? 'md:ml-20' : 'md:ml-64'
            }`}
          >
            <div className="flex items-center gap-2">
              <span className="w-2 h-2 rounded-full bg-emerald-500 animate-ping shrink-0" />
              <span className="leading-snug">
                <strong>Sample Store Active:</strong> 27 Indian FMCG products &amp; 90 days sales telemetry.
              </span>
            </div>
            <button
              onClick={() => setOnboardingWizardOpen(true)}
              className="text-emerald-700 hover:text-emerald-900 font-bold underline shrink-0 text-left sm:text-right"
            >
              Configure My Store &rarr;
            </button>
          </div>
        )}

        {/* Dynamic Page Views */}
        <main
          className={`flex-1 transition-all duration-300 pb-24 md:pb-16 ml-0 ${
            collapsed ? 'md:ml-20' : 'md:ml-64'
          }`}
        >
          {currentTab === 'dashboard' && (
            <DashboardView
              onSelectTab={setCurrentTab}
              onNavigateToInventory={handleNavigateToInventory}
              onOpenAddProduct={() => {
                setEditingProduct(null);
                setProductModalOpen(true);
              }}
              onOpenRecordSale={() => setRecordSaleModalOpen(true)}
              onOpenCreatePO={handleOpenCreatePO}
              onOpenAdjustStock={() => handleOpenAdjustStock()}
            />
          )}

          {currentTab === 'inventory' && (
            <InventoryView
              searchQuery={searchQuery}
              onSearchChange={setSearchQuery}
              statusFilter={inventoryStatusFilter}
              onStatusFilterChange={setInventoryStatusFilter}
              categoryFilter={inventoryCategoryFilter}
              onCategoryFilterChange={setInventoryCategoryFilter}
              onOpenAddProduct={() => {
                setEditingProduct(null);
                setProductModalOpen(true);
              }}
              onOpenEditProduct={handleOpenEditProduct}
              onOpenAdjustStock={handleOpenAdjustStock}
            />
          )}

          {currentTab === 'forecast' && (
            <DemandForecastView onOpenCreatePO={handleOpenCreatePO} />
          )}

          {currentTab === 'planning' && (
            <PurchasePlanningView onOpenCreatePO={handleOpenCreatePO} />
          )}

          {currentTab === 'sales' && (
            <SalesAnalyticsView
              onOpenRecordSale={() => setRecordSaleModalOpen(true)}
            />
          )}


          {currentTab === 'suppliers' && (
            <SuppliersView onOpenCreatePO={handleOpenCreatePO} />
          )}

          {currentTab === 'alerts' && (
            <AlertsView
              onSelectTab={setCurrentTab}
              onOpenCreatePO={handleOpenCreatePO}
            />
          )}

          {currentTab === 'assistant' && (
            <AiAssistantView onOpenCreatePO={handleOpenCreatePO} />
          )}

          {currentTab === 'reports' && <ReportsView />}

          {currentTab === 'settings' && <SettingsView />}
        </main>
      </div>

      {/* Mobile Bottom Navigation Bar */}
      <nav className="fixed bottom-0 left-0 right-0 z-30 bg-white/95 backdrop-blur-md border-t border-slate-200/90 py-1.5 px-2 flex items-center justify-around md:hidden shadow-lg shadow-slate-900/10">
        <button
          onClick={() => {
            setCurrentTab('dashboard');
            window.scrollTo({ top: 0, behavior: 'smooth' });
          }}
          className={`flex flex-col items-center py-1 px-2.5 rounded-xl text-[10px] font-semibold transition-all ${
            currentTab === 'dashboard' ? 'text-emerald-700 bg-emerald-50' : 'text-slate-500 hover:text-slate-900'
          }`}
        >
          <LayoutDashboard className="w-5 h-5 mb-0.5" />
          <span>Dashboard</span>
        </button>

        <button
          onClick={() => {
            handleNavigateToInventory({ status: 'all' });
          }}
          className={`flex flex-col items-center py-1 px-2.5 rounded-xl text-[10px] font-semibold transition-all ${
            currentTab === 'inventory' ? 'text-emerald-700 bg-emerald-50' : 'text-slate-500 hover:text-slate-900'
          }`}
        >
          <Package className="w-5 h-5 mb-0.5" />
          <span>Inventory</span>
        </button>

        <button
          onClick={() => {
            setCurrentTab('forecast');
            window.scrollTo({ top: 0, behavior: 'smooth' });
          }}
          className={`flex flex-col items-center py-1 px-2.5 rounded-xl text-[10px] font-semibold transition-all ${
            currentTab === 'forecast' ? 'text-emerald-700 bg-emerald-50' : 'text-slate-500 hover:text-slate-900'
          }`}
        >
          <TrendingUp className="w-5 h-5 mb-0.5" />
          <span>Forecast</span>
        </button>

        <button
          onClick={() => {
            setCurrentTab('planning');
            window.scrollTo({ top: 0, behavior: 'smooth' });
          }}
          className={`flex flex-col items-center py-1 px-2.5 rounded-xl text-[10px] font-semibold transition-all ${
            currentTab === 'planning' ? 'text-emerald-700 bg-emerald-50' : 'text-slate-500 hover:text-slate-900'
          }`}
        >
          <ShoppingBag className="w-5 h-5 mb-0.5" />
          <span>Reorder</span>
        </button>

        <button
          onClick={() => setMobileMenuOpen(true)}
          className="relative flex flex-col items-center py-1 px-2.5 rounded-xl text-[10px] font-semibold text-slate-500 hover:text-slate-900 transition-all"
        >
          <div className="relative">
            <Menu className="w-5 h-5 mb-0.5" />
            {unreadAlertsCount > 0 && (
              <span className="absolute -top-1 -right-1 w-2 h-2 rounded-full bg-red-500 ring-2 ring-white" />
            )}
          </div>
          <span>More</span>
        </button>
      </nav>

      {/* Modals */}
      {productModalOpen && (
        <ProductFormModal
          product={editingProduct}
          onClose={() => {
            setProductModalOpen(false);
            setEditingProduct(null);
          }}
        />
      )}

      {adjustStockModalOpen && (
        <StockAdjustmentModal
          product={adjustProduct}
          onClose={() => {
            setAdjustStockModalOpen(false);
            setAdjustProduct(null);
          }}
        />
      )}

      {createPOModalOpen && (
        <CreatePurchaseOrderModal
          prefillSupplierId={poPrefillSupplier}
          prefillProductId={poPrefillProduct}
          prefillQuantity={poPrefillQty}
          onClose={() => {
            setCreatePOModalOpen(false);
            setPoPrefillSupplier(undefined);
            setPoPrefillProduct(undefined);
            setPoPrefillQty(undefined);
          }}
        />
      )}

      {recordSaleModalOpen && (
        <RecordSaleModal onClose={() => setRecordSaleModalOpen(false)} />
      )}

      {authModalOpen && (
        <AuthModal
          onClose={() => setAuthModalOpen(false)}
          onOpenOnboarding={() => setOnboardingWizardOpen(true)}
        />
      )}

      {onboardingWizardOpen && (
        <OnboardingWizard onClose={() => setOnboardingWizardOpen(false)} />
      )}
    </div>
  );
}

export default function App() {
  return (
    <StoreProvider>
      <MainApp />
    </StoreProvider>
  );
}
