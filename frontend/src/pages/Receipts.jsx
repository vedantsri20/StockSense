import React, { useState, useEffect } from 'react';
import { useSearchParams } from 'react-router-dom';
import {
  ArrowDownToLine,
  Plus,
  Search,
  CheckCircle2,
  Clock,
  Ban,
  Package,
  Calendar,
  AlertCircle,
} from 'lucide-react';
import receiptService from '../services/receiptService';
import productService from '../services/productService';
import warehouseService from '../services/warehouseService';
import Table from '../components/Table';
import Badge from '../components/Badge';
import Button from '../components/Button';
import Input from '../components/Input';
import Select from '../components/Select';
import Modal from '../components/Modal';
import LoadingSpinner from '../components/LoadingSpinner';
import EmptyState from '../components/EmptyState';
import { useToast } from '../context/ToastContext';

export const Receipts = () => {
  const [receipts, setReceipts] = useState([]);
  const [products, setProducts] = useState([]);
  const [warehouses, setWarehouses] = useState([]);
  const [loading, setLoading] = useState(true);

  const [searchParams] = useSearchParams();
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedStatus, setSelectedStatus] = useState(searchParams.get('status') || 'all');
  const [selectedWarehouse, setSelectedWarehouse] = useState('all');

  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [validatingId, setValidatingId] = useState(null);

  const initialForm = {
    supplier: '',
    warehouse: '',
    product: searchParams.get('productId') || '',
    quantity: 1,
    expectedDate: new Date().toISOString().slice(0, 10),
    notes: '',
  };
  const [formData, setFormData] = useState(initialForm);

  const { success, error } = useToast();

  const loadData = async () => {
    setLoading(true);
    try {
      const [recRes, prodRes, whRes] = await Promise.all([
        receiptService.getReceipts({
          status: selectedStatus,
          warehouse: selectedWarehouse,
          search: searchTerm,
        }),
        productService.getProducts(),
        warehouseService.getWarehouses(),
      ]);

      if (recRes.success) setReceipts(recRes.data);
      if (prodRes.success) setProducts(prodRes.data);
      if (whRes.success) setWarehouses(whRes.data);
    } catch (err) {
      error(err.message || 'Failed to load receipts.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadData();
  }, [searchTerm, selectedStatus, selectedWarehouse]);

  // Open modal preselected if productId param present
  useEffect(() => {
    if (searchParams.get('productId')) {
      setIsCreateModalOpen(true);
    }
  }, [searchParams]);

  const handleInputChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleCreateSubmit = async (e) => {
    e.preventDefault();
    setSubmitting(true);
    try {
      await receiptService.createReceipt(formData);
      success('Receipt created successfully');
      setIsCreateModalOpen(false);
      setFormData(initialForm);
      loadData();
    } catch (err) {
      error(err.message || 'Failed to create receipt.');
    } finally {
      setSubmitting(false);
    }
  };

  const handleValidate = async (id) => {
    setValidatingId(id);
    try {
      await receiptService.validateReceipt(id);
      success('Receipt validated successfully.');
      loadData();
    } catch (err) {
      error(err.message || 'Failed to validate receipt.');
    } finally {
      setValidatingId(null);
    }
  };

  const handleStatusChange = async (id, newStatus) => {
    try {
      await receiptService.updateReceipt(id, { status: newStatus });
      success(`Receipt marked as ${newStatus}`);
      loadData();
    } catch (err) {
      error(err.message || `Failed to update status.`);
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-2xl font-bold tracking-tight text-slate-900">Inbound Receipts</h2>
          <p className="text-xs text-slate-500 mt-0.5">
            Receive inventory orders from suppliers and increase warehouse stock
          </p>
        </div>
        <Button
          onClick={() => {
            setFormData(initialForm);
            setIsCreateModalOpen(true);
          }}
          variant="primary"
          icon={Plus}
        >
          Create Receipt
        </Button>
      </div>

      {/* Filter Toolbar */}
      <div className="p-4 rounded-2xl bg-white border border-slate-200 shadow-sm flex flex-col md:flex-row items-center justify-between gap-3">
        <div className="relative w-full md:w-80">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
          <input
            type="text"
            placeholder="Search by Receipt ID or Supplier..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full rounded-xl border border-slate-200 bg-slate-50 pl-9 pr-4 py-2 text-xs text-slate-900 transition-all focus:bg-white focus:outline-none focus:ring-2 focus:ring-blue-500"
          />
        </div>

        <div className="flex flex-wrap items-center gap-2.5 w-full md:w-auto">
          <select
            value={selectedStatus}
            onChange={(e) => setSelectedStatus(e.target.value)}
            className="rounded-xl border border-slate-200 bg-slate-50 px-3 py-2 text-xs font-medium text-slate-700 focus:bg-white focus:outline-none focus:ring-2 focus:ring-blue-500"
          >
            <option value="all">All Statuses</option>
            <option value="Draft">Draft</option>
            <option value="Waiting">Waiting</option>
            <option value="Ready">Ready</option>
            <option value="Done">Done (Validated)</option>
            <option value="Canceled">Canceled</option>
          </select>

          <select
            value={selectedWarehouse}
            onChange={(e) => setSelectedWarehouse(e.target.value)}
            className="rounded-xl border border-slate-200 bg-slate-50 px-3 py-2 text-xs font-medium text-slate-700 focus:bg-white focus:outline-none focus:ring-2 focus:ring-blue-500"
          >
            <option value="all">All Warehouses</option>
            {warehouses.map((w) => (
              <option key={w._id} value={w._id}>
                {w.name}
              </option>
            ))}
          </select>
        </div>
      </div>

      {/* Receipts Table */}
      {loading ? (
        <LoadingSpinner message="Loading inbound receipts..." />
      ) : receipts.length === 0 ? (
        <EmptyState
          title="No receipts found"
          description="Create an inbound receipt to receive products into your warehouses."
          actionText="Create Receipt"
          onAction={() => {
            setFormData(initialForm);
            setIsCreateModalOpen(true);
          }}
        />
      ) : (
        <Table
          headers={[
            'Receipt ID',
            'Supplier',
            'Warehouse',
            'Product',
            'Quantity',
            'Date',
            'Status',
            { label: 'Workflow & Actions', align: 'right' },
          ]}
        >
          {receipts.map((rec) => (
            <tr key={rec._id} className="hover:bg-slate-50/80 transition-colors">
              <td className="px-4 py-3.5 whitespace-nowrap font-mono text-xs font-bold text-slate-900">
                {rec.receiptId}
              </td>

              <td className="px-4 py-3.5 whitespace-nowrap text-xs font-semibold text-slate-800">
                {rec.supplier}
              </td>

              <td className="px-4 py-3.5 whitespace-nowrap text-xs text-slate-600">
                {rec.warehouse?.name || 'Main Warehouse'}
              </td>

              <td className="px-4 py-3.5 whitespace-nowrap">
                <div className="text-xs font-bold text-slate-900">
                  {rec.product?.name || 'Unknown Product'}
                </div>
                <div className="text-[10px] font-mono text-slate-500">
                  {rec.product?.sku}
                </div>
              </td>

              <td className="px-4 py-3.5 whitespace-nowrap text-xs font-bold text-emerald-700">
                +{rec.quantity} {rec.product?.unitOfMeasure || 'units'}
              </td>

              <td className="px-4 py-3.5 whitespace-nowrap text-xs text-slate-500 font-mono">
                {new Date(rec.expectedDate).toLocaleDateString()}
              </td>

              <td className="px-4 py-3.5 whitespace-nowrap">
                <Badge status={rec.status} />
              </td>

              {/* Workflow Actions */}
              <td className="px-4 py-3.5 whitespace-nowrap text-right">
                <div className="flex items-center justify-end gap-1.5">
                  {rec.status === 'Draft' && (
                    <>
                      <Button
                        variant="secondary"
                        size="sm"
                        onClick={() => handleStatusChange(rec._id, 'Ready')}
                      >
                        Set Ready
                      </Button>
                      <Button
                        variant="success"
                        size="sm"
                        loading={validatingId === rec._id}
                        onClick={() => handleValidate(rec._id)}
                      >
                        Validate
                      </Button>
                    </>
                  )}

                  {rec.status === 'Ready' && (
                    <Button
                      variant="success"
                      size="sm"
                      loading={validatingId === rec._id}
                      onClick={() => handleValidate(rec._id)}
                      icon={CheckCircle2}
                    >
                      Validate Receipt
                    </Button>
                  )}

                  {rec.status === 'Done' && (
                    <span className="text-xs font-semibold text-emerald-600 inline-flex items-center gap-1">
                      <CheckCircle2 className="w-4 h-4" /> Stock Updated
                    </span>
                  )}

                  {rec.status !== 'Done' && rec.status !== 'Canceled' && (
                    <button
                      onClick={() => handleStatusChange(rec._id, 'Canceled')}
                      className="p-1 rounded-lg text-slate-400 hover:text-rose-600 hover:bg-rose-50 transition-colors ml-1"
                      title="Cancel Receipt"
                    >
                      <Ban className="w-4 h-4" />
                    </button>
                  )}
                </div>
              </td>
            </tr>
          ))}
        </Table>
      )}

      {/* Create Receipt Modal */}
      <Modal
        isOpen={isCreateModalOpen}
        onClose={() => setIsCreateModalOpen(false)}
        title="Create Inbound Receipt"
        subtitle="Schedule product delivery from vendor into a specific warehouse"
      >
        <form onSubmit={handleCreateSubmit} className="space-y-4">
          <Input
            label="Supplier / Vendor"
            name="supplier"
            placeholder="e.g. LogiTech Global"
            value={formData.supplier}
            onChange={handleInputChange}
            required
          />

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <Select
              label="Destination Warehouse"
              name="warehouse"
              value={formData.warehouse}
              onChange={handleInputChange}
              options={warehouses.map((w) => ({ value: w._id, label: `${w.name} (${w.code})` }))}
              required
            />
            <Select
              label="Product"
              name="product"
              value={formData.product}
              onChange={handleInputChange}
              options={products.map((p) => ({ value: p._id, label: `${p.name} (${p.sku})` }))}
              required
            />
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <Input
              label="Quantity to Receive"
              name="quantity"
              type="number"
              min="1"
              value={formData.quantity}
              onChange={handleInputChange}
              required
            />
            <Input
              label="Expected Receipt Date"
              name="expectedDate"
              type="date"
              value={formData.expectedDate}
              onChange={handleInputChange}
            />
          </div>

          <Input
            label="Notes / PO Reference"
            name="notes"
            placeholder="Optional purchase order reference or remarks"
            value={formData.notes}
            onChange={handleInputChange}
          />

          <div className="flex justify-end gap-3 pt-4 border-t border-slate-100">
            <Button
              variant="secondary"
              onClick={() => setIsCreateModalOpen(false)}
            >
              Cancel
            </Button>
            <Button
              type="submit"
              variant="primary"
              loading={submitting}
            >
              Create Receipt
            </Button>
          </div>
        </form>
      </Modal>
    </div>
  );
};

export default Receipts;
