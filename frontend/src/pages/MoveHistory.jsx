import React, { useState, useEffect } from 'react';
import { useSearchParams } from 'react-router-dom';
import {
  History,
  Search,
  Filter,
  Calendar,
  RotateCcw,
  Building,
  ArrowRight,
  TrendingDown,
  TrendingUp,
} from 'lucide-react';
import inventoryService from '../services/inventoryService';
import warehouseService from '../services/warehouseService';
import productService from '../services/productService';
import Table from '../components/Table';
import Badge from '../components/Badge';
import Button from '../components/Button';
import LoadingSpinner from '../components/LoadingSpinner';
import EmptyState from '../components/EmptyState';
import { useToast } from '../context/ToastContext';

export const MoveHistory = () => {
  const [transactions, setTransactions] = useState([]);
  const [warehouses, setWarehouses] = useState([]);
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);

  const [searchParams] = useSearchParams();
  const [filters, setFilters] = useState({
    search: '',
    product: searchParams.get('product') || 'all',
    type: 'all',
    warehouse: 'all',
    startDate: '',
    endDate: '',
  });

  const { error } = useToast();

  const loadData = async () => {
    setLoading(true);
    try {
      const [txRes, whRes, prodRes] = await Promise.all([
        inventoryService.getTransactions(filters),
        warehouseService.getWarehouses(),
        productService.getProducts(),
      ]);

      if (txRes.success) setTransactions(txRes.data);
      if (whRes.success) setWarehouses(whRes.data);
      if (prodRes.success) setProducts(prodRes.data);
    } catch (err) {
      error(err.message || 'Unable to load stock move ledger.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadData();
  }, [filters]);

  const handleFilterChange = (e) => {
    setFilters({ ...filters, [e.target.name]: e.target.value });
  };

  const handleResetFilters = () => {
    setFilters({
      search: '',
      product: 'all',
      type: 'all',
      warehouse: 'all',
      startDate: '',
      endDate: '',
    });
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-2xl font-bold tracking-tight text-slate-900">
            Move History / Stock Ledger
          </h2>
          <p className="text-xs text-slate-500 mt-0.5">
            Immutable chronological audit trail recording every stock-affecting operation in the system
          </p>
        </div>
        <div className="flex items-center gap-2">
          <span className="text-xs font-semibold px-3 py-1 rounded-full bg-blue-50 text-blue-700 border border-blue-200">
            {transactions.length} Total Ledger Records
          </span>
        </div>
      </div>

      {/* Advanced Filter Toolbar */}
      <div className="p-4 rounded-2xl bg-white border border-slate-200 shadow-sm space-y-3">
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-6 gap-3">
          {/* Search Reference / SKU */}
          <div className="relative lg:col-span-2">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
            <input
              type="text"
              name="search"
              placeholder="Search Reference, SKU, or Note..."
              value={filters.search}
              onChange={handleFilterChange}
              className="w-full rounded-xl border border-slate-200 bg-slate-50 pl-9 pr-4 py-2 text-xs text-slate-900 transition-all focus:bg-white focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>

          {/* Operation Type */}
          <select
            name="type"
            value={filters.type}
            onChange={handleFilterChange}
            className="rounded-xl border border-slate-200 bg-slate-50 px-3 py-2 text-xs font-medium text-slate-700 focus:bg-white focus:outline-none focus:ring-2 focus:ring-blue-500"
          >
            <option value="all">All Operations</option>
            <option value="RECEIPT">Receipt (Inbound)</option>
            <option value="DELIVERY">Delivery (Outbound)</option>
            <option value="TRANSFER">Internal Transfer</option>
            <option value="ADJUSTMENT">Stock Adjustment</option>
          </select>

          {/* Warehouse */}
          <select
            name="warehouse"
            value={filters.warehouse}
            onChange={handleFilterChange}
            className="rounded-xl border border-slate-200 bg-slate-50 px-3 py-2 text-xs font-medium text-slate-700 focus:bg-white focus:outline-none focus:ring-2 focus:ring-blue-500"
          >
            <option value="all">All Warehouses</option>
            {warehouses.map((w) => (
              <option key={w._id} value={w._id}>
                {w.name}
              </option>
            ))}
          </select>

          {/* Start Date */}
          <div className="relative">
            <input
              type="date"
              name="startDate"
              value={filters.startDate}
              onChange={handleFilterChange}
              className="w-full rounded-xl border border-slate-200 bg-slate-50 px-3 py-2 text-xs font-medium text-slate-700 focus:bg-white focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>

          {/* End Date */}
          <div className="relative flex items-center gap-2">
            <input
              type="date"
              name="endDate"
              value={filters.endDate}
              onChange={handleFilterChange}
              className="w-full rounded-xl border border-slate-200 bg-slate-50 px-3 py-2 text-xs font-medium text-slate-700 focus:bg-white focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
            <button
              onClick={handleResetFilters}
              className="p-2 rounded-xl text-slate-400 hover:text-slate-600 hover:bg-slate-100 transition-colors"
              title="Reset Filters"
            >
              <RotateCcw className="w-4 h-4" />
            </button>
          </div>
        </div>
      </div>

      {/* Ledger Table */}
      {loading ? (
        <LoadingSpinner message="Querying master stock ledger..." />
      ) : transactions.length === 0 ? (
        <EmptyState
          title="No transactions recorded"
          description="Stock-changing operations such as receipts, deliveries, and transfers will generate ledger entries here."
        />
      ) : (
        <Table
          headers={[
            'Date & Time',
            'Reference',
            'Product',
            'SKU',
            'Operation Type',
            'Source Location',
            'Destination Location',
            'Quantity',
            'Before Stock',
            'After Stock',
            'User',
          ]}
        >
          {transactions.map((tx) => (
            <tr key={tx._id} className="hover:bg-slate-50/80 transition-colors">
              {/* Date */}
              <td className="px-4 py-3.5 whitespace-nowrap text-xs text-slate-500 font-mono">
                {new Date(tx.createdAt).toLocaleString()}
              </td>

              {/* Reference */}
              <td className="px-4 py-3.5 whitespace-nowrap font-mono text-xs font-bold text-slate-900">
                {tx.reference}
              </td>

              {/* Product */}
              <td className="px-4 py-3.5 whitespace-nowrap text-xs font-bold text-slate-900">
                {tx.product?.name || 'Item'}
              </td>

              {/* SKU */}
              <td className="px-4 py-3.5 whitespace-nowrap">
                <span className="font-mono text-[11px] font-semibold px-2 py-0.5 rounded bg-slate-100 text-slate-700">
                  {tx.sku}
                </span>
              </td>

              {/* Operation */}
              <td className="px-4 py-3.5 whitespace-nowrap">
                <Badge status={tx.type} />
              </td>

              {/* Source */}
              <td className="px-4 py-3.5 whitespace-nowrap text-xs text-slate-600">
                {tx.sourceWarehouse?.name || '—'}
              </td>

              {/* Destination */}
              <td className="px-4 py-3.5 whitespace-nowrap text-xs text-slate-600">
                {tx.destinationWarehouse?.name || '—'}
              </td>

              {/* Quantity */}
              <td className="px-4 py-3.5 whitespace-nowrap text-xs font-bold">
                <span
                  className={
                    tx.type === 'DELIVERY'
                      ? 'text-rose-600'
                      : tx.type === 'RECEIPT'
                      ? 'text-emerald-600'
                      : 'text-slate-900'
                  }
                >
                  {tx.type === 'DELIVERY' ? '-' : '+'}{tx.quantity} {tx.product?.unitOfMeasure || 'units'}
                </span>
              </td>

              {/* Before Stock */}
              <td className="px-4 py-3.5 whitespace-nowrap font-mono text-xs text-slate-500">
                {tx.beforeStock}
              </td>

              {/* After Stock */}
              <td className="px-4 py-3.5 whitespace-nowrap font-mono text-xs font-bold text-slate-900">
                {tx.afterStock}
              </td>

              {/* Performed By */}
              <td className="px-4 py-3.5 whitespace-nowrap text-xs text-slate-500">
                {tx.performedBy?.name || 'System / Admin'}
              </td>
            </tr>
          ))}
        </Table>
      )}
    </div>
  );
};

export default MoveHistory;
