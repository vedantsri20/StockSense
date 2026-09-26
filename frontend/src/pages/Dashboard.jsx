import React, { useState, useEffect } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import {
  Package,
  AlertTriangle,
  XCircle,
  ArrowDownToLine,
  ArrowUpFromLine,
  ArrowLeftRight,
  DollarSign,
  TrendingUp,
  Filter,
  RefreshCw,
  Eye,
  SlidersHorizontal,
  ChevronRight,
} from 'lucide-react';
import {
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell,
  Tooltip,
  Legend,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  AreaChart,
  Area,
} from 'recharts';
import dashboardService from '../services/dashboardService';
import warehouseService from '../services/warehouseService';
import categoryService from '../services/categoryService';
import StatCard from '../components/StatCard';
import Badge from '../components/Badge';
import Table from '../components/Table';
import LoadingSpinner from '../components/LoadingSpinner';
import EmptyState from '../components/EmptyState';
import Button from '../components/Button';
import { useToast } from '../context/ToastContext';

const PIE_COLORS = ['#2563eb', '#10b981', '#f59e0b', '#8b5cf6', '#ec4899', '#06b6d4'];

export const Dashboard = () => {
  const [stats, setStats] = useState(null);
  const [loading, setLoading] = useState(true);
  const [warehouses, setWarehouses] = useState([]);
  const [categories, setCategories] = useState([]);
  
  // Dashboard real filters
  const [filters, setFilters] = useState({
    warehouse: 'all',
    category: 'all',
    operationType: 'all',
  });

  const { error } = useToast();
  const navigate = useNavigate();

  const fetchDashboardData = async () => {
    setLoading(true);
    try {
      const [dashRes, whRes, catRes] = await Promise.all([
        dashboardService.getDashboardStats({
          warehouse: filters.warehouse,
          category: filters.category,
          operationType: filters.operationType,
        }),
        warehouseService.getWarehouses(),
        categoryService.getCategories(),
      ]);

      if (dashRes.success) {
        setStats(dashRes.data);
      }
      if (whRes.success) setWarehouses(whRes.data);
      if (catRes.success) setCategories(catRes.data);
    } catch (err) {
      error(err.message || 'Unable to load inventory dashboard data.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchDashboardData();
  }, [filters]);

  const handleFilterChange = (e) => {
    setFilters({ ...filters, [e.target.name]: e.target.value });
  };

  if (loading && !stats) {
    return <LoadingSpinner message="Loading real-time inventory dashboard..." />;
  }

  if (!stats) {
    return (
      <EmptyState
        title="Unable to load inventory"
        description="We encountered an issue fetching the latest inventory telemetry."
        actionText="Retry Connection"
        onAction={fetchDashboardData}
      />
    );
  }

  return (
    <div className="space-y-6">
      {/* Top Banner: Inventory Valuation & Filter Bar */}
      <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4 p-5 rounded-2xl bg-white border border-slate-200 shadow-sm">
        <div>
          <span className="text-xs font-bold uppercase tracking-wider text-slate-400">
            Total Inventory Valuation
          </span>
          <div className="flex items-baseline gap-3 mt-1">
            <h2 className="text-3xl font-extrabold tracking-tight text-slate-900">
              ₹{stats.inventoryValue?.toLocaleString('en-IN')}
            </h2>
            <span className="inline-flex items-center gap-1 text-xs font-semibold px-2 py-0.5 rounded-full bg-emerald-50 text-emerald-700 border border-emerald-200">
              <TrendingUp className="w-3.5 h-3.5" /> Real-time Asset Value
            </span>
          </div>
        </div>

        {/* Filters Toolbar */}
        <div className="flex flex-wrap items-center gap-2.5">
          <div className="flex items-center gap-1.5 text-xs font-semibold text-slate-500 mr-1">
            <Filter className="w-3.5 h-3.5" /> Filters:
          </div>

          <select
            name="warehouse"
            value={filters.warehouse}
            onChange={handleFilterChange}
            className="rounded-xl border border-slate-200 bg-slate-50 px-3 py-1.5 text-xs font-medium text-slate-800 focus:bg-white focus:outline-none focus:ring-2 focus:ring-blue-500"
          >
            <option value="all">All Warehouses</option>
            {warehouses.map((w) => (
              <option key={w._id} value={w._id}>
                {w.name}
              </option>
            ))}
          </select>

          <select
            name="category"
            value={filters.category}
            onChange={handleFilterChange}
            className="rounded-xl border border-slate-200 bg-slate-50 px-3 py-1.5 text-xs font-medium text-slate-800 focus:bg-white focus:outline-none focus:ring-2 focus:ring-blue-500"
          >
            <option value="all">All Categories</option>
            {categories.map((c) => (
              <option key={c._id} value={c.name}>
                {c.name}
              </option>
            ))}
          </select>

          <select
            name="operationType"
            value={filters.operationType}
            onChange={handleFilterChange}
            className="rounded-xl border border-slate-200 bg-slate-50 px-3 py-1.5 text-xs font-medium text-slate-800 focus:bg-white focus:outline-none focus:ring-2 focus:ring-blue-500"
          >
            <option value="all">All Operations</option>
            <option value="RECEIPT">Receipts</option>
            <option value="DELIVERY">Deliveries</option>
            <option value="TRANSFER">Transfers</option>
            <option value="ADJUSTMENT">Adjustments</option>
          </select>

          <button
            onClick={fetchDashboardData}
            className="p-1.5 rounded-xl border border-slate-200 text-slate-600 hover:bg-slate-100 transition-colors"
            title="Refresh Data"
          >
            <RefreshCw className="w-4 h-4" />
          </button>
        </div>
      </div>

      {/* KPI Cards Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-6 gap-4">
        <StatCard
          title="Total Products"
          value={stats.totalProducts}
          subtitle="Catalog SKU count"
          icon={Package}
          color="blue"
          onClick={() => navigate('/products')}
        />
        <StatCard
          title="Low Stock"
          value={stats.lowStock}
          subtitle="At or below reorder"
          icon={AlertTriangle}
          color="amber"
          onClick={() => navigate('/products?stockStatus=low_stock')}
        />
        <StatCard
          title="Out of Stock"
          value={stats.outOfStock}
          subtitle="Zero available units"
          icon={XCircle}
          color="rose"
          onClick={() => navigate('/products?stockStatus=out_of_stock')}
        />
        <StatCard
          title="Pending Receipts"
          value={stats.pendingReceipts}
          subtitle="Inbound shipments"
          icon={ArrowDownToLine}
          color="emerald"
          onClick={() => navigate('/receipts?status=Draft')}
        />
        <StatCard
          title="Pending Deliveries"
          value={stats.pendingDeliveries}
          subtitle="Outbound orders"
          icon={ArrowUpFromLine}
          color="purple"
          onClick={() => navigate('/deliveries?status=Draft')}
        />
        <StatCard
          title="Transfers Scheduled"
          value={stats.scheduledTransfers}
          subtitle="Inter-warehouse"
          icon={ArrowLeftRight}
          color="indigo"
          onClick={() => navigate('/transfers?status=Scheduled')}
        />
      </div>

      {/* Analytics Charts Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Chart 1: Stock by Category */}
        <div className="p-5 rounded-2xl bg-white border border-slate-200 shadow-sm flex flex-col justify-between">
          <div className="flex items-center justify-between mb-4">
            <div>
              <h3 className="text-base font-bold text-slate-900">Stock by Category</h3>
              <p className="text-xs text-slate-500">Distribution of available units per sector</p>
            </div>
          </div>
          <div className="h-64 w-full">
            {stats.categoryStats?.length > 0 ? (
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie
                    data={stats.categoryStats}
                    dataKey="stock"
                    nameKey="name"
                    cx="50%"
                    cy="50%"
                    innerRadius={55}
                    outerRadius={80}
                    paddingAngle={4}
                  >
                    {stats.categoryStats.map((entry, index) => (
                      <Cell
                        key={`cell-${index}`}
                        fill={PIE_COLORS[index % PIE_COLORS.length]}
                      />
                    ))}
                  </Pie>
                  <Tooltip
                    formatter={(val) => [`${val} Units`, 'Quantity']}
                    contentStyle={{ borderRadius: '12px', border: '1px solid #e2e8f0', boxShadow: '0 4px 6px -1px rgba(0,0,0,0.1)' }}
                  />
                  <Legend verticalAlign="bottom" height={36} iconType="circle" />
                </PieChart>
              </ResponsiveContainer>
            ) : (
              <div className="h-full flex items-center justify-center text-xs text-slate-400">
                No categorical stock distribution
              </div>
            )}
          </div>
        </div>

        {/* Chart 2: Inventory Value by Category */}
        <div className="p-5 rounded-2xl bg-white border border-slate-200 shadow-sm flex flex-col justify-between">
          <div className="flex items-center justify-between mb-4">
            <div>
              <h3 className="text-base font-bold text-slate-900">Valuation by Category</h3>
              <p className="text-xs text-slate-500">Financial allocation across merchandise categories</p>
            </div>
          </div>
          <div className="h-64 w-full">
            {stats.categoryStats?.length > 0 ? (
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={stats.categoryStats} margin={{ top: 10, right: 10, left: 10, bottom: 0 }}>
                  <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" />
                  <XAxis dataKey="name" tick={{ fontSize: 11, fill: '#64748b' }} axisLine={false} tickLine={false} />
                  <YAxis tick={{ fontSize: 11, fill: '#64748b' }} axisLine={false} tickLine={false} tickFormatter={(v) => `₹${v}`} />
                  <Tooltip
                    formatter={(val) => [`₹${val.toLocaleString('en-IN')}`, 'Value']}
                    contentStyle={{ borderRadius: '12px', border: '1px solid #e2e8f0' }}
                  />
                  <Bar dataKey="value" fill="#2563eb" radius={[6, 6, 0, 0]} />
                </BarChart>
              </ResponsiveContainer>
            ) : (
              <div className="h-full flex items-center justify-center text-xs text-slate-400">
                No valuation data
              </div>
            )}
          </div>
        </div>

        {/* Chart 3: Stock Movement Over Past 7 Days */}
        <div className="p-5 rounded-2xl bg-white border border-slate-200 shadow-sm lg:col-span-2">
          <div className="flex items-center justify-between mb-4">
            <div>
              <h3 className="text-base font-bold text-slate-900">7-Day Stock Movement Timeline</h3>
              <p className="text-xs text-slate-500">Inbound receipts vs outbound deliveries and rebalances</p>
            </div>
          </div>
          <div className="h-72 w-full">
            {stats.stockMovementStats?.length > 0 ? (
              <ResponsiveContainer width="100%" height="100%">
                <AreaChart data={stats.stockMovementStats} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                  <defs>
                    <linearGradient id="receiptsGrad" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="#10b981" stopOpacity={0.4}/>
                      <stop offset="95%" stopColor="#10b981" stopOpacity={0}/>
                    </linearGradient>
                    <linearGradient id="deliveriesGrad" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="#3b82f6" stopOpacity={0.4}/>
                      <stop offset="95%" stopColor="#3b82f6" stopOpacity={0}/>
                    </linearGradient>
                  </defs>
                  <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" />
                  <XAxis dataKey="date" tick={{ fontSize: 11, fill: '#64748b' }} axisLine={false} tickLine={false} />
                  <YAxis tick={{ fontSize: 11, fill: '#64748b' }} axisLine={false} tickLine={false} />
                  <Tooltip contentStyle={{ borderRadius: '12px', border: '1px solid #e2e8f0' }} />
                  <Legend verticalAlign="top" height={36} iconType="circle" />
                  <Area type="monotone" dataKey="receipts" name="Receipts (Inbound)" stroke="#10b981" fillOpacity={1} fill="url(#receiptsGrad)" />
                  <Area type="monotone" dataKey="deliveries" name="Deliveries (Outbound)" stroke="#3b82f6" fillOpacity={1} fill="url(#deliveriesGrad)" />
                  <Area type="monotone" dataKey="transfers" name="Transfers (Internal)" stroke="#8b5cf6" fillOpacity={0} />
                  <Area type="monotone" dataKey="adjustments" name="Adjustments" stroke="#f59e0b" fillOpacity={0} />
                </AreaChart>
              </ResponsiveContainer>
            ) : (
              <div className="h-full flex items-center justify-center text-xs text-slate-400">
                No recent activity timeline
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Bottom Section: Low Stock Alert Panel & Recent Activity Table */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Low Stock Alerts Panel */}
        <div className="p-5 rounded-2xl bg-white border border-slate-200 shadow-sm flex flex-col">
          <div className="flex items-center justify-between pb-3 border-b border-slate-100">
            <div className="flex items-center gap-2">
              <AlertTriangle className="w-5 h-5 text-amber-500" />
              <h3 className="text-base font-bold text-slate-900">Low Stock Alerts</h3>
            </div>
            <span className="text-xs font-bold px-2 py-0.5 rounded-full bg-amber-50 text-amber-700 border border-amber-200">
              {stats.lowStockAlerts?.length || 0} items
            </span>
          </div>

          <div className="flex-1 overflow-y-auto divide-y divide-slate-100 mt-2 max-h-96">
            {stats.lowStockAlerts?.length === 0 ? (
              <div className="py-12 text-center text-xs text-slate-400">
                All inventory levels are safe and above reorder thresholds.
              </div>
            ) : (
              stats.lowStockAlerts.map((item) => (
                <div
                  key={item._id}
                  onClick={() => navigate(`/products/${item._id}`)}
                  className="py-3 px-2 flex items-center justify-between hover:bg-slate-50 rounded-xl cursor-pointer transition-colors"
                >
                  <div className="space-y-0.5">
                    <p className="text-sm font-semibold text-slate-900">{item.name}</p>
                    <p className="text-xs text-slate-500">
                      SKU: <span className="font-mono text-slate-700">{item.sku}</span> • Reorder at: {item.reorderLevel}
                    </p>
                  </div>
                  <div className="text-right">
                    <Badge status={item.status} label={`${item.stock} ${item.unitOfMeasure}`} />
                  </div>
                </div>
              ))
            )}
          </div>

          <div className="pt-3 border-t border-slate-100">
            <Link
              to="/products?stockStatus=low_stock"
              className="w-full flex items-center justify-center gap-1 text-xs font-semibold text-blue-600 hover:text-blue-700 py-1"
            >
              Manage Stock & Reorders <ChevronRight className="w-3.5 h-3.5" />
            </Link>
          </div>
        </div>

        {/* Recent Activity Table */}
        <div className="lg:col-span-2 p-5 rounded-2xl bg-white border border-slate-200 shadow-sm flex flex-col">
          <div className="flex items-center justify-between pb-3 border-b border-slate-100 mb-3">
            <div>
              <h3 className="text-base font-bold text-slate-900">Recent Move Activity</h3>
              <p className="text-xs text-slate-500">Latest operations processed into the stock ledger</p>
            </div>
            <Link
              to="/move-history"
              className="text-xs font-semibold text-blue-600 hover:text-blue-700 inline-flex items-center gap-1"
            >
              Full Ledger <ChevronRight className="w-3.5 h-3.5" />
            </Link>
          </div>

          {stats.recentTransactions?.length === 0 ? (
            <div className="py-12 text-center text-xs text-slate-400">
              No recent movements logged.
            </div>
          ) : (
            <Table
              headers={[
                'Date',
                'Product / SKU',
                'Operation',
                'Quantity',
                'Warehouse',
                'User',
              ]}
            >
              {stats.recentTransactions.map((tx) => (
                <tr key={tx._id} className="hover:bg-slate-50/80 transition-colors">
                  <td className="px-4 py-3 whitespace-nowrap text-xs text-slate-500 font-mono">
                    {new Date(tx.createdAt).toLocaleDateString()}
                  </td>
                  <td className="px-4 py-3 whitespace-nowrap">
                    <div className="text-xs font-semibold text-slate-900">
                      {tx.product?.name || 'Unknown Product'}
                    </div>
                    <div className="text-[10px] font-mono text-slate-500">{tx.sku}</div>
                  </td>
                  <td className="px-4 py-3 whitespace-nowrap">
                    <Badge status={tx.type} />
                  </td>
                  <td className="px-4 py-3 whitespace-nowrap text-xs font-bold text-slate-900">
                    {tx.type === 'DELIVERY' ? '-' : '+'}{tx.quantity} {tx.product?.unitOfMeasure || 'units'}
                  </td>
                  <td className="px-4 py-3 whitespace-nowrap text-xs text-slate-600">
                    {tx.destinationWarehouse?.name || tx.sourceWarehouse?.name || 'Main Warehouse'}
                  </td>
                  <td className="px-4 py-3 whitespace-nowrap text-xs text-slate-500">
                    {tx.performedBy?.name || 'System / Admin'}
                  </td>
                </tr>
              ))}
            </Table>
          )}
        </div>
      </div>
    </div>
  );
};

export default Dashboard;
