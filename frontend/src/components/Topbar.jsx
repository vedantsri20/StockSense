import React, { useState, useEffect, useRef } from 'react';
import { useLocation, useNavigate, Link } from 'react-router-dom';
import {
  Menu,
  Search,
  Bell,
  ChevronRight,
  User,
  AlertTriangle,
  ExternalLink,
} from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import dashboardService from '../services/dashboardService';

const ROUTE_TITLES = {
  '/': 'Inventory Dashboard',
  '/products': 'Products Catalog',
  '/receipts': 'Inbound Receipts',
  '/deliveries': 'Delivery Orders',
  '/transfers': 'Internal Transfers',
  '/adjustments': 'Inventory Adjustments',
  '/move-history': 'Move History / Stock Ledger',
  '/warehouses': 'Warehouse Management',
  '/categories': 'Product Categories',
  '/reordering-rules': 'Reordering Rules & Thresholds',
  '/profile': 'User Profile & Settings',
};

export const Topbar = ({ onToggleMobile, collapsed }) => {
  const { user } = useAuth();
  const location = useLocation();
  const navigate = useNavigate();

  const [searchQuery, setSearchQuery] = useState('');
  const [notificationsOpen, setNotificationsOpen] = useState(false);
  const [alerts, setAlerts] = useState([]);
  const notifRef = useRef(null);

  // Dynamic Page Title & Breadcrumb
  const currentPath = location.pathname;
  let pageTitle = ROUTE_TITLES[currentPath] || 'Inventory Management';
  if (currentPath.startsWith('/products/') && currentPath !== '/products') {
    pageTitle = 'Product Details';
  }

  // Fetch low stock alerts for topbar notifications
  useEffect(() => {
    let isMounted = true;
    const fetchAlerts = async () => {
      try {
        const res = await dashboardService.getDashboardStats();
        if (isMounted && res.success && res.data?.lowStockAlerts) {
          setAlerts(res.data.lowStockAlerts);
        }
      } catch (err) {
        // Silently handle topbar background alerts
      }
    };
    fetchAlerts();
    return () => {
      isMounted = false;
    };
  }, [location.pathname]);

  // Click outside to close notification dropdown
  useEffect(() => {
    const handleClickOutside = (e) => {
      if (notifRef.current && !notifRef.current.contains(e.target)) {
        setNotificationsOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const handleSearchSubmit = (e) => {
    e.preventDefault();
    if (searchQuery.trim()) {
      navigate(`/products?search=${encodeURIComponent(searchQuery.trim())}`);
      setSearchQuery('');
    }
  };

  return (
    <header className="sticky top-0 z-30 flex h-16 w-full items-center justify-between border-b border-slate-200 bg-white/95 px-4 sm:px-6 backdrop-blur transition-all">
      {/* Left: Mobile Toggle & Page Title/Breadcrumbs */}
      <div className="flex items-center gap-4">
        <button
          onClick={onToggleMobile}
          className="lg:hidden p-2 rounded-lg text-slate-600 hover:bg-slate-100 transition-colors"
          aria-label="Toggle Navigation"
        >
          <Menu className="w-5 h-5" />
        </button>

        <div className="flex flex-col">
          <div className="flex items-center gap-1.5 text-[11px] font-medium text-slate-500">
            <Link to="/" className="hover:text-blue-600 transition-colors">
              StockSense
            </Link>
            <ChevronRight className="w-3 h-3 text-slate-400" />
            <span className="text-slate-700 capitalize">{pageTitle}</span>
          </div>
          <h1 className="text-lg font-bold text-slate-900 leading-none mt-0.5">{pageTitle}</h1>
        </div>
      </div>

      {/* Right: Search, Notifications, User */}
      <div className="flex items-center gap-3">
        {/* Search Bar */}
        <form onSubmit={handleSearchSubmit} className="relative hidden md:block">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Search SKU or products..."
            className="w-52 lg:w-64 rounded-xl border border-slate-200 bg-slate-50 pl-9 pr-4 py-1.5 text-xs text-slate-900 transition-all focus:bg-white focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500"
          />
        </form>

        {/* Notifications Popover */}
        <div className="relative" ref={notifRef}>
          <button
            onClick={() => setNotificationsOpen(!notificationsOpen)}
            className="relative p-2 rounded-xl text-slate-600 hover:bg-slate-100 transition-colors"
            title="Low Stock Notifications"
          >
            <Bell className="w-5 h-5" />
            {alerts.length > 0 && (
              <span className="absolute top-1.5 right-1.5 flex h-4 w-4 items-center justify-center rounded-full bg-rose-500 text-[10px] font-bold text-white ring-2 ring-white">
                {alerts.length}
              </span>
            )}
          </button>

          {notificationsOpen && (
            <div className="absolute right-0 mt-2 w-80 sm:w-96 rounded-2xl border border-slate-200 bg-white p-4 shadow-xl z-50 animate-in fade-in-50 zoom-in-95">
              <div className="flex items-center justify-between pb-3 border-b border-slate-100">
                <div className="flex items-center gap-2">
                  <AlertTriangle className="w-4 h-4 text-amber-500" />
                  <h4 className="text-sm font-bold text-slate-900">Inventory Alerts</h4>
                </div>
                <span className="text-xs font-semibold px-2 py-0.5 rounded-full bg-amber-50 text-amber-700">
                  {alerts.length} Low / Out
                </span>
              </div>

              <div className="max-h-72 overflow-y-auto py-2 divide-y divide-slate-100">
                {alerts.length === 0 ? (
                  <p className="text-xs text-slate-500 text-center py-6">All products are healthy in stock.</p>
                ) : (
                  alerts.map((alert) => (
                    <div
                      key={alert._id}
                      onClick={() => {
                        setNotificationsOpen(false);
                        navigate(`/products/${alert._id}`);
                      }}
                      className="py-2.5 px-2 hover:bg-slate-50 rounded-lg cursor-pointer transition-colors flex items-center justify-between"
                    >
                      <div className="space-y-0.5">
                        <p className="text-xs font-semibold text-slate-800">{alert.name}</p>
                        <p className="text-[10px] text-slate-500">
                          SKU: {alert.sku} • Threshold: {alert.reorderLevel}
                        </p>
                      </div>
                      <div className="text-right">
                        <span
                          className={`text-xs font-bold px-2 py-0.5 rounded-full ${
                            alert.stock === 0
                              ? 'bg-rose-100 text-rose-700'
                              : 'bg-amber-100 text-amber-700'
                          }`}
                        >
                          {alert.stock} {alert.unitOfMeasure}
                        </span>
                      </div>
                    </div>
                  ))
                )}
              </div>

              <div className="pt-2 border-t border-slate-100 text-center">
                <Link
                  to="/products?stockStatus=low_stock"
                  onClick={() => setNotificationsOpen(false)}
                  className="text-xs font-semibold text-blue-600 hover:text-blue-700 inline-flex items-center gap-1"
                >
                  View all stock alerts <ExternalLink className="w-3 h-3" />
                </Link>
              </div>
            </div>
          )}
        </div>

        {/* User Pill */}
        <Link
          to="/profile"
          className="flex items-center gap-2 pl-2 pr-3 py-1.5 rounded-xl border border-slate-200 hover:bg-slate-50 transition-colors"
        >
          <div className="w-7 h-7 rounded-lg bg-blue-600 text-white flex items-center justify-center text-xs font-bold shadow-sm">
            {user?.name ? user.name.slice(0, 1) : 'U'}
          </div>
          <span className="hidden sm:inline-block text-xs font-semibold text-slate-700 max-w-[100px] truncate">
            {user?.name || 'User'}
          </span>
        </Link>
      </div>
    </header>
  );
};

export default Topbar;
