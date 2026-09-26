import React from 'react';
import { NavLink, useNavigate } from 'react-router-dom';
import {
  LayoutDashboard,
  Package,
  ArrowDownToLine,
  ArrowUpFromLine,
  ArrowLeftRight,
  SlidersHorizontal,
  History,
  Warehouse,
  Tags,
  BellRing,
  UserCheck,
  LogOut,
  Boxes,
  ChevronLeft,
  ChevronRight,
  X,
} from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { useToast } from '../context/ToastContext';

export const Sidebar = ({
  collapsed,
  setCollapsed,
  mobileOpen,
  setMobileOpen,
}) => {
  const { user, logout } = useAuth();
  const { info } = useToast();
  const navigate = useNavigate();

  const handleLogout = () => {
    logout();
    info('You have been logged out.');
    navigate('/login');
  };

  const navGroups = [
    {
      group: 'MAIN',
      items: [
        { label: 'Dashboard', path: '/', icon: LayoutDashboard },
        { label: 'Products', path: '/products', icon: Package },
      ],
    },
    {
      group: 'OPERATIONS',
      items: [
        { label: 'Receipts', path: '/receipts', icon: ArrowDownToLine },
        { label: 'Delivery Orders', path: '/deliveries', icon: ArrowUpFromLine },
        { label: 'Internal Transfers', path: '/transfers', icon: ArrowLeftRight },
        { label: 'Inventory Adjustments', path: '/adjustments', icon: SlidersHorizontal },
        { label: 'Move History', path: '/move-history', icon: History },
      ],
    },
    {
      group: 'MANAGEMENT',
      items: [
        { label: 'Warehouses', path: '/warehouses', icon: Warehouse },
        { label: 'Categories', path: '/categories', icon: Tags },
        { label: 'Reordering Rules', path: '/reordering-rules', icon: BellRing },
      ],
    },
    {
      group: 'ACCOUNT',
      items: [
        { label: 'Profile', path: '/profile', icon: UserCheck },
      ],
    },
  ];

  return (
    <>
      {/* Mobile Backdrop */}
      {mobileOpen && (
        <div
          className="fixed inset-0 z-40 bg-slate-900/50 backdrop-blur-sm lg:hidden"
          onClick={() => setMobileOpen(false)}
        />
      )}

      {/* Sidebar Container */}
      <aside
        className={`fixed top-0 bottom-0 left-0 z-40 flex flex-col bg-white border-r border-slate-200 transition-all duration-300 ease-in-out ${
          collapsed ? 'w-20' : 'w-64'
        } ${mobileOpen ? 'translate-x-0' : '-translate-x-full lg:translate-x-0'}`}
      >
        {/* Brand Header */}
        <div className="flex items-center justify-between h-16 px-4 border-b border-slate-200">
          <div className="flex items-center gap-3 overflow-hidden">
            <div className="flex-shrink-0 w-9 h-9 rounded-xl bg-blue-600 flex items-center justify-center text-white shadow-sm shadow-blue-500/20">
              <Boxes className="w-5 h-5" />
            </div>
            {!collapsed && (
              <div className="flex flex-col truncate">
                <span className="font-bold text-slate-900 text-base leading-tight tracking-tight">
                  StockSense
                </span>
                <span className="text-[10px] font-semibold tracking-wider uppercase text-blue-600">
                  Inventory Management
                </span>
              </div>
            )}
          </div>

          {/* Mobile close button */}
          <button
            onClick={() => setMobileOpen(false)}
            className="lg:hidden p-1.5 rounded-lg text-slate-400 hover:text-slate-600 hover:bg-slate-100"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Navigation Items */}
        <div className="flex-1 overflow-y-auto py-4 px-3 space-y-6">
          {navGroups.map((grp) => (
            <div key={grp.group} className="space-y-1">
              {!collapsed && (
                <p className="px-3 text-[10px] font-bold uppercase tracking-wider text-slate-400 mb-2">
                  {grp.group}
                </p>
              )}
              {grp.items.map((item) => {
                const Icon = item.icon;
                return (
                  <NavLink
                    key={item.path}
                    to={item.path}
                    end={item.path === '/'}
                    onClick={() => setMobileOpen(false)}
                    className={({ isActive }) =>
                      `flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-medium transition-all ${
                        isActive
                          ? 'bg-blue-50 text-blue-700 font-semibold'
                          : 'text-slate-600 hover:bg-slate-50 hover:text-slate-900'
                      } ${collapsed ? 'justify-center' : ''}`
                    }
                    title={collapsed ? item.label : undefined}
                  >
                    <Icon className="w-5 h-5 flex-shrink-0" />
                    {!collapsed && <span className="truncate">{item.label}</span>}
                  </NavLink>
                );
              })}
            </div>
          ))}

          {/* Logout Button */}
          <div className="pt-2">
            <button
              onClick={handleLogout}
              className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-medium text-rose-600 hover:bg-rose-50 transition-colors ${
                collapsed ? 'justify-center' : ''
              }`}
              title={collapsed ? 'Logout' : undefined}
            >
              <LogOut className="w-5 h-5 flex-shrink-0" />
              {!collapsed && <span>Logout</span>}
            </button>
          </div>
        </div>

        {/* User Card & Collapse Toggle Footer */}
        <div className="p-3 border-t border-slate-200 bg-slate-50/50">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2.5 overflow-hidden">
              <div className="w-8 h-8 rounded-full bg-slate-200 border border-slate-300 flex items-center justify-center text-xs font-bold text-slate-700 uppercase flex-shrink-0">
                {user?.name ? user.name.slice(0, 2) : 'AD'}
              </div>
              {!collapsed && (
                <div className="truncate">
                  <p className="text-xs font-semibold text-slate-800 truncate">{user?.name || 'Administrator'}</p>
                  <p className="text-[10px] text-slate-500 capitalize">{user?.role || 'admin'}</p>
                </div>
              )}
            </div>

            {/* Desktop collapse button */}
            <button
              onClick={() => setCollapsed(!collapsed)}
              className="hidden lg:flex p-1.5 rounded-lg text-slate-400 hover:bg-slate-200/60 hover:text-slate-600 transition-colors"
              title={collapsed ? 'Expand sidebar' : 'Collapse sidebar'}
            >
              {collapsed ? <ChevronRight className="w-4 h-4" /> : <ChevronLeft className="w-4 h-4" />}
            </button>
          </div>
        </div>
      </aside>
    </>
  );
};

export default Sidebar;
