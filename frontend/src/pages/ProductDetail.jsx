import React, { useState, useEffect } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import {
  Package,
  Warehouse,
  History,
  ArrowLeft,
  ArrowDownToLine,
  ArrowUpFromLine,
  ArrowLeftRight,
  SlidersHorizontal,
  AlertTriangle,
  Building,
} from 'lucide-react';
import productService from '../services/productService';
import Table from '../components/Table';
import Badge from '../components/Badge';
import Button from '../components/Button';
import LoadingSpinner from '../components/LoadingSpinner';
import EmptyState from '../components/EmptyState';
import { useToast } from '../context/ToastContext';

export const ProductDetail = () => {
  const { id } = useParams();
  const [product, setProduct] = useState(null);
  const [loading, setLoading] = useState(true);

  const { error } = useToast();
  const navigate = useNavigate();

  const loadProduct = async () => {
    setLoading(true);
    try {
      const res = await productService.getProductById(id);
      if (res.success) {
        setProduct(res.data);
      }
    } catch (err) {
      error(err.message || 'Unable to load product details.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadProduct();
  }, [id]);

  if (loading) return <LoadingSpinner message="Loading product information & movements..." />;

  if (!product) {
    return (
      <EmptyState
        title="Product Not Found"
        description="The product you are attempting to view does not exist or has been removed."
        actionText="Back to Products"
        onAction={() => navigate('/products')}
      />
    );
  }

  const isLowStock = product.totalStock <= product.reorderLevel;

  return (
    <div className="space-y-6">
      {/* Back button & Action Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div className="flex items-center gap-3">
          <Button
            variant="secondary"
            size="sm"
            onClick={() => navigate('/products')}
            icon={ArrowLeft}
          >
            Catalog
          </Button>
          <div>
            <div className="flex items-center gap-2">
              <h2 className="text-2xl font-bold tracking-tight text-slate-900">{product.name}</h2>
              <span className="font-mono text-xs font-semibold px-2.5 py-0.5 rounded-md bg-slate-100 text-slate-800">
                {product.sku}
              </span>
            </div>
            <p className="text-xs text-slate-500 mt-0.5">
              Category: <span className="font-semibold text-slate-700">{product.category}</span> • Created on {new Date(product.createdAt).toLocaleDateString()}
            </p>
          </div>
        </div>

        {/* Quick Operations Triggers */}
        <div className="flex flex-wrap items-center gap-2">
          <Button
            variant="secondary"
            size="sm"
            onClick={() => navigate(`/receipts?productId=${product._id}`)}
            icon={ArrowDownToLine}
          >
            Receive
          </Button>
          <Button
            variant="secondary"
            size="sm"
            onClick={() => navigate(`/deliveries?productId=${product._id}`)}
            icon={ArrowUpFromLine}
          >
            Deliver
          </Button>
          <Button
            variant="secondary"
            size="sm"
            onClick={() => navigate(`/transfers?productId=${product._id}`)}
            icon={ArrowLeftRight}
          >
            Transfer
          </Button>
          <Button
            variant="secondary"
            size="sm"
            onClick={() => navigate(`/adjustments?productId=${product._id}`)}
            icon={SlidersHorizontal}
          >
            Adjust
          </Button>
        </div>
      </div>

      {/* KPI & Overview Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="p-5 rounded-2xl bg-white border border-slate-200 shadow-sm space-y-1">
          <p className="text-xs font-semibold uppercase tracking-wider text-slate-400">Total Stock</p>
          <div className="flex items-center gap-2">
            <h3 className="text-2xl font-black text-slate-900">
              {product.totalStock} {product.unitOfMeasure}
            </h3>
            <Badge status={product.totalStock === 0 ? 'out_of_stock' : isLowStock ? 'low_stock' : 'in_stock'} />
          </div>
          {isLowStock && (
            <p className="text-[11px] text-amber-600 font-semibold flex items-center gap-1 mt-1">
              <AlertTriangle className="w-3.5 h-3.5" /> Reorder threshold reached ({product.reorderLevel})
            </p>
          )}
        </div>

        <div className="p-5 rounded-2xl bg-white border border-slate-200 shadow-sm space-y-1">
          <p className="text-xs font-semibold uppercase tracking-wider text-slate-400">Unit Price</p>
          <h3 className="text-2xl font-black text-slate-900">
            ₹{product.price?.toLocaleString('en-IN')}
          </h3>
          <p className="text-[11px] text-slate-500">
            Asset value: ₹{((product.totalStock || 0) * (product.price || 0)).toLocaleString('en-IN')}
          </p>
        </div>

        <div className="p-5 rounded-2xl bg-white border border-slate-200 shadow-sm space-y-1">
          <p className="text-xs font-semibold uppercase tracking-wider text-slate-400">Reorder Threshold</p>
          <h3 className="text-2xl font-black text-slate-900">
            {product.reorderLevel} {product.unitOfMeasure}
          </h3>
          <p className="text-[11px] text-slate-500">Minimum safe inventory level</p>
        </div>

        <div className="p-5 rounded-2xl bg-white border border-slate-200 shadow-sm space-y-1">
          <p className="text-xs font-semibold uppercase tracking-wider text-slate-400">Supplier</p>
          <h3 className="text-lg font-bold text-slate-900 truncate">
            {product.supplier || 'Standard Vendor'}
          </h3>
          <p className="text-[11px] text-slate-500">Unit: {product.unitOfMeasure}</p>
        </div>
      </div>

      {/* Warehouse Stock Breakdown */}
      <div className="p-5 rounded-2xl bg-white border border-slate-200 shadow-sm space-y-4">
        <div className="flex items-center justify-between pb-3 border-b border-slate-100">
          <div className="flex items-center gap-2">
            <Building className="w-5 h-5 text-blue-600" />
            <h3 className="text-base font-bold text-slate-900">Stock by Warehouse Location</h3>
          </div>
          <span className="text-xs text-slate-500">
            {product.warehouseStocks?.length || 0} active storage locations
          </span>
        </div>

        {product.warehouseStocks?.length === 0 ? (
          <p className="text-xs text-slate-400 py-4 text-center">
            No stock currently allocated to any warehouse. Receive stock to populate.
          </p>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {product.warehouseStocks.map((ws) => (
              <div
                key={ws._id}
                className="p-4 rounded-xl border border-slate-200 bg-slate-50/50 flex flex-col justify-between"
              >
                <div>
                  <div className="flex items-center justify-between">
                    <h4 className="text-sm font-bold text-slate-900">{ws.warehouse?.name}</h4>
                    <span className="text-[10px] font-mono font-semibold px-2 py-0.5 rounded bg-white border border-slate-200 text-slate-700">
                      {ws.warehouse?.code}
                    </span>
                  </div>
                  <p className="text-xs text-slate-500 mt-1">{ws.warehouse?.location}</p>
                </div>
                <div className="mt-4 pt-3 border-t border-slate-200/60 flex items-center justify-between">
                  <span className="text-xs font-semibold text-slate-500">Available:</span>
                  <span className="text-base font-black text-slate-900">
                    {ws.quantity} {product.unitOfMeasure}
                  </span>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Recent Movements for this Product */}
      <div className="p-5 rounded-2xl bg-white border border-slate-200 shadow-sm space-y-4">
        <div className="flex items-center justify-between pb-3 border-b border-slate-100">
          <div className="flex items-center gap-2">
            <History className="w-5 h-5 text-blue-600" />
            <h3 className="text-base font-bold text-slate-900">Recent Movements & Ledger Entries</h3>
          </div>
          <Link
            to={`/move-history?product=${product._id}`}
            className="text-xs font-semibold text-blue-600 hover:text-blue-700"
          >
            View all ledger records
          </Link>
        </div>

        {product.recentMovements?.length === 0 ? (
          <p className="text-xs text-slate-400 py-6 text-center">
            No movements logged yet for this product.
          </p>
        ) : (
          <Table
            headers={[
              'Date',
              'Reference',
              'Operation Type',
              'Quantity',
              'Before',
              'After',
              'Warehouse Details',
              'User',
            ]}
          >
            {product.recentMovements.map((tx) => (
              <tr key={tx._id} className="hover:bg-slate-50/80 transition-colors">
                <td className="px-4 py-3 whitespace-nowrap text-xs text-slate-500 font-mono">
                  {new Date(tx.createdAt).toLocaleDateString()}
                </td>
                <td className="px-4 py-3 whitespace-nowrap text-xs font-mono font-bold text-slate-800">
                  {tx.reference}
                </td>
                <td className="px-4 py-3 whitespace-nowrap">
                  <Badge status={tx.type} />
                </td>
                <td className="px-4 py-3 whitespace-nowrap text-xs font-bold text-slate-900">
                  {tx.type === 'DELIVERY' ? '-' : '+'}{tx.quantity} {product.unitOfMeasure}
                </td>
                <td className="px-4 py-3 whitespace-nowrap text-xs text-slate-500 font-mono">
                  {tx.beforeStock}
                </td>
                <td className="px-4 py-3 whitespace-nowrap text-xs text-slate-900 font-bold font-mono">
                  {tx.afterStock}
                </td>
                <td className="px-4 py-3 whitespace-nowrap text-xs text-slate-600">
                  {tx.destinationWarehouse?.name || tx.sourceWarehouse?.name || 'Main Warehouse'}
                </td>
                <td className="px-4 py-3 whitespace-nowrap text-xs text-slate-500">
                  {tx.performedBy?.name || 'Admin'}
                </td>
              </tr>
            ))}
          </Table>
        )}
      </div>
    </div>
  );
};

export default ProductDetail;
