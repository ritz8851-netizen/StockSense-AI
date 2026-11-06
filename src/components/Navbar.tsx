import React, { useState } from 'react';
import { 
  FileText, 
  Search, 
  Bell, 
  User, 
  LogOut, 
  Sparkles, 
  HelpCircle, 
  ShieldCheck,
  ChevronDown,
  CheckCircle2,
  Calendar,
  AlertTriangle
} from 'lucide-react';
import { UserProfile, Reminder } from '../types/document';

interface NavbarProps {
  currentUser: UserProfile | null;
  onOpenAuth: () => void;
  onLogout: () => void;
  onNavigate: (view: string) => void;
  searchQuery: string;
  onSearchChange: (query: string) => void;
  reminders: Reminder[];
  onOpenHelp: () => void;
  onToggleDemoMode: () => void;
}

export const Navbar: React.FC<NavbarProps> = ({
  currentUser,
  onOpenAuth,
  onLogout,
  onNavigate,
  searchQuery,
  onSearchChange,
  reminders,
  onOpenHelp,
  onToggleDemoMode
}) => {
  const [showUserMenu, setShowUserMenu] = useState(false);
  const [showNotifications, setShowNotifications] = useState(false);

  const pendingReminders = reminders.filter(r => !r.completed);

  return (
    <header className="sticky top-0 z-30 h-16 bg-slate-900 border-b border-slate-800 text-white flex items-center justify-between px-4 lg:px-6">
      {/* Brand & Mode */}
      <div className="flex items-center space-x-3">
        <button 
          onClick={() => onNavigate(currentUser ? 'dashboard' : 'landing')}
          className="flex items-center space-x-2.5 text-left group focus:outline-none"
        >
          <div className="w-9 h-9 rounded-xl bg-gradient-to-tr from-indigo-600 via-indigo-500 to-violet-500 flex items-center justify-center shadow-lg shadow-indigo-500/20 group-hover:scale-105 transition-transform">
            <FileText className="w-5 h-5 text-white" />
          </div>
          <div>
            <span className="font-bold text-lg tracking-tight flex items-center gap-1.5 text-white">
              PaperWise
              <span className="px-1.5 py-0.5 text-[10px] uppercase font-semibold bg-indigo-500/20 text-indigo-300 border border-indigo-500/30 rounded">
                AI
              </span>
            </span>
            <span className="hidden sm:block text-[11px] text-slate-400 font-normal">
              Document Intelligence Platform
            </span>
          </div>
        </button>

        {currentUser?.isDemoUser && (
          <div className="hidden md:flex items-center space-x-1.5 ml-4 px-2.5 py-1 bg-amber-500/10 border border-amber-500/20 rounded-full text-amber-300 text-xs">
            <span className="w-2 h-2 rounded-full bg-amber-400 animate-pulse"></span>
            <span className="font-medium">Demo Mode Active</span>
            <button 
              onClick={onToggleDemoMode}
              className="ml-1 text-[11px] underline hover:text-amber-200"
              title="Switch to custom account"
            >
              Sign In
            </button>
          </div>
        )}
      </div>

      {/* Search Bar (When in logged-in app) */}
      {currentUser && (
        <div className="hidden md:flex items-center flex-1 max-w-md mx-6">
          <div className="relative w-full">
            <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2 pointer-events-none" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => onSearchChange(e.target.value)}
              placeholder="Search clauses, fees, deadlines, or documents..."
              className="w-full bg-slate-800/80 border border-slate-700/80 rounded-lg pl-9 pr-4 py-1.5 text-sm text-slate-100 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent transition"
            />
            {searchQuery && (
              <button 
                onClick={() => onSearchChange('')}
                className="absolute right-2.5 top-1/2 -translate-y-1/2 text-xs text-slate-400 hover:text-slate-200"
              >
                ✕
              </button>
            )}
          </div>
        </div>
      )}

      {/* Right Controls */}
      <div className="flex items-center space-x-2 sm:space-x-3">
        {currentUser ? (
          <>
            {/* Quick Upload CTA button */}
            <button
              onClick={() => onNavigate('upload')}
              className="flex items-center space-x-1.5 bg-indigo-600 hover:bg-indigo-500 text-white text-xs sm:text-sm font-medium px-3.5 py-1.5 rounded-lg transition shadow-sm hover:shadow-indigo-500/25"
            >
              <Sparkles className="w-4 h-4" />
              <span className="hidden sm:inline">Analyze Document</span>
              <span className="sm:hidden">Analyze</span>
            </button>

            {/* Notifications Menu */}
            <div className="relative">
              <button
                onClick={() => {
                  setShowNotifications(!showNotifications);
                  setShowUserMenu(false);
                }}
                className="relative p-2 text-slate-300 hover:text-white hover:bg-slate-800 rounded-lg transition"
                title="Deadlines & Alerts"
              >
                <Bell className="w-5 h-5" />
                {pendingReminders.length > 0 && (
                  <span className="absolute top-1 right-1 w-4 h-4 bg-rose-500 text-white text-[10px] font-bold rounded-full flex items-center justify-center">
                    {pendingReminders.length}
                  </span>
                )}
              </button>

              {showNotifications && (
                <div className="absolute right-0 mt-2 w-80 bg-slate-800 border border-slate-700 rounded-xl shadow-2xl overflow-hidden z-50">
                  <div className="p-3 bg-slate-800/90 border-b border-slate-700 flex items-center justify-between">
                    <span className="font-semibold text-sm text-slate-100 flex items-center gap-1.5">
                      <Calendar className="w-4 h-4 text-indigo-400" />
                      Important Deadlines ({pendingReminders.length})
                    </span>
                    <button
                      onClick={() => {
                        setShowNotifications(false);
                        onNavigate('deadlines');
                      }}
                      className="text-xs text-indigo-400 hover:text-indigo-300 font-medium"
                    >
                      View All
                    </button>
                  </div>
                  <div className="max-h-72 overflow-y-auto divide-y divide-slate-700/50">
                    {pendingReminders.length === 0 ? (
                      <div className="p-6 text-center text-xs text-slate-400">
                        <CheckCircle2 className="w-8 h-8 text-emerald-400 mx-auto mb-2 opacity-80" />
                        All deadlines and actions are up to date!
                      </div>
                    ) : (
                      pendingReminders.slice(0, 4).map((rem) => (
                        <div key={rem.id} className="p-3 hover:bg-slate-700/50 transition">
                          <div className="flex items-start justify-between gap-2">
                            <p className="text-xs font-medium text-slate-200 line-clamp-2">
                              {rem.title}
                            </p>
                            {rem.priority === 'high' && (
                              <span className="px-1.5 py-0.5 text-[9px] bg-rose-500/20 text-rose-300 font-semibold rounded shrink-0">
                                Urgent
                              </span>
                            )}
                          </div>
                          <div className="mt-1 flex items-center justify-between text-[11px] text-slate-400">
                            <span>Due: {rem.dueDate}</span>
                            <span className="truncate max-w-[120px]">{rem.documentTitle || 'General'}</span>
                          </div>
                        </div>
                      ))
                    )}
                  </div>
                </div>
              )}
            </div>

            {/* Help Button */}
            <button
              onClick={onOpenHelp}
              className="p-2 text-slate-300 hover:text-white hover:bg-slate-800 rounded-lg transition"
              title="Documentation & Guidance"
            >
              <HelpCircle className="w-5 h-5" />
            </button>

            {/* User Profile Dropdown */}
            <div className="relative">
              <button
                onClick={() => {
                  setShowUserMenu(!showUserMenu);
                  setShowNotifications(false);
                }}
                className="flex items-center space-x-2 p-1.5 rounded-lg hover:bg-slate-800 transition text-slate-200"
              >
                <div className="w-7 h-7 rounded-full bg-gradient-to-br from-indigo-500 to-purple-600 flex items-center justify-center text-xs font-bold text-white shadow-sm">
                  {currentUser.name ? currentUser.name.charAt(0).toUpperCase() : 'U'}
                </div>
                <span className="hidden lg:inline text-xs font-medium max-w-[110px] truncate">
                  {currentUser.name}
                </span>
                <ChevronDown className="w-3.5 h-3.5 text-slate-400" />
              </button>

              {showUserMenu && (
                <div className="absolute right-0 mt-2 w-56 bg-slate-800 border border-slate-700 rounded-xl shadow-2xl py-1 z-50">
                  <div className="px-4 py-2.5 border-b border-slate-700">
                    <p className="text-xs font-semibold text-slate-100">{currentUser.name}</p>
                    <p className="text-[11px] text-slate-400 truncate">{currentUser.email}</p>
                    {currentUser.isDemoUser && (
                      <span className="inline-block mt-1 px-1.5 py-0.5 bg-amber-500/20 text-amber-300 text-[10px] rounded font-medium">
                        Demo Account
                      </span>
                    )}
                  </div>
                  <button
                    onClick={() => {
                      setShowUserMenu(false);
                      onNavigate('dashboard');
                    }}
                    className="w-full text-left px-4 py-2 text-xs text-slate-300 hover:bg-slate-700/60 flex items-center space-x-2"
                  >
                    <FileText className="w-4 h-4 text-slate-400" />
                    <span>My Workspace</span>
                  </button>
                  <button
                    onClick={() => {
                      setShowUserMenu(false);
                      onNavigate('deadlines');
                    }}
                    className="w-full text-left px-4 py-2 text-xs text-slate-300 hover:bg-slate-700/60 flex items-center space-x-2"
                  >
                    <Calendar className="w-4 h-4 text-slate-400" />
                    <span>Deadlines & Reminders</span>
                  </button>
                  <button
                    onClick={() => {
                      setShowUserMenu(false);
                      onNavigate('settings');
                    }}
                    className="w-full text-left px-4 py-2 text-xs text-slate-300 hover:bg-slate-700/60 flex items-center space-x-2"
                  >
                    <ShieldCheck className="w-4 h-4 text-slate-400" />
                    <span>Privacy & Security</span>
                  </button>
                  <div className="border-t border-slate-700 my-1"></div>
                  <button
                    onClick={() => {
                      setShowUserMenu(false);
                      onLogout();
                    }}
                    className="w-full text-left px-4 py-2 text-xs text-rose-400 hover:bg-rose-500/10 flex items-center space-x-2"
                  >
                    <LogOut className="w-4 h-4" />
                    <span>{currentUser.isDemoUser ? 'Exit Demo Mode' : 'Sign Out'}</span>
                  </button>
                </div>
              )}
            </div>
          </>
        ) : (
          <div className="flex items-center space-x-2">
            <button
              onClick={onToggleDemoMode}
              className="text-xs text-slate-300 hover:text-white font-medium px-3 py-1.5 rounded-lg hover:bg-slate-800 transition"
            >
              Explore Demo
            </button>
            <button
              onClick={onOpenAuth}
              className="bg-indigo-600 hover:bg-indigo-500 text-white text-xs font-semibold px-4 py-1.5 rounded-lg transition shadow-sm"
            >
              Sign In
            </button>
          </div>
        )}
      </div>
    </header>
  );
};
